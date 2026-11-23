# Protocol d'integració d'un laboratori visual (`BonaNotaVisuals`)

Aquest protocol s'executa automàticament sempre que l'usuari demani:
> **«Integra `<fitxer.html>` al món `<assignatura>/<mon>`»**

Referències tècniques: [docs/motor-bonanota-visuals.md](motor-bonanota-visuals.md) · [docs/guia-disseny-bona-nota.md](guia-disseny-bona-nota.md) · `assets/bonanota-visuals.js` · `motor/build.py`.

---

## Flux obligatori en 7 passos

### 1. Branca segura
- Actualitza `origin/main` i crea la branca local `visual/<mon>` des de `origin/main`.
- **NO facis `git push` ni merge a `main` sense l'ok final de l'usuari.**

### 2. Instal·lació de l'artefacte visual
- Localitza `<fitxer.html>` (ruta exacta indicada, `~/Downloads/<fitxer.html>`, arrel del repo o ja situat a `visuals/`).
- Copia'l o mou-lo a `visuals/<mon>.html`.

### 3. Auditoria i pegats automàtics del contracte `BonaNotaVisuals`
Revisa `visuals/<mon>.html` i aplica només els pegats mínims necessaris **sense alterar el disseny ni la pedagogia**:
- **Paràmetres URL:** suport per a `?embed=1`, `?fitxa=1..N`, `?world=<mon>` i `?uid=<uid>` (sanititzat, fallback `'anon'`).
  - Amb `?embed=1`: afegeix `.is-embed` al `<body>`, compacta marges i amaga peus/seccions finals innecessàries.
  - Amb `?embed=1&fitxa=N`: afegeix `.is-single-fitxa` (també a `<html>` si cal fons transparent), amaga navegació, capçalera, peu i totes les fitxes excepte `#fitxa-N`, amb `height: auto !important; min-height: 0 !important; overflow-x: clip; overflow-y: auto;`.
- **Persistència doble a `localStorage`:** clau `bonanota_visual_<uid>_<world>` (aïllada per alumne, fusió d'arrays `explored`/`completed` entre fitxes inline i modal, sense trencar quan `window.notebookAppApi` no existeix). Retrocompatibilitat opcional només si `uid === 'anon'`.
- **Contracte `BONANOTA_VISUAL_PROGRESS`:** emet `{ type: 'BONANOTA_VISUAL_PROGRESS', world, explored: <number>, total: <number>, completed: <boolean>, score: null }` on `completed` és **estrictament booleà** (`true`/`false`, mai número).
- **Auto-alçada (`BONANOTA_VISUAL_RESIZE`):** `ResizeObserver` sobre el contenidor del contingut (`.page-shell`), mesurant `Math.ceil(shell.getBoundingClientRect().height)` en mode fitxa única perquè **també s'encongeixi** en tancar `<details>` o canviar de mode, i evitant doble scroll.
- **Tancament amb `Escape`:** en mode `embed=1`, prémer `Escape` envia `{ type: 'BONANOTA_VISUAL_CLOSE', world }` a `window.parent`.

### 4. Connexió al món (`motor/dades/<dades>.js`)
- Localitza el fitxer de dades del món `<assignatura>/<mon>` a `motor/mons.json` → `motor/dades/<dades>.js`.
- Llegeix els temes (`T`) i els jocs (`ASSIG.jocs`) del món, i els títols de `#fitxa-1..N` dins `visuals/<mon>.html`.
- Afegeix el bloc declaratiu `visual` dins `ASSIG` a `motor/dades/<dades>.js` amb `rewardStars: 10` i el mapeig temàtic més coherent (o respectant el mapeig indicat per l'usuari):
  ```js
  visual: {
    world: "<mon>",
    src: "../../visuals/<mon>.html",
    total: N,
    rewardStars: 10,
    icona: "🧪",
    titol: "🧪 Laboratori Visual · N fitxes interactives",
    subtitol: "<resum curt en 1 línia>",
    modalTitol: "<títol del modal>",
    botoJoc: "🧪 Obre laboratori visual",
    temes: { /* temaId: fitxaNum */ },
    jocs: { /* jocId: fitxaNum */ }
  },
  ```
- `motor/build.py` injectarà automàticament `assets/bonanota-visuals.js?v=<hash>`, `cartaInici()`, `inlineTemaHtml(t)`, `insertaBotoJoc(j.id)` i `BonaNotaVisuals.init(...)` (sense tocar els mons que no defineixin `visual`).

### 5. Regeneració i control d'impacte
- Executa `python3 motor/tot.py`.
- Comprova amb `git diff --stat` que cap altre món existent s'ha alterat indegudament (la resta de mons només poden tenir el canvi d'1 línia del hash `VER` de `tot.py`).
- Passa `node motor/prova-tot.js base` per assegurar que totes les comprovacions del motor surten en verd.

### 6. Verificació automatitzada amb Playwright (mòbil `390×844` i iPad `768×1024`)
- **0 errors** de consola o de pàgina i **0 scroll horitzontal**.
- **Auto-alçada inline** sense doble scroll (inclòs obrir i tancar `<details>` i canviar de mode) i **modal full-screen** operatiu (botó tancar `>= 48px` + tecla `Escape`).
- **Aïllament per `uid`:** el progrés amb `?uid=alumneA` no apareix en obrir `?uid=alumneB`.
- **Premi únic `+10 ⭐` (mock de `rpc('bn_visual_premi')`):**
  - `awarded: true` → suma `+10 ⭐` exactament 1 cop, anima el marcador (`#bnVisualModalPunts` / `#punts`), actualitza el badge a `✅ N/N · +10 ⭐` i bloqueja duplicats.
  - `already_claimed: true` → marca `rewardClaimed = true` i badge `✅ N/N · +10 ⭐` sense tornar a sumar estrelles ni mostrar toast.
  - `ok: false` → no marca `rewardClaimed = true` i permet reintentar després.

### 7. Entrega concisa
Aixeca el servidor HTTP local (`python3 -m http.server 8080`) i retorna **només**:
1. **(a) Taula curta** del mapeig `fitxa → tema inline / joc modal`.
2. **(b) Resultat de Playwright** (mòbil `390×844` i iPad `768×1024`).
3. **(c) URL local de prova** (ex. `http://localhost:8080/<assignatura>/<mon>/?demo=1`).
