// Bona Nota · Estudi interactiu · dades de SOCIALS 1r ESO · 2n trimestre: La Prehistòria
// Font: Socials 1r ESO (Marca 1 Vicens Vives, pàg. 124) + dossiers XTEC/Buxaweb i resum d'estudi Bona Nota
const ASSIG={
 id:"prehistoria",
 nom:"Ciències socials", tema:"La Prehistòria", curs:"1r ESO", ic:"🔥",
 color:["#451a03","#b45309","#f59e0b"],
 peu:"Bona Nota · Ciències socials 1r ESO · 2n trimestre: La Prehistòria · orígens humans, paleolític, art rupestre, neolític, metalls, Península i Catalunya",
 visual:{
  world:"prehistoria",
  src:"../../visuals/prehistoria.html",
  total:6,
  rewardStars:10,
  icona:"🔥",
  titol:"🔥 Laboratori Visual · 6 fitxes interactives",
  subtitol:"Hominització, Abric Romaní, Altamira vs. Ulldecona, Neolític, estratigrafia i metalls",
  modalTitol:"🔥 La Prehistòria · Laboratori Visual",
  botoJoc:"🧪 Obre laboratori visual",
  temes:{quees:5,hominids:1,paleolitic:2,art:3,neolitic:4,metalls:6,peninsula:3,catalunya:2},
  jocs:{hominids:1,etapes:5,megalits:4,estratigrafia:5,"pal-neo-met":4,art:3,jaciments:2,conceptes:4,"fr-prehistoria":6,"err-prehistoria":5}
 },
 blocs:[
  {titol:"🧭 El mapa i els orígens",n:2},
  {titol:"🔥 El Paleolític i l'art",n:2},
  {titol:"🌾 Neolític i Metalls",n:2},
  {titol:"🗺️ A la Península i a Catalunya",n:2}
 ],
 jocs:[
  {id:"hominids",tipus:"ordena",ic:"🦴",titol:"L'escala de l'evolució",sub:"Les 5 espècies en ordre",col:"#fef3c7",
   enunciat:"🦴 Ordena els avantpassats dels humans",instr:"Toca les 5 espècies de la <b>més antiga</b> a la <b>més moderna</b>.",base:"🌍 ÀFRICA · VALL DEL RIFT",
   items:[
    ["Australopitec","fa ~4,5 M anys · només a l'Àfrica, ja camina dret (la «Lucy»)","#fde68a"],
    ["Homo habilis","fa ~2 M anys · primer a fabricar eines de pedra","#fed7aa"],
    ["Homo erectus","1.500.000 aC · talla bifaços i domina el foc","#fdba74"],
    ["Homo neanderthalensis","230.000 aC · Europa i oest d'Àsia, primer que enterra els morts","#fca5a5"],
    ["Homo sapiens","40.000 aC · s'escampa per tots els continents i fa el primer art","#d8b4fe"]
   ],
   final:"Truc: «Avui Hem Encès el Nostre Sopar» = Australopitec, Habilis, Erectus, Neandertal, Sapiens."},
  {id:"etapes",tipus:"ordena",ic:"⏳",titol:"La línia del temps",sub:"Les etapes de la prehistòria en ordre",col:"#ffedd5",
   enunciat:"⏳ Ordena les etapes de la prehistòria",instr:"Toca les etapes de la <b>més antiga</b> a la <b>més recent</b>.",base:"🕰️ FA MÉS DE 2 MILIONS D'ANYS",
   items:[
    ["Paleolític","pedra antiga tallada · nòmades caçadors i recol·lectors (99,5 %)","#e7e5e4"],
    ["Mesolític","pedra del mig · etapa de transició després de la glaciació","#d6d3d1"],
    ["Neolític","pedra nova polida · agricultura, ramaderia i poblats sedentaris","#bbf7d0"],
    ["Edat del Coure","primer metall, tou · joies i ornaments (Los Millares)","#fed7aa"],
    ["Edat del Bronze","aliatge de coure + estany · armes dures (El Argar)","#fde047"],
    ["Edat del Ferro","metall més dur i abundant · armes i reixes de l'arada","#cbd5e1"],
    ["Invenció de l'escriptura","cap al 3.500 aC a Mesopotàmia · acaba la prehistòria i comença la història","#bfdbfe"]
   ],
   final:"Edat de Pedra (Paleo → Meso → Neo) + Edat dels Metalls (Coure → Bronze → Ferro: «Comença Bé i acaba Fort»)."},
  {id:"megalits",tipus:"figura",ic:"🪨",titol:"Els megàlits",sub:"Menhir, dolmen i cromlec al dibuix",col:"#e0e7ff",
   enunciat:"🪨 Mira els tres megàlits i respon",figura:"svgMegalits",
   q:[
    ["Com es diu el megàlit número 1?",["Un dolmen","Un menhir","Un cromlec"],1,"El menhir és una sola pedra llarga clavada dreta a terra, com un «soldat dret»."],
    ["Com es diu el megàlit número 2?",["Un dolmen","Un cromlec","Un menhir"],0,"El dolmen té pedres verticals cobertes per una gran llosa horitzontal, com una «taula de pedra»."],
    ["Com es diu el megàlit número 3?",["Un menhir","Un dolmen","Un cromlec"],2,"El cromlec és un cercle de menhirs, com una «rotllana»."],
    ["Per a què servia sobretot el megàlit número 2 (dolmen)?",["Per guardar gra i eines","Com a cambra funerària (enterrament)","Com a muralla defensiva"],1,"Els dòlmens eren cambres funeràries on enterraven els morts del grup."],
    ["En quin moment de la prehistòria apareix el megalitisme?",["Al paleolític inferior","Al final del neolític","Després de la invenció de l'escriptura"],1,"El megalitisme neix al final del neolític i continua a l'edat dels metalls."],
    ["Quin d'aquests és un dolmen famós de Catalunya?",["La Cova d'en Daina (Romanyà de la Selva)","La Cova d'Altamira","L'Abric Romaní de Capellades"],0,"La Cova d'en Daina, a Romanyà de la Selva, i els dòlmens de l'Empordà són megàlits catalans."]
   ]},
  {id:"estratigrafia",tipus:"figura",ic:"⛏️",titol:"Llegeix el jaciment",sub:"Estrats i restes arqueològiques",col:"#fef3c7",
   enunciat:"⛏️ Mira el tall del jaciment i respon",figura:"svgEstrats",
   q:[
    ["Quina capa del jaciment és la més antiga?",["La capa A (la de dalt)","La capa D (la més fonda)","Totes són de la mateixa època"],1,"En estratigrafia, les capes més fondes són sempre les més antigues."],
    ["En quina capa trobaríem un bifaç de sílex del paleolític inferior?",["A la capa A","A la capa B","A la capa D"],2,"El bifaç de sílex del paleolític és a les capes més fondes i antigues (capa D)."],
    ["En quina capa hi ha ceràmica cardial i pedra polida del neolític?",["A la capa B","A la capa C","A la capa D"],0,"La capa B correspon al neolític, per sobre del paleolític i per sota dels metalls."],
    ["En quina capa trobaríem una espasa o una urna de l'edat dels metalls?",["A la capa A","A la capa C","A la capa D"],0,"L'edat dels metalls és la més recent de la prehistòria: queda a la capa A, la més propera a la superfície."],
    ["Un bifaç trobat a la capa D és una font històrica…",["primària","secundària","escrita"],0,"Les restes fetes a la mateixa època són fonts primàries; un llibre de text actual és una font secundària."],
    ["Com es diu la ciència que estudia el passat a partir d'aquestes restes materials?",["La geologia","L'arqueologia","La meteorologia"],1,"L'arqueologia estudia el passat a partir de restes materials com pedres, ossos, ceràmica o pintures."]
   ]},
  {id:"pal-neo-met",tipus:"classifica",ic:"🗂️",titol:"Paleolític, Neolític o Metalls?",sub:"Classifica trets i invents",col:"#dcfce7",
   enunciat:"🗂️ A quina etapa pertany cada cosa?",instr:"Toca cada element i després l'etapa on va.",
   caixes:[["pal","🔥 Paleolític"],["neo","🌾 Neolític"],["met","⚔️ Metalls"]],
   items:[
    ["Gent nòmada sense casa fixa","pal"],
    ["Economia depredadora (caça i recol·lecció)","pal"],
    ["Eines de pedra tallada (bifaços)","pal"],
    ["Societat igualitària, sense rics ni pobres","pal"],
    ["Neix l'agricultura i la ramaderia","neo"],
    ["Poblats sedentaris de fusta i tova","neo"],
    ["Pedra polida, ceràmica i teler","neo"],
    ["Excedents de gra i bescanvi","neo"],
    ["Forns d'alta temperatura i motlles","met"],
    ["Invenció de la roda i la vela","met"],
    ["Ciutats emmurallades i guerrers","met"],
    ["Societat jerarquitzada amb cabdills i reis","met"]
   ],
   final:"Paleolític = 3 N (Natura, Nòmades, Ningú manava) · Neolític = 3 S (Sembrar, Sedentaris, Sobra) · Metalls = forns, roda i reis."},
  {id:"art",tipus:"classifica",ic:"🎨",titol:"Cantàbric o llevantí?",sub:"Compara els dos estils d'art rupestre",col:"#fee2e2",
   enunciat:"🎨 Art franco-cantàbric o art llevantí?",instr:"Toca cada pista o jaciment i després l'estil que li correspon.",
   caixes:[["cant","🦬 Franco-cantàbric"],["llev","🏹 Llevantí"]],
   items:[
    ["Interior de coves profundes","cant"],
    ["Animals sols (bisons, cavalls, cérvols)","cant"],
    ["Molt realista (naturalista) i policrom","cant"],
    ["Aprofita el relleu de la roca","cant"],
    ["Cova d'Altamira (Cantàbria)","cant"],
    ["Abrics de roca a l'aire lliure","llev"],
    ["Escenes de caça, danses i combats","llev"],
    ["Figures humanes estilitzades i monocromes","llev"],
    ["Roca dels Moros del Cogul (Lleida)","llev"],
    ["Abrics d'Ulldecona (el Montsià)","llev"]
   ],
   final:"Truc: Cantàbric = Cova i Colors · Llevantí = aire Lliure, Línies i Lluita."},
  {id:"jaciments",tipus:"parelles",ic:"📍",titol:"Jaciments clau",sub:"Península Ibèrica i Catalunya",col:"#e0f2fe",
   enunciat:"📍 Uneix cada jaciment amb la seva pista",instr:"Toca un jaciment a l'esquerra i després la seva pista a la dreta.",
   pars:[
    ["Atapuerca (Burgos)","Homínids més antics de la Península (Homo antecessor)"],
    ["Altamira (Cantàbria)","Art rupestre cantàbric: bisons policroms"],
    ["Abric Romaní (Capellades)","Neandertals a l'Anoia amb molts fogars"],
    ["El Cogul i Ulldecona","Art rupestre llevantí a Catalunya"],
    ["Mines de Gavà","Extracció de variscita verda al neolític"],
    ["El Argar (Almeria)","Cultura de l'edat del bronze"],
    ["Els Vilars d'Arbeca","Poblat fortificat de l'edat del ferro"]
   ],
   final:"Truc català: Banyoles i Sitges mosseguen, Cogul i Ulldecona pinten, Gavà excava, Capellades encén foc i Arbeca es defensa."},
  {id:"conceptes",tipus:"parelles",ic:"🧩",titol:"Vocabulari prehistòric",sub:"Uneix cada paraula amb el seu significat",col:"#ede9fe",
   enunciat:"🧩 Uneix cada concepte amb el que vol dir",instr:"Toca una paraula a l'esquerra i després la seva definició a la dreta.",
   pars:[
    ["Bipedisme","Caminar dret sobre dues cames, deixant les mans lliures"],
    ["Bifaç","Pedra de sílex tallada per les dues cares"],
    ["Depredadora","Economia que agafa de la natura sense produir"],
    ["Sedentari","Viure sempre al mateix poblat, sense traslladar-se"],
    ["Excedent","Aliments que sobren després de menjar"],
    ["Aliatge","Barreja de dos metalls, com coure i estany (bronze)"],
    ["Camps d'urnes","Incinerar els morts i guardar les cendres en urnes"]
   ],
   final:"Dominar aquestes 7 paraules et dona mig examen fet!"},
  {id:"fr-prehistoria",tipus:"frases",ic:"✍️",titol:"Frases amb buits",sub:"De l'Àfrica a l'edat del ferro",col:"#f3e8ff",
   enunciat:"✍️ Completa les frases clau de la prehistòria",
   items:[
    {f:"La prehistòria acaba cap al ___ aC, amb la invenció de l'___.",ok:["3.500","escriptura"],no:["10.000","roda"],per:{"10.000":"Cap al 10.000 aC comença el neolític, no la història.","roda":"La roda s'inventa a l'edat dels metalls, però la frontera és l'escriptura."},pista:"Passa a Mesopotàmia.",ex:"Cap al <b>3.500 aC</b> neix l'<b>escriptura</b> i comença la història."},
    {f:"Els primers homínids van aparèixer a l'Àfrica oriental, a la vall del ___.",ok:"Rift",no:["Nil","Ebre"],per:{"Nil":"El Nil és al nord-est d'Àfrica (Creixent Fèrtil).","Ebre":"L'Ebre és a la Península Ibèrica."},pista:"Comença per R.",ex:"L'evolució humana comença a la <b>vall del Rift</b>, a l'Àfrica oriental."},
    {f:"El paleolític ocupa el ___ % de tota la història humana.",ok:"99,5",no:["50","10"],per:{"50":"És gairebé tota la història de la humanitat.","10":"Molt més: va durar milions d'anys."},pista:"Gairebé el 100 %.",ex:"El paleolític és el <b>99,5 %</b> de tota la història humana."},
    {f:"L'art que es pot transportar, com la Venus de Willendorf, és art ___.",ok:"mobiliari",no:["rupestre","megalític"],per:{"rupestre":"Rupestre ve de roca (parets de coves), no es pot moure.","megalític":"Els megàlits són pedres enormes clavades a terra."},pista:"Pensa en «mòbil».",ex:"<b>MO</b>biliari = <b>MÒ</b>bil · <b>RU</b>pestre = <b>R</b>oca."},
    {f:"El neolític va néixer a l'Orient Pròxim, en una zona anomenada ___.",ok:"Creixent Fèrtil",no:["vall del Rift","mar Cantàbric"],per:{"vall del Rift":"La vall del Rift és l'origen dels primers homínids a l'Àfrica.","mar Cantàbric":"El Cantàbric és al nord de la Península (art rupestre)."},pista:"Entre el Tigris, l'Eufrates i el Nil.",ex:"La revolució neolítica neix al <b>Creixent Fèrtil</b>."},
    {f:"Les eines del paleolític són de pedra ___; les del neolític, de pedra ___.",ok:["tallada","polida"],no:["fosa","tova"],per:{"fosa":"El que es fon en forns és el metall, no la pedra.","tova":"La pedra del paleolític i del neolític era dura (com el sílex)."},pista:"A cops vs fregant.",ex:"Paleolític = pedra <b>tallada</b> · Neolític = pedra <b>polida</b>."},
    {f:"La ceràmica decorada amb la closca d'una escopinya s'anomena ceràmica ___.",r:["cardial"],pista:"Ve del nom científic Cardium.",ex:"La <b>ceràmica cardial</b> és típica del neolític mediterrani."},
    {f:"El bronze és un aliatge de ___ i ___.",ok:["coure","estany"],no:["ferro","or"],per:{"ferro":"El ferro ve després del bronze.","or":"L'or s'usava per a joies, no per fer bronze."},pista:"El primer metall + un altre per endurir-lo.",ex:"Bronze = <b>coure + estany</b>."},
    {f:"Amb la propietat privada i els guerrers, la societat passa d'igualitària a ___.",ok:"jerarquitzada",no:["nòmada","depredadora"],per:{"nòmada":"Nòmada vol dir sense casa fixa (paleolític).","depredadora":"Depredadora és l'economia de caça i recol·lecció."},pista:"Amb grups a dalt (cabdills, reis) i a baix.",ex:"A l'edat dels metalls la societat es torna <b>jerarquitzada</b>."},
    {f:"Les restes humanes més antigues de Catalunya són les mandíbules de ___ i ___.",ok:["Banyoles","Sitges"],no:["Gavà","Arbeca"],per:{"Gavà":"Gavà són mines de variscita del neolític.","Arbeca":"Els Vilars d'Arbeca és un poblat de l'edat del ferro."},pista:"Truc: «… i … mosseguen».",ex:"Les mandíbules neandertals de <b>Banyoles</b> i <b>Sitges</b>."}
   ],
   final:"Ja controles les paraules clau de tota la prehistòria!"},
  {id:"err-prehistoria",tipus:"error",ic:"🔍",titol:"Troba l'error de l'arqueòleg",sub:"6 trampes clàssiques de l'examen",col:"#fee2e2",
   enunciat:"🔍 Troba l'error a la llibreta de l'arqueòleg",
   exercicis:[
    {id:"err-ac",nom:"en Marc",
     enun:"Ordena aquests fets del més antic al més recent: agricultura (8.000 aC), metal·lúrgia (4.000 aC) i escriptura (3.500 aC).",
     linies:[
      "1. Els anys «aC» volen dir abans de Crist.",
      "2. Com més petit és el número, més antic és el fet.",
      "3. Per tant, l'ordre del més antic al més recent és: 3.500 aC → 4.000 aC → 8.000 aC.",
      "4. Primer va venir l'escriptura i al final l'agricultura."
     ],
     mal:1,
     per:[
      "En «aC» es compta cap enrere: com més GRAN és el número, més antic és el fet",
      "«aC» vol dir després de Crist i compta cap endavant",
      "L'escriptura és més antiga que el paleolític"
     ],
     t:"tria",q:"Quin fet és el <b>més antic</b>?",
     op:["L'escriptura (3.500 aC)","La metal·lúrgia (4.000 aC)","L'agricultura (8.000 aC)"],r:2,
     pista:"En anys aC, 8.000 és més lluny en el passat que 3.500.",
     pistaR:"8.000 aC és més antic que 4.000 aC i 3.500 aC.",
     llibreta:[
      "1. Els anys «aC» compten cap enrere des de l'any 1.",
      "2. Com més <b>gran</b> és el número, més antic és el fet.",
      "3. Ordre correcte: <b>8.000 aC (agricultura) → 4.000 aC (metal·lúrgia) → 3.500 aC (escriptura)</b>."
     ],ok:[1,2]},
    {id:"err-dino",nom:"la Júlia",
     enun:"Explica què feien els primers humans del paleolític.",
     linies:[
      "1. Els humans del paleolític eren nòmades i vivien de la caça i la recol·lecció.",
      "2. Fabricaven eines de pedra tallada, com els bifaços de sílex.",
      "3. Caçaven dinosaures gegants per menjar i fer-se cabanes amb les pells.",
      "4. Dominaven el foc per escalfar-se, coure menjar i espantar animals."
     ],
     mal:2,
     per:[
      "Els humans prehistòrics mai van conviure amb els dinosaures (extingits milions d'anys abans)",
      "Al paleolític no coneixien el foc",
      "Al paleolític ja conreaven blat i eren sedentaris"
     ],
     t:"tria",q:"Quina frase és correcta sobre humans i dinosaures?",
     op:["Els humans van caçar els últims dinosaures","Els dinosaures es van extingir molt abans que apareguessin els primers humans","Els neandertals tenien dinosaures domesticats"],r:1,
     pista:"Recorda el «Compte!» de la fitxa 0.",
     pistaR:"Mai no van conviure: els dinosaures havien desaparegut milions d'anys abans.",
     llibreta:[
      "1. Els humans del paleolític eren nòmades i vivien de la caça i la recol·lecció.",
      "2. Fabricaven eines de pedra tallada, com els bifaços de sílex.",
      "3. Caçaven <b>mamuts, bisons, cérvols i cavalls (mai dinosaures!)</b>.",
      "4. Dominaven el foc per escalfar-se, coure menjar i espantar animals."
     ],ok:[2]},
    {id:"err-coves",nom:"en Pol",
     enun:"Com vivien les persones al paleolític?",
     linies:[
      "1. Al paleolític l'economia era depredadora: caçaven, pescaven i recol·lectaven.",
      "2. Vivien sempre a la mateixa cova, que era la seva casa fixa tota la vida.",
      "3. La societat era igualitària: no hi havia rics ni pobres.",
      "4. Els neandertals van ser els primers a enterrar els morts."
     ],
     mal:1,
     per:[
      "Eren nòmades: les coves i balmes eren refugis temporals, no cases fixes",
      "Al paleolític vivien en ciutats amb muralles",
      "Els neandertals no enterraven els morts"
     ],
     t:"tria",q:"Per què es movien de lloc les tribus del paleolític?",
     op:["Perquè buscaven mines de ferro","Perquè seguien els ramats i els aliments de la natura","Perquè els reis els feien fora"],r:1,
     pista:"Eren nòmades amb economia depredadora.",
     pistaR:"Es desplaçaven seguint la caça i els fruits disponibles: les coves eren refugis temporals.",
     llibreta:[
      "1. Al paleolític l'economia era depredadora: caçaven, pescaven i recol·lectaven.",
      "2. Eren <b>nòmades</b>: feien servir les coves i balmes com a <b>refugis temporals</b>, no com a cases fixes.",
      "3. La societat era igualitària: no hi havia rics ni pobres."
     ],ok:[1]},
    {id:"err-art",nom:"la Carla",
     enun:"Compara l'art rupestre d'Altamira i el del Cogul.",
     linies:[
      "1. Altamira és un exemple d'art franco-cantàbric.",
      "2. A Altamira hi ha animals molt realistes i policroms a dins d'una cova profunda.",
      "3. Al Cogul també hi ha bisons policroms dins una cova fosca, sense persones.",
      "4. L'art rupestre tenia un sentit màgic i religiós."
     ],
     mal:2,
     per:[
      "El Cogul és art llevantí: abric a l'aire lliure, monocrom, esquemàtic i amb escenes de persones",
      "Altamira no és art franco-cantàbric, sinó llevantí",
      "L'art rupestre era només per decorar el menjador"
     ],
     t:"tria",q:"Quin tret és propi de l'art <b>llevantí</b> (com el Cogul o Ulldecona)?",
     op:["Animals sols, molt realistes i de molts colors","Escenes de caça o dansa amb persones, monocromes i a l'aire lliure","Estàtues de ferro dins de dòlmens"],r:1,
     pista:"Truc: Llevantí = aire Lliure, Línies, Lluita.",
     pistaR:"El Cogul és art llevantí: escenes amb persones, figures esquemàtiques d'un sol color a l'aire lliure.",
     llibreta:[
      "1. Altamira és un exemple d'art franco-cantàbric.",
      "2. A Altamira hi ha animals molt realistes i policroms a dins d'una cova profunda.",
      "3. El Cogul és <b>art llevantí</b>: abric a l'<b>aire lliure</b>, escenes amb <b>persones</b>, figures esquemàtiques i <b>monocromes</b>."
     ],ok:[2]},
    {id:"err-metalls",nom:"en Jan",
     enun:"Explica les tres etapes de l'edat dels metalls.",
     linies:[
      "1. La metal·lúrgia consisteix a fondre metalls en forns i abocar-los en motlles.",
      "2. El primer metall va ser el ferro, que era tou i servia per a joies.",
      "3. Després va venir el bronze, un aliatge de coure i estany.",
      "4. En aquesta època apareixen la roda, la vela i les ciutats emmurallades."
     ],
     mal:1,
     per:[
      "El primer metall tou va ser el coure; el ferro va ser l'últim, i era el més dur i abundant",
      "El bronze és una barreja de ferro i pedra",
      "La roda va aparèixer al paleolític inferior"
     ],
     t:"tria",q:"Quin és l'ordre correcte dels metalls?",
     op:["Ferro → Bronze → Coure","Coure → Bronze → Ferro","Bronze → Coure → Ferro"],r:1,
     pista:"Truc: «Comença Bé i acaba Fort».",
     pistaR:"Coure (primer, tou) → Bronze (coure + estany) → Ferro (més dur i abundant).",
     llibreta:[
      "1. La metal·lúrgia consisteix a fondre metalls en forns i abocar-los en motlles.",
      "2. El primer metall va ser el <b>coure</b> (tou, sobretot joies); el <b>ferro</b> va ser l'últim, més dur i abundant.",
      "3. Entremig va venir el <b>bronze</b>, un aliatge de coure i estany."
     ],ok:[1,2]},
    {id:"err-neandertal",nom:"la Berta",
     enun:"Què va fer l'Homo neanderthalensis i què va fer l'Homo sapiens?",
     linies:[
      "1. L'Homo neanderthalensis va viure a Europa i l'oest d'Àsia.",
      "2. Els neandertals van ser els primers a enterrar els morts.",
      "3. Els neandertals van pintar les coves d'Altamira i van esculpir la Venus de Willendorf.",
      "4. L'Homo sapiens es va escampar per tots els continents."
     ],
     mal:2,
     per:[
      "Les primeres obres d'art (coves i venus) les va fer l'Homo sapiens, no els neandertals",
      "Els neandertals mai van viure a Europa",
      "L'Homo sapiens només va viure a l'Àfrica"
     ],
     t:"tria",q:"Quina espècie va crear les primeres obres d'art (pintures rupestres i venus)?",
     op:["Homo habilis","Homo neanderthalensis","Homo sapiens"],r:2,
     pista:"Neandertals = primers enterraments; Sapiens = primer art.",
     pistaR:"L'Homo sapiens (fa 35.000–30.000 anys) és qui crea el primer art rupestre i mobiliari.",
     llibreta:[
      "1. L'Homo neanderthalensis va viure a Europa i l'oest d'Àsia i va ser el primer a enterrar els morts.",
      "2. Qui va pintar les coves i esculpir les venus va ser l'<b>Homo sapiens</b>.",
      "3. L'Homo sapiens es va escampar per tots els continents."
     ],ok:[1]}
   ],
   final:"Ja no cauràs en cap trampa de l'examen de la Prehistòria!"}
 ]
};

