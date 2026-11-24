// Bona Nota · Estudi interactiu · dades de SOCIALS 1r ESO
// Font: llibre de Socials (tema 3, Vicens Vives) + apunts-geografia-anoia.md
const ASSIG={
 id:"socials", clau:"bn_soc", nom:"Socials", tema:"Tema 3: El clima", curs:"1r ESO", ic:"🌍",
 color:["#1e3a8a","#2563eb","#0ea5e9"],
 peu:"Bona Nota · Llibre de Socials (tema 3, Vicens Vives) i apunts de geografia de l'Anoia",
 visual:{
  world:"clima",
  src:"../../visuals/clima.html",
  total:6,
  rewardStars:10,
  icona:"🧪",
  titol:"🧪 Laboratori Visual · 6 fitxes interactives",
  subtitol:"Climograma, capes de l'atmosfera, factors LAD, pressió, mapes del temps i efecte d'hivernacle",
  modalTitol:"Laboratori Visual · El Clima",
  botoJoc:"🧪 Obre laboratori visual",
  temes:{temps:1,atmos:2,elements:3,pressio:4,mapes:5,canvi:6,climaig:1},
  jocs:{classifica:1,climo:1,"fx-climo":1,"cl-construeix":1,"cl-compara":1,"err-clima":1,capes:2,"fr-atmos":2,"fr-elements":3,parelles:3,"fr-pressio":4,"mapa-temps1":5,"mapa-temps2":5,"mapa-temps3":5,"mapa-temps4":5,"mapa-temps5":5,"fr-canvi":6}
 },
 blocs:[{titol:"📖 Temes del llibre",n:6},{titol:"🏔️ Apunts de l'Anoia",n:4}],
 jocs:[
  {id:"fr-atmos",grup:"✍️ Frases amb buits",tipus:"frases",ic:"🧅",titol:"Temps, clima i atmosfera",sub:"Capes, gasos i funcions",col:"#f3e8ff",
   enunciat:"✍️ Completa les frases sobre el temps, el clima i l'atmosfera",
   items:[
    {f:"Si avui plou a Igualada, parlem del ___; si hi plou poc cada any, parlem del ___.",ok:["temps","clima"],no:["relleu","paisatge"],per:{"relleu":"El relleu són les formes del terreny.","paisatge":"El paisatge és el que veiem del territori."},clau:["avui","cada any"],pista:"Un dia concret o molts anys?",ex:"Temps = un moment concret. Clima = el que passa normalment durant uns 30 anys."},
    {f:"Per parlar de clima cal mirar el que passa durant uns ___ anys.",ok:"30",no:["3","300"],per:{"3":"Tres anys són massa pocs: un any rar no fa clima.","300":"Es fan servir uns 30 anys de dades."},pista:"Tres dècades.",ex:"El clima es calcula amb uns <b>30 anys</b> de dades."},
    {f:"La ciència que estudia el temps de cada dia és la ___.",r:["meteorologia"],per:{"climatologia":"La climatologia estudia el clima, no el temps de cada dia."},pista:"A Catalunya hi ha el Meteocat.",ex:"<b>Meteorologia</b> → temps · climatologia → clima."},
    {f:"Els núvols, la pluja i el vent passen a la ___, la capa de baix.",ok:"troposfera",no:["estratosfera","termosfera"],per:{"estratosfera":"L'estratosfera és la de la capa d'ozó, per sobre dels núvols.","termosfera":"La termosfera és molt amunt: aurores i satèl·lits."},clau:"de baix",pista:"És la capa on vivim, de 0 a 12 km.",ex:"Tot el temps meteorològic passa a la <b>troposfera</b> (0-12 km)."},
    {f:"La capa d'ozó és a l'___ i filtra els raigs ultraviolats.",ok:"estratosfera",no:["troposfera","exosfera"],per:{"troposfera":"La troposfera és on hi ha els núvols; l'ozó és més amunt.","exosfera":"L'exosfera és la frontera amb l'espai."},pista:"És la segona capa, fins a 50 km.",ex:"L'<b>estratosfera</b> té la capa d'ozó, que filtra els raigs ultraviolats."},
    {f:"Els estels fugaços són meteorits que es desintegren a la ___.",ok:"mesosfera",no:["troposfera","exosfera"],per:{"troposfera":"A la troposfera hi ha els núvols; els meteorits es cremen abans d'arribar-hi.","exosfera":"L'exosfera és massa amunt."},pista:"La tercera capa, de 50 a 80 km.",ex:"A la <b>mesosfera</b> es cremen els meteorits: són els estels fugaços."},
    {f:"L'aire és sobretot ___ (78 %) i oxigen (21 %).",ok:"nitrogen",no:["diòxid de carboni","ozó"],per:{"diòxid de carboni":"El CO₂ hi és en molt poca quantitat.","ozó":"L'ozó és només una capa prima de l'estratosfera."},pista:"No és l'oxigen: n'hi ha encara més.",ex:"L'aire: <b>78 % nitrogen</b> i 21 % oxigen."},
    {f:"Una pedra de l'espai que es crema a l'aire és un ___; si arriba a terra, és un ___.",ok:["meteor","meteorit"],no:["satèl·lit","planeta"],per:{"satèl·lit":"Un satèl·lit gira al voltant d'un planeta.","planeta":"Un planeta és molt més gran i no cau."},pista:"Mira el compte de la fitxa.",ex:"<b>Meteor</b> = es crema a l'aire · <b>meteorit</b> = arriba a terra."},
    {mots:"L'atmosfera ens protegeix dels meteorits.",no:["escalfa"],pista:"És una de les tres funcions de l'atmosfera.",ex:"Les 3 funcions: regula la temperatura, protegeix dels meteorits i filtra les radiacions."},
    {f:"El gràfic amb les barres de pluja i la línia de temperatura és un ___.",r:["climograma"],pista:"Comença per «clima…».",ex:"El <b>climograma</b>: barres blaves (mm) i línia vermella (°C)."}
   ],
   final:"Capes de baix a dalt: «Tots Els Matins Torro Entrepans». I tot el temps passa a la troposfera."},
  {id:"fr-elements",grup:"✍️ Frases amb buits",tipus:"frases",ic:"🌡️",titol:"Elements i factors del clima",sub:"LAD: latitud, altitud i distància al mar",col:"#ffedd5",
   enunciat:"✍️ Completa les frases dels elements i els factors del clima",
   items:[
    {f:"La pluja es mesura amb el ___ i la temperatura, amb el ___.",ok:["pluviòmetre","termòmetre"],no:["baròmetre","penell"],per:{"baròmetre":"El baròmetre mesura la pressió.","penell":"El penell indica d'on ve el vent."},pista:"Pluvi- és pluja; termo- és calor.",ex:"<b>Pluviòmetre</b> → pluja (mm) · <b>termòmetre</b> → temperatura (°C)."},
    {f:"La humitat es mesura amb l'___ i es dona en %.",ok:"higròmetre",no:["anemòmetre","baròmetre"],per:{"anemòmetre":"L'anemòmetre mesura la velocitat del vent.","baròmetre":"El baròmetre mesura la pressió."},pista:"Higro- vol dir humitat.",ex:"<b>Higròmetre</b> → humitat (%)."},
    {f:"1 mm de pluja és el mateix que 1 ___.",ok:"L/m²",no:["cm","km/h"],per:{"cm":"Un centímetre són 10 mm.","km/h":"Els km/h són per a la velocitat del vent."},pista:"Mira el compte de la fitxa.",ex:"1 mm de pluja = <b>1 litre per metre quadrat</b>."},
    {f:"Si pugem 1 000 m, la temperatura baixa uns ___ °C.",ok:"6",no:["1","20"],per:{"1":"És molt més: «pujo mil, perdo sis».","20":"És menys: uns 6 °C."},clau:"1 000 m",pista:"«Pujo mil, perdo…»",ex:"«<b>Pujo mil, perdo sis</b>»: uns 6 °C menys cada 1 000 m."},
    {f:"Com més a prop de l'equador, ___ calor fa: és el factor ___.",ok:["més","latitud"],no:["menys","altitud"],per:{"menys":"Al revés: a l'equador els raigs del sol arriben més drets i fa més calor.","altitud":"L'altitud és l'alçada; la distància a l'equador és la latitud."},clau:"equador",pista:"La distància a l'equador es diu…",ex:"<b>Latitud</b>: com més a prop de l'equador, <b>més</b> calor."},
    {f:"A la costa les temperatures són ___; a l'interior hi ha més contrast entre l'hivern i l'estiu.",ok:"suaus",no:["extremes","glaçades"],per:{"extremes":"El mar suavitza: les temperatures extremes són de l'interior.","glaçades":"Les glaçades són més de l'interior, com a Igualada."},clau:"costa",pista:"El mar fa de radiador.",ex:"Distància al mar: a la costa, temperatures <b>suaus</b>."},
    {f:"El camí de l'aigua: el sol escalfa, l'aigua s'___, es condensa en núvols i cau en forma de precipitació.",ok:"evapora",no:["congela","filtra"],per:{"congela":"Primer l'aigua ha de pujar a l'aire: s'evapora.","filtra":"Filtrar-se és entrar a terra, no pujar."},pista:"Passa de líquid a vapor.",ex:"Evaporació → condensació → precipitació."},
    {f:"La Terra té ___ zones climàtiques: 1 càlida, 2 temperades i 2 fredes.",ok:"5",no:["3","4"],per:{"3":"Les temperades i les fredes són dues de cada: 1 + 2 + 2.","4":"Compta-les: 1 càlida + 2 temperades + 2 fredes."},pista:"Com un entrepà: pa-formatge-pernil-formatge-pa.",ex:"<b>5 zones</b>: 1 càlida, 2 temperades i 2 fredes."},
    {mots:"Els factors del clima són latitud, altitud i distància al mar.",no:["pluja"],pista:"El truc LAD.",ex:"Factors = <b>LAD</b> (Latitud, Altitud, Distància al mar)."},
    {f:"La temperatura, la precipitació, la humitat, la pressió i el vent són ___ del clima.",ok:"elements",no:["factors","capes"],per:{"factors":"Els factors són els que canvien el clima (LAD).","capes":"Les capes són de l'atmosfera."},pista:"Són les peces que formen el clima.",ex:"5 <b>elements</b> formen el clima; 3 factors el canvien."}
   ],
   final:"Elements = les peces del clima. Factors = LAD, els que el canvien."},
  {id:"fr-pressio",grup:"✍️ Frases amb buits",tipus:"frases",ic:"🌀",titol:"Pressió, vent i mapes del temps",sub:"Anticiclons, depressions i fronts",col:"#dbeafe",
   enunciat:"✍️ Completa les frases sobre la pressió, el vent i els mapes del temps",
   items:[
    {f:"L'aire calent puja i fa ___ pressions: hi ha núvols i pluja.",ok:"baixes",no:["altes","iguals"],per:{"altes":"Les altes pressions vénen de l'aire fred que baixa, i porten cel clar.","iguals":"Quan l'aire puja, la pressió baixa."},clau:"puja",pista:"Calent → cap amunt → cau aigua.",ex:"Aire calent → puja → <b>baixes pressions</b> (borrasca) → pluja."},
    {f:"Una zona de pressió alta és un ___ i hi fa bon temps.",ok:"anticicló",no:["front","huracà"],per:{"front":"El front és el xoc de dues masses d'aire, i porta pluja.","huracà":"Un huracà és una gran borrasca."},pista:"Al mapa és una A.",ex:"<b>Anticicló</b> (A) = pressió alta, cel clar."},
    {f:"Al mapa del temps, les línies que uneixen punts amb la mateixa pressió són les ___.",r:["isòbares"],per:{"isobares":"Porta accent a la o: isòbares."},pista:"Iso- vol dir igual; -bara, pressió.",ex:"<b>Isòbares</b>: línies de la mateixa pressió."},
    {f:"Si les isòbares estan molt juntes, el vent és ___.",ok:"fort",no:["fluix","calent"],per:{"fluix":"Al revés: juntes vol dir canvi brusc de pressió i vent fort.","calent":"Les isòbares no diuen la temperatura."},clau:"juntes",pista:"Pensa en un pendent molt dret.",ex:"Isòbares <b>juntes</b> = vent <b>fort</b>."},
    {f:"El vent bufa de les ___ pressions cap a les ___ pressions.",ok:["altes","baixes"],no:["iguals","mitjanes"],per:{"iguals":"Si la pressió fos igual, no hi hauria vent.","mitjanes":"Va de l'alta a la baixa, com un globus que es desinfla."},pista:"Com un globus que es desinfla.",ex:"El vent va de les <b>A</b> (altes) cap a les <b>D</b> (baixes)."},
    {f:"La pressió es mesura amb el ___, en hectopascals.",ok:"baròmetre",no:["anemòmetre","higròmetre"],per:{"anemòmetre":"L'anemòmetre mesura la velocitat del vent.","higròmetre":"L'higròmetre mesura la humitat."},pista:"Bar- vol dir pes, pressió.",ex:"<b>Baròmetre</b> → pressió (hPa). Al nivell del mar, 1 013 hPa."},
    {f:"Un front ___ es dibuixa amb triangles blaus; un de càlid, amb semicercles vermells.",ok:"fred",no:["oclús","sec"],per:{"oclús":"L'oclús barreja triangles i semicercles, en lila.","sec":"No hi ha fronts secs: tots porten precipitació."},clau:"triangles",pista:"El fred té punxes, com els caramells de gel.",ex:"Front <b>fred</b>: triangles blaus. Càlid: semicercles vermells."},
    {f:"«Vent del nord» vol dir que el vent ___ del nord.",ok:"ve",no:["va cap al","no passa pel"],per:{"va cap al":"És al revés: el nom del vent diu d'on ve.","no passa pel":"El vent del nord ve del nord."},pista:"La fletxa i el nom diuen d'on surt.",ex:"El vent es diu pel lloc d'on <b>ve</b>."},
    {f:"La direcció del vent la indica el ___.",r:["penell"],pista:"És l'únic aparell que no acaba en -metre.",ex:"El <b>penell</b> indica d'on ve el vent."},
    {f:"La tramuntana i el garbí són vents ___.",ok:"locals",no:["planetaris","estacionals"],per:{"planetaris":"Els planetaris bufen a tot el planeta, com els alisis.","estacionals":"Els estacionals canvien amb l'estació, com els monsons."},pista:"Són d'una zona concreta, com Catalunya.",ex:"Vents <b>locals</b>: tramuntana, garbí. Planetaris: alisis. Estacionals: monsons."}
   ],
   final:"Tres C: Calent → Cap amunt → Cau aigua. I el vent, de l'A cap a la D."},
  {id:"fr-canvi",grup:"✍️ Frases amb buits",tipus:"frases",ic:"🌍",titol:"Efecte d'hivernacle i canvi climàtic",sub:"Gasos, causes i cimeres",col:"#dcfce7",
   enunciat:"✍️ Completa les frases de l'efecte d'hivernacle i el canvi climàtic",
   items:[
    {f:"Gràcies a l'efecte d'hivernacle natural, la Terra té de mitjana uns ___ °C.",ok:"14",no:["0","40"],per:{"0":"Sense l'efecte d'hivernacle seria gelada; amb ell, tenim uns 14 °C.","40":"És molt menys: uns 14 °C de mitjana."},pista:"Mira la idea clau de la fitxa.",ex:"L'efecte d'hivernacle natural ens dona una mitjana de <b>14 °C</b>."},
    {f:"Els gasos d'efecte d'hivernacle del llibre són el CO₂, el ___ i els gasos fluorats.",ok:"metà",no:["ozó","oxigen"],per:{"ozó":"L'ozó és la capa protectora, no un gas d'hivernacle del llibre.","oxigen":"L'oxigen no atrapa la calor."},pista:"«Com Més Fum».",ex:"«<b>C</b>om <b>M</b>és <b>F</b>um»: CO₂, <b>metà</b> i fluorats."},
    {f:"El CO₂ surt sobretot de cremar ___ i carbó.",ok:"petroli",no:["aigua","sorra"],per:{"aigua":"L'aigua no es crema.","sorra":"La sorra no es crema."},pista:"Cotxes, indústria i calefaccions.",ex:"Cremar <b>petroli</b> i carbó (transport, indústria) i talar boscos."},
    {f:"Si hi ha massa gasos, s'escapa ___ calor i el planeta s'escalfa.",ok:"menys",no:["més","la mateixa"],per:{"més":"Al revés: els gasos fan de manta i atrapen la calor.","la mateixa":"Amb més gasos, la manta és més gruixuda."},pista:"Pensa en una manta més gruixuda.",ex:"Més gasos → s'escapa <b>menys</b> calor → escalfament global."},
    {f:"Una conseqüència del canvi climàtic és que les ___ es fonen.",ok:"glaceres",no:["muntanyes","platges"],per:{"muntanyes":"Les muntanyes no es fonen: es fon el gel de les glaceres.","platges":"Les platges poden perdre sorra, però el que es fon són les glaceres."},pista:"Grans masses de gel.",ex:"Conseqüències: inundacions, desertificació, <b>glaceres</b> que es fonen, huracans."},
    {f:"A la cimera de ___ (2015) es va acordar no passar dels 2 °C.",ok:"París",no:["Kyoto","Glasgow"],per:{"Kyoto":"Kyoto va ser el 1997.","Glasgow":"Glasgow va ser el 2021 (1,5 °C)."},clau:"2015",pista:"«Ki-Pa-Ma-Gla»: la segona.",ex:"Kyoto 1997 · <b>París 2015</b> · Madrid 2019 · Glasgow 2021."},
    {f:"La primera gran cimera del clima va ser la de ___, el 1997.",r:["Kyoto"],per:{"Kioto":"El llibre l'escriu Kyoto."},pista:"«Ki-Pa-Ma-Gla»: la primera.",ex:"<b>Kyoto</b> 1997."},
    {f:"L'ODS número ___ és «Acció pel clima».",ok:"13",no:["1","20"],per:{"1":"L'ODS 1 és «Fi de la pobresa».","20":"Només n'hi ha 17."},pista:"Mira el final de la fitxa.",ex:"<b>ODS 13</b>: Acció pel clima."},
    {mots:"L'efecte d'hivernacle és natural i necessari.",no:["dolent"],pista:"El problema és tenir-ne massa.",ex:"Una manta va bé; cinc et fan suar."},
    {f:"Talar boscos també augmenta el CO₂ perquè els arbres ___ CO₂.",ok:"absorbeixen",no:["fabriquen","cremen"],per:{"fabriquen":"Els arbres no fabriquen CO₂: l'absorbeixen.","cremen":"Si es cremen, sí que n'alliberen; però vius l'absorbeixen."},pista:"Els arbres respiren CO₂ per fer la fotosíntesi.",ex:"Els arbres <b>absorbeixen</b> CO₂: si els talem, en queda més a l'aire."}
   ],
   final:"L'efecte d'hivernacle és una manta: una va bé, cinc et fan suar."},
  {id:"fr-anoia",grup:"✍️ Frases amb buits",tipus:"frases",ic:"🏔️",titol:"L'Anoia: relleu, riu, clima i paisatge",sub:"Els apunts de l'Anoia",col:"#fef9c3",
   enunciat:"✍️ Completa les frases dels apunts de l'Anoia",
   items:[
    {f:"La conca d'Òdena és una ___ excavada en roques toves.",ok:"depressió",no:["muntanya","serralada"],per:{"muntanya":"És al revés: és la zona més baixa, com un bol.","serralada":"Una serralada és un conjunt de muntanyes."},pista:"És un «bol de sopa».",ex:"La conca d'Òdena és una <b>depressió</b> (zona baixa) excavada en argiles i guixos."},
    {f:"La Tossa de Montbui és de roques ___ que no s'han desgastat.",ok:"calcàries dures",no:["argiles toves","sorres soltes"],per:{"argiles toves":"Les argiles toves són les de la conca, que s'han excavat.","sorres soltes":"Si fossin soltes, s'haurien desgastat."},pista:"Un escut de roca dura.",ex:"La Tossa és de roques <b>calcàries dures</b>: un relleu residual."},
    {f:"Les forces ___ aixequen el relleu; les forces externes el desgasten.",ok:"internes",no:["externes","del vent"],per:{"externes":"Les externes (aigua, vent, gel) desgasten, no aixequen.","del vent":"El vent és una força externa: desgasta."},pista:"Vénen de dins de la Terra.",ex:"Forces <b>internes</b> = de dins, aixequen. Externes = de fora, desgasten (erosió)."},
    {f:"El riu Anoia és un ___ del Llobregat: s'hi uneix a Martorell.",ok:"afluent",no:["delta","mar"],per:{"delta":"El delta és la desembocadura d'un riu al mar.","mar":"No desemboca al mar: desemboca al Llobregat."},clau:"Martorell",pista:"Un riu que va a parar a un altre de més gran.",ex:"Un <b>afluent</b> desemboca en un altre riu, no al mar."},
    {f:"A l'estiu el riu Anoia baixa gairebé sec: és l'___.",r:["estiatge"],pista:"Comença per «estia…», com estiu.",ex:"<b>Estiatge</b>: el riu gairebé sec a l'estiu. A la tardor, riuades."},
    {f:"L'aigua que passa per un punt del riu cada segon és el ___.",r:["cabal"],pista:"A l'Anoia és irregular.",ex:"<b>Cabal</b>: aigua que passa per un punt en un segon."},
    {f:"Igualada té un clima mediterrani ___: hiverns freds amb boira i estius molt calorosos.",ok:"continentalitzat",no:["litoral","de muntanya"],per:{"litoral":"El litoral és el de la costa, amb hiverns suaus.","de muntanya":"Igualada no és alta: el fred ve de ser lluny del mar."},pista:"La Serralada Prelitoral no deixa passar la brisa del mar.",ex:"Mediterrani <b>continentalitzat</b>: lluny del mar i amb muntanyes que fan de paret."},
    {f:"Amb la inversió tèrmica, fa ___ fred a Igualada que a dalt de la Tossa.",ok:"més",no:["menys","el mateix"],per:{"menys":"Normalment sí, però amb la inversió tèrmica passa al revés.","el mateix":"L'aire fred baixa al fons: hi fa més fred."},clau:"inversió tèrmica",pista:"L'aire fred pesa més i rellisca avall.",ex:"<b>Inversió tèrmica</b>: l'aire fred baixa al fons de la conca, on fa <b>més</b> fred."},
    {f:"Els conreus de ___ només reben l'aigua de la pluja: cereals, vinya i oliveres.",ok:"secà",no:["regadiu","hivernacle"],per:{"regadiu":"El regadiu és quan es rega.","hivernacle":"L'hivernacle és un conreu tapat."},pista:"Secà = sec, sense regar.",ex:"<b>Secà</b>: sense regar, només amb la pluja."},
    {f:"El Rec d'Igualada és un canal ___ de fa gairebé mil anys per a adoberies i fàbriques.",ok:"artificial",no:["natural","subterrani"],per:{"natural":"El van fer les persones: és artificial.","subterrani":"Va a l'aire lliure, al barri del Rec."},pista:"El van construir les persones.",ex:"El <b>Rec</b> és un canal artificial: paisatge humanitzat urbà i industrial."}
   ],
   final:"La conca és un bol de sopa, la Tossa un escut i l'aire fred rellisca avall com l'aigua en un bol."},
  {id:"fx-climo",grup:"📊 Climogrames",tipus:"custom",fn:"mxFitxa",prova:"mxProva",mx:{tipus:["climograma"],n:3},ic:"🧮",titol:"Calcula amb el climograma",sub:"Amplitud, mitjana, pluja total i mesos secs",col:"#ffedd5",
   enunciat:"🧮 Calcula amb el climograma, pas a pas"},
  {id:"cl-construeix",grup:"📊 Climogrames",tipus:"custom",fn:"jocConstrueix",prova:"jocConstrueixProva",ic:"📈",titol:"Construeix el climograma",sub:"De la taula al gràfic",col:"#e0f2fe",
   enunciat:"📈 Construeix el climograma a partir de la taula",
   ciutats:[{nom:"Igualada (valors aproximats)",T:[6,8,10,12,16,20,24,24,20,14,10,6],P:[30,30,40,50,60,40,20,40,60,60,40,30]},{nom:"Una ciutat de muntanya (valors aproximats)",T:[2,4,6,8,12,16,18,18,14,10,6,2],P:[30,30,40,60,80,70,60,70,60,60,50,40]}],
   final:"Primer les barres (escala blava, mm) i després la línia (escala vermella, °C)."},
  {id:"cl-compara",grup:"📊 Climogrames",tipus:"figura",ic:"⚖️",titol:"Compara dos climogrames",sub:"Girona o Igualada?",col:"#fef3c7",
   enunciat:"⚖️ Compara el climograma de Girona i el d'Igualada",figura:"svgCompara",
   q:[["On fa més fred a l'hivern?",["A Igualada","A Girona","Igual als dos llocs"],0,"Al gener, Igualada és a uns 6 °C i Girona a uns 8 °C: a Igualada fa més fred, perquè és lluny del mar."],
      ["On plou més durant l'any?",["A Girona","A Igualada","Igual als dos llocs"],0,"Les barres de Girona són més altes: plou més a prop del mar i del Pirineu."],
      ["Quin dels dos té més amplitud tèrmica?",["Igualada","Girona","Cap dels dos"],0,"Igualada: 24 − 6 = 18 °C. Girona: 24 − 8 = 16 °C. Lluny del mar, més contrast."],
      ["Per què a Igualada els hiverns són més freds?",["Perquè és lluny del mar i les muntanyes no deixen passar la brisa","Perquè és més a prop del pol","Perquè hi plou molt"],0,"És la distància al mar (continentalitat), reforçada per la Serralada Prelitoral."],
      ["En quin mes plou menys als dos llocs?",["Juliol","Octubre","Gener"],0,"Al juliol les barres són les més baixes: l'estiu mediterrani és sec."],
      ["Quin clima té Igualada?",["Mediterrani continentalitzat","Mediterrani litoral","De muntanya"],0,"Hiverns freds, estius calorosos i poca pluja: mediterrani continentalitzat."]]},
  {id:"mapa-temps1",grup:"🗺️ Mapes del temps",tipus:"figura",ic:"🌀",titol:"Llegeix el mapa del temps (1)",sub:"Un anticicló i una depressió",col:"#dbeafe",
   enunciat:"🌀 Llegeix el mapa del temps",figura:"svgMapaTemps1",
   q:[["On hi ha la pressió més alta?",["A l'oest, a l'oceà Atlàntic (A)","A l'est, sobre les Balears (D)","A tot arreu igual"],0,"La A és l'anticicló: pressió alta (1 028 hPa al centre)."],
      ["On és més probable que plogui?",["Al voltant de la D, sobre les Balears","A l'Atlàntic, a prop de la A","Al centre de la península"],0,"La D és una depressió: l'aire puja i hi ha núvols i pluja."],
      ["Cap on bufa el vent, segons el llibre?",["De la A cap a la D, d'oest a est","De la D cap a la A","No hi ha vent"],0,"El vent va de les altes pressions (A) cap a les baixes (D)."],
      ["On bufarà més fort el vent?",["On les isòbares estan més juntes, a prop de la D","On les isòbares estan més separades","Al centre de la A"],0,"Isòbares juntes = vent fort."],
      ["Què representa la línia amb triangles blaus?",["Un front fred","Un front càlid","Una isòbara"],0,"Triangles blaus = front fred: porta pluja i baixada de temperatura."],
      ["Quin número té l'isòbara més propera a la D?",["996 hPa","1 028 hPa","1 013 hPa"],0,"A la D la pressió és baixa: 996 hPa."]]},
  {id:"mapa-temps2",grup:"🗺️ Mapes del temps",tipus:"figura",ic:"☀️",titol:"Llegeix el mapa del temps (2)",sub:"Un anticicló sobre la península",col:"#fef9c3",
   enunciat:"☀️ Llegeix el mapa del temps",figura:"svgMapaTemps2",
   q:[["Quin temps farà a Catalunya?",["Sol i cel clar: hi ha un anticicló a sobre","Pluja i tempesta","Neu a tot arreu"],0,"L'anticicló (A) sobre la península porta temps estable i cel clar."],
      ["On farà mal temps?",["Al nord, a França, prop de la D","A la península","A l'Àfrica"],0,"La depressió (D) és al nord: allà hi haurà núvols i pluja."],
      ["Com gira l'aire al voltant de la A?",["Com les agulles del rellotge","Al revés de les agulles del rellotge","No gira"],0,"Anticicló = Agulles del rellotge i Assolellat."],
      ["On bufarà més fort el vent?",["Al nord, on les isòbares estan juntes","Al centre de la península","Al sud de la península"],0,"Prop de la D les isòbares estan juntes: vent fort."],
      ["Què és una isòbara?",["Una línia que uneix punts amb la mateixa pressió","Una línia de la mateixa temperatura","La frontera entre dos països"],0,"Iso = igual; bara = pressió."],
      ["Què porta sempre un front?",["Precipitacions","Sol","Calor"],0,"Un front és el xoc de dues masses d'aire: sempre porta precipitacions."]]},
  {id:"mapa-temps3",grup:"🗺️ Mapes del temps",tipus:"figura",ic:"🌧️",titol:"Llegeix el mapa del temps (3)",sub:"Una borrasca arriba de l'Atlàntic",col:"#e0e7ff",
   enunciat:"🌧️ Llegeix el mapa del temps",figura:"svgMapaTemps3",
   q:[["On plourà avui?",["Al nord-oest, a Galícia, prop de la D","A les Balears, prop de la A","A tot arreu igual"],0,"La D (depressió) és al nord-oest: allà l'aire puja i plou."],
      ["Què és la línia amb semicercles vermells?",["Un front càlid","Un front fred","Una isòbara"],0,"Semicercles vermells, com el sol = front càlid."],
      ["On farà bon temps?",["A l'est, al Mediterrani, prop de la A","A Galícia","Al centre de la D"],0,"La A (anticicló) porta temps estable i assolellat."],
      ["On bufarà més fort el vent?",["Al nord-oest, on les isòbares estan juntes","A l'est, prop de la A","Al centre de la península"],0,"Al voltant de la D les isòbares estan molt juntes: vent fort."],
      ["Les borrasques de l'Atlàntic solen anar cap a l'est. Què pot passar demà a Catalunya?",["Que arribin núvols i pluja","Que faci més sol que avui","Que no canviï res"],0,"Si la D avança cap a l'est, el mal temps s'acosta a Catalunya."],
      ["Quina pressió hi ha al centre de la D?",["988 hPa","1 024 hPa","1 013 hPa"],0,"La depressió té la pressió més baixa del mapa: 988 hPa."]]},
  {id:"mapa-temps4",grup:"🗺️ Mapes del temps",tipus:"figura",ic:"🌊",titol:"Llegeix el mapa del temps (4)",sub:"Una llevantada a la costa",col:"#ccfbf1",
   enunciat:"🌊 Llegeix el mapa del temps",figura:"svgMapaTemps4",
   q:[["On plourà més?",["A la costa mediterrània, prop de la D","A Galícia","A l'interior de França"],0,"La D és al Mediterrani, davant de la costa: la pluja cau a la costa."],
      ["D'on ve el vent que arriba a la costa catalana?",["De l'est, del mar: és llevant","De l'oest, de l'Atlàntic","Del sud, de l'Àfrica"],0,"El vent es diu pel lloc d'on ve: de l'est (per on surt el sol) és llevant."],
      ["Per què aquest vent porta pluja?",["Perquè ve del mar i porta molta humitat","Perquè és molt fred","Perquè passa per sobre de muntanyes seques"],0,"El vent que ve del mar va carregat de vapor d'aigua i, en xocar amb la costa i les muntanyes, plou."],
      ["On és l'anticicló?",["Al nord-est, sobre Europa","Sobre la península","Al sud, a l'Àfrica"],0,"La A és a dalt a la dreta, sobre Europa."],
      ["Quin temps farà a l'oest de la península?",["Més tranquil: és lluny de la D","Tempesta forta","Neu a tot arreu"],0,"La depressió és a l'est; l'oest queda lluny del mal temps."],
      ["Quina pressió hi ha al centre de la D?",["1 000 hPa","1 028 hPa","1 040 hPa"],0,"La D té la pressió més baixa del mapa: 1 000 hPa."]]},
  {id:"mapa-temps5",grup:"🗺️ Mapes del temps",tipus:"figura",ic:"🌫️",titol:"Llegeix el mapa del temps (5)",sub:"Un anticicló d'hivern",col:"#f1f5f9",
   enunciat:"🌫️ Llegeix el mapa del temps",figura:"svgMapaTemps5",
   q:[["Quina pressió hi ha sobre la península?",["Alta: hi ha un anticicló","Baixa: hi ha una depressió","No se sap"],0,"La A al mig del mapa vol dir pressió alta (1 036 hPa)."],
      ["Bufarà vent fort?",["No: les isòbares estan molt separades i el vent és fluix","Sí: les isòbares estan molt juntes","Sí, perquè hi ha un front fred"],0,"Isòbares separades = vent fluix o calma."],
      ["Plourà?",["No: amb anticicló el temps és estable i sec","Sí, molt","Només a la costa"],0,"A l'anticicló l'aire baixa i no es formen núvols de pluja."],
      ["Per què a l'hivern, amb aquest temps, a Igualada hi pot haver boira?",["Perquè sense vent l'aire fred i humit es queda quiet a les zones baixes","Perquè arriba un front càlid","Perquè plou molt"],0,"Amb anticicló i calma, l'aire fred s'estanca a la conca d'Òdena i es fa boira."],
      ["Hi ha cap front al mapa?",["No, no n'hi ha cap","Sí, un front fred","Sí, un front càlid"],0,"Sense fronts ni depressions, no hi ha precipitacions."],
      ["Com gira l'aire al voltant de la A?",["Com les agulles del rellotge","Al revés de les agulles del rellotge","No gira mai"],0,"Anticicló = Agulles del rellotge."]]},
  {id:"capes",grup:"🎮 Jocs ràpids",tipus:"ordena",ic:"🧅",titol:"Ordena les capes",sub:"Atmosfera, de baix a dalt",col:"#f3e8ff",
   enunciat:"🧅 Ordena les capes de l'atmosfera",instr:"Toca les capes <b>de baix a dalt</b>, de la Terra cap a l'espai.",base:"🌍 TERRA",
   items:[["Troposfera","0-12 km · núvols i pluja","#E8F5E9"],["Estratosfera","12-50 km · capa d'ozó","#EAF6FF"],["Mesosfera","50-80 km · estels fugaços","#E3F2FD"],["Termosfera","80-500 km · aurores i satèl·lits","#DCE8F7"],["Exosfera","500-10 000 km · cap a l'espai","#DCDDF3"]],
   final:"Recorda: «Tots Els Matins Torro Entrepans»."},
  {id:"climo",grup:"📊 Climogrames",tipus:"figura",ic:"📊",titol:"Llegeix el climograma",sub:"Girona",col:"#ffedd5",
   enunciat:"📊 Llegeix el climograma",figura:"svgClimo",
   q:[["Quin és el mes més plujós?",["octubre","gener","juliol"],0,"La barra més alta és la d'octubre (uns 112 mm)."],["I el mes més sec?",["juliol","octubre","maig"],0,"Juliol: la barra més baixa."],["Quins són els mesos més càlids?",["juliol i agost","gener i desembre","abril i maig"],0,"La línia vermella arriba a dalt de tot al juliol i l'agost (24 °C)."],["Quin és un dels mesos més freds?",["gener","juliol","setembre"],0,"Gener (i desembre): 8 °C."],["Què representen les barres blaves?",["la pluja","la temperatura","el vent"],0,"La pluja, en mm (escala de la dreta)."],["La temperatura es llegeix amb l'escala de…",["l'esquerra","la dreta","a sota"],0,"L'esquerra, en °C (vermell)."]]},
  {id:"parelles",grup:"🎮 Jocs ràpids",tipus:"parelles",ic:"🔗",titol:"Aparell i unitat",sub:"Relaciona parelles",col:"#ccfbf1",
   enunciat:"🔗 Cada aparell amb el que mesura",instr:"Toca un aparell (esquerra) i després el que mesura (dreta).",
   pars:[["Termòmetre","°C (temperatura)"],["Higròmetre","% (humitat)"],["Pluviòmetre","mm o L/m² (pluja)"],["Baròmetre","hPa (pressió)"],["Anemòmetre","km/h (velocitat del vent)"],["Penell","d'on ve el vent"]],
   final:"Truc: tots acaben en <b>-metre</b> menys el <b>penell</b>."},
  {id:"classifica",grup:"🎮 Jocs ràpids",tipus:"classifica",ic:"🗂️",titol:"Temps o clima?",sub:"Classifica frases",col:"#dbeafe",
   enunciat:"🗂️ Temps o clima?",instr:"Toca una frase i després la caixa on va.",
   caixes:[["temps","🌦️ TEMPS · avui, un moment"],["clima","🪪 CLIMA · sempre, uns 30 anys"]],
   items:[["Avui a París plou i fa fred","temps"],["El clima de París és calorós i sec a l'estiu","clima"],["Demà nevarà al Pirineu","temps"],["A Igualada els hiverns són freds i amb boira","clima"],["Aquesta tarda hi ha tempesta a Girona","temps"],["A l'equador plou molt tot l'any","clima"],["Ara mateix bufa la tramuntana","temps"],["A la costa les temperatures són suaus tot l'any","clima"]],
   final:"Temps = tiquet d'un dia; clima = carnet d'identitat."},
  {id:"err-clima",grup:"📊 Climogrames",tipus:"error",ic:"🔍",titol:"Troba l'error al climograma",sub:"5 exercicis amb trampa",col:"#fee2e2",
   enunciat:"🔍 Troba l'error al climograma i les dades del clima",
   exercicis:[
    {id:"climo-gaussen",nom:"en Pol",figura:"svgClimo",
     enun:"Comenta el climograma de Girona (temperatura, amplitud tèrmica, precipitació i mesos secs).",
     linies:[
      "1. Mes més càlid: juliol i agost (24 °C). Mes més fred: gener i desembre (8 °C).",
      "2. Amplitud tèrmica: 24 − 8 = 16 °C (amplitud moderada).",
      "3. Precipitació total: 667 mm l'any, amb el màxim a l'octubre (112 mm).",
      "4. Mesos secs: cap, perquè tots els mesos plou més de 20 mm.",
      "5. Conclusió: és un clima mediterrani litoral."
     ],
     mal:3,
     per:[
      "Al juliol la barra de pluja queda sota la línia de temperatura (P < 2 · T): sí que és un mes sec",
      "El mes més plujós no és l'octubre sinó el gener, perquè la línia vermella és més baixa",
      "L'amplitud tèrmica es calcula sumant la temperatura màxima i la mínima (24 + 8 = 32 °C)"
     ],
     t:"tria",q:"Per què el juliol (24 °C i 25 mm) és un <b>mes sec</b> al climograma?",
     op:["Perquè la barra de pluja queda sota la línia vermella (25 mm < 2 · 24 = 48)","Perquè 25 mm és més gran que 24 °C","Perquè a l'estiu no plou mai cap litre"],r:0,
     pista:"Mira al gràfic si al juliol la barra blava queda per sota de la línia vermella.",
     pistaR:"Regla de Gaussen: un mes és sec quan P < 2 · T (al gràfic, la barra queda sota la línia).",
     llibreta:[
      "1. Mes més càlid: juliol i agost (24 °C). Mes més fred: gener i desembre (8 °C).",
      "2. Amplitud tèrmica: 24 − 8 = 16 °C (amplitud moderada).",
      "3. Precipitació total: 667 mm l'any, amb el màxim a l'octubre (112 mm).",
      "4. Mesos secs: <b>el juliol és un mes sec (P = 25 mm < 2 · T = 48, la barra queda sota la línia)</b>.",
      "5. Conclusió: és un clima mediterrani litoral amb sequera estival."
     ],ok:[3,4]},
    {id:"amplitud-neg",nom:"la Berta",
     enun:"Calcula l'amplitud tèrmica anual d'una estació d'alta muntanya amb T mín = −3 °C (gener) i T màx = 25 °C (juliol).",
     linies:[
      "Dades: mes més càlid = 25 °C (juliol); mes més fred = −3 °C (gener).",
      "Fórmula: Amplitud tèrmica = T màxima − T mínima.",
      "Càlcul: 25 − 3 = 22 °C.",
      "Resposta: l'amplitud tèrmica és de 22 °C."
     ],
     mal:2,
     per:[
      "De −3 °C a 0 °C hi ha 3 graus i fins a 25 °C n'hi ha 25 més: 25 − (−3) = 25 + 3 = 28 °C",
      "L'amplitud tèrmica s'ha de calcular dividint 25 entre 3",
      "Quan hi ha temperatures negatives no es pot calcular l'amplitud tèrmica"
     ],
     t:"num",q:"Quants graus d'<b>amplitud tèrmica</b> hi ha realment entre −3 °C i 25 °C?",r:28,
     pista:"Pensa en el termòmetre: per pujar de −3 °C a 0 °C ja puges 3 graus, i després 25 graus més.",
     pistaR:"Fes 25 + 3 = 28 °C.",
     llibreta:[
      "Dades: mes més càlid = 25 °C (juliol); mes més fred = −3 °C (gener).",
      "Fórmula: Amplitud tèrmica = T màxima − T mínima.",
      "Càlcul: 25 − (−3) = 25 + 3 = <b>28 °C</b>.",
      "Resposta: l'amplitud tèrmica anual és de <b>28 °C</b>."
     ],ok:[2,3]},
    {id:"amplitud-mitjana",nom:"en Marc",
     enun:"En una ciutat, el mes més càlid té 26 °C i el mes més fred té 10 °C. Calcula l'amplitud tèrmica anual.",
     linies:[
      "Dades: T del mes més càlid = 26 °C; T del mes més fred = 10 °C.",
      "Per trobar l'amplitud tèrmica faig la mitjana dels dos valors: (26 + 10) : 2 = 18 °C.",
      "Resposta: l'amplitud tèrmica és de 18 °C."
     ],
     mal:1,
     per:[
      "Ha confós l'amplitud tèrmica amb la mitjana: l'amplitud és la resta entre la màxima i la mínima (26 − 10)",
      "Per fer la mitjana s'havien de multiplicar 26 · 10",
      "L'amplitud tèrmica és sempre la temperatura del mes més càlid (26 °C)"
     ],
     t:"num",q:"Quant val l'<b>amplitud tèrmica</b> (en °C) si el mes més càlid té 26 °C i el més fred 10 °C?",r:16,
     pista:"Recorda la definició d'amplitud tèrmica: la diferència entre el mes més càlid i el més fred.",
     pistaR:"Resta 26 − 10 = 16 °C.",
     llibreta:[
      "Dades: T del mes més càlid = 26 °C; T del mes més fred = 10 °C.",
      "Amplitud tèrmica = T màxima − T mínima = 26 − 10 = <b>16 °C</b>.",
      "Resposta: l'amplitud tèrmica és de <b>16 °C</b>."
     ],ok:[1,2]},
    {id:"unitats-aparells",nom:"la Júlia",
     enun:"Escriu les dades meteorològiques recollides avui a l'estació d'Igualada amb el seu aparell i unitat.",
     linies:[
      "Temperatura: 18 °C (mesurada amb el termòmetre).",
      "Humitat de l'aire: 65 % (mesurada amb l'higròmetre).",
      "Precipitació recollida: 14 hPa d'aigua (mesurada amb el pluviòmetre).",
      "Velocitat del vent: 25 km/h (mesurada amb l'anemòmetre)."
     ],
     mal:2,
     per:[
      "La pluja del pluviòmetre es mesura en mm (o L/m²); els hPa són la unitat de la pressió atmosfèrica",
      "El pluviòmetre serveix per mesurar la direcció del vent i no pas la pluja",
      "La temperatura del termòmetre s'ha d'escriure en km/h"
     ],
     t:"tria",q:"En quina <b>unitat</b> es mesura la precipitació recollida pel pluviòmetre?",
     op:["En mil·límetres (mm) o litres per metre quadrat (L/m²)","En hectopascals (hPa)","En graus Celsius (°C)"],r:0,
     pista:"Revisa les unitats de cada aparell meteorològic.",
     pistaR:"La pluja es mesura en mm (1 mm = 1 L/m²); els hPa són del baròmetre.",
     llibreta:[
      "Temperatura: 18 °C (mesurada amb el termòmetre).",
      "Humitat de l'aire: 65 % (mesurada amb l'higròmetre).",
      "Precipitació recollida: <b>14 mm (o 14 L/m²) d'aigua</b> (mesurada amb el pluviòmetre).",
      "Velocitat del vent: 25 km/h (mesurada amb l'anemòmetre)."
     ],ok:[2]},
    {id:"gaussen-reves",nom:"l'Àlex",
     enun:"Al juny, en un poble mediterrani, la temperatura mitjana és T = 20 °C i la precipitació és P = 30 mm. És un mes sec?",
     linies:[
      "Dades del juny: T = 20 °C i P = 30 mm.",
      "Aplico la regla de Gaussen: calculo el doble de la temperatura → 2 · 20 = 40.",
      "Com que 40 és més gran que 30, al juny plou molt i NO és un mes sec.",
      "Per tant, el juny és un mes humit."
     ],
     mal:2,
     per:[
      "Ha aplicat la regla al revés: com que la pluja (30 mm) és més petita que 2 · T (40), SÍ que és un mes sec",
      "S'havia de multiplicar la pluja per 2 (2 · 30 = 60) en lloc de la temperatura",
      "Un mes només és sec si la precipitació és exactament 0 mm"
     ],
     t:"tria",q:"Si T = 20 °C i P = 30 mm, com és el mes de juny segons la regla de Gaussen (P < 2 · T)?",
     op:["És un mes sec, perquè P (30 mm) és més petit que 2 · T (40)","És un mes humit, perquè 2 · T (40) és més gran que 30","No es pot saber sense la pressió atmosfèrica"],r:0,
     pista:"Recorda: hi ha sequera (mes sec) quan la pluja P no arriba al doble de la temperatura (2 · T).",
     pistaR:"P = 30 mm és menys que 2 · T = 40 → és un mes sec.",
     llibreta:[
      "Dades del juny: T = 20 °C i P = 30 mm.",
      "Regla de Gaussen: comparem la pluja P amb el doble de la temperatura (2 · T = 2 · 20 = 40).",
      "Com que <b>P = 30 mm < 40 (2 · T)</b>, la barra queda sota la línia.",
      "Resposta: el juny <b>SÍ que és un mes sec</b>."
     ],ok:[2,3]}
   ],
   final:"Ja domines les trampes clàssiques dels climogrames i les dades del clima!"}
 ]
};

