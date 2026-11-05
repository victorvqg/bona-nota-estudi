# ⭐ Bona Nota · Estudia jugant (1r ESO)

**Web:** https://victorvqg.github.io/bona-nota-estudi/

Bona Nota és una web per **repassar** els temes de 1r d'ESO **jugant**. Cada tema és un «món» amb fitxes, targetes,
tests, jocs i preguntes d'examen. Els nens hi guanyen estrelles, pugen de nivell i competeixen en un rànquing.

No serveix per aprendre un tema des de zero. Primer s'estudia amb el llibre i els apunts de l'institut.
Després, aquí es comprova si se sap de veritat.

| Món | Assignatura | Tema | Carpeta |
|---|---|---|---|
| 1 | Ciències socials | Tema 3: El clima | `sociales/t3-clima/` |
| 2 | Biologia i Geologia | Bloc 1: Univers, Terra i cèl·lula | `bio-i-geo/univers/` |
| 3 | Lengua Castellana | Temas 2 y 3 | `castellano/t2-t3/` |
| 4 | Ciències socials | Les comarques de Catalunya | `sociales/comarques/` |
| 5 | Matemàtiques | Tema 2: Divisibilitat | `matematiques/divisibilitat/` |

La llista oficial de mons és `motor/mons.json`.

> 🔢 **El món 5 (Matemàtiques) es publica el 5-11-2026**, amb el Taller de mates complet (branca `mates-millores`).
> La 📷 correcció de la foto del quadern només funciona quan la funció `bn-corregeix` està desplegada a Supabase.

---

## 🎮 Com funciona (per als nens)

- **Entrar:** a la portada, el nen escriu el seu **nom i un PIN** i de seguida **tria el món**. Dins dels mons ja no
  li torna a demanar res. Amb el PIN, el progrés es desa al núvol i el pot recuperar des d'un altre aparell.
  En un mateix aparell hi poden entrar com a màxim 2 noms. «No ets tu?» (a la portada) o «Canviar d'usuari» (dins d'un món) canvien de nen.
- **El PIN:** **4 números i 1 lletra al final** (per exemple `4587R`). Es pot escriure com es vulgui: sempre surt en
  majúscules, i al principi només deixa posar números. El PIN d'exemple no es pot fer servir.
- **🛡️ Actualització de seguretat:** qui encara té el PIN antic (només 4 números) pot entrar igual, però tot seguit
  se li demana triar-ne un de nou (escrit dues vegades). Fins que no el canvia no pot continuar. Si no hi ha connexió,
  pot fer «Ara no» i se li tornarà a demanar la pròxima vegada. Si ja l'havia canviat en un altre aparell, se li
  demana entrar amb el PIN nou. Al panell d'admin surt «🛡️ PIN nou» o «⚠️ PIN antic» per a cada nen.
- **Cada tema té 3 passos:** 📄 fitxa → 🃏 targetes → ✅ test.
  El test fa 6 preguntes a l'atzar del tema. Amb un **70 %** s'aprova i es passa sol al tema següent.
- **Repàs dels errors:** el que falla torna a sortir avui, i el que encerta torna d'aquí a 3 dies i després a 7 dies.
- **Jocs:** ordenar, fer parelles, classificar, llegir un dibuix, i jocs propis de cada món (per exemple, el mapa de
  les comarques o el garbell dels primers).
- **Exàmens:** l'examen sorpresa (15 preguntes barrejades) i l'examen de veritat, amb nota sobre 10.
- **Preguntes obertes:** el nen escriu la resposta, la compara amb la resposta model i marca les idees clau que ha posat.
  El motor detecta sol les idees que ja hi són: per les paraules i també pels **números** (si la idea clau diu
  «MCM = 144» i el nen ha escrit 144, compta).
- **🔊 Escolta:** llegeix en veu alta la fitxa o la pregunta.
- **Mode suau:** treu les animacions fortes (també s'activa sol si l'aparell ho té demanat).
- **App:** es pot afegir a la pantalla d'inici del mòbil i funciona sense connexió.

### ⭐ Estrelles, superestrelles i nivells

- **Estrelles:** +1 per cada encert als tests i als jocs, +1 per idea clau a les obertes, i regals per combos
  (×5 seguides: +1; ×10: +2). Per jugar net, cada pregunta només dona estrella un cop al dia.
- **A dalt de tot** es veu el total de **tots els mons**. Si toques les estrelles, surt el detall per món.
  El total compta el que hi ha en aquell aparell i també el que hi ha al núvol.
