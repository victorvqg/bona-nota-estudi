# Guia de Disseny Bona Nota (1r d'ESO, 12-13 anys) — v2

Estàndards tècnics, visuals i d'interacció per desenvolupar laboratoris web interactius (HTML, CSS i JS) per a alumnes de 12 i 13 anys. Prioritzen la manipulació directa, el moviment físic clar, la varietat de reptes i zero fricció cognitiva.

---

## 1. Regles d'Ergonomia per a 12-13 Anys

Els adolescents escanegen visualment a gran velocitat, tenen poca tolerància a l'espera i rebutgen dissenys infantilitzats.

* **Micro-fragmentació (*micro-chunking*):** Paràgrafs de màxim 2 o 3 línies amb frases curtes i vocabulari planer (nivell 6è de primària). Etiquetes integrades directament sobre els elements visuals en comptes d'explicacions llargues.
* **Mòbil i tauleta:**
  * **Dianes tàctils àmplies:** Botons, tiradors i elements clicables dins l'SVG amb una mida mínima de `48px` per `48px`.
  * **Zero desplaçament horitzontal:** Adaptació total a pantalles de 360 a 430 px d'amplada i a tauletes.
  * **Arquitectura anti-oclusió:** Indicadors i escenari SVG sempre a la part superior; controls a la part inferior perquè la mà de l'alumne mai no tapi el resultat mentre toca.
