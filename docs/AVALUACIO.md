# 📊 Com s'avalua a Bona Nota

Què vol dir cada nota, com es calcula i on es veu. Com es juga: [MONS.md](MONS.md). Com està fet: [README](../README.md).

> **La «F» del tauler no és un suspens.** Vol dir que el nen ha obert la **F**itxa o les targetes d'aquell tema, però encara no n'ha fet cap test.

**L'aprovat és un 70, no un 50.** Es fa servir el mateix llindar per aprovar un tema i per obrir el boss amb un examen.

---

## Domini per tema (tauler d'admin)

Cada fila és un tema i cada columna, un nen.

| Què hi surt | Què vol dir |
|---|---|
| `·` | No ha obert el tema |
| `F` | Ha obert la fitxa o les targetes, però no ha fet cap test |
| Un número | La **millor** nota dels seus tests d'aquell tema, sobre 100 |
| `×3` al costat del número | Quants intents ha fet |

| Nota | Color | Estat |
|---|---|---|
| 90 a 100 | Verd fosc | Aprovat |
| 70 a 89 | Verd clar | Aprovat |
| 50 a 69 | Groc | Per millorar |
| 0 a 49 | Vermell | Per millorar |

Si passes el ratolí per sobre d'una nota, veus els intents, la millor nota, l'última, com ha valorat el tema i els minuts de fitxa i targetes.

**Compte amb el període.** La taula només mira el període triat a dalt del tauler (avui, 7 dies, 30 dies o curs). Un tema aprovat fa tres setmanes pot sortir com a `F` o `·` si mires els últims 7 dies. Per veure el domini real, tria **Curs**.

---

## Test de cada tema

Són 6 preguntes a l'atzar del tema. La nota és el percentatge d'encerts, arrodonit.

| Encerts | Nota | Resultat |
|---|---|---|
| 6 de 6 | 100 | Excel·lent, aprovat |
| 5 de 6 | 83 | Aprovat |
| 4 de 6 | 67 | No aprova |
| 3 de 6 | 50 | No aprova |
| 2 de 6 | 33 | No aprova |
| 1 de 6 | 17 | No aprova |
| 0 de 6 | 0 | No aprova |

**A la pràctica, per aprovar cal encertar-ne 5 de 6.** Quan aprova, passa sol al tema següent.

Es pot repetir tantes vegades com vulgui, amb preguntes diferents. Sempre es guarda la millor nota.

---

## Exàmens

| | Examen sorpresa | Examen de veritat | Examen de mates |
|---|---|---|---|
| **Què és** | 15 preguntes de tot el món | 10 preguntes de tot el món | 6 exercicis del Taller |
| **Nota** | Percentatge | Sobre 10 (cada encert val 1 punt) | Sobre 10, amb nota parcial per passos |
| **Correcció** | A cada pregunta | Al final | Al final |
| **Ajudes** | Sense pistes | Sense pistes | Sense pistes |
| **Obre el boss** | Amb un 70 o més | Amb un 7 o més | No |
| **Al tauler** | `80%` | `70%` | `7,5 sobre 10` |

Qualificacions de l'examen de veritat: 9 o més, Excel·lent · 7 o més, Molt bé · 5 o més, Aprovat · menys de 5, Cal repassar. L'examen de veritat es pot fer amb 10 minuts de temps.

Qualificacions de l'examen de mates: 9 o més, Excel·lent · 7 o més, Notable · 6 o més, Bé · 5 o més, Suficient · menys de 5, Insuficient.

Valor dels exercicis de l'examen de mates:

| Exercici | Punts |
|---|---|
| Criteris | 1 |
| Divisors | 1,5 |
| Primer o compost | 1 |
| Escala | 2 |
| MCM i MCD | 2 |
| Problema | 2,5 |

Cada exercici puntua segons els passos ben fets, arrodonit a quarts de punt.

---

## Preguntes obertes

El nen escriu la resposta i **el programa comprova quines idees clau hi ha de veritat**.

