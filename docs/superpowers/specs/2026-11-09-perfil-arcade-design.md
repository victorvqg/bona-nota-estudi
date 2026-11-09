# Perfil arcade: pàgina de perfil per triar l'aspecte del nen (n2497)

Data: 2026-11-09 · Estat: aprovat amb en Víctor, secció per secció, abans d'escriure codi.

## 1. Objectiu

Que cada nen pugui triar com es veu dins del joc (el seu **aspecte**): l'animal del rànquing, un **perfil arcade** (una de les 50 insígnies de pixel art) i un estil de color. Ho tria en una pàgina nova, animada i amb l'estètica arcade de la portada, i la tria es veu al rànquing, a la portada i a les pàgines dels mons, des de qualsevol aparell.

Èxit: un nen de 12 anys obre el perfil des de la portada o des d'un món, veu el seu aspecte gran i animat, remena animals, perfils i estils, desa, i de seguida es veu al rànquing amb l'aspecte nou. Els altres nens també el veuen.

## 2. Abast

Dins:
- Pàgina nova `perfil/index.html` (`https://bonanota.net/perfil/`).
- Els 50 sprites «skills» redibuixats (n2495) entren a `sprites.js`, amb nom, categoria, paletes d'estil i una funció per dibuixar-los.
- Desat de l'aspecte al perfil del nen a Supabase (SQL nou) i memòria a l'aparell.
- Rànquing, salutació de la portada, salutació dels mons i tauler d'admin mostren l'aspecte triat.
- Prova automàtica de la pàgina i captures per a la revisió visual.
- Versió 2.7.0.

Fora (per a més endavant, si cal): desbloqueig de perfils per nivell, insígnies al rànquing dins dels mons («Com vaig»), notícies a la cinta del rànquing quan algú canvia de perfil, fons de color triable per a l'animal.

## 3. Decisions preses

- **Tots els perfils són lliures des del primer dia.** Res de cadenats a la v1.
- **Pàgina pròpia**, no un popup dins d'`index.html` (que ja té 1.100 línies) i no una vista dins dels mons: s'hi arriba des de tot arreu i té la seva pròpia URL.
- **L'aspecte es guarda a `bn_priv.perfils`** (la fila del nen, la del PIN), no al registre d'activitat `bn_log`: el registre és només d'inserció, té la llista d'events tancada i ningú el pot llegir des del navegador. Vegeu la decisió a `docs/DECISIONS.md`.
- **Lectura pública de l'aspecte de tothom** (`bn_aspectes()`): és exactament el que es veu al rànquing. Els noms amagats per l'admin i els noms no permesos queden fora, com al rànquing.
- **Qui no tria res es veu com avui:** animal calculat pel nom (`avatar(nom)`), sense insígnia, estil Clàssic. Ningú canvia d'animal sense voler.
- **Si un nen canvia l'aspecte des de dos aparells, mana l'últim que ha desat.**

## 4. La pantalla `perfil/`

Fitxer únic (HTML + CSS + JS), com la portada. Mateix fons estrellat, Nunito per al text i `Press Start 2P` per als rètols. Mòbil primer (360, 390 i 430 px): una sola columna amb la fitxa enganxada a dalt i el botó de desar enganxat a baix. A partir de 900 px, dues columnes: fitxa a l'esquerra, tries a la dreta.

Qui és: el nen de `localStorage.bn_jugador` (el mateix que a la portada). Si no n'hi ha cap, la pàgina només mostra «Primer entra amb el teu nom» i un botó cap a la portada.

Blocs, de dalt a baix:

