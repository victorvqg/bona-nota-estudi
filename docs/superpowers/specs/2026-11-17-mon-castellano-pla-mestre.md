# Pla mestre · Millorar el món de Castellano

17/11/2026 · Revisió del món de Lengua Castellana (Temas 2 y 3; `motor/dades/castellano.js`, publicat a `castellano/t2-t3`). He comptat el contingut i he fet captures a 390 px de l'inici, la llista de jocs, una frase amb buits (fallada), la fitxa dels articles i el joc «¿B o V?».

**En poques línies.** És el món amb més temes (15) i té un bon test (120 preguntes), però és el que **menys es practica fent**:
- **Pocs jocs:** només 5 jocs clàssics per a 15 temes. Els **determinants** (4 temes) no en tenen cap, i tampoc **el diccionari, les fake news, la polisèmia ni la coma**.
- **Frases amb buits:** les 72 frases encara no expliquen per què una opció està malament (0 `per` i 0 `clau`), i moltes demanen la regla («El punto y coma indica una pausa mayor que la ___»).
- **Interferències del català** (*la Marta*, *el aula*, *la costum*): són l'error més típic d'aquest món i surten com a pista, però no hi ha cap joc que les entreni.
- **La interfície barreja llengües:** dins del món de castellà, els missatges del motor surten en català. Per exemple: «Toca la paraula que falta», «❌ No és aquesta. 💡 Evita poner…», «Exàmens», «Per obrir-lo: aprova 11 dels 15 temes».

Proposo aprofitar tot el que ja hem fet per a Català (`docs/MON-LLENGUA.md`): el **perquè de cada error**, el joc **«Pinta les paraules»**, **escoltar i puntuar** (amb la veu castellana), **fragments literaris** i **esquemes a la teoria**. A més, dues coses pròpies de Castellano: **un joc d'interferències del català** i **la interfície del món en castellà**. Són 6 fases, i al final hi ha 6 decisions.

---

## 1. Com és ara

| Peça | Què hi ha | Què hi falta |
|---|---|---|
| Temes | 15 en 2 blocs (Tema 2: texto y sustantivo · Tema 3: noticia, literatura y determinantes) | `practica` i `esquema` a cap tema |
| Test | 120 preguntes | — (funciona bé) |
| Frases amb buits | 6 jocs, 72 frases, totes amb `pista` i `ex` | **0 `per`, 0 `clau`.** Bastantes frases de regla («El punto y coma indica…», «Nunca pongas coma entre…») |
| Jocs clàssics | 5: ¿Concreto o abstracto?, Colectivo e individual, Las partes de la noticia, Géneros literarios, ¿B o V? | Res per als **determinants** (4 temes), el **diccionari**, les **fake news**, la **polisèmia**, la **coma** ni el text (adequació, coherència, cohesió) |
| Interferències del català | Surten a les pistes («Evita poner "la" delante como en catalán») i al subtítol d'un joc | Cap joc que les practiqui juntes |
| Veu | Castellà (`es-ES`) automàtic | No s'aprofita per a la puntuació ni la literatura |
| Interfície | Les dades en castellà | **Els textos del motor en català** dins del món |
| Obertes | 13 | — |

---

## 2. Proposta

### A · Frases que ensenyen per què (només contingut)

- **`per` a les opcions falses de les 72 frases**, sobretot a les que venen del català. Per exemple: «*La Marta*: en català sí que hi va article, en castellà no». «*la aula*: davant de *a* tònica es diu **el** aula, però continua sent femení: *el aula limpia*».
- **`clau`** on una paraula decideix la resposta: *aula* (a tònica), *Eduardo* (vocatiu), *ayer* (temps verbal en *-aba*).
- **Unes 10 frases de regla passen a frases d'ús**, i mantenen l'`id` perquè no es perdi el repàs. Abans: «El punto y coma indica una pausa mayor que la ___». Després: «Unos estudian; ___ juegan.»

### B · «Pinta las palabras» (el joc de Català, en castellà)

- **Determinantes:** a cada paraula d'un sintagma, si és artículo, demostrativo, posesivo, numeral, indefinido o el sustantivo. Exemple: *esos tres libros míos*.
- **Sustantivos:** concreto o abstracto, i individual o colectivo, en frases (*El rebaño cruzó el puente con alegría*).
- **Concordancia:** masculí o femení, i singular o plural, en noms trampa (*el aula*, *el agua*, *la señal*, *el color*).
- El motor ja hi és (`motor/eines/marca-llengua.js`). Només cal traduir-ne els textos (vegeu la proposta F) i escriure les dades.

### C · «¿Catalán o castellano?» (interferències)

Un joc de frases amb buits específic, `fr-interferencias`, amb 12 frases d'escriure o triar:
- **Gènere diferent del català:** la costumbre, el diente, la señal, el postre, el olor, la pendiente.
- **Article davant dels noms de persona:** «___ ha llegado» → *Marta*.
- **Plurals que canvien:** *el lápiz → los lápices* (en català, *els llapis*).
- **La coma davant de *y*** a les enumeracions.

Cada opció falsa té el `per` que explica la diferència amb el català. Aquest joc és el que més ajuda a l'examen, perquè és on més punts es perden.

