# Pla Mestre — Bona Nota per cursos (1r ESO → 2n ESO, setembre 2027)

Data: 2026-11-26 · Estat: **proposta** (cap codi tocat encara)

## 1. On som i on volem arribar

**Ara (v2.7x):**

```
bonanota.net/            ← portada única = 1r ESO (entrada nom+PIN, mons, rànquing, xat)
  ├─ pestanyes de trimestre (data-trimestre, TRIM_ACTIU = el trimestre més alt que té mons)
  └─ /sociales/t3-clima/, /matematiques/enters/, …   ← 9 mons, tots "trimestre": 1
```

- `motor/mons.json` és l'única font de cada món i ja té `trimestre`. No té cap camp de curs.
- La identitat del nen és **el nom** (`bn_priv.perfils.k = lower(nom)`) + PIN, i el progrés és `(k, assig)`.
- El rànquing (`bn_ranking_mons`) suma `bn_log` per `nom` i `assig` dels **últims 120 dies**, sense saber de cursos.
- `index.html` fa ~2.500 línies escrites a mà, amb blocs generats (`MONS`, `XAT-MONS`) al mig.

**Setembre 2027:**

```
bonanota.net/            ← porta d'entrada: nom+PIN → va sol al curs del nen; sense nen, tria el curs
  ├─ /1eso/              ← portada de 1r ESO (mons, trimestres, rànquing i xat propis)
  ├─ /2eso/              ← portada de 2n ESO (mateix motor, fons animat diferent)
  └─ els mons de 1r continuen a les adreces d'ara; els de 2n, a /2eso/<assignatura>/<tema>/
```

## 2. Decisions de fons (proposades; cal confirmar-les — §8)

| # | Decisió | Per què |
|---|---|---|
| D1 | **Els mateixos usuaris** a tots els cursos. El curs és un atribut del perfil (`curs_actual`), no un compte nou. | La colla passa de 1r a 2n junta. No perden nom, PIN, avatar, cartes ni estrelles de per vida (el perfil arcade i els premis de `/perfil/` segueixen sumant). |
| D2 | **Rànquing, xat, meta de la colla i «Dies» propis de cada curs.** | La competició té sentit entre companys del mateix curs; un de 2n no ha de trepitjar els de 1r si n'hi ha de nous. |
| D3 | El rànquing de cada curs és **del curs escolar** (de setembre a juny), no de 120 dies mòbils. En acabar, queda congelat com a «Saló de la fama 2026-27». | Tancament net. No és una mecànica de pèrdua (ADR-0007): ningú perd res, el passat queda guardat i visible. |
| D4 | **No es mou cap adreça d'un món que ja existeix.** Els mons de 1r es queden on són; els nous de 2n van a `/2eso/…`. | No es trenquen preferits, PWA instal·lades, `localStorage` (`bn_<id>`), el log ni les captures de la CI. |
| D5 | L'**id de món és únic a tot el web** (no per curs). Els de 2n porten prefix: `e2-…` (p. ex. `e2-algebra`). | `localStorage`, `bn_log.assig`, `progres.assig` i el xat es claven per id; així no cal migrar res. |
| D6 | Una **sola plantilla de portada** generada per a cada curs (com ja es fa amb els mons). Res de copiar `index.html`. | Dues còpies de 2.500 línies divergirien al primer arranjament. |
| D7 | Els mons d'un curs passat queden **en mode arxiu**: es poden obrir i repassar, sumen estrelles de per vida, però no compten al rànquing del curs nou. | Repassar 1r a 2n és útil (mates, llengua) i no fa mal a ningú. |

## 3. Model de dades nou

### 3.1 `motor/cursos.json` (nou, única font de cada curs)

```json
[
  {"id":"1eso","nom":"1r d'ESO","carpeta":"1eso","estat":"actiu",
   "inici":"2026-09-01","fi":"2027-06-30","trimestres":3,
   "fons":"estels","colors":["#0f172a","#2563eb","#38bdf8"],"ic":"🚀"},
  {"id":"2eso","nom":"2n d'ESO","carpeta":"2eso","estat":"aviat",
   "inici":"2027-09-01","fi":"2028-06-30","trimestres":3,
   "fons":"aurora","colors":["#1e1b4b","#7c3aed","#f472b6"],"ic":"🛸"}
]
```

