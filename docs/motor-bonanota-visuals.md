# Motor de Visuals Interactius — BonaNotaVisuals

Especificació tècnica i guia d'integració del motor compartit (`assets/bonanota-visuals.js`) per incrustar laboratoris visuals interactius als mons d'estudi de **Bona Nota** (1r d'ESO).

## 1. Principi d'arquitectura

El sistema separa estrictament dues capes per garantir coherència sense perdre creativitat visual:

- **El xassís comú (`assets/bonanota-visuals.js`):** gestiona sempre de la mateixa manera la targeta llançadora, les incrustacions inline dins la teoria, el botó contextual dins els jocs, el modal a pantalla completa, l'auto-alçada, la persistència aïllada per alumne (`uid`) i el premi únic d'estrelles.
- **Les peces visuals a mida (`visuals/<world>.html`):** cada tema és un fitxer HTML/CSS/JS autònom creat segons `docs/guia-disseny-bona-nota.md`, carregat dins un `<iframe>` aïllat perquè els seus estils i scripts mai no interfereixin amb la plataforma principal.

## 2. API declarativa (`BonaNotaVisuals.init`)

Cada món de Bona Nota només necessita carregar `assets/bonanota-visuals.js` i cridar una única vegada `BonaNotaVisuals.init(config)`.

### Exemple d'ús (Nombres Enters)

```js
BonaNotaVisuals.init({
  world: 'enters',
  src: '../../visuals/enters.html',
  total: 6,
  icona: '🌡️',
  titol: '🌡️ Laboratori Visual · 6 fitxes interactives',
  subtitol: 'Termòmetre, recta ℤ, talons, màquina dels signes, PA·MU·SU i potències',
  rewardStars: 10,
  getUserId: () => localStorage.getItem('bn_jugador') || 'anon',
  temes: {
    positius: 1,
    recta: 2,
    sumes: 3,
    signes: 4,
    combinades: 5,
    potencies: 6
  },
  jocs: {
    termometre: 1,
    'ordre-recta': 2,
    talons: 3,
    'maquina-signes': 4,
    pamusu: 5,
    'potencies-joc': 6
  }
});
```

### Propietats de configuració

| Propietat | Tipus | Obligatòria | Descripció |
| :--- | :--- | :--- | :--- |
| `world` | `string` | Sí | Identificador únic del tema en minúscules i sense accents (ex. `geosfera`, `enters`, `fraccions`). |
| `src` | `string` | Sí | Ruta relativa al fitxer HTML del laboratori (ex. `../../visuals/enters.html`). |
| `total` | `number` | Sí | Nombre total de fitxes interactives del laboratori (habitualment 5 o 6). |
| `titol` | `string` | Sí | Títol de la targeta llançadora a la pantalla `inici()` del món. |
| `subtitol` | `string` | No | Descripció curta (1 línia) mostrada a la targeta llançadora. |
| `rewardStars` | `number` | No | Premi únic en completar el 100% del laboratori. Per defecte: `10`. |
| `temes` | `object` | Sí | Mapa `{ temaId: fitxaNum }` per incrustar cada fitxa inline dins `fitxa()`. |
| `jocs` | `object` | No | Mapa `{ jocId: fitxaNum }` per mostrar el botó contextual dins `joc()`. |
| `getUserId` | `function` | No | Funció que retorna l'identificador de l'alumne actiu (fallback `'anon'`) per aïllar progrés i connectar Supabase. |
| `onReward` | `function` | No | Callback asíncron `(payload) => Promise<boolean>` invocat **una sola vegada** en completar el laboratori per atorgar les `rewardStars` estrelles. Si no es passa, el motor fa servir l'adaptador integrat (mode segur/simulació a `localhost`, `?demo=1` o `?tast=1`). |

### Punts d'integració a les pantalles del món

1. **`inici()` — Targeta llançadora (`BonaNotaVisuals.cartaInici()`):**
   - Obre el laboratori complet dins el modal full-screen (`?embed=1&world=<world>&uid=<uid>`).
   - Mostra el badge de progrés en temps real: `(0/6)` → `(3/6)` → `✅ 6/6 · +10 ⭐`.
2. **`fitxa()` — Visual inline (`BonaNotaVisuals.inlineTemaHtml(tema)`):**
   - Incrusta només la fitxa corresponent (`?embed=1&fitxa=N&world=<world>&uid=<uid>`) amb `loading="lazy"`.
   - S'ajusta automàticament en alçada per evitar el doble scroll.
3. **`joc()` — Botó contextual (`BonaNotaVisuals.insertaBotoJoc(jocId)`):**
   - Afegeix el botó compacte **«🧪 Obre laboratori visual»** que obre la fitxa relacionada dins el modal full-screen sense fer perdre la partida en curs.
4. **Modal full-screen compartit:**
   - Bloqueja l'scroll del `<body>` en obrir-se i el restaura en tancar-se.
   - Botó de tancament amb diana tàctil mínima de `48×48 px` i suport per a la tecla `Escape`.

## 3. Contracte entre el motor i els fitxers `visuals/<world>.html`

Tot artefacte HTML creat per al motor ha de complir exactament aquest contracte de paràmetres URL i missatges `postMessage`.

### 3.1 Paràmetres URL

- `embed=1`: afegeix la classe `is-embed` al `<body>`, compacta els marges i amaga peus de pàgina innecessaris.
- `fitxa=N`: combinat amb `embed=1`, afegeix `is-single-fitxa` al `<body>`, deixa el fons transparent, amaga la barra superior, la portada i totes les fitxes excepte `#fitxa-N`.
- `world=<id>`: fixa la clau del món per als missatges i la persistència.
- `uid=<userId>`: injectat automàticament pel motor (`'anon'` per defecte) per aïllar la clau de `localStorage` dins l'`<iframe>` quan diversos alumnes comparteixen dispositiu.

### 3.2 Missatges `postMessage` (de l'iframe cap al motor pare)

Tots els missatges han d'incloure `type` i `world` perquè el motor ignori missatges d'altres iframes.

#### A. Auto-alçada (`BONANOTA_VISUAL_RESIZE`)

Emès mitjançant `ResizeObserver` sobre el contenidor principal (`.page-shell`), tant quan creix com quan s'encongeix (en obrir/tancar `<details>` o canviar de mode):

```js
window.parent.postMessage({
  type: 'BONANOTA_VISUAL_RESIZE',
  world: 'enters',
  fitxa: 5, // número de fitxa o null si és el laboratori complet
  height: Math.ceil(shell.getBoundingClientRect().height)
}, '*');
```

#### B. Progrés (`BONANOTA_VISUAL_PROGRESS`)

Emès en carregar l'estat inicial i cada vegada que l'alumne supera una fitxa:

```js
window.parent.postMessage({
  type: 'BONANOTA_VISUAL_PROGRESS',
  world: 'enters',
  explored: 4,             // nombre de fitxes superades (enter)
  total: 6,                // total de fitxes del laboratori (enter)
  completed: false,        // ESTRICTAMENT BOOLEÀ (explored >= total)
  score: null              // reservat per a futures mètriques
}, '*');
```

#### C. Tancament amb teclat (`BONANOTA_VISUAL_CLOSE`)

Emès en prémer `Escape` dins l'iframe en mode `embed=1`:

```js
window.parent.postMessage({
  type: 'BONANOTA_VISUAL_CLOSE',
  world: 'enters'
}, '*');
```

## 4. Persistència i aïllament per alumne (`uid`)

### Claus d'emmagatzematge local (`localStorage`)

- **Progrés del visual:** `bonanota_visual_<uid>_<world>` (tant al motor com dins dels fitxers `visuals/<world>.html`).
- **Marca de premi cobrat:** `bonanota_visual_reward_<uid>_<world>`.
- **Retrocompatibilitat:** només quan `uid === 'anon'`, es llegeixen com a fallback les claus antigues sense `uid` (`bonanota_visual_<world>` o `bonanota_prova_visual_<world>`).

### Format de l'estat local

```json
{
  "world": "enters",
  "uid": "maria",
  "explored": [1, 2, 5],
  "completed": [1, 5],
  "updatedAt": 1763916000000
}
```

### Regles de fusió i seguretat

- **Fallback doble dins l'artefacte:** comprova `window.notebookAppApi` només si existeix; a Bona Nota fa servir sempre `localStorage` amb `try/catch`.
- **Sincronització entre vistes:** quan se supera una fitxa dins una vista inline (`fitxa()`), l'estat s'actualitza a `localStorage` fent unió d'arrays (sense sobreescriure ni esborrar fitxes superades anteriorment des d'altres pestanyes o des del modal).

