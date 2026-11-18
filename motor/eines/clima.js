// ===================== 🌦️ EINES DEL CLIMA (motor/eines/clima.js) =====================
// 1) Generador «climograma» per al taller (exercicis-mates.js): un climograma nou cada vegada i els càlculs pas a pas
//    (mes més calorós, amplitud tèrmica, temperatura mitjana, precipitació total, mesos secs i tipus de clima).
//    Joc: {id:"fx-climo",tipus:"custom",fn:"mxFitxa",prova:"mxProva",mx:{tipus:["climograma"],n:3},…}
// 2) «Construeix el climograma» (jocConstrueix): el nen toca la graella per posar cada barra de pluja i cada punt de temperatura.
//    Joc: {id:"cl-construeix",tipus:"custom",fn:"jocConstrueix",prova:"jocConstrueixProva",ciutats:[{nom,T:[12],P:[12]}],…}
// S'inclou DARRERE del taller:  //@inclou eines/vistes-mates.js · //@inclou eines/exercicis-mates.js · //@inclou eines/clima.js
const CL_MES=["G","F","M","A","M","J","J","A","S","O","N","D"],CL_MESN=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
// climograma dibuixat. o.mk: {max:i, min:i, sec:true (marca els mesos secs), valT:true, valP:true}
function clSvg(T,P,o){o=o||{};const W=440,H=250,x0=40,x1=400,y0=212,y1=18,bw=(x1-x0)/12,pmax=Math.max(120,Math.ceil(Math.max(...P)/60)*60),tmax=pmax/4,yp=v=>y0-(v/pmax)*(y0-y1),yt=v=>y0-(v/tmax)*(y0-y1);
 let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:460px" role="img" aria-label="Climograma" font-family="Nunito,Arial,sans-serif"><rect x="${x0}" y="${y1}" width="${x1-x0}" height="${y0-y1}" rx="6" fill="#f8fafc"/>`;
 for(let g=0;g<=6;g++){const y=y0-g*(y0-y1)/6;s+=`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#e2e8f0"/><text x="${x0-6}" y="${y+4}" font-size="11" text-anchor="end" fill="#dc2626">${Math.round(g*tmax/6)}</text><text x="${x1+6}" y="${y+4}" font-size="11" fill="#2563eb">${Math.round(g*pmax/6)}</text>`}
 P.forEach((v,i)=>{const sec=o.sec&&v<2*T[i];s+=`<rect x="${x0+i*bw+4}" y="${yp(v)}" width="${bw-8}" height="${y0-yp(v)}" rx="3" fill="${sec?"#fbbf24":"#60a5fa"}" stroke="${sec?"#b45309":"none"}" stroke-width="2"/>`+(o.valP?`<text x="${x0+i*bw+bw/2}" y="${yp(v)-3}" font-size="9" text-anchor="middle" fill="#1d4ed8">${v}</text>`:"")+`<text x="${x0+i*bw+bw/2}" y="${y0+15}" font-size="12" text-anchor="middle" fill="#334155">${CL_MES[i]}</text>`});
 s+=`<polyline fill="none" stroke="#dc2626" stroke-width="3" stroke-linejoin="round" points="${T.map((v,i)=>`${x0+i*bw+bw/2},${yt(v)}`).join(" ")}"/>`;
 T.forEach((v,i)=>{const mk=o.max===i||o.min===i;s+=`<circle cx="${x0+i*bw+bw/2}" cy="${yt(v)}" r="${mk?7:4}" fill="${mk?"#fef08a":"#fff"}" stroke="${mk?"#ca8a04":"#dc2626"}" stroke-width="${mk?3:2}"/>`+(o.valT||mk?`<text x="${x0+i*bw+bw/2}" y="${yt(v)-9}" font-size="10" font-weight="800" text-anchor="middle" fill="#b91c1c">${v}</text>`:"")});
 return s+`<text x="${x0-30}" y="12" font-size="11" fill="#dc2626">°C</text><text x="${x1+2}" y="12" font-size="11" fill="#2563eb">mm</text>${o.titol?`<text x="${W/2}" y="${H-4}" font-size="12" text-anchor="middle" font-weight="700" fill="#334155">${o.titol}</text>`:""}</svg>`}
