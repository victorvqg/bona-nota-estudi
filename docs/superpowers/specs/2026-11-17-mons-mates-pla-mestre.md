# Pla mestre · Guiar millor els exercicis de Matemàtiques

17/11/2026 · Revisió del món de Matemàtiques (`matematiques/divisibilitat`, dades a `motor/dades/divisibilitat.js`) i de les eines que fan servir tots els mons de mates: el taller (`motor/eines/exercicis-mates.js`), els manipulatius (`motor/eines/manipulatius-mates.js`), el full de brut (`pissarra.js`) i el quadern (`quadern.js`). He fet 48 captures a 390 px de totes les fitxes en els tres modes (👀 Mira, ✍️ Completa i 💪 Tot sol), a mig exercici i després d'una resposta dolenta.

**En poques línies.** El taller ja fa molt: passos com a la llibreta, números nous, pistes i errors típics explicats. El que falla és **com es veu i com acompanya**:

1. Quan s'han fet 4 o 5 passos, la pregunta i el teclat ja no hi caben a la pantalla. Cada pas fet surt dues vegades: en una llista de text i al dibuix.
2. El dibuix (l'escala, la divisió, les potències) **no assenyala on mirar**. No es veu quina xifra baixa, quina fila toca ni quins factors són comuns.
3. La 💡 Pista és **una sola frase de text** i, quan la dones, ja no dona estrella. No hi ha una ajuda petita abans de l'ajuda gran.
4. El mode 👀 Mira **dona la resposta i un text**, però no la ensenya pas a pas sobre el dibuix.
5. Els manipulatius (granotes, rajoles, rectangles) **van a part** del taller: quan el nen s'encalla en un MCM, res no li recorda «pensa en les granotes».

Proposo un **taller visual**: el dibuix de la llibreta passa al centre i s'il·lumina on cal mirar, amb **pistes en 3 graons** (pregunta → dibuix → mig resultat), un **mode Mira animat**, un **teclat compacte** que no amaga la pregunta i **ponts als manipulatius**. Tot va a les eines comunes, perquè els mons de mates que vinguin (fraccions, enters, equacions…) ho tinguin de sèrie. Són 6 fases petites, cada una amb el seu PR, i al final hi ha 6 decisions per prendre.

---

## 1. Com és ara

### 1.1 Què ja funciona bé (no ho toquem)

- Passos com a la llibreta, números nous cada vegada i 3 nivells.
- Els 3 modes (Mira, Completa, Tot sol), «🤔 Per què?» i «🤔 Abans de calcular».
- Errors típics amb missatge propi («1 no és primer: a l'escala només hi van primers»).
- «📒 Així s'escriu a la llibreta» al final, Troba l'error, l'examen sobre 10 i el repàs espaiat.

### 1.2 El que he vist a les captures

| # | On | Què passa | Per què costa |
|---|---|---|---|
| 1 | Totes les fitxes | Al pas 5 o 6 de l'escala, del MCM o de la divisió, la llista «✅ pas → resposta» ocupa mitja pantalla. La pregunta, el teclat i «Comprova» queden a sota del plec, i la barra fixa de baix tapa una fila del teclat fins que fas scroll. | Cal fer scroll a cada pas. El nen perd de vista el dibuix mentre escriu. |
| 2 | Escala (Fitxa 4) | Es veu l'escala, però la fila que toca no es destaca. La regla dels primers (2, 3, 5, 7…) només és a la pista. | No sap quin primer provar ni per què. |
| 3 | Divisió llarga (Fitxa 7) | La «caixa» és correcta, però no hi ha cap color ni fletxa que digui «aquest 4 baixa», «ara mira el 54». | És el pas on més s'encallen a 1r d'ESO. |
| 4 | MCM i MCD (Fitxa 5) | Les descomposicions surten una sota l'altra **sense alinear els primers** (`12 = 2² · 3` / `42 = 2 · 3 · 7`). La regla «comuns amb l'exponent més petit» és un text. | No **veu** quins són comuns ni quin exponent és el petit. |
| 5 | Criteris (Fitxa 1) | «975 acaba en 5» és text. La xifra que mana no es pinta. | El criteri és visual (l'última xifra, la suma de xifres) i no es mostra. |
| 6 | Problemes (Fitxa 6) | Els 4 passos són bons, però «MCM o MCD?» es decideix sense cap imatge. | Al problema és on més confonen MCM i MCD. |
| 7 | 💡 Pista | Un sol text, sempre el mateix. Si la toques, aquell pas ja no dona estrella. | O no ajuda prou o ajuda massa. No hi ha un pas entremig. |
| 8 | En fallar | Missatge de l'error típic, bé. Però el dibuix no reacciona (no marca la fila ni la xifra equivocada). | El missatge diu què està malament, però no on. |
| 9 | 👀 Mira | Ensenya «👉 2» i un text. Al dibuix no passa res fins al pas següent. | És un exemple resolt, però no es veu **com** es fa. |
| 10 | Manipulatius | La recta de les granotes té els números molt petits (fins a 18 en 340 px). Les rajoles demanen la mida abans de veure res. No hi ha cap enllaç cap al taller ni des del taller. | El model visual i l'exercici no es troben mai. |
| 11 | Teoria del tema | És text i llistes, sense cap exemple dibuixat. | La primera trobada amb el concepte no és visual. |

---

## 2. Proposta A · El dibuix al centre (taller visual)

### 2.1 Una pantalla que hi cap

- **Els passos fets es plegen.** En lloc de la llista de text, una línia: «✅ 6 passos fets ▸» (es pot desplegar). El dibuix ja és el registre del que s'ha fet.
- **Ordre fix:** enunciat (curt) → **dibuix** → pregunta del pas → resposta → teclat.
- **Teclat compacte:** menys farciment a les tecles (ara 13 px a dalt i a baix, i tot el teclat fa 4 files) i «Comprova» a l'última fila, al costat del 0, on ara hi ha forats buits. A 360 px, enunciat + dibuix + pregunta + teclat hi han de cabre sense scroll (la prova visual ho comprova).
- **Una barra de passos** a dalt (●●●○○): on soc i quants en queden. Als problemes, amb el nom de cada pas: Dades · Què calculo · Càlcul · Resposta.

### 2.2 El dibuix assenyala (vistes noves)

Cada generador ja té `ctx()`, que pinta l'HTML sobre el pas. Proposo un **registre de vistes** (`MXV`) amb dibuixos reutilitzables que accepten una **marca** (què il·luminar):

| Vista | Fa servir | Què s'il·lumina |
|---|---|---|
| `escala` | Fitxa 4, MCM/MCD, Troba l'error | La fila actual, en groc. Al costat, una tira «2 · 3 · 5 · 7 · 11» amb el primer que s'està provant encerclat. |
| `divisio` | Fitxa 7 | La xifra que baixa (fletxa ↓), el nombre que es mira ara (requadre), el producte que es resta (vermell) i el residu. |
| `potencies` | Fitxa 5 i problemes | Taula alineada per columnes de primers: `2 | 3 | 5 | 7`. Al MCD es pinten les columnes comunes i es tria l'exponent petit; al MCM, totes les columnes amb l'exponent gran. |
| `xifres` | Fitxa 1 | El nombre gran amb l'última xifra (2, 5, 10), les dues últimes, o totes les xifres amb la suma a sota (3, 9). Per l'11, alternes en dos colors. |
| `parelles` | Fitxa 2 (divisors) i 3 (primers) | Divisors per parelles amb arcs: 1·36, 2·18, 3·12, 4·9, 6·6, «ja es repeteix». |
| `recta` | MCM: «Abans de calcular» i problemes | Recta numèrica amb els salts dels dos nombres (granotes en petit). |
| `rajola` | MCD: «Abans de calcular» i problemes | El rectangle amb la quadrícula de la rajola. |

- Les vistes són SVG o HTML amb colors de `var(--…)`. Funcionen en **mode suau** (sense animació) i són **llegibles en blanc i negre**: la marca també és un contorn, no només un color.
- `ctx()` segueix funcionant: els generadors vells, sense canvis, es veuen com ara.

### 2.3 En fallar, el dibuix reacciona

`err(v)` pot tornar, a més del missatge, una **marca** per a la vista. Per exemple, «1 no és primer» encercla l'1 en vermell a la tira de primers, i «54 − 48 = 6, no 4» pinta la resta a la divisió. Al segon error, com ara, ensenya la resposta, però **dibuixada al lloc** (en taronja) i no només en text.

---

## 3. Proposta B · Pistes en 3 graons

| Graó | Què fa | Estrella del pas |
|---|---|---|
| 💡 1 · Pregunta guia | Una pregunta que fa pensar: «L'últim nombre de l'escala, 35, acaba en 5. Quin criteri ho diu?» | Es manté |
| 💡💡 2 · Mira el dibuix | Il·lumina al dibuix on mirar (la fila, la xifra, les columnes comunes) | Mitja: no paga, però el pas compta com a encert al registre i al combo |
| 💡💡💡 3 · Mig resultat | Ensenya la meitat del càlcul: «105 : 3 = 3_», «2² · 3 = 4 · …» | No paga i el pas va al repàs, com ara |

- Camps nous a cada pas: `pistes:[p1, p2, p3]` (`p2` pot ser una marca de vista). Si un pas només té `pista`, val com a graó 3, que és el comportament d'ara.
- **Automàtic quan es pot:** l'escala, la divisió i el MCM/MCD tenen graons generats pel motor (la fila, la xifra, les columnes). Així no cal escriure 3 pistes a cada generador.
- **Filtre de `docs/BON-US.md` §6:** premia aprendre (l'ajuda petita no castiga, la gran no paga) ✅ · sense topall nou ✅ · sense atzar ✅ · funciona en mode suau i sense so ✅ · no guarda res nou, més enllà del graó en el registre que ja hi ha ✅.

---

## 4. Proposta C · 👀 Mira animat i «Ara tu»

- **Mira pas a pas sobre el dibuix:** a cada pas es veu primer la pregunta, després la marca al dibuix (la fila, la xifra) i, en tocar, la resposta escrita al lloc, amb l'explicació a sota. És el mateix flux, però al dibuix.
- **«Ara tu» pas a pas (nou mode intermedi, opcional):** el mateix exercici del Mira, tornat a fer pel nen amb el dibuix buit. Serveix per passar de «ho he vist» a «ho sé fer» amb números que ja coneix.
- **Completa** guanya la barra de passos: els primers passos surten en gris («ja fets») al dibuix, no en una llista.

---

## 5. Proposta D · Ponts entre el que es toca i el que s'escriu

- **Del taller al manipulatiu:** a «🤔 Abans de calcular» del MCM, la vista `recta` (granotes en petit) i, a sota, «🐸 Vull veure-ho amb les granotes» obre el manipulatiu amb **els mateixos números** i torna a l'exercici. Igual el MCD amb les rajoles, els divisors amb els rectangles i l'escala amb l'arbre.
- **Del manipulatiu al taller:** en acabar una ronda, «✏️ Ara fes-lo com a classe» obre la fitxa amb aquells números, com ja fa l'escala de 792.
- **Manipulatius més clars:**
  - **Granotes:** la recta es fa més ampla i fa scroll (números a 14 px), amb els salts dibuixats com a arcs de colors i els punts on cau cada granota marcats.
  - **Rajoles:** primer es veu el terra amb la quadrícula, i en tocar una mida es veu com hi encaixa o on sobra.
  - **Rectangles:** en trobar una parella, aquesta s'apunta a la vista `parelles`.
- **Problemes amb imatge:** al pas «Què he de calcular?», segons el context (trens, fars, autobusos → `recta`; rajoles, grups, caixes → `rajola`), la vista surt petita i ajuda a decidir sense dir-ho.

---

## 6. Proposta E · Teoria amb exemples dibuixats

- Camp nou opcional `T[i].vista:{tipus:"escala",n:60}`: la fitxa del tema pinta un exemple amb la mateixa vista del taller (i la 💡 de cada punt pot il·luminar-ne una part).
- Al tema de MCM/MCD, la taula `potencies` amb el mateix exemple de la teoria. Al de criteris, `xifres`.
- Les targetes poden portar `vista` al revers, per a 3 o 4 targetes per tema.

---

## 7. Per a tots els mons de mates (els que vindran)

- Les vistes, els graons de pista i la pantalla compacta són a `motor/eines/exercicis-mates.js`, amb un fitxer nou `motor/eines/vistes-mates.js` per a les vistes. Un món nou de mates els té només incloent les eines.
- Les vistes es pensen perquè serveixin per als temes que vindran: `recta` (enters, fraccions a la recta), `potencies` (potències i arrels), `rajola` (àrees, fraccions com a part d'un tot), `divisio` (decimals).
- **Guia per a mons de mates nous:** `docs/MON-MATES.md`, com `docs/MON-ANGLES.md`. Hi haurà com s'escriu un generador amb `pistes`, `vista` i `marca`, quines vistes hi ha i la llista de comprovació.
- **Proves:**
  - `mxProva` també juga cada fitxa amb **un error a cada pas** i comprova que la vista rep la marca.
  - La prova visual mira a 360 px que la pregunta i el «Comprova» es vegin sense scroll al pas més llarg de cada fitxa.
  - `motor/prova-vistes-mates.js` (nova) pinta cada vista amb casos límit: un sol primer, exponents grans, una divisió amb un zero al quocient.

---

## 8. Fases

Cada fase és una branca i un PR, i abans del PR passen `python3 motor/tot.py`, `node motor/prova-tot.js base` i la prova de mons de `matematiques/divisibilitat`.

| Fase | Què | Toca | Mida |
|---|---|---|---|
| **1** | Pantalla compacta: passos plegats, barra de passos, teclat compacte, ordre enunciat → dibuix → pregunta. Prova visual sense scroll a 360 px | `exercicis-mates.js`, `prova-visual.js` | M |
| **2** | Vistes amb marca: `escala`, `divisio`, `potencies`, `xifres` (registre `MXV`) i marca en fallar | `vistes-mates.js` nou, generadors | L |
| **3** | Pistes en 3 graons (automàtiques a escala, divisió i MCM/MCD; a mà a criteris, primers i problemes) | `exercicis-mates.js`, generadors | M |
| **4** | 👀 Mira animat sobre el dibuix i Completa amb passos en gris | `exercicis-mates.js` | S |
| **5** | Ponts: `recta`, `rajola` i `parelles`; manipulatius amb els mateixos números i d'anada i tornada; granotes i rajoles més clares | `manipulatius-mates.js`, `vistes-mates.js` | M |
| **6** | Teoria i targetes amb `vista`, `docs/MON-MATES.md`, `MONS.md`, `ESTAT.md`, `CHANGELOG.md` i versió MENOR | dades, docs | S |

Ordre recomanat: **1 → 2 → 3**, que és el gruix de «guiar millor i veure-ho millor». Després **4 → 5 → 6**.

**Criteris de fet:**
- A 360 px, el pas 6 de l'escala de 420 es veu sencer (dibuix, pregunta i teclat) sense scroll.
- A la divisió 2.148 : 16, en preguntar «Baixa la xifra següent», el 8 té una fletxa i el 6 de dalt, un requadre.
- Al MCD (12, 42), la taula alinea les columnes 2 · 3 · 7 i en pintar el MCD s'il·luminen el 2 i el 3, amb exponent 1.
- La 💡 dona primer una pregunta, després una marca al dibuix i, al final, mig resultat. Només la tercera treu l'estrella.
- Des de «Abans de calcular» del MCM (4, 6) s'obren les granotes amb 4 i 6, i en acabar es torna a l'exercici.
- Cap món que no sigui de mates canvia, i les proves de tots els mons estan en verd.

---

## 9. Decisions que has de prendre

1. **Graó 2 de la pista (mirar el dibuix):** treu l'estrella o la manté? *Recomano que no pagui però que no compti com a error: és l'ajuda que volem que facin servir.*
2. **Passos fets plegats:** sempre plegats, o desplegats en mode Completa? *Recomano plegats sempre; el dibuix ja els ensenya.*
3. **Mode «Ara tu» pas a pas (mateix exercici del Mira):** el fem, o n'hi ha prou amb Completa? *Recomano fer-lo: és el pas que falta entre veure-ho i fer-ho sol.*
4. **Ponts als manipulatius:** dins de l'exercici (s'obre i torna) o només com a enllaç al final? *Recomano dins, a «Abans de calcular» i a la pista 2 del MCM i el MCD.*
5. **Teoria amb dibuix (fase 6):** a tots els temes o només a escala, MCM/MCD i criteris? *Recomano començar per aquests 3.*
6. **Examen:** les vistes amb marca hi surten (sense pistes)? *Recomano que l'escala i la divisió surtin dibuixades, però sense marques, com a l'examen de paper.*
