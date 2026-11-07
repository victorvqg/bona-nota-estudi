#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
bonanota_pdf.py — Empaquetador, generador i validador de PDFs de Bona Nota.

Es pot importar com a mòdul (`from bonanota_pdf import genera_pdf`) o executar
per línia d'ordres.
"""
from __future__ import annotations

import argparse
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import weasyprint

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
BASE_CSS_PATH = SKILL_DIR / "assets" / "base.css"

RANG_PAGINES: Dict[str, Tuple[int, int]] = {
    "resum": (2, 16),
    "esquema": (1, 2),
    "examen": (1, 5),
    "respostes": (1, 6),
    "orals": (1, 3),
    "connexions": (1, 2),
}

NOM_TIPUS: Dict[str, str] = {
    "resum": "Resum d'estudi",
    "esquema": "Esquema visual",
    "examen": "Examen d'entrenament",
    "respostes": "Full de respostes",
    "orals": "Preguntes orals",
    "connexions": "Connexions i aplicacions",
}


def slugify(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    sense_accents = "".join(c for c in nfkd if not unicodedata.combining(c))
    net = re.sub(r"[^a-zA-Z0-9]+", "_", sense_accents.lower()).strip("_")
    return net or "document"


def classe_assignatura(assignatura: str) -> str:
    s = slugify(assignatura)
    if any(k in s for k in ("mate", "calcul", "algebra", "geometria")):
        return "assig-mates"
    if any(k in s for k in ("social", "geografia", "historia", "clima", "comarq")):
        return "assig-socials"
    if any(k in s for k in ("bio", "geo", "natural", "cienci")):
        return "assig-biogeo"
    if any(k in s for k in ("castellan", "lengua")):
        return "assig-castellano"
    if any(k in s for k in ("catala", "llengua")):
        return "assig-catala"
    if any(k in s for k in ("angles", "english", "ingles")):
        return "assig-angles"
    if any(k in s for k in ("tecno", "empren", "plastica", "musica")):
        return "assig-tecnologia"
    return "assig-socials"


def compta_paraules_html(html: str) -> int:
     sense_svg = re.sub(r"<svg[\s\S]*?</svg>", " ", html, flags=re.IGNORECASE)
     text = re.sub(r"<[^>]+>", " ", sense_svg)
     return len(re.findall(r"\S+", text))


def munta_html(
    body_html: str,
    tipus: str,
    assignatura: str,
    tema: str,
    curs: str = "1r ESO",
    compacte: bool = False,
) -> str:
    cls_assig = classe_assignatura(assignatura)
    cls_doc = f"doc-{tipus}"
    cls_comp = " esquema-compacte" if compacte else ""
    etiqueta_tipus = NOM_TIPUS.get(tipus, tipus.capitalize())
    cap_esq = f"BONA NOTA · {assignatura.upper()} · {curs.upper()}"
    cap_dre = f"{tema} · {etiqueta_tipus}"

    te_franja = "franja-titol" in body_html
    franja_auto = ""
    if not te_franja:
        franja_auto = (
            f'<div class="franja-titol">'
            f'<p class="etiqueta-bn">Bona Nota · {assignatura} · {curs}</p>'
            f'<h1>{tema}</h1>'
            f'<p class="subtitol">{etiqueta_tipus}</p>'
            f'</div>\n'
        )

    return f"""<!DOCTYPE html>
