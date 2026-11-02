// ====================== JOCS GENÈRICS ======================
// tipus: ordena · parelles · classifica · figura · custom (funció pròpia definida a les dades)
function fiJoc(j,n,errors){const pc=Math.max(0,Math.round(100*n/(n+errors)));const r=S.jocs[j.id]||[],ant=r.length?Math.max(...r):null;desaJoc(j.id,pc);arcade(pc,n,n+errors,ant!==null&&pc>ant);
 document.getElementById("zona").innerHTML=`<div class="fb ok">🎉 Fet${errors?` (amb ${errors} error${errors>1?"s":""})`:" sense cap error"}! ${j.final||""}</div><div class="fila"><button class="btn" onclick="joc('${j.id}')">Torna-hi</button><button class="btn sec" onclick="vista('jocs')">Altres jocs</button></div>`}
function sacseja(el){so("ko");el.classList.remove("ko");void el.offsetWidth;el.classList.add("ko")}
function jocOrdena(j){
 let pos=0,errors=0;const it=j.items;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box">${j.instr}<div id="xips" style="margin-top:10px"></div><div class="pila" id="pila">${j.base?`<div style="background:#bbf7d0">${j.base}</div>`:""}</div><div id="zona"></div></div>`;
 const x=document.getElementById("xips");
 barreja(it.map((c,i)=>i)).forEach(i=>{const s=document.createElement("span");s.className="chip";s.textContent=it[i][0];
  s.onclick=()=>{if(s.classList.contains("ok"))return;
   if(i===pos){s.classList.add("ok");const d=document.createElement("div");d.style.background=it[i][2]||"#eef2ff";d.innerHTML=`${i+1} · ${it[i][0]}${it[i][1]?` <small style="font-weight:600;color:#475569">— ${it[i][1]}</small>`:""}`;document.getElementById("pila").appendChild(d);pos++;suma(1);so("ok");if(pos===it.length)fiJoc(j,it.length,errors)}
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
 barreja(PAR.map((p,i)=>i)).forEach(i=>{const s=document.createElement("div");s.className="chip";s.style.display="block";s.textContent=PAR[i][0];s.dataset.i=i;s.onclick=()=>{if(s.classList.contains("ok"))return;E.querySelectorAll(".chip").forEach(c=>c.classList.remove("sel"));s.classList.add("sel");sel=s};E.appendChild(s)});
 barreja(PAR.map((p,i)=>i)).forEach(i=>{const s=document.createElement("div");s.className="chip";s.style.display="block";s.textContent=PAR[i][1];
  s.onclick=()=>{if(!sel||s.classList.contains("ok"))return;
   if(+sel.dataset.i===i){sel.classList.remove("sel");sel.classList.add("ok");s.classList.add("ok");sel=null;fet++;suma(1);so("ok");if(fet===PAR.length)fiJoc(j,PAR.length,errors)}
   else{errors++;sacseja(s)}};D.appendChild(s)});
}
function jocClassifica(j){
 const F=j.items;let sel=null,fet=0,errors=0;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box">${j.instr}<div id="fr" style="margin:10px 0"></div><div class="col2">${j.caixes.map(([k,t])=>`<div class="cub" data-k="${k}"><h4>${t}</h4></div>`).join("")}</div><div id="zona"></div></div>`;
 const fr=document.getElementById("fr");
 barreja(F).forEach(f=>{const s=document.createElement("span");s.className="chip";s.textContent=f[0];s.dataset.k=f[1];s.onclick=()=>{fr.querySelectorAll(".chip").forEach(c=>c.classList.remove("sel"));s.classList.add("sel");sel=s};fr.appendChild(s)});
 app.querySelectorAll(".cub").forEach(c=>c.onclick=()=>{
  if(!sel)return;
  if(sel.dataset.k===c.dataset.k){sel.classList.remove("sel");sel.classList.add("ok");sel.onclick=null;c.appendChild(sel);sel=null;fet++;suma(1);so("ok");if(fet===F.length)fiJoc(j,F.length,errors)}
  else{errors++;sacseja(sel)}});
}
