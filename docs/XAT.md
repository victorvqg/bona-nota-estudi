# 💬 El xat de la colla: com funciona

Aquest document explica el xat de la colla a la versió **2.11.0**: com es parla, com es guanyen els crèdits, què veu el nen, què pot fer el pare des del tauler i on és cada cosa al codi.

Completa els altres documents de regles:

| Document | Pregunta que respon |
|---|---|
| [`AVALUACIO.md`](AVALUACIO.md) | Què sap el nen? |
| [`PUNTUACIO.md`](PUNTUACIO.md) | Com es premia l'esforç? |
| [`BON-US.md`](BON-US.md) | L'ús és sa? |
| **`XAT.md`** (aquest) | Com es parlen els nens? |
| [`BENESTAR.md`](BENESTAR.md) | Com ho porta cada nen? (el que veu el pare al tauler) |

## 1. La idea en tres frases

1. Els nens es parlen amb peces d'un catàleg tancat, sense escriure mai cap lletra.
2. Parlar es guanya estudiant: cada 10 ⭐ d'avui donen dret a dir 1 frase, fins a 5 al dia.
3. Ningú no ha de vigilar què s'escriu, perquè les frases i les peces estan fetes de manera que no es pot dir res dolent d'un company.

## 2. Com es parla

Per enviar un missatge no hi ha cap teclat. El nen fa dos passos:

