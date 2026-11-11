# Com es construeix un món d'Anglès

Guia per fer un món nou d'Anglès (un tema o mòdul del llibre) igual que el del Tema 2 (`motor/dades/angles.js`,
publicat a `angles/t2`). El motor és el mateix de tots els mons: aquí només hi ha el que és propi d'Anglès.
Els passos comuns (`mons.json`, `tot.py`, proves, versió) són a l'apartat «Afegir o actualitzar un món» del [README](../README.md).

## 1. Què ha de tenir

| Peça | Quantitat | On va |
|---|---|---|
| Blocs | Els del mòdul del llibre (A, B, C) | `ASSIG.blocs` |
| Temes | Un per secció del llibre (Vocabulary, Reading, Grammar…) | `T` |
| Preguntes de test | 10 o 11 per tema (mínim 8) | `T[i].q` |
| Targetes | 6 per tema | `T[i].fc` |
| Preguntes obertes | 10 a 15, tretes de l'examen i la pràctica | `OB` |
| **Jocs de frases amb buits** | **Un per tema de vocabulari o gramàtica; 12 frases cada un** | `ASSIG.jocs`, `tipus:"frases"` |
| Jocs clàssics | 6 a 8 (parelles, classifica, ordena) | `ASSIG.jocs` |
| Boss | Nom i monstre | `ASSIG.boss` |

Camps propis d'Anglès a `ASSIG`:

```js
veuFrases:"en-GB",   // el botó «Escolta-la» de les frases llegeix en anglès
```

No posis `veu:"en-GB"` a `ASSIG`: les fitxes s'expliquen en català i s'han de llegir amb veu catalana.

## 2. Regles de llengua

- **Contingut en anglès, explicacions en català.** Les fitxes, les pistes, el perquè (`ex`) i les traduccions (`ca`) van en català.
- **Res de fora del mòdul.** Les frases noves només fan servir el vocabulari i la gramàtica que surten a les fitxes del mateix món.
- **Anglès britànic**, com el llibre (`favourite`, `film`, `have got`).
- Les respostes falses són **errors típics** dels fulls del profe (`danceing`, `She dancing`, `I am wanting`, `womans`…).
- Els *false friends* del mòdul van a un joc de parelles («Paraules trampa») i també a les frases.

## 3. Frases amb buits

Cada joc és un objecte a `ASSIG.jocs`, tots amb `grup:"✍️ Frases amb buits"` i **posats al principi** de la llista perquè surtin a dalt:

```js
{id:"fr-continuous",grup:"✍️ Frases amb buits",tipus:"frases",ic:"🔴",titol:"What's happening now?",
 sub:"am / is / are + verb en -ing",col:"#ffe4e6",
 enunciat:"🔴 Completa les frases en Present Continuous",
 items:[ /* 12 frases */ ],
 final:"BE + ING van sempre de la mà."}
```

- `id` comença per `fr-`. `titol` en anglès, `sub` i `enunciat` en català.
- `items`: **12 frases**. Cada partida en tria 8 (`n`, per defecte 8) i les posa en l'ordre de les dades: escriu-les de fàcil a difícil.
- `final`: el truc del tema, en una línia.

### Les tres menes de frase

El motor sap quina és pels camps que porta.

**Tria** (toca la paraula que falta). `ok` és la bona i `no`, dues falses:

```js
{f:"Her hair ___ red.",ok:"is",no:["are","have"],
 ca:"Té els cabells vermells.",ex:"<b>Hair</b> va en singular: Her hair <b>is</b>…"}
```

**Tria amb més d'un buit** (banc de paraules; s'omple en ordre). `ok` és una llista, una paraula per buit:

```js
{f:"One person, two ___. One man, two ___. One woman, two ___.",ok:["people","men","women"],
 no:["persons","mans","womans"],ca:"…",ex:"Plurals irregulars, sense -s."}
```

Serveix també per a un diàleg sencer: les línies se separen amb `<br>` i `no` pot ser `[]`.

**Escriu** (el nen tecleja). `v` és el que surt entre parèntesis i `r`, totes les respostes que valen (la primera és la model):

```js
{f:"She ___ at the party now.",v:"dance",r:["is dancing","'s dancing"],
 ca:"Ara està ballant a la festa.",ex:"She → <b>is</b>. I dance perd la e: <b>dancing</b>."}
```