function clTaula(T,P){return `<table class="mxv-pot" style="font-size:13px;border-spacing:2px"><tr><th></th>${CL_MES.map(m=>`<th>${m}</th>`).join("")}</tr><tr><th>°C</th>${T.map(v=>`<td style="min-width:22px;height:24px">${v}</td>`).join("")}</tr><tr><th>mm</th>${P.map(v=>`<td style="min-width:22px;height:24px">${v}</td>`).join("")}</tr></table>`}
const CL_TIPUS={
 lit:{nom:"Mediterrani litoral",T:[9,10,12,14,18,22,25,25,22,18,13,10],P:[50,40,45,50,45,30,20,35,70,90,60,50],pista:"Hiverns suaus (més de 8 °C) i estiu sec: a prop del mar."},
 cont:{nom:"Mediterrani continentalitzat",T:[5,7,10,12,16,21,24,24,20,15,9,5],P:[30,25,35,50,55,40,20,30,50,55,40,30],pista:"Hiverns freds (uns 5 °C), estius calorosos i poca pluja: lluny del mar, com Igualada."},
 munt:{nom:"De muntanya",T:[1,2,5,7,11,15,18,18,14,10,5,2],P:[50,45,55,75,95,90,70,85,80,75,65,55],pista:"Temperatures baixes tot l'any i molta pluja: a dalt de la muntanya."}};