<html lang="ca">
<head>
<meta charset="UTF-8">
<title>Bona Nota — {assignatura} · {tema} ({etiqueta_tipus})</title>
</head>
<body class="{cls_assig} {cls_doc}{cls_comp}">
<div class="bn-meta-esq">{cap_esq}</div>
<div class="bn-meta-dre">{cap_dre}</div>
{franja_auto}{body_html}
</body>
</html>
"""


def _genera_captures_png(pdf_path: Path, n_pagines: int, outdir: Path) -> list[str]:
    """Genera captures PNG a ~60 ppp de la primera i l'última pàgina si hi ha eina disponible."""
    captures: list[str] = []
    stem = pdf_path.stem
    pdftoppm = shutil.which("pdftoppm")
    if pdftoppm:
        for p in sorted({1, n_pagines}):
            prefix = outdir / f"{stem}_p{p}"
            subprocess.run(
                [pdftoppm, "-png", "-r", "60", "-f", str(p), "-l", str(p), "-singlefile", str(pdf_path), str(prefix)],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            png = Path(f"{prefix}.png")
            if png.exists():
                captures.append(str(png))
        return captures

    sips = shutil.which("sips")
    if sips:
        out_p1 = outdir / f"{stem}_p1.png"
        subprocess.run(
            [sips, "-s", "format", "png", "-Z", "700", str(pdf_path), "--out", str(out_p1)],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if out_p1.exists():
            captures.append(str(out_p1))
    return captures


def genera_pdf(
    body_html: str,
    tipus: str,
    assignatura: str,
    tema: str,
    outdir: str | Path,
    curs: str = "1r ESO",
    max_pagines: Optional[int] = None,
    keep_html: bool = False,
    css_path: Optional[str | Path] = None,
) -> Dict[str, Any]:
    """
    Compila i valida un PDF de Bona Nota amb WeasyPrint i `assets/base.css`.
    Retorna un diccionari amb el resultat i l'informe.
    """
    tipus_norm = slugify(tipus)
    if tipus_norm not in RANG_PAGINES:
        raise ValueError(f"Tipus de document desconegut: {tipus!r}. Valors vàlids: {list(RANG_PAGINES)}")

    if "<style" in body_html.lower():
        raise ValueError("El contingut HTML no pot incloure etiquetes <style>: tot el CSS ha de sortir de base.css.")

    outdir_path = Path(outdir).resolve()
    outdir_path.mkdir(parents=True, exist_ok=True)
    css_file = Path(css_path).resolve() if css_path else BASE_CSS_PATH
    if not css_file.exists():
        raise FileNotFoundError(f"No s'ha trobat base.css a {css_file}")

    nom_base = f"{slugify(assignatura)}_{slugify(tema)}_{tipus_norm}"
    pdf_path = outdir_path / f"{nom_base}.pdf"
    html_tmp = outdir_path / f"{nom_base}.tmp.html"

    paraules = compta_paraules_html(body_html)
    min_pag, max_pag_defecte = RANG_PAGINES[tipus_norm]
    limit_pag = max_pagines if max_pagines is not None else (1 if tipus_norm == "esquema" else max_pag_defecte)

    compacte = False
    html_complet = munta_html(body_html, tipus_norm, assignatura, tema, curs=curs, compacte=False)
    html_tmp.write_text(html_complet, encoding="utf-8")

    stylesheet = weasyprint.CSS(filename=str(css_file))
    doc = weasyprint.HTML(string=html_complet, base_url=str(SKILL_DIR)).render(stylesheets=[stylesheet])
    n_pagines = len(doc.pages)

    # Millora 5: per a l'esquema, si desborda fem UN sol intent baixant la lletra 1 pt (.esquema-compacte)
    if tipus_norm == "esquema" and n_pagines > limit_pag:
        compacte = True
        html_complet = munta_html(body_html, tipus_norm, assignatura, tema, curs=curs, compacte=True)
        html_tmp.write_text(html_complet, encoding="utf-8")
        doc = weasyprint.HTML(string=html_complet, base_url=str(SKILL_DIR)).render(stylesheets=[stylesheet])
        n_pagines = len(doc.pages)

        if n_pagines > limit_pag:
            # Calculem quantes paraules sobren aproximadament sense tornar a provar en bucle
            capacitat_per_pagina = 230 * limit_pag
            sobren = max(25, paraules - capacitat_per_pagina)
            pag_desborda = limit_pag + 1
            msg = (
                f"ERROR: La pàgina {pag_desborda} desborda, sobren ~{sobren} paraules "
                f"(s'han generat {n_pagines} pàgines per a un límit de {limit_pag} fins i tot a 9 pt)."
            )
            return {
                "ok": False,
                "error": msg,
                "pdf_path": None,
                "pagines": n_pagines,
                "paraules": paraules,
                "compacte": compacte,
            }

    doc.write_pdf(str(pdf_path))

    # Validació física del PDF (%PDF- i > 1 KB)
    if not pdf_path.exists():
        return {"ok": False, "error": "ERROR: El fitxer PDF no s'ha creat.", "pdf_path": None}
    mida = pdf_path.stat().st_size
    with pdf_path.open("rb") as f:
        cap_bytes = f.read(5)
    if cap_bytes != b"%PDF-" or mida < 1024:
        return {
            "ok": False,
            "error": f"ERROR: PDF invàlid o massa petit ({mida} bytes, capçalera={cap_bytes!r}).",
            "pdf_path": str(pdf_path),
        }

    dins_rang = min_pag <= n_pagines <= (limit_pag if tipus_norm == "esquema" else max_pag_defecte)
    captures = _genera_captures_png(pdf_path, n_pagines, outdir_path)

    if not keep_html and html_tmp.exists():
        html_tmp.unlink()

    informe = (
        f"OK · {pdf_path.name} ({mida // 1024} KB) · "
        f"pàgines: {n_pagines} (rang {min_pag}-{limit_pag if tipus_norm == 'esquema' else max_pag_defecte}, "
        f"{'dins rang' if dins_rang else 'fora de rang'}) · "
        f"paraules: {paraules}"
        + (" · ajustat a 9 pt" if compacte else "")
        + (f" · captures: {', '.join(Path(c).name for c in captures)}" if captures else "")
    )
    return {
        "ok": True,
        "informe": informe,
        "pdf_path": str(pdf_path),
        "pagines": n_pagines,
        "paraules": paraules,
        "dins_rang": dins_rang,
        "compacte": compacte,
        "captures": captures,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generador i validador de PDFs de Bona Nota (WeasyPrint).")
    grup = parser.add_mutually_exclusive_group(required=True)
    grup.add_argument("--html-file", help="Ruta al fitxer amb l'HTML del contingut (només el cos).")
    grup.add_argument("--html", help="Cadena amb l'HTML del contingut (només el cos).")
    parser.add_argument("--tipus", required=True, help="Tipus: resum | esquema | examen | respostes | orals | connexions")
    parser.add_argument("--assignatura", required=True, help="Nom de l'assignatura (p. ex. Mates, Socials, Català)")
    parser.add_argument("--tema", required=True, help="Títol del tema (p. ex. 'Tema 2: Divisibilitat')")
    parser.add_argument("--curs", default="1r ESO", help="Curs (per defecte: '1r ESO')")
    parser.add_argument("--outdir", required=True, help="Carpeta de sortida per al PDF")
    parser.add_argument("--max-pagines", type=int, default=None, help="Màxim de pàgines permès (especialment per a esquema)")
    parser.add_argument("--keep-html", action="store_true", help="No esborris l'HTML temporal")
    args = parser.parse_args()

    if args.html_file:
        html_path = Path(args.html_file)
        body_html = html_path.read_text(encoding="utf-8")
    else:
        body_html = args.html

    try:
        res = genera_pdf(
            body_html=body_html,
            tipus=args.tipus,
            assignatura=args.assignatura,
            tema=args.tema,
            outdir=args.outdir,
            curs=args.curs,
            max_pagines=args.max_pagines,
            keep_html=args.keep_html,
        )
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if not res.get("ok"):
        print(res.get("error", "ERROR desconegut"), file=sys.stderr)
        return 1

    if args.html_file and not args.keep_html:
        try:
            Path(args.html_file).unlink(missing_ok=True)
        except Exception:
            pass

    print(res["informe"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