- **🌠 Superestrelles:** cada 50 ⭐ (sumant tots els mons) en surt una, amb animació i música pròpies.
- **Nivells:** d'🐣 Aprenent a 🌟 Llegenda d'or, segons les estrelles de cada món.

### 🏆 Rànquing (a la portada)

- Podi, taula de classificació amb les estrelles de cada món, fletxes ▲▼ (llocs pujats o baixats des de l'última
  vegada), la teva posició («Et falten 13 ⭐ per atrapar…») i els premis de la colla.
- Pestanyes: ⭐ Estrelles, ⏱ Temps, 🏅 Nivell i 📈 Setmana. Compta els últims 120 dies.
- Les icones del rànquing són pixel art propi (`sprites.js`, sense emojis: es veuen iguals a tots els aparells) i cada món té una rajola amb el color de la seva assignatura; a la taula els mons van agrupats per assignatura i, en passar-hi per sobre, cada icona diu què és.
- La classificació ocupa tota l'amplada i no s'estreny: si hi ha molts mons, es desplaça de costat i el nom queda enganxat a l'esquerra.
- **Afegir un món al rànquing:** surt sol de la seva targeta a la portada (`data-id`, `.mat`, `h2`). Per donar-li dibuix i color, a `sprites.js` afegeix-lo a `BN_MON`
  (`id: {ic: "un dibuix de BN_SPR", mat: "Assignatura"}`). Si l'assignatura és nova, afegeix-la també a `BN_MAT` (`curt` = nom curt de la capçalera, `color`, `tint`).
  Sense aquestes entrades no es trenca res: el món surt amb el seu emoji en una rajola grisa i l'assignatura nova agafa un color de reserva.
- **Demo amb nens inventats:** obre la portada amb `?demo` (per exemple `http://localhost:8000/?demo`).
- **🥚 Secret:** toca **5 vegades seguides i ràpid** dins del rànquing (fora dels botons) i es fa una **festa amb música**.
  Del 2n al 4t toc surt una guspira ✨⚡🔥 i un «bip» cada cop més agut. Cada vegada surt una festa diferent:
  🌋 **Terratrèmol** (Grieg, «A la cova del rei de la muntanya», cada cop més ràpid i amb un BUM final),
  🥁 **Desfilada** (Mozart, «Marxa turca», amb els nens del rànquing desfilant) i
  🐝 **Abellots** (Rimski-Kórsakov, «El vol del borinot»). Totes tres músiques són de domini públic.
  Si el so està apagat, la festa només es veu. En mode suau només surt un rètol quiet.

---

## 🔢 Món 5 · Matemàtiques: Divisibilitat

Fet a partir dels 4 fulls del tema: **resum**, **esquema**, **examen** i **full de respostes**.
Les dades són a `motor/dades/divisibilitat.js`.

**8 temes en 3 blocs:**

| Bloc | Temes |
|---|---|
| ➗ Divisibilitat i criteris | La relació de divisibilitat · Múltiples i divisors · Criteris del 2, 3, 5, 9, 10 i 11 |
| 🧩 Primers i factors | Nombres primers i compostos · Descomposició en factors primers |
| 🤝 MCM, MCD i problemes | Mínim comú múltiple · Màxim comú divisor · MCM o MCD? Els problemes |