1. **Capçalera.** Rètol pixelat «PLAYER SELECT» (groc amb ombra vermella, com «HIGH SCORES»), sota «Hola, Biel · #8» (l'id numèric surt del progrés guardat d'algun món, `bn_<assig>_perfils[nom].id`, si n'hi ha; si no, només el nom) i botó «✕ Torna» que porta a `../`.
2. **La teva fitxa** (`.fitxa`, sempre visible). Cercle de 120 px amb l'animal triat sobre el seu color (`BN_AV_BG`); a la cantonada de baix a la dreta, la insígnia del perfil a 64 px dins d'un anell; a sota, el nom del perfil en pixel («NINJA») i l'estil («❄️ TÀCTICA»), i una línia petita amb el nivell i les estrelles totals (calculades com a la portada, `estrellesTotals`). Si encara no ha triat perfil, la insígnia és un «?» i el text diu «Tria el teu perfil arcade».
3. **Animal.** Roda horitzontal (`scroll-snap-type: x mandatory`) amb els 20 animals de `BN_AV`, cada un en el seu cercle de color. El que és al mig es veu a escala 1,25. Fletxes ◀ ▶ a banda i banda i tecles ← → quan el grup té el focus. Tocar un animal el posa al mig i el tria.
4. **Perfil arcade.** Graella de 5 columnes amb els 50 sprites a 48 px (×3), agrupats per les 10 categories, cada una amb el seu títol («1 · Velocitat i temps»…). Cada cel·la és un botó amb el nom del perfil com a etiqueta accessible (el nom visible només surt a la fitxa, per no omplir la graella). El triat porta un marc groc que batega.
5. **Estil.** Tres botons en forma de pestanyes: «Clàssic», «🔥 Ofensiva», «❄️ Tàctica». Canvien la paleta de tots els sprites de la graella i de la insígnia de la fitxa.
6. **🎲 Sorpresa.** Tria animal, perfil i estil a l'atzar amb efecte de màquina escurabutxaques: la fitxa passa ràpid per 10-12 combinacions, cada cop més a poc a poc (de 70 ms a 220 ms entre canvis, uns 1,6 s en total), i para a la definitiva.
7. **Desar.** Botó gran «DESA EL PERFIL ▶» (groc, ombra vermella, com «Entra ▶»), fix a baix al mòbil. Està desactivat mentre no hi ha cap canvi respecte del que ja té desat. En desar: pluja de 24 estrelles petites (sprites `star` a 12-16 px, només `transform`), rètol «GUARDAT!» 1,6 s, i el botó passa a ser l'enllaç «Veure'm al rànquing →» (`../#ranquing`). Si el nen torna a canviar alguna cosa, torna a sortir «DESA EL PERFIL ▶».

Animacions (totes amb `transform`/`opacity`, peces petites, res de `backdrop-filter` ni `mix-blend-mode`; vegeu `docs/TRAMPES.md`):
- Fitxa: l'animal «respira» (puja i baixa 4 px en 3 s, infinit) i fa un salt amb aixafament en tocar-lo (0,5 s). L'anell de la insígnia gira a poc a poc (8 s per volta). Quan canvia el perfil, la insígnia fa un gir sobre l'eix vertical (0,5 s) i a mig gir ja mostra el nou.
- Animal triat: «pop» d'escala (1 → 1,35 → 1,25, 0,35 s).
- Cel·la de perfil triada: bot de 6 px (0,4 s); el marc batega (ombra que creix i minva, 1,2 s, infinit).
- Canvi d'estil: flaix curt de la graella (brillantor, 0,3 s) mentre es tornen a pintar els sprites.
- Sons: «moneda» curta en triar (Web Audio, 2 notes, com la portada), un «tada» de 3 notes en desar. Respecten `bn_so` (apagat) i `bn_vol`, i passen per `bnSo` (el bloc `SO-MOBIL` que `tot.py` copia a la pàgina, igual que a la portada).
- Sense moviment ni so d'adorn si `prefers-reduced-motion: reduce` o si el nen té «Efectes suaus» (`localStorage.bn_suau`): tot canvia a l'instant i la Sorpresa tria directament.

Accessibilitat (com la portada): animals, perfils i estils són `role="radiogroup"` amb botons `role="radio"` i `aria-checked`; les fletxes del teclat mouen la tria dins del grup; focus visible groc; una regió `aria-live="polite"` diu «Has triat: Ninja» en cada canvi; el botó de desar té estat `aria-disabled` i el rètol «GUARDAT!» és `role="status"`. Tots els botons fan 44 px o més.

