# ⭐ Bona Nota · Estudia jugant (1r ESO)

**Web:** https://bonanota.net · **Versió:** 2.32.0 ([historial de canvis](CHANGELOG.md))

Bona Nota és una web per **repassar els temes de 1r d'ESO jugant**. Cada tema és un «món» amb fitxes, targetes, tests, jocs i preguntes d'examen.
Els nens hi guanyen estrelles, pugen de nivell i competeixen en un rànquing.

Aquest README explica **com està feta la web i com s'hi treballa**. El que no és tècnic té el seu document:

| Si vols saber… | Llegeix |
|---|---|
| Quins mons hi ha i com es juga | [`docs/MONS.md`](docs/MONS.md) |
| Com es construeix un món d'Anglès (frases amb buits) | [`docs/MON-ANGLES.md`](docs/MON-ANGLES.md) |
| Com es posen les notes | [`docs/AVALUACIO.md`](docs/AVALUACIO.md) |
| Com es guanyen les estrelles | [`docs/PUNTUACIO.md`](docs/PUNTUACIO.md) |
| Quin ús és sa: temps, descans i vigília d'examen | [`docs/BON-US.md`](docs/BON-US.md) |
| Com funciona el xat de la colla | [`docs/XAT.md`](docs/XAT.md) |
| Com es llegeix el benestar al tauler | [`docs/BENESTAR.md`](docs/BENESTAR.md) |
| Guia no tècnica per a pares i mares | [`pares/index.html`](pares/index.html) (`https://bonanota.net/pares/`) |
| Què ha canviat a cada versió | [`CHANGELOG.md`](CHANGELOG.md) |

> 🌐 La web té domini propi, **bonanota.net** (fitxer `CNAME`). L'adreça antiga de GitHub Pages i `www.bonanota.net` hi redirigeixen soles.

## Índex

