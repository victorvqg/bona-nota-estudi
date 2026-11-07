// ====================== JOCS GENÈRICS ======================
// tipus: ordena · parelles · classifica · figura · error · custom (funció pròpia definida a les dades)
function fiJoc(j,n,errors){const pc=Math.max(0,Math.round(100*n/(n+errors)));const r=S.jocs[j.id]||[],ant=r.length?Math.max(...r):null;desaJoc(j.id,pc);arcade(pc,n,n+errors,ant!==null&&pc>ant);
 document.getElementById("zona").innerHTML=`<div class="fb ok">🎉 Fet${errors?` (amb ${errors} error${errors>1?"s":""})`:" sense cap error"}! ${j.final||""}</div><div class="fila"><button class="btn" onclick="joc('${j.id}')">Torna-hi</button><button class="btn sec" onclick="vista('jocs')">Altres jocs</button></div>`}
function sacseja(el){so("ko");el.classList.remove("ko");void el.offsetWidth;el.classList.add("ko")}
function jocOrdena(j){
 let pos=0,errors=0;const it=j.items;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box">${j.instr}<div id="xips" style="margin-top:10px"></div><div class="pila" id="pila">${j.base?`<div style="background:#bbf7d0">${j.base}</div>`:""}</div><div id="zona"></div></div>`;
 const x=document.getElementById("xips");
 barreja(it.map((c,i)=>i)).forEach(i=>{const s=document.createElement("span");s.className="chip";s.setAttribute("role","button");s.tabIndex=0;s.textContent=it[i][0];
  s.onclick=()=>{if(s.classList.contains("ok"))return;
   if(i===pos){s.classList.add("ok");s.tabIndex=-1;const d=document.createElement("div");d.style.background=it[i][2]||"#eef2ff";d.innerHTML=`${i+1} · ${it[i][0]}${it[i][1]?` <small style="font-weight:600;color:#475569">— ${it[i][1]}</small>`:""}`;document.getElementById("pila").appendChild(d);pos++;suma(1);so("ok");if(pos===it.length)fiJoc(j,it.length,errors)}
   else{errors++;sacseja(s)}};x.appendChild(s)});
}
function jocFigura(j){
 const svg=typeof window[j.figura]==="function"?window[j.figura]():j.figura;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box" style="text-align:center">${svg}</div><div id="zona"></div>`;
 test(j.q.map((x,i)=>i),0,0,j.id,j.q,resultatJoc(j.id));
}
function jocParelles(j){
 const PAR=j.pars;let sel=null,fet=0,errors=0;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box">${j.instr}<div class="col2" style="margin-top:12px"><div id="esq"></div><div id="dre"></div></div><div id="zona"></div></div>`;
 const E=document.getElementById("esq"),D=document.getElementById("dre");
 barreja(PAR.map((p,i)=>i)).forEach(i=>{const s=document.createElement("div");s.className="chip";s.style.display="block";s.setAttribute("role","button");s.tabIndex=0;s.setAttribute("aria-pressed","false");s.textContent=PAR[i][0];s.dataset.i=i;s.onclick=()=>{if(s.classList.contains("ok"))return;E.querySelectorAll(".chip").forEach(c=>{c.classList.remove("sel");c.setAttribute("aria-pressed","false")});s.classList.add("sel");s.setAttribute("aria-pressed","true");sel=s};E.appendChild(s)});
 barreja(PAR.map((p,i)=>i)).forEach(i=>{const s=document.createElement("div");s.className="chip";s.style.display="block";s.setAttribute("role","button");s.tabIndex=0;s.textContent=PAR[i][1];
  s.onclick=()=>{if(!sel||s.classList.contains("ok"))return;
   if(+sel.dataset.i===i){sel.classList.remove("sel");sel.setAttribute("aria-pressed","false");sel.classList.add("ok");sel.tabIndex=-1;s.classList.add("ok");s.tabIndex=-1;sel=null;fet++;suma(1);so("ok");if(fet===PAR.length)fiJoc(j,PAR.length,errors)}
   else{errors++;sacseja(s)}};D.appendChild(s)});
}
function jocClassifica(j){
 const F=j.items;let sel=null,fet=0,errors=0;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box">${j.instr}<div id="fr" style="margin:10px 0"></div><div class="col2">${j.caixes.map(([k,t])=>`<div class="cub" role="button" tabindex="0" data-k="${k}"><h4>${t}</h4></div>`).join("")}</div><div id="zona"></div></div>`;
 const fr=document.getElementById("fr");
 barreja(F).forEach(f=>{const s=document.createElement("span");s.className="chip";s.setAttribute("role","button");s.tabIndex=0;s.setAttribute("aria-pressed","false");s.textContent=f[0];s.dataset.k=f[1];s.onclick=()=>{fr.querySelectorAll(".chip").forEach(c=>{c.classList.remove("sel");c.setAttribute("aria-pressed","false")});s.classList.add("sel");s.setAttribute("aria-pressed","true");sel=s};fr.appendChild(s)});
 app.querySelectorAll(".cub").forEach(c=>c.onclick=()=>{
  if(!sel)return;
  if(sel.dataset.k===c.dataset.k){sel.classList.remove("sel");sel.setAttribute("aria-pressed","false");sel.classList.add("ok");sel.tabIndex=-1;sel.onclick=null;c.appendChild(sel);sel=null;fet++;suma(1);so("ok");if(fet===F.length)fiJoc(j,F.length,errors)}
  else{errors++;sacseja(sel)}});
}

