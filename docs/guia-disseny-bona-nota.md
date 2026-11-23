# Guia de Disseny Bona Nota (1r d'ESO, 12-13 anys)

Estàndards tècnics i d'interacció per desenvolupar artefactes web educatius (HTML, CSS i JS) per a alumnes de 12 i 13 anys. Prioritzen la manipulació visual, redueixen la fricció cognitiva i eliminen l'abandonament.

---

## 1. Regles d'Ergonomia per a 12-13 Anys

Els adolescents escanegen visualment a gran velocitat, tenen poca tolerància a l'espera i rebutgen dissenys infantilitzats.

*   **Micro-fragmentació (*micro-chunking*)**: Paràgrafs de màxim 2 o 3 línies amb frases curtes i vocabulari planer (nivell 6è de primària). Etiquetes integrades directament sobre els elements visuals en comptes d'explicacions llargues.
*   **Mòbil i tauleta**:
    *   **Dianes tàctils**: Botons i tiradors amb mida mínima de $48 \times 48\text{ px}$.
    *   **Zero desplaçament horitzontal**: Adaptació total a pantalles de 360 a 430 px d'amplada.
    *   **Arquitectura anti-oclusió**: Indicadors i gràfics a la part superior; controls a la part inferior perquè la mà de l'alumne mai no tapi el resultat.
*   **Depuració de càrrega extrània**: Elimina capçaleres feixugues, menús secundaris, animacions decoratives supèrflues i sons ambientals que distreguin del concepte.
*   **Latència <100 ms**: Resposta immediata a qualsevol control. Si la pantalla triga a reaccionar, l'alumne assumeix un error i prem a l'atzar.

---

## 2. Manipulació Directa i Andamiatge Implícit (*Implicit Scaffolding*)

L'aprenentatge s'assoleix tocant l'escenari, guiant mitjançant el disseny visual sense instruccions mecàniques.

*   **Pista visual inicial (*affordance* activa)**: El primer element interactiu mostra un pols suau o una oscil·lació lleugera (*wiggle-me*) que s'atura en tocar-lo per primer cop.
*   **Màxim de 3 a 4 controls visibles**: Evita pantalles saturades de barres o botons. Mantén l'espai net amb màxim 4 controls clau per escena.
*   **Restricció de l'espai d'estats inicial**: Valors de sortida calibrats perquè qualsevol primer toc a l'atzar reveli un canvi visual clar i rellevant.
*   **Representacions sincronitzades en temps real**: Moure un control actualitza simultàniament el dibuix, el valor numèric i la bafarada breu. Prohibit demanar botons com «Calcular» o «Executar» per a canvis menors.
*   **Sense estat ocult**: Totes les variables rellevants han d'estar visibles a la pantalla, mai amagades en menús o pestanyes secundàries.
*   **Formalització progressiva**: Ordena d'esquerra a dreta (per exemple, en pestanyes): comença sempre amb una joguina visual d'exploració lliure abans d'introduir eines de mesura o formalisme matemàtic.

---

## 3. Disseny de Feedback i Mini-Reptes Curts

El feedback converteix l'error en experimentació activa i ofereix fites ràpides.

*   **Feedback explicatiu continu**: Descriu què acaba de passar mitjançant una bafarada breu i contextual que connecti causa i efecte en català natural.
*   **Tractament amable de l'error**:
    *   Prohibides les creus vermelles agressives, sons estridents o missatges secs com «Incorrecte».
    *   Ofereix una pista constructiva d'una sola frase que reorienti l'atenció («Fixa't en el signe del nombre més gran»).
    *   Permet el reintent immediat sense penalitzacions de punts ni pèrdua del progrés acumulat.
*   **Mini-reptes de 2 a 3 minuts**:
    *   Estructura les activitats en 3 rondes àgils per guanyar l'estrella ⭐ de la fitxa.
    *   Resol els reptes interactuant amb el propi visual (arrossegant punts o accionant interruptors), mai amb formularis teòrics.
    *   Genera nombres nous aleatòriament quan es premi «Torna a jugar».
*   **Celebració neta i persistència**: En completar el repte, activa una micro-animació d'èxit, marca la fitxa com a superada i desa el progrés localment.

---

## 4. Anti-Patrons Prohibits

Errors de disseny que causen abandonament o confusió immediata:

*   **Murs de text i tutorials inicials**: Modals amb instruccions llargues abans de tocar. L'objecte ha de ser operable en menys de 10 segons.
*   **Menús desplegables (`<select>`)**: Trenquen el flux tàctil. Utilitza botons segmentats, fitxes clicables o interruptors de 2 estats.
*   **Estètica infantil (*babyish*)**: Personatges infantils o colors pastís. Aquesta edat demana una estètica de joc neta, polida i adulta.
*   **Desconnexió d'estat**: Botons que modifiquen valors sense reflectir-se a l'instant en el dibuix o deixant elements desquadrats.
*   **Gamificació feixuga desconnectada**: Rànquings globals, temporitzadors angoixants o punts complexos que distreuen del concepte.
*   **Oclusió tàctil**: Controls que fan que la mà de l'usuari tapi el gràfic o la reacció visual mentre s'interactua.

---

## 5. Checklist Final de 6 Punts

Abans de validar i publicar qualsevol artefacte, comprova estrictament:

1.  **Comprensió en 10 segons**: L'alumne sap on tocar sense haver de llegir manuals d'ús.
2.  **Màxim 3-4 controls i dianes $\ge 48\text{ px}$**: Sense pantalles saturades i amb zones tàctils àmplies.
3.  **Resposta immediata (<100 ms) i sincronitzada**: Els canvis actualitzen el dibuix, el nombre i el text sense botons intermedis.
4.  **Ergonomia anti-oclusió i zero scroll horitzontal**: Funciona a 360-430 px amb controls sota la visualització.
5.  **Mini-jocs resolts sobre el visual**: Avaluació directa sobre el gràfic (sense tests) i amb nombres nous en reiniciar.
6.  **Tractament amable de l'error**: Ofereix pistes d'orientació immediates i permet reintentar sense frustració.