const T=[
 {id:"quees",ic:"🧭",col:"#92400e",titol:"Què és la prehistòria?",font:"Secció 0 · Marca 1 Vicens Vives pàg. 124",
  idea:"La prehistòria és el temps d'abans de l'escriptura: comença amb els primers humans (fa més de 2 milions d'anys) i acaba cap al 3.500 aC, quan s'inventa l'escriptura i comença la història.",
  pts:[
   "<b>Sense documents escrits</b>: coneixem la prehistòria per <b>restes arqueològiques</b> (pedres tallades, pintures, ossos, banya, ceràmica).",
   "<b>Dues grans edats</b> segons el material de les eines: <b>Edat de Pedra</b> (Paleolític, Mesolític, Neolític) i <b>Edat dels Metalls</b> (Coure, Bronze, Ferro).",
   "<b>Arqueologia</b>: ciència que estudia el passat per restes materials. <b>Jaciment arqueològic</b>: lloc on es troben les restes (<b>estratigrafia</b>: les capes més fondes són les més antigues).",
   "<b>Datació</b>: mètode per saber l'antiguitat d'una resta.",
   "<b>Fonts històriques</b>: <b>primàries</b> (fetes a l'època, com un bifaç o una pintura) i <b>secundàries</b> (fetes després, com el llibre de text).",
   "<b>Com comptar en «aC»</b>: compta cap enrere des de l'any 1. Com més gran és el número, més antic (8.000 aC és més antic que 4.000 aC). 10.000 aC ≈ fa 12.000 anys."
  ],
  truc:"PRE-història = abans d'escriure. En grec, «lithos» = pedra, «paleo» = antic, «meso» = mig, «neo» = nou.",
  compte:"Els humans prehistòrics mai van conviure amb els dinosaures: s'havien extingit milions d'anys abans!",
  fc:[
   ["Quan comença i quan acaba la prehistòria?","Comença amb els primers humans (>2 M anys) i acaba cap al 3.500 aC amb l'escriptura."],
   ["Quines són les dues grans edats de la prehistòria?","Edat de Pedra (Paleolític, Mesolític, Neolític) i Edat dels Metalls (Coure, Bronze, Ferro)."],
   ["Què és l'arqueologia?","La ciència que estudia el passat a partir de restes materials."],
   ["En un jaciment, quina capa és la més antiga?","La més fonda (estratigrafia)."],
   ["Què és una font primària?","Una resta feta a la mateixa època (un bifaç, una pintura)."],
   ["Quin any és més antic: 8.000 aC o 4.000 aC?","8.000 aC (en aC, com més gran el número, més antic)."]
  ],
  q:[
   ["Quin fet marca el final de la prehistòria i l'inici de la història?",["La descoberta del foc per part de l'Homo erectus","La invenció de l'escriptura","La fabricació dels primers bifaços de sílex"],1,"Cap al 3.500 aC, a Mesopotàmia, apareix l'escriptura i comença la història."],
   ["Com sabem què va passar a la prehistòria si no hi havia textos escrits?",["Per les restes arqueològiques","Per llibres escrits sobre pergamí molt antic","Per fotografies i mapes guardats en coves"],0,"Pedres tallades, ossos, ceràmica i pintures són les restes materials que estudia l'arqueologia."],
   ["Quines tres etapes formen l'Edat de Pedra?",["Edat del Coure, del Bronze i del Ferro","Paleolític, Mesolític i Neolític","Edat Antiga, Edat Mitjana i Edat Moderna"],1,"L'Edat de Pedra es divideix en Paleolític (pedra antiga), Mesolític (mig) i Neolític (pedra nova)."],
   ["En un jaciment arqueològic, on són les restes més antigues?",["A les capes de dalt, a prop de la superfície","A les capes més fondes","Barrejades a l'atzar en totes les capes"],1,"Per estratigrafia, les capes més fondes es van dipositar abans i són les més antigues."],
   ["Un bifaç de sílex trobat en una excavació és una font…",["primària","secundària","escrita"],0,"És una font primària perquè va ser fabricat a la mateixa època que estudiem."],
   ["Un llibre de text d'història de 1r d'ESO és una font…",["primària","secundària","arqueològica"],1,"Les fonts secundàries són estudis o llibres fets molt després dels fets."],
   ["Quina d'aquestes dates és més antiga?",["3.500 aC","4.000 aC","8.000 aC"],2,"Els anys «aC» compten cap enrere: com més gran és el número, més antic."],
   ["Què vol dir la paraula grega «lithos»?",["Foc","Pedra","Metall"],1,"«Lithos» vol dir pedra: paleo-lític (pedra antiga), neo-lític (pedra nova)."],
   ["Quina afirmació és correcta sobre els dinosaures i la prehistòria humana?",["Els primers humans els caçaven en grup","Mai no van conviure","Van desaparèixer al final del neolític"],1,"Els dinosaures s'havien extingit milions d'anys abans que apareguessin els humans."]
  ]},

 {id:"hominids",ic:"🦴",col:"#b45309",titol:"Els primers éssers humans",font:"Secció 1 · Hominització i espècies",
  idea:"Fa uns 6 milions d'anys, a la vall del Rift (Àfrica oriental), uns primats van evolucionar (hominització) a través de 5 grans espècies fins a l'Homo sapiens.",
  pts:[
   "<b>4 canvis clau de l'hominització</b>: ① <b>Bipedisme</b> (caminar dret → mans lliures), ② <b>Cervell més gran</b> (més capacitat cranial), ③ <b>Pinça als dits</b> (polze i índex per agafar eines), ④ <b>Llenguatge</b> (canvis a la laringe).",
   "<b>Australopitec</b> (fa ~4,5 M anys): només a l'Àfrica, ja camina dret (bípede). Exemple famós: la <b>«Lucy»</b> (Etiòpia, 3,2 M anys).",
   "<b>Homo habilis</b> (fa ~2 M anys): primer a fabricar <b>eines de pedra</b>.",
   "<b>Homo erectus</b> (1.500.000 aC): cervell més gran, talla <b>bifaços</b> i domina el <b>foc</b>.",
   "<b>Homo neanderthalensis (Neandertal)</b> (230.000 aC): Europa i oest d'Àsia, domina el foc i és el <b>primer que enterra els morts</b> (80.000 aC).",
   "<b>Homo sapiens (Cromanyó)</b> (40.000 aC): s'escampa per <b>tots els continents</b> (travessant el Sinaí) i fa les <b>primeres obres d'art</b>."
  ],
  truc:"«Avui Hem Encès el Nostre Sopar» = Australopitec, Habilis, Erectus, Neandertal, Sapiens.",
  compte:"No venim del ximpanzé actual! Som «cosins» que compartim avantpassats comuns de fa milions d'anys.",
  fc:[
   ["On comença l'evolució humana?","A l'Àfrica oriental, a la vall del Rift (fa uns 6 milions d'anys)."],
   ["Quins són els 4 canvis de l'hominització?","Bipedisme, cervell més gran, pinça als dits i llenguatge."],
   ["Què fa especial l'Australopitec (com la Lucy)?","Ja camina dret (bípede), només a l'Àfrica."],
   ["Què fa per primer cop l'Homo habilis?","Fabricar eines de pedra."],
   ["Què domina l'Homo erectus?","Talla bifaços i domina el foc."],
   ["Què fa per primer cop l'Homo neanderthalensis?","Enterrar els morts (80.000 aC)."],
   ["Què fa l'Homo sapiens?","S'escampa per tots els continents i crea les primeres obres d'art."]
  ],
  q:[
   ["On van aparèixer els primers homínids fa uns 6 milions d'anys?",["A les planes d'Europa central i occidental","A la vall del Rift (Àfrica)","A la zona del Creixent Fèrtil (Orient Pròxim)"],1,"L'hominització comença a la vall del Rift, a l'Àfrica oriental."],
   ["Quin avantatge clau va donar el bipedisme als primers homínids?",["Caminar dret i mans lliures","Poder nedar llargues distàncies pels rius","Córrer més ràpid que qualsevol depredador"],0,"Caminar sobre dues cames va alliberar les mans per agafar objectes i fabricar eines."],
   ["Quin canvi va permetre parlar amb un llenguatge complex?",["La pinça entre el polze i l'índex de la mà","Canvis a la laringe i cervell més gran","El domini del foc i la fabricació de bronze"],1,"L'augment del cervell i els canvis a la laringe van fer possible el llenguatge."],
   ["Qui va ser la «Lucy», trobada a Etiòpia?",["Un Australopitec bípede","Una pintura rupestre trobada en una cova","Un esquelet d'Homo sapiens de l'edat del ferro"],0,"La Lucy és un esquelet famós d'Australopitec de fa uns 3,2 milions d'anys."],
   ["Quina espècie va ser la primera a fabricar eines de pedra?",["Australopitec","Homo habilis","Homo sapiens"],1,"«Habilis» vol dir hàbil: va ser el primer a fabricar eines de pedra."],
   ["Quina espècie talla bifaços i domina el foc?",["Homo erectus","Australopitec","Homo habilis"],0,"L'Homo erectus tenia el cervell més gran, tallava bifaços i dominava el foc."],
   ["Quina espècie va ser la primera a enterrar els morts?",["Homo erectus","Homo neanderthalensis","Homo habilis"],1,"Els neandertals van fer els primers enterraments (cap al 80.000 aC)."],
   ["Quina espècie s'escampa per tots els continents i crea el primer art?",["Homo sapiens","Homo erectus","Australopitec"],0,"L'Homo sapiens travessa el Sinaí, pobla tots els continents i crea l'art rupestre i mobiliari."],
   ["Quina frase sobre els humans i els ximpanzés és correcta?",["Venim directament dels ximpanzés actuals d'Àfrica","Tenim avantpassats comuns","No tenim cap parentiu biològic ni evolutiu"],1,"No venim del ximpanzé: humans i ximpanzés compartim avantpassats comuns."]
  ]},

 {id:"paleolitic",ic:"🔥",col:"#c2410c",titol:"El paleolític: caça i recol·lecció",font:"Secció 2 · Vida, eines, foc i creences",
  idea:"El paleolític ocupa el 99,5 % de la història humana: grups nòmades amb economia depredadora, eines de pedra tallada i societat igualitària.",
  pts:[
   "<b>Economia depredadora</b>: vivien de la <b>caça</b>, la <b>pesca</b> i la <b>recol·lecció</b> de fruits i arrels (agafaven de la natura sense produir).",
   "<b>Nòmades</b>: no tenien casa fixa; es movien seguint els ramats i el menjar. Vivien a l'aire lliure, en <b>coves i balmes</b> (refugis temporals) o cabanes de branques i pells.",
   "<b>Eines de més antiga a més nova</b>: còdols picats → <b>bifaços de sílex</b> (roca molt dura, tallada per les dues cares) → eines d'<b>os i banya</b> (agulles, punxons, hams, arpons, propulsors).",
   "<b>Societat igualitària</b>: tots feien feines semblants, sense rics ni pobres ni caps fixos.",
   "<b>El foc</b>: servia per <b>escalfar-se</b>, <b>coure menjar</b>, <b>il·luminar coves</b> i <b>espantar animals</b>.",
   "<b>Creences</b>: els neandertals enterren els morts amb <b>aixovar funerari</b> (objectes i eines), cosa que mostra que creien en una vida després de la mort.",
   "<b>A prop de casa</b>: l'<b>Abric Romaní de Capellades (Anoia)</b>, un campament neandertal amb molts fogars superposats i motlles d'eines de fusta al travertí."
  ],
  truc:"Les 3 N del paleolític: Natura, Nòmades i Ningú no manava.",
  compte:"Les coves del paleolític NO eren cases fixes per a tota la vida, sinó refugis temporals perquè els grups eren nòmades!",
  fc:[
   ["Quin percentatge de la història humana ocupa el paleolític?","El 99,5 % (fins cap al 9.000–8.000 aC)."],
   ["Què és l'economia depredadora?","Viure de la caça, la pesca i la recol·lecció, agafant de la natura sense produir."],
   ["Per què eren nòmades?","Perquè es desplaçaven seguint la caça i els aliments disponibles."],
   ["Què és un bifaç?","Una eina de sílex tallada per les dues cares."],
   ["Per a què servia el foc?","Escalfar-se, coure menjar, il·luminar coves i espantar animals."],
   ["Com era la societat paleolítica?","Igualitària: sense rics ni pobres."],
   ["Què demostra l'aixovar funerari dels enterraments?","Que creien en una vida després de la mort."]
  ],
  q:[
   ["Quin percentatge de tota la història humana ocupa el paleolític?",["Un 10 %","Un 50 %","Un 99,5 %"],2,"El paleolític dura milions d'anys: el 99,5 % de la història de la humanitat."],
   ["Què vol dir que l'economia del paleolític era depredadora?",["Que conreaven blat, ordi i criaven ovelles en ramats","Caça, pesca i recol·lecció","Que comerciaven amb metalls i ceràmica entre poblats"],1,"Depredadora vol dir obtenir menjar directament de la natura sense produir-lo."],
   ["Com vivien les persones del paleolític?",["En ciutats emmurallades amb torres de pedra","Nòmades en refugis temporals","En cases fixes de pedra polida prop dels camps"],1,"Com que eren nòmades, les coves i cabanes eren refugis temporals."],
   ["Quin és l'ordre d'evolució de les eines del paleolític, d'antiga a nova?",["Eines d'os i banya → bifaços → còdols picats","Còdols → bifaços → os i banya","Pedra polida → espases de bronze → sílex"],1,"Primer còdols picats, després bifaços de sílex i finalment eines fines d'os i banya."],
   ["Quina roca molt dura s'usava sobretot per tallar bifaços?",["El sílex","El guix","El talc"],0,"El sílex és una roca molt dura que en picar-la deixa arestes tallants."],
   ["Quina d'aquestes NO era una utilitat del foc al paleolític?",["Coure menjar i escalfar-se a la nit","Espantar animals i il·luminar coves","Fondre ferro en forns"],2,"Fondre metalls en forns d'alta temperatura no arriba fins a l'edat dels metalls."],
   ["Com era la societat al paleolític?",["Jerarquitzada amb guerrers, cabdills i reis","Igualitària","Dividida en artesans, comerciants i pagesos"],1,"Al paleolític ningú acumulava riqueses: la societat era igualitària."],
   ["Què col·locaven sovint els neandertals al costat dels morts?",["Un aixovar funerari","Monedes de bronze i collars d'or","Tauletes d'argila amb textos escrits"],0,"L'aixovar funerari indica creences en una vida després de la mort."],
   ["Què s'ha trobat a l'Abric Romaní de Capellades (Anoia)?",["Un dolmen megalític del final del neolític","Fogars i pedra tallada neandertals","Un poblat fortificat de l'edat del ferro"],1,"L'Abric Romaní és un jaciment neandertal famós pels seus fogars superposats i motlles de fusta."]
  ]},

 {id:"art",ic:"🎨",col:"#dc2626",titol:"L'art de les cavernes",font:"Secció 3 · Art rupestre i mobiliari",
  idea:"L'Homo sapiens crea el primer art (fa 35.000–30.000 anys): art rupestre a la roca i art mobiliari transportable, amb un sentit màgic i religiós.",
  pts:[
   "<b>Art rupestre</b>: pintures i gravats fets sobre <b>roca</b> (no es pot moure). Sentit <b>màgic i religiós</b>: demanar bona caça i fertilitat del grup.",
   "<b>Art mobiliari (o moble)</b>: objectes petits que es poden <b>transportar</b> (bastons foradats, arpons gravats, penjolls, <b>venus paleolítiques</b>).",
   "<b>Venus paleolítiques</b> (com la <b>Venus de Willendorf</b>, ~11 cm): figuretes femenines amb formes arrodonides que simbolitzaven la <b>fertilitat</b>.",
   "<b>Art franco-cantàbric</b>: interior de <b>coves profundes</b> · <b>animals sols</b> (bisons, cavalls, cérvols) sense escenes · <b>molt realista (naturalista) i policrom</b> (molts colors), aprofita el relleu de la roca. Ex.: <b>Altamira</b> (Cantàbria), El Castillo, Tito Bustillo, Santimamiñe.",
   "<b>Art llevantí (mediterrani)</b>: <b>abrics de roca a l'aire lliure</b> · <b>escenes</b> (caça, danses, recol·lecció, combats) amb <b>persones</b> · figures <b>estilitzades/esquemàtiques i monocromes</b> (1 sol color). Ex.: <b>El Cogul</b> (Lleida), <b>Ulldecona</b> (Montsià), Valltorta, Cova Remígia, Cova de l'Aranya."
  ],
  truc:"RUpestre = Roca · MObiliari = MÒbil. Cantàbric = Cova i Colors · Llevantí = aire Lliure, Línies i Lluita.",
  compte:"L'art cantàbric gairebé no pinta persones ni escenes; qui pinta persones fent caça o danses és l'art llevantí!",
  fc:[
   ["Quina espècie fa les primeres obres d'art?","L'Homo sapiens (fa 35.000–30.000 anys, paleolític superior)."],
   ["Diferència entre art rupestre i art mobiliari?","Rupestre = sobre roca (no es mou). Mobiliari = petit i transportable."],
   ["Què simbolitzaven les venus paleolítiques?","La fertilitat (ex.: Venus de Willendorf)."],
   ["Quin sentit tenia l'art de les cavernes?","Màgic i religiós (demanar bona caça i fertilitat)."],
   ["Com és l'art franco-cantàbric?","Coves profundes, animals sols, realista i policrom (ex.: Altamira)."],
   ["Com és l'art llevantí?","Abrics a l'aire lliure, escenes amb persones, esquemàtic i monocrom (ex.: El Cogul, Ulldecona)."]
  ],
  q:[
   ["Quina diferència hi ha entre l'art rupestre i l'art mobiliari?",["Rupestre: roca; mobiliari: mòbil","El rupestre era de ferro fos i el mobiliari de fang cuit","No hi ha cap diferència entre un estil i l'altre"],0,"RUpestre = Roca (fix); MObiliari = MÒbil (transportable)."],
   ["Quin era el sentit principal de les pintures prehistòriques?",["Decorar les habitacions dels poblats sedentaris","Màgic i religiós","Explicar notícies als veïns de les altres tribus"],1,"Pintaven animals i escenes amb una finalitat màgica i religiosa."],
   ["Què simbolitzava la Venus de Willendorf?",["La fertilitat","El poder d'un rei guerrer","La força del ferro i el bronze"],0,"Les venus paleolítiques eren figuretes d'art mobiliari vinculades a la fertilitat."],
   ["On es troben les pintures de l'art franco-cantàbric?",["En abrics de roca a l'aire lliure","En coves profundes","Sobre urnes de ceràmica cardial"],1,"Cantàbric = Cova profunda (com Altamira)."],
   ["Què representa sobretot l'art franco-cantàbric?",["Escenes de dansa i caça amb moltes persones","Animals sols","Poblats fortificats i camps de blat"],1,"L'art cantàbric pinta animals aïllats, molt realistes i aprofitant el relleu."],
   ["Quants colors fa servir normalment l'art llevantí?",["És monocrom","És policrom (molts colors barrejats)","Només fa servir pigments metàl·lics"],0,"L'art llevantí és monocrom (sovint vermell o negre) i molt esquemàtic."],
   ["Quin d'aquests jaciments és d'art franco-cantàbric?",["La Roca dels Moros del Cogul (Lleida)","Altamira (Cantàbria)","Els Abrics de l'Ermita d'Ulldecona"],1,"Altamira és el gran exemple d'art franco-cantàbric; El Cogul i Ulldecona són llevantins."],
   ["Què hi veiem a les pintures de l'art llevantí?",["Escenes amb persones","Només bisons grossos pintats sense persones","Només mans en negatiu al sostre de la cova"],0,"L'art llevantí mostra escenes narratives plenes de moviment amb figures humanes."],
   ["Un penjoll d'os gravat que es pot portar al coll és un exemple de…",["art rupestre","art mobiliari","megalitisme"],1,"Tot objecte artístic petit i transportable és art mobiliari (o moble)."]
  ]},

 {id:"neolitic",ic:"🌾",col:"#15803d",titol:"El neolític: producció d'aliments",font:"Secció 4 · Revolució neolítica i megàlits",
  idea:"Amb la revolució neolítica (fa ~10.000 anys al Creixent Fèrtil), els humans passen d'una economia depredadora a una economia productora i es fan sedentaris.",
  pts:[
   "<b>On i per què neix</b>: al <b>Creixent Fèrtil</b> (Orient Pròxim: rius Tigris, Eufrates i Nil), després de l'última glaciació (clima més càlid, menys caça grossa). També neix de manera independent a l'Indus, Huang He, Mesoamèrica i els Andes.",
   "<b>Economia productora</b>: <b>agricultura</b> (blat, ordi) i <b>ramaderia</b> (cabres, ovelles, bous). Al llibre: 10.000 aC primers poblats · 9.000 aC ramaderia · 8.000 aC agricultura · 7.000 aC ceràmica i teixits.",
   "<b>Canvis en cadena</b>: agricultura i ramaderia → <b>sedentaris</b> (poblats estables amb cabanes de <b>fusta i tova</b>) → <b>excedents</b> (sobra gra) → <b>divisió del treball</b> (oficis) i <b>bescanvi</b> (comerç).",
   "<b>Tècniques noves</b>: <b>pedra polida</b> (aixades, falçs, molins de mà), <b>ceràmica</b> (ex.: <b>ceràmica cardial</b> decorada amb closca d'escopinya) i cistelleria, <b>fus i teler</b> (teixits de llana i lli).",
   "<b>Creences i megalitisme</b>: culte a la fertilitat (<b>deesses mare</b>) i al final del neolític apareixen els <b>megàlits</b> (construccions amb pedres enormes): <b>menhir</b> (pedra dreta), <b>dolmen</b> (cambra funerària amb llosa) i <b>cromlec</b> (cercle de menhirs)."
  ],
  truc:"Les 3 S del neolític: Sembrar, Sedentaris i Sobra menjar (excedents).",
  compte:"Al neolític NO hi havia diners ni monedes: comerciaven amb el bescanvi (canviar un producte per un altre).",
  fc:[
   ["Què és la revolució neolítica?","El pas d'economia depredadora a productora (agricultura i ramaderia)."],
   ["On va néixer el neolític?","Al Creixent Fèrtil (Orient Pròxim: Tigris, Eufrates i Nil)."],
   ["Què vol dir ser sedentari?","Viure sempre al mateix poblat, sense traslladar-se."],
   ["Què són els excedents?","Els aliments que sobren i es guarden, permetent oficis i bescanvi."],
   ["Quines 3 tècniques noves apareixen al neolític?","Pedra polida, ceràmica (i cistelleria) i teixits (fus i teler)."],
   ["Què són un menhir, un dolmen i un cromlec?","Menhir = pedra dreta · Dolmen = cambra coberta amb llosa · Cromlec = cercle de menhirs."]
  ],
  q:[
   ["Quin gran canvi defineix la revolució neolítica?",["La descoberta del foc i la talla de bifaços","El pas a economia productora","La invenció de l'escriptura a Mesopotàmia"],1,"Al neolític els humans comencen a produir el seu propi aliment."],
   ["En quina regió va néixer primer el neolític?",["Al Creixent Fèrtil","A la vall del Rift (Àfrica oriental)","A les planes fredes del nord d'Europa"],0,"El Creixent Fèrtil, entre els rius Tigris, Eufrates i Nil, és el bressol del neolític."],
   ["Per què es fan sedentaris els grups humans del neolític?",["Per cuidar camps i bestiar","Perquè ja construïen grans muralles de ferro","Perquè s'havien acabat les coves naturals"],0,"Conrear camps i cuidar ramats obliga a quedar-se en poblats estables."],
   ["De què estaven fetes sovint les cabanes dels poblats neolítics?",["De fusta i tova","De maons de ferro fos en forns","De grans blocs de marbre polit"],0,"Construïen cabanes estables de fusta, canyes i tova."],
   ["Què va permetre l'aparició d'oficis (divisió del treball) i el bescanvi?",["Els excedents d'aliments","La invenció de les primeres monedes d'or","Les pintures rupestres de les coves"],0,"Com que sobrava menjar (excedents), no tothom havia de conrear i van sorgir artesans i el bescanvi."],
   ["Com treballaven la pedra al neolític?",["Pedra polida","Pedra fosa en forns d'alta temperatura","Només còdols de riu sense treballar"],0,"Neolític vol dir «pedra nova»: la polien per fer aixades, falçs i destrals."],
   ["Amb què es decorava la ceràmica cardial?",["Amb pintura policroma d'òxids minerals","Amb closca d'escopinya","Amb fils d'or i plata incrustats"],1,"Prement la closca d'una escopinya sobre el fang tou feien dibuixos característics."],
   ["Per a què servien el fus i el teler del neolític?",["Per fondre coure i estany en motlles","Per fer teixits de llana i lli","Per arrossegar pedres enormes de dòlmens"],1,"El fus filava i el teler teixia roba de llana i lli."],
   ["Quin megàlit és una cambra funerària coberta amb una gran llosa?",["Un menhir","Un dolmen","Un cromlec"],1,"Menhir = pedra dreta · Dolmen = cambra funerària («taula») · Cromlec = cercle."]
  ]},

 {id:"metalls",ic:"⚔️",col:"#b91c1c",titol:"L'edat dels metalls",font:"Secció 5 · Metal·lúrgia, invents i jerarquia",
  idea:"Cap al 4.000 aC neix la metal·lúrgia (coure, bronze i ferro). Amb la roda, la vela i els excedents neixen les ciutats emmurallades i la societat jerarquitzada.",
  pts:[
   "<b>Metal·lúrgia</b>: escalfar el mineral en <b>forns d'alta temperatura</b> → abocar el metall fos en un <b>motlle</b> → obtenir eines o armes resistents.",
   "<b>① Edat del Coure (calcolític)</b>: primer metall, <b>tou i es deforma</b>; sobretot joies i ornaments (ex.: <b>Ötzi</b> als Alps, fa 5.300 anys, duia una destral de coure).",
   "<b>② Edat del Bronze (~3.000 aC)</b>: <b>aliatge</b> (barreja) de <b>coure + estany</b>; molt més dur, substitueix la pedra (espases, punyals, llances).",
   "<b>③ Edat del Ferro</b>: <b>més dur i més abundant</b> que el bronze; armes i reixes de l'arada.",
   "<b>Invents clau</b>: la <b>roda</b> (carros), la <b>vela</b> (navegació) i els <b>canals de regadiu</b>.",
   "<b>Societat jerarquitzada (cadena)</b>: excedents → <b>propietat privada</b> (rics i pobres) → <b>guerrers</b> (ciutats amb muralles i torres) → <b>cabdill</b> (cap militar) → <b>rei</b> (poder hereditari). Oficis especialitzats: metal·lúrgics, orfebres, comerciants, ceramistes."
  ],
  truc:"Ordre dels metalls: C → B → F = «Comença Bé i acaba Fort» (Coure, Bronze, Ferro).",
  compte:"El bronze NO és un metall pur tret d'una mina: és un aliatge (barreja) de coure i estany!",
  fc:[
   ["Què és la metal·lúrgia?","La tècnica de fondre metalls en forns i donar-los forma amb motlles."],
   ["Ordre de les tres edats dels metalls?","Coure (calcolític) → Bronze → Ferro."],
   ["De què està fet el bronze?","És un aliatge de coure i estany."],
   ["Per què el ferro va superar el bronze?","Perquè és més dur i més abundant."],
   ["Quins 3 grans invents apareixen a l'edat dels metalls?","La roda, la vela i els canals de regadiu."],
   ["Com passa la societat d'igualitària a jerarquitzada?","Excedents → propietat privada → guerrers i muralles → cabdill → rei."]
  ],
  q:[
   ["Quin és l'ordre cronològic correcte de l'edat dels metalls?",["Ferro → Bronze → Coure","Coure → Bronze → Ferro","Bronze → Ferro → Coure"],1,"C → B → F: «Comença Bé i acaba Fort» (Coure, Bronze, Ferro)."],
   ["Per què el coure servia sobretot per a joies i ornaments?",["Perquè era tou i es deformava","Perquè no es podia fondre en cap mena de forn","Perquè era més dur i pesant que el ferro"],0,"El coure va ser el primer metall, però era massa tou per a moltes armes."],
   ["Què és el bronze?",["Un metall pur que es troba en blocs a la muntanya","Un aliatge de coure i estany","Una barreja de ferro i pedra polida"],1,"En barrejar coure i estany s'obté un aliatge molt més dur: el bronze."],
   ["Quins dos avantatges tenia el ferro respecte del bronze?",["Era més tou i molt més brillant per fer joies","Més dur i més abundant","Es fonia directament al sol sense necessitar forn"],1,"El ferro era més resistent i es trobava en més llocs que el bronze."],
   ["Qui era Ötzi, trobat congelat als Alps?",["Un home de l'edat del coure","Un rei guerrer de l'edat del ferro a Almeria","Un Australopitec trobat a l'Àfrica oriental"],0,"Ötzi va viure fa uns 5.300 anys i portava una destral de coure."],
   ["Quins invents van impulsar el comerç i el transport a l'edat dels metalls?",["El bifaç de sílex i el propulsor d'os","La roda i la vela","El teler vertical i la ceràmica cardial"],1,"La roda va permetre els carros i la vela va impulsar la navegació."],
   ["Per què es van construir muralles i torres al voltant de les ciutats?",["Per protegir riqueses i collites","Per evitar que entrés la pluja dins les cabanes","Per guardar-hi els ramats de mamuts"],0,"Les riqueses acumulades van generar conflictes i la necessitat de defensa i guerrers."],
   ["Com es diu el cap militar que acaba convertint el seu poder en hereditari (rei)?",["Arqueòleg","Cabdill","Recol·lector"],1,"Primer manava un cabdill militar, que sovint va acabar transformant-se en rei."],
   ["Com canvia la societat a l'edat dels metalls?",["Es torna completament igualitària sense caps","Es torna jerarquitzada","Torna a ser nòmada i depredadora"],1,"La propietat privada i l'especialització trenquen la igualtat i creen una jerarquia."]
  ]},

 {id:"peninsula",ic:"🗺️",col:"#0369a1",titol:"La prehistòria a la Península Ibèrica",font:"Secció 6 · Jaciments i pobles de la Península",
  idea:"La Península Ibèrica té alguns dels jaciments prehistòrics més importants d'Europa: d'Atapuerca i Altamira fins a Los Millares, El Argar i l'arribada de fenicis, grecs i celtes.",
  pts:[
   "<b>Paleolític inferior</b>: <b>Atapuerca (Burgos)</b> — <i>Homo antecessor</i>, els homínids més antics de la Península.",
   "<b>Paleolític mitjà</b>: <b>Gibraltar</b> i <b>El Sidrón (Astúries)</b> — restes de neandertals.",
   "<b>Paleolític superior</b>: <b>Altamira</b> i El Castillo (Cantàbria), Tito Bustillo (Astúries), Santimamiñe (País Basc) — art franco-cantàbric.",
   "<b>Epipaleolític i neolític</b>: <b>El Cogul</b> (Lleida), Valltorta i Cova Remígia (Castelló), Cova de l'Aranya (València) — art llevantí.",
   "<b>Neolític</b>: entra per la costa mediterrània (VI mil·lenni aC) amb <b>ceràmica cardial</b>. Megàlits a Galícia, País Basc, Extremadura, Catalunya i Andalusia.",
   "<b>Edat del Coure</b>: <b>Los Millares (Almeria)</b> (III mil·lenni aC). <b>Edat del Bronze</b>: <b>El Argar (Almeria)</b> (II mil·lenni aC).",
   "<b>Edat del Ferro (I mil·lenni aC)</b>: arriben pobles colonitzadors del Mediterrani (<b>fenicis, grecs, cartaginesos</b>) i <b>celtes</b> de Centreuropa."
  ],
  truc:"«El Argar fa Aliatges» (bronze = aliatge). I recorda els mil·lennis aC: III mil·lenni = 3.000–2.001 aC · II mil·lenni = 2.000–1.001 aC.",
  compte:"No confonguis Los Millares (Coure) amb El Argar (Bronze): tots dos són a Almeria, però Los Millares és anterior!",
  fc:[
   ["On s'han trobat els homínids més antics de la Península?","A Atapuerca (Burgos) — Homo antecessor."],
   ["Dos jaciments neandertals de la Península?","Gibraltar i El Sidrón (Astúries)."],
   ["Quina cultura destaca a l'edat del coure peninsular?","Los Millares (Almeria, III mil·lenni aC)."],
   ["Quina cultura destaca a l'edat del bronze peninsular?","El Argar (Almeria, II mil·lenni aC)."],
   ["Quins pobles arriben a la Península a l'edat del ferro?","Fenicis, grecs i cartaginesos (Mediterrani) i celtes (Centreuropa)."],
   ["Quants anys són un mil·lenni?","1.000 anys (II mil·lenni aC = 2.000–1.001 aC)."]
  ],
  q:[
   ["On s'han trobat els homínids més antics de la Península Ibèrica (Homo antecessor)?",["A Atapuerca (Burgos)","A Los Millares (Almeria)","A Altamira (Cantàbria)"],0,"Atapuerca (Burgos) conserva les restes d'Homo antecessor del paleolític inferior."],
   ["A quina etapa corresponen Gibraltar i El Sidrón (Astúries)?",["Paleolític mitjà (neandertals)","Edat del bronze","Neolític"],0,"Són jaciments destacats de neandertals del paleolític mitjà."],
   ["On va entrar primer el neolític a la Península Ibèrica?",["Per la costa mediterrània (VI mil·lenni aC)","Pel mar Cantàbric","Pels Pirineus occidentals"],0,"El neolític arriba per mar des de l'Orient Pròxim cap a la costa mediterrània."],
   ["Quin jaciment d'Almeria representa l'edat del coure?",["Los Millares","El Argar","Atapuerca"],0,"Los Millares (Almeria) és del III mil·lenni aC, edat del coure."],
   ["Quina cultura d'Almeria correspon a l'edat del bronze?",["Los Millares","El Argar","Cova de l'Aranya"],1,"Truc: «El Argar fa Aliatges» (bronze, II mil·lenni aC)."],
   ["Quins pobles arriben a la Península a l'edat del ferro (I mil·lenni aC)?",["Només els romans","Fenicis, grecs, cartaginesos i celtes","Només els neandertals"],1,"Arriben colonitzadors mediterranis (fenicis, grecs, cartaginesos) i celtes de Centreuropa."],
   ["Quin d'aquests jaciments és d'art llevantí al País Valencià?",["Cova de l'Aranya i Valltorta","Tito Bustillo i Santimamiñe","Atapuerca"],0,"Valltorta, Cova Remígia (Castelló) i Cova de l'Aranya (València) són d'art llevantí."],
   ["Quins anys comprèn el II mil·lenni aC?",["Del 200 al 101 aC","Del 2.000 al 1.001 aC","Del 3.000 al 2.001 aC"],1,"Un mil·lenni són 1.000 anys: el II mil·lenni aC va del 2.000 al 1.001 aC."]
  ]},

 {id:"catalunya",ic:"🏔️",col:"#0f766e",titol:"La prehistòria a Catalunya",font:"Secció 7 · Jaciments i cultures de Catalunya",
  idea:"Catalunya està poblada des de fa ~1 milió d'anys i conserva restes de totes les etapes: de les mandíbules de Banyoles i l'Abric Romaní fins a Gavà, el Cogul i els Vilars d'Arbeca.",
  pts:[
   "<b>Paleolític</b>: restes humanes més antigues (neandertals): <b>mandíbula de Banyoles</b> (Pla de l'Estany) i <b>mandíbula de Sitges</b> (Garraf). Assentaments: <b>Abric Romaní (Capellades, Anoia)</b> i <b>coves de Serinyà</b> (Pla de l'Estany). A la Catalunya Nord: <b>Cova de l'Aragó (Talteüll)</b> (~450.000 anys).",
   "<b>Art rupestre llevantí</b>: <b>Roca dels Moros del Cogul</b> (les Garrigues) i <b>Abrics de l'Ermita d'Ulldecona</b> (el Montsià).",
   "<b>Neolític</b>: <b>Bòbila Madurell</b> (Sant Quirze del Vallès — cabanes i necròpolis) i <b>mines de variscita de Gavà</b> (Can Tintorer, Baix Llobregat — mineral verd per fer collarets i penjolls).",
   "<b>Megàlits</b>: <b>Cova d'en Daina</b> (Romanyà de la Selva) i <b>dòlmens de l'Empordà</b>.",
   "<b>Edat del Bronze (~1.800 aC) i del Ferro</b>: arriben pobles indoeuropeus amb la <b>cultura dels camps d'urnes</b> (incineraven els morts i guardaven les cendres en urnes de ceràmica) i <b>poblats fortificats</b> en turons amb cases adossades fent de muralla, com <b>els Vilars d'Arbeca</b> (les Garrigues)."
  ],
  truc:"«Banyoles i Sitges mosseguen (mandíbules), el Cogul i Ulldecona pinten, Gavà excava, Capellades encén foc i Arbeca es defensa.»",
  compte:"La Cova d'en Daina no és una cova natural del paleolític: és un gran dolmen megalític!",
  fc:[
   ["Des de fa quant temps està poblada Catalunya?","Des de fa aproximadament 1 milió d'anys."],
   ["Quines són les restes humanes més antigues de Catalunya?","Les mandíbules neandertals de Banyoles i Sitges."],
   ["Quins dos jaciments catalans tenen art llevantí?","El Cogul (les Garrigues) i Ulldecona (el Montsià)."],
   ["Què s'extreia a les mines neolítiques de Gavà?","Variscita, un mineral verd per fer collarets i penjolls."],
   ["Què feia la cultura dels camps d'urnes?","Incinerava els morts i guardava les cendres en urnes de ceràmica."],
   ["Què és els Vilars d'Arbeca?","Un poblat fortificat de l'edat del ferro (les Garrigues)."]
  ],
  q:[
   ["Quines són les restes humanes més antigues trobades a Catalunya?",["Les mandíbules de Banyoles i Sitges","Les pintures d'Altamira","Els ossos d'Atapuerca"],0,"Truc: «Banyoles i Sitges mosseguen» — són mandíbules de neandertals."],
   ["A quina comarca és l'Abric Romaní de Capellades?",["Al Baix Llobregat","A l'Anoia","Al Montsià"],1,"L'Abric Romaní és a Capellades, a l'Anoia."],
   ["Quins dos llocs de Catalunya conserven art rupestre llevantí?",["El Cogul i Ulldecona","Gavà i Banyoles","Arbeca i Sitges"],0,"La Roca dels Moros del Cogul (les Garrigues) i els Abrics d'Ulldecona (el Montsià)."],
   ["Quin mineral verd s'extreia a les mines neolítiques de Gavà?",["El ferro","La variscita","El bronze"],1,"A les mines de Can Tintorer (Gavà) extreien variscita verda per a collarets i penjolls."],
   ["Què s'ha trobat a la Bòbila Madurell (Sant Quirze del Vallès)?",["Un poblat i necròpolis del neolític","Una cova d'art cantàbric","Una mina de coure"],0,"La Bòbila Madurell és un jaciment neolític molt important amb cabanes i sepultures."],
   ["Què és la Cova d'en Daina, a Romanyà de la Selva?",["Un dolmen megalític","Una cova amb bisons policroms","Un campament de l'Homo habilis"],0,"Malgrat el nom de «cova», la Cova d'en Daina és un gran dolmen."],
   ["En què consistia la cultura dels camps d'urnes?",["Enterraven els morts en dòlmens de pedra","Incineraven els morts i guardaven les cendres en urnes","Només pintaven parets de coves"],1,"Els pobles indoeuropeus van portar el costum d'incinerar els morts en urnes de ceràmica."],
   ["Quin jaciment de les Garrigues és un poblat fortificat de l'edat del ferro?",["Els Vilars d'Arbeca","L'Abric Romaní","Les coves de Serinyà"],0,"Truc: «Arbeca es defensa» — els Vilars d'Arbeca era un poblat fortificat."],
   ["On és la Cova de l'Aragó (~450.000 anys)?",["A Talteüll (Catalunya Nord)","A Almeria","A Burgos"],0,"La Cova de l'Aragó és a Talteüll, a la Catalunya Nord."]
  ]}
];

