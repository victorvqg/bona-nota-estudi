// ===== SO ALS MÒBILS (motor/eines/so-mobil.js · el mateix codi als mons i a la portada; tot.py el copia a index.html) =====
// Els navegadors només deixen engegar el so dins d'un gest de l'usuari, i en pantalles tàctils «pointerdown» NO compta:
// només pointerup, touchend, click i keydown. Per això hi ha UN sol AudioContext per pàgina (bnSo.context()) i es
// desbloqueja al primer d'aquests gestos: resume() + un buffer buit d'1 mostra (el truc d'iOS). Si el mòbil el posa en
// pausa («suspended» o «interrupted»: una trucada, canviar d'app…), es torna a engegar en tornar a la pàgina o al toc següent.
// A l'iPhone, el so de Web Audio calla amb l'interruptor de silenci: bnSo.sessio(true) posa navigator.audioSession en
// «playback» perquè soni igualment mentre el so de l'app estigui engegat (l'app ja té el seu botó per apagar-lo).
const bnSo=(()=>{let ctx=null,armat=false,tocat=false;const pendents=[],EV=["pointerup","touchend","click","keydown"],OP={capture:true,passive:true};
 const resum=c=>{try{const p=c.resume();if(p&&p.catch)p.catch(()=>{})}catch(e){}};
 function context(){if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{ctx=new C()}catch(e){return null}
   try{ctx.addEventListener("statechange",()=>{if(ctx.state!=="running"&&ctx.state!=="closed")arma()})}catch(e){}}
  return ctx}
 function gest(){const c=context();
  if(c){if(c.state!=="running")resum(c);try{const s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0)}catch(e){}}
  if(!tocat){tocat=true;pendents.splice(0).forEach(f=>{try{f()}catch(e){}})}
  if(!c||c.state==="running")desarma();else{try{c.resume().then(()=>{if(c.state==="running")desarma()},()=>{})}catch(e){}}}
 function arma(){if(armat)return;armat=true;EV.forEach(t=>addEventListener(t,gest,OP))}
 function desarma(){if(!armat)return;armat=false;EV.forEach(t=>removeEventListener(t,gest,OP))}
 function torna(){if(ctx&&ctx.state!=="running"&&ctx.state!=="closed"){resum(ctx);arma()}}
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")torna()});
 addEventListener("pageshow",torna);
 arma();
 return {
  context, // el context compartit de la pàgina (el crea si encara no hi és)
  quanSigui(f){if(tocat)f();else pendents.push(f)}, // f s'executa dins del primer gest (o ara mateix, si ja n'hi ha hagut un)
  sessio(on){try{if(navigator.audioSession)navigator.audioSession.type=on?"playback":"auto"}catch(e){}} // so encara que el mòbil estigui en silenci
 }})();
