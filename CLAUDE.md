@AGENTS.md

## Només per a Claude Code
- Worktrees amb `claude --worktree <id>` només si `nucli init` no avisa de permisos pendents.
- `nucli finish` no el llancis tu: el fa l'usuari al terminal o amb `!`.
- Per començar un issue en una sessió, `nucli tasca N` (fa servir `gh`: la llança l'usuari, o demana-li permís).
- Per tancar o pausar la sessió, la skill `tanca-sessio`.
- Sense finestres de permís: `gh`, `git push`/`fetch`/`pull`, `node motor/prova*.js` i `python3 motor/publica.py` s'executen soles (sense `&&`, `|`, `cd`, heredoc ni `$(…)`; fes servir `git -C <dir>` i `gh … --body-file`) i sense `dangerouslyDisableSandbox`: `.claude/settings.local.json` les treu de la sandbox i les permet.
