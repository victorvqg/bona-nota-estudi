# ⭐ Bona Nota · Estudia jugant (1r ESO)

**Web:** https://bonanota.net · **Versió:** 2.3.0 ([historial de canvis](CHANGELOG.md))

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
| 6 | Català | Tema 2: La literatura, el nom i la puntuació | `catala/t2/` |

La llista oficial de mons és `motor/mons.json`.

> 🌐 La web té domini propi, **bonanota.net** (fitxer `CNAME`). L'adreça antiga de GitHub Pages i `www.bonanota.net` hi redirigeixen soles.
>
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
  Quan un error s'encerta 3 vegades al repàs, queda **après**: surt el rètol «APRÈS!» i dona **+2 ⭐**.
  Al repàs també hi van els **exercicis fallats del Taller de mates** (es fa un exercici nou del mateix tipus i nivell)
  i les **comarques fallades del MAPA** (On és? o la capital). Compten com a recordats si es fan sense errors ni pistes.
- **💡 Pista als tests** (temes i repàs, no als exàmens): el 1r toc ensenya la idea clau del tema i el 2n treu una opció
  falsa. Aquella pregunta ja no dona estrella ni suma al combo (com la pista del Taller).
- **🎯 Missions d'avui** (a l'inici de cada món): 3 missions curtes que es poden fer en uns 10 minuts (aprova un tema,
  encerta 10 preguntes, repassa errors, juga 2 jocs, fes un combo de ×5, una oberta o un examen). Són les mateixes tot el dia
  i surten del dia i del món. Cada missió feta: **+3 ⭐**; les 3: **+5 ⭐** més. Cada missió només premia un cop.
- **👾 Boss del món** (a Jocs, i a l'inici quan està obert): el repte final abans de l'examen. S'obre quan has aprovat el 70 %
  dels temes o quan treus un 70 % o més en un examen (sorpresa o de veritat). 10 rondes amb contingut que ja és al món: preguntes de test de tots els temes, una de figura, una de parelles
  o de classificar, una d'ordenar (cop doble) i una oberta (treu vida segons les idees clau). Cada error treu un cor (n'hi ha 3);
  el boss té el 80 % de la vida que poden treure totes les rondes. Guanyar: **+10 ⭐** un cop al dia. Els errors van al repàs.
  Cada món té el seu boss a les dades (`ASSIG.boss={nom, spr}`; monstres pixel art `monstre` i `borrasca` dins del motor).
- **🛡️ Escut del combo:** si falles amb un combo de 3 o més, pots respondre una pregunta germana del mateix tema
  (una que el test no ha tret). Si l'encertes, continues amb la meitat del combo.
- **Jocs:** ordenar, fer parelles, classificar, llegir un dibuix, i jocs propis de cada món (per exemple, el mapa de
  les comarques o el garbell dels primers).
- **🔍 Troba l'error:** un exercici resolt per un company amb una trampa. Cal tocar la línia dolenta i dir per què. A mates, també
  s'ha de tornar a escriure bé, i al final surt la llibreta corregida. Els errors van al repàs. N'hi ha a mates i al món del clima (climograma).
- **Exàmens:** l'examen sorpresa (15 preguntes barrejades) i l'examen de veritat, amb nota sobre 10.
- **Preguntes obertes:** el nen escriu la resposta, la compara amb la resposta model i marca les idees clau que ha posat.
  El motor detecta sol les idees que ja hi són: per les paraules i també pels **números** (si la idea clau diu
  «MCM = 144» i el nen ha escrit 144, compta).
- **🔊 Escolta:** llegeix en veu alta la fitxa o la pregunta.
- **Mode suau:** treu les animacions fortes (també s'activa sol si l'aparell ho té demanat).
- **⌨️ Amb teclat** (a l'ordinador): `1` `2` `3` o `A` `B` `C` trien l'opció, `P` demana la pista i `Enter` o `→` passen a la següent.
  A les targetes, `Espai` gira i `←` `→` canvien de targeta. `Escape` tanca les finestres.
- **Dins d'un tema**, una barra porta a «Tots els temes» i canvia entre la fitxa i el test. Els reptes amb compte enrere tenen el botó **⏸ Pausa**.
- **♿ Accessibilitat:** la portada i els mons es poden fer servir amb teclat i amb lector de pantalla.
- **App:** es pot afegir a la pantalla d'inici del mòbil i funciona sense connexió.
- **🔄 Sempre al dia:** en obrir la portada o un món, si la còpia del mòbil és vella, l'app s'actualitza sola (`motor/eines/actualitza.js`).
  Si el nen torna a un món després de més de 10 minuts, només surt un avís amb un botó, per no tallar-li un test. El progrés, el nom i el PIN no es toquen mai.
- **So al mòbil:** els efectes i la música s'engeguen al primer toc (els mòbils no deixen sonar res abans). A l'iPhone sonen encara que estigui en silenci, mentre el so de l'app estigui engegat; si el mòbil talla el so (una trucada, canviar d'app), torna en tornar a l'app o al toc següent. El codi és `motor/eines/so-mobil.js`, el mateix als mons i a la portada.

