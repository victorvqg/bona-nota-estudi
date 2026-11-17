# Pla mestre · La capçalera i el menú dels mons

17/11/2026 · Revisió de la capçalera i del menú de tots els mons (`motor/plantilla-estudi-interactiu.html`: `header`, `.hd`, `.logo`, `#hola`, `#qui`, `.vol`, `#punts`, `#nav`), a partir de la captura de `bonanota.net/matematiques/divisibilitat/` amb la Mireia i de mesures fetes amb Playwright a 1400, 1000, 700, 390 i 360 px.

**Estat:** executat a la versió 2.49.0 amb les recomanacions de la secció 4. Al mòbil, el títol té 149 px a 360 px: el mínim que comprova la prova és 140, i no 150. La banda del menú és una mica més fosca del que deia el pla (opacitat 0,5), perquè amb 0,28 no s'arribava a 4,5 de contrast.

**En poques línies.** A l'ordinador, el menú (Mons, Inici, Temes, Jocs, Obertes, Com vaig) queda **arraconat a l'esquerra**, el nom del món i el de la nena són **petits** (19 px i 13 px) i el so (música, altaveu i barra de volum) ocupa 207 px de la primera fila. Al mòbil és pitjor: el comptador d'estrelles (178 px) i el so (108 px) es mengen la fila i **el títol i el nom gairebé no es veuen**: a 390 px hi queden 37 px («Ma…-») i a 360 px, **9 px**. A més, el text del menú (blau clar) sobre el verd llima de Mates es llegeix malament. Proposo: el **menú centrat**, el **so dins d'un sol botó** amb un panell, **el nom i el curs grans i clars** (amb el curs en una etiqueta) i, al mòbil, una capçalera on el títol té tota l'amplada que cal. Són 4 fases petites, i al final hi ha 5 decisions.

---

## 1. Com és ara (mesurat)

| Amplada | Títol (`#hola`) | Nom i curs (`#qui`) | So (`.vol`) | Estrelles (`#punts`) | Menú |
|---|---|---|---|---|---|
| 1400 px | 19 px de lletra, 338 px d'ample | 13 px | 207 px | 178 px | Comença a l'esquerra (x = 230) i acaba a 835 de 1180: **sobren 345 px a la dreta** |
| 1000 px | igual | 13 px | 207 px | 178 px | Igual, arraconat a l'esquerra |
| 700 px | 234 px, es talla («Tema 2…») | 13 px | 207 px | 178 px | A l'esquerra |
| 390 px | **37 px** («Ma… ·») | **37 px** («👤 Mi…») | 108 px | 178 px | A baix, fix, 6 botons: bé |
| 360 px | **9 px**: no es veu | **9 px** | 108 px | 178 px | A baix: bé |

Altres coses que he vist:

- **Contrast:** el text del menú és `#dbeafe` (blau molt clar). Sobre la punta verda llima del degradat de Mates, el contrast és molt baix («Com vaig» i «Obertes» costen de llegir). Ho he mesurat: sobre el tercer color del degradat, el contrast de `#dbeafe` és d'**1,4 a 2,2** als 8 mons (Mates 1,6, Català i Anglès 1,4), quan el mínim recomanat és 4,5. Fins i tot el blanc pur hi queda curt, i per això cal la banda fosca de l'apartat 2.3.
- **«Mons»** és un enllaç amb vora i les altres opcions són botons sense vora, i tots van en la mateixa filera. Es veu com si fos una opció més, i no com «surt del món».
- **«1r ESO»** és un text de 13 px enganxat al nom. No es distingeix que és el curs.
- **Les estrelles** (`⭐ 666 · 🌠 13 · 🥇 7`) són 3 dades en una píndola. Al mòbil, només això ja ocupa la meitat de la fila.
- **El so** són 3 controls sempre visibles (música, silenci, volum 0-5) que es fan servir poc.

---

## 2. Proposta

### 2.1 Ordinador i tauleta (més de 600 px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [🔢]  Matemàtiques · Tema 2: Divisibilitat      [🔊]  [⭐ 666 · 🥇 7] │  ← fila 1
│       👤 Mireia #8   [1r ESO]                                          │
│         ⟵ Mons  │  Inici   Temes   Jocs   Obertes   Com vaig          │  ← fila 2, centrada
└──────────────────────────────────────────────────────────────────────┘
```

- **Menú centrat.** La fila del menú queda centrada (`justify-content:center`) dins de l'amplada de la pàgina. «⟵ Mons» va al davant, separat per una ratlla fina vertical, perquè es vegi que és «sortir del món». Totes les opcions tenen la mateixa alçada (40 px) i el mateix farciment.
- **Títol més gran:** 22 px a una línia; si no hi cap, es talla amb «…», amb el text sencer al `title`. La icona del món passa a una rajola de 40 px.
- **Nom i curs:** el nom a 16 px, amb el número més suau (`👤 Mireia #8`), i el curs en una **etiqueta** blanca translúcida (`1r ESO`), de 14 px.
- **El so, en un sol botó 🔊.** En tocar-lo s'obre un panell petit amb la música, el silenci i el volum (0-5), com ara però plegat. La icona canvia si està en silenci (🔇) o si sona música (🎵). Guanya uns 170 px per al títol.
- **Estrelles:** `⭐ 666 · 🥇 7` (estrelles i nivell). Les superestrelles 🌠 passen al panell que ja s'obre en tocar la píndola (`obreEstrelles`), on ja hi ha el detall.

