# AGENTS.md

Instruccions per a qualsevol agent de codi (Claude Code, Kimi, Codex) en aquest repo.

## Nucli

Aquest repo fa servir el nucli (`nucli.json`: checks, regles i commits). Docs: estat `docs/ESTAT.md` · decisions `docs/DECISIONS.md` · trampes `docs/TRAMPES.md` · convencions `docs/CONVENCIONS.md` · arquitectura `docs/ARQUITECTURA.md`.

Cicle de cada canvi: llegeix els docs i la tasca → si toca més d'un mòdul, pla a `.nucli/pla-<id>.md` abans del codi → canvi mínim, amb commits `tipus(àmbit): què (<id>)` en català (a una branca d'issue, `issue/N-…`, l'id és `#N` i l'assumpte acaba en ` (#N)`) → `nucli ship plan` → `nucli ship run <check>` per a cada check automàtic → `nucli ship seal`. Si no pots acabar, escriu per què a `.nucli/atura-<id>.md` i no facis commit de feina a mitges.

Mai: push, merge, deploy ni `nucli finish` (el llança una persona). No editis `.nucli/rebuts/`, `nucli.json` ni `.claude/` per passar la porta.

