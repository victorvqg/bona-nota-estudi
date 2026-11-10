# Revisió del tauler d'admin · fase A (n2536) i «Cal tocar el motor?» (n2537)

Data: 2026-11-10 · Versió de la web: 2.11.0

La n2536 no s'havia arribat a escriure. Aquesta fase A la fa la n2537: què ensenya avui el tauler, què li falta i, per a cada millora, si es pot fer només amb SQL nou i `admin/index.html` o si cal tocar el motor. És un document: no hi ha cap canvi de codi. La fase B seran els PR, en l'ordre de l'apartat 5.

**Regla:** no es toca el motor (`motor/plantilla-estudi-interactiu.html` ni `motor/build.py`) si les dades ja hi són.

## 1. Què ensenya avui

| Vista | Què hi surt | D'on surt |
| --- | --- | --- |
| Tauler | Resum (nens actius, dies, temps, notes, aprovats, encert, exàmens, segons per pregunta i volum), alertes, activitat per dia, quan estudien, evolució de les notes, constància, repàs/boss/missions, obertes sospitoses, domini per tema, preguntes més fallades i errors del Taller de mates | `bn_admin_resum`, `_activitat`, `_calor`, `_domini`, `_fallades`, `_evolucio`, `_alertes` i `bn_admin_errors_taller` (ja agregat al servidor). Repàs/boss/missions i obertes es calculen al navegador amb `bn_admin_logs` |
| Nens → fitxa | Estrelles, temps, tests, jocs, millor examen, aparells, assignatures, d'on surten les estrelles, sessions, i la zona perillosa (nom, amagar, PIN, esborrar) | Només el registre del període (`bn_admin_logs`, fins a 365 dies i 20.000 files, al navegador) i `bn_admin_usuari 'estat'` |
| Sessions, Log complet | El registre, agrupat o cru | `bn_admin_logs` |
| Xat | Moderació, silencis, configuració, catàleg i resum d'avui | `bn_admin_xat_*` |
| Còpies de seguretat | Llista, fer, baixar, restaurar i esborrar | `bn_admin_copia*` |

## 2. Què li falta

1. **La fitxa no veu l'estat real del nen.** Només sap el que ha passat dins del període triat. No veu els temes aprovats, els errors pendents de repàs, el boss, les obertes ni els exàmens de sempre, encara que tot això és al núvol.
2. **No sap qui és nou.** No hi ha cap xifra d'altes: quan va aparèixer cada nen, quan va crear el PIN i quan va triar el perfil.
3. **No ensenya nivells.** Les regles (nivells, aprovat, premis) només són a la plantilla.
4. **Els combos i el repàs només es veuen com a total acumulat.** No es pot saber quants en fa cada dia, ni si el triple combo (2.9.0) o el super combo (2.10.0) funcionen.
5. **No se sap on s'encallen els nens nous** (escriure el nom, crear el PIN, equivocar-se de PIN, triar el perfil). Avui no es registra.
6. **Les regles estan copiades a mà fora de la plantilla:** l'aprovat (70) al SQL del tauler i a l'admin, i els llindars de nivell a la portada i al SQL del xat. Si un dia canvien a la plantilla, aquestes còpies es desquadren sense que ningú se n'adoni.

## 3. Millores proposades

- **M1 · Fitxa amb l'estat real.** Per a cada món: temes amb els intents i les fallades per pregunta, errors pendents de repàs (i quan toquen), obertes, exàmens, dies d'estudi, boss i les fonts de les estrelles. Els nens sense PIN no tenen estat al núvol: per a ells, com ara, només el registre.
- **M2 · Altes.** Nens nous per període: primer registre, PIN creat i perfil triat.
- **M3 · Historial de combos i repàs.** Estrelles de combo, triple combo, super combo i repàs per dia i per nen.
- **M4 · Errors pendents de repàs de la colla.** Quins temes acumulen més errors pendents entre tots els nens (on cal reforçar).
- **M5 · Nivells al tauler.** El nivell de cada nen (al rànquing, a la fitxa i per món) amb els mateixos llindars que el joc.
- **M6 · Regles en un sol lloc comprovat.** `motor/regles.json` (i una còpia a `admin/`) generat a partir de les constants de la plantilla, i una prova que falli si qualsevol còpia no quadra.
- **M8 · Benestar** (afegida per la n2540, a partir de [`docs/BON-US.md`](../../BON-US.md)). Apartat «Benestar» al Tauler: una fila per nen amb un semàfor (verd, groc, vermell) i el motiu en paraules planeres; la vigília d'examen (pic del grup o data de l'admin) fa sortir les sessions llargues en blau; una casella per posar la data de l'examen de cada món.
- **M7 · Embut d'alta (event «alta»).** Veure on s'encallen els nens nous. Mai el PIN ni cap dada personal. Aprovat només per a la portada i el perfil (apartat 7).

