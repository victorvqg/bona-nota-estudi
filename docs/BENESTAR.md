# 💚 Benestar: com es llegeix al tauler

Aquest document explica l'apartat **Benestar** del tauler d'admin (versions **2.13.0 → 2.21.0**): què hi surt, què vol dir cada color i cada senyal, com es detecta la vigília d'examen, com es posa la data de l'examen i on és cada cosa al codi.

Completa els altres documents de regles:

| Document | Pregunta que respon |
|---|---|
| [`AVALUACIO.md`](AVALUACIO.md) | Què sap el nen? |
| [`PUNTUACIO.md`](PUNTUACIO.md) | Com es premia l'esforç? |
| [`BON-US.md`](BON-US.md) | L'ús és sa? (les regles) |
| [`XAT.md`](XAT.md) | Com es parlen els nens? |
| **`BENESTAR.md`** (aquest) | Com ho porta cada nen? (el que veu el pare al tauler) |

## 1. La idea en tres frases

1. Per a cada nen, una fila amb un semàfor (verd, groc o vermell) i el motiu en paraules planeres: «Diumenge va estudiar 1 h 50 min seguides», «Va entrar 2 nits després de les 21:30».
2. El dia abans d'un examen és normal estudiar molt: aquells dies, les sessions llargues surten en **blau** («vigília») i no en vermell.
3. Els números són una ajuda per parlar-ne amb el nen, no un diagnòstic: els llindars són inicials i s'ajustaran amb les dades.

## 2. Què veus al tauler

A **admin → Nens → Benestar** (`?v=nens&tab=benestar`), amb el període de la capçalera (avui, 7 dies, 30 dies, curs) i els filtres locals de món i nen (i també de manera individual a **Fitxa del nen → Sessions i benestar**):

- **Una fila per nen**, ordenades de pitjor a millor. El nom obre la fitxa del nen.
- **El semàfor** és el pitjor senyal de vigilar que té el nen en el període:

| Color | Vol dir |
|---|---|
| 🟢 Verd | Res a vigilar. Hi poden sortir senyals bons (poc i sovint, aprèn dels errors). |
| 🟡 Groc | Un senyal per vigilar (per exemple, una nit tard o molta pressa). |
| 🔴 Vermell | Cal parlar-ne: marató (massa estona seguida o al dia) o 2 nits tard o més. |
| 🔵 Blau | Estudi llarg la vigília d'un examen. És normal i **no compta com a vermell**. |
| ⚪ Gris | Context: per exemple, «fa servir dos aparells alhora». |