### ⭐ Estrelles, superestrelles i nivells

- **Estrelles:** +1 per cada encert als tests i als jocs, +1 per idea clau a les obertes, regals per combos
  (×5 seguides: +1; ×10: +2) i +2 per cada error après al repàs. Per jugar net, cada pregunta només dona estrella un cop al dia;
  les preguntes del repàs i les respostes amb pista no en donen.
- **A dalt de tot** es veu el total de **tots els mons**. Si toques les estrelles, surt el detall per món.
  El total compta el que hi ha en aquell aparell i també el que hi ha al núvol.
  A la portada, la insígnia ⭐ del costat del nom suma les estrelles de tots els mons i obre el rànquing.
- **🌠 Superestrelles:** cada 50 ⭐ (sumant tots els mons) en surt una, amb animació i música pròpies.
- **Nivells:** d'🐣 Aprenent a 🌟 Llegenda d'or, segons les estrelles de cada món.

### 🏆 Rànquing (a la portada)

- Podi, taula de classificació amb les estrelles de cada món, fletxes ▲▼ (llocs pujats o baixats des de l'última
  vegada), la teva posició («Et falten 13 ⭐ per atrapar…») i els premis de la colla.
- Pestanyes: ⭐ Estrelles, ⏱ Temps, 🏅 Nivell, 📈 Setmana i 🧠 **Remuntada** (errors apresos al repàs els últims 7 dies;
  surt de la funció `bn_ranking_remuntada`, `supabase/bn_ranking_remuntada.sql`; sense la funció, la pestanya surt buida). Compta els últims 120 dies.
- **Meta de la colla:** que 3 de cada 4 nens del rànquing (com a mínim 3) facin 30 ⭐ o més en 7 dies. Premia que hi participi
  tothom. Quan s'aconsegueix, la festa del rànquing salta sola a cada aparell, un cop per setmana.
- **Premis de la colla:** Màquina de la setmana, Cohet, Explorador de mons, Més constant i Remuntada de la setmana.
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
- **🔍 Troba l'error**: un exercici resolt per un company amb un error típic, que pot ser a qualsevol línia. Cal tocar la primera línia dolenta,
  dir per què i tornar-la a escriure bé (pas «✍️ Escriu-ho bé»). Al final surt la llibreta corregida sencera, i el que falla va al repàs.
- **Com s'escriu**: la multiplicació porta el punt volat `·`. La llibreta correcta té la vora verda i la que té l'error, vermella.
- **Examen simulat sobre 10**: 6 exercicis, sense pistes, nota parcial per passos i correcció completa al final.
- Cada tema de la fitxa té el botó **✏️ Practica-ho com a classe** (camp `practica` del tema).
- **Registre per pas**: cada resposta fallada es desa com `exercici|pas|error` (camp `ep`) per al tauler d'admin.
- Generadors preparats per a temes futurs (encara no surten enlloc): **operacions combinades** (jerarquia),
  **suma i resta de fraccions** i **equacions de primer grau**.
- **Proves**: `node motor/prova-generadors.js` fa cada generador centenars de vegades i comprova que els càlculs quadren;
  `prova.js` resol cada fitxa en els tres modes, l'examen (ha de donar un 10), els dibuixos, Troba l'error,
  el full de brut i els punts de control del quadern.

## 📖 Món 6 · Català: La literatura, el nom i la puntuació