| Vull… | Apartat |
|---|---|
| Entendre com està muntat tot, en un minut | [1. Visió general](#1-visió-general) |
| Veure-ho en local, afegir un món o publicar | [2. Feines habituals](#2-feines-habituals) |
| Pujar el número de versió | [3. Versions](#3-versions) |
| Trobar un fitxer | [4. On és cada cosa](#4-on-és-cada-cosa) |
| Entendre o canviar el motor dels mons | [5. El motor](#5-el-motor) |
| Tocar la portada, el rànquing, el xat o el perfil | [6. Portada, xat i perfil](#6-portada-xat-i-perfil) |
| Saber com s'instal·la i s'actualitza al mòbil | [7. App: sense connexió i actualització](#7-app-sense-connexió-i-actualització) |
| Saber quines dades es guarden i on | [8. Dades](#8-dades) |
| Fer servir o ampliar el tauler d'admin | [9. Tauler d'administració](#9-tauler-dadministració) |
| Passar les proves o entendre per què falla l'Action | [10. Proves i revisió automàtica](#10-proves-i-revisió-automàtica) |
| Saber com hi treballen els agents d'IA | [11. Qui hi treballa](#11-qui-hi-treballa-claude-i-gemini) |

**Tres regles que valen per a tot el repo:**

1. **Mai s'edita una pàgina generada** (`<assignatura>/<tema>/index.html`, `sw.js`, `versio.json`, `admin/preguntes.json`, `motor/regles.json`, `admin/regles.json`). Es canvia `motor/` i es regenera amb `python3 motor/tot.py`.
2. **Cada canvi va per una branca i un PR.** Fusionar el PR és publicar.
3. **El contingut surt dels apunts o del llibre.** Res inventat.

---

## 1. Visió general

És una web estàtica en HTML, CSS i JavaScript, sense framework ni dependències al navegador, publicada amb GitHub Pages.
Python només intervé abans de publicar, per generar les pàgines. Supabase guarda el que ha de sobreviure al dispositiu: progrés, registre i rànquing.

```
 motor/dades/<id>.js  ──┐  ASSIG, T, OB + //@inclou eines/*.js
 motor/mons.json      ──┤
 motor/qids.json      ──┼──▶ build.py ──▶ <assignatura>/<tema>/index.html
 motor/plantilla-…html──┘                 (un sol fitxer per món, amb tot a dins)

 tot.py = build.py per a cada món + portada + admin/preguntes.json + versio.json + sw.js

 Navegador   S (estat) ──▶ localStorage ──(8 s)──▶ RPC bn_progres_desa ──▶ Supabase
             registra() ──────────────────────────▶ taula bn_log ──▶ rànquing i tauler
```

| Peça | Què fa |
|---|---|
| **Motor** (`motor/`) | Tot el que fa un món: pantalles, tests, jocs, repàs, estrelles, so, sincronització |
| **Portada** (`index.html`) | Entrada amb nom i PIN, targetes dels mons i rànquing |
| **App** (`sw.js`, `manifest.webmanifest`) | Instal·lació al mòbil, funcionament sense connexió i actualització |
| **Tauler** (`admin/`) | Activitat, domini per tema, gestió dels nens i còpies de seguretat |
| **Supabase** (`supabase/`) | SQL de les funcions i taules, i la funció `bn-corregeix` |
| **Perfil** (`perfil/`) | Pàgina on el nen tria el seu aspecte (animal, insígnia i estil) |
| **PDFs** (`skills/bona-nota/`) | Skill que genera paquets d'estudi en PDF, separada de la web |

**La idea central:** un món no té codi propi. És la **plantilla** (el motor, igual per a tots) més un **fitxer de dades** (el contingut del tema).
Per això afegir un món és escriure dades, i millorar el motor millora tots els mons alhora.

---

## 2. Feines habituals

Les ordres d'aquest apartat s'escriuen en un **Terminal del Mac, des de la carpeta del repo**.

### Veure-ho en local

```
python3 motor/local.py
```

Obre http://localhost:8000. Cada 20 segons baixa de GitHub el que hi hagi de nou: només cal recarregar la pàgina.
Ctrl+C l'atura.

- **Admin en local:** http://localhost:8000/admin/ (amb la barra final; sense barra també funciona).
- **Service worker:** a localhost no s'instal·la (així sempre veus l'última versió) i, si n'hi havia un d'abans, s'esborra sol.
  Per provar l'app sense connexió en local, obre la pàgina amb `?sw`.
- **Des del mòbil (mateixa wifi):** `local.py` només respon al mateix Mac. Per al mòbil, des de la carpeta del repo:
  `python3 -m http.server 8000 --bind 0.0.0.0` i obre `http://IP-del-Mac:8000` (la IP: `ipconfig getifaddr en0` o `en1`).

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

### Obrir una pantalla directament

Per provar una pantalla sense passar pel PIN, afegeix-ho a l'adreça d'un món. Es treballa en mode demo: no es registra res ni es desa al núvol.

| A l'adreça | Què obre |
|---|---|
| `?tast=1` | Mode tast anònim (a la portada `/?tast=1` o a un món `/<mon>/?tast=1`): sense compte, sense rànquing i sense escriure res a `localStorage` |
| `?demo` | L'inici del món amb un usuari de prova |
| `?joc=<id>` | Un joc (a mates, `?joc=err` és Troba l'error) |
| `?tema=<número>` | Un tema, comptant des de 0 |
| `?vista=<vista>` | Una vista del món (per exemple, `jocs`) |
| `?joc=<fitxa>&llibreta=1` | Una fitxa del Taller, directament a l'exemple resolt |

### Afegir o actualitzar un món

**El mínim perquè el món surti a la web:**

1. Escriu o amplia les dades a `motor/dades/<id>.js` (mateix format que els altres: `ASSIG`, `T`, `OB`; vegeu «Format de les dades» a l'apartat 5).
2. Si és un món nou, afegeix-lo a `motor/mons.json`:
   `dades`, `carpeta`, `mon`, `materia`, `titol`, `desc`, `colors` (3), `ic` (i `llengua: "es"` si és en castellà).
3. Regenera-ho tot i passa la prova:

```
cd motor
python3 tot.py
ESTRICTE=1 node prova.js $PWD/../<carpeta>/index.html
```

La prova ha d'acabar amb «errors: cap».

**Si el món és nou, també cal tocar això** (no surt sol de `mons.json`):

| On | Què |
|---|---|
| `admin/index.html` | El nom del món a `ASSIGS` i a `XMON`, perquè el tauler no mostri només l'id |
| `supabase/bn_control.sql` | L'id del món a les tres llistes de mons vàlids, i aplicar el SQL a Supabase. Sense això el món funciona, però no es pot tancar des del «Control ràpid» |
| `sprites.js` | Opcional: dibuix i color al rànquing (`BN_MON` i, si l'assignatura és nova, `BN_MAT`). Sense això surt amb el seu emoji |
| `motor/ilu/<id>.svg` | Opcional: il·lustració de la targeta de la portada. Sense això surt l'emoji |
| `motor/prova-admin-alta.js` i `motor/prova-admin-benestar.js` | Porten escrit el nombre de mons: cal sumar-n'hi un |
| `docs/MONS.md`, `docs/ESTAT.md`, `CHANGELOG.md` i la versió d'aquest README | Un món nou puja la versió MENOR (apartat 3) |

**Regles del contingut:**

- Tot surt dels apunts o del llibre (res inventat). Si una dada és dubtosa, no va al test i la fitxa diu «pregunta-ho al profe».
- Mínim **8 preguntes per tema**, 3 opcions i una sola correcta. Les opcions falses han de ser errors típics, mai opcions absurdes.
- La resposta correcta ha de ser l'opció més llarga entre el 15 % i el 40 % de les vegades: ni gairebé sempre ni gairebé mai, perquè totes dues coses són pistes.
- **Cada enunciat de pregunta ha de ser únic a tot el món.** La prova i els identificadors (`qids`) reconeixen una pregunta pel seu text: dues preguntes «Quina frase és correcta?» amb opcions diferents es confonen.
- La resposta model (`m`) de cada oberta ha d'estar escrita amb frases (4 paraules per idea i algun connector o un `=`): la prova ho comprova.

Per afegir **frases amb buits** a qualsevol món, a `ASSIG.jocs` hi van jocs `tipus:"frases"`. El format i les regles són a [`docs/MON-ANGLES.md`](docs/MON-ANGLES.md) (serveix igual per a Català o Castellano, canviant la llengua).

Per afegir un **Troba l'error** a qualsevol món, a `ASSIG.jocs` hi va un joc `tipus:"error"`. El format és al comentari de la secció «TROBA L'ERROR GENÈRIC» de la plantilla.

### Millorar el motor

Els canvis comuns a tots els mons (sons, estrelles, pantalles…) es fan a `motor/plantilla-estudi-interactiu.html`.
Després, `python3 tot.py` els aplica a tots els mons, i cal passar la prova de cada món.
**Mai s'edita una pàgina generada** (`<assignatura>/<tema>/index.html`): el canvi es perdria i la revisió fallaria.

### Generar els PDFs d'estudi

La skill `skills/bona-nota/` converteix fotos del llibre o apunts en un paquet de PDFs: resum, esquema visual, examen, full de respostes,
preguntes orals i connexions, o el dossier d'un llibre de lectura. Comença per `skills/bona-nota/SKILL.md`.

### Publicar

Cada canvi va per una branca i un PR cap a `main`, mai directament a `main`:

1. Branca nova des de `main` actualitzat.
2. `python3 motor/tot.py`, les proves i el commit.
3. Push de la branca i PR cap a `main`.
4. Quan l'Action «Revisa Bona Nota» del PR surt en verd, es fusiona amb squash i s'esborra la branca.
   Fusionar és publicar: GitHub Pages ho posa a **bonanota.net** en 1 o 2 minuts. Si l'Action falla, s'arregla a la mateixa branca.

Si el canvi el notarà qui fa servir l'app, el mateix PR puja la versió (apartat 3).

---

## 3. Versions

Cada versió de Bona Nota té un número de tres parts: `MAJOR.MENOR.PEDAÇ` (per exemple, `2.3.0`).
El que ha canviat a cada versió és a [`CHANGELOG.md`](CHANGELOG.md), i la primera entrada és la versió actual.

| Què puja | Quan | Exemple |
|---|---|---|
| **MAJOR** (`2.3.0` → `3.0.0`) | Un canvi gran de l'app, o un que obliga a migrar el progrés dels nens | Bona Nota 2.0 |
| **MENOR** (`2.3.0` → `2.4.0`) | Una cosa nova: un món, un joc, una funció | Món 6 · Català |
| **PEDAÇ** (`2.3.0` → `2.3.1`) | Una correcció o un ajust de contingut, sense res nou | Arreglar una pregunta mal escrita |

Si un canvi només toca documentació o proves, la versió no puja.

**Com es puja una versió:**

1. Al mateix PR del canvi, afegeix l'entrada nova a dalt de tot de `CHANGELOG.md` (número, data i apartats Afegit, Canviat o Corregit).
2. Canvia el número a la capçalera d'aquest README.
3. Executa `python3 motor/tot.py`: llegeix la primera entrada del `CHANGELOG.md` i posa el número al peu de la portada i de cada món, i a la capçalera del tauler.
4. Quan el PR estigui fusionat, posa l'etiqueta al commit de `main`:

```
git switch main
git pull
git tag -a v2.4.0 -m "Bona Nota 2.4.0"
git push origin v2.4.0
```

> `versio.json` i el `VERSIO` de `sw.js` no són aquest número. Són empremtes que genera `motor/tot.py` a cada canvi perquè els mòbils
> es posin al dia.

---

## 4. On és cada cosa

```
index.html                     Portada: targetes dels mons + rànquing
sprites.js                     Pixel art (avatars, icones del rànquing, insígnies) dibuixat com a SVG
perfil/index.html              Pàgina de perfil del nen: animal, perfil arcade i estil (PLAYER SELECT)
pares/index.html               Guia oberta i sense tecnicismes per a les famílies (bonanota.net/pares)
<assignatura>/<tema>/index.html  Pàgina de cada món (GENERADA: no s'edita a mà)
motor/
  plantilla-estudi-interactiu.html   El motor (tot el que fa un món)
  dades/<id>.js                      Contingut de cada món (ASSIG, T, OB)
  mons.json                          Catàleg de mons (carpeta, número, títol, colors, icona…)
  build.py                           Genera un món: plantilla + dades → pàgina
  tot.py                             Ho genera tot (mons, portada, admin/preguntes.json, versio.json, sw.js)
  qids.py, qids.json                 Identificadors estables de les preguntes
  sw-plantilla.js                    Plantilla del service worker
  ilu/<id>.svg                       Il·lustració de la targeta de cada món
  eines/                             Codi compartit (vegeu «Eines» a l'apartat 5)
  regles.json                        Regles del joc extretes de la plantilla (les genera tot.py; còpia a admin/)
  dificultat.json, dificultat.py     Preguntes difícils (⚡) i l'script que en fa la llista docs/DIFICILS.md
  prova.js                           Prova automàtica d'un món (Playwright)
  prova-generadors.js                Prova dels generadors del Taller de mates (sense navegador)
  prova-regles.js                    Prova que les regles copiades coincideixen amb la plantilla
  prova-nuvol.js, prova-perfil.js, prova-pares.js   Proves del núvol, del perfil i de la guia per a famílies
  prova-xat*.js                      Proves del xat: el SQL (PGlite) i la portada
  prova-admin-*.js, prova-control-sql.js   Proves del tauler i del seu SQL (vegeu l'apartat 10)
  prova-pin-intents-sql.js, prova-fotos-sql.js   Proves del bloqueig de PIN i del permís de fotos (PGlite)
  local.py                           Servidor local que es posa al dia sol amb GitHub
admin/                         Tauler d'administració
supabase/*.sql                 Base de dades: registre, rànquing, perfils amb PIN, progrés al núvol, aspecte del nen, xat de la colla
supabase/functions/bn-corregeix/   Correcció de la foto del quadern
skills/bona-nota/              Skill que genera els PDFs d'estudi (skills/bona-nota.zip és el paquet)
sw.js, manifest.webmanifest, icones/   App instal·lable (sw.js el genera tot.py)
versio.json                    Empremta de l'última publicació (la genera tot.py)
CNAME                          Domini de la web: bonanota.net
CHANGELOG.md                   Historial de versions
AGENTS.md, CLAUDE.md, nucli.json, docs/   Regles i memòria del projecte per als agents d'IA
```

---

## 5. El motor

`motor/plantilla-estudi-interactiu.html` conté l'HTML, el CSS i el JavaScript d'un món, unes 1.800 línies. **Un món és aquesta plantilla més un fitxer de dades.**
Aquest apartat és per a qui ha de canviar el motor o vol entendre què fa per dins. Per afegir un món n'hi ha prou amb «Format de les dades».

Cap món té codi propi a la plantilla: les diferències surten d'`ASSIG` i de les eines que inclou. Cada pàgina generada és autònoma: només carrega a part les fonts.

### De les dades a la pàgina

**`build.py <dades> [carpeta]`** genera un món:

1. Substitueix cada línia `//@inclou eines/<fitxer>.js`, tant de les dades com de la plantilla, pel contingut del fitxer.
2. Construeix `MONS`, la llista de tots els mons, que serveix per sumar estrelles i enllaçar-los. La treu de `mons.json` i de les dades, llegint-les fins a `const T=`.
3. Construeix `QIDS`, els identificadors estables de les preguntes (`qids.py`).
4. Omple `/*DADES*/`, `/*MONS*/` i `{{TITOL}}`, i s'atura si en queda algun sense omplir.

El títol i l'id es llegeixen amb expressions regulars: `id:"…"`, `nom:"…"` i `curs:"…"` han d'estar escrits literalment a `ASSIG`, abans de `const T=`.

**`tot.py`** ho genera tot, en aquest ordre:

| Pas | Què fa |
|---|---|
| 1 | Executa `build.py` per a cada entrada de `mons.json` |
| 2 | Compta temes i jocs avaluant les dades amb Node |
| 3 | A `index.html`: reescriu les targetes (`MONS:inici..fi`), copia `so-mobil.js` i `actualitza.js` entre les seves marques i posa `sprites.js?v=<empremta>`; a `perfil/index.html` copia els mateixos blocs i posa el mateix `?v=` (i `build.py` el posa a cada món) |
| 3b | Escriu `admin/preguntes.json` (id → text, opcions, correcta, tema) |
| 3b2 | Extreu les constants de regles de `motor/plantilla-estudi-interactiu.html` i escriu `motor/regles.json` i `admin/regles.json` |
| 3c | Llegeix la primera entrada de `CHANGELOG.md` i posa el número al peu de la portada i de cada món, i a la capçalera i a l'entrada del tauler (`VERSIO_ADMIN`) |
| 4 | Calcula una empremta del contingut i la posa a cada pàgina (`VER`), a `versio.json` i a `sw.js` |

L'empremta es calcula amb el buit `__BN_VERSIO__` encara sense omplir, perquè no depengui d'ella mateixa. Si `tot.py` es torna a executar sense canvis, el resultat és idèntic: la revisió automàtica ho aprofita per detectar pàgines editades a mà.

### Format de les dades (`motor/dades/<id>.js`)

**`ASSIG`** descriu el món:

| Camp | Per a què serveix |
|---|---|
| `id`, `nom`, `tema`, `curs`, `ic` | Identitat i títol. `id` és el que es desa al núvol i al registre |
| `clau` | Prefix de `localStorage` (per defecte, `bn_<id>`) |
| `color` | 3 colors que omplen les variables CSS `--g1`, `--g2` i `--g3` |
| `blocs` | `[{titol, n}]`: agrupa els temes. La suma de `n` ha de donar el nombre de temes |
| `jocs` | Llista de jocs (vegeu «Jocs») |
| `boss` | `{nom, spr}`: el repte final del món |
| `foto`, `pissarra`, `repasExtra`, `destacat` | Opcionals: foto del quadern, full de brut, joc ofert en acabar el repàs i joc amb botó gran a l'inici |
| `peu` | Ja no es mostra: només deixa constància d'on surt el contingut |

**`T`** són els temes. Cada tema porta `id`, `ic`, `col`, `titol`, `font`, `idea`, `pts`, `truc`, `compte` i, a mates, `practica`, més:

- `fc`: targetes, `[anvers, revers]`.
- `q`: preguntes, `[enunciat, [3 opcions], índexCorrecte, explicació]`.

**`OB`** són les preguntes obertes: `t` (tema), `q` (enunciat), `p` (idees clau), `m` (resposta model) i, a mates, `c` (punts de control del quadern).

### Estat i sincronització

Tot el progrés d'un nen en un món és un sol objecte, `S`, creat per `BUIT()`:

| Camp | Contingut |
|---|---|
| `punts`, `fonts`, `ftema`, `fjoc` | Estrelles del món i d'on han sortit |
| `temes[id]` | `{fitxa, fc, intents, fallades, valoracio}` |
| `jocs[id]`, `ob`, `examens` | Resultats de jocs, obertes i exàmens |
| `rep`, `apresos` | Capses del repàs espaiat i errors apresos |
| `est` | Què ja ha donat estrella avui |
| `temps`, `dies`, `ultim`, `mod` | Temps, dies actius, últim tema i hora de l'última modificació |

Al `localStorage` hi ha `<clau>_perfils` (tots els noms d'aquell món), `<clau>_actiu`, `bn_pins` i `bn_jugador`.

Cada canvi passa per `desa()`, que marca `S.mod`, guarda al dispositiu, repinta la capçalera i programa la pujada. La pujada s'agrupa: `nuvolProg()` espera 8 segons i crida la RPC `bn_progres_desa`. En tancar la pàgina, `pagehide` envia el que quedi amb `keepalive`.

En entrar, i també en obrir un món on el nen ja era l'actiu, `bn_progres_llegeix` baixa el núvol i `fusiona()` el combina amb el dispositiu **sense perdre mai res**.
Fins que aquesta baixada no ha anat bé (`NUV_LLEST`), `nuvolPuja()` no puja res: un aparell amb el progrés vell no pot trepitjar el del núvol.
Si tot i així el núvol té més estrelles que el que arriba, `bn_progres_desa` no ho desa i retorna `-2`; l'app baixa, fusiona i torna a pujar (un sol cop).
Els tests, jocs, exàmens i obertes registren també `punts` i `fonts`, de manera que el rànquing no perd estrelles si el navegador es tanca de cop.

| Tipus de dada | Es queda |
|---|---|
| Números | El més alt |
| Llistes | La més llarga (`dies`: la unió) |
| Sí/no | Sí, si algun ho és |
| Objectes | Es fusionen camp a camp |
| Textos | El del progrés més recent |

**Reinicis:** quan l'admin esborra un progrés, el núvol retorna la data del reinici. El dispositiu buida primer el que tenia, i si un dispositiu vell intenta pujar dades, `bn_progres_desa` retorna `-1` i l'app baixa l'estat bo.

### Pantalles

No hi ha router. Cada pantalla és una funció que escriu dins de `<main id="app">`:

| Funció | Pantalla |
|---|---|
| `vista(v)` | `inici`, `temes`, `jocs`, `obertes` o `analitica`. Abans comprova el PIN i, si cal, envia a `benvinguda` o a triar un PIN nou |
| `obre(i)` + `pintaTema()` | Un tema, amb les pestanyes `fitxa`, `targetes` i `test` (variable `pest`) |
| `joc(id)` | Reparteix cap al tipus de joc, `examen()` o `examenReal()` |
| `boss()` | El repte final |

En arrencar, els paràmetres `?joc=`, `?tema=` i `?vista=` obren directament una pantalla. Activen `MODE_DEMO`, que no registra res ni toca el núvol.

### Tests i exàmens

`test(ordre, k, bones, clau, pool, cb)` es crida a si mateixa per a cada pregunta. Sense `pool`, treballa amb les preguntes del tema; amb `pool` i `cb`, la fan servir els exàmens, el repàs i els jocs.

- **Test de tema:** `NTEST` = 6 preguntes a l'atzar i s'aprova amb `APROVA` = 70.
- **Examen sorpresa** (`examen()`): 15 preguntes de tots els temes.
- **Examen de veritat** (`examenReal()`): 10 preguntes, sense correcció fins al final, nota sobre 10 i temps opcional.
- **Cada resposta** s'anota a `TQ` per al registre i, si cal, va al repàs amb `repAnota()`. Un encert amb pista no compta.
- **Escut del combo:** amb un combo de 3 o més, un error ofereix una pregunta germana del mateix tema que aquell test no ha tret.

### Estrelles i nivells

> La puntuació sencera, explicada perquè l'entengui tothom (què dona cada cosa, els tres combos, els límits, els nivells, el rànquing i on és cada cosa al codi), és a [`docs/PUNTUACIO.md`](docs/PUNTUACIO.md).

`suma(n)` afegeix estrelles i les atribueix a la font activa (`FONT`), que alimenta `fonts`, `ftema` i `fjoc`.

**Com es compten i com s'evita que es puguin inflar:**

- `diaEst()` guarda a `S.est` què ja ha premiat avui. `estPregunta()` només dona estrella el primer cop del dia, i `JOCSTAR` fa el mateix amb els jocs.
- Els nivells surten de la taula `NIVELLS` i depenen de les estrelles de cada món.
- `puntsTots()` suma tots els mons, llegint el `localStorage` de cadascun i el que ha baixat `carregaPuntsMons()`. Cada `SUPER` = 50 ⭐ surt una superestrella.

**Els combos i els premis extra** (cada un amb el seu topall diari):

- **Combo net** (2.8.0): el combo (`ratxa()`) només puja amb respostes que donen estrella. Les preguntes repetides el mateix dia i el repàs no el fan pujar ni el trenquen; un error el trenca sempre. `ratxaHtml()` en mostra la barra a cada pregunta.
- **El repàs paga** (2.8.0): `premiRepas()` dona +1 ⭐ per cada error encertat al repàs, un cop per error i dia, fins a `REP_MAX` = 10 al dia per món (`S.est.r` i `S.est.rn`). Les +2 ⭐ d'«après» es mantenen.
- **✍️ Triple combo** (2.9.0): `obRatxa()` porta la ratxa d'obertes bones del dia (`S.est.oc`) i paga ×3 +3 ⭐ i ×6 +5 ⭐ fins a `OB_COMBO_MAX` = 8 al dia per món (`S.est.ocp`, font «triple»). Una oberta és bona si puntua, té el 60 % de les idees i passa `obFrases()` (4 paraules per idea i un connector o =). Amb totes les idees, +1 ⭐ «resposta de 10».
- **⚡ Super combo** (2.10.0): `ratxaDif()` compta les preguntes difícils (`difDe(q)===3`, de `motor/dificultat.json` via `QDIF`) encertades seguides que donen estrella, amb una ratxa que dura tot el dia (`S.est.sd`; un error la trenca); 3 seguides +3 ⭐, 5 seguides +5 ⭐ fins a `SUPER_MAX` = 10 al dia per món (`S.est.sp`, font «super»). La llista per revisar-les és `docs/DIFICILS.md` (`python3 motor/dificultat.py`).

**D'on surt el que es mostra:**

- **Com es guanyen**: la llista `COM_GUANYAR` és l'única font de les dues targetes d'estrelles. Si un premi canvia, es canvia aquí i a `docs/AVALUACIO.md`.
- **Estrelles per activitat**: `iniciActivitat()` en començar un test, joc, oberta, boss o repàs, i `detallLog()` posa `est` (estrelles guanyades) als registres `test`, `joc`, `examen` i `oberta`. El tauler en treu les estrelles per minut de cada activitat.

#### D'on venen els combos: el pla de millora de les estrelles (2.8 → 2.10)

Els passos 1, 2 i 3 d'aquest pla ja són a l'app, amb les versions de la taula; el pas 4 encara no té versió.

L'estudi n2505 va trobar que les estrelles surten sobretot dels jocs (la meitat) i que les preguntes obertes, les més semblants a l'examen, en donen molt poques. També que el combo es podia inflar repetint tests i que el repàs no pagava res mentre es feia. El pla n2506 ho arregla en tres passos, cada un amb el seu PR i la seva versió:

| Pas | Versió | Issue | Què canvia |
|---|---|---|---|
| 1 · Mesurar i tapar forats | 2.8.0 | #13 | Combo net, repàs que paga, barra de ratxa, targeta amb totes les fonts i tauler amb l'origen de les estrelles i les estrelles per minut |
| 2 · ✍️ Triple combo | 2.9.0 | #14 | 3 obertes ben explicades seguides +3 ⭐, 6 seguides +5 ⭐ (topall 8 al dia per món), «resposta de 10» +1 ⭐ i filtre perquè una llista de paraules no compti |
| 3 · ⚡ Super combo | 2.10.0 | #15 | Preguntes difícils marcades a `motor/dificultat.json` amb ⚡; 3 difícils seguides +3 ⭐, 5 seguides +5 ⭐ (topall 10 al dia per món) |
| 4 · Calibrar | — | #16 | Quan hi hagi prou respostes, la dificultat es calcula amb l'encert real dels nens |

Les estrelles ja guanyades no es toquen. Una setmana després de cada pas es miren al tauler les xifres de la secció 5 de l'estudi.

- Estudi, amb les dades i les 7 decisions aprovades: [`docs/superpowers/specs/2026-11-09-estrelles-estudi.md`](docs/superpowers/specs/2026-11-09-estrelles-estudi.md)
- Pla d'implementació, tasca per tasca: [`docs/superpowers/plans/2026-11-09-estrelles-combos.md`](docs/superpowers/plans/2026-11-09-estrelles-combos.md)

### Repàs espaiat

El que el nen falla torna a sortir fins que ho sap: avui, al cap de 3 dies i al cap de 7. És un sistema de capses guardat a `S.rep`, amb clau `<tema>|<pregunta>`. Cada entrada té la capsa `c` i la data `prox`.

```
error ─▶ capsa 0 (avui) ─encert─▶ capsa 1 (+3 dies) ─encert─▶ capsa 2 (+7 dies) ─encert─▶ APRÈS (+2 ⭐)
          ▲                                                                                        
          └──────────────────────── error durant el repàs: capsa 0, torna demà
```

`REP_DIES` = `[0,3,7]`, i `repMou()` fa tots els canvis de capsa. `repValid()` descarta els errors d'una pregunta que ja no existeix.

Una eina o un joc propi pot posar els seus errors al mateix repàs:

```js
(window.BN_REP_TIPUS=window.BN_REP_TIPUS||{}).<tipus>={ic, titol, peu, max,
  valid: r => true/false,          // l'error encara té sentit en aquest món?
  nom:   r => "text per a la llista",
  juga:  (items, fi) => { … fi([true/false per a cada item]) }};
// durant el joc normal, cada error:  repAnotaExt("<tipus>", clau, dades, false)
```

El motor els desa a `S.rep`, els mou de capsa i dona el +2 ⭐ quan queden apresos. Ja ho fan servir el Taller de mates (`mx`, a `eines/exercicis-mates.js`) i el MAPA (`mapa`, a `dades/comarques.js`). Les dades no poden portar un camp `tipus`: el trepitjaria.

### Boss, missions i preguntes obertes

- **Boss:** `bossEstat()` l'obre amb el 70 % dels temes aprovats (`BOSS_DESBLOQ`) o amb un examen de 70 o més. Les rondes es construeixen amb el contingut que el món ja té, i guanyar dona `BOSS_ESTRELLES` = 10 un cop al dia.
- **Missions:** `missionsAvui()` tria 3 missions a partir del dia i del món, de manera que són les mateixes tot el dia. `missio(k, v)` compta el progrés amb el que el motor ja sap.
- **Obertes:** el nen escriu la resposta i el motor hi busca les idees clau. Ho fa en dos passos:
  - **És una resposta de veritat?** `validaOberta(text, o)` demana un mínim de paraules (`OB_MIN`), paraules reals comparades amb el vocabulari del món, i que no sigui una còpia de l'enunciat, la resposta model o les idees (seqüències de 4 paraules). Les caselles de resposta no accepten enganxar (`obProtegeix`), i el boss fa servir el mateix validador.
  - **Quines idees hi ha?** `ideaDetectada(punt, text, enunciat)` posa la nota: compara arrels de 5 lletres, descarta les paraules que ja són a l'enunciat i demana una quarta part de les paraules clau de la idea (`OB_IDEA`). Si la idea porta números de 2 xifres o més que no surten a l'enunciat, també val si el text els conté tots.
  - Quan el nen veu la resposta model, `S.obv[n]` deixa la pregunta en pràctica durant `OB_DIES`. Una eina pot afegir-hi coses amb el ganxo `obertesExtra(n, o)`.

### Jocs

`joc(id)` busca el joc a `ASSIG.jocs` i crida la funció del seu `tipus`. Tots porten `id`, `tipus`, `ic`, `titol`, `sub`, `col` i, opcionalment, `grup` i `final`.

| `tipus` | Funció | Camps propis |
|---|---|---|
| `ordena` | `jocOrdena` | `enunciat`, `instr`, `base`, `items` |
| `parelles` | `jocParelles` | `enunciat`, `instr`, `pars` |
| `classifica` | `jocClassifica` | `enunciat`, `instr`, `caixes`, `items` |
| `figura` | `jocFigura` | `enunciat`, `figura`, `q` |
| `frases` | `jocFrases` | `items` (frases amb buits per triar, escriure o ordenar; format al comentari «FRASES AMB BUITS» de la plantilla), `n`, `veu` |
| `error` | `jocError` | `exercicis` (el format és al comentari de la secció «TROBA L'ERROR GENÈRIC» de la plantilla) |
| `custom` | `window[j.fn](j)` | `fn` i `prova`: la funció del joc i la que el prova |

Aquests tipus viuen a la plantilla (`motor/plantilla-estudi-interactiu.html`).

### Eines (`motor/eines/`)

| Fitxer | Què hi ha | Qui l'inclou |
|---|---|---|
| `exercicis-mates.js` | Taller de mates: generadors `MXG`, Troba l'error `MXE`, teclat, fitxes en 3 modes, examen i repàs barrejat | Mates |
| `manipulatius-mates.js` | Dibuixos interactius: rectangles, arbre de factors, granotes, rajoles | Mates |
| `quadern.js` | Punts de control i foto del quadern a les obertes | Mates |
| `pissarra.js` | Full de brut tàctil (no es desa) | Mates |
| `so-mobil.js` | Un sol `AudioContext`, desbloquejat al primer toc, que sona a l'iPhone en silenci | Plantilla i portada |
| `actualitza.js` | Actualització automàtica (vegeu l'apartat 7) | Plantilla i portada |
| `mapa-comarques.js` | Genera els camins SVG de les 43 comarques i els escriu a `dades/comarques.js`, entre les marques `MAPA:inici` i `MAPA:fi` | Ningú: s'executa a mà |

El Taller desa cada resposta fallada com `exercici|pas|error` (camp `ep`), que el tauler agrupa. Hi ha generadors preparats que encara no surten enlloc: operacions combinades, suma i resta de fraccions i equacions de primer grau.

### Punts d'extensió

Les maneres previstes d'afegir coses a un món sense tocar la plantilla:

| Ganxo | Per a què |
|---|---|
| `//@inclou eines/<fitxer>.js` | Afegir codi compartit a un món o a la plantilla |
| `tipus:"custom"`, `fn`, `prova` | Joc amb codi propi |
| `window.BN_REP_TIPUS` + `repAnotaExt()` | Errors propis al repàs |
| `obertesExtra(n, o)` | Afegir controls a una pregunta oberta |
| `window.BN_PROVES` | Registrar una funció de prova, que torna `true` o el text de l'error |
| `window.BN_NO_LOG` | Desactivar el registre i el núvol |

### So, veu i ritme

- **So:** tot es sintetitza amb WebAudio, sense fitxers. Les veus passen per un bus d'efectes o de música, un volum general i un compressor. La música de fons té la tonalitat i el tempo que surten de l'id del món.
- **Escolta:** `speechSynthesis`, amb la veu del mateix dispositiu.
- **Descans i bon ús:** cada 25 minuts de pàgina visible (`DESCANS_S`) proposa una pausa de 5 minuts, la registra (`descans`: `fet` o `salta`) i deixa saltar-la com a màxim 2 vegades seguides els dies normals (3 a la vigília). A l'inici del món hi ha el pla de 10 dies (`#plaDia`), el botó «Demà tinc examen» (`examen_dema`, màx. 2 dies/món), l'avís amable als 60/120 minuts i la franja de nit (`21:30`/`22:00`, amb mode suau automàtic). Totes les regles i el filtre per a mecàniques noves són a [`docs/BON-US.md`](docs/BON-US.md).
- **Mode suau:** la classe `suau` del `body` treu les animacions fortes (també s'activa sola a la franja de nit sense alterar la preferència manual `bn_suau`).
- **Teclat:** un únic `keydown` reparteix les tecles segons la pantalla. No interfereix amb camps de text, la pissarra ni el teclat del Taller.

### Registre d'activitat

`registra(event, detall)` escriu a la taula `bn_log`. `retalla()` manté cada registre per sota de 1.700 bytes: si cal, només es queden les preguntes fallades. No registra res obrint el fitxer des de l'ordinador (`file:`), amb `BN_NO_LOG` ni en `MODE_DEMO`. El detall de cada event és a «Què es registra», a l'apartat 8.

---

## 6. Portada, xat i perfil

### 🏠 Portada (`index.html`)

És una pàgina a part, que no surt de la plantilla. S'edita a mà, excepte els blocs marcats que escriu `tot.py`: `MONS`, `SO-MOBIL`, `ACTUALITZA`, l'adreça de `sprites.js` i la versió del peu.

- **Rànquing:** combina les RPC `bn_ranking_mons` (total, estrelles per món i dies diferents d'estudi `dies`; amb `bn_ranking` de reserva) i `bn_ranking_remuntada`, amb les pestanyes `Estrelles`, `Dies` («Dies d'estudi»), `Nivell`, `Setmana`, `Remuntada` i `Xat`. Sense la segona RPC, la pestanya Remuntada surt buida. La classificació mostra els `HS_TOP` = 25 primers i, si el nen queda més avall, la seva fila a sota. `?demo` el mostra amb nens inventats.
- **Icones:** `sprites.js` dibuixa el pixel art com a SVG a partir de graelles de 16×16, de manera que es veu igual a tots els aparells.
- **Afegir un món al rànquing:** surt sol de la seva targeta (`data-id`, `.mat`, `h2`). Per donar-li dibuix i color, a `sprites.js` afegeix-lo a `BN_MON`
  (`id: {ic: "un dibuix de BN_SPR", mat: "Assignatura"}`). Si l'assignatura és nova, afegeix-la també a `BN_MAT` (`curt`, `color`, `tint`).
  Sense aquestes entrades no es trenca res: surt amb el seu emoji en una rajola grisa i l'assignatura nova agafa un color de reserva.

### 👀 Mode tast anònim (`?tast=1`)

Permet que pares, mestres o un company tafaner vegin com és Bona Nota per dins **sense posar cap nom ni PIN, sense sumar estrelles ni sortir al rànquing, i sense embrutar l'aparell familiar** (`docs/superpowers/specs/2026-11-11-mode-tast-anonim-design.md`).

- **Tres portes d'entrada:** botó `#btTastPortada` a la portada (`/?tast=1`), `#btTastMon` a la pantalla de benvinguda de qualsevol món (`/<mon>/?tast=1`) i `#btParesTast` a `pares/index.html` (`../?tast=1#mons`). Els mons tancats per l'admin (`bn_mons_tancats`) continuen tancats.
- **Què obre dins d'un món (`MODE_TAST = true`):** el **Tema 1** sencer (`i === 0`: fitxa, targetes i un test de mostra de `NTEST_TAST = 5` preguntes explicades sense rellotge d'avanç), el **primer joc** de `ASSIG.jocs[0]` i l'enunciat de mostra de la **primera pregunta oberta** (`OB[0]`, sense camp de resposta, ni resposta model, ni foto del quadern). Els temes `2…N`, la resta de jocs, els exàmens (`examen`, `examreal`) i el `boss` obren el diàleg amable `convidaPin()`.
- **100 % anònim i aïllat:** no envia cap petició d'escriptura a `bn_log`, `bn-corregeix` ni cap RPC d'usuari (`bn_perfil_*`, `bn_progres_*`, `bn_punts_*`, `bn_comparativa`, `bn_xat_estat`, `bn_xat_envia`, `bn_xat_vota`, `bn_aspecte_desa`); `suma()` no acumula estrelles (`S.punts` es manté a `0`), el xat de la portada queda en mode lectura i tota la sessió efímera viu únicament a `sessionStorage` (`bn_tast` i `bn_tast_<CL>`), de manera que no toca `localStorage` ni ocupa cap plaça de `MAX_NOMS = 2` a l'aparell.
- **Noms reservats:** tant el client (`nomProhibit`) com PostgreSQL (`bn_priv.nom_prohibit` a `supabase/bn_ranking_net.sql`) rebutgen i exclouen del rànquing qualsevol nom que comenci per `_` o coincideixi amb `tast`, `convidat`, `anònim`, `visitant`, `guest` o `demo_tast`.
- **Prova:** `node motor/prova-tast.js` (Playwright, comprova les tres portes, els límits del món, zero peticions d'escriptura al núvol i que la sessió desada d'un germà a `localStorage` queda intacta).

### 💬 Xat de la colla (pestanya «Xat» del rànquing)

> Explicat en paraules planeres (crèdits, regla d'or, desbloquejos, admin i on és cada cosa al codi): [`docs/XAT.md`](docs/XAT.md).

Els nens es parlen **amb peces**, sense escriure: una frase amb un forat (`___`) i el que l'omple (una paraula d'estudi, una cosa de classe, una cosa seva o el nom d'un company del rànquing). Regles i motius: `docs/DECISIONS.md` (ADR-0006) i l'encàrrec `docs/superpowers/specs/2026-11-10-xat-colla.md`.

- **Catàleg:** el bloc `XAT-CATALEG` d'`index.html` (`XAT_FR`: 26 frases; `XAT_PC`: 66 peces) és el mateix que carrega `supabase/bn_xat.sql`. Si en canvies un, canvia l'altre: `motor/prova-xat-sql.js` comprova que coincideixen. Les peces noves que afegeix l'admin (id ≥ 1001) arriben del servidor amb el seu text.
- **Regla d'or:** el nom d'un company només va en frases de forat `C` (felicitar, donar aura o reptar); per riure, coses de classe (`E`) o un mateix (`J`).
- **Text:** `xatCompon()` el compon al navegador amb el catàleg: contraccions (a/de/per + el/els → al, als, del, dels, pel, pels) i majúscula si la frase comença pel forat. Del servidor només arriben números. L'admin fa servir les mateixes regles.
- **Crèdits:** els calcula el servidor (`bn_xat_estat`): cada `est_credit` (10) ⭐ guanyades avui = 1 crèdit, fins a `max_dia` (5) al dia; tornen a zero a mitjanit (Europe/Madrid). Votar «Ben dit» demana el primer crèdit d'avui. Entre missatges, `espera_s` (10 s). Els valors es canvien des de l'admin.
- **Lectures:** `bn_xat_llegeix` (sense PIN) en obrir el rànquing i cada 10 s només mentre la pestanya Xat és oberta; `bn_xat_estat` (amb PIN) en obrir-lo i després d'enviar o votar. No es fa servir Realtime.
- **A l'aparell:** `bn_xat_vist` (l'últim missatge vist, per al comptador vermell de la pestanya) i `bn_xat_cred` (per al rètol «CRÈDIT +1» quan en tornar hi ha crèdits nous).
- **Sense el SQL aplicat** (o sense connexió), el rànquing es veu igual que abans i la pestanya Xat diu «El xat arriba aviat».
- **`?demo`:** el xat amb missatges inventats i un servidor local, sense núvol. La Laia porta 14 ⭐ avui; amb `?demo&estrelles=4` (INSERT COIN), `=10` (en enviar, SENSE CRÈDITS) o `=60` (5 crèdits i després TORNA DEMÀ) es veuen els bloquejos.
- **Admin** (`admin/` → Xat): resum del dia, missatges (també els esborrats) per esborrar o recuperar, silenciar un nom 1, 3 o 7 dies, configuració, catàleg amb interruptors i peça nova.
- Proves: `node motor/prova-xat-sql.js` (el SQL dins de PGlite), `node motor/prova-xat.js` (portada) i `node motor/prova-admin-xat.js` (admin).

### 👾 Perfil del nen (`perfil/index.html`)

També és una pàgina a mà (blocs `SO-MOBIL`, `ACTUALITZA`, `sprites.js?v=` i versió del peu els escriu `tot.py`). El nen hi tria el seu **aspecte**: l'animal (`BN_AV`), el **perfil arcade** (una de les 50 insígnies de `BN_SKILLS`) i l'estil de color (`""` Clàssic, `A` Ofensiva, `B` Tàctica; paletes a `BN_SKILL_VAR_PAL`). `bnSkillSpr(id, estil)` dibuixa la insígnia.

- **On es guarda:** a l'aparell, al mapa `localStorage.bn_aspectes` (`{nom en minúscules: {av, sk, v, mod, pendent}}`), i al núvol, a la columna `aspecte` del perfil del nen (`supabase/bn_aspecte.sql`: `bn_aspecte_desa(nom, pin, aspecte)` amb PIN i `bn_aspectes()`, pública, que és el que llegeix el rànquing). Si la pujada falla (sense connexió o SQL no aplicat), queda `pendent` i la portada o la mateixa pàgina la reintenten en obrir-se.
- **On es veu:** `avatar(nom)` de la portada i del tauler mira primer l'aspecte; si no n'hi ha, l'animal es calcula pel nom com sempre. La salutació de cada món (`heroAv()` a la plantilla) llegeix el mapa local.
- `?demo` mostra la pàgina amb un nen inventat i sense núvol. `../#ranquing` obre la portada amb el rànquing desplegat.
- Prova: `node motor/prova-perfil.js` (Playwright, amb Supabase simulat).

---

## 7. App: sense connexió i actualització

La web es pot afegir a la pantalla d'inici del mòbil i funciona sense connexió. Dues peces ho fan possible:

**Service worker** (`motor/sw-plantilla.js` → `sw.js`). Només s'instal·la en https; a localhost, amb `?sw`.

| Petició | Estratègia |
|---|---|
| Pàgines | Primer la xarxa; sense connexió, la còpia guardada |
| Fonts, icones i la resta | Primer la còpia guardada |
| Supabase, `/admin` i `versio.json` | Sempre la xarxa, mai es guarden |

**Actualització automàtica** (`motor/eines/actualitza.js`). Cada pàgina porta la seva empremta (`VER`) i en obrir-se la compara amb `versio.json`:

1. Si no coincideixen, esborra les memòries cau `bn-…`, demana al service worker que s'actualitzi i recarrega, un sol cop per versió.
2. Si l'app torna després de més de 10 minuts amagada, la portada recarrega sola. Dins d'un món només surt un avís amb un botó, per no tallar un test.

Mai es toca el progrés, el nom ni el PIN, que són a `localStorage`.

---

## 8. Dades

Què es guarda, on i qui ho pot llegir. Del nen només es guarda **el nom que ell tria i un PIN**: cap correu, cap cognom, cap foto.

### On viu cada dada

- **Al navegador** (localStorage): el progrés de cada nom, separat per món.
- **Base de dades:** projecte Supabase propi **«bonanota»** (`agippwtqvhpxdockuigl`, Frankfurt), des del 5-11-2026.
  Abans compartia el projecte «marcador»; s'hi va copiar tot (registre, perfils amb PIN, progrés, admin i les 37 funcions) i es va comprovar que era idèntic.
- **Al núvol** (Supabase), només amb nom i PIN: el progrés de cada món, per poder canviar d'aparell.
- **Registre d'activitat** (`bn_log`): què fa cada nen i quan, per al panell d'admin i el rànquing. Només s'hi pot escriure; llegir-lo només ho pot fer l'admin.
- **Rànquing:** `bn_ranking_mons` (total i estrelles per món). Els noms amagats o no permesos no hi surten.
- **Reinicis** (`bn_priv.reinicis`): quan l'admin esborra el progrés d'un nen, es desa la data per món (o «tots»). L'app la rep amb `bn_progres_llegeix`, buida el progrés vell del dispositiu i el servidor no accepta progrés ni estrelles d'abans d'aquella data (`supabase/bn_admin_reinicia.sql`).
- **Xat de la colla** (`supabase/bn_xat.sql`): taules privades `bn_priv.xat_*` (catàleg, missatges, vots i silencis) i la clau `xat` de `bn_priv.config` (més l'horari automàtic a `xat_horari`, `supabase/bn_control.sql`). De cada missatge només es guarden números: qui, quina frase i quina peça o quin company del rànquing; mai text. Cap taula del xat es pot llegir des del navegador: tot passa per funcions (`bn_xat_estat`, `bn_xat_envia` i `bn_xat_vota` demanen el PIN; `bn_xat_llegeix` és pública com el rànquing i no diu qui ha votat). Els missatges dels noms amagats o no permesos no surten. Les taules del xat també entren a les còpies de seguretat i a la restauració de l'admin (`supabase/bn_copies.sql`).
- **PIN:** xifrat (bcrypt), mai es guarda tal qual. 5 errors en 15 minuts bloquegen el nom 15 minuts: totes les funcions amb PIN tornen un codi (`'pin'`, `{"ok":false,"codi":"pin"}` o `-3`) sense llançar excepció SQL perquè la transacció no desfaci el comptador de `bn_priv.intents`. Format i canvi: `supabase/bn_pin_nou.sql`.
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

### Què es registra (des del 4-11-2026)

Cap dada nova del nen: només el nom de sempre. El camp `detall` de cada registre porta:

| Event | Detall |
|---|---|
| `entra` | `h` (hora local), `dw` (1 = dilluns … 7 = diumenge), estrelles, temes aprovats |
| `fitxa` | tema, `s` (segons llegint-la), `fi` (1 si ha arribat al final) — s'envia en sortir |
| `targetes` | tema, `s`, `vistes` de `n`, `girs`, `fi` — s'envia en sortir |
| `test` | tema, `pc`, `mode` (tema · repas), `s` total, `q`: una entrada per pregunta, i `pistes` (preguntes amb pista, si n'hi ha) |
| `examen` | `joc` (examen · examreal), `pc`, `mode` (sorpresa · real · real-temps), `s`, `temes` i `q`. L'examen de mates porta `nota` sobre 10 en lloc de `pc`, i `nivell` i `ep` |
| `joc` | `joc`, `pc`, `s`, `enc`, `err`; el MAPA també `mode` i `f` (comarques fallades). El boss (`joc: "boss"`) també porta `guanya`, `cors`, `hp` i `q`. El repàs (`joc: "repas"`) també porta `apr` (errors apresos en aquella sessió) i `ext` (p. ex. `mx:1/2,mapa:2/3`: errors del Taller i del MAPA recordats) |
| `oberta` | número, tema, `pc`, `s`, `idees`/`de`, `det` (idees trobades al text), `falten` (idees no trobades) i, si n'hi ha, `mode: "practica"`, `rebutjat` i `enganxat`. Des de la versió 2.6.0 `pc` surt de les idees trobades; abans el marcava el nen |
| `descans` | `accio` (`"fet"` quan es completen els 5 min de pausa · `"salta"` quan es prem «Ara no, continuo»), `n` (salts seguits) i `fase` |
| `examen_dema` | `dia` (`AAAA-MM-DD`) i `n` (1 o 2, màxim 2 dies per món) quan el nen marca «Demà tinc examen» |

Cada pregunta contestada va a `q` com un text curt **`tema/núm:encert:segons:opció`**, per exemple
`lle/4:0:7:2` (tema «lle», pregunta 4, fallada, 7 segons, ha triat l'opció 2 del llibre de dades).
Ocupa molt menys que una llista dins de la base de dades; si un registre passés de 1.700 bytes, només es
guarden les fallades.

**Identificadors de pregunta estables:** `motor/qids.py` dona un número a cada pregunta la primera vegada que
la veu i el desa a `motor/qids.json` (lligat a una empremta del text). Si reordenes o afegeixes preguntes, les
que hi havia mantenen el número; un número no es torna a fer servir mai. Si canvies el text d'una pregunta,
compta com una de nova. `tot.py` també genera `admin/preguntes.json` (id → text, opcions, correcta, tema) perquè
el tauler mostri el text de les preguntes.

---

## 9. Tauler d'administració

El tauler és a https://bonanota.net/admin/ i demana el correu i la contrasenya d'admin. Serveix per veure què fan els nens, cuidar-ne l'ús i gestionar-los.
S'organitza en **5 seccions principals** (`Inici`, `Nens`, `Mons`, `Sessions` i `Rànquing`, amb barra inferior fixa al mòbil) més l'accés **⚙ Configuració** (`Horaris i crèdits`, `Catàleg del xat`, `Llindars` i `Còpies`) a la barra superior, i carrega les funcions de `supabase/bn_admin_*.sql` **sota demanda** segons la pantalla oberta.

A la barra superior hi ha només el selector global de període (`Avui`, `7 dies`, `30 dies`, `Curs`, ocult a `Configuració`), actualitzar, tema clar/fosc i `Configuració`; els filtres d'assignatura (`#fAssig`) i de nen (`#fNen`) apareixen localment a cada sub-vista que els admet. El desplegable `#fNen` mostra sempre **tots els nens** que existeixen a la base de dades (`bn_admin_ids`, que uneix `bn_priv.perfils` i `public.bn_log` a `supabase/bn_ids_i_punts.sql`), encara que no tinguin activitat en el període triat o que tinguin 0 registres. El registre (`bn_admin_logs`) es carrega sota demanda paginat en blocs de 1.000 files (`?limit=1000&offset=…`) fins a cobrir tot el període seleccionat, de manera que el límit de 1.000 files per resposta de PostgREST no deixa cap nen fora.

### 🎛️ Control ràpid: xat, horari i mons

A dalt de tot del Tauler (`#control`; l'horari també surt a la pestanya Xat). Des de la versió 2.17.0 permet:

- **Obrir o tancar el xat** amb un clic.
- **Programar l'horari del xat**: una hora de tancament i una d'obertura, en hora de Madrid (per exemple `21:30` → `07:00`).
- **Activar o desactivar cada món.** Un món desactivat surt en gris a la portada amb «🔒 TANCAT» i no deixa entrar-hi, tampoc per enllaç directe. Les estrelles es conserven al rànquing.

El SQL és a `supabase/bn_control.sql`. La llista de mons vàlids hi és escrita a mà: en afegir un món, cal afegir-hi el seu id.

### 📊 Tauler

Pestanya 📊 Tauler. Xifres amb comparació amb el període anterior, alertes, activitat per
dia, mapa de calor hora × dia, evolució de les notes, constància i ratxa, domini nen × tema, preguntes més
fallades amb el parany més triat i, filtrant per un nen, en què passa el temps. Les dades arriben ja agregades
del servidor amb les funcions de `supabase/bn_admin_tauler.sql` (`bn_admin_resum`, `_activitat`, `_calor`,
`_domini`, `_fallades`, `_evolucio`, `_alertes`), que demanen el correu i la contrasenya d'admin.
El domini per tema i les preguntes més fallades surten plegats per món.
L'apartat **Repàs, boss i missions** (`tMotivacio()`) no necessita cap funció a Supabase: es calcula al navegador amb el registre que el tauler ja ha carregat i respecta el període i els filtres. Les missions no es registren una per una: la xifra surt de `fonts.missio`, el total d'estrelles de missions de cada nen.
L'apartat **✏️ Taller de mates: on s'equivoquen** (exercici · pas · error · vegades · nens) surt de `bn_admin_errors_taller`, a `supabase/bn_admin_errors_taller.sql` (s'executa una vegada, després de `bn_admin_tauler.sql`), i llegeix el camp `ep` (`"exercici|pas|error"`, un per cada resposta fallada) que el Taller afegeix als events `joc` i `examen`.

### 💚 Benestar

Pestanya 📊 Tauler. Mostra l'ús sa de cada nen segons [`docs/BON-US.md`](docs/BON-US.md) (apartats 2 i 5), amb `bn_admin_benestar` (`supabase/bn_admin_benestar.sql`). Una fila per nen amb el semàfor i els motius. Per món, la fase (novetat, aprendre, vigília, després) i la vigília d'examen: la data que posa l'admin (`bn_admin_examen_desa`, taula `bn_priv.examens`) o, si no n'hi ha, el pic del grup (5 nens o la meitat, el triple de minuts d'un dia normal, només del dia 3 al 12 del món). Els llindars són els inicials de BON-US.md. El temps es compta per aparell: amb dos aparells alhora, els minuts poden sortir doblats (el tauler ho avisa).

### 🔥 Combos i repàs, i errors pendents de la colla

Pestanya 📊 Tauler (`supabase/bn_admin_fonts_rep.sql`). `bn_admin_fonts_dia` treu les estrelles de cada font per dia de les diferències del camp `fonts` entre registres del mateix nen i món: el porten `entra` i `temps` i, des de la 2.8.2, també `test`, `joc`, `examen` i `oberta`. Cada increment es compta contra el màxim anterior, de manera que un aparell vell que envia valors baixos no fa comptar dues vegades el mateix. El primer registre de cada nen i món, i el primer després d'un reinici, només serveixen de base, i un valor que baixa compta 0. `bn_admin_rep_pendents` agrega els errors pendents de repàs (`estat.rep` de `bn_priv.progres`) per món i tema, sense noms.

### ⚡ Dificultat real de les preguntes

Pestanya 📊 Tauler (`supabase/bn_admin_dificultat.sql`, issue `#16`). Llegeix `bn_admin_dificultat` (respostes de `test` i `examen` dels últims 365 dies, excloent el repàs espaiat) i la compara directament al navegador amb `motor/dificultat.json` i `admin/preguntes.json`: marca `➕ Proposa ⚡` les preguntes amb `< 55 %` d'encert (i `≥ 8` respostes) que encara no són difícils, `➖ Revisa ⚡` les marcades difícils amb `≥ 75 %` d'encert, `⚡ Confirmada` i `Fàcil (> 90 %)`, i permet descarregar el JSON per passar-lo a `python3 motor/dificultat.py --proposa`.

### 👤 Nens

**Nens nous** (pestanya 👤 Nens, a dalt): les altes del període de dalt, amb `bn_admin_altes` (`supabase/bn_admin_fitxa.sql`). La data d'alta és la primera vegada que es veu el nen: el primer registre o `perfils.creat` (quan crea el perfil amb el PIN; els perfils d'abans del 10-11-2026 no la tenen), el que sigui abans. No es fa servir `nou` de l'event `entra`, que vol dir «nou en aquell aparell».

**Nivells al tauler** (des de la 2.16.0): el tauler llegeix `admin/regles.json` (generat per `tot.py` des de la plantilla) i mostra el nivell de cada nen i de cada món —amb les estrelles que falten per al següent— a la taula de Nens, a la capçalera i els KPIs de la fitxa, a cada assignatura i a la pestanya «Al núvol».

**Fitxa de cada nen → Al núvol:** l'estat que el nen ha desat al núvol a cada món (`bn_priv.progres`, amb `bn_admin_fitxa`): temes, preguntes que falla, errors pendents de repàs, obertes, exàmens, boss i fonts de les estrelles. Només hi són els nens que han jugat amb el PIN (si l'admin li treu el PIN, el progrés es continua veient); dels altres, només hi ha el registre. L'aprovat (70) és el mateix número que fa servir el tauler.

**Fitxa de cada nen** (pestanya 👤 Nens → toca un nom): canviar el nom (conserva el registre, el perfil, el progrés i també els missatges, vots i silencis del xat; `supabase/bn_pin_nou.sql`), amagar-lo del rànquing, treure el PIN i:
- **♻️ Esborrar el progrés:** tries «Tots els mons» o un món concret i confirmes (surten el nom del nen i el món, i «No es pot desfer»).
  S'esborren les estrelles, els tests, els jocs i el temps d'aquell món (o de tots), també del rànquing. **El nen es queda amb el nom i el PIN.**
  Als seus dispositius, el progrés d'abans s'esborra sol la propera vegada que hi entra (un dispositiu vell no el pot fer tornar).
  Cal haver executat una vegada `supabase/bn_admin_reinicia.sql`.
- **🗑️ Esborrar el nen del tot:** treu el nen sencer (registre, PIN i progrés).

Dins dels mons ja no hi ha cap botó per esborrar el progrés: només es pot fer des de l'admin.

### 💾 Còpies de seguretat

`admin/` → Còpies de seguretat (`supabase/bn_copies.sql`, ja executat al projecte «bonanota»):
- Cada còpia guarda el registre, els perfils (PIN xifrat), el progrés al núvol, els noms amagats, la configuració, els reinicis i les taules del xat (`xat_frases`, `xat_peces`, `xat_msg`, `xat_vots` i `xat_silenci`). **No** guarda els administradors.
- Es fan soles **cada nit a les 3:00** (pg_cron `bn-copia-diaria`) i **just abans d'esborrar o canviar** dades des de l'admin (triggers `bn_copia_abans`); també amb el botó «Fes una còpia ara».
- Les automàtiques es guarden 30 dies; la resta, 90. Des de l'admin es poden **descarregar** (JSON), **restaurar** (dues confirmacions; abans es fa una còpia de l'estat d'ara) i **esborrar**.
- A part, Supabase guarda cada dia una còpia de tota la base de dades (7 dies), que es restaura des del seu panell.

---

## 10. Proves i revisió automàtica

A cada PR i a cada pujada a `main`, GitHub Actions executa «Revisa Bona Nota» (`.github/workflows/revisa.yml`) en paral·lel (`base`, `sql`, `interficie` i un job simultani per a cadascun dels mons de `motor/mons.json`, amb Chromium en memòria cau). Si un sol pas falla, el PR no es fusiona.
El resultat surt a la pestanya **Actions** del repo.

| Pas | Fitxer | Què comprova |
|---|---|---|
| 1 | `motor/tot.py` + `git diff` | Torna a generar tots els mons i la portada. Si una pàgina pujada no coincideix (editada a mà o sense regenerar), falla i diu quins fitxers |
| 2 | `motor/prova-generadors.js` | Els generadors del Taller de mates (càlculs, errors típics, Troba l'error) |
| 3 | `motor/prova-regles.js` | Les regles copiades (nivells, aprovat…) coincideixen amb la plantilla |
| 4 | `motor/prova-nuvol.js` | El núvol d'un món, amb Supabase simulat: un aparell vell no trepitja el progrés del núvol, sense connexió no puja res i el `-2` es resol sense bucles |
| 5 | `motor/prova-perfil.js` | La pàgina de perfil: tries amb clic i teclat, desat al núvol, sense connexió i amb PIN incorrecte, Sorpresa i «Efectes suaus» |
| 6 | `motor/prova-admin-fonts.js` | Els orígens d'estrelles del tauler (funcions pures) |
| 7 | `motor/prova-xat-sql.js`, `prova-xat.js`, `prova-admin-xat.js` | El xat de la colla: el SQL, la portada i la pestanya de l'admin (detall a sota) |
| 8 | `motor/prova-admin-fitxa-sql.js`, `prova-admin-fitxa.js` | La fitxa «Al núvol» i les altes: el SQL i el tauler |
| 9 | `motor/prova-admin-benestar-sql.js`, `prova-bon-us-sql.js`, `prova-admin-benestar.js` | El benestar, les fases del món (`bn_vigilia`) i l'apartat del tauler |
| 10 | `motor/prova-admin-fonts-rep-sql.js`, `prova-admin-fonts-rep.js` | «Combos i repàs» i «Errors pendents de la colla»: el SQL i el tauler |
| 11 | `motor/prova-control-sql.js`, `prova-admin-alta.js` | El control de xat, horari i mons, el filtre superior amb tots els nens i els nivells al tauler |
| 12 | `motor/prova-pin-intents-sql.js`, `prova-fotos-sql.js`, `prova-pares.js`, `prova-tast.js`, `prova-dificultat-sql.js`, `prova-admin-dificultat.js` | El bloqueig de 15 minuts al 5è intent de PIN (#33), el permís de fotos del quadern, la guia per a les famílies (`pares/`), el mode tast anònim (`?tast=1`) i la dificultat real de les preguntes al servidor i al tauler (#16) |
| 13 | `motor/prova.js` (un cop per món, amb `ESTRICTE=1`) | Cada món sencer: tests, jocs, exàmens, repàs, obertes, estrelles, superestrelles i capçalera |

Les proves `…-sql.js` executen el SQL de `supabase/` dins de **PGlite**, un Postgres de prova sense xarxa. Les altres obren la pàgina amb **Playwright** i un Supabase simulat: cap prova toca la base de dades real.

**Passar-les en local.** Un sol cop, des de la carpeta del repo:

```
npm install --no-save playwright@1 @electric-sql/pglite@0.5
npx playwright install chromium
```

I després, la que calgui, per exemple `node motor/prova-xat.js`. La d'un món: `cd motor && ESTRICTE=1 node prova.js $PWD/../<carpeta>/index.html`.

**`motor/prova.js`** obre la pàgina generada amb Playwright i la fa jugar: cada tema (fitxa, targetes i test perfecte), cada joc, els exàmens, el repàs i les obertes, i executa les funcions de `prova` dels jocs `custom` i les de `BN_PROVES`.
Amb `ESTRICTE=1`, un món falla si té temes amb menys de 8 preguntes o si la resposta correcta és l'opció més llarga fora del marge del 15 % al 40 %.

**`motor/prova-generadors.js`** carrega el Taller sense navegador i executa cada generador moltes vegades per nivell (10.800 exercicis): comprova que la resposta bona es dona per bona, que les dolentes no fan petar els missatges i que els càlculs quadren.

**Les proves del xat:** `motor/prova-xat-sql.js` executa `supabase/bn_xat.sql` (dues vegades, per comprovar que és idempotent) i prova cada codi de `bn_xat_envia`, el canvi de dia a mitjanit, els vots, la lectura, l'admin i els permisos; `motor/prova-xat.js` prova la portada (crèdits, bloquejos, enviar, votar, contraccions, «Digues-li», mòbil, `?demo` i el rànquing igual que abans sense el SQL); `motor/prova-admin-xat.js` prova la pestanya Xat de l'admin.

> Algunes proves del tauler porten escrit el nombre de mons (`prova-admin-alta.js`, `prova-admin-benestar.js`). Si afegeixes un món, cal actualitzar-les.

---

## 11. Qui hi treballa: Claude i Gemini

Bona Nota es programa amb agents d'IA. **Hi treballen Claude (Claude Code) i Gemini**, i les mateixes regles valen per a qualsevol altre agent (Kimi, Codex…).

- **Regles comunes:** tots els agents segueixen [`AGENTS.md`](AGENTS.md) i el nucli (`nucli.json`). `CLAUDE.md` remet a `AGENTS.md`.
- **Numeració de Gemini:** les tasques i els blocs que fa Gemini es numeren amb la lletra `g` (`g1`, `g2`, `g3`…). L'id surt al final del commit.
- **Memòria del projecte**, a `docs/`: `ESTAT.md` (com està tot), `DECISIONS.md` (què s'ha decidit i per què), `TRAMPES.md` (errors per no repetir),
  `CONVENCIONS.md` (com es treballa) i `ARQUITECTURA.md` (on és cada cosa).
- **Abans de publicar:** `nucli ship plan` diu quines comprovacions demana el canvi, `nucli ship run <check>` les passa i `nucli ship seal` les segella.

Gemini es fa servir per desenvolupar l'app. Dins de l'app només hi ha una IA: Claude, que corregeix les fotos del quadern.
