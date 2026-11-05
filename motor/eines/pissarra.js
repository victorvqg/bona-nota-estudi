// ===================== ✏️ PISSARRA LLIURE (motor/eines/pissarra.js) =====================
// Un full de brut per fer càlculs amb el dit o el llapis, a qualsevol pantalla del món. No es llegeix ni es desa enlloc.
// S'inclou a les dades d'un món amb la línia  //@inclou eines/pissarra.js  (surt un botó ✏️ a baix a la dreta).
let PIS=null;
function pisCss(){if(document.getElementById("pisCss"))return;const s=document.createElement("style");s.id="pisCss";s.textContent=`
#pisBt{position:fixed;right:14px;bottom:18px;z-index:45;width:56px;height:56px;border-radius:50%;border:0;background:#fff;box-shadow:0 4px 14px #0f172a40,0 0 0 3px var(--blau) inset;font-size:26px;cursor:pointer}
@media(max-width:760px){#pisBt{bottom:calc(84px + env(safe-area-inset-bottom))}}
#pisCapa{position:fixed;inset:0;z-index:70;display:none;flex-direction:column}
#pisCapa.on{display:flex}
#pisCapa .barra{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 10px calc(8px + env(safe-area-inset-top)*0);background:#1e293b;color:#fff}
#pisCapa .barra button{border:0;border-radius:10px;padding:8px 11px;font:inherit;font-weight:800;font-size:15px;cursor:pointer;background:#334155;color:#fff}
#pisCapa .barra button.on{background:#fff;color:#0f172a}
#pisCapa .barra .col{width:34px;height:34px;padding:0;border:3px solid #334155}
#pisCapa .barra .col.on{border-color:#fff;box-shadow:0 0 0 2px #38bdf8}
#pisCapa .barra .esp{flex:1}
#pisCapa canvas{flex:1;width:100%;touch-action:none;cursor:crosshair}
#pisCapa.full canvas{background-color:#fffef5;background-image:linear-gradient(#93c5fd66 1px,transparent 1px),linear-gradient(90deg,#93c5fd66 1px,transparent 1px);background-size:26px 26px}
#pisCapa.sobre canvas{background:#ffffff40}
`;document.head.appendChild(s)}
function pisMunta(){if(document.getElementById("pisBt")||typeof ASSIG==="undefined"||!ASSIG.pissarra)return;pisCss();
 const b=document.createElement("button");b.id="pisBt";b.title="Full de brut per fer càlculs";b.setAttribute("aria-label","Obre el full de brut");b.textContent="✏️";b.onclick=pisObre;document.body.appendChild(b);
 const c=document.createElement("div");c.id="pisCapa";c.className="full";c.innerHTML=`<div class="barra">
  <button class="col on" style="background:#0f172a" data-c="#0f172a" aria-label="Negre"></button><button class="col" style="background:#2563eb" data-c="#2563eb" aria-label="Blau"></button><button class="col" style="background:#dc2626" data-c="#dc2626" aria-label="Vermell"></button>
  <button id="pisGoma">🧽 Goma</button><button id="pisDesfes">↶ Desfés</button><button id="pisBuida">🗑 Esborra-ho tot</button>
  <button id="pisFons">🔍 Escriu sobre l'exercici</button><span class="esp"></span><button id="pisTanca">✖ Tanca</button></div><canvas id="pisCv" aria-label="Full de brut"></canvas>`;
 document.body.appendChild(c);
 PIS={traços:[],col:"#0f172a",goma:false,actiu:null,cv:c.querySelector("canvas")};
 c.querySelectorAll(".col").forEach(x=>x.onclick=()=>{PIS.col=x.dataset.c;PIS.goma=false;c.querySelectorAll(".col").forEach(y=>y.classList.toggle("on",y===x));document.getElementById("pisGoma").classList.remove("on")});
 document.getElementById("pisGoma").onclick=e=>{PIS.goma=!PIS.goma;e.currentTarget.classList.toggle("on",PIS.goma)};
 document.getElementById("pisDesfes").onclick=()=>{PIS.traços.pop();pisRedibuixa()};
 document.getElementById("pisBuida").onclick=()=>{PIS.traços=[];pisRedibuixa()};
 document.getElementById("pisFons").onclick=e=>{const sobre=c.classList.toggle("sobre");c.classList.toggle("full",!sobre);e.currentTarget.textContent=sobre?"📄 Full quadriculat":"🔍 Escriu sobre l'exercici"};
 document.getElementById("pisTanca").onclick=pisTanca;
 const cv=PIS.cv,pt=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
 cv.addEventListener("pointerdown",e=>{e.preventDefault();cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);PIS.actiu={c:PIS.col,g:PIS.goma,w:PIS.goma?26:(e.pointerType==="pen"?2.6:3.4),p:[pt(e)]};PIS.traços.push(PIS.actiu);pisRedibuixa()});
 cv.addEventListener("pointermove",e=>{if(!PIS.actiu)return;e.preventDefault();PIS.actiu.p.push(pt(e));pisRedibuixa(true)});
 const fi=()=>{PIS.actiu=null};cv.addEventListener("pointerup",fi);cv.addEventListener("pointercancel",fi);cv.addEventListener("pointerleave",fi);
 addEventListener("resize",()=>{if(c.classList.contains("on"))pisMida()});
 addEventListener("keydown",e=>{if(e.key==="Escape"&&c.classList.contains("on"))pisTanca()})}
