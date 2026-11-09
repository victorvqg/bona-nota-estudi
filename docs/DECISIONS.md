# Decisions

Una entrada per decisió, la més nova a sota. Els números no es reutilitzen mai, tampoc els de les decisions revertides.

Com s'escriu una entrada:

    ## ADR-0001 · Títol curt
    Data: AAAA-MM-DD
    Decisió: què hem decidit (també val «no farem X»).
    Motiu: per què, i quines alternatives hem descartat.
    Com revertir-la: què caldria desfer.

## ADR-0001 · El boss del món també s'obre amb un examen aprovat
Data: 2026-11-08
Decisió: el boss s'obre quan has aprovat el 70 % dels temes o quan treus un 70 % o més en un examen (sorpresa o de veritat). Els temes només es compten amb el test de cada tema, com fins ara.
Motiu: un nen va treure un 15/15 a l'examen sorpresa (preguntes de 9 temes) i el boss li seguia tancat perquè només tenia 5 temes aprovats amb el test de tema. Tots dos exàmens barregen preguntes de tot el món, així que un d'aprovat ja demostra el domini. Descartat: fer que les preguntes de l'examen aprovin temes (un tema es podria donar per aprovat amb una sola pregunta).
Com revertir-la: treure `exam` de `bossEstat()` i el text «o treu un 70 % en un examen» de `bossCarta()` a la plantilla, esborrar `bnProvaBossExamen` i regenerar amb `python3 motor/tot.py`.

## ADR-0002 · Els canvis es publiquen amb un PR que l'agent puja i fusiona
Data: 2026-11-08
Decisió: cap agent fa push directe a `main`. Treballa en una branca, la puja, obre un PR cap a `main` i, quan l'Action «Revisa Bona Nota» del PR surt en verd, el fusiona amb squash i esborra la branca.
Motiu: abans l'AGENTS.md prohibia el push als agents, però a la pràctica es pujava directament a `main`. Amb el PR queda un registre de cada canvi i la revisió automàtica passa abans de publicar, sense que el Víctor hagi de fer res. Descartat: que el Víctor fusioni cada PR a mà (més lent i no ho vol).
Com revertir-la: tornar la línia «Mai: push, merge, deploy…» a l'AGENTS.md i treure l'apartat «Pujar i publicar».

## ADR-0003 · Versions de tres números amb CHANGELOG.md i etiquetes de git
Data: 2026-11-09
Decisió: el producte es numera `MAJOR.MENOR.PEDAÇ`. La primera entrada de `CHANGELOG.md` és la versió actual, la capçalera del README en repeteix el número i cada versió porta una etiqueta de git `vX.Y.Z`. Les versions 1.0.0 a 2.3.0 s'han assignat a posteriori a partir de l'historial; el 2 ve de «Bona Nota 2.0», com ja es deia als commits.
Motiu: fins ara només hi havia empremtes automàtiques (`versio.json`, `VERSIO` de `sw.js`), que serveixen per refrescar les còpies dels mòbils però no diuen què ha canviat. Descartat: fer servir `versio.json` per al número (`tot.py` el reescriu a cada canvi) i un fitxer de versió a part (un lloc més per mantenir).
Com revertir-la: esborrar `CHANGELOG.md`, la versió de la capçalera i l'apartat «Versions» del README, la regla de `docs/CONVENCIONS.md` i les etiquetes `v*`.
