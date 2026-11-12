// ===================== 📒 FES-HO AL QUADERN (motor/eines/quadern.js) =====================
// A les preguntes obertes de mates: el nen resol el problema en paper i després
//   ✔ omple els resultats intermedis (punts de control) i l'app li diu en quin pas mirar, o
//   📷 fa una foto del full i Claude (funció bn-corregeix de Supabase) diu quina és la primera línia equivocada.
// Necessita el Taller (eines/exercicis-mates.js) inclòs abans. S'inclou amb  //@inclou eines/quadern.js
// Dades: a cada pregunta oberta, c:[…] amb els punts de control (en ordre):
//   ["n","MCM (36, 48) =",144]  número · ["f","36 =",{2:2,3:2}]  descomposició · ["l","Divisors de 28:",[1,2,4,7,14,28]]  llista
//   ["t","Quin cal calcular?",["MCM","MCD"],0]  tria
// ASSIG.foto=true activa el botó de la foto (si la funció no està desplegada, l'app ho diu i ofereix els punts de control).
// (BN_LOG es declara més avall a la plantilla: l'adreça es calcula quan cal, no en carregar)
const qdFn=()=>BN_LOG.url.replace("/rest/v1/bn_log","/functions/v1/bn-corregeix");
const qdEsc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function qdPassos(c){const pr=[2,3,5,7,11,13];return c.map(([t,q,r,x],i)=>{
 if(t==="n")return {t:"num",id:"control",q:`<b>${q}</b>`,r,err:v=>mxE("calcul",`Al quadern t'ha sortit ${mxN(v)}. Revisa aquest pas: aquí és on hi ha l'error.`)};
 if(t==="f")return {t:"fact",id:"control",q:`<b>${q}</b> (amb potències)`,r,primers:pr,err:v=>{const val=mxVal(v),bo=mxVal(r);return mxE(val===bo?"exponent":"calcul",val===bo?"El valor és bo però l'has escrit diferent: a la descomposició només hi van primers.":`El que has posat fa ${mxN(val)}, no ${mxN(bo)}. Revisa l'escala al quadern.`)}};
 if(t==="l")return {t:"llista",id:"control",q:`<b>${q}</b>`,r,err:v=>{const sob=v.filter(x=>!r.includes(x)),fal=r.filter(x=>!v.includes(x));return mxE(sob.length?"calcul":"falten",sob.length?`El ${mxN(sob[0])} no hi va. Revisa-ho al quadern.`:`${fal.length===1?"Te'n falta 1":`Te'n falten ${fal.length}`}. Revisa-ho al quadern.`)}};
 return {t:"tria",id:"control",q:`<b>${q}</b>`,op:r,r:x,err:()=>mxE("-","Torna a llegir l'enunciat: què et demana?")}})}
function obertesExtra(n,o){const box=document.querySelector("#app .box");if(!box||(!o.c&&!ASSIG.foto))return;
 const d=document.createElement("div");d.className="qd";
 d.innerHTML=`<div class="fb" style="margin-top:12px;text-align:left"><b>📒 L'has resolt al quadern?</b> Comprova-ho pas a pas:
  <div class="fila" style="justify-content:flex-start;margin-top:8px">${o.c?`<button class="btn sec" onclick="qdControls(${n})">✔ Comprova els resultats</button>`:""}${ASSIG.foto?`<button class="btn sec" onclick="qdFotoTria(${n})">📷 Fes una foto del full</button>`:""}</div>
  ${ASSIG.foto?`<input type="file" id="qdFile" accept="image/*" capture="environment" hidden onchange="qdFoto(${n},this)">`:""}<div id="qdRes"></div></div>`;
 box.appendChild(d)}
// ✔ punts de control: fa servir el motor del Taller (mateix teclat i mateixos avisos), i en acabar torna a la pregunta
function qdControls(n){const o=OB[n];mxCss();mxCss2();const de=typeof diaEst==="function"?diaEst():{o:{}};de.c=de.c||{};JOCSTAR=de.c[n]?0:1;de.c[n]=1;
 FONT=["obertes"];
 MX={j:{id:"control",titol:"Comprova els resultats",enunciat:`📒 Comprova els resultats del quadern · pregunta ${n+1}`},nv:2,ex:false,mode:"control",
  llista:[{enun:o.q,passos:qdPassos(o.c),sol:o.m,g:"control"}],e:0,p:0,v:"",f:{},int:0,ajut:0,bones:0,errs:0,resp:[],ok:{},fi:false,apFet:false,ep:[],pistes:0,pq:0,pqb:0,pre:[0],
  onFi:()=>{const tot=o.c.length,pc=Math.round(100*MX.bones/tot);MX.fi=true;
   if(typeof registra==="function")registra("oberta",{n,tema:o.t,mode:"control",pc,pasos:`${MX.bones}/${tot}`,ep:MX.ep});
   app.innerHTML=`<h2 class="sec">📒 Comprova els resultats del quadern</h2><div class="box"><p><b>${MX.bones} de ${tot}</b> resultats bé a la primera.${MX.errs?" On t'has equivocat, ja saps quin pas has de repassar al quadern.":" El quadern està molt bé! 🎉"}</p>
   <div class="fila"><button class="btn" id="qdTorna" onclick="obertes(${n})">← Torna a la pregunta</button>${n<OB.length-1?`<button class="btn sec" onclick="obertes(${n+1})">Següent pregunta →</button>`:""}</div></div>`}};
 mxPinta();window.scrollTo(0,0)}
// 📷 foto del full → funció bn-corregeix (la foto no es desa enlloc)
function qdFotoTria(n){const res=document.getElementById("qdRes");
 if(typeof S==="undefined"||!S.nom||typeof pinDe!=="function"||!pinDe(S.nom)){res.innerHTML=`<div class="fb ko">Per fer servir la foto has d'haver entrat amb el teu <b>PIN</b>.</div>`;return}
 if(/^file:/.test(location.protocol)){res.innerHTML=`<div class="fb ko">La foto només funciona a la web (no en un fitxer local).</div>`;return}
 document.getElementById("qdFile").click()}
function qdRedueix(file,max){return new Promise((ok,ko)=>{const img=new Image(),u=URL.createObjectURL(file);
 img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL("image/jpeg",.8))};img.onerror=()=>{URL.revokeObjectURL(u);ko(new Error("imatge"))};img.src=u})}
async function qdFoto(n,inp){const f=inp.files&&inp.files[0],res=document.getElementById("qdRes"),o=OB[n];inp.value="";if(!f)return;
 res.innerHTML=`<div class="fb">🔎 Estic mirant el teu quadern… (uns segons)</div>`;let r;
 try{const imatge=await qdRedueix(f,1600);
  const resp=await fetch(qdFn(),{method:"POST",headers:{"apikey":BN_LOG.key,"Content-Type":"application/json"},
   body:JSON.stringify({nom:S.nom,pin:pinDe(S.nom),assig:ASSIG.id,enunciat:o.q,model:o.m,punts:o.p,imatge})});
  r=resp.status===404?{ok:false,error:"no_configurat"}:await resp.json()}
 catch(e){r={ok:false,error:"xarxa"}}
 if(typeof registra==="function")registra("oberta",{n,tema:o.t,mode:"foto",ok:r.ok?1:0,error:r.error||null,correcte:r.ok?(r.correcte?1:0):null});
 if(!r.ok){const m={no_configurat:"La correcció amb foto encara no està activada.",xarxa:"No m'he pogut connectar. Mira si tens internet."}[r.error]||r.missatge||"No ho he pogut corregir.";
  res.innerHTML=`<div class="fb ko">📷 ${qdEsc(m)}${o.c?` Mentrestant, fes servir <b>✔ Comprova els resultats</b>.`:""}</div>`;return}
 QD_ULT=r;
 res.innerHTML=`<div class="fb" style="text-align:left"><b>He llegit això al teu full:</b><div class="mx-llib" style="font-size:16px">${(r.llegit||[]).map(l=>`<div>${qdEsc(l)}</div>`).join("")||"<i>(no hi he sabut llegir res)</i>"}</div>
  <p style="margin:8px 0 4px"><b>És el que has escrit?</b></p><div class="fila" style="justify-content:flex-start"><button class="btn verd" onclick="qdVeredicte()">✔ Sí</button><button class="btn sec" onclick="qdMalLlegit()">✖ No, ho ha llegit malament</button></div></div>`}
let QD_ULT=null;
function qdVeredicte(){const r=QD_ULT,res=document.getElementById("qdRes");if(!r)return;const L=r.llegit||[],e=r.primer_error;
 res.innerHTML=r.correcte?`<div class="fb ok">✅ ${qdEsc(r.missatge||"Tot correcte!")}</div>`
  :`<div class="fb" style="text-align:left"><div class="mx-llib" style="font-size:16px">${L.map((l,i)=>`<div style="${e&&e.linia===i?"background:#fee2e2;outline:2px solid #ef4444;border-radius:4px":""}">${e&&e.linia===i?"❌ ":""}${qdEsc(l)}</div>`).join("")}</div>
   ${e?`<p style="margin:8px 0 2px"><b>${qdEsc(e.que||"Aquí hi ha un error.")}</b></p><p style="margin:0">${qdEsc(e.per_que||"")}</p>`:""}<p style="margin:8px 0 0">${qdEsc(r.missatge||"")}</p></div>`;
 if(r.queden!=null)res.insertAdjacentHTML("beforeend",`<p class="prog" style="margin-top:6px">📷 Avui et queden ${r.queden} fotos.</p>`)}
function qdMalLlegit(){document.getElementById("qdRes").innerHTML=`<div class="fb">D'acord. Torna a fer la foto amb més llum, el full ben recte i la lletra clara${OB&&ASSIG.foto?"":""}. També pots fer servir <b>✔ Comprova els resultats</b>.</div>`}
// per a la prova automàtica (motor/prova.js): resol els punts de control de totes les preguntes que en tenen
function qdProva(){for(let n=0;n<OB.length;n++){const o=OB[n];if(!o.c)continue;obertes(n);if(!document.querySelector(".qd"))return `pregunta ${n+1}: no surt el quadern`;qdControls(n);let s=0;
  while(MX&&!MX.fi&&s++<100){const b=document.getElementById("mxSeg");if(b){b.click();continue}const P=MX.llista[0].passos[MX.p];
   if(P.t==="tria")mxRespon(P.r);else if(P.t==="fact"){MX.f={...P.r};mxRespon()}else{MX.v=P.t==="llista"?P.r.join(", "):String(P.r);mxRespon()}}
  if(!MX.fi||MX.errs)return `pregunta ${n+1}: els punts de control no acaben bé`;if(!document.getElementById("qdTorna"))return `pregunta ${n+1}: no torna a la pregunta`}
 return true}
if(typeof window!=="undefined")(window.BN_PROVES=window.BN_PROVES||[]).push("qdProva");
