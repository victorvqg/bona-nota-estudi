# Pla mestre · Millorar el món d'Anglès

17/11/2026 · Revisió a fons del món d'Anglès (Tema 2, `motor/dades/angles.js`, publicat a `angles/t2`) i del motor que el fa anar (`motor/plantilla-estudi-interactiu.html`).

**Estat:** executat a la versió 2.47.0 amb les recomanacions de la secció 7 (veu bilingüe només per a Anglès; avís i lectura igualment sense veu anglesa; `clau` després del primer error a «Simple or Continuous?» i des del principi a la resta; «Què vol dir?» dona l'estrella; buit a triar; anglès a 0,85). El revisor de veu de la fase 2 és `motor/prova-veu.js`.

**En poques línies.** El món té bon contingut, però té dos problemes. **1) La veu.** Tot el que no és una frase amb buits es llegeix amb la veu catalana, també el que és en anglès: el revers de les targetes («She's got curly hair.»), les preguntes de test en anglès («Her eyes aren't dark. They're…»), els enunciats i les respostes model de les obertes, i les paraules angleses de dins de les fitxes (*curly*, *straight*, *Present Continuous*). Ho diu en anglès amb accent català, i el nen aprèn una pronúncia equivocada. **2) Les frases amb buits** demanen la paraula sense dir què hi falta («?»), en fallar no expliquen per què aquella opció és dolenta, i la paraula clau que decideix la resposta (*now*, *every day*, *Listen!*) no es veu. Proposo una **veu bilingüe** (cada tros amb la seva veu), un **buit que s'explica** (quantes paraules, quina mena de paraula i la paraula pista) i un **perquè per a cada error**. Tot plegat, en 6 fases petites, cada una amb el seu PR. Al final hi ha 6 decisions per prendre abans de programar.

---

## 1. Què passa ara amb la veu

Hi ha una sola funció, `escolta(btn,text,lang)`, i una sola veu per crida. La llengua surt de `VEU_LANG` (català per defecte) llevat que qui la crida passi `lang`. Només ho fa el botó «Escolta-la» de les frases amb buits (`FR.veu = ASSIG.veuFrases = "en-GB"`).

| On | Què llegeix | Llengua real del text | Veu que fa servir | Bé? |
|---|---|---|---|---|
| Fitxa · «Escolta la fitxa» | títol, idea, punts, truc, compte | català amb moltes paraules angleses dins | català | ⚠️ les paraules angleses, amb accent català |
| Targetes · davant | `fc[i][0]` | català amb alguna paraula anglesa («El contrari de *tall*?») | català | ⚠️ |
| Targetes · darrere | `fc[i][1]` | sovint **tot en anglès** («She's got curly hair.», «people · men · women») | català | ❌ |
| Test | pregunta + «A: … B: …» | català, o **tot en anglès** («My grandad is 85. He's…» + light/thin/young) | català | ❌ |
| Obertes · enunciat | `OB[i].q` | **anglès** + traducció catalana entre parèntesis | català | ❌ |
| Obertes · resposta model | `OB[i].m` | sovint **tot en anglès** (frases 1-5) o mixt | català | ❌ |
| Frases amb buits · «Escolta-la» | la frase sencera | anglès | anglès (`en-GB`) | ✅ |
| Frases · traducció i perquè | — | català / mixt | no es poden escoltar | — |

**Per què no n'hi ha prou amb posar `veu:"en-GB"` a l'`ASSIG`:** llavors el català sonaria amb accent anglès. La regla de `docs/MON-ANGLES.md` («les fitxes s'han de llegir amb veu catalana») és bona, però s'ha d'aplicar **per trossos**, no per text sencer.

## 2. Què passa ara amb les frases amb buits

Revisat el codi (`frPrep`, `frFrase`, `frToca`, `frComprova`, `frFet`) i les 84 frases del Tema 2 (7 jocs de 12):

1. **El buit no diu res.** Surt «?» amb la mateixa amplada tant si hi va *is* com *How about watching* o *According to*. El nen no sap si busca una paraula o tres.
2. **No es diu quina mena de paraula falta.** A «She ___ at the party now.» cal *is dancing* (2 paraules: el be + el verb). La pista de quantes paraules són (`frPistaAuto`) només surt **després** del primer error.
3. **La paraula clau no es veu.** El joc «Simple or Continuous?» es resol mirant *often*, *Listen!*, *every day*, *at the moment*, però aquestes paraules no es distingeixen de la resta. L'`ex` les posa en negreta, però **després** de respondre.
4. **L'error no s'explica.** Si a «Her hair ___ red.» toques *are*, surt «❌ No és aquesta. Torna-ho a provar.». El perquè (*hair* és singular) arriba al final, barrejat amb l'explicació general. Les opcions falses són errors típics escollits amb cura (`danceing`, `womans`, `I am wanting`), però el nen no sap **per què** ho són.
5. **Als buits múltiples l'ordre és fix.** Cal omplir-los d'esquerra a dreta. Al diàleg de `fr-pla` (4 buits) no pots començar pel que saps segur, i una paraula col·locada ja no es pot treure.
6. **La traducció està amagada a les de triar.** Només es veu abans de respondre a les d'ordenar i a les d'escriure sense verb (`E.cue`). A les de vocabulari («The masks scare bad ___.») qui no entén la frase tria a l'atzar.
7. **L'explicació no es pot escoltar** i és bilingüe («<b>Hair</b> va en singular: Her hair <b>is</b>…»): primer s'ha d'arreglar la veu (punt 1).

Coses de contingut que he vist de passada (fase 4): «They ___ on the sofa» es tradueix «seuen» (millor «estan asseguts»); «Where ___ they standing?» es tradueix «On s'estan, drets?» (millor «On són, drets?»); i a `fr-opinio` hi ha 5 frases d'ordenar seguides al principi, quan la guia diu «de fàcil a difícil».

---

## 3. Proposta A · Veu bilingüe

### 3.1 Com funcionarà

Una funció nova, `trossos(text, base, alt)`, parteix un text en trossos `[{t, lang}]`, i `escolta()` els diu en cua, cada un amb la seva veu. `speechSynthesis` ja encua els enunciats sol: el botó passa a ⏹ al primer tros i torna a 🔊 quan acaba l'últim.

- **`base`** és la llengua de les explicacions (`ca-ES`) i **`alt`**, la del contingut (`en-GB`). El mode bilingüe s'activa quan el món té `ASSIG.veuContingut:"en-GB"`. Per compatibilitat, si no hi és, val `veuFrases`.
- Sense `veuContingut`, la resta de mons no canvien: un sol tros i la veu de sempre.

### 3.2 Com sap quin tros és anglès

Tres nivells, de més segur a menys:

1. **Marca explícita a les dades (mana sempre).** `<span lang="en">…</span>` o `<span lang="ca">…</span>`. Només cal posar-la on la detecció automàtica s'equivoqui, i el revisor (fase 2) diu on.
2. **Text sencer.** Si un text (una opció, una cara de targeta, una pregunta) no té cap senyal de català i la majoria de paraules són del lèxic anglès del món → tot el text en `en-GB`. Això resol de cop els reversos de les targetes, les preguntes de test en anglès i les respostes model.
3. **Text barrejat.** Dins d'un text català, és anglès:
   - el que hi ha dins de `<b>`/`<i>` si les paraules són del lèxic anglès del món;
   - les seqüències de 2 o més paraules seguides del lèxic anglès (*Present Continuous*, *at the moment*);
   - el que hi ha entre parèntesis en un enunciat en anglès, al revés: «Write the opposite… **(Escriu el contrari…)**» → el parèntesi, en català.

**El lèxic anglès del món** es construeix sol en carregar la pàgina, amb el que ja és segur que és anglès: totes les frases (`f`, `ok`, `no`, `r`, `mots`) i els títols dels jocs de frases. A més, una llista curta de paraules gramaticals (*the, is, are, I, you, she, he, they, it's, don't, of, to, in, at…*). **Paraules ambigües** que són a les dues llengües (*a, no, on, me, film, musical, western, Halloween…*): prenen la llengua de les veïnes, i soles van en català.

**Neutres:** números, signes i separadors (`·`, `↔`, `→`, `=`) no obren tros nou. Els trossos seguits de la mateixa llengua s'ajunten, per no fer pauses entre paraula i paraula.

### 3.3 Detalls que importen

- **Velocitat:** anglès a `0.85` (és un nen que aprèn) i català a `0.92` (com ara).
- **Test:** les lletres «A, B, C» es diuen en català i l'opció, en la seva llengua. Si totes les opcions són angleses, millor no dir les lletres: «*light*… *thin*… *young*».
- **Aparell sense veu anglesa** (passa en alguns Android i al Firefox): `triaVeu("en-GB")` torna `null`. Llavors **avís un sol cop**: «Aquest aparell no té veu en anglès. La pots afegir a Configuració → Idioma → Veu», i l'anglès es llegeix igualment amb la veu que hi hagi. Sense veu catalana ja hi ha la caiguda al castellà; es manté.
- **Mode suau i sense so:** la veu ja és opcional (botó); no canvia res.
- **Frases amb buits:** el botó «🔊 Escolta-la» segueix igual (tot en anglès) i se n'hi afegeix un a l'explicació (`ex`, bilingüe).

### 3.4 On canvia el motor

| Peça | Canvi |
|---|---|
| `escolta(btn,text,lang)` | Si no rep `lang` i el món és bilingüe → `trossos()` i cua. Si rep `lang`, com ara (un tros). |
| `btEscolta` | Sense canvis de signatura. |
| `netText` | Ha de conservar les marques `lang` abans de treure l'HTML: `trossos()` treballa sobre l'HTML i neteja cada tros. |
| Test (línies ~1181 i ~1591) | El text de l'escolta es fa per opcions, perquè cada opció tingui la seva llengua. |
| Obertes (~2374, ~2382, ~2404) | Res: ja passen per `escolta()`. |

### 3.5 Com es prova

- **`motor/prova-veu.js`** (nova, Node sense navegador): `trossos()` amb una taula de casos del Tema 2 → llengua esperada de cada tros (fitxa *adj1*, revers «She's got curly hair.», pregunta «My grandad is 85. He's…», `OB[0].q`, `OB[2].m`).
- **Amb navegador:** un `speechSynthesis` fals que apunta cada enunciat i la seva `lang`. Es prem «Escolta la fitxa», una targeta i el test, i es comprova la seqüència de llengües.
- A mà, en un mòbil Android i un iPhone (els headless no tenen veus).

---

## 4. Proposta B · Frases amb buits que s'expliquen

### 4.1 Abans de respondre

1. **El buit diu quantes paraules hi caben.** Si la resposta té 2 paraules, surten 2 buits petits enganxats (`[ ] [ ]`), i l'amplada creix una mica amb la llargada. Automàtic, a partir de `ok` o `r[0]`. Ja no cal esperar al primer error per saber que *is dancing* són dues paraules.
2. **Què hi falta (camp nou opcional `falta`).** Una etiqueta petita damunt del buit: «el verb *be*», «un adjectiu», «verb en -ing», «una paraula del text». Si no hi és, no surt res.
3. **La paraula pista es veu (camp nou opcional `clau`).** `clau:["Listen!"]` o `clau:["every day"]`: la paraula surt subratllada amb un 👀 discret. **Decisió 3:** des del principi, o només després del primer error, com a pista.
4. **«Què vol dir?» a les de triar.** Un botó petit mostra la traducció `ca` abans de respondre. **Decisió 4:** si la frase dona igualment l'estrella (com a les d'ordenar, que ja la mostren) o compta com a ajuda (com la 💡 del test).

### 4.2 En fallar

5. **Un perquè per a cada opció falsa (camp nou `per`).** Exemple:
   ```js
   {f:"Her hair ___ red.",ok:"is",no:["are","have"],
    per:{are:"<b>Hair</b> és singular: va amb is.",have:"Have és tenir. Aquí cal el verb be: Her hair <b>is</b>…"},
    ca:"Té els cabells vermells.",ex:"<b>Hair</b> va en singular…"}
   ```
   En tocar *are*: «❌ *Hair* és singular: va amb *is*.». Si l'opció no té `per`, surt la `pista` o el missatge d'ara. A les d'escriure, `per` pot apuntar errors típics escrits («danceing»: «Dance perd la e: dancing.»), comparant amb `frNorm`.
6. **Al segon error**, a més de «👉 Aquí hi va **is**», es veu el `per` de la teva opció, i l'`ex` arriba al final, com ara.

### 4.3 Després de respondre

7. **La paraula clau i el buit s'il·luminen junts** (el mateix color), perquè es vegi la relació: *every day* → *reads*.
8. **🔊 a l'explicació**, amb la veu bilingüe.

### 4.4 Col·locar les paraules (buits múltiples)

9. **Pots triar el buit.** Toques un buit buit i passa a ser l'actiu; per defecte segueix el primer que queda. La comprovació continua sent a l'instant, paraula per paraula: una paraula bona es queda i una de dolenta compta com a error. Res a desfer, perquè només es col·loquen les bones.
10. **Diàlegs:** cada línia, en un bloc a part (`<br>` → línia amb el nom en gris), perquè a 360 px no es desquadri.
11. **Ordena:** surten tants buits com paraules té la frase (sense les que sobren), perquè el nen sàpiga quantes en falten.

### 4.5 El que no canvia

Estrelles (1 per frase bé a la primera), repàs espaiat, ids de les frases (`frId`), proves actuals (`frValida`, `jocFrasesProva`). Els camps nous són tots opcionals: un món vell sense `falta`, `clau` ni `per` es veu com ara, amb els buits comptats (punt 1), que és automàtic.

**Filtre de `docs/BON-US.md` §6:** premia aprendre (explica l'error) ✅ · sense topalls nous ✅ · no perds res si no entres ✅ · sense atzar ✅ · no fa sentir malament ✅ · funciona en mode suau i sense so ✅ · respecta el descans ✅ · igual a totes les fases ✅ · no guarda res nou ✅ · el pare ho veu igual que ara (estrelles i errors) ✅.

---

## 5. Proposta C · Contingut del Tema 2

- **`per`** a totes les frases de gramàtica (`fr-continuous`, `fr-dospresents`, `fr-pla`) i a les opcions falses que siguin *false friends* (`custom`, `history`, `Eventually`). Unes 40 opcions.
- **`clau`** a les frases de `fr-dospresents` i `fr-continuous` que tenen marcador de temps (*now*, *often*, *every day*, *Listen!*, *Look!*, *at the moment*, *usually*, *this year*).
- **`falta`** als jocs de gramàtica: «el verb *be*», «verb en -ing», «Present Simple».
- **Traduccions** (punt 2: «seuen», «On s'estan, drets?») i ordre de `fr-opinio` de fàcil a difícil (barrejar-hi les de triar al davant).
- **Obertes:** l'enunciat en anglès i la traducció entre parèntesis es mantenen; amb la veu bilingüe ja sonaran bé. Revisar les respostes model que barregen idiomes en una mateixa frase («dance = dancing, perquè perd la e») perquè es llegeixin bé: posar-hi `<i>` a les paraules angleses.
- **Marques `lang`** només on el revisor (fase 2) digui que la detecció falla.

---

## 6. Fases

Cada fase és una branca, un PR i un `python3 motor/tot.py` + proves en verd, com diu `AGENTS.md`.

| Fase | Què | Toca | Prova | Mida |
|---|---|---|---|---|
| **1** | Veu bilingüe al motor (`trossos`, cua, velocitats, avís sense veu anglesa) | plantilla | `prova-veu.js` nova + `speechSynthesis` fals | M |
| **2** | El revisor diu com sonarà cada text d'un món bilingüe i on dubta; marques `lang` al Tema 2 | `revisa-mon.js`, `angles.js` | `prova-revisa-mon.js` | S |
| **3** | Buits que s'expliquen: buits comptats, `falta`, `clau`, «Què vol dir?», triar el buit, diàlegs i ordena | plantilla | `prova-tot.js mons angles/t2` + visual 360/390/430 | M |
| **4** | Perquè per a cada error (`per`) + contingut del Tema 2 (secció 5) | plantilla, `angles.js` | `frValida` comprova que les claus de `per` són opcions de `no` | M |
| **5** | 🔊 a l'explicació de les frases i lectura de les opcions del test per llengües | plantilla | prova de la fase 1 ampliada | S |
| **6** | Docs i eines: `docs/MON-ANGLES.md` (camps nous, regla de la veu), `nou_mon.py` i skill `nou-mon` perquè els mons nous ja ho portin; `ESTAT.md`, `CHANGELOG.md`, versió MENOR | docs, eines | `prova_nou_mon.py` | S |

Ordre recomanat: **1 → 2** primer (és el que ara es veu malament), després **3 → 4 → 5**, i la **6** al final o repartida.

**Criteris de fet:**
- A «Escolta la fitxa» d'*A1 · Adjectives*, *tall*, *short*, *curly* i *She's got curly hair* sonen en anglès i la resta en català.
- El revers «She's got curly hair.» i la pregunta «My grandad is 85. He's…» sonen tot en anglès.
- A «She ___ at the party now.» es veuen 2 buits abans de respondre, i *now* es pot fer servir de pista.
- En tocar *are* a «Her hair ___ red.» surt per què està malament.
- Cap món que no sigui d'Anglès canvia de comportament (les proves de tots els mons, en verd).

---

## 7. Decisions que has de prendre

1. **Mode bilingüe:** només per a Anglès (`veuContingut`), o també el preparem per a Castellà (frases en castellà dins d'explicacions en català)? *Recomano: només Anglès ara; el motor ja quedarà preparat.*
2. **Aparell sense veu anglesa:** avisar i llegir-ho amb la veu que hi hagi, o no llegir els trossos en anglès? *Recomano: avisar un cop i llegir-ho igualment.*
3. **Paraula clau (`clau`):** visible des del principi o només com a pista després del primer error? *Recomano: després del primer error al joc «Simple or Continuous?» (si no, no cal pensar) i des del principi a la resta.*
4. **«Què vol dir?»:** dona igualment l'estrella o compta com a ajuda? *Recomano: dona l'estrella, com a les d'ordenar; és comprensió, no la resposta.*
5. **Triar el buit als múltiples:** sí o mantenim l'ordre fix? *Recomano: sí.*
6. **Velocitat de l'anglès:** 0.85 fixa, o un botó 🐢 per escoltar la frase més a poc a poc? *Recomano: 0.85 ara, i el 🐢 només a «Escolta-la» si ho demanen.*
