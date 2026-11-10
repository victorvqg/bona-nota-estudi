# Pla `n2537` · Panell de control a l'admin (Xat, Horari i Mons)

## Objectiu

Afegir un panell de botons d'activar/desactivar al Tauler d'administració (`admin/index.html`) i a la vista de Xat per controlar:
1. **Xat i horari automàtic**: activar o desactivar el xat al moment, activar o desactivar l'horari automàtic i triar les hores de tancament i obertura (`tanca_h`, p. ex. `21:30`, i `obre_h`, p. ex. `07:00`, en fus horari `Europe/Madrid`).
2. **Mons per separat a la web**: activar o desactivar cadascun dels 6 mons (`socials`, `biogeo`, `castellano`, `comarques`, `divisibilitat`, `catala`). Quan un món està desactivat, a la portada (`index.html`) es veu en gris amb «Tancat» i no deixa entrar-hi (però conserva les estrelles al rànquing), i si un nen hi entra per enllaç directe (`motor/plantilla-estudi-interactiu.html`), mostra un avís que el món és tancat amb un botó per tornar a la portada.

## Mòduls tocats

1. **`supabase/bn_xat.sql` i `supabase/bn_control.sql`**:
   - Estendre `bn_priv.xat_cfg()` amb `horari_actiu` (boolean, per defecte `false`), `tanca_h` (text `'HH:MM'`, per defecte `'21:30'`) i `obre_h` (text `'HH:MM'`, per defecte `'07:00'`).
   - Afegir `bn_priv.en_horari_tancat(p_horari_actiu boolean, p_tanca_h text, p_obre_h text, p_ara timestamptz default now()) returns boolean` i `bn_priv.xat_obert_ara(p_cfg jsonb default null) returns boolean`.
   - Fer que `bn_xat_llegeix`, `bn_xat_envia` i `bn_xat_vota` respectin `bn_priv.xat_obert_ara()`.
   - Afegir `bn_priv.mons_tancats() returns jsonb` (llegeix `bn_priv.config` clau `'mons'`, per defecte `{"tancats":[]}`).
   - Crear `public.bn_estat_web() returns jsonb` (pública per a `anon, authenticated`) que retorna l'estat del xat, l'horari i `mons_tancats`.
   - Crear `public.bn_admin_control(p_email text, p_pass text, p_cfg jsonb default null) returns jsonb` (amb `bn_priv.admin_ok`) per llegir i desar l'estat del xat, l'horari i els mons.
2. **`index.html`**:
   - Cridar `bn_estat_web` en carregar (amb memòria cau a `localStorage.getItem("bn_mons_tancats")`) i marcar amb `.mon-tancat` els mons desactivats: es veuen en gris amb el distintiu `🔒 TANCAT`, no deixen navegar-hi en clicar i conserven totes les estrelles al rànquing.
3. **`motor/plantilla-estudi-interactiu.html`** (i els 6 mons regenerats amb `python3 motor/tot.py`):
   - Comprovar `bn_estat_web` (quan no estem en mode local `SENSE_NUVOL()`) i, si `ASSIG.id` és dins `mons_tancats`, mostrar la pantalla de món tancat amb botó per tornar a la portada (`../../`).
4. **`admin/index.html`**:
   - Afegir la targeta fixa «Control ràpid: Xat, Horari i Mons» a dalt del Tauler (`#control`), amb interruptors per al Xat, l'Horari automàtic (amb selector d'hora de tancar i d'obrir) i cadascun dels 6 mons per separat.
   - Exposar també els controls d'horari automàtic a la vista `Xat` (`pintaXCfg`).
5. **Proves i documentació**:
   - `motor/prova-control-sql.js` (PGlite) i `motor/prova-control.js` (Playwright), afegides a `.github/workflows/revisa.yml`.
   - Actualitzar `CHANGELOG.md`, `README.md`, `docs/ESTAT.md` i `docs/ARQUITECTURA.md` (versió `2.17.0`).
