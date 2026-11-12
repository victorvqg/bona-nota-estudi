# Arquitectura

Les peces del sistema, com es parlen i on viu cada cosa. Es manté curt: el detall és al codi.

## Portada i rànquing (`bonanota.net`)
- `index.html`, `CNAME`, `sprites.js`, `manifest.webmanifest`, `sw.js`.
- Publicat al domini `bonanota.net` (fitxer `CNAME`). `www.bonanota.net` i l'adreça antiga de GitHub Pages hi redirigeixen.
- Punt d'entrada de l'alumne (identificació amb nom + PIN `4 números + 1 lletra`), targetes dels 7 mons (bloc marcat amb `<!-- MONS:INICI -->` / `<!-- MONS:FI -->` generat per `motor/tot.py`) i rànquing en temps real connectat a Supabase (Estrelles, Dies, Nivell, Setmana, Remuntada i Xat).
- **Xat de la colla** (pestanya «Xat» del rànquing, a `index.html`): catàleg al bloc `XAT-CATALEG` (el mateix que `supabase/bn_xat.sql`), funcions `xat*` integrades a `pintaHs()`/`tickerHs()`/`carregaHs()`. Llegeix amb `bn_xat_llegeix` (pública) i parla amb PIN amb `bn_xat_estat`, `bn_xat_envia` i `bn_xat_vota`; el servidor decideix crèdits i desbloquejos i el navegador compon el text.
- `perfil/index.html`: pàgina de perfil («PLAYER SELECT») on el nen tria l'aspecte (animal, perfil arcade de `BN_SKILLS` i estil). Es guarda a l'aparell (`bn_aspectes`) i al perfil del nen a Supabase; el rànquing, la portada, els mons i el tauler el mostren.
- `pares/index.html`: guia oberta i sense tecnicismes per a les famílies (`bonanota.net/pares`), enllaçada des de la portada i integrada a `motor/tot.py` i `sw.js`.

