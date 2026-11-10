# Estat actual

Data: 2026-11-10

## Què funciona
- **Versió actual: 2.16.0** (historial a `CHANGELOG.md`, regles a l'apartat «Versions» del README). El número surt al peu de la portada i de cada món, i a la capçalera del tauler.
- **6 mons publicats** a `https://bonanota.net/` (`sociales/t3-clima`, `bio-i-geo/univers`, `castellano/t2-t3`, `sociales/comarques`, `matematiques/divisibilitat`, `catala/t2`).
- **Portada arcade (`index.html`)** amb entrada per nom + PIN (`4 números i 1 lletra`), rànquing amb 6 pestanyes (`punts`, `temps`, `nivell`, `setmana`, `remuntada` i `xat`), meta de la colla, insígnia d'estrelles totals clicable (`#enEst`) i accessibilitat WAI-ARIA completa.
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

- **`n2528` — Xat de la colla amb crèdits (2.11.0, PR pendent de prova d'en Víctor)**:
  - Pestanya «Xat» al rànquing: els nens es parlen amb frases del catàleg (26 frases i 63 peces, cap text lliure). Cada 10 ⭐ d'avui donen 1 frase, fins a 5 al dia. Hi ha bafarades al podi, la targeta «Xat de la colla», el botó «Digues-li…», la cinta, «Ben dit» i el missatge del dia (sense premi).
  - Base de dades: `supabase/bn_xat.sql` (taules `bn_priv.xat_*`, `bn_xat_estat`/`envia`/`llegeix`/`vota` i `bn_admin_xat_*`). **Cal executar-lo a Supabase**; sense ell, el rànquing es veu com abans.
  - Admin: pestanya «Xat» (moderació, silencis, configuració, catàleg i peça nova).
  - Proves noves a l'Action: `motor/prova-xat-sql.js` (PGlite), `motor/prova-xat.js` i `motor/prova-admin-xat.js`. Encàrrec: `docs/superpowers/specs/2026-11-10-xat-colla.md` · pla: `docs/superpowers/plans/2026-11-10-xat-colla.md` · regles: ADR-0006.

## En curs
- **Revisió del tauler (`n2536`/`n2537`)**: fase A feta (`docs/superpowers/specs/2026-11-10-revisio-tauler.md`). Fase B completada en 4 passos: 1) fitxa «Al núvol» i altes (2.12.0, fet); M8 · Benestar (2.13.0, fet); 2) historial de combos i repàs i errors pendents de la colla (2.14.0, fet); 3) `regles.json` i `motor/prova-regles.js` (2.15.0, fet); 4) nivells al tauler (M5) i embut d'alta a portada, perfil i admin (M7, 2.16.0, fet; pendent aplicar `supabase/bn_admin_alta.sql` a Supabase).
- **Estrelles (`n2505` estudi, `n2506` pla)**: decisions aprovades el 9/11/2026. Implementació en 3 PR: #13 mesurar i tapar forats (v2.8.0, fet: combo net, repàs que paga, barra de ratxa, targeta amb totes les fonts, `est` al registre i orígens fiables al tauler), #14 triple combo a les obertes (v2.9.0, fet: ratxa d'obertes bones, resposta de 10 i filtre de frases) i #15 super combo de preguntes difícils (v2.10.0, fet: marca ⚡, super combo i primera passada de 111 difícils a `motor/dificultat.json`); #16 dificultat calculada quan hi hagi dades. Estudi: `docs/superpowers/specs/2026-11-09-estrelles-estudi.md` · pla: `docs/superpowers/plans/2026-11-09-estrelles-combos.md`.
- Preguntes obertes: la fase 2, correcció amb IA, queda per decidir quan hi hagi dades del tauler.

## Pendent
- Xat de la colla: les taules `bn_priv.xat_*` no entren a les còpies de seguretat de l'admin (`bn_copies.sql`). La configuració sí, perquè és a `bn_priv.config`.
- Xat de la colla: si l'admin canvia el nom d'un nen, els missatges amb el nom antic deixen de veure's i el silenci, si en tenia, no el segueix (les taules del xat van pel nom en minúscules). Si cal, es pot fer amb un trigger quan es canviï el nom.
- Xat de la colla: els noms que es poden triar com a company són els del rànquing, que surt d'un registre on es pot escriure sense PIN. Un nom inventat que passi el filtre de paraules surt al rànquing (ja passava abans) i al xat. L'admin el pot amagar i desapareix de tots dos.
- Seguretat (ve d'abans del xat): el bloqueig de 5 PIN dolents no funciona a `bn_aspecte_desa`, `bn_progres_desa`, `bn_progres_llegeix` ni `bn_perfil_canvia_pin` (vegeu `docs/TRAMPES.md`). Cal un issue propi.
- Xat de la colla: el premi del missatge del dia es decidirà més endavant (ara no en té, i no s'han d'apuntar estrelles al registre perquè sortiria un món «xat» al rànquing).
- `motor/jocs_generics.js` no el carrega ningú i ja no coincideix amb la plantilla, que és on viuen els jocs genèrics. Cal decidir si s'esborra.
- La 📷 correcció de la foto del quadern: el codi de `bn-corregeix` ja accepta `https://bonanota.net` (a `main`), però cal comprovar que la funció s'ha tornat a desplegar.
