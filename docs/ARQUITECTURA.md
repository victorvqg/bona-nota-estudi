# Arquitectura

Les peces del sistema, com es parlen i on viu cada cosa. Es manté curt: el detall és al codi.

## Portada i rànquing (`bonanota.net`)
- `index.html`, `CNAME`, `sprites.js`, `manifest.webmanifest`, `sw.js`.
- Publicat al domini `bonanota.net` (fitxer `CNAME`). `www.bonanota.net` i l'adreça antiga de GitHub Pages hi redirigeixen.
- Punt d'entrada de l'alumne (identificació amb nom + PIN `4 números + 1 lletra`), targetes dels 8 mons (bloc marcat amb `<!-- MONS:INICI -->` / `<!-- MONS:FI -->` generat per `motor/tot.py`) i rànquing en temps real connectat a Supabase (Estrelles, Dies, Nivell, Setmana, Remuntada i Xat).
- **Xat de la colla** (pestanya «Xat» del rànquing, a `index.html`): catàleg al bloc `XAT-CATALEG` (el mateix que `supabase/bn_xat.sql`; les peces generals `XAT_PC_BASE` són a mà i les 3 de cada món, `XAT_PC_MONS`, les genera `tot.py` de `motor/mons.json` al bloc `XAT-MONS`), funcions `xat*` integrades a `pintaHs()`/`tickerHs()`/`carregaHs()`. Llegeix amb `bn_xat_llegeix` (pública) i parla amb PIN amb `bn_xat_estat`, `bn_xat_envia` i `bn_xat_vota`; el servidor decideix crèdits i desbloquejos i el navegador compon el text.
- `perfil/index.html`: pàgina de perfil («PLAYER SELECT») on el nen tria l'aspecte (animal, perfil arcade de `BN_SKILLS` i estil). Es guarda a l'aparell (`bn_aspectes`) i al perfil del nen a Supabase; el rànquing, la portada, els mons i el tauler el mostren.
- `pares/index.html`: guia oberta i sense tecnicismes per a les famílies (`bonanota.net/pares`), enllaçada des de la portada i integrada a `motor/tot.py` i `sw.js`.

