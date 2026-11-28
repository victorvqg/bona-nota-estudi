# Pla mestre · Gestió i recuperació de PIN perdut des de `/admin/`

28/11/2026 · Versió actual 2.79.3 · Especificació de millora per a `admin/index.html`, `supabase/`, `index.html`, `motor/plantilla-estudi-interactiu.html` i `perfil/index.html`.

**Estat:** decisions preses el 28/11/2026: les 5 recomanacions de la secció 5 aprovades. En execució: PR 1 (`g41`, Fases 1 + 2: SQL i `/admin/`) i PR 2 (`g42`, Fases 3 + 4: portada, mons i docs `2.80.0`).

**En poques línies.** Avui, quan un nen oblida el seu PIN, l'única eina a `/admin/` és **«Treu el PIN»** (`bn_admin_usuari(..., 'treupin')`), que esborra la fila de `bn_priv.perfils` i obliga el nen (o l'admin) a crear-ne un de nou des de la portada. Això té cinc problemes reals:
1. **Xoca amb el límit de 2 noms per aparell** (`index.html:1361`, `supabase/bn_max_2_noms.sql`): si s'intenta posar un PIN nou des del PC de l'admin o d'un aparell familiar on ja hi ha 2 comptes locals, la portada ho bloqueja.
2. **Esborra dades del perfil del nen:** `DELETE FROM bn_priv.perfils` elimina també l'`id` (`#N`), la data original d'alta (`creat`) i l'aspecte arcade desat al núvol (`aspecte` i `aspecte_ts`: animal, marc, títol, insígnia i complement).
3. **Obre una finestra d'usurpació:** entre el moment en què es treu el PIN i el moment en què el nen torna a entrar, el nom queda lliure (`bn_perfil_existeix` torna `false`) i qualsevol altre company podria crear-hi un PIN i quedar-se el progrés al núvol.
4. **No tanca el cercle amb la Bústia (`v2.79.3`):** `suggeriments/index.html` ja demana verificació i correu de la família per recuperar un PIN, però dins `/admin/` no hi ha cap eina per generar un PIN temporal/nou, copiar les instruccions o respondre directament al correu del tiquet.
5. **Els dispositius amb sessió antiga fallen en silenci:** si el nen tenia el PIN antic guardat a `localStorage.bn_pins`, el navegador continua enviant el PIN caducat sense avisar-lo clarament que n'ha de posar un de nou.

Proposo **4 fases** amb un nou espai centralitzat **«PINs»** dins `/admin/`, un flux de **PIN temporal d'un sol ús** (xifrat sempre amb `bcrypt`, mai en text pla a la BD ni als logs), conservació íntegra del perfil (`id`, `creat`, `aspecte`) i drecera directa des de la **Bústia**.

---

## 1. Com funciona ara (el codi)

| Peça | On | Comportament actual | Problema |
|---|---|---|---|
| **Treure el PIN** | `supabase/bn_pin_nou.sql:104-106`, `supabase/bn_admin_usuari.sql:46-48` | `DELETE FROM bn_priv.perfils WHERE k = kk; DELETE FROM bn_priv.intents WHERE k = kk;` | Esborra `id`, `creat`, `aspecte`, `aspecte_ts` i deixa el nom desprotegit fins que algú hi entri. |
| **Botó a l'admin** | `admin/index.html:1629, 1651-1653` | Només existeix a `Fitxa del nen → Núvol i gestió → Gestió del compte`. Desactivat si no té PIN. | No permet assignar ni generar un PIN nou des de `/admin/`, ni desbloquejar intents fallits. |
| **Entrada a la portada** | `index.html:1360-1373` | Comprova `nomsDispositiu()` (màx. 2 noms locals). Si `bn_perfil_existeix` és `false`, fa `bn_perfil_crea`. | Bloqueja l'admin o famílies amb >2 comptes al mateix dispositiu. |
| **Canvi forçat de PIN** | `index.html:1066-1078, 1375-1390`, `motor/plantilla-estudi-interactiu.html:1736-1755` | Ja existeix el modal `#npPop` (`demanaNouPin`) i `pantallaNouPin()` per migrar PINs antics de 4 xifres (`pin_v = 1`) a 4 xifres + 1 lletra (`pin_v = 2`). | Només salta per format vell (`PIN_VELL`), no quan un PIN és temporal assignat per l'admin. |
| **Bústia de privacitat** | `suggeriments/index.html:214-216`, `admin/index.html:5645-5683` | Demana nom, dispositiu habitual, últim món i correu obligatori de família/tutor. El panell lateral té `mailto:` genèric. | No té accés directe per generar un PIN ni plantilla de resposta amb les instruccions per a la família. |
| **Error de PIN dins un món** | `motor/plantilla-estudi-interactiu.html:1672-1679` | `nuvolPuja()` / `nuvolBaixa()` capturen l'error de `bn_progres_desa` (`-3`) / `bn_progres_llegeix` (`pin`) amb `.catch(()=>{})`. | El nen amb sessió vella oberta no rep cap avís visible que el seu PIN ha canviat. |

