#!/usr/bin/env python3
"""Bona Nota · publica la feina d'una tirada: revisa, fa el commit, passa la porta del nucli, obre el PR i el deixa
en fusió automàtica (GitHub el fusiona quan «Revisa Bona Nota · tot» surt en verd i bonanota.net s'actualitza sol).

Ús (des de l'arrel del repo, com una sola ordre perquè no surti cap finestra de permís):
  python3 motor/publica.py --id gN --missatge "tipus(àmbit): què (gN)" [--cos fitxer.md] [--prova] [--config]

  1. git fetch i s'atura si main de GitHub té canvis que aquí no hi són. Si ets a main, crea la branca gN-<resum>;
     si ets en una altra branca, ha de començar per «gN-». S'atura si hi ha un merge a mitges, marques de conflicte,
     fitxers nous que no són de la feina, o canvis de configuració (.github/, .claude/, nucli.json, AGENTS.md,
     CLAUDE.md) sense --config.
  2. python3 motor/tot.py, node motor/revisa-mon.js i, per a cada món canviat, la prova estricta i la visual.
  3. Commit (si hi ha canvis) i nucli ship plan / run generat / run generadors / seal.
  4. git push, gh pr create (cos: --cos, o la primera entrada del CHANGELOG si ha canviat, o els commits) i
     gh pr merge --auto --squash --delete-branch (abans comprova que el PR no tingui conflictes amb main).
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


def branca(id_: str, missatge: str) -> str:
    text = re.sub(r"^\w+(\([^)]*\))?:\s*", "", missatge)
    text = re.sub(rf"\s*\({re.escape(id_)}\)\s*$", "", text)
    text = "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c)).lower()
    slug = re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:40].rstrip("-")
    return f"{id_}-{slug}"


def mons_canviats(fitxers: list, mons: list) -> list:
    return [m["carpeta"] for m in mons
            if any(f.startswith(m["carpeta"] + "/") or f == f"motor/dades/{m['dades']}.js" for f in fitxers)]


def marques_conflicte(textos: dict) -> list:
    """Fitxers amb un conflicte de git sense resoldre (marques «<<<<<<< » i «>>>>>>> »)."""
    return sorted(f for f, t in textos.items() if re.search(r"^<<<<<<< ", t, re.M) and re.search(r"^>>>>>>> ", t, re.M))


FEINA = ("motor/", "docs/", "supabase/", "admin/", "perfil/", "pares/", "icones/",
         "CHANGELOG.md", "README.md", "index.html", "sprites.js", "sw.js", "versio.json")
CONFIG = (".github/", ".claude/", "nucli.json", "AGENTS.md", "CLAUDE.md")


def fitxers_estranys(nous: list, carpetes: list) -> list:
    """Fitxers nous (sense seguiment) que no són de la feina d'un món: es pujarien a bonanota.net sense que ningú els miri."""
    bons = FEINA + tuple(c.rstrip("/") + "/" for c in carpetes)
    return sorted(f for f in nous if not f.startswith(bons))


def fitxers_config(canviats: list) -> list:
    """Canvis de configuració o de seguretat (CI, permisos, regles d'agents): només amb --config."""
    return sorted(f for f in canviats if f.startswith(CONFIG))


def base_desfasada(cwd: Path = None) -> bool:
    """Cert si origin/main té commits que aquí no hi són: el PR tindria conflictes i la fusió automàtica no arribaria mai."""
    r = subprocess.run(["git", "merge-base", "--is-ancestor", "origin/main", "HEAD"], cwd=cwd or ARREL, capture_output=True)
    return r.returncode != 0


def valida_missatge(id_: str, missatge: str) -> None:
    if not re.fullmatch(rf"({TIPUS})(\([^)]+\))?: .+ \({re.escape(id_)}\)", missatge):
        sys.exit(f"ERROR: el missatge ha de ser «tipus(àmbit): què ({id_})»")


def corre(cmd: list, codi_error: int, cwd: Path = ARREL, env: dict = None, captura: bool = False) -> str:
    print("→ " + " ".join(cmd), flush=True)
    r = subprocess.run(cmd, cwd=cwd, env={**os.environ, **(env or {})}, text=True, capture_output=captura)
    if r.returncode:
        if captura:
            print((r.stdout or "") + (r.stderr or ""))
        sys.exit(codi_error)
    return (r.stdout or "").strip() if captura else ""


def git(*args) -> str:
    return subprocess.run(["git", *args], cwd=ARREL, text=True, capture_output=True).stdout.strip()


