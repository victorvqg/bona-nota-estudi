# Pla mestre · Mons nous d'una tirada, sense permisos ni passos a mà

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que «genera un món nou amb aquesta carpeta de Drive» acabi publicat a bonanota.net i visible al tauler, d'una tirada: cap finestra de permís, res de l'admin fet a mà, fusió automàtica quan la revisió surt en verd i revisions automàtiques del contingut i de la pantalla.

**Architecture:** Quatre peces. (1) Permisos i sandbox configurats perquè les ordres del flux s'executin soles. (2) `motor/mons.json` passa a ser l'única font del món: `tot.py` en genera l'admin, el sprite del rànquing i les peces del xat, i l'SQL deixa de tenir llistes de mons. (3) GitHub fusiona sol quan un sol job agregat «Revisa Bona Nota · tot» surt en verd, i etiqueta la versió en arribar a `main`. (4) Un sol camí: `nou_mon.py` per començar, `revisa-mon.js` i `prova-visual.js` per revisar, `publica.py` per publicar, i una skill `nou-mon` que ho encadena.

**Tech Stack:** Python 3 (`motor/*.py`), Node + Playwright (`motor/prova-*.js`), GitHub Actions + rulesets + `gh`, Supabase (Postgres, MCP), configuració de Claude Code (`.claude/settings.local.json`, skills).

**Spec:** petició d'en Víctor del 2026-11-17 («sense demanar permisos, tot d'una tirada; construir la part de l'admin del món; automerge i revisions automàtiques») i lliçons dels PR #73 i #74 (món Geosfera). Memòria: `mon-nou-de-cap-a-cap`, `sandbox-xarxa-i-ports`, `sql-l-aplica-l-agent`.

## D'on venen les interrupcions (diagnosi del món Geosfera)

