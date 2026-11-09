# Estat actual

Data: 2026-11-09

## Què funciona
- **Versió actual: 2.3.0** (historial a `CHANGELOG.md`, regles a l'apartat «Versions» del README).
- **6 mons publicats** a `https://bonanota.net/` (`sociales/t3-clima`, `bio-i-geo/univers`, `castellano/t2-t3`, `sociales/comarques`, `matematiques/divisibilitat`, `catala/t2`).
- **Portada arcade (`index.html`)** amb entrada per nom + PIN (`4 números i 1 lletra`), rànquing amb 5 pestanyes (`punts`, `temps`, `nivell`, `setmana`, `remuntada`), meta de la colla, insígnia d'estrelles totals clicable (`#enEst`) i accessibilitat WAI-ARIA completa.
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

## En curs
- Branca `versions-readme`: README al dia, sistema de versions i Gemini per escrit. Pendent de pujar i fusionar.

## Pendent
- La 📷 correcció de la foto del quadern: `ORIGENS` de `supabase/functions/bn-corregeix/index.ts` no inclou `https://bonanota.net`, i el navegador bloqueja la resposta. Cal afegir-hi l'origen i tornar a desplegar la funció.
