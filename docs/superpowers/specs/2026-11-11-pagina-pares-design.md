# Pla Mestre i Especificació (Prompt Spec) · Pàgina per a les famílies (`bonanota.net/pares`) (`g6`)

Data: 2026-11-11 · Estat: aprovat i implementat a `pares/index.html` (`v2.22.0`).

---

## 1. Propòsit i públic objectiu

Crear la pàgina pública **`https://bonanota.net/pares/`** (`pares/index.html`): una guia oberta, càlida, rigorosa i **100 % lliure de tecnicismes** pensada per a **pares, mares i tutors d'alumnes de 1r d'ESO (~12 anys)**.

**Què ha d'aconseguir en menys de 3 minuts de lectura al mòbil:**
1. Que qualsevol pare o mare entengui d'un cop d'ull **què fa exactament el seu fill o filla** dins de Bona Nota (no és un videojoc disfressat, sinó els apunts reals de classe convertits en pràctica activa i repàs espaiat).
2. Que vegi amb transparència **quins són els objectius pedagògics** (entendre abans de memoritzar, aprendre dels errors en dies separats, explicar amb les pròpies paraules i arribar tranquil a l'examen).
3. Que tingui la certesa tranquil·litzadora que l'eina incorpora **prevenció activa i bon ús digital de sèrie**: pauses cada 25 minuts, avís de temps, respecte escrupolós per l'hora d'anar a dormir, rànquing sense minuts públics, zero pèrdua de ratxes si un dia no entra, zero atzar i un xat sense teclat lliure on és impossible dir res dolent d'un company.
4. Que sàpiga **com acompanyar l'estudi des de casa** sense haver de vigilar la pantalla.

---

## 2. Prompt Mestre reutilitzable (Prompt Spec)

> **Rol i missió:** Ets dissenyador pedagògic, redactor divulgatiu en català i desenvolupador front-end sènior de Bona Nota. Dissenya i construeix `pares/index.html` (`https://bonanota.net/pares/`), una pàgina autònoma en un sol fitxer HTML + CSS + JS (seguint l'arquitectura de `perfil/index.html`), enllaçada des del peu de `bonanota.net` i integrada a `motor/tot.py` i `sw.js`.
>
> **To i llenguatge (regles estrictes):**
> - Català natural, proper, clar i respectuós, de família a família.
> - **Prohibit qualsevol tecnicisme informàtic:** no parlis mai de `Supabase`, `localStorage`, `SQL`, `RPC`, `bcrypt`, `cache`, `service worker`, `API`, `JSON` ni noms de fitxers interns. Tradueix cada mecanisme al seu benefici humà real («es guarda amb el seu nom i un codi secret de 4 números i 1 lletra», «la foto del quadern s'analitza al moment i no queda guardada enlloc»).
> - Frases curtes, escanejables al mòbil, amb titulars clars, xips resum i exemples reals del que veu l'infant.
>
> **Estructura narrativa en 8 blocs:**
> 1. **Capçalera i resum executiu en 30 segons («Què és Bona Nota?»):** retorn directe a la portada (`← Torna a Bona Nota`), títol clar «Guia per a les famílies», subtítol humà i 4 pilars ràpids (Apunts reals de 1r d'ESO · Sessions curtes · Disseny que no enganxa · Xat 100 % segur sense teclat).
> 2. **Índex ràpid enganxat o accessible per seccions:** xips d'ancoratge suau (`Com s'estudia`, `Estrelles i rànquing`, `Bon ús i prevenció`, `Xat segur`, `Privadesa`, `A casa`, `Preguntes freqüents`).
> 3. **Què fa el teu fill o filla quan hi entra? (El camí d'aprenentatge en 6 passos):**
>    - **Pas 1 · Fitxes i targetes visuals:** llegeix l'essencial del tema sense palla i gira targetes de pregunta/resposta per comprovar si ho ha entès.
>    - **Pas 2 · Tests amb llistó de debò (70 %):** 6 preguntes canviants; cal encertar-ne 5 de 6 per aprovar el tema (no n'hi ha prou amb la meitat). Pot demanar pistes per aprendre, però amb pista no es regalen estrelles.
>    - **Pas 3 · Jocs, mapes, manipulatius i «Troba l'error»:** situar les 43 comarques al mapa, construir arbres de factors o detectar on s'ha equivocat una llibreta de mostra i corregir-ho pas a pas.
>    - **Pas 4 · Explicar-ho amb les seves paraules (i foto del quadern a mates):** preguntes obertes on no val copiar i enganxar ni posar paraules soltes; a matemàtiques pot fer l'exercici en paper a la llibreta i fer-ne una foto que li indica quina és la primera línia on s'ha despistat, sense fer-li la feina.
>    - **Pas 5 · El secret que funciona: el repàs espaiat:** cada errada es guarda a «Repassa els teus errors» i torna a sortir avui, al cap de 3 dies i al cap de 7 dies. Quan l'encerta 3 vegades en dies diferents, passa a **«Error après»**.
>    - **Pas 6 · Simulacre d'examen i Repte final (Boss):** abans del dia de l'examen a l'institut, es posa a prova sense pistes i amb nota sobre 10.
> 4. **Objectius pedagògics i per què les estrelles són justes:**
>    - Taula/comparativa visual «Què premia vs. Què NO premia mai»: premia entendre, corregir errors, redactar bé i la constància en dies diferents; **no premia mai** repetir el mateix test per inflar punts (cada pregunta només dona estrella el primer cop del dia), ni estar-s'hi hores.
>    - Explicació clara del rànquing: 5 mirades positives (**Estrelles**, **Dies d'estudi**, **Nivell**, **Setmana** i **Remuntada** d'errors corregits) perquè qui comença més tard o li costa més sempre tingui un lloc on brillar. Els minuts i les hores **no es mostren mai en públic**.
> 5. **Bon ús digital, descans, son i prevenció d'addiccions (El filtre ètic):**
>    - **Sense por de perdre res:** si un dia (o tot un cap de setmana) no entra, **no perd cap estrella ni cap ratxa**. Zero xantatge emocional ni comptes enrere d'«ara o mai».
>    - **Sense atzar ni recompenses trampa:** cap ruleta, cap caixa sorpresa, cap compra, cap anunci.
>    - **Pausa activa cada 25 minuts:** surt una pantalla de descans de 5 minuts (beure aigua, estirar cames, descansar la vista). Es pot ajornar com a molt 2 cops (3 el dia abans d'examen); després, la pausa de 5 minuts és obligatòria.
>    - **Avís amable de temps:** als 60 minuts d'estudi (120 minuts si l'endemà hi ha examen) l'app el felicita i el convida a deixar-ho per avui.
>    - **Protecció del son a la nit (21:30 h, o 22:00 h abans d'examen):** surt l'avís d'anar a dormir (*«Mentre dorms, el cervell guarda el que has estudiat»*), el xat queda tancat fins l'endemà i l'app passa sola a **mode suau** (sense coets, confeti ni sons excitants).
>    - **Pla de 10 dies i botó «Demà tinc examen»:** reparteix els temes dia a dia perquè l'última tarda sigui un repàs tranquil i no una marató; si l'alumne té examen l'endemà, pot indicar-ho (màxim 2 dies per assignatura) sense que canviï el límit d'estrelles.
>    - **Mentalitat de creixement:** quan falla una pregunta o trenca una ratxa, rep missatges serens (*«Tranquil, l'error va al repàs: així és com s'aprèn»*).
> 6. **El Xat de la Colla: socialitzar sense cap risc:**
>    - Demostració visual d'exemples reals: **zero teclat lliure i zero emojis lliures**. Només 26 frases amb un buit i 63 peces tancades.
>    - **La regla d'or:** el nom d'un company només es pot triar en frases d'ànim, felicitació o repte esportiu (*«Bona, Jana!»*, *«Compte, Pau, que vinc!»*). És materialment impossible escriure un insult, una burla o un menyspreu.
>    - **Parlar es guanya estudiant:** cada 10 ⭐ fetes avui donen dret a 1 frase, amb un màxim de 5 frases al dia, i a la nit es tanca sol.
> 7. **Privadesa i protecció de dades dels menors:**
>    - Sense correu electrònic, sense telèfon, sense cognoms obligatoris, sense fotos de perfil personals (tothom tria un animalet i una insígnia pixelada) i sense rastrejadors publicitaris.
>    - Accés amb nom i **codi PIN propi** (4 números i 1 lletra, amb bloqueig automàtic de 15 minuts si algú prova d'endevinar-lo 5 vegades).
>    - Les fotos d'exercicis de la llibreta s'utilitzen únicament durant uns segons per llegir les línies de l'operació i **no es desen en cap servidor ni registre**.
> 8. **Com acompanyar des de casa + Preguntes freqüents (acordió interactiu):**
>    - 4 recomanacions pràctiques per a la família (sessions curtes de 15–25 min 3 o 4 cops per setmana, combinar pantalla + llibreta de paper, preguntar *«quin error has après avui?»* en lloc de *«quin vas al rànquing?»*, i activar el **mode suau** o silenciar el so si li va millor la calma).
>    - Acordió `<details>` amb les 7 preguntes més habituals dels pares (Què passa si oblida el PIN? Substitueix el llibre o la llibreta? Per què un 4 de 6 no aprova? Es pot fer servir en dos aparells? Té algun cost? Com funciona el mode suau? Què passa si un dia està cansat i no hi entra?).

---

## 3. Disseny visual, rendiment i accessibilitat

- **Estètica coherent i llegible:** manté l'univers nocturn estrellat de Bona Nota (`#0b1033`, `#151952`, accents daurats `#facc15`, cian `#22d3ee` i verd maragda `#4ade80`), però amb **targetes de lectura reposada** (`max-width: 920px`, cos `Nunito` a `16.5px–17.5px`, interlineat `1.65`, contrast alt AAA sobre fons fosc suau `#0f1642`).
- **Mòbil primer (360 px, 390 px i 430 px):** zero desbordament horitzontal, botons i enllaços de mínim 44 px d'alt, taules convertides en targetes clares al mòbil.
- **Trampes d'iOS evitades (`docs/TRAMPES.md`):** cap `backdrop-filter`, cap `mix-blend-mode`, animacions discretes només amb `transform`/`opacity` i totalment desactivades amb `prefers-reduced-motion: reduce`.
- **Accessibilitat WAI-ARIA:** `lang="ca"`, enllaç `.salta` («Salta al contingut»), jerarquia semàntica `header` / `nav` / `main` / `section` / `footer`, `h1` → `h2` → `h3` ordenats, acordions natius `<details><summary>` accessibles amb teclat i focus visible cian (`3px solid #22d3ee`).

---

## 4. Integració tècnica al repositori

1. **`pares/index.html`**: inclou el bloc `ACTUALITZA:inici..fi` (`window.BN_ACT={arrel:"../",tornaAuto:true}`) i el peu amb `<small class="bn-versio">versió X.Y.Z</small>`.
2. **`index.html`**: afegeix l'enllaç públic `<a class="pares-lk" href="pares/">👨‍👩‍👧 Famílies</a>` al peu de la portada, ben visible però discret al costat de la informació del PIN i d'`admin/`.
3. **`motor/tot.py`**:
   - Copia `motor/eines/actualitza.js` dins de `pares/index.html` (`ACTUALITZA:inici..fi`).
   - Escriu la versió actual a `<small class="bn-versio">` de `pares/index.html`.
   - Inclou `pares/index.html` a `pagines` (empremta `VER`) i `"pares/"` a `fitxers_sw` (`sw.js`).
4. **Proves automàtiques (`motor/prova-pares.js` a `.github/workflows/revisa.yml`)**:
   - Comprova amb Playwright que `pares/index.html` carrega sense errors de consola, conté tots els blocs clau sense argot tècnic prohibit (`Supabase`, `localStorage`, `bcrypt`, `PostgreSQL`), no desborda horitzontalment a `360`, `390`, `430` i `1280` px, obre/tanca les preguntes freqüents per teclat/clic i enllaça correctament amb la portada (`index.html` ↔ `pares/`).
