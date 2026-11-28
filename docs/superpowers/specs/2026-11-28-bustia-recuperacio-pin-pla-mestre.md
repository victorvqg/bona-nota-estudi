# Pla mestre · Explicar i guiar la recuperació de PIN a la Bústia (`/suggeriments/`)

28/11/2026 · Versió actual 2.80.0 · Especificació de millora per a `suggeriments/index.html`, `index.html`, `motor/plantilla-estudi-interactiu.html`, `pares/index.html` i `motor/prova-suggeriments.js` (0 canvis de base de dades).

**Estat:** decisions preses el 28/11/2026 (les 4 recomanacions aprovades). **Pla tancat** al PR `g43` (`v2.81.0`).

**En poques línies.** Amb la `v2.80.0` (`g41`–`g42`) ja funciona de cap a cap el sistema segur de **PIN temporal** des de `/admin/` i el canvi obligatori a la portada i als mons. Però de cara a les famílies i als alumnes encara hi ha tres frens importants:
1. **Ningú troba fàcilment com recuperar el PIN:** al formulari d'entrada de la portada (`index.html`) i dels mons (`plantilla-estudi-interactiu.html`) **no hi ha cap enllaç «Has oblidat el PIN?»** (ni quan surt `❌ PIN incorrecte` ni quan es bloqueja per 5 intents).
2. **La Bústia no explica el flux real de la `v2.80.0`:** a `suggeriments/index.html`, l'opció *Privacitat o perfil* només mostra un avís curt que parla de «reiniciar un PIN», sense explicar per què no podem dir-los l'antic (xifrat amb `bcrypt`), sense tranquil·litzar-los (no es perd cap estrella, ni l'`#ID`, ni el perfil arcade) i sense explicar els **3 passos del PIN temporal**.
3. **Les famílies sovint obliden les dades de verificació:** escriuen en un camp de text lliure («el meu fill no sap el PIN») sense indicar el nom exacte, el dispositiu o l'últim món, obligant a intercanviar correus extra. I la Guia de famílies (`pares/index.html:463`) encara descriu el mecanisme antic de «treure el PIN».

Proposo una millora neta sense tocar Supabase (**0 SQL nou**), en **2 fases**, que converteix la recuperació de PIN en un flux guiat, tranquil·litzador i d'1 clic des de qualsevol pantalla d'entrada.

---

## 1. Com és ara (el codi)

| Peça | On | Estat actual | Mancança |
|---|---|---|---|
| **Portada (`#entrada`)** | `index.html:921-929, 1377` | Nom, PIN, botó «Entra ▶» i «Fes un tast». Si falla: `❌ PIN incorrecte. Torna-ho a provar.` o `⏳ Massa intents. Espera 15 minuts.` | Cap enllaç «Has oblidat el PIN?» ni sortida cap a `/suggeriments/`. |
| **Mons (`benvinguda` / `pantallaPin`)** | `motor/plantilla-estudi-interactiu.html:1265-1282, 1713-1734` | Demana nom + PIN. Si falla: `❌ PIN incorrecte` / `⏳ Massa intents`. | Cap enllaç d'ajuda per recuperar el PIN. |
| **Bústia (`/suggeriments/`)** | `suggeriments/index.html:187-230, 295-366` | 4 categories (`Error`, `Idea`, `Família/Docent`, `Privacitat o perfil`). En `Privacitat` surt l'avís `#avisPriv` (3 línies) i el correu de tutor passa a ser obligatori. | No explica els 3 passos del PIN temporal ni que el progrés/avatar es conserven; no té camps estructurats (nom d'usuari, dispositiu) ni drecera URL `?tipus=pin`. |
| **Guia per a les famílies** | `pares/index.html:463` | FAQ: *«Podeu demanar que li reiniciem només el PIN… perquè el pròxim cop que entri amb el seu nom, en triï un de nou»*. | Descriu el flux antic (abans de `v2.80.0`); ara enviem un **PIN temporal** per correu i en entrar l'app obliga a triar-ne un de personal. |
| **Admin → Bústia** | `admin/index.html:5909-5943` | Ja té el bloc **«🔑 Resolució ràpida de PIN»** que detecta el nom dins del text del missatge, genera el PIN temporal i prepara el `mailto:`. | Si la família no escriu el nom exacte al missatge, no el pot pre-seleccionar automàticament. |