const T=[
{id:"temps",practica:"fx-climo",esquema:{titol:"Temps o clima?",html:"<div class='esq-col'><div style='background:#dbeafe'>🌦️ <b>Temps</b><br>un lloc i un moment (avui)<br>= tiquet d'un dia</div><div style='background:#dcfce7'>🪪 <b>Clima</b><br>el que passa normalment (uns 30 anys)<br>= carnet d'identitat</div></div>"},ic:"🌦️",col:"#3498DB",titol:"Temps i clima",font:"Llibre · secció 1",
 idea:"El temps és el que fa avui en un lloc; el clima és el que hi fa normalment, mirant uns 30 anys.",
 pts:["<b>Temps atmosfèric</b>: estat de l'atmosfera en un <b>lloc i moment concrets</b> (avui, 2-3 dies).","<b>Clima</b>: estat de l'atmosfera en un <b>territori extens</b> durant uns <b>30 anys</b>.","<b>Meteorologia</b> estudia el temps (a Catalunya, el METEOCAT). <b>Climatologia</b> estudia el clima.","Els <b>satèl·lits Meteosat</b> ajuden a fer prediccions.","<b>Climograma</b>: gràfic amb les <b>barres de pluja</b> (escala dreta, mm) i la <b>línia de temperatura</b> (escala esquerra, °C) de cada mes."],
 truc:"<b>Temps = Tiquet</b> d'un dia. <b>Clima = Carnet</b> d'identitat d'un lloc.",
 compte:"Un «any rar» és temps, no clima: el clima necessita molts anys.",
 fc:[["Què és el temps atmosfèric?","L'estat de l'atmosfera en un lloc i un moment concrets."],["Què és el clima?","L'estat habitual de l'atmosfera en un territori gran durant uns 30 anys."],["Quina ciència estudia el temps?","La meteorologia."],["Quina ciència estudia el clima?","La climatologia."],["Què representen les barres d'un climograma?","La pluja (precipitació) de cada mes, en mm."],["I la línia del climograma?","La temperatura mitjana de cada mes, en °C."]],
 q:[["«Demà nevarà al Pirineu». És…", ["temps (un moment concret)", "clima", "ni temps ni clima"], 0, "Parla d'un moment concret (demà), així que és temps."], ["«A Girona plou sobretot a la tardor». És…", ["temps", "clima", "meteorologia"], 1, "Descriu el que passa habitualment any rere any: és clima."], ["Quants anys de dades calen per parlar de clima?", ["Uns 3", "Uns 300", "Uns 30 anys"], 2, "Calen uns 30 anys d'observacions per saber com és el clima d'un lloc."], ["Al climograma, la pluja es dibuixa amb…", ["barres", "una línia", "punts"], 0, "Barres per a la pluja i una línia per a la temperatura."], ["Quina ciència estudia el temps atmosfèric?", ["La climatologia", "La meteorologia (el METEOCAT)", "La geografia"], 1, "La meteorologia estudia el temps; a Catalunya ho fa el METEOCAT."], ["Com es diu la ciència que estudia el clima?", ["La meteorologia", "La geologia", "La climatologia"], 2, "La climatologia estudia el clima, mirant les dades de molts anys."], ["Al climograma, la pluja es llegeix a l'escala…", ["de l'esquerra, en mm", "de la dreta, en °C", "de la dreta, en mm"], 2, "La pluja va a l'escala de la dreta, en mm; la temperatura, a l'esquerra, en °C."], ["Un any que plou molt més del normal és…", ["un canvi de clima", "temps, no clima", "un clima diferent"], 1, "Un sol «any rar» és temps: per parlar de clima calen molts anys."]]},

{id:"atmos",practica:"fr-atmos",esquema:{titol:"Les capes de l'atmosfera",html:"<table><tr><td style='background:#e0e7ff'>Exosfera · 500-10 000 km · cap a l'espai</td></tr><tr><td style='background:#dbeafe'>Termosfera · 80-500 km · aurores i satèl·lits</td></tr><tr><td style='background:#e0f2fe'>Mesosfera · 50-80 km · estels fugaços</td></tr><tr><td style='background:#cffafe'>Estratosfera · 12-50 km · <b>capa d'ozó</b></td></tr><tr><td style='background:#dcfce7'><b>Troposfera</b> · 0-12 km · núvols, pluja i vent</td></tr><tr><th>🌍 Terra</th></tr></table>"},ic:"🌍",col:"#8E44AD",titol:"L'atmosfera: capes i funcions",font:"Llibre · seccions 2 i 3",
 idea:"L'atmosfera té 5 capes; tot el temps (núvols, pluja, vent) passa a la de baix: la troposfera.",
 pts:["Capa de gas de més de 1 000 km: <b>78 % nitrogen</b>, <b>21 % oxigen</b>.","<b>Troposfera</b> (0-12 km): fenòmens meteorològics; la temperatura baixa amb l'altitud.","<b>Estratosfera</b> (fins a 50 km): <b>capa d'ozó</b>, que filtra els raigs ultraviolats.","<b>Mesosfera</b> (50-80 km): s'hi desintegren els meteorits (estels fugaços).","<b>Termosfera</b> (80-500 km): aurores boreals, satèl·lits.","<b>Exosfera</b> (500-10 000 km): transició cap a l'espai.","<b>3 funcions</b>: regula la temperatura · protegeix dels meteorits · filtra les radiacions nocives del Sol.","Els <b>CFC</b> van fer un forat a l'ozó; s'han eliminat i la capa s'està recuperant."],
 truc:"Capes de baix a dalt: «<b>T</b>ots <b>E</b>ls <b>M</b>atins <b>T</b>orro <b>E</b>ntrepans». L'atmosfera és una <b>jaqueta amb casc i ulleres de sol</b>.",
 compte:"<b>Meteor</b> = la pedra que es crema a l'aire. <b>Meteorit</b> = la que arriba a terra.",
 fc:[["A quina capa passen els fenòmens meteorològics?","A la troposfera."],["On és la capa d'ozó?","A l'estratosfera."],["On es desintegren la majoria de meteoroides (els estels fugaços)?","A la mesosfera."],["On hi ha les aurores boreals?","A la termosfera."],["Quines són les 3 funcions de l'atmosfera?","Regula la temperatura, protegeix dels meteorits i filtra les radiacions nocives."],["Què va fer el forat de la capa d'ozó?","Els CFC (neveres, aerosols, aire condicionat)."]],
 q:[["Quin gas és el més abundant de l'aire?", ["Oxigen", "Nitrogen", "Diòxid de carboni"], 1, "El nitrogen és el 78 % de l'aire; l'oxigen, el 21 %."], ["La capa d'ozó ens protegeix de…", ["els raigs ultraviolats", "els meteorits que cauen", "el vent i les tempestes"], 0, "La capa d'ozó filtra la major part dels raigs ultraviolats del Sol."], ["Quina capa és la de baix de tot?", ["Estratosfera", "Exosfera", "Troposfera (0-12 km)"], 2, "La troposfera, de 0 a uns 12 km, és la que toca la Terra."], ["Com es diu la pedra que arriba a tocar terra?", ["Meteor", "Estel fugaç", "Meteorit"], 2, "És un meteorit. Mentre es crema a l'aire, en diem meteor."], ["A quina capa passen els núvols, la pluja i el vent?", ["Troposfera", "Mesosfera", "Estratosfera"], 0, "A la troposfera: hi passen tots els fenòmens meteorològics."], ["On es desintegren la majoria de meteoroides (els que fan els estels fugaços)?", ["A la mesosfera (50-80 km)", "A l'estratosfera", "A la troposfera"], 0, "A la mesosfera, entre 50 i 80 km, es cremen i fan els estels fugaços."], ["Quina d'aquestes és una de les tres funcions de l'atmosfera?", ["Escalfar el nucli de la Terra", "Protegir dels meteorits", "Fer girar la Terra"], 1, "L'atmosfera regula la temperatura, protegeix dels meteorits i filtra les radiacions nocives."], ["Què va fer el forat de la capa d'ozó?", ["El nitrogen de l'aire", "Els gasos CFC", "El vapor d'aigua"], 1, "Els CFC (neveres, aerosols, aire condicionat). S'han eliminat i la capa s'està recuperant."]]},

{id:"elements",practica:"fr-elements",esquema:{titol:"Elements i factors",html:"<div class='esq-col'><div style='background:#ffedd5'><b>5 elements</b> (les peces)<br>temperatura · precipitació · humitat · pressió · vent</div><div style='background:#e0f2fe'><b>3 factors</b> (LAD, el canvien)<br>Latitud · Altitud (−6 °C cada 1 000 m) · Distància al mar</div></div>"},ic:"🌡️",col:"#E67E22",titol:"Elements i factors del clima",font:"Llibre · secció 4A",
 idea:"5 elements fan el clima (temperatura, precipitació, humitat, pressió i vent) i 3 factors el canvien (latitud, altitud i distància al mar).",
 pts:["<b>Temperatura</b>: termòmetre, °C. 5 zones: 1 càlida, 2 temperades, 2 fredes.","<b>Humitat</b>: vapor d'aigua de l'aire. Higròmetre, %.","<b>Precipitació</b>: aigua que cau (pluja, neu, calamarsa). Pluviòmetre, L/m² o mm.","Camí de l'aigua: radiació solar → evaporació → condensació (núvols) → precipitació.","<b>Latitud</b>: com més a prop de l'equador, més calor.","<b>Altitud</b>: uns <b>6 °C menys cada 1 000 m</b>.","<b>Distància al mar</b>: a la costa, temperatures suaus; a l'interior, més contrast."],
 truc:"Factors = <b>LAD</b> (Latitud, Altitud, Distància al mar). «<b>Pujo mil, perdo sis</b>». Les zones són un <b>entrepà</b>: pa-formatge-pernil-formatge-pa.",
 compte:"1 L/m² i 1 mm de pluja són el mateix.",
 fc:[["Quins són els 5 elements del clima?","Temperatura, precipitació, humitat, pressió i vent."],["Quins són els 3 factors del clima?","Latitud, altitud i distància al mar."],["Amb què es mesura la humitat?","Amb l'higròmetre (en %)."],["Amb què es mesura la pluja?","Amb el pluviòmetre (L/m² o mm)."],["Quants graus baixa la temperatura cada 1 000 m?","Uns 6 °C."],["Quantes zones climàtiques hi ha?","5: una càlida, dues temperades i dues fredes."]],
 q:[["A la platja fa 21 °C. Al cim de 2 000 m farà més o menys…", ["9 °C", "15 °C", "27 °C"], 0, "Perds uns 6 °C cada 1 000 m: 21 − 12 = 9 °C."], ["Amb quin aparell es mesura la humitat?", ["Higròmetre (en %)", "Baròmetre", "Anemòmetre"], 0, "Amb l'higròmetre, que la dona en %."], ["Com més a prop de l'equador…", ["menys calor fa", "més calor fa", "més fred fa"], 1, "La latitud mana: a prop de l'equador fa més calor."], ["El vapor d'aigua es refreda i fa núvols. Com es diu?", ["Evaporació", "Precipitació", "Condensació"], 2, "És la condensació: el vapor es refreda i forma els núvols."], ["Quins són els tres factors del clima?", ["Latitud, altitud i distància al mar", "Temperatura, pressió i vent", "Latitud, humitat i distància al mar"], 0, "Són LAD: Latitud, Altitud i Distància al mar. La temperatura, la pressió i la humitat són elements."], ["Un pluviòmetre mesura…", ["la humitat, en %", "la pluja, en mm", "la pressió, en hPa"], 1, "El pluviòmetre mesura la pluja, en mm o L/m²."], ["Han caigut 10 L/m² de pluja. Quants mm són?", ["10 mm, és el mateix", "1 mm", "100 mm"], 0, "1 L/m² i 1 mm de pluja són el mateix, així que són 10 mm."], ["Comptant els dos hemisferis, quantes zones climàtiques té la Terra?", ["2 zones", "4 zones", "5 zones climàtiques"], 2, "Són 5: una càlida, dues temperades i dues fredes. Compte: són 3 tipus de zona (càlida, temperada i freda), però la temperada i la freda surten repetides, una a cada hemisferi."]]},

{id:"pressio",practica:"fr-pressio",esquema:{titol:"Anticicló i depressió",html:"<div class='esq-col'><div style='background:#dbeafe'><b>A · Anticicló</b><br>pressió alta · l'aire fred baixa<br>☀️ cel clar · gira com les agulles del rellotge</div><div style='background:#fee2e2'><b>D · Depressió</b><br>pressió baixa · l'aire calent puja<br>🌧️ núvols i pluja · gira al revés</div></div><p style='text-align:center;margin:6px 0 0;font-weight:700'>El vent va de la A cap a la D</p>"},ic:"💨",col:"#16A085",titol:"La pressió i el vent",font:"Llibre · secció 4B",
 idea:"L'aire calent puja i fa baixes pressions (pluja); l'aire fred baixa i fa altes pressions (sol). El vent va de les altes a les baixes pressions.",
 pts:["<b>Pressió</b>: força que fa l'aire. Baròmetre, hectopascals (hPa). Al nivell del mar: <b>1 013 hPa</b>.","Com més amunt, <b>menys pressió</b>.","Aire <b>calent</b> → puja → <b>baixes pressions (D, borrasca)</b> → núvols i pluja.","Aire <b>fred</b> → baixa → <b>altes pressions (A, anticicló)</b> → cel clar.","<b>Vent</b>: aire en moviment, de les <b>A</b> cap a les <b>D</b>. Velocitat: anemòmetre (km/h). Direcció: penell.","Tipus: <b>planetaris</b> (alisis), <b>estacionals</b> (monsons), <b>locals</b> (tramuntana, garbí)."],
 truc:"<b>Calent → Cap amunt → Cau aigua</b> (tres C = borrasca). El vent és com un globus que es desinfla: surt d'on està apretat.",
 compte:"Tots els aparells acaben en -metre menys el <b>penell</b>, que només assenyala d'on ve el vent.",
 fc:[["Amb què es mesura la pressió?","Amb el baròmetre, en hPa."],["Quina és la pressió normal al nivell del mar?","1 013 hPa."],["L'aire calent fa altes o baixes pressions?","Baixes pressions (borrasca)."],["D'on cap a on bufa el vent?","De les altes pressions cap a les baixes."],["Amb què es mesura la velocitat del vent?","Amb l'anemòmetre (km/h)."],["Digues un vent local de Catalunya","La tramuntana o el garbí."]],
 q:[["Una borrasca porta…", ["cel clar i sec", "núvols i pluja", "vent del nord"], 1, "Les baixes pressions (borrasca) porten temps inestable: núvols i pluja."], ["El vent bufa…", ["de les altes a les baixes pressions", "de les baixes a les altes", "sempre del nord cap al sud"], 0, "Sempre va de les A cap a les D, com l'aire que surt d'un globus."], ["Quin aparell indica la direcció del vent?", ["El pluviòmetre", "El termòmetre", "El penell"], 2, "El penell: és l'únic que no acaba en -metre i assenyala d'on ve el vent."], ["Els alisis són vents…", ["locals", "estacionals", "planetaris"], 2, "Els alisis són planetaris; els monsons, estacionals, i la tramuntana, local."], ["Quina és la pressió normal al nivell del mar?", ["1 013 hPa (hectopascals)", "1 310 hPa", "913 hPa"], 0, "Al nivell del mar, la pressió normal és de 1 013 hPa."], ["L'aire calent puja i fa…", ["altes pressions (anticicló)", "baixes pressions (borrasca)", "vent de tramuntana"], 1, "Calent → cap amunt → cau aigua: baixes pressions, borrasca."], ["Com més amunt pugem, la pressió…", ["puja molt", "baixa", "es queda igual"], 1, "Com més amunt, menys aire a sobre i, per tant, menys pressió."], ["Amb quin aparell es mesura la velocitat del vent?", ["Anemòmetre (en km/h)", "Pluviòmetre", "Penell"], 0, "Amb l'anemòmetre, en km/h; el penell només indica la direcció."]]},

{id:"mapes",practica:"mapa-temps1",ic:"🗺️",col:"#2980B9",titol:"Els mapes del temps",font:"Llibre · secció 5",
 idea:"Un mapa del temps mostra anticiclons (A), depressions (D) i fronts. Amb això es pot predir el temps.",
 pts:["<b>Isòbares</b>: línies que uneixen punts amb la mateixa pressió.","<b>Anticicló (A)</b>: pressió alta al centre, gira com les agulles del rellotge, temps estable.","<b>Depressió (D)</b>: pressió baixa al centre, gira al revés, temps inestable.","<b>Front</b>: xoc de dues masses d'aire. Sempre porta precipitacions.","<b>Front fred</b>: triangles blaus. <b>Front càlid</b>: semicercles vermells. <b>Oclús</b>: barrejats, lila.","Isòbares <b>molt juntes</b> = vent <b>fort</b>.","La fletxa del vent indica <b>d'on ve</b> el vent."],
 truc:"<b>A</b>nticicló = <b>A</b>gulles del rellotge i <b>A</b>ssolellat. <b>D</b>epressió = <b>D</b>iluvi. El fred té punxes (caramells de gel); el càlid, rodones (sol).",
 compte:"«Vent del nord» vol dir que <b>ve</b> del nord, no que hi va.",
 fc:[["Què és una isòbara?","Una línia que uneix punts amb la mateixa pressió."],["Com es dibuixa un front fred?","Amb triangles blaus."],["Com es dibuixa un front càlid?","Amb semicercles vermells."],["Quin temps fa amb un anticicló?","Estable, sense pluja."],["Què vol dir que les isòbares estiguin molt juntes?","Que bufa vent fort."],["Què és un front oclús?","La unió d'un front fred i un de càlid."]],
 q:[["Si veus una «A» al mapa, quin temps farà?", ["Temps estable i assolellat", "Pluja i tempesta", "Núvols i ruixats"], 0, "Una A és un anticicló: temps estable i assolellat."], ["Els triangles blaus són…", ["un front càlid", "un anticicló", "un front fred"], 2, "El front fred té punxes blaves, com caramells de gel."], ["On bufarà més fort el vent?", ["On les isòbares estan separades", "On les isòbares estan juntes", "On no hi ha isòbares"], 1, "Isòbares molt juntes vol dir vent fort."], ["A l'hemisferi nord, una depressió gira…", ["com les agulles del rellotge", "al revés de les agulles", "sempre cap al nord"], 1, "La depressió gira al revés de les agulles; l'anticicló, com les agulles."], ["Què és una isòbara?", ["Una línia que uneix punts amb la mateixa pressió", "Una línia amb la mateixa temperatura", "Una línia que marca un front fred"], 0, "Iso- vol dir «igual»: la isòbara uneix punts amb la mateixa pressió."], ["Com es dibuixa un front càlid?", ["Amb triangles blaus", "Amb semicercles lila i blaus", "Amb semicercles vermells"], 2, "El càlid té rodones vermelles, com el sol. Els triangles blaus són del fred."], ["Al mapa, un «vent del nord» vol dir que el vent…", ["va cap al nord", "ve del nord", "gira cap al nord"], 1, "El nom del vent diu d'on ve, no cap on va."], ["Un front sempre porta…", ["precipitacions (pluja o neu)", "cel clar", "altes pressions"], 0, "Un front és el xoc de dues masses d'aire i sempre porta precipitacions."]]},

{id:"canvi",practica:"fr-canvi",esquema:{titol:"L'efecte d'hivernacle",html:"<table><tr><td>☀️ El Sol escalfa la Terra</td></tr><tr><td>🌍 La Terra torna part de la calor</td></tr><tr><td style='background:#fef3c7'>🧣 Els gasos (CO₂, metà, fluorats) n'atrapen una part: <b>14 °C</b> de mitjana</td></tr><tr><td style='background:#fee2e2'>🔥 Massa gasos → s'escapa menys calor → <b>escalfament global</b></td></tr></table>"},ic:"🔥",col:"#C0392B",titol:"Efecte d'hivernacle i canvi climàtic",font:"Llibre · seccions 6 i 7",
 idea:"L'efecte d'hivernacle és natural (gràcies a ell la Terra té 14 °C), però hem llançat massa CO₂ i el planeta s'escalfa.",
 pts:["El Sol escalfa el sòl; un 30 % de l'energia es reflecteix.","Els <b>gasos d'efecte d'hivernacle</b> (CO₂, metà, gasos fluorats) atrapen part de la calor.","Sense ell, la Terra seria gelada: de mitjana tenim <b>14 °C</b>.","El <b>CO₂</b> surt de cremar <b>petroli i carbó</b> (indústria, transport, calefaccions), dels incendis i de talar boscos.","Més gasos → s'escapa menys calor → <b>escalfament global</b> → <b>canvi climàtic</b>.","Conseqüències: inundacions, desertificació, glaceres que es fonen, huracans.","Cimeres: <b>Kyoto 1997</b>, <b>París 2015</b> (2 °C), <b>Madrid 2019</b>, <b>Glasgow 2021</b> (1,5 °C). <b>ODS 13</b>: Acció pel clima."],
 truc:"L'efecte d'hivernacle és una <b>manta</b>: una va bé, cinc et fan suar. Gasos: «<b>C</b>om <b>M</b>és <b>F</b>um» (CO₂, Metà, Fluorats). Cimeres: «<b>Ki-Pa-Ma-Gla</b>».",
 compte:"L'ozó NO és un gas d'efecte d'hivernacle del llibre: ozó = capa protectora; hivernacle = CO₂, metà i fluorats.",
 fc:[["Quina temperatura mitjana té la Terra gràcies a l'efecte d'hivernacle?","14 °C."],["Quin és el principal gas que emetem?","El diòxid de carboni (CO₂)."],["D'on surt el CO₂?","De cremar petroli i carbó (indústria, transport, calefaccions)."],["Què es va acordar a París (2015)?","Que la temperatura no pugi més de 2 °C."],["I a Glasgow (2021)?","Quedar per sota d'1,5 °C."],["Què és l'ODS 13?","Acció pel clima."]],
 q:[["Quin d'aquests és un gas d'efecte d'hivernacle?", ["Oxigen", "Metà", "Nitrogen"], 1, "El metà, amb el CO₂ i els gasos fluorats. L'ozó és la capa protectora."], ["L'efecte d'hivernacle natural és…", ["necessari", "sempre dolent", "un invent humà"], 0, "És necessari: gràcies a ell la Terra té 14 °C de mitjana."], ["Quina cimera va ser la primera?", ["París", "Glasgow", "Kyoto (1997)"], 2, "Kyoto, el 1997. Recorda «Ki-Pa-Ma-Gla»."], ["Talar boscos fa que…", ["hi hagi menys CO₂", "no canviï res", "hi hagi més CO₂"], 2, "Talar boscos és una de les causes de l'augment de CO₂."], ["Quina temperatura mitjana té la Terra gràcies a l'efecte d'hivernacle?", ["Uns 14 °C", "4 °C", "24 °C"], 0, "Uns 14 °C; sense aquesta «manta», la Terra seria gelada."], ["Què es va acordar a la cimera de París (2015)?", ["Que la temperatura pugi 4 °C com a màxim", "Que la temperatura pugi ben menys de 2 °C i, si es pot, no més d'1,5 °C", "Prohibir els cotxes de gasolina"], 1, "A París (2015) es va acordar que la temperatura pugi ben menys de 2 °C i intentar que no passi d'1,5 °C."], ["D'on surt la major part del CO₂ que emetem?", ["De la capa d'ozó", "De la respiració dels arbres", "De cremar petroli i carbó"], 2, "Surt de cremar petroli i carbó: indústria, transport i calefaccions."], ["Quin és l'ODS que parla de l'acció pel clima?", ["ODS 3", "ODS 13", "ODS 15"], 1, "L'ODS 13 és «Acció pel clima»."]]},

{id:"relleu",practica:"fr-anoia",ic:"🏔️",col:"#7F8C8D",titol:"El relleu de l'Anoia",font:"Apunts · geografia",
 idea:"El relleu és el resultat de forces internes (aixequen) i externes (desgasten). La conca d'Òdena és un «bol» excavat; la Tossa és una muntanya resistent.",
 pts:["<b>Relleu</b>: conjunt de formes de l'escorça de la Terra.","<b>Forces internes</b>: les plaques tectòniques es mouen i aixequen serralades.","<b>Forces externes</b>: aigua, vent, pluja i gel desgasten les roques: <b>erosió</b>.","<b>Conca d'Òdena</b>: depressió (zona més baixa) excavada en roques toves (<b>argiles i guixos</b>). Igualada és al fons.","<b>Tossa de Montbui</b> (~620 m): roques <b>calcàries</b> dures que no s'han desgastat: <b>relleu residual</b>."],
 truc:"La conca és un <b>bol de sopa</b>; la Tossa és un <b>escut</b> de roca dura.",
 compte:"Forces <b>internes</b> = de dins (aixequen). <b>Externes</b> = de fora (desgasten).",
 fc:[["Què és el relleu?","El conjunt de formes de l'escorça de la Terra."],["Què és l'erosió?","El desgast de les roques per l'aigua, el vent, la pluja i el gel."],["Què és una conca o depressió?","Una zona més baixa que el terreny del voltant."],["De quines roques era la conca d'Òdena?","De roques toves: argiles i guixos."],["Per què la Tossa no s'ha desgastat?","Perquè té roques calcàries dures."],["Com es diu un relleu que resisteix l'erosió?","Relleu residual (turó testimoni)."]],
 q:[["Les plaques tectòniques són una força…", ["externa", "interna", "marina"], 1, "Venen de l'interior del planeta i aixequen serralades: són forces internes."], ["La conca d'Òdena es va formar per…", ["l'erosió de roques toves", "l'aixecament de plaques", "l'impacte d'un meteorit"], 0, "L'aigua va desgastar les argiles i els guixos, i va excavar el «bol»."], ["La Tossa de Montbui té roques…", ["calcàries dures", "argiles i guixos tous", "toves i fàcils de desgastar"], 0, "Les calcàries són molt resistents; per això la Tossa ha quedat alta."], ["El vent i la pluja són forces…", ["internes", "tectòniques", "externes (desgasten)"], 2, "Són forces externes: desgasten les roques des de fora."], ["Com es diu el desgast de les roques per l'aigua, el vent i el gel?", ["Relleu", "Tectònica", "Erosió"], 2, "És l'erosió, la feina de les forces externes."], ["Què és una conca o depressió?", ["Una zona plana dalt d'una muntanya", "Una zona més baixa que el voltant", "Un riu que desemboca en un altre"], 1, "Una depressió és una zona més baixa que el terreny del voltant, com un bol."], ["Com es diu un relleu que ha resistit l'erosió, com la Tossa?", ["Depressió", "Relleu residual", "Relleu volcànic"], 1, "És un relleu residual (turó testimoni): les roques dures no s'han desgastat."], ["Què és el relleu?", ["El desgast de les roques per l'aigua i el vent", "El moviment de les plaques de l'interior", "El conjunt de formes de l'escorça terrestre"], 2, "El relleu és el conjunt de formes de l'escorça; el desgast és l'erosió."]]},

{id:"riu",practica:"fr-anoia",ic:"💧",col:"#1ABC9C",titol:"El riu Anoia",font:"Apunts · geografia",
 idea:"El riu Anoia recull l'aigua de la conca i és un afluent del Llobregat, amb un cabal mediterrani irregular.",
 pts:["<b>Hidrografia</b>: estudia l'aigua de la superfície (rius, llacs, mars).","<b>Conca hidrogràfica</b>: territori on l'aigua de pluja va a parar a un mateix riu. La separen les <b>divisòries d'aigües</b>.","L'Anoia neix a la Segarra (per sobre de Calaf).","<b>Cabal</b>: aigua que passa per un punt en un segon. A l'Anoia és <b>irregular</b>.","<b>Estiatge</b>: a l'estiu baixa gairebé sec. <b>Riuades</b>: crescudes fortes a la tardor.","És <b>afluent del Llobregat</b>: s'hi uneix a Martorell."],
 truc:"Un <b>afluent</b> és un riu que «aflueix» a un altre més gran, no al mar.",
 compte:"Conca d'Òdena (relleu, un bol) ≠ conca hidrogràfica (tot el territori que porta aigua a un riu).",
 fc:[["Què és una conca hidrogràfica?","El territori on l'aigua de pluja va a parar a un mateix riu."],["Què és el cabal?","La quantitat d'aigua que passa per un punt del riu en un segon."],["Què és l'estiatge?","Quan el riu baixa gairebé sec, a l'estiu."],["On neix el riu Anoia?","A la Segarra, per sobre de Calaf."],["El riu Anoia desemboca al mar?","No, és afluent del Llobregat (a Martorell)."],["Què separa dues conques hidrogràfiques?","Les divisòries d'aigües (les carenes)."]],
 q:[["El riu Anoia s'uneix al riu…", ["Ebre", "Llobregat", "Ter"], 1, "S'uneix al Llobregat, a Martorell."], ["El cabal de l'Anoia és…", ["molt regular", "sempre gran", "irregular"], 2, "És un cabal mediterrani i irregular: estiatge a l'estiu i riuades a la tardor."], ["A l'estiu el riu baixa gairebé sec. Com es diu?", ["Estiatge", "Riuada", "Desembocadura"], 0, "És l'estiatge: a l'estiu el riu porta molt poca aigua."], ["Un riu que desemboca en un altre riu és…", ["un afluent", "un delta", "un estiatge"], 0, "Un afluent «aflueix» a un riu més gran, no al mar."], ["On neix el riu Anoia?", ["A la Segarra, per sobre de Calaf", "A Martorell", "Al fons de la conca d'Òdena"], 0, "Neix a la Segarra, per sobre de Calaf. A Martorell és on s'acaba."], ["Què és el cabal d'un riu?", ["La llargada del riu des que neix fins al final", "L'aigua que passa per un punt en un segon", "L'amplada del riu en un punt"], 1, "El cabal és la quantitat d'aigua que passa per un punt en un segon."], ["Què separa dues conques hidrogràfiques?", ["Els afluents", "Les divisòries d'aigües", "Les desembocadures"], 1, "Les divisòries d'aigües (les carenes) fan de frontera entre conques."], ["En quina època fa riuades el riu Anoia?", ["A la primavera", "A l'estiu", "A la tardor"], 2, "Les crescudes fortes arriben a la tardor; a l'estiu hi ha estiatge."]]},

{id:"climaig",practica:"cl-compara",ic:"🌫️",col:"#5D6D7E",titol:"El clima d'Igualada",font:"Apunts · geografia",
 idea:"Igualada té un clima mediterrani continentalitzat: hiverns freds amb boira i estius molt calorosos.",
 pts:["La <b>Serralada Prelitoral</b> fa de paret i no deixa entrar la brisa humida del mar: <b>continentalitat</b>.","<b>Inversió tèrmica</b>: l'aire fred pesa més i baixa al fons de la conca; fa més fred a Igualada que a dalt de la Tossa.","Es forma la <b>boira de fondalada</b> i hi ha <b>glaçades</b>.","Hivern: fred i humit, sota 0 °C. Estiu: molt calorós i sec, fins a uns 38 °C.","És el factor «distància al mar» del llibre, reforçat per les muntanyes."],
 truc:"«L'aire fred pesa més i rellisca avall, com l'aigua en un bol».",
 compte:"Normalment, com més amunt més fred. Amb la <b>inversió tèrmica</b> passa al revés: fa més fred a baix.",
 fc:[["Quin clima té Igualada?","Mediterrani continentalitzat."],["Què fa la Serralada Prelitoral?","Fa de barrera i no deixa entrar la brisa del mar."],["Què és la inversió tèrmica?","Quan fa més fred a baix (a la conca) que a dalt (a la Tossa)."],["Per què passa?","Perquè l'aire fred pesa més i baixa al fons de la conca."],["Quina boira es forma?","La boira de fondalada."],["Com són els estius a Igualada?","Molt calorosos i secs (fins a uns 38 °C)."]],
 q:[["A Igualada, a l'hivern, fa més fred…", ["a dalt de la Tossa de Montbui", "al fons de la conca", "igual a tot arreu"], 1, "Per la inversió tèrmica, l'aire fred baixa al fons de la conca."], ["La continentalitat vol dir…", ["temperatures suaus tot l'any", "hiverns freds i estius calorosos", "molta pluja a l'hivern"], 1, "Lluny de la influència del mar hi ha molt contrast: hiverns freds i estius calorosos."], ["L'aire fred…", ["pesa més i baixa", "pesa menys i puja", "no pesa res"], 0, "Pesa més i rellisca avall, com l'aigua en un bol."], ["Quines muntanyes separen Igualada del mar?", ["El Pirineu, al nord", "La Serralada Prelitoral", "Les muntanyes de la Segarra"], 1, "La Serralada Prelitoral fa de paret i no deixa entrar la brisa humida del mar."], ["Quin clima té Igualada?", ["Mediterrani de costa, suau", "Mediterrani continentalitzat", "De muntanya, amb neu tot l'any"], 1, "Mediterrani continentalitzat: hiverns freds amb boira i estius molt calorosos."], ["Quina boira es forma al fons de la conca?", ["Boira marina de la costa", "Boira de muntanya", "Boira de fondalada"], 2, "La boira de fondalada, perquè l'aire fred s'acumula a baix."], ["Com és l'estiu a Igualada?", ["Fresc i amb molta pluja", "Suau gràcies a la brisa del mar", "Molt calorós i sec"], 2, "Molt calorós i sec, fins a uns 38 °C."], ["Què és la inversió tèrmica?", ["Quan fa més fred a baix que a dalt", "Quan fa més calor a baix", "Quan fa el mateix a tot arreu"], 0, "Normalment, com més amunt més fred; amb la inversió tèrmica passa al revés."]]},

{id:"paisatge",practica:"fr-anoia",ic:"🌲",col:"#229954",titol:"Els paisatges de l'Anoia",font:"Apunts · geografia",
 idea:"El paisatge natural d'alzines i pins s'ha convertit en paisatge humanitzat: camps de secà i el barri industrial del Rec.",
 pts:["<b>Paisatge</b>: part del territori que podem observar (relleu + clima + aigua + éssers vius).","<b>Paisatge natural</b>: sense transformació humana. A l'Anoia: <b>alzines</b>, <b>pins blancs</b>, romaní i farigola.","<b>Paisatge humanitzat</b>: modificat per l'ésser humà.","<b>Agrícola</b>: conreus de <b>secà</b> (només aigua de pluja): cereals, vinya, oliveres.","<b>Urbà i industrial</b>: el <b>Rec</b>, un canal artificial de fa gairebé mil anys per a adoberies i fàbriques (Cal Boyer, Cal Granotes)."],
 truc:"<b>Secà</b> = sec, sense regar, només pluja.",
 compte:"Un bosc plantat per fer fusta ja és paisatge humanitzat, encara que sigui verd.",
 fc:[["Què és un paisatge natural?","El que no ha estat transformat per l'ésser humà."],["Quins arbres té el bosc natural de l'Anoia?","Alzines i pins blancs."],["Què és un conreu de secà?","El que només rep l'aigua de la pluja."],["Digues tres conreus de secà de l'Anoia","Cereals (blat, ordi), vinya i oliveres."],["Què és el Rec d'Igualada?","Un canal artificial per portar aigua a les adoberies i fàbriques."],["Què és un paisatge humanitzat?","El que l'ésser humà ha modificat per viure i produir."]],
 q:[["Un camp de blat és un paisatge…", ["humanitzat", "natural", "de muntanya"], 0, "L'ha creat l'ésser humà per conrear: és paisatge humanitzat."], ["Quins són conreus de secà de l'Anoia?", ["Cereals, vinya i oliveres", "Arròs i hortalisses regades", "Alzines i pins blancs"], 0, "Cereals (blat, ordi), vinya i oliveres: només necessiten l'aigua de la pluja. Les alzines i els pins són bosc natural."], ["El Rec és…", ["un canal artificial", "un riu natural de la conca", "un barri de cases noves"], 0, "És un canal artificial de fa gairebé mil anys per a adoberies i fàbriques."], ["Els conreus de secà…", ["es reguen cada dia amb aigua del riu", "creixen al costat del riu", "només reben l'aigua de la pluja"], 2, "Secà = sec: no es reguen, només tenen l'aigua de la pluja."], ["Quins arbres formen el bosc natural de l'Anoia?", ["Oliveres i ceps de vinya", "Alzines i pins blancs", "Romaní i camps de blat"], 1, "Alzines i pins blancs. Les oliveres i la vinya són conreus."], ["Un bosc plantat per fer fusta és un paisatge…", ["natural, perquè és verd", "humanitzat, perquè l'ha plantat algú", "natural, si no s'hi viu"], 1, "Encara que sigui verd, l'ha plantat l'ésser humà: és humanitzat."], ["Què és un paisatge humanitzat?", ["El que l'ésser humà ha modificat", "El que no ha tocat mai cap persona", "El que té boscos i rius naturals"], 0, "És el paisatge que les persones han canviat per viure i produir."], ["Què és el paisatge?", ["Només els boscos, els rius i les muntanyes", "Les ciutats i els camps que hem construït", "La part del territori que podem observar"], 2, "És tot el territori que veiem: relleu, clima, aigua i éssers vius."]]}
];

