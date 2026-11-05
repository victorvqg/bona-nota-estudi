// ===================== 🧸 DIBUIXOS QUE ES MOUEN (motor/eines/manipulatius-mates.js) =====================
// Per ENTENDRE abans de calcular (manipulatius virtuals). Cada joc fa visible una idea i després es pot deixar.
// S'inclou a les dades d'un món amb la línia  //@inclou eines/manipulatius-mates.js
//   🟦 Rectangles:  {id:"mp-rect",tipus:"custom",fn:"mpRectangles",prova:"mpProva",mp:{nombres:[12,13,18,28]}, …}   divisors per parelles / primers
//   🐸 Granotes:    {id:"mp-gran",tipus:"custom",fn:"mpGranotes",prova:"mpProva",mp:{parells:[[4,6],[3,5]]}, …}      MCM = on coincideixen primer
//   🧱 Rajoles:     {id:"mp-raj",tipus:"custom",fn:"mpRajoles",prova:"mpProva",mp:{parells:[[12,8],[18,12]]}, …}      MCD = la rajola més gran que encaixa
//   🌳 Arbre:       {id:"mp-arbre",tipus:"custom",fn:"mpArbre",prova:"mpProva",mp:{nombres:[36,60]}, …}               camins diferents, mateixos factors

const mpMCD=(a,b)=>b?mpMCD(b,a%b):a,mpMCM=(a,b)=>a/mpMCD(a,b)*b;
const mpPrimer=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true};
const mpDiv=n=>{const r=[];for(let i=1;i<=n;i++)if(n%i===0)r.push(i);return r};
const MP_SUP={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
const mpPot=ps=>{const c={};ps.forEach(p=>c[p]=(c[p]||0)+1);return Object.keys(c).map(Number).sort((a,b)=>a-b).map(p=>p+(c[p]>1?String(c[p]).split("").map(x=>MP_SUP[x]).join(""):"")).join(" · ")};
let MP=null;
function mpCss(){if(document.getElementById("mpCss"))return;const s=document.createElement("style");s.id="mpCss";s.textContent=`
.mp-cap{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-weight:900;color:var(--suau);font-size:15px}
.mp-big{font-size:19px;line-height:1.45;margin:6px 0}
.mp-step{display:flex;align-items:center;justify-content:center;gap:12px;margin:10px 0}
.mp-step button{width:52px;height:52px;border-radius:14px;border:0;font-size:28px;font-weight:900;background:#fff;box-shadow:0 0 0 2px var(--vora) inset,0 3px 0 var(--vora);cursor:pointer}
.mp-step b{font-size:30px;min-width:60px;text-align:center}
.mp-quad{display:inline-grid;gap:3px;padding:8px;background:#fff;border-radius:12px;margin:6px auto;max-width:100%}
.mp-quad i{display:block;width:var(--q,22px);height:var(--q,22px);border-radius:4px;background:#3b82f6;box-shadow:inset 0 -3px 0 #1d4ed8}
.mp-quad.ok i{background:#22c55e;box-shadow:inset 0 -3px 0 #15803d}
.mp-sob{display:flex;gap:3px;justify-content:center;flex-wrap:wrap;margin-top:4px}
.mp-sob i{display:block;width:var(--q,22px);height:var(--q,22px);border-radius:4px;background:#ef4444;box-shadow:inset 0 -3px 0 #b91c1c;animation:mpTr .4s ease-in-out 2}
@keyframes mpTr{50%{transform:translateY(-5px)}}
.mp-xips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}
.mp-xips span{background:#dcfce7;border:2px solid #86efac;border-radius:999px;padding:4px 12px;font-weight:900}
.mp-svg{width:100%;height:auto;display:block;background:#fff;border-radius:12px;touch-action:manipulation}
.mp-svg .tk{cursor:pointer}
.mp-svg .tk:hover rect{fill:#fef9c3}
.mp-bts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0}
.mp-bts .btn{padding:9px 14px}
.mp-mides{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}
.mp-mides button{min-width:46px;height:46px;border-radius:12px;border:2px solid var(--vora);background:#fff;font-size:18px;font-weight:900;cursor:pointer}
.mp-mides button.ok{background:#dcfce7;border-color:#22c55e}.mp-mides button.ko{background:#fee2e2;border-color:#fca5a5}.mp-mides button.sel{box-shadow:0 0 0 3px var(--blau)}
.mp-arbre{display:flex;justify-content:center;overflow-x:auto;padding:6px 0}
.mp-node{display:flex;flex-direction:column;align-items:center}
.mp-node>button{min-width:52px;height:52px;padding:0 8px;border-radius:999px;border:3px solid #94a3b8;background:#fff;font-size:19px;font-weight:900;cursor:pointer}
.mp-node>button.pr{background:#dcfce7;border-color:#22c55e;cursor:default}
.mp-node>button.obre{border-color:var(--blau);box-shadow:0 0 0 4px #bfdbfe}
.mp-fills{display:flex;gap:10px;margin-top:16px;position:relative;padding-top:4px}
.mp-fills:before{content:"";position:absolute;top:-12px;left:25%;right:25%;border-top:3px solid #94a3b8;border-left:3px solid #94a3b8;border-right:3px solid #94a3b8;height:10px;border-radius:6px 6px 0 0}
`;document.head.appendChild(s)}
const mpCap=(t)=>`<div class="mp-cap"><span>${t}</span><span>${MP.r+1} de ${MP.rondes.length}</span></div>`;
function mpInici(j,rondes,pinta){mpCss();MP={j,rondes,r:0,bones:0,errs:0,pinta,fi:false};pinta()}
function mpSeg(){if(MP.r+1<MP.rondes.length){MP.r++;MP.pinta();window.scrollTo(0,0);return}
 MP.fi=true;app.innerHTML=`<h2 class="sec">${MP.j.enunciat||MP.j.titol}</h2><div class="box"><p>Has fet les <b>${MP.rondes.length} rondes</b>.</p><div id="zona"></div></div>`;
 fiJoc(MP.j,Math.max(1,MP.bones),MP.errs,{mode:"manipulatiu"})}
const mpBotoSeg=(txt)=>`<div class="fila"><button class="btn" id="mpSeg" onclick="mpSeg()">${MP.r+1<MP.rondes.length?"Següent ▶":"Acaba 🏁"}</button></div>`;
const mpEstrella=()=>{MP.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)};