**Abans de posar nota**, el text ha de ser una resposta real. Es rebutja si té menys de 6 paraules, si repeteix sempre les mateixes, si no semblen paraules (tecles a l'atzar) o si és una còpia de l'enunciat, de la resposta model o de les idees clau. A la casella tampoc es pot enganxar text.

- **Nota:** idees trobades al text sobre el total d'idees de la pregunta.
- **Una idea compta** si el text porta prou paraules importants seves que no siguin ja a l'enunciat, o els seus números.
- **80 o més:** resposta completa. **50 a 79:** falten idees. **Menys de 50:** cal repassar la fitxa.
- També li diu quant valdria a l'examen, sobre 1,5 punts.
- **Pràctica:** un cop vista la resposta model, aquella pregunta es pot tornar a fer, però durant 3 dies no canvia la nota ni dona estrelles.
- **✍️ Triple combo:** una oberta és «bona» si puntua, té com a mínim el 60 % de les idees i està explicada amb frases (4 paraules per idea i algun connector com «és», «que», «perquè» o el signe =). 3 bones seguides el mateix dia donen +3 ⭐ i 6 en donen +5 (després la ratxa torna a començar), fins a 8 ⭐ al dia per món. Una resposta per sota del 60 % la posa a 0; una de bona però sense frases no la fa avançar i el programa ho diu.
- **Resposta de 10:** si es troben totes les idees, +1 ⭐ més.

El programa busca paraules i no entén la frase, així que pot no trobar una idea explicada amb sinònims. El nen pot avisar que creu que l'ha posada: queda apuntat al tauler, però no canvia la nota.

Les notes anteriors a la versió 2.6.0 eren autoavaluacions, perquè les marcava el mateix nen.

**Quadern de mates:** els punts de control donen el percentatge de passos bé a la primera. La foto del quadern no posa nota: diu si està bé o quina és la primera línia equivocada.

---

## Jocs, repàs i boss

| Activitat | Com es puntua |
|---|---|
| **Jocs** | Encerts sobre encerts més errors. No aproven temes |
| **Repàs dels errors** | Percentatge recordat. Un error queda **après** quan s'encerta 3 vegades, en dies diferents (avui, +3 dies, +7 dies) |
| **Boss** | Es guanya o es perd, sense nota. Té 3 cors, i es guanya si li treu tota la vida abans de quedar-se sense cors |

---

## Estrelles i nivells

Les estrelles premien **l'esforç i la constància**. No són una nota de coneixement: un nen amb moltes estrelles no necessàriament domina el tema.

| Com es guanyen | Estrelles |
|---|---|
| Encert en un test o examen (cada pregunta, un cop al dia) | +1 |
| Encert en un joc (només la primera partida del dia de cada joc) | +1 |
| Idea clau trobada al text d'una oberta (cada pregunta, un cop al dia) | +1 |
| Resposta de 10: totes les idees d'una oberta | +1 més |
| Triple combo: 3 obertes bones seguides el mateix dia (6 per al «mega»; màxim 8 al dia per món) | +3 (+5 al mega) |
| Combo de 5 seguides (només compten les respostes que donen estrella) | +1 |
| Combo de 10 seguides | +2 |
| ⚡ Super combo: 3 preguntes difícils encertades seguides (5 per a l'«hiper»; la ratxa dura tot el dia, un error la trenca; màxim 10 al dia per món) | +3 (+5 a l'hiper) |
| Millorar el rècord d'un tema | +2 |
| Error encertat al repàs (cada error, un cop al dia; màxim 10 al dia per món) | +1 |
| Error après al repàs (encertat 3 cops en dies separats) | +2 |
| Cada missió del dia | +3 |
| Les 3 missions del dia | +5 més |
| Guanyar el boss (un cop al dia) | +10 |

No donen estrella les respostes amb pista. Les preguntes repetides el mateix dia no donen estrella ni fan pujar el combo. Cada 50 estrelles, sumant tots els mons, surt una **superestrella**.

El nivell depèn de les estrelles de cada món:

| Estrelles | Nivell | | Estrelles | Nivell |
|---|---|---|---|---|
| 0 | 🐣 Aprenent | | 100 | 🧠 Mestre |
| 10 | 🧭 Explorador | | 140 | 🏅 Campió |
| 25 | 🔍 Investigador | | 190 | 🦸 Heroi |
| 45 | 📜 Savi | | 250 | 👑 Llegenda |
| 70 | 🎓 Expert | | 330 | 🌟 Llegenda d'or |

---

## Altres xifres del tauler

| Xifra | Què és |
|---|---|
| **Nota mitjana dels tests** | Mitjana de tots els tests del període |
| **Tests aprovats** | Percentatge de tests amb un 70 o més |
| **Nota dels exàmens** | Mitjana de l'examen sorpresa i el de veritat. No inclou l'examen de mates |
| **Segons per pregunta** | Temps mitjà de resposta |
| **Preguntes més fallades** | Percentatge d'errors de cada pregunta i l'opció equivocada que més trien |
| **Valoració** | El que diu el nen en acabar un test: Costa, Bé o Fàcil. És una opinió |

A les llistes de sessions i de nens, els percentatges tenen uns altres colors: verd amb 80 o més, taronja de 50 a 79 i vermell per sota de 50. Aquests colors només ajuden a llegir la xifra i no indiquen si està aprovat.

### Alertes

| Alerta | Quan surt | Importància |
|---|---|---|
| Inactiu | Fa 3 dies o més que no estudia | Revisar. Atenció a partir de 7 dies |
| Les notes baixen | Les 3 últimes notes de test baixen i l'última és inferior a 70 | Revisar |
| Encallat | Ha fet 3 tests o més d'un tema i mai ha arribat a 70 | Atenció |
| Respon massa ràpid | Menys de 3 segons per pregunta de mitjana, en 2 tests o més. Potser endevina | Revisar |
| Pregunta difícil | La falla més de la meitat dels nens que l'han contestada (mínim 3) | Info |
| Temes pendents | Hi ha temes que altres nens ja han treballat i ell no ha obert | Info |

---

## On es defineix al codi

Si canvia alguna d'aquestes regles, cal actualitzar aquest document.

| Regla | On |
|---|---|
| Aprovat (70), preguntes per test (6), dies del repàs | `APROVA`, `NTEST` i `REP_DIES`, a `motor/plantilla-estudi-interactiu.html` |
| Nivells i superestrelles | `NIVELLS` i `SUPER`, a la plantilla |
| Boss | `bossEstat()` i `bossFi()`, a la plantilla |
| Examen de mates | `mxFiExamen()`, a `motor/eines/exercicis-mates.js` i el camp `mx.examen`, a `motor/dades/divisibilitat.js` |
| Colors i estats del domini | `bandPc()` i `tDomini()`, a `admin/index.html` |
| Preguntes obertes | `validaOberta()` i `ideaDetectada()`, a la plantilla |
| Alertes | `bn_admin_alertes`, a `supabase/bn_admin_tauler.sql` |
