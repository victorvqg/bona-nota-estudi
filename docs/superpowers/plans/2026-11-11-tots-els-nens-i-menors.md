# Pla n2537 · Tots els nens al filtre superior de l'admin, paginació del registre i punts menors de SQL

1. **Admin (`admin/index.html`)**:
   - Carregar `bn_admin_logs` paginant en blocs de 1.000 files (`?limit=1000&offset=…`) fins a cobrir tot el període seleccionat (evitant el tall de 1.000 files de PostgREST).
   - Poblar `NOMS_TOTS` des de `bn_admin_ids` (i `demoNoms()` en mode demo) i fer servir `nomsTots()` a `pintaFiltres()`, `xNoms()` i `nomDe()` perquè `#fNen` mostri sempre tots els nens.
2. **SQL (`supabase/`)**:
   - `bn_ids_i_punts.sql`: `bn_admin_ids` fa `FULL JOIN` entre `bn_priv.perfils` i `public.bn_log` excloent `nom_prohibit` i `'_alta'`.
   - `bn_copies.sql`: incloure `xat_frases`, `xat_peces`, `xat_msg`, `xat_vots` i `xat_silenci` a `bn_priv.fes_copia` i `bn_admin_copia_restaura`.
   - `bn_pin_nou.sql` i `bn_admin_usuari.sql`: en `bn_admin_usuari(..., 'canvia', ...)` actualitzar `xat_msg` (autor i company), `xat_vots` i `xat_silenci`.
   - `bn_admin_tauler.sql`: acotar les regex de segons a `^[0-9]{1,7}$` abans de fer `::int`.
   - `bn_admin_fonts_rep.sql`: afegir l'índex `bn_log_nom_assig_ts`.
3. **Proves (`motor/prova-admin-alta.js` i `motor/prova-xat-sql.js`)**, `CHANGELOG.md` (`2.19.0`), `README.md` i regeneració amb `python3 motor/tot.py`.
