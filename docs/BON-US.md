# Bon ús de Bona Nota

Aquest document explica quan Bona Nota ajuda el nen a aprendre i quan comença a enganxar-lo: quant temps, quan cal parar, què passa a la nit i el dia abans de l'examen. Completa els altres dos documents de regles:

| Document | Pregunta que respon |
|---|---|
| [`AVALUACIO.md`](AVALUACIO.md) | Què sap el nen? |
| [`PUNTUACIO.md`](PUNTUACIO.md) | Com es premia l'esforç? |
| **`BON-US.md`** (aquest) | L'ús és sa? |
| [`XAT.md`](XAT.md) | Com es parlen els nens? |
| [`BENESTAR.md`](BENESTAR.md) | Com ho porta cada nen? (el que veu el pare al tauler) |

> **Estat (11 de novembre de 2026 · v2.26.0).** Tots els principis ([ADR-0007](DECISIONS.md)) i els llindars confirmats ([ADR-0008](DECISIONS.md)) estan **actius a producció**: fases del món i pla de 10 dies, descans de 25 minuts registrat i amb límit de salts, avís amable als 60/120 minuts, franja de nit amb mode suau automàtic, botó «Demà tinc examen» (amb opció de desmarcar-lo si s'ha premut per error), textos amables de mentalitat de creixement, rànquing per «Dies d'estudi», **mode tast anònim** per explorar el primer tema i el primer joc sense compte ni rànquing (`/?tast=1`) i senyals complets al tauler de Benestar.

## 1. Principis

Bona Nota va bé quan el nen aprèn en sessions curtes, sense por i sense que li costi parar.

1. **L'objectiu és aprendre, no estar-hi.** L'èxit es mesura amb temes apresos i errors corregits, no amb minuts.
2. **El premi informa, no mana.** Les estrelles diuen què has fet bé. Si el nen només estudia per les estrelles, el premi ha guanyat i l'interès ha perdut (teoria de l'autodeterminació, Deci i Ryan).
3. **Sense por de perdre.** Si un dia no entra, no perd res: ni estrelles, ni ratxes, ni missions que «s'escapen». Avui ja es compleix: no hi ha ratxa de dies i les estrelles no es treuen mai.
4. **Equivocar-se forma part d'aprendre.** Els errors van al repàs i corregir-los dona premi. Els missatges de fallada han de ser amables (mentalitat de creixement, Dweck).
5. **Millor poc i sovint.** Tres sessions de 20 minuts en dies diferents valen més que una de 90 (repàs espaiat). L'«error après», que demana tres encerts en dies separats, ja ho aplica.
6. **Comparar-se amb cura.** El rànquing ha de donar motius als que van darrere, com fan Setmana i Remuntada. Mai no ha d'humiliar ningú.
7. **El son i la família manen.** A la nit, l'app convida a plegar. El pare veu al tauler com va l'ús, no només les notes.
8. **El mínim de dades i res de text lliure entre nens.** El xat amb peces ([ADR-0006](DECISIONS.md), detallat a [`XAT.md`](XAT.md)) és el model a seguir.

## 2. Fases del món i vigília d'examen

Un límit fix de minuts seria injust: el dia abans de l'examen tothom estudia més, i ha de poder fer-ho. Per això el temps s'adapta a la **fase del món**.

**Què diuen les dades** (del 2 al 10 de novembre de 2026). Al món de comarques, un dia normal hi entren d'1 a 3 nens, amb 8-53 minuts entre tots. El 9 de novembre, sis dies després que el món nasqués, hi van entrar 9 nens i hi van fer 204 minuts; l'endemà gairebé ningú. És el patró d'una vigília. Els primers dies d'un món també hi ha pics, però només de 2 nens: és la novetat, no l'examen.

**Com se sap que és vigília.** No sabem el dia de l'examen, però arriba com a molt 10 dies després que neix el món. Mana la primera d'aquestes fonts que doni resposta:

1. **La data que posa l'admin.** Si se sap el dia de l'examen, es posa al tauler, al costat del món.
2. **El nen ho diu.** Botó «Demà tinc examen» dins del món, com a molt 2 dies per món. Queda registrat i es veu al tauler.
3. **El pic del grup.** El servidor detecta que avui hi ha 5 nens o més (o la meitat dels del món) amb el triple de minuts d'un dia normal. Només compta a partir del dia 3 del món.
4. **La finestra de 10 dies.** Cap font no val més enllà del dia 12 del món. A partir d'aleshores, el món és a la fase Després.

