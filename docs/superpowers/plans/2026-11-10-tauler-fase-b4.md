# Pla n2537 · fase B · pas 4: nivells al tauler (M5) i embut d'alta (M7)

Revisió: `docs/superpowers/specs/2026-11-10-revisio-tauler.md` (M5, M7 i apartat 7). Branca `n2537-b4-nivells-alta` des de `main` (amb #34 fusionat). Commits `tipus(àmbit): què (n2537)`.
Versió: 2.16.0.

## 1. M5 · Nivells al tauler (`admin/index.html`, llegint `admin/regles.json`)
- L'admin carrega `admin/regles.json` (`carregaRegles()`) i actualitza `NIVELLS`, `XNIV` i `APROVAT` (mantenint els valors inicials com a reserva immediata i validats per `motor/prova-regles.js`).
- `nivellDe(punts)` i `pillNivell(punts)` calculen el nivell (1..10), el nom, la icona i les estrelles que falten per al següent.
- El nivell del nen és el del seu món amb més estrelles (`punts_max`, com al rànquing i al xat); el nivell de cada món és el de les estrelles d'aquell món.
- Es mostra a:
  1. **Vista Nens (`#tNens`)**: columna ordenable «Nivell» al costat d'«Estrelles».
  2. **Fitxa del nen**: xip del nivell a la capçalera, KPI «Nivell» a la pestanya Resum, i nivell de cada món a la llista d'Assignatures i a la pestanya Estrelles (`blocEstrelles`).
  3. **Fitxa del nen → «Al núvol» (`htmlNuvol` i `monNuvol`)**: xip del nivell al núvol a `.nv-perfil` i nivell de cada món a la capçalera plegable i als KPIs del món.

## 2. M7 · Embut d'alta (`supabase/bn_admin_alta.sql`, `index.html`, `perfil/index.html`, `admin/index.html`)
- **Límits d'aprovació (revisió, apartat 7)**:
  - Només a la portada (`index.html`) i al perfil (`perfil/index.html`). **No** es toca `motor/plantilla-estudi-interactiu.html`.
  - Event nou `alta` a `public.bn_log` (`assig = 'portada'`), amb el pas (`nom`, `pin_creat`, `pin_ko`, `perfil`, `pin_ara_no`), `ok` (`1` o `0`) i, si s'encalla, `motiu` (codi tancat: `massa_noms`, `prohibit`, `existeix`, `format`, `exemple`, `incorrecte`, `no_coincideix`, `bloc`, `canvi`).
  - **Mai el PIN**, ni un tros, ni la seva llargada.
  - Abans que el nen tingui perfil (`nom` i `pin_ko`), **no s'apunta el nom que ha escrit**: s'envia el nom tècnic fix `_alta` i `aparell = 'alta:' || APARELL` (perquè el límit de 2 noms per aparell de `bn_max_2_noms` no compti `_alta` com un dels 2 nens de l'aparell).
  - L'event no porta mai `punts` ni `fonts`.
- **SQL (`supabase/bn_admin_alta.sql`, idempotent)**:
  - Amplia el `check` de `public.bn_log.event` per admetre `'alta'`.
  - Trigger `bn_log_alta_net` abans d'inserir a `public.bn_log` quan `event = 'alta'`: neteja `detall` perquè només pugui portar `{pas, ok, motiu}` (mai `punts`, `fonts`, `pin` ni text lliure).
  - Actualitza `bn_priv.logs`, `public.bn_admin_altes` i `public.bn_admin_benestar` perquè excloguin `event = 'alta'` i `lower(trim(nom)) = '_alta'` dels recomptes d'estudi i del «Primer registre».
  - `public.bn_admin_alta_embut(p_email, p_pass, p_periode default '30d') → jsonb`: retorna els comptadors per aparell i per pas (`nom`, `pin_creat`, `pin_ko`, `perfil`, `pin_ara_no`), el desglossament per `motiu` d'encallament i quants nens nous han entrat directament a un món sense passar per cap `alta`.
- **Admin (`admin/index.html`)**:
  - Exclou `event === "alta"` i `nom === "_alta"` de `nens()`, `pintaFiltres()` (`#fAssig` i `#fNen`) i `vistaSessions()`, i descriu l'event `alta` a «Log complet».
  - A la vista **Nens**, targeta **«Embut d'alta» (`#embutAlta`)** amb els KPIs dels passos, taula/barres per pas i detall dels motius on s'encallen els nens nous. Si falta el SQL (404), mostra `avisSQL("supabase/bn_admin_alta.sql", ...)` només a la targeta.

## 3. Proves
- `motor/prova-admin-alta-sql.js` (PGlite): idempotència del SQL, check d'`event = 'alta'`, trigger que impedeix `punts`/`pin` a `alta`, exclusió d'`_alta` i `alta` a `bn_ranking`, `bn_admin_resum`, `bn_admin_altes` i `bn_admin_benestar`, i verificació completa de `bn_admin_alta_embut`.
- `motor/prova-admin-alta.js` (Playwright): nivells a Nens i a la Fitxa (Resum, Estrelles i Al núvol) llegits de `admin/regles.json`; targeta «Embut d'alta» a Nens (amb dades, 404 i DEMO); i comprovació a la portada (`index.html`) i al perfil (`perfil/index.html`) que els passos `nom`, `pin_ko`, `pin_creat`, `pin_ara_no` i `perfil` s'envien sense posar mai el PIN ni el nom abans de tenir perfil.
