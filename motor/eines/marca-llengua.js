// ===================== 🖍️ PINTA LES PARAULES (motor/eines/marca-llengua.js) =====================
// Joc genèric per als mons de llengua: el nen tria un color (una categoria) i pinta cada paraula d'una frase.
// Serveix per a les peces del sintagma nominal, les classes de noms, el gènere, el subjecte i el predicat, etc.
// S'inclou a les dades del món amb  //@inclou eines/marca-llengua.js
// Joc:  {id:"mc-…",grup:"…",tipus:"custom",fn:"jocMarca",prova:"jocMarcaProva",ic,titol,sub,col,enunciat,
//        cats:[["E","Especificador","#fde68a"],["N","Nucli","#93c5fd"],…],   // codi d'una lletra, nom i color
//        items:[{t:"els teus ulls verds",m:"EENC",ex:"El perquè (després de respondre)",pista:"Ajuda després del primer error"}], n:6}
// «m» té una lletra per paraula de «t» (separades per espais); «-» vol dir que aquella paraula no es pinta.
// 1 ⭐ per frase bé a la primera. En fallar, les paraules mal pintades es marquen; al segon intent es veu la solució.
// Teoria: T[i].esquema = {marca:{t,m}, joc:"mc-…"} pinta la frase amb els colors del joc (marcaHtml).
let MC=null;
function mcCss(){if(document.getElementById("mcCss"))return;const s=document.createElement("style");s.id="mcCss";s.textContent=`
.mc-pal{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0 12px}
.mc-cat{font:inherit;font-weight:900;font-size:15px;padding:8px 14px;border-radius:999px;border:3px solid transparent;cursor:pointer;color:#0f172a;min-height:44px}
.mc-cat.on{border-color:#0f172a;box-shadow:0 0 0 3px #fff inset}
.mc-frase{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:14px 10px;border-radius:14px;background:#f8fafc;border:2px solid var(--vora);margin:6px 0}
.mc-w{font:inherit;font-size:21px;font-weight:800;padding:6px 12px;border-radius:12px;border:2px dashed #94a3b8;background:#fff;cursor:pointer;color:#0f172a;min-height:46px;position:relative}
.mc-w.pintat{border-style:solid;border-color:#0f172a33}
.mc-w.fix{cursor:default;border:0;background:transparent;color:#64748b;font-weight:700}
.mc-w.ko{border:3px solid #ef4444;animation:tremola .35s}
.mc-w.ok{border:3px solid #16a34a}
.mc-w small{display:block;font-size:10.5px;font-weight:900;letter-spacing:.3px;opacity:.75;line-height:1}
.mc-llegenda{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font-size:13px;font-weight:800;margin-top:6px}
.mc-llegenda span{padding:2px 10px;border-radius:999px}
.mc-esq{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}
.mc-esq span{display:inline-flex;flex-direction:column;align-items:center;padding:4px 10px;border-radius:10px;font-size:19px;font-weight:800;color:#0f172a}
.mc-esq small{font-size:10.5px;font-weight:900;opacity:.75}
body.suau .mc-w.ko{animation:none}`;document.head.appendChild(s)}
const mcParaules=t=>String(t).trim().split(/\s+/);
const mcCat=(j,c)=>(j.cats||[]).find(x=>x[0]===c);
// frase pintada (per a la teoria i la solució): cada paraula amb el color i el nom curt de la seva categoria
function marcaHtml(t,m,cats){mcCss();const w=mcParaules(t);
 return `<div class="mc-esq" role="img" aria-label="${w.map((x,i)=>{const c=cats.find(k=>k[0]===m[i]);return c?`${x}: ${c[1]}`:x}).join(", ")}">${w.map((x,i)=>{const c=cats.find(k=>k[0]===m[i]);return c?`<span style="background:${c[2]}">${x}<small>${c[1]}</small></span>`:`<span style="color:#64748b">${x}</span>`}).join("")}</div>`}