Textos d'avís (dins de la pàgina, sota el botó de desar):
- Desat al núvol: res (el rètol «GUARDAT!» ja ho diu).
- Sense connexió o funció SQL no disponible: «Guardat en aquest aparell. Es pujarà sol quan hi hagi connexió.»
- PIN incorrecte: «El PIN guardat ja no serveix. Torna a entrar a la portada amb el PIN nou.» (enllaç a `../`).
- Massa intents: «⏳ Massa intents. Espera 15 minuts.»
- Sense PIN guardat a l'aparell (cas rar): es desa a l'aparell i surt el mateix avís que sense connexió.

## 5. Dades

### 5.1 L'aspecte

Objecte per nen: `{av:"fox", sk:"ninja", v:"A"}`.
- `av`: un dels 20 ids de `BN_AV`. Pot faltar (→ animal calculat pel nom).
- `sk`: un dels 50 ids de `BN_SKILLS`. Pot faltar (→ sense insígnia).
- `v`: `""` Clàssic (o absent), `"A"` Ofensiva/foc, `"B"` Tàctica/ciber-glaç.

### 5.2 A l'aparell

`localStorage.bn_aspectes` = mapa `{ "<nom en minúscules>": {av, sk, v, mod, pendent} }`.
- `mod`: `Date.now()` de l'últim desat local.
- `pendent: true` mentre no s'ha pogut pujar al núvol.
- El llegeixen la portada, els mons, la pàgina de perfil i el tauler (aquest últim només si és al mateix aparell; normalment no).
- La portada el refresca amb el resultat de `bn_aspectes()` cada cop que obre el rànquing: el núvol mana, tret de les entrades amb `pendent`.
- La portada i la pàgina de perfil, en obrir-se, reintenten en silenci les entrades `pendent` del nen actual (`bn_aspecte_desa`) si tenen el PIN a `bn_pins`.

Funcions compartides (copiades a cada pàgina, són 10 línies): `aspecteDe(nom)` → l'aspecte del mapa o `null`; `desaAspecteLocal(nom, aspecte, pendent)`.

### 5.3 A Supabase (`supabase/bn_aspecte.sql`, idempotent)

```sql
alter table bn_priv.perfils add column if not exists aspecte jsonb;
alter table bn_priv.perfils add column if not exists aspecte_ts timestamptz;
```

`public.bn_aspecte_desa(p_nom text, p_pin text, p_aspecte jsonb) returns text`
- `security definer`, `set search_path to ''`, com les altres.
- Comprova el PIN amb `bn_priv.pin_ok(p_nom, p_pin)`: si no, `raise exception 'pin incorrecte'` (errcode 28000); «massa intents» el llança `pin_ok` mateix.
- Neteja l'objecte: només es queden `av`, `sk` i `v`. `av` i `sk` han de complir `^[a-z0-9_]{1,24}$` (si no, s'ignoren); `v` ha de ser `''`, `'A'` o `'B'` (si no, `''`). Si el que queda és buit, desa `'{}'::jsonb`.
- `update bn_priv.perfils set aspecte = …, aspecte_ts = now() where k = lower(trim(p_nom))`.
- Torna `'ok'`.
- `revoke all … from public; grant execute … to anon, authenticated`.

`public.bn_aspectes() returns table(nom text, aspecte jsonb)`
- `language sql stable security definer set search_path = ''`.
- `select p.nom, p.aspecte from bn_priv.perfils p where p.aspecte is not null and p.aspecte <> '{}'::jsonb and not exists (select 1 from bn_priv.amagats a where a.k = p.k) and not bn_priv.nom_prohibit(p.nom) limit 500`.
- Mateixos `revoke`/`grant`.

Efectes col·laterals ja coberts: `bn_admin_usuari 'esborra'` esborra la fila (i l'aspecte); `'canvia'` mou la fila (l'aspecte la segueix); `bn_admin_reinicia` no toca `perfils`. Les còpies de seguretat (`bn_copies.sql`) copien `perfils` sencera, aspecte inclòs.

### 5.4 Crides des del navegador

