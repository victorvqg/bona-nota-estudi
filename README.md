# ⭐ Bona Nota · Estudia jugant (1r ESO)

**Web:** https://bonanota.net · **Versió:** 2.6.0 ([historial de canvis](CHANGELOG.md)) · **Mons:** [què hi ha i com es juga](docs/MONS.md) · **Notes:** [com s'avalua](docs/AVALUACIO.md)

Bona Nota és una web per repassar els temes de 1r d'ESO jugant. Aquest README explica **com està feta**.
La llista de mons, el contingut i les regles del joc són a [`docs/MONS.md`](docs/MONS.md)
(https://github.com/victorvqg/bona-nota-estudi/blob/main/docs/MONS.md).

> 🌐 La web té domini propi, **bonanota.net** (fitxer `CNAME`). L'adreça antiga de GitHub Pages i `www.bonanota.net` hi redirigeixen soles.

---

## 🧭 Visió general

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
| **PDFs** (`skills/bona-nota/`) | Skill que genera paquets d'estudi en PDF, separada de la web |

---

## ⚙️ El motor

`motor/plantilla-estudi-interactiu.html` conté l'HTML, el CSS i el JavaScript d'un món, unes 1.800 línies. **Un món és aquesta plantilla més un fitxer de dades.**
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
| 3 | A `index.html`: reescriu les targetes (`MONS:inici..fi`), copia `so-mobil.js` i `actualitza.js` entre les seves marques i posa `sprites.js?v=<empremta>` |
| 3b | Escriu `admin/preguntes.json` (id → text, opcions, correcta, tema) |
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

En entrar, `bn_progres_llegeix` baixa el núvol i `fusiona()` el combina amb el dispositiu **sense perdre mai res**:

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

`suma(n)` afegeix estrelles i les atribueix a la font activa (`FONT`), que alimenta `fonts`, `ftema` i `fjoc`. Perquè no es puguin inflar:

- `diaEst()` guarda a `S.est` què ja ha premiat avui. `estPregunta()` només dona estrella el primer cop del dia, i `JOCSTAR` fa el mateix amb els jocs.
- Els nivells surten de la taula `NIVELLS` i depenen de les estrelles de cada món.
- `puntsTots()` suma tots els mons, llegint el `localStorage` de cadascun i el que ha baixat `carregaPuntsMons()`. Cada `SUPER` = 50 ⭐ surt una superestrella.

### Repàs espaiat

És un sistema de capses guardat a `S.rep`, amb clau `<tema>|<pregunta>`. Cada entrada té la capsa `c` i la data `prox`.

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
- **Obertes:** `validaOberta(text, o)` decideix si el text és una resposta: mínim de paraules (`OB_MIN`), paraules reals comparades amb el vocabulari del món, i sense còpia de l'enunciat, la resposta model o les idees (seqüències de 4 paraules). `ideaDetectada(punt, text, enunciat)` posa la nota: compara arrels de 5 lletres, descarta les paraules que ja són a l'enunciat i demana una quarta part de les paraules clau de la idea (`OB_IDEA`). Si la idea porta números de 2 xifres o més que no surten a l'enunciat, també val si el text els conté tots. Les caselles de resposta no accepten enganxar (`obProtegeix`), i el boss fa servir el mateix validador. Quan el nen veu la resposta model, `S.obv[n]` deixa la pregunta en pràctica durant `OB_DIES`. Una eina pot afegir-hi coses amb el ganxo `obertesExtra(n, o)`.

### Jocs

`joc(id)` busca el joc a `ASSIG.jocs` i crida la funció del seu `tipus`. Tots porten `id`, `tipus`, `ic`, `titol`, `sub`, `col` i, opcionalment, `grup` i `final`.

| `tipus` | Funció | Camps propis |
|---|---|---|
| `ordena` | `jocOrdena` | `enunciat`, `instr`, `base`, `items` |
| `parelles` | `jocParelles` | `enunciat`, `instr`, `pars` |
| `classifica` | `jocClassifica` | `enunciat`, `instr`, `caixes`, `items` |
| `figura` | `jocFigura` | `enunciat`, `figura`, `q` |
| `error` | `jocError` | `exercicis` (el format és al comentari de la secció «TROBA L'ERROR GENÈRIC» de la plantilla) |
| `custom` | `window[j.fn](j)` | `fn` i `prova`: la funció del joc i la que el prova |

Aquests tipus viuen a la plantilla. `motor/jocs_generics.js` és una còpia antiga que no carrega ningú i ja no coincideix: no s'hi ha de fer cap canvi.

### Eines (`motor/eines/`)

| Fitxer | Què hi ha | Qui l'inclou |
|---|---|---|
| `exercicis-mates.js` | Taller de mates: generadors `MXG`, Troba l'error `MXE`, teclat, fitxes en 3 modes, examen i repàs barrejat | Mates |
| `manipulatius-mates.js` | Dibuixos interactius: rectangles, arbre de factors, granotes, rajoles | Mates |
| `quadern.js` | Punts de control i foto del quadern a les obertes | Mates |
| `pissarra.js` | Full de brut tàctil (no es desa) | Mates |
| `so-mobil.js` | Un sol `AudioContext`, desbloquejat al primer toc, que sona a l'iPhone en silenci | Plantilla i portada |
| `actualitza.js` | Actualització automàtica (vegeu «App») | Plantilla i portada |
| `mapa-comarques.js` | Genera els camins SVG de les 43 comarques i els escriu a `dades/comarques.js`, entre les marques `MAPA:inici` i `MAPA:fi` | Ningú: s'executa a mà |

El Taller desa cada resposta fallada com `exercici|pas|error` (camp `ep`), que el tauler agrupa. Hi ha generadors preparats que encara no surten enlloc: operacions combinades, suma i resta de fraccions i equacions de primer grau.

### Punts d'extensió

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
- **Descans:** cada 25 minuts de pàgina visible (`DESCANS_S`) proposa una pausa.
- **Mode suau:** la classe `suau` del `body` treu les animacions fortes.
- **Teclat:** un únic `keydown` reparteix les tecles segons la pantalla. No interfereix amb camps de text, la pissarra ni el teclat del Taller.

### Registre d'activitat

`registra(event, detall)` escriu a la taula `bn_log`. `retalla()` manté cada registre per sota de 1.700 bytes: si cal, només es queden les preguntes fallades. No registra res obrint el fitxer des de l'ordinador (`file:`), amb `BN_NO_LOG` ni en `MODE_DEMO`. El detall de cada event és a «Què es registra», més avall.

---

## 🏠 Portada (`index.html`)

És una pàgina a part, que no surt de la plantilla. S'edita a mà, excepte els blocs marcats que escriu `tot.py`: `MONS`, `SO-MOBIL`, `ACTUALITZA`, l'adreça de `sprites.js` i la versió del peu.

- **Rànquing:** combina les RPC `bn_ranking_mons` (amb `bn_ranking` de reserva) i `bn_ranking_remuntada`. Sense la segona, la pestanya Remuntada surt buida. `?demo` el mostra amb nens inventats.
- **Icones:** `sprites.js` dibuixa el pixel art com a SVG a partir de graelles de 16×16, de manera que es veu igual a tots els aparells.
- **Afegir un món al rànquing:** surt sol de la seva targeta (`data-id`, `.mat`, `h2`). Per donar-li dibuix i color, a `sprites.js` afegeix-lo a `BN_MON`
  (`id: {ic: "un dibuix de BN_SPR", mat: "Assignatura"}`). Si l'assignatura és nova, afegeix-la també a `BN_MAT` (`curt`, `color`, `tint`).
  Sense aquestes entrades no es trenca res: surt amb el seu emoji en una rajola grisa i l'assignatura nova agafa un color de reserva.

---

## 📲 App: sense connexió i actualització

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

## 🗂️ On és cada cosa

```
index.html                     Portada: targetes dels mons + rànquing
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
  eines/                             Codi compartit (vegeu «Eines»)
  prova.js                           Prova automàtica d'un món (Playwright)
  prova-generadors.js                Prova dels generadors del Taller de mates (sense navegador)
  local.py                           Servidor local que es posa al dia sol amb GitHub
admin/                         Tauler d'administració
supabase/*.sql                 Base de dades: registre, rànquing, perfils amb PIN, progrés al núvol
supabase/functions/bn-corregeix/   Correcció de la foto del quadern
skills/bona-nota/              Skill que genera els PDFs d'estudi (skills/bona-nota.zip és el paquet)
sw.js, manifest.webmanifest, icones/   App instal·lable (sw.js el genera tot.py)
versio.json                    Empremta de l'última publicació (la genera tot.py)
CNAME                          Domini de la web: bonanota.net
CHANGELOG.md                   Historial de versions
AGENTS.md, CLAUDE.md, nucli.json, docs/   Regles i memòria del projecte per als agents d'IA
```

---

## 🔒 Dades

- **Al navegador** (localStorage): el progrés de cada nom, separat per món.
- **Base de dades:** projecte Supabase propi **«bonanota»** (`agippwtqvhpxdockuigl`, Frankfurt), des del 5-11-2026.
  Abans compartia el projecte «marcador»; s'hi va copiar tot (registre, perfils amb PIN, progrés, admin i les 37 funcions) i es va comprovar que era idèntic.
- **Al núvol** (Supabase), només amb nom i PIN: el progrés de cada món, per poder canviar d'aparell.
- **Registre d'activitat** (`bn_log`): què fa cada nen i quan, per al panell d'admin i el rànquing. Només s'hi pot escriure; llegir-lo només ho pot fer l'admin.
- **Rànquing:** `bn_ranking_mons` (total i estrelles per món). Els noms amagats o no permesos no hi surten.
- **Reinicis** (`bn_priv.reinicis`): quan l'admin esborra el progrés d'un nen, es desa la data per món (o «tots»). L'app la rep amb `bn_progres_llegeix`, buida el progrés vell del dispositiu i el servidor no accepta progrés ni estrelles d'abans d'aquella data (`supabase/bn_admin_reinicia.sql`).
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
| `test` | tema, `pc`, `mode` (tema · repas), `s` total, `q`: una entrada per pregunta, i `pistes` (preguntes amb pista, si n'hi ha) |
| `examen` | `joc` (examen · examreal), `pc`, `mode` (sorpresa · real · real-temps), `s`, `temes` i `q`. L'examen de mates porta `nota` sobre 10 en lloc de `pc`, i `nivell` i `ep` |
| `joc` | `joc`, `pc`, `s`, `enc`, `err`; el MAPA també `mode` i `f` (comarques fallades). El boss (`joc: "boss"`) també porta `guanya`, `cors`, `hp` i `q`. El repàs (`joc: "repas"`) també porta `apr` (errors apresos en aquella sessió) i `ext` (p. ex. `mx:1/2,mapa:2/3`: errors del Taller i del MAPA recordats) |
| `oberta` | número, tema, `pc`, `s`, `idees`/`de`, `det` (idees trobades al text), `falten` (idees no trobades) i, si n'hi ha, `mode: "practica"`, `rebutjat` i `enganxat`. Des de la versió 2.6.0 `pc` surt de les idees trobades; abans el marcava el nen |

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
El domini per tema i les preguntes més fallades surten plegats per món.
L'apartat **Repàs, boss i missions** (`tMotivacio()`) no necessita cap funció a Supabase: es calcula al navegador amb el registre que el tauler ja ha carregat i respecta el període i els filtres. Les missions no es registren una per una: la xifra surt de `fonts.missio`, el total d'estrelles de missions de cada nen.
L'apartat **✏️ Taller de mates: on s'equivoquen** (exercici · pas · error · vegades · nens) surt de `bn_admin_errors_taller`, a `supabase/bn_admin_errors_taller.sql` (s'executa una vegada, després de `bn_admin_tauler.sql`), i llegeix el camp `ep` (`"exercici|pas|error"`, un per cada resposta fallada) que el Taller afegeix als events `joc` i `examen`.

**Fitxa de cada nen** (`admin/`, pestanya 👤 Nens → toca un nom): canviar el nom, amagar-lo del rànquing, treure el PIN i:
- **♻️ Esborrar el progrés:** tries «Tots els mons» o un món concret i confirmes (surten el nom del nen i el món, i «No es pot desfer»).
  S'esborren les estrelles, els tests, els jocs i el temps d'aquell món (o de tots), també del rànquing. **El nen es queda amb el nom i el PIN.**
  Als seus dispositius, el progrés d'abans s'esborra sol la propera vegada que hi entra (un dispositiu vell no el pot fer tornar).
  Cal haver executat una vegada `supabase/bn_admin_reinicia.sql`.
- **🗑️ Esborrar el nen del tot:** treu el nen sencer (registre, PIN i progrés).
Dins dels mons ja no hi ha cap botó per esborrar el progrés: només es pot fer des de l'admin.

**Còpies de seguretat** (`admin/` → Còpies de seguretat; `supabase/bn_copies.sql`, ja executat al projecte «bonanota»):
- Cada còpia guarda el registre, els perfils (PIN xifrat), el progrés al núvol, els noms amagats, la configuració i els reinicis. **No** guarda els administradors.
- Es fan soles **cada nit a les 3:00** (pg_cron `bn-copia-diaria`) i **just abans d'esborrar o canviar** dades des de l'admin (triggers `bn_copia_abans`); també amb el botó «Fes una còpia ara».
- Les automàtiques es guarden 30 dies; la resta, 90. Des de l'admin es poden **descarregar** (JSON), **restaurar** (dues confirmacions; abans es fa una còpia de l'estat d'ara) i **esborrar**.
- A part, Supabase guarda cada dia una còpia de tota la base de dades (7 dies), que es restaura des del seu panell.

---

## ✅ Proves i revisió automàtica

A cada push, GitHub Actions (`.github/workflows/revisa.yml`) fa tres coses:

1. Torna a generar tots els mons i la portada. Si una pàgina pujada no coincideix (editada a mà o sense regenerar), falla i diu quins fitxers.
2. Passa la prova dels generadors del Taller de mates (`motor/prova-generadors.js`).
3. Passa la prova de cada món en mode estricte: tests, jocs, exàmens, repàs, obertes, estrelles, superestrelles i rànquing de la capçalera.
   També exigeix 8 preguntes per tema, i que la resposta correcta no sigui massa sovint (ni massa poc) la més llarga.

El resultat surt a la pestanya **Actions** del repo.

**`motor/prova.js`** obre la pàgina generada amb Playwright i la fa jugar: cada tema (fitxa, targetes i test perfecte), cada joc, els exàmens, el repàs i les obertes, i executa les funcions de `prova` dels jocs `custom` i les de `BN_PROVES`.
Amb `ESTRICTE=1`, un món falla si té temes amb menys de 8 preguntes o si la resposta correcta és l'opció més llarga fora del marge del 15 % al 40 %.

**`motor/prova-generadors.js`** carrega el Taller sense navegador i executa cada generador moltes vegades per nivell (10.800 exercicis): comprova que la resposta bona es dona per bona, que les dolentes no fan petar els missatges i que els càlculs quadren.

---

## 🛠️ Feines habituals

### Veure-ho en local

Des de la carpeta del repo, en un Terminal:

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
| `?demo` | L'inici del món amb un usuari de prova |
| `?joc=<id>` | Un joc (a mates, `?joc=err` és Troba l'error) |
| `?tema=<número>` | Un tema, comptant des de 0 |
| `?vista=<vista>` | Una vista del món (per exemple, `jocs`) |
| `?joc=<fitxa>&llibreta=1` | Una fitxa del Taller, directament a l'exemple resolt |

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

Per afegir un **Troba l'error** a qualsevol món, a `ASSIG.jocs` hi va un joc `tipus:"error"`. El format és al comentari de la secció «TROBA L'ERROR GENÈRIC» de la plantilla.

**Regles del contingut:** tot surt dels apunts o del llibre (res inventat). Mínim **8 preguntes per tema**,
3 opcions i una sola correcta. Els errors falsos han de ser errors típics, mai opcions absurdes.
Si una dada és dubtosa, no va al test i la fitxa diu «pregunta-ho al profe».

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

Si el canvi el notarà qui fa servir l'app, el mateix PR puja la versió (vegeu l'apartat «Versions»).

---

## 🏷️ Versions

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

## 🤖 Qui hi treballa: Claude i Gemini

Bona Nota es programa amb agents d'IA. **Hi treballen Claude (Claude Code) i Gemini**, i les mateixes regles valen per a qualsevol altre agent (Kimi, Codex…).

- **Regles comunes:** tots els agents segueixen [`AGENTS.md`](AGENTS.md) i el nucli (`nucli.json`). `CLAUDE.md` remet a `AGENTS.md`.
- **Numeració de Gemini:** les tasques i els blocs que fa Gemini es numeren amb la lletra `g` (`g1`, `g2`, `g3`…). L'id surt al final del commit.
- **Memòria del projecte**, a `docs/`: `ESTAT.md` (com està tot), `DECISIONS.md` (què s'ha decidit i per què), `TRAMPES.md` (errors per no repetir),
  `CONVENCIONS.md` (com es treballa) i `ARQUITECTURA.md` (on és cada cosa).
- **Abans de publicar:** `nucli ship plan` diu quines comprovacions demana el canvi, `nucli ship run <check>` les passa i `nucli ship seal` les segella.

Gemini es fa servir per desenvolupar l'app. Dins de l'app només hi ha una IA: Claude, que corregeix les fotos del quadern.