Object.assign(MXG,{
 climograma(nv){
  const k=MX_T(nv===1?["lit","cont"]:["lit","cont","munt"]),B=CL_TIPUS[k];
  const T=B.T.map((v,i)=>i===0||i===6?v:Math.max(0,v+MX_R(-1,1))),P=B.P.map(v=>Math.max(5,v+5*MX_R(-2,2)));
  // juliol, el mes més calorós (sol); gener, el més fred (sol); la suma de temperatures, divisible per 12 (mitjana exacta)
  T[6]=Math.max(...T)+1;T[0]=Math.min(...T.slice(1))-1;if(T[0]<0){T[0]=0;T.forEach((v,i)=>{if(i&&v<=0)T[i]=1})}
  // per a la mitjana exacta, se sumen els graus que falten (1 o 2 per mes) als mesos de primavera i tardor, que no són ni el màxim ni el mínim
  let sum=T.reduce((a,b)=>a+b,0),fix=(12-sum%12)%12;for(let k=0;fix>0;k++){T[[2,3,4,8,9,10][k%6]]++;fix--}
  sum=T.reduce((a,b)=>a+b,0);
  const tmax=T[6],tmin=T[0],amp=tmax-tmin,mitj=sum/12,ptot=P.reduce((a,b)=>a+b,0),secs=P.map((v,i)=>v<2*T[i]?i:-1).filter(i=>i>=0);
  const dib=mk=>`${clSvg(T,P,mk||{})}<div style="overflow-x:auto">${clTaula(T,P)}</div>`;
  const ord=MX_B([0,1,2]),ops=["juliol","gener",CL_MESN[MX_T([3,4,9,10])]];
  const tipus=["Mediterrani litoral","Mediterrani continentalitzat","De muntanya"],ot=MX_B([0,1,2]);
  return {enun:`Comenta aquest climograma. Les dades de cada mes són a la taula.`,passos:[
   {t:"tria",id:"maxim",q:"Quin és el <b>mes més calorós</b>?",op:ord.map(i=>ops[i]),r:ord.indexOf(0),ctx:mk=>dib(mk?{max:6}:{}),pista:"Busca el punt més alt de la línia vermella.",
    err:v=>mxE("mes",ord[v]===1?"El gener és el mes més fred: el punt més baix de la línia.":"Mira on arriba més amunt la línia vermella.")},
   {t:"num",id:"amplitud",q:`Calcula l'<b>amplitud tèrmica</b>: temperatura del mes més calorós − la del mes més fred.`,r:amp,ctx:mk=>dib(mk?{max:6,min:0}:{}),pista:"És una resta: la més alta menys la més baixa.",
    err:v=>v===tmax+tmin?mxE("amplitud_suma",`Has sumat (${tmax} + ${tmin}). L'amplitud és la resta: ${tmax} − ${tmin}.`):mxE("calcul",`Mes més calorós: ${tmax} °C. Mes més fred: ${tmin} °C. Resta-les.`)},
   {t:"num",id:"suma",q:"Suma les <b>12 temperatures</b> de la taula.",r:sum,ctx:mk=>dib(mk?{valT:true}:{}),pista:"Suma-les de dues en dues a la llibreta.",
    err:()=>mxE("calcul","Torna a sumar-les amb calma, de dues en dues.")},
   {t:"num",id:"mitjana",q:`Calcula la <b>temperatura mitjana anual</b>: ${sum} : 12.`,r:mitj,ctx:mk=>dib(mk?{valT:true}:{}),pista:"La mitjana és la suma dividida pel nombre de mesos (12).",
    err:v=>v===sum?mxE("mitjana","Ara cal dividir la suma entre 12."):mxE("calcul",`12 · ${mitj} = ${sum}. Prova-ho.`)},
   {t:"num",id:"pluja",q:"Calcula la <b>precipitació total</b> de l'any (suma les 12 barres).",r:ptot,ctx:mk=>dib(mk?{valP:true}:{}),pista:"Suma tots els mm de la taula.",
    err:v=>v===Math.round(ptot/12)?mxE("total_mitjana","Això seria la mitjana. La precipitació total és la suma, sense dividir."):mxE("calcul","Torna a sumar els mm de la taula.")},
   {t:"num",id:"secs",q:"Quants <b>mesos secs</b> hi ha? (Un mes és sec quan P < 2 · T: la barra queda sota la línia.)",r:secs.length,ctx:mk=>dib(mk?{sec:true}:{}),pista:"Per a cada mes, multiplica la temperatura per 2 i mira si la pluja és més petita.",
    err:()=>mxE("gaussen",`Mira mes a mes: és sec si P < 2 · T. Per exemple, al juliol: ${P[6]} mm ${P[6]<2*T[6]?"<":"≥"} ${2*T[6]}.`)},
   {t:"tria",id:"tipus",q:"Quin <b>tipus de clima</b> és?",op:ot.map(i=>tipus[i]),r:ot.indexOf(tipus.indexOf(B.nom)),ctx:mk=>dib({}),pista:B.pista,
    err:()=>mxE("tipus_clima",B.pista)}],
   sol:`Mes més calorós: juliol (${tmax} °C) · més fred: gener (${tmin} °C)<br>Amplitud tèrmica: ${tmax} − ${tmin} = <b>${amp} °C</b><br>Temperatura mitjana: ${sum} : 12 = <b>${mitj} °C</b><br>Precipitació total: <b>${mxN(ptot)} mm</b><br>Mesos secs (P &lt; 2 · T): <b>${secs.length}</b>${secs.length?` (${secs.map(i=>CL_MESN[i]).join(", ")})`:""}<br>Clima: <b>${B.nom}</b>`,
   chk:{tipus:"climograma",T,P,amp,mitj,ptot,secs:secs.length}};
 }
});
// ---------- 📈 CONSTRUEIX EL CLIMOGRAMA ----------
let CC=null;
const CC_PMAX=120,CC_TMAX=30,CC_PSTEP=10,CC_TSTEP=2;
function jocConstrueix(j){if(typeof mxvCss==="function")mxvCss();CC={j,c:0,fase:"P",v:Array(12).fill(null),int:0,bones:0,errs:0,fi:false};ccPinta()}
function ccSvg(){const {fase,v}=CC,ci=CC.j.ciutats[CC.c],W=440,H=250,x0=40,x1=400,y0=212,y1=18,bw=(x1-x0)/12,yp=x=>y0-(x/CC_PMAX)*(y0-y1),yt=x=>y0-(x/CC_TMAX)*(y0-y1);
 let s=`<svg id="ccSvg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:460px;touch-action:manipulation" role="img" aria-label="Graella del climograma" font-family="Nunito,Arial,sans-serif"><rect x="${x0}" y="${y1}" width="${x1-x0}" height="${y0-y1}" fill="#f8fafc"/>`;
 const steps=fase==="P"?CC_PMAX/CC_PSTEP:CC_TMAX/CC_TSTEP;for(let g=0;g<=steps;g++){const y=y0-g*(y0-y1)/steps;s+=`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="${g%2?"#f1f5f9":"#e2e8f0"}"/>`}
 for(let g=0;g<=6;g++){const y=y0-g*(y0-y1)/6;s+=`<text x="${x0-6}" y="${y+4}" font-size="11" text-anchor="end" fill="#dc2626">${g*CC_TMAX/6}</text><text x="${x1+6}" y="${y+4}" font-size="11" fill="#2563eb">${g*CC_PMAX/6}</text>`}
 const P=fase==="P"?v:ci.P;
 P.forEach((x,i)=>{if(x!==null&&x!==undefined)s+=`<rect class="cc-b" data-i="${i}" x="${x0+i*bw+4}" y="${yp(x)}" width="${bw-8}" height="${y0-yp(x)}" rx="3" fill="${CC.mal&&CC.mal.has(i)&&fase==="P"?"#fca5a5":"#60a5fa"}"/>`});
 if(fase==="T"){const pts=v.map((x,i)=>x===null?null:`${x0+i*bw+bw/2},${yt(x)}`).filter(Boolean);if(pts.length>1)s+=`<polyline fill="none" stroke="#dc2626" stroke-width="3" points="${pts.join(" ")}"/>`;
  v.forEach((x,i)=>{if(x!==null)s+=`<circle cx="${x0+i*bw+bw/2}" cy="${yt(x)}" r="5" fill="${CC.mal&&CC.mal.has(i)?"#fca5a5":"#fff"}" stroke="#dc2626" stroke-width="2.4"/>`})}
 for(let i=0;i<12;i++)s+=`<rect class="cc-col" data-i="${i}" x="${x0+i*bw}" y="${y1}" width="${bw}" height="${y0-y1}" fill="transparent"/><text x="${x0+i*bw+bw/2}" y="${y0+15}" font-size="12" text-anchor="middle" fill="#334155">${CL_MES[i]}</text>`;
 return s+`<text x="${x0-30}" y="12" font-size="11" fill="#dc2626">°C</text><text x="${x1+2}" y="12" font-size="11" fill="#2563eb">mm</text></svg>`}
