# 🌍 Guia per construir un món nou

Com s'afegeix un **món nou** a Bona Nota de cap a cap. Amb Claude Code, la skill **`nou-mon`** (`.claude/skills/nou-mon/SKILL.md`) ho fa tot d'una tirada a partir d'una carpeta de Drive: llegeix els apunts, escriu el món, el revisa i el publica sense preguntar res ni obrir cap finestra de permís.

**El camí curt:**

```sh
python3 motor/nou_mon.py --id <id> --carpeta <assignatura>/<id> --materia "Matèria" --titol "Títol" --desc "Una frase" --colors "#c1,#c2,#c3" --ic 🌋 --curt "Títol" --spr <sprite> --xat "peça 1|peça 2|peça 3"
# … omple motor/dades/<id>.js (apartat 1) …
python3 motor/tot.py
node motor/revisa-mon.js <id>
python3 motor/publica.py --id gN --missatge "feat(mons): afegeix el món N Títol (gN)"
```

Ja **no cal** tocar l'admin, `sprites.js`, l'SQL de `bn_control.sql` ni les proves: tot surt de `motor/mons.json` (apartat 2).

---

## 1. El fitxer de dades (`motor/dades/<id>.js`)

`nou_mon.py` en crea l'esquelet. Agafa com a referència un món existent (`motor/dades/geosfera.js`, `motor/dades/biogeo.js` o [`MON-ANGLES.md`](MON-ANGLES.md) si és de llengües amb frases amb buits):

1. **`ASSIG`**:
   - Identitat: `id`, `nom`, `tema`, `curs`, `ic`, `color` (`[c1, c2, c3]`), `peu`, `blocs` (la suma de `n` = nombre de temes).
   - `jocs`: `ordena`, `parelles`, `classifica`, `figura` (amb una funció que torna un `<svg>`), `error` («Troba l'error»), `frases`…
   - **`boss`**: segueix [`BOSS-I-EFECTES.md`](BOSS-I-EFECTES.md) §3:
     - **Opció A (1 línia):** tria `spr`, `fx` i `mus` del catàleg i defineix `nom`, `rotul` i `em`. Si la icona central de l'`fx` no lliga amb el món (per exemple, la rosa de Sant Jordi d'`explosio`), canvia-la amb `ic`.
     - **Opció B (a mida):** sprite 16×16 propi (`pix`) i/o melodia WebAudio (`notes`, `bpm`, `timbre`) dins `ASSIG.boss`.
