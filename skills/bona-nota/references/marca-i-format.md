# Marca, colors semàntics i format comú (`base.css`)

## 1. Identitat visual «Bona Nota»
- **Capçalera de pàgina** (posada automàticament per `bonanota_pdf.py`):
  - Esquerra: `BONA NOTA · [ASSIGNATURA] · [CURS]`
  - Dreta: `[TEMA] · [TIPUS DE DOCUMENT]`
- **Peu de pàgina** (automàtic via `@page` a `assets/base.css`):
  - Esquerra: `Bona Nota — Material d'estudi 1r ESO`
  - Dreta: numeració `1 / N` (`counter(page) " / " counter(pages)`).
- **Nom de fitxer**: `[assignatura]_[tema]_[tipus].pdf` en minúscules i sense accents ni espais (generat per `bonanota_pdf.py`).

## 2. Tipografia i símbols (limitacions de WeasyPrint)
- Font base: `DejaVu Sans, Arial, sans-serif` (`10.5pt` al cos general; `10pt` a l'esquema visual).
- **Prohibit usar emojis en color** dins l'HTML o els SVG (WeasyPrint no els renderitza o deixa quadradets buits).
- Fes servir **exclusivament símbols Unicode monocroms** de DejaVu Sans:
  - Idea clau / definició: `★` o `◆`
  - Avís del professor / examen: `▸` o `✦`
  - Truc de memòria: `💡` → substitueix sempre per `◈` o `[TRUC]`
  - Alerta / error típic: `⚠` o `✗`
  - Correcte / checklist: `✓` o `☐`
  - Fórmula / geometria: `△`, `·`, `÷`, `≈`, `≠`, `≤`, `≥`, `²`, `³`, `π`, `√`

## 3. Paleta de colors semàntics (variables CSS a `base.css`)
`bonanota_pdf.py` assigna la classe d'assignatura al `<body>`, que defineix `--c1` (fosc), `--c2` (principal), `--c3` (accent) i `--c-suau` (fons clar):
- **Mates** (`.assig-mates`): `--c1: #134e4a; --c2: #0d9488; --c3: #84cc16; --c-suau: #f0fdfa`
- **Socials** (`.assig-socials`): `--c1: #0c4a6e; --c2: #0284c7; --c3: #38bdf8; --c-suau: #f0f9ff`
- **Bio i Geo** (`.assig-biogeo`): `--c1: #3b0764; --c2: #7c3aed; --c3: #c084fc; --c-suau: #faf5ff`
- **Català** (`.assig-catala`): `--c1: #1e1b4b; --c2: #4338ca; --c3: #fbbf24; --c-suau: #eef2ff`
- **Castellano** (`.assig-castellano`): `--c1: #7f1d1d; --c2: #dc2626; --c3: #f59e0b; --c-suau: #fef2f2`
- **Anglès** (`.assig-angles`): `--c1: #1e3a8a; --c2: #2563eb; --c3: #60a5fa; --c-suau: #eff6ff`
- **Tecnologia** (`.assig-tecnologia`): `--c1: #7c2d12; --c2: #ea580c; --c3: #fb923c; --c-suau: #fff7ed`

## 4. Classes HTML disponibles a `assets/base.css`
No escriguis mai etiquetes `<style>` pròpies. Construeix tot el contingut amb aquestes classes:
- `<div class="franja-titol"><h1>...</h1><p class="subtitol">...</p></div>`: portada interior a dalt de la pàgina 1.
- `<div class="idea"><strong>★ Idea clau:</strong> ...</div>`: definició o concepte fonamental (vora blava/color d'assignatura).
- `<div class="avis-profe"><strong>▸ El profe hi insisteix:</strong> ...</div>`: punt destacat als apunts de classe o possible pregunta d'examen (vora ambre).
- `<div class="truc"><strong>◈ Truc per recordar-ho:</strong> ...</div>`: regla mnemotècnica o drecera mental (vora verda).
- `<div class="alerta"><strong>⚠ Error típic (no hi caiguis!):</strong> ...</div>`: confusió habitual dels alumnes de 1r d'ESO i com evitar-la (vora vermella).
- `<div class="formula-clau"><strong>△ Fórmula clau:</strong> ...</div>`: fórmula matemàtica o científica destacada.
- `<div class="exemple"><strong>Exemple resolt pas a pas:</strong> ...</div>`: aplicació pràctica guiada.
- `<div class="checklist"><h3>✓ Comprova si ja ho saps</h3><ul><li>☐ ...</li></ul></div>`: llista d'autoavaluació.
- `<table class="taula-bn">...</table>`: taula comparativa amb capçalera acolorida.
- `<div class="svg-container">...<div class="svg-caption">Fig. 1 — ...</div></div>`: contenidor centrat per a figures SVG.