// el fons de la pàgina queda a sota: en mode «sobre l'exercici» es veu l'enunciat i s'hi pot escriure al damunt
function pisObre(){const c=document.getElementById("pisCapa");if(!c)return;c.classList.add("on");pisMida();if(typeof so==="function")so("clic")}
function pisTanca(){const c=document.getElementById("pisCapa");if(c)c.classList.remove("on")}
function pisMida(){const cv=PIS.cv,r=cv.getBoundingClientRect(),dpr=window.devicePixelRatio||1;cv.width=Math.max(1,Math.round(r.width*dpr));cv.height=Math.max(1,Math.round(r.height*dpr));pisRedibuixa()}
function pisRedibuixa(nomesUltim){const cv=PIS.cv,x=cv.getContext("2d"),dpr=window.devicePixelRatio||1;x.setTransform(dpr,0,0,dpr,0,0);
 const pinta=t=>{x.globalCompositeOperation=t.g?"destination-out":"source-over";x.strokeStyle=t.c;x.lineWidth=t.w;x.lineCap="round";x.lineJoin="round";x.beginPath();
  t.p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));if(t.p.length===1)x.lineTo(t.p[0][0]+.1,t.p[0][1]+.1);x.stroke()};
 if(nomesUltim&&PIS.actiu&&!PIS.actiu.g){pinta(PIS.actiu);return}
 x.clearRect(0,0,cv.width,cv.height);PIS.traços.forEach(pinta);x.globalCompositeOperation="source-over"}
if(typeof document!=="undefined"&&document.readyState!=="loading")setTimeout(pisMunta,0);else if(typeof addEventListener!=="undefined")addEventListener("DOMContentLoaded",pisMunta);
// per a la prova automàtica (motor/prova.js)
function pisProva(){pisMunta();if(!document.getElementById("pisBt"))return "no hi ha el botó de la pissarra";pisObre();const cv=PIS.cv,r=cv.getBoundingClientRect();
 const ev=(t,x,y)=>cv.dispatchEvent(new PointerEvent(t,{clientX:r.left+x,clientY:r.top+y,pointerId:1,bubbles:true}));ev("pointerdown",20,20);ev("pointermove",60,40);ev("pointerup",60,40);
 const n=PIS.traços.length;document.getElementById("pisDesfes").click();const ok=n===1&&PIS.traços.length===0;pisTanca();return ok||"la pissarra no dibuixa o no desfà"}
if(typeof window!=="undefined")(window.BN_PROVES=window.BN_PROVES||[]).push("pisProva");