const OB=[
{t:"Temps i clima",q:"Explica què és el temps atmosfèric i què és el clima. En què es diferencien? Posa un exemple de cadascun.",
 p:["Temps = estat de l'atmosfera en un lloc i un moment concrets","Clima = estat habitual en un territori gran durant uns 30 anys","Diferència: curt termini i variable / llarg termini i regular","Un exemple de temps (p. ex. «avui plou a Igualada»)","Un exemple de clima (p. ex. «a Igualada els hiverns són freds»)"],
 m:"El temps atmosfèric és l'estat de l'atmosfera en un lloc i un moment concrets, per exemple «avui plou a Igualada». El clima és com és normalment el temps en un territori gran durant molts anys, uns 30, per exemple «a Igualada els hiverns són freds i amb boira». La diferència és que el temps canvia cada dia i el clima es repeteix any rere any."},
{t:"L'atmosfera",q:"Anomena les cinc capes de l'atmosfera de baix a dalt i digues una cosa important de cadascuna.",
 p:["Troposfera: hi passen els fenòmens meteorològics","Estratosfera: hi ha la capa d'ozó","Mesosfera: s'hi desintegren els meteorits","Termosfera: aurores boreals i satèl·lits","Exosfera: transició cap a l'espai","L'ordre correcte de baix a dalt"],
 m:"De baix a dalt: la troposfera, on hi ha els núvols, la pluja i el vent; l'estratosfera, on hi ha la capa d'ozó; la mesosfera, on es desintegren els meteorits; la termosfera, on hi ha les aurores boreals i els satèl·lits; i l'exosfera, que és la transició cap a l'espai."},
{t:"L'atmosfera",q:"Explica les tres funcions de l'atmosfera i què passaria si no existís.",
 p:["Regula la temperatura (evita que de nit es refredi massa)","Protegeix dels meteorits (els desintegra)","Filtra les radiacions nocives del Sol (la capa d'ozó, els ultraviolats)","Diu què passaria sense atmosfera (molt fred de nit, impactes, radiació)"],
 m:"L'atmosfera regula la temperatura, perquè els gasos d'efecte d'hivernacle eviten que la Terra es refredi massa de nit. També ens protegeix dels meteorits, perquè els desintegra abans que arribin a terra. I filtra les radiacions dolentes del Sol: la capa d'ozó atura la major part dels raigs ultraviolats. Sense atmosfera faria un fred terrible de nit, ens cauria de tot del cel i les radiacions ens farien mal."},
{t:"Elements i factors",q:"Quins són els tres factors que fan canviar el clima d'un lloc a un altre? Explica com influeix cadascun en la temperatura.",
 p:["Latitud: com més a prop de l'equador, més calor","Altitud: uns 6 °C menys cada 1 000 m","Distància al mar: a la costa temperatures suaus; a l'interior, més contrast","Posa algun exemple"],
 m:"Els tres factors són la latitud, l'altitud i la distància al mar. Com més a prop de l'equador, més calor fa. Com més amunt, més fred: uns 6 °C menys cada 1 000 metres. I a la costa les temperatures són suaus tot l'any, mentre que lluny del mar els hiverns són més freds i els estius més calorosos, com a Igualada."},
{t:"Elements i factors",q:"Explica el camí de l'aigua des del mar fins que plou. Fes servir les paraules evaporació, condensació i precipitació.",
 p:["El Sol escalfa l'aigua del mar","Evaporació: l'aigua puja com a vapor","Condensació: el vapor es refreda i fa núvols","Precipitació: l'aigua cau (pluja, neu, calamarsa)"],
 m:"El Sol escalfa l'aigua del mar i aquesta s'evapora: puja com a vapor d'aigua. Quan arriba a dalt, el vapor es refreda i es condensa en gotetes que formen els núvols. Quan les gotes es fan grosses i pesants, cauen: és la precipitació, que pot ser pluja, neu o calamarsa."},
{t:"Pressió i vent",q:"Explica pas a pas per què l'aire calent acaba fent pluja i l'aire fred fa temps assolellat.",
 p:["L'aire calent es dilata, pesa menys i puja","Fa baixes pressions (borrasca, D)","El vapor es condensa: núvols i pluja","L'aire fred pesa més i baixa","Fa altes pressions (anticicló, A): cel clar i sec"],
 m:"L'aire calent pesa menys i puja; en pujar s'emporta vapor d'aigua, que es condensa i fa núvols i pluja. Aquestes zones són de baixes pressions o borrasques (D). L'aire fred, en canvi, pesa més i baixa; és un aire sec que fa altes pressions o anticiclons (A), amb cel clar i sense pluja."},
{t:"Pressió i vent",q:"Què és el vent? D'on cap a on bufa? Digues amb quins aparells es mesura i un exemple de cada tipus de vent.",
 p:["Vent = aire en moviment","Bufa de les altes pressions cap a les baixes","Anemòmetre (velocitat, km/h) i penell (direcció)","Planetari (alisis), estacional (monsons), local (tramuntana, garbí)"],
 m:"El vent és l'aire en moviment. Sempre bufa des de les zones d'altes pressions cap a les de baixes pressions. La velocitat es mesura amb l'anemòmetre, en km/h, i la direcció la indica el penell. Hi ha vents planetaris, com els alisis; estacionals, com els monsons; i locals, com la tramuntana o el garbí."},
{t:"Mapes del temps",q:"Compara un anticicló i una depressió: pressió, cap on gira l'aire i quin temps porten.",
 p:["Anticicló: pressió alta (més de 1 013 hPa), màxima al centre","Gira com les agulles del rellotge (hemisferi nord)","Temps estable, sense pluja","Depressió: pressió baixa, mínima al centre","Gira al revés; temps inestable, núvols i pluja"],
 m:"Un anticicló (A) té la pressió alta, més de 1 013 hPa, i el valor més alt al centre; l'aire gira com les agulles del rellotge i porta temps estable i sense pluja. Una depressió o borrasca (D) té la pressió baixa i el valor més baix al centre; l'aire gira al revés i porta núvols, pluja o tempestes."},
{t:"Mapes del temps",q:"Què és un front? Explica com es dibuixen al mapa el front fred, el càlid i l'oclús.",
 p:["Front = xoc entre dues masses d'aire diferents","Sempre porta temps inestable (precipitacions)","Fred: triangles blaus","Càlid: semicercles vermells","Oclús: triangles i semicercles alternats, lila"],
 m:"Un front és la zona on xoquen dues masses d'aire diferents, una de freda i una de calenta, i sempre porta pluja. El front fred es dibuixa amb triangles blaus, el càlid amb semicercles vermells, i l'oclús, que és la unió dels dos, amb triangles i semicercles alternats de color lila."},
{t:"Canvi climàtic",q:"Explica què és l'efecte d'hivernacle, per què és bo i per què ara és un problema.",
 p:["El Sol escalfa la Terra i el sòl torna calor","Els gasos (CO₂, metà, fluorats) n'atrapen una part","És bo: gràcies a ell la Terra té 14 °C de mitjana","Problema: massa CO₂ de cremar petroli i carbó","Conseqüència: escalfament global i canvi climàtic"],
 m:"El Sol escalfa la Terra, i el sòl torna part d'aquesta calor cap amunt. Els gasos d'efecte d'hivernacle, com el CO₂, el metà i els gasos fluorats, n'atrapen una part, com una manta. Això és bo, perquè gràcies a això la Terra té 14 °C de mitjana. El problema és que les persones cremem molt petroli i carbó i hem afegit massa CO₂: s'escapa menys calor, la temperatura puja massa i el clima canvia."},
{t:"Canvi climàtic",q:"Digues tres conseqüències del canvi climàtic i explica què han acordat els països a les cimeres de París i Glasgow.",
 p:["Tres conseqüències (inundacions, desertificació, glaceres que es fonen, huracans)","París 2015: que la temperatura no pugi més de 2 °C","Glasgow 2021: quedar per sota d'1,5 °C","Ajuda als països més pobres o ODS 13"],
 m:"El canvi climàtic provoca inundacions, desertificació i que es fonguin les glaceres, i també huracans més forts. A la cimera de París (2015) els països van acordar evitar que la temperatura pugi més de 2 °C, i a Glasgow (2021) van reforçar-ho per quedar per sota d'1,5 °C i doblar l'ajuda als països més pobres."},
{t:"Relleu de l'Anoia",q:"Explica com es va formar la conca d'Òdena i per què la Tossa de Montbui és més alta.",
 p:["La conca tenia roques toves (argiles i guixos)","L'erosió (aigua de pluja i torrents) les va desgastar","Es va formar una depressió (un «bol») on hi ha Igualada","La Tossa té roques calcàries dures que resisteixen","És un relleu residual"],
 m:"La conca d'Òdena estava plena de roques toves, com les argiles i els guixos. L'aigua de la pluja i dels torrents les va anar desgastant (erosió) i va excavar un gran bol, on avui hi ha Igualada. La Tossa de Montbui, en canvi, té roques calcàries molt dures que l'aigua no ha pogut desgastar; per això ha quedat alta: és un relleu residual."},
{t:"Riu Anoia",q:"Descriu el riu Anoia: on neix, com és el seu cabal durant l'any i on va a parar.",
 p:["Neix a la Segarra (per sobre de Calaf)","Cabal irregular (clima mediterrani)","Estiatge a l'estiu (gairebé sec)","Riuades a la tardor","És afluent del Llobregat (a Martorell)"],
 m:"El riu Anoia neix a la Segarra, per sobre de Calaf, i passa per la conca d'Òdena. Té un cabal irregular: a l'estiu baixa gairebé sec (estiatge) i a la tardor, si hi ha tempestes, pot fer riuades. No arriba al mar: és un afluent del Llobregat i s'hi uneix a Martorell."},
{t:"Clima d'Igualada",q:"Per què a Igualada fa més fred a l'hivern i més calor a l'estiu que a la costa? Explica també què és la inversió tèrmica.",
 p:["La Serralada Prelitoral fa de barrera i no deixa passar la brisa del mar","Continentalitat: molt contrast de temperatures","Inversió tèrmica: l'aire fred pesa més i baixa al fons de la conca","Fa més fred a Igualada que a dalt de la Tossa","Boira de fondalada i glaçades"],
 m:"Igualada està separada del mar per la Serralada Prelitoral, que fa de paret i no deixa entrar la brisa humida i suau del mar. Per això té continentalitat: hiverns freds i estius molt calorosos. A més, a les nits d'hivern l'aire fred, que pesa més, baixa i s'acumula al fons de la conca: fa més fred a Igualada que a dalt de la Tossa. Això és la inversió tèrmica, i fa que hi hagi boira de fondalada i glaçades."},
{t:"Paisatges",q:"Explica la diferència entre paisatge natural i paisatge humanitzat amb exemples de l'Anoia.",
 p:["Natural: sense transformació humana","Exemple natural: bosc d'alzines i pins blancs","Humanitzat: modificat per l'ésser humà","Exemple agrícola: conreus de secà (cereals, vinya, oliveres)","Exemple urbà/industrial: el barri del Rec"],
 m:"Un paisatge natural és el que no ha estat transformat per les persones, com els boscos d'alzines i pins blancs dels turons de l'Anoia. Un paisatge humanitzat és el que les persones han canviat per viure i treballar: per exemple, els camps de secà de cereals, vinya i oliveres de la conca, o el barri del Rec d'Igualada, amb el seu canal artificial i les fàbriques."}
];