---

## 2. Proposta

### A · Guia clara + formulari específic de PIN perdut a `/suggeriments/` (`suggeriments/index.html`)

Sense tocar `supabase/bn_suggeriments.sql` (tot s'envia a `bn_suggeriment_envia` amb `p_categoria = 'privacitat'` i `p_rol = 'familia'`):

1. **Nova drecera directa i selecció clara:**
   - **URL dedicada:** `/suggeriments/?tipus=pin` (i opcionalment `&nom=Rachita&mon=prehistoria`).
   - Dins les targetes de categoria (secció 1 «De què es tracta?»):
     - Es pot oferir **una 5a targeta destacada `🔑 He oblidat el PIN`** (visualment separada a l'amplada completa o integrant un selector directe de 2 botons dins `Privacitat o perfil`: **`🔑 Recuperar un PIN perdut`** vs. **`🛡️ Altra consulta de privacitat`** — vegeu decisió 1 a la secció 5).
     - En activar el mode **Recuperar un PIN perdut**, la pàgina s'adapta automàticament per parlar directament a la família en llenguatge planer.

2. **Targeta explicativa visual «Com recuperem el teu PIN?» (3 passos + tranquil·litat):**
   Visible just a sobre del formulari quan es tria recuperació de PIN (plegable o compacta al mòbil):
   - **Missatge de tranquil·litat d'entrada:**
     > 🛡️ **No perds res!** Totes les estrelles, els temes aprovats, el teu número `#ID` i el teu perfil arcade (animal, marc i insígnies) estan guardats al núvol i es mantenen intactes.
   - **Els 3 passos (graella de 3 targetes petites, 1 columna al mòbil):**
     1. **1 · Ens envies la petició (família/tutor):** ens dius el nom d'usuari, el dispositiu habitual i l'últim món treballat per comprovar que el compte és teu, juntament amb el correu del pare, mare o tutor/a.
     2. **2 · Rebs un PIN temporal per correu:** com que els PINs estan xifrats (ningú pot llegir el PIN antic), generem un **PIN temporal d'un sol ús** (4 números i 1 lletra) i te l'enviem al correu de la família.
     3. **3 · Tries el teu PIN personal nou:** l'alumne entra a `bonanota.net` amb el PIN temporal i, a l'instant, el web li demana inventar-se el seu PIN definitiu. Apunteu-lo junts en un lloc segur!
   - **Mini-recordatori pràctic per a qui ja tenia sessió oberta:**
     - *«Si en obrir Bona Nota ja surt el teu nom a dalt, prem primer **«No ets tu?»** (o el botó **«🔑 Escriu el PIN nou»** si surt l'avís groc) per introduir el PIN temporal.»*
   - **Avís per a alumnes menors:**
     - *«Si ets l'alumne/a, demana al teu pare, mare o tutor/a que ompli aquesta petició amb el seu correu electrònic.»*

3. **Camps guiats (zero oblits, 0 canvis d'SQL):**
   En mode **Recuperar PIN perdut**, en lloc d'obligar la família a redactar-ho tot en un `<textarea>` buit:
   - **Nom d'usuari a Bona Nota** (`#sPinNom`, obligatori, pre-omplert si ve `?nom=...` a la URL; avís: *«Tal com surt a la portada o al rànquing, sense cognoms»*).
   - **Dispositiu habitual** (`#sPinDisp`, botons/select ràpid obligatori: `📱 Mòbil` · `📲 Tauleta` · `💻 Ordinador` · `🔄 Diversos`).
   - **Últim món treballat** (reutilitza `#sMon` que ja existeix, marcat com a recomanat/verificació).
   - **Situació** (`#sPinMotiu`, opcional amb 2 xips ràpids: `He oblidat el PIN` · `Compte bloquejat per 5 intents`).
   - **Correu del pare, mare o tutor/a** (`#sMail`, obligatori, explicant que hi rebran el PIN temporal).
   - **Comentari addicional** (`#sMsg`, opcional en mode PIN, perquè els camps guiats ja construeixen automàticament un missatge complet i estructurat ≥ 10 caràcters!).
   - **Missatge estructurat enviat a `bn_suggeriment_envia`:**
     ```text
     [RECUPERACIÓ DE PIN]
     • Nom d'usuari: Rachita
     • Motiu: PIN oblidat
     • Dispositiu habitual: Tauleta
     • Últim món treballat: La Prehistòria
     • Comentari: Va canviar de tauleta ahir.
     ```
     - **Benefici directe per a `/admin/ → Bústia`:** el bloc **«🔑 Resolució ràpida de PIN»** ja cerca el nom dins del missatge i pre-seleccionarà automàticament l'alumne el 100 % de les vegades, i tu veuràs en 2 segons les 3 dades de verificació ordenades!

4. **Pantalla de confirmació (`#fetBox`) adaptada a PIN perdut:**
   - Mostra la referència (`SUG-XXX`) i un resum tranquil·litzador:
     *«Hem rebut la petició de PIN per a **Rachita** (`SUG-XXX`). Quan comprovem les dades, enviarem un **PIN temporal** a `familia@exemple.cat`. Mentrestant, pots continuar repassant en mode tast o esperar el correu sense perdre cap estrella.»*

---

### B · Portes d'entrada «🔑 Has oblidat el PIN?» des d'on realment es perd el PIN

1. **Portada (`index.html`):**
   - Sota el botó **«Entra ▶»** (o al peu del formulari `#entrada`), afegir un enllaç discret:
     `🔑 Has oblidat el PIN?` → apunta dinàmicament a `suggeriments/?tipus=pin` (i si l'usuari ja ha escrit el nom a `#enNom`, hi afegeix `&nom=<nom>`!).
   - Quan falla el PIN (`m === 'pin'`) o salta el bloqueig de 15 minuts (`m === 'bloc'`), afegir l'enllaç directe dins l'avís `#enAvis`:
     - `❌ PIN incorrecte. Torna-ho a provar — o ` **`🔑 demana un PIN temporal`**
     - `⏳ Massa intents. Espera 15 minuts — o ` **`🔑 demana ajuda a la família`**
2. **Mons (`motor/plantilla-estudi-interactiu.html`):**
   - A `benvinguda()` (formulari d'entrada del món) i a `pantallaPin(nom, "entra")`, afegir el mateix enllaç discret `🔑 Has oblidat el PIN?` cap a `../../suggeriments/?tipus=pin&mon=<ASSIG.id>&nom=<nom>` (respectant el castellà a Castellano: `🔑 ¿Has olvidado el PIN?`).
   - Dins l'avís `#avisPinCaducatMon` no cal (allà ja entra amb el PIN nou que li acaba d'enviar la família).
3. **Guia per a les famílies (`pares/index.html`):**
   - Actualitzar la pregunta freqüent *«I si el meu fill oblida el PIN?»* (`pares/index.html:463`) per reflectir el flux real de la `v2.80.0`:
     - No es perd cap estrella, ni l'`#ID`, ni el perfil arcade.
     - Els PINs van xifrats (no podem consultar l'antic), per això enviem un **PIN temporal d'un sol ús** al correu de la família des de la Bústia (`../suggeriments/?tipus=pin`).
     - En entrar amb el PIN temporal, l'app li demana automàticament triar el seu PIN personal nou.

---

### C · Filtre de Bon Ús (`docs/BON-US.md` §6) i privacitat de menors
- **Privacitat intacta:** el correu electrònic sempre és el del **pare, mare o tutor/a** (mai d'un menor), i l'avís de privacitat avisa clarament de no posar cognoms ni telèfons al nom d'usuari.
- **Zero fricció innecessària i zero CAPTCHAs:** manté el honeypot, el temps mínim i el rate-limit existent (3/hora).
- **Accessible i mòbil primer:** tots els botons ≥ 44 px, contrast AAA sobre fons fosc arcade, sense desbordament a 360 / 390 / 430 px.

---

## 3. Fases i proves

| Fase | Què | Fitxers principals | Mida |
|---|---|---|---|
| **1** | **Bústia guiada per a PIN perdut (`suggeriments/index.html`) + Guia de famílies (`pares/index.html`):** mode `?tipus=pin`, targeta visual de 3 passos + tranquil·litat, camps guiats (`Nom d'usuari`, `Dispositiu`, `Últim món`, `Motiu`, `Correu tutor`), missatge estructurat, confirmació personalitzada i FAQ actualitzada a `pares/index.html` | `suggeriments/index.html`, `pares/index.html` | M |
| **2** | **Enllaços «Has oblidat el PIN?» a portada i mons + prova E2E + docs (`2.81.0`):** enllaç dinàmic amb `?tipus=pin&nom=…` a `index.html` i `motor/plantilla-estudi-interactiu.html`, nova prova Playwright `motor/prova-suggeriments.js`, regeneració amb `python3 motor/tot.py`, `CHANGELOG.md`, `README.md` §10 i `docs/ESTAT.md` | `index.html`, `motor/plantilla-estudi-interactiu.html`, `motor/prova-suggeriments.js`, `motor/prova-tot.js`, `.github/workflows/revisa.yml`, docs | S-M |

### Proves previstes
- **`motor/prova-suggeriments.js` (Playwright en mode `?demo` / Supabase simulat, grup `interficie`):**
  - Obrir `/suggeriments/?tipus=pin&nom=Rachita&mon=prehistoria` → activa el mode PIN perdut, mostra la guia de 3 passos, pre-omple `Rachita` i `prehistoria`, i exigeix el correu de la família.
  - Enviar el formulari → comprova que crida `bn_suggeriment_envia` amb `p_categoria: "privacitat"`, `p_rol: "familia"` i el missatge estructurat amb `[RECUPERACIÓ DE PIN]`, nom, dispositiu i món, i mostra la confirmació personalitzada.
  - Obrir la portada (`index.html`), escriure `Rachita` + PIN dolent → comprova que surt l'enllaç directe cap a `suggeriments/?tipus=pin&nom=Rachita`.
  - Mòbil `360` i `390 px` sense desbordament horitzontal ni errors de JS.
- **`motor/prova-pares.js` i `motor/prova-tot.js base`** en verd (inclòs `generat` i `prova-docs.js`).

---

## 4. Criteris de fet

- Qualsevol família que perdi el PIN arriba en **1 clic** des de la portada o des d'un món a una pantalla clara que explica els 3 passos sense tecnicismes.
- La petició arriba a `/admin/ → Bústia` amb totes les dades de verificació estructurades i amb el nom de l'alumne pre-detectat automàticament al bloc **Resolució ràpida de PIN**.
- Cap menor no introdueix dades personals innecessàries ni correus propis.
- 0 canvis d'SQL a Supabase i totes les proves (`base`, `interficie`, `mons`) en verd.

---

## 5. Decisions que has de prendre abans d'implementar

1. **Com presentar «Recuperar el PIN» dins la secció 1 de `/suggeriments/`?**
   - *Opció A (Recomanada):* Afegir un botó/targeta propi **`🔑 He oblidat el PIN`** ben visible (amplada completa just sota les 4 categories, o com a 1a opció quan s'arriba per `?tipus=pin`), que interna­ment envia `categoria = 'privacitat'` (0 canvis d'SQL!).
   - *Opció B:* Mantenir estrictament les 4 targetes actuals i mostrar el selector (`🔑 Recuperar PIN` / `🛡️ Altra consulta`) només en clicar `🔒 Privacitat o perfil`.
2. **A la portada (`index.html`), on posar l'enllaç «🔑 Has oblidat el PIN?»?**
   - *Recomanat:* Enllaç discret sota el formulari d'entrada **i** també dins del missatge d'error quan s'equivoca de PIN o queda bloquejat 15 minuts.
3. **Quan un nen escriu el nom a la portada i clica «Has oblidat el PIN?», pre-omplir automàticament el nom a `/suggeriments/?tipus=pin&nom=...`?**
   - *Recomanat:* Sí — estalvia faltes d'ortografia al nom i fa que `/admin/ → Bústia` detecti l'alumne a la primera.
4. **Ho fem tot en un únic PR (`g43`, versió `2.81.0`)?**
   - *Recomanat:* Sí — com que no toca SQL a Supabase i totes les peces van juntes (`suggeriments/` + `pares/` + enllaços de portada/mons + prova E2E), en un sol PR queda tot coherent i provat d'una tirada.
