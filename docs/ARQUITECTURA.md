# Arquitectura

Les peces del sistema, com es parlen i on viu cada cosa. Es manté curt: el detall és al codi.

## Portada i rànquing (`bonanota.net`)
- `index.html`, `CNAME`, `sprites.js`, `manifest.webmanifest`, `sw.js`.
- Publicat al domini `bonanota.net` (fitxer `CNAME`). `www.bonanota.net` i l'adreça antiga de GitHub Pages hi redirigeixen.
- Punt d'entrada de l'alumne (identificació amb nom + PIN `4 números + 1 lletra`), targetes dels 6 mons (bloc marcat amb `<!-- MONS:INICI -->` / `<!-- MONS:FI -->` generat per `motor/tot.py`) i rànquing en temps real connectat a Supabase (Estrelles, Temps, Nivell, Setmana i Remuntada).

## Motor i plantilla dels mons
- `motor/plantilla-estudi-interactiu.html`: motor únic compartit per tots els mons (fitxes, targetes, tests amb pistes i escut del combo, missions d'avui, Boss del món, jocs, repàs espaiat `BN_REP_TIPUS`, exàmens, preguntes obertes, estrelles i sincronització al núvol).
- `motor/dades/<id>.js`: contingut de cada món (`ASSIG`, `T`, `OB`) i directives `//@inclou` (`socials`, `biogeo`, `castellano`, `comarques`, `divisibilitat`, `catala`).
- `motor/mons.json`: catàleg oficial de mons (carpeta, número, títol, colors, icona, llengua).
- `motor/build.py` i `motor/tot.py`: combinen plantilla + dades + eines per generar `<assignatura>/<tema>/index.html`, actualitzen la portada, `motor/qids.json`, `admin/preguntes.json` i `sw.js`.

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
- `motor/prova.js`: prova E2E amb Playwright en mode `ESTRICTE=1` per a cada món.

## Panell d'administració (`bonanota.net/admin`) i Supabase
- `admin/index.html` i `admin/preguntes.json`: backend d'administració a `bonanota.net/admin` (tauler d'activitat, domini plegable per món, preguntes més fallades plegables per món, gestió de nens/PINs i còpies de seguretat).
- `supabase/*.sql` i `supabase/functions/bn-corregeix/`: esquema, RPCs (`bn_admin_*`, `bn_ranking_remuntada`, etc.) i Edge Function del projecte Supabase `bonanota` (`agippwtqvhpxdockuigl`).