### 2.2 Mòbil (fins a 600 px)

```
┌───────────────────────────────────────┐
│ [🔢] Matemàtiques · Tema 2      [⭐ 666] [🔊] │
│      👤 Mireia #8 · [1r ESO]                   │
└───────────────────────────────────────┘
          … contingut …
[🌐 Mons][🏠 Inici][📖 Temes][🎮 Jocs][✏️ Obertes][📊 Com vaig]   ← a baix, com ara
```

- **El títol té l'espai.** Estrelles i so ocupen junts un màxim de ~120 px: `⭐ 666` (sense 🌠 ni nivell; tot el detall, en tocar-la) i el botó 🔊. Així, a 360 px queden uns 200 px per al títol (ara 9 px).
- **Títol en 1 línia** a 17 px: `Matemàtiques · Tema 2` (amb el tema curt, si n'hi ha, o tallat amb «…»). A sota, `👤 Mireia #8` i l'etiqueta `1r ESO`, a 14 px.
- **El menú de baix es manté** (ja funciona bé). Hi afegim el mateix fons fosc translúcid que a dalt (punt 2.3), perquè es llegeixi sobre qualsevol degradat.

### 2.3 Contrast i aspecte, a tots els mons

- **El menú, sobre una banda fosca translúcida** (`rgba(15,23,42,.18)`) i amb el text **blanc** (no `#dbeafe`). L'opció activa continua sent una píndola blanca amb el color del món. Contrast mínim de 4,5:1 sobre els 8 degradats, comprovat amb una prova.
- **Focus visible** igual a tot el menú (ja hi és per als botons; s'estén a «Mons»).
- **En baixar la pàgina (opcional):** la capçalera s'encongeix i amaga la línia del nom i del curs, perquè el contingut tingui més espai. Torna en pujar. Sense animació en mode suau.

### 2.4 El que no canvia

Les funcions (`vista`, `marcaNav`, `pintaCap`, `obreEstrelles`, `canviaSo`, `canviaMusica`, `posaVol`), els ids (`#hola`, `#qui`, `#punts`, `#nav`, `#mus`, `#so`, `#volum`) que fan servir les proves i el tauler, el menú fix de baix al mòbil, el mode tast i el món tancat.

---

## 3. Fases

Cada fase és una branca i un PR, i passen `python3 motor/tot.py`, `node motor/prova-tot.js base` i la prova de mons dels 8 mons (la plantilla és comuna).

| Fase | Què | Mida |
|---|---|---|
| **1** | **Mòbil:** el títol, el nom i el curs, visibles i grans; estrelles compactes; so en un sol botó amb panell | M |
| **2** | **Ordinador:** menú centrat amb «⟵ Mons» separat, títol de 22 px, nom de 16 px i etiqueta del curs | S |
| **3** | **Contrast:** banda fosca translúcida, text blanc i una prova de contrast sobre els 8 degradats | S |
| **4** | **Proves i docs:** `prova-visual.js` comprova a 360, 390 i 430 px que `#hola` fa almenys 150 px d'ample i a 1400 px que el menú està centrat (marge esquerre ≈ marge dret, ±8 px). `docs/ESTAT.md`, `CHANGELOG.md` i versió | S |

**Criteris de fet:**
- A 360 px es llegeix «Matemàtiques · Tema 2…», «👤 Mireia #8» i «1r ESO», i també les estrelles.
- A 1400 px, el menú queda centrat sota la capçalera, i el títol i el nom es llegeixen més grans que ara (22 px i 16 px).
- «Com vaig» i «Obertes» es llegeixen bé sobre el verd de Mates (contrast ≥ 4,5:1).
- El so es pot apagar, posar música i canviar el volum des del panell, amb ratolí, dit i teclat.

---

## 4. Decisions que has de prendre

1. **El so en un sol botó amb panell** (música, silenci i volum a dins), o deixem el silenci sempre a la vista i plegem només el volum? *Recomano un sol botó: és el que més espai allibera.*
2. **Estrelles a la capçalera:** `⭐ 666 · 🥇 7` a l'ordinador i només `⭐ 666` al mòbil, amb la resta en tocar-les? *Recomano que sí.*
3. **«Mons» al menú centrat:** al davant amb una ratlla de separació, o fora del menú, a l'esquerra de tot? *Recomano al davant amb la ratlla: no trenca el centrat i es veu que és diferent.*
4. **Capçalera que s'encongeix en baixar:** la fem o no? *Recomano fer-la només a l'ordinador i, al mòbil, deixar-ho per més endavant.*
5. **Avatar arcade a la capçalera** (el sprite del perfil, de 28 px, al costat del nom) en lloc de 👤? *Recomano que sí si el nen ja n'ha triat un; si no, 👤.*
