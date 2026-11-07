# 2. Esquema visual / pòster de repàs ràpid (`esquema`)

## Objectiu i calibratge real amb WeasyPrint (`Millora 5`)
L'esquema visual és un **pòster de repàs d'última hora** pensat per veure tot el tema d'un cop d'ull en **1 pàgina** (o **màxim 2 pàgines** en temes molt llargs).

### Disseny calibrat amb `assets/base.css`
- **Format**: A4 vertical, lletra base `10pt` (`.doc-esquema`), graella de **2 columnes** (`.graella-esquema`).
- **Màxim de targetes per pàgina**: **6 targetes** (distribució **2 × 3**: 2 columnes per 3 files) quan la pàgina inclou la franja de títol i el bloc final de trucs/checklist. (Si només hi ha 4 blocs temàtics, fes una graella **2 × 2** de 4 targetes).
- **Pressupost estricte de text per targeta (`.targeta`)**:
  - **Màxim 35 paraules per targeta** en total:
    - Títol curt (`<h3>`).
    - 1 o 2 frases telegràfiques amb la regla o definició.
    - 1 exemple concret en una sola línia.
- **Elements complementaris de la pàgina (fora de les 6 targetes)**:
  - Franja de títol compacta (`.franja-titol`).
  - 1 requadre compacte `.alerta` amb els **3 errors típics d'examen** (màxim 40 paraules en total).
  - 1 requadre compacte `.checklist` amb **4–5 punts de comprovació** abans d'entrar a l'examen (màxim 40 paraules en total).
- **Prohibit posar figures SVG grans a l'esquema visual**: l'esquema és 100% HTML/CSS compacte perquè no desbordi mai.

### Comportament en cas de desbordament (`bonanota_pdf.py`)
- Si el document supera el nombre de pàgines previst (`max_pagines=1` per defecte, o `2` si el tema té més de 6 apartats), `bonanota_pdf.py` fa **UN sol intent automàtic** reduint la lletra 1 pt (`9pt`, classe `.esquema-compacte`).
- Si tot i així desborda, l'script **no entra en bucle**: s'atura i informa quina pàgina desborda i quantes paraules sobren aproximadament (`ERROR: La pàgina X desborda, sobren ~N paraules`). Retalla aquest nombre de paraules de les targetes i torna a executar l'script una sola vegada.