2. **`T` (temes)**: cada tema amb `id`, `ic`, `col`, `titol`, `font`, `idea`, `pts`, `truc`, `compte`, `fc` (targetes) i `q` (preguntes). **Mínim 8 preguntes per tema**, 3 opcions amb una sola correcta, distractors amb els errors típics i la correcta com a opció més llarga entre el 15 % i el 40 % de les vegades ([`CONVENCIONS.md`](CONVENCIONS.md)).
3. **`OB` (preguntes obertes)**: `t` (etiqueta), `q`, `p` (idees clau que detecta el corrector) i `m` (resposta model).
4. Opcional: il·lustració animada a `motor/ilu/<id>.svg` (200×130; si no n'hi ha, la portada mostra `ic`) i preguntes difícils a `motor/dificultat.json` + `motor/dificultat-motius.json` (després, `python3 motor/dificultat.py`).

Les dades dubtoses dels apunts no es pregunten: van a la fitxa com a «⚠ … pregunta-ho al profe».

## 2. L'entrada de `motor/mons.json`

`nou_mon.py` l'afegeix al final (la portada pinta els mons del més nou al més antic). `python3 motor/tot.py` en genera la resta:

| Camp | Per a què | Genera |
|---|---|---|
| `dades`, `carpeta`, `mon`, `neix`, `materia`, `titol`, `desc`, `colors`, `ic` | La pàgina del món i la targeta de portada | `<carpeta>/index.html`, `index.html` |
| `curt` | Nom del món al tauler | `ASSIGS` a `admin/index.html` |
| `spr` | Icona del món al rànquing (clau de `BN_SPR` a `sprites.js`) | `BN_MON` a `sprites.js` |
| `xat` | 3 paraules d'estudi per al xat (`[id < 1001, "text"]`) | `XAT-MONS` a `index.html` i `supabase/bn_xat.sql` |
| `xmon`, `col_admin`, `demo_jocs` (opcionals) | Nom al xat de l'admin, 8 colors del tauler, jocs de la demo | `XMON`, `COL_MON`, `DEMO_JOCS` (si falten: `curt`, colors derivats de `colors[1]` i els 4 primers jocs) |
| `llengua: "es"` (opcional) | Xips i peu en castellà | — |

Les marques `MONS-ADMIN`, `BN-MON` i `XAT-MONS` diuen «no editar a mà». `motor/prova-mons.js` comprova que tot coincideix. A Supabase els mons es validen pel format de l'id: només cal fer l'`upsert` de les 3 peces del xat (les files del món del bloc `XAT-MONS` de `supabase/bn_xat.sql`).

## 3. Revisions (soles i a cada PR)

- `node motor/revisa-mon.js <id>`: preguntes, opcions, jocs, figures, «Troba l'error», sprite del boss i la regla del 15–40 %.
- `ESTRICTE=1 node motor/prova.js $PWD/<carpeta>/index.html`: el món sencer al navegador.
- `node motor/prova-visual.js <carpeta>`: res surt de la pantalla ni dels dibuixos a 360, 390 i 430 px (captures a `motor/.captures/<id>/`).
- `node motor/prova-tot.js` passa en local el mateix que l'Action (també comprova que `tot.py` no canviï res); `node motor/prova-tot.js motor/prova-xat.js` en passa una sola. `publica.py` ja passa el revisor i, per als mons canviats, la visual i l'estricta.
- **Filtre de Bon Ús ([`BON-US.md`](BON-US.md) §6)** si el món porta alguna mecànica nova.

## 4. Versió i publicació

Un món nou puja el número **MENOR**: entrada a `CHANGELOG.md`, capçalera del `README.md` i `docs/ESTAT.md`, i fila i apartat a `docs/MONS.md`. Després, `python3 motor/publica.py --id gN --missatge "…"` obre el PR i el deixa en **fusió automàtica**: GitHub el fusiona quan «Revisa Bona Nota · tot» surt en verd, l'Action «Etiqueta la versió» posa `vX.Y.Z` i bonanota.net s'actualitza en 1-2 minuts.

## 5. Permisos de Claude Code (sense finestres)

Perquè la skill `nou-mon` i `publica.py` vagin d'una tirada, `.claude/settings.local.json` (personal, fora de git) porta aquest bloc. `gh` i `git push` no funcionen dins la sandbox, i les proves amb navegador tampoc: per això surten de la sandbox només aquestes ordres, i sempre soles (sense `&&` ni `|`). Les escriptures de `gh api` demanen confirmació, i fusionar amb `--admin` o empènyer cap a `main` està prohibit. Substitueix `<connector-de-…>` pels identificadors dels teus connectors (surten als noms de les eines `mcp__…`).

```json
{
  "sandbox": {
    "excludedCommands": [
      "gh *",
      "git push *",
      "git fetch *",
      "git pull *",
      "node motor/prova-tot.js",
      "node motor/prova-tot.js *",
      "node motor/prova-visual.js *",
      "python3 motor/publica.py *"
    ],
    "network": {
      "allowedDomains": [
        "bonanota.net",
        "github.com",
        "api.github.com"
      ],
      "allowLocalBinding": true
    }
  },
  "permissions": {
    "allow": [
      "mcp__<connector-de-Supabase>__execute_sql",
      "mcp__<connector-de-Supabase>__apply_migration",
      "mcp__<connector-de-Google-Drive>__search_files",
      "mcp__<connector-de-Google-Drive>__read_file_content",
      "mcp__<connector-de-Google-Drive>__get_file_metadata",
      "Bash(gh pr *)",
      "Bash(gh run *)",
      "Bash(gh api repos/victorvqg/bona-nota-estudi*)",
      "Bash(git push origin g*)",
      "Bash(git push origin issue/*)",
      "Bash(git fetch *)",
      "Bash(git pull *)",
      "Bash(node motor/prova-tot.js)",
      "Bash(node motor/prova-tot.js *)",
      "Bash(node motor/prova-visual.js *)",
      "Bash(python3 motor/*)",
      "Bash(curl -s* https://bonanota.net*)"
    ],
    "ask": [
      "Bash(gh api * -X *)",
      "Bash(gh api * --method *)",
      "Bash(gh api * -f *)",
      "Bash(gh api * -F *)",
      "Bash(gh api * --field *)",
      "Bash(gh api * --raw-field *)",
      "Bash(gh api * --input *)"
    ],
    "deny": [
      "Bash(git push --force*)",
      "Bash(git push -f*)",
      "Bash(git push *--force*)",
      "Bash(git push * -f*)",
      "Bash(git push origin main*)",
      "Bash(git push -u origin main*)",
      "Bash(git push *:main*)",
      "Bash(gh pr merge *--admin*)"
    ]
  }
}
```

