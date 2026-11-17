"""Bona Nota · el que surt de motor/mons.json fora de les pàgines dels mons.

motor/tot.py hi escriu, entre marques «no editar a mà»:
  - admin/index.html   · MONS-ADMIN: ASSIGS (nom curt), COL_MON (colors al tauler), XMON (nom al xat) i DEMO_JOCS (demo).
  - sprites.js         · BN-MON: la icona (sprite) i l'assignatura de cada món al rànquing.
  - index.html         · XAT-MONS: les 3 paraules d'estudi del xat de cada món (XAT_PC_MONS).
  - supabase/bn_xat.sql· XAT-MONS: les mateixes peces, per a la base de dades.

Camps de cada entrada de mons.json que fa servir:
  curt (obligatori) · spr (obligatori, clau de BN_SPR a sprites.js) · xat (obligatori, 3 × [id < 1001, "text"])
  xmon (opcional, per defecte curt) · col_admin (opcional, 8 colors; per defecte es deriva de colors[1])
  demo_jocs (opcional, per defecte els 4 primers jocs del món).
"""
import json
import re
import sys
from pathlib import Path

ADM = ("/* MONS-ADMIN:inici (generat per motor/tot.py, no editar a mà) */", "/* MONS-ADMIN:fi */")
BN_MON = ("/* BN-MON:inici (generat per motor/tot.py des de motor/mons.json, no editar a mà) */", "/* BN-MON:fi */")
XAT_JS = ("/* XAT-MONS:inici (generat per motor/tot.py des de motor/mons.json, no editar a mà) */", "/* XAT-MONS:fi */")
XAT_SQL = ("-- XAT-MONS:inici (generat per motor/tot.py des de motor/mons.json, no editar a mà)", "-- XAT-MONS:fi")

js = lambda v: json.dumps(v, ensure_ascii=False, separators=(",", ":"))


def valida(mons: list, sprites: str) -> None:
    """Atura tot.py amb un missatge clar si a una entrada li falta un camp o té peces de xat que no valen."""
    vistos = {}
    for m in mons:
        id_ = m.get("dades", "?")
        for camp in ("curt", "spr"):
            if not isinstance(m.get(camp), str) or not m[camp].strip():
                sys.exit(f"ERROR: mons.json · {id_}: falta «{camp}»")
        if not re.search(rf"^ {re.escape(m['spr'])}:\{{w:", sprites, re.M):
            sys.exit(f"ERROR: mons.json · {id_}: l'sprite «{m['spr']}» no és a BN_SPR (sprites.js)")
        xat = m.get("xat")
        if not (isinstance(xat, list) and len(xat) == 3 and all(isinstance(p, list) and len(p) == 2 and isinstance(p[0], int)
                                                               and isinstance(p[1], str) and p[1].strip() for p in xat)):
            sys.exit(f"ERROR: mons.json · {id_}: «xat» han de ser 3 peces [id, \"text\"]")
        for pid, _ in xat:
            if not 0 < pid < 1001:
                sys.exit(f"ERROR: mons.json · {id_}: la peça de xat {pid} ha de tenir un id entre 1 i 1000")
            if pid in vistos:
                sys.exit(f"ERROR: mons.json · {id_}: la peça de xat {pid} ja és de «{vistos[pid]}»")
            vistos[pid] = id_
        if "col_admin" in m and not (isinstance(m["col_admin"], list) and len(m["col_admin"]) == 8):
            sys.exit(f"ERROR: mons.json · {id_}: «col_admin» han de ser 8 colors")


def _barreja(hex_: str, amb: str, t: float) -> str:
    a = [int(hex_[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(amb[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(a, b))


def deriva_col_admin(color: str) -> list:
    """Els 8 colors de COL_MON (clar: color, fons, text, vora · fosc: color, fons, text, vora) a partir d'un sol color."""
    blanc, negre = "#ffffff", "#000000"
    return [color.lower(), _barreja(color, blanc, .93), _barreja(color, negre, .45), _barreja(color, blanc, .7),
            _barreja(color, blanc, .35), _barreja(color, negre, .8), _barreja(color, blanc, .7), _barreja(color, negre, .45)]


def bloc_admin(mons: list, jocs_per_mon: dict) -> str:
    nou_a_vell = list(reversed(mons))
    assigs = {m["dades"]: m["curt"] for m in nou_a_vell}
    xmon = {m["dades"]: m.get("xmon") or m["curt"] for m in nou_a_vell}
    demo = {m["dades"]: m.get("demo_jocs") or jocs_per_mon.get(m["dades"], [])[:4] for m in nou_a_vell}
    col = "\n".join(f" {js(m['dades'])}:{js(m.get('col_admin') or deriva_col_admin(m['colors'][1]))}," for m in nou_a_vell)
    return (f"const ASSIGS={js(assigs)};\n"
            f"// Color fix per a cada món (clar: color, fons, text, vora · fosc: color, fons, text, vora)\n"
            f"const COL_MON={{\n{col.rstrip(',')}\n}};\n"
            f"const XMON={js(xmon)};\n"
            f"const DEMO_JOCS={js(demo)};")


def bloc_bn_mon(mons: list) -> str:
    return "const BN_MON=" + js({m["dades"]: {"ic": m["spr"], "mat": m["materia"]} for m in mons}) + ";"


def bloc_xat(mons: list) -> tuple:
    peces = sorted(((pid, t, m["dades"]) for m in mons for pid, t in m["xat"]), key=lambda p: p[0])
    q = lambda t: "'" + t.replace("'", "''") + "'"
    js_ = "const XAT_PC_MONS=[\n" + ",\n".join(f" {{id:{pid},s:\"P\",t:{js(t)},m:{js(mon)}}}" for pid, t, mon in peces) + "];"
    sql = ("insert into bn_priv.xat_peces(id, tipus, text, nivell, mon) values\n"
           + ",\n".join(f"  ({pid}, 'P', {q(t)}, null, {q(mon)})" for pid, t, mon in peces)
           + "\non conflict (id) do update set tipus = excluded.tipus, text = excluded.text, nivell = excluded.nivell, mon = excluded.mon;")
    return js_, sql


def escriu_bloc(fitxer: Path, marques: tuple, contingut: str) -> None:
    """Substitueix el que hi ha entre les dues marques; s'atura si no hi són exactament un cop."""
    ini, fi = marques
    s = fitxer.read_text()
    if s.count(ini) != 1 or s.count(fi) != 1:
        sys.exit(f"ERROR: a {fitxer.name} hi ha d'haver exactament una marca «{ini}» i una «{fi}»")
    a, b = s.index(ini) + len(ini), s.index(fi)
    fitxer.write_text(s[:a] + "\n" + contingut + "\n" + s[b:])
