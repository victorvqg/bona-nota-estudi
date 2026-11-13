# Historial de versions

Les versions de Bona Nota, la més nova a dalt. **La primera entrada és la versió actual.**
Com es numeren i com es puja una versió: apartat «Versions» del [README](README.md).

Les versions fins a la 2.3.0 es van numerar després de publicar-les, a partir de l'historial de commits.

## 2.45.0 · 2026-11-13

### Afegit
- **Gràfic «Evolució de les notes» ampliat, amb pantalla completa, línies d'aprovat i filtres de notes** (`admin/index.html`, `motor/prova-admin-evolucio.js` · g31):
  - Mida en línia més gran (`.cv.cv-evo`, `360 px` en escriptori / `300 px` al mòbil) tant a `Sessions → Activitat` (`#gEvo`) com a `Mons → Fitxa del món → Resum` (`#gMonEvo`).
  - Botó **«Pantalla completa»** que obre `<dialog id="evoDlg">` gran (~`96vw × 90vh`) tancable amb `Esc`, clic a fora o botó `Tanca`, amb els filtres sincronitzats en temps real amb la targeta.
  - Línies horitzontals discontínues de referència dibuixades al gràfic (`evoLlindars`): **50%** i **70% aprovat**.
  - Filtres ràpids per concentrar el gràfic en un sol tipus de notes (`Totes`, `Bones (≥ 70%)`, `Fluixes (< 70%)` i `Dolentes (< 50%)`) amagant automàticament els alumnes sense coincidències i mostrant un comptador de nens i notes.

## 2.44.0 · 2026-11-13

### Afegit
- **Horari diferent de cap de setmana (dissabtes i diumenges) per tancar i obrir els mons** (`supabase/bn_control.sql`, `admin/index.html`, `index.html`, `motor/plantilla-estudi-interactiu.html`, `motor/prova-control-sql.js`, `motor/prova-admin-xat.js`, `motor/prova-xat.js` · g29):
  - A `Configuració → Horaris` s'afegeix l'interruptor **«Horari diferent el cap de setmana (ds i dg)»** (`#xcMonsCap`) i les hores editables `#xcMonsCapTancaH` → `#xcMonsCapObreH` (per defecte `23:00 → 09:00`), amb etiqueta clara `dl–dv` per a l'horari d'entre setmana.
  - `bn_priv.xat_horari_cfg()`, `bn_priv.mons_en_horari_tancat()`, `public.bn_estat_web()` i `public.bn_admin_control()` guarden i avaluen `mons_cap_actiu`, `mons_cap_tanca_h` i `mons_cap_obre_h` (hora de Madrid, `isodow` 6 i 7), i tant la portada (`horariMonsPortada()`) com els 7 mons (`horariMonsSrv()`) i el tauler (`monsHorariEfectiu()`) apliquen l'horari corresponent cada dia automàticament.

## 2.43.0 · 2026-11-12

### Afegit
- **Celebracions audiovisuals pròpies per als 7 Bosses i sistema modular de variants per a nous mons** (`motor/plantilla-estudi-interactiu.html`, `motor/dades/*.js`, `docs/BOSS-I-EFECTES.md`, `README.md`, `docs/MONS.md` · g27):
  - Els 7 Bosses tenen ara cadascun un **sprite pixel-art 16×16 propi** (`drac`, `cometa`, `borrasca`, `gegant`, `signes`, `faltas`, `fantasma`), una **celebració amb motion temàtic** (`explosio`, `orbites`, `tempesta`, `blocs`, `espiral`, `esborra`, `focus`) i una **fanfara musical WebAudio (~4 s)** (`epica`, `cosmos` *Zarathustra*, `primavera` Vivaldi, `chiptune` 8-bit, `alegria` Beethoven, `toreador` Bizet, `estrena` Hollywood), respectant `SUAU` / `prefers-reduced-motion`, `VOL === 0` i el topall diari de `+10 ⭐`.
  - Medalla `🏆 N` a `.boss-carta`, botó `🎬 Celebració` a `#bossFi`, paràmetre `?demoBoss=1` per provar qualsevol Boss en 1 clic sense desar res, suport per definir `pix` 16×16 i `notes` WebAudio directament a `motor/dades/<nou>.js` sense tocar el motor, prova `bnProvaBossFesta` i guia completa a `docs/BOSS-I-EFECTES.md`.
- **Tancament i reobertura automàtica a la nit també dins dels 7 mons** (`motor/plantilla-estudi-interactiu.html`, `docs/BON-US.md` · g27):
  - `horariMonsSrv()`, `esMonsTancatsNit()` i `actualitzaTancamentMon()` apliquen l'horari nocturn propi (`mons_tanca_h` → `mons_obre_h`, p. ex. `22:00 → 08:00` quan `tanca_mons` és actiu) dins de cada món (`🌙 Hora de descansar!`), buidant el temps pendent en tancar i reobrint sol a l'hora d'obertura sense alterar `bn_mons_tancats` manual.

## 2.42.0 · 2026-11-12

### Afegit
- **Horari nocturn propi i editable per tancar i obrir tots els mons (`22:00 → 08:00`)** (`supabase/bn_control.sql`, `admin/index.html`, `index.html`, `motor/prova-control-sql.js`, `motor/prova-admin-xat.js`, `motor/prova-xat.js` · g26):
  - `bn_priv.xat_horari_cfg()`, `public.bn_estat_web()` i `public.bn_admin_control()` (desplegats a `agippwtqvhpxdockuigl`) afegeixen `mons_tanca_h` (`'22:00'`), `mons_obre_h` (`'08:00'`), `mons_tanca_min` (`1320`) i `mons_obre_min` (`480`), avaluant `mons_tancats_nit` amb el seu propi horari encara que l'horari del xat tingui una altra franja o estigui desactivat.
  - A `Configuració → Horaris` s'afegeix la fila editable `Tanca / Obre dels mons` (`#xcMonsTancaH` → `#xcMonsObreH`, horitzontal i independent del xat), i a la portada (`index.html`) tots els mons s'apaguen automàticament a l'hora configurada (`🌙 DESCANS`, `🌙 FINS HH:MM`, `#avisNitPortada` i avís en clicar) i es tornen a obrir sols a l'hora d'obertura sense trepitjar els tancaments manuals.
  - A `Inici → Alertes` les alertes col·lectives mostren ara l'etiqueta clara `👥 Tot el grup` en lloc de `Colla`.
- **Dues festes noves al rànquing públic (5 tocs): `🚀 GRAVETAT ZERO!` i `🐉 FOC DE DRAC!`** (`index.html`, `motor/prova-xat.js` · g26):
  - `FESTES` passa de 3 a 5 celebracions musicals en WebAudio i motion: vals espacial *El Danubi blau* (Strauss) amb òrbites ingràvides i fanfara heroica amb vol del Drac, roses i flames.

## 2.41.0 · 2026-11-12