function jocMarca(j){mcCss();if(typeof jgErrCss==="function")jgErrCss();const it=j.items||[],n=Math.min(j.n||6,it.length);
 const tria=(typeof barreja==="function"?barreja(it.map((_,i)=>i)):it.map((_,i)=>i)).slice(0,n).sort((a,b)=>a-b);
 MC={j,llista:tria.map(i=>it[i]),e:0,cat:j.cats[0][0],v:[],int:0,bones:0,errs:0,fi:false};mcPinta()}
function mcPinta(){const {j,llista,e}=MC,E=llista[e],w=mcParaules(E.t);MC.v=w.map((_,i)=>E.m[i]==="-"?"-":null);MC.int=0;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><div class="jg-cap"><span class="jg-ap">Frase ${e+1} de ${llista.length}</span><span class="prog">🖍️ Pinta</span></div>
 <p class="fr-ins" style="margin:6px 0 0;font-weight:700;color:#475569">Tria un color i toca les paraules per pintar-les. Quan les tinguis totes, comprova.</p>
 <div class="mc-pal" role="radiogroup" aria-label="Color per pintar">${j.cats.map(([c,nom,col])=>`<button type="button" class="mc-cat${MC.cat===c?" on":""}" role="radio" aria-checked="${MC.cat===c}" data-c="${c}" style="background:${col}" onclick="mcTriaCat('${c}')">${nom}</button>`).join("")}</div>
 <div class="mc-frase" id="mcFrase">${w.map((x,i)=>E.m[i]==="-"?`<span class="mc-w fix">${x}</span>`:`<button type="button" class="mc-w" data-i="${i}" onclick="mcToca(${i})" aria-label="${x}: sense pintar">${x}<small>&nbsp;</small></button>`).join("")}</div>
 <div id="mcFb" role="status" aria-live="polite"></div><div class="fila" id="mcBts"><button class="btn" id="mcComp" onclick="mcComprova()">Comprova ✔</button></div><div id="zona"></div></div>`}
function mcTriaCat(c){if(!MC)return;MC.cat=c;document.querySelectorAll(".mc-cat").forEach(b=>{const on=b.dataset.c===c;b.classList.toggle("on",on);b.setAttribute("aria-checked",on)})}
function mcToca(i){if(!MC||MC.fase==="fet")return;MC.v[i]=MC.v[i]===MC.cat?null:MC.cat;if(typeof so==="function")so("clic");mcPintaParaula(i)}
function mcPintaParaula(i){const b=document.querySelector(`#mcFrase .mc-w[data-i="${i}"]`);if(!b)return;const c=MC.v[i]?mcCat(MC.j,MC.v[i]):null,x=mcParaules(MC.llista[MC.e].t)[i];
 b.classList.remove("ko","ok");b.classList.toggle("pintat",!!c);b.style.background=c?c[2]:"";b.innerHTML=`${x}<small>${c?c[1]:"&nbsp;"}</small>`;b.setAttribute("aria-label",`${x}: ${c?c[1]:"sense pintar"}`)}
function mcComprova(){if(!MC||MC.fase==="fet")return;const E=MC.llista[MC.e],fb=document.getElementById("mcFb");
 if(MC.v.some(x=>x===null)){fb.innerHTML=`<div class="fb">✏️ Encara hi ha paraules sense pintar.</div>`;return}
 const mal=MC.v.map((x,i)=>x!==E.m[i]?i:-1).filter(i=>i>=0);
 if(!mal.length){if(!MC.int){MC.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)}if(typeof so==="function")so("ok");
  document.querySelectorAll("#mcFrase .mc-w:not(.fix)").forEach(b=>b.classList.add("ok"));return mcFet(true)}
 MC.int++;if(MC.int===1)MC.errs++;if(typeof so==="function")so("ko");
 mal.forEach(i=>{const b=document.querySelector(`#mcFrase .mc-w[data-i="${i}"]`);if(b)b.classList.add("ko")});
 if(MC.int>=2){E.m.split("").forEach((c,i)=>{if(c!=="-"){MC.v[i]=c;mcPintaParaula(i)}});return mcFet(false)}
 const w=mcParaules(E.t),i0=mal[0],bona=mcCat(MC.j,E.m[i0]);
 fb.innerHTML=`<div class="fb fr-ko">❌ ${mal.length===1?"Hi ha 1 paraula":`Hi ha ${mal.length} paraules`} mal ${mal.length>1?"pintades":"pintada"} (en vermell). ${E.pista?"💡 "+E.pista:`Mira «${w[i0]}» un altre cop: quin paper hi fa?`}</div>`}
