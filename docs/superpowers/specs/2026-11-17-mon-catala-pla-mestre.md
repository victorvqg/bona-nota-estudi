# Pla mestre · Millorar el món de Català

17/11/2026 · Revisió del món de Català (Tema 2: La literatura, el nom i la puntuació; `motor/dades/catala.js`, publicat a `catala/t2`). He comptat el contingut i he fet captures a 390 px de la fitxa del sintagma nominal, del joc «Quin signe hi va?», d'una frase amb buits (bé i malament) i d'una pregunta oberta.

**Estat:** executat a la versió 2.51.0 amb les recomanacions de la secció 4.
- He convertit 3 frases de regla en frases d'ús (no 20). Les frases d'ús noves han entrat sobretot als jocs nous: 8 textos per puntuar, 10 frases per escoltar i 9 fragments.
- El joc de pintar és un joc `custom` amb `fn:"jocMarca"` (no un `tipus:"marca"` nou) i encara no envia els errors al repàs espaiat.
- No he afegit frases d'escriure amb el mot entre parèntesis (punt A) ni el `per` a totes les opcions: n'hi ha a les frases on l'error té una explicació clara.

**En poques línies.** El món té molt contingut i ben fet: 12 temes, 109 preguntes de test, 68 targetes, 15 obertes, 10 jocs i 6 jocs de frases amb buits (72 frases). El que hi falta és **practicar fent**, no recitant la regla:

- Moltes frases amb buits pregunten **la regla** («Darrere d'un interrogant s'escriu ___»), i no l'**apliquen** a una frase de veritat.
- El sintagma nominal s'explica com un «trencaclosques de tres peces», però **no hi ha cap activitat per muntar-lo ni per pintar-ne les peces**.
- La puntuació es practica amb frases soltes, sense **un text sencer** per puntuar ni l'**entonació** (com sona una pregunta o una exclamació).
- Les millores que acabem de fer a Anglès (el perquè de cada error, la paraula pista) **aquí no es fan servir**: 0 de 72 frases.

Proposo 6 fases: les frases amb el perquè de cada error, un joc nou per **pintar les paraules** (especificador, nucli, complement…), **puntuar textos** (també escoltant-los), **reconèixer gèneres amb fragments**, **esquemes dibuixats a la teoria** i una guia per als mons de llengua. Al final hi ha 6 decisions.

---

## 1. Com és ara

