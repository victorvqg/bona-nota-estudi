# Pla Mestre — `/perfil/` «Passe de Cartes» (Opció 1 · `n2997` · `v2.72.0`)

## 1. Resum i principis (`docs/BON-US.md` §6)

- **Format:** Passe de Cartes horitzontal amb `scroll-snap` (3–4 cartes a l'escriptori, ~1,6 al mòbil), focus central amb `scale` i brillantor només a la carta en focus/equipada, sense `rotateY` ni 3D.
- **Dades intactes:** mateix format `av, sk, v, comp, marc, titol` a `localStorage.bn_aspectes` i `bn_aspecte_desa` (0 SQL nou).
- **Dibuix compartit:** `bnAvatarHtml()` i `bnTitolHtml()` centralitzats a `sprites.js` i reutilitzats a `index.html`, `motor/plantilla-estudi-interactiu.html` i `perfil/index.html`.
- **Bon ús:** totes les mecàniques passen les 10 preguntes de `docs/BON-US.md` §6 (sense atzar, sense temporades, sense raresa sobre la carta d'heroi, 0 animacions/transicions/so en equipar en mode suau).

## 2. Taula definitiva `peça → col·lecció → raresa` (cap llindar modificat)

Escala accessible (nom + 1–5 gemmes, mai només color) + 6è aspecte `GESTA` (`🏅`):
- `1` Inicial (`◆`) · `2` Rar (`◆◆`) · `3` Èpic (`◆◆◆`) · `4` Llegendari (`◆◆◆◆`) · `5` Mític (`◆◆◆◆◆`) · `gesta` Gesta (`🏅`)

| Col·lecció | Peça (id) | Llindar / Condició | Raresa |
|---|---|---|---|
| Animals (20) | `fox`, `frog`, `rabbit`, `pig`, `penguin`, `monkey`, `panda` | `0 ⭐` | `1` Inicial (`◆`) |
| Animals (20) | `bear`, `koala`, `raccoon`, `owl`, `wolf`, `octopus` | `10–25 ⭐` | `2` Rar (`◆◆`) |
| Animals (20) | `lion`, `tiger`, `whale` | `45 ⭐` | `3` Èpic (`◆◆◆`) |
| Animals (20) | `dino`, `shark`, `unicorn` | `70–100 ⭐` | `4` Llegendari (`◆◆◆◆`) |
| Animals (20) | `dragon` | `140 ⭐` | `5` Mític (`◆◆◆◆◆`) |
| Marcs (8) | `""` (Clàssic) | `0 ⭐` | `1` Inicial (`◆`) |
| Marcs (8) | `bronze`, `plata` | `10–45 ⭐` | `2` Rar (`◆◆`) |
| Marcs (8) | `or`, `neo` | `100–190 ⭐` | `3` Èpic (`◆◆◆`) |
| Marcs (8) | `foc`, `diamant` | `250–500 ⭐` | `4` Llegendari (`◆◆◆◆`) |
| Marcs (8) | `prisma` | `750 ⭐` | `5` Mític (`◆◆◆◆◆`) |
| Títols (8 estrelles) | `""` (Sense títol), `fitxatge` | `0 ⭐` | `1` Inicial (`◆`) |
| Títols (8 estrelles) | `maquina` | `45 ⭐` | `2` Rar (`◆◆`) |
| Títols (8 estrelles) | `cervell`, `heroi` | `100–190 ⭐` | `3` Èpic (`◆◆◆`) |
| Títols (8 estrelles) | `llegenda`, `imparable` | `330–500 ⭐` | `4` Llegendari (`◆◆◆◆`) |
| Títols (8 estrelles) | `mite` | `1.000 ⭐` | `5` Mític (`◆◆◆◆◆`) |
| Títols (4 gesta) | `cacacaps`, `cientific`, `rescatador`, `nota10` | Boss / Lab / 5 errors / 100⭐ o ≥90% | `gesta` Gesta (`🏅`) |
| Complements (2 estrelles) | `""` (Clàssic), `estel` | `0 ⭐` / `25 ⭐` | `1` Inicial / `2` Rar |
| Complements (4 gesta) | `boss`, `lab`, `remuntada`, `corona` | Boss / Lab / 5 errors / 100⭐ o ≥90% | `gesta` Gesta (`🏅`) |
| Insígnies (50 · 10×5) | Rangs 1 a 5 de cada una de les 10 classes | `0 / 15 / 40 / 75 / 120 ⭐` | `1` a `5` (1 per rang) |

## 3. Arquitectura mòbil (`390 px`) i escriptori (`1280 px`)

- **Mòbil (`390 px`):** Heroi compacte a dalt (avatar `160 px`, nom, mini-vista, pròxim premi), carrusel al mig (~1,6 cartes), 6 pestanyes fixes a baix (`🐾 Animals`, `🖼️ Marcs`, `🏷️ Títols`, `⚔️ Insíg.`, `✨ Compl.`, `🗺️ Camí`, totes ≥ 44 px dins 390 px), botó `DESA` flotant només amb canvis.
- **Escriptori (`≥ 900 px`):** Carta d'Heroi sticky (`390 px`, avatar `192 px`) a l'esquerra + Dock de 6 pestanyes i Passe de Cartes (3–4 cartes visibles) a la dreta.
- **Rendiment:** només `transform` i `opacity`, 0 `backdrop-filter`, `IntersectionObserver` per pausar animacions fora de pantalla, sprites en múltiples de `16 px`, una sola regla CSS per component.