// ---- figures i jocs propis de l'assignatura ----
const P=[30,32,58,65,62,50,25,45,70,112,58,60],Tm=[8,9,11,13,17,21,24,24,21,16,11,8],MES=["G","F","M","A","M","J","J","A","S","O","N","D"];
function svgClimo(){
 const W=440,H=262,x0=40,x1=400,y0=222,y1=22,bw=(x1-x0)/12,yp=v=>y0-(v/120)*(y0-y1),yt=v=>y0-(v/30)*(y0-y1);
 let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:480px" font-family="Nunito,Arial,sans-serif"><defs><linearGradient id="clPl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#2563eb"/></linearGradient><filter id="clOm" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#dc2626" flood-opacity=".35"/></filter></defs><rect x="${x0}" y="${y1}" width="${x1-x0}" height="${y0-y1}" rx="6" fill="#f8fafc"/>`;
 for(let g=0;g<=6;g++){const y=y0-g*(y0-y1)/6;s+=`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="${g?"3,4":"0"}"/><text x="${x0-6}" y="${y+4}" font-size="11" text-anchor="end" fill="#dc2626">${g*5}</text><text x="${x1+6}" y="${y+4}" font-size="11" fill="#2563eb">${g*20}</text>`}
 P.forEach((v,i)=>{s+=`<path class="fgB" style="animation-delay:${(i*.04).toFixed(2)}s" d="M${x0+i*bw+4} ${y0}V${yp(v)+Math.min(5,(y0-yp(v))/2)}q0-${Math.min(5,(y0-yp(v))/2)} ${Math.min(5,(y0-yp(v))/2)}-${Math.min(5,(y0-yp(v))/2)}h${bw-8-2*Math.min(5,(y0-yp(v))/2)}q${Math.min(5,(y0-yp(v))/2)} 0 ${Math.min(5,(y0-yp(v))/2)} ${Math.min(5,(y0-yp(v))/2)}V${y0}z" fill="url(#clPl)"/><text x="${x0+i*bw+bw/2}" y="${y0+16}" font-size="12" text-anchor="middle" fill="#334155">${MES[i]}</text>`});
 s+=`<polyline class="fgL" filter="url(#clOm)" fill="none" stroke="#dc2626" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${Tm.map((v,i)=>`${x0+i*bw+bw/2},${yt(v)}`).join(" ")}"/>`;
 Tm.forEach((v,i)=>s+=`<circle class="fgP" style="animation-delay:${(.5+i*.07).toFixed(2)}s" cx="${x0+i*bw+bw/2}" cy="${yt(v)}" r="4" fill="#fff" stroke="#dc2626" stroke-width="2.2"/>`);
 return s+`<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" stroke="#94a3b8" stroke-width="1.5"/><text x="${x0-30}" y="13" font-size="11" fill="#dc2626">°C</text><text x="${x1+2}" y="13" font-size="11" fill="#2563eb">mm</text><text x="${W/2}" y="${H-3}" font-size="12" text-anchor="middle" font-weight="700" fill="#334155">Climograma de Girona (valors aproximats)</text></svg>`;
}