---

## 2. Proposta

### A · Base de dades: PIN temporal sense esborrar el perfil (`supabase/bn_pin_reset.sql`)

Un únic fitxer SQL **idempotent** (aplicable al projecte Supabase `agippwtqvhpxdockuigl` sense trencar clients antics):

1. **Nova columna a `bn_priv.perfils`:**
   - `pin_temp boolean not null default false` — marca si el PIN actual és un PIN temporal posat per l'admin i pendent de ser substituït pel nen.
   - Es reutilitza `pin_ts` (ja existent) per saber quan es va assignar o canviar per última vegada. Compatible 100 % amb `supabase/bn_copies.sql` (que fa `to_jsonb(x)` / `jsonb_populate_recordset`).

2. **Noves accions a `public.bn_admin_usuari(p_email, p_pass, p_nom, p_accio, p_nou)`:**
   - Autenticació via `bn_priv.admin_ok(p_email, p_pass)`.
   - **`posapin`** *(PIN temporal — per defecte)* i **`posapin_fix`** *(PIN definitiu, sense obligar canvi)*:
     - Normalitza `nn := upper(trim(coalesce(p_nou, '')))`.
     - Valida format obligatori `^[0-9]{4}[A-Z]$`, prohibeix el PIN d'exemple `'4587R'` i valida `not bn_priv.nom_prohibit(p_nom)`.
     - Fa un **`UPSERT` atòmic** a `bn_priv.perfils`:
       - Si el perfil **ja existeix**: només actualitza `pin = extensions.crypt(nn, extensions.gen_salt('bf'))`, `pin_v = 2`, `pin_ts = now()`, `pin_temp = (p_accio = 'posapin')`. **Manté intactes `id`, `creat`, `aspecte` i `aspecte_ts`.**
       - Si el perfil **no existia** (nen sense PIN o a qui se li havia tret abans): insereix la fila nova amb `pin_v = 2`, `pin_ts = now()`, `pin_temp = (p_accio = 'posapin')`.
     - Esborra automàticament qualsevol bloqueig d'intents fallits (`DELETE FROM bn_priv.intents WHERE k = kk`).
     - Retorna `1`.
   - **`desbloqueja`**:
     - Esborra `bn_priv.intents WHERE k = kk` sense tocar el PIN (per quan un nen només ha exhaurit els 5 intents i està bloquejat 15 minuts).
     - Retorna el nombre de files eliminades (`0` o `1`).
   - **Bit nou a `estat`:**
     - `+1` amagat · `+2` té PIN · `+4` PIN nou (`pin_v = 2`) · **`+8` PIN temporal (`pin_temp = true`)** · **`+16` bloquejat ara mateix per intents (`n >= 5` en els últims 15 min)**.
     - Retrocompatible amb clients que només comproven `&1`, `&2` i `&4`.