- **Per món:** la fase (novetat, aprendre, vigília, després), el dia que va començar, el «dia normal» (minuts que hi fa el grup en un dia corrent), les vigílies detectades i una casella per posar la data de l'examen.
- **Un avís fix:** el temps es compta per aparell (vegeu l'apartat 6).
- **La llegenda i els llindars inicials**, en un desplegable a sota.

## 3. Els senyals, un per un

Tots surten del registre d'activitat (`bn_log`) i, el del xat, dels missatges del xat. Cap no necessita res de nou a l'app dels nens.

| Senyal | Què vol dir | Com es calcula | Llindar inicial | Color |
|---|---|---|---|---|
| **Marató** | Massa estona seguida, o massa estona en un dia | Minuts seguits sense una pausa de 5 min, i minuts del dia | Més de 60 seguits o més de 90 al dia; **+30 en dissabte i diumenge**; a la vigília, 120 | 🔴 (🔵 a la vigília) |
| **Nit** | Entra tard | Hora d'entrada, a l'hora de Catalunya. Una entrada entre les 0:00 i les 6:00 compta com la nit d'abans | A partir de les 21:30 (22:00 a la vigília) | 🟡 (🔴 si són 2 nits o més) |
| **Pressa** | Respon sense llegir | Segons per pregunta i encert dels tests | Menys de 3 s per pregunta i encert per sota del 50 % (mínim 10 respostes) | 🟡 |
| **Repetir sense aprendre** | Repeteix el mateix test sense guanyar res | Tests del mateix tema el mateix dia sense estrelles noves | 4 o més | 🟡 |
| **Frustració** | Li costa i ho passa malament | Suspesos seguits d'un tema, o valoració «Costa» | 3 suspesos seguits, o 2 «Costa» | 🟡 |
| **Enganxa text** | Intenta enganxar text a les preguntes obertes | Camp `enganxat` de les obertes | Qualsevol cas | 🟡 |
| **Entra per xatejar** | Xateja molt i estudia poc | Frases del xat i minuts d'estudi dels últims 7 dies | 10 frases o més i menys de 60 min d'estudi | 🟡 |
| **Deixa de venir** | Fa dies que no entra | Com l'alerta «inactiu» del tauler | Com ara | 🟡 |
| **Salta el descans** | S'ajorna repetidament la pausa de 25 min | Events `descans` amb `accio = 'salta'` seguits en una sessió | 2 o més seguits (3 a la vigília) | 🟡 |
| **Poc i sovint** | Estudia en sessions curtes i en dies diferents | Dies amb 10-40 min en els últims 7 dies | 3 dies o més | 🟢 bo |
| **Aprèn dels errors** | Corregeix i aprèn els errors al repàs | Errors apresos aquesta setmana contra la setmana passada | Aquesta setmana més que la passada | 🟢 bo |
| **Fa el descans** | Completa les pauses de 5 min quan toca | Descansos `fet` respecte al total de `descans` del període | Almenys 2 fets i 2 de cada 3 o més | 🟢 bo |
| **Demà tinc examen** | El nen ha premut el botó dins del món | Events `examen_dema` per nen i món (màxim 2 dies) | Fins a 2 dies per món | ⚪ context |
| **Dos aparells** | Els minuts poden sortir doblats | Registres de temps de dos aparells que se solapen el mateix dia | Qualsevol cas | ⚪ context |

**Finestres fixes.** «Poc i sovint», «aprèn dels errors», «entra per xatejar» i «deixa de venir» sempre miren els seus dies (els últims 7, o com l'alerta), triïs el període que triïs. La resta segueixen el període de la capçalera.

## 4. Fases del món i vigília d'examen

El dia abans d'un examen tothom estudia més, i ha de poder fer-ho. Per això el tauler sap en quina fase és cada món ([`BON-US.md`](BON-US.md), apartat 2):

| Fase | Quan |
|---|---|
| Novetat | Dies 0 a 2 del món. El dia 0 és el del primer registre d'aquell món, de qualsevol nen. |
| Aprendre | Des del dia 3 fins a la vigília. |
| Vigília | El dia abans de l'examen. |
| Després | L'endemà de la vigília, o a partir del dia 12 del món. |

**Com se sap que és vigília.** Mana la primera de les fonts que doni resposta:

1. **La data de l'examen que posa l'admin.** La vigília és el dia abans. Si hi ha data, ni el pic del grup ni el botó del nen es miren per a aquell món (i la data compta encara que caigui fora dels dies 3-12).
2. **El botó «Demà tinc examen» del nen** (vigília individual per a aquell nen i món, fins als 2 primers dies marcats dins dels 12 primers dies del món).
3. **El pic del grup.** Un dia entre el 3 i el 12 del món en què hi han estudiat **5 nens o més, o la meitat dels nens del món**, i entre tots hi han fet **el triple de minuts d'un dia normal** (la mediana dels altres dies amb activitat del món). Exemple real: a Comarques, un dia normal són 1-3 nens i 8-53 minuts; el 9 de novembre hi van entrar 9 nens i hi van fer 204 minuts.

Els dies de vigília, la marató surt en **blau** amb el llindar de 120 minuts, i la nit comença a les 22:00.

## 5. Com posar la data d'un examen

1. A **Nens → Benestar**, a la targeta del món, escriu la data a la casella «Data de l'examen» i prem **Desa** (o Retorn).
2. Per esborrar-la, prem la paperera o buida la casella: el tauler demana confirmació.
3. Des d'aquell moment, la vigília del món és el dia abans d'aquesta data, i el semàfor de tots els nens es torna a calcular.

## 6. Què cal tenir present

- **El temps es compta per aparell.** Cada aparell envia els seus minuts. Si un nen fa servir el mòbil i l'ordinador alhora, els minuts poden sortir doblats: el tauler ho avisa amb el senyal gris «dos aparells».
- **Els llindars són ajustables des del tauler.** Els valors inicials són els de [`BON-US.md`](BON-US.md), apartat 5, i des de la `2.37.0` tant la gravetat (`Malament`, `Avís`, `Informatiu` o `Desactivat`) com els números es poden ajustar i desar a Supabase des de **⚙ Configuració → Llindars** (`bn_priv.config`, clau `'llindars'`, llegida per `bn_admin_benestar` i `bn_admin_alertes`), o restaurar als valors per defecte amb un clic.
- **No és un diagnòstic.** Un vermell vol dir «parlem-ne», no «hi ha un problema». Una marató la vigília d'un examen és normal (blau).
- **Hores de Catalunya.** Els dies, les nits i els caps de setmana es compten a l'hora de Catalunya.
- **Període en dies sencers.** «7 dies» vol dir avui i els 6 dies d'abans, des de la mitjanit.
- **Nens amagats.** Hi surten igualment (és el tauler de l'admin, com les alertes).

## 7. Què fa l'app dels nens (des de 2.20.0–2.21.0)

Totes les peces de [`BON-US.md`](BON-US.md) (PR C a G, [ADR-0008](DECISIONS.md)) estan actives:

- Registra si el nen fa el descans (`fet`) o el salta (`salta`), i limita els salts a 2 (3 a la vigília).
- Inclou el botó «Demà tinc examen» dins del món (màxim 2 dies per món).
- Consulta la fase del món (`bn_vigilia`) per mostrar el pla de 10 dies i l'avís amable als 60/120 minuts.
- Aplica la franja de nit (`21:30` / `22:00`): avís d'anar a dormir, mode suau automàtic i xat tancat.
- Substitueix la pestanya «Temps» del rànquing de la portada per «Dies» («Dies d'estudi»).

## 8. Per a qui programa: on és cada cosa

| Cosa | On és |
|---|---|
| SQL | `supabase/bn_admin_benestar.sql` i `supabase/bn_bon_us.sql` |
| Senyals i fases | `public.bn_admin_benestar(correu, contrasenya, període, nom)` i `public.bn_vigilia(assig, neix)` |
| Dates d'examen | taula `bn_priv.examens(assig, data)` i `public.bn_admin_examen_desa(correu, contrasenya, assig, data)` |
| Pantalla | `admin/index.html`: `tBenestar()`, `pintaBenestar()`, `htmlBenestar()`, `rpcB()`; demo: `demoBenestarRpc()` |
| Proves | `motor/prova-admin-benestar-sql.js`, `motor/prova-bon-us-sql.js` (PGlite) i `motor/prova-admin-benestar.js` (Playwright) |

Codis de senyal a la resposta: `marato_bloc`, `marato_dia`, `nit`, `salta_descans`, `pressa` (porta `encert`), `repetir`, `frustracio_suspesos`, `frustracio_costa`, `enganxa`, `xat` (porta `minuts`), `inactiu`, `poc_sovint`, `apren_errors`, `fa_descans`, `examen_dema`, `dos_aparells`.

**Per canviar un llindar:** al SQL, a la capçalera hi ha la taula de codis; canvia el número a la funció, actualitza aquest document i [`BON-US.md`](BON-US.md), i torna a passar `node motor/prova-admin-benestar-sql.js`.

## 9. Diferències amb l'encàrrec i d'on ve

**Interpretacions** (decidides en programar-ho; es poden canviar):

- La nit compta fins a les 6:00: una entrada a la 1:00 és la nit d'abans.
- «Pic del grup» vol dir que 5 nens (o la meitat) han estudiat aquell dia i que els minuts de tot el grup són el triple de la mediana d'un dia normal.
- La data de l'examen mana encara que caigui fora dels dies 3-12.
- «Entra per xatejar»: 10 frases o més amb menys de 60 min d'estudi en 7 dies (BON-US no hi posava número).

**D'on ve.** Encàrrec n2540 (10 de novembre de 2026), PR B de [`BON-US.md`](BON-US.md) (apartat 7), dins de la revisió del tauler ([`docs/superpowers/specs/2026-11-10-revisio-tauler.md`](superpowers/specs/2026-11-10-revisio-tauler.md), M8).
