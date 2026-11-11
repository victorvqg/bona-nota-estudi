# AGENTS.md

Instruccions per a qualsevol agent de codi (Claude Code, Gemini, Kimi, Codex) en aquest repo.

## Nucli

Aquest repo fa servir el nucli (`nucli.json`: checks, regles i commits). Docs: estat `docs/ESTAT.md` · decisions `docs/DECISIONS.md` · trampes `docs/TRAMPES.md` · convencions `docs/CONVENCIONS.md` · arquitectura `docs/ARQUITECTURA.md` · món d'Anglès `docs/MON-ANGLES.md` (com es construeix i les frases amb buits) · bon ús `docs/BON-US.md` (tota mecànica nova passa el filtre del seu apartat 6).

Cicle de cada canvi: llegeix els docs i la tasca → si toca més d'un mòdul, pla a `.nucli/pla-<id>.md` abans del codi → canvi mínim, amb commits `tipus(àmbit): què (<id>)` en català (a una branca d'issue, `issue/N-…`, l'id és `#N` i l'assumpte acaba en ` (#N)`) → `nucli ship plan` → `nucli ship run <check>` per a cada check automàtic → `nucli ship seal`. Si no pots acabar, escriu per què a `.nucli/atura-<id>.md` i no facis commit de feina a mitges.

## Pujar i publicar: sempre amb PR

Cada canvi va per una branca i un PR cap a `main`, i el fa l'agent de cap a cap:
1. Branca nova des de `main` actualitzat (`issue/N-…` si hi ha issue; si no, `nN-…` o `gN-…` amb l'id de la tasca).
2. `python3 motor/tot.py` i les proves; commit amb el format de sempre.
3. Push de la branca i PR cap a `main` (el títol, igual que el commit).
4. Quan l'Action «Revisa Bona Nota» del PR surt en verd, fusiona'l amb squash i esborra la branca. Fusionar és publicar: GitHub Pages ho posa a bonanota.net en 1-2 minuts.
5. Si l'Action falla, no fusionis: arregla-ho a la mateixa branca.

Mai: push directe a `main`, `push --force` a `main`, deploy manual ni `nucli finish` (el llança una persona). No editis `.nucli/rebuts/`, `nucli.json` ni `.claude/` per passar la porta.