// ---------- 🟦 RECTANGLES DE QUADRADETS: un divisor és el costat d'un rectangle exacte ----------
function mpRectangles(j){mpInici(j,j.mp.nombres.map(n=>({n,files:1,trobats:new Set()})),mpRectPinta)}
function mpRectPinta(){const R=MP.rondes[MP.r],{n,files}=R,q=Math.floor(n/files),sob=n%files,mida=Math.max(9,Math.min(26,Math.floor(300/Math.max(q,files))));
 if(!sob)R.trobats.add(Math.min(files,n/files));
 const parells=mpDiv(n).filter(d=>d*d<=n),fets=[...R.trobats].sort((a,b)=>a-b);
 app.innerHTML=`<h2 class="sec">${MP.j.enunciat||MP.j.titol}</h2><div class="box">${mpCap("🟦 Rectangles de quadradets")}
 <p class="mp-big">Tens <b>${n} quadradets</b>. Posa'ls en files iguals. Quan surt un <b>rectangle sense que en sobri cap</b>, has trobat dos divisors de ${n}.</p>
 <div class="mp-step"><button onclick="mpRectFiles(-1)" aria-label="menys files">−</button><b>${files}</b><button onclick="mpRectFiles(1)" aria-label="més files">＋</button></div><p style="text-align:center;margin:-4px 0 6px" class="prog">files</p>
 <div style="text-align:center"><div class="mp-quad${sob?"":" ok"}" style="--q:${mida}px;grid-template-columns:repeat(${q},var(--q))">${"<i></i>".repeat(q*files)}</div>
 ${sob?`<div class="mp-sob" style="--q:${mida}px">${"<i></i>".repeat(sob)}</div>`:""}</div>
 <div class="fb ${sob?"":"ok"}">${sob?`❌ ${files} files de ${q} i en sobren <b>${sob}</b>: ${n} : ${files} no és exacta → ${files} <b>no</b> és divisor de ${n}.`:`✅ ${files} files de ${q}: ${files} · ${q} = ${n} → <b>${files}</b> i <b>${q}</b> són divisors de ${n}.`}</div>
 <p style="margin:10px 0 2px"><b>Rectangles trobats:</b> ${fets.length} de ${parells.length}</p><div class="mp-xips">${fets.map(d=>`<span>${d} × ${n/d}</span>`).join("")||"<small class='prog'>encara cap</small>"}</div>
 <div id="mpFb">${R.msg||""}</div>${R.fet?"":`<div class="fila"><button class="btn verd" onclick="mpRectFet()">Ja els tinc tots ✔</button></div>`}<div id="zona"></div></div>`}
