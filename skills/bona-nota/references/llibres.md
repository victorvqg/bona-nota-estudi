# Llibres de lectura i comprensió lectora (`Resum llibre`)

Quan l'usuari invoca el prompt final **«Resum llibre»** del flux `llibre-notebooklm-bonanota`, no apliquis el Pas 0 (el prompt ja indica títol, curs 1r ESO, idioma i carpeta de Drive `Extracció dades - [TÍTOL]` amb els 7 documents `01_Extraccio` a `07_Control`).

## Regles d'or per als llibres de lectura
1. **Fidelitat absoluta a les 7 fonts**: no afegeixis res de memòria externa sobre el llibre o l'autor.
2. **Control d'incerteses (`07_Control`)**: on les fonts diguin `NO CONSTA AL LLIBRE` o assenyalin un dubte, posa un requadre `.avis-profe` indicant-ho i demana el fragment a l'usuari si és essencial.
3. **Cites literals**: sempre en la llengua original del llibre, entre cometes `«…»` i indicant el capítol.

## Els 3 PDFs del paquet de llibre (un per crida amb `bonanota_pdf.py`)
1. **Fitxa esquemàtica (`tipus="esquema"` o `"fitxa"`)**:
   - Fitxa tècnica, estructura en parts/capítols, mapa de personatges (principals i secundaris amb paper, evolució i cita), espai i temps, temes i valors, i cronologia.
2. **Resum narratiu immersiu (`tipus="resum"`)**:
   - Argument complet **capítol a capítol**, sense saltar-ne cap, amb els fets concrets, personatges, objectes/dades clau, com acaba cada capítol i vocabulari en context.
3. **Examen de lectura + solucionari (`tipus="examen"` i `"respostes"`)**:
   - Preguntes de comprensió literal, inferencial (amb «Com ho deduïm»), personatges, valoració personal justificada, test de 15 preguntes i «Qui ho diu?», seguides del solucionari amb capítol i cita literal.