## 4. Cal tocar el motor?

| Millora | D'on surten les dades | SQL nou | Canvi al motor (no / sí: quin) | Risc |
| --- | --- | --- | --- | --- |
| **M1** Fitxa amb l'estat real | `bn_priv.progres.estat`: l'estat sencer de cada nen i món (`temes` amb `intents` i `fallades`, `rep`, `est`, `ob`, `obv`, `examens`, `dies`, `boss`, `apresos`, `fonts`, `ftema`, `fjoc`, `jocs`, `punts`, `mod`, `reinici`), més `mod` i `ts`. Sense PIN: només `bn_log` | `bn_admin_fitxa(p_email, p_pass, p_nom)`: `security definer`, `set search_path = ''`, `bn_priv.admin_ok`. Torna, per món, només les claus que es pinten (no l'estat sencer: pot fer fins a 300 KB per món) i `mod`/`ts` | **No.** Les dades ja hi són | Baix: només lectura i només per a l'admin. Cal retallar la resposta (mida). Un nen que no ha jugat mai amb PIN no hi és: la fitxa ho ha de dir, no posar zeros. Fins que hi hagi M6, «aprovat» fa servir el 70 copiat (com ja fa el tauler) |
| **M2** Altes | `min(ts)` de `bn_log` per `lower(trim(nom))` (índex `bn_log_nom`); `bn_priv.perfils.pin_ts`, `aspecte_ts` i `ts`, si existeix (vegeu l'apartat 6); l'`id` del perfil dona l'ordre d'alta. **No** `detall.nou` de «entra», que vol dir «nou en aquell aparell» | `bn_admin_altes(p_email, p_pass, p_periode)`: per nen, primer registre, PIN i perfil, amb el mateix estil. Columna nova `bn_priv.perfils.creat` en **dos passos** (`add column if not exists creat timestamptz` i després `alter column creat set default now()`): si es fa en un sol pas amb `default now()`, Postgres posa la data d'avui a tots els perfils vells. Si `perfils.ts` existeix, un bloc `do` l'hi copia (`creat = ts` on `creat is null`); si no, els vells queden buits i la data d'alta és `coalesce(creat, primer registre)` | **No** | Baix. `pin_ts` canvia quan es canvia el PIN (no és «creat»). Un nen esborrat i tornat a crear compta com a nou. La columna `creat` no canvia res del que fan els nens (la posa el servidor sol en crear el perfil) |
| **M3** Historial de combos i repàs | Diferències de `detall.fonts` entre registres consecutius del mateix nen i món: només els events `entra` i `temps` porten `fonts` (claus `combo`, `triple`, `super`, `repas`, `missio`, `boss`, `record`, `temes`, `jocs`, `examen` i `obertes`). `S.est` no serveix: només guarda avui | `bn_admin_fonts_dia(p_email, p_pass, p_periode, p_assig, p_nom)`: `lag()` per nen i món, `greatest(0, diferència)`, agrupat per dia de Madrid | **No** | Mitjà-baix. La granularitat és la sessió, no el moment exacte. Un reinici o un aparell vell pot fer baixar `fonts`: cal tallar la sèrie als reinicis (`bn_priv.reinicis`) i no comptar mai negatius. Abans de la 2.9.0 i la 2.10.0 no hi ha `triple` ni `super` |
| **M4** Errors pendents de la colla | `estat.rep` de `bn_priv.progres` (`{tid, q, c, prox}` per error) | `bn_admin_rep_pendents(p_email, p_pass, p_assig)`: compta per tema i per pregunta, i quants toquen avui | **No** | Baix. Només nens amb PIN. `rep` és l'estat d'ara, no un historial |
| **M5** Nivells al tauler | Les estrelles ja hi són (`bn_log`, `progres`). Falten els llindars, que només són a `NIVELLS` de la plantilla | Cap | **Sí, indirectament:** l'admin llegirà `admin/regles.json`, que fa M6. Sense M6 caldria copiar `NIVELLS` a l'admin (una còpia més) | Baix, un cop hi hagi M6. Va **després** del PR del motor |
| **M6** Regles en un sol lloc | Constants de la plantilla: `NIVELLS`, `COM_GUANYAR`, `SUPER_PREMIS`/`SUPER_MAX`, `OB_COMBO_*`, `APROVA`, `REP_PREMI`/`REP_MAX` | Cap (el SQL no pot llegir un JSON del repo). La prova sí que comprova les còpies de `bn_admin_tauler.sql` (70) i de `bn_xat.sql` (llindars) | **Sí: `motor/tot.py` (o `build.py`, una sola vegada).** Extreu les constants de la plantilla i escriu `motor/regles.json` i `admin/regles.json`. La plantilla **no canvia** i continua sent l'única font. Una prova nova a l'Action falla si el JSON, la portada (`NIV`), l'admin o el SQL no quadren | Mitjà-baix. El joc ha de quedar exactament igual: les pàgines només canvien per la regeneració. Si algú canvia el format d'una constant, l'extractor ho detecta (la prova falla). Obliga a regenerar els 6 mons, pujar versió i passar totes les proves |
| **M8** Benestar (n2540) | `bn_log`: events `temps` (minuts i blocs seguits, per aparell), `entra` (hora de Madrid), `test` (`q`, `pc`, `est`), `valora` («Costa»), `oberta.enganxat` i `joc = repas` (`apr`); `bn_priv.xat_msg` (si hi és); el primer registre de cada món (dia 0) | `supabase/bn_admin_benestar.sql`: `bn_admin_benestar(p_email, p_pass, p_periode, p_nom)`, la taula `bn_priv.examens(assig, data)` i `bn_admin_examen_desa` | **No.** Les dades ja hi són. El descans (fet o saltat), el botó «Demà tinc examen», `bn_vigilia`, la franja de nit i el pla de 10 dies sí que són del motor (PR C-G de BON-US) i en queden fora | Mitjà-baix. Els llindars són inicials i s'han d'ajustar amb dades. El temps es compta per aparell (dos aparells alhora = minuts doblats: el tauler ho avisa). El pic del grup pot fallar amb pocs nens o en mons molt nous (per això només compta del dia 3 al 12 i la data de l'admin hi mana) |
| **M7** Embut d'alta (**aprovat amb límits**, vegeu l'apartat 7) | No existeixen. Caldria registrar els passos: nom escrit, PIN creat, PIN equivocat, perfil triat i «ara no» al PIN nou | Ampliar el `check` d'`event` de `public.bn_log` amb `alta`, i `bn_admin_alta_embut(p_email, p_pass, p_periode)` | **No a la plantilla ni a `build.py`** (l'entrada és a la portada), però **sí a `index.html` i `perfil/index.html`**, que és codi que fan servir tots els nens. **No** s'hi afegeix la `benvinguda()` dels mons (decisió de l'apartat 7) | Mitjà. Mai el PIN, ni un tros del PIN, ni cap dada personal: només el pas i el resultat. L'`assig` de l'event (`portada`) no ha de sortir al rànquing (no porta `punts`) ni als filtres del tauler. Avui la portada no escriu al registre, i caldrà afegir-hi el camí |

