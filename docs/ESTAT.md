# Estat actual

Data: 2026-11-11

## Què funciona
- **Versió actual: 2.23.0** (historial a `CHANGELOG.md`, regles a l'apartat «Versions» del README). El número surt al peu de la portada i de cada món, i a la capçalera del tauler.
- **7 mons publicats** a `https://bonanota.net/` (`sociales/t3-clima`, `bio-i-geo/univers`, `castellano/t2-t3`, `sociales/comarques`, `matematiques/divisibilitat`, `catala/t2`, `angles/t2`), tots 7 amb il·lustració animada (`motor/ilu/*.svg`), sprite i color propi (`sprites.js`), preguntes difícils per al super combo (`motor/dificultat.json`, 130 en total) i 3 peces del xat per món.
- **Portada arcade (`index.html`)** amb entrada per nom + PIN (`4 números i 1 lletra`), rànquing amb 6 pestanyes (`punts`, `dies`, `nivell`, `setmana`, `remuntada` i `xat`), meta de la colla, insígnia d'estrelles totals clicable (`#enEst`) i accessibilitat WAI-ARIA completa.
- **Tauler d'administració (`admin/index.html`)** a `https://bonanota.net/admin/` connectat a Supabase (`agippwtqvhpxdockuigl`).
- **Bloc `g1` (Nucli)**: instal·lat i configurat amb les 3 portes de verificació (`generat`, `generadors`, `estricte`).
- **Bloc `g2` (`n2448` — Troba l'error i Llibreta)**:
  - Punt volat `·` per a la multiplicació a tot el mòdul de Matemàtiques.
  - Diferenciació visual de llibreta correcta (vora verda `.mx-llib`) vs llibreta amb error (vora vermella `.mx-llib.mx-err`) i ressaltat `.mx-lin-ok`.
  - 12 generadors `MXE` de «🔍 Troba l'error» amb posició d'error variable (`mxPos`), llargada d'opcions equilibrada (`mxPer3`, ~30% `per[0]` més llarga), Pas 3 «✍️ Escriu-ho bé», llibreta corregida completa i repàs espaiat (`window.BN_REP_TIPUS.err`).
  - Tipus de joc genèric `error: jocError` a `motor/jocs_generics.js` i nou joc `err-clima` («🔍 Troba l'error al climograma») a `motor/dades/socials.js`.
- **Bloc `g3` (`MILLORES.md` — UX, dreceres de teclat i accessibilitat WAI-ARIA)**:
  - Dreceres de teclat globals (`1`–`4`, `Espai`, `←`/`→`, `Enter`, `Escape`), barra contextual `.tema-nav`, botó `⏸ Pausa` als reptes amb temps, millores a `#popEst` i rols/focus WAI-ARIA a la portada i a tots els mons.
- **Bloc `g4` (`n2446` — Habilitat modular de PDFs `skills/bona-nota/`)**:
  - `SKILL.md` (95 línies), `INVENTARI.md`, `CANVIS.md`, 11 fitxers a `references/`, `assets/base.css`, `scripts/bonanota_pdf.py` i paquet `skills/bona-nota.zip` verificat amb WeasyPrint.
- **`n2490` — Rànquing al mòbil i actualització automàtica**:
  - Cinta de notícies feta de peces petites (`tickerHs`): ja no es queda quieta a l'iPhone i la primera notícia surt de seguida.
  - Festa (5 tocs): capa només a la part visible, focus de llum en feixos petits (sense `mix-blend-mode`), el terratrèmol sacseja les peces visibles i no la caixa sencera; sense `backdrop-filter` a la finestra del rànquing.
  - Pestanyes: cada toc esborra els efectes de l'anterior (màxim ~20 peces), menys peces al mòbil, el rètol surt a la vista i tocar la pestanya activa torna a fer l'efecte.
  - Actualització automàtica (`motor/eines/actualitza.js` + `versio.json`) a la portada i als mons; `sprites.js?v=…`; el service worker no guarda `versio.json` i baixa la còpia inicial sense memòria cau.
  - Arreglat: els errors de «Troba l'error» de mates tornen a entrar al repàs espaiat (la prova estricta de Divisibilitat tornava a fallar).

- **`n2497` — Perfil arcade (`perfil/`)**:
  - Pàgina «PLAYER SELECT» on el nen tria animal, perfil arcade (50 insígnies noves a `sprites.js`: `BN_SKILLS`) i estil (Clàssic / Ofensiva / Tàctica), amb animacions, so, Sorpresa i desat al núvol (`supabase/bn_aspecte.sql`: columna `aspecte` + `bn_aspecte_desa` + `bn_aspectes`).
  - Es veu al rànquing, a la salutació de la portada, a la salutació dels mons (que ara carreguen `sprites.js`) i al tauler.
  - Prova nova `motor/prova-perfil.js` a l'Action. Especificació: `docs/superpowers/specs/2026-11-09-perfil-arcade-design.md`.

- **`n2528` — Xat de la colla amb crèdits (2.11.0, publicat i actiu)**:
  - Pestanya «Xat» al rànquing: els nens es parlen amb frases del catàleg (26 frases i 66 peces, cap text lliure). Cada 10 ⭐ d'avui donen 1 frase, fins a 5 al dia. Hi ha bafarades al podi, la targeta «Xat de la colla», el botó «Digues-li…», la cinta, «Ben dit» i el missatge del dia (sense premi).
  - Base de dades: `supabase/bn_xat.sql` i `supabase/bn_control.sql` (aplicats a Supabase: taules `bn_priv.xat_*`, horari automàtic del xat i obertura/tancament de mons per separat).
  - Admin: pestanya «Xat» (moderació, silencis, configuració, horari automàtic, catàleg i peça nova) i targeta «Control ràpid: Xat, Horari i Mons» al Tauler (`2.17.0`).
  - Proves a l'Action: `motor/prova-xat-sql.js`, `motor/prova-xat.js`, `motor/prova-admin-xat.js`, `motor/prova-control-sql.js` i `motor/prova-admin-alta.js`.

- **Revisió del tauler i seguretat (`n2536`/`n2537` i `#33`, 2.12.0 → 2.19.0, publicat i actiu)**:
  - Fitxa «Al núvol» i «Nens nous» (`2.12.0`), apartat «Benestar» (`2.13.0`), «Combos i repàs» i «Errors pendents de la colla» (`2.14.0`), `regles.json` extret de la plantilla (`2.15.0`), nivells al tauler (`2.16.0`), panell «Control ràpid: Xat, Horari i Mons» (`2.17.0`), bloqueig de 5 intents de PIN fallits a totes les funcions (`2.17.1` i `2.18.1`, `#33`), filtre `#fNen` amb tots els nens + paginació de `bn_admin_logs` + còpies de `xat_*` + canvi de nom amb missatges/vots/silencis del xat (`2.19.0`).

- **Bloc `g5` (`docs/BON-US.md` PRs C–G · 2.20.0 i 2.21.0, publicat i actiu)**:
  - Fases del món (`aprendre`, `vigilia`, `despres`, `supabase/bn_bon_us.sql`), pla de 10 dies (`#plaDia`), botó «Demà tinc examen» (màx. 2 dies/món), descans de 25 min registrat (`fet`/`salta`) amb límit de 2 salts (3 a la vigília), avís amable als 60/120 min, franja de nit (`21:30`/`22:00`) amb mode suau automàtic, textos amables de mentalitat de creixement, pestanya «Dies» («Dies d'estudi») al rànquing (`bn_ranking_mons`) i senyals nous `fa_descans`, `salta_descans` i `examen_dema` al Benestar.

- **Bloc `g6` (`2.22.0`, guia per a les famílies, `bn-corregeix` i neteja)**:
  - Pàgina pública `https://bonanota.net/pares/` (`pares/index.html`, especificada a `docs/superpowers/specs/2026-11-11-pagina-pares-design.md`), enllaçada des de la portada i verificada amb `motor/prova-pares.js`.
  - Aplicat `supabase/bn_fotos.sql` i desplegada l'Edge Function `bn-corregeix` (`--no-verify-jwt`) a Supabase `agippwtqvhpxdockuigl` amb CORS actiu per a `https://bonanota.net` i prova `motor/prova-fotos-sql.js` (només falta definir el secret `ANTHROPIC_API_KEY` a Supabase quan es vulgui activar la lectura d'imatges amb Claude).
  - Esborrat `motor/jocs_generics.js` (còpia antiga que no carregava cap pàgina).

## En curs
- **Estrelles (`n2505` estudi, `n2506` pla)**: decisions aprovades el 9/11/2026. Implementació en 3 PR: #13 mesurar i tapar forats (v2.8.0, fet: combo net, repàs que paga, barra de ratxa, targeta amb totes les fonts, `est` al registre i orígens fiables al tauler), #14 triple combo a les obertes (v2.9.0, fet: ratxa d'obertes bones, resposta de 10 i filtre de frases) i #15 super combo de preguntes difícils (v2.10.0, fet: marca ⚡, super combo i primera passada de 111 difícils a `motor/dificultat.json`); #16 dificultat calculada quan hi hagi dades. Estudi: `docs/superpowers/specs/2026-11-09-estrelles-estudi.md` · pla: `docs/superpowers/plans/2026-11-09-estrelles-combos.md`.
- Preguntes obertes: la fase 2, correcció amb IA, queda per decidir quan hi hagi dades del tauler.

## Pendent
- Xat de la colla: per disseny («Treu el PIN» no amaga res, `prova-xat-sql.js` §11), el rànquing i la llista de companys inclouen qui té activitat a `bn_log`; si algú entra amb un nom inventat, l'admin el pot amagar o esborrar des d'`/admin/` i desapareix tant del rànquing com del xat.
- Xat de la colla: el premi del missatge del dia es decidirà més endavant (ara no en té, i no s'han d'apuntar estrelles al registre perquè sortiria un món «xat» al rànquing).
- Foto del quadern (`bn-corregeix`): el SQL i la funció ja són desplegats a Supabase; per activar l'enviament a Claude només cal desar `ANTHROPIC_API_KEY` als Secrets d'Edge Functions.