function mpRectFiles(d){const R=MP.rondes[MP.r];R.files=Math.max(1,Math.min(R.n,R.files+d));if(typeof so==="function")so("clic");mpRectPinta()}
function mpRectFet(){const R=MP.rondes[MP.r];if(R.fet)return;const par=mpDiv(R.n).filter(d=>d*d<=R.n),fb=document.getElementById("mpFb");
 if(R.trobats.size<par.length){MP.errs++;if(typeof sacseja==="function")sacseja(fb.parentNode);fb.innerHTML=`<div class="fb ko">Encara ${par.length-R.trobats.size===1?"en falta 1":`en falten ${par.length-R.trobats.size}`}. Prova altres nombres de files.</div>`;return}
 mpEstrella();if(typeof so==="function")so("ok");const pr=mpPrimer(R.n);R.fet=true;
 R.msg=`<div class="fb ok">🎉 ${pr?`<b>${R.n}</b> només fa el rectangle 1 × ${R.n}: només té dos divisors → és <b>PRIMER</b>.`:`Divisors de ${R.n}: <b>${mpDiv(R.n).join(", ")}</b>. Van per parelles: ${par.map(d=>`${d} · ${R.n/d}`).join(", ")}.`}</div>${mpBotoSeg()}`;mpRectPinta()}

// ---------- 🐸 LES GRANOTES: el MCM és el primer lloc on coincideixen ----------
function mpGranotes(j){mpInici(j,j.mp.parells.map(([a,b])=>({a,b,va:0,vb:0,fet:false,int:0})),mpGranPinta)}
function mpGranPinta(){const R=MP.rondes[MP.r],{a,b}=R,m=mpMCM(a,b),L=Math.min(80,Math.max(m+Math.max(a,b),Math.ceil(m*1.3))),W=640,x0=20,x1=W-20,X=v=>x0+(x1-x0)*v/L,y=78;
 const salts=(p,v,amunt,col)=>{let s="";for(let k=1;k<=v;k++){const xa=X((k-1)*p),xb=X(k*p),h=Math.min(46,(xb-xa)*.6);s+=`<path d="M${xa} ${y} Q${(xa+xb)/2} ${amunt?y-h*1.6:y+h*1.6} ${xb} ${y}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="5 4"/>`}
  for(let k=1;k<=v;k++)s+=`<circle cx="${X(k*p)}" cy="${amunt?y-7:y+7}" r="5" fill="${col}"/>`;return s};
 let tk="";const pas=L<=30?1:L<=60?2:5;for(let v=0;v<=L;v++){const g=v%pas===0;tk+=`<g class="tk" onclick="mpGranTria(${v})"><rect x="${X(v)-(x1-x0)/L/2}" y="${y-22}" width="${(x1-x0)/L}" height="44" fill="transparent"/><line x1="${X(v)}" x2="${X(v)}" y1="${y-(g?8:4)}" y2="${y+(g?8:4)}" stroke="#334155" stroke-width="${g?2:1}"/>${g?`<text x="${X(v)}" y="${y+28}" font-size="13" text-anchor="middle" fill="#334155">${v}</text>`:""}</g>`}
 const gv=`<text x="${X(R.va*a)}" y="${y-40}" font-size="26" text-anchor="middle">🐸</text>`,gb=`<text x="${X(R.vb*b)}" y="${y+62}" font-size="26" text-anchor="middle" style="filter:hue-rotate(160deg)">🐸</text>`;
 app.innerHTML=`<h2 class="sec">${MP.j.enunciat||MP.j.titol}</h2><div class="box">${mpCap("🐸 Les granotes")}
 <p class="mp-big">La granota <b style="color:#16a34a">verda</b> salta de <b>${a} en ${a}</b> i la <b style="color:#2563eb">blava</b> de <b>${b} en ${b}</b>. Surten juntes del 0. <b>On tornaran a caure juntes per primer cop?</b> Fes-les saltar i després <b>toca aquell número</b> a la recta.</p>
 <svg class="mp-svg" viewBox="0 0 ${W} 160" role="img" aria-label="recta numèrica amb dues granotes"><line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#334155" stroke-width="3"/>${salts(a,R.va,true,"#16a34a")}${salts(b,R.vb,false,"#2563eb")}${tk}${gv}${gb}</svg>
 <div class="mp-bts"><button class="btn" style="background:#16a34a" onclick="mpGranSalta('a')">Salta la verda (+${a})</button><button class="btn" onclick="mpGranSalta('b')">Salta la blava (+${b})</button></div>
 <p class="prog" style="text-align:center">Verda: ${[...Array(R.va+1)].map((_,k)=>k*a).join(", ")} · Blava: ${[...Array(R.vb+1)].map((_,k)=>k*b).join(", ")}</p>
 <div id="mpFb">${R.msg||""}</div><div id="zona"></div></div>`}