- **71 preguntes de test.** Les respostes falses són els «errors típics» que avisa l'esquema
  (per exemple, confondre múltiple amb divisor, dir que l'1 és primer o girar els exponents del MCM i el MCD).
- **15 preguntes obertes**, tretes de l'examen i dels «Comprova» del resum: la classe de 28 alumnes, les cabanes,
  els trens, les rajoles, les monedes…
- **20 jocs en 4 seccions** (a la pantalla de jocs surten agrupats; camp `grup` de cada joc):

| Secció | Jocs |
|---|---|
| 🧸 Per entendre | 🟦 Rectangles de quadradets (divisors per parelles, primers) · 🌳 L'arbre de factors · 🐸 Les granotes (MCM) · 🧱 Les rajoles (MCD) · 🧺 El garbell dels primers |
| ✏️ Taller: com a classe | Fitxes 1 a 7 (criteris, múltiples i divisors, primers, l'escala, MCM i MCD, problemes, la divisió llarga) · 🔀 Repàs barrejat · 🔍 Troba l'error |
| 🎮 Jocs ràpids | 💎 Primer o compost? · 🌳 Nombre i factors · 🪜 L'escala de 792 (en acabar, botó «Ara tu» cap a la Fitxa 4) · 🔎 Els criteris · 🤝 MCM o MCD? |
| 📝 Exàmens | Examen de mates (6 exercicis, sobre 10) · Examen sorpresa · Examen de veritat |

- **✏️ Full de brut** (botó al costat del so): per fer càlculs amb el dit o el llapis. No es desa.
- **📒 Quadern a les preguntes obertes**: el nen resol el problema en paper i després **comprova els resultats**
  pas a pas (camp `c` de cada pregunta) o **fa una foto del full** i Claude li diu la primera línia equivocada.

Tots els càlculs que surten al món s'han comprovat amb un programa (47 comprovacions, totes correctes).

---

### ✏️ Taller de mates (exercicis com els de l'escola)

Motor compartit a `motor/eines/`. Un món de mates l'inclou amb línies `//@inclou eines/<fitxer>.js` al final
de les seves dades (`build.py` hi posa el fitxer sencer):

| Fitxer | Què hi ha |
|---|---|
| `exercicis-mates.js` | El Taller: generadors, teclat, fitxes, examen, repàs barrejat i Troba l'error |
| `manipulatius-mates.js` | 🧸 Dibuixos que es mouen: rectangles, arbre, granotes, rajoles |
| `quadern.js` | 📒 Punts de control i foto del quadern a les preguntes obertes |
| `pissarra.js` | ✏️ Full de brut |

- **S'escriu el resultat** amb un teclat numèric gran, en lloc de triar entre 3 opcions.
- **Números nous cada vegada**: cada exercici surt d'un generador, amb 3 nivells (🟢 bàsic, 🟡 mitjà, 🔴 d'examen).
  Els enunciats i problemes surten dels apunts; els números per practicar els fa el programa i es comproven sols.
- **Tres maneres de fer una fitxa** (primer «Com ho vols fer?», després el nivell):
  👀 **Mira com es fa** (un exemple resolt, pas a pas, amb l'explicació de cada pas; no dona estrelles) ·
  ✍️ **Completa** (la primera meitat dels passos ja surt feta i el nen fa la resta) · 💪 **Tot sol**.
- **Pas a pas com a la llibreta**: l'escala fila a fila, la taula de factors per al MCM i el MCD, el càlcul del criteri,
  i la **divisió llarga xifra a xifra** dibuixada com a la llibreta (la «caixa»).
- **💡 Pista** a cada pas (abans de respondre). Aquell pas ja no dona estrella.
- **🤔 Per què?** De vegades, després d'encertar, pregunta per què (3 opcions). No compta per a la nota.
- **🤔 Abans de calcular**: al MCM i al MCD primer cal estimar si el resultat serà més gran o més petit.
- **Problemes en 4 passos**: dades (n'hi ha una que no serveix) → MCM o MCD? → càlcul → frase de resposta amb la unitat.
- **Errors típics explicats** (l'1 no és primer, exponent petit al MCM, un factor no comú al MCD…). Al 2n error ensenya la resposta.
- **«📒 Així s'escriu a la llibreta»** després de cada apartat.
- **🔀 Repàs barrejat**: exercicis de tipus diferents seguits (mai dos d'iguals de costat). També surt com a botó
  en acabar el repàs dels errors (`ASSIG.repasExtra`).
- **🔍 Troba l'error**: un exercici resolt per un company amb un error típic. Cal tocar la primera línia dolenta i dir per què.
- **Examen simulat sobre 10**: 6 exercicis, sense pistes, nota parcial per passos i correcció completa al final.
- Cada tema de la fitxa té el botó **✏️ Practica-ho com a classe** (camp `practica` del tema).
- **Registre per pas**: cada resposta fallada es desa com `exercici|pas|error` (camp `ep`) per al tauler d'admin.
- Generadors preparats per a temes futurs (encara no surten enlloc): **operacions combinades** (jerarquia),
  **suma i resta de fraccions** i **equacions de primer grau**.
- **Proves**: `node motor/prova-generadors.js` fa cada generador centenars de vegades i comprova que els càlculs quadren;
  `prova.js` resol cada fitxa en els tres modes, l'examen (ha de donar un 10), els dibuixos, Troba l'error,
  el full de brut i els punts de control del quadern.

## 🗂️ Com està fet

Tots els mons fan servir el **mateix motor**. Només canvien les **dades** de cada món.

```
index.html                     Portada: targetes dels mons + rànquing
<assignatura>/<tema>/index.html  Pàgina de cada món (GENERADA: no s'edita a mà)
motor/
  plantilla-estudi-interactiu.html   El motor (tot el que fa un món)
  dades/<id>.js                      Contingut de cada món (temes, preguntes, jocs, obertes)
  mons.json                          Llista de mons (carpeta, número, títol, colors, icona…)
  build.py                           Genera un món: plantilla + dades → pàgina
  tot.py                             Genera TOTS els mons, les targetes de la portada i sw.js
  prova.js                           Prova automàtica d'un món (Playwright)
  prova-generadors.js                Prova dels generadors del Taller de mates (sense navegador)
  eines/                             Peces compartides que un món inclou amb //@inclou (Taller de mates, dibuixos, quadern, full de brut)
  local.py                           Servidor local que es posa al dia sol amb GitHub
  eines/mapa-comarques.js            Genera el mapa SVG de les comarques
admin/                         Panell d'administració (activitat, noms, rànquing)
supabase/*.sql                 Base de dades: registre, rànquing, perfils amb PIN, progrés al núvol
sw.js, manifest.webmanifest, icones/   App instal·lable i sense connexió (sw.js el genera tot.py)
```

---

## 🛠️ Feines habituals

### Veure-ho en local

Des de la carpeta del repo, en un Terminal:

```
python3 motor/local.py
```

Obre http://localhost:8000. Cada 20 segons baixa de GitHub el que hi hagi de nou: només cal recarregar la pàgina.
Ctrl+C l'atura.

> Compte: en local també es fa servir la base de dades real. El que hi facis compta al rànquing.
> Per provar, fes servir `?demo` a la portada.

### Provar una branca en local

Les coses grans es preparen en una **branca de prova** (per exemple, `mates-millores`) i es miren en local abans de publicar-les.
Atura `local.py` (Ctrl+C) i, des de la carpeta del repo:

```
git fetch origin
git checkout mates-millores
git pull
python3 motor/local.py
```

Obre http://localhost:8000 i mira-hi els canvis de la branca. Mentre la branca estigui triada,
`local.py` també es posa al dia sol amb els canvis nous d'aquesta branca.

Per tornar a la versió de la web: `git checkout main`.

### Afegir o actualitzar un món

1. Escriu o amplia les dades a `motor/dades/<id>.js` (mateix format que els altres: `ASSIG`, `T`, `OB`).
2. Si és un món nou, afegeix-lo a `motor/mons.json`:
   `dades`, `carpeta`, `mon`, `materia`, `titol`, `desc`, `colors` (3), `ic` (i `llengua: "es"` si és en castellà).
3. Regenera-ho tot i passa la prova:

```
cd motor
python3 tot.py
ESTRICTE=1 node prova.js $PWD/../<carpeta>/index.html
```

La prova ha d'acabar amb «errors: cap».

**Regles del contingut:** tot surt dels apunts o del llibre (res inventat). Mínim **8 preguntes per tema**,
3 opcions i una sola correcta. Els errors falsos han de ser errors típics, mai opcions absurdes.
Si una dada és dubtosa, no va al test i la fitxa diu «pregunta-ho al profe».

### Millorar el motor

Els canvis comuns a tots els mons (sons, estrelles, pantalles…) es fan a `motor/plantilla-estudi-interactiu.html`.
Després, `python3 tot.py` els aplica a tots els mons, i cal passar la prova de cada món.
**Mai s'edita una pàgina generada** (`<assignatura>/<tema>/index.html`): el canvi es perdria i la revisió fallaria.

### Publicar

Fes commit i push a `main`. GitHub Pages ho publica en 1 o 2 minuts.
Per provar una cosa gran abans de publicar-la, treballa en una altra branca i mira-la en local.
Quan ja està bé, es fusiona la branca a `main` (per exemple, `mates-millores` → `main`).

---

## ✅ Revisió automàtica

A cada push, GitHub Actions (`.github/workflows/revisa.yml`) fa tres coses:

1. Torna a generar tots els mons i la portada. Si una pàgina pujada no coincideix (editada a mà o sense regenerar), falla i diu quins fitxers.
2. Passa la prova dels generadors del Taller de mates (`motor/prova-generadors.js`).
3. Passa la prova de cada món en mode estricte: tests, jocs, exàmens, repàs, obertes, estrelles, superestrelles i rànquing de la capçalera.
   També exigeix 8 preguntes per tema, i que la resposta correcta no sigui massa sovint (ni massa poc) la més llarga.

El resultat surt a la pestanya **Actions** del repo.

---

## 🔒 Dades

- **Al navegador** (localStorage): el progrés de cada nom, separat per món.
- **Al núvol** (Supabase), només amb nom i PIN: el progrés de cada món, per poder canviar d'aparell.
- **Registre d'activitat** (`bn_log`): què fa cada nen i quan, per al panell d'admin i el rànquing. Només s'hi pot escriure; llegir-lo només ho pot fer l'admin.
- **Rànquing:** `bn_ranking_mons` (total i estrelles per món). Els noms amagats o no permesos no hi surten.
- **PIN:** xifrat (bcrypt), mai es guarda tal qual. 5 errors en 15 minuts bloquegen el nom 15 minuts. Format i canvi: `supabase/bn_pin_nou.sql`.
- Els canvis a la base de dades es fan a Supabase i el seu SQL es desa a `supabase/`.

### 📷 Correcció de la foto del quadern

A les preguntes obertes de mates (📒 L'has resolt al quadern?), el nen pot fer una foto del full i Claude li diu on s'ha equivocat. Al món s'activa amb `foto:true` a ASSIG.

- **Què s'envia:** el nom i el PIN, l'enunciat, la resposta model, les idees clau i la foto (reduïda a 1.600 px).
  Ho rep la Edge Function `bn-corregeix` de Supabase, que ho passa a Claude (Anthropic).
- **Què torna:** el que Claude ha llegit, línia per línia, si està bé, i la **primera línia equivocada** amb
  una frase curta que explica què falla i per què, sense donar la solució.
- **La foto no es desa enlloc** (ni a Supabase ni als registres). Només es compta quantes fotos envia cada nom cada dia (`bn_fotos`).
- **Límits:** només amb nom i PIN; 10 fotos per nen i dia i 200 entre tots cada dia; fotos de 4 MB com a màxim.
- **Cal activar-la a part** (SQL, clau d'Anthropic i desplegar la funció sense verificació de JWT):
  vegeu [`supabase/functions/bn-corregeix/README.md`](supabase/functions/bn-corregeix/README.md).

### Què es registra (des del 4-11-2026) i el tauler d'admin

Cap dada nova del nen: només el nom de sempre. El camp `detall` de cada registre porta:

| Event | Detall |
|---|---|
| `entra` | `h` (hora local), `dw` (1 = dilluns … 7 = diumenge), estrelles, temes aprovats |
| `fitxa` | tema, `s` (segons llegint-la), `fi` (1 si ha arribat al final) — s'envia en sortir |
| `targetes` | tema, `s`, `vistes` de `n`, `girs`, `fi` — s'envia en sortir |
| `test` | tema, `pc`, `mode` (tema · repas), `s` total i `q`: una entrada per pregunta |
| `examen` | `joc` (examen · examreal), `pc`, `mode` (sorpresa · real · real-temps), `s`, `temes` i `q` |
| `joc` | `joc`, `pc`, `s`, `enc`, `err`; el MAPA també `mode` i `f` (comarques fallades) |
| `oberta` | número, tema, `pc`, `s`, `idees`/`de`, `det` (detectades al text), `falten` (punts clau no marcats) |

Cada pregunta contestada va a `q` com un text curt **`tema/núm:encert:segons:opció`**, per exemple
`lle/4:0:7:2` (tema «lle», pregunta 4, fallada, 7 segons, ha triat l'opció 2 del llibre de dades).
Ocupa molt menys que una llista dins de la base de dades; si un registre passés de 1.700 bytes, només es
guarden les fallades.

**Identificadors de pregunta estables:** `motor/qids.py` dona un número a cada pregunta la primera vegada que
la veu i el desa a `motor/qids.json` (lligat a una empremta del text). Si reordenes o afegeixes preguntes, les
que hi havia mantenen el número; un número no es torna a fer servir mai. Si canvies el text d'una pregunta,
compta com una de nova. `tot.py` també genera `admin/preguntes.json` (id → text, opcions, correcta, tema) perquè
el tauler mostri el text de les preguntes.

**Tauler** (`admin/`, pestanya 📊 Tauler): xifres amb comparació amb el període anterior, alertes, activitat per
dia, mapa de calor hora × dia, evolució de les notes, constància i ratxa, domini nen × tema, preguntes més
fallades amb el parany més triat i, filtrant per un nen, en què passa el temps. Les dades arriben ja agregades
del servidor amb les funcions de `supabase/bn_admin_tauler.sql` (`bn_admin_resum`, `_activitat`, `_calor`,
`_domini`, `_fallades`, `_evolucio`, `_alertes`), que demanen el correu i la contrasenya d'admin.
L'apartat **✏️ Taller de mates: on s'equivoquen** (exercici · pas · error · vegades · nens) surt de `bn_admin_errors_taller`, a `supabase/bn_admin_errors_taller.sql` (s'executa una vegada, després de `bn_admin_tauler.sql`), i llegeix el camp `ep` (`"exercici|pas|error"`, un per cada resposta fallada) que el Taller afegeix als events `joc` i `examen`.
