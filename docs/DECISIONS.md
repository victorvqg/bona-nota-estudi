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