function ccPinta(){const {j,c,fase}=CC,ci=j.ciutats[c];
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><div class="jg-cap"><span class="jg-ap">${ci.nom} · ${fase==="P"?"1. Les barres de pluja":"2. La línia de temperatura"}</span><span class="prog">${c+1} de ${j.ciutats.length}</span></div>
 <p style="margin:6px 0">${fase==="P"?`Toca cada columna a l'altura de la <b>precipitació</b> (escala blava de la dreta, de ${CC_PSTEP} en ${CC_PSTEP} mm).`:`Ara toca cada columna a l'altura de la <b>temperatura</b> (escala vermella de l'esquerra, de ${CC_TSTEP} en ${CC_TSTEP} °C).`}</p>
 <div style="overflow-x:auto">${clTaula(ci.T,ci.P)}</div><div id="ccG" style="text-align:center">${ccSvg()}</div>
 <div id="ccFb" role="status" aria-live="polite"></div><div class="fila" id="ccBts"><button class="btn" id="ccComp" onclick="ccComprova()">Comprova ✔</button></div><div id="zona"></div></div>`;
 ccEnganxa()}
function ccEnganxa(){const sv=document.getElementById("ccSvg");if(!sv)return;sv.onclick=e=>{const col=e.target.closest(".cc-col,.cc-b");if(!col)return;const pt=sv.createSVGPoint?sv.createSVGPoint():null;let y;
  if(pt&&sv.getScreenCTM()){pt.x=e.clientX;pt.y=e.clientY;y=pt.matrixTransform(sv.getScreenCTM().inverse()).y}else return;ccPosa(+col.dataset.i,y)}}
// posa el valor de la columna i a partir de l'altura y (coordenades del SVG)
function ccPosa(i,y){if(!CC||CC.fase==="fet")return;const y0=212,y1=18,max=CC.fase==="P"?CC_PMAX:CC_TMAX,st=CC.fase==="P"?CC_PSTEP:CC_TSTEP;
 let v=Math.round(((y0-y)/(y0-y1))*max/st)*st;v=Math.max(0,Math.min(max,v));CC.v[i]=v;if(CC.mal)CC.mal.delete(i);if(typeof so==="function")so("clic");
 document.getElementById("ccG").innerHTML=ccSvg();ccEnganxa()}
function ccComprova(){if(!CC||CC.fase==="fet")return;const ci=CC.j.ciutats[CC.c],bo=CC.fase==="P"?ci.P:ci.T,fb=document.getElementById("ccFb");
 if(CC.v.some(x=>x===null)){fb.innerHTML=`<div class="fb">✏️ Encara falten mesos per posar (${CC.v.filter(x=>x===null).length}).</div>`;return}
 const mal=CC.v.map((x,i)=>x!==bo[i]?i:-1).filter(i=>i>=0);
 if(!mal.length){if(!CC.int){CC.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)}if(typeof so==="function")so("ok");return ccSeg(true)}
 CC.int++;if(CC.int===1)CC.errs++;CC.mal=new Set(mal);if(typeof so==="function")so("ko");
 if(CC.int>=2){CC.v=bo.slice();CC.mal=null;document.getElementById("ccG").innerHTML=ccSvg();return ccSeg(false)}
 document.getElementById("ccG").innerHTML=ccSvg();ccEnganxa();
 fb.innerHTML=`<div class="fb fr-ko">❌ Hi ha ${mal.length} ${mal.length>1?"mesos mal posats":"mes mal posat"} (en vermell): ${mal.map(i=>CL_MESN[i]).join(", ")}. Mira'ls a la taula i torna-hi.</div>`}
function ccSeg(bo){const ult=CC.fase==="T"&&CC.c+1>=CC.j.ciutats.length;CC.fase=CC.fase==="P"?"P-fet":"T-fet";
 document.getElementById("ccFb").innerHTML=`<div class="fb ${bo?"ok":"fr-ko"}">${bo?(CC.int?"✅ Ara sí!":"✅ Molt bé! Bé a la primera."):"👉 Fixa-t'hi bé: així queda."}</div>`;
 document.getElementById("ccBts").innerHTML=`<button class="btn" id="ccSeg" onclick="ccSegueix()">${ult?"Acaba 🏁":CC.fase==="P-fet"?"Ara la temperatura ▶":"Següent ciutat ▶"}</button>`}
function ccSegueix(){if(CC.fase==="P-fet"){CC.fase="T"}else if(CC.c+1<CC.j.ciutats.length){CC.c++;CC.fase="P"}else return ccFi();CC.v=Array(12).fill(null);CC.int=0;CC.mal=null;ccPinta();window.scrollTo(0,0)}
function ccFi(){const {j,bones}=CC,tot=j.ciutats.length*2;CC.fi=true;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>Has construït <b>${j.ciutats.length} climogrames</b>: <b>${bones}</b> de ${tot} parts bé a la primera.</p>${j.final?`<p class="prog">💡 ${j.final}</p>`:""}<div id="zona"></div></div>`;
 fiJoc(j,Math.max(1,bones),tot-bones)}
function jocConstrueixProva(j){if(!j.ciutats||!j.ciutats.length)return "sense ciutats";for(const c of j.ciutats){if(c.T.length!==12||c.P.length!==12)return `${c.nom}: calen 12 valors`;if(c.P.some(x=>x%CC_PSTEP||x>CC_PMAX)||c.T.some(x=>x%CC_TSTEP||x<0||x>CC_TMAX))return `${c.nom}: valors fora de la graella`}
 jocConstrueix(j);let s=0,primer=true;
 while(CC&&!CC.fi&&s++<50){const b=document.getElementById("ccSeg");if(b){b.click();continue}const ci=CC.j.ciutats[CC.c],bo=CC.fase==="P"?ci.P:ci.T;
  if(primer){primer=false;CC.v=bo.map((x,i)=>i?x:(x?0:CC_PSTEP));ccComprova();if(!CC.mal||!CC.mal.has(0))return "en posar un mes malament no el marca"}
  CC.v=bo.slice();ccComprova()}
 if(!CC||!CC.fi)return "no ha acabat";if(CC.bones!==j.ciutats.length*2-1)return `${CC.bones} bones de ${j.ciutats.length*2-1} esperades`;return true}
