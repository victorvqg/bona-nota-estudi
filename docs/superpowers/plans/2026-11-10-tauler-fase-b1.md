# Pla n2537 · fase B · pas 1: fitxa del nen amb l'estat real i altes

Revisió: `docs/superpowers/specs/2026-11-10-revisio-tauler.md` (M1, M2 i decisió 2). Branca `n2537-b1-fitxa-altes`. Commits `tipus(àmbit): què (n2537)`.
Només SQL nou + `admin/index.html` (i proves). **No es toca el motor, la portada ni el perfil.**
Versió: 2.12.0 (funció nova de l'admin). Docs: CHANGELOG, README (apartat del tauler), ESTAT.

## Fitxer SQL: `supabase/bn_admin_fitxa.sql` (idempotent, estil de `bn_admin_tauler.sql`)

### Columna `bn_priv.perfils.creat` (decisió 2)
```sql
alter table bn_priv.perfils add column if not exists creat timestamptz;      -- pas 1: sense default (els vells queden buits)
alter table bn_priv.perfils alter column creat set default now();           -- pas 2: només per a les altes noves
do $$ … si existeix bn_priv.perfils.ts: update … set creat = ts where creat is null and ts is not null … $$;  -- dinàmic (execute)
```
`bn_perfil_crea` posa columnes amb nom, així que `creat` agafa el default. `bn_copies` restaura amb `jsonb_populate_recordset`: les còpies velles sense `creat` queden buides.

### `bn_admin_fitxa(p_email text, p_pass text, p_nom text) → jsonb`
`security definer`, `set search_path = ''`, primer `perform bn_priv.admin_ok(p_email, p_pass)`.
**L'estat el va escriure el navegador d'un nen: no és de fiar.** Comprova `jsonb_typeof` a cada pas; un món mal format no pot fer fallar la fitxa (aquell món surt amb `"error": true`).
```
{ "k": "pau",
  "perfil": null | {"nom","id","pin_v","creat","pin_ts","aspecte_ts"},     -- ms d'època o null
  "amagat": bool,
  "mons": [ { "assig", "mod", "ts", "reinici",                              -- ms (mod i reinici tal com els desa el joc)
      "punts", "temps", "dies", "dia_ult", "ultim",
      "temes": { "<id tema>": {"fitxa", "fc", "n", "max", "ult", "d_ult", "fallades": {"<pregunta>": n}} },   -- n/max/ult/d_ult resumeixen intents [{d, pc}]
      "rep": [ {"tid","q","c","prox"} ],  "rep_n", "rep_avui",               -- ordenats per prox; rep_avui = prox ≤ data UTC d'avui (avui() del joc és toISOString)
      "ob": {"<n>": pc},  "examens": [ {"d","pc","real"} ] (els 20 últims),
      "boss": {…} (tal qual, si és objecte),  "apresos",
      "jocs": { "<id>": {"n","max","ult"} },                                 -- resum de S.jocs[id] = [pc…]
      "fonts", "ftema", "fjoc", "est" } ] }                                  -- tal qual, si són objectes
```
`mons` surt de `bn_priv.progres` (només nens amb PIN que han desat). Ordenat per `assig`. Sense perfil → `perfil: null`, però `mons` surt igualment de `progres` (*corregit:* «Treu el PIN» esborra el perfil i conserva el progrés).

### `bn_admin_altes(p_email text, p_pass text, p_periode text default '30d') → jsonb`
Mateixos períodes que el tauler (`bn_priv.desde`). Unió de `bn_priv.perfils` i dels noms de `public.bn_log` (sense prohibits). Per nen:
`{"k","nom","alta","primer","creat","pin_ts","aspecte_ts","id","mons","punts","dies7","amagat","te_pin"}`
- `primer` = `min(ts)` de `bn_log` del nen (de sempre, no del període); `alta` = `least(creat, primer)` (la primera vegada que el veiem; *corregit: abans deia coalesce*). **No** `detall.nou`.
- `mons` = mons amb estrelles; `punts` = suma del màxim de `punts` per món (com el rànquing, però de sempre); `dies7` = dies diferents (Madrid) amb registre els 7 primers dies des de `alta`.
- Només els nens amb `alta` dins del període; també els que tenen perfil però cap registre (`primer` null: «encara no ha jugat»). Ordenat per `alta` desc, fins a 500.

### Permisos
`revoke all … from public` + `grant execute … to anon, authenticated` a les dues públiques (les protegeix `admin_ok`). Cap ajuda nova a `bn_priv` sense `revoke`.

## Admin (`admin/index.html`)
- **Fitxa del nen:** pestanya nova «Al núvol» (després de Sessions). Per món: data de l'últim desat; temes amb títol (de `preguntes.json`: clau `món/tema/núm` → `tema`; si no hi és, l'id), millor nota, intents, última, aprovat (≥ 70, el mateix número que ja fa servir el tauler: quan hi hagi `regles.json` (pas 3) es llegirà d'allà), preguntes que més falla; errors pendents de repàs (quants i quants toquen avui) amb la pregunta; obertes fetes i nota mitjana; exàmens; boss (victòries, cors); dies d'estudi; errors apresos; fonts de les estrelles. Missatges clars: «No té PIN: només hi ha el registre (pestanyes anteriors)» i «Té PIN, però encara no ha desat res al núvol».
- **Altes:** targeta «Nens nous» a dalt de la vista Nens, amb el període de la capçalera: nen (enllaç a la fitxa si té registre), alta, primer registre, PIN creat, perfil triat, mons, estrelles, dies actius la primera setmana, i «encara no ha jugat» si no té registre.
- Tot el que ve de l'estat passa per `esc()` (és text que va escriure un navegador de nen). 404 → `avisSQL("supabase/bn_admin_fitxa.sql", …)`. Demo: dades inventades.

## Proves
- `motor/prova-admin-fitxa-sql.js` (PGlite, com `motor/prova-xat-sql.js`): SQL executat dues vegades; contrasenya dolenta; nen sense perfil; amb perfil i sense progrés; amb dos mons (resums d'intents, jocs, rep ordenat i rep_avui); estat mal format (temes com a llista o text, intents no llista, pc no numèric) sense petar; `creat` en dos passos (vells buits, nous amb data) i còpia de `ts` si la columna existeix; altes (període, nen sense registre, ordre, prohibits fora); permisos.
- `motor/prova-admin-fitxa.js` (Playwright, Supabase simulat): demo; amb credencials, la pestanya «Al núvol» crida `bn_admin_fitxa` amb `p_nom`, pinta títols de tema i xifres; **XSS**: una pregunta de `fallades` o un `tid` amb `<img onerror>` no s'executa; altes a la vista Nens; 404 → avís; cap error de JS.
- L'Action passa totes dues.