**En resum:** M1–M4, M7 i M8 no toquen el motor. M5 en depèn indirectament. Només M6 toca el motor, i només `tot.py`/`build.py`, no la plantilla.

## 5. Ordre dels PR

1. **Tauler, només SQL + `admin/index.html`** (un o dos PR): M1 i M2 primer, després M3 i M4. Cada PR porta el seu SQL idempotent a `supabase/` i la seva prova (`motor/prova-xat-sql.js` mostra com provar SQL amb PGlite).
1b. **Benestar (M8, n2540)**, després de M1 i M2: SQL + `admin/index.html`.
2. **Motor, separat i al final:** M6. `python3 motor/tot.py`, els 6 mons regenerats, versió nova, totes les proves (`bnProva…` i `ESTRICTE=1`) i la prova nova de regles. Mai barrejat amb els PR del tauler.
3. **Tauler, després del motor:** M5 (nivells), llegint `admin/regles.json`.
4. **M7** (aprovat amb els límits de l'apartat 7), en un PR propi: portada, perfil i SQL. Va l'últim perquè toca codi que fan servir tots els nens.

## 6. Punts de partida comprovats

| Punt | Resultat | On |
| --- | --- | --- |
| `bn_priv.progres(k, assig, estat, mod, ts)` guarda l'estat sencer | ✅ És l'objecte `S` del món. A més de les claus de l'encàrrec, hi ha `jocs`, `boss`, `apresos`, `obv`, `temps`, `ultim`, `id`, `mod` i `reinici` | `supabase/bn_progres_no_baixa.sql` (insert), plantilla `BUIT()` (l. 541) |
| `temes` porta intents i fallades | ✅ `intents: [{d, pc}]` i `fallades: {pregunta: vegades}` | plantilla, `intents.push({d:avui(),pc})` i `fallades[q]+1` |
| El tauler no llegeix mai `progres` | ✅ Cap referència a `bn_admin_tauler.sql` ni a `admin/index.html` | — |
| Els nens sense PIN no hi són | ✅ `bn_progres_desa` demana `pin_ok` | `supabase/bn_progres_no_baixa.sql` |
| `detall.nou` de «entra» vol dir «nou en aquell aparell» | ✅ `nou: !k`, on `k` és el perfil local de l'aparell. El tauler no el fa servir | plantilla `entra()` (l. 596) |
| `bn_priv.perfils.ts` | ⚠️ **No es pot comprovar al repo:** la taula es va crear amb una migració que no hi és, i cap SQL del repo fa servir `ts`. Sí que hi ha `k`, `nom`, `pin`, `pin_v`, `pin_ts`, `id` (identity), `aspecte` i `aspecte_ts`. `pin_ts` només es posa amb el PIN nou (en crear-lo o canviar-lo) | `bn_pin_nou.sql`, `bn_ids_i_punts.sql`, `bn_aspecte.sql` |
| `S.est` només guarda avui | ✅ `diaEst()` el buida quan el dia canvia | plantilla l. 1128 |
| L'historial ha de sortir de `fonts` | ✅ Només `entra` i `temps` porten `fonts`. Des de la 2.8.0, `test`, `joc`, `examen` i `oberta` porten `est` (estrelles de l'activitat), però no diuen de quina font | plantilla l. 583, 596 i `detallLog()` (l. 578) |
| Les regles només són a la plantilla | ✅ `NIVELLS` (l. 601), `COM_GUANYAR` (l. 628), `SUPER_PREMIS`/`SUPER_MAX` (l. 633), `OB_COMBO_*` (l. 1169), `APROVA` (l. 1598) i `REP_PREMI`/`REP_MAX` (l. 1609). Cap a l'admin ni a `build.py`. **Però n'hi ha còpies a mà:** `NIV` a `index.html`, els llindars a `bn_xat.sql` (`xat_niv`) i el 70 a `bn_admin_tauler.sql` i a l'admin | — |
| `build.py` ja sap injectar dades generades | ✅ Ja ho fa amb `MONS`, `QIDS` i `QDIF`. Per a les regles el sentit és l'invers (de la plantilla al JSON) i n'hi ha prou de fer-ho una vegada a `tot.py` | `motor/build.py` |