const OB=[
 {t:"La revolució neolítica",
  q:"Explica per què diem que el neolític va ser una «revolució». Esmenta com canvia la manera d'obtenir menjar, on viuen i dues conseqüències més.",
  p:["Pas d'economia depredadora (caça i recol·lecció) a productora (agricultura i ramaderia)","De nòmades a sedentaris (poblats estables de fusta i tova)","Apareixen excedents, divisió del treball (oficis) i bescanvi","Noves tècniques: pedra polida, ceràmica i teixits (fus i teler)"],
  m:"El neolític va ser una revolució perquè els humans van passar d'una economia depredadora (caçar i recol·lectar) a una economia productora basada en l'agricultura i la ramaderia. Com que havien de cuidar els camps i el bestiar, van deixar de ser nòmades i es van fer sedentaris en poblats estables. A més, van produir excedents de menjar, fet que va permetre la divisió del treball en oficis, el bescanvi i tècniques noves com la pedra polida, la ceràmica i els teixits."},
 {t:"De societat igualitària a jerarquitzada",
  q:"Explica com passa la societat humana de ser igualitària al paleolític a ser jerarquitzada a l'edat dels metalls.",
  p:["Al paleolític era igualitària: sense rics ni pobres ni propietat privada","Al neolític els excedents porten oficis i bescanvi","A l'edat dels metalls apareix la propietat privada (riqueses i desigualtats)","Sorgeixen guerrers, ciutats emmurallades, cabdills i reis amb poder hereditari"],
  m:"Al paleolític la societat era igualitària perquè tothom feia feines semblants i no s'acumulaven riqueses. Al neolític, amb l'agricultura, van aparèixer els excedents i els primers oficis. A l'edat dels metalls, l'acumulació de riqueses i metalls va crear la propietat privada, amb rics i pobres. Per protegir les collites i les ciutats emmurallades van sorgir els guerrers i els caps militars o cabdills, que sovint van acabar convertint-se en reis amb poder hereditari."},
 {t:"L'hominització",
  q:"Què és l'hominització, on comença i quins quatre grans canvis van transformar els primers primats fins a l'Homo sapiens?",
  p:["Procés d'evolució que comença a l'Àfrica oriental (vall del Rift) fa uns 6 milions d'anys","Bipedisme: caminar dret i deixar les mans lliures","Cervell més gran (més capacitat cranial) i pinça als dits (polze i índex)","Desenvolupament del llenguatge gràcies als canvis a la laringe"],
  m:"L'hominització és el llarg procés d'evolució que va començar fa uns 6 milions d'anys a la vall del Rift (Àfrica oriental) fins a arribar a l'Homo sapiens. Els quatre canvis clau van ser el bipedisme (caminar dret i tenir les mans lliures), l'augment de la mida del cervell, la pinça entre el polze i l'índex per fabricar eines i el desenvolupament del llenguatge gràcies als canvis a la laringe."},
 {t:"Art cantàbric i art llevantí",
  q:"Compara l'art rupestre franco-cantàbric i l'art llevantí: on es pintaven, què representaven, com eren les figures i posa un exemple de cada estil.",
  p:["Cantàbric: interior de coves profundes · Llevantí: abrics a l'aire lliure","Cantàbric: animals sols (bisons, cavalls) · Llevantí: escenes (caça, danses) amb persones","Cantàbric: realista i policrom · Llevantí: esquemàtic/estilitzat i monocrom","Exemples: Altamira (cantàbric) i El Cogul o Ulldecona (llevantí)"],
  m:"L'art franco-cantàbric es pintava a l'interior de coves profundes, representava animals sols com bisons o cavalls, i era molt realista i policrom (per exemple, Altamira). En canvi, l'art llevantí es feia en abrics de roca a l'aire lliure, mostrava escenes de caça, danses o combats amb persones, i tenia figures esquemàtiques d'un sol color o monocromes (com el Cogul o Ulldecona)."},
 {t:"Les tres etapes dels metalls",
  q:"Explica en ordre les tres etapes de l'edat dels metalls, quines característiques tenia cada metall i dos invents importants d'aquesta època.",
  p:["Coure (calcolític): primer metall, tou i es deforma, sobretot joies","Bronze: aliatge de coure i estany, més dur, substitueix la pedra","Ferro: més dur i més abundant, armes i reixes de l'arada","Invents clau: la roda, la vela i els canals de regadiu"],
  m:"L'edat dels metalls té tres etapes. Primer, el coure, que era tou i es deformava fàcilment, per això s'usava sobretot per a joies. Després, el bronze, un aliatge de coure i estany molt més dur que va substituir la pedra en armes i eines. Finalment, el ferro, encara més dur i abundant, ideal per a armes i reixes de l'arada. En aquesta època també s'inventen la roda, la vela i els canals de regadiu."},
 {t:"La prehistòria a Catalunya",
  q:"Cita i explica breument quatre jaciments prehistòrics importants de Catalunya de diferents etapes.",
  p:["Paleolític: mandíbules neandertals de Banyoles i Sitges, o Abric Romaní de Capellades","Art llevantí: Roca dels Moros del Cogul o Abrics d'Ulldecona","Neolític i megàlits: mines de variscita de Gavà, Bòbila Madurell o dolmen de la Cova d'en Daina","Metalls: cultura dels camps d'urnes i poblat fortificat dels Vilars d'Arbeca"],
  m:"A Catalunya tenim restes de totes les etapes: del paleolític destaquen les mandíbules neandertals de Banyoles i Sitges i el campament de l'Abric Romaní de Capellades. De l'art llevantí sobresurten el Cogul i Ulldecona. Al neolític trobem les mines de variscita de Gavà i el dolmen de la Cova d'en Daina. Finalment, a l'edat del ferro destaca el poblat fortificat dels Vilars d'Arbeca i la cultura dels camps d'urnes."}
];

