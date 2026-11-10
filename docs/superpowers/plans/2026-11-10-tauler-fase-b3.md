# Pla n2537 · fase B · pas 3: regles en un sol lloc (M6)

Revisió: `docs/superpowers/specs/2026-11-10-revisio-tauler.md` (M6). Branca `n2537-b3-regles` des de `main` (amb #32 fusionat). Commits `tipus(àmbit): què (n2537)`.
PR del motor, separat de la resta de millores del tauler. **La plantilla (`motor/plantilla-estudi-interactiu.html`) no canvia** i continua sent l'única font de veritat; el joc funciona exactament igual.
Versió: 2.15.0 (nou artefacte generat `motor/regles.json` i `admin/regles.json` + prova de coherència).

## 1. Extracció a `motor/tot.py` (`motor/regles.json` i `admin/regles.json`)
- Pas `3b2` a `motor/tot.py`: llegeix `motor/plantilla-estudi-interactiu.html`, n'extreu les declaracions de les constants de regles i les avalua amb Node:
  - `NIVELLS` (llindars d'estrelles, nom i icona dels 10 nivells)
  - `COM_GUANYAR` (resum dels premis d'estrelles)
  - `SUPER_PREMIS` i `SUPER_MAX` (super combo de preguntes difícils)
  - `OB_COMBO_PC`, `OB_COMBO_PREMIS`, `OB_COMBO_MAX` i `OB_PARAULES_IDEA` (triple combo i preguntes obertes)
  - `APROVA` (nota d'aprovat, 70)
  - `REP_PREMI` i `REP_MAX` (premi i topall diari del repàs d'errors)
- Si alguna constant falta o canvia de format i no es pot extreure, `tot.py` s'atura amb un error clar.
- Escriu el mateix JSON canònic a `motor/regles.json` i `admin/regles.json`.

## 2. Prova de coherència (`motor/prova-regles.js`) i GitHub Action (`.github/workflows/revisa.yml`)
- `motor/prova-regles.js` comprova sense cap dependència externa:
  1. `motor/regles.json` i `admin/regles.json` existeixen, són JSON vàlid i són idèntics.
  2. Totes les claus de `regles.json` coincideixen exactament amb les constants de `motor/plantilla-estudi-interactiu.html`.
  3. `NIV` a `index.html` i a `perfil/index.html` coincideix amb `NIVELLS` de `regles.json`, i `XNIV` a `admin/index.html` coincideix amb els noms de `NIVELLS`.
  4. Els llindars de nivell de `bn_priv.xat_niv` a `supabase/bn_xat.sql` (`unnest(array[...])`) coincideixen amb els llindars `NIVELLS.map(x => x[0])`.
  5. El llindar d'aprovat `APROVA` (70) coincideix amb:
     - el filtre de temes aprovats a `index.html` (`>=70`);
     - `supabase/bn_admin_tauler.sql` (`(detall->>'pc')::int >= 70` a `bn_admin_resum` i `< 70` a les dues alertes de `bn_admin_alertes`);
     - `admin/index.html` (`const APROVAT=70`, `bandPc`, `tDomini` i el mode DEMO d'aprovats i alertes).
- S'afegeix el pas «Prova que les regles copiades coincideixen amb la plantilla» (`node motor/prova-regles.js`) a `.github/workflows/revisa.yml`.

## 3. Regeneració i documentació
- S'actualitzen `CHANGELOG.md` (2.15.0), `README.md`, `docs/ARQUITECTURA.md` i `docs/ESTAT.md`.
- S'executa `python3 motor/tot.py` per generar `motor/regles.json`, `admin/regles.json` i regenerar els 6 mons, portada, perfil, admin, `versio.json` i `sw.js`.
- Es passen totes les proves (`node motor/prova-regles.js`, `node motor/prova-generadors.js` i `ESTRICTE=1 node motor/prova.js` per als 6 mons) i els checks de `nucli ship`.
