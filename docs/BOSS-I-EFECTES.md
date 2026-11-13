# 👾 Bosses, celebracions i variants per a nous mons

Com funcionen els **efectes especials amb moviment i música WebAudio** de Bona Nota (tant en vèncer el **Boss de cada món** com a les **5 festes del rànquing**) i **com configurar-los o inventar variants noves** en crear qualsevol món futur sense tocar el motor. Per a la llista de comprovació completa d'un món sencer, vegeu [`NOU-MON.md`](NOU-MON.md).

---

## 1. Com funciona la celebració d'un Boss

Quan l'alumne venç el Boss d'un món (`B.hp <= 0` a `bossFi()`, a `motor/plantilla-estudi-interactiu.html`):

1. Es desa la victòria (`+10 ⭐` com a màxim un cop al dia, `S.boss.v++`, medalla `🏆 N` a `.boss-carta`) i s'escriu `#bossFi` al DOM.
2. Damunt de `.boss` s'obre durant **~4,3 segons** la capa `.boss-festa` amb el **motion temàtic** (`fx`), l'**sprite 16×16** del Boss (`spr` o `pix`), les **partícules** (`em`), el **rètol arcade** (`rotul`) i la **fanfara musical sintetitzada amb WebAudio** (`mus` o `notes`, pel canal `BG` amb reverberació i abaixant suaument la música de fons).
3. En tocar qualsevol punt de `.boss-festa` (o en canviar de pantalla) la celebració i la música es tanquen a l'instant i queda a la vista `#bossFi`, amb el botó **`🎬 Celebració`** per tornar-la a veure quan es vulgui.
4. **Vista prèvia d'1 clic (sense jugar 10 rondes ni escriure res a Supabase):** afegeix **`?demoBoss=1`** a l'adreça de qualsevol món:
   - `https://bonanota.net/bio-i-geo/univers/?demoBoss=1` (*El Cometa Rebel · SUPERNOVA!*)
   - `https://bonanota.net/sociales/comarques/?demoBoss=1` (*El Drac de les Comarques · FOC DE SANT JORDI!*)

### Filtre de Bon Ús (`docs/BON-US.md` §6)
- **Zero atzar / zero caixes sorpresa:** cada món té la seva celebració fixa i previsible.
- **Topall diari intacte:** guanyar dóna `+10 ⭐` un sol cop al dia; repetir el Boss o prémer `🎬 Celebració` és lliure i no suma estrelles.
- **Mode suau i nit (`SUAU` / `prefers-reduced-motion`):** no surt cap capa animada ni parpelleig; es mostra una banda estàtica i tranquil·la (`.boss-festa.quiet`) a dalt de `#bossFi`.
- **Volum (`VOL === 0`):** silenci total si el so de l'app està apagat.

---

## 2. Els 7 Bosses actuals

Definits a l'última línia de cada `motor/dades/<mon>.js`:

| Món | Fitxer | Nom (`nom`) | Sprite (`spr`) | Motion (`fx`) | Música (`mus`) | Rètol (`rotul`) | Partícules (`em`) |
|---|---|---|---|---|---|---|---|
| Comarques | `comarques.js` | El Drac de les Comarques | `drac` | `explosio` | `epica` (fanfara heroica + timbales) | `FOC DE SANT JORDI!` | `🐉 🌹 🔥 🛡️` |
| Biologia i Geologia | `biogeo.js` | El Cometa Rebel | `cometa` | `orbites` | `cosmos` (*Zarathustra* + campanetes) | `SUPERNOVA!` | `☄️ 🪐 🚀 ✨` |
| Socials (Clima) | `socials.js` | La Gran Borrasca | `borrasca` | `tempesta` | `primavera` (*La Primavera*, Vivaldi) | `SURT EL SOL!` | `🌈 ☀️ 🌤️ 🍃` |
| Matemàtiques | `divisibilitat.js` | El Gegant Primer | `gegant` | `blocs` | `chiptune` (fanfara 8-bit) | `FACTORITZAT!` | `💎 🧱 🔢 ⚡` |
| Català | `catala.js` | El Monstre dels Signes | `signes` | `espiral` | `alegria` (*Himne a l'Alegria*, Beethoven) | `PUNT I FINAL!` | `📖 ✨ 🎭 🖋️` |
| Castellano | `castellano.js` | El Monstruo de las Faltas | `faltas` | `esborra` | `toreador` (*Toreador*, Bizet) | `¡NI UNA FALTA!` | `✏️ ✨ 📚 🎯` |
| Anglès | `angles.js` | El Fantasma del Cinema | `fantasma` | `focus` | `estrena` (claqueta + estrena Hollywood) | `THAT'S A WRAP!` | `🎬 🍿 🎥 🌟` |

---

## 3. Com construir el Boss d'un món nou (i les seves variants)

Quan creïs un món nou a `motor/dades/<nou>.js`, tens **dues maneres** de definir `ASSIG.boss`:

### Opció A · Combinar peces del catàleg en 1 sola línia (recomanat)

Pots barrejar lliurement qualsevol `spr`, `fx` i `mus` existents amb el teu propi `nom`, `rotul` i `em`. A més, els colors `M` i `m` dels sprites s'adapten automàticament als colors `ASSIG.color` del nou món!

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
