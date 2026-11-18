# Pla mestre · Millorar els mons de Socials

18/11/2026 · Revisió dels dos mons de Ciències socials:
- **Tema 3: El clima** (`motor/dades/socials.js`, `sociales/t3-clima`): 10 temes, 6 del llibre i 4 d'apunts de l'Anoia.
- **Les comarques de Catalunya** (`motor/dades/comarques.js` + `motor/eines/mapa-comarques.js`, `sociales/comarques`): 7 temes.

He comptat el contingut i he fet captures a 390 px de la llista de jocs, del climograma, de «Troba l'error al climograma», d'una fitxa de cada món, del mapa de les 43 comarques i de «Capses dins de capses».

**En poques línies.** Tots dos mons tenen un bon test (80 i 56 preguntes) i una peça estrella: **el mapa interactiu de les 43 comarques** (5 modes, amb repàs dels errors) i **el climograma de Girona**. Però són els mons amb **menys pràctica**:
- **Cap joc de frases amb buits** en tots dos mons. Tampoc hi ha cap explicació de per què una opció és dolenta, ni cap esquema a la teoria, ni cap botó «Practica-ho com a classe».
- **Clima:** només 5 jocs per a 10 temes, sense grups a la pantalla de jocs. No hi ha res per **calcular** amb un climograma (mitjana, amplitud tèrmica, pluja total), per **dibuixar-ne** un, ni per llegir un **mapa del temps** (anticicló, borrasca, isòbares). Els 4 temes de l'Anoia no tenen cap joc.
- **Comarques:** les fitxes de cada demarcació són una llista llarga de noms **sense el mapa**, tot i que el món ja en té un. Les capitals que més es confonen (Manresa, Vic, Sant Feliu de Llobregat, Sort, Tremp…) surten com a «Compte», però no hi ha cap joc per escriure-les.

Proposo aprofitar tot el que ja funciona als altres mons:
- frases amb buits amb el perquè de cada error;
- el taller de mates, per calcular amb els climogrames;
- esquemes dibuixats a la teoria.

I tres peces pròpies de Socials: **el mapa a cada fitxa de comarques**, **construir un climograma** i **llegir un mapa del temps**. Són 6 fases, i al final hi ha 6 decisions.

---

## 1. Com és ara

| | El clima | Les comarques |
|---|---|---|
| Temes | 10 (6 llibre + 4 Anoia) | 7 |
| Test | 80 preguntes | 56 preguntes |
| Obertes | 15 | 7 |
| Jocs | 5: Ordena les capes, Llegeix el climograma, Aparell i unitat, Temps o clima?, Troba l'error al climograma | 7: MAPA (5 modes), Comarca i capital, Capital o comarca?, Girona o Lleida?, Tarragona i l'Ebre, Ruta cap a la platja, Capses dins de capses |
| Frases amb buits | **0** | **0** |
| Jocs agrupats a la pantalla | **No** (sense `grup`) | No |
| Esquemes a la teoria | 0 | 0 (i el mapa no surt a les fitxes) |
| «Practica-ho com a classe» | 0 temes | 0 temes |
| Temes sense cap joc propi | Pressió i vent, mapes del temps, canvi climàtic i els 4 de l'Anoia | Què és una comarca, Trucs i paranys |

Del que ja funciona bé, no ho toquem:
- **El mapa de les 43 comarques**: Explora, On és?, Capital, De qui és? i Contrarellotge, filtre per demarcació i repàs dels errors.
- **El climograma dibuixat**, amb preguntes de lectura i «Troba l'error».

---

## 2. Proposta per al món del clima

### A · Frases amb buits (5 jocs, uns 50 ítems)
Un joc per a cada parell de temes:
- **Temps o clima i l'atmosfera:** capes, gasos i funcions.
- **Elements i factors del clima:** latitud, altitud, distància al mar…
- **Pressió, vent i mapes del temps:** «Si la pressió és alta, hi ha un ___ i fa bon temps».
- **Efecte d'hivernacle i canvi climàtic.**
- **L'Anoia:** relleu, riu, clima d'Igualada i paisatge.

