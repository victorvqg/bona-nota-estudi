---
name: nou-mon
description: Construeix i publica un món nou de Bona Nota d'una tirada a partir d'una carpeta de Google Drive (diapositives, esquema, examen, respostes), sense preguntar res a mig camí. Activa-la quan l'usuari digui «genera/crea/fes un món nou», «un món amb aquesta carpeta» o enganxi un enllaç de drive.google.com/drive/folders per fer-ne un món.
allowed-tools: mcp__cb571b72-86ef-4503-9ef6-6a2edb41d374__search_files, mcp__cb571b72-86ef-4503-9ef6-6a2edb41d374__read_file_content, mcp__cb571b72-86ef-4503-9ef6-6a2edb41d374__get_file_metadata, mcp__93acffd1-4a53-419c-8605-9779b8a5a5ab__execute_sql, mcp__93acffd1-4a53-419c-8605-9779b8a5a5ab__apply_migration, Bash(python3 motor/*), Bash(node motor/*)
---

# Món nou d'una tirada

De l'enllaç de Drive a bonanota.net sense cap pregunta ni finestra de permís. La guia de contingut és `docs/NOU-MON.md`; aquesta skill és l'ordre de treball.

## Regles

- **No preguntis res a mig camí.** Decideix i deixa-ho escrit a la descripció del PR. El nom del món és el de la carpeta de Drive si l'usuari no en dona cap altre.
- **Ordres soles**, sense `&&`, `|`, `cd`, heredoc ni `$(…)`, i sense `dangerouslyDisableSandbox`: `gh`, `git push/fetch/pull`, `node motor/prova*.js` i `python3 motor/*.py` ja van sense finestra (`.claude/settings.local.json`). Fes servir `git -C <dir>` i `--body-file`.
- **Dades dubtoses** dels apunts (xifres que no quadren, errades de les diapositives): no les preguntis; posa-les a la fitxa com a «⚠ … pregunta-ho al profe».
- Contingut fidel als apunts, en català (o en castellà si la carpeta és de Castellà, amb `--llengua es`).

## Passos

1. **Llegeix la carpeta**: `search_files` amb `parentId = '<id de la carpeta>'` i `read_file_content` de cada fitxer (diapositives, esquema, examen, full de respostes).
2. **Tria l'id i la tasca**: id en minúscules a partir del títol (`geosfera`), carpeta `<assignatura>/<id>` (p. ex. `bio-i-geo/geosfera`), número de tasca `gN` = el més alt de `git log --oneline -40` + 1.
3. **Comença el món**:
   `python3 motor/nou_mon.py --id <id> --carpeta <carpeta> --materia "<Matèria>" --titol "<Títol>" --desc "<una frase>" --colors "#c1,#c2,#c3" --ic <emoji> --curt "<Títol>" --spr <sprite> --xat "<peça 1>|<peça 2>|<peça 3>"`
   `--spr`: una clau de `BN_SPR` a `sprites.js`; si cap no lliga, afegeix-n'hi una de 16×16 (paleta `BN_PAL`).
4. **Escriu el món** a `motor/dades/<id>.js` seguint `docs/NOU-MON.md`: un bloc per full de l'esquema, mínim 8 preguntes de test per tema (3 opcions, una sola correcta, distractors amb els errors típics del full de respostes), obertes amb idees clau (inclosa la pregunta oberta de l'examen), jocs (ordena, parelles, classifica, `figura` amb SVG propi per als dibuixos de l'examen, «Troba l'error» amb els errors típics) i un boss (`pix`/`notes` propis o del catàleg; `ic` si la icona de l'`fx` no lliga). Il·lustració animada a `motor/ilu/<id>.svg` (200×130, colors clars sobre el fons del món). Preguntes difícils a `motor/dificultat.json` i `motor/dificultat-motius.json`, i `python3 motor/dificultat.py`.
5. **Revisa fins a zero errors**: `python3 motor/tot.py` i `node motor/revisa-mon.js <id>` (inclou la regla del 15–40 % de la correcta més llarga). Repeteix fins que surti «0 errors».
6. **Revisió de fidelitat** (sense secrets): llança un subagent revisor amb el contingut dels PDFs i el camí de `motor/dades/<id>.js`; que comprovi que cada dada és als apunts, que les respostes correctes ho són i que les dades dubtoses estan marcades. Arregla el que trobi i torna al pas 5.
7. **Peces del xat a Supabase**: `apply_migration` amb l'`insert … on conflict` de les 3 peces del món (copia les seves files del bloc `XAT-MONS` de `supabase/bn_xat.sql`) i comprova-ho amb `execute_sql`. No cal cap altre SQL: els mons es validen pel format de l'id.
8. **Documenta i versió MENOR**: entrada a `CHANGELOG.md`, número a la capçalera del `README.md` i a `docs/ESTAT.md`, fila i apartat a `docs/MONS.md` i, si el boss és nou, la fila a `docs/BOSS-I-EFECTES.md`.
9. **Publica**: `python3 motor/publica.py --id gN --missatge "feat(mons): afegeix el món N <Títol> (gN)"`. Passa la prova estricta i la visual del món, obre el PR i el deixa en fusió automàtica. Activa el seguiment del PR (Auto-fix) perquè una fallada de la CI et desperti.
10. **Informa**: l'enllaç del PR, que es publicarà sol quan la revisió surti en verd, i les decisions preses (id, colors, dades dubtoses, què no s'ha pogut fer).
