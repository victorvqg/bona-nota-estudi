# Pla mestre · README, CHANGELOG i motor al dia

18/11/2026 · Versió 2.58.0 · Revisió del `README.md` (883 línies), del `CHANGELOG.md` (69 versions), de `docs/ARQUITECTURA.md`, de `motor/` (eines, proves, `tot.py`) i de les Actions (`revisa.yml`, `etiqueta.yml`).

**Estat:** decisions preses el 18/11/2026: totes les recomanacions de la secció 4. **Fase 1 feta a la 2.58.1 i 2.58.2.** Diferències amb el pla: el proxy de la sessió no deixa pujar etiquetes, i el token de l'Action tampoc no pot etiquetar commits antics (cal el permís `workflows`; `docs/TRAMPES.md`). L'Action etiqueta sola la versió de cada PR, però les 14 que falten (`v2.25.0`, `v2.47.0`-`v2.58.0` i `v2.58.1`) s'han de posar a mà des d'un ordinador.

**En poques línies.** El que s'explica està bé, però hi ha **un error que fa mal** i **forats de documentació** que s'han anat acumulant:
1. **Les etiquetes de versió s'han aturat a la v2.46.1.** El web diu 2.58.0, però a GitHub no hi ha cap etiqueta de la `v2.47.0` a la `v2.58.0` (ni la `v2.25.0`). Hi ha **dues fonts** per al número de versió i no coincideixen:
   - `tot.py` llegeix la primera entrada del `CHANGELOG.md` (2.58.0) i la posa al web.
   - L'Action «Etiqueta la versió» llegeix la capçalera del `README.md` («**Versió:** 2.46.1»), que fa 12 versions que no es toca.

   El pas 2 de «Com es puja una versió» («Canvia el número a la capçalera d'aquest README») s'oblida fàcilment, i s'ha oblidat a totes les versions des de la 2.47.0.
2. **El README i l'arquitectura no parlen de 4 eines del motor ni de 3 proves** que ja funcionen i passen a la CI.
3. **El CHANGELOG fa servir 6 noms d'apartat diferents** per a 4 coses (Arreglat/Corregit, Eliminat/Esborrat).

Proposo **3 fases**. La primera arregla la causa de les etiquetes al motor perquè no torni a passar. Al final hi ha 5 decisions.

---

## 1. Què he trobat

### 1.1 La versió té dues fonts (el més important)

| Qui | D'on treu el número | Ara diu |
|---|---|---|
| `motor/tot.py` (peu de la portada, dels mons i capçalera del tauler) | 1a entrada de `CHANGELOG.md` | **2.58.0** |
| `.github/workflows/etiqueta.yml` (etiqueta `vX.Y.Z` a GitHub) | capçalera del `README.md` | **2.46.1** |
| `docs/ESTAT.md` | a mà | 2.58.0 |

- **Etiquetes que falten a GitHub:** `v2.25.0` i de la `v2.47.0` a la `v2.58.0` (13 en total). Cada vegada, l'Action ha vist que «v2.46.1 ja existeix» i no ha fet res, sense cap error.
- També en falten 9 de més antigues, de la `v2.4.0` a la `v2.8.3` (2.4.0, 2.5.0, 2.5.1, 2.6.0, 2.6.1, 2.8.0, 2.8.1, 2.8.2 i 2.8.3), d'abans que existís l'Action. El CHANGELOG ja avisa que les primeres versions es van numerar després de publicar-les.
- **Res no avisa** que el README i el CHANGELOG no coincideixen: ni `tot.py`, ni la CI, ni `nucli`.

### 1.2 README i arquitectura: el que hi falta

| Què | On falta | Què és |
|---|---|---|
| `motor/eines/clima.js` | README §5 «Eines» · ARQUITECTURA «Eines compartides» | Generador `climograma` del Taller (món del clima) |
| `motor/eines/marca-llengua.js` | ídem | Joc «Pinta les paraules» (Català i Castellano) |
| `motor/eines/ui-es.js` | ídem | Activitats en castellà (textos de la interfície) |
| `motor/eines/vistes-mates.js` | ídem | Vistes amb marques del Taller de mates |
| `prova-veu.js`, `prova-vistes-mates.js`, `prova-ui-es.js` | README §10 (taula de proves) i §4 (arbre) | Proves del grup `base`, que ja passen a la CI |
| `prova-tast.js` | README §4 (arbre) | Ja és a la taula de proves (fila 12), però no a l'arbre |
| «10.800 exercicis» | README §10 i ARQUITECTURA | Ara en són **11.700** (el generador `climograma` en suma 900) |

La resta del README sí que està al dia, revisada a les versions 2.55.0-2.58.0: el tauler (§9), els mons (§5) i la portada (§6).

### 1.3 CHANGELOG

- **69 versions**, de la més nova a la més antiga, totes amb data. El format està bé.
- **Noms d'apartat:** Afegit (50), Canviat (31), **Corregit (7) i Arreglat (5)**, **Eliminat (2) i Esborrat (1)**. El README només en cita 3 («Afegit, Canviat o Corregit»).
- Les entrades de la 2.53.0 a la 2.58.0 són llargues però clares: no cal tocar-les.

### 1.4 Motor

- Codi: no hi ha cap `TODO` ni `FIXME`, ni cap fitxer de més a git (cap `__pycache__`).
- Proves: les llistes de `prova-tot.js` i de `revisa.yml` coincideixen (`base`, `sql`, `interficie`, `mons`).
- L'únic canvi de codi que cal és el de la versió (§1.1). Ara mateix, que el README no es desquadri depèn que algú se'n recordi, i no hi ha cap prova que ho vigili.

---

## 2. Proposta

### A · Una sola font per a la versió: el CHANGELOG (motor)
1. **`tot.py` escriu el número a la capçalera del README**, igual que ja el posa al peu del web, de la primera entrada del `CHANGELOG.md`. El pas 2 de «Com es puja una versió» desapareix: n'hi ha prou de posar l'entrada al CHANGELOG i executar `tot.py`.
2. **`etiqueta.yml` llegeix el CHANGELOG**, no el README. Així, encara que algú toqués el README a mà, l'etiqueta seria la bona.
3. **La CI ho vigila:** el check `generat` ja falla si `tot.py` canvia algun fitxer. Si algú puja una versió sense executar `tot.py`, el README quedaria diferent i la CI ho atraparia.
4. **Etiquetes que falten:** posar les 13 etiquetes al commit de `main` on va entrar cada versió (`v2.25.0` i de la `v2.47.0` a la `v2.58.0`). Es fa des de l'Action o en un pas a part (decisió 2).

### B · README i arquitectura sense forats (docs)
- §5 «Eines» del README i «Eines compartides» d'ARQUITECTURA: les 4 eines que falten, amb una línia cadascuna.
- §10 (taula de proves): una fila per a `prova-veu.js`, `prova-vistes-mates.js` i `prova-ui-es.js`.
- §4 (arbre): `prova-veu.js`, `prova-vistes-mates.js`, `prova-ui-es.js` i `prova-tast.js`.
- «10.800 exercicis» → «11.700 exercicis» (README §10 i ARQUITECTURA).
- §3 «Versions»: el nou procés en 3 passos (CHANGELOG → `tot.py` → l'Action etiqueta).

### C · CHANGELOG amb 4 apartats fixos (docs)
- Només **Afegit · Canviat · Corregit · Eliminat**: «Arreglat» passa a «Corregit» i «Esborrat», a «Eliminat».
- *(opcional)* `tot.py` avisa si una entrada fa servir un altre nom d'apartat. Així no es tornen a barrejar.

### D · Prova que la documentació no es quedi enrere (opcional, motor)
- Una comprovació petita a la CI (dins de `prova-regles.js` o una prova nova, `prova-docs.js`):
  - cada fitxer de `motor/eines/` surt a ARQUITECTURA;
  - cada `motor/prova*.{js,py}` surt a la taula de proves del README.
- Quan algú afegeixi una eina o una prova sense documentar-la, la CI ho dirà. És el mateix tipus de forat que el de l'apartat 1.2.

---

## 3. Fases

| Fase | Què | Toca | Mida |
|---|---|---|---|
| **1** | **Versió única:** `tot.py` escriu la capçalera del README, `etiqueta.yml` llegeix el CHANGELOG, §3 del README amb el procés nou, i les 13 etiquetes que falten | `motor/tot.py`, `.github/workflows/etiqueta.yml`, `README.md` | S |
| **2** | **Docs sense forats:** eines, proves, arbre i 11.700 exercicis; CHANGELOG amb 4 apartats | `README.md`, `docs/ARQUITECTURA.md`, `CHANGELOG.md` | S |
| **3** | *(opcional)* **Prova de documentació** (`prova-docs.js`) i avís d'apartats del CHANGELOG a `tot.py` | `motor/`, `revisa.yml`, `prova-tot.js` | S |

Cada fase és un PR, amb `python3 motor/tot.py` i `node motor/prova-tot.js base`. La fase 1 puja la versió de pedaç (`2.58.1`), perquè canvia el motor sense afegir res nou als mons. Les fases 2 i 3 no pugen versió: només toquen docs i proves.

**Criteris de fet:**
- La capçalera del README diu el mateix número que el peu del web, i la CI falla si no coincideixen.
- A GitHub hi ha l'etiqueta de cada versió del CHANGELOG des de la 2.22.0, sense forats.
- Cada eina de `motor/eines/` i cada prova de `motor/` surt al README o a ARQUITECTURA.
- El CHANGELOG només fa servir 4 noms d'apartat.

---

## 4. Decisions que has de prendre

1. **Font única de la versió:** el CHANGELOG (i `tot.py` escriu el README) o el README (i `tot.py` hi llegeix)? *Recomano el CHANGELOG: ja és la que fa servir el web, i escriure-hi l'entrada és un pas que no s'oblida.*
2. **Les etiquetes que falten:** poso les 13 recents (`v2.25.0` i `v2.47.0`-`v2.58.0`) al commit on va entrar cada versió, també les 9 antigues (`v2.4.0`-`v2.8.3`), o només a partir de la propera? *Recomano posar les 13 recents, perquè la llista d'etiquetes coincideixi amb el CHANGELOG des de la 2.9.0. Les 9 antigues no les posaria: no se sap del cert a quin commit corresponen. Es fa amb `git tag` + `git push` de les etiquetes, i cal el teu permís perquè crea etiquetes a GitHub.*
3. **Noms d'apartat del CHANGELOG:** Afegit · Canviat · Corregit · Eliminat? *Recomano aquests 4.*
4. **Fase 3 (prova de documentació):** la fem ara o més endavant? *Recomano fer-la ara: és petita i evita que es repeteixi el que ha passat amb les eines.*
5. **Versió de la fase 1:** `2.58.1` (pedaç) o sense versió? *Recomano `2.58.1`: canvia el motor (`tot.py`) i una Action, i així en queda constància al CHANGELOG.*