* **Depuració de càrrega extrània:** Elimina capçaleres feixugues, menús secundaris, animacions decoratives supèrflues i efectes de so propis (l'àudio natiu ja el gestiona la plataforma Bona Nota).
* **Latència inferior a 100 ms:** Resposta immediata a qualsevol toc. Si la pantalla triga a reaccionar, l'alumne assumeix un error i prem a l'atzar.

---

## 2. Manipulació Directa i Andamiatge Implícit (*Implicit Scaffolding*)

L'aprenentatge s'assoleix tocant directament l'escenari, guiant mitjançant el disseny visual sense instruccions mecàniques.

* **Pista visual inicial (*affordance* activa):** El primer element interactiu mostra un pols suau o una oscil·lació lleugera (*wiggle-me*) que s'atura en el moment que l'alumne el toca per primer cop.
* **Toca l'objecte, zero botons «en bucle»:** Sempre que un element es pugui manipular directament a l'escena (clicar un signe per invertir-lo, tocar un parèntesi per obrir-lo o tancar-lo, arrossegar un punt sobre una recta o clicar parts d'un diagrama), fes-lo interactiu directament dins l'SVG o la fórmula. Evita botons inferiors repetitius que només van ciclant valors en bucle.
* **Màxim de 3 a 4 controls visibles:** Evita pantalles saturades de barres o botons. Mantén l'espai net amb un màxim de 4 controls clau per escena.
* **Restricció de l'espai d'estats inicial:** Valors de sortida calibrats perquè qualsevol primer toc a l'atzar reveli un canvi visual clar i rellevant.
* **Representacions sincronitzades en temps real:** Moure o tocar un element actualitza simultàniament el dibuix, el valor numèric i la bafarada breu. En mode d'exploració lliure queda prohibit demanar botons intermedis com «Calcular».
* **Sense estat ocult:** Totes les variables rellevants han d'estar visibles a la pantalla, mai amagades en menús o pestanyes secundàries.
* **Formalització progressiva:** Comença sempre amb una joguina visual d'exploració lliure abans d'introduir eines de mesura, formalisme o reptes.
* **Expressions pas a pas netes:** Quan una fitxa treballi resolucions pas a pas (com operacions combinades o anàlisi d'oracions), mostra l'expressió completa neta i centrada a dalt sense repetir termes, i a sota només els 2 o 3 botons candidats clicables.

---

## 3. Qualitat Visual, Física i Micro-Animacions (Nivell Brilliant / Mathigon)

Un bon laboratori no sembla un formulari amb dibuixos plans: reacciona amb física neta, recognoscible i satisfactòria.

* **SVG vius i recognoscibles (zero geometria mandrosa):** Evita substituir metàfores reals per simples cercles o rectangles genèrics. Dibuixa objectes llegibles i polits: engranatges dentats que roten, termòmetres amb gradient dinàmic, balances que basculen segons el pes, saltadors que descriuen arcs reals, o talls i diagrames amb detall net.
* **Moviment continu amb inèrcia:** Prohibides les teletransportacions seques. Qualsevol canvi de posició, rotació, alçada o estat ha d'animar-se de manera fluida (entre 200 i 350 ms, `cubic-bezier` amb lleuger esmorteïment o rebot controlat), respectant sempre `prefers-reduced-motion`.
* **Micro-celebració dins l'SVG (encert):** En encertar una ronda, l'element resolt emet una micro-reacció neta dins el mateix escenari (ona radial suau, pols lluminós o de 4 a 6 espurnes geomètriques breus de menys de 600 ms). Mai confeti infantil a pantalla completa.
* **Reorientació física suau (error):** Si l'alumne s'equivoca, l'element fa una sacsejada horitzontal molt suau (uns 4 px durant 250 ms) o torna suaument al punt de sortida mentre la bafarada mostra la pista.

---

## 4. Disseny de Feedback i Varietat de Mini-Reptes (3 rondes)

El feedback converteix l'error en experimentació activa, i alternar mecàniques manté l'atenció de la fitxa 1 fins a l'última.

* **Feedback explicatiu continu:** Descriu què acaba de passar mitjançant una bafarada breu i contextual que connecti causa i efecte en català natural.
* **Tractament amable de l'error:**
  * Prohibides les creus vermelles agressives, els missatges secs com «Incorrecte» o les penalitzacions.
  * Ofereix una pista constructiva d'una sola frase que reorienti l'atenció («Fixa't en el signe del nombre més gran»).
  * Permet el reintent immediat sense pèrdua del progrés acumulat.
* **Mini-reptes de 2 a 3 minuts (3 rondes):**
  * Estructura cada activitat en 3 rondes àgils per guanyar l'estrella de la fitxa.
  * Resol sempre els reptes interactuant amb el propi visual, mai amb formularis ni tests A/B/C.
  * Genera nombres o casos nous aleatòriament quan es premi «Torna a jugar».
* **Varietat obligatòria d'arquetips de repte:** Prohibida la fatiga de plantilla (no repeteixis el patró «ajusta i prem Comprova» a totes les fitxes). Alterna com a mínim **3 d'aquests 4 arquetips** en un mateix laboratori:
  1. **Construeix l'objectiu:** Ajusta o equilibra l'escena fins aconseguir el valor o estat demanat.
  2. **Prediu i executa («Llança»):** L'alumne col·loca una marca o bandera de predicció a l'escenari i prem el botó d'executar; l'animació corre de debò i l'alumne comprova físicament on arriba l'objecte.
  3. **Caça l'error (El robot despistat):** L'escena mostra una resolució o configuració ja feta amb un error típic de 1r d'ESO; l'alumne ha de tocar directament la peça equivocada dins l'SVG o la fórmula per corregir-la.
  4. **Ordena / Classifica tàctil:** Arrossega o col·loca 3 elements al seu lloc correcte sobre una recta, escala, diagrama o safata.
* **Celebració neta i persistència:** En completar les 3 rondes, activa la micro-animació d'èxit, marca la fitxa com a superada i desa el progrés localment.

---

## 5. Anti-Patrons Prohibits

Errors de disseny que causen abandonament, avorriment o confusió immediata:

* **Murs de text i tutorials inicials:** Modals amb instruccions llargues abans de tocar. L'objecte ha de ser operable en menys de 10 segons.
* **Menús desplegables (`<select>`):** Trenquen el flux tàctil. Utilitza manipulació directa, botons segmentats, fitxes clicables o interruptors de 2 estats.
* **Botons «en bucle» quan l'objecte és tocable:** Obligar a clicar diverses vegades un botó inferior per canviar un valor que es podria tocar o arrossegar directament sobre el gràfic o la fórmula.
* **SVG plans o teletransportats:** Objectes sense moviment fluid ni relació física amb el concepte.
* **Fatiga de plantilla:** Repetir exactament la mateixa mecànica de repte a totes les fitxes d'un mateix tema.
* **Estètica infantil (*babyish*):** Personatges infantils, colors pastís o confeti desmesurat. Aquesta edat demana una estètica de joc fosca, neta i polida.
* **Desconnexió d'estat:** Botons que modifiquen valors sense reflectir-se a l'instant en el dibuix o deixant elements desquadrats.
* **Gamificació feixuga desconnectada:** Rànquings interns, temporitzadors angoixants o punts complexos que distreuen del concepte.
* **Oclusió tàctil:** Controls que fan que la mà de l'usuari tapi el gràfic o la reacció visual mentre s'interactua.
* **Àudio duplicat:** No afegeixis sons sintètics propis dins l'HTML; els efectes de clic, encert i celebració els aplica automàticament Bona Nota.

---

## 6. Compatibilitat Tècnica amb Bona Nota (`BonaNotaVisuals`)

Tot laboratori ha d'incorporar aquest contracte mínim per encaixar de manera transparent a la plataforma:

* **Paràmetres URL:** Llegeix `embed`, `fitxa`, `world` (slug en minúscules sense accents) i `uid` (per defecte `anon`). En mode `?embed=1&fitxa=N`, mostra únicament `#fitxa-N` amb fons transparent i amaga barra superior, portada i peu de pàgina.
* **Persistència aïllada per alumne:** Desa i carrega l'estat amb `localStorage` sota la clau `bonanota_visual_<uid>_<world>` (com a fallback obligatori quan `window.notebookAppApi` no existeixi), fusionant el progrés entre fitxes inline i modal.
* **Auto-alçada neta:** Usa `ResizeObserver` sobre el contenidor principal del contingut (`.page-shell`) enviant `BONANOTA_VISUAL_RESIZE` perquè l'`iframe` creixi i també s'encongeixi en obrir o tancar acordionets (`<details>`).
* **Progrés i teclat:** Emet `BONANOTA_VISUAL_PROGRESS` amb `explored` (enter), `total` (enter) i `completed` estrictament booleà (`true` o `false`, mai un número), i `BONANOTA_VISUAL_CLOSE` en prémer `Escape` en mode embed.

---

## 7. Checklist Final de 8 Punts

Abans de validar i publicar qualsevol artefacte, comprova estrictament:

1. **Comprensió en 10 segons:** L'alumne sap on tocar (gràcies a la pista *wiggle-me*) sense llegir manuals.
2. **Màxim 3-4 controls i dianes de 48x48 px o més:** Sense pantalles saturades, zero `<select>` i zones tàctils àmplies.
3. **Manipulació directa sense botons en bucle:** L'alumne toca o arrossega directament elements clau de l'SVG o la fórmula sempre que té sentit.
4. **Física fluida i resposta en menys de 100 ms:** Transicions suaus reals (zero teletransportacions) i representacions sincronitzades a l'instant.
5. **Ergonomia anti-oclusió i zero scroll horitzontal:** Funciona de 360 a 430 px i en tauleta amb el visual a dalt i els controls a baix.
6. **Varietat de mini-reptes resolts sobre el visual:** Com a mínim 3 arquetips diferents entre les fitxes (incloent-hi *Prediu i executa* i *Caça l'error*), zero tests A/B/C i nombres nous en reiniciar.
7. **Feedback visual i emocional cuidat:** Micro-celebració neta dins l'SVG en encertar, sacsejada subtil i pista amable d'una frase en fallar (sense penalitzacions ni àudio duplicat).
8. **Contracte Bona Nota intacte:** `?embed=1`, `?fitxa=N`, `?uid=`, `localStorage` aïllat per `uid`, `ResizeObserver` sobre `.page-shell`, `Escape` i `completed` estrictament booleà.