3. **Nova funció de consulta ràpida `public.bn_admin_pins(p_email, p_pass) → jsonb`:**
   - En una sola crida (sense N+1), torna la llista de tots els nens coneguts (`bn_priv.perfils` ∪ `public.bn_log`, excloent `nom_prohibit`), amb:
     - `k`, `nom`, `id`, `te_pin`, `pin_v`, `pin_ts` (ms), `pin_temp`, `intents_n`, `bloquejat_fins` (ms o `null`), `amagat`, `ult_log` (ms o `null`).
   - Permet pintar la vista centralitzada de PINs i els seus KPIs a l'instant.

4. **Actualització de funcions existents:**
   - **`public.bn_perfil_canvia_pin(p_nom, p_pin, p_nou)`:**
     - Rebutja `'4587R'` i, si `pin_temp = true`, exigeix que `p_nou <> upper(trim(p_pin))` (que no reutilitzi el mateix PIN temporal).
     - Desa el nou hash `bcrypt` i posa **`pin_temp = false`**, `pin_v = 2`, `pin_ts = now()`.
     - Manté la regla de `docs/TRAMPES.md`: cap `raise` després de `pin_ok` fals (retorna `'pin'`, `'mateix'` o `'exemple'` sense desfer `bn_priv.intents`).
   - **`public.bn_progres_llegeix(p_nom, p_pin, p_assig)`:**
     - Afegeix `'pin_temp'` (booleà) al JSONB retornat. Els clients antics ignoren el camp extra.
   - **`public.bn_admin_fitxa(p_email, p_pass, p_nom)`:**
     - Afegeix `'pin_temp'` dins l'objecte `perfil` retornat.

> **Garantia de seguretat (zero text pla):** El PIN generat només viu temporalment a la memòria del navegador de l'admin en el moment de crear-lo. Viatja per HTTPS a Supabase i s'emmagatzema exclusivament com a hash `bcrypt`. Mai es desa a `bn_log`, mai a la nota interna de la Bústia i mai torna del servidor.

---

### B · Nou espai de gestió de PINs dins `/admin/` (`admin/index.html`)

Es crea un flux coherent amb **3 punts d'accés** que reutilitzen el mateix modal i les mateixes funcions:

#### B.1 · Vista centralitzada **Nens → PINs** (`?v=nens&tab=pins`)
Nova pestanya dins la secció **Nens** (`Llista` · `Benestar` · `PINs` · `Missatges al nen`):
- **4 KPIs resum:**
  1. `Amb PIN actiu` (quants tenen PIN nou `pin_v = 2` i definitiu)
  2. `PIN temporal` (pendents que el nen triï el seu PIN personal)
  3. `Sense PIN / antic` (nens sense PIN o amb format vell de 4 xifres)
  4. `Bloquejats ara` (nens amb ≥ 5 intents fallits en els últims 15 min)
