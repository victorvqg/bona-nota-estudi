#!/usr/bin/env python3
"""Bona Nota · estudi interactiu: plantilla + dades/<assig>.js -> ../<assig>/index.html
Ús: python3 build.py <dades> [carpeta]   ex.: python3 build.py socials sociales/t3-clima"""
import sys, re, pathlib
d = pathlib.Path(__file__).parent
assig = sys.argv[1]
plant = (d / "plantilla-estudi-interactiu.html").read_text()
dades = (d / "dades" / f"{assig}.js").read_text()
# eines compartides: una línia «//@inclou eines/<fitxer>.js» a les dades s'hi substitueix pel contingut del fitxer
dades = re.sub(r"^//@inclou (eines/[\w.-]+\.js)\s*$", lambda m: (d / m.group(1)).read_text(), dades, flags=re.M)
# la plantilla també pot incloure eines compartides (p. ex. eines/so-mobil.js, que també va a la portada)
plant = re.sub(r"^//@inclou (eines/[\w.-]+\.js)\s*$", lambda m: (d / m.group(1)).read_text(), plant, flags=re.M)
nom = re.search(r'nom:"([^"]+)"', dades).group(1)
curs = re.search(r'curs:"([^"]+)"', dades).group(1)
mt = re.search(r'tema:"([^"]+)"', dades.split("blocs:")[0])
tema = f" — {mt.group(1)}" if mt else ""
# llista de tots els mons (per sumar estrelles i enllaçar-los des de qualsevol món)
import json
mons = []
for m in json.loads((d / "mons.json").read_text()):
    src = (d / "dades" / f"{m['dades']}.js").read_text().split("const T=")[0]
    mid = re.search(r'\bid:"([^"]+)"', src).group(1)
    mc = re.search(r'\bclau:"([^"]+)"', src)
    mons.append({"id": mid, "clau": mc.group(1) if mc else "bn_" + mid, "ic": m["ic"], "materia": m["materia"],
                 "titol": m["titol"], "url": "../../" + m["carpeta"] + "/"})
mons_js = "const MONS=" + json.dumps(mons, ensure_ascii=False) + ";"
# identificadors estables de les preguntes (motor/qids.json) → const QIDS={tema:[números]}
from qids import ids_mon
_, qids, _p = ids_mon(d / "dades" / f"{assig}.js")
mons_js += "\nconst QIDS=" + json.dumps(qids, separators=(",", ":")) + ";"
html = plant.replace("/*DADES*/", dades, 1).replace("/*MONS*/", mons_js, 1).replace("{{TITOL}}", f"{nom}{tema} · {curs} | Bona Nota")
assert "{{" not in html and "/*DADES*/" not in html and "/*MONS*/" not in html
out = d.parent / (sys.argv[2] if len(sys.argv) > 2 else assig) / "index.html"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html)
print(out, len(html), "bytes")
