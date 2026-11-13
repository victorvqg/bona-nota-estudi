# 🌍 Guia per construir un món nou

Llista de comprovació única per afegir un **món nou** a Bona Nota de cap a cap, integrant motor, contingut, **Boss amb animació i música**, portada, tauler d'admin i proves.

---

## 1. Crea el fitxer de dades (`motor/dades/<id>.js`)

Agafa com a referència un món existent (`motor/dades/biogeo.js`, `motor/dades/comarques.js` o [`MON-ANGLES.md`](MON-ANGLES.md) si és de llengües amb frases amb buits) i defineix:

1. **`ASSIG`**:
   - Identitat: `id`, `nom`, `tema`, `curs`, `ic`, `color` (`[c1, c2, c3]`), `peu`, `blocs`.
   - `jocs`: minijocs (`ordena`, `parelles`, `classifica`, `figura`, etc.).
   - **`boss`**: segueix [`BOSS-I-EFECTES.md`](BOSS-I-EFECTES.md) §3:
     - **Opció A (1 línia, recomanada):** tria qualsevol `spr`, `fx` i `mus` del catàleg i defineix `nom`, `rotul` i `em`. Els colors `M` i `m` de l'sprite s'adapten sols al món.
     - **Opció B (a mida):** escriu un sprite 16×16 propi (`pix`) i/o una melodia WebAudio (`notes`, `bpm`, `timbre`) directament dins `ASSIG.boss` sense tocar `motor/plantilla-estudi-interactiu.html`.
2. **`T` (temes)**:
   - Cada tema amb `id`, `ic`, `col`, `titol`, `font`, `idea`, `pts`, `truc`, `compte`, `fc` (targetes) i `q` (preguntes).
   - **Mínim 8 preguntes de test per tema**, 3 opcions amb una sola correcta, distractors realistes de 1r d'ESO i llargades equilibrades ([`CONVENCIONS.md`](CONVENCIONS.md)).
3. **`OB` (preguntes obertes)**:
   - Objectes amb `t`, `q`, `p` (idees clau que detecta el corrector) i `m` (resposta model).

---

## 2. Dóna'l d'alta a `motor/mons.json`

Afegeix l'entrada nova al final de `motor/mons.json` (a la portada es pinten en ordre invers, del més nou al més antic):

```json
{
 "dades": "<id>",
 "carpeta": "<assignatura>/<tema>",
 "mon": "8",
 "neix": "YYYY-MM-DD",
 "materia": "Matèria",
 "titol": "Títol del món",
 "desc": "Descripció breu a la targeta de portada.",
 "colors": ["#c1", "#c2", "#c3"],
 "ic": "🔬"
}
```

- Opcional: afegeix `"llengua": "es"` si el text de xips i peu del món ha d'anar en castellà (`tot.py`).
- Opcional: desa una il·lustració SVG pròpia a `motor/ilu/<id>.svg` (si no n'hi ha, la portada mostra `ic`).

---

## 3. Connecta sprites, tauler d'admin i regles (si escau)

1. **`sprites.js`**:
   - Afegeix `"<id>": {"ic": "<clau_spr>", "mat": "<Matèria>"}` dins de `BN_MON`.
   - Si és una matèria nova, afegeix-la també a `BN_MAT` amb el seu color base.
2. **`admin/index.html`**:
   - Afegeix `<id>` a `ASSIGS`, `COL_MON` i `XMON` perquè surti amb el seu nom curt i color propi al tauler, les fitxes i la dificultat real.
3. **`nucli.json`**:
   - Si `<carpeta>` obre una carpeta arrel nova (fora de `sociales/**`, `bio-i-geo/**`, `castellano/**`, `catala/**`, `matematiques/**`), comprova que el patró estigui cobert a `regles`.
4. **Xat de la colla (opcional)**:
   - Si vols oferir vocabulari d'estudi (`s:"P"`) d'aquest nou món al xat, afegeix les peces a `XAT-CATALEG` (`index.html`) i en un fitxer SQL idempotent a `supabase/`.

---

## 4. Bon ús, versió i verificació abans del PR

1. **Filtre de Bon Ús ([`BON-US.md`](BON-US.md) §6):** res de sort/caixes sorpresa, topalls diaris intactes i compatibilitat amb `Mode suau`.
2. **Versió ([`CONVENCIONS.md`](CONVENCIONS.md)):** un món nou puja el número **MENOR** (`MAJOR.MENOR.PEDAÇ`): afegeix l'entrada a `CHANGELOG.md` i actualitza la capçalera de `README.md`.
3. **Regenera-ho tot i passa les proves:**

```sh
python3 motor/tot.py
ESTRICTE=1 node motor/prova.js $PWD/<carpeta>/index.html
node motor/prova-regles.js
```

4. **Comprova visualment** la portada (`index.html`), el món i la celebració del Boss amb **`?demoBoss=1`** a la URL (en escriptori i en mòbil).
