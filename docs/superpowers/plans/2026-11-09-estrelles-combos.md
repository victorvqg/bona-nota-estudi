# Pla d'implementació · Estrelles: combo net, triple combo i super combo (n2506)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que les estrelles premiïn el que costa (preguntes obertes ben explicades, preguntes difícils, repàs d'errors) i que el combo no es pugui inflar repetint tests.

**Architecture:** tot el càlcul d'estrelles és al motor (`motor/plantilla-estudi-interactiu.html`, funció `suma` i el que la crida). Cada canvi es fa al motor i `python3 motor/tot.py` el copia als 6 mons. Els comptadors nous del dia viuen a `diaEst()` (`S.est`), que ja es reinicia cada dia i es fusiona entre dispositius. La dificultat de cada pregunta va en un fitxer a part (`motor/dificultat.json`), lligat als ids estables de `motor/qids.json`, i `build.py` l'injecta com `QIDS`. Les proves són funcions `bnProva…` dins del motor que `motor/prova.js` executa a cada món (`window.BN_PROVES`).

**Tech Stack:** HTML i JS sense frameworks, Python 3 (build), Playwright (proves), Supabase (només lectura en aquest pla).

**Spec:** `docs/superpowers/specs/2026-11-09-estrelles-estudi.md` (estudi n2505; original a https://claude.ai/artifact/Fxh8wnJjhEEHD5qpT9HNtm). Seccions 3 i 6: propostes i decisions, totes aprovades el 9/11/2026.

**Lliurament:** 3 PR, cada un amb la seva branca, la seva versió i l'Action «Revisa Bona Nota» en verd:

| PR | Versió | Issue | Branca | Tasques |
|---|---|---|---|---|
| 1 · Mesurar i tapar forats (fases 0 i 1) | 2.8.0 | #13 | `issue/13-estrelles-mesura` | 1 a 6 |
| 2 · Triple combo ✍️ (fase 2) | 2.9.0 | #14 | `issue/14-triple-combo` | 7 a 9 |
| 3 · Super combo ⚡ (fase 3) | 2.10.0 | #15 | `issue/15-super-combo` | 10 a 13 |

Com que cada PR té issue, la branca és `issue/N-…` i els commits acaben en ` (#N)` (AGENTS.md). On aquest pla diu `(n2506)` o `(nN)` en un missatge de commit, va el `(#N)` de la seva issue. Per començar cada issue: `nucli tasca N` (la llança el Víctor, o se li demana permís).

La fase 4 (dificultat calculada amb dades reals, #16) queda fora d'aquest pla: necessita que la majoria de preguntes tinguin unes 8 respostes, i avui només 29 de 272 en tenen 5 o més.

## Global Constraints

- Les estrelles ja guanyades no es toquen. Els canvis només valen d'ara endavant.
- Combo dels tests: els premis es queden igual (×5: +1 ⭐, ×10: +2 ⭐). Només el fan pujar les respostes que donen estrella (`nova>0`, sense pista). Les respostes que no paguen (repetides el mateix dia, repàs) no el fan pujar ni el trenquen. Un error sempre el trenca.
- Repàs: +1 ⭐ per cada error encertat al repàs, un cop per error i dia, fins a 10 al dia per món. Les +2 ⭐ quan l'error queda après es mantenen.
- Triple combo: ratxa d'obertes bones en el mateix món i el mateix dia. Bona = puntua (no és pràctica ni repetida avui) + com a mínim el 60 % de les idees + passa el filtre de frases.
  - ×2: rètol «DOBLE ✍️✍️», sense premi.
  - ×3: «TRIPLE COMBO ✍️✍️✍️», +3 ⭐.
  - ×6: «MEGA COMBO», +5 ⭐.
  - Menys del 60 %: la ratxa torna a 0.
  - Filtre no passat: la ratxa ni avança ni es reinicia. Missatge «✏️ Per al combo, explica-ho amb frases».
  - Topall: 8 ⭐ de triple combo al dia per món.
- Resposta de 10: totes les idees detectades → +1 ⭐ i rètol propi. Compta a la font «obertes».
- Filtre de frases: com a mínim 4 paraules per idea detectada, i almenys un connector (`es, son, perque, que, quan, per, aixo, llavors, tambe, pero, porque, cuando, entonces, tambien, pero`, o el signe `=`). Els números compten com a paraules.
- Super combo: només preguntes difícils (`d=3`), sense pista i que donin estrella.
  - Les normals i les fàcils no el fan pujar ni el trenquen. Qualsevol error el torna a 0.
  - 3 seguides: «⚡ SUPER COMBO», +3 ⭐. 5 seguides: «⚡⚡ HIPER COMBO», +5 ⭐, i el comptador torna a 0.
  - Topall: 10 ⭐ de super combo al dia per món.
  - Funciona als tests, a l'examen sorpresa i a l'examen de veritat (en aquest, es compta en lliurar-lo).
  - Sense l'extra de +2 ⭐ per pregunta difícil.
- Dificultat: 1 fàcil, 2 normal (per defecte, sense entrada), 3 difícil. La primera passada la fa Claude, aproximadament 1 de cada 5 preguntes per món, i Víctor revisa la llista abans de publicar.
- Fonts noves: `triple` (✍️ Triple combo) i `super` (⚡ Super combo), a `FONTS` (motor) i a `FONTS_EST` (admin).
- Tots els rètols nous fan servir la classe `.combo`, que ha de respectar `prefers-reduced-motion` i `body.suau`. Els sons passen per `so()`.
- Commits `tipus(àmbit): què (nN)` en català. Mai push a `main`, mai `push --force`. No tocar `.nucli/rebuts/`, `nucli.json` ni `.claude/`. L'SQL, si cal, l'aplica Víctor.

## Review Focus

1. **Obertes de mates amb números i símbols** (món divisibilitat): «72 = 2·2·2·3·3, per tant és divisible per 6» ha de passar el filtre de frases. El signe `=` compta com a connector i els números com a paraules. Prova a la tasca 7.
2. **Dos dispositius el mateix dia**: `fusiona()` agafa el màxim de cada número, de manera que els comptadors nous (`rn`, `ocp`, `sp`) no se sumen. Prova a la tasca 4.
3. **Canvi de dia a mitja tanda** (passada la mitjanit): `diaEst()` es renova i la ratxa d'obertes i els topalls tornen a començar. Prova a la tasca 7.
4. **Preguntes sense id** (jocs que generen preguntes a l'atzar): `q.id` és `undefined` i `difDe(q)` ha de tornar 2 sense petar. Prova a la tasca 10.
5. **L'escut del combo**: la pregunta germana restaura el combo normal, però no ha de tocar el comptador de difícils (`CDIF`). Prova a la tasca 12.

## Com es proven les tasques

- Una prova = una funció `async function bnProva…(){…}` al motor que torna `true` o un text amb l'error. Es registra amb `(window.BN_PROVES=window.BN_PROVES||[]).push("bnProva…")`. Ha de deixar `S` com estava, igual que `bnProvaMissions` (guardar abans, restaurar al `finally`).
- Iteració ràpida (des de l'arrel del repo): `python3 motor/tot.py && cd motor && ESTRICTE=1 node prova.js "$PWD/../catala/index.html"`. Resultat bo: la línia `bnProva…: ok` i cap error al final.
- Abans de cada commit: els 6 mons, com fa l'Action: `cd motor && for c in $(python3 -c "import json;print(' '.join(m['carpeta'] for m in json.load(open('mons.json'))))"); do ESTRICTE=1 node prova.js "$PWD/../$c/index.html" || break; done`.

---

## PR 1 · v2.8.0 · Mesurar i tapar forats

### Task 1: Estrelles guanyades a cada activitat, al registre

**Files:**
- Modify: `motor/plantilla-estudi-interactiu.html`: `registra` (l. ~566), `test` (l. ~1009-1016), `joc` (l. ~971), `obertes` (l. ~1678), `boss` (l. ~1367), `repas` (l. ~1518)

**Interfaces:**
- Produces: `let PACT=0`; `function iniciActivitat(): void` (posa `PACT=S.punts||0`); `const EVENTS_EST=["test","joc","examen","oberta"]`; `function detallLog(event: string, detall: object): object`. Per als events de `EVENTS_EST` que no portin `est`, hi afegeix `est = max(0, S.punts - PACT)` i torna a posar `PACT=S.punts`. Per als altres events, torna `detall` tal com és.

- [ ] **Step 1: Prova `bnProvaEstLog` (falla).** Desa `S.punts` i `FONT`. `iniciActivitat(); FONT=["temes",T[0].id]; suma(3);`
  - `detallLog("test",{}).est === 3`
  - una segona crida, `detallLog("joc",{}).est === 0`
  - `"est" in detallLog("temps",{}) === false`
  - `detallLog("oberta",{est:7}).est === 7`
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar amb `detallLog is not defined`.
- [ ] **Step 3: Implementa.**
  - `registra` crida `detall=detallLog(event,retalla(detall||{}))`.
  - Crida `iniciActivitat()` on es posa en marxa cada activitat: `test` quan `k===0`, `joc()`, `obertes()`, `boss()` i `repas()`.
  - A `test`, mou el bloc del rècord (`rec` i el seu `suma(2)`) a abans del `registra("test",…)`, perquè les +2 ⭐ del rècord comptin en aquest test.
- [ ] **Step 4: Executa la iteració ràpida.** `bnProvaEstLog: ok`.
- [ ] **Step 5: Commit.** `feat(motor): cada activitat apunta les estrelles que ha donat (n2506)`

### Task 2: Tauler de l'admin amb orígens fiables i estrelles per minut

**Files:**
- Modify: `admin/index.html`: `nens()` (l. ~609-613), `blocEstrelles` (l. ~657), vista on va el resum global
- Create: `motor/prova-admin-fonts.js`
- Modify: `.github/workflows/revisa.yml`: un pas nou `node motor/prova-admin-fonts.js`

**Interfaces:**
- Produces (admin), funcions pures entre els comentaris `// [estrelles-pures]` i `// [/estrelles-pures]`:
  - `function afegeixFonts(dest: {[assig]:{f:{[font]:number},p:number}}, l: Log): void`. Per al món `l.assig`, guarda el màxim de cada clau de `l.detall.fonts` i el màxim de `l.detall.punts`. Les fonts són comptadors que només pugen dins d'un món, i un reinici esborra els registres.
  - `function resumFonts(ls: Log[]): {fonts:{[font]:number}, ritme:{[event]:{est:number, s:number}}}`. `fonts` = suma per nen de `afegeixFonts`. `ritme` = suma de `detall.est` i `detall.s` dels events `test`, `joc`, `examen` i `oberta` que portin `est` (l'admin té la seva pròpia llista: no veu les constants del motor).

- [ ] **Step 1: Prova `motor/prova-admin-fonts.js` (falla).** Llegeix `admin/index.html`, extreu el text entre els dos comentaris, l'avalua amb `new Function` i comprova:
  - Amb dos registres del mateix nen i món, `fonts:{jocs:10,temes:4}` i després `fonts:{jocs:6}` (un dispositiu nou), `afegeixFonts` dona `{jocs:10,temes:4}`.
  - `resumFonts` amb un test `{est:5,s:60}` i un joc `{est:3,s:30}` dona `ritme.test={est:5,s:60}` i `ritme.joc={est:3,s:30}`.
  - Un event `temps` no entra a `ritme`.
- [ ] **Step 2: Executa** `node motor/prova-admin-fonts.js`. Ha de fallar perquè no troba els marcadors.
- [ ] **Step 3: Implementa.**
  - `nens()` fa servir `afegeixFonts` en lloc de «l'últim registre amb fonts». Això fa desaparèixer gairebé tota la fila «D'abans (sense detall)».
  - A la vista d'estrelles s'afegeix el bloc «Estrelles per origen (tots els nens)», amb barres de `resumFonts(LOGS).fonts`, i una fila «⭐ per minut» per activitat: `est*60/s`, una xifra decimal, «—» si `s<120`.
- [ ] **Step 4: Executa** `node motor/prova-admin-fonts.js`. Surt `ok`. Obre l'admin en local i comprova que el bloc es pinta.
- [ ] **Step 5: Commit.** `feat(admin): orígens d'estrelles fiables i estrelles per minut (n2506)`

### Task 3: Combo net

**Files:**
- Modify: `motor/plantilla-estudi-interactiu.html`: el gestor de resposta de `test` (l. ~1048)

**Interfaces:**
- Consumes: `estPregunta(k)`, `ratxa(ok)`, `COMBO` (ja existeixen).
- Produces: cap nom nou. Regla: `if(ok){… if(!pista&&nova>0)ratxa(true); if(!pista)missio("enc")} else ratxa(false)`.

- [ ] **Step 1: Prova `bnProvaComboNet` (falla).** Obre el test del tema 0 i posa `COMBO=2`.
  - Respon bé una pregunta que encara no ha pagat avui: `COMBO===3`.
  - Marca-la com a pagada (`estPregunta`), torna a obrir el test i respon-la bé: `COMBO===3`.
  - Respon malament: `COMBO===0`.
  - Amb `REPAS=true`, una resposta correcta deixa `COMBO` igual.
  - Restaura `S.est`, `S.rep` i `COMBO`.
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar amb «repetida ha fet pujar el combo».
- [ ] **Step 3: Implementa la regla de l'apartat Interfaces.**
- [ ] **Step 4: Executa la iteració ràpida.** `bnProvaComboNet: ok` i `bnProvaFase1: ok` (l'escut continua igual).
- [ ] **Step 5: Commit.** `fix(motor): només les respostes que donen estrella fan pujar el combo (n2506)`

### Task 4: El repàs paga

**Files:**
- Modify: `motor/plantilla-estudi-interactiu.html`: `repMou` (l. ~1506), constants del repàs (l. ~1496)

**Interfaces:**
- Produces: `const REP_PREMI=1, REP_MAX=10`; `function premiRepas(k: string): number`. Si `diaEst().r[k]` no hi és i `(diaEst().rn||0) < REP_MAX`: marca `r[k]=1`, fa `rn++`, crida `suma(REP_PREMI)` amb `FONT=["repas"]` i torna 1. Si no, torna 0.
- `repMou` hi crida quan `ok && REPAS && r` existeix, abans de decidir si l'error queda après.

- [ ] **Step 1: Prova `bnProvaRepasPaga` (falla).**
  - Amb `REPAS=true` i un error a `S.rep` (com a `bnProvaFase1`), `repAnota(tid,q,true)` suma +1 ⭐ i `S.fonts.repas` puja 1.
  - El mateix error un altre cop el mateix dia: +0.
  - 11 errors diferents: el total del dia és +10.
  - Un error a la capsa 2 que queda après: +1 i +2 (+3 en total).
  - Dos dispositius: `fusiona({est:{d:avui(),rn:4,…}},{est:{d:avui(),rn:7,…}}).est.rn===7`.
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar amb «+0 ⭐ i havia de ser +1».
- [ ] **Step 3: Implementa `premiRepas` i la crida a `repMou`.** Durant el repàs, l'opció encertada mostra «+1 ⭐ error corregit» si `premiRepas` torna 1.
- [ ] **Step 4: Executa la iteració ràpida.** `bnProvaRepasPaga: ok` i `bnProvaFase1: ok`. Aquesta prova comprova que «après» dona +2: ajusta-la perquè esperi +3, el +1 del dia i el +2 d'après.
- [ ] **Step 5: Commit.** `feat(motor): el repàs dona +1 ⭐ per error encertat, fins a 10 al dia (n2506)`

### Task 5: Barra de ratxa i targeta amb totes les fonts

**Files:**
- Modify: `motor/plantilla-estudi-interactiu.html`: `cartaEstrelles` (l. ~656-670), capçalera de la pregunta a `test` (`.prog`, l. ~1029), CSS (`.combo` i `body.suau`)
- Modify: `docs/AVALUACIO.md`: taula «Estrelles i nivells»

**Interfaces:**
- Produces:
  - `const COM_GUANYAR=[[ic,text],…]`, en aquest ordre:
    - ✅ test +1
    - 🎮 joc +1
    - ✍️ idea +1
    - 🔥 combo ×5 +1 · ×10 +2
    - 🏅 rècord +2
    - 🔁 error corregit +1 · après +2
    - 🎯 missió +3 · les 3 +5
    - 👾 boss +10
  - La PR 2 hi afegeix el triple combo i la PR 3, el super combo.
  - `function ratxaHtml(): string`: 5 caselles `<i>`, amb `COMBO%5` enceses i el text `🔥 ×N` quan `COMBO>=1`. Torna `""` als exàmens (`clau==="examen"`).

- [ ] **Step 1: Prova `bnProvaTargeta` (falla).**
  - Amb `COMBO=7`, a dins d'un test, `.ratxa i.on` en compta 2 i el text conté `×7`.
  - `cartaEstrelles(true)` conté els 8 textos de `COM_GUANYAR`.
  - Amb `body.suau`, l'animació calculada de `.combo` és `none`.
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar.
- [ ] **Step 3: Implementa.**
  - `cartaEstrelles` (la mini i la gran) pinta `COM_GUANYAR` en lloc dels textos escrits a mà.
  - `ratxaHtml()` va a la línia `.prog` de cada pregunta.
  - `body.suau .combo{animation:none!important}` es posa al costat de les regles `body.suau` (l. ~401-405).
  - La taula de `docs/AVALUACIO.md` s'actualitza amb els mateixos valors.
- [ ] **Step 4: Executa la iteració ràpida.** `bnProvaTargeta: ok`.
- [ ] **Step 5: Commit.** `feat(motor): barra de ratxa i totes les fonts d'estrelles a la targeta (n2506)`

### Task 6: Versió 2.8.0 i PR

**Files:**
- Modify: `CHANGELOG.md` (entrada `## 2.8.0 · <data>`, que `tot.py` llegeix), `README.md` (versió), `docs/ESTAT.md` (versió i bloc n2506), `docs/DECISIONS.md` (ADR-0005: «Estrelles justes 2: combo net, repàs que paga, combos per esforç», que remet a l'estudi n2505)
- Create: `.nucli/pla-<id>.md` (un enllaç a aquest pla, per al flux del nucli; no es puja, perquè `.nucli/` és a `.gitignore`)

- [ ] **Step 1: Regenera i prova.** `python3 motor/tot.py`, el bucle dels 6 mons, `node motor/prova-generadors.js`, `node motor/prova-perfil.js` i `node motor/prova-admin-fonts.js`. Tot ha de sortir en verd.
- [ ] **Step 2: Flux del nucli.** `nucli ship plan`, `nucli ship run <check>` per a cada check automàtic, i `nucli ship seal`.
- [ ] **Step 3: Commit i PR.** `chore(versio): 2.8.0 · estrelles justes 2 (#13)`. El cos del PR porta `Closes #13`. Push de la branca. PR cap a `main` amb `gh api repos/victorvqg/bona-nota-estudi/pulls --method POST`, amb el títol igual que el commit.
- [ ] **Step 4: Fusiona.** Quan l'Action «Revisa Bona Nota» surt en verd: squash merge, esborra la branca i comprova-ho amb `git ls-remote`. Comprova `https://bonanota.net/versio.json` → `2.8.0`.

---

## PR 2 · v2.9.0 · Triple combo ✍️

### Task 7: Lògica del triple combo i filtre de frases

**Files:**
- Modify: `motor/plantilla-estudi-interactiu.html`: bloc «validació de les preguntes obertes» (l. ~1103-1135), `FONTS` (l. ~613)

**Interfaces:**
- Produces:
  - `const OB_COMBO_PC=60, OB_COMBO_PREMIS={3:3,6:5}, OB_COMBO_MAX=8, OB_PARAULES_IDEA=4, OB_CONNECTORS=new Set([...])` (la llista de Global Constraints, normalitzada amb `normT`).
  - `function obFrases(text: string, det: number): boolean`: `obParaules(text).length >= OB_PARAULES_IDEA*max(1,det)` i (alguna paraula a `OB_CONNECTORS` o el text conté `=`).
  - `function obRatxa(estat: "bona"|"filtre"|"fluixa"): number`:
    - `"bona"` fa avançar `diaEst().oc`.
    - `"fluixa"` posa `oc=0`.
    - `"filtre"` no la toca.
    - Paga `OB_COMBO_PREMIS[oc]` amb `FONT=["triple"]`, sense passar de `OB_COMBO_MAX` al dia (`diaEst().ocp`).
    - Quan `oc===6`, després de pagar, torna a 0 (cicle nou).
    - Torna les estrelles pagades i pinta el rètol (`.combo`): ×2 «DOBLE ✍️✍️», ×3 «TRIPLE COMBO ✍️✍️✍️», ×6 «MEGA COMBO».
  - `FONTS` guanya `["triple","✍️","Triple combo (obertes)"]`.

- [ ] **Step 1: Prova `bnProvaTriple` (falla).**
  - `obFrases("clima temps pluja vent sol neu",2)===false` (llista de paraules)
  - `obFrases("El clima és el temps que fa durant molts anys en un lloc",2)===true`
  - `obFrases("72 = 2 · 2 · 2 · 3 · 3 i per tant és divisible per 6",1)===true`
  - Amb `S.est` nou: `obRatxa("bona")` dos cops dona 0, un tercer dona 3, i `S.fonts.triple===3`.
  - `"filtre"` deixa `oc===3`. Tres `"bona"` més: la sisena paga 5 (en total 8, el topall) i `oc` torna a 0.
  - Tres `"bona"` més el mateix dia: paguen 0 (topall), però el rètol surt igual.
  - `"fluixa"` posa `oc===0`.
  - Si `S.est.d` és d'ahir, `obRatxa("bona")` deixa `oc===1`.
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar.
- [ ] **Step 3: Implementa** les constants i les dues funcions.
- [ ] **Step 4: Executa la iteració ràpida.** `bnProvaTriple: ok`.
- [ ] **Step 5: Commit.** `feat(motor): triple combo de preguntes obertes i filtre de frases (nN)`

### Task 8: Triple combo i resposta de 10 a la pantalla d'obertes

**Files:**
- Modify: `motor/plantilla-estudi-interactiu.html`: el botó «Comprova» de `obertes()` (l. ~1690-1702)
- Modify: `admin/index.html`: `FONTS_EST` (afegir `triple`)

**Interfaces:**
- Consumes: `obFrases`, `obRatxa` (tasca 7).
- Produces: el registre `oberta` porta `oc` (ratxa després de la resposta) i `frases` (0/1).

- [ ] **Step 1: Prova: amplia `bnProvaObertes` (falla).** Amb una oberta que puntua i té totes les idees (la resposta model desordenada, com ja fa la prova):
  - `S.fonts.obertes` puja `det+1` (la resposta de 10)
  - `diaEst().oc===1`
  - surt un `.combo` amb «RESPOSTA DE 10»
  - una pràctica (`obBloc`) no toca `oc`
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar.
- [ ] **Step 3: Implementa.**
  - Només quan `primera&&!pract`, calcula l'estat:
    - `pc<OB_COMBO_PC` → `"fluixa"`
    - si no, i `obFrases(txt,det)` → `"bona"`
    - si no → `"filtre"`, amb el missatge «✏️ Per al combo, explica-ho amb frases» al resultat
  - Crida `obRatxa(estat)`.
  - Si `pc===100`, `suma(1)` amb la font `obertes` i el rètol «RESPOSTA DE 10!».
  - La línia del resultat mostra `+det ⭐` més el premi del combo i de la resposta de 10.
  - Afegeix `oc` i `frases` a `registra("oberta",…)`.
- [ ] **Step 4: Executa la iteració ràpida** als 6 mons (cada món té les seves obertes). `bnProvaObertes: ok` a tots.
- [ ] **Step 5: Commit.** `feat(motor): triple combo i resposta de 10 a les obertes (nN)`

### Task 9: Versió 2.9.0 i PR

- [ ] Tot com a la tasca 6: `COM_GUANYAR` (✍️ triple combo ×3 +3 · ×6 +5 · resposta de 10 +1), `docs/AVALUACIO.md`, CHANGELOG 2.9.0, README, ESTAT, proves, nucli, PR, Action en verd, fusió i `versio.json` → `2.9.0`.

---

## PR 3 · v2.10.0 · Super combo ⚡

### Task 10: Dificultat de cada pregunta

**Files:**
- Create: `motor/dificultat.json` (`{"<assig>":{"<tema>/<núm>":3}}`; també s'hi accepta 1 per a les fàcils; sense entrada vol dir 2)
- Modify: `motor/build.py` (després de `QIDS`, l. ~27-30: `mons_js += "\nconst QDIF=" + json.dumps(dif.get(assig,{}),…) + ";"`)
- Modify: `motor/plantilla-estudi-interactiu.html`: bloc dels ids (l. ~548-550)

**Interfaces:**
- Produces:
  - `function difDe(q): 1|2|3` (torna `(typeof QDIF!=="undefined"&&q&&q.id&&QDIF[q.id])||2`).
  - `cpQ` copia també `d`: `Object.assign(q.slice(),{id:q.id,d:difDe(q)})`.
  - `build.py` falla amb un missatge clar si una clau de `dificultat.json` no existeix a `qids.json`.

- [ ] **Step 1: Prova `bnProvaDificultat` (falla).** Amb `QDIF` buit:
  - `difDe(T[0].q[0])===2`
  - `difDe({})===2` (pregunta sense id)
  - Amb `QDIF[T[0].q[0].id]=3`: `difDe(T[0].q[0])===3` i `cpQ(T[0].q[0]).d===3`.
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar amb `difDe is not defined`.
- [ ] **Step 3: Implementa** `dificultat.json` (`{}`), la injecció a `build.py`, `difDe` i el `cpQ` nou.
- [ ] **Step 4: Executa la iteració ràpida.** `bnProvaDificultat: ok`. Prova també una clau falsa a `dificultat.json`: `python3 motor/tot.py` ha de fallar amb el missatge.
- [ ] **Step 5: Commit.** `feat(motor): dificultat de cada pregunta des de motor/dificultat.json (nN)`

### Task 11: Primera passada de preguntes difícils (porta: revisió de Víctor)

**Files:**
- Modify: `motor/dificultat.json`
- Create: `motor/dificultat.py` (genera `docs/DIFICILS.md`: per món, una taula amb id, pregunta i resposta correcta de cada pregunta marcada)

- [ ] **Step 1: Marca les difícils.** Per a cada món, aproximadament 1 de cada 5 preguntes de test. Criteris:
  - càlcul de més d'un pas
  - excepcions a una regla
  - distractors molt propers a la resposta
  - conceptes que es confonen entre ells
  - i, si hi ha dades, encert per sota del 60 % amb 5 respostes o més (avui, 3 preguntes)
- [ ] **Step 2: Genera la llista** (`python3 motor/dificultat.py`) i publica-la com a document perquè Víctor la revisi.
- [ ] **Step 3: Aplica els canvis de Víctor** a `dificultat.json` i torna a generar `docs/DIFICILS.md`.
- [ ] **Step 4: Commit.** `feat(dades): primera passada de preguntes difícils revisada (nN)`. No es continua sense la seva conformitat.

### Task 12: Super combo i marca ⚡

**Files:**
- Modify: `motor/plantilla-estudi-interactiu.html`:
  - gestor de resposta de `test` (l. ~1048) i la seva capçalera
  - `pintaExR` i `fiExamenReal` (l. ~1287-1301)
  - llocs on es fa `COMBO=0` (`obre`, `joc`, `boss`, `repas`)
  - `FONTS`
- Modify: `admin/index.html`: `FONTS_EST` (afegir `super`)

**Interfaces:**
- Consumes: `difDe` (tasca 10).
- Produces:
  - `let CDIF=0`; `const SUPER_PREMIS={3:3,5:5}, SUPER_MAX=10`. `SUPER` ja és la constant de les superestrelles: no la reutilitzis.
  - `function ratxaDif(ok: boolean, q, paga: boolean): number`:
    - Si `!ok`, `CDIF=0`.
    - Si `ok&&paga&&difDe(q)===3`, `CDIF++`.
    - Paga `SUPER_PREMIS[CDIF]` amb `FONT=["super"]`, sense passar de `SUPER_MAX` al dia (`diaEst().sp`).
    - Quan `CDIF===5`, el torna a 0.
    - Pinta el rètol: «⚡ SUPER COMBO» o «⚡⚡ HIPER COMBO».
    - Torna les estrelles pagades.
  - `function marcaDif(q): string`: torna `<span class="dif">⚡</span>` si `difDe(q)===3`, si no `""`.

- [ ] **Step 1: Prova `bnProvaSuper` (falla).**
  - 3 × `ratxaDif(true,qDif,true)` donen 0, 0 i 3. Dues més donen 0 i 5, i `CDIF===0`.
  - Un cicle més el mateix dia: 2 ⭐ (topall de 10).
  - `ratxaDif(true,qNormal,true)` no toca `CDIF`.
  - `ratxaDif(true,qDif,false)` no toca `CDIF`.
  - `ratxaDif(false,qNormal,true)` posa `CDIF=0`.
  - Escut: amb `CDIF=2`, fallar i salvar el combo amb la germana deixa `CDIF===0` i `COMBO===salva`.
  - Una pregunta difícil al test mostra `.dif` a la capçalera.
- [ ] **Step 2: Executa la iteració ràpida.** Ha de fallar.
- [ ] **Step 3: Implementa.**
  - El gestor de `test` crida `ratxaDif(ok,q,nova>0&&!pista)` en cada resposta.
  - `marcaDif(q)` va a la capçalera de `test` i de `pintaExR`.
  - `fiExamenReal` recorre les preguntes en ordre i crida `ratxaDif(ok,q,novaDeQ)`. Els rètols surten esglaonats, com `retolMissio`.
  - `CDIF=0` allà on es fa `COMBO=0`.
  - `FONTS` i `FONTS_EST` guanyen `super`.
- [ ] **Step 4: Executa la iteració ràpida** als 6 mons. `bnProvaSuper: ok` i la prova de l'examen de veritat de `prova.js` continua en verd.
- [ ] **Step 5: Commit.** `feat(motor): super combo de preguntes difícils i marca ⚡ (nN)`

### Task 13: Versió 2.10.0 i PR

- [ ] Tot com a la tasca 6: `COM_GUANYAR` (⚡ super combo 3 +3 · 5 +5), `docs/AVALUACIO.md`, CHANGELOG 2.10.0, README, ESTAT, proves, nucli, PR, Action en verd, fusió i `versio.json` → `2.10.0`.

---

## Després de cada PR

Una setmana després de cada fusió, cal mirar al tauler de l'admin les xifres de la secció 5 de l'estudi: part de les estrelles que surt de les obertes, nens que fan obertes, errors apresos, estrelles per minut per activitat i distància entre el primer i el segon. Senyal d'alarma: si les estrelles al dia d'un nen actiu pugen més d'un 30 % sense més minuts, s'abaixen els premis o els topalls.
