# Pla mestre · Disseny i format de joc per al correu de recuperació de PIN

28/11/2026 · Versió actual 2.81.0 · Especificació de disseny i implementació per al missatge i correu HTML de lliurament de PIN generat des de `/admin/` (`admin/index.html`) i opcionalment enviat via Resend (`supabase/functions/`).

**Estat:** decisions preses el 28/11/2026 (Fase 1 aprovada; Fase 2 de Resend reservada per quan s'activi `RESEND_API_KEY`). **Fase 1 completada** a `g44` (`v2.82.0`) i ampliada a `g45` (`v2.83.0`) amb esborrany `.eml` preomplert (`com.apple.mail-draft` + `X-Unsent: 1`) i redacció unificada en 3a persona.

**En poques línies.** El flux de recuperació de PIN (`v2.80.0` + `v2.81.0`) ja funciona de cap a cap, però el missatge que es copia o s'obre al correu (`textMissatgePin()` a `admin/index.html`) és un text pla funcional sense identitat visual de Bona Nota. Per donar-li **format de joc (estètica arcade neta per a 12–13 anys, coherent amb `docs/guia-disseny-bona-nota.md`)** cal tenir en compte una limitació real del correu electrònic:
- Els enllaços `mailto:?body=...` **només admeten text pla** (cap client de correu renderitza HTML dins d'un `mailto:`).
- Per enviar un **correu HTML visual de debò** hi ha dos camins totalment compatibles que comparteixen el mateix disseny:
  1. **Fase 1 (0 servidor, 0 cost, immediat):** copiar el correu com a **HTML enriquit + text pla al porta-retalls** (`ClipboardItem` amb `text/html` i `text/plain`), amb previsualització dins el modal d'`/admin/`. En fer `Cmd+V` dins **Gmail, Apple Mail o Outlook**, s'enganxa la targeta HTML arcade completa; en enganxar-lo a **WhatsApp**, s'enganxa automàticament la versió text pla amb format de joc!
  2. **Fase 2 (opcional, enviament en 1 clic):** Edge Function `supabase/functions/envia-pin/index.ts` via **Resend** (reutilitzant el patró de `supabase/functions/avisa-suggeriment/index.ts`) per enviar directament el mateix correu HTML des de `hola@bonanota.net` sense obrir cap client extern.

---

## 1. Com és ara (el codi)

| Peça | On | Estat actual | Limitació |
|---|---|---|---|
| **Generador de text** | `admin/index.html:2715-2727` (`textMissatgePin`) | Text pla neutre («Hola! Aquí tens el nou PIN temporal…»). | Correcte i clar, però sec: no transmet la identitat visual ni el to amable de Bona Nota. |
| **Còpia al porta-retalls** | `admin/index.html:2728-2732` (`copiaText`) | Només `navigator.clipboard.writeText(txt)` (text pla). | No aprofita `ClipboardItem` (`text/html`) per enganxar una targeta visual a Gmail / Apple Mail / Outlook. |
| **Botó de correu** | `admin/index.html:2803-2820` (`#mpMail`) | Enllaç `mailto:` amb `body` en text pla. | `mailto:` mai suporta HTML; però sí que pot portar un text pla amb format visual molt més polit i assumpte temàtic. |
| **Enviament per Resend** | `supabase/functions/avisa-suggeriment/index.ts` | Ja existeix una Edge Function preparada per a `RESEND_API_KEY` i `FROM_EMAIL`. | Només avisa l'admin dels suggeriments nous; encara no envia correus de sortida a les famílies. |

---

## 2. Disseny del correu (identitat visual Bona Nota)

### 2.1 Principis de disseny (`docs/guia-disseny-bona-nota.md`)
- **To 12–13 anys + família:** estètica de joc fosca, neta i polida (*zero* dibuixos infantils ni confeti exagerat). Parla a la família amb calma i fa il·lusió a l'alumne (*«Clau d'accés desbloquejada»*).
- **Micro-fragmentació:** cap paràgraf de més de 2 línies; es pot llegir i executar en menys de 15 segons des del mòbil.
- **Zero imatges externes i zero rastrejadors:** tot fet amb HTML/CSS pur i emojis estàndard, de manera que **no queda bloquejat** per l'avís *«Mostra imatges»* de Gmail o Apple Mail i es carrega instantàniament.
- **Compatibilitat real de clients de correu (Gmail web/app, Apple Mail iOS/macOS, Outlook):**
  - Maquetació amb **`<table>` i estils 100 % inline** (sense `<style>`, sense `display: flex` ni `grid` que Outlook o alguns clients eliminen).
  - Amplada màxima **`560 px`**, centrada, amb `padding` generós per al mòbil.
  - Colors sòlids amb alt contrast (≥ 7:1) que es llegeixen perfectament tant en mode clar com en mode fosc del client de correu.

### 2.2 Paleta oficial de Bona Nota per al correu
| Element | Color | Ús |
|---|---|---|
| Fons exterior targeta | `#0b1033` | Cel espacial arcade (mateix fons de `index.html` i `suggeriments/index.html`) |
| Caixa interior | `#131b4d` / `#162058` | Panells de passos i tranquil·litat |
| Or arcade | `#facc15` | Estrelles, vora de la caixa del PIN, xips numèrics i botó principal |
| Vermell ombra arcade | `#b91c1c` | Vora inferior 3D del botó CTA (`border-bottom: 4px solid #b91c1c`) |
| Verd èxit | `#4ade80` / fons `#12352b` | Franja de tranquil·litat («No perds cap estrella ni el teu perfil») |
| Text principal / secundari | `#f8fafc` / `#cbd5e1` | Lectura nítida sobre fons fosc |
| Text sobre groc | `#1e1b4b` | Contrast màxim dins el botó i els números `1`, `2`, `3` |

### 2.3 Anatomia de la targeta HTML arcade (5 blocs)

```text
┌──────────────────────────────────────────────────────────┐
│  ★  BONA NOTA · 1r d'ESO  ★                              │  ← Capçalera compacta
│                                                          │
│  🔑 CLAU D'ACCÉS DESBLOQUEJADA                           │  ← Títol principal (#facc15)
│  Hola! Aquí tens la nova clau per a Mireia.              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🛡️ Totes les teves ⭐ estrelles, el #ID i el perfil│  │  ← Franja verda tranquil·litat
│  │    arcade continuen intactes al núvol.             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌ - - - - - - - - - - - - - - - - - - - - - - - - - ┐   │
│  │        EL TEU PIN TEMPORAL (D'UN SOL ÚS)          │   │  ← Caixa destacada (#0b1033)
│  │                                                   │   │     vora discontínua #facc15
│  │                   2 3 9 0 K                       │   │     monoespai 32 px
│  └ - - - - - - - - - - - - - - - - - - - - - - - - - ┘   │
│                                                          │
│  🎯 3 PASSOS PER TORNAR A JUGAR                          │
│  [1] Entra a bonanota.net (si ja veus el teu nom a       │  ← 3 files amb xip daurat
│      dalt, prem primer «No ets tu?»).                    │
│  [2] Escriu «Mireia» i el PIN 2390K, i prem «Entra ▶».   │
│  [3] Inventa't el teu PIN personal nou (4 números +      │     *(o «Ja pots jugar!» si
│      1 lletra) i apunteu-lo junts!                       │      és PIN definitiu)*
│                                                          │
│            ┌──────────────────────────────┐              │
│            │   ENTRAR A BONA NOTA  ▶      │              │  ← Botó CTA clicable
│            └──────────────────────────────┘              │     (enllaç a bonanota.net)
│                                                          │
│  📱 Si jugaves en un altre mòbil o tauleta, prem-hi      │  ← Recordatori discret
│     «No ets tu?» i entra amb el PIN nou.                 │
│                                                          │
│           ★  Bona Nota · https://bonanota.net  ★         │  ← Peu minimalista
└──────────────────────────────────────────────────────────┘
```

- **Variant PIN definitiu (`esTemp = false`):**
  - L'etiqueta de la caixa canvia a `EL TEU NOU PIN D'ACCÉS`.
  - El pas 3 canvia a: *«Ja entraràs directament amb tot el progrés al núvol. Apunteu el PIN en un lloc segur!»*
- **Assumpte recomanat del correu:**
  - Amb referència de Bústia: `🔑 [Bona Nota · SUG-042] Clau d'accés temporal per a Mireia`
  - Sense referència: `🔑 [Bona Nota] Clau d'accés temporal per a Mireia`

### 2.4 Versió Text Pla amb format de joc (per a `mailto:` i WhatsApp)

```text
★ BONA NOTA · CLAU D'ACCÉS DESBLOQUEJADA ★

Hola! Aquí tens la nova clau temporal per a «Mireia» (les seves ⭐ estrelles, el #ID i el perfil arcade continuen intactes!).

━━━━━━━━━━━━━━━━━━━━
🔑 PIN TEMPORAL:  2390K
━━━━━━━━━━━━━━━━━━━━

🎯 3 passos per tornar a jugar:
1️⃣ Entra a https://bonanota.net (si ja surt el teu nom a dalt, prem primer «No ets tu?»).
2️⃣ Escriu «Mireia» i aquest PIN (2390K), i prem «Entra ▶».
3️⃣ Tot seguit et demanarà inventar-te el teu PIN personal nou (4 números i 1 lletra al final) — apunteu-lo junts!

📱 Altres dispositius: si jugava en un altre mòbil o tauleta, prem-hi «No ets tu?» i entra amb el PIN nou.

★ Bona Nota · https://bonanota.net ★
```

---

## 3. Integració a `/admin/` (`admin/index.html`)

Al Pas 2 del modal `obreModalPin()` (pantalla de confirmació d'un sol ús):
1. **Funcions pures noves:**
   - `textMissatgePin(nom, pin, esTemp)` → actualitzada al nou format de joc (2.4).
   - `htmlCorreuPin(nom, pin, esTemp, ref)` → genera la targeta HTML amb taules i estils inline (2.3), escapant sempre `nom` i `ref` amb `esc()` (zero risc XSS).
   - `copiaCorreuHtml(html, text, okMsg)` → fa servir `navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })])`, amb fallback automàtic a `copiaText(text, ...)` si el navegador no suporta `ClipboardItem`.
2. **Botons de lliurament al modal:**
   - **`📋 Copia el PIN`** (només el codi, ex. `2390K`).
   - **`✨ Copia correu arcade`** (HTML enriquit per enganxar a Gmail / Apple Mail / Outlook + text pla per a WhatsApp).
   - **`✉️ Obre correu preomplert`** (quan hi ha `opts.email` des de Bústia; obre `mailto:` amb assumpte + text pla format joc, i un avís petit: *«Consell: prem «Copia correu arcade» i fes Cmd+V al cos del correu per posar-hi la targeta visual!»*).
3. **Previsualització plegable dins el modal:**
   - `<details id="mpPrevWrap"><summary>👀 Previsualitza el correu arcade</summary><div id="mpPrev">…</div></details>`
   - Renderitza la targeta real (en un contenidor segur amb `esc()` i sense scripts) perquè l'admin vegi a l'instant com arribarà a la família.

### Fase 2 (opcional): Enviament directe en 1 clic via Resend
Si més endavant vols enviar el correu HTML directament des de `/admin/` sense obrir Gmail ni fer `Cmd+V`:
- Nova Edge Function `supabase/functions/envia-pin/index.ts`:
  - Valida l'admin cridant `bn_admin_usuari(..., 'estat')` (o `bn_priv.admin_ok`) amb `p_email`/`p_pass` — mai oberta a anònims.
  - Envia el mateix `htmlCorreuPin` + `textMissatgePin` via `https://api.resend.com/emails` (`from: "Bona Nota <hola@bonanota.net>"`).
  - **Mai registra ni desa el PIN** en cap log de Deno ni taula.
  - Al modal de `/admin/` apareix un botó **`🚀 Envia correu ara`** quan hi ha destinatari (i es mostra només si la funció està activa).

---

## 4. Fases i proves

| Fase | Què | Fitxers principals | Mida |
|---|---|---|---|
| **1** | **Disseny arcade HTML + text pla + còpia enriquida + previsualització a `/admin/`:** `htmlCorreuPin()`, `textMissatgePin()` millorat, `copiaCorreuHtml()` amb `ClipboardItem`, previsualització plegable al modal, ampliació de `motor/prova-admin-pin.js`, `CHANGELOG.md` (`2.82.0`) i regeneració | `admin/index.html`, `motor/prova-admin-pin.js`, `CHANGELOG.md`, `README.md`, `docs/ESTAT.md` | S |
| **2** | *(opcional)* **Enviament directe en 1 clic amb Resend:** `supabase/functions/envia-pin/index.ts` + botó «🚀 Envia correu ara» al modal | `supabase/functions/envia-pin/index.ts`, `admin/index.html` | S-M |

### Proves previstes (Fase 1)
- Ampliació de **`motor/prova-admin-pin.js`** (Playwright):
  - Comprova que el modal de confirmació mostra els botons `#mpCopiaPin`, `#mpCopiaHtml` (*«Copia correu arcade»*) i la previsualització `#mpPrevWrap`.
  - Obre `#mpPrevWrap` i comprova que la targeta HTML conté el PIN generat, el nom de l'alumne escapat (prova XSS), la franja de tranquil·litat, els 3 passos i l'enllaç a `https://bonanota.net`, sense desbordament a 360 i 390 px.
  - Comprova que l'enllaç `mailto:` des de Bústia porta el nou assumpte `🔑` i el nou text pla estil joc.
- **`node motor/prova-tot.js base`** + **`node motor/prova-admin-pin.js`** en verd en local abans del push.

---

## 5. Criteris de fet

- Enganxar (`Cmd+V`) després de clicar **«✨ Copia correu arcade»** dins Gmail, Apple Mail o Outlook mostra la targeta visual fosca amb el PIN en groc daurat, els 3 passos i el botó clicable `ENTRAR A BONA NOTA ▶`.
- Enganxar-lo a WhatsApp (o obrir `mailto:`) mostra automàticament la versió text pla polida amb estètica de joc.
- Zero imatges externes bloquejables, zero XSS i 0 canvis d'SQL a Supabase (Fase 1).
- Totes les proves passen en verd.

---

## 6. Decisions que has de prendre abans d'implementar

1. **Vols fer primer només la Fase 1 (còpia HTML arcade + text pla estil joc + previsualització al modal, 0 configuració externa)?**
   - *Recomanat:* Sí — funciona avui mateix a Gmail, Apple Mail, Outlook i WhatsApp sense configurar Resend ni claus d'API.
2. **T'agrada el to i l'encapçalament «🔑 CLAU D'ACCÉS DESBLOQUEJADA» (arcade net 12–13 anys), o prefereixes un to una mica més neutre («🔑 Nou PIN temporal per a Mireia»)?**
   - *Recomanat:* «🔑 CLAU D'ACCÉS DESBLOQUEJADA» amb el subtítol tranquil·litzador per a la família — té el toc de joc que busques sense ser infantil.
3. **Vols també la Fase 2 (Edge Function de Resend per enviar el correu directament des de `/admin/` en 1 clic)?**
   - *Recomanat:* Només si ja tens `RESEND_API_KEY` i domini `bonanota.net` verificat a Resend; si no, fem la Fase 1 ara (`g44` · `v2.82.0`) i deixem la Fase 2 llesta per quan activis Resend.