function mpGranSalta(q){const R=MP.rondes[MP.r];if(R.fet)return;const m=mpMCM(R.a,R.b),L=Math.min(80,Math.max(m+Math.max(R.a,R.b),Math.ceil(m*1.3)));
 if(q==="a"&&(R.va+1)*R.a<=L)R.va++;if(q==="b"&&(R.vb+1)*R.b<=L)R.vb++;if(typeof so==="function")so("clic");R.msg="";mpGranPinta()}
function mpGranTria(v){const R=MP.rondes[MP.r];if(R.fet)return;const {a,b}=R,m=mpMCM(a,b);
 if(v===m){R.fet=true;if(!R.int)mpEstrella();if(typeof so==="function")so("ok");R.va=m/a;R.vb=m/b;
  R.msg=`<div class="fb ok">🎉 Al <b>${m}</b>! És el primer nombre que és múltiple de ${a} i de ${b} alhora: <b>MCM (${a}, ${b}) = ${m}</b>. Per això els problemes de «tornar a coincidir» són de MCM.</div>${mpBotoSeg()}`;return mpGranPinta()}
 R.int++;MP.errs++;if(typeof so==="function")so("ko");
 R.msg=`<div class="fb ko">${v===0?"Al 0 ja hi són al principi: busca on es tornen a trobar.":v%a&&v%b?`Cap de les dues granotes passa pel ${v}.`:v%a?`La verda no passa pel ${v} (salta de ${a} en ${a}).`:v%b?`La blava no passa pel ${v} (salta de ${b} en ${b}).`:`Al ${v} sí que hi coincideixen, però abans ja s'havien trobat en un altre lloc.`}</div>`;mpGranPinta()}

// ---------- 🧱 LES RAJOLES: el MCD és la rajola quadrada més gran que encaixa justa ----------
function mpRajoles(j){mpInici(j,j.mp.parells.map(([a,b])=>({a,b,s:null,prov:{},fet:false,int:0})),mpRajPinta)}
function mpRajPinta(){const R=MP.rondes[MP.r],{a,b,s}=R,g=mpMCD(a,b),W=560,k=Math.min((W-20)/a,220/b),w=a*k,h=b*k,ox=(W-w)/2,oy=10;
 let rj="";if(s){const na=Math.floor(a/s),nb=Math.floor(b/s);for(let i=0;i<na;i++)for(let t=0;t<nb;t++)rj+=`<rect x="${ox+i*s*k+1}" y="${oy+t*s*k+1}" width="${s*k-2}" height="${s*k-2}" rx="3" fill="${a%s||b%s?"#93c5fd":"#86efac"}" stroke="${a%s||b%s?"#2563eb":"#16a34a"}" stroke-width="1.5"/>`;
  if(a%s)rj+=`<rect x="${ox+na*s*k}" y="${oy}" width="${(a%s)*k}" height="${h}" fill="#fecaca" stroke="#ef4444" stroke-dasharray="5 3"/>`;
  if(b%s)rj+=`<rect x="${ox}" y="${oy+nb*s*k}" width="${w}" height="${(b%s)*k}" fill="#fecaca" stroke="#ef4444" stroke-dasharray="5 3"/>`}
 const max=Math.min(a,b),mides=[...Array(max)].map((_,i)=>i+1).filter(x=>max<=16||x<=8||a%x===0||b%x===0);
 const exacta=s&&!(a%s)&&!(b%s);
 app.innerHTML=`<h2 class="sec">${MP.j.enunciat||MP.j.titol}</h2><div class="box">${mpCap("🧱 Les rajoles")}
 <p class="mp-big">Volem enrajolar un terra de <b>${a} × ${b}</b> pams amb rajoles quadrades iguals, <b>sense tallar-ne cap</b> i <b>tan grans com es pugui</b>. Tria la mida del costat de la rajola:</p>
 <div class="mp-mides">${mides.map(x=>`<button class="${R.prov[x]===1?"ok":R.prov[x]===0?"ko":""}${s===x?" sel":""}" onclick="mpRajTria(${x})">${x}</button>`).join("")}</div>
 <svg class="mp-svg" viewBox="0 0 ${W} ${h+20}" role="img" aria-label="terra rectangular amb rajoles"><rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="#f8fafc" stroke="#334155" stroke-width="3"/>${rj}</svg>
 <div id="mpFb">${R.fet?R.msg:s?`<div class="fb ${exacta?"ok":"ko"}">${exacta?`✅ Rajoles de ${s}: encaixen justes (${a/s} × ${b/s} = ${a/s*b/s} rajoles). ${s} divideix ${a} i ${b}.`:`❌ Rajoles de ${s}: sobra una franja vermella. ${a%s?`${a} : ${s} no és exacta.`:`${b} : ${s} no és exacta.`}`}</div>${exacta?`<div class="fila"><button class="btn verd" onclick="mpRajFet()">Aquesta és la més gran ✔</button></div>`:""}`:""}</div><div id="zona"></div></div>`}
function mpRajTria(x){const R=MP.rondes[MP.r];if(R.fet)return;R.s=x;R.prov[x]=R.a%x||R.b%x?0:1;if(typeof so==="function")so("clic");mpRajPinta()}
function mpRajFet(){const R=MP.rondes[MP.r],g=mpMCD(R.a,R.b);if(R.fet)return;
 if(R.s!==g){R.int++;MP.errs++;if(typeof so==="function")so("ko");document.getElementById("mpFb").insertAdjacentHTML("beforeend",`<div class="fb ko">N'hi ha una de més gran que també encaixa justa. Prova mides més grans!</div>`);return}
 R.fet=true;if(!R.int)mpEstrella();if(typeof so==="function")so("ok");
 R.msg=`<div class="fb ok">🎉 La més gran és la de <b>${g}</b>: és el divisor comú més gran de ${R.a} i ${R.b} → <b>MCD (${R.a}, ${R.b}) = ${g}</b>. Per això els problemes de «repartir en parts iguals, tan grans com es pugui» són de MCD.</div>${mpBotoSeg()}`;mpRajPinta()}

// ---------- 🌳 L'ARBRE DE FACTORS: parteix el nombre fins que tot siguin primers ----------
function mpArbre(j){mpInici(j,j.mp.nombres.map(n=>({n,arrel:{v:n},obre:null,fet:false,int:0,camins:0})),mpArbPinta)}
function mpFulles(nd){return nd.f?[...mpFulles(nd.f[0]),...mpFulles(nd.f[1])]:[nd]}
function mpArbHtml(nd,path){const pr=mpPrimer(nd.v),R=MP.rondes[MP.r];
 return `<div class="mp-node"><button class="${pr?"pr":""}${R.obre===path?" obre":""}" onclick="mpArbToca('${path}')">${nd.v}</button>${nd.f?`<div class="mp-fills">${mpArbHtml(nd.f[0],path+"0")}${mpArbHtml(nd.f[1],path+"1")}</div>`:""}</div>`}
function mpNode(path){let nd=MP.rondes[MP.r].arrel;for(const c of path.slice(1))nd=nd.f[+c];return nd}
function mpArbPinta(){const R=MP.rondes[MP.r],fulles=mpFulles(R.arrel),acabat=fulles.every(f=>mpPrimer(f.v));let opc="";
 if(R.obre&&!acabat){const v=mpNode(R.obre).v,ps=[];for(let d=2;d*d<=v;d++)if(v%d===0)ps.push([d,v/d]);
  opc=`<p style="text-align:center;margin:8px 0 2px"><b>Com vols partir el ${v}?</b></p><div class="mp-bts">${ps.slice(0,5).map(([x,y])=>`<button class="btn sec" onclick="mpArbParteix('${R.obre}',${x})">${x} · ${y}</button>`).join("")}</div>`}
 const ps=fulles.map(f=>f.v).sort((a,b)=>a-b);
 app.innerHTML=`<h2 class="sec">${MP.j.enunciat||MP.j.titol}</h2><div class="box">${mpCap("🌳 L'arbre de factors")}
 <p class="mp-big">Toca un nombre que <b>no sigui primer</b> i parteix-lo en dos. Continua fins que totes les fulles siguin <b style="color:#16a34a">primers (verdes)</b>.</p>
 <div class="mp-arbre">${mpArbHtml(R.arrel,"r")}</div>${opc}<div id="mpFb">${acabat&&!R.fet?mpArbPregunta(R,ps):R.msg||""}</div><div id="zona"></div></div>`}
function mpArbToca(path){const R=MP.rondes[MP.r],nd=mpNode(path);if(R.fet||nd.f||mpPrimer(nd.v))return;R.obre=path;if(typeof so==="function")so("clic");mpArbPinta()}
function mpArbParteix(path,x){const nd=mpNode(path);nd.f=[{v:x},{v:nd.v/x}];MP.rondes[MP.r].obre=null;if(typeof so==="function")so("ok");mpArbPinta()}
function mpArbPregunta(R,ps){if(!R.op){const bo=mpPot(ps),c={};ps.forEach(p=>c[p]=(c[p]||0)+1);const ks=Object.keys(c).map(Number),k0=ks[0];
  const m1=mpPot(ps.filter(p=>p!==k0).concat(Array((c[k0]%3)+1).fill(k0))),m2=ps.length>2?ps.slice(0,-2).concat([ps[ps.length-2]*ps[ps.length-1]]).join(" · "):`1 · ${ps.join(" · ")}`;
  R.op=MP_B3([...new Set([bo,m1,m2,mpPot(ps.concat([k0]))])].slice(0,3));R.bo=bo}
 return `<div class="fb ok">🌿 Totes les fulles són primeres! Quin és el resultat amb potències?</div><div class="mx-opc" style="display:flex;flex-direction:column;gap:8px;margin-top:8px">${R.op.map((o,i)=>`<button class="btn sec" style="text-align:left" onclick="mpArbResp(${i})">${R.n} = ${o}</button>`).join("")}</div>`}
const MP_B3=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[a[i],a[k]]=[a[k],a[i]]}return a};
function mpArbResp(i){const R=MP.rondes[MP.r];if(R.fet)return;
 if(R.op[i]!==R.bo){R.int++;MP.errs++;if(typeof so==="function")so("ko");document.getElementById("mpFb").insertAdjacentHTML("beforeend",`<div class="fb ko">Compta les fulles verdes: quantes vegades surt cada primer? (I a la descomposició només hi van primers.)</div>`);return}
 R.fet=true;R.camins++;if(!R.int)mpEstrella();if(typeof so==="function")so("ok");
 R.msg=`<div class="fb ok">🎉 <b>${R.n} = ${R.bo}</b>. Si ho tornes a fer començant d'una altra manera, sortiran els mateixos primers: la descomposició és única, com el DNI del nombre.</div><div class="fila"><button class="btn sec" onclick="mpArbAltre()">🔁 Prova un altre camí</button></div>${mpBotoSeg()}`;mpArbPinta()}
