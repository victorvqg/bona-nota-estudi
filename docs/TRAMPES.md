# Trampes

Coses que ens han mossegat i com evitar-les. Una entrada per trampa, sense duplicar-ne cap.

Com s'escriu una entrada:

    ### Títol curt
    - Símptoma: què veus.
    - Causa: per què passa.
    - Com evitar-la: què cal fer.

### A l'iPhone, les animacions grans del rànquing no es pinten
- Símptoma: la cinta de notícies es queda quieta; a la festa (5 tocs) no surten les abelles, la desfilada ni els focus; després de tocar diverses vegades les pestanyes ja no surten estrelles.
- Causa: elements animats massa grans per al mòbil (una cinta de més de 10.000 píxels reals, un disc de llums de 2 pantalles amb `mix-blend-mode`, la capa de la festa de tota l'alçada del rànquing, sacsejar la caixa sencera), `backdrop-filter` a la finestra que fa scroll i desenes d'estrelles amb filtres que s'acumulaven a cada toc.
- Com evitar-la: animar peces petites amb `transform`; la capa d'efectes només a la part visible (`visHs`); res de `backdrop-filter` ni `mix-blend-mode` en contenidors amb animacions; esborrar els efectes del toc anterior abans de llançar-ne de nous (`netejaFxTab`) i menys peces al mòbil (`MOBIL()`). Chromium ho pinta tot igualment: cal provar-ho en un iPhone de veritat.

### Un aparell amb el progrés vell trepitja el núvol
- Símptoma: les estrelles d'un món no quadren amb el rànquing (p. ex. Català: 366 al rànquing i 71 dins el món).
- Causa: el nen ja era l'actiu del món en un aparell que feia dies que no feia servir. En obrir-lo no es baixava el núvol (només es feia en entrar amb el nom i el PIN) i, en jugar, `desa()` marcava el progrés vell amb l'hora d'ara i el pujava. `bn_progres_desa` es quedava amb el més recent i el núvol baixava. El rànquing, que és el màxim del registre, no baixava.
- Com evitar-la: no pujar mai abans d'haver baixat i fusionat el núvol en la sessió (`NUV_LLEST` a `nuvolPuja()`); baixar-lo també en obrir el món amb el nen actiu; i al servidor, `bn_progres_desa` torna `-2` si el núvol té més estrelles (`supabase/bn_progres_no_baixa.sql`). Prova: `motor/prova-nuvol.js`.

### Al mòbil es veu una versió vella
- Símptoma: un canvi publicat no apareix al mòbil fins que s'esborren les dades del navegador.
- Causa: la memòria cau del navegador (GitHub Pages dona 10 minuts) i la del service worker (`sprites.js` es serveix primer de la còpia guardada).
- Com evitar-la: `motor/eines/actualitza.js` compara la versió de la pàgina (`VER`, la posa `tot.py`) amb `versio.json` i recarrega sola si no coincideixen. No toquis el buit `VER="__BN_VERSIO__"` ni treguis el `?v=` de `sprites.js` (els posa `tot.py`).

### Les dades de `repAnotaExt` no poden portar `tipus`
- Símptoma: els errors de «🔍 Troba l'error» de mates no sortien mai a «Repassa els teus errors» (la prova `mxErrRepProva` fallava).
- Causa: `repAnotaExt("err", clau, {tipus:…})`: el `tipus` de les dades trepitjava el `"err"` i el repàs no trobava el seu tipus a `BN_REP_TIPUS`.
- Com evitar-la: el tipus del repàs és el primer paràmetre; el que identifica l'exercici va a `clau` (i a les dades, amb un altre nom).
