#!/usr/bin/env python3
"""Llista de les preguntes marcades com a difícils (motor/dificultat.json) perquè una persona la pugui revisar.

Ús (des de l'arrel del repo):
    python3 motor/dificultat.py [--motius fitxer.json]

Escriu docs/DIFICILS.md: per a cada món, una taula amb l'id, el tema, la pregunta i la resposta correcta
de cada pregunta difícil (dificultat 3) i per què. Els motius ({"<món>": {"<id>": "motiu"}}) són a
motor/dificultat-motius.json (o al fitxer de --motius).
Issue #15 (super combo).
"""
import json
import re
import sys
from pathlib import Path

D = Path(__file__).resolve().parent
sys.path.insert(0, str(D))
from qids import ids_mon  # noqa: E402

net = lambda t: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", str(t))).replace("|", "/").strip()


def main():
    fm = Path(sys.argv[sys.argv.index("--motius") + 1]) if "--motius" in sys.argv else D / "dificultat-motius.json"
    motius = json.loads(fm.read_text()) if fm.exists() else {}
    dif = json.loads((D / "dificultat.json").read_text())
    mons = json.loads((D / "mons.json").read_text())
    out = ["# Preguntes difícils (⚡ super combo)", "",
           "Llista generada amb `python3 motor/dificultat.py` a partir de `motor/dificultat.json`. "
           "Una pregunta difícil porta la marca «⚡ difícil» i compta per al super combo: 3 difícils seguides +3 ⭐, 5 seguides +5 ⭐. "
           "Per treure'n o afegir-ne una, edita `motor/dificultat.json` (clau = món, i dins `\"tema/núm\": 3`), posa'n el motiu a `motor/dificultat-motius.json` i torna a generar aquesta llista.", ""]
    total = 0
    for m in mons:
        a = m["dades"]
        _, qids, preg = ids_mon(D / "dades" / f"{a}.js")
        marcades = dif.get(a, {})
        n_tot = sum(1 for t, ns in qids.items() if not t.startswith("j-") for x in ns if x)
        out += [f"## {m['ic']} {m['titol']} (`{a}`) · {len(marcades)} de {n_tot}", ""]
        if not marcades:
            out += ["Cap pregunta marcada.", ""]
            continue
        cap = "| Id | Tema | Pregunta | Resposta correcta |" + (" Per què |" if motius else "")
        out += [cap, "|---|---|---|---|" + ("---|" if motius else "")]
        for k in sorted(marcades, key=lambda x: (x.split("/")[0], int(x.split("/")[1]) if x.split("/")[1].isdigit() else 0)):
            p = next((v for kk, v in preg.items() if kk.endswith("/" + k)), None)
            if not p:
                continue
            fila = f"| `{k}` | {net(p['tema'])} | {net(p['t'])} | {net(p['o'][p['c']])} |"
            if motius:
                fila += f" {net(motius.get(a, {}).get(k, ''))} |"
            out.append(fila)
            total += 1
        out.append("")
    (D.parent / "docs" / "DIFICILS.md").write_text("\n".join(out))
    print(f"docs/DIFICILS.md: {total} preguntes difícils")


if __name__ == "__main__":
    main()