**Per comprovar a producció abans de M2** (no ho pot fer cap agent: `nucli.json` li prohibeix les eines de Supabase). A l'editor SQL:

```sql
select column_name, data_type from information_schema.columns
where table_schema = 'bn_priv' and table_name = 'perfils' order by ordinal_position;
```

## 7. Decisions preses

En Víctor va delegar aquestes dues decisions a l'agent (10/11/2026).

1. **M7 s'aprova, però només a la portada i al perfil, sense tocar la plantilla.**
   - Per què: per entrar a un món des de la portada cal haver escrit el nom primer, de manera que gairebé tots els nens nous passen per la portada. Afegir la `benvinguda()` dels mons obligaria a tocar el motor (regenerar els 6 mons i pujar versió) per a uns pocs casos (enllaços directes). A més, aquests casos ja es poden estimar sense registrar res: nens el primer registre dels quals és un `entra` d'un món sense cap `alta` abans. Si les dades diuen que són molts, es replanteja.
   - Límits:
     - Mai el PIN, ni un tros, ni la seva llargada. Només el pas (`nom`, `pin_creat`, `pin_ko`, `perfil`, `pin_ara_no`) i si ha anat bé.
     - Abans que el nen tingui perfil, no s'apunta el nom que ha escrit (podria ser el d'un nen que no s'acaba registrant, o una paraula que el filtre rebutja). Aquests passos es compten per aparell, amb un nom tècnic fix que el rànquing i les llistes del tauler excloguin.
     - L'event no porta `punts`, i per tant no pot sortir com a món al rànquing.
     - Va en un PR propi, l'últim.
2. **Sí a la columna `creat`, i s'aprofita `perfils.ts` si existeix.** Així no cal saber abans si `ts` hi és: el SQL afegeix `creat` en dos passos (els perfils vells no prenen la data d'avui) i, si `ts` existeix, li'n copia el valor. La consulta de l'apartat 6 serveix per saber si les altes velles tindran data o si es farà servir el primer registre.
