// Prova dels generadors del Taller de mates (motor/eines/exercicis-mates.js), sense navegador.
// Ús (des de motor/):  node prova-generadors.js
// Fa cada generador moltes vegades a cada nivell i comprova que: tots els passos tenen resposta bona,
// la resposta bona es dona per bona, les respostes dolentes no fan petar els missatges d'error,
// els «per què?» i el «Troba l'error» estan ben fets, i els càlculs dels generadors nous quadren.
const fs=require("fs"),path=require("path");
const src=fs.readFileSync(path.join(__dirname,"eines/exercicis-mates.js"),"utf8");
// el fitxer només toca el navegador dins de funcions: n'hi ha prou amb un parell d'objectes buits
const ctx=new Function("document","window",src+";return {MXG,MXE,mxBo,mxMsg,mxFactors,mxMCD,mxMCM,mxVal}")({getElementById:()=>null},{});
const {MXG,MXE,mxBo,mxMsg,mxMCD}=ctx;
const N=+process.env.N||300,errs=[];let passos=0,exercicis=0;
const err=(g,nv,m,E)=>{if(errs.length<40)errs.push(`${g} (nivell ${nv}): ${m}${E?" · "+String(E.enun).replace(/<[^>]+>/g,"").slice(0,80):""}`)};
const dolentes=P=>P.t==="tria"?P.op.map((_,i)=>i).filter(i=>i!==P.r):P.t==="num"?[P.r+1,Math.max(0,P.r-1),P.r*2+3].filter(v=>v!==P.r):
 P.t==="llista"?[P.r.slice(1),[...P.r,P.r[P.r.length-1]+1],[1]]:[{2:9},{3:1},{}];
const variants=[["criteri"],["multiples"],["divisors"],["primer"],["escala"],["mcmmcd","MCD"],["mcmmcd","MCM"],["problema"],["divisio"],["combinades"],["fraccions"],["equacio"]];
for(const [g,arg] of variants)for(const nv of [1,2,3])for(let k=0;k<N;k++){
 let E;try{E=MXG[g](nv,arg)}catch(e){err(g,nv,"peta: "+e.message);continue}
 exercicis++;
 if(!E||typeof E.enun!=="string"||!Array.isArray(E.passos)||!E.passos.length||typeof E.sol!=="string"){err(g,nv,"estructura incorrecta",E);continue}
 for(const [i,P] of E.passos.entries()){passos++;
  if(!["num","llista","tria","fact"].includes(P.t)){err(g,nv,`pas ${i}: tipus ${P.t}`,E);continue}
  if(P.r===undefined||P.r===null||(typeof P.r==="number"&&!Number.isFinite(P.r))){err(g,nv,`pas ${i} sense resposta`,E);continue}
  if(P.t==="num"&&(!Number.isInteger(P.r)||P.r<0))err(g,nv,`pas ${i}: la resposta (${P.r}) no és un nombre natural`,E);
  if(P.t==="tria"&&!(P.r>=0&&P.r<P.op.length))err(g,nv,`pas ${i}: opció bona fora de rang`,E);
  if(P.t==="tria"&&new Set(P.op).size!==P.op.length)err(g,nv,`pas ${i}: opcions repetides (${P.op.join(" | ")})`,E);
  if(!mxBo(P,P.r))err(g,nv,`pas ${i}: la resposta bona no es dona per bona`,E);
  try{if(P.ctx&&typeof P.ctx()!=="string")err(g,nv,`pas ${i}: ctx() no torna text`,E)}catch(e){err(g,nv,`pas ${i}: ctx() peta: ${e.message}`,E)}
  for(const v of dolentes(P)){if(mxBo(P,v))continue;try{const m=mxMsg(P.err&&P.err(v));if(m&&typeof m.m!=="string")err(g,nv,`pas ${i}: missatge d'error sense text`,E)}catch(e){err(g,nv,`pas ${i}: err() peta amb ${JSON.stringify(v)}: ${e.message}`,E)}}
  if(P.perque){const q=P.perque;if(!Array.isArray(q.op)||q.op.length<2||!(q.r>=0&&q.r<q.op.length)||new Set(q.op).size!==q.op.length)err(g,nv,`pas ${i}: «per què?» mal fet`,E)}
 }
 // comprovacions de càlcul dels generadors nous
 const c=E.chk;if(!c)continue;
 if(c.tipus==="divisio"){if(c.d*c.Q+c.R!==c.D||c.R<0||c.R>=c.d)err(g,nv,`divisió mal feta: ${c.D} : ${c.d} = ${c.Q} r ${c.R}`,E);
  const p=E.passos.find(P=>P.id==="quocient"),r=E.passos.find(P=>P.id==="residu");if(p.r!==c.Q||r.r!==c.R)err(g,nv,"quocient o residu dels passos no quadren",E)}
 if(c.tipus==="combinades"){const js=c.expr.replace(/\./g,"").replace(/·/g,"*").replace(/:/g,"/").replace(/−/g,"-");const v=Function(`return (${js})`)();
  if(v!==c.res)err(g,nv,`combinades: ${c.expr} hauria de donar ${v} i dona ${c.res}`,E);if(E.passos[E.passos.length-1].r!==c.res)err(g,nv,"l'últim pas no és el resultat",E)}
 if(c.tipus==="fraccions"){const s=c.op==="+"?1:-1;if((c.a*c.d+s*c.c*c.b)*c.fd!==c.fn*c.b*c.d||mxMCD(c.fn,c.fd)!==1||c.fn<=0)err(g,nv,`fraccions: ${c.a}/${c.b} ${c.op} ${c.c}/${c.d} ≠ ${c.fn}/${c.fd}`,E)}
 if(c.tipus==="equacio"){if(c.a*c.x+c.b!==c.c*c.x+c.e)err(g,nv,`equació: x = ${c.x} no la compleix`,E);if(E.passos[E.passos.length-1].r!==c.x)err(g,nv,"l'últim pas no és la x",E)}
}
// Troba l'error
let errorsEx=0;for(const [t,f] of Object.entries(MXE))for(let k=0;k<N;k++){let E;try{E=f()}catch(e){err("error:"+t,"-","peta: "+e.message);continue}errorsEx++;
 if(typeof E.enun!=="string"||!Array.isArray(E.linies)||E.linies.length<2||!(E.mal>=0&&E.mal<E.linies.length)||!Array.isArray(E.per)||E.per.length!==3||new Set(E.per).size!==3||typeof E.bona!=="string"||!E.pista)err("error:"+t,"-","estructura incorrecta",E);
 if(E.linies.some(l=>typeof l!=="string"||!l.trim()||/undefined|NaN/.test(l))||/undefined|NaN/.test(E.bona+E.per.join("")+E.enun))err("error:"+t,"-","text amb undefined/NaN: "+E.linies.join(" / "),E)}
console.log(`generadors: ${exercicis} exercicis · ${passos} passos · Troba l'error: ${errorsEx} exemples`);
console.log(errs.length?"ERRORS:\n- "+errs.join("\n- "):"errors: cap");
process.exit(errs.length?1:0);
