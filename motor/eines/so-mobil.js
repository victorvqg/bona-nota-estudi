// ===== SO ALS MÒBILS (motor/eines/so-mobil.js · el mateix codi als mons i a la portada; tot.py el copia a index.html) =====
// Els navegadors només deixen engegar el so dins d'un gest de l'usuari, i en pantalles tàctils «pointerdown» NO compta:
// només pointerup, touchend, click i keydown. Per això hi ha UN sol AudioContext per pàgina (bnSo.context()) i es
// desbloqueja al primer d'aquests gestos: resume() + un buffer buit d'1 mostra (el truc d'iOS). Si el mòbil el posa en
// pausa («suspended» o «interrupted»: una trucada, canviar d'app…), es torna a engegar en tornar a la pàgina o al toc següent.
// IPHONE EN SILENCI (n2429, comprovat amb prova-so.html en un iPhone): amb el mòbil en silenci, Web Audio calla del tot encara
// que el context estigui «running», i navigator.audioSession no hi fa res. Un element <audio> sí que sona, i mentre n'hi ha un
// sonant, Web Audio també. Per això, a l'iPhone/iPad, al primer toc s'engega un <audio> de silenci en bucle (fet aquí mateix,
// sense fitxers) i s'atura quan la pàgina no es veu o quan el so de l'app està apagat (bnSo.sessio(false)).
const bnSo=(()=>{let ctx=null,armat=false,tocat=false,volOn=true,mut=null;const pendents=[],EV=["pointerup","touchend","click","keydown"],OP={capture:true,passive:true};
 const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
 const resum=c=>{try{const p=c.resume();if(p&&p.catch)p.catch(()=>{})}catch(e){}};
 function context(){if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{ctx=new C()}catch(e){return null}
   try{ctx.addEventListener("statechange",()=>{if(ctx.state!=="running"&&ctx.state!=="closed")arma()})}catch(e){}}
  return ctx}
 // mig segon de silenci en WAV (8 kHz, mono): l'<audio> que fa que l'iPhone deixi sonar Web Audio en mode silenci
 function silenci(){const sr=8000,n=sr/2,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,"RIFF");v.setUint32(4,36+n*2,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,"data");v.setUint32(40,n*2,true);
  return URL.createObjectURL(new Blob([b],{type:"audio/wav"}))}
 const calMut=()=>IOS&&volOn&&document.visibilityState==="visible";
 function engegaMut(){if(!calMut())return;try{
   if(!mut){mut=new Audio(silenci());mut.loop=true;mut.preload="auto";mut.setAttribute("playsinline","");mut.setAttribute("x-webkit-airplay","deny");mut.disableRemotePlayback=true}
   if(mut.paused){const p=mut.play();if(p&&p.catch)p.catch(()=>arma())}}catch(e){}}
 function aturaMut(){try{if(mut&&!mut.paused)mut.pause()}catch(e){}}
 function gest(){const c=context();
  if(c){if(c.state!=="running")resum(c);try{const s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0)}catch(e){}}
  engegaMut();
  if(!tocat){tocat=true;pendents.splice(0).forEach(f=>{try{f()}catch(e){}})}
  const mutOk=!calMut()||(mut&&!mut.paused);
  if((!c||c.state==="running")&&mutOk)desarma();else if(c&&c.state!=="running"){try{c.resume().then(()=>{if(c.state==="running"&&(!calMut()||(mut&&!mut.paused)))desarma()},()=>{})}catch(e){}}}
 function arma(){if(armat)return;armat=true;EV.forEach(t=>addEventListener(t,gest,OP))}
 function desarma(){if(!armat)return;armat=false;EV.forEach(t=>removeEventListener(t,gest,OP))}
 function torna(){if(ctx&&ctx.state!=="running"&&ctx.state!=="closed"){resum(ctx);arma()}if(tocat&&calMut()){engegaMut();if(mut&&mut.paused)arma()}}
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")torna();else aturaMut()});
 addEventListener("pageshow",torna);
 addEventListener("pagehide",aturaMut);
 arma();
 return {
  context, // el context compartit de la pàgina (el crea si encara no hi és)
  quanSigui(f){if(tocat)f();else pendents.push(f)}, // f s'executa dins del primer gest (o ara mateix, si ja n'hi ha hagut un)
  // so de l'app engegat o apagat: a l'iPhone, engegat = que soni encara que el mòbil estigui en silenci; apagat = res de fons
  sessio(on){volOn=!!on;try{if(navigator.audioSession)navigator.audioSession.type=on?"playback":"auto"}catch(e){}
   if(!on)aturaMut();else if(tocat){engegaMut();if(IOS&&mut&&mut.paused)arma()}}
 }})();