// ⚖️ dos climogrames petits, Girona (P i Tm) i Igualada (valors aproximats), per comparar-los
const IG_T=[6,8,10,12,16,20,24,24,20,14,10,6],IG_P=[30,30,40,50,60,40,20,40,60,60,40,30];
function svgMiniClimo(T,Pp,titol,dx){const x0=dx+28,x1=dx+200,y0=170,y1=20,bw=(x1-x0)/12,yp=v=>y0-(v/120)*(y0-y1),yt=v=>y0-(v/30)*(y0-y1);
 let s=`<rect x="${x0}" y="${y1}" width="${x1-x0}" height="${y0-y1}" fill="#f8fafc"/>`;
 for(let g=0;g<=3;g++){const y=y0-g*(y0-y1)/3;s+=`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#e2e8f0"/><text x="${x0-4}" y="${y+4}" font-size="9" text-anchor="end" fill="#dc2626">${g*10}</text>`}
 Pp.forEach((v,i)=>{s+=`<rect x="${x0+i*bw+2}" y="${yp(v)}" width="${bw-4}" height="${y0-yp(v)}" rx="2" fill="#60a5fa"/><text x="${x0+i*bw+bw/2}" y="${y0+11}" font-size="8" text-anchor="middle" fill="#334155">${MES[i]}</text>`});
 s+=`<polyline fill="none" stroke="#dc2626" stroke-width="2.5" points="${T.map((v,i)=>`${x0+i*bw+bw/2},${yt(v)}`).join(" ")}"/>`;
 return s+`<text x="${(x0+x1)/2}" y="14" font-size="12" font-weight="800" text-anchor="middle" fill="#1e293b">${titol}</text>`}