// ====================== 🔍 TROBA L'ERROR GENÈRIC (socials, català, biologia…) ======================
// Format: {id:"…",tipus:"error",exercicis:[{id?,nom?,enun,figura?,linies:[…],mal:N,per:[bona,falsa,falsa],llibreta:[…],ok?:[…],t?:"num"|"tria",q?,r?,op?,pista?,pistaR?}, …]}
const JG_NOMS=["en Pol","la Berta","en Marc","la Júlia","l'Àlex","la Nora"];
let JGE=null;
function jgErrCss(){if(document.getElementById("jgErrCss"))return;const s=document.createElement("style");s.id="jgErrCss";s.textContent=`
.jg-cap{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.jg-ap{display:inline-block;padding:4px 12px;border-radius:99px;background:#eef2ff;color:#1e40af;font-weight:900;font-size:14px}
.jg-enun{font-size:18px;font-weight:800;padding:12px 14px;border-radius:14px;background:#f8fafc;border:2px solid var(--vora);margin:6px 0}
.jg-llib{margin-top:10px;padding:14px 16px;border-radius:14px;background:repeating-linear-gradient(#fff,#fff 29px,#e2e8f0 30px);border:2px solid #cbd5e1;border-left:5px solid #22c55e;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:17px;line-height:30px}
.jg-llib h4{margin:0 0 4px;font-family:Nunito,system-ui,sans-serif;font-size:13px;color:#15803d;text-transform:uppercase;letter-spacing:.6px}
.jg-llib.jg-err{border-left-color:#ef4444;display:flex;flex-direction:column;gap:4px}
.jg-llib.jg-err h4{color:#b91c1c}
.jg-lin-ok{background:#dcfce7;border-radius:6px;padding:0 6px;font-weight:800;color:#14532d}
.jg-lin{display:block;width:100%;text-align:left;font:inherit;font-size:17px;line-height:1.45;padding:5px 10px;border:2px dashed transparent;border-radius:8px;background:transparent;cursor:pointer;color:inherit;font-family:inherit}
.jg-lin:hover{border-color:#93c5fd}
.jg-lin.mal{border-color:#ef4444;background:#fef2f2;text-decoration:line-through;text-decoration-color:#ef4444}
.jg-lin.no{opacity:.5}
.jg-opc{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.jg-opc button{text-align:left;font:inherit;font-size:16.5px;font-weight:800;padding:12px 14px;border-radius:12px;border:2px solid var(--vora);background:#fff;cursor:pointer;color:var(--fosc)}
.jg-opc button:hover{border-color:var(--blau);background:#f8fafc}
.jg-pas{margin-top:10px;padding:14px;border-radius:14px;border:2px solid #dbeafe;background:#eff6ff}
.jg-disp{font-size:24px;font-weight:900;text-align:center;padding:8px 12px;margin:8px 0;border-radius:12px;background:#fff;border:2px solid var(--blau);min-height:44px;letter-spacing:.5px}
.jg-disp.buit{color:#94a3b8;font-size:16px;font-weight:700}
.jg-tec{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;max-width:300px;margin:8px auto}
.jg-tec button{font:inherit;font-size:21px;font-weight:900;padding:10px 0;border-radius:12px;border:2px solid var(--vora);background:#fff;cursor:pointer;color:var(--fosc);box-shadow:0 2px 0 var(--vora)}
.jg-tec button:active{transform:translateY(2px);box-shadow:none}
.jg-tec button.esb{background:#fef2f2;border-color:#fecaca;color:#b91c1c;font-size:17px}`;document.head.appendChild(s)}
function jgErrRepAnota(E,pas){if(!JGE||JGE.rep||typeof repAnotaExt!=="function"||!E.id)return;
 repAnotaExt("err_gen",`${JGE.j.id}|${E.id}`,{jid:JGE.j.id,eid:E.id,pas},false)}