1. **Tria una frase amb un forat** (`…`), dins d'una de les 4 categories: **Repte**, **Aura**, **Classe** o **Colla**.
2. **Omple el forat** amb el tipus de peça que demana aquella frase:
   - una **paraula d'estudi** (com «el test», «el podi» o «la tramuntana»),
   - una **cosa de classe** (com «el wifi de l'institut» o «la fila del menjador»),
   - una **cosa teva** en primera persona (com «m'he deixat els deures a casa»),
   - o el **nom d'un company** que surti al rànquing (mai el propi nom).

Tres exemples reals del catàleg:

- Repte + paraula d'estudi: `Vaig a per ___!` + `el teu lloc` → **«Vaig a pel teu lloc!»**
- Classe + cosa de classe: `Quin dia: ___` + `el wifi de l'institut` → **«Quin dia: el wifi de l'institut»**
- Colla + company: `Compte, ___, que vinc!` + `Jana` → **«Compte, Jana, que vinc!»**

**Com es compon el text.** El navegador ajunta la frase i la peça seguint dues regles d'escriptura:

- **Contraccions:** si just abans del forat hi ha «a», «de» o «per» i la peça triada comença per «el» o «els», es fa la contracció sola (`al`, `als`, `del`, `dels`, `pel`, `pels`). Per exemple: `Ningú m'atura a ___` + `el podi` queda **«Ningú m'atura al podi»**, i `Vaig a per ___!` + `els nombres primers` queda **«Vaig a pels nombres primers!»**. Amb un nom de company no es fa mai cap contracció.
- **Majúscula inicial:** si la frase comença directament pel forat, la primera lletra de la peça es posa en majúscula. Per exemple: `___? Bufar i fer ampolles!` + `el test` queda **«El test? Bufar i fer ampolles!»**.

## 3. La regla d'or

El xat segueix tres límits que venen de com estan escrites les frases i les peces:

- **El nom d'un company només surt en frases bones:** felicitar (`Bona, ___!`, `GG, ___!`, `Respecte per a ___`), donar aura (`+1000 d'aura per a ___`, `Aura infinita per a ___`) o reptar de bon rotllo (`Compte, ___, que vinc!`, `___, et toca moure fitxa!`). No existeix cap frase negativa on es pugui posar el nom d'un company.
- **Per riure o queixar-se, només hi ha coses de classe o un mateix:** situacions que viu tothom (`___: -1000 d'aura` + `un examen sorpresa en dilluns`, `Jo contra ___: 0 a 1` + `la calculadora sense piles`) o petites confessions en primera persona (`-100 d'aura per a mi: ___` + `he estudiat el tema que no tocava`, `Confessió: ___` + `he anat a l'aula equivocada`).
- **Cap peça no nomena profes, nens, classes concretes ni fets reals.**

**Per què no cal moderar el text.** Com que no hi ha cap camp de text lliure ni emojis lliures, i cada frase només accepta el tipus de peça que li toca, cap nen no pot combinar una frase de burla amb el nom d'algú altre. La regla d'or es compleix sola abans d'enviar res.

## 4. Crèdits

Un **crèdit** és el dret a enviar una frase al xat.

| Regla | Valor per defecte | Límit configurable a l'admin |
|---|---|---|
| Estrelles per crèdit | **10 ⭐** guanyades avui = 1 crèdit = 1 frase | De 1 a 100 ⭐ |
| Màxim de frases al dia | **5 frases** al dia per nen | D'1 a 20 frases |
| Espera entre missatges | **10 segons** | De 0 a 600 segons |
| Reinici diari | A **mitjanit**, hora de Madrid | Fix (canvia sol amb l'horari d'estiu i d'hivern) |
| Votar «Ben dit» | Cal haver guanyat el **1r crèdit d'avui** (10 ⭐) | Segueix el valor d'estrelles per crèdit |

**Com es calculen les «estrelles d'avui».** Per a cada món on el nen ha jugat avui, es mira el màxim d'estrelles que ha assolit avui i se li resta el màxim que tenia abans de mitjanit (si no hi havia jugat mai, 0; si per qualsevol motiu fos menor, compta 0). Després es fa la suma de tots els mons. Així hi entren totes les maneres de guanyar estrelles (tests, jocs, exàmens, preguntes obertes, combos, repàs, missions i boss) després de passar pel fre del servidor.

**Les estrelles no es gasten mai.** Els crèdits només compten quantes estrelles has fet avui i quants missatges ja has enviat (`crèdits guanyats = mínim(5, estrelles d'avui ÷ 10)`, i `crèdits que queden = guanyats − enviats avui`). Enviar una frase gasta un crèdit del dia, però no resta cap estrella ni fa baixar ningú al rànquing. Els crèdits que no es fan servir no es guarden per a l'endemà: a mitjanit el comptador torna a zero. Si l'administrador esborra un missatge, el crèdit gastat tampoc no torna.

**Quant costa una frase en minuts d'estudi.** Segons l'estudi d'estrelles, un nen actiu guanya unes **2 ⭐ per minut**. Per tant, a 10 ⭐ per crèdit, cada frase costa uns **5 minuts d'estudi**, i dir les 5 frases del dia demana uns **25 minuts**.

## 5. Què veu el nen i quan

Tot passa dins de la finestra del **rànquing**, a la portada:

- **Llegir:** qualsevol pot obrir la pestanya **💬 Xat** i llegir els últims **60 missatges** visibles. Els missatges propis surten a la dreta, en verd; els dels altres, a l'esquerra, amb l'animal i la insígnia del seu perfil i l'hora.
- **Votar «Ben dit»:** cada missatge d'un altre nen té un botó amb un polze i el comptador de vots. Si ja has guanyat el primer crèdit d'avui (encara que ja l'hagis gastat parlant), pots posar o treure el teu vot. No es pot votar un missatge propi, i votar no gasta cap crèdit.
- **Missatge del dia:** a dalt del xat hi surt destacat amb una corona el missatge d'avui que porta més vots «Ben dit» (en cas d'empat, el primer que es va escriure). En aquesta versió és un honor i no dona cap estrella de premi.
- **Bafarades al podi:** a totes les pestanyes del rànquing, els 3 primers del podi mostren una bafarada amb el seu últim missatge si l'han escrit en les últimes **24 hores**. Si toques una bafarada, s'obre el xat directament en aquell missatge i s'il·lumina.
- **Comptador de no llegits:** la pestanya 💬 Xat mostra un cercle vermell amb el nombre de missatges nous d'altres nens des de l'última vegada que vas obrir el xat en aquell aparell (fins a `9+`). Quan obres la pestanya, el comptador desapareix.
- **Targeta «Xat de la colla»:** a les pestanyes normals del rànquing, a dalt de la columna dreta, hi ha una targeta amb els **2 últims missatges**, una línia amb els teus crèdits i el botó **OBRE EL XAT ▶**.
- **«Digues-li alguna cosa a…»:** a la targeta de la teva posició («Ets el 3r!»), si no vas primer i el xat és obert, hi surt un botó amb el nom de qui tens just al davant (per exemple, «Digues-li alguna cosa a Jana»). En tocar-lo, s'obre el xat amb la categoria **Colla**, la frase `Compte, ___, que vinc!` i el nom d'aquell company ja triats.
- **Cinta de notícies:** a la tira que corre per dalt del rànquing, els **3 últims missatges** del xat passen davant de la resta de notícies.
- **Monedes i cartells d'estat:** al constructor del xat es veuen **5 monedes** (daurades per gastar, grises si ja s'han gastat i buides per guanyar) i una barra de progrés cap al proper crèdit. Quan en tornar d'estudiar hi ha un crèdit nou, salta el rètol **CRÈDIT +1**, i en enviar un missatge salta una moneda (en mode suau només surt un avís quiet). Si no pots enviar, el nen pot provar frases igualment i un cartell li explica per què:
  - **INSERT COIN:** encara no ha fet les 10 ⭐ d'avui (amb el botó **▶ CONTINUA ESTUDIANT**, que el porta a l'últim món on ha estudiat).
  - **SENSE CRÈDITS:** ja ha gastat els crèdits que duia i li diu quantes estrelles li falten per al següent (amb el mateix botó per continuar estudiant).
  - **TORNA DEMÀ:** ja ha enviat les 5 frases del dia; hi surt el compte enrere fins a mitjanit i pot continuar llegint i votant.

## 6. Desbloquejos

El catàleg inicial té **26 frases** i **66 peces** (en total, 92 elements). Es troba tant a la portada (`index.html`, bloc `XAT-CATALEG`) com a la base de dades (`supabase/bn_xat.sql`).

Cada frase i cada peça s'obre segons el **nivell del rànquing** del nen (de l'1 🐣 Aprenent al 10 🌟 Llegenda d'or, calculat amb les estrelles del seu millor món dels últims 120 dies) o bé en **acabar un món**, que al xat vol dir tenir **25 ⭐ o més** en aquell món (també dins dels últims 120 dies).

| Grup | Categoria o tipus | Quantes n'hi ha | Com s'obren |
|---|---|---|---|
| **Frases (26)** | Repte (forat de paraula d'estudi) | 10 | Pel nivell del rànquing: 4 al nivell 1, i la resta als nivells 2, 3, 4, 5, 6 i 9 |
| | Aura (2 de company, 2 de paraula, 1 de classe, 1 teva) | 6 | Pel nivell del rànquing: 4 al nivell 1, 1 al nivell 2 i 1 al nivell 7 |
| | Classe (4 de cosa de classe, 1 de cosa teva) | 5 | Pel nivell del rànquing: 2 al nivell 1, i la resta als nivells 2, 3 i 4 |
| | Colla (totes 5 amb forat de company) | 5 | Pel nivell del rànquing: 2 al nivell 1, 1 al nivell 2, 1 al nivell 4 i 1 al nivell 7 |
| **Peces (66)** | Paraula d'estudi (general) | 24 | Pel nivell del rànquing: 6 al nivell 1, i 2 a cada nivell del 2 al 10 |
| | Paraula d'estudi (dels 7 mons) | 21 | 3 per cada món, en arribar a **25 ⭐** en aquell món (Mates, Clima, Bio-Geo, Comarques, Castellano, Català i Anglès) |
| | Cosa de classe | 15 | Pel nivell del rànquing: 4 al nivell 1, 2 a cada nivell del 2 al 6, i 1 al nivell 7 |
| | Cosa teva | 6 | Pel nivell del rànquing: 2 al nivell 1, i 1 a cada nivell del 2 al 5 |

Al nivell 1, qualsevol nen comença amb **11 frases** i **12 peces** ja obertes (6 paraules d'estudi, 4 coses de classe i 2 coses teves), més els noms dels companys del rànquing. Les frases i peces que encara no té surten en gris amb un cadenat i diuen què cal fer per obrir-les («Savi», «Acaba Mates»…); si les toca, un avís l'hi explica. A sota del podi, la targeta **«Com es guanya parlar»** li resumeix quantes frases i peces ja té al seu àlbum.

## 7. Què es guarda i què no

- **Només números, mai text lliure:** de cada missatge, el servidor només desa un identificador, el nom del nen, el número de la frase, el número de la peça (o el nom del company tal com surt al rànquing), l'hora i si està esborrat. No hi ha cap columna per a text lliure. Quan algú obre el xat, rep aquests números i el navegador compon la frase amb el catàleg.
- **Llegir no demana PIN; parlar i votar, sí:** la lectura del xat és pública com el rànquing i només retorna el recompte de vots de cada missatge, mai qui l'ha votat. En canvi, per consultar els propis crèdits i vots, per enviar un missatge i per votar «Ben dit» cal el nom i el PIN del nen. Si en un aparell no hi ha cap nom entrat o falta el PIN, es pot llegir tot el xat però surt el cartell **ENTRA PER PARLAR**.
- **Noms amagats, prohibits i esborrats:** si l'administrador amaga un nom del rànquing o és un nom prohibit, aquest nom no surt a la llista de companys, els seus missatges (i els missatges d'altres que l'esmentin com a company) deixen de veure's a la portada i ell mateix queda com en pausa sense data: pot llegir, però no pot gastar crèdits en missatges que ningú no veuria. Si l'administrador esborra un nen del tot (perfil i registre), els seus missatges també deixen de sortir; en canvi, «Treu el PIN» només esborra el PIN i manté visibles els missatges que ja havia escrit.
- **Sense connexió o sense el SQL aplicat:** si encara no s'ha executat `supabase/bn_xat.sql` a la base de dades (o si s'obre el rànquing sense connexió per primera vegada), el rànquing es veu exactament com abans (sense bafarades, sense targeta del xat ni comptador) i la pestanya 💬 Xat mostra **«El xat arriba aviat»**. Si la connexió es perd quan el nen ja tenia el xat obert, es manté l'últim estat bo que s'havia rebut i es torna a provar cada 10 segons.

## 8. Admin (pestanya Xat)

Al tauler d'administració (`https://bonanota.net/admin/`, menú esquerre → **Xat**), el pare ho té tot repartit en una fila de resum i 5 targetes:

1. **Secció «Avui al xat» (a dalt de tot):** mostra 5 xifres del dia des de mitjanit (hora de Madrid): **Han parlat** (nens diferents), **Frases dites** (comptant també les esborrades), **Han arribat al màxim**, **Vots «Ben dit»** i **Estat del xat** (Obert o Tancat, amb les regles actuals).
2. **Targeta «Missatges» (a tota l'amplada):** ensenya els missatges del període triat a la barra superior del tauler (7 dies, 30 dies, avui o curs, fins a 500 missatges, i filtrats pel nen si s'ha triat un nen a dalt). A dalt de la targeta hi ha 3 botons de filtre (**Tots**, **Visibles** i **Esborrats**). Els missatges que no es veuen a la portada per nom amagat, prohibit o esborrat porten l'etiqueta «No surt a la portada», i els que tenen una frase o peça desactivada també ho indiquen. A la dreta de cada missatge hi ha dos botons:
   - **Esborra** (amb confirmació) o **Recupera** si ja estava esborrat. Esborrar un missatge el treu del xat, de les bafarades i de la cinta, però no torna el crèdit al nen.
   - El **botó de l'altaveu ratllat** (al costat d'Esborra/Recupera), per silenciar directament l'autor d'aquell missatge.
3. **Targeta «Silenciats» (a baix a l'esquerra):** mostra la llista de noms silenciats ara mateix, fins a quin dia i hora dura el silenci i el motiu (que només veu l'admin). Cada fila té el botó **Treu el silenci**. A sota hi ha el desplegable **Silencia un nom** i el botó **Silencia…**, que obre una finestra per triar **1 dia**, **3 dies** o **7 dies** i escriure'n el motiu. Mentre dura el silenci, el nen pot llegir el xat però no pot escriure ni votar (veu «Xat en pausa» amb la data de final).
4. **Targeta «Configuració» (a baix al mig):** té tres caselles numèriques (**Estrelles per crèdit** d'1 a 100, **Màxim de frases al dia** d'1 a 20 i **Segons d'espera** de 0 a 600), l'interruptor **Xat obert** (Obert / Tancat; tancar-lo demana confirmació i deixa tothom en mode només lectura), un càlcul automàtic que tradueix les estrelles a minuts d'estudi i el botó **Desa la configuració**.
5. **Targeta «Peça nova» (a baix a la dreta):** permet afegir peces noves (per exemple, una paraula de la setmana) sense tocar el codi. Té el camp **Text** (fins a 60 caràcters), el desplegable **Tipus** (Paraula d'estudi, Cosa de classe o Cosa teva), els botons **Per nivell** o **En acabar un món** amb el seu desplegable, una previsualització en viu que mostra com queda dins d'una frase (amb les contraccions aplicades) i el botó **Afegeix la peça**.
6. **Targeta «Catàleg» (a baix de tot, a tota l'amplada):** té els botons **Frases** i **Peces** (amb un desplegable per filtrar per tipus de peça) i una taula amb totes les entrades. A la primera columna (**Activa**) cada fila té un interruptor **Sí / No** per activar o desactivar al moment qualsevol frase o peça. Una peça desactivada ja no es pot triar per escriure i, als missatges vells de la portada, es mostra com `…` (a l'admin es continua veient el text amb l'avís «Peça desactivada»).

## 9. El xat i el bon ús

Així passa el xat de la colla pel filtre de les 10 preguntes de [`BON-US.md`](BON-US.md) (apartat 6):

| Pregunta | Resposta | Per què |
|---|---|---|
| 1. Premia aprendre (encert, error corregit, explicació) i no pas estar-hi més estona? | **Sí** | Els crèdits surten de les estrelles guanyades avui (tests, obertes, repàs, jocs), mai dels minuts de connexió (`temps_s` no dona cap crèdit). |
| 2. Té topall al dia? | **Sí** | Màxim 5 frases al dia per defecte (configurable d'1 a 20), encara que el nen guanyi més estrelles, i 10 segons d'espera entre missatges. |
| 3. Si el nen no entra un dia, perd alguna cosa? | **No (amb matís a mitjanit)** | Si un dia no entra, no perd estrelles, ni peces desbloquejades, ni nivell. Ara bé, els crèdits guanyats avui que no s'han fet servir tornen a zero a mitjanit (no s'acumulen d'un dia per l'altre); al tauler es vigila el senyal «Entra per xatejar». |
| 4. El premi depèn de l'atzar (caixes sorpresa, premis aleatoris)? | **No** | Tant els crèdits (cada 10 ⭐ fixes) com el desbloqueig de frases i peces (per nivell o per arribar a 25 ⭐ en un món) tenen regles fixes i previsibles. |
| 5. Fa sentir malament qui va darrere? | **No** | La regla d'or impedeix qualsevol frase negativa amb el nom d'un company. Llegir és lliure per a tothom i des del nivell 1 ja es tenen 11 frases i 12 peces. |
| 6. Funciona en mode suau i sense so? | **Sí** | Respecta el silenci de l'app i el mode suau (`prefers-reduced-motion`): no fa saltar la moneda en enviar i canvia el rètol animat «CRÈDIT +1» per un avís de text quiet. |
| 7. Respecta el descans i la franja de nit? | **Sí** | Es pot obrir o tancar a mà des de l'admin en qualsevol moment i programar amb un horari automàtic de tancament i obertura en hora de Madrid (`supabase/bn_control.sql`, per defecte `21:30` → `07:00`). |
| 8. Té en compte la fase del món (aprendre, vigília, després)? | **En part (pendent dels PR C i D)** | Com que els topalls d'estrelles no s'estiren la vigília, els crèdits del xat tampoc s'inflen; quan s'apliquin els PR C i D de [`BON-US.md`](BON-US.md), l'horari de nit del xat seguirà la fase del món. |
| 9. Guarda només el mínim i sense text lliure entre nens? | **Sí** | Al servidor només es desen números (`frase`, `peca`) i noms validats contra el rànquing, mai text lliure, i els vots propis només es llegeixen amb PIN. |
| 10. El pare la pot veure al tauler? | **Sí** | Té la pestanya **Xat** a `admin/` amb el resum del dia, tots els missatges (també els esborrats), els silencis, la configuració i el catàleg, i es preveu el senyal «Entra per xatejar» a l'apartat «Benestar». |

## 10. Per a qui programa: on és cada cosa

| Cosa | On és |
|---|---|
| Catàleg al navegador (`XAT_FR`, `XAT_PC`) | `index.html`, bloc `/* XAT-CATALEG:inici */ … /* XAT-CATALEG:fi */` |
| Composició del text i contraccions | `xatCompon()` a `index.html` i bloc `// [xat-pures]` a `admin/index.html` (`XAT_CONTR` / `XCONTR`) |
| Vista del xat, bafarades, targeta, «Digues-li…» i cinta | `index.html`: `XAT`, `xatCarrega()`, `xatLlegeix()`, `xatEstat()`, `xatEnvia()`, `xatVota()`, `xatPintaVista()`, `xatBafs()`, `xatPeekHtml()`, `xatDiguesHtml()`, `xatCinta()` (integrat amb `carregaHs()` i `pintaHs()`) |
| Dibuixos de pixel art nous | `sprites.js`: `bafarada`, `moneda`, `cadenat` i `polze` |
| Claus a l'aparell (`localStorage`) | `bn_xat_vist` (id de l'últim missatge vist, per al comptador vermell) i `bn_xat_cred` (`{dia, g}`, per no repetir el rètol «CRÈDIT +1») |
| Mode `?demo` i els seus paràmetres | `index.html` (`xatDemo()`): `?demo` (la Laia porta 14 ⭐ i 3 missatges nous), `?demo&estrelles=4` (INSERT COIN), `?demo&estrelles=10` (1 crèdit; en enviar surt SENSE CRÈDITS), `?demo&estrelles=60` (5 crèdits; després de 5 frases surt TORNA DEMÀ). A l'admin: `/admin/?demo` (`demoXatRpc()`) |
| Taules privades (sense accés directe des del navegador) | `supabase/bn_xat.sql`: `bn_priv.xat_frases`, `bn_priv.xat_peces`, `bn_priv.xat_msg`, `bn_priv.xat_vots` i `bn_priv.xat_silenci` |
| Configuració al servidor | `bn_priv.config`, clau `'xat'`: `{"est_credit":10,"max_dia":5,"espera_s":10,"actiu":true}`, llegida amb límits per `bn_priv.xat_cfg()` |
| Ajudes internes del servidor (`bn_priv`) | `xat_cfg()`, `xat_mitjanit()`, `xat_fi_dia()`, `xat_ms()`, `xat_punts()`, `xat_est_avui()`, `xat_mons()`, `xat_niv()`, `xat_al_ranquing()`, `xat_ocult()`, `xat_existeix()`, `xat_vis()`, `xat_nen()`, `xat_ultims60()` |
| Funcions públiques per als nens (`public`) | `bn_xat_estat(p_nom, p_pin)`, `bn_xat_envia(p_nom, p_pin, p_frase, p_peca, p_company)`, `bn_xat_llegeix(p_des_de)` i `bn_xat_vota(p_nom, p_pin, p_msg)` |
| Funcions públiques per a l'admin (`public`) | `bn_admin_xat_msgs`, `bn_admin_xat_esborra`, `bn_admin_xat_silencia`, `bn_admin_xat_silencis`, `bn_admin_xat_config`, `bn_admin_xat_cataleg`, `bn_admin_xat_actiu`, `bn_admin_xat_peca_nova` i `bn_admin_xat_resum` |
| Pestanya Xat del tauler | `admin/index.html`: `vistaXat()`, `pintaXat()`, `pintaXRes()`, `pintaXMsgs()`, `pintaXSil()`, `pintaXCfg()`, `pintaXCat()`, `pintaXNova()`, `xEsborra()`, `xSilencia()`, `xTreuSilenci()`, `xActiu()` |
| Proves automàtiques | `motor/prova-xat-sql.js` (PGlite), `motor/prova-xat.js` (Playwright, portada) i `motor/prova-admin-xat.js` (Playwright, admin) |

### Com afegir una frase o una peça al catàleg sense trencar la regla d'or

Si només vols afegir una **peça nova** (una paraula d'estudi, cosa de classe o cosa teva), ho pots fer directament des del tauler (`admin/` → **Xat** → **Peça nova**): el servidor li dona un identificador a partir del `1001` i `bn_xat_llegeix` ja n'envia el text al navegador.

Si vols afegir una **frase nova** o canviar el **catàleg fix** del codi (ids `1–26` per a frases i `1–66` per a peces):

1. **Respecta la regla d'or:** si la frase té forat de company (`slot: 'C'`), ha de ser de les categories `'aura'` o `'colla'` i no pot portar cap número negatiu (com `-1000`) ni cap burla. Les frases per riure o queixar-se han de portar forat `'E'` (cosa de classe) o `'J'` (cosa teva). Cap peça no pot nomenar persones ni fets reals.
2. **Canvia els dos llocs alhora:** edita el bloc `/* XAT-CATALEG:inici */ … /* XAT-CATALEG:fi */` d'`index.html` (`XAT_FR` i `XAT_PC`) i els `insert into bn_priv.xat_frases` / `bn_priv.xat_peces` de `supabase/bn_xat.sql` amb el mateix identificador, text, categoria/tipus, forat i nivell o món.
3. **Executa `python3 motor/tot.py` i les proves:** `node motor/prova-xat-sql.js` llegeix el bloc `XAT-CATALEG` d'`index.html`, carrega `supabase/bn_xat.sql` dins de PGlite i comprova que totes les frases i peces amb `id < 1001` són idèntiques un a un, que totes les frases tenen exactament un forat `___`, que les frases amb forat `'C'` són només d'`aura` o `colla` sense signes negatius (`!/-\d/`) i que la taula `xat_msg` no té cap columna de text lliure.

## 11. Diferències amb l'encàrrec i d'on ve

### Diferències amb l'encàrrec

- **Afegir frases des de l'admin:** l'apartat 8 d'aquest encàrrec (`n2541`) esmenta «activar o desactivar frases i peces i afegir-ne de noves». Al codi i al SQL (`bn_admin_xat_actiu` i `bn_admin_xat_peca_nova`), des de l'admin es poden activar i desactivar tant frases com peces, però **només s'hi poden afegir peces noves** (amb `id >= 1001`), tal com demanava l'encàrrec original `n2528`. Les frases són sempre les 26 del catàleg fix.
- **«Món acabat» a les peces de món:** l'encàrrec original `n2528` definia «món acabat» com tenir tots els temes aprovats, però deixava previst fer servir **25 ⭐ en aquell món** si el servidor no sabia quants temes té cada món. Tal com recull l'[ADR-0006](DECISIONS.md), el servidor aplica el llindar de **25 ⭐** (dins dels últims 120 dies, igual que el rànquing).

### D'on ve

- **Encàrrec i disseny (`n2528`):** [`docs/superpowers/specs/2026-11-10-xat-colla.md`](superpowers/specs/2026-11-10-xat-colla.md) i pla [`.nucli/pla-n2528.md`](../.nucli/pla-n2528.md) (`docs/superpowers/plans/2026-11-10-xat-colla.md`).
- **Decisió d'arquitectura:** [ADR-0006](DECISIONS.md) («El xat de la colla es parla amb peces i es paga amb les estrelles d'avui»).
- **Estudi de ritme d'estrelles (`n2505`):** [`docs/superpowers/specs/2026-11-09-estrelles-estudi.md`](superpowers/specs/2026-11-09-estrelles-estudi.md) (d'on surten les ~2 ⭐ per minut i els ~5 minuts d'estudi per crèdit).
- **Versió:** publicat a la versió **2.11.0** (10 de novembre de 2026, [`CHANGELOG.md`](../CHANGELOG.md)).