Fet a partir dels 4 fulls del tema 2 (llibre de Llengua catalana de 1r d'ESO, Barcanova, pàg. 42-55):
**resum**, **esquema**, **examen** i **full de respostes**. Les dades són a `motor/dades/catala.js`.

**12 temes en 3 blocs:**

| Bloc | Temes |
|---|---|
| 📚 La literatura i els gèneres | L'art de la paraula · La literatura oral tradicional · La literatura escrita · Els gèneres: vers i prosa · El teatre, l'assaig i com reconèixer els gèneres |
| 🏷️ El nom | El nom i el sintagma nominal · Les classes de noms · Les marques de gènere i de nombre · Els noms invariables · El clau / la clau, el pols / la pols, el son / la son |
| ✏️ Els signes de puntuació | El punt, l'interrogant, l'admiració i els punts suspensius · El punt i coma i els dos punts |

- **109 preguntes de test.** Les respostes falses són les confusions que avisa el resum
  (la literatura «només parla de coses inventades», anònima = «de molts autors», «la cavalla», «llapissos», majúscula darrere el punt i coma…).
- **15 preguntes obertes**, tretes de l'examen i dels «Comprova» del resum.
- **10 jocs en 3 seccions:** 📚 Literatura (De la veu al paper · Oral o escrita? · Gèneres i subgèneres · Quin gènere és?) ·
  🏷️ El nom (Individual i col·lectiu · Paraules diferents · El xivato del gènere · Plural igual o amb -s?) ·
  ✏️ Puntuació (Quin signe hi va? · Majúscula o minúscula?).
- 👾 Boss: **El Monstre dels Signes**.
- Falten les pàgines 52-53 del llibre (inici d'ortografia): la puntuació surt de la taula de la pàgina 54.

---

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
  jocs_generics.js                   Tipus de joc comuns (ordenar, parelles, classificar, figura i Troba l'error)
  eines/                             Peces compartides: les que un món inclou amb //@inclou (Taller de mates, dibuixos, quadern, full de brut) i les de tota l'app (so al mòbil, actualització automàtica)
  local.py                           Servidor local que es posa al dia sol amb GitHub
  eines/mapa-comarques.js            Genera el mapa SVG de les comarques
admin/                         Panell d'administració (activitat, noms, rànquing)
supabase/*.sql                 Base de dades: registre, rànquing, perfils amb PIN, progrés al núvol
skills/bona-nota/              Skill que genera els PDFs d'estudi (skills/bona-nota.zip és el paquet)
sw.js, manifest.webmanifest, icones/   App instal·lable i sense connexió (sw.js el genera tot.py)
versio.json                    Empremta de l'última publicació, per a l'actualització automàtica (la genera tot.py)
CNAME                          Domini de la web: bonanota.net
CHANGELOG.md                   Historial de versions
AGENTS.md, CLAUDE.md, nucli.json, docs/   Regles i memòria del projecte per als agents d'IA
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

### Errors propis d'una eina al repàs (Bona Nota 2.0)

Una eina (o un joc propi d'un món) pot posar els seus errors al repàs espaiat, a més de les preguntes de test:

```js
(window.BN_REP_TIPUS=window.BN_REP_TIPUS||{}).<tipus>={ic, titol, peu, max,
  valid: r => true/false,          // l'error encara té sentit en aquest món?
  nom:   r => "text per a la llista",
  juga:  (items, fi) => { … fi([true/false per a cada item]) }};
// durant el joc normal, cada error:  repAnotaExt("<tipus>", clau, dades, false)
```

El motor els desa a `S.rep` (viatja al núvol amb el progrés), els mou de capsa i dona el +2 ⭐ quan queden apresos.
Ja ho fan servir el Taller de mates (`mx`, a `eines/exercicis-mates.js`) i el MAPA (`mapa`, a `dades/comarques.js`).
Les proves `bnProvaFase1`, `mxRepProva` i `mpRepProva` (via `BN_PROVES`) ho comproven a cada push.

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

Per afegir un **Troba l'error** a qualsevol món, a `ASSIG.jocs` hi va un joc `tipus:"error"`. El format és al comentari de `motor/jocs_generics.js`.

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

Si el canvi el notarà qui fa servir l'app, el mateix PR puja la versió (vegeu l'apartat següent).

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
3. Quan el PR estigui fusionat, posa l'etiqueta al commit de `main`:

```
git switch main
git pull
git tag -a v2.4.0 -m "Bona Nota 2.4.0"
git push origin v2.4.0
```

> `versio.json` i el `VERSIO` de `sw.js` no són aquest número. Són empremtes que genera `motor/tot.py` a cada canvi perquè els mòbils
> es posin al dia. El `VERSIO_ADMIN` del tauler és una etiqueta de data que es canvia a mà.

---

## 🤖 Qui hi treballa: Claude i Gemini

Bona Nota es programa amb agents d'IA. **Hi treballen Claude (Claude Code) i Gemini**, i les mateixes regles valen per a qualsevol altre agent (Kimi, Codex…).

- **Regles comunes:** tots els agents segueixen [`AGENTS.md`](AGENTS.md) i el nucli (`nucli.json`). `CLAUDE.md` remet a `AGENTS.md`.
- **Numeració de Gemini:** les tasques i els blocs que fa Gemini es numeren amb la lletra `g` (`g1`, `g2`, `g3`…). L'id surt al final del commit.
- **Memòria del projecte**, a `docs/`: `ESTAT.md` (com està tot), `DECISIONS.md` (què s'ha decidit i per què), `TRAMPES.md` (errors per no repetir),
  `CONVENCIONS.md` (com es treballa) i `ARQUITECTURA.md` (on és cada cosa).
- **Abans de publicar:** `nucli ship plan` diu quines comprovacions demana el canvi, `nucli ship run <check>` les passa i `nucli ship seal` les segella.

Gemini es fa servir per desenvolupar l'app. Dins de l'app només hi ha una IA: Claude, que corregeix les fotos del quadern.

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
| `examen` | `joc` (examen · examreal), `pc`, `mode` (sorpresa · real · real-temps), `s`, `temes` i `q` |
| `joc` | `joc`, `pc`, `s`, `enc`, `err`; el MAPA també `mode` i `f` (comarques fallades). El repàs (`joc: "repas"`) també porta `apr` (errors apresos en aquella sessió) i `ext` (p. ex. `mx:1/2,mapa:2/3`: errors del Taller i del MAPA recordats) |
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
El domini per tema i les preguntes més fallades surten plegats per món.
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
