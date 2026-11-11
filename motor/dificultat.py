#!/usr/bin/env python3
"""Llista i proposta de preguntes difícils (motor/dificultat.json) perquè una persona la pugui revisar.

Ús (des de l'arrel del repo):
    python3 motor/dificultat.py [--motius fitxer.json]
    python3 motor/dificultat.py --proposa dades.json [--sortida informe.md]

Sense --proposa, escriu docs/DIFICILS.md: per a cada món, una taula amb l'id, el tema, la pregunta i la resposta correcta
de cada pregunta difícil (dificultat 3) i per què. Els motius ({"<món>": {"<id>": "motiu"}}) són a
motor/dificultat-motius.json (o al fitxer de --motius).

Amb --proposa <dades.json> (el JSON que retorna public.bn_admin_dificultat a supabase/bn_admin_dificultat.sql, issue #16),
compara la dificultat real (< 55 % → 3 difícil, > 90 % → 1 fàcil) amb motor/dificultat.json i mostra la proposta de canvis.
Issues #15 i #16 (super combo).
"""
import json
import re
import sys
from pathlib import Path

D = Path(__file__).resolve().parent
sys.path.insert(0, str(D))
from qids import ids_mon  # noqa: E402

net = lambda t: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", str(t))).replace("|", "/").strip()


def carrega_dades_sql(cami: Path) -> dict:
    cru = json.loads(cami.read_text())
    if isinstance(cru, list) and cru and isinstance(cru[0], dict):
        if "bn_admin_dificultat" in cru[0]:
            cru = cru[0]["bn_admin_dificultat"]
        elif "r" in cru[0] and isinstance(cru[0]["r"], dict):
            cru = cru[0]["r"]
        elif "qid" in cru[0]:
            cru = {"min_respostes": 8, "preguntes": cru}
    if isinstance(cru, str):
        cru = json.loads(cru)
    return cru if isinstance(cru, dict) else {"min_respostes": 8, "preguntes": []}


def proposa(cami_json: Path, sortida: Path | None, motius: dict, dif: dict, mons: list):
    dades = carrega_dades_sql(cami_json)
    min_r = dades.get("min_respostes", 8)
    per_mon: dict[str, dict[str, dict]] = {}
    for fila in dades.get("preguntes", []):
        per_mon.setdefault(fila["assig"], {})[fila["qid"]] = fila

    linies = [
        f"# Proposta de dificultat amb dades reals (mínim {min_r} respostes)",
        "",
        "Generat amb `python3 motor/dificultat.py --proposa` comparant `bn_admin_dificultat` (`< 55 %` → difícil `3`, `> 90 %` → fàcil `1`) amb `motor/dificultat.json`.",
        "",
    ]
    afegir_tot = treure_tot = facils_tot = amb_dades_tot = q_tot = 0
    for m in mons:
        a = m["dades"]
        _, qids, preg = ids_mon(D / "dades" / f"{a}.js")
        actual = {k: v for k, v in dif.get(a, {}).items() if v in (1, 3)}
        n_tot = sum(1 for t, ns in qids.items() if not t.startswith("j-") for x in ns if x)
        q_tot += n_tot
        files_m = per_mon.get(a, {})
        suf = [r for r in files_m.values() if r.get("suficient")]
        amb_dades_tot += len(suf)
        afegir = [r for r in suf if r.get("dificultat") == 3 and actual.get(r["qid"]) != 3]
        treure = [r for r in suf if r.get("dificultat") in (1, 2) and actual.get(r["qid"]) == 3 and float(r.get("encert", 0)) >= 75]
        facils = [r for r in suf if r.get("dificultat") == 1 and actual.get(r["qid"]) != 1]
        afegir_tot += len(afegir)
        treure_tot += len(treure)
        facils_tot += len(facils)
        linies += [f"## {m['ic']} {m['titol']} (`{a}`) · dades suficients: {len(suf)} / {n_tot}", ""]
        if not suf:
            linies += [f"Encara cap pregunta arriba a {min_r} respostes.", ""]
            continue
        if afegir:
            linies += ["### ➕ Proposta d'afegir com a difícil (`< 55 %`)", "", "| Id | Encert | 1a resp. | Nens | Pregunta |", "|---|---|---|---|---|"]
            for r in sorted(afegir, key=lambda x: float(x.get("encert", 100))):
                p = next((v for kk, v in preg.items() if kk.endswith("/" + r["qid"])), None)
                linies.append(f"| `{r['qid']}` | {r['encert']} % ({r['bones']}/{r['n']}) | {r.get('encert_1a', '—')} % | {r['nens']} | {net(p['t']) if p else '—'} |")
            linies.append("")
        if treure:
            linies += ["### ➖ Marcades difícils però amb encert alt (`>= 75 %`)", "", "| Id | Encert | Nens | Pregunta | Motiu actual |", "|---|---|---|---|---|"]
            for r in sorted(treure, key=lambda x: -float(x.get("encert", 0))):
                p = next((v for kk, v in preg.items() if kk.endswith("/" + r["qid"])), None)
                linies.append(f"| `{r['qid']}` | {r['encert']} % ({r['bones']}/{r['n']}) | {r['nens']} | {net(p['t']) if p else '—'} | {net(motius.get(a, {}).get(r['qid'], ''))} |")
            linies.append("")
        if not afegir and not treure:
            linies += ["Cap canvi proposat en les preguntes que ja tenen prou respostes.", ""]

    resum = f"Resum: {amb_dades_tot}/{q_tot} preguntes amb >= {min_r} respostes · +{afegir_tot} difícils noves · -{treure_tot} difícils amb encert alt · {facils_tot} fàcils (> 90 %)."
    linies.insert(3, f"**{resum}**")
    linies.insert(4, "")
    txt = "\n".join(linies)
    if sortida:
        sortida.write_text(txt)
        print(f"{sortida}: {resum}")
    else:
        print(txt)


def main():
    fm = Path(sys.argv[sys.argv.index("--motius") + 1]) if "--motius" in sys.argv else D / "dificultat-motius.json"
    motius = json.loads(fm.read_text()) if fm.exists() else {}
    dif = json.loads((D / "dificultat.json").read_text())
    mons = json.loads((D / "mons.json").read_text())
    if "--proposa" in sys.argv:
        fp = Path(sys.argv[sys.argv.index("--proposa") + 1])
        fs = Path(sys.argv[sys.argv.index("--sortida") + 1]) if "--sortida" in sys.argv else None
        proposa(fp, fs, motius, dif, mons)
        return
    out = ["# Preguntes difícils (⚡ super combo)", "",
           "Llista generada amb `python3 motor/dificultat.py` a partir de `motor/dificultat.json`. "
           "Una pregunta difícil porta la marca «⚡ difícil» i compta per al super combo: 3 difícils seguides +3 ⭐, 5 seguides +5 ⭐. "
           "Per treure'n o afegir-ne una, edita `motor/dificultat.json` (clau = món, i dins `\"tema/núm\": 3`), posa'n el motiu a `motor/dificultat-motius.json` i torna a generar aquesta llista.", ""]
    total = 0
    for m in mons:
        a = m["dades"]
        _, qids, preg = ids_mon(D / "dades" / f"{a}.js")
        marcades = {k: v for k, v in dif.get(a, {}).items() if v == 3}
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
