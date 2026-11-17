// ===================== 🇪🇸 INTERFÍCIE EN CASTELLÀ DINS DEL MÓN (motor/eines/ui-es.js) =====================
// Al món de Castellano, els textos del motor que surten DINS del contingut (#app: activitats, jocs, test, inici, «Com vaig»)
// passen al castellà. La capçalera i el menú es queden en català, iguals a tots els mons.
// S'inclou a les dades del món amb  //@inclou eines/ui-es.js  (només als mons en castellà).
// Com funciona: un MutationObserver mira el que s'afegeix a #app i canvia les frases del motor (UIES, de més llarga a més
// curta) als nodes de text i als atributs aria-label, title i placeholder. El contingut del món ja és en castellà i no es toca.
// Per afegir una frase: una entrada [català, castellà] o [/regex/, "castellà amb $1"]. Prova: motor/prova-ui-es.js.
const UIES=[
 // --- frases amb buits
 ["Toca la paraula que falta.","Toca la palabra que falta."],["Escriu la paraula que falta.","Escribe la palabra que falta."],
 ["Escriu el verb del parèntesi en la forma correcta.","Escribe el verbo del paréntesis en la forma correcta."],
 ["Toca les paraules en ordre per fer la frase.","Toca las palabras en orden para formar la frase."],
 ["Omple els buits tocant les paraules del banc. Per començar per un altre buit, toca'l primer.","Rellena los huecos tocando las palabras del banco. Para empezar por otro hueco, tócalo primero."],
 ["Omple els buits d'un en un, en ordre, tocant les paraules del banc.","Rellena los huecos uno a uno, en orden, tocando las palabras del banco."],
 ["Omple aquest buit","Rellena este hueco"],["❌ No és aquesta.","❌ No es esta."],["No és aquesta.","No es esta."],["Torna-ho a provar.","Vuelve a intentarlo."],
 ["❌ Encara no.","❌ Todavía no."],["✏️ Primer escriu la resposta.","✏️ Primero escribe la respuesta."],
 [/Comença per «([^»]*)» i són (\d+) paraules\./g,"Empieza por «$1» y son $2 palabras."],[/Comença per «([^»]*)» i és una sola paraula\./g,"Empieza por «$1» y es una sola palabra."],
 ["👉 Aquí hi va","👉 Aquí va"],["Continua amb els altres.","Sigue con los demás."],["Continua amb el següent.","Sigue con el siguiente."],
 ["👉 Fixa-t'hi bé: així queda la frase.","👉 Fíjate bien: así queda la frase."],[/Tu has escrit «/g,"Tú has escrito «"],
 ["✅ Molt bé! Bé a la primera.","✅ ¡Muy bien! A la primera."],["Escolta-la primer","Escúchala primero"],["Escolta-la","Escúchala"],
 ["🎤 Ara digues-la tu en veu alta, un cop.","🎤 Ahora dila tú en voz alta, una vez."],["🗣️ Què vol dir?","🗣️ ¿Qué significa?"],["En català:","En catalán:"],
 ["🔎 Hi falta:","🔎 Falta:"],["Següent frase ▶","Siguiente frase ▶"],["Veure el resultat 🏁","Ver el resultado 🏁"],
 ["👀 Fixa't en la paraula subratllada.","👀 Fíjate en la palabra subrayada."],["👆 Tria","👆 Elige"],["⌨️ Escriu","⌨️ Escribe"],["🔀 Ordena","🔀 Ordena"],
 ["Escriu aquí","Escribe aquí"],["Escriu la resposta","Escribe la respuesta"],[/^Frase (\d+) de (\d+)$/g,"Frase $1 de $2"],
 ["Has completat","Has completado"],["bé a la primera i","bien a la primera y"],["bé a la primera","bien a la primera"],
 ["amb algun error. Les fallades tornaran a «🔁 Repassa els teus errors».","con algún error. Las falladas volverán a «🔁 Repasa tus errores»."],
 ["amb algun error","con algún error"],["Les fallades tornaran a «🔁 Repassa els teus errors»","Las falladas volverán a «🔁 Repasa tus errores»"],
 ["✍️ Frases que et van enganyar","✍️ Frases que te engañaron"],
 // --- pinta les paraules
 ["Tria un color i toca les paraules per pintar-les. Quan les tinguis totes, comprova.","Elige un color y toca las palabras para pintarlas. Cuando las tengas todas, comprueba."],
 ["🖍️ Pinta","🖍️ Pinta"],["sense pintar","sin pintar"],["Color per pintar","Color para pintar"],["✏️ Encara hi ha paraules sense pintar.","✏️ Todavía hay palabras sin pintar."],
 [/Hi ha 1 paraula mal pintada \(en vermell\)\./g,"Hay 1 palabra mal pintada (en rojo)."],[/Hi ha (\d+) paraules mal pintades \(en vermell\)\./g,"Hay $1 palabras mal pintadas (en rojo)."],
 [/Mira «([^»]*)» un altre cop: quin paper hi fa\?/g,"Mira «$1» otra vez: ¿qué papel tiene?"],["✅ Ara sí!","✅ ¡Ahora sí!"],["👉 Fixa-t'hi bé: així queda pintada.","👉 Fíjate bien: así queda pintada."],
 [/Has pintat /g,"Has pintado "],
 // --- jocs, test i resultats
 ["Comprova ✔","Comprobar ✔"],["Comprova la meva resposta","Comprobar mi respuesta"],["Acaba 🏁","Terminar 🏁"],["Torna-hi","Otra vez"],["Altres jocs","Otros juegos"],
 ["Següent →","Siguiente →"],["Següent ›","Siguiente ›"],["Següent ▶","Siguiente ▶"],["‹ Anterior","‹ Anterior"],["← Temes","← Temas"],
 ["Molt bé!","¡Muy bien!"],["Gairebé!","¡Casi!"],["💡 Pista","💡 Pista"],["🤔 Pregunta confusa?","🤔 ¿Pregunta confusa?"],[/^Pregunta (\d+) de (\d+) · encertades (\d+)/g,"Pregunta $1 de $2 · aciertos $3"],
 [/encertades/g,"aciertos"],["tria ·","elige ·"],["següent","siguiente"],["gira ·","gira ·"],["Espai","Espacio"],["⚡ difícil","⚡ difícil"],["Pregunta difícil: compta per al super combo","Pregunta difícil: cuenta para el supercombo"],
 ["toca per girar","toca para girar"],["toca per tornar","toca para volver"],[/Targeta (\d+) de (\d+)\. Toca o prem Espai per girar/g,"Tarjeta $1 de $2. Toca o pulsa Espacio para girar"],[/^Targeta (\d+) de (\d+)$/g,"Tarjeta $1 de $2"],
 ["← Anterior","← Anterior"],["Ara les targetes →","Ahora las tarjetas →"],["✍️ Practica-ho amb frases","✍️ Practícalo con frases"],[/✏️ Practica-ho com a classe:/g,"✏️ Practícalo como en clase:"],
 ["Escolta la fitxa","Escucha la ficha"],["Escolta-ho en veu alta","Escúchalo en voz alta"],["Escolta","Escucha"],["IDEA CLAU","IDEA CLAVE"],["Truc:","Truco:"],["Compte:","Ojo:"],
 ["Passos del tema","Pasos del tema"],["Tema anterior","Tema anterior"],["Tema següent","Tema siguiente"],["Fitxa","Ficha"],["Targetes","Tarjetas"],["ESQUEMA","ESQUEMA"],
 [/^Tema (\d+) de (\d+) · /g,"Tema $1 de $2 · "],
 ["Escriu aquí la teva resposta amb les teves paraules…","Escribe aquí tu respuesta con tus palabras…"],["✏️ Escriu una mica més: com a mínim 6 paraules.","✏️ Escribe un poco más: como mínimo 6 palabras."],
 ["👀 Veure la resposta model","👀 Ver la respuesta modelo"],["Escolta la resposta model","Escucha la respuesta modelo"],
 // --- exàmens i repàs
 ["10 preguntes de tots els temes. No sabràs si l'encertes fins al final. Pots tornar enrere i canviar respostes.","10 preguntas de todos los temas. No sabrás si aciertas hasta el final. Puedes volver atrás y cambiar respuestas."],
 ["Les que fallis aniran al teu «🔁 Repassa els teus errors».","Las que falles irán a tu «🔁 Repasa tus errores»."],["⏳ Sense temps","⏳ Sin tiempo"],["⏱ Amb temps: 10 minuts","⏱ Con tiempo: 10 minutos"],["Comença l'examen ▶","Empieza el examen ▶"],
 ["🔁 Repassa els teus errors","🔁 Repasa tus errores"],
 ["Preguntes que vas fallar. Cada una que encertes avui: +1 ⭐. Tornarà d'aquí a uns dies; si l'encertes 3 vegades, ja l'has après (+2 ⭐)! 🧠","Preguntas que fallaste. Cada una que aciertes hoy: +1 ⭐. Volverá dentro de unos días; si la aciertas 3 veces, ¡ya la has aprendido (+2 ⭐)! 🧠"],
 ["📝 Exàmens","📝 Exámenes"],["15 preguntes de tot","15 preguntas de todo"],["10 preguntes · nota sobre 10","10 preguntas · nota sobre 10"],["Examen de veritat","Examen de verdad"],
 [/🔒 Per obrir-lo: aprova (\d+) dels (\d+) temes \(ara: (\d+)\) o treu un 70 % en un examen/g,"🔒 Para abrirlo: aprueba $1 de los $2 temas (ahora: $3) o saca un 70 % en un examen"],
 ["Nou","Nuevo"],["NOU","NUEVO"],
 // --- inici
 ["👾 Tria el teu perfil arcade","👾 Elige tu perfil arcade"],["El teu perfil: canvia l'animal i la insígnia","Tu perfil: cambia el animal y la insignia"],["Canvia el teu perfil","Cambia tu perfil"],
 ["Comencem pel primer tema?","¿Empezamos por el primer tema?"],["estrelles","estrellas"],["temes","temas"],["encerts","aciertos"],
 [/Et falten (\d+) ⭐ per a /g,"Te faltan $1 ⭐ para "],["🌿 Repàs lliure, sense pressa","🌿 Repaso libre, sin prisa"],
 ["Entra quan et vingui de gust per mantenir fresc el que ja saps, al teu ritme.","Entra cuando te apetezca para mantener fresco lo que ya sabes, a tu ritmo."],
 [/^Comença per: /g,"Empieza por: "],["Vés-hi →","Ve →"],["🎯 Missions d'avui","🎯 Misiones de hoy"],[/(\d+) de 3 · \+3 ⭐ cada una · les 3: \+5 ⭐ més/g,"$1 de 3 · +3 ⭐ cada una · las 3: +5 ⭐ más"],
 ["Respon una pregunta oberta","Responde una pregunta abierta"],["Juga 2 jocs diferents","Juega 2 juegos diferentes"],["Encerta 10 preguntes","Acierta 10 preguntas"],
 ["Preguntes obertes d'examen","Preguntas abiertas de examen"],["Preguntes per desenvolupar","Preguntas para desarrollar"],[/(\d+) preguntes · escriu i compara amb la resposta model/g,"$1 preguntas · escribe y compara con la respuesta modelo"],
 [/^Pregunta (\d+) de (\d+) · /g,"Pregunta $1 de $2 · "],["✨ Efectes suaus: NO","✨ Efectos suaves: NO"],["✨ Efectes suaus: SÍ","✨ Efectos suaves: SÍ"],["📊 Veure com vaig","📊 Ver cómo voy"],["🚪 Tots els mons","🚪 Todos los mundos"],
 [/^Hola, /g,"¡Hola, "],
 // --- nivells i final dels jocs
 [/Nivell (\d+)/g,"Nivel $1"],["Llegenda d'or","Leyenda de oro"],[/\bAprenent\b/g,"Aprendiz"],[/\bSavi\b/g,"Sabio"],[/\bExpert\b/g,"Experto"],[/\bMestre\b/g,"Maestro"],[/\bCampió\b/g,"Campeón"],[/\bHeroi\b/g,"Héroe"],[/\bLlegenda\b/g,"Leyenda"],
 [/🎉 Fet \(amb (\d+) errors?\)!/g,"🎉 ¡Hecho (con $1 errores)!"],["🎉 Fet!","🎉 ¡Hecho!"],
 // --- com vaig
 [/^Com va /g,"Cómo va "],["Temes aprovats","Temas aprobados"],[/(\d+) sense fer/g,"$1 sin hacer"],["Encert als tests","Aciertos en los tests"],[/(\d+) tests fets/g,"$1 tests hechos"],
 ["Preguntes obertes","Preguntas abiertas"],["cap encara","ninguna todavía"],["Temps d'estudi","Tiempo de estudio"],[/^(\d+) dies?$/g,"$1 días"],["Nivell","Nivel"],["Estrelles","Estrellas"],
 [/(\d+) examens sorpresa/g,"$1 exámenes sorpresa"],["🚀 Tot just comencem","🚀 Acabamos de empezar"],["Què li recomano ara:","Qué le recomiendo ahora:"],["Començar els temes pendents:","Empezar los temas pendientes:"],
 ["🏁 Com vas","🏁 Cómo vas"],["Encara no has fet cap test","Todavía no has hecho ningún test"],["Fes-ne un i et diré si vas ràpid i bé.","Haz uno y te diré si vas rápido y bien."],
 ["⭐ D'on surten les estrelles","⭐ De dónde salen las estrellas"],[/entre tots els mons/g,"entre todos los mundos"],[/superestrelles/g,"superestrellas"],["ets aquí","estás aquí"],["⭐ per a ","⭐ para "],["Et falten","Te faltan"],
 ["⭐ On guanyes les estrelles","⭐ Dónde ganas las estrellas"],[/(\d+) en aquest món/g,"$1 en este mundo"],["Tests dels temes","Tests de los temas"],["Jocs","Juegos"],["Triple combo (obertes)","Triple combo (abiertas)"],
 ["Super combo (difícils)","Supercombo (difíciles)"],["Combos (ratxes)","Combos (rachas)"],["Rècords millorats","Récords mejorados"],["Repàs dels errors","Repaso de los errores"],["Boss del món","Jefe del mundo"],
 ["Encara cap estrella. Fes el primer test i mira com volen! ✨","Todavía ninguna estrella. ¡Haz el primer test y mira cómo vuelan! ✨"],
 ["🎮 joc +1","🎮 juego +1"],["🔁 error corregit +1 · après +2","🔁 error corregido +1 · aprendido +2"],["🎯 missió +3 · les 3 +5","🎯 misión +3 · las 3 +5"],["🏅 rècord +2","🏅 récord +2"],
 ["🏅 Nivells","🏅 Niveles"],["Cada encert als tests, als jocs i a les preguntes obertes suma ⭐, i les ⭐ fan pujar de nivell.","Cada acierto en los tests, los juegos y las preguntas abiertas suma ⭐, y las ⭐ hacen subir de nivel."],
 ["Tema per tema","Tema por tema"],["Millor","Mejor"],["Últim","Último"],["Ell diu","Él dice"],["sense fer","sin hacer"],["menys del 50% ·","menos del 50% ·"],["80% o més ·","80% o más ·"],
 ["❌ Preguntes que més falla","❌ Preguntas que más falla"],["🔁 Al repàs:","🔁 En el repaso:"],[/preguntes pendents \((\d+) per avui\) · 🏅 apreses del tot:/g,"preguntas pendientes ($1 para hoy) · 🏅 aprendidas del todo:"],
 ["Encara cap error registrat. 👌","Todavía ningún error registrado. 👌"],["Encara no n'ha fet cap.","Todavía no ha hecho ninguno."],["Jocs i examen","Juegos y examen"],["Joc","Juego"],["Vegades","Veces"],
 [/Cada nom té el seu progrés, guardat amb el seu nom i PIN\. Data: /g,"Cada nombre tiene su progreso, guardado con su nombre y PIN. Fecha: "],
 [/ encara no ha fet cap test\. El millor és començar pel primer tema: fitxa → targetes → test\./g," todavía no ha hecho ningún test. Lo mejor es empezar por el primer tema: ficha → tarjetas → test."]
];
// les cadenes es comparen senceres o com a tros (les més llargues primer); les regex, tal com són
const UIES_ORD=UIES.slice().sort((a,b)=>(typeof b[0]==="string"?b[0].length:0)-(typeof a[0]==="string"?a[0].length:0));
// una paraula sola (sense espais) només es canvia si és tot el text del node: «temes» no ha de tocar «tú temes»
function uiEs(t){if(!t||!/[a-zàèéíòóúç]/i.test(t))return t;let r=t;const tr=t.trim();
 for(const [a,b] of UIES_ORD){if(typeof a==="string"){if(!/\s/.test(a)&&!/[^\p{L}'-]/u.test(a)){if(tr===a)return t.replace(a,b)}else if(r.includes(a))r=r.split(a).join(b)}else{a.lastIndex=0;r=r.replace(a,b)}}return r}
function uiEsNode(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const ns=[];while(n=w.nextNode())ns.push(n);
 ns.forEach(x=>{const v=x.nodeValue,t=uiEs(v);if(t!==v)x.nodeValue=t});
 (root.querySelectorAll?[root,...root.querySelectorAll("[aria-label],[title],[placeholder]")]:[]).forEach(e=>{if(!e.getAttribute)return;["aria-label","title","placeholder"].forEach(a=>{const v=e.getAttribute(a);if(v){const t=uiEs(v);if(t!==v)e.setAttribute(a,t)}})})}
(function(){if(typeof document==="undefined"||typeof MutationObserver==="undefined")return;const app=document.getElementById("app");if(!app)return;
 document.documentElement.lang="es";uiEsNode(app);
 new MutationObserver(ms=>{for(const m of ms){if(m.type==="characterData")uiEsNode(m.target.parentNode);else m.addedNodes.forEach(x=>{if(x.nodeType===3){const t=uiEs(x.nodeValue);if(t!==x.nodeValue)x.nodeValue=t}else if(x.nodeType===1)uiEsNode(x)})}}).observe(app,{childList:true,subtree:true,characterData:true})})();
if(typeof module!=="undefined")module.exports={uiEs,UIES};