function mcFet(bo){MC.fase="fet";const ult=MC.e+1>=MC.llista.length,E=MC.llista[MC.e];
 document.getElementById("mcFb").innerHTML=`<div class="fb ${bo?"ok":"fr-ko"}">${bo?(MC.int?"✅ Ara sí!":"✅ Molt bé! Bé a la primera."):"👉 Fixa-t'hi bé: així queda pintada."}</div>${E.ex?`<div class="fr-sol" style="margin-top:8px;padding:10px 12px;border-radius:14px;background:#fffef5;border:2px solid #fde68a">💡 ${E.ex}</div>`:""}`;
 document.getElementById("mcBts").innerHTML=`<button class="btn" id="mcSeg" onclick="${ult?"mcFi()":"mcSeg()"}">${ult?"Acaba 🏁":"Següent frase ▶"}</button>`;
 const s=document.getElementById("mcSeg");if(s&&!MC.prova)s.focus({preventScroll:true})}
function mcSeg(){MC.e++;MC.fase="";mcPinta();window.scrollTo(0,0)}
function mcFi(){const {j,bones,llista}=MC;MC.fi=true;const mal=llista.length-bones;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>Has pintat <b>${llista.length} frases</b>: <b>${bones}</b> bé a la primera${mal?` i <b>${mal}</b> amb algun error`:""}.</p>${j.final?`<p class="prog">💡 ${j.final}</p>`:""}<div id="zona"></div></div>`;
 fiJoc(j,bones,mal)}
// comprova les dades d'un joc de pintar (també ho fa servir la prova automàtica)
function mcValida(j){const p=[],cs=new Set((j.cats||[]).map(c=>c[0]));if(cs.size<2)p.push("calen almenys 2 categories (cats)");
 (j.items||[]).forEach((E,i)=>{const w=mcParaules(E.t||"");if(!E.m||E.m.length!==w.length)p.push(`frase ${i+1}: ${w.length} paraules i ${E.m?E.m.length:0} lletres a «m»`);
  else if([...E.m].some(c=>c!=="-"&&!cs.has(c)))p.push(`frase ${i+1}: «m» té una lletra que no és cap categoria`);else if(![...E.m].some(c=>c!=="-"))p.push(`frase ${i+1}: no hi ha res per pintar`);
  if(!E.ex)p.push(`frase ${i+1}: sense explicació (ex)`)});
 if((j.items||[]).length<(j.n||6))p.push(`té ${(j.items||[]).length} frases i una partida en demana ${j.n||6}`);return p}
// prova automàtica: juga totes les frases; la primera, primer amb un error
function jocMarcaProva(j){const p=mcValida(j);if(p.length)return "jocMarca: "+p.join(" · ");
 jocMarca(Object.assign({},j,{n:j.items.length}));MC.prova=true;let s=0,primer=true;
 while(MC&&!MC.fi&&s++<500){const b=document.getElementById("mcSeg");if(b){b.click();continue}const E=MC.llista[MC.e];
  if(primer){primer=false;E.m.split("").forEach((c,i)=>{if(c==="-")return;MC.cat=j.cats.find(k=>k[0]!==c)[0];if(MC.v[i]!==MC.cat)mcToca(i)});mcComprova();
   if(!document.querySelector("#mcFrase .mc-w.ko"))return "jocMarca: en pintar malament no marca les paraules";}
  E.m.split("").forEach((c,i)=>{if(c==="-"||MC.v[i]===c)return;MC.cat=c;mcToca(i)});mcComprova()}
 if(!MC||!MC.fi)return "jocMarca: no ha acabat";if(MC.bones!==j.items.length-1)return `jocMarca: ${MC.bones} bones de ${j.items.length-1} esperades`;return true}
if(typeof module!=="undefined")module.exports={mcValida,marcaHtml};
