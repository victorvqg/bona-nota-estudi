# 👾 Bosses, celebracions i variants per a nous mons

Com funcionen els **efectes especials amb moviment i música WebAudio** de Bona Nota (tant en vèncer el **Boss de cada món** com a les **5 festes del rànquing**) i **com configurar-los o inventar variants noves** en crear qualsevol món futur sense tocar el motor. Per a la llista de comprovació completa d'un món sencer, vegeu [`NOU-MON.md`](NOU-MON.md).

---

## 1. Com funciona el combat i la celebració d'un Boss

Cada combat té **10 rondes de test i jocs** (sense pregunta oberta; les obertes continuen a la seva pestanya). Cada encert dispara un projectil fins al Boss (**Combat Pro** amb GSAP 3.13 en local), amb aturada d'impacte (`70 ms` normal; `150 ms` al crític), flaix blanc, aixafar/estirar, retrocés, número en positiu (`+12`, `+18!`) i barra de vida animada només amb `transform`. **3 encerts seguits** fan un **⚡ COP CRÍTIC** amb dany real **×1,5** (el número mostrat és sempre el que es resta) i un combat sense cap error (0 cors perduts) venç el Boss sempre (amb un **⚡ COP FINAL** si encara li quedava vida a l'última ronda). Quan el nen falla, el Boss s'anticipa i executa la seva peça d'atac, el cor perdut es parteix en dues meitats i, quan només en queda 1, fa doble batec. Al final (`#bossFi`) surt una franja amb les rondes jugades (`✅` cop sencer · `⚡` crític · `½` mig cop · `❌` error), el dany en `+` i la suma total («Has fet +X de Y»).

