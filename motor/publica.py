#!/usr/bin/env python3
"""Bona Nota · publica la feina d'una tirada: revisa, fa el commit, passa la porta del nucli, obre el PR i el deixa
en fusió automàtica (GitHub el fusiona quan «Revisa Bona Nota · tot» surt en verd i bonanota.net s'actualitza sol).

Ús (des de l'arrel del repo, com una sola ordre perquè no surti cap finestra de permís):
  python3 motor/publica.py --id gN --missatge "tipus(àmbit): què (gN)" [--cos fitxer.md] [--prova] [--config]
  python3 motor/publica.py --id 12 --missatge "tipus(àmbit): què (#12)"      (issue: branca issue/12-…)

  1. git fetch i s'atura si main de GitHub té canvis que aquí no hi són. Si ets a main, crea la branca gN-<resum>
     (o issue/N-<resum>); si ets en una altra branca, ha de començar per aquest prefix. S'atura si hi ha un merge a
     mitges, marques de conflicte, fitxers nous que no són de la feina, o canvis de configuració (.github/, .claude/,
     nucli.json, AGENTS.md, CLAUDE.md) sense --config.
  2. python3 motor/tot.py, node motor/revisa-mon.js i, per als mons canviats, la prova visual i l'estricta (l'estricta,
     dels mons amb dades noves o canviades; si un canvi de plantilla toca tots els mons, la CI passa l'estricta de tots).
  3. Commit (si hi ha canvis) i la porta del nucli: els checks automàtics de «nucli ship plan --json» i «nucli ship seal».
  4. git push, gh pr create (cos: --cos, o la primera entrada del CHANGELOG si ha canviat, o els commits), comprova que
     el PR no tingui conflictes amb main i gh pr merge --auto --squash --delete-branch.
  Amb --prova fa els passos 1 (sense crear branca) i 2 i només escriu les ordres dels passos 3 i 4.
Surt amb 1 si falla una revisió (no puja res) i amb 2 si falla git, nucli o gh.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import unicodedata
from pathlib import Path

ARREL = Path(__file__).resolve().parent.parent
TIPUS = "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|wip"
FEINA = ("motor/", "docs/", "supabase/", "admin/", "perfil/", "pares/", "icones/",
         "CHANGELOG.md", "README.md", "index.html", "sprites.js", "sw.js", "versio.json")
CONFIG = (".github/", ".claude/", "nucli.json", "AGENTS.md", "CLAUDE.md")
MAX_ESTRICTES = 3   # més mons canviats que això (un canvi de plantilla): l'estricta només dels que tenen dades noves


def referencia(id_: str) -> tuple:
    """(etiqueta del missatge, prefix de la branca): g40 → ("g40", "g40-") · 12 o #12 → ("#12", "issue/12-")."""
    if re.fullmatch(r"[gn]\d+", id_):
        return id_, f"{id_}-"
    if re.fullmatch(r"#?\d+", id_):
        return f"#{id_.lstrip('#')}", f"issue/{id_.lstrip('#')}-"
    sys.exit("ERROR: --id ha de ser gN, nN o el número d'un issue (12 o #12)")


def branca(id_: str, missatge: str) -> str:
    etiqueta, prefix = referencia(id_)
    text = re.sub(r"^\w+(\([^)]*\))?:\s*", "", missatge)
    text = re.sub(rf"\s*\({re.escape(etiqueta)}\)\s*$", "", text)
    text = "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c)).lower()
    return prefix + re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:40].rstrip("-")


def valida_missatge(id_: str, missatge: str) -> None:
    etiqueta, _ = referencia(id_)
    if not re.fullmatch(rf"({TIPUS})(\([^)]+\))?: .+ \({re.escape(etiqueta)}\)", missatge):
        sys.exit(f"ERROR: el missatge ha de ser «tipus(àmbit): què ({etiqueta})»")


def mons_canviats(fitxers: list, mons: list) -> list:
    return [m["carpeta"] for m in mons
            if any(f.startswith(m["carpeta"] + "/") or f == f"motor/dades/{m['dades']}.js" for f in fitxers)]


def marques_conflicte(textos: dict) -> list:
    """Fitxers amb un conflicte de git sense resoldre (marques «<<<<<<< » i «>>>>>>> »)."""
    return sorted(f for f, t in textos.items() if re.search(r"^<<<<<<< ", t, re.M) and re.search(r"^>>>>>>> ", t, re.M))


def fitxers_estranys(nous: list, carpetes: list) -> list:
    """Fitxers nous (sense seguiment) que no són de la feina d'un món: es pujarien a bonanota.net sense que ningú els miri."""
    bons = FEINA + tuple(c.rstrip("/") + "/" for c in carpetes)
    return sorted(f for f in nous if not f.startswith(bons))


