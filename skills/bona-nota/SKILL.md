---
name: bona-nota
description: >
  Genera paquets d'estudi en PDF de Bona Nota (resum estudiable, esquema visual,
  examen, full de respostes, preguntes orals i connexions, o dossier de llibres
  de lectura) a partir de fotos del llibre, apunts o carpetes de Drive per a 1r
  d'ESO. Activa'l amb /bonanota, quan l'usuari pugi fotos o apunts d'un tema, o
  quan demani «resum», «esquema», «examen», «prepara el tema» o «Resum llibre».
---

# Bona Nota — Generador modular de paquets d'estudi en PDF

Bona Nota transforma fotos del llibre o apunts de classe en un paquet de PDFs d'estudi clars, rigorosos i amb to de tutor proper per a alumnes de 1r d'ESO. Tots els documents porten la marca «Bona Nota», capçalera amb assignatura i tema, peu numerat «1 / N» i l'estil unificat d'`assets/base.css`.

## Pas 0 · Deduir abans de preguntar

1. **Mira el material** (títol, capçalera de pàgina, vocabulari) i dedueix l'assignatura, el tema i el curs (1r ESO per defecte).
2. **Si és clar, confirma-ho en una sola línia i comença sense esperar resposta.**
   Exemple: *«Mates · Tema 4: Les fraccions · en català · examen mixt. Si no és així, digues-m'ho.»*
3. **Pregunta NOMÉS en aquests 3 casos:**
   - No hi ha material (ni fotos, ni apunts, ni text).
   - El material barreja dues assignatures o dos temes diferents.
   - No queda clar en quina llengua ha d'anar.
4. **Llengua:** la marca l'assignatura, no la llengua del llibre:
   - *Lengua castellana* → castellà.
   - *Anglès* → contingut en anglès i explicacions en català.
   - *La resta d'assignatures* → català, si l'usuari no diu el contrari.
5. **Tipus d'examen:** mixt per defecte (test + desenvolupament + problemes/aplicació). No es pregunta; només canvia si l'usuari ho demana.
6. **Excepció «Resum llibre»:** el prompt del flux de llibres (`llibre-notebooklm-bonanota`) ja porta totes les dades; no hi apliquis el Pas 0 i llegeix directament `references/llibres.md`.

## Flux en dues fases (un document per crida)

Genera sempre **un sol document per crida**: escriu-ne l'HTML de contingut, compila'l i valida'l amb `scripts/bonanota_pdf.py`, i només quan passi la validació continua amb el següent. Mai generis dos documents dins el mateix script.

1. **Fase 1 (Estudi):**
   - `resum` (Resum d'estudi complet) → valida i lliura.
   - `esquema` (Esquema visual / pòster d'1-2 pàgines) → valida i lliura.
2. **Pausa condicional entre fases:**
   - Fes pausa **només** si el material supera les 6 pàgines de llibre, si el resum supera les 10 pàgines o si l'usuari ho ha demanat explícitament (*«primer el resum»*). En aquest cas digues: *«Resum i esquema llestos. Escriu "continua" i faig l'examen i la resta.»*
   - En tots els altres casos, continua sol cap a la Fase 2 sense esperar.
3. **Fase 2 (Avaluació i pràctica, basada en el resum ja generat):**
   - `examen` (Examen mixt) → valida i lliura.
   - `respostes` (Full de respostes i solucionari pas a pas) → valida i lliura.
   - `orals` (Preguntes orals per prendre la lliçó) → valida i lliura.
   - `connexions` (Connexions i aplicacions reals, a les assignatures que en porten) → valida i lliura.
4. **Missatge final:** tanca amb la llista dels PDFs generats i el nombre de pàgines de cadascun.

## Quan llegir cada fitxer (`references/`)

Llegeix **només** els fitxers de `references/` que necessitis per al document actual:

| Document o tasca | Fitxer a llegir abans d'escriure |
| --- | --- |
| Marca, colors, símbols i estructura comuna | `references/marca-i-format.md` |
| To pedagògic i escriptura humana | `references/escriptura.md` |
| Particularitats de l'assignatura (Mates, Llengües, Ciències…) | `references/assignatures.md` |
| Climogrames i vistes ortogonals en SVG | `references/plantilles-svg.md` |
| 1. Resum d'estudi (`resum`) | `references/resum.md` |
| 2. Esquema visual (`esquema`) | `references/esquema.md` |
| 3. Examen (`examen`) | `references/examen.md` |
| 4. Full de respostes (`respostes`) | `references/respostes.md` |
| 5. Preguntes orals (`orals`) | `references/orals.md` |
| 6. Connexions (`connexions`) | `references/connexions.md` |
| Llibres de lectura (`Resum llibre`) | `references/llibres.md` |

## Com cridar `scripts/bonanota_pdf.py`

El model escriu **només el contingut HTML interior** (sense `<html>`, `<head>` ni `<style>`), utilitzant exclusivament les classes d'`assets/base.css`. Mai escriguis CSS nou dins el document, tret d'un ajust puntual justificat.

### Per línia d'ordres
```bash
python3 skills/bona-nota/scripts/bonanota_pdf.py \
  --html-file /tmp/contingut_resum.html \
  --tipus resum \
  --assignatura "Mates" \
  --tema "Tema 4: Les fraccions" \
  --outdir ./sortida_pdfs
```

### Importat des de Python
```python
from bonanota_pdf import genera_pdf

resultat = genera_pdf(
    body_html=html_contingut,
    tipus="resum",               # resum | esquema | examen | respostes | orals | connexions
    assignatura="Mates",
    tema="Tema 4: Les fraccions",
    outdir="./sortida_pdfs",
)
```

### Què fer amb l'informe de l'script
- Si l'informe indica `OK`, l'HTML temporal s'esborra sol i el PDF + les captures PNG de la primera i l'última pàgina (60 ppp) queden llestos.
- Si per a `esquema` l'script informa `ERROR: La pàgina X desborda, sobren ~N paraules` (després d'haver provat automàticament de baixar 1 pt la lletra), **no entris en bucle compilant el mateix text**: retalla aproximadament `N` paraules de les targetes i torna a cridar l'script una sola vegada.