// ---- figures (SVG generats per funció) ----
function svgMegalits(){
 let s=`<svg viewBox="0 0 480 220" width="100%" style="max-width:480px" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,Arial">`;
 // cel i terra
 s+=`<rect x="0" y="0" width="480" height="164" fill="#fef3c7" rx="10"/><rect x="0" y="160" width="480" height="60" fill="#a16207" rx="0"/>`;
 // 1 · Menhir
 s+=`<path d="M68 164 L73 56 Q80 44 88 56 L94 164 Z" fill="#78716c" stroke="#292524" stroke-width="2.5"/>`;
 s+=`<path d="M76 74 L84 96 M74 120 L86 132" stroke="#57534e" stroke-width="1.5" stroke-linecap="round"/>`;
 // 2 · Dolmen
 s+=`<rect x="192" y="96" width="22" height="68" rx="4" fill="#78716c" stroke="#292524" stroke-width="2.5"/>`;
 s+=`<rect x="266" y="96" width="22" height="68" rx="4" fill="#78716c" stroke="#292524" stroke-width="2.5"/>`;
 s+=`<rect x="226" y="106" width="28" height="56" rx="3" fill="#57534e" stroke="#292524" stroke-width="2"/>`;
 s+=`<path d="M174 96 Q240 68 306 96 L300 106 L180 106 Z" fill="#a8a29e" stroke="#292524" stroke-width="2.5"/>`;
 // 3 · Cromlec (cercle en perspectiva)
 s+=`<ellipse cx="398" cy="146" rx="56" ry="20" fill="none" stroke="#78350f" stroke-width="2" stroke-dasharray="5,4"/>`;
 [[352,138,10,24],[372,126,10,24],[398,122,10,26],[424,126,10,24],[442,138,10,24],[426,154,11,28],[398,158,11,28],[368,154,11,28]].forEach(([x,y,w,h])=>{
  s+=`<rect x="${x-w/2}" y="${y-h}" width="${w}" height="${h}" rx="3" fill="#78716c" stroke="#292524" stroke-width="2"/>`;
 });
 // números
 [[80,192,"1"],[240,192,"2"],[398,192,"3"]].forEach(([x,y,n])=>{
  s+=`<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="#1c1917" stroke-width="2.5"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" font-weight="900" fill="#1c1917">${n}</text>`;
 });
 s+=`</svg>`;
 return s;
}