| Fase | Quan | Avís de temps | Descans de 25 min | Nit | Què proposa l'app |
|---|---|---|---|---|---|
| Aprendre | Des que neix el món fins a la vigília | Als 60 min | Es pot saltar 2 vegades | A les 21:30 | Un tema nou cada dia i el repàs dels errors |
| Vigília | El dia abans de l'examen | Als 120 min | Es pot saltar 3 vegades, però sempre surt | A les 22:00 | Repàs dels errors i examen de veritat; cap tema nou |
| Després | L'endemà de la vigília, o a partir del dia 12 | Als 60 min | Es pot saltar 2 vegades | A les 21:30 | Repàs lliure, sense pressa |

**Què no s'estira mai:**

- **Les estrelles.** Els topalls de cada dia són els mateixos ([`PUNTUACIO.md`](PUNTUACIO.md)), així ningú no té motius per dir «demà tinc examen» si no és veritat.
- **El descans.** Quan s'estudia molt, encara cal més.
- **El son.** La nit només s'allarga 30 minuts: mentre dorm, el cervell guarda el que ha estudiat. A l'hora de plegar, l'app diu: «Ja ho tens. Ara a dormir: demà ho recordaràs millor.»

**Els 10 dies, ben aprofitats.** Com que l'examen arriba com a molt al cap de 10 dies, l'app pot repartir la feina («T'han quedat 2 temes per veure: avui, el tema 3»). Així la vigília és un repàs i no una marató.

## 3. El descans, com funciona

- Cada **25 minuts de pàgina visible** (`DESCANS_S` = 1.500 s) surt la pantalla «Toca descans», amb un compte enrere de 5 minuts i idees (beure aigua, estirar-se, mirar lluny).
- Si la pàgina queda amagada més de 5 minuts, el comptador torna a zero.
- **«Ara no, continuo»** tanca la pantalla, el descans torna a sortir al cap de 10 minuts i queda registrat (`event = 'descans'`, `accio: 'salta'`). Els dies normals es pot saltar com a màxim **2 vegades seguides** (**3 vegades** a la vigília); al següent avís el botó d'ajornar ja no hi és i els 5 minuts són obligatoris. Quan s'acaba el compte enrere es registra `accio: 'fet'` i el comptador de salts torna a zero.

## 4. Revisió de les mecàniques actuals

La base ja és sana: les estrelles són justes, hi ha topalls i no hi ha ratxa de dies. Falten límits de nit i de temps segons la fase, i alguns detalls de to.

| Mecànica | Què ajuda | Què cal vigilar | Proposta |
|---|---|---|---|
| Estrelles justes (un cop al dia, topalls) | Treu el sentit de repetir per inflar | Res greu | Mantenir |
| Descans cada 25 min | Para la sessió i explica per què | Es pot saltar sense límit; no queda registrat | Registrar-lo; límit de salts segons la fase |
| Minuts al dia | — | No hi ha cap avís | Avís amable «per avui ja està molt bé» segons la fase |
| Hores de nit | — | 11 de 147 entrades a partir de les 21 h | Franja de nit configurable des de l'admin |
| Combos (tests, obertes, difícils) | Ajuden a concentrar-se | Pressió per no fallar; quan es trenca, el comptador torna a 0 sense cap frase (l'escut del combo només surt a partir de 3) | Frase de consol: «Tranquil, l'error va al repàs» |
| Missions del dia | Donen un objectiu curt | Que semblin «ara o mai» | Mantenir sense compte enrere ni avís de pèrdua |
| Rànquing | Setmana i Remuntada donen opcions als que van darrere | La pestanya Temps premia estar-hi, no aprendre | Treure Temps o canviar-la per «dies d'estudi» |
| Xat de la colla | Relació entre nens, segura i sense text lliure | Que es converteixi en la raó d'entrar | Mantenir el topall; tancar-lo a la franja de nit |
| Superestrella, música i animacions | Celebren l'esforç | Estímuls forts | Ja hi ha mode suau; activar-lo sol a la franja de nit |
| Repàs i «error après» en dies separats | Repetició espaiada, la millor manera de recordar | Res | Mantenir i donar-li més visibilitat |
| Obertes amb filtre de frases i avís d'enganxar | Obliguen a pensar i explicar | Que el filtre frustri | Revisar els casos rebutjats al tauler |
| Valoració «Costa / Bé / Fàcil» | El nen pensa com li ha anat | Ningú no la fa servir | Fer-la servir per a l'alerta de frustració |

## 5. Senyals per al tauler (apartat «Benestar»)

Com es llegeixen al tauler (colors, fases, data d'examen) és a [`BENESTAR.md`](BENESTAR.md).

Gairebé tots es poden calcular ja amb el registre (`bn_log`). Les excepcions són el descans (fet o saltat) i el botó «Demà tinc examen». Els llindars són una proposta per ajustar amb dades, no una norma mèdica. Al tauler, una fila per nen amb un semàfor (verd, groc, vermell) i el motiu en paraules planeres; els dies de vigília, les sessions llargues surten en blau.

| Senyal | Tipus | Com es calcula | Llindar proposat | Dades |
|---|---|---|---|---|
| Vigília d'examen | Context | Data de l'admin, botó del nen o pic del grup | 5 nens o més amb el triple de minuts, a partir del dia 3 del món | Ja hi són (menys el botó) |
| Novetat | Context | Primers dies d'un món nou | Dies 0-2 | Ja hi són |
| Poc i sovint | Bo | Dies amb 10-40 min, en dies diferents | 3 o més dies a la setmana | Ja hi són |
| Aprèn dels errors | Bo | Errors corregits i apresos al repàs | Creixen setmana a setmana | Ja hi són |
| Fa el descans | Bo | Descansos fets / proposats | 2 de cada 3 o més | Cal registrar-ho al motor |
| Marató | Vigilar | Minuts seguits sense una pausa de 5 min | Més de 60 seguits o més de 90 al dia; 120 a la vigília; +30 en cap de setmana | Ja hi són |
| Nit | Vigilar | Hora d'entrada (`entra.h`) | A partir de les 21:30 (22:00 a la vigília) | Ja hi són |
| Salta el descans | Vigilar | «Ara no» seguits | 2 o més en una sessió (3 a la vigília) | Cal registrar-ho al motor |
| Pressa | Vigilar | Segons per pregunta i encert | Menys de 3 s i encert per sota del 50 % | Ja hi són |
| Repetir sense aprendre | Vigilar | Tests repetits del mateix tema sense estrelles noves | 4 o més el mateix dia | Ja hi són |
| Frustració | Vigilar | Suspesos seguits d'un tema, o «Costa» repetit | 3 suspesos seguits, o 2 «Costa» | Ja hi són |
| Enganxa text a les obertes | Vigilar | Camp `enganxat` de l'event `oberta` | Qualsevol cas | Ja hi són |
| Entra per xatejar | Vigilar | Frases de xat respecte a minuts d'estudi | Molt xat amb poc estudi en 7 dies | Ja hi són |
| Deixa de venir | Vigilar | Alerta «inactiu» que ja existeix | Com ara | Ja hi són |

Compte: el temps es compta per aparell. Si un nen fa servir dos aparells alhora, els minuts poden sortir doblats.

## 6. Filtre per a qualsevol mecànica nova

Abans de fer-la, cada mecànica nova (premi, joc, pestanya, avís) ha de passar aquestes deu preguntes. Si alguna resposta no és la bona, cal canviar la idea o justificar-la en un ADR.

| Pregunta | Resposta bona |
|---|---|
| Premia aprendre (encert, error corregit, explicació) i no pas estar-hi més estona? | Sí |
| Té topall al dia? | Sí |
| Si el nen no entra un dia, perd alguna cosa? | No |
| El premi depèn de l'atzar (caixes sorpresa, premis aleatoris)? | No |
| Fa sentir malament qui va darrere? | No |
| Funciona en mode suau i sense so? | Sí |
| Respecta el descans i la franja de nit? | Sí |
| Té en compte la fase del món (aprendre, vigília, després)? | Sí |
| Guarda només el mínim i sense text lliure entre nens? | Sí |
| El pare la pot veure al tauler? | Sí |

## 7. Decisions confirmades i pla de canvis executat

Decisions confirmades el **11 de novembre de 2026** ([ADR-0008](DECISIONS.md)):

1. **Avís de temps:** avís amable **sense bloqueig** als **60 minuts** els dies normals i als **120 minuts** la vigília.
2. **Franja de nit:** a partir de les **21:30** i, la vigília, de les **22:00** (hora de Catalunya): avís d'anar a dormir + **mode suau automàtic** dins dels mons (sense bloquejar les estrelles ni tocar `localStorage.bn_suau`) + xat tancat per horari (`bn_control.sql`).
3. **Descans:** es registra (`descans`: `fet` o `salta`) i es pot dir «Ara no, continuo» com a màxim **2 vegades** seguides els dies normals i **3** la vigília; després els 5 minuts són obligatoris.
4. **Botó «Demà tinc examen»:** actiu dins del món (confirmació en dos tocs, i prement sobre «Has marcat examen demà · desmarca ✕» es desfa si s'ha tocat sense voler), amb un màxim de **2 dies per món**, registrat amb `examen_dema` (`accio: 'posa' | 'treu'`).
5. **Dates d'examen:** l'administrador les pot posar al tauler quan les sap (manen per damunt de tot); quan no n'hi ha, s'apliquen el botó del nen (vigília individual) i el pic del grup.
6. **Pestanya Temps del rànquing:** substituïda per **«Dies» («Dies d'estudi»)** (i el premi «Més constant» també compta dies diferents d'estudi).
7. **Qui veu el Benestar:** **només l'administrador** a `/admin/`.

| PR | Què fa | Toca el motor? | SQL nou | Estat |
|---|---|---|---|---|
| A | Aquest document, ADR-0007 i els enllaços | No | No | Fet |
| B | Apartat «Benestar» al tauler: semàfor, pic de vigília en blau, alertes noves i data d'examen per món | No | `bn_admin_benestar`, `bn_priv.examens` | Fet (2.13.0, n2540) |
| C | Fases del món: camp `neix` a `motor/mons.json`, `bn_vigilia(assig, neix)`, avís de temps i descans segons la fase, registre del descans, botó «Demà tinc examen» | Sí, i la configuració | `bn_bon_us.sql`, `bn_admin_benestar.sql` | Fet (2.20.0, g5) |
| D | Franja de nit segons la fase, amb l'hora a `bn_priv.config`: avís, mode suau automàtic i xat tancat | Sí | Clau `bon_us` (`bn_bon_us.sql`) | Fet (2.20.0, g5) |
| E | Pla de 10 dies: el tema del dia segons l'edat del món i els temes que falten (`#plaDia`) | Sí | No | Fet (2.20.0, g5) |
| F | Rànquing: substitució de la pestanya Temps per «Dies» («Dies d'estudi») i nous senyals al tauler de Benestar | Portada i Admin | `bn_ranking_mons.sql` | Fet (2.21.0, g5) |
| G | Textos amables quan es trenca un combo o se suspèn, i el missatge d'anar a dormir | Sí | No | Fet (2.20.0, g5) |

Els canvis al motor obliguen a regenerar els 7 mons (`python3 motor/tot.py`), pujar versió i passar totes les proves `bnProva…`; van en PR separats dels del tauler.

## 8. Per a qui programa: on és cada cosa

| Cosa | On és |
|---|---|
| Descans de 25 minuts i límit de salts | `DESCANS_S`, `descans()`, `saltsDescans()` a `motor/plantilla-estudi-interactiu.html` |
| Mode suau i franja de nit | `SUAU`, `SUAU_MANUAL`, `aplicaSuau()`, `canviaSuau()`, `esHoraNit()`, `bannerNitHtml()` (clau `bn_suau` de l'aparell) |
| Pla de 10 dies i avís de temps | `faseActual()`, `cartaPlaDia()`, `comprovaAvisTemps()` a `motor/plantilla-estudi-interactiu.html` |
| Hora i dia d'entrada | event `entra` (`h`, `dw`) a `bn_log` |
| Minuts | event `temps` (`s`), que s'envia en amagar o tancar la pàgina |
| Topalls d'estrelles | [`PUNTUACIO.md`](PUNTUACIO.md), apartat 8 |
| Data de naixement de cada món | camp `neix` a `motor/mons.json` (si falta, el primer registre del món) |
| Fase del món i config nocturna | `supabase/bn_bon_us.sql`: funció pública `bn_vigilia(assig, neix)` (sense noms) i clau `bon_us` a `bn_priv.config` |
| Dates d'examen | taula `bn_priv.examens(assig, data)`, des del tauler (`supabase/bn_admin_benestar.sql`) |
| Botó del nen i descans al registre | events `examen_dema` i `descans` (`accio: 'fet' \| 'salta'`) a `bn_log` |
| Dies d'estudi al rànquing | columna `dies` a `supabase/bn_ranking_mons.sql` i pestanya `data-t="dies"` a `index.html` |
| Mode tast anònim (`?tast=1`) | `MODE_TAST`, `activaTast()`, `convidaPin()` a `motor/plantilla-estudi-interactiu.html`; `TAST_ACTIU`, `activaTastPortada()` a `index.html`; `bn_priv.nom_prohibit` a `supabase/bn_ranking_net.sql` |

## 9. D'on ve

Proposta de bon ús n2538 i vigília d'examen n2539 (10 de novembre de 2026), amb les dades d'ús del 2 al 10 de novembre: 37 dies amb activitat de nens, 29 minuts de mitjana al dia, 4 dies de més de 90 minuts (dos, la vigília probable de l'examen de comarques) i 11 de 147 entrades a partir de les 21 h.
