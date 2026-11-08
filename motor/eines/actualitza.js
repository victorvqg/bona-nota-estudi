// ===== ACTUALITZACIÓ AUTOMÀTICA (motor/eines/actualitza.js · el mateix codi a la portada i als mons; tot.py el copia a index.html) =====
// Cada pàgina porta escrita la versió amb què es va generar (VER: la hi posa motor/tot.py). En obrir la pàgina es pregunta
// al servidor quina versió hi ha publicada (versio.json, sense passar per cap memòria cau). Si no coincideixen, el que es veu
// és una còpia vella (memòria cau del navegador o del service worker). Llavors: s'esborren les còpies guardades de l'app
// (memòria cau «bn-…»), es demana al service worker que s'actualitzi i es torna a carregar la pàgina, UN sol cop per versió.
// MAI s'esborra el progrés, el nom ni el PIN (són a localStorage i no es toquen). Sense connexió, o obrint el fitxer a
// l'ordinador (file://), no fa res.
// En tornar a l'app després de més de 10 minuts amagada: a la portada recarrega sola; dins d'un món, com que el nen pot
// estar a mig test, només surt un avís amb un botó per actualitzar quan vulgui.
(function(){
 const C=window.BN_ACT||{},ARREL=C.arrel||"./",VER="__BN_VERSIO__",KR="bn_act_recarrega",DEU=6e5;
 if(location.protocol==="file:"||VER.indexOf("__")===0||!window.fetch)return;
 let fet=0,amagat=0;
 const quan=f=>document.body?f():document.addEventListener("DOMContentLoaded",f);
 // esborra la memòria cau de l'app i fa que el service worker es descarregui de nou (màxim 3 s)
 const neteja=()=>Promise.race([Promise.all([
   window.caches?caches.keys().then(ks=>Promise.all(ks.filter(k=>k.indexOf("bn-")===0).map(k=>caches.delete(k)))).catch(()=>{}):0,
   navigator.serviceWorker?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.update().catch(()=>{})))).catch(()=>{}):0]),
  new Promise(r=>setTimeout(r,3000))]);
 function avis(txt,boto){quan(()=>{let a=document.getElementById("bnAct");
  if(!a){a=document.createElement("div");a.id="bnAct";a.setAttribute("role","status");
   a.style.cssText="position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:10px;max-width:calc(100% - 24px);padding:10px 14px;border-radius:14px;background:#0b1033f2;border:2px solid #facc15;color:#fff;font:800 14px/1.3 Nunito,system-ui,sans-serif;box-shadow:0 8px 24px #0009";
   document.body.appendChild(a)}
  a.innerHTML="";const t=document.createElement("span");t.textContent=txt;a.appendChild(t);
  if(boto){const b=document.createElement("button");b.type="button";b.textContent="Actualitza";
   b.style.cssText="font:900 13px Nunito,system-ui,sans-serif;color:#1e1b4b;background:#facc15;border:0;border-radius:999px;padding:8px 12px;cursor:pointer";
   b.onclick=()=>recarrega(boto,true);a.appendChild(b)}})}
 // l'adreça sense el «v=…» (la resta de paràmetres, com ?demo, es queden tal qual)
 const senseV=q=>q.replace(/([?&])v=[^&]*(&|$)/,(m,a,b)=>b?a:"").replace(/^\?$/,"");
 function recarrega(v,aMa){
  // una sola vegada per versió (si el servidor encara no serveix la nova, no entra en bucle); amb el botó, sempre
  if(!aMa){if(new RegExp("[?&]v="+v+"(&|$)").test(location.search))return;try{if(sessionStorage.getItem(KR)===v)return;sessionStorage.setItem(KR,v)}catch(e){}}
  avis("🔄 Versió nova de Bona Nota! Actualitzant…");
  const q=senseV(location.search);neteja().then(()=>location.replace(location.pathname+q+(q?"&":"?")+"v="+v+location.hash))}
 // un cop és la versió bona, treu el «?v=…» de l'adreça
 function netejaAdreca(){try{const q=senseV(location.search);if(q!==location.search)history.replaceState(history.state,"",location.pathname+q+location.hash)}catch(e){}}
 function comprova(auto){fet=Date.now();
  fetch(ARREL+"versio.json?t="+fet,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(!d||!d.v)return;
   if(d.v===VER){netejaAdreca();return}
   if(auto)recarrega(d.v);else avis("✨ Hi ha una versió nova de Bona Nota.",d.v)}).catch(()=>{})}
 comprova(true);
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){amagat=Date.now();return}
  if(amagat&&Date.now()-amagat>DEU&&Date.now()-fet>DEU)comprova(!!C.tornaAuto)});
 window.bnActualitza=()=>comprova(true); // per provar-ho a mà des de la consola
})();
