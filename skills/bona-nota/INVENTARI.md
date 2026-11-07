# Inventari de regles i mòduls de Bona Nota (n2446)

Llista numerada de totes les regles pedagògiques, d'estil, d'assignatura i de format que abans estaven repartides entre les instruccions del projecte i els 13 fitxers `skill_bona-nota-*.md`, amb la seva ubicació nova o el motiu de retirada.

## 1. Instruccions generals i flux de treball
1. **Identitat i propòsit de Bona Nota (paquet de 6 PDFs per a 1r ESO)** → `SKILL.md` (secció inicial) i `references/marca-i-format.md`.
2. **Deducció d'assignatura, tema, curs i llengua abans de preguntar (Pas 0)** → `SKILL.md` («Pas 0 · Deduir abans de preguntar»).
3. **Regla de llengua segons l'assignatura (Castellano → castellà; Anglès → contingut EN + explicacions CA; resta → català)** → `SKILL.md` (Pas 0.4) i `references/assignatures.md`.
4. **Examen mixt per defecte sense preguntar** → `SKILL.md` (Pas 0.5) i `references/examen.md`.
5. **Excepció del Pas 0 per al prompt «Resum llibre»** → `SKILL.md` (Pas 0.6) i `references/llibres.md`.
6. **Flux de generació en dues fases (Fase 1: resum + esquema; Fase 2: examen + respostes + orals + connexions), un document per crida** → `SKILL.md` («Flux en dues fases»).
7. **Pausa condicional entre Fase 1 i Fase 2 (> 6 pàgines de llibre, resum > 10 pàgines o petició explícita)** → `SKILL.md` («Flux en dues fases», punt 2).
8. **Fidelitat estricta a les fonts aportades (llibre i apunts del professor) i avís quan falta una dada (`NO CONSTA AL LLIBRE` / `.avis-profe`)** → `references/resum.md` i `references/llibres.md`.

## 2. Mòduls de tipus de document (abans `skill_bona-nota-*.md`)
9. **`bona-nota-resum-estudiable`** (cobertura 100% del tema, estructura per apartats, requadres `.idea`, `.avis-profe`, `.truc`, `.alerta`, `.exemple`, `.checklist`, glossari i autoavaluació, 6–14 pàgines) → `references/resum.md`.
10. **`bona-nota-esquema-visual`** (pòster d'1–2 pàgines, graella de 2 columnes amb màxim 6 targetes per pàgina, pressupost màxim de 35 paraules per targeta: títol + 1-2 frases + exemple, franja de títol, avís d'errors típics, trucs de memòria i checklist final) → `references/esquema.md` i `assets/base.css` (`.doc-esquema`).
11. **`bona-nota-examen`** (examen mixt sobre 10 punts: test 20–30%, desenvolupament 30–40%, problemes/aplicació 30–40%, pautes de puntuació visibles i espai per respondre, 2–4 pàgines) → `references/examen.md`.
12. **`bona-nota-solucionari`** (full de respostes pas a pas, justificació de per què les altres opcions del test són falses, rúbrica de correcció amb punts parcials i errors típics que resten punts, 2–5 pàgines) → `references/respostes.md`.
13. **`bona-nota-preguntes-orals`** (bateria graduada en 3 nivells — escalfament, domini i nota alta — amb resposta esperada curta perquè el pare/mare pugui prendre la lliçó en 10 minuts, 1–3 pàgines) → `references/orals.md`.
14. **`bona-nota-connexions`** (per a què serveix el tema a la vida quotidiana, connexions amb altres assignatures i curiositats verificables del temari, 1–2 pàgines) → `references/connexions.md`.
15. **`bona-nota-comprensio-lectora`** (tractament dels 7 documents d'extracció de NotebookLM per a llibres de lectura: fitxa esquemàtica, resum narratiu immersiu capítol a capítol i examen + solucionari amb cites literals) → `references/llibres.md`.

## 3. Mòduls d'assignatures, llengua i to
16. **`bona-nota-assignatures`** (regles específiques per a Mates, Ciències Socials, Biologia i Geologia, Tecnologia, Emprenedoria, Anglès, Plàstica, Educació Física i Música) → `references/assignatures.md`.
17. **`bona-nota-llengua-seccio-f`** (estructura de Llengua Catalana i Lengua Castellana: comprensió, expressió, gramàtica, ortografia, lèxic, literatura i la Secció F d'anàlisi morfosintàctica/textual guiada) → Fusionat dins `references/assignatures.md` (apartat «Llengua Catalana i Lengua Castellana · Secció F»).
18. **`bona-nota-escriptura-humana`** (to de tutor proper per a 12 anys, frases directes, exemples propers, prohibició de tòpics robòtics i falques buides) → `references/escriptura.md`.

## 4. Mòduls de PDF, CSS i figures SVG
19. **`bona-nota-pdf`** (configuració A4 WeasyPrint, capçalera i peu amb numeració «1 / N», marca «Bona Nota», paleta semàntica, prohibició d'emojis en color, símbols monocroms DejaVu Sans, regles anti-orfes i validació obligatòria del PDF) → Repartit entre `references/marca-i-format.md`, `assets/base.css` i `scripts/bonanota_pdf.py`.
20. **`bona-nota-svg-mates`** (dibuix manual de figures geomètriques en SVG) → **RETIRAT** (Millora 1 de `n2446`): substituït íntegrament per l'habilitat externa ja instal·lada `bona-nota-figures-mates` (`scripts/figures.py`). Referenciat a `references/assignatures.md` (apartat Mates).
21. **`bona-nota-svg-plantilles`** (plantilles SVG per a climogrames amb regla de Gaussen `P = 2T` i vistes ortogonals alçat/planta/perfil de Tecnologia) → `references/plantilles-svg.md`.