def main(argv=None) -> None:
    p = argparse.ArgumentParser(description="Publica la feina de Bona Nota amb un PR en fusió automàtica.")
    p.add_argument("--id", required=True)
    p.add_argument("--missatge", required=True)
    p.add_argument("--cos")
    p.add_argument("--prova", action="store_true")
    p.add_argument("--config", action="store_true", help="permet canvis a .github/, .claude/, nucli.json, AGENTS.md o CLAUDE.md")
    a = p.parse_args(argv)
    if not re.fullmatch(r"[gn]\d+", a.id):
        sys.exit("ERROR: --id ha de ser gN (o nN)")
    valida_missatge(a.id, a.missatge)

    # 1) base al dia i branca
    corre(["git", "fetch", "origin", "main"], 2)
    actual = git("rev-parse", "--abbrev-ref", "HEAD")
    nom = branca(a.id, a.missatge)
    if base_desfasada():
        sys.exit("ERROR: GitHub té canvis de main que aquí no hi són (el PR tindria conflictes i no es fusionaria mai). "
                 + ("Fes «git pull --ff-only origin main» i torna-ho a provar." if actual == "main"
                    else "Integra main a la branca («git merge origin/main») i torna-ho a provar."))
    if actual == "main":
        if not a.prova:
            corre(["git", "checkout", "-b", nom], 2)
        else:
            print(f"(prova) crearia la branca {nom}")
    elif not actual.startswith(a.id + "-"):
        sys.exit(f"ERROR: ets a la branca «{actual}», que no és de {a.id}. Canvia a main o a una branca {a.id}-…")
    else:
        nom = actual
    fitxers = set(git("diff", "--name-only", "origin/main...HEAD").splitlines())
    fitxers |= {l[3:].split(" -> ")[-1] for l in git("status", "--porcelain").splitlines() if len(l) > 3}

    # 1b) cap merge a mitges ni marques de conflicte (si no, es pujarien fitxers trencats)
    if (ARREL / ".git" / "MERGE_HEAD").exists() or git("diff", "--name-only", "--diff-filter=U"):
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
    estranys = fitxers_estranys(git("ls-files", "--others", "--exclude-standard").splitlines(), [m["carpeta"] for m in mons])
    if estranys:
        sys.exit("ERROR: hi ha fitxers nous que no són de la feina (es publicarien): " + ", ".join(estranys)
                 + ". Treu-los, posa'ls a .gitignore o mou-los a la carpeta que toca.")
    if fitxers_config(sorted(fitxers)) and not a.config:
        sys.exit("ERROR: canvis de configuració o de seguretat (" + ", ".join(fitxers_config(sorted(fitxers)))
                 + "): torna-ho a provar amb --config si són volguts.")

    # 2) revisions
    corre([sys.executable, "motor/tot.py"], 1)
    corre(["node", "motor/revisa-mon.js"], 1)
    for carpeta in mons_canviats(sorted(fitxers), mons):
        corre(["node", "prova.js", str(ARREL / carpeta / "index.html")], 1, cwd=ARREL / "motor", env={"ESTRICTE": "1"})
        corre(["node", "motor/prova-visual.js", carpeta], 1)

    # 3) commit i porta del nucli · 4) push, PR i fusió automàtica
    ordres = [["git", "add", "-A"], ["git", "commit", "-m", a.missatge],
              ["nucli", "ship", "plan"], ["nucli", "ship", "run", "generat"], ["nucli", "ship", "run", "generadors"], ["nucli", "ship", "seal"],
              ["git", "push", "origin", nom]]
    if a.prova:
        for o in ordres:
            print("(prova) " + " ".join(o))
        print(f"(prova) gh pr create --base main --head {nom} --title «{a.missatge}» · gh pr merge --auto --squash --delete-branch")
        print("\n✓ revisions en verd (prova: no s'ha fet cap commit ni s'ha pujat res)")
        return
    if git("status", "--porcelain"):
        corre(ordres[0], 2)
        corre(ordres[1], 2)
    elif not git("log", "--oneline", "origin/main..HEAD"):
        sys.exit("ERROR: no hi ha res per publicar (cap canvi ni cap commit nou)")
    for o in ordres[2:6]:
        corre(o, 1)
    corre(ordres[6], 2)
    existent = subprocess.run(["gh", "pr", "view", nom, "--json", "url", "--jq", ".url"], cwd=ARREL, text=True, capture_output=True)
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
        url = corre(["gh", "pr", "create", "--base", "main", "--head", nom, "--title", a.missatge, "--body-file", t.name], 2, captura=True)
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