function svgCompara(){return `<svg viewBox="0 0 430 190" width="100%" style="max-width:520px" font-family="Nunito,Arial,sans-serif" role="img" aria-label="Climogrames de Girona i d'Igualada">${svgMiniClimo(Tm,P,"Girona",0)}${svgMiniClimo(IG_T,IG_P,"Igualada",215)}<text x="215" y="188" font-size="10" text-anchor="middle" fill="#64748b">°C a l'esquerra · barres de pluja (0-120 mm) · valors aproximats</text></svg>`}
// 🌀 mapes del temps esquemàtics: la península, una A (anticicló), una D (depressió) i les isòbares
function svgPeninsula(){return `<path d="M60 70 L150 55 L235 62 L262 85 L250 120 L232 160 L190 190 L120 198 L78 180 L58 140 L52 100 Z" fill="#fef3c7" stroke="#a16207" stroke-width="2"/><text x="150" y="130" font-size="12" text-anchor="middle" fill="#92400e">Península Ibèrica</text><path d="M150 55 L180 20 L300 15 L310 60 L262 85 L235 62 Z" fill="#fef9c3" stroke="#a16207" stroke-width="1.5"/><text x="245" y="38" font-size="11" text-anchor="middle" fill="#92400e">França</text><text x="35" y="230" font-size="11" fill="#1d4ed8">Oceà Atlàntic</text><text x="295" y="240" font-size="11" fill="#1d4ed8">Mar Mediterrani</text>`}
function svgIsobares(cx,cy,vals,pas){return vals.map((v,i)=>`<ellipse cx="${cx}" cy="${cy}" rx="${22+i*pas}" ry="${16+i*pas*.75}" fill="none" stroke="#475569" stroke-width="1.3"/><text x="${cx}" y="${cy-(16+i*pas*.75)-2}" font-size="9" text-anchor="middle" fill="#334155" stroke="#e0f2fe" stroke-width="3" paint-order="stroke">${v}</text>`).join("")}
function svgMapaTemps1(){return `<svg viewBox="0 0 400 250" width="100%" style="max-width:480px" font-family="Nunito,Arial,sans-serif" role="img" aria-label="Mapa del temps amb un anticicló a l'oest i una depressió sobre les Balears"><rect width="400" height="250" fill="#e0f2fe"/>${svgPeninsula()}${svgIsobares(30,120,[1028,1024,1020],26)}${svgIsobares(330,150,[996,1000,1004,1008],13)}<text x="30" y="127" font-size="22" font-weight="900" text-anchor="middle" fill="#1d4ed8">A</text><text x="330" y="157" font-size="22" font-weight="900" text-anchor="middle" fill="#b91c1c">D</text><path d="M330 150 L300 190 L270 230" fill="none" stroke="#2563eb" stroke-width="3"/>${[[316,170],[296,198],[280,222]].map(([x,y])=>`<path d="M${x} ${y} l9 -3 l-3 9 z" fill="#2563eb"/>`).join("")}<path d="M85 125 L280 145" stroke="#0f172a" stroke-width="2" marker-end="url(#mtF)" stroke-dasharray="6 4"/><defs><marker id="mtF" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#0f172a"/></marker></defs></svg>`}
function svgMapaTemps2(){return `<svg viewBox="0 0 400 250" width="100%" style="max-width:480px" font-family="Nunito,Arial,sans-serif" role="img" aria-label="Mapa del temps amb un anticicló sobre la península i una depressió al nord, sobre França"><rect width="400" height="250" fill="#e0f2fe"/>${svgPeninsula()}${svgIsobares(150,125,[1032,1028,1024],22)}${svgIsobares(270,52,[992,996,1000],9)}<text x="150" y="132" font-size="22" font-weight="900" text-anchor="middle" fill="#1d4ed8">A</text><text x="270" y="59" font-size="22" font-weight="900" text-anchor="middle" fill="#b91c1c">D</text><text x="225" y="100" font-size="20">☀️</text><text x="318" y="80" font-size="18">🌧️</text></svg>`}