| Peça | Què hi ha | Què hi falta |
|---|---|---|
| Fitxes (12) | Text clar, amb truc i compte | Cap esquema visual. Al SN, el «trencaclosques de tres peces» només és text |
| Frases amb buits (6 jocs, 72 frases) | Totes amb `pista` i `ex` | **0 amb `per`** (el perquè de l'opció dolenta), **0 amb `clau`**. Moltes demanen la regla («s'escriu ___ majúscula») i no la fan servir |
| Jocs (10) | Ordenar, classificar i parelles | Res per **analitzar** una frase (quina paraula és el nucli?) ni per **puntuar un text** |
| Puntuació | «Quin signe hi va?» amb 6 frases i majúscula o minúscula | Cap text llarg ni l'entonació. El 🔊 no s'hi fa servir |
| Literatura | Ordenar la història, oral o escrita, gèneres i autors | **Cap fragment de text** per reconèixer-ne el gènere (vers, prosa, teatre, assaig) |
| Obertes (15) | Detecció d'idees clau | — (funcionen bé) |
| Llibre | Pàgines 42-55 | Les pàgines 52-53 (inici d'ortografia) no hi són |

Exemple de la captura: a «Darrere d'un interrogant (?) o d'una admiració (!) que tanquen l'oració, s'escriu ___», en tocar «punt» surt «❌ No és aquesta. 💡 Són signes de porta tancada». El nen sap la regla de memòria, però no l'ha feta servir mai en una frase.

---

## 2. Proposta

### A · Frases que ensenyen per què (només contingut)

- **`per` a les opcions falses de les 72 frases.** Per exemple: «*la cavalla*: cavall fa el femení amb una paraula diferent, **euga**». «*llapissos*: els acabats en -s tònica fan -os, però *llapis* és pla: **els llapis**».
- **`clau`** on una paraula decideix la resposta: «Quin gol més bonic___» → la paraula pista és *Quin*, i per això va admiració.
- **Canviar unes 20 frases de regla per frases d'ús.** Abans: «Darrere del punt i coma s'escriu ___». Després: «Ahir va ploure molt___ avui, en canvi, fa sol.» (`;`, i *avui* en minúscula).
- **Més frases d'escriure amb el mot entre parèntesis:** «Al prat hi ha una ___ (cavall) i el seu poltre» → *euga*. «Tinc dos ___ (llapis)» → *llapis*.

### B · Joc nou «Pinta les paraules» (`tipus:"marca"`)

Un joc genèric del motor, que serveix per a qualsevol món de llengua:

```js
{id:"mc-sn",grup:"🏷️ El nom",tipus:"marca",titol:"Les tres peces del SN",
 cats:[["E","Especificador","#fde68a"],["N","Nucli","#93c5fd"],["C","Complement","#bbf7d0"]],
 items:[{t:"els teus ulls verds",m:"EENC",ex:"El nucli és <b>ulls</b>: sense ell no sé de què parlo."}, …]}
```

- El nen tria un color (E, N o C) i toca les paraules per pintar-les. Després prem «Comprova».
- Les paraules mal pintades queden marcades i surt per què. Al segon intent, es veu la solució.
- **Usos en aquest tema:**
  1. **SN:** especificador, nucli i complement (12 sintagmes del llibre i nous).
  2. **Classes de noms:** de cada nom d'un text, si és comú o propi.
  3. **Gènere i nombre:** de cada paraula d'una frase, si és masculí o femení.
- Estrelles, repàs dels errors i proves automàtiques, com els altres jocs. Passa el filtre de `docs/BON-US.md` §6, perquè premia l'encert i no el temps.

### C · Puntuar textos de veritat

- **Textos de 3-5 frases amb tots els signes buits** (frases amb buits múltiples, el motor ja ho fa). Per exemple, un diàleg curt per posar `?`, `!`, `:`, `…` i el punt. Al final s'ensenya el text ben puntuat.
- **«🔊 Escolta i puntua»** (camp nou de joc, `escoltaAbans:true`): el nen pot escoltar la frase **abans** de respondre, amb l'entonació de la veu catalana, i decideix el signe per com sona. La pregunta puja i l'exclamació, també.
- **Majúscules:** després de `.`, `?` i `!`, la paraula que segueix és un buit més. Es practica la «porta tancada» dins del text.

### D · Literatura amb fragments

- **«Quin gènere és?» amb fragments curts** (4-6 línies): un poema en vers, un conte, una escena de teatre amb acotacions, un tros d'assaig, una rondalla («Hi havia una vegada…»), un refrany i una cançó popular. Es classifiquen en Lírica, Narrativa, Teatre o Assaig, i oral o escrita.
- Cada fragment té **🔊** per escoltar-lo (el poema llegit fa notar el ritme i la rima).
- **Pista** que mira la forma: «Hi ha noms de personatge seguits de dos punts → teatre».

### E · Teoria amb esquemes dibuixats

Camp opcional `T[i].esquema`, que es pinta sota la idea clau, com a Mates:

- **SN:** la frase pintada amb els colors del joc B (`els teus` / `ulls` / `verds`).
- **Gènere i nombre:** taula *noi → noia → nois → noies* i les excepcions (*cavall → euga*, *llapis → llapis*).
- **Signes:** dues columnes, «porta tancada» (`.`, `?`, `!`, `…` → majúscula) i «porta oberta» (`,`, `;`, `:` → minúscula).
- **Gèneres literaris:** quadre vers / prosa / diàleg.

### F · Per a tots els mons de llengua

- El joc `marca`, `escoltaAbans` i `esquema` són del motor i serveixen també per a Castellano, i més endavant per a Anglès (adjectiu i nom).
- Guia nova `docs/MON-LLENGUA.md`: com es fan les frases d'ús (no de regla), el `per`, el joc de pintar i els esquemes, i la llista de comprovació.

---

## 3. Fases

| Fase | Què | Toca | Mida |
|---|---|---|---|
| **1** | Frases: `per` a les 72, `clau` i 20 frases de regla → ús, i més frases d'escriure | `catala.js` | M |
| **2** | Joc «Pinta les paraules» (`marca`) al motor + 3 jocs a Català (SN, classes de noms, gènere) | plantilla, `catala.js`, `prova.js` | M |
| **3** | Puntuació: 2 textos sencers amb buits, `escoltaAbans` i un joc «Escolta i puntua» | plantilla (poc), `catala.js` | S |
| **4** | Literatura: 8 fragments per classificar, amb 🔊 i pistes de forma | `catala.js` | S |
| **5** | Teoria: `esquema` (SN, gènere i nombre, signes, gèneres) | plantilla, `catala.js` | S |
| **6** | `docs/MON-LLENGUA.md`, `MONS.md`, `ESTAT.md`, `CHANGELOG.md` i versió | docs | S |

Totes passen `python3 motor/tot.py`, `node motor/revisa-mon.js catala`, `node motor/prova-tot.js base` i la prova de mons de `catala/t2`. La prova estricta juga també el joc `marca` (bé i amb un error).

**Criteris de fet:**
- En tocar una opció falsa en qualsevol frase de Català, surt per què està malament.
- Es pot pintar «els teus ulls verds» amb E E N C, i en errar el nucli diu per què.
- Hi ha un text de 4 frases per puntuar sencer, i la frase interrogativa es pot escoltar abans de respondre.
- A la fitxa del SN, les tres peces surten pintades.

---

## 4. Decisions que has de prendre

1. **Joc nou «Pinta les paraules»:** el fem al motor (servirà per a tots els mons de llengua)? *Recomano que sí: és l'activitat que més falta.*
2. **Escoltar abans de respondre** a la puntuació: l'entonació ajuda (i un pèl delata) la resposta. La posem només al joc «Escolta i puntua» o també a les altres frases de puntuació? *Recomano només a «Escolta i puntua».*
3. **Fragments literaris:** escrits per nosaltres o d'autors de domini públic (Verdaguer, Maragall, rondalles populars)? *Recomano barrejar-los: rondalles i cançons populars de domini públic, i la resta escrita per nosaltres, curta i amb el vocabulari del llibre.*
4. **Frases de regla:** canviem les ~20 que només demanen la regla, o les deixem i n'afegim de noves? *Recomano canviar-les (mantenint els ids perquè no es perdi el repàs) i deixar les 3-4 de regla més importants.*
5. **També a Castellano?** El motor nou hi serviria sense tocar res. *Recomano fer Català ara i Castellano en un pla a part.*
6. **Pàgines 52-53 (ortografia):** si les tens, les afegim com a tema 13? *Només si m'enllaces la carpeta de Drive amb les fotos o el PDF.*
