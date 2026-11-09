# Convencions

Com s'escriu el codi i com es treballa en aquest repo. Una regla per línia, amb el motiu si no és evident.

- Mai s'edita a mà cap pàgina generada (`<assignatura>/<tema>/index.html`, `admin/preguntes.json`, `sw.js` ni el bloc `MONS:INICI..FI` d'`index.html`). Qualsevol canvi es fa a `motor/` i es regenera amb `python3 motor/tot.py`.
- Després de tocar `motor/`, `index.html` o `sprites.js`, cal executar sempre `python3 motor/tot.py` abans del commit perquè el check de CI (`git diff --quiet`) i `nucli ship run generat` passin en verd.
- Contingut fidel als apunts i llibres de 1r d'ESO: mínim 8 preguntes de test per tema, 3 opcions amb una sola correcta, distractors basats en errors típics i llargada equilibrada de les opcions.
- Commits en català seguint Conventional Commits (`tipus(àmbit): descripció (gN)`), validats pel hook `commit-msg` de `nucli`. Les tasques i blocs executats per Gemini es numeren sempre amb la lletra `g` (`g1`, `g2`, `g3`…) en tot el projecte.
- Els canvis de base de dades es desen sempre com a fitxer SQL idempotent a `supabase/*.sql` i s'apliquen al projecte Supabase `agippwtqvhpxdockuigl`.
- Versions `MAJOR.MENOR.PEDAÇ`: si un canvi el notarà qui fa servir l'app, el mateix PR afegeix l'entrada a `CHANGELOG.md` , canvia el número a la capçalera del README i regenera amb `python3 motor/tot.py`, que el posa al peu de la web (món, joc o funció nova: MENOR; correcció o ajust de contingut: PEDAÇ; canvi gran o que obliga a migrar el progrés: MAJOR; només docs o proves: no puja). Després de fusionar, s'etiqueta el commit de `main` amb `vX.Y.Z`. `versio.json` i el `VERSIO` de `sw.js` són empremtes de memòria cau, no versions.
