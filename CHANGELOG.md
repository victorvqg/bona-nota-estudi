# Historial de versions

Les versions de Bona Nota, la més nova a dalt. **La primera entrada és la versió actual.**
Com es numeren i com es puja una versió: apartat «Versions» del [README](README.md).

Les versions fins a la 2.3.0 es van numerar després de publicar-les, a partir de l'historial de commits.

## 2.10.0 · 2026-11-10

### Afegit
- ⚡ Super combo: les preguntes difícils porten la marca «⚡ difícil». Encertar-ne 3 seguides dona +3 ⭐ i 5 seguides +5 ⭐ (després es torna a començar), fins a 10 ⭐ al dia per món. La ratxa dura tot el dia, encara que canviïs de tema; les preguntes normals no la fan pujar ni la trenquen, i un error sí. Funciona als tests, a l'examen sorpresa i a l'examen de veritat (es compta en lliurar-lo).
- La dificultat de cada pregunta és a `motor/dificultat.json` (primera passada: 111 de 524 preguntes). `motor/dificultat.py` en fa la llista `docs/DIFICILS.md`.

### Arreglat
- Preguntes amb el text o la resposta discutibles: l'Acord de París (2 °C i 1,5 °C), l'ozó com a resposta falsa d'un gas d'efecte d'hivernacle, «meteorits» on calia «meteoroides», Ptolemeu (Alexandria, segle II), el delta de l'Ebre, dues preguntes de català que es podien llegir de dues maneres, i a castellà «primero», «treintaiséis», «clubs» i Teseu amb el Minotaure.
- Les tres preguntes de català «Com es diu en català?» ara tenen cada una el seu enunciat, i per tant el seu identificador.

## 2.9.0 · 2026-11-10

### Afegit
- ✍️ Triple combo a les preguntes obertes: 3 respostes bones seguides el mateix dia donen +3 ⭐ i 6 en donen +5 (després es torna a començar), fins a 8 ⭐ al dia per món. Una resposta és bona si puntua, té com a mínim el 60 % de les idees i està explicada amb frases.
- Resposta de 10: si una oberta té totes les idees, +1 ⭐ més.
- La targeta «On guanyes les estrelles» i el tauler (font «Triple combo») ja ho expliquen.

### Canviat
- Si una oberta té prou idees però és una llista de paraules, el programa demana «explica-ho amb frases» i la ratxa no avança.

## 2.8.3 · 2026-11-09

### Canviat
- Rànquing: els «Premis de la colla» passen a una franja a tota l'amplada, just sota el podi, amb targetes més grans. A l'ordinador surten tots en una fila; al mòbil, de 2 en 2 i abans de la classificació (abans sortien al final).

## 2.8.2 · 2026-11-09

### Arreglat
- Un aparell amb el progrés vell ja no pot fer baixar les estrelles del núvol. En obrir un món on el nen ja era l'actiu, ara es baixa el progrés del núvol abans de desar-hi res, i el núvol no accepta un progrés amb menys estrelles que el que ja té (`supabase/bn_progres_no_baixa.sql`). Això feia que les estrelles d'un món no quadressin amb les del rànquing.
- Les estrelles de cada test, joc, examen i pregunta oberta s'apunten al registre en el moment, i no només en tancar la pàgina. Així el rànquing no se'n perd cap si el navegador es tanca de cop.

## 2.8.1 · 2026-11-09

### Canviat
- La classificació del rànquing mostra els 25 primers (abans, els 10 primers). Si quedes més avall, la teva fila continua sortint a sota.

## 2.8.0 · 2026-11-09

### Canviat
- El combo dels tests només puja amb les respostes que donen estrella. Repetir el mateix test el mateix dia, o encertar al repàs, ja no fa pujar el combo (tampoc el trenca). Un error el trenca sempre.
- La targeta «On guanyes les estrelles» explica totes les maneres de guanyar-ne: tests, jocs, idees, combo, rècords, repàs, missions i boss.

### Afegit
- El repàs dona +1 ⭐ per cada error que encertes, un cop per error i dia, fins a 10 al dia per món. Les +2 ⭐ quan un error queda après es mantenen.
- Barra de ratxa a cada pregunta del test (🔥 ×N i 5 caselles fins al proper regal del combo).
- Cada test, joc, examen i pregunta oberta apunta al registre les estrelles que ha donat (`est`).
- Tauler d'admin: a «Nens», la targeta «Estrelles per origen» (de tots els nens) amb les estrelles per minut de cada activitat. Els orígens de cada nen agafen el màxim de cada font, de manera que gairebé desapareix la fila «D'abans (sense detall)».

### Arreglat
- Les +2 ⭐ d'un rècord ara compten dins del test que el fa.
- Amb «efectes suaus», els rètols de combo i missions ja no s'animen.

## 2.7.1 · 2026-11-09

### Canviat
- Pàgina de perfil: el botó «Torna a la portada» passa a sota de «Desa el perfil», amb un espai; ja no és a la cantonada de dalt.

## 2.7.0 · 2026-11-09

### Afegit
- Pàgina de perfil (`bonanota.net/perfil/`, «PLAYER SELECT»): cada nen tria el seu animal, el seu perfil arcade (50 insígnies de pixel art) i l'estil de color (Clàssic, 🔥 Ofensiva, ❄️ Tàctica), amb animacions, so i el botó «Sorpresa». S'hi arriba des de la salutació de la portada i tocant l'avatar de la salutació de cada món.
- La tria es veu al rànquing (podi i files), a la portada, a la salutació dels mons i al tauler d'admin, i es guarda al perfil del nen a Supabase (SQL nou: `supabase/bn_aspecte.sql`). Sense connexió queda guardada a l'aparell i es puja sola després.