def fitxers_config(canviats: list) -> list:
    """Canvis de configuració o de seguretat (CI, permisos, regles d'agents): només amb --config."""
    return sorted(f for f in canviats if f.startswith(CONFIG))


def porcelain_z(sortida: str) -> list:
    """Camins de «git status --porcelain -z» (els noms amb espais o accents arriben sencers; d'un canvi de nom, el nou)."""
    parts, camins, i = sortida.split("\0"), [], 0
    while i < len(parts):
        e = parts[i]
        if len(e) > 3:
            camins.append(e[3:])
            if e[0] in "RC":
                i += 1   # el camí vell del canvi de nom ve a continuació
        i += 1
    return camins


def base_desfasada(cwd: Path = None) -> bool:
    """Cert si origin/main té commits que aquí no hi són: el PR tindria conflictes i la fusió automàtica no arribaria mai."""
    r = subprocess.run(["git", "merge-base", "--is-ancestor", "origin/main", "HEAD"], cwd=cwd or ARREL, capture_output=True)
    return r.returncode != 0


def corre(cmd: list, codi_error: int, cwd: Path = None, env: dict = None, captura: bool = False) -> str:
    print("→ " + " ".join(cmd), flush=True)
    r = subprocess.run(cmd, cwd=cwd or ARREL, env={**os.environ, **(env or {})}, text=True, capture_output=captura)
    if r.returncode:
        if captura:
            print((r.stdout or "") + (r.stderr or ""))
        sys.exit(codi_error)
    return (r.stdout or "").strip() if captura else ""


def git(*args) -> str:
    return subprocess.run(["git", *args], cwd=ARREL, text=True, capture_output=True).stdout.strip()


def canviats() -> set:
    return set(git("diff", "--name-only", "origin/main...HEAD").splitlines()) | set(porcelain_z(git("status", "--porcelain", "-z")))