function svgFront(pts,cal){const d="M"+pts.map(p=>p.join(" ")).join(" L"),col=cal?"#dc2626":"#2563eb";
 // marques al llarg del front, als punts del mig de cada tram: semicercles vermells (càlid) o triangles blaus (fred)
 const m=pts.slice(1).map((q,i)=>{const p=pts[i],x=(p[0]+q[0])/2,y=(p[1]+q[1])/2,a=Math.atan2(q[1]-p[1],q[0]-p[0])*180/Math.PI;
  return `<g transform="translate(${x} ${y}) rotate(${a})">${cal?`<path d="M-6 0 A6 6 0 0 1 6 0 Z" fill="${col}"/>`:`<path d="M-6 0 L0 -9 L6 0 Z" fill="${col}"/>`}</g>`}).join("");
 return `<path d="${d}" fill="none" stroke="${col}" stroke-width="3"/>${m}`}
const MT_SVG=(et,cos)=>`<svg viewBox="0 0 400 250" width="100%" style="max-width:480px" font-family="Nunito,Arial,sans-serif" role="img" aria-label="${et}"><rect width="400" height="250" fill="#e0f2fe"/>${svgPeninsula()}${cos}</svg>`;
const MT_A=(x,y)=>`<text x="${x}" y="${y+7}" font-size="22" font-weight="900" text-anchor="middle" fill="#1d4ed8">A</text>`,MT_D=(x,y)=>`<text x="${x}" y="${y+7}" font-size="22" font-weight="900" text-anchor="middle" fill="#b91c1c">D</text>`;
function svgMapaTemps3(){return MT_SVG("Mapa del temps amb una borrasca a l'Atlàntic, al nord-oest, amb un front càlid i un de fred, i un anticicló al Mediterrani",
 `${svgIsobares(40,95,[988,992,996,1000],14)}${svgIsobares(345,160,[1024,1020],24)}${svgFront([[52,100],[95,108],[140,115]],1)}${svgFront([[40,110],[48,150],[60,190]],0)}${MT_D(40,95)}${MT_A(345,160)}<text x="100" y="92" font-size="18">🌧️</text><text x="292" y="100" font-size="18">☀️</text>`)}