### D · Escoltar, puntuar i llegir

- **«Escucha y puntúa»** (`escoltaAbans`), amb la veu castellana: interrogatives i exclamatives amb el signe d'obertura (**¿** **¡**), que en català no hi és. Es practica el parell **¿…?**.
- **«Puntúa el texto»:** cartes i textos curts amb comes de vocatiu, d'aclaració i d'enumeració, el punt i coma i els dos punts de la salutació («Querida Ana:»).
- **«¿Qué género es este texto?»:** fragments curts (poema lírico, escena de teatro, cuento, mito, leyenda, fábula), escrits per nosaltres o populars, que es poden escoltar.

### E · Jocs nous per als temes que no en tenen

- **La noticia:** «¿Fiable o clickbait?», classificar 10 titulars (camp `per` amb el perquè). «Las 5 W», pintar en una notícia curta qui, què, quan, on i per què.
- **El diccionario:** «Forma de entrada», escriure *canté → cantar*, *niñas → niño*, *mejores → bueno*. També ordenar paraules alfabèticament.
- **La polisemia:** parelles d'una mateixa paraula amb dos significats (*banco*, *sierra*, *gato*).
- **El texto:** «¿Qué falla?», triar si a un text li falta adecuación, coherencia o cohesión.
- **La B:** «Escribe b o v» amb el per de la regla (*-aba*, *bu-/bur-/bus-*, *bl/br*, *mb*).

### F · La interfície del món en castellà

- Un diccionari petit al motor (`TXT.es`) amb els textos que surten **dins de les activitats**:
  - les frases amb buits: «Toca la palabra que falta», «❌ No es esta», «Siguiente frase ▶»;
  - el joc de pintar, el test i els jocs clàssics;
  - els títols de la pantalla de jocs («Exámenes», «NUEVO») i l'avís del Boss.
- S'activa amb `llengua:"es"` (ja és a `mons.json`).
- La capçalera i el menú (Mons, Inici, Temes…) es queden en català, iguals a tots els mons, perquè el nen sempre els trobi al mateix lloc. **Decisió 1.**

### G · Teoria amb esquemes

`T[i].esquema` als temes clau:
- **Determinantes:** la taula artículo, demostrativo (*este, ese, aquel*), posesivo, numeral i indefinido, i un SN pintat.
- **La noticia:** la piràmide invertida (titular → entradilla → cuerpo) i les 5 W.
- **La coma:** quan sí i quan no (mai entre subjecte i verb).
- **La B:** les regles amb exemples.
- **El texto:** adecuación, coherencia i cohesión, en tres caixes.

---

## 3. Fases

| Fase | Què | Toca | Mida |
|---|---|---|---|
| **1** | Interfície de les activitats en castellà (`TXT.es`) | plantilla, `marca-llengua.js` | M |
| **2** | Frases: `per` a les 72, `clau` i ~10 frases de regla → d'ús, més el joc «¿Catalán o castellano?» | `castellano.js` | M |
| **3** | «Pinta las palabras»: determinantes, sustantivos i concordancia (3 jocs) | `castellano.js` | M |
| **4** | Escoltar i puntuar (¿¡), «Puntúa el texto» i fragments literaris | `castellano.js` | S |
| **5** | Jocs nous: fiable o clickbait, les 5 W, forma de entrada, polisèmia, «¿Qué falla?» i b o v | `castellano.js` | M |
| **6** | Esquemes i `practica` als temes, `MONS.md`, `ESTAT.md`, `CHANGELOG.md` i versió | dades, docs | S |

Totes passen `python3 motor/tot.py`, `node motor/revisa-mon.js castellano`, `node motor/prova-tot.js base` i la prova de mons de `castellano/t2-t3`, i també de `catala/t2` i `angles/t2` si es toca el motor.

**Criteris de fet:**
- Dins del món de Castellano, les activitats no tenen cap text del motor en català.
- En triar *La Marta* surt per què en castellà no hi va l'article.
- Es poden pintar els determinants d'*esos tres libros míos*.
- Hi ha un joc per a cada tema del Tema 3 (determinantes, noticia, fake news, polisemia, b).

---

## 4. Decisions que has de prendre

1. **Interfície en castellà:** només les activitats (recomanat), també la capçalera i el menú, o deixar-ho tot en català com ara? *Recomano només les activitats: el menú, igual a tots els mons.*
2. **Joc d'interferències del català:** el fem com a joc a part (recomanat) o posem les frases dins dels jocs que ja hi ha?
3. **Les 5 W de la notícia:** amb el joc de pintar (paraules o trossos d'una notícia curta) o com a frases amb buits? *Recomano pintar: es veu l'estructura.*
4. **Fragments literaris:** escrits per nosaltres o populars (refranys, romances i faules de domini públic)? *Recomano barrejar-los, com a Català.*
5. **Quantes frases de regla passem a ús?** *Recomano unes 10, i deixar les 3 o 4 regles d'or (mai coma entre subjecte i verb, ¿…?, el aula).*
6. **Ordre:** primer la interfície (fase 1) o primer el contingut (fases 2-5)? *Recomano la interfície primer: tot el que vingui després ja sortirà en castellà.*
