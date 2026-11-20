# ⭐ Bona Nota · Estudia jugant (1r ESO)

**Web:** https://bonanota.net · **Versió:** 2.61.0 ([historial de canvis](CHANGELOG.md))

Bona Nota és una web per **repassar els temes de 1r d'ESO jugant**. Cada tema és un «món» amb fitxes, targetes, tests, jocs i preguntes d'examen.
Els nens hi guanyen estrelles, pugen de nivell i competeixen en un rànquing.

Aquest README explica **com està feta la web i com s'hi treballa**. El que no és tècnic té el seu document:

| Si vols saber… | Llegeix |
|---|---|
| Quins mons hi ha i com es juga | [`docs/MONS.md`](docs/MONS.md) |
| Com construir un món nou pas a pas | [`docs/NOU-MON.md`](docs/NOU-MON.md) |
| Com es construeix un món d'Anglès (frases amb buits) | [`docs/MON-ANGLES.md`](docs/MON-ANGLES.md) |
| Com es construeix un món de Matemàtiques (taller, vistes i pistes) | [`docs/MON-MATES.md`](docs/MON-MATES.md) |
| Com es construeix un món de llengua (frases d'ús, pintar paraules, puntuació) | [`docs/MON-LLENGUA.md`](docs/MON-LLENGUA.md) |
| Com funcionen els Bosses, els efectes musicals i les variants per a nous mons | [`docs/BOSS-I-EFECTES.md`](docs/BOSS-I-EFECTES.md) |
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
| Veure-ho en local, afegir un món o publicar (`nou_mon.py`, `publica.py`) | [2. Feines habituals](#2-feines-habituals) |
| Pujar el número de versió | [3. Versions](#3-versions) |
| Trobar un fitxer | [4. On és cada cosa](#4-on-és-cada-cosa) |
| Entendre o canviar el motor dels mons, `mons.json` i les eines | [5. El motor](#5-el-motor) |
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

 tot.py = build.py per a cada món + portada + blocs de mons.json (admin, sprites.js, xat)
          + admin/preguntes.json + versio.json + sw.js
 publica.py = tot.py + revisions + commit + PR amb fusió automàtica (fusionar és publicar)

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
| `?demoBoss=1` | Vista prèvia d'1 clic de la celebració del Boss del món (sprite, motion i música, sense jugar ni desar res) |
| `?joc=<fitxa>&llibreta=1` | Una fitxa del Taller, directament a l'exemple resolt |

### Afegir o actualitzar un món

**Un món nou** es fa d'una tirada. La guia és [`docs/NOU-MON.md`](docs/NOU-MON.md). Amb Claude Code, la skill `nou-mon` ho fa tota sola a partir d'una carpeta de Drive i sense demanar permisos.

```
python3 motor/nou_mon.py --id <id> --carpeta <assignatura>/<id> --materia "Matèria" --titol "Títol" --desc "Una frase" --colors "#c1,#c2,#c3" --ic 🌋 --curt "Títol" --spr <sprite> --xat "peça 1|peça 2|peça 3"
```

1. `nou_mon.py` afegeix el món a `motor/mons.json` i crea l'esquelet `motor/dades/<id>.js`. Hi posa el número de món següent, la data d'avui (`neix`) i els ids de les 3 peces del xat.
2. S'omple l'esquelet amb el contingut dels apunts (`ASSIG`, `T`, `OB`; vegeu «Format de les dades» a l'apartat 5).
3. `node motor/revisa-mon.js <id>` revisa el contingut i diu on és cada error.
4. `python3 motor/publica.py --id gN --missatge "feat(mons): afegeix el món N Títol (gN)"` ho regenera tot, passa les proves del món i el publica (vegeu «Publicar»).

L'admin, el dibuix del rànquing (`sprites.js`) i les paraules del xat surten soles de `motor/mons.json` (apartat 5, «L'única font de cada món»).
L'SQL valida els mons pel format de l'id, i les proves compten els mons que hi ha a `mons.json`. A mà només queden:
- la il·lustració opcional (`motor/ilu/<id>.svg`);
- l'`upsert` de les 3 peces del xat a Supabase;
- la versió MENOR (apartat 3);
- `docs/MONS.md`.

**Un món que ja existeix:** canvia `motor/dades/<id>.js` i comprova-ho:

```
python3 motor/tot.py
node motor/revisa-mon.js <id>
node motor/prova-tot.js mons <carpeta>
```

L'última ordre passa dues proves del món: l'estricta (`ESTRICTE=1`, ha d'acabar amb «errors: cap») i la visual a 360, 390 i 430 px.

**Regles del contingut** (el revisor i la prova estricta en comproven la major part):

- Tot surt dels apunts o del llibre (res inventat). Si una dada és dubtosa, no va al test i la fitxa diu «pregunta-ho al profe».
- Mínim **8 preguntes per tema**, 3 opcions i una sola correcta. Les opcions falses han de ser errors típics, mai opcions absurdes.
- La resposta correcta ha de ser l'opció més llarga entre el 15 % i el 40 % de les vegades: ni gairebé sempre ni gairebé mai, perquè totes dues coses són pistes.
- **Cada enunciat de pregunta ha de ser únic a tot el món.** La prova i els identificadors (`qids`) reconeixen una pregunta pel seu text: dues preguntes «Quina frase és correcta?» amb opcions diferents es confonen.
- La resposta model (`m`) de cada oberta ha d'estar escrita amb frases (4 paraules per idea i algun connector o un `=`): la prova ho comprova.

Per afegir **frases amb buits** a qualsevol món, a `ASSIG.jocs` hi van jocs `tipus:"frases"`. El format i les regles són a [`docs/MON-ANGLES.md`](docs/MON-ANGLES.md) (serveix igual per a Català o Castellano, canviant la llengua).

Per afegir un **Troba l'error** a qualsevol món, a `ASSIG.jocs` hi va un joc `tipus:"error"`. El format és al comentari de la secció «TROBA L'ERROR GENÈRIC» de la plantilla.

### Millorar el motor

Els canvis comuns a tots els mons (sons, estrelles, pantalles…) es fan a `motor/plantilla-estudi-interactiu.html`.
Després, `python3 motor/tot.py` els aplica a tots els mons, i `node motor/prova-tot.js mons` passa les proves estricta i visual de tots.
**Mai s'edita una pàgina generada** (`<assignatura>/<tema>/index.html`): el canvi es perdria i la revisió fallaria.

### Generar els PDFs d'estudi

La skill `skills/bona-nota/` converteix fotos del llibre o apunts en un paquet de PDFs: resum, esquema visual, examen, full de respostes,
preguntes orals i connexions, o el dossier d'un llibre de lectura. Comença per `skills/bona-nota/SKILL.md`.

### Publicar

Cada canvi va per una branca i un PR cap a `main`, mai directament a `main`. **`motor/publica.py` ho fa tot amb una sola ordre:**

```
python3 motor/publica.py --id gN --missatge "tipus(àmbit): què (gN)"
```

| Pas | Què fa |
|---|---|
| 1 | Fa `git fetch`. Des de `main`, crea la branca `gN-<resum>` (amb `--id 12`, la branca `issue/12-<resum>`) |
| 2 | Executa `python3 motor/tot.py` i `node motor/revisa-mon.js`, i per als mons canviats, les proves visual i estricta |
| 3 | Fa el commit i passa la porta del nucli (`nucli ship plan`, cada check automàtic i `nucli ship seal`) |
| 4 | Puja la branca, obre el PR cap a `main` i hi activa la fusió automàtica (`gh pr merge --auto --squash --delete-branch`). El cos del PR és el fitxer de `--cos`, si n'hi ha; si no, la primera entrada del `CHANGELOG.md`, o els commits |

Abans de començar, `publica.py` s'atura si `main` de GitHub té canvis que aquí no hi són, si hi ha un merge a mitges o marques de conflicte, o si hi ha fitxers nous que no són de la feina. També s'atura si toques `.github/`, `.claude/`, `nucli.json`, `AGENTS.md` o `CLAUDE.md` i no hi poses `--config`.

**Després:**
- GitHub fusiona el PR sol i n'esborra la branca quan el check «Revisa Bona Nota · tot» surt en verd (el ruleset «main protegida» l'exigeix). Fusionar és publicar: GitHub Pages ho posa a **bonanota.net** en 1 o 2 minuts.
- Si l'Action falla, s'arregla a la mateixa branca i es torna a executar `publica.py`, que aprofita el PR que ja hi ha.

**Altres opcions:**
- Amb `--prova` només revisa i escriu què faria, sense pujar res.
- Surt amb 1 si falla una revisió (no puja res) i amb 2 si falla git, el nucli o `gh`.

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

El número té **una sola font: la primera entrada de `CHANGELOG.md`** (des de la 2.58.1). No s'escriu enlloc més a mà.

1. Al mateix PR del canvi, afegeix l'entrada nova a dalt de tot de `CHANGELOG.md` (número, data i apartats Afegit, Canviat, Corregit o Eliminat).
2. Executa `python3 motor/tot.py`: posa el número al peu de la portada i de cada món, a la capçalera del tauler i a la capçalera d'aquest README.
   Si t'oblides d'executar-lo, el check «generat» de la revisió falla.
3. No cal etiquetar a mà: quan el PR arriba a `main`, l'Action «Etiqueta la versió» (`.github/workflows/etiqueta.yml`) llegeix el mateix
   `CHANGELOG.md` i posa l'etiqueta `vX.Y.Z` si encara no existeix.

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
  mons.json                          Catàleg de mons i única font de cada món (portada, admin, rànquing i xat)
  build.py                           Genera un món: plantilla + dades → pàgina
  tot.py                             Ho genera tot (mons, portada, blocs de mons.json, admin/preguntes.json, versio.json, sw.js)
  registres.py                       Escriu el que surt de mons.json fora dels mons: admin, BN_MON i peces del xat (el crida tot.py)
  nou_mon.py                         Comença un món nou: entrada a mons.json i esquelet de dades
  revisa-mon.js                      Revisor de contingut d'un món (preguntes, jocs, figures, Troba l'error i boss)
  publica.py                         Publica d'una ordre: revisions, commit, porta del nucli, PR i fusió automàtica
  prova-tot.js                       Passa en local les mateixes proves que l'Action (per grups o una sola)
  prova-visual.js                    Res surt de la pantalla ni dels dibuixos d'un món a 360, 390 i 430 px
  prova-mons.js                      mons.json i els blocs generats coincideixen
  prova_nou_mon.py, prova_publica.py, prova_registres.py, prova-revisa-mon.js   Proves de les eines
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
  prova-tast.js                      Prova del mode tast anònim (?tast=1)
  prova-veu.js, prova-vistes-mates.js, prova-ui-es.js   Proves de la veu bilingüe, les vistes de mates i el castellà (sense navegador)
  prova-docs.js                      La documentació (README, ARQUITECTURA i CHANGELOG) no es queda enrere
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
.github/workflows/             revisa.yml (la revisió de cada PR) i etiqueta.yml (posa l'etiqueta vX.Y.Z)
.claude/skills/nou-mon/        Skill de Claude Code que construeix i publica un món nou de cap a cap
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
| 2 | Compta temes i jocs avaluant les dades amb Node (i en treu els ids dels jocs per a la demo de l'admin) |
| 2b | `registres.py` valida `mons.json` i escriu els blocs que en surten: `MONS-ADMIN` a `admin/index.html`, `BN-MON` a `sprites.js` i `XAT-MONS` a `index.html` i `supabase/bn_xat.sql` (vegeu «L'única font de cada món») |
| 3 | A `index.html`: reescriu les targetes (`MONS:inici..fi`), copia `so-mobil.js` i `actualitza.js` entre les seves marques i posa `sprites.js?v=<empremta>`; a `perfil/index.html` copia els mateixos blocs i posa el mateix `?v=` (i `build.py` el posa a cada món) |
| 3b | Escriu `admin/preguntes.json` (id → text, opcions, correcta, tema) |
| 3b2 | Extreu les constants de regles de `motor/plantilla-estudi-interactiu.html` i escriu `motor/regles.json` i `admin/regles.json` |
| 3c | Llegeix la primera entrada de `CHANGELOG.md` i posa el número al peu de la portada i de cada món, a la capçalera i a l'entrada del tauler (`VERSIO_ADMIN`) i a la capçalera d'aquest README |
| 4 | Calcula una empremta del contingut i la posa a cada pàgina (`VER`), a `versio.json` i a `sw.js` |

L'empremta es calcula amb el buit `__BN_VERSIO__` encara sense omplir, perquè no depengui d'ella mateixa. Si `tot.py` es torna a executar sense canvis, el resultat és idèntic: la revisió automàtica ho aprofita per detectar pàgines editades a mà.

### L'única font de cada món (`motor/mons.json`)

Cada món s'escriu en un sol lloc: la seva entrada de `motor/mons.json`. `build.py` en fa la pàgina i la targeta. El pas 2b de `tot.py` (`motor/registres.py`) escriu la resta entre marques «no editar a mà», i abans valida l'entrada:
- l'sprite ha d'existir a `BN_SPR`;
- els colors han de tenir la forma `#rrggbb`;
- els textos no poden portar `<` ni `>`;
- els ids de les peces han de ser únics, menors de 1001 i diferents dels de les peces generals.

| Camp | Cal? | Per a què | On va a parar |
|---|---|---|---|
| `dades`, `carpeta`, `mon`, `neix`, `materia`, `titol`, `desc`, `colors` (3), `ic` | Sí | La pàgina del món, la seva targeta i la data de naixement (fases del bon ús) | `<carpeta>/index.html`, `index.html` |
| `curt` | Sí | Nom curt del món al tauler | `ASSIGS` (bloc `MONS-ADMIN` d'`admin/index.html`) |
| `spr` | Sí | Icona del rànquing (una clau de `BN_SPR`) | `BN_MON` (bloc `BN-MON` de `sprites.js`) |
| `xat` | Sí | 3 paraules d'estudi del món per al xat, `[id, "text"]` | `XAT_PC_MONS` (bloc `XAT-MONS` d'`index.html` i de `supabase/bn_xat.sql`) |
| `llengua` | No | `"es"` si el món és en castellà | La pàgina del món |
| `xmon` | No | Nom del món al xat de l'admin (per defecte, `curt`) | `XMON` |
| `col_admin` | No | 8 colors per al tauler (per defecte, surten de `colors[1]`) | `COL_MON` |
| `demo_jocs` | No | Jocs de la demo de l'admin (per defecte, els 4 primers del món) | `DEMO_JOCS` |

**Qui més llegeix `mons.json`:**
- `motor/prova-mons.js` comprova que els blocs generats coincideixen amb `mons.json`.
- Les proves del tauler i del xat en treuen el nombre de mons (`motor/eines/mons-prova.js`).
- A Supabase, `bn_control.sql` accepta qualsevol món amb un id de la forma `^[a-z0-9_-]{1,40}$`, sense cap llista escrita a mà.

Les peces del xat de cada món també s'han de posar a la base de dades: fes l'`upsert` de les files del món del bloc `XAT-MONS` de `supabase/bn_xat.sql`.

### Eines per crear, revisar i publicar un món

```
 nou_mon.py ─▶ mons.json + motor/dades/<id>.js (esquelet)
                         │  s'omple amb el contingut dels apunts
                         ▼
 tot.py ─▶ pàgines + blocs de mons.json ─▶ revisa-mon.js ─▶ prova.js (ESTRICTE) + prova-visual.js
                                                                        │
 publica.py ─▶ branca · commit · porta del nucli · PR · fusió automàtica ◀┘
```

| Eina | Què fa |
|---|---|
| `nou_mon.py` | Valida l'id, la carpeta (no pot ser una carpeta reservada com `admin` o `motor` ni existir ja), els colors i les 3 peces. Després afegeix l'entrada a `mons.json` i escriu l'esquelet de dades |
| `revisa-mon.js [id…]` | Troba els errors de contingut que la prova estricta no explica bé o no mira: temes sense preguntes, preguntes o opcions repetides, la correcta fora de rang, la regla del 15–40 %, blocs que no sumen, obertes sense `q`/`p`/`m`, ítems i caixes dels jocs, figures que no tornen un `<svg>`, «Troba l'error» mal format i l'sprite del boss. Sense ids, revisa tots els mons. També es pot fer servir com a mòdul (`revisaFont`, `revisaMon`) |
| `prova-visual.js <carpeta>…` | Obre la portada, el primer tema, els jocs de figura i d'error i el `?demoBoss=1` a 360, 390 i 430 px. Comprova que no hi ha scroll horitzontal i que cap text d'un SVG surt del dibuix ni del seu requadre. Les captures van a `motor/.captures/<id>/` |
| `prova-tot.js` | Sense res, passa en local els grups `base`, `sql` i `interficie` de l'Action. El grup `base` comença comprovant que `tot.py` no canvia res. Amb `mons [carpeta…]`, passa l'estricta i la visual dels mons; amb un fitxer (`motor/prova-xat.js`), només aquella prova |
| `publica.py` | Ho publica tot d'una ordre (apartat 2, «Publicar») |

### Format de les dades (`motor/dades/<id>.js`)

**`ASSIG`** descriu el món:

| Camp | Per a què serveix |
|---|---|
| `id`, `nom`, `tema`, `curs`, `ic` | Identitat i títol. `id` és el que es desa al núvol i al registre |
| `clau` | Prefix de `localStorage` (per defecte, `bn_<id>`) |
| `color` | 3 colors que omplen les variables CSS `--g1`, `--g2` i `--g3` |
| `blocs` | `[{titol, n}]`: agrupa els temes. La suma de `n` ha de donar el nombre de temes |
| `jocs` | Llista de jocs (vegeu «Jocs») |
| `boss` | `{nom, spr, fx, mus, rotul, em}` (i opcionalment `pix` 16×16, `notes` a mida i `ic`, la icona central de la celebració): el repte final del món i la seva celebració audiovisual ([`docs/BOSS-I-EFECTES.md`](docs/BOSS-I-EFECTES.md)) |
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

- **Boss i celebracions (`bossFesta`, `BOSS_FX_CFG`, `BOSS_MUS`):** `bossEstat()` obre el Boss amb el 70 % dels temes aprovats (`BOSS_DESBLOQ`) o amb un examen de 70 o més. Les 10 rondes surten del contingut que el món ja té, i guanyar dona `BOSS_ESTRELLES` = 10 un cop al dia, medalla `🏆` i una **celebració audiovisual (~4,3 s)** amb sprite 16×16 (`BOSS_SPR`, tenyit amb els colors del món), motion CSS (`explosio`, `orbites`, `tempesta`, `blocs`, `espiral`, `esborra`, `focus`), partícules i fanfara WebAudio exclusiva (`epica`, `cosmos`, `primavera`, `chiptune`, `alegria`, `toreador`, `estrena`). En tocar la pantalla es tanca a l'instant i `#bossFi` deixa el botó `🎬 Celebració`; es pot provar directe amb `?demoBoss=1`, definir `pix`/`notes` a mida per a nous mons ([`docs/BOSS-I-EFECTES.md`](docs/BOSS-I-EFECTES.md)) i es verifica automàticament amb `bnProvaBossFesta`. Amb `Mode suau` (`SUAU`), la celebració passa a banda estàtica tranquil·la (`.boss-festa.quiet`).
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
| `mons-prova.js` | Llegeix `mons.json` i el catàleg del xat (`N`, `ids`, `nou`, `vell`, `catalegXat`) perquè les proves no depenguin del nombre de mons | Les proves del tauler i del xat |
| `vistes-mates.js` | Vistes del Taller amb marques (`MXV`, `mxVistaTema`): el dibuix de cada exercici i la teoria dibuixada (`docs/MON-MATES.md`) | Mates i el clima |
| `clima.js` | Generador `climograma` del Taller: un climograma nou cada vegada amb 7 passos (mes més calorós, amplitud, mitjana, total, mesos secs i tipus de clima) | El clima |
| `marca-llengua.js` | Joc «Pinta les paraules» / «Pinta las palabras» (`marcaHtml`) i frases pintades als esquemes de la teoria (`docs/MON-LLENGUA.md`) | Català i Castellano |
| `ui-es.js` | Tradueix al castellà els textos del motor (`uiEs`) perquè les activitats del món de Castellano surtin en castellà | Castellano |

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

- **So:** tot es sintetitza amb WebAudio, sense fitxers. Les veus passen per un bus d'efectes (`SB`) o de música (`BG`/`MB`), un volum general i un compressor, amb reverberació (`REV`) i eco suau (`ECO`). Tant la música de fons com les **fanfares dels Bosses** (`BOSS_MUS` o `notes` a mida) i les **festes del rànquing** es generen en directe.
- **Escolta:** `speechSynthesis`, amb la veu del mateix dispositiu.
- **Descans i bon ús:** cada 25 minuts de pàgina visible (`DESCANS_S`) proposa una pausa de 5 minuts, la registra (`descans`: `fet` o `salta`) i deixa saltar-la com a màxim 2 vegades seguides els dies normals (3 a la vigília). A l'inici del món hi ha el pla de 10 dies (`#plaDia`), el botó «Demà tinc examen» (`examen_dema`, màx. 2 dies/món), l'avís amable als 60/120 minuts i la franja de nit (`21:30`/`22:00`, amb mode suau automàtic). Totes les regles i el filtre per a mecàniques noves són a [`docs/BON-US.md`](docs/BON-US.md).
- **Animacions i Mode suau:** tant els mons (combos, superestrelles cada 50 ⭐ i celebracions de Boss) com el rànquing (`FESTES`) fan servir animacions CSS temàtiques. La classe `suau` del `body` (activada manualment al perfil, via `prefers-reduced-motion` o sola a la franja nocturna sense alterar `bn_suau`) elimina les animacions fortes i els parpelleigs mantenint els missatges estàtics.
- **Teclat:** un únic `keydown` reparteix les tecles segons la pantalla. No interfereix amb camps de text, la pissarra ni el teclat del Taller.

### Registre d'activitat

`registra(event, detall)` escriu a la taula `bn_log`. `retalla()` manté cada registre per sota de 1.700 bytes: si cal, només es queden les preguntes fallades. No registra res obrint el fitxer des de l'ordinador (`file:`), amb `BN_NO_LOG` ni en `MODE_DEMO`. El detall de cada event és a «Què es registra», a l'apartat 8.

---

## 6. Portada, xat i perfil

### 🏠 Portada (`index.html`)

És una pàgina a part, que no surt de la plantilla. S'edita a mà, excepte els blocs marcats que escriu `tot.py`: `MONS`, `SO-MOBIL`, `ACTUALITZA`, l'adreça de `sprites.js` i la versió del peu.

- **Rànquing i festes animades (`FESTES`):** combina les RPC `bn_ranking_mons` (total, estrelles per món i dies diferents d'estudi `dies`; amb `bn_ranking` de reserva) i `bn_ranking_remuntada`, amb les pestanyes `Estrelles`, `Dies` («Dies d'estudi»), `Nivell`, `Setmana`, `Remuntada` i `Xat`. Sense la segona RPC, la pestanya Remuntada surt buida. La classificació mostra els `HS_TOP` = 25 primers i, si el nen queda més avall, la seva fila a sota. `?demo` el mostra amb nens inventats. Tocar **5 vegades seguides** dins del rànquing (o assolir la meta setmanal de la colla) dispara en rotació una de les **5 festes musicals amb animació** (`🌋 TERRATRÈMOL!`, `🥁 LA GRAN DESFILADA!`, `🐝 ATAC D'ABELLOTS!`, `🚀 GRAVETAT ZERO!` i `🐉 FOC DE DRAC!`; detall a [`docs/BOSS-I-EFECTES.md`](docs/BOSS-I-EFECTES.md)).
- **Icones:** `sprites.js` dibuixa el pixel art com a SVG a partir de graelles de 16×16, de manera que es veu igual a tots els aparells.
- **Afegir un món al rànquing:** el món surt sol de la seva targeta (`data-id`, `.mat`, `h2`). El dibuix surt del camp `spr` de `motor/mons.json`: `tot.py` escriu `BN_MON` a `sprites.js` (bloc `BN-MON`, no s'edita a mà).
  - Si l'assignatura és nova, afegeix-la a mà a `BN_MAT` (`curt`, `color`, `tint`). Si no hi és, no es trenca res: agafa un color de reserva.
  - Per a un dibuix nou, primer s'afegeix a `BN_SPR`. Després la seva clau va a `spr`.

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

- **Catàleg:** el bloc `XAT-CATALEG` d'`index.html` és el mateix que carrega `supabase/bn_xat.sql`. Té `XAT_FR`, amb 26 frases, i `XAT_PC`, amb 69 peces avui. `XAT_PC` ajunta dues llistes:
  - `XAT_PC_BASE`: les 45 peces generals, escrites a mà. Si en canvies una, canvia-la també a l'SQL.
  - `XAT_PC_MONS`: 3 peces per món, que `tot.py` genera del camp `xat` de `motor/mons.json` (bloc `XAT-MONS`, a tots dos fitxers).

  `motor/prova-xat-sql.js` comprova que els dos catàlegs coincideixen. Les peces noves que afegeix l'admin (id ≥ 1001) arriben del servidor amb el seu text.
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
S'organitza en **6 seccions principals** (`Inici`, `Nens`, `Mons`, `Activitat`, `Rànquing` i `Xat`, amb barra inferior fixa al mòbil) més l'accés **⚙ Configuració** (`Horaris i crèdits`, `Rànquing`, `Catàleg del xat`, `Llindars` i `Còpies`) a la barra superior, i carrega les funcions de `supabase/bn_admin_*.sql` **sota demanda** segons la pantalla oberta. «Activitat» conserva l'adreça `?v=sessions`, i l'adreça vella del xat (`?v=ranquing&tab=xat`) porta a `?v=xat`.

A la barra superior hi ha només el selector global de període (`Avui`, `7 dies`, `30 dies`, `Curs`, ocult a `Configuració`), actualitzar, tema clar/fosc i `Configuració`; els filtres d'assignatura (`#fAssig`) i de nen (`#fNen`) apareixen localment a cada sub-vista que els admet. El desplegable `#fNen` mostra sempre **tots els nens** que existeixen a la base de dades (`bn_admin_ids`, que uneix `bn_priv.perfils` i `public.bn_log` a `supabase/bn_ids_i_punts.sql`), encara que no tinguin activitat en el període triat o que tinguin 0 registres. El registre (`bn_admin_logs`) es carrega sota demanda paginat en blocs de 1.000 files (`?limit=1000&offset=…`) fins a cobrir tot el període seleccionat, de manera que el límit de 1.000 files per resposta de PostgREST no deixa cap nen fora. Després, en actualitzar, només es baixen les files noves (`p_des_id`, apartat següent).

### 🔄 Actualització sense pantallasso i paginació

Pla: [`docs/superpowers/specs/2026-11-18-admin-ordre-paginacio-pla-mestre.md`](docs/superpowers/specs/2026-11-18-admin-ordre-paginacio-pla-mestre.md) (versions 2.55.0-2.58.0).
- **La pantalla no es repinta mai sola.** Cada minut, i en tornar a la pestanya, `comprovaNovetats()` mira en silenci les últimes accions del registre. Si n'hi ha de noves, surt l'avís «N novetats · Mostra-les» a la capçalera, i a Inici les 6 xifres canvien al seu lloc.
- **Repintat sense esquelets** (`repintaSuau()`): amb «Mostra-les», «Actualitza» o un canvi de període, la vista nova es prepara amagada i substitueix la vella d'una vegada, amb l'scroll al mateix lloc.
- **Versió nova del web:** no recarrega el tauler; surt la banda «Hi ha una versió nova del tauler · Recarrega / Més tard».
- **Baixada incremental:** `bn_admin_logs(…, p_des_id)` (`supabase/bn_log.sql`) torna només les files amb un id més gran que l'última que ja té el tauler. Si el SQL fos vell (sense `p_des_id`), el tauler ho detecta i baixa sencer.
- **Paginació:** totes les taules (`taula()`) van de 25 en 25 (selector 25/50/100, desat al navegador), amb la cerca, l'ordenació i el CSV sobre totes les files. El log per dia va de 7 dies en 7 dies, amb 50 accions per dia i «Mostra'n 50 més». Les alertes d'Inici van de 10 en 10.

### 🎛️ Control ràpid: xat, horari i mons

A **Inici** (`#control`, amb interruptors d'1 clic) i a **⚙ Configuració → Horaris i crèdits**:

- **Obrir o tancar el xat** amb un clic (també des de la secció `Xat` del menú).
- **Programar l'horari automàtic** (`Configuració → Horaris i crèdits`): una hora de tancament i una d'obertura, en hora de Catalunya/Madrid (per exemple `21:30` → `07:00`), que tanca el xat de nit i mostra l'avís amable d'anar a descansar als mons i a la portada.
- **Activar o desactivar cada món** (des d'`Inici` o des de `Mons → Llista`). Un món desactivat surt en gris a la portada amb «🔒 TANCAT» i no deixa entrar-hi, tampoc per enllaç directe. Les estrelles es conserven al rànquing.

El SQL és a `supabase/bn_control.sql`. Els mons es validen pel format de l'id (`^[a-z0-9_-]{1,40}$`), sense cap llista escrita a mà: un món nou no hi demana cap canvi.

### 📊 Inici, Mons, Activitat, Rànquing i Xat

Les vistes s'alimenten amb les funcions agregades de `supabase/bn_admin_tauler.sql` (`bn_admin_resum`, `_activitat`, `_calor`, `_domini`, `_fallades`, `_evolucio`, `_alertes`) carregades sota demanda:
- **Inici (`?v=inici`):** 6 xifres clau amb comparació amb el període anterior, **alertes plegables** (a dalt, abans del control ràpid d'1 clic) (`bn_admin_alertes`, amb resum de pastilles, filtres per gravetat/tipus/món, enunciat real de les preguntes, drecera `⚙ Ajusta` i 10 alertes per pàgina), nens nous (`bn_admin_altes`) i resum d'estrelles per origen (`bn_admin_fonts_dia`).
- **Mons (`?v=mons`) i Fitxa del món (`?v=mons&id=<mon>`):** llista dels 8 mons amb interruptor directe, matriu de domini nen × tema (`bn_admin_domini`), preguntes més fallades amb el parany més triat (`bn_admin_fallades`), errors pendents (`bn_admin_rep_pendents`), dificultat real (`bn_admin_dificultat`), preguntes obertes al panell lateral i, a matemàtiques, **✏️ Taller de mates: on s'equivoquen** (`bn_admin_errors_taller`, a `supabase/bn_admin_errors_taller.sql`).
- **Activitat (`?v=sessions`):** `Sessions` (cronologia, amb el detall al panell lateral), **`Log per dia`** filtrable per món, nen i data (o en `Taula`, amb exportació CSV) i `Gràfics` (mapa de calor hora × dia, evolució diària i estrelles per origen).
- **Rànquing (`?v=ranquing`):** `Classificació` pública (`Total`, `Per món`, `Setmana` via `bn_ranking_mons`) amb interruptor `Visible` i bloc inferior d'amagats, i `Reptes` (`Combos i repàs` i `Repàs, boss i missions` de `tMotivacio()`).
- **Xat (`?v=xat`):** resum del dia, interruptor del xat, moderació dels missatges en 5 columnes i silenciats, amb dreceres al catàleg i als horaris de `Configuració`.

### 💚 Benestar

A **Nens → Benestar** (`?v=nens&tab=benestar`) i a la pestanya **Sessions i benestar** de cada Fitxa del nen. Mostra l'ús sa de cada nen segons [`docs/BON-US.md`](docs/BON-US.md) (apartats 2 i 5), amb `bn_admin_benestar` (`supabase/bn_admin_benestar.sql`). Una fila per nen amb el semàfor i els motius. Per món, la fase (novetat, aprendre, vigília, després) i la vigília d'examen: la data que posa l'admin (`bn_admin_examen_desa`, taula `bn_priv.examens`) o, si no n'hi ha, el pic del grup (5 nens o la meitat, el triple de minuts d'un dia normal, només del dia 3 al 12 del món). Els llindars i la gravetat (`Malament`, `Avís`, `Informatiu` o `Desactivat`) tant de les 6 regles d'`Alertes d'Inici` com dels 11 senyals de vigilància de `Benestar` es poden ajustar i desar a Supabase des de `⚙ Configuració → Llindars` (`bn_priv.config`, clau `'llindars'`). El temps es compta per aparell: amb dos aparells alhora, els minuts poden sortir doblats (el tauler ho avisa).

### 🔥 Combos i repàs, i errors pendents de la colla

A **Rànquing → Reptes** i **Mons → Fitxa del món → Domini i errors** (`supabase/bn_admin_fonts_rep.sql`). `bn_admin_fonts_dia` treu les estrelles de cada font per dia de les diferències del camp `fonts` entre registres del mateix nen i món: el porten `entra` i `temps` i, des de la 2.8.2, també `test`, `joc`, `examen` i `oberta`. Cada increment es compta contra el màxim anterior, de manera que un aparell vell que envia valors baixos no fa comptar dues vegades el mateix. El primer registre de cada nen i món, i el primer després d'un reinici, només serveixen de base, i un valor que baixa compta 0. `bn_admin_rep_pendents` agrega els errors pendents de repàs (`estat.rep` de `bn_priv.progres`) per món i tema, sense noms.

### ⚡ Dificultat real de les preguntes

A **Mons → Dificultat real** (`?v=mons&tab=dificultat`, i per món a `?v=mons&id=<mon>&tab=domini`, `supabase/bn_admin_dificultat.sql`, issue `#16`). Mostra sempre els 8 mons, llegeix `bn_admin_dificultat` (respostes de `test` i `examen` dels últims 365 dies, excloent el repàs espaiat) i la compara directament al navegador amb `motor/dificultat.json` i `admin/preguntes.json`: marca `➕ Proposa ⚡` les preguntes amb `< 55 %` d'encert (i `≥ 8` respostes) que encara no són difícils, `➖ Revisa ⚡` les marcades difícils amb `≥ 75 %` d'encert, `⚡ Confirmada` i `Fàcil (> 90 %)`, indica també els mons que encara tenen `< 8` respostes per pregunta o sense dades, i permet descarregar el JSON per passar-lo a `python3 motor/dificultat.py --proposa`.

### 👤 Nens i Fitxa del nen

**Nens nous** (a **Inici**): les altes del període de dalt, amb `bn_admin_altes` (`supabase/bn_admin_fitxa.sql`). La data d'alta és la primera vegada que es veu el nen: el primer registre o `perfils.creat` (quan crea el perfil amb el PIN; els perfils d'abans del 10-11-2026 no la tenen), el que sigui abans. No es fa servir `nou` de l'event `entra`, que vol dir «nou en aquell aparell».

**Nivells al tauler** (des de la 2.16.0): el tauler llegeix `admin/regles.json` (generat per `tot.py` des de la plantilla) i mostra el nivell de cada nen i de cada món —amb les estrelles que falten per al següent— a la taula de Nens, a `Rànquing → Classificació`, a la capçalera i els KPIs de la fitxa, a cada assignatura i a la pestanya «Núvol i gestió».

**Fitxa de cada nen** (`?v=nens&id=<nen>`, amb selector ràpid `#selFitxaNen` i descàrrega d'**Informe HTML / PDF** o **Informe .md**): agrupa 4 pestanyes (`Resum i estrelles`, `Aprenentatge`, `Sessions i benestar` i `Núvol i gestió`). A **Núvol i gestió** es mostra l'estat que el nen ha desat al núvol a cada món (`bn_priv.progres`, amb `bn_admin_fitxa`), l'accés directe a còpies i les accions del compte: canviar el nom (conserva el registre, el perfil, el progrés i també els missatges, vots i silencis del xat; `supabase/bn_pin_nou.sql`), amagar-lo del rànquing, treure el PIN i:
- **♻️ Esborrar el progrés:** tries «Tots els mons» o un món concret i confirmes (surten el nom del nen i el món, i «No es pot desfer»).
  S'esborren les estrelles, els tests, els jocs i el temps d'aquell món (o de tots), també del rànquing. **El nen es queda amb el nom i el PIN.**
  Als seus dispositius, el progrés d'abans s'esborra sol la propera vegada que hi entra (un dispositiu vell no el pot fer tornar).
  Cal haver executat una vegada `supabase/bn_admin_reinicia.sql`.
- **🗑️ Esborrar el nen del tot:** treu el nen sencer (registre, PIN i progrés).

Dins dels mons ja no hi ha cap botó per esborrar el progrés: només es pot fer des de l'admin.

### 💾 Còpies de seguretat

`admin/` → **⚙ Configuració → Còpies** (`?v=config&tab=copies`, `supabase/bn_copies.sql`, ja executat al projecte «bonanota»):
- Cada còpia guarda el registre, els perfils (PIN xifrat), el progrés al núvol, els noms amagats, la configuració, els reinicis i les taules del xat (`xat_frases`, `xat_peces`, `xat_msg`, `xat_vots` i `xat_silenci`). **No** guarda els administradors.
- Es fan soles **cada nit a les 3:00** (pg_cron `bn-copia-diaria`) i **just abans d'esborrar o canviar** dades des de l'admin (triggers `bn_copia_abans`); també amb el botó «Fes una còpia ara».
- Les automàtiques es guarden 30 dies; la resta, 90. Des de l'admin es poden **descarregar** (JSON), **restaurar** (dues confirmacions; abans es fa una còpia de l'estat d'ara) i **esborrar**.
- A part, Supabase guarda cada dia una còpia de tota la base de dades (7 dies), que es restaura des del seu panell.

---

## 10. Proves i revisió automàtica

A cada PR i a cada pujada a `main`, GitHub Actions executa «Revisa Bona Nota» (`.github/workflows/revisa.yml`). Hi ha quatre jobs en paral·lel, i un cinquè que en recull el resultat:

| Job | Què hi ha |
|---|---|
| `base` | Comprova que `tot.py` no canvia res i passa les proves sense navegador: el Taller, les regles, `mons.json`, el revisor de contingut i les eines |
| `sql` | El SQL de `supabase/` dins de PGlite |
| `interficie` | La portada, el perfil, la guia per a les famílies, el mode tast i el tauler, amb Playwright |
| `mons` | Un job per a cada món de `motor/mons.json`, amb la prova estricta i la visual. Les captures es poden baixar com a artefacte (`captures-…`) |
| `tot` | El check «Revisa Bona Nota · tot», que només surt en verd si els altres quatre ho estan |

Els tres jobs amb navegador tenen Chromium en memòria cau. El ruleset «main protegida» exigeix el check «Revisa Bona Nota · tot» abans de fusionar, i la fusió automàtica l'espera: si un sol pas falla, el PR no es fusiona. El resultat surt a la pestanya **Actions** del repo.

| Pas | Fitxer | Què comprova |
|---|---|---|
| 1 | `motor/tot.py` + `git diff` | Torna a generar tots els mons i la portada. Si una pàgina pujada no coincideix (editada a mà o sense regenerar), falla i diu quins fitxers |
| 2 | `motor/prova-generadors.js` | Els generadors del Taller de mates (càlculs, errors típics, Troba l'error) |
| 3 | `motor/prova-regles.js` | Les regles copiades (nivells, aprovat…) coincideixen amb la plantilla |
| 3b | `motor/prova-mons.js` | `mons.json` és l'única font: els camps de cada món, els ids de les peces i els blocs generats a l'admin, `sprites.js`, `index.html` i `bn_xat.sql` |
| 3c | `motor/prova-revisa-mon.js`, `motor/revisa-mon.js` | El revisor de contingut (amb fitxers de prova) i el contingut de tots els mons |
| 3d | `motor/prova_nou_mon.py`, `prova_publica.py`, `prova_registres.py` | Les eines per crear i publicar mons. `prova_publica.py` fa una publicació sencera en un repo temporal, amb `gh` i `nucli` simulats |
| 3e | `motor/prova-veu.js`, `prova-vistes-mates.js`, `prova-ui-es.js` | La veu bilingüe (cada tros sona en la llengua que toca), les vistes amb marques del Taller i la traducció al castellà dels textos del motor (sense navegador) |
| 3f | `motor/prova-docs.js` | Que la documentació no es quedi enrere: cada eina de `motor/eines/` surt al README i a ARQUITECTURA, cada prova de `motor/` surt a la taula d'aquest apartat, i el CHANGELOG només fa servir els apartats Afegit, Canviat, Corregit i Eliminat |
| 4 | `motor/prova-nuvol.js` | El núvol d'un món, amb Supabase simulat: un aparell vell no trepitja el progrés del núvol, sense connexió no puja res i el `-2` es resol sense bucles |
| 5 | `motor/prova-perfil.js` | La pàgina de perfil: tries amb clic i teclat, desat al núvol, sense connexió i amb PIN incorrecte, Sorpresa i «Efectes suaus» |
| 6 | `motor/prova-admin-fonts.js` | Els orígens d'estrelles del tauler (funcions pures) |
| 7 | `motor/prova-xat-sql.js`, `prova-xat.js`, `prova-admin-xat.js` | El xat de la colla: el SQL, la portada i la pestanya de l'admin (detall a sota) |
| 8 | `motor/prova-admin-fitxa-sql.js`, `prova-admin-fitxa.js` | La fitxa «Al núvol» i les altes: el SQL i el tauler |
| 9 | `motor/prova-admin-benestar-sql.js`, `prova-bon-us-sql.js`, `prova-admin-benestar.js` | El benestar, les fases del món (`bn_vigilia`) i l'apartat del tauler |
| 10 | `motor/prova-admin-fonts-rep-sql.js`, `prova-admin-fonts-rep.js` | «Combos i repàs» i «Errors pendents de la colla»: el SQL i el tauler |
| 11 | `motor/prova-control-sql.js`, `prova-admin-alta.js` | El control de xat, horari i mons, el filtre superior amb tots els nens i els nivells al tauler |
| 12 | `motor/prova-pin-intents-sql.js`, `prova-fotos-sql.js`, `prova-pares.js`, `prova-tast.js`, `prova-dificultat-sql.js`, `prova-admin-dificultat.js` | El bloqueig de 15 minuts al 5è intent de PIN (#33), el permís de fotos del quadern, la guia per a les famílies (`pares/`), el mode tast anònim (`?tast=1`) i la dificultat real de les preguntes al servidor i al tauler (#16) |
| 12b | `motor/prova-admin-evolucio.js` | El gràfic d'evolució del tauler |
| 12c | `motor/prova-admin-auto.js` | L'actualització del tauler sense pantallasso: comprovació silenciosa, avís «Mostra-les», repintat sense esquelets i banda de versió nova |
| 12d | `motor/prova-admin-pagines.js` | La paginació del tauler: taules de 25 en 25 (o 50/100), cerca, ordenació i CSV amb totes les files, log per dia sense tall i alertes de 10 en 10 |
| 12e | `motor/prova-admin-ordre.js` | L'ordre del tauler: menú amb Activitat i Xat, alertes a dalt d'Inici, Rànquing sense Xat, adreça vella del xat i barra del mòbil amb 6 botons |
| 12f | `motor/prova-admin-logs-sql.js` | La baixada incremental del registre: `bn_admin_logs(…, p_des_id)` torna només les files noves i substitueix la versió vella de 3 paràmetres |
| 13 | `motor/prova.js` (un cop per món, amb `ESTRICTE=1`) | Cada món sencer: tests, jocs, exàmens, repàs, obertes, estrelles, superestrelles i capçalera |
| 14 | `motor/prova-visual.js` (un cop per món) | A 360, 390 i 430 px no hi ha scroll horitzontal i cap text d'un SVG surt del dibuix ni del seu requadre |

Les proves `…-sql.js` executen el SQL de `supabase/` dins de **PGlite**, un Postgres de prova sense xarxa. Les altres obren la pàgina amb **Playwright** i un Supabase simulat: cap prova toca la base de dades real.

**Passar-les en local.** Un sol cop, des de la carpeta del repo:

```
npm install --no-save playwright@1 @electric-sql/pglite@0.5
npx playwright install chromium
```

Després, `motor/prova-tot.js` passa en local el mateix que l'Action i en fa un resum:

| Ordre | Què passa |
|---|---|
| `node motor/prova-tot.js` | Els grups `base`, `sql` i `interficie` |
| `node motor/prova-tot.js base` (o `sql`, o `interficie`) | Només aquell grup |
| `node motor/prova-tot.js mons [carpeta…]` | Les proves estricta i visual dels mons triats (sense carpeta, de tots) |
| `node motor/prova-tot.js motor/prova-xat.js` | Només aquella prova |

Cada ordre és una de sola, sense `&&` ni `cd`, perquè Claude Code la pugui passar sense finestra de permís (apartat 11).

**`motor/prova.js`** obre la pàgina generada amb Playwright i la fa jugar: cada tema (fitxa, targetes i test perfecte), cada joc, els exàmens, el repàs i les obertes, i executa les funcions de `prova` dels jocs `custom` i les de `BN_PROVES`.
Amb `ESTRICTE=1`, un món falla si té temes amb menys de 8 preguntes o si la resposta correcta és l'opció més llarga fora del marge del 15 % al 40 %.

**`motor/prova-generadors.js`** carrega el Taller sense navegador i executa cada generador moltes vegades per nivell (11.700 exercicis, també els climogrames del món del clima): comprova que la resposta bona es dona per bona, que les dolentes no fan petar els missatges i que els càlculs quadren.

**Les proves del xat:** `motor/prova-xat-sql.js` executa `supabase/bn_xat.sql` (dues vegades, per comprovar que és idempotent) i prova cada codi de `bn_xat_envia`, el canvi de dia a mitjanit, els vots, la lectura, l'admin i els permisos; `motor/prova-xat.js` prova la portada (crèdits, bloquejos, enviar, votar, contraccions, «Digues-li», mòbil, `?demo` i el rànquing igual que abans sense el SQL); `motor/prova-admin-xat.js` prova la pestanya Xat de l'admin.

> Les proves del tauler compten els mons de `motor/mons.json` (`motor/eines/mons-prova.js`): un món nou no les trenca.

---

## 11. Qui hi treballa: Claude i Gemini

Bona Nota es programa amb agents d'IA. **Hi treballen Claude (Claude Code) i Gemini**, i les mateixes regles valen per a qualsevol altre agent (Kimi, Codex…).

- **Regles comunes:** tots els agents segueixen [`AGENTS.md`](AGENTS.md) i el nucli (`nucli.json`). `CLAUDE.md` remet a `AGENTS.md`.
- **Numeració de Gemini:** les tasques i els blocs que fa Gemini es numeren amb la lletra `g` (`g1`, `g2`, `g3`…). L'id surt al final del commit.
- **Memòria del projecte**, a `docs/`: `ESTAT.md` (com està tot), `DECISIONS.md` (què s'ha decidit i per què), `TRAMPES.md` (errors per no repetir),
  `CONVENCIONS.md` (com es treballa) i `ARQUITECTURA.md` (on és cada cosa).
- **Abans de publicar:** `nucli ship plan` diu quines comprovacions demana el canvi, `nucli ship run <check>` les passa i `nucli ship seal` les segella. `motor/publica.py` ho fa sol (apartat 2).
- **Un món nou d'una tirada:** amb Claude Code, la skill `nou-mon` (`.claude/skills/nou-mon/SKILL.md`) llegeix la carpeta de Drive del tema i fa la resta de cap a cap, sense preguntar res pel camí:
  1. `nou_mon.py` i les dades;
  2. el revisor i una revisió de fidelitat als apunts;
  3. l'`upsert` de les peces del xat a Supabase, la versió i els docs;
  4. `publica.py`.

  El que és dubtós no s'atura: va a la fitxa com «⚠ … pregunta-ho al profe».
- **Sense finestres de permís:** `.claude/settings.local.json` és personal i no va a git. Deixa passar soles aquestes ordres: `gh`, `git push`/`fetch`/`pull`, `node motor/prova-tot.js …`, `node motor/prova-visual.js …` i `python3 motor/publica.py …`.
  - Cada ordre s'ha d'executar sola, sense `&&`, `|`, `cd` ni heredoc.
  - Fusionar amb `--admin` i empènyer cap a `main` estan prohibits.
  - El bloc per copiar-lo en un altre ordinador és a l'apartat 5 de [`docs/NOU-MON.md`](docs/NOU-MON.md).

Gemini es fa servir per desenvolupar l'app. Dins de l'app només hi ha una IA: Claude, que corregeix les fotos del quadern.
