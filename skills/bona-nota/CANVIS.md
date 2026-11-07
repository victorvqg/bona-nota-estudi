# Resum de canvis — Bona Nota modular (n2446 · g4)

## 1. Què ha canviat
- **Estructura modular**: s'ha passat d'instruccions monolítiques i 13 fitxers `skill_bona-nota-*.md` dispersos a una sola habilitat autocontinguda `bona-nota/` amb un `SKILL.md` de **95 línies**, 11 fitxers de referència sota demanda (`references/`), full d'estil unificat (`assets/base.css`) i script empaquetador/validador (`scripts/bonanota_pdf.py`).
- **Pas 0 (deduir abans de preguntar)**: l'habilitat llegeix el títol/capçalera de les fotos o apunts, dedueix assignatura, tema, curs i llengua, ho confirma en una sola línia i comença sense interrompre l'usuari (tret que falti el material, hi hagi barreja de temes o dubte real d'idioma).
- **Flux en dues fases (un document per crida)**:
  - *Fase 1*: `resum` → `esquema`.
  - *Fase 2*: `examen` → `respostes` → `orals` → `connexions`.
  - Pausa entre fases només si el material supera 6 pàgines de llibre, el resum supera 10 pàgines o l'usuari ho demana.
- **Plantilla CSS (`assets/base.css`) i script (`scripts/bonanota_pdf.py`)**: el model només escriu el cos HTML amb les classes semàntiques; l'script hi afegeix capçalera, peu numerat `1 / N`, marca «Bona Nota», compila amb WeasyPrint, valida `%PDF-` (> 1 KB), pàgines i paraules, fa 1 sol intent a `9 pt` si l'esquema desborda i informa de quantes paraules sobren sense entrar en bucle.

## 2. On ha anat cada mòdul antic
| Mòdul antic (`skill_bona-nota-*.md`) | Ubicació nova a `bona-nota/` |
| --- | --- |
| Instruccions generals del projecte | `SKILL.md` + `references/marca-i-format.md` |
| `bona-nota-resum-estudiable` | `references/resum.md` |
| `bona-nota-esquema-visual` | `references/esquema.md` + `assets/base.css` (`.doc-esquema`) |
| `bona-nota-examen` | `references/examen.md` |
| `bona-nota-solucionari` | `references/respostes.md` |
| `bona-nota-preguntes-orals` | `references/orals.md` |
| `bona-nota-connexions` | `references/connexions.md` |
| `bona-nota-comprensio-lectora` | `references/llibres.md` |
| `bona-nota-assignatures` | `references/assignatures.md` |
| `bona-nota-llengua-seccio-f` | Fusionat dins `references/assignatures.md` (apartat 2) |
| `bona-nota-escriptura-humana` | `references/escriptura.md` |
| `bona-nota-pdf` | `references/marca-i-format.md` + `assets/base.css` + `scripts/bonanota_pdf.py` |
| `bona-nota-svg-mates` | **Retirat**: substituït per l'habilitat `bona-nota-figures-mates` (citat a `references/assignatures.md`) |
| `bona-nota-svg-plantilles` | `references/plantilles-svg.md` (climogrames i vistes ortogonals) |

## 3. Com instal·lar-ho
1. **A claude.ai (Projecte o Skills)**: puja el fitxer `skills/bona-nota.zip` com a habilitat d'usuari (o copia la carpeta `skills/bona-nota/`).
2. **A Claude Code / entorn local**: la carpeta `skills/bona-nota` ja és dins el repositori i enllaçada a `~/.claude/skills/bona-nota`. Cal tenir `weasyprint` instal·lat (`pip install weasyprint --break-system-packages`).