Cada opció falsa porta el seu `per`, i on una paraula decideix la resposta, `clau`. Per exemple:
- «*Borrasca*: amb pressió baixa l'aire puja i plou. Amb pressió alta hi ha un **anticicló**.»
- «*Ozó*: la capa d'ozó no escalfa la Terra; l'efecte d'hivernacle el fan el CO₂ i el vapor d'aigua.»

### B · «Calcula amb el climograma» (taller, amb números nous cada vegada)
- Reaprofita el taller de mates (`motor/eines/exercicis-mates.js`) amb un generador nou, `climograma`. Fa un climograma amb dades noves i hi fa preguntes pas a pas:
  - el mes més calorós i el més fred;
  - l'**amplitud tèrmica** (màxima − mínima);
  - la **temperatura mitjana anual**;
  - la **precipitació total**;
  - quin **tipus de clima** és (mediterrani, de muntanya…).
- Les mateixes pistes en 3 graons i la mateixa explicació dels errors típics que a Mates. Per exemple: «Has sumat les temperatures, però l'amplitud és la resta».
- Al costat, un **climograma dibuixat** amb la barra o el punt del mes que toca marcat.

### C · «Construeix el climograma»
- Es dona una taula de 12 mesos (temperatura i precipitació). El nen puja i baixa cada barra (pluja) i cada punt (temperatura) amb ＋ i −, i en acabar es comprova.
- Primer, Igualada (dades dels apunts); després, Girona i una ciutat de muntanya.
- **Comparar dos climogrames**: Igualada o Girona? On plou més? On fa més fred a l'hivern?

### D · «Llegeix el mapa del temps»
- Un mapa SVG senzill de la península amb isòbares, una **A** (anticicló) i una **B** (borrasca).
- Preguntes tocant el mapa:
  - on fa bon temps;
  - on plou;
  - cap on bufa el vent (de l'A cap a la B);
  - on bufa més fort (on les isòbares estan més juntes).
- Diversos mapes, amb la A i la B en llocs diferents.

### E · Esquemes a la teoria
- **Les capes de l'atmosfera:** columna amb altituds (troposfera, estratosfera amb l'ozó, mesosfera, termosfera).
- **Anticicló i borrasca:** dues caixes amb pressió, aire, temps i símbol.
- **Elements i factors del clima:** en dues columnes.
- **L'efecte d'hivernacle:** sol → Terra → calor retinguda pels gasos.

---

## 3. Proposta per al món de les comarques

### F · El mapa a cada fitxa
- A la fitxa de cada demarcació (Barcelona, Girona, Lleida, Tarragona) surt el mapa amb aquella demarcació pintada, els números de les comarques i les capitals.
- En tocar el nom d'una comarca del text, s'il·lumina al mapa.
- Fa servir el mateix dibuix del joc MAPA (`motor/eines/mapa-comarques.js`), com a vista de la teoria.

### G · Frases amb buits (3 jocs, uns 36 ítems)
- **«Escriu la capital»:** «La capital del Bages és ___» → *Manresa*. El `per` explica els errors típics: «*Vic* és d'Osona», «*Sabadell i Terrassa* són les dues capitals del Vallès Occidental».
- **«De quina demarcació és?»:** «El Solsonès és de la demarcació de ___», amb el `per` dels paranys (Solsonès, Cerdanya, Berguedà…).
- **«Comarca o capital?» en frases:** «Vaig a Vic, la capital d'___».

### H · Paranys i esquemes
- **«Els paranys»**, un joc de triar fet només amb les capitals que no són la ciutat més gran:
  - Sant Feliu de Llobregat (no Cornellà);
  - Sort, Tremp, la Seu d'Urgell;
  - Falset, Gandesa…