### Afegit
- **Taula detallada de preguntes confuses («🤔 Pregunta confusa?») amb món, tema, activitat d'origen, pregunta i nen** (`supabase/bn_admin_dificultat.sql`, `admin/index.html`, `motor/prova-dificultat-sql.js`, `motor/prova-admin-dificultat.js` · g25):
  - `public.bn_admin_dificultat(...)` (desplegada a `agippwtqvhpxdockuigl`) incorpora ara `dubtes_detall` per pregunta i `dubtes_llista` ordenat cronològicament amb el nen (`nom`, `k`), el motiu (`enunciat`, `resposta`, `pista`), si la resposta va ser encertada (`ok`), el `ts` i l'origen exacte (`'test' | 'repas' | 'examen' | 'examen-real'`, llegit de `detall->>'on'` o inferit per sessió ±30 min).
  - Nova targeta i taula directa `#tDifDubBox` (6 columnes a `Mons → Dificultat real`, 5 a `Fitxa del món → Domini i errors`, i mode dedicat `🤔 Dubtes`) que mostra d'un cop d'ull el món, el tema, on ha sorgit, l'enunciat amb la resposta correcta, l'alumne (amb enllaç a la seva fitxa) i el motiu.
- **Pestanya «Nens → Missatges al nen» amb catàleg complet de Bon Ús i Benestar** (`admin/index.html`, `motor/prova-admin-benestar.js` · g25):
  - Nova sub-pestanya `?v=nens&tab=missatges` (amb accés directe des de `Benestar` i `Configuració → Horaris`) que mostra les 13 vistes prèvies literals dels missatges que pot veure un alumne (horari de nit, descansos de 25 min, avís de 60/120 min, pla diari i vigília, ànims i escut d'error, tancaments de xat/rànquing/mons), amb les xifres reals configurades, explicant **quan surten**, **per què** i què queda 100 % privat als adults.
- **Interruptor «Tanca també els mons a la nit» a `Configuració → Horaris`** (`supabase/bn_control.sql`, `admin/index.html`, `motor/prova-control-sql.js`, `motor/prova-admin-xat.js` · g25):
  - Nou paràmetre `horari.tanca_mons` (i `mons_tancats_nit` calculat segons hora de Madrid a `bn_estat_web()` i `bn_admin_control()`, desplegats a `agippwtqvhpxdockuigl`) i interruptor `#xcTancaMons` a `Configuració → Horaris` i indicador a `Inici → Control ràpid`.

## 2.40.0 · 2026-11-12

### Afegit
- **Full d'examen d'1 pàgina A4 per a l'alumne des de la Fitxa del nen** (`admin/index.html`, `motor/prova-admin-fitxa.js` · g24):
  - Nou botó `Full d'examen (1 pàg.)` (`#btFullExamen`) a la capçalera de `?v=nens&id=<nen>` (operatiu també en `?demo` sense cap crida a Supabase): obre el selector de món `#feMon` (preseleccionant el món amb data d'examen propera o amb més activitat) i descarrega `full-examen-<nen>-<món>-<data>.html` maquetat en **1 sola pàgina A4** (`@page { size: A4 portrait }`) amb to amable per a l'alumne i zero dades d'admin/benestar: 🎯 preguntes fallades (amb la resposta correcta en verd i avís d'opció parany), 📚 temes per repassar, ✍️ idees clau d'obertes / Taller de mates i 💡 3 passos tranquils abans de l'examen.
- **Agregació d'avisos «🤔 Pregunta confusa?» (`dubte`) i filtre específic al tauler d'administració** (`supabase/bn_admin_dificultat.sql`, `admin/index.html`, `motor/prova-dificultat-sql.js`, `motor/prova-admin-dificultat.js` · g24):
  - `public.bn_admin_dificultat(...)` (desplegada a `agippwtqvhpxdockuigl`) agrega els events `'dubte'` per `(assig, qid)` amb el recompte per motiu (`enunciat`, `resposta`, `pista`), el nombre de nens diferents (`dubtes_nens`), `'amb_dubtes'` al resum i `full outer join` perquè també hi surtin preguntes marcades confuses amb `< 8` o `0` respostes de test.
  - Nou filtre `🤔 Dubtes` a `Mons → Dificultat real` i `Fitxa del món → Domini i errors`, pastilla `🤔 N` amb desglossament dels motius al `title` (mantenint 6 columnes `≤ 8`), i visualització + filtre `Preguntes confuses` a `Sessions` i `Log complet per dia`.
- **Comparativa `fitxer vs real` i descàrrega d'1 clic de `motor/dificultat.json` proposat** (`admin/index.html`, `motor/prova-admin-dificultat.js` · g24):
  - Cada fila de `Dificultat real` mostra explícitament el contrast entre `motor/dificultat.json` i les dades reals (`fitxer: ⚡ difícil / normal · real: ⚡ difícil / normal / fàcil / pendent`).
  - Nou botó `⚡ Proposa dificultat.json` (`#btProposaDif`) que genera i descarrega en 1 clic el fitxer `dificultat.json` actualitzat aplicant les propostes `+afegir` (`< 55 %`) i `−revisar` (`≥ 75 %`).

## 2.39.0 · 2026-11-12

### Afegit
- **Pastilles d'errors per repassar avui (`🧠 X per repassar`) i de pròxim examen (`📅 Examen …`) a les targetes de la portada** (`index.html`, `motor/tot.py`, `supabase/bn_control.sql`, `motor/prova-control-sql.js`, `motor/prova-xat.js` · g23):
  - Cada targeta `.as` de la portada mostra ara al jugador actiu (fora del mode `?tast=1` i si el món està obert i no reiniciat) quants errors del repàs espaiat (`S.rep` amb `prox <= avui`) li toquen avui (`🧠 X per repassar`) i la data del proper examen (`📅 Examen avui!`, `📅 Examen demà!` o `📅 Examen dj. 19/11`), combinant les dates oficials de `bn_priv.examens` (servides sense cap dada personal a `public.bn_estat_web().examens` via `bn_priv.examens_propers()`, desplegada a `agippwtqvhpxdockuigl`) i els avisos «Demà tinc examen» marcats pel nen (`S.vigilia_dies`).
- **Botonet discret «🤔 Pregunta confusa?» després de respondre una pregunta** (`motor/plantilla-estudi-interactiu.html`, `supabase/bn_bon_us.sql`, `motor/prova-bon-us-sql.js` · g23):
  - Als tests, al repàs, a l'Examen sorpresa i a la revisió de l'Examen de veritat apareix un botó discret `🤔 Pregunta confusa?` amb **3 motius tancats** (`enunciat`, `resposta`, `pista`, zero text lliure), **topall de 2 avisos al dia per món** (`diaEst().dub`), 0 ⭐ de recompensa i amagat en mode tast anònim (`?tast=1`), enregistrat com a event `'dubte'` a `public.bn_log` (`bn_log_event_check` ampliat i desplegat a `agippwtqvhpxdockuigl`).
- **Export de la dificultat actual (`"dif": 1 | 3`) a `admin/preguntes.json`** (`motor/tot.py` · g23): `motor/tot.py` incorpora el valor de `motor/dificultat.json` a cada entrada d'`admin/preguntes.json` per permetre comparar-lo amb la dificultat real al tauler d'administració.

### Eliminat
- **Targeta «🔒 PRÒXIMAMENT» al final de la portada** (`index.html`, `motor/prova-xat.js` · g23): s'elimina la casella buida `.prox` que, amb l'ordre invers dels mons (`MÓN 7` → `MÓN 1`), quedava a sota del `MÓN 1`.

## 2.38.0 · 2026-11-12

### Afegit
- **Configuració del rànquing públic (`XX primers` i opcions de visibilitat) al panell d'administració i a Supabase** (`supabase/bn_control.sql`, `admin/index.html`, `index.html`, `motor/prova-control-sql.js`, `motor/prova-admin-alta.js`, `motor/prova-xat.js` · g22):
  - **`⚙ Configuració → Rànquing` (`?v=config&tab=ranquing`)** i drecera directa des de `Rànquing → Classificació` (`#btRkAjusta` + pastilla `#rkTopPill`): permet obrir o posar en pausa el rànquing públic (`actiu`), escollir quants jugadors surten a la taula pública (`top`: de `3` a `100`, per defecte `Top 10`, amb dreceres `Top 3`, `Top 5`, `Top 10`, `Top 15`, `Top 25`, `Tots`), decidir si un nen fora del tall veu la seva pròpia fila sota `···` (`mostrar_propia`), triar quina pestanya s'obre primer (`pestanya_inicial`), activar o amagar qualsevol pestanya (`punts`, `setmana`, `remuntada`, `dies`, `nivell`), i ajustar tant la «🌍 Meta de la colla» (`mostra_meta`, `meta_estrelles`, `meta_pct`) com els «🏆 Premis de la colla» (`mostra_premis`), amb botó de restauració als valors inicials.
  - **Persistència validada a Supabase (`bn_priv.config`, clau `'ranquing'`)**: noves funcions privades `bn_priv.ranquing_normalitza` i `bn_priv.ranquing_cfg()` a `bn_control.sql` (desplegades a `agippwtqvhpxdockuigl`), integrades a `public.bn_estat_web().ranquing` i `public.bn_admin_control(...)`.

### Canviat
- **Pestanya «🧠 Remuntada» del rànquing per errors recuperats al repàs espaiat** (`supabase/bn_ranking_remuntada.sql`, `index.html`, `motor/prova-bon-us-sql.js`, `motor/prova-xat.js`, `docs/PUNTUACIO.md`, `docs/MONS.md` · g22):
  - `public.bn_ranking_remuntada()` (desplegada a `agippwtqvhpxdockuigl`) suma ara cada error encertat al repàs en els últims 7 dies (**+1 🧠** per encert de test `bones` o d'extensió `ext`: frases, mapa, taller, troba l'error… amb topall de 20 per sessió) més **+2 🧠 extra** per cada error que arriba al 3r repàs i queda après per sempre (`apr`), mantenint intactes les capses `[0, 3, 7]` del motor perquè el rànquing reflecteixi l'esforç des del primer dia de la setmana d'estudi.
  - Textos de la pestanya `Remuntada` i del premi *Remuntada de la setmana* a `index.html` ajustats a `errors recuperats` / `Repàs` i missatge específic a «La teva posició» quan encara no hi ha repassos fets.

## 2.37.0 · 2026-11-12

### Afegit
- **Alertes plegables amb filtres a Inici i configuració editable de llindars (`Malament` / `Avís` / `Informatiu` / `Desactivat`) a Supabase** (`admin/index.html`, `supabase/bn_control.sql`, `supabase/bn_admin_tauler.sql`, `supabase/bn_admin_benestar.sql`, `motor/prova-control-sql.js`, `motor/prova-admin-benestar-sql.js`, `motor/prova-admin-alta.js` · g21):
  - **`Inici → Alertes` (`#alertes`) plegable i filtrable**: capçalera amb botó de plegar/desplegar (`#btAlPlega`), resum de pastilles (`X malament`, `Y avís`, `Z informatiu`), obertura automàtica quan hi ha alguna alerta `malament` o `avís` i plegat automàtic quan no n'hi ha cap, drecera `⚙ Ajusta` (`#btAlAjusta`), 3 desplegables de filtre (`#fAlGrav` per defecte a `Malament i avís`, `#fAlTipus` i `#fAlAssig`) i resolució de l'enunciat real de `admin/preguntes.json` a les alertes de pregunta fallada.
  - **`⚙ Configuració → Llindars` (`?v=config&tab=llindars`) editable al servidor**: taula `#tLlindarsAl` per a les 6 regles d'`Alertes d'Inici` (`inactiu`, `encallat`, `baixa`, `rapid`, `pregunta`, `pendent`) i taula `#tLlindarsBen` per als 11 senyals de vigilància de `Benestar` (`marato_bloc`, `marato_dia`, `nit`, `salta_descans`, `pressa`, `repetir`, `frustracio_suspesos`, `frustracio_costa`, `enganxa`, `xat`, `inactiu`), on cada regla permet triar si compta com a **Malament** (vermell), **Avís** (groc), **Informatiu** (bé/context) o **Desactivat**, ajustar-ne els llindars numèrics i desar-ho o restaurar-ho als valors inicials (`#btDesaLlindars` / `#btResetLlindars`).
  - **Persistència validada a Supabase (`bn_priv.config`, clau `'llindars'`)**: noves funcions privades `bn_priv.llindars_normalitza` i `bn_priv.llindars_cfg()` a `bn_control.sql` (desplegades a `agippwtqvhpxdockuigl`), integrades dins `bn_admin_control`, `bn_admin_alertes` i `bn_admin_benestar` conservant intacta la vigília d'examen en blau.

### Canviat
- **Ordre invers dels mons: dels més nous als més antics (`MÓN 7` → `MÓN 1`)** (`motor/tot.py`, `motor/build.py`, `admin/index.html`, `motor/prova-admin-alta.js` · g21): la portada (`bonanota.net`), el desglossament d'estrelles dins de cada món (`MONS`) i el panell d'administració mostren ara primer els mons més recents (`Anglès`, `Català`, `Matemàtiques`, `Comarques`, `Castellano`, `Bio i Geo`, `Socials`), mantenint `motor/mons.json` en ordre cronològic perquè cada món nou afegit al final aparegui automàticament a dalt de tot.

## 2.36.0 · 2026-11-12

### Canviat
- **Panell d'administració — Fase 5: neteja final, 7 mons sempre visibles a Dificultat/Domini i documentació** (`admin/index.html`, `docs/ARQUITECTURA.md`, `README.md`, `docs/XAT.md`, `docs/BENESTAR.md`, `motor/prova-admin-dificultat.js`, `motor/prova-admin-alta.js` · g20):
  - **7 mons sempre visibles a `Mons → Dificultat real` i `Mons → Domini global`**: abans `htmlDificultat()` i `tDomini()` amagaven els mons que encara no tenien cap pregunta amb `≥ 8` respostes (o sense activitat en el període curt), de manera que a producció només sortien `Comarques`, `Català` i `Socials`; ara surten sempre els 7 mons de `ASSIGS`, mostrant a la capçalera i en desplegar si el món té preguntes vistes amb `< 8` respostes (amb botó d'1 clic cap a `Totes`) o si encara no té respostes de test/examen (indicant a `divisibilitat` que els exercicis generats són a `Fitxa del món → Taller`).
  - **Neteja final d'`admin/index.html`**: eliminats els últims estils i funcions heretats de l'antic Tauler que havien quedat sense ús (`gTipus`, `esqTauler`, `dataH`, `.seccio-t`, `.kpi.xok`, `.ctrl-hores*` i regles mòbils antigues `.xm-l`), mantenint intactes les 35 funcions RPC d'admin i afegint a `prova-admin-alta.js` la verificació automàtica de `≤ 8` columnes per taula i de zero desbordament mòbil a `Sessions + #panell`.
  - **Documentació actualitzada**: `docs/ARQUITECTURA.md`, `README.md`, `docs/XAT.md`, `docs/BENESTAR.md` i `docs/ESTAT.md` reflecteixen l'estructura definitiva dels 5 eixos + `Configuració` del panell d'administració.

## 2.35.0 · 2026-11-12

### Canviat
- **Panell d'administració — Fase 4: Rànquing i Xat compactats** (`admin/index.html`, `motor/prova-admin-xat.js` · g19):
  - **`Rànquing → Classificació` (`?v=ranquing`)**: 4 xifres clau sense subtítol (`Nens visibles`, `Nens amagats`, `Estrelles del període` via `bn_admin_fonts_dia` i `Missatges avui` via `bn_admin_xat_resum`), selector de vista (`Total`, `Per món` amb desplegable `#rkMon` i `Setmana`) alimentat per `bn_ranking_mons`, taula principal `#tRk` de 5 columnes (`Posició`, `Nen` clicable cap a la Fitxa, `Estrelles`, `Nivell` i interruptor `Visible` directe d'1 clic via `bn_admin_usuari` `'amaga'`) i bloc inferior `#rkAmagatsCard` / `#rkAmagats` amb els nens amagats i interruptor d'1 clic (`'mostra'`) per tornar-los a fer visibles.
  - **`Rànquing → Reptes` (`?v=ranquing&tab=reptes`)**: resum compacte de `Combos i repàs` i `Repàs i boss` amb KPIs sense subtítol i enllaços directes a la Fitxa de cada nen.
  - **`Rànquing → Xat` (`?v=ranquing&tab=xat`)**: capçalera amb interruptor directe `#xatModSw` per obrir/tancar el xat al moment, dreceres a `Catàleg` i `Horaris`, taula compacta `#tXMsgs` de 5 columnes (`Hora`, `Nen`, `Text`, `Estat` i `Silenciar`) adaptada sense cap desbordament al mòbil (`360`/`390`/`430 px`) i bloc de `Silenciats` amb botó per aixecar el silenci o silenciar ràpidament.

## 2.34.0 · 2026-11-12

### Afegit
- **Informe complet descarregable a la Fitxa del nen i Log complet per dia a Sessions (`/admin`)** (`admin/index.html`, `motor/prova-admin-fitxa.js`, `motor/prova-admin-alta.js` · g18):
  - **Informe complet de la Fitxa del nen (`?v=nens&id=<nen>`)**: nous botons `Informe HTML / PDF` (`#btInfHtml`, document visual autònom amb barra d'impressió/PDF `window.print()` i estils `@media print`) i `Informe .md` (`#btInfMd`, Markdown estructurat amb taules i cites) que carreguen automàticament sota demanda totes les dades de les 4 pestanyes (`Resum i estrelles`, `Aprenentatge` amb domini per tema, preguntes fallades, combos/repàs/boss, errors del Taller de mates i respostes obertes amb el text íntegre escrit, `Sessions i benestar` amb cronologia detallada i `Al núvol` amb tots els mons desats).
  - **Log complet per dia i filtre per data a `Sessions` (`?v=sessions` i `?v=sessions&tab=registre`)**: nova vista `Log complet per dia` agrupada per data on a cada dia es veu qui ha entrat (amb xips clicables per filtrar al vol), el temps i les accions totals, seguit del detall hora per hora de tot el que ha fet cadascú, amb filtres compartits per **Món (`#fAssig`)**, **Nen (`#fNen`)**, **Data (`#fDia` de dies actius + `#fDiaCal` de calendari)**, **Tipus d'acció (`#fEvent`)** i cerca lliure (`#fLogQ`), més selector cap a la vista `Taula` (`#tLog`) i `CSV complet`.

## 2.33.0 · 2026-11-12

### Corregit
- **Horari automàtic i avís nocturn d'anar a dormir connectats als mons i a la portada** (`motor/plantilla-estudi-interactiu.html`, `index.html`, `motor/prova-admin-alta.js` · g17):
  - **Connexió amb `Configuració → Horaris` (`bn_estat_web.horari`)**: els 7 mons i la portada ara llegeixen i guarden l'horari configurat al tauler (`actiu`, `tanca_h`/`obre_h` o `tanca_min`/`obre_min`, sumant +30 min a les vigílies d'examen) i el revaliden automàticament en tornar a la pestanya i cada 2 minuts.
  - **Avís visible a totes les pantalles d'estudi (`#avisNitWrap` global + diàleg `#modalNit`)**: `#avisNitWrap` passa a fora d'`#app` (just sota la capçalera) perquè mai desaparegui en entrar a fitxes, targetes, tests, jocs, preguntes obertes o exàmens; quan arriba l'hora de tancar salta un diàleg clar i amable (`🌙 Ja és hora de descansar, <Nom>!`, amb `🏠 Plegar per avui` i `Acabo el que estic fent`, sense restar ni bloquejar estrelles i activant el mode suau), seguit d'un recordatori suau cada 15 minuts si el nen continua estudiant de nit.
  - **Avís nocturn a la portada (`#avisNitPortada`)**: quan un nen amb sessió oberta entra a la portada en horari nocturn, veu d'entrada el bàner convidant-lo a descansar fins demà.

## 2.32.0 · 2026-11-12

### Canviat
- **Panell d'administració — Fase 3: Mons, Fitxa del món i autorefresc automàtic** (`admin/index.html`, `motor/prova-admin-*.js` · g16):
  - **`Mons` (`?v=mons`)**: 3 sub-pestanyes (`Llista` amb 0 KPIs, taula de 7 columnes per als 7 mons, interruptor directe d'obertura/tancament via `bn_admin_control` i fila clicable cap a la Fitxa del món; `Domini global` i `Dificultat real` sense barres de filtre redundants).
  - **`Fitxa del món` (`?v=mons&id=<mon>&tab=…`)**: nova vista individual amb selector ràpid `<select id="selFitxaMon">` i 3 pestanyes sota demanda (`Resum i notes` amb 4 KPIs, evolució de notes, estrelles per origen i resum per tema; `Domini i errors` amb matriu tema × nen clicable cap a la Fitxa del nen, fallades, errors pendents i dificultat real del món; i `Obertes` amb detall complet al panell lateral `#panell`), més una 4a pestanya `Taller` visible només als mons de matemàtiques (`divisibilitat`).
  - **Autorefresc automàtic del tauler (`?v=sessions&p=curs` i totes les vistes)**: refresc en segon pla cada 30 s, en tornar a la pestanya (`visibilitychange` / `focus`), en recuperar connexió (`online`) i en canviar de secció, sense `cache` HTTP i conservant la posició de desplaçament i qualsevol cerca activa (`input.tb-q`), més recàrrega automàtica si hi ha una `VERSIO_ADMIN` més nova publicada.
- **Horari a Configuració (`admin/index.html`)**: `estatXatCtrl()` i `pintaXCfg()` llegeixen també `tanca_h` i `obre_h` quan el servidor no envia `tanca_min`/`obre_min`, i desen tots dos formats a `bn_admin_control` (g16).

## 2.31.0 · 2026-11-12

### Canviat
- **Panell d'administració — Fase 2: Nens, Fitxa completa, Benestar i Sessions** (`admin/index.html`, `motor/prova-admin-fitxa.js`, `motor/prova-admin-alta.js` · g15):
  - **`Nens` (`?v=nens`)**: sub-pestanyes `Llista` (4 KPIs sense subtítol i taula compacta de 7 columnes amb constància/ratxa, estrelles + nivell i semàfor unificat de benestar, eliminant duplicats de `Nens nous` i d'`Estrelles per origen`) i `Benestar` (`?v=nens&tab=benestar`, semàfor del grup en paraules planeres, fases del món i gestió de dates d'examen).
  - **`Fitxa del nen` (`?v=nens&id=<nen>&tab=…`)**: vista completa amb **selector ràpid `<select id="selFitxaNen">`** per saltar entre qualsevol nen mantenint la pestanya activa i 4 pestanyes amb càrrega sota demanda i navegació per teclat (`Resum i estrelles`, `Aprenentatge` amb domini individual, fallades pròpies, combos/repàs/boss i obertes amb detall al panell lateral `#panell`, `Sessions i benestar` amb semàfor individual i cronologia al panell lateral, i `Núvol i gestió` amb progrés sincronitzat, drecera directa a còpia de seguretat i accions del compte).
  - **`Sessions` (`?v=sessions`)**: 3 sub-pestanyes (`Sessions` amb filtres locals `#fAssig`/`#fNen`, 4 KPIs i cronologia al panell lateral; `Activitat` amb gràfics d'activitat, mapa de calor, evolució de notes, constància i nova targeta d'**evolució diària d'estrelles per origen** `bn_admin_fonts_dia`; i `Registre` acotat a 1.500 files visibles amb cerca ràpida i descàrrega de CSV complet).

## 2.30.0 · 2026-11-12

### Canviat
- **Panell d'administració — Fase 1: base, navegació, Inici i Configuració** (`admin/index.html`, `motor/prova-admin-*.js` · g14):
  - **Base visual compacta i components comuns**: tipografia numèrica `tabular-nums`, files de taula d'unes ~36 px, component únic `taula()` (màxim 8 columnes, ordenació, cerca local ràpida i exportació CSV), ajudes plegables `(i)` (`.btn-ajuda` + `.ajuda-box`), píndoles semàfor unificades (`bé`, `avís`, `malament`), colors fixos per món i panell lateral superposat (`#panell`) per als detalls llargs.
  - **Navegació reorganitzada per 5 eixos + Configuració (⚙)**: barra lateral a escriptori i barra inferior fixa de 5 icones al mòbil (`≤ 767 px`: `Inici`, `Nens`, `Mons`, `Sessions`, `Rànquing`) amb accés `Configuració` a la capçalera, gestor d'estat a l'URL (`?v=…&id=…&tab=…&p=…` amb `pushState`/`popstate`) i càrrega **sota demanda** (cada vista demana només les seves pròpies funcions RPC).
  - **Inici i Configuració complets**: `Inici` amb 6 KPIs clau, `Control ràpid` d'1 clic (xat i 7 mons), taula compacta d'`Alertes` (4 columnes) i resum de `Nens nous` + `Estrelles per origen`; `Configuració` amb 4 pestanyes (`Horaris i crèdits`, `Catàleg del xat` de 5 columnes amb alta de peça al panell lateral, `Llindars` informatius i `Còpies` de 4 columnes amb desglossament i accions al panell lateral).

## 2.29.0 · 2026-11-12

### Afegit
- **Xat de la colla — Premi al «Missatge del dia»** (`index.html`, `supabase/bn_xat.sql`, `docs/XAT.md`, `motor/prova-xat-sql.js`, `motor/prova-xat.js` · g13):
  - **Corona d'ahir i 1 crèdit extra (`premi_ahir`)**: qui ahir va escriure el missatge visible amb més vots «Ben dit» (`≥ 1` vot; empat desfet pel primer escrit) lluu avui la corona **«👑 Missatge d'ahir»** a la capçalera del xat, la insígnia **«👑 Ahir»** als seus missatges i rep **1 crèdit extra** per parlar avui (fins a `max_dia + 1` frases, per defecte `6`).
  - **Zero estrelles al registre i bon ús**: el premi no afegeix cap estrella a `bn_log` ni altera el rànquing, i votar «Ben dit» continua requerint haver guanyat el primer crèdit estudiant avui (`10 ⭐`).

### Canviat
- **Matemàtiques (`motor/dades/divisibilitat.js`)**: s'amaga temporalment el botó «📷 Fes una foto del full» (`foto: false`) a les preguntes de quadern mentre la correcció per foto (`bn-corregeix` / `ANTHROPIC_API_KEY`) resta arxivada, deixant actiu «✔ Comprova els resultats» (g13).

## 2.28.0 · 2026-11-12

### Afegit
- Mons de **Català** (`catala/t2`) i **Lengua Castellana** (`castellano/t2-t3`): estès el tipus de joc **«✍️ Frases amb buits»** (`tipus:"frases"`) a totes les llengües amb **12 jocs nous i 144 frases** (g12):
  - **Català (`motor/dades/catala.js`)**: **6 jocs de frases (72 frases)** enllaçats des de la fitxa dels 12 temes (`T[i].frases`): *De viva veu o per escrit*, *Els quatre gèneres en frases*, *El sintagma nominal i els noms*, *Gènere, nombre i invariables*, *El clau o la clau?* i *Porta tancada o entreoberta*.
  - **Castellà (`motor/dades/castellano.js`)**: **6 jocs de frases (72 frases)** amb lectura en veu alta en castellà (`es-ES`), enllaçats des de la fitxa dels 15 temes (`T[i].frases`): *El texto y el diccionario*, *Sustantivos, género y número*, *Comas, punto y coma y cartas*, *La noticia, la lírica y los relatos*, *Artículos, demostrativos y numerales* i *Polisemia y reglas de la B*.

## 2.27.0 · 2026-11-12

### Afegit
- Admin, Tauler (`admin/index.html`, `motor/prova-admin-dificultat.js`): nou apartat **«⚡ Dificultat real de les preguntes»** (`#dificultat` / `#tDif`, complement de l'issue `#16`), que consulta `bn_admin_dificultat` i el compara directament al navegador amb `motor/dificultat.json` i `admin/preguntes.json`:
  - Mostra 4 KPIs resum (preguntes amb `≥ 8` respostes sobre el banc total, difícils reals `< 55 %`, fàcils reals `> 90 %` i proposta de canvis `+afegir / −revisar` amb la mateixa regla que `motor/dificultat.py --proposa`).
  - Selector de vista (`≥ 8 resp.`, `Canvis` i `Totes`), blocs plegables per món amb taula ordenable (Pregunta, Estat `➕ Proposa ⚡` / `➖ Revisa ⚡` / `⚡ Confirmada` / `Fàcil`, Encert, 1a resp., Nens i Segons), suport de `?demo` i botó **«Baixa JSON»** per descarregar la resposta llesta per a `python3 motor/dificultat.py --proposa` (g11).

## 2.26.0 · 2026-11-11

### Afegit
- **Mode tast anònim** a la portada, als 7 mons, a la guia de famílies i al perfil (`index.html`, `motor/plantilla-estudi-interactiu.html`, `pares/index.html`, `perfil/index.html`, `supabase/bn_ranking_net.sql`, `motor/prova-tast.js`, `docs/superpowers/specs/2026-11-11-mode-tast-anonim-design.md` · g10):
  - **Tres portes d'entrada sense compte ni PIN**: botó «👀 Fes un tast sense compte (anònim)» a la portada (`/?tast=1`), «👀 Tasta aquest món sense compte (anònim)» a la benvinguda de cada món (`/<mon>/?tast=1`) i «👀 Tasta un món per dins (sense registrar-te)» des de `/pares/`.
  - **Mostra controlada dins de cada món**: obre sencers el **Tema 1** (fitxa, targetes i 5 preguntes de mostra explicades sense rellotge d'avanç), el **primer joc** del món (`ASSIG.jocs[0]`) i l'enunciat de mostra de la **primera pregunta oberta** (`OB[0]`, només lectura); la resta de temes, jocs, exàmens i el Boss conviden amablement a entrar amb nom i PIN (`convidaPin()`).
  - **100 % anònim, zero rànquing i zero petjada a l'aparell**: no envia res a `bn_log` ni a cap RPC d'usuari, no desa estrelles (`suma()` no acumula punts), mostra el xat en mode lectura, viu només a `sessionStorage` mentre la pestanya és oberta (respectant intactes els noms desats dels germans i el topall de 2 perfils per aparell) i reserva al client i a la base de dades (`bn_priv.nom_prohibit`) els noms genèrics (`_…`, `tast`, `convidat`, `anònim`, `visitant`, `guest`).
  - **Documentació i guia per a famílies**: explicació completa del mode tast anònim a `README.md`, `docs/BON-US.md`, `docs/ESTAT.md` i `pares/index.html` (`#privadesa` i `#dubtes`).

## 2.25.0 · 2026-11-11

### Afegit
- Tipus de joc nou **«✍️ Frases amb buits»** (`tipus:"frases"`, `jocFrases` a la plantilla), per practicar amb frases fetes on falta un tros (n2564):
  - Tres menes de frase: **tria** (toca la paraula que falta; amb més d'un buit fa de banc de paraules), **escriu** (el nen escriu el verb del parèntesi o la paraula; valen les formes contretes i no compten majúscules ni el punt final) i **ordena** (paraules desordenades, amb paraules que sobren si es vol).
  - Després de cada frase es veu la frase sencera, la traducció, el perquè i el botó 🔊 que la llegeix **en anglès** (`ASSIG.veuFrases`), i es demana dir-la en veu alta.
  - Primer error: pista. Segon error: s'ensenya la resposta. 1 ⭐ per frase bé a la primera (el joc paga un cop al dia, com els altres) i cada frase fallada entra a «🔁 Repassa els teus errors» (`BN_REP_TIPUS.frase`).
  - Cada partida tria 8 frases de les 12 del joc, així no surt sempre igual.
  - Botó «✍️ Practica-ho amb frases» a la fitxa dels temes que tenen joc de frases (`T[i].frases`).
- Món 7 (`angles/t2`): **7 jocs de frases amb 84 frases** fetes amb el vocabulari i la gramàtica del mòdul: *Describe a person*, *What's happening now?*, *Simple or Continuous?*, *I really like…*, *Words from the texts*, *What are they like?* i *Let's watch a film!*
- Proves: `motor/prova.js` juga tots els jocs de frases i en revisa les dades (`frValida`), i la prova pròpia `frRepProva` comprova que un error entra al repàs i en surt.

## 2.24.0 · 2026-11-11

### Afegit
- Motor, mons i Benestar (`motor/plantilla-estudi-interactiu.html`, `supabase/bn_admin_benestar.sql`, `motor/prova-admin-benestar-sql.js`): un cop marcat «📅 Demà tinc examen», el rètol superior de `#plaDia` passa a ser clicable (**«Has marcat examen demà · desmarca ✕»**, `#btExDemaTreu`) per desfer l'avís d'avui en un toc, recuperar l'avís disponible, sincronitzar el desmarcat al núvol (`S.vigilia_mod` a `fusiona()`) i no comptar el dia desmarcat (`accio: 'treu'`) al tauler de Benestar (g9).
- Dificultat calculada amb dades reals, base de l'issue `#16` (`supabase/bn_admin_dificultat.sql`, `motor/prova-dificultat-sql.js`, `motor/dificultat.py --proposa`): funció SQL `bn_admin_dificultat` que calcula l'encert i l'encert a la primera resposta de cada pregunta (`< 55 %` → difícil `3`, `> 90 %` → fàcil `1` a partir de `p_min = 8` respostes en tests i exàmens) i mode `--proposa` per generar l'informe de canvis sobre `motor/dificultat.json` (g9).

### Canviat
- Tauler d'administració en mode demostració (`admin/index.html` `?demo`): s'hi incorpora el món 7 (`angles`) als jocs, a les sessions simulades i als mons de Benestar (g9).
- Action «Revisa Bona Nota» (`.github/workflows/revisa.yml`): executa en paral·lel 4 blocs (`base`, `sql` amb PGlite, `interficie` i matriu dinàmica de 7 `mons`) amb memòria cau de Chromium, baixant el temps de revisió de ~18 min a ~3,5 min (g8/g9).

## 2.23.0 · 2026-11-11

### Afegit
- Món 7 (`angles/t2` · *Tema 2: That's Entertainment*), integració completa amb la resta de mons (g7):
  - **Preguntes difícils i Super Combo** (`motor/dificultat.json`, `motor/dificultat-motius.json`, `docs/DIFICILS.md`): 19 preguntes d'anglès marcades amb `⚡ difícil` (falsos amics, *stative verbs* amb *now*, plurals irregulars, *million/thousands* i *How about + -ing*), passant el total a 130 preguntes difícils.
  - **Il·lustració animada de portada** (`motor/ilu/angles.svg`): claqueta de cinema amb feix de focus, crispetes i estrelles flotants (amb suport de `prefers-reduced-motion`).
  - **Sprite i color d'assignatura** (`sprites.js`): icona pixel art 16×16 `cinema`, matèria `Anglès` (`#db2777`) a `BN_MAT` i entrada `angles` a `BN_MON` per al rànquing i el tauler d'admin.
  - **Peces del xat** (`index.html`, `supabase/bn_xat.sql`, `motor/prova-xat-sql.js`): 3 peces noves desbloquejables amb 25 ⭐ a Anglès (`64` «el Present Continuous», `65` «els stative verbs» i `66` «el tresor de Fenn»; catàleg inicial de 66 peces).

### Canviat
- Guia per a les famílies (`pares/index.html`, `motor/prova-pares.js`): redactat més planer del paràgraf inicial («Com funciona Bona Nota»), menú superior `.salt-llista` centrant i mostrant senceres les 7 pestanyes sense retallar «Preguntes freqüents» ni transparentar el fons, i recompte de peces del xat actualitzat a 66 (g7).

## 2.22.0 · 2026-11-11

### Afegit
- Guia per a les famílies (`pares/index.html` a `https://bonanota.net/pares/`, enllaçada des de la portada i integrada a `motor/tot.py` i `sw.js`): explica sense cap tecnicisme què fa el fill o filla a Bona Nota, els 6 passos d'aprenentatge, per què les estrelles i el rànquing no enganxen, les mesures de bon ús, descans i son, la seguretat del xat sense teclat lliure, la privadesa i les preguntes freqüents (`docs/superpowers/specs/2026-11-11-pagina-pares-design.md`, `motor/prova-pares.js` · g6).
- Prova automàtica `motor/prova-fotos-sql.js` a l'Action per a `supabase/bn_fotos.sql`, i desplegament en viu de `bn_fotos.sql` i l'Edge Function `bn-corregeix` a Supabase amb CORS actiu per a `https://bonanota.net` (g6).

### Esborrat
- `motor/jocs_generics.js`: còpia antiga dels jocs genèrics que ja no carregava cap pàgina (els jocs viuen a `motor/plantilla-estudi-interactiu.html`) (g6).

## 2.21.0 · 2026-11-11

### Canviat
- Portada, rànquing (`index.html`, `supabase/bn_ranking_mons.sql`): la pestanya «Temps» i el premi «Més constant» se substitueixen per **«Dies» («Dies d'estudi»)**, comptant els dies diferents d'estudi dels últims 120 dies a l'hora de Catalunya (`ADR-0008`, `docs/BON-US.md` PR F · g5).

### Afegit
- Admin, apartat «Benestar» (`admin/index.html`, `motor/prova-admin-benestar.js`): motius en paraules planeres i llegenda per als tres senyals nous del servidor (`fa_descans` en verd, `salta_descans` en groc i `examen_dema` en context) (g5).
- Documentació (`docs/BON-US.md`, `docs/DECISIONS.md` ADR-0008, `docs/BENESTAR.md`, `docs/ESTAT.md`, `README.md`): decisions confirmades i documentació completa dels hàbits saludables de `2.20.0` i `2.21.0` (g5).

## 2.20.0 · 2026-11-11

### Afegit
- Motor i mons (`motor/plantilla-estudi-interactiu.html`, `motor/mons.json`, `motor/build.py`): hàbits saludables segons la fase del món (`docs/BON-US.md`, PR C, D, E i G · g5):
  - **Fases del món (`aprendre`, `vigilia`, `despres`) i pla de 10 dies**: cada món sap quan va néixer (`neix` a `mons.json`) i consulta `bn_vigilia` per adaptar la targeta `#plaDia` a l'inici (un tema nou + repàs dels errors a `aprendre`, repàs d'errors + Examen de veritat a `vigilia`, i repàs lliure sense pressa a `despres`).
  - **Botó «📅 Demà tinc examen»**: confirmació en dos tocs dins del món, màxim 2 dies per món (`S.vigilia_dies`), sincronitzat al núvol i registrat amb `event = 'examen_dema'`.
  - **Descans cada 25 minuts amb límit de salts**: es registra a `bn_log` (`event = 'descans'`, `accio: 'fet' | 'salta'`) i es pot saltar com a màxim 2 vegades seguides els dies normals (3 a la vigília); després cal completar els 5 minuts de pausa.
  - **Avís amable de temps diari**: bàner informatiu sense bloqueig als 60 minuts d'estudi del dia (120 minuts a la vigília).
  - **Franja de nit (`21:30` / `22:00` hora de Catalunya)**: activa automàticament el mode suau sense alterar `localStorage.bn_suau` i mostra un missatge amable convidant a anar a dormir mentre les estrelles continuen funcionant.
  - **Textos amables de mentalitat de creixement**: missatge de consol quan es trenca un combo als tests i missatges encoratjadors en suspendre un test o examen.
- Base de dades (`supabase/bn_bon_us.sql`, `supabase/bn_admin_benestar.sql`) i proves (`motor/prova-bon-us-sql.js`, `motor/prova-admin-benestar-sql.js`): funció pública `bn_vigilia(assig, neix)` sense noms de nens, clau `'bon_us'` a `bn_priv.config`, events `'descans'` i `'examen_dema'` a `bn_log`, i senyals nous `fa_descans`, `salta_descans` i `examen_dema` al Benestar (g5).

## 2.19.0 · 2026-11-11

### Afegit
- Admin, filtre superior de nens (`#fNen`): mostra tots els nens que existeixen a la base de dades (`bn_admin_ids`, que ara uneix `bn_priv.perfils` i `public.bn_log`), encara que no tinguin registres en el període triat o que tinguin 0 registres (n2537).
- Admin, càrrega del registre (`bn_admin_logs`): pagina en blocs de 1.000 files (`?limit=1000&offset=…`) fins a carregar tot el període, de manera que el límit de 1.000 files per resposta de PostgREST ja no deixa fora els nens amb registres més antics (n2537).
- Base de dades (`bn_copies.sql`, `bn_pin_nou.sql`, `bn_admin_usuari.sql`, `bn_admin_tauler.sql`, `bn_admin_fonts_rep.sql`):
  - Les còpies de seguretat (`bn_priv.fes_copia` i `bn_admin_copia_restaura`) inclouen les taules del xat (`xat_frases`, `xat_peces`, `xat_msg`, `xat_vots` i `xat_silenci`).
  - Quan l'admin canvia el nom d'un nen (`bn_admin_usuari` amb `'canvia'`), es conserven els seus missatges, vots i silencis del xat sota el nom nou.
  - Els `::int` de `bn_admin_tauler.sql` validen abans amb regex d'1 a 7 dígits (`^[0-9]{1,7}$`) per evitar desbordaments.
  - S'ha afegit l'índex `bn_log_nom_assig_ts` sobre `public.bn_log ((lower(trim(nom))), assig, ts desc)` per accelerar `bn_admin_fonts_dia`.

## 2.18.1 · 2026-11-11

### Arreglat
- Seguretat, PIN al núvol: `bn_aspecte_desa`, `bn_perfil_canvia_pin`, `bn_progres_llegeix` i `bn_progres_desa` tornen un codi (`'pin'`, `{"ok":false,"codi":"pin"}` o `-3`) en lloc de fer `raise exception 'pin incorrecte'` quan `bn_priv.pin_ok` torna `false`, de manera que el comptador d'intents fallits de `bn_priv.intents` no es desfà i el bloqueig de 15 minuts al 5è intent fallit s'aplica a totes les crides amb PIN (#33).
- Proves: `motor/prova-pin-intents-sql.js` (PGlite) afegida a l'Action (#33).

## 2.18.0 · 2026-11-10

### Afegit
- **Món 7 · Anglès: Tema 2 · That's Entertainment** (`angles/t2/`): 8 temes en 3 blocs (adjectius per descriure algú per fora i per dins, Present Continuous, Present Simple / Continuous i stative verbs, gèneres de pel·lis i llibres, les lectures «Museum exhibits» i «Fenn's Treasure» i com proposar un pla), 85 preguntes de test, 12 preguntes obertes, 8 jocs i el boss «El Fantasma del Cinema». Fet a partir del resum, la pràctica extra, l'examen i els fulls de respostes del tema 2, el Module 2 del llibre (n2555).
- Preguntes obertes: les respostes escrites en anglès amb frases senceres (amb `is`, `are`, `and`, `but` o `because`) també compten per al ✍️ triple combo.
- Admin: el món nou surt amb el seu nom a les llistes i es pot obrir o tancar des del «Control ràpid» (`supabase/bn_control.sql` accepta `angles`).

## 2.17.1 · 2026-11-10

### Arreglat
- Portada, perfil i mons: `rpcP` i `rpc` accepten tant l'error HTTP 400 `'pin incorrecte'` com les respostes sense excepció (`"pin"`, `{"ok":false,"codi":"pin"}` i `-3` a `bn_progres_desa`), com a pas 1 per conservar el comptador de 5 intents de PIN fallits a la base de dades (#33).

## 2.17.0 · 2026-11-10

### Afegit
- Admin, Tauler i Xat: panell «Control ràpid: Xat, Horari i Mons» (`#control`, a dalt de tot del Tauler, i horari també a la pestanya Xat). Permet obrir o tancar el xat amb un clic, programar-ne l'horari automàtic de tancament i obertura (hora de Madrid, per exemple `21:30` → `07:00`) i activar o desactivar cada món per separat.
- Portada i mons: quan l'admin desactiva un món, la seva targeta a la portada surt en gris amb «🔒 TANCAT» i no deixa entrar-hi (tampoc per enllaç directe), mentre que totes les estrelles es conserven al rànquing.
- Base de dades: `supabase/bn_control.sql` (funcions `public.bn_estat_web`, `public.bn_admin_control`, `bn_priv.xat_horari_cfg`, `bn_priv.xat_en_horari_tancat`, `bn_priv.xat_obert_ara` i `bn_priv.mons_tancats`).
- Proves: `motor/prova-control-sql.js` (PGlite) i `motor/prova-admin-alta.js` actualitzada a l'Action.

### Eliminat
- Admin, portada i perfil: s'ha tret la targeta «Embut d'alta» (`M7`) i l'enviament de l'esdeveniment `alta` per simplificar el panell.

## 2.16.0 · 2026-11-10

### Afegit
- Admin, nivells al tauler (M5): el tauler llegeix `admin/regles.json` i mostra el nivell de cada nen a la llista de Nens, a la capçalera i els KPIs de la fitxa, a cada assignatura i a la pestanya «Al núvol» (amb les estrelles que li falten per al nivell següent).
- Portada, perfil i admin: embut d'alta (M7). La portada (`index.html`) i la pàgina de perfil (`perfil/index.html`) apunten els passos d'alta (`nom`, `pin_ko`, `pin_creat`, `perfil` i `pin_ara_no`) a `bn_log` sense desar mai el PIN ni el nom escrit abans de tenir perfil (`_alta` amb aparell `alta:…`, exclòs de rànquing, llistes i filtres). A la vista Nens de l'admin hi ha la targeta «Embut d'alta».
- Base de dades: `supabase/bn_admin_alta.sql` (amplia `bn_log_event_check` amb `'alta'`, afegeix el trigger `aa_bn_log_alta_net`, actualitza `bn_priv.logs`, `bn_admin_altes` i `bn_admin_benestar` i crea `bn_admin_alta_embut`).
- Proves: `motor/prova-admin-alta-sql.js` (PGlite) i `motor/prova-admin-alta.js` (Playwright) afegides a l'Action.

## 2.15.0 · 2026-11-10

### Afegit
- Motor: `motor/tot.py` extreu les regles del joc (`NIVELLS`, `COM_GUANYAR`, `SUPER_PREMIS`/`SUPER_MAX`, `OB_COMBO_*`, `APROVA` i `REP_PREMI`/`REP_MAX`) de `motor/plantilla-estudi-interactiu.html` i escriu `motor/regles.json` i `admin/regles.json`. La plantilla continua sent l'única font de veritat i el joc funciona exactament igual.
- Proves: `motor/prova-regles.js` (afegida a l'Action) comprova que `motor/regles.json` i `admin/regles.json` coincideixen amb la plantilla i que cap còpia manual dels nivells o de l'aprovat (`index.html`, `perfil/index.html`, `admin/index.html`, `supabase/bn_xat.sql` i `supabase/bn_admin_tauler.sql`) es desquadra.

## 2.14.0 · 2026-11-10

### Afegit
- Admin, Tauler: apartat «Combos i repàs», amb les estrelles de combo, triple combo, super combo i repàs de cada dia i de cada nen. Així es pot veure si les millores d'estrelles de la 2.9.0 i la 2.10.0 funcionen. Surt de les diferències entre registres, sense canviar res de l'app dels nens.
- Admin, Tauler: apartat «Errors pendents de la colla», amb els temes de cada món que acumulen més errors per repassar entre tots els nens, quants nens hi ha, quants toquen avui i les preguntes que més es repeteixen.
- Base de dades: `supabase/bn_admin_fonts_rep.sql`, amb `bn_admin_fonts_dia` i `bn_admin_rep_pendents`.

## 2.13.0 · 2026-11-10

### Afegit
- Admin, Tauler: apartat «Benestar» (`docs/BON-US.md`). Té una fila per nen amb un semàfor (verd, groc o vermell) i el motiu en paraules planeres. Els senyals són: marató, nit, pressa, repetir sense aprendre, frustració, enganxar text, entrar per xatejar, deixar de venir, estudiar poc i sovint, aprendre dels errors i fer servir dos aparells.
- La vigília d'examen es detecta sola pel pic del grup a cada món. Aquells dies, les sessions llargues surten en blau i no en vermell. També es pot posar la data de l'examen de cada món, que mana sobre el pic. En dissabte i diumenge, el llindar de marató puja 30 minuts.
- Base de dades: `supabase/bn_admin_benestar.sql` (s'ha d'executar una vegada a Supabase), amb `bn_admin_benestar`, `bn_admin_examen_desa` i la taula de dates d'examen.

## 2.12.0 · 2026-11-10

### Afegit
- Admin, fitxa del nen: pestanya «Al núvol» amb l'estat real de cada món (temes amb la millor nota, intents i preguntes que més falla, errors pendents de repàs, obertes, exàmens, boss, dies d'estudi i d'on surten les estrelles). Abans la fitxa només veia el registre del període triat.
- Admin, vista Nens: targeta «Nens nous» amb les altes del període (primer registre, PIN creat, perfil triat, mons, estrelles i dies actius la primera setmana), també els que han creat el PIN però encara no han jugat.
- Base de dades: `supabase/bn_admin_fitxa.sql` (s'ha d'executar una vegada a Supabase): `bn_admin_fitxa`, `bn_admin_altes` i la data d'alta dels perfils nous (`perfils.creat`).

## 2.11.0 · 2026-11-10

### Afegit
- **Xat de la colla** al rànquing de la portada (pestanya «Xat»). Els nens es parlen amb peces: una frase amb un forat i una paraula, una cosa de classe, una cosa seva o el nom d'un company. No hi ha cap text lliure, i el nom d'un company només surt en frases bones.
- **Per parlar, t'ho guanyes estudiant:** cada 10 ⭐ guanyades avui donen 1 crèdit, és a dir, 1 frase, fins a 5 al dia. A mitjanit tornen a zero. Les estrelles no es gasten: parlar no fa baixar ningú al rànquing. Les monedes de crèdit i els cartells INSERT COIN, SENSE CRÈDITS i TORNA DEMÀ diuen què falta.
- Frases i peces que es desbloquegen pujant de nivell o fent 25 ⭐ en un món.
- Bafarades al podi amb l'últim missatge dels tres primers, targeta «Xat de la colla», botó «Digues-li alguna cosa a…» per al company que tens al davant i missatges a la cinta de notícies.
- «Ben dit» per votar els missatges dels altres i missatge del dia (sense premi en aquesta versió).
- Admin: pestanya «Xat» per veure i esborrar missatges, silenciar un nom 1, 3 o 7 dies, canviar les regles (estrelles per crèdit, màxim al dia, espera i xat obert o tancat), activar o desactivar frases i peces i afegir-ne de noves.
- Base de dades: `supabase/bn_xat.sql` (s'ha d'executar una vegada a Supabase). Només es guarden números (qui, quina frase i quina peça o company), mai text.

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