function jocError(j){jgErrCss();
 const llista=(j.exercicis||[]).map((raw,idx)=>{const E=Object.assign({},raw);E.id=E.id||`e${idx}`;E.nom=E.nom||JG_NOMS[idx%JG_NOMS.length];E.ord=barreja([0,1,2]);return E});
 JGE={j,llista,e:0,fase:"linia",v:"",bones:0,errs:0,int:0,errE:[],fi:false};jgErrPinta()}
function jgErrPinta(){const {j,llista,e}=JGE,E=llista[e];JGE.fase="linia";JGE.int=0;JGE.v="";JGE.esp=false;
 const fig=E.figura?(typeof window[E.figura]==="function"?`<div style="text-align:center;margin:8px 0">${window[E.figura]()}</div>`:E.figura):"";
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><div class="jg-cap"><span class="jg-ap">Exercici ${e+1} de ${llista.length}</span><span class="prog">Pas 1 de 3 · Troba la línia</span></div>
 <p>🔍 <b>${E.nom.charAt(0).toUpperCase()+E.nom.slice(1)}</b> ha fet aquest exercici i hi ha <b>un error</b>. Toca la línia que està malament.</p>
 <div class="jg-enun">${E.enun}</div>${fig}
 <div class="jg-llib jg-err"><h4>❌ Així NO s'escriu (busca l'error)</h4>${E.linies.map((l,i)=>`<button class="jg-lin" data-i="${i}" onclick="jgErrLin(${i})">${l}</button>`).join("")}</div>
 <div id="jgFb"></div><div id="zona"></div></div>`}
function jgErrLin(i){if(!JGE||JGE.fase!=="linia")return;const E=JGE.llista[JGE.e],b=document.querySelector(`.jg-lin[data-i="${i}"]`),fb=document.getElementById("jgFb");
 if(i!==E.mal){JGE.errs++;JGE.int++;JGE.errE[JGE.e]=1;jgErrRepAnota(E,"linia");if(b)sacseja(b);
  fb.innerHTML=`<div class="fb" style="background:#fef2f2;border-color:#fecaca">Aquesta línia està bé. ${JGE.int>=2&&E.pista?"💡 "+E.pista:"Busca'n una altra."}</div>`;return}
 if(!JGE.int){JGE.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)}so("ok");
 if(b)b.classList.add("mal");JGE.fase="per";JGE.int=0;
 fb.innerHTML=`<div class="fb ok">🎯 L'has trobada! <b>Pas 2 de 3 · Per què està malament?</b></div><div class="jg-opc">${E.ord.map(k=>`<button onclick="jgErrPer(${k})">${E.per[k]}</button>`).join("")}</div>`}