- `estat`: `aviat` (no surt a la porta, només amb `?curs=2eso&demo=1`), `actiu`, `arxiu` (D7).
- `fons`: nom d'una animació de fons de la portada (vegeu §5). Un curs = un fons propi.

### 3.2 `motor/mons.json`

- Camp nou obligatori **`curs`** (`"1eso"` per als 9 actuals; `registres.py` l'omple si falta, una sola vegada).
- `registres.py` valida: `curs` existeix a `cursos.json`, `trimestre` ≤ `trimestres` del curs, id únic global, prefix `e2-` si `curs = 2eso`, carpeta sota `2eso/` per a cursos ≠ `1eso`.
- `nou_mon.py` i la skill `nou-mon` reben `--curs` (per defecte, l'últim curs `actiu`).

### 3.3 Supabase

| Peça | Canvi |
|---|---|
| `bn_priv.perfils` | columna `curs_actual text` (per defecte `'1eso'`), funció `bn_perfil_curs_desa(nom, pin, curs)`. |
| `bn_priv.mons_curs(assig, curs)` | taula **generada** per `registres.py` (bloc `MONS-CURS` a `supabase/bn_cursos.sql`, com ja passa amb `XAT-MONS`). |
| `bn_priv.cursos(id, inici, fi, estat)` | igual, generada de `cursos.json`. |
| `bn_ranking_mons(p_codi, p_curs default '1eso')` | filtra `assig in mons_curs del curs` i `ts` entre `inici` i `fi` del curs (D3). Sense `p_curs` es comporta com avui → compatibilitat mentre conviuen versions. |
| `bn_ranking_remuntada`, xat (`bn_xat_*`), meta de la colla, `bn_estat_web` | paràmetre `p_curs` amb el mateix criteri. Missatges de xat amb columna `curs`. |
| `bn_admin_*` | filtre per curs al tauler (Inici, Nens, Mons, Rànquing, Xat). |

Les proves `*-sql.js` amb PGlite cobreixen cada funció nova abans d'aplicar-la.

## 4. Portades: d'`index.html` a plantilla

```
motor/portada/plantilla-portada.html   ← l'index.html d'ara, amb {{CURS}}, {{FONS}}, {{MONS}}, {{XAT-MONS}}…
motor/portada/porta.html               ← la porta d'entrada nova (petita)
motor/tot.py →  index.html  (porta)     + 1eso/index.html  + 2eso/index.html
```

- Tot el JavaScript comú de portada (rànquing, xat, trimestres, entrada) passa a `motor/eines/portada.js`, carregat per les dues portades (com `sprites.js`).
- La **porta** (`/`): si hi ha `bn_jugador` al dispositiu i el seu `curs_actual` és conegut → redirigeix a `/<curs>/` a l'instant. Si no → entrada nom+PIN i, després, cap al curs del perfil. Si el perfil no en té (o és un tast) → dues targetes grans «1r ESO / 2n ESO».
- Cada portada de curs té un petit selector «Canvia de curs» (per repassar l'arxiu o germans).
- `sw.js`, `versio.json`, `manifest.webmanifest` i `404.html` s'adapten (start_url `/` = la porta).
- Els mons llegeixen el curs del seu `mons.json` i el botó «Torna» porta a `/<curs>/`, no a `/`.

## 5. Fons animat per curs

- `motor/eines/fons.js` amb un registre `BN_FONS = {estels(){…}, aurora(){…}}`: cada fons és una funció que pinta en un `<canvas>` o amb CSS darrere la portada.
- Regles: respecta `prefers-reduced-motion` i el **mode suau** de nit (BON-US: res de moviment), ≤ 1 % de CPU en repòs, s'atura amb `visibilitychange`, i la prova visual (360/390/430 px) passa sense scroll horitzontal.
- 1r ESO conserva exactament l'aspecte actual (el fons d'ara passa a dir-se `estels`).

## 6. Fases

Cada fase és un PR (o pocs) amb `tot.py` i proves en verd, publicable sola i **sense canvis visibles per als nens fins a la Fase 4**.

| Fase | Quan | Què | Prova que ho tanca |
|---|---|---|---|
| **0 · 2n trimestre** | des. 2026 | Res d'estructural: els mons nous porten `"trimestre": 2` i la portada ja canvia sola de pestanya (`TRIM_ACTIU`). Revisar que els mons de T1 queden a «Mons anteriors» i que el rànquing no canvia. ADR-0010 amb les decisions D1–D7 confirmades. | `prova-visual` amb un món de T2 de prova. |
| **1 · Dades** | gen. 2027 | `cursos.json`, camp `curs` a `mons.json`, validacions a `registres.py`, `--curs` a `nou_mon.py`/skill. Sortida generada idèntica. | `prova_registres.py`, `prova_nou_mon.py`, `prova-mons.js`; `tot.py` no canvia cap pàgina. |
| **2 · Plantilla de portada** | feb.–mar. 2027 | `index.html` → `motor/portada/plantilla-portada.html` + `motor/eines/portada.js`; `tot.py` genera `index.html` igual que ara (encara a l'arrel, només 1r). Refactor pur. | Totes les proves E2E de portada, xat i tast idèntiques; diff visual zero a les captures. |
| **3 · Supabase per cursos** | mar.–abr. 2027 | `bn_cursos.sql` (taules generades, `curs_actual`), `p_curs` a rànquing, remuntada, xat, meta i admin. Valor per defecte `'1eso'` → la web d'ara no s'adona de res. | Proves `*-sql.js` noves (dos cursos amb nens i mons barrejats), `prova-regles.js`. |
| **4 · Porta i `/1eso/`** | abr.–mai. 2027 | Porta d'entrada a `/`, portada de 1r a `/1eso/`, selector de curs, `2eso` en estat `aviat` (només demo), `fons.js`. Primera vegada que els nens veuen un canvi: entren igual i arriben al mateix lloc. | E2E de la porta (amb i sense nen, tast, 2 noms per aparell), PWA instal·lada antiga que segueix funcionant, `prova-404`. |
| **5 · Assaig de 2n** | jun. 2027 | Un món de prova `e2-prova` a `/2eso/` (estat `aviat`), rànquing i xat de 2n buits, tauler amb filtre de curs. Guia `/pares/` actualitzada. | Matriu `mons` de la CI amb un món de 2n; `prova-admin-*` amb filtre. |
| **6 · Canvi de curs** | jul.–ago. 2027 | `motor/canvi_curs.py`: posa `2eso` en `actiu`, `1eso` en `arxiu` (o el deixa `actiu` si hi ha alumnes nous de 1r — §8), congela el «Saló de la fama 2026-27» i proposa `curs_actual = 2eso` per als nens de la colla (des del tauler, nen a nen o tots alhora). | Prova del guió en un repo temporal (com `prova_publica.py`). |
| **7 · Primer món de 2n** | set. 2027 | `nou-mon --curs 2eso` des de la carpeta de Drive; flux de sempre. | CI en verd i publicació automàtica. |

## 7. Riscos i com es tallen

- **PWA i còpies velles** de la portada a l'arrel: `actualitza.js` ja força recàrrega; la porta nova manté els mateixos IDs d'entrada perquè una còpia vella no es quedi encallada.
- **Rànquing que canvia de cop** en passar de 120 dies a curs escolar: s'aplica a la Fase 3 només per a cursos que comencen després d'avui; per a `1eso` l'inici és `2026-09-01`, i en la pràctica dona el mateix resultat (tot el log és de novembre).
- **Germans en cursos diferents** al mateix aparell: el límit de 2 noms es manté; la porta tria el curs de cada nom, no de l'aparell.
- **Ids de món duplicats** entre cursos: impossible per validació (D5).
- **Feina doble a `index.html`** durant la Fase 2: congelar canvis grans a la portada aquelles 2 setmanes; els arranjaments petits es fan directament a la plantilla.

## 8. Preguntes obertes (abans de l'ADR de la Fase 0)

1. El curs vinent, **hi haurà alumnes nous a 1r** (una colla nova) o 1r queda només com a arxiu? El pla serveix per a tots dos casos; canvia l'estat de `1eso` a la Fase 6.
2. **Xat**: un per curs (proposat) o un de compartit entre tots?
3. Estrelles a la portada: total **del curs** (proposat) amb el total de per vida a `/perfil/`, o al revés?
4. Adreça dels cursos: `/1eso/` i `/2eso/` (proposat) o `/1r-eso/`, `/2n-eso/`?
5. Quin fons animat vols per a 2n? (Proposta: «aurora» lila i rosa; 1r es queda amb l'actual.)