def main(argv=None) -> None:
    p = argparse.ArgumentParser(description="Publica la feina de Bona Nota amb un PR en fusió automàtica.")
    p.add_argument("--id", required=True)
    p.add_argument("--missatge", required=True)
    p.add_argument("--cos")
    p.add_argument("--prova", action="store_true")
    p.add_argument("--config", action="store_true", help="permet canvis a .github/, .claude/, nucli.json, AGENTS.md o CLAUDE.md")
    a = p.parse_args(argv)
    etiqueta, prefix = referencia(a.id)
    valida_missatge(a.id, a.missatge)

    # 1) base al dia i branca
    corre(["git", "fetch", "origin", "main"], 2)
    actual = git("rev-parse", "--abbrev-ref", "HEAD")
    nom = branca(a.id, a.missatge)
    if base_desfasada():
        sys.exit("ERROR: GitHub té canvis de main que aquí no hi són (el PR tindria conflictes i no es fusionaria mai). "
                 + ("Fes «git pull --ff-only origin main» i torna-ho a provar." if actual == "main"
                    else "Integra main a la branca («git merge origin/main») i torna-ho a provar."))
    if actual != "main" and not actual.startswith(prefix):
        sys.exit(f"ERROR: ets a la branca «{actual}», que no és de {etiqueta}. Canvia a main o a una branca {prefix}…")
    fitxers = canviats()

    # 1b) cap merge a mitges ni marques de conflicte (si no, es pujarien fitxers trencats)
    a_mitges = subprocess.run(["git", "rev-parse", "-q", "--verify", "MERGE_HEAD"], cwd=ARREL, capture_output=True).returncode == 0
    if a_mitges or git("diff", "--name-only", "--diff-filter=U"):
        sys.exit("ERROR: hi ha un merge a mitges (conflictes sense resoldre). Resol-los i torna-ho a provar.")
    textos = {}
    for f in fitxers:
        try:
            textos[f] = (ARREL / f).read_text()
        except (OSError, UnicodeDecodeError):
            pass
    if marques_conflicte(textos):
        sys.exit("ERROR: marques de conflicte sense resoldre a: " + ", ".join(marques_conflicte(textos)))

    # 1c) res que no sigui de la feina: fitxers nous estranys o canvis de configuració sense --config
    mons = json.loads((ARREL / "motor" / "mons.json").read_text())
    nous = [f for f in git("ls-files", "--others", "--exclude-standard", "-z").split("\0") if f]
    estranys = fitxers_estranys(nous, [m["carpeta"] for m in mons])
    if estranys:
        sys.exit("ERROR: hi ha fitxers nous que no són de la feina (es publicarien): " + ", ".join(estranys)
                 + ". Treu-los, posa'ls a .gitignore o mou-los a la carpeta que toca.")
    if fitxers_config(sorted(fitxers)) and not a.config:
        sys.exit("ERROR: canvis de configuració o de seguretat (" + ", ".join(fitxers_config(sorted(fitxers)))
                 + "): torna-ho a provar amb --config si són volguts.")
    if actual == "main":
        if a.prova:
            print(f"(prova) crearia la branca {nom}")
        else:
            corre(["git", "checkout", "-b", nom], 2)
    else:
        nom = actual

    # 2) revisions (els mons canviats es tornen a calcular després de tot.py: un canvi de plantilla els canvia tots)
    corre([sys.executable, "motor/tot.py"], 1)
    corre(["node", "motor/revisa-mon.js"], 1)
    despres = sorted(canviats())
    tocats = mons_canviats(despres, mons)
    amb_dades = [m["carpeta"] for m in mons if m["carpeta"] in tocats and (f"motor/dades/{m['dades']}.js" in despres or
                 subprocess.run(["git", "cat-file", "-e", f"origin/main:{m['carpeta']}/index.html"], cwd=ARREL, capture_output=True).returncode)]
    estrictes = tocats if len(tocats) <= MAX_ESTRICTES else amb_dades
    for carpeta in tocats:
        if carpeta in estrictes:
            corre(["node", "prova.js", str(ARREL / carpeta / "index.html")], 1, cwd=ARREL / "motor", env={"ESTRICTE": "1"})
        corre(["node", "motor/prova-visual.js", carpeta], 1)
    if len(estrictes) < len(tocats):
        print(f"· {len(tocats) - len(estrictes)} mons canviats sense dades noves: la prova estricta la passa la CI.")

    # 3) commit i porta del nucli · 4) push, PR i fusió automàtica
    if a.prova:
        for o in (["git", "add", "-A"], ["git", "commit", "-m", a.missatge], ["nucli", "ship", "plan", "--json"],
                  ["nucli", "ship", "run", "<cada check automàtic>"], ["nucli", "ship", "seal"], ["git", "push", "origin", nom]):
            print("(prova) " + " ".join(o))
        print(f"(prova) gh pr create --base main --head {nom} --title «{a.missatge}» · gh pr merge --auto --squash --delete-branch")
        print("\n✓ revisions en verd (prova: no s'ha fet cap commit ni s'ha pujat res)")
        return
    if git("status", "--porcelain"):
        corre(["git", "add", "-A"], 2)
        corre(["git", "commit", "-m", a.missatge], 2)
    elif not git("log", "--oneline", "origin/main..HEAD"):
        sys.exit("ERROR: no hi ha res per publicar (cap canvi ni cap commit nou)")
    pla = json.loads(corre(["nucli", "ship", "plan", "--json"], 1, captura=True))
    for c in pla.get("automatics", []):
        corre(["nucli", "ship", "run", c["check"]], 1)
    corre(["nucli", "ship", "seal"], 1)
    corre(["git", "push", "origin", nom], 2)
    existent = subprocess.run(["gh", "pr", "view", nom, "--json", "url,state", "--jq", 'select(.state == "OPEN") | .url'],
                              cwd=ARREL, text=True, capture_output=True)
    if existent.returncode == 0 and existent.stdout.strip():
        url = existent.stdout.strip()
        print(f"→ el PR ja existia: {url}")
    else:
        cos = Path(a.cos).read_text() if a.cos else None
        if cos is None:
            canvis = git("diff", "origin/main...HEAD", "--", "CHANGELOG.md")
            entrada = re.search(r"^## \d+\.\d+\.\d+.*?(?=^## \d)", (ARREL / "CHANGELOG.md").read_text(), re.M | re.S) if canvis else None
            cos = entrada.group(0).strip() if entrada else "\n".join("- " + l for l in git("log", "--format=%s", "origin/main..HEAD").splitlines())
        cos += "\n\n_Publicat amb `motor/publica.py`: revisions locals en verd; GitHub el fusiona sol quan «Revisa Bona Nota · tot» surt en verd._\n"
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as t:
            t.write(cos)
        try:
            url = corre(["gh", "pr", "create", "--base", "main", "--head", nom, "--title", a.missatge, "--body-file", t.name], 2, captura=True)
        finally:
            os.unlink(t.name)
    mergeable = "UNKNOWN"
    for _ in range(12):   # GitHub calcula si es pot fusionar uns segons després d'obrir el PR
        mergeable = subprocess.run(["gh", "pr", "view", url, "--json", "mergeable", "--jq", ".mergeable"], cwd=ARREL,
                                   text=True, capture_output=True).stdout.strip() or "UNKNOWN"
        if mergeable != "UNKNOWN":
            break
        time.sleep(5)
    if mergeable == "CONFLICTING":
        print(f"ERROR: {url} té conflictes amb main: la revisió no s'executarà i no es fusionarà. Integra main i torna a publicar.")
        sys.exit(2)
    corre(["gh", "pr", "merge", url, "--auto", "--squash", "--delete-branch"], 2)
    print(f"\n✓ {url} · en fusió automàtica: es publicarà sol quan la revisió de GitHub surti en verd")


if __name__ == "__main__":
    main()