- **Esquemes a les fitxes:**
  - «Capses dins de capses» (municipi → comarca → vegueria / demarcació → Catalunya);
  - la taula de les 4 demarcacions amb el nombre de comarques (13 · 8 · 12 · 10);
  - les comarques amb dues capitals o amb una capital que costa de recordar.

### I · El mapa, encara millor
- **Repàs del mapa**: les comarques fallades al mapa ja van al repàs dels errors (`mpRepAnota`). Abans de fer res, cal comprovar com es presenten al repàs: si no es fa tocant el mapa, proposo que el repàs del mapa es faci **al mapa**, tocant la comarca.
- **Veïnes (opcional):** «Toca les comarques que toquen el Bages». Ajuda a recordar-ne la posició.

---

## 4. Per a tots dos mons

- **`grup` a tots els jocs.** La pantalla de jocs els ensenya agrupats (✍️ Frases amb buits · 📊 Climogrames · 🗺️ Mapes · 🎮 Jocs ràpids).
- **`practica` a cada tema**, perquè surti «✏️ Practica-ho com a classe».
- **Proves:**
  - la prova estricta juga els jocs nous;
  - `prova-generadors.js` prova el generador `climograma` (mitjana i amplitud ben calculades);
  - `revisa-mon.js` revisa tots dos mons.

---

## 5. Fases

| Fase | Què | Toca | Mida |
|---|---|---|---|
| **1** | Frases amb buits: 5 jocs al clima i 3 a les comarques, amb `per`, `clau`, `grup` i `practica` | `socials.js`, `comarques.js` | M |
| **2** | Clima: «Calcula amb el climograma» (generador `climograma` al taller, amb vista del climograma marcat) | `exercicis-mates.js` o eina nova, `socials.js` | M |
| **3** | Clima: «Construeix el climograma» i «Compara dos climogrames» | eina nova `climograma.js` | M |
| **4** | Clima: «Llegeix el mapa del temps» | eina nova (SVG) | M |
| **5** | Comarques: mapa a cada fitxa de demarcació, «Els paranys», esquemes i el repàs al mapa | `mapa-comarques.js`, `comarques.js`, plantilla (poc) | M |
| **6** | Esquemes del clima, `MONS.md`, `ESTAT.md`, `CHANGELOG.md` i versió | dades, docs | S |

Totes passen `python3 motor/tot.py`, `node motor/revisa-mon.js socials comarques`, `node motor/prova-tot.js base` i la prova de mons de `sociales/t3-clima` i `sociales/comarques`.

**Criteris de fet:**
- Tots dos mons tenen frases amb buits, i en fallar surt per què.
- Es pot calcular l'amplitud tèrmica d'un climograma nou, amb pistes i amb els errors típics explicats.
- La fitxa de la demarcació de Barcelona ensenya el mapa amb les seves 13 comarques.
- Tots els temes tenen almenys un joc per practicar.

---

## 6. Decisions que has de prendre

1. **«Calcula amb el climograma»:** reaprofitem el taller de mates (teclat, pistes en 3 graons, Mira / Completa / Tot sol) o un joc més senzill de triar? *Recomano el taller: ja és pas a pas i explica els errors.*
2. **«Construeix el climograma»:** amb botons ＋ i − (precís, va bé al mòbil) o arrossegant les barres amb el dit? *Recomano ＋ i −, i arrossegar més endavant si cal.*
3. **Mapa del temps:** un sol mapa amb preguntes o diversos mapes amb la A i la B en llocs diferents? *Recomano 4 o 5 mapes diferents, perquè no s'aprenguin la resposta de memòria.*
4. **Mapa a les fitxes de comarques:** a les 4 fitxes de demarcació o també a «Què és una comarca» (Catalunya sencera)? *Recomano a les 5.*
5. **Repàs del mapa al mapa:** el fem ara o ho deixem per més endavant? *Recomano fer-ho ara: és on més s'equivoquen.*
6. **Veïnes del mapa:** ho fem ara o més endavant? *Recomano més endavant.*
