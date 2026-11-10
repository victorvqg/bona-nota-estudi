# Pla · Issue #33 · El bloqueig de 5 PIN dolents (2 PR seqüencials)

## Context
A Supabase, les funcions `bn_aspecte_desa`, `bn_progres_desa`, `bn_progres_llegeix` i `bn_perfil_canvia_pin` criden `bn_priv.pin_ok(p_nom, p_pin)` i, si torna `false`, fan `raise exception 'pin incorrecte'`. Com que PostgreSQL executa tota la funció dins d'una mateixa transacció, el `raise` desfà l'`insert/update` sobre `bn_priv.intents` que havia fet `pin_ok`. Per tant, el comptador d'intents fallits sempre queda a 0 i el bloqueig de 5 intents en 15 minuts no s'activa mai en aquestes quatre funcions (`docs/TRAMPES.md`).

Com que el desplegament de GitHub Pages i l'aplicació del SQL no són atòmics, cal fer-ho en **dos passos (2 PR)**:

## Pas 1 (PR 1 · branca `issue/33-clients-pin-codi`)
1. Actualitzar `rpcP` a `index.html` i `perfil/index.html`, i `rpc` a `motor/plantilla-estudi-interactiu.html`, perquè tractin com a error `"pin"` tant l'antic HTTP 400 `'pin incorrecte'` com les respostes normals sense excepció:
   - `"pin"` (text)
   - `{"ok":false,"codi":"pin"}` o qualsevol objecte amb `codi === "pin"`
   - `-3` a `bn_progres_desa`
   I com a `"bloc"` tant l'HTTP 400 `'massa intents'` com `"bloc"` o `codi === "bloc"`.
2. Regenerar els 6 mons amb `python3 motor/tot.py` (versió `2.17.1`).
3. Ampliar `motor/prova-perfil.js` i `motor/prova-nuvol.js` per comprovar que tant l'HTTP 400 com el codi JSON/text/`-3` es tracten com a PIN incorrecte.

## Pas 2 (PR 2 · branca `issue/33-sql-pin-codi`)
1. Actualitzar els fitxers SQL (`supabase/bn_aspecte.sql`, `supabase/bn_pin_nou.sql`, `supabase/bn_progres_no_baixa.sql`, `supabase/bn_admin_reinicia.sql`, `supabase/bn_perfils_pin.sql`, `supabase/bn_reconstrueix.sql`) perquè, quan `bn_priv.pin_ok` torna `false`, **no facin `raise`** sinó que retornin un valor normal (`'pin'`, `-3` o `jsonb_build_object('ok', false, 'codi', 'pin')`), conservant la transacció i el comptador `bn_priv.intents` (el `raise exception 'massa intents'` dins de `pin_ok` quan `n >= 5` sí que ha de continuar avortant quan ja hi ha 5 intents desats).
2. Afegir `motor/prova-pin-intents-sql.js` (PGlite) i registrar-la a `.github/workflows/revisa.yml` per verificar que 5 intents fallits a qualsevol de les 4 funcions persisteixen a `bn_priv.intents` i el 6è intent respon `'massa intents'`, i que un PIN correcte abans del 5è reinicia el comptador.
3. Aplicar la migració a Supabase (`agippwtqvhpxdockuigl`) un cop el PR 1 ja estigui publicat a `main`.
