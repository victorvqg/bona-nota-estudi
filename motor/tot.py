#!/usr/bin/env python3
"""Bona Nota · regenera TOTS els mons i les targetes de la portada.

Ús (des de motor/):   python3 tot.py
  1. Per a cada entrada de mons.json: plantilla + dades/<dades>.js -> ../<carpeta>/index.html
  2. Compta temes i jocs de cada món (llegint les dades amb node).
  3. Reescriu les targetes de ../index.html entre <!-- MONS:inici --> i <!-- MONS:fi -->.

Per afegir un món nou: crea dades/<id>.js i afegeix una entrada a mons.json
(dades, carpeta, mon, materia, titol, desc, colors [3], ic; opcional llengua:"es"). Després: python3 tot.py
"""
import json, pathlib, subprocess, sys, html

d = pathlib.Path(__file__).parent
arrel = d.parent
mons = json.loads((d / "mons.json").read_text())

# 1) pàgines
for m in mons:
    r = subprocess.run([sys.executable, str(d / "build.py"), m["dades"], m["carpeta"]], capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"ERROR construint {m['dades']}:\n{r.stderr}")
    print("✓", m["carpeta"])

# 2) recomptes (les dades són JavaScript: les avaluem amb node)
js = r"""
const fs=require('fs');const out={};
for(const f of process.argv.slice(1)){const src=fs.readFileSync(f,'utf8');
 const g={document:{getElementById:()=>({})},window:{},location:{search:''}};
 const r=new Function('document','window','location',src+';return {n:T.length,j:ASSIG.jocs.length,clau:ASSIG.clau||("bn_"+ASSIG.id),id:ASSIG.id}')(g.document,g.window,g.location);
 out[f]=r}
console.log(JSON.stringify(out))"""
fitxers = [str(d / "dades" / f"{m['dades']}.js") for m in mons]
r = subprocess.run(["node", "-e", js] + fitxers, capture_output=True, text=True)
if r.returncode:
    sys.exit("ERROR llegint les dades amb node:\n" + r.stderr)
info = json.loads(r.stdout)

# 3) targetes
e = lambda t: html.escape(str(t), quote=False).replace('"', '&quot;')
targetes = []
for m in mons:
    i = info[str(d / "dades" / f"{m['dades']}.js")]
    c1, c2, c3 = m["colors"]
    es = m.get("llengua") == "es"
    ilu = d / "ilu" / f"{m['dades']}.svg"   # il·lustració pròpia del món (opcional; si no n'hi ha, es mostra l'emoji)
    dibuix = " ".join(ilu.read_text().split()) if ilu.exists() else m['ic']
    targetes.append(f''' <a class="as" href="{e(m['carpeta'])}/" data-clau="{e(i['clau'])}" data-id="{e(i['id'])}" data-ic="{e(m['ic'])}" data-temes="{i['n']}" style="--c1:{c1};--c2:{c2};--c3:{c3}">
  <div class="portada"><span class="tag">MÓN {e(m['mon'])}</span><span class="ic">{dibuix}</span></div>
  <div class="cos">
   <small class="mat">{e(m['materia'])}</small>
   <h2>{e(m['titol'])}</h2>
   <p>{e(m['desc'])}</p>
   <div class="xips"><span>📖 {i['n']} {'fichas' if es else 'fitxes'}</span><span>🎮 {i['j']} {'juegos' if es else 'jocs'}</span><span>📝 Examen</span></div>
   <div class="prog"><div class="barra"><i></i></div><small><span class="pt"></span><span class="pc"></span></small></div>
   <div class="juga"><span>JUGA ▶</span></div>
  </div>
 </a>''')
idx = arrel / "index.html"
s = idx.read_text()
ini, fi = "<!-- MONS:inici (generat per motor/tot.py, no editar a mà) -->", "<!-- MONS:fi -->"
if ini not in s or fi not in s:
    sys.exit("ERROR: a index.html falten les marques MONS:inici / MONS:fi")
a, b = s.index(ini) + len(ini), s.index(fi)
s = s[:a] + "\n" + "\n".join(targetes) + "\n " + s[b:]
idx.write_text(s)
print(f"✓ portada: {len(mons)} mons")

# 3b) text de totes les preguntes per al tauler d'admin (admin/preguntes.json): id → text, opcions, correcta, tema
from qids import ids_mon
preguntes = {}
for m in mons:
    _, _, p = ids_mon(d / "dades" / f"{m['dades']}.js")
    for k, v in p.items():
        v["mon"] = m["titol"]
    preguntes.update(p)
(arrel / "admin" / "preguntes.json").write_text(json.dumps(preguntes, ensure_ascii=False, separators=(",", ":")))
print(f"✓ admin/preguntes.json: {len(preguntes)} preguntes")

# 4) service worker (app instal·lable i sense connexió): llista de pàgines i versió segons el contingut
import hashlib
fitxers_sw = ["./", "index.html", "sprites.js", "manifest.webmanifest", "icones/icona-192.png", "icones/icona-512.png"] + [m["carpeta"] + "/" for m in mons]
h = hashlib.sha1()
for f in ["index.html", "sprites.js"] + [m["carpeta"] + "/index.html" for m in mons]:
    h.update((arrel / f).read_bytes())
versio = h.hexdigest()[:10]
sw = (d / "sw-plantilla.js").read_text().replace("__VERSIO__", versio).replace("__FITXERS__", json.dumps(fitxers_sw, ensure_ascii=False))
(arrel / "sw.js").write_text(sw)
print(f"✓ sw.js versió {versio}")