## Motor i plantilla dels mons
- `motor/plantilla-estudi-interactiu.html`: motor únic compartit per tots els mons (fitxes, targetes, tests amb pistes i escut del combo, missions d'avui, Boss del món, jocs, repàs espaiat `BN_REP_TIPUS`, exàmens, preguntes obertes, estrelles i sincronització al núvol).
- `motor/dades/<id>.js`: contingut de cada món (`ASSIG`, `T`, `OB`) i directives `//@inclou` (`socials`, `biogeo`, `castellano`, `comarques`, `divisibilitat`, `catala`, `angles`).
- `motor/mons.json`: catàleg oficial de mons (carpeta, número, títol, colors, icona, llengua).
- `motor/build.py` i `motor/tot.py`: combinen plantilla + dades + eines per generar `<assignatura>/<tema>/index.html`, actualitzen la portada, `motor/qids.json`, `admin/preguntes.json`, `motor/regles.json`, `admin/regles.json` i `sw.js`.

## Eines compartides (`motor/eines/`)
- `exercicis-mates.js`: Taller de mates (generadors, teclat numèric, fitxes en 3 modes, examen, repàs barrejat i Troba l'error).
- `manipulatius-mates.js`: manipulatius interactius (rectangles, arbre de factors, granotes MCM, rajoles MCD).
- `quadern.js`: punts de control pas a pas i correcció per foto a les preguntes obertes.
- `pissarra.js`: full de brut tàctil.
- `mapa-comarques.js`: generador del mapa SVG de comarques.
- `so-mobil.js`: desbloqueig i manteniment d'àudio WebAudio a iOS/mòbil fins i tot en mode silenci.
- `actualitza.js`: actualització automàtica en obrir la pàgina (portada i mons). Compara la versió de la pàgina amb `versio.json` (generat per `tot.py`) i, si és una còpia vella, esborra la memòria cau `bn-…` i recarrega un sol cop; mai toca el progrés.

## Proves (`motor/`)
- `motor/prova-generadors.js`: valida 10.800 exercicis generats del Taller de mates (càlculs, distractors i Troba l'error) sense navegador.
- `motor/prova-regles.js`: comprova que `motor/regles.json` i `admin/regles.json` coincideixen amb les constants de la plantilla i amb les còpies de `index.html`, `perfil/index.html`, `admin/index.html`, `supabase/bn_xat.sql` i `supabase/bn_admin_tauler.sql`.
- `motor/prova.js`: prova E2E amb Playwright en mode `ESTRICTE=1` per a cada món.
- `motor/prova-perfil.js`, `motor/prova-pares.js` i `motor/prova-tast.js`: proves E2E de la pàgina de perfil, de la guia per a les famílies i del mode tast anònim amb servidor local.
- `motor/prova-xat.js` i `motor/prova-admin-*.js` (`prova-admin-alta.js`, `prova-admin-fitxa.js`, `prova-admin-benestar.js`, `prova-admin-fonts.js`, `prova-admin-fonts-rep.js`, `prova-admin-dificultat.js`, `prova-admin-xat.js`): proves E2E del xat de la colla i de totes les seccions, fitxes i vista mòbil (`360`/`390`/`430 px`) del panell d'admin (Supabase simulat).
- `motor/prova-xat-sql.js`, `motor/prova-bon-us-sql.js`, `motor/prova-fotos-sql.js` i resta de `*-sql.js`: executen els fitxers SQL de `supabase/` dins de PGlite (Postgres en WebAssembly, `npm install --no-save @electric-sql/pglite@0.5`) i en proven les funcions i permisos.

## Panell d'administració (`bonanota.net/admin`) i Supabase
- `admin/index.html`, `admin/preguntes.json` i `admin/regles.json`: aplicació d'administració en un sol fitxer natiu a `bonanota.net/admin`, amb càrrega d'RPC sota demanda, autorefresc cada 30 s i en tornar a la pestanya, adreça web sincronitzada (`?v=…&id=…&tab=…&p=…`), component únic `taula()` (≤ 8 columnes, cerca local i CSV), ajudes plegables (`i`), píndoles semàfor (`bé`, `avís`, `malament`) i de món, i barra inferior fixa al mòbil (`≤ 767 px`).
  - **5 eixos principals:** `Inici` (6 xifres clau, control ràpid d'1 clic de xat i 7 mons, alertes plegables amb filtres, nens nous i estrelles per origen), `Nens` (llista de 7 columnes, `Benestar` i `Fitxa del nen` a pantalla completa amb selector `#selFitxaNen`, 4 pestanyes i descàrrega d'informe `.html`/PDF o `.md`), `Mons` (llista dels 7 mons amb interruptor directe, `Domini global`, `Dificultat real` i `Fitxa del món` amb selector `#selFitxaMon` i pestanyes `Resum`, `Domini i errors`, `Obertes` i `Taller` a matemàtiques), `Sessions` (`Sessions`, `Log complet per dia` amb filtres per món/nen/data, `Activitat` i `Registre`) i `Rànquing` (`Classificació` via `bn_ranking_mons` + interruptor `Visible` i bloc d'amagats, `Reptes` i `Xat` de 5 columnes + silenciats).
  - **`⚙ Configuració` i panell lateral (`#panell`):** `Configuració` a la capçalera superior (`Horaris i crèdits`, `Catàleg del xat`, `Llindars` editables a Supabase i `Còpies`), i `#panell` superposat per al detall d'una sessió, text complet d'obertes, formulari de peça nova i detall de còpies.
- `supabase/*.sql` i `supabase/functions/bn-corregeix/`: esquema, RPCs (`bn_admin_*`, `bn_ranking_mons`, `bn_ranking_remuntada`, `bn_aspecte_desa`, `bn_aspectes`, `bn_xat_*`, `bn_estat_web`, etc.) i Edge Function del projecte Supabase `bonanota` (`agippwtqvhpxdockuigl`).
