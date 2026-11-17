#!/usr/bin/env python3
"""Bona Nota · comença un món nou: l'entrada a motor/mons.json i l'esquelet de motor/dades/<id>.js.

Ús (des de l'arrel del repo):
  python3 motor/nou_mon.py --id ID --carpeta assignatura/tema --materia "Matèria" --titol "Títol" --desc "Descripció"
      --colors "#c1,#c2,#c3" --ic 🌋 --curt "Nom al tauler" --spr clau_de_BN_SPR --xat "peça 1|peça 2|peça 3" [--llengua es]

Posa «mon» = el número següent, «neix» = avui i els ids de les 3 peces del xat = el màxim actual + 1, 2 i 3.
Després cal omplir l'esquelet (temes, preguntes, jocs, obertes i boss) i fer «python3 motor/tot.py». Guia: docs/NOU-MON.md.
"""
import argparse
import datetime
import json
import re
import sys
from pathlib import Path

ESQUELET = """const ASSIG={{
 id:{id},
 nom:{materia}, tema:{titol}, curs:"1r ESO", ic:{ic},
 color:{colors},
 peu:{peu},
 blocs:[],   // [{{titol:"🥚 Nom del bloc",n:3}}, …] · la suma de n = nombre de temes
 jocs:[]     // ordena, parelles, classifica, figura, error, frases… (vegeu docs/NOU-MON.md)
}};
const T=[
 // {{id:"tema",ic:"🥚",col:"#78716c",titol:"…",font:"…",idea:"…",pts:["…"],truc:"…",compte:"…",fc:[["…","…"]],q:[["…?",["…","…","…"],0,"…"]]}}
];
const OB=[
 // {{t:"…",q:"…",p:["idea clau"],m:"resposta model"}}
];

// 👾 Boss del món (docs/BOSS-I-EFECTES.md §3)
ASSIG.boss={{nom:"…",spr:"monstre",fx:"explosio",mus:"epica",rotul:"VICTÒRIA!",em:["⭐","🏆","✨","🔥"]}};
"""


def arguments(argv):
    p = argparse.ArgumentParser(description="Comença un món nou de Bona Nota.")
    for a in ("id", "carpeta", "materia", "titol", "desc", "colors", "ic", "curt", "spr", "xat"):
        p.add_argument("--" + a, required=True)
    p.add_argument("--llengua")
    return p.parse_args(argv)


RESERVADES = {"admin", "perfil", "pares", "motor", "docs", "supabase", "icones", "skills", "node_modules"}


def crea(argv, motor: Path, arrel: Path = None) -> dict:
    a = arguments(argv)
    arrel = arrel or motor.parent
    if not re.fullmatch(r"[a-z0-9_-]{1,40}", a.id):
        sys.exit(f"ERROR: l'id «{a.id}» ha de ser minúscules, xifres, - o _ (fins a 40)")
    if not re.fullmatch(r"[a-z0-9_-]+/[a-z0-9_-]+", a.carpeta) or a.carpeta.split("/")[0] in RESERVADES:
        sys.exit(f"ERROR: la carpeta «{a.carpeta}» ha de ser «assignatura/tema» (minúscules, xifres, - o _) i no pot ser "
                 f"dins de {', '.join(sorted(RESERVADES))}")
    if (arrel / a.carpeta).exists():
        sys.exit(f"ERROR: la carpeta «{a.carpeta}» ja existeix al disc")
    colors = [c.strip() for c in a.colors.split(",")]
    if len(colors) != 3 or not all(re.fullmatch(r"#[0-9a-fA-F]{6}", c) for c in colors):
        sys.exit("ERROR: --colors han de ser 3 colors #rrggbb separats per comes")
    peces = [x.strip() for x in a.xat.split("|")]
    if len(peces) != 3 or not all(peces):
        sys.exit("ERROR: --xat han de ser 3 peces separades per «|»")
    f = motor / "mons.json"
    mons = json.loads(f.read_text())
    if any(m["dades"] == a.id or m["carpeta"] == a.carpeta for m in mons):
        sys.exit(f"ERROR: el món «{a.id}» o la carpeta «{a.carpeta}» ja existeix a mons.json")
    dades = motor / "dades" / f"{a.id}.js"
    if dades.exists():
        sys.exit(f"ERROR: {dades.name} ja existeix")
    seg = max([p[0] for m in mons for p in m.get("xat", [])] + [0]) + 1
    nou = {"dades": a.id, "carpeta": a.carpeta, "mon": str(max([int(m["mon"]) for m in mons if str(m.get("mon", "")).isdigit()] + [0]) + 1), "neix": datetime.date.today().isoformat(),
           "materia": a.materia, "titol": a.titol, "desc": a.desc, "colors": colors, "ic": a.ic,
           "curt": a.curt, "spr": a.spr, "xat": [[seg + i, t] for i, t in enumerate(peces)]}
    if a.llengua:
        nou["llengua"] = a.llengua
    mons.append(nou)
    f.write_text(json.dumps(mons, ensure_ascii=False, indent=1) + "\n")
    q = lambda v: json.dumps(v, ensure_ascii=False)
    dades.write_text(ESQUELET.format(id=q(a.id), materia=q(a.materia), titol=q(a.titol), ic=q(a.ic), colors=q(colors),
                                     peu=q(f"Bona Nota · {a.materia}: {a.titol}")))
    return nou


if __name__ == "__main__":
    n = crea(sys.argv[1:], Path(__file__).resolve().parent)
    print(f"✓ món {n['mon']} «{n['titol']}» ({n['dades']}) afegit a motor/mons.json · peces del xat {n['xat'][0][0]}–{n['xat'][2][0]}")
    print(f"  Ara omple motor/dades/{n['dades']}.js i fes: python3 motor/tot.py && node motor/revisa-mon.js {n['dades']}")
