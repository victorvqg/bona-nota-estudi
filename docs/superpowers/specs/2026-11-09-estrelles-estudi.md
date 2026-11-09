Origen: estudi n2505 (Claude Docs, https://claude.ai/artifact/Fxh8wnJjhEEHD5qpT9HNtm), exportat el 9/11/2026 amb les decisions aprovades (n2506). El gràfic i el diagrama del document original s'han convertit en una taula i una llista.

# n2505 · Estudi i pla per millorar les estrelles de Bona Nota

9/11/2026 · Víctor

**En poques línies.** Avui les estrelles es guanyen sobretot amb jocs (la meitat) i tests. Les preguntes obertes, que són les més semblants a l'examen, donen entre el 2 % i el 4 %, i la dificultat no compta per a res. Proposo dos combos nous: el **✍️ triple combo**, per encadenar 3 obertes ben explicades, i el **⚡ super combo**, per encertar seguides 3 preguntes marcades com a difícils. Abans, però, cal tapar dos forats: el combo actual es pot alimentar repetint tests, i el repàs no paga res mentre el fas. També cal apuntar sempre d'on surt cada estrella, per poder mesurar el canvi. Tot plegat, en 5 fases petites, cada una amb el seu PR, i sense tocar les estrelles ja guanyades. Al final hi ha 7 decisions que necessito que prenguis tu abans de programar.

## 1. Com funcionen ara les estrelles

Totes les estrelles d'un món passen per una sola funció del motor (`suma`, a `motor/plantilla-estudi-interactiu.html`). Aquesta funció suma al perfil, apunta d'on surt cada estrella (`fonts`) i fa saltar el nivell i la superestrella quan toca. Hi ha un principi que ja funciona bé, les «estrelles justes»: repetir una cosa el mateix dia no torna a pagar.

### Què paga cada cosa

| On | Què dona | Límit que ja hi ha |
| --- | --- | --- |
| Test d'un tema | +1 ⭐ per encert | Cada pregunta paga només la primera vegada del dia. Amb 💡 pista no paga ni suma al combo |
| Jocs | +1 ⭐ per encert | Només la primera partida del dia de cada joc |
| Examen sorpresa i examen de veritat | +1 ⭐ per encert | Com els tests: un cop per pregunta i dia |
| Preguntes obertes | +1 ⭐ per idea clau que es detecta al text | Un cop al dia. Després de puntuar, aquella pregunta no torna a puntuar en 3 dies |
| Combo (encerts seguits) | Es veu a partir de ×3. A ×5, +1 ⭐; a ×10, +2 ⭐; i així cada 5 i cada 10 | Només a tests, examen sorpresa i repàs. Compta també les respostes que ja no donen estrella. 🛡️ L'escut en salva la meitat |
| Rècord d'un tema | +2 ⭐ si superes la teva millor nota | Només quan millores |
| Repàs dels errors | +2 ⭐ quan un error queda après | Cal encertar-lo 3 cops en dies separats (el dia, 3 dies després i 7 dies després). Mentre repasses, els encerts no donen estrella |
| Missions del dia | +3 ⭐ cada una, +5 ⭐ si fas les 3 | Màxim 14 ⭐ al dia per món |
| Boss del món | +10 ⭐ si el vences | Un cop al dia |

### Nivells, superestrelles i rànquing

- **Nivells**: n'hi ha 10 per món, de 🐣 Aprenent (0 ⭐) a 🌟 Llegenda d'or (330 ⭐ en aquell món).
- **Superestrella 🌠**: en guanyes una cada 50 ⭐, sumant tots els mons.
- **Rànquing**: suma la millor xifra de cada món dels últims 120 dies. Té les pestanyes Estrelles, Temps, Nivell, Setmana i Remuntada (errors apresos).
- **Fre del servidor**: si un dispositiu envia un salt de més de 150 ⭐ de cop, o de més de 300 ⭐ en 24 hores en un món, el servidor el retalla. Fins ara no ha retallat mai res.

### Què diuen les dades

He consultat el registre de Supabase (sense noms): 10 nens amb estrelles, 6 mons i 1.836 ⭐ en total.

**Gràfic: «Els jocs donen la meitat de les estrelles i les obertes gairebé res»** (1.148 estrelles amb origen registrat · tots els nens i mons · últims 120 dies · font: Supabase bn_log, camp «fonts» de l'últim registre de cada nen i món, consulta del 9/11/2026)

| Origen | Estrelles | % |
| --- | --- | --- |
| Jocs | 592 | 51,6 % |
| Tests dels temes | 272 | 23,7 % |
| Missions del dia | 104 | 9,1 % |
| Exàmens | 94 | 8,2 % |
| Combos (ratxes) | 42 | 3,7 % |
| Rècords millorats | 24 | 2,1 % |
| Preguntes obertes | 20 | 1,7 % |
| Repàs dels errors | 0 | 0 % |
| Boss del món | 0 | 0 % |

Els jocs donen la meitat de les estrelles amb origen conegut. Les preguntes obertes, que són les que s'assemblen més a l'examen, en donen 20. El registre compta 80 idees detectades en 48 respostes obertes, de manera que la seva part real deu estar entre el 2 % i el 4 %. El repàs i el boss no han donat cap estrella.

## 2. Què falla avui

**1. Les obertes es fan poc i no tenen cap moment d'èxit propi.** Són el que més s'assembla a l'examen, però en 120 dies només hi ha 48 respostes, i 33 són del mateix nen. 6 dels 10 nens no n'han fet cap. Per resposta ja paguen bé (unes 3 o 4 ⭐ en uns 40 segons), però no es nota: la targeta diu només «✍️ idea +1», no hi ha ratxa ni rètol, i només surt confeti si arribes al 80 %.

**2. La dificultat no compta.** Una pregunta fàcil i una de difícil donen el mateix (+1 ⭐) i fan pujar el combo igual. Les preguntes no porten cap marca de dificultat. Els modes més exigents tampoc paguen més per encert: l'examen de veritat ni tan sols té combo, i el boss (9 intents) encara no ha donat cap estrella. Qui repeteix el que ja sap guanya el mateix que qui s'enfronta al que li costa.

**3. El combo es pot alimentar amb repeticions.** El combo compta també les respostes que ja no donen estrella (preguntes repetides el mateix dia i repàs). 1 de cada 3 tests (46 de 140) és repetir el mateix tema el mateix dia, fins a 6 vegades seguides. Cada 10 encerts seguits donen +3 ⭐ encara que les preguntes ja hagin pagat. Avui és poca cosa (42 ⭐, el 3,7 %), però si afegim combos més grossos aquest forat creix amb ells. Cal tancar-lo abans.

**4. El repàs no paga mentre el fas.** Hi ha 51 sessions de repàs i encara cap error après, perquè cal una setmana per graduar-lo: 0 ⭐. Per a un nen, repassar errors és feina sense premi, i és just on més s'aprèn.

**5. No s'entén d'on surten les estrelles, i no ho podem mesurar del tot.** La targeta «On guanyes les estrelles» només en cita 5 (test, joc, idea, combo ×5 i ×10) i s'oblida de missions, rècords, repàs i boss. A més, el 37 % de les estrelles (688 de 1.836) no té l'origen apuntat: en 3 mons del primer del rànquing, l'últim registre no porta `fonts`. Sense això no podrem saber si els canvis funcionen.

**6. Risc nou: el detector d'idees és generós.** Les respostes obertes treuen un 80 % de mitjana i 32 de 48 arriben al 80 %, escrites en uns 40 segons. El detector busca paraules clau. Si les obertes paguen més, una llista de paraules sense frases podria cobrar com una explicació. Abans de premiar-les més, cal fer-lo una mica més exigent.

### El que no falla

El primer del rànquing no fa trampes: té 859 ⭐ en 464 minuts durant 8 dies, unes 1,9 ⭐ per minut. El segon en fa unes 2,6 (342 ⭐ en 131 minuts). La diferència és el temps que hi dedica, no cap truc, i el fre del servidor no ha saltat mai. No cal un sistema dur contra les trampes. Només cal no obrir-ne de nous.

## 3. Propostes

### A. ✍️ Triple combo a les preguntes obertes

- **Què compta**: respostes obertes bones seguides, en el mateix món i el mateix dia. Una resposta és bona si puntua (no és pràctica ni repetida avui), si s'hi detecta com a mínim el 60 % de les idees i si passa el filtre de frases de l'apartat B.
- **×2**: rètol «DOBLE ✍️✍️», sense premi, per crear expectativa.
- **×3**: «TRIPLE COMBO ✍️✍️✍️», +3 ⭐.
- **×6**: «MEGA COMBO», +5 ⭐.
- **Resposta de 10**: si es detecten totes les idees, +1 ⭐ més i rètol propi.
- **Si una resposta no arriba al 60 %**, la ratxa torna a 0. No es perd res del que ja s'ha guanyat.
- La ratxa es guarda dins del dia. No es perd en canviar de pantalla, a diferència del combo dels tests, que es reinicia en obrir un tema.
- **Topall**: 8 ⭐ de combo d'obertes al dia per món. El límit que ja hi ha (cada pregunta puntua un cop cada 3 dies) continua igual.

Amb això, una tanda de 3 obertes ben fetes passa d'unes 10 ⭐ a unes 13 o 14, i sobretot té un moment de celebració propi.

### B. Filtre perquè una llista de paraules no cobri com una explicació

- Per comptar per al triple combo, el text ha de tenir com a mínim 4 paraules per idea detectada i almenys una frase amb un connector (és, són, perquè, que, quan, per això…).
- Si no ho passa, les idees continuen donant les seves ⭐, però la ratxa no avança. El missatge ho explica: «✏️ Per al combo, explica-ho amb frases».
- Els llindars (4 paraules, 60 %) s'ajusten després amb les dades.

### C. ⚡ Super combo per a les preguntes difícils

**Pas 1: marcar la dificultat de cada pregunta** (1 fàcil, 2 normal, 3 difícil).

- Al principi, a mà: un camp opcional `d:3` a les preguntes de `motor/dades/*.js`. Sense camp, la pregunta és normal. Puc fer una primera passada marcant-ne com a difícils més o menys 1 de cada 5 per món, i tu la revises.
- Més endavant, automàtic a partir del registre: quan una pregunta tingui prou respostes (per exemple 8), si l'encerta menys del 55 % dels nens passa a difícil, i si l'encerta més del 90 %, a fàcil. Avui només 29 de 272 preguntes tenen 5 respostes o més, així que aquest pas ha d'esperar.

**Pas 2: el super combo.**

- Un comptador propi de preguntes difícils encertades seguides, sense pista i que donin estrella. Les preguntes normals i fàcils no el fan pujar ni el trenquen. Qualsevol error el torna a 0.
- **3 difícils seguides**: «⚡ SUPER COMBO», +3 ⭐. **5 seguides**: «⚡⚡ HIPER COMBO», +5 ⭐.
- Funciona als tests, a l'examen sorpresa i a l'examen de veritat. En aquest últim es compta en lliurar-lo, perquè no diu res pregunta a pregunta.
- Les preguntes difícils porten una marca ⚡, perquè el nen sàpiga que s'hi juga el super combo abans de respondre.
- Opcional: una difícil encertada dona +2 ⭐ en lloc de +1, també només la primera vegada del dia.
- **Topall**: 10 ⭐ de super combo al dia per món.

**Alternativa que no recomano**: un super combo per als nens de nivell alt (del 7 cap amunt). Premiaria qui ja va al davant, faria més gran la distància, i un nen nou no el veuria mai.

### D. Tapar forats i fer que s'entengui

- **Combo net**: només el fan pujar les respostes que donen estrella. Les repeticions del dia i el repàs no el fan pujar, però tampoc el trenquen.
- **Repàs que paga**: +1 ⭐ per cada error que encertes al repàs, un cop per error i dia, fins a 10 al dia per món. Les +2 ⭐ quan l'error queda après es queden igual.
- **Barra de ratxa** visible durant el test, per veure com s'acosta el combo.
- **Targeta «On guanyes les estrelles»** amb totes les fonts i els valors reals, les noves incloses.
- **Origen sempre apuntat**: que tots els registres portin `fonts`, per poder mesurar.

### Resum de valors

| Mecànica | Quan salta | Premi | Topall al dia per món |
| --- | --- | --- | --- |
| 🔥 Combo dels tests (ja existeix) | ×5 i ×10 encerts seguits | +1 i +2 ⭐ | Ara cap. Proposta: només amb respostes que paguen |
| ✍️ Triple combo | 3 obertes bones seguides (6 per al MEGA) | +3 ⭐ (+5 al MEGA) | 8 ⭐ |
| ✍️ Resposta de 10 | Totes les idees d'una oberta | +1 ⭐ | Ja limitat: cada pregunta, un cop cada 3 dies |
| ⚡ Super combo | 3 difícils seguides sense error (5 per a l'HIPER) | +3 ⭐ (+5 a l'HIPER) | 10 ⭐ |
| ⚡ Pregunta difícil (opcional) | Encertar una difícil | +2 ⭐ en lloc de +1 | Ja limitat: un cop per pregunta i dia |
| 🔁 Repàs | Encertar un error al repàs | +1 ⭐ | 10 ⭐ |

Els topalls nous sumen 28 ⭐ al dia per món, més les respostes de 10 i, si s'activa, l'extra de les difícils. Tot plegat queda molt lluny del fre del servidor (300 ⭐ al dia). No cal tocar els nivells ni les superestrelles d'entrada. Si després es veu que es puja massa de pressa, es poden ajustar.

## 4. Pla per fases

**Diagrama: «Primer mesurar i tapar forats; després, els combos nous»** (5 fases, cada una amb el seu PR):

1. **Fase 0 · Mesurar** (v2.7.2 · motor, admin): tots els registres porten d'on surt cada estrella i el combo màxim. Al tauler: estrelles per origen i per minut. Els nens no hi veuen res.
2. **Fase 1 · Tapar forats** (v2.8.0 · motor, proves): combo net, només el fan pujar les respostes que donen estrella. Repàs +1 per error encertat, barra de ratxa i targeta amb totes les fonts.
3. **Fase 2 · Triple combo ✍️** (v2.9.0 · motor, proves): ratxa d'obertes bones (×3: +3, ×6: +5) i resposta de 10 (+1). Filtre de frases: una llista de paraules no fa avançar la ratxa.
4. **Fase 3 · Super combo ⚡** (v2.10.0 · dades dels 6 mons, motor, proves): camp d:3 a les preguntes difícils i marca ⚡ abans de respondre. Comptador de difícils seguides (3: +3, 5: +5), també a l'examen de veritat.
5. **Fase 4 · Calibrar** (amb dades · Supabase, motor): dificultat calculada amb l'encert real quan cada pregunta té prou respostes. Ajust de llindars i topalls amb el que hagin mostrat les fases 0 a 3.

**Per què aquest ordre.** Les fases 0 i 1 van primer perquè, amb el forat del combo obert, els combos nous el multiplicarien, i sense l'origen apuntat no sabríem si funcionen. Les fases 2 i 3 no depenen l'una de l'altra. Proposo fer abans les obertes perquè és el buit més clar (el 2 % de les estrelles) i no necessita marcar res a les dades.

**Esforç i risc de cada fase.**

- **Fase 0**: petita i sense risc, perquè els nens no hi veuen cap canvi.
- **Fase 1**: petita. El risc és que un nen noti que repetir el mateix test ja no fa pujar el combo. Convindrà explicar-ho a la targeta.
- **Fase 2**: mitjana. El risc és el detector d'idees, per això el filtre de frases hi va inclòs.
- **Fase 3**: la més llarga, perquè cal marcar les preguntes difícils dels 6 mons. El codi és petit i el risc, baix.
- **Fase 4**: petita, però depèn que hi hagi prou respostes.

**Com es fa cada fase**, com sempre: branca nova des de `main`, canvi al motor (`motor/plantilla-estudi-interactiu.html`), `python3 motor/tot.py` per regenerar els 6 mons, casos nous a `motor/prova.js` (combos, topalls i filtre), PR, Action «Revisa Bona Nota» en verd i fusió. Supabase només es toca a la fase 0, si el tauler necessita una funció nova, i a la fase 4, per a la dificultat calculada. En tots dos casos et passo l'SQL i l'apliques tu.

**Les estrelles ja guanyades no es toquen.** Els canvis només valen d'aquí endavant.

## 5. Com sabrem si funciona

Cal mirar-ho al tauler de l'admin una setmana després de cada fase. La fase 0 serveix precisament perquè aquestes xifres hi surtin.

| Què mirem | Avui | Què voldríem veure |
| --- | --- | --- |
| Part de les estrelles que surt de les obertes | Entre el 2 % i el 4 % | Com a mínim el 10 %, després de la fase 2 |
| Nens que fan alguna oberta | 4 de 10 en 120 dies | 7 de 10 cada setmana |
| Respostes obertes que passen el filtre de frases | Encara no es mesura | Més de la meitat. Si en passen menys, el filtre és massa dur |
| Encert a les preguntes difícils | Encara no es mesura | Que pugi setmana rere setmana després de la fase 3 |
| Errors apresos al repàs | 0 en 51 sessions | Com a mínim 1 per setmana per a cada nen que repassa |
| Tests repetits el mateix dia | 1 de cada 3 | Que no pugi |
| Estrelles amb origen apuntat | El 63 % | El 100 % |
| Estrelles per minut segons l'activitat | No es pot calcular bé | Cap activitat no ha de pagar el doble que una altra |
| Distància entre el primer i el segon del rànquing | 859 i 342 ⭐ | Que no creixi pels combos nous |

**Senyal d'alarma**: si les estrelles al dia d'un nen actiu pugen més d'un 30 % sense que hi passi més minuts, els combos paguen massa i s'han d'abaixar els premis o els topalls.

## 6. Decisions que has de prendre abans de programar

✅ **Totes decidides el 9/11/2026**: a cada punt, l'opció recomanada. Al 3, sense l'extra de +2 ⭐ per difícil. Al 6, la primera passada la faig jo i tu revises la llista. Es comença per les fases 0 i 1 en un sol PR.

1. **Què vol dir «nivells alts de dificultat»?** Recomano que siguin les preguntes difícils, marcades amb ⚡. L'alternativa més ràpida és aplicar el super combo només als modes difícils (examen de veritat i boss): no cal marcar res, però surt molt menys sovint. El nivell del nen no el recomano.

   ✅ **Decidit (9/11/2026):** el super combo va amb les preguntes difícils, marcades amb ⚡.
2. **Valors del triple combo**: ×3 +3 ⭐ i ×6 +5 ⭐, amb el llindar del 60 % de les idees. Et semblen bé, o els vols més alts o més baixos?
3. **Valors del super combo**: 3 difícils seguides +3 ⭐ i 5 seguides +5 ⭐. I l'extra de +2 ⭐ per difícil? Recomano no activar-lo al principi i decidir-ho amb les dades.
4. **Repàs que paga**: +1 ⭐ per error encertat, fins a 10 al dia per món. Sí o no?
5. **Combo net**: acceptes que repetir el mateix test el mateix dia ja no faci pujar el combo?
6. **Qui marca les preguntes difícils?** Puc fer jo la primera passada (més o menys 1 de cada 5 per món) i tu revises la llista, o les marques tu directament.
7. **Per on comencem?** Recomano fer les fases 0 i 1 juntes en un sol PR, perquè són petites i van lligades. Després, la fase 2.
