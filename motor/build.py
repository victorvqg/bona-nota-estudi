#!/usr/bin/env python3
"""Bona Nota · estudi interactiu: plantilla + dades/<assig>.js -> ../<assig>/index.html
Ús: python3 build.py <dades> [carpeta]   ex.: python3 build.py socials sociales/t3-clima"""
import sys, re, pathlib
d = pathlib.Path(__file__).parent
assig = sys.argv[1]
plant = (d / "plantilla-estudi-interactiu.html").read_text()
dades = (d / "dades" / f"{assig}.js").read_text()
nom = re.search(r'nom:"([^"]+)"', dades).group(1)
curs = re.search(r'curs:"([^"]+)"', dades).group(1)
html = plant.replace("/*DADES*/", dades, 1).replace("{{TITOL}}", f"{nom} {curs} — Estudia jugant | Bona Nota")
assert "{{" not in html and "/*DADES*/" not in html
out = d.parent / (sys.argv[2] if len(sys.argv) > 2 else assig) / "index.html"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html)
print(out, len(html), "bytes")