Mateix `rpcP(f, body)` de la portada (REST `/rpc/<f>`, clau `apikey` publicable). Errors que ja tradueix: `"pin"`, `"bloc"`, `"xarxa"` (també quan la funció encara no existeix: 404).

Flux de desar a `perfil/`:
1. `desaAspecteLocal(nom, aspecte, true)`.
2. Si hi ha PIN a `bn_pins[nom]` i `location.protocol` és http(s): `rpcP('bn_aspecte_desa', {p_nom, p_pin, p_aspecte})`.
3. `'ok'` → `desaAspecteLocal(nom, aspecte, false)`. `"pin"` → avís de PIN i la tria queda `pendent`. `"bloc"` → avís d'espera. `"xarxa"` o sense PIN → avís «Guardat en aquest aparell…».

## 6. On es veu l'aspecte

### 6.1 `sprites.js`

S'hi afegeix, després de `BN_SPR`:
- `const BN_SKILLS = {…}`: els 50 sprites (format `{w:16,h:16,p:[…]}`, 10 comentaris de categoria), tal com s'han lliurat a n2495/n2496.
- `const BN_SKILL_CAT = ["Velocitat i temps", "Escuts i supervivència", "Punts, combos i risc", "Pistes, lògica i precisió", "Caos, màgia i especials", "Elements i natura", "Espai i ciència-ficció", "Esports i reflexos", "Fantasia i rol", "Mestres de l'estudi i ment"]`.
- `const BN_SKILL_INFO = { cronos:{n:"Cronos",c:0}, bala_roja:{n:"Bala roja",c:0}, …, dj_bass:{n:"DJ Bass",c:4}, pilot_f1:{n:"Pilot F1",c:7}, … }`: nom en català per mostrar i índex de categoria. En el mateix ordre que `BN_SKILLS`.
- `const BN_SKILL_VAR_PAL = { A:{B:"#e8442e", b:"#fdba74", C:"#ffd23f", E:"#f97316", e:"#fde68a", G:"#7c2d12", V:"#b91c1c"}, B:{R:"#3b82f6", O:"#22d3ee", Y:"#e0f7ff", y:"#7dd3fc", E:"#2dd4bf", N:"#1e3a8a", G:"#164e63", P:"#a78bfa"} }`. Són una proposta a partir de la paleta base; es poden retocar sense tocar res més.
- `const BN_SKILL_ESTILS = {"":"Clàssic", A:"🔥 Ofensiva", B:"❄️ Tàctica"}`.
- `function bnSkillSpr(id, v, classe)`: dibuixa `BN_SKILLS[id]` amb `BN_PAL` + `BN_SKILL_VAR_PAL[v]`; torna `""` si l'id no existeix. Amb memòria cau per `id|v|classe`.
- Per no duplicar el dibuixat, el cos de `bnSpr` passa a una funció interna `bnSvg(def, classe, pal, clau)` que fan servir `bnSpr` i `bnSkillSpr`. `bnSpr`, `bnTile`, `bnMat` i la resta no canvien de signatura ni de resultat.

### 6.2 Portada (`index.html`)