function svgMapaTemps4(){return MT_SVG("Mapa del temps amb un anticicló al nord-est, sobre Europa, i una depressió al Mediterrani, davant de la costa, amb vent de llevant",
 `${svgIsobares(345,48,[1028,1024],18)}${svgIsobares(318,178,[1000,1004,1008],15)}${MT_A(345,48)}${MT_D(318,178)}<path d="M335 122 L272 98" stroke="#0f172a" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#mtL)"/><defs><marker id="mtL" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#0f172a"/></marker></defs><text x="352" y="114" font-size="10" font-weight="800" text-anchor="middle" fill="#0f172a" stroke="#e0f2fe" stroke-width="3" paint-order="stroke">llevant</text><text x="236" y="112" font-size="18">🌧️</text><text x="80" y="110" font-size="18">⛅</text>`)}
function svgMapaTemps5(){return MT_SVG("Mapa del temps d'hivern amb un anticicló gran sobre la península i les isòbares molt separades",
 `${svgIsobares(150,102,[1036,1032,1028],38)}${MT_A(150,102)}<text x="185" y="165" font-size="18">🌫️</text><text x="95" y="100" font-size="18">☀️</text>`)}

// 👾 Boss del món (Bona Nota 2.0): nom i monstre del repte final
ASSIG.boss={nom:"La Gran Borrasca",spr:"borrasca",fx:"tempesta",mus:"primavera",rotul:"SURT EL SOL!",em:["🌈","☀️","🌤️","🍃"]};

//@inclou eines/vistes-mates.js
//@inclou eines/exercicis-mates.js
//@inclou eines/clima.js