### Motor d'animació: GSAP 3.13 local (`lib/gsap/`)
- Fitxers servits en local (sense CDN) i desats a la memòria de `sw.js` per funcionar sense connexió: `gsap.min.js`, `MotionPathPlugin.min.js`, `SplitText.min.js`, `Physics2DPlugin.min.js` i `CustomEase.min.js`.
- **Pes total:** `110,7 KB` sense comprimir (`45,1 KB` gzip). **Només es carrega en entrar al Boss** (càrrega diferida a `carregaGsap()`): zero pes a la portada, fitxes, targetes, tests o altres jocs.
- **Llicència:** Standard «No Charge» GSAP License (des de GSAP 3.13.0, inclòs tot el nucli i els plugins de moviment/física/text per a web educativa gratuïta i sense pagament d'accés; https://gsap.com/community/standard-license/).

### Celebració D+ (pantalla completa · ~14,5 s en 3 actes)
Quan l'alumne venç el Boss d'un món (`B.hp <= 0` a `bossFi()`, a `motor/plantilla-estudi-interactiu.html`):

1. Es desa la victòria (`+20 ⭐` + `+1 ⭐` per cada cor que queda, fins a `+23 ⭐` com a màxim un cop al dia, `S.boss.v++`, medalla `🏆 N` a `.boss-carta`) i s'escriu `#bossFi` al DOM.
2. A **pantalla completa** (`position: fixed`, damunt de tota la web, bloquejant l'scroll i amb els colors del món) s'obre durant **~14,5 segons** la capa `.boss-festa` escrita amb etiquetes GSAP i síntesi WebAudio v3 (ADSR amb *sustain*, `metallPro`, `corda`, `timbala`, `plat`, `brillant` i efectes afinats en l'escala pentatònica de cada música):
   - **Acte I (0,0–4,0 s):** **`cop`** (impacte blanc i negre + tall diagonal + sub-cop net) → **`agonia`** (*riser* ascendent amb timbala i la peça `mort` del món: `pixels`, `goma` o `esvaeix`) → **`trenca`** (càmera lenta + explosió + 0,7 s d'aire) → **`boti`** (20 estrelles pixel-art reboten a terra amb accents afinats).
   - **Acte II (4,0–9,6 s):** **`segell`** (el rètol `rotul` cau com un segell + fanfara WebAudio ampliada `mus`/`notes` pel bus `BG`, 80 ms després del cop per evitar saturació) → **`recompte`** (les 20 estrelles volen al marcador tocant l'escala pentatònica del món) → **`cors`** (els cors de sobres giren com una moneda i es tornen estrelles amb arpegis harmònics).
   - **Acte III (9,6–14,5 s):** **`medalla`** (la copa cau amb aixafament + halo daurat + **Coda musical** sincronitzada + 1a salva de canons de confeti) → **`gloria`** (2a salva de confeti amb les partícules `em` del món i flotació suau fins al tancament automàtic).
3. En tocar qualsevol punt de `.boss-festa` (o en canviar de pantalla) la celebració i la música es tanquen a l'instant amb *fade-out* suau, es desbloqueja l'scroll i es torna exactament a `#bossFi`, amb el botó **`🎬 Celebració`** per tornar-la a veure sencera sense sumar estrelles.
4. **Vistes prèvies d'1 clic (sense guardar res, sense sumar ⭐ ni escriure a Supabase):**
   - **`?demoCombat=1`**: entra directe al combat en viu del món (també accepta `&tret=…&atac=…&mort=…`).
   - **`?demoBoss=1`**: dispara la Celebració D sencera (també accepta `&tret=…&atac=…&mort=…` i `&fase=1..5` per a una fase concreta).
   - Exemple: `https://bonanota.net/sociales/comarques/?demoCombat=1` · `https://bonanota.net/sociales/comarques/?demoBoss=1`

### Filtre de Bon Ús (`docs/BON-US.md` §6)
- **Zero atzar / zero caixes sorpresa:** el motor tria les peces de manera determinista; cada món té el seu combat i la seva celebració fixos i previsibles.
- **Topall diari intacte:** guanyar dóna `+20 ⭐` + `+1 ⭐` per cada cor que queda (màx. `+23 ⭐`) un sol cop al dia; repetir el Boss o prémer `🎬 Celebració` és lliure i no suma estrelles.
- **Mode suau i nit (`SUAU` / `prefers-reduced-motion`):** zero animacions ni partícules al combat; a la victòria es mostra només la banda estàtica i tranquil·la (`.boss-festa.quiet`) amb el resum d'estrelles i cors a dalt de `#bossFi`.
- **Volum (`VOL === 0`):** silenci total si el so de l'app està apagat (tots els efectes passen pels busos `SB` i `BG` del motor).

---

## 2. Catàleg de peces i els 8 Bosses actuals

El motor (`motor/plantilla-estudi-interactiu.html`, `BOSS_PECES_CAT`) té **3 peces × 3 opcions**. Quan es crea una peça nova, s'afegeix sempre al catàleg del motor, mai dins les dades d'un món:

| Peça | Opcions al catàleg | Què fa |
|---|---|---|
| `tret` | `estrella` · `rosa` · `llapis` | Projectil que surt de la resposta correcta cap al Boss |
| `atac` | `embat` · `taca` · `ensurt` | Atac del Boss quan el nen falla i perd un cor |
| `mort` | `pixels` · `goma` · `esvaeix` | Com cau el Boss entre `agonia` i `trenca` a la Celebració D |

### Regla determinista del motor (`bossPeces(c)`)
Si un món no fixa cap peça a `ASSIG.boss`, el motor les tria sol (sense atzar):
- **`mort`** segons `fx`: `explosio | blocs | orbites` → **`pixels`** · `esborra | espiral` → **`goma`** · `focus | tempesta` → **`esvaeix`**.
- **`tret`** segons la matèria: llengües (`catala`, `castellano`, `angles`) → **`llapis`** · la resta → **`estrella`**.
- **`atac`** segons `spr`: `fantasma | borrasca` → **`ensurt`** · `monstre | signes | faltas` → **`taca`** · la resta (inclòs `pix` propi) → **`embat`**.

Si un món vol fixar alguna peça concreta (com Comarques amb `tret:"rosa"`), només cal posar `tret`, `atac` i/o `mort` dins `ASSIG.boss`. `node motor/revisa-mon.js` falla si el valor no és al catàleg i imprimeix les peces finals de cada món.

Definits a l'última línia de cada `motor/dades/<mon>.js`:

| Món | Fitxer | Nom (`nom`) | Sprite (`spr`) | Motion (`fx`) | Peces (`tret · atac · mort`) | Música (`mus`) | Rètol (`rotul`) | Partícules (`em`) |
|---|---|---|---|---|---|---|---|---|
| Comarques | `comarques.js` | El Drac de les Comarques | `drac` | `explosio` | **`rosa`** (fixat) · `embat` · `pixels` | `epica` (fanfara heroica + timbales) | `FOC DE SANT JORDI!` | `🐉 🌹 🔥 🛡️` |
| Biologia i Geologia | `biogeo.js` | El Cometa Rebel | `cometa` | `orbites` | `estrella` · `embat` · `pixels` | `cosmos` (*Zarathustra* + campanetes) | `SUPERNOVA!` | `☄️ 🪐 🚀 ✨` |
| Socials (Clima) | `socials.js` | La Gran Borrasca | `borrasca` | `tempesta` | `estrella` · `ensurt` · `esvaeix` | `primavera` (*La Primavera*, Vivaldi) | `SURT EL SOL!` | `🌈 ☀️ 🌤️ 🍃` |
| Matemàtiques | `divisibilitat.js` | El Gegant Primer | `gegant` | `blocs` | `estrella` · `embat` · `pixels` | `chiptune` (fanfara 8-bit) | `FACTORITZAT!` | `💎 🧱 🔢 ⚡` |
| Català | `catala.js` | El Monstre dels Signes | `signes` | `espiral` | `llapis` · `taca` · `goma` | `alegria` (*Himne a l'Alegria*, Beethoven) | `PUNT I FINAL!` | `📖 ✨ 🎭 🖋️` |
| Castellano | `castellano.js` | El Monstruo de las Faltas | `faltas` | `esborra` | `llapis` · `taca` · `goma` | `toreador` (*Toreador*, Bizet) | `¡NI UNA FALTA!` | `✏️ ✨ 📚 🎯` |
| Anglès | `angles.js` | El Fantasma del Cinema | `fantasma` | `focus` | `llapis` · `ensurt` · `esvaeix` | `estrena` (claqueta + estrena Hollywood) | `THAT'S A WRAP!` | `🎬 🍿 🎥 🌟` |
| Geosfera | `geosfera.js` | El Gegant de Magma | propi (`pix`: volcà amb cara) | `explosio` amb `ic:"🌋"` | `estrella` · `embat` · `pixels` | pròpia (`notes`, `metall`, 118 bpm) | `MAGMA REFREDAT!` | `💎 🪨 🔥 ✨` |

---

## 3. Com construir el Boss d'un món nou (i les seves variants)

Quan creïs un món nou a `motor/dades/<nou>.js`, tens **dues maneres** de definir `ASSIG.boss`:

### Opció A · Combinar peces del catàleg en 1 sola línia (recomanat)

Pots barrejar lliurement qualsevol `spr`, `fx` i `mus` existents amb el teu propi `nom`, `rotul` i `em`. Cada `fx` porta una icona al centre de la celebració (`explosio` 🌹, `orbites` 🪐, `tempesta` ☀️, `blocs` 💎, `espiral` 📖, `esborra` ✨, `focus` 🎬); si no lliga amb el teu món, canvia-la amb el camp opcional `ic` (per exemple, `ic:"🌋"` a la Geosfera). També surt a la banda tranquil·la del mode suau. A més, els colors `M` i `m` dels sprites s'adapten automàticament als colors `ASSIG.color` del nou món!

```js
ASSIG.boss = {
  nom: "El Tità dels Àtoms",
  spr: "gegant",          // monstre | borrasca | drac | cometa | gegant | signes | faltas | fantasma
  fx: "orbites",          // explosio | orbites | tempesta | blocs | espiral | esborra | focus
  mus: "cosmos",          // epica | cosmos | primavera | chiptune | alegria | toreador | estrena
  rotul: "FUSIÓ ATÒMICA!",
  em: ["⚛️", "🧪", "⚡", "✨"]
};
```

#### Receptes llestes per a futurs mons

| Assignatura / Tema futur | Configuració `ASSIG.boss` recomanada |
|---|---|
| **Física i Química** (Matèria / Àtoms) | `{nom:"El Tità dels Àtoms", spr:"gegant", fx:"orbites", mus:"cosmos", rotul:"FUSIÓ ATÒMICA!", em:["⚛️","🧪","⚡","✨"]}` |
| **Ciències Socials · Història** (Edat Antiga / Medieval) | `{nom:"El Guardià del Temps", spr:"drac", fx:"explosio", mus:"epica", rotul:"HISTÒRIA VIVA!", em:["🏛️","⚔️","📜","👑"]}` |
| **Música** | `{nom:"El Mestre Dissonant", spr:"fantasma", fx:"espiral", mus:"alegria", rotul:"SIMFONIA PERFECTA!", em:["🎵","🎻","🎺","✨"]}` |
| **Tecnologia i Digitalització** | `{nom:"El Bug Infinit", spr:"gegant", fx:"blocs", mus:"chiptune", rotul:"SISTEMA COMPILAT!", em:["🤖","💻","⚡","🔧"]}` |
| **Francès / 2a Llengua Estrangera** | `{nom:"Le Fantôme du Louvre", spr:"fantasma", fx:"focus", mus:"toreador", rotul:"CHAPEAU!", em:["🥐","🎨","🗼","✨"]}` |
| **Biologia · Ecosistemes / Plantes** | `{nom:"L'Ombra del Bosc", spr:"monstre", fx:"tempesta", mus:"primavera", rotul:"BOSC VIU!", em:["🌿","🦋","🌸","☀️"]}` |

---

### Opció B · Crear un sprite 16×16 (`pix`) i/o una melodia (`notes`) nous a mida (sense tocar la plantilla!)

Si per a un món nou vols un dibuix pixel-art o una melodia que encara no existeix al catàleg, els pots escriure **directament dins de `motor/dades/<nou>.js`**:

```js
ASSIG.boss = {
  nom: "El Faraó de les Piràmides",
  fx: "explosio",
  rotul: " MISTERI RESOLT! ",
  em: ["🏺", "☀️", "🐪", "✨"],
  // 1) Sprite 16×16 propi: 16 files de 16 caràcters
  //    '.' = transparent · K=#1d1631 (negre) · W=#fff (blanc) · R=#e8442e (vermell)
  //    Y=#ffd23f (or) · G=#475569 · g=#94a3b8 · O=#fb923c (taronja) · C=#38bdf8 (cian)
  //    D=#22c55e (verd) · d=#86efac · M i m = colors ASSIG.color[1] i [2] del món!
  pix: [
    "....KKKKKKKK....",
    "...KYYYYYYYYK...",
    "..KYMMMMMMMMYK..",
    ".KYMYYYYYYYYMYK.",
    ".KYMKWWKKWWKMYK.",
    ".KYMKCCKKCCKMYK.",
    "KYMMYYYYYYYYMMYK",
    "KYMMKKKKKKKKMMYK",
    "KYMMKYYYYYYKMMYK",
    ".KYMKKKKKKKKMYK.",
    "..KYYYYYYYYYYK..",
    "...KMMMMMMMMK...",
    "...KMMYYYYMMK...",
    "...KMMK..KMMK...",
    "...KYYK..KYYK...",
    "...KKKK..KKKK..."
  ],
  // 2) Melodia WebAudio pròpia: "NOTA:DURADA ..." (_ = silenci)
  //    Notes: C D E F G A B + opcional # o b + octava (3..6)
  bpm: 132,
  timbre: "metall", // "metall" | "pluck" | "campana"
  notes: "A4:1 Bb4:1 C#5:2 D5:1 E5:1 F5:2 E5:1 D5:1 C#5:1 Bb4:1 A4:3"
};
```

Després executa:

```sh
python3 motor/tot.py
ESTRICTE=1 node motor/prova.js $PWD/<carpeta>/index.html
```

La prova automàtica `bnProvaBossFesta` comprova sola que l'sprite renderitza píxels vàlids, que l'efecte i la música existeixen, que clicar tanca la celebració i que el mode suau mostra la variant tranquil·la.

---

## 4. Les 5 festes del rànquing (`index.html`)

A la portada (`index.html`, matriu `FESTES`), tocar **5 vegades seguides** dins del rànquing (o assolir la meta setmanal de la colla) dispara una festa rotativa amb moviment i música clàssica/arcade sintetitzada:

1. **🌋 TERRATRÈMOL!** — *A la cova del rei de la muntanya* (Grieg), accelerant fins al cop final.
2. **🥁 LA GRAN DESFILADA!** — *Marxa turca* (Mozart), amb els jugadors del rànquing desfilant.
3. **🐝 ATAC D'ABELLOTS!** — *El vol del borinot* (Rimski-Kórsakov), amb abellots en ziga-zaga.
4. **🚀 GRAVETAT ZERO!** — *El Danubi blau* (Strauss), amb les files flotant suaument i coets/planetes en òrbita.
5. **🐉 FOC DE DRAC!** — Fanfara heroica amb el Drac creuant el rànquing entre flames i roses de Sant Jordi.