### Canviat
- `sprites.js` incorpora els 50 perfils arcade (`BN_SKILLS`) amb els seus noms, categories i paletes d'estil.
- Qui no ha triat res es veu exactament com abans (animal calculat pel nom, sense insígnia).

## 2.6.1 · 2026-11-09

### Canviat
- «Canviar d'usuari» ja no surt dins dels mons. Per canviar de nen es fa servir «No ets tu?», a la portada.

## 2.6.0 · 2026-11-09

### Afegit
- Tauler d'admin: apartat «Preguntes obertes: respostes sospitoses».
- La pantalla d'entrada del tauler mostra el número de versió.

### Canviat
- Preguntes obertes i boss: el text ha de ser una resposta real. Es rebutja el text massa curt, sense sentit o copiat, i no es pot enganxar.
- La nota de les preguntes obertes la posa el programa segons les idees que troba al text. Abans la marcava el nen.
- Un cop vista la resposta model, aquella pregunta queda 3 dies en pràctica i no puntua.

### Corregit
- Copiar l'enunciat ja no fa guanyar idees clau, ni amb paraules ni amb els seus números.

## 2.5.1 · 2026-11-09

### Canviat
- El text de benvinguda de la portada parla de l'escola en general i explica el repàs, les missions, els exàmens, el boss i el rànquing.

## 2.5.0 · 2026-11-09

### Afegit
- Tauler d'admin: apartat «Repàs, boss i missions», amb errors apresos, repassos, intents i victòries de boss i estrelles de missions per nen.
- La capçalera del tauler mostra el número de versió.

### Corregit
- Tauler: les estrelles de boss, missions, repàs i rècords ja no surten com «D'abans (sense detall)».
- Tauler: l'examen de mates surt amb la seva nota, en lloc de «undefined%» i d'un «Millor examen» sense número.
- Tauler: les sessions expliquen el resultat del boss, els errors apresos al repàs i les pistes.

## 2.4.0 · 2026-11-09

### Afegit
- 🏷️ El número de versió surt al peu de la portada i de cada món.

### Canviat
- El peu dels mons ja no mostra la línia amb el llibre i el tema.

### Corregit
- 📷 La funció que corregeix la foto del quadern accepta peticions des de bonanota.net.

## 2.3.0 · 2026-11-08

### Afegit
- 👾 El boss del món també s'obre si treus un 70 % o més en un examen (sorpresa o de veritat).
- 🔄 Actualització automàtica: en obrir la portada o un món, si la còpia del mòbil és vella, l'app es posa al dia sola. No toca mai el progrés, el nom ni el PIN.

### Corregit
- Rànquing al mòbil: la cinta de notícies ja no es queda quieta a l'iPhone, i la festa dels 5 tocs i els efectes de les pestanyes tornen a sortir bé.
- Els errors de «🔍 Troba l'error» de mates tornen a entrar al repàs.

## 2.2.0 · 2026-11-07

### Afegit
- 🔍 «Troba l'error» de mates més complet: l'error pot ser a qualsevol línia, cal tornar a escriure bé la línia dolenta, surt la llibreta corregida sencera i els errors van al repàs.
- 🔍 «Troba l'error al climograma» al món del clima, amb un tipus de joc nou que pot fer servir qualsevol món.
- ⌨️ Dreceres de teclat als tests, les targetes i les finestres.
- Barra dins de cada tema per anar a «Tots els temes» o canviar entre la fitxa i el test, i botó ⏸ Pausa als reptes amb compte enrere.
- ⭐ Insígnia a la portada amb les estrelles de tots els mons, que obre el rànquing.
- ♿ Accessibilitat amb teclat i lector de pantalla a la portada i a tots els mons.
- 🔗 Accés directe per provar pantalles: `?demo`, `?joc=`, `?tema=`, `?vista=` i `?llibreta=1`.
- 📄 Skill modular per generar els PDFs d'estudi (`skills/bona-nota/`).
- 🧰 Nucli: regles, docs i comprovacions comunes per als agents d'IA.

### Canviat
- Mates: la multiplicació s'escriu amb el punt volat `·`, i la llibreta correcta (vora verda) es distingeix de la que té l'error (vora vermella).

### Corregit
- `?joc=` obre bé el joc demanat, també amb l'àlies `err` de «Troba l'error».

## 2.1.0 · 2026-11-06

### Afegit
- 📖 Món 6 · Català, tema 2: la literatura, el nom i la puntuació.
- 🌐 Domini propi: [bonanota.net](https://bonanota.net).

### Canviat
- Tauler d'admin: el domini per tema i les preguntes més fallades surten plegats per món.

## 2.0.0 · 2026-11-06

Bona Nota 2.0.

### Afegit
- Repàs d'errors ampliat al Taller de mates i al mapa de comarques, 💡 pistes als tests i 🛡️ escut del combo.
- 🎯 Missions d'avui, meta de la colla i pestanya 🧠 Remuntada al rànquing.
- 👾 Boss del món.

## 1.0.0 · 2026-11-05

Recull de tot el que hi havia abans de Bona Nota 2.0.

### Afegit
- Motor comú i 5 mons: clima, Biologia i Geologia, Castellano, comarques i Matemàtiques.
- Portada arcade, entrada amb nom i PIN, progrés al núvol, estrelles, nivells i rànquing.
- Taller de mates i correcció de la foto del quadern.
- Tauler d'admin, base de dades pròpia i còpies de seguretat.