function mpArbAltre(){const R=MP.rondes[MP.r];Object.assign(R,{arrel:{v:R.n},obre:null,fet:false,int:0,op:null,msg:""});mpArbPinta()}

// ---------- PROVA AUTOMÀTICA (motor/prova.js) ----------
function mpProva(j){const fn={mpRectangles,mpGranotes,mpRajoles,mpArbre}[j.fn];if(!fn)return "funció desconeguda";fn(j);let s=0;
 while(MP&&!MP.fi&&s++<400){const b=document.getElementById("mpSeg");if(b){b.click();continue}const R=MP.rondes[MP.r];
  if(j.fn==="mpRectangles"){for(let f=1;f<=R.n;f++){R.files=f;mpRectPinta()}mpRectFet();continue}
  if(j.fn==="mpGranotes"){mpGranSalta("a");mpGranSalta("b");mpGranTria(mpMCM(R.a,R.b));continue}
  if(j.fn==="mpRajoles"){mpRajTria(mpMCD(R.a,R.b));mpRajFet();continue}
  if(j.fn==="mpArbre"){const f=mpFulles(R.arrel).find(x=>!mpPrimer(x.v));if(f){let p="r";const busca=(nd,pt)=>{if(nd===f)p=pt;if(nd.f){busca(nd.f[0],pt+"0");busca(nd.f[1],pt+"1")}};busca(R.arrel,"r");mpArbToca(p);let d=2;while(f.v%d)d++;mpArbParteix(p,d);continue}
   mpArbPinta();mpArbResp(R.op.indexOf(R.bo));continue}}
 if(!MP||!MP.fi)return "no ha acabat";if(MP.errs)return `${MP.errs} errors amb les respostes bones`;return true}