- Posa-hi sempre la **forma contreta i la sencera** (`isn't watching`, `is not watching`).
- No compten les majúscules, l'apòstrof corbat ni el punt final.
- Sense `v`, la traducció `ca` es veu abans de respondre, perquè faci de pista. Llavors posa-hi també `pista`.
- Una frase d'escriure només pot tenir **un buit**.

**Ordena** (paraules desordenades). `no` són paraules que sobren, opcional:

```js
{mots:"She's got big eyes",no:["bigs"],ca:"Té els ulls grossos.",
 ex:"L'adjectiu va <b>davant del nom</b> i no té plural."}
```

- La traducció `ca` es veu abans de respondre.
- Només frases amb **un sol ordre correcte**. Evita «tall and thin» (també valdria «thin and tall»).
- Mínim 3 paraules.

### Camps de totes les frases

| Camp | Cal? | Què és |
|---|---|---|
| `ex` | Sí | El perquè, en català, amb la paraula clau en `<b>` |
| `ca` | Sí | La traducció al català |
| `pista` | Opcional | Ajuda que surt després del primer error. Si no n'hi ha, a les d'escriure el motor diu com comença la paraula |
| `id` | Opcional | Només si canvies el text d'una frase ja publicada i vols conservar-ne el repàs |

### Com repartir les 12 frases

- Unes 6 de triar, 3 o 4 d'escriure i 2 o 3 d'ordenar.
- Gramàtica (temps verbals): més d'escriure, amb el verb entre parèntesis.
- Vocabulari i lectures: més de triar. Les d'escriure, només amb paraules curtes i amb `pista`.
- Ordre de paraules (adverbis, adjectiu + nom, preguntes): d'ordenar.
- Cada error típic del tema ha de sortir almenys en una frase, com a opció falsa o com a paraula que sobra.
- Dues frases del mateix joc no poden tenir el mateix text.

### Enllaç des de la fitxa

Cada tema diu quin és el seu joc de frases i a la fitxa surt el botó «✍️ Practica-ho amb frases»:

```js
{id:"continuous",frases:"fr-continuous",ic:"🔴",…}
```

Dues lectures poden compartir un mateix joc (al Tema 2, el museu i el tresor de Fenn van a `fr-paraules`).

## 4. Què fa el motor tot sol

- Primer error: pista. Segon error: ensenya la resposta (en taronja).
- Després de cada frase: la frase sencera, la traducció, el perquè, el botó 🔊 en anglès i «digues-la en veu alta».
- 1 ⭐ per frase bé a la primera; cada joc paga un cop al dia.
- Les frases fallades entren a «🔁 Repassa els teus errors» i tornen al cap d'uns dies.

## 5. Comprovació abans de publicar

```
cd motor
python3 tot.py
ESTRICTE=1 node prova.js $PWD/../angles/<carpeta>/index.html
```

La prova juga tots els jocs de frases i en revisa les dades. Falla si:

- una frase no té buit (`___`) o el nombre de buits no quadra amb `ok`;
- una opció falsa és igual que la bona, o una frase de triar té menys de 2 opcions falses;
- una frase no té `ex`, hi ha frases repetides o el joc té menys frases que les d'una partida.

Després, mira-ho al mòbil (360 a 430 px): el diàleg amb banc de paraules és la frase més llarga i la que primer es desquadra.

## 6. Llista de comprovació d'un món nou d'Anglès

1. Dades a `motor/dades/angles-t<N>.js` amb un `id` nou (per exemple `angles3`): l'`id` és la clau del progrés i no pot repetir el d'un altre món.
2. Entrada a `motor/mons.json` amb la carpeta `angles/t<N>`.
3. `veuFrases:"en-GB"` a `ASSIG`.
4. Un joc `fr-…` per tema de vocabulari o gramàtica, amb 12 frases, i `frases:"fr-…"` a cada tema.
5. La taula «Si el món és nou, també cal tocar això» del README (tauler, `bn_control.sql`, `sprites.js`, il·lustració, proves del tauler).
6. `docs/MONS.md`, `docs/ESTAT.md`, `CHANGELOG.md` i versió MENOR nova.
7. Branca, PR i Action en verd, com diu `AGENTS.md`.