- En carregar: llegeix `bn_aspectes` local; si hi ha nen entrat, reintenta les entrades `pendent`.
- `avatar(nom)`: si `aspecteDe(nom).av` és un id de `BN_AV`, el fa servir; si no, el càlcul pel nom d'avui. Torna també `sk` i `v`.
- `avHtml(nom, cls, dins)`: si hi ha `sk`, afegeix `<span class="av-sk">` amb `bnSkillSpr(sk, v)` a la cantonada de baix a la dreta del cercle (20 px a les files, 28 px al podi, amb una vora fosca d'1 px perquè es vegi sobre qualsevol color) i `title="Perfil: Ninja · Tàctica"`.
- Rànquing: `carregaHs()` demana `bn_aspectes` alhora que els rànquings (`Promise.all` amb `.catch(()=>[])`), omple el mapa local i pinta. Si falla, es pinta amb el mapa local.
- Salutació «Hola, Biel! 👋»: a l'esquerra el cercle del nen (`avHtml`, 44 px) i, al costat de «⭐ 218», un botó-enllaç `<a class="hola-perfil" href="perfil/">👾 Perfil</a>`.
- Si l'adreça acaba en `#ranquing`, s'obre el rànquing en carregar (com ja fa `?demo`) i el `#ranquing` es treu de l'adreça.

### 6.3 Mons (`motor/plantilla-estudi-interactiu.html`)

- La plantilla carrega `<script src="../../sprites.js?v=__SPR__"></script>` abans del script principal; `build.py` substitueix `__SPR__` per l'empremta de `sprites.js` (els 8 primers caràcters del sha1, la mateixa que calcula `tot.py` per a la portada). Si `sprites.js` no carrega (p. ex. obrint el fitxer en local), la salutació manté l'emoji 🧒.
- `.hero .av` passa a ser `<a class="av av-perfil" href="../../perfil/" title="Canvia el teu perfil">` amb el cercle de l'animal (color `BN_AV_BG`) i la insígnia si n'hi ha. Continua respirant com ara (`avBota`).
- Sota «Hola, Biel! #8», si té perfil: `<p class="asp">Ninja · ❄️ Tàctica</p>`.
- Els mons llegeixen només el mapa local (`bn_aspectes`): el nen sempre passa per la portada per entrar, així que hi és. No fan cap crida nova a Supabase.
- Cap pestanya nova al menú.

### 6.4 Tauler (`admin/index.html`)

- En carregar les dades, demana també `bn_aspectes()` (pública, sense contrasenya) i guarda el mapa en memòria.
- `avatar(nom, cls)` consulta primer el mapa; si hi ha `sk`, afegeix la insígnia petita. Res més canvia.

## 7. Construcció (`motor/tot.py` i `motor/build.py`)

- `build.py`: calcula l'empremta de `sprites.js` i substitueix `__SPR__` a cada món.
- `tot.py`:
  - `perfil/index.html` porta les mateixes marques que la portada per als blocs copiats (`SO-MOBIL`, `ACTUALITZA`) i `tot.py` els hi copia igual.
  - Li posa el `?v=` de `sprites.js` (`src="../sprites.js?v=…"`), el número de versió al peu (`<small class="bn-versio">`) i l'empremta `VER`.
  - L'afegeix al càlcul de l'empremta, a `pagines` i a `fitxers_sw` com a `"perfil/"`.
  - Comprova, com fa amb la portada, que hi ha exactament un `<script src="../sprites.js">` i un `VER="__BN_VERSIO__"`.
- `perfil/index.html` porta `window.BN_ACT={arrel:"../",tornaAuto:true}` perquè l'actualització automàtica hi funcioni.

## 8. Proves

### 8.1 Nova: `motor/prova-perfil.js` (Playwright, Chromium)

Engega un servidor estàtic local (`http://127.0.0.1:<port>/`) sobre l'arrel del repo i intercepta `**/rest/v1/rpc/**` amb `page.route`, així no toca Supabase. Casos:
1. Sense `bn_jugador`: es veu l'avís «Primer entra amb el teu nom» i l'enllaç a la portada; no hi ha graella.
2. Amb `bn_jugador = "Prova"` i `bn_pins = {"prova":"1234A"}`, i `bn_aspecte_desa` que respon `"ok"`: la pàgina pinta 20 animals i 50 perfils; es tria un animal amb clic i un altre amb ← →; es tria un perfil amb clic i un altre amb el teclat; es canvia l'estil; el botó de desar s'activa; en desar, `bn_aspectes.prova` té `{av, sk, v}` sense `pendent`, surt «GUARDAT!» i l'enllaç «Veure'm al rànquing →» apunta a `../#ranquing`. La crida interceptada porta `p_nom`, `p_pin` i `p_aspecte` correctes.
3. Amb la funció que respon 404: es desa amb `pendent: true` i surt l'avís «Guardat en aquest aparell…». En recarregar la pàgina (ara amb la funció responent `"ok"`), el reintent silenciós treu el `pendent`.
4. Amb resposta «pin incorrecte»: avís de PIN i `pendent: true`.
5. La Sorpresa canvia els tres valors i deixa el botó de desar actiu.
6. Amb `bn_suau = "1"`: la pàgina no té cap animació en marxa (`getAnimations()` buit) i la Sorpresa és instantània.

### 8.2 Existents

- `python3 motor/tot.py` dues vegades: la segona no canvia cap fitxer (`git diff --quiet`).
- `node motor/prova-generadors.js`.
- `ESTRICTE=1 node motor/prova.js <món>/index.html` per als 6 mons (la plantilla canvia).
- L'Action `Revisa Bona Nota` guanya un pas: `node motor/prova-perfil.js`.

### 8.3 Visual (manual, amb captures al PR)

A 360, 390, 430 i 1280 px: la pàgina de perfil (a dalt, al mig de la graella i amb «GUARDAT!»), la salutació de la portada amb el botó Perfil, el podi i dues files del rànquing amb insígnies, i la salutació d'un món. La revisió la fa Claude amb Playwright i en Víctor la repassa al PR. A la portada, el rànquing es pot omplir amb `?demo` com fins ara.

## 9. Versió, documentació i decisió

- `CHANGELOG.md`: entrada `## 2.7.0 · <data>` amb «Afegit: pàgina de perfil (`/perfil/`) per triar l'animal, el perfil arcade i l'estil; es veu al rànquing, a la portada i als mons» i «Canviat: 50 perfils arcade nous (pixel art 16×16) a `sprites.js`».
- `README.md`: número 2.7.0 a la capçalera; una línia a l'arquitectura sobre `perfil/` i `bn_aspecte.sql`.
- `docs/ESTAT.md`: versió i el bloc n2497.
- `docs/ARQUITECTURA.md`: `perfil/index.html` a «Portada i rànquing»; `bn_aspecte.sql` a Supabase; `prova-perfil.js` a Proves.
- `docs/DECISIONS.md`: ADR «L'aspecte del nen viu a `bn_priv.perfils` i es llegeix amb `bn_aspectes()`» (context: cal que el vegin tots els aparells i tots els nens; alternatives: `bn_log`, només local; conseqüència: un SQL que s'aplica a mà i una lectura pública d'aspectes).

## 10. Publicació

1. Branca `n2497-perfil-arcade` des de `main` (2.6.1).
2. Commits `tipus(àmbit): què (n2497)`; l'últim, `feat(perfil): pàgina de perfil arcade per triar animal, insígnia i estil (n2497)`.
3. PR cap a `main` amb el mateix títol, les captures i la nota de risc del nucli per a `supabase/**`.
4. Action en verd → fusió amb squash, branca esborrada, etiqueta `v2.7.0` al commit de `main`.
5. SQL: l'agent no l'aplica (ho prohibeix `nucli.json`). En Víctor enganxa `supabase/bn_aspecte.sql` a l'editor SQL del projecte `bonanota` (`https://supabase.com/dashboard/project/agippwtqvhpxdockuigl/sql/new`) i prem «Run». Es pot fer abans o després de fusionar: fins llavors la pàgina guarda a l'aparell i puja sola més tard.

## 11. Criteris d'acceptació

- [ ] `https://bonanota.net/perfil/` carrega amb nen entrat i sense (avís), a 360-430 px i a escriptori, sense errors a la consola.
- [ ] Es poden triar animal, perfil i estil amb dit, ratolí i teclat; la fitxa canvia a l'instant; «DESA» només s'activa amb canvis.
- [ ] Amb l'SQL aplicat, la tria queda a Supabase i el rànquing la mostra des d'un altre aparell. Sense l'SQL, queda a l'aparell amb l'avís i puja sola després.
- [ ] Qui no ha triat res es veu exactament com abans al rànquing, al tauler i als mons.
- [ ] Les 6 proves de `prova-perfil.js`, `prova-generadors.js` i `prova.js` dels 6 mons passen; `tot.py` és idempotent; l'Action surt en verd.
- [ ] Amb «Efectes suaus» o `prefers-reduced-motion`, cap animació.
- [ ] Captures adjuntes al PR i versió 2.7.0 al peu de totes les pàgines.