function svgEstrats(){
 let s=`<svg viewBox="0 0 480 250" width="100%" style="max-width:480px" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,Arial">`;
 // superfície verda
 s+=`<rect x="16" y="10" width="448" height="22" rx="6" fill="#4ade80" stroke="#166534" stroke-width="2"/>`;
 s+=`<text x="240" y="25" text-anchor="middle" font-size="11" font-weight="800" fill="#14532d">🌿 SUPERFÍCIE ACTUAL</text>`;
 const capes=[
  {y:36,h:48,col:"#fed7aa",brd:"#c2410c",l:"A",txt:"Espases de bronze, urnes de ceràmica i rodes"},
  {y:88,h:48,col:"#fde68a",brd:"#b45309",l:"B",txt:"Ceràmica cardial, falçs de pedra polida i grans de blat"},
  {y:140,h:48,col:"#d6d3d1",brd:"#57534e",l:"C",txt:"Agulles d'os, arpons i figuretes d'art mobiliari"},
  {y:192,h:48,col:"#a8a29e",brd:"#292524",l:"D",txt:"Bifaços de sílex, còdols tallats i restes de fogars"}
 ];
 capes.forEach(c=>{
  s+=`<rect x="16" y="${c.y}" width="448" height="${c.h}" rx="6" fill="${c.col}" stroke="${c.brd}" stroke-width="2"/>`;
  s+=`<circle cx="44" cy="${c.y+24}" r="14" fill="#fff" stroke="#1c1917" stroke-width="2.2"/><text x="44" y="${c.y+29}" text-anchor="middle" font-size="15" font-weight="900" fill="#1c1917">${c.l}</text>`;
  s+=`<text x="72" y="${c.y+29}" font-size="13" font-weight="800" fill="#1c1917">${c.txt}</text>`;
 });
 s+=`</svg>`;
 return s;
}

// 👾 Boss del món (Bona Nota 2.0): monstre i melodia propis
ASSIG.boss={nom:"El Mamut de Pedra",fx:"explosio",ic:"🪨",rotul:"PREHISTÒRIA SUPERADA!",em:["🔥","🪨","🦴","✨"],
 pix:[
  "....KKKKKKKK....",
  "..KKDDDDDDDDKK..",
  ".KDDGGGGGGGGDDK.",
  ".KDGWKGDDGKWGDK.",
  "KDDGKKGDDGKKGDDK",
  "KDDGGGGDDGGGGDDK",
  "KDDGGGDKKDGGGDDK",
  "KWWGGGDKKDGGGWWK",
  "KWWKGGDKKDGGKWWK",
  ".KWWKKDKKDKKWWK.",
  "..KWWKDKKDKWWK..",
  "...KK.DKKD.KK...",
  "...KGGDKKDGGK...",
  "...KGGK..KGGK...",
  "...KDDK..KDDK...",
  "...KKKK..KKKK..."
 ],
 bpm:114,timbre:"metall",notes:"D3:1 D3:1 F3:1 D3:1 A3:2 G3:1 F3:1 D4:1 F4:1 A4:2 G4:1 F4:1 D5:4"};