- **Filtres ràpids:** `Tots` · `PIN temporal` · `Sense PIN` · `PIN antic` · `Bloquejats` + cercador instantani per nom o `#ID`.
- **Taula compacta (`≤ 6` columnes, paginada amb `taula()`):**
  - `Nen` (avatar + nom + `#ID`, clicable a la fitxa)
  - `Estat del PIN` (píndola: `🔑 PIN nou` · `⏳ PIN temporal` · `⚠️ PIN antic (4 xifres)` · `Sense PIN` · `🔒 Bloquejat fins HH:MM`)
  - `Últim canvi de PIN` (`pin_ts`)
  - `Última activitat` (`ult_log`)
  - `Accions` (botons directes d'1 clic):
    - **«🔑 Nou PIN»** (obre el modal de generació/assignació)
    - **«🔓 Desbloqueja»** (només si està bloquejat per intents)
- **Botó ràpid «➕ Assigna PIN a un nom»** a la capçalera de la targeta per si es vol buscar i assignar PIN ràpidament sense navegar per la taula.

#### B.2 · Modal unificat «Genera / assigna PIN nou» (`obreModalPin(nom, opts)`)
Reutilitzable des de **Nens → PINs**, des de la **Fitxa del nen** i des de la **Bústia**:
- **Pas 1 · Configuració:**
  - Mostra el nom del nen, l'`#ID` i l'estat actual del PIN.
  - **Generador aleatori segur** (`crypto.getRandomValues`): crea automàticament un PIN vàlid de 4 xifres + 1 lletra majúscula evitant caràcters ambigus (`I`, `L`, `O`) i prohibint `4587R` (p. ex. `7392K`).
  - Camp editable (per si l'admin vol escriure un PIN concret acordat amb la família) + botó **«🎲 Genera'n un altre»**.
  - **Casella marcada per defecte:** `☑ PIN temporal (obligar el nen a triar el seu PIN personal en entrar)`. Si es desmarca, es desa com a PIN definitiu (`posapin_fix`).
  - Avís clar: *«Conserva el progrés al núvol, l'ID i l'avatar arcade. Desbloqueja qualsevol bloqueig d'intents. Aquest PIN només es mostrarà ara un sol cop.»*
  - Botons: `Cancel·la` · `Desa el PIN nou`.
- **Pas 2 · Confirmació i lliurament (es mostra un sol cop):**
  - Mostra el PIN en gran i clar (tipografia monoespai).
  - **«📋 Copia el PIN»** (copia només el codi, ex. `7392K`).
  - **«📋 Copia missatge per a la família»** (copia un missatge curt, amable i precís llest per enviar per WhatsApp o correu, adaptat automàticament segons si el PIN és temporal o definitiu, incloent el pas de prémer *«No ets tu?»* si ja tenia sessió oberta).
  - Si s'ha obert des d'un tiquet de **Bústia** amb correu vàlid: botó **«✉️ Obre correu preomplert»** (`mailto:` amb assumpte `[Bona Nota · REF] Nou PIN temporal per a <nom>` i el cos ja escrit).
  - Recordatori en tancar: *«Un cop tanquis aquesta finestra, el PIN no es podrà tornar a consultar (queda xifrat).»*

#### B.3 · Renovació a **Fitxa del nen → Núvol i gestió**
- A la capçalera (`#xPin`), afegir les píndoles `⏳ PIN temporal` i `🔒 Bloquejat`.
- A «Gestió del compte», la fila de PIN passa a ser **«Generar o canviar el PIN»** (sempre activa, tant si té PIN com si no en té) amb botó **«🔑 Genera PIN nou»** (i **«🔓 Desbloqueja intents»** si escau).
- L'acció antiga «Treu el PIN» es retira com a acció principal (vegeu decisió 3 a la secció 5).

#### B.4 · Drecera directa des de **Bústia** (`?v=bustia`)
- Al panell lateral de qualsevol missatge de categoria **`privacitat`**:
  - Bloc **«🔑 Resolució ràpida de PIN»** amb selector/cercador del nen (pre-seleccionant automàticament el nom si apareix al text del missatge).
  - Botó **«🔑 Genera PIN temporal»** que obre el modal vinculat a `r.email` i `r.ref`.
  - En desar el PIN, ofereix amb 1 clic passar el tiquet a estat **`Fet / Resolt`** i afegir a la nota interna `PIN temporal assignat el DD/MM/AAAA` (**sense desar mai el PIN a la nota**).

---

### C · Experiència del nen a la portada (`index.html`) i als mons (`motor/plantilla-estudi-interactiu.html`)

1. **Canvi obligatori en entrar amb PIN temporal:**
   - Quan `bn_progres_llegeix` retorna `{ ..., pin_temp: true }`:
     - A la portada (`index.html`), es crida `demanaNouPin(n, () => dins(n), { motiu: 'temp' })` reutilitzant el diàleg `#npPop` existent.
     - Dins un món (`motor/plantilla-estudi-interactiu.html`), es crida `pantallaNouPin({ motiu: 'temp' })`.
   - El text s'adapta:
     - Títol: **`🔑 TRIA EL TEU PIN NOU`**
     - Text: *«Hola, **Nom**! Has entrat amb un PIN temporal. Inventa't el teu PIN personal (**4 números i 1 lletra al final**, ex. 4587R) i apunta'l amb papa o mama.»*
     - No es pot ometre (`npAra.hidden = true`), prohibeix repetir el mateix PIN temporal i prohibeix `4587R`.
   - En desar-lo (`bn_perfil_canvia_pin`), `pin_temp` passa a `false`, es guarda el nou PIN personal a `localStorage.bn_pins` i el nen entra directament amb tot el seu progrés del núvol intacte.

2. **Dispositius amb sessió vella oberta (PIN caducat):**
   - Si un mòbil o tauleta tenia la sessió oberta amb el PIN antic i rep `pin` de `bn_progres_llegeix` o `-3` de `bn_progres_desa`:
     - Mostra un avís no destructiu (a la portada i dins el món, igual que ja fa `perfil/index.html:1172`): *«🔐 El teu PIN ha canviat. Entra amb el PIN nou per continuar guardant el progrés al núvol.»* amb botó directe **«🔑 Escriu el PIN nou»** (que obre el formulari d'entrada amb el seu nom ja omplert).
     - En cap cas esborra el progrés local; en posar el PIN nou, es torna a fusionar normalment.

---

## 3. Fases i proves

| Fase | Què | Fitxers principals | Mida |
|---|---|---|---|
| **1** | **SQL idempotent i prova SQL:** columna `pin_temp`, `bn_admin_usuari` (`posapin`, `posapin_fix`, `desbloqueja`, `estat` +8/+16), `bn_admin_pins`, `bn_perfil_canvia_pin`, `bn_progres_llegeix` i `bn_admin_fitxa` | `supabase/bn_pin_reset.sql`, `motor/prova-pin-reset-sql.js` | M |
| **2** | **Admin · gestió completa de PINs:** pestanya `Nens → PINs`, modal unificat (generador segur + còpia PIN + còpia missatge família + `mailto:`), actualització de `Fitxa del nen`, drecera a `Bústia`, suport `?demo` i proves d'interfície | `admin/index.html`, `motor/prova-admin-pin.js` | M |
| **3** | **Client · PIN temporal obligatori i avís de sessió caducada:** reutilització de `#npPop` / `pantallaNouPin()` quan `pin_temp === true`, avís amable en rebre error `pin` amb sessió oberta, regeneració i prova E2E | `index.html`, `motor/plantilla-estudi-interactiu.html`, `motor/tot.py` (regenerat), `motor/prova-pin-reset.js` | S-M |
| **4** | **Documentació i versió:** `CHANGELOG.md` (pujada `MENOR`, `2.80.0`), `README.md`, `docs/ARQUITECTURA.md`, `docs/ESTAT.md` | docs + `python3 motor/tot.py` | S |

> **Nota sobre Supabase:** La Fase 1 inclou SQL sobre el projecte `agippwtqvhpxdockuigl` (regla de risc a `nucli.json`). S'ha d'aplicar manualment al SQL Editor de Supabase abans que les accions noves estiguin actives en producció; mentre no s'apliqui, `/admin/` mostrarà l'avís amable `avisSQL("supabase/bn_pin_reset.sql", …)` sense trencar res.

### Proves previstes
- **`motor/prova-pin-reset-sql.js` (PGlite + pgcrypto, grup `sql`):**
  - Executa `supabase/bn_pin_reset.sql` dues vegades (idempotència).
  - `posapin` sobre un perfil existent conserva exactament `id`, `creat`, `aspecte` i `aspecte_ts`, posa `pin_temp = true`, esborra `bn_priv.intents` i canvia el hash `bcrypt`.
  - `posapin` sobre un nen sense fila a `bn_priv.perfils` crea la fila amb `pin_temp = true`.
  - Rebutja formats invàlids, `'4587R'` i credencials d'admin incorrectes.
  - `bn_progres_llegeix` retorna `pin_temp: true` amb el PIN temporal i `pin_temp: false` després que el nen cridi `bn_perfil_canvia_pin`.
  - `bn_perfil_canvia_pin` rebutja reutilitzar el mateix PIN temporal (`'mateix'`) i mai fa `raise` quan `pin_ok` és `false` (conserva el comptador `bn_priv.intents`, `docs/TRAMPES.md`).
  - `desbloqueja` aixeca el bloqueig de 5 intents sense alterar el PIN.
  - `bn_admin_pins` no és cridable per `anon` sense credencials vàlides i retorna tots els estats correctament.
- **`motor/prova-admin-pin.js` (Playwright en mode `?demo`, grup `interficie`):**
  - Obre `?v=nens&tab=pins`, comprova els 4 KPIs, els filtres (`PIN temporal`, `Sense PIN`, `Bloquejats`) i la cerca.
  - Obre el modal de generació de PIN, regenera PIN aleatori, valida format `^[0-9]{4}[A-Z]$` (≠ `4587R`), comprova la pantalla de confirmació i els botons de còpia.
  - Verifica la drecera des d'un tiquet `privacitat` de `Bústia` i el flux des de `Fitxa del nen → Núvol i gestió`.
  - Comprovació visual a `360`, `390`, `430` i `1280 px` + tema fosc, sense desbordament horitzontal.
- **`motor/prova-pin-reset.js` (Playwright, grup `interficie`):**
  - Simula entrada a `index.html` amb un PIN que retorna `pin_temp: true` → comprova que s'obre `#npPop` amb títol de PIN temporal, sense botó «Ara no», rebutja el mateix PIN temporal i completa el canvi.
  - Simula sessió oberta amb PIN caducat → comprova que surt l'avís amable sense esborrar el progrés local.

---

## 4. Criteris de fet

- L'admin pot resoldre un PIN perdut (o un nen bloquejat) íntegrament des de `/admin/` en menys de 20 segons, sense obrir la portada ni xocar mai amb el límit de 2 noms del PC.
- El nen conserva el 100 % del seu perfil: `id` (`#N`), data d'alta (`creat`), aspecte arcade (`aspecte`) i progrés al núvol (`bn_priv.progres`).
- En cap moment queda el nom del nen desprotegit sense PIN.
- El PIN temporal mai es desa en text pla a Supabase ni als registres, i el nen el substitueix pel seu PIN personal en el primer accés.
- Totes les proves (`generat`, `sql`, `interficie` i `docs`) passen en verd.

---

## 5. Decisions que has de prendre abans d'implementar

1. **On ubicar la vista centralitzada de PINs dins `/admin/`?**
   - *Recomanat:* Nova pestanya **«PINs»** dins **Nens** (`Llista` · `Benestar` · `PINs` · `Missatges al nen`), a més del botó a la **Fitxa del nen** i la drecera des de **Bústia**.
   - *Alternativa:* Dins de **Control ràpid** o **Configuració**.
2. **PIN temporal obligatori per defecte?**
   - *Recomanat:* Sí — el checkbox «Obligar el nen a triar el seu PIN personal en entrar» marcat per defecte, però desmarcable si ja s'ha pactat el PIN definitiu amb la família (`posapin_fix`).
3. **Què fem amb el botó antic «Treu el PIN» a la Fitxa del nen?**
   - *Recomanat:* Substituir-lo per **«Genera PIN nou»** (que evita perdre `id`/`creat`/`aspecte` i elimina la finestra d'usurpació). Mantenir `'treupin'` a l'SQL només per retrocompatibilitat, sense botó destacat a la UI (o amagat dins un `<details>` avançat si el vols conservar).
4. **Incloem també «Desbloqueja intents» (bloqueig de 15 minuts)?**
   - *Recomanat:* Sí — són 3 línies d'SQL i evita haver de canviar el PIN quan un nen només s'ha equivocat 5 cops.
5. **Implementem les 4 fases en ordre (PR 1: Fases 1+2 · PR 2: Fases 3+4) o tot en un únic PR?**
   - *Recomanat:* Dos PRs seguits (PR 1 amb l'SQL + la gestió de PINs a `/admin/` perquè ja ho puguis fer servir de seguida; PR 2 amb el canvi forçat a la portada/mons + docs i versió `2.80.0`).