function jgErrPer(k){if(!JGE||JGE.fase!=="per")return;const E=JGE.llista[JGE.e],bo=k===0;
 if(bo){JGE.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR);so("ok")}
 else{JGE.errs++;JGE.errE[JGE.e]=1;jgErrRepAnota(E,"per");so("ko")}
 if(E.r===undefined){JGE.fase="fet";return jgErrMostraSol(bo)}
 JGE.fase="escriu";JGE.int=0;JGE.v="";
 const ent=E.t==="tria"?`<div class="jg-opc">${E.op.map((o,i)=>`<button onclick="jgErrRespon(${i})">${o}</button>`).join("")}</div>`
  :`<div class="jg-disp buit" id="jgDisp">Escriu el resultat</div><div class="jg-tec">${[7,8,9,"⌫",4,5,6,"C",1,2,3,"",0,"","",""].map(x=>x===""?"<span></span>":`<button class="${x==="⌫"||x==="C"?"esb":""}" onclick="jgErrTecla('${x}')">${x}</button>`).join("")}</div><div class="fila"><button class="btn" onclick="jgErrRespon()">Comprova ✔</button></div>`;
 document.getElementById("jgFb").innerHTML=`<div class="fb ${bo?"ok":""}">${bo?"👏 Exacte!":"No ben bé."} ${E.per[0]}.</div>
 <div class="jg-pas"><div class="prog" style="margin-bottom:4px">✍️ Pas 3 de 3 · Escriu-ho bé tu</div><div>${E.q}</div><div id="jgFb2"></div>${ent}</div>`}
function jgErrTecla(x){if(!JGE||JGE.fi||JGE.fase!=="escriu")return;if(x==="⌫")JGE.v=JGE.v.slice(0,-1);else if(x==="C")JGE.v="";else if(JGE.v.length<20)JGE.v+=x;
 so("clic");const d=document.getElementById("jgDisp");if(d){d.classList.toggle("buit",!JGE.v);d.textContent=JGE.v||"Escriu el resultat"}}
function jgErrRespon(i){if(!JGE||JGE.fase!=="escriu"||JGE.esp)return;const E=JGE.llista[JGE.e],fb2=document.getElementById("jgFb2");
 const v=E.t==="tria"?i:(JGE.v.trim()===""?null:+JGE.v);
 if(E.t!=="tria"&&(v===null||Number.isNaN(v))){if(fb2)fb2.innerHTML=`<div class="fb">✏️ Primer escriu la resposta.</div>`;return}
 const bo=v===E.r;
 if(bo){if(!JGE.int){JGE.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)}so("ok");JGE.fase="fet";return jgErrMostraSol(true)}
 JGE.errs++;JGE.int++;JGE.errE[JGE.e]=1;jgErrRepAnota(E,"escriu");so("ko");
 const pas=document.querySelector(".jg-pas");if(pas)sacseja(pas);
 const rTxt=E.t==="tria"?E.op[E.r]:E.r;
 if(JGE.int>=2||E.t==="tria"){JGE.esp=true;if(fb2)fb2.innerHTML=`<div class="fb">❌ La resposta correcta és <b>${rTxt}</b>. Mira com queda l'exercici corregit.</div><div class="fila"><button class="btn" id="jgSeg" onclick="jgErrMostraSol(false)">Mira la llibreta ▶</button></div>`;return}
 if(fb2)fb2.innerHTML=`<div class="fb" style="background:#fef2f2;border-color:#fecaca">❌ No és correcte. ${E.pistaR||"Torna-ho a provar."}</div>`}
