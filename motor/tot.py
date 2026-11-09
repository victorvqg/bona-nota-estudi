#!/usr/bin/env python3
"""Bona Nota · regenera TOTS els mons i les targetes de la portada.

Ús (des de motor/):   python3 tot.py
  1. Per a cada entrada de mons.json: plantilla + dades/<dades>.js -> ../<carpeta>/index.html
  2. Compta temes i jocs de cada món (llegint les dades amb node).
  3. Reescriu les targetes de ../index.html entre <!-- MONS:inici --> i <!-- MONS:fi -->.
  3a. Omple els blocs copiats de ../perfil/index.html (so als mòbils, actualització automàtica) i el ?v= de sprites.js.

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
# el desbloqueig del so als mòbils és el mateix codi que als mons (motor/eines/so-mobil.js)
ini, fi = "/* SO-MOBIL:inici (copiat de motor/eines/so-mobil.js per motor/tot.py, no editar a mà) */", "/* SO-MOBIL:fi */"
if ini not in s or fi not in s:
    sys.exit("ERROR: a index.html falten les marques SO-MOBIL:inici / SO-MOBIL:fi")
a, b = s.index(ini) + len(ini), s.index(fi)
s = s[:a] + "\n" + (d / "eines" / "so-mobil.js").read_text().rstrip("\n") + "\n" + s[b:]
# l'actualització automàtica (motor/eines/actualitza.js) també és el mateix codi que als mons
ini, fi = "/* ACTUALITZA:inici (copiat de motor/eines/actualitza.js per motor/tot.py, no editar a mà) */", "/* ACTUALITZA:fi */"
if ini not in s or fi not in s:
    sys.exit("ERROR: a index.html falten les marques ACTUALITZA:inici / ACTUALITZA:fi")
a, b = s.index(ini) + len(ini), s.index(fi)
s = s[:a] + "\n" + (d / "eines" / "actualitza.js").read_text().rstrip("\n") + "\n" + s[b:]
# sprites.js amb «?v=<empremta>»: quan canvia, l'adreça és nova i cap memòria cau no en pot servir una còpia vella
import hashlib, re
v_spr = hashlib.sha1((arrel / "sprites.js").read_bytes()).hexdigest()[:8]
s, n = re.subn(r'src="sprites\.js(\?v=[0-9a-f]*)?"', f'src="sprites.js?v={v_spr}"', s)
if n != 1:
    sys.exit("ERROR: a index.html hi ha d'haver exactament un <script src=\"sprites.js\">")
idx.write_text(s)
adm = arrel / "admin" / "index.html"
adm.write_text(re.sub(r'src="\.\./sprites\.js(\?v=[0-9a-f]*)?"', f'src="../sprites.js?v={v_spr}"', adm.read_text()))
print(f"✓ portada: {len(mons)} mons")

# 3a) pàgina de perfil (perfil/index.html): els mateixos blocs copiats que la portada (so als mòbils i actualització
#     automàtica) i el «?v=» de sprites.js. S'escriu a mà, com la portada; tot.py només li omple aquests blocs.
prf = arrel / "perfil" / "index.html"
s = prf.read_text()
for ini, fi, eina in [("/* SO-MOBIL:inici (copiat de motor/eines/so-mobil.js per motor/tot.py, no editar a mà) */", "/* SO-MOBIL:fi */", "so-mobil.js"),
                      ("/* ACTUALITZA:inici (copiat de motor/eines/actualitza.js per motor/tot.py, no editar a mà) */", "/* ACTUALITZA:fi */", "actualitza.js")]:
    if ini not in s or fi not in s:
        sys.exit(f"ERROR: a perfil/index.html falten les marques {eina}")
    a, b = s.index(ini) + len(ini), s.index(fi)
    s = s[:a] + "\n" + (d / "eines" / eina).read_text().rstrip("\n") + "\n" + s[b:]
s, n = re.subn(r'src="\.\./sprites\.js(\?v=[0-9a-f]*)?"', f'src="../sprites.js?v={v_spr}"', s)
if n != 1:
    sys.exit("ERROR: a perfil/index.html hi ha d'haver exactament un <script src=\"../sprites.js\">")
prf.write_text(s)
print("✓ perfil")

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

# 3c) número de versió del producte (la primera entrada de CHANGELOG.md) al peu de la portada i de cada món.
#     Va abans de l'empremta perquè un canvi de número també arribi als mòbils.
trobat = re.search(r"^## (\d+\.\d+\.\d+)\b", (arrel / "CHANGELOG.md").read_text(), re.M)
if not trobat:
    sys.exit("ERROR: a CHANGELOG.md no hi ha cap entrada «## X.Y.Z»")
for f, es in [("index.html", False), ("perfil/index.html", False)] + [(m["carpeta"] + "/index.html", m.get("llengua") == "es") for m in mons]:
    peu = f'<small class="bn-versio">{"versión" if es else "versió"} {trobat.group(1)}</small>'
    t, n = re.subn(r'<small class="bn-versio">[^<]*</small>', peu, (arrel / f).read_text())
    if n != 1:
        sys.exit(f'ERROR: {f} ha de portar exactament un <small class="bn-versio">')
    (arrel / f).write_text(t)
t, n = re.subn(r'const VERSIO_ADMIN="[^"]*";', f'const VERSIO_ADMIN="{trobat.group(1)}";', adm.read_text())
if n != 1:
    sys.exit("ERROR: admin/index.html ha de portar exactament un const VERSIO_ADMIN")
adm.write_text(t)
print(f"✓ versió {trobat.group(1)} al peu de la portada i dels mons, i al tauler")

# 4) versió publicada: una empremta del contingut (portada, sprites i mons, calculada amb el buit «__BN_VERSIO__» encara
#    sense omplir, perquè no depengui d'ella mateixa). Va a: cada pàgina (actualitza.js la compara amb versio.json en obrir-la
#    i, si no coincideixen, es recarrega sola), versio.json i el service worker (app instal·lable i sense connexió).
fitxers_sw = ["./", "index.html", f"sprites.js?v={v_spr}", "manifest.webmanifest", "icones/icona-192.png", "icones/icona-512.png", "perfil/"] + [m["carpeta"] + "/" for m in mons]
pagines = ["index.html", "perfil/index.html"] + [m["carpeta"] + "/index.html" for m in mons]
h = hashlib.sha1()
for f in ["index.html", "sprites.js"] + pagines[1:]:
    h.update((arrel / f).read_bytes())
versio = h.hexdigest()[:10]
for f in pagines:
    t = (arrel / f).read_text()
    if t.count('VER="__BN_VERSIO__"') != 1:
        sys.exit(f"ERROR: {f} no porta l'actualització automàtica (motor/eines/actualitza.js)")
    (arrel / f).write_text(t.replace('VER="__BN_VERSIO__"', f'VER="{versio}"'))
(arrel / "versio.json").write_text(json.dumps({"v": versio}) + "\n")
sw = (d / "sw-plantilla.js").read_text().replace("__VERSIO__", versio).replace("__FITXERS__", json.dumps(fitxers_sw, ensure_ascii=False))
(arrel / "sw.js").write_text(sw)
print(f"✓ versió {versio}: pàgines, versio.json i sw.js")
