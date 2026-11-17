#!/usr/bin/env python3
"""Bona Nota · publica la feina d'una tirada: revisa, fa el commit, passa la porta del nucli, obre el PR i el deixa
en fusió automàtica (GitHub el fusiona quan «Revisa Bona Nota · tot» surt en verd i bonanota.net s'actualitza sol).

Ús (des de l'arrel del repo, com una sola ordre perquè no surti cap finestra de permís):
  python3 motor/publica.py --id gN --missatge "tipus(àmbit): què (gN)" [--cos fitxer.md] [--prova]

  1. Si ets a main, crea la branca gN-<resum>; si ets en una altra branca, ha de començar per «gN-».
  2. python3 motor/tot.py, node motor/revisa-mon.js i, per a cada món canviat, la prova estricta i la visual.
  3. Commit (si hi ha canvis) i nucli ship plan / run generat / run generadors / seal.
  4. git push, gh pr create (cos: --cos, o la primera entrada del CHANGELOG si ha canviat, o els commits) i
     gh pr merge --auto --squash --delete-branch.
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
    a = p.parse_args(argv)
    if not re.fullmatch(r"[gn]\d+", a.id):
        sys.exit("ERROR: --id ha de ser gN (o nN)")
    valida_missatge(a.id, a.missatge)

    # 1) branca
    actual = git("rev-parse", "--abbrev-ref", "HEAD")
    nom = branca(a.id, a.missatge)
    if actual == "main":
        if not a.prova:
            corre(["git", "checkout", "-b", nom], 2)
        else:
            print(f"(prova) crearia la branca {nom}")
    elif not actual.startswith(a.id + "-"):
        sys.exit(f"ERROR: ets a la branca «{actual}», que no és de {a.id}. Canvia a main o a una branca {a.id}-…")
    else:
        nom = actual
    corre(["git", "fetch", "origin", "main"], 2)

    # 2) revisions
    corre([sys.executable, "motor/tot.py"], 1)
    corre(["node", "motor/revisa-mon.js"], 1)
    fitxers = set(git("diff", "--name-only", "origin/main...HEAD").splitlines())
    fitxers |= {l[3:].split(" -> ")[-1] for l in git("status", "--porcelain").splitlines() if len(l) > 3}
    mons = json.loads((ARREL / "motor" / "mons.json").read_text())
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
    corre(["gh", "pr", "merge", url, "--auto", "--squash", "--delete-branch"], 2)
    print(f"\n✓ {url} · en fusió automàtica: es publicarà sol quan la revisió de GitHub surti en verd")


if __name__ == "__main__":
    main()