function jgErrMostraSol(bo){if(!JGE)return;const E=JGE.llista[JGE.e],ult=JGE.e+1>=JGE.llista.length;JGE.fase="fet";JGE.esp=false;
 const okSet=E.ok||[E.mal],llibHtml=(E.llibreta||E.linies).map((l,i)=>`<div class="${okSet.includes(i)?"jg-lin-ok":""}">${l}</div>`).join("");
 document.getElementById("jgFb").innerHTML=`<div class="fb ${bo?"ok":""}">${bo?"✅ Molt bé! Ja has detectat i corregit l'error.":"👉 Fixa't bé en la correcció pas a pas."} (${E.per[0]}.)</div>
 <div class="jg-llib"><h4>📒 Així s'escriu a la llibreta · Exercici corregit</h4>${llibHtml}</div>
 <div class="fila"><button class="btn" id="jgSeg" onclick="${ult?(JGE.onFi?"JGE.onFi()":"jgErrFi()"):"jgErrSeg()"}">${ult?(JGE.onFi?"Veure el resultat 🏁":"Acaba 🏁"):"Següent exercici ▶"}</button></div>`}
function jgErrSeg(){JGE.e++;jgErrPinta();window.scrollTo(0,0)}
function jgErrFi(){const {j,bones,errs,llista}=JGE;JGE.fi=true;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>Has revisat i corregit <b>${llista.length} exercicis</b>: <b>${bones}</b> passos bé a la primera i <b>${errs}</b> errors.</p><div id="zona"></div></div>`;
 fiJoc(j,Math.max(1,bones),errs)}
function jocErrorProva(j){jocError(j);let s=0;while(JGE&&!JGE.fi&&s++<100){const b=document.getElementById("jgSeg");if(b){b.click();continue}const E=JGE.llista[JGE.e];if(JGE.fase==="linia")jgErrLin(E.mal);else if(JGE.fase==="per")jgErrPer(0);else if(JGE.fase==="escriu"){if(E.t==="tria")jgErrRespon(E.r);else{JGE.v=String(E.r);jgErrRespon()}}}return JGE&&JGE.fi?true:"jocError: no ha acabat"}
function jgErrTroba(r){if(!r||!r.jid||typeof ASSIG==="undefined")return null;const j=(ASSIG.jocs||[]).find(x=>x.id===r.jid&&x.tipus==="error");if(!j)return null;
 const ex=(j.exercicis||[]).find((e,i)=>(e.id||`e${i}`)===r.eid);return ex?{j,ex}:null}
function jgErrRepas(items,fi){jgErrCss();
 const j={id:"rp-err-gen",titol:"🔍 Repàs d'errors que et van enganyar"};
 const llista=items.map((r,idx)=>{const f=jgErrTroba(r),E=Object.assign({},f.ex);E.id=r.eid;E.nom=E.nom||JG_NOMS[idx%JG_NOMS.length];E.ord=barreja([0,1,2]);return E});
 const jst=typeof JOCSTAR!=="undefined"?JOCSTAR:0;JOCSTAR=0;
 JGE={j,llista,e:0,fase:"linia",v:"",bones:0,errs:0,int:0,errE:[],fi:false,rep:true};
 JGE.onFi=()=>{JGE.fi=true;JOCSTAR=jst;fi(llista.map((_,i)=>!JGE.errE[i]))};
 jgErrPinta();window.scrollTo(0,0)}
(window.BN_REP_TIPUS=window.BN_REP_TIPUS||{}).err_gen={ic:"🔍",max:3,titol:"Ara, errors que et van enganyar",
 peu:"Torna a revisar l'exercici: troba la línia, digues per què i escriu-ho bé sense cap error.",
 valid:r=>!!jgErrTroba(r),
 nom:r=>{const f=jgErrTroba(r);return f?`🔍 ${f.j.titol} · ${String(f.ex.enun).replace(/<[^>]+>/g,"").slice(0,45)}…`:"🔍 Troba l'error"},
 juga:jgErrRepas};