## Motor i plantilla dels mons
- `motor/plantilla-estudi-interactiu.html`: motor únic compartit per tots els mons (fitxes, targetes, tests amb pistes i escut del combo, missions d'avui, Boss del món, jocs, repàs espaiat `BN_REP_TIPUS`, exàmens, preguntes obertes, estrelles i sincronització al núvol).
- `motor/dades/<id>.js`: contingut de cada món (`ASSIG`, `T`, `OB`) i directives `//@inclou` (`socials`, `biogeo`, `castellano`, `comarques`, `divisibilitat`, `catala`, `angles`, `geosfera`).
- `motor/mons.json`: catàleg oficial de mons i **única font de cada món**:
  - camps de la pàgina i la targeta: carpeta, número, `neix`, títol, colors, icona i llengua;
  - `curt`, `spr` i `xat` (obligatoris), i `xmon`, `col_admin` i `demo_jocs` (opcionals).
- `motor/build.py` i `motor/tot.py`: combinen plantilla + dades + eines per generar `<assignatura>/<tema>/index.html`. També actualitzen la portada, `motor/qids.json`, `admin/preguntes.json`, `motor/regles.json`, `admin/regles.json` i `sw.js`.
- `motor/registres.py` (el crida `tot.py`): valida `mons.json` (sprite, colors, sense `<`/`>`, ids de peça únics i < 1001) i escriu entre marques «no editar a mà»:
  - `MONS-ADMIN` a `admin/index.html` (`ASSIGS`, `COL_MON`, `XMON`, `DEMO_JOCS`);
  - `BN-MON` a `sprites.js`;
  - `XAT-MONS` a `index.html` i `supabase/bn_xat.sql`.

## Construcció i publicació de mons
- `motor/nou_mon.py`: comença un món nou. Valida l'id, la carpeta, els colors i les 3 peces, i escriu l'entrada a `mons.json` (número següent, `neix` d'avui, ids de peça següents) i l'esquelet `motor/dades/<id>.js`.
- `motor/revisa-mon.js`: revisor de contingut d'un món (preguntes, opcions, regla del 15–40 %, blocs, obertes, jocs, figures, «Troba l'error» i sprite del boss). Es fa servir per línia d'ordres i com a mòdul (`revisaFont`, `revisaMon`).
- `motor/publica.py`: publica d'una ordre.
  - Primer s'atura si alguna cosa no quadra: base vella, branca d'una altra tasca, merge a mitges, marques de conflicte, fitxers estranys o configuració sense `--config`.
  - Després fa la branca, executa `tot.py` i les revisions, fa el commit, passa la porta del nucli i el push.
  - Acaba obrint el PR o fent servir el que ja hi ha obert, i hi activa la fusió automàtica.
- `.claude/skills/nou-mon/`: skill de Claude Code que construeix un món des d'una carpeta de Drive i el publica amb `publica.py`, sense preguntes pel camí.
- `.claude/settings.local.json` és personal i no va a git: deixa passar soles les ordres `gh`, `git push`/`fetch`/`pull`, `prova-tot.js`, `prova-visual.js` i `publica.py`. El bloc de referència és a `docs/NOU-MON.md`, apartat 5.

## Eines compartides (`motor/eines/`)
- `exercicis-mates.js`: Taller de mates (generadors, teclat numèric, fitxes en 3 modes, examen, repàs barrejat i Troba l'error).
- `manipulatius-mates.js`: manipulatius interactius (rectangles, arbre de factors, granotes MCM, rajoles MCD).
- `quadern.js`: punts de control pas a pas i correcció per foto a les preguntes obertes.
- `pissarra.js`: full de brut tàctil.
- `mapa-comarques.js`: generador del mapa SVG de comarques.
- `so-mobil.js`: desbloqueig i manteniment d'àudio WebAudio a iOS/mòbil fins i tot en mode silenci.
- `actualitza.js`: actualització automàtica en obrir la pàgina (portada i mons). Compara la versió de la pàgina amb `versio.json` (generat per `tot.py`) i, si és una còpia vella, esborra la memòria cau `bn-…` i recarrega un sol cop; mai toca el progrés.
- `mons-prova.js`: no va a cap pàgina. Les proves del tauler i del xat hi llegeixen `mons.json` i el catàleg del xat, de manera que no depenen del nombre de mons.

## Proves (`motor/`)
- `motor/prova-generadors.js`: valida 10.800 exercicis generats del Taller de mates (càlculs, distractors i Troba l'error) sense navegador.
- `motor/prova-regles.js`: comprova que `motor/regles.json` i `admin/regles.json` coincideixen amb les constants de la plantilla i amb les còpies de `index.html`, `perfil/index.html`, `admin/index.html`, `supabase/bn_xat.sql` i `supabase/bn_admin_tauler.sql`.
- `motor/prova.js`: prova E2E amb Playwright en mode `ESTRICTE=1` per a cada món.
- `motor/prova-visual.js`: a 360/390/430 px, sense scroll horitzontal i cap text d'SVG fora del dibuix ni del seu requadre (portada, primer tema, jocs de figura i d'error i `?demoBoss=1`). Captures a `motor/.captures/<id>/`, fora de git.
- `motor/prova-mons.js`: `mons.json` coincideix amb els blocs generats a l'admin, `sprites.js`, `index.html` i `bn_xat.sql`.
- `motor/prova-revisa-mon.js`, `motor/prova_nou_mon.py`, `motor/prova_publica.py` i `motor/prova_registres.py` són les proves de les eines. `prova_publica.py` fa una publicació sencera en un repo temporal, amb `gh` i `nucli` simulats.
- `motor/prova-tot.js`: passa en local el mateix que l'Action, per grups (`base`, `sql`, `interficie`, `mons [carpeta…]`) o una prova sola. És una sola ordre, perquè passi sense finestra de permís.
- `motor/prova-perfil.js`, `motor/prova-pares.js` i `motor/prova-tast.js`: proves E2E de la pàgina de perfil, de la guia per a les famílies i del mode tast anònim amb servidor local.
- `motor/prova-xat.js` i `motor/prova-admin-*.js` (`prova-admin-alta.js`, `prova-admin-fitxa.js`, `prova-admin-benestar.js`, `prova-admin-fonts.js`, `prova-admin-fonts-rep.js`, `prova-admin-dificultat.js`, `prova-admin-evolucio.js`, `prova-admin-auto.js`, `prova-admin-pagines.js`, `prova-admin-ordre.js`, `prova-admin-xat.js`): proves E2E del xat de la colla i de totes les seccions, fitxes i vista mòbil (`360`/`390`/`430 px`) del panell d'admin (Supabase simulat).
- `motor/prova-xat-sql.js`, `motor/prova-bon-us-sql.js`, `motor/prova-fotos-sql.js` i resta de `*-sql.js`: executen els fitxers SQL de `supabase/` dins de PGlite (Postgres en WebAssembly, `npm install --no-save @electric-sql/pglite@0.5`) i en proven les funcions i permisos.

## Panell d'administració (`bonanota.net/admin`) i Supabase
- `admin/index.html`, `admin/preguntes.json` i `admin/regles.json`: aplicació d'administració en un sol fitxer natiu a `bonanota.net/admin` (menú: Inici · Nens · Mons · Activitat (`?v=sessions`) · Rànquing · Xat, i Configuració a l'engranatge), amb càrrega d'RPC sota demanda, comprovació silenciosa de novetats cada minut i en tornar a la pestanya (`comprovaNovetats`: avís «N novetats · Mostra-les», mai es repinta sol), baixada incremental del registre (`bn_admin_logs(…, p_des_id)`: en actualitzar només baixa les files noves; si el SQL no hi és, baixada sencera), repintat sense esquelets (`repintaSuau`), banda de versió nova en lloc de recàrrega, adreça web sincronitzada (`?v=…&id=…&tab=…&p=…`), component únic `taula()` (≤ 8 columnes, cerca local, CSV i paginació de 25/50/100 files amb la pàgina recordada a `TPAG`), ajudes plegables (`i`), píndoles semàfor (`bé`, `avís`, `malament`) i de món, i barra inferior fixa al mòbil (`≤ 767 px`).
  - **5 eixos principals:** `Inici` (6 xifres clau, control ràpid d'1 clic de xat i 8 mons, alertes plegables amb filtres, nens nous i estrelles per origen), `Nens` (llista de 7 columnes, `Benestar` i `Fitxa del nen` a pantalla completa amb selector `#selFitxaNen`, 4 pestanyes i descàrrega d'informe `.html`/PDF o `.md`), `Mons` (llista dels 8 mons amb interruptor directe; noms, colors i jocs de la demo al bloc generat `MONS-ADMIN`, `Domini global`, `Dificultat real` i `Fitxa del món` amb selector `#selFitxaMon` i pestanyes `Resum`, `Domini i errors`, `Obertes` i `Taller` a matemàtiques), `Sessions` (`Sessions`, `Log complet per dia` amb filtres per món/nen/data, `Activitat` i `Registre`) i `Rànquing` (`Classificació` via `bn_ranking_mons` + interruptor `Visible` i bloc d'amagats, `Reptes` i `Xat` de 5 columnes + silenciats).
  - **`⚙ Configuració` i panell lateral (`#panell`):** `Configuració` a la capçalera superior (`Horaris i crèdits`, `Rànquing` amb tall `XX primers`/pestanyes/meta/premis, `Catàleg del xat`, `Llindars` editables a Supabase i `Còpies`), i `#panell` superposat per al detall d'una sessió, text complet d'obertes, formulari de peça nova i detall de còpies.
- `supabase/*.sql` i `supabase/functions/bn-corregeix/`: esquema, RPCs (`bn_admin_*`, `bn_ranking_mons`, `bn_ranking_remuntada`, `bn_aspecte_desa`, `bn_aspectes`, `bn_xat_*`, `bn_estat_web`, etc.) i Edge Function del projecte Supabase `bonanota` (`agippwtqvhpxdockuigl`). `bn_control.sql` valida els mons pel format de l'id (`^[a-z0-9_-]{1,40}$`), sense llista a mà.

## Revisió i publicació (GitHub)
- `.github/workflows/revisa.yml` («Revisa Bona Nota») té 4 jobs en paral·lel i un que recull el resultat:
  - `base`: `tot.py` no canvia res, el Taller, les regles, `prova-mons`, el revisor i les eines;
  - `sql`: el SQL a PGlite;
  - `interficie`: Playwright;
  - la matriu `mons`: l'estricta i la visual de cada món de `mons.json`, amb les captures com a artefacte;
  - `tot`: el check «Revisa Bona Nota · tot», en verd només si tots els altres ho són.
- El ruleset «main protegida» exigeix PR i el check `tot`, i prohibeix el push forçat i esborrar `main`. Els PR s'obren amb `gh pr merge --auto --squash --delete-branch` i GitHub els fusiona sols quan el check surt en verd.
- `.github/workflows/etiqueta.yml` («Etiqueta la versió»): a cada pujada a `main`, posa l'etiqueta `vX.Y.Z` de la línia `**Versió:**` del README si encara no existeix. GitHub Pages publica `main` a `bonanota.net`.
