# Historial de versions

Les versions de Bona Nota, la més nova a dalt. **La primera entrada és la versió actual.**
Com es numeren i com es puja una versió: apartat «Versions» del [README](README.md).

Les versions fins a la 2.3.0 es van numerar després de publicar-les, a partir de l'historial de commits.

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
