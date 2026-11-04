"""Bona Nota · identificadors estables de les preguntes («assig/tema/núm.»).

Cada pregunta rep un número dins del seu tema la primera vegada que es veu. El número es
guarda a motor/qids.json lligat a una empremta del text (sha1 dels primers 10 caràcters
hexadecimals), de manera que:
  - si es reordenen o s'afegeixen preguntes, les que ja hi eren mantenen el número;
  - un número no es reutilitza mai (encara que una pregunta s'esborri);
  - si es canvia el text d'una pregunta, compta com a pregunta nova (número nou).
Els jocs amb preguntes pròpies (tipus «figura») fan servir el tema «j-<id del joc>».
Si les preguntes d'un joc es generen a l'atzar en carregar la pàgina, no tenen id.

Ús: from qids import ids_mon  →  ids_mon(fitxer_dades) = (id_assig, {tema: [números en ordre]}, preguntes)
   preguntes = {"assig/tema/núm": {"t": text, "o": opcions, "c": índex correcte, "tema": títol}} (per al tauler d'admin)
"""
import hashlib, json, pathlib, subprocess

D = pathlib.Path(__file__).parent
REG = D / "qids.json"

JS = r"""
const fs=require('fs');const src=fs.readFileSync(process.argv[1],'utf8');
const g={document:{getElementById:()=>({}),createElement:()=>({}),head:{appendChild:()=>{}}},window:{},location:{search:''}};
const r=new Function('document','window','location',src+`;return {id:ASSIG.id,
 temes:T.map(t=>[t.id,t.q.map(q=>[q[0],q[1],q[2]]),t.titol]),
 jocs:(ASSIG.jocs||[]).filter(j=>Array.isArray(j.q)).map(j=>["j-"+j.id,j.q.map(q=>[q[0],q[1],q[2]]),j.titol])}`)(g.document,g.window,g.location);
console.log(JSON.stringify(r))"""


def _llegeix(fitxer):
    r = subprocess.run(["node", "-e", JS, str(fitxer)], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f"ERROR llegint {fitxer} amb node:\n{r.stderr}")
    return json.loads(r.stdout)


def empremta(text):
    return hashlib.sha1(" ".join(str(text).split()).encode("utf-8")).hexdigest()[:10]


def ids_mon(fitxer):
    a, b = _llegeix(fitxer), _llegeix(fitxer)  # dues lectures: si l'ordre canvia, les preguntes són a l'atzar
    reg = json.loads(REG.read_text()) if REG.exists() else {}
    m = reg.setdefault(a["id"], {})
    sortida, preg = {}, {}
    for (tid, qs, titol), (_, qs2, _t) in zip(a["temes"] + a["jocs"], b["temes"] + b["jocs"]):
        if [q[0] for q in qs] != [q[0] for q in qs2]:
            continue
        t = m.setdefault(tid, {"seg": 1, "h": {}})
        nums = []
        for q in qs:
            h = empremta(q[0])
            if h not in t["h"]:
                t["h"][h] = t["seg"]
                t["seg"] += 1
            nums.append(t["h"][h])
            preg[f"{a['id']}/{tid}/{t['h'][h]}"] = {"t": q[0], "o": q[1], "c": q[2], "tema": titol}
        sortida[tid] = nums
    REG.write_text(json.dumps(reg, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    return a["id"], sortida, preg
