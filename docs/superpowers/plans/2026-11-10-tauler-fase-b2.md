# Pla n2537 · fase B · pas 2: historial de combos i repàs (M3) i errors pendents de la colla (M4)

Revisió: `docs/superpowers/specs/2026-11-10-revisio-tauler.md` (M3, M4). Branca `n2537-b2-fonts-rep` des de `main` (amb #30 fusionat). Commits `tipus(àmbit): què (n2537)`.
Només SQL nou + `admin/index.html` (i proves i docs). **No es toca el motor, la portada ni el perfil.** El SQL l'aplica i el comprova l'agent principal a Supabase (en Víctor ho ha demanat).
Versió: 2.14.0 (funció nova de l'admin).

## SQL: `supabase/bn_admin_fonts_rep.sql` (idempotent; security definer; `set search_path = ''`; `bn_priv.admin_ok`; grants)

### M3 · `bn_admin_fonts_dia(p_email, p_pass, p_periode text default '30d', p_assig text default null, p_nom text default null) → jsonb`
- Dades: `detall.fonts` de `public.bn_log`: el porten `entra`, `temps` i, des de la 2.8.2, `test`, `joc`, `examen` i `oberta` (*corregit: abans deia només `entra` i `temps`*). Cada increment es compta contra el màxim anterior del tram, no contra el registre anterior (un aparell vell faria comptar dues vegades). És un objecte acumulat per món: `{temes, jocs, examen, obertes, combo, record, repas, missio, boss, triple, super}` (números; claus desconegudes s'ignoren o es tornen tal qual si són numèriques).
- Per a cada nen (`lower(trim(nom))`) i món, ordena els registres amb `fonts` per `ts` i compara cada un amb l'anterior (`lag`): increment = `greatest(0, actual − anterior)` per clau. El primer registre d'un nen i món és la base (no compta: no se sap de quan és). **Talla la sèrie als reinicis** (`bn_priv.reinicis` del nen per a aquell món o `*`): el primer registre després d'un reinici torna a ser base. Un valor que baixa (aparell vell) dona 0, mai negatiu.
- L'increment s'atribueix al dia (Madrid) del registre on apareix. La sèrie es calcula amb tota la història del nen i món, però només es tornen els dies del període.
- Resposta: `{"periode", "dies":[{"dia":"AAAA-MM-DD","k","nom","assig","f":{"combo":n,…}}], "total":{"combo":n,…}}`, només files amb algun increment > 0. Fins a 5.000 files.
- Rendiment: `bn_log_nom` i `bn_log_ts` ja existeixen; filtra pel període ampliat (cal el registre anterior al període per fer la diferència: agafa per cada nen i món l'últim registre amb fonts anterior al període com a base).

### M4 · `bn_admin_rep_pendents(p_email, p_pass, p_assig text default null) → jsonb`
- Dades: `estat.rep` de `bn_priv.progres` (`{clau: {tid, q, c, prox}}`), estat escrit pel navegador: valida tipus com `bn_admin_fitxa.sql` (reutilitza les seves ajudes `bn_priv.fitxa_*` si et convé; si no hi són, no petis).
- Agrega per `assig` i `tid`: `{"assig","tid","n" (errors pendents),"nens" (nens diferents),"avui" (prox ≤ data UTC d'avui, com el joc),"preguntes":[{"q","n"}] (les 5 més repetides)}`. Les entrades sense `tid` (p. ex. `err_gen`) van a `tid` null. Ordenat per `n` desc. Fins a 300 files.
- Nens amagats inclosos? Sí (és per a l'admin), però sense noms a la resposta: només comptes.

## Admin (`admin/index.html`)
- **Tauler → «Combos i repàs»** (nova targeta, a SECCIONS): gràfic de barres apilades per dia (Chart.js, com «Activitat per dia») amb les estrelles de combo, triple combo, super combo i repàs (i, plegable, la resta de fonts); xifres del període per font; i una taula per nen (estrelles de cada font en el període). Respecta període, assignatura i nen de la capçalera. Text que expliqui que surt de les diferències entre registres (granularitat de sessió) i que abans de la 2.9.0/2.10.0 no hi havia triple ni super.
- **Tauler → «Errors pendents de la colla»** (nova targeta): per món (plegable com Domini), temes amb més errors pendents (títol de `preguntes.json`), quants nens, quants toquen avui i les preguntes més repetides. Respecta el filtre d'assignatura.
- 404 → `avisSQL("supabase/bn_admin_fonts_rep.sql", …)` només a la targeta afectada; la resta del tauler es veu. Tot el que ve de l'estat per `esc()`. DEMO amb dades inventades coherents.

## Proves
- `motor/prova-admin-fonts-rep-sql.js` (PGlite, com les altres): SQL dues vegades; contrasenya dolenta; increments correctes entre registres; base del primer registre; base anterior al període; reinici que talla; valor que baixa → 0; claus estranyes; rep agregat (n, nens, avui amb data UTC, top preguntes, tid null); estat mal format; permisos.
- `motor/prova-admin-fonts-rep.js` (Playwright, Supabase simulat): demo; crides amb període/assignatura/nen; gràfic i taules; 404 per targeta; escapament; mòbil 390 px.
- L'Action passa totes dues.