## 5. Sistema de recompenses i integració amb Supabase

### Regla de premi

- **Premi únic en completar el 100%:** `+10` estrelles (`rewardStars: 10`).
- **Condició d'activació:** `completed === true` (booleà estricte, totes les fitxes del món superades).
- **No hi ha premis parcials per fitxa** ni recompenses repetibles en prémer «Torna a jugar».

### Garantia anti-duplicats (idempotència)

Per evitar que un alumne rebi les 10 estrelles més d'una vegada (en recarregar la pàgina, reobrir el modal o repetir una fitxa), la comprovació es fa en dues capes:

1. **Capa client (`BonaNotaVisuals`):**
   - En rebre `BONANOTA_VISUAL_PROGRESS` amb `completed === true`, el motor comprova `rewardClaimed` a `localStorage` (`bonanota_visual_reward_<uid>_<world>`) i a l'estat hidratat del perfil (`S.visuals?.[world]?.rewardClaimed`), a més d'un bloqueig en memòria (`rewardInFlight`).
   - Si ja estava cobrat, actualitza només el badge (`✅ N/N · +10 ⭐`) i **no** dispara ni el premi ni la notificació.
   - Si no estava cobrat, executa `onReward` (o l'adaptador per defecte) **una sola vegada**, marca `rewardClaimed = true`, actualitza el badge i mostra una notificació neta de celebració.
2. **Capa servidor (Supabase — proposta pendent de validació):**
   - Taula `bn_priv.premis_visuals(k, reward_key, stars, ts)` amb `PRIMARY KEY (k, reward_key)` on `reward_key = 'visual_' + world`.
   - Funció RPC `public.bn_visual_premi(p_nom, p_pin, p_assig, p_reward_key, p_stars)` que valida `bn_priv.pin_ok`, insereix amb `ON CONFLICT DO NOTHING` i garanteix que les `+10 ⭐` només s'atorguin un sol cop fins i tot entre dispositius diferents.
3. **Mode segur (`?demo=1`, `?tast=1` o `localhost` sense sessió activa):**
   - Mai no executa escriptures reals a Supabase; simula la confirmació del premi en local i registra l'esdeveniment per consola.

## 6. Com afegir un laboratori a un món nou en 3 passos

1. **Desa l'artefacte visual** a `visuals/<world>.html` complint el contracte `?embed=1`, `?fitxa=N`, `?uid=<uid>`, `BONANOTA_VISUAL_RESIZE`, `BONANOTA_VISUAL_PROGRESS` (`completed` booleà) i `BONANOTA_VISUAL_CLOSE`.
2. **Afegeix el bloc opcional `visual` dins `ASSIG`** a `motor/dades/<mon>.js`:
   ```js
   visual: {
     world: "enters",
     src: "../../visuals/enters.html",
     total: 6,
     rewardStars: 10,
     icona: "🌡️",
     titol: "🌡️ Laboratori Visual · 6 fitxes interactives",
     subtitol: "Termòmetre, recta ℤ, talons, màquina dels signes, PA·MU·SU i potències",
     modalTitol: "🌡️ Els nombres enters · Laboratori Visual",
     botoJoc: "🧪 Obre laboratori visual",
     temes: { positius: 1, recta: 2, sumes: 3, signes: 4, combinades: 5, potencies: 6 },
     jocs: { termometre: 1, "ordre-recta": 2, talons: 3, "maquina-signes": 4, pamusu: 5, "potencies-joc": 6 }
   },
   ```
3. **Executa `python3 motor/tot.py`**: `motor/build.py` detecta automàticament `ASSIG.visual`, injecta `assets/bonanota-visuals.js?v=<hash>` i els ganxos d'`inici()`, `fitxa()`, `joc()` i `BonaNotaVisuals.init(...)` només en aquell món (els mons sense `visual` queden 100% intactes).

## 7. Mons integrats actualment

| Món | Fitxer visual | Fitxes | Estat |
| :--- | :--- | :--- | :--- |
| Biologia i Geologia · La Geosfera | `visuals/geosfera.html` | 6 | Actiu via `motor/dades/geosfera.js` + `motor/tot.py` |
| Matemàtiques · Els nombres enters | `visuals/enters.html` | 6 | Artefacte preparat a `visuals/` (pendent de crear el món oficial a `motor/dades/`) |