| Interrupció | Causa | Tasca que la treu |
|---|---|---|
| Finestra a cada `git push`, `gh pr create`, `gh pr checks`, proves Playwright i `curl` | L'agent les llançava amb `dangerouslyDisableSandbox` (dins la sandbox fallen) i fora de la sandbox sempre pregunta si no hi ha una regla. `gh` no té cap regla. Una finestra va esperar 1 hora. | 0.1 |
| Les proves amb navegador no anaven | No hi ha el Chromium de Playwright descarregat; calia un truc amb Google Chrome | 0.2 |
| Esperar la revisió de GitHub i demanar «fusiona'l» | Fusió automàtica desactivada, `main` sense regles | 1.1–1.3 |
| El món no es veia bé al tauler (PR #74) | `ASSIGS`, `COL_MON`, `XMON` i `JOCS` d'`admin/index.html` s'escriuen a mà | 2.1–2.2 |
| 7 fitxers tocats a mà per cada món (admin, `sprites.js`, 3 llistes SQL, xat, 5 proves) | Llistes de mons repetides fora de `mons.json` | 2.2–2.4 |
| SQL a Supabase per cada món | `bn_control.sql` valida els mons amb una llista tancada | 2.4 |
| Errors de pantalla trobats a ull (cicle que sobresortia, il·lustració fosca, rosa al boss) | No hi ha cap prova visual automàtica | 3.2 |
| Regla del 15–40 % comprovada amb un script improvisat | No hi ha cap revisor de contingut al repo | 3.1 |

## Global Constraints

- Mai push a `main`, mai `push --force`, mai `nucli finish` (el llança una persona): regles `deny`/`ask` a la configuració.
- No editar `nucli.json`, `.nucli/rebuts/` ni `.claude/settings.json` (AGENTS.md). Els permisos personals van a `.claude/settings.local.json`.
- L'SQL de `supabase/*.sql` és idempotent i additiu. Res destructiu (drop, delete, canvi de dades) sense preguntar.
- Commits en català: `tipus(àmbit): què (gN)`. Branca `gN-…`. Un PR per fase.
- Les pàgines generades no s'editen a mà: tot surt de `motor/` amb `python3 motor/tot.py` i la CI comprova `git diff --quiet`.
- Mons nous: mínim 8 preguntes per tema, 3 opcions, una sola correcta, correcta més llarga entre el 15 % i el 40 % (`ESTRICTE=1`).
- Les peces del xat dels mons tenen id < 1001 (les de l'admin comencen a 1001).
- Cap mecànica nova de joc: el filtre de `docs/BON-US.md` §6 no canvia.

## Review Focus

- La fusió automàtica activada abans que existeixi el job agregat a `main` → el PR es fusionaria sense revisió. El ruleset només es crea després de fusionar la tasca 1.1, i un PR de prova ha d'esperar el job (tasca 1.3, pas de verificació).
- Un job de la matriu de mons cancel·lat o saltat → l'agregat ha de fallar, no passar (tasca 1.1, `if: always()` i comprovar cada `needs.*.result`).
- Una entrada de `mons.json` sense `curt`, `spr` o `xat` → `tot.py` s'atura amb un missatge clar en lloc de generar un admin trencat (tasca 2.2, `prova-mons.js`).
- Un id de peça del xat repetit o ≥ 1001 → error abans de publicar (tasca 2.2 i 4.1).
- `publica.py` executat a `main` o amb canvis d'una altra feina → crea branca o s'atura; mai empeny `main` (tasca 4.2).

---

## Fase 0 · Configuració local (una sola aprovació, sense PR)

### Task 0.1: Permisos i sandbox

**Files:**
- Modify: `.claude/settings.local.json` (amb la skill `update-config`; la sandbox no hi pot escriure: en Víctor aprova l'edició un cop)

**Interfaces:**
- Produces: les ordres `gh *`, `git push origin *`, `git fetch *`, `node motor/prova*.js`, `python3 motor/publica.py *` i les eines de Drive i Supabase s'executen sense finestra. L'agent ja no fa servir `dangerouslyDisableSandbox`.

- [ ] **Step 1: Afegir a `.claude/settings.local.json`** (es fusiona amb el que hi ha):

```json
{
  "sandbox": {
    "excludedCommands": ["gh *", "git push *", "git fetch *", "git pull *", "node motor/prova*", "python3 motor/publica.py *"],
    "network": { "allowedDomains": ["bonanota.net", "github.com", "api.github.com"], "allowLocalBinding": true }
  },
  "permissions": {
    "allow": [
      "Bash(gh pr *)", "Bash(gh run *)", "Bash(gh api repos/victorvqg/bona-nota-estudi*)",
      "Bash(git push origin g*)", "Bash(git push -u origin g*)", "Bash(git fetch *)", "Bash(git pull *)",
      "Bash(node motor/prova*.js)", "Bash(node motor/prova*.js *)", "Bash(python3 motor/*)", "Bash(curl -s* https://bonanota.net*)",
      "mcp__cb571b72-86ef-4503-9ef6-6a2edb41d374__search_files",
      "mcp__cb571b72-86ef-4503-9ef6-6a2edb41d374__read_file_content",
      "mcp__cb571b72-86ef-4503-9ef6-6a2edb41d374__get_file_metadata",
      "mcp__93acffd1-4a53-419c-8605-9779b8a5a5ab__execute_sql",
      "mcp__93acffd1-4a53-419c-8605-9779b8a5a5ab__apply_migration"
    ],
    "deny": ["Bash(git push --force*)", "Bash(git push -f*)", "Bash(git push origin main*)", "Bash(gh pr merge --admin*)"]
  }
}
```

- [ ] **Step 2: Verificar sense finestres** (en una sessió nova, amb `/status` per veure que les regles s'han carregat): `gh pr list --limit 1`, `git fetch origin`, `curl -sI https://bonanota.net/ | head -1`. Han de sortir sense cap pregunta.

### Task 0.2: Navegador de les proves

**Files:** cap del repo (memòria cau de Playwright a `~/Library/Caches/ms-playwright`).

- [ ] **Step 1: Descarregar el Chromium de Playwright un cop** (≈ 100 MB del CDN de Playwright; demanar l'OK abans, és una descàrrega): `npx playwright install chromium`
- [ ] **Step 2: Verificar dins la sandbox:** `node motor/prova-perfil.js` → `✓ Totes les comprovacions de la pàgina de perfil passen`, sense finestra. Si Chromium no arrenca dins la sandbox, ja queda cobert per `excludedCommands: node motor/prova*`.
- [ ] **Step 3:** Actualitzar la memòria `sandbox-xarxa-i-ports` (treure el truc de Google Chrome).

## Fase 1 · Fusió automàtica i etiqueta automàtica (PR `g34-fusio-automatica`)

### Task 1.1: Job agregat «Revisa Bona Nota · tot»

**Files:**
- Modify: `.github/workflows/revisa.yml` (job nou al final)

**Interfaces:**
- Produces: un check de nom fix `Revisa Bona Nota · tot` que el ruleset (1.3) pot exigir. Els jobs de la matriu tenen noms variables («Món (…)»), per això no es poden exigir un per un.

- [ ] **Step 1:** Job `tot` amb `name: Revisa Bona Nota · tot`, `needs: [base, sql, interficie, mons]`, `if: always()`, un sol pas que falla si algun de `needs.base.result`, `needs.sql.result`, `needs.interficie.result`, `needs.mons.result` no és `success`.
- [ ] **Step 2: Verificar** al PR: el check surt i passa. Cancel·lar a mà un job de la matriu en una execució de prova → `tot` falla.

### Task 1.2: Etiqueta de versió automàtica

**Files:**
- Create: `.github/workflows/etiqueta.yml`

- [ ] **Step 1:** `on: push: branches: [main]`, `permissions: contents: write`. Llegeix `X.Y.Z` de la línia `**Versió:** X.Y.Z` del `README.md`; si `vX.Y.Z` no existeix (`git ls-remote --tags origin vX.Y.Z` buit), crea l'etiqueta lleugera al commit i la puja. Si ja existeix, no fa res.
- [ ] **Step 2:** AGENTS.md, apartat «Pujar i publicar»: el pas 4 passa a «En obrir el PR, `gh pr merge --auto --squash --delete-branch`: GitHub el fusiona quan «Revisa Bona Nota · tot» surt en verd i l'Action `etiqueta` posa la versió». Treure el pas manual d'etiquetar.
- [ ] **Step 3:** Commit, PR, fusionar aquest PR a mà (és l'últim que es fusiona a mà).

### Task 1.3: Regles de GitHub (després de fusionar 1.1)

**Files:** cap (configuració del repo amb `gh api`; és el que en Víctor ha demanat).

- [ ] **Step 1:** `gh api -X PATCH repos/victorvqg/bona-nota-estudi -f allow_auto_merge=true -f delete_branch_on_merge=true`
- [ ] **Step 2:** Ruleset «main protegida» a `repos/victorvqg/bona-nota-estudi/rulesets`: objectiu `refs/heads/main`; regles `pull_request` (0 aprovacions), `required_status_checks` amb `Revisa Bona Nota · tot` (`strict_required_status_checks_policy: false`), `non_fast_forward` i `deletion`; bypass per al rol admin només en mode `pull_request`.
- [ ] **Step 3: Verificar** amb un PR de prova només de docs: `gh pr merge --auto --squash --delete-branch` el deixa «esperant», es fusiona sol quan `tot` passa, la branca s'esborra i, si el PR puja la versió, apareix l'etiqueta.

## Fase 2 · L'admin i els registres surten de `mons.json` (PR `g35-mons-json-font-unica`)

### Task 2.1: Camps nous a `mons.json`

**Files:**
- Modify: `motor/mons.json` (els 8 mons), `motor/tot.py` (docstring)

**Interfaces:**
- Produces, per a cada entrada: `curt` (nom al tauler: «Anglès (tema 2)», «Geosfera»…), `spr` (clau de `BN_SPR` a `sprites.js`: `cinema`, `volca`…), `xat` (`[[id, "text"], …]`, 3 peces amb els ids d'avui: 25–27 mates, 31–33 bio-geo… 67–69 geosfera) i, opcional, `col_admin` (8 colors, el format de `COL_MON`). Si no hi ha `col_admin`, `tot.py` la deriva de `colors[1]`.

- [ ] **Step 1:** Omplir els camps dels 8 mons amb els valors que avui hi ha a `ASSIGS`, `BN_MON`, `COL_MON` i al catàleg del xat. Res no ha de canviar a la pantalla.

### Task 2.2: `tot.py` genera l'admin, el sprite del rànquing i les peces del xat

**Files:**
- Modify: `motor/tot.py`, `admin/index.html` (marques i treure les definicions escrites a mà de les línies ~742, ~835–845, ~4109 i el `JOCS` de la demo), `sprites.js` (marca al voltant de `BN_MON`), `index.html` (marca a les peces de món de `XAT-CATALEG`), `supabase/bn_xat.sql` (les peces de món en un `insert … on conflict` propi entre marques)
- Create: `motor/prova-mons.js` (prova pura, a la CI dins del job `base`)

**Interfaces:**
- Produces a `tot.py`: `escriu_bloc(fitxer: Path, ini: str, fi: str, contingut: str) -> None` (s'atura si falten les marques, com els blocs d'ara), `bloc_admin(mons: list, info: dict) -> str` (`ASSIGS`, `COL_MON`, `XMON`, `DEMO_JOCS` amb els 4 primers jocs de cada món), `bloc_bn_mon(mons: list) -> str`, `bloc_xat(mons: list) -> tuple[str, str]` (línies per a `index.html` i per a `bn_xat.sql`).
- Marques: `/* MONS-ADMIN:inici (generat per motor/tot.py, no editar a mà) */ … /* MONS-ADMIN:fi */`, `/* BN-MON:inici … */ … /* BN-MON:fi */`, `/* XAT-MONS:inici … */ … /* XAT-MONS:fi */` i `-- XAT-MONS:inici … -- XAT-MONS:fi`.

- [ ] **Step 1: Prova que falla** (`motor/prova-mons.js`): cada entrada de `mons.json` té `curt`, `spr` (existeix a `BN_SPR`) i 3 peces `xat`; els ids de peça són únics a tot el catàleg i < 1001; les claus d'`ASSIGS` i de `BN_MON` són exactament els ids de `mons.json`, en ordre del més nou al més antic.
- [ ] **Step 2:** `node motor/prova-mons.js` → falla (encara no hi ha marques).
- [ ] **Step 3:** Implementar les quatre funcions i cridar-les des de `tot.py`. Si falta un camp, `sys.exit("ERROR: mons.json · <id>: falta «curt»")`.
- [ ] **Step 4:** `python3 motor/tot.py && node motor/prova-mons.js` → passa; `git diff` d'`admin/index.html` només mou definicions (mateixos valors).
- [ ] **Step 5:** Afegir `node motor/prova-mons.js` al job `base` de `revisa.yml`.

### Task 2.3: Les proves llegeixen el nombre de mons de `mons.json`

**Files:**
- Create: `motor/eines/mons-prova.js` (exporta `{ N, ids, nou }`: nombre de mons, ids del més nou al més antic, id del més nou)
- Modify: `motor/prova-admin-alta.js` (8 → `N`, `"geosfera"` → `nou`, «7 de 8 oberts» → `` `${N-1} de ${N} oberts` ``), `motor/prova-admin-dificultat.js` (`N`), `motor/prova-admin-benestar.js` (`N + 1`, el món amb HTML), `motor/prova-xat.js` (`N`, tres llocs), `motor/prova-xat-sql.js` (peces = les del catàleg, llegides de `XAT-CATALEG`)

- [ ] **Step 1:** Canviar els números fixos per `N`/`nou`. Totes les proves d'interfície i d'SQL de la CI en verd.
- [ ] **Step 2: Verificar que un món nou ja no les trenca:** afegir temporalment un món de prova a `mons.json` (amb dades mínimes), `python3 motor/tot.py`, passar `prova-admin-alta`, `-dificultat`, `-benestar`, `prova-xat` i `prova-xat-sql`: totes passen. Treure el món de prova.

### Task 2.4: L'SQL deixa de tenir llistes de mons

**Files:**
- Modify: `supabase/bn_control.sql` (les 3 llistes `in ('socials',…)` → `v ~ '^[a-z0-9_-]{1,40}$'`, la mateixa regla que `bn_admin_examen_desa`), `motor/prova-control-sql.js` (línia ~84)

- [ ] **Step 1: Prova que falla:** a `prova-control-sql.js`, `{"mons_tancats":["inventat"]}` ara s'accepta i `{"mons_tancats":["Món inventat!"]}` dona `mon no valid`. Igual per a `{"mon":"…","mon_actiu":false}`.
- [ ] **Step 2:** `node motor/prova-control-sql.js` → falla.
- [ ] **Step 3:** Canviar les 3 condicions a `bn_control.sql`.
- [ ] **Step 4:** `node motor/prova-control-sql.js` → `✓ prova-control-sql: … comprovacions passades`.
- [ ] **Step 5:** Aplicar a Supabase amb `apply_migration` (comprovant abans amb `pg_get_functiondef` que producció té les llistes de la 2.46.1) i verificar amb `execute_sql` que `bn_admin_control` i `bn_priv.mons_tancats` ja no tenen cap llista. Des d'aquí, un món nou no necessita SQL, només l'`upsert` de les seves 3 peces del xat.

## Fase 3 · Revisions automàtiques (PR `g36-revisions-automatiques`)

### Task 3.1: Revisor de contingut `motor/revisa-mon.js`

**Files:**
- Create: `motor/revisa-mon.js` (`node motor/revisa-mon.js [id…]`, sense ids revisa tots; surt amb 1 si hi ha errors), `motor/prova-revisa-mon.js` (fixtures trencades a `motor/eines/fixtures/`)
- Modify: `.github/workflows/revisa.yml` (job `base`)

**Interfaces:**
- Produces: errors (aturen) per a temes amb < 8 preguntes, opcions ≠ 3, correcta fora de rang, opcions o preguntes repetides, blocs que no sumen els temes, `OB.t` que no és el títol de cap tema, ítems repetits a `ordena`/`classifica`, caixa de `classifica` inexistent, parelles repetides, figura que no és una funció o que no torna `<svg…</svg>`, exercicis `error` mal formats (`mal`, 3 `per`, `r`, `ok`), `pix` del boss que no fa 16×16 o té colors fora de `K W R Y G g O C D d M m`, i correcta més llarga fora del 15–40 %. Avisos (no aturen): temes sense `font`, figures sense preguntes.

- [ ] **Step 1: Prova que falla:** `node motor/prova-revisa-mon.js` espera un error concret per a cada fixture trencada i cap error per als 8 mons d'ara.
- [ ] **Step 2:** Implementar `revisa-mon.js` (carrega les dades com `tot.py`, amb `new Function` sobre el fitxer del repo).
- [ ] **Step 3:** `node motor/revisa-mon.js` → `8 mons revisats · 0 errors`; afegir-lo al job `base`.

### Task 3.2: Prova visual `motor/prova-visual.js`

**Files:**
- Create: `motor/prova-visual.js` (`node motor/prova-visual.js <carpeta>`)
- Modify: `.github/workflows/revisa.yml` (job `mons`: després de la prova estricta, la visual i `actions/upload-artifact@v4` de les captures, 7 dies), `.gitignore` (`motor/.captures/`)

**Interfaces:**
- Produces: per a 360, 390 i 430 px, a la targeta de portada, `?tema=0`, cada joc `figura` i `error` (`?joc=<id>`) i `?demoBoss=1`: cap desplaçament horitzontal (`scrollWidth <= clientWidth + 1`), cap `<text>` d'un SVG que surti del seu `viewBox`, cap error de JavaScript. Captures a `motor/.captures/<id>/`.

- [ ] **Step 1:** Comprovar que hauria atrapat el cas real: amb la versió de `svgCicle` del commit `f0cdfc5` (abans d'arreglar-lo) la prova falla per text fora de la caixa; amb l'actual, passa.
- [ ] **Step 2:** Afegir-la al job `mons` i pujar les captures com a artefacte.

### Task 3.3: Revisió automàtica abans de publicar (sense secrets)

**Files:** la skill de la tasca 4.3.

- [ ] **Step 1:** A la skill: abans de `publica.py`, un subagent revisor llegeix el `git diff main` i els PDFs de Drive i comprova fidelitat als apunts, dades dubtoses marcades i AGENTS.md. L'agent arregla el que trobi i torna a passar `revisa-mon.js`.

### Task 3.4 (opcional, cal en Víctor): revisió de Claude a cada PR

**Files:**
- Create: `.github/workflows/revisio-claude.yml` (`anthropics/claude-code-action@v1`, `on: pull_request: [opened, synchronize]`, encàrrec en català: contingut fidel, errors de 1r d'ESO, bugs; només comentaris)

- [ ] **Step 1:** En Víctor afegeix el secret `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token` o `/install-github-app` al terminal). L'agent no toca secrets.
- [ ] **Step 2:** No és un check obligatori: si un comentari arriba després de fusionar, l'Auto-fix de l'app desperta la sessió i en fa un PR de seguiment.

## Fase 4 · Un sol camí per crear i publicar (PR `g37-nou-mon-i-publica`)

### Task 4.1: `motor/nou_mon.py`

**Files:**
- Create: `motor/nou_mon.py`, `motor/prova_nou_mon.py` (`python3 -m unittest`, en una còpia temporal de `motor/`)

**Interfaces:**
- Produces: `python3 motor/nou_mon.py --id ID --carpeta C --materia M --titol T --desc D --colors c1,c2,c3 --ic E --curt C --spr S --xat "a|b|c"` → afegeix l'entrada a `mons.json` (`mon` = següent número, `neix` = avui, ids del xat = màxim actual + 1..3), crea `motor/dades/<id>.js` amb l'esquelet (`ASSIG` amb blocs, jocs i boss buits, `T=[]`, `OB=[]`) i s'atura si l'id o la carpeta ja existeixen.

- [ ] **Step 1: Prova que falla:** crear un món a la còpia temporal → entrada amb `mon` = 9, ids del xat 70–72; tornar-lo a crear → error «ja existeix».
- [ ] **Step 2:** Implementar i passar la prova.

### Task 4.2: `motor/publica.py`

**Files:**
- Create: `motor/publica.py`

**Interfaces:**
- Consumes: `revisa-mon.js` (3.1), `prova-visual.js` (3.2), fusió automàtica (1.3).
- Produces: `python3 motor/publica.py --id gN --missatge "tipus(àmbit): què (gN)" [--prova]`:
  1. Si és a `main`, crea la branca `gN-<slug>`; si hi ha canvis que no són de la feina (fitxers fora de la llista que dona `git status`), s'atura.
  2. `python3 motor/tot.py`, `node motor/revisa-mon.js`, `ESTRICTE=1 node motor/prova.js` i `prova-visual.js` dels mons canviats (`git diff --name-only main`).
  3. Commit, `nucli ship plan`, `nucli ship run generat`, `nucli ship run generadors`, `nucli ship seal`.
  4. `git push -u origin <branca>`, `gh pr create` (títol = missatge; cos = primera entrada del `CHANGELOG.md`), `gh pr merge --auto --squash --delete-branch`.
  5. Escriu l'URL del PR. Surt amb 1 si falla una revisió (no puja res) i amb 2 si falla git o gh. Amb `--prova` ho fa tot menys el pas 4 i escriu les ordres que faria.

- [ ] **Step 1:** Provar `--prova` sobre un canvi de docs: passa les revisions i escriu les ordres sense empènyer res.
- [ ] **Step 2:** Provar de veritat amb el PR d'aquesta fase: es fusiona sol.

### Task 4.3: Skill `nou-mon`

**Files:**
- Create: `.claude/skills/nou-mon/SKILL.md` (la sandbox no hi pot escriure: un sol OK d'en Víctor)

- [ ] **Step 1:** Activador: «genera/crea un món nou», un enllaç a una carpeta de Drive. Passos: llegir la carpeta (diapositives, esquema, examen, respostes) → `nou_mon.py` → escriure `motor/dades/<id>.js` → `revisa-mon.js` → revisor (3.3) → `upsert` de les 3 peces del xat a Supabase (MCP) → versió MENOR a `CHANGELOG.md`, `README.md` i `docs/ESTAT.md`, fila i apartat a `docs/MONS.md` → `publica.py` → comprovar `https://bonanota.net/<carpeta>/` i l'admin en demo → informar. Regla: no preguntar res a mig camí; el nom del món, el de la carpeta de Drive si no se'n dona cap altre.
- [ ] **Step 2:** `allowed-tools`: les 3 eines de Drive, les 2 de Supabase, `Bash(python3 motor/*)`, `Bash(node motor/*)`.

### Task 4.4: Documentació

**Files:**
- Modify: `docs/NOU-MON.md` (el camí curt: `nou_mon.py` → dades → `publica.py`; què genera `tot.py`; que ja no cal tocar l'admin, `sprites.js`, l'SQL ni les proves), `docs/CONVENCIONS.md` (una línia: publicar amb `publica.py`), memòria `mon-nou-de-cap-a-cap`.

## Verificació final

- [ ] Un món nou de punta a punta amb la skill: **cap finestra de permís** des de «genera un món nou amb <carpeta>» fins a la fusió.
- [ ] El món surt al tauler amb el seu nom i color sense haver tocat `admin/index.html` a mà, i no cal cap SQL de llistes.
- [ ] El PR es fusiona sol en uns 5 minuts (la Action dura ~4 min) i l'etiqueta `vX.Y.0` apareix sola.
- [ ] La prova visual i el revisor de contingut han passat a la CI i les captures són a l'artefacte del PR.

## Què ha de fer en Víctor (una vegada)

1. Aprovar l'edició de `.claude/settings.local.json` (tasca 0.1) i la descàrrega del Chromium de Playwright (0.2).
2. Aprovar la creació de `.claude/skills/nou-mon/SKILL.md` (4.3).
3. Opcional: el secret `CLAUDE_CODE_OAUTH_TOKEN` per a la revisió de Claude a GitHub (3.4).
