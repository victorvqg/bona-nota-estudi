// ===================== 🖼️ VISTES DE MATES (motor/eines/vistes-mates.js) =====================
// Dibuixos de la llibreta que fan servir el taller (exercicis-mates.js), els manipulatius i la teoria dels temes.
// Cada vista és una funció pura (dades → HTML) i pot rebre «mk» (marca): on ha de mirar el nen. Sense mk, el dibuix és net.
// La marca és sempre color + contorn, perquè es vegi també en blanc i negre i en mode suau (sense animació).
// S'inclou abans del taller:  //@inclou eines/vistes-mates.js
// Prova: motor/prova-vistes-mates.js (Node, sense navegador).
const mxvN=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,".");
const MXV_SUP={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
const mxvSup=e=>e>1?String(e).split("").map(c=>MXV_SUP[c]).join(""):"";
const MXV={
 // Les xifres d'un nombre. modo: "ult" (l'última: 2, 5, 10), "dues" (les dues últimes: 4, 25), "suma" (totes, amb la suma: 3, 9),
 // "alt" (llocs senars i parells des de la dreta, en dos colors: 11). mk: il·lumina les xifres que manen. suma: escriu el resultat.
 xifres(n,modo,mk,suma){const x=String(n).split(""),L=x.length;
  const cls=i=>modo==="ult"&&i===L-1&&mk?"mk":modo==="dues"&&i>=L-2&&mk?"mk":modo==="suma"&&mk?"mk":modo==="alt"?((L-1-i)%2?"b":"a"):"";
  let h=`<div class="mxv-xif" role="img" aria-label="el nombre ${n}">${x.map((c,i)=>`<span class="${cls(i)}">${c}</span>`).join("")}</div>`;
  if(modo==="suma"&&mk)h+=`<div class="mxv-sub">${x.join(" + ")} = ${suma===undefined?"?":`<b>${suma}</b>`}</div>`;
  if(modo==="alt")h+=`<div class="mxv-sub"><span class="mxv-a">■ llocs senars</span> · <span class="mxv-b">■ llocs parells</span> (des de la dreta)</div>`;
  return h},
 // Escala de divisions. files=[[nombre, primer],…]; k = fila que toca (la que té «?»); mk: marca la fila i ensenya com provar el primer.
 // err: un valor equivocat per encerclar a la tira de primers.
 escala(files,k,o){o=o||{};const fi=k>=files.length;
  const rows=files.slice(0,k).map(([a,p])=>`<div><span>${mxvN(a)}</span><b>${p}</b></div>`).join("")+
   `<div class="${fi?"":"act"}"><span>${mxvN(fi?1:files[k][0])}</span><b>${fi?"":o.p!==undefined?o.p:"?"}</b></div>`;
  let h=`<div class="mx-escala mxv-esc">${rows}</div>`;
  if(!fi&&o.tira!==false){const pr=[2,3,5,7,11,13];h+=`<div class="mxv-tira" aria-label="primers per provar">Prova per ordre: ${pr.map(p=>`<span class="${o.err===p?"ko":""}">${p}</span>`).join("")}${o.err!==undefined&&!pr.includes(o.err)?`<span class="ko">${o.err}</span>`:""}</div>`}
  if(o.mk&&!fi){const a=files[k][0],p=files[k][1];h+=`<div class="mxv-pista">${MXV.criteri(a,p)}</div>`}
  return h},
 // Com es mira si «a» és divisible pel primer «p» (dibuix del criteri o la taula).
 criteri(a,p){if(p===2||p===5)return `<b>${p===2?"El 2":"El 5"}:</b> mira l'última xifra${MXV.xifres(a,"ult",true)}`;
  if(p===3){const s=String(a).split("").reduce((x,c)=>x + +c,0);return `<b>El 3:</b> suma les xifres${MXV.xifres(a,"suma",true,s)}`}
  return `<b>El ${p}:</b> prova la taula: ${p} · ${Math.floor(a/p)} = ${mxvN(p*Math.floor(a/p))}`},
 // Taula de potències alineada per columnes de primers. files=[[n, factors {p:e}],…]. quin: "MCD"|"MCM"|null.
 // Les columnes comunes surten tenyides sempre; amb mk, s'encerclen les potències que agafa el MCD o el MCM.
 potencies(rows,quin,mk){const ps=[...new Set(rows.flatMap(([,F])=>Object.keys(F).map(Number)))].sort((a,b)=>a-b);
  const com=p=>rows.every(([,F])=>F[p]);
  const tria=(p,i)=>{if(!mk||!quin)return false;const es=rows.map(([,F])=>F[p]||0);if(quin==="MCD"){if(!com(p))return false;const m=Math.min(...es);return es[i]===m&&es.indexOf(m)===i}
   const m=Math.max(...es);return es[i]===m&&es.indexOf(m)===i};
  const cel=(p,F,i)=>F[p]?`<td class="${com(p)?"com":""}${tria(p,i)?" mk":""}">${p}${mxvSup(F[p])}</td>`:`<td class="${com(p)?"com":"buit"}">${mk&&quin==="MCD"&&!com(p)?"—":""}</td>`;
  return `<table class="mxv-pot" role="table" aria-label="factors primers alineats"><thead><tr><th></th>${ps.map(p=>`<th class="${com(p)?"com":""}">${p}</th>`).join("")}</tr></thead><tbody>${rows.map(([n,F],i)=>`<tr><th>${mxvN(n)} =</th>${ps.map(p=>cel(p,F,i)).join("")}</tr>`).join("")}</tbody></table>`+
   (mk&&quin?`<div class="mxv-sub">${quin==="MCD"?"MCD: només les columnes de <b>tots dos</b>, l'exponent <b>més petit</b>":"MCM: <b>totes</b> les columnes, l'exponent <b>més gran</b>"}</div>`:`<div class="mxv-sub"><span class="mxv-com">■</span> columnes comunes (el primer surt als dos)</div>`)},
 // Divisors per parelles: les k primeres parelles (k=Infinity: totes).
 parelles(n,k){const p=[];for(let d=1;d*d<=n;d++)if(n%d===0)p.push([d,n/d]);const v=p.slice(0,k);
  return `<div class="mxv-par">${v.map(([a,b])=>`<span><b>${a}</b> · <b>${b}</b></span>`).join("")}${v.length<p.length?"<span>…</span>":""}</div><div class="mxv-sub">Cada divisor té la seva parella: ${n} = petit · gran</div>`},
 // Proves de primers: divideix n per 2, 3, 5, 7… fins a √n. Marca on és exacta.
 proves(n){const lim=Math.floor(Math.sqrt(n)),pr=[2,3,5,7,11,13,17].filter(p=>p<=lim);let fi=false;
  return `<div class="mxv-par">${pr.map(p=>{if(fi)return "";const ex=n%p===0;if(ex)fi=true;return `<span class="${ex?"ok":""}">${mxvN(n)} : ${p} ${ex?"✔ exacta":"✗"}</span>`}).join("")}</div><div class="mxv-sub">Només cal provar fins a ${lim}: ${lim+1} · ${lim+1} ja passa de ${mxvN(n)}.</div>`},
 // Taula d'un nombre al voltant d'un rang (múltiples).
 taula(b,de,fins){const r=[];for(let k=Math.max(1,Math.floor(de/b));k*b<=fins+b&&r.length<12;k++)r.push(k*b);
  return `<div class="mxv-par">${r.map(x=>`<span class="${x>=de&&x<=fins?"ok":""}">${b} · ${x/b} = ${mxvN(x)}</span>`).join("")}</div>`},
 // Recta numèrica petita amb els salts de dos nombres fins a «fins» (sense revelar res més enllà).
 recta(a,b,fins){const W=340,x0=10,x1=W-10,X=v=>x0+(x1-x0)*v/fins,y=40;let s="";
  for(let v=a;v<=fins;v+=a)s+=`<path d="M${X(v-a)} ${y} Q${X(v-a/2)} ${y-18} ${X(v)} ${y}" fill="none" stroke="#16a34a" stroke-width="2"/><circle cx="${X(v)}" cy="${y-3}" r="3" fill="#16a34a"/>`;
  for(let v=b;v<=fins;v+=b)s+=`<path d="M${X(v-b)} ${y} Q${X(v-b/2)} ${y+18} ${X(v)} ${y}" fill="none" stroke="#2563eb" stroke-width="2"/><circle cx="${X(v)}" cy="${y+3}" r="3" fill="#2563eb"/>`;
  let tk="";const pas=fins<=24?2:fins<=60?5:10;for(let v=0;v<=fins;v+=pas)tk+=`<text x="${X(v)}" y="${y+34}" font-size="11" text-anchor="middle" fill="#334155">${v}</text>`;
  return `<svg class="mxv-recta" viewBox="0 0 ${W} 82" role="img" aria-label="salts de ${a} i de ${b}"><line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#334155" stroke-width="2"/>${s}${tk}</svg><div class="mxv-sub"><span style="color:#16a34a">■ de ${a} en ${a}</span> · <span style="color:#2563eb">■ de ${b} en ${b}</span></div>`},
 // Un terra rectangular a · b amb la quadrícula d'1 unitat (si no és massa gran).
 rajola(a,b){const W=300,k=Math.min(W/a,140/b),w=a*k,h=b*k;let g="";
  if(a<=40&&b<=40){for(let i=1;i<a;i++)g+=`<line x1="${i*k}" x2="${i*k}" y1="0" y2="${h}" stroke="#cbd5e1" stroke-width="1"/>`;for(let t=1;t<b;t++)g+=`<line x1="0" x2="${w}" y1="${t*k}" y2="${t*k}" stroke="#cbd5e1" stroke-width="1"/>`}
  return `<svg class="mxv-raj" viewBox="-2 -2 ${w+4} ${h+4}" style="max-width:${Math.ceil(w+4)}px" role="img" aria-label="terra de ${a} per ${b}"><rect x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" stroke="#334155" stroke-width="2"/>${g}</svg><div class="mxv-sub">${a} · ${b}: quina és la rajola quadrada més gran que hi cap justa?</div>`}
};
// Teoria del tema amb un exemple dibuixat: T[i].vista = {tipus:"escala", n:60} · {tipus:"potencies", a:12, b:18, quin:"MCD"} · {tipus:"xifres", n:741, d:3}
function mxvFactors(n){const f={};let d=2;while(n>1){while(n%d===0){f[d]=(f[d]||0)+1;n/=d}d++}return f}
function mxVistaTema(v){if(!v)return "";mxvCss();let h="",peu="";
 if(v.tipus==="escala"){const fs=[];let c=v.n;for(let d=2;c>1;)if(c%d===0){fs.push([c,d]);c/=d}else d++;
  const F=mxvFactors(v.n);h=MXV.escala(fs,fs.length,{tira:false});peu=`${mxvN(v.n)} = <b>${Object.keys(F).map(p=>p+mxvSup(F[p])).join(" · ")}</b>`}
 else if(v.tipus==="potencies"){h=MXV.potencies([[v.a,mxvFactors(v.a)],[v.b,mxvFactors(v.b)]],v.quin,true)}
 else if(v.tipus==="xifres"){const d=v.d,mo=d===3||d===9?"suma":d===11?"alt":"ult";h=MXV.xifres(v.n,mo,true,String(v.n).split("").reduce((a,c)=>a + +c,0));peu=`${mxvN(v.n)} ${v.n%d?"<b>no</b> és":"<b>és</b>"} divisible per ${d}.`}
 else if(v.tipus==="parelles")h=MXV.parelles(v.n,Infinity);
 else return "";
 return `<div class="mxv-tema"><small>👀 EXEMPLE DIBUIXAT${v.titol?` · ${v.titol}`:""}</small><div class="mxv-c">${h}</div>${peu?`<div class="mxv-sub" style="font-size:16px">${peu}</div>`:""}</div>`}
function mxvCss(){if(typeof document==="undefined"||!document.head||document.getElementById("mxvCss"))return;const s=document.createElement("style");s.id="mxvCss";s.textContent=`
.mxv-c{text-align:center}
.mxv-xif{display:flex;justify-content:center;gap:3px;margin:6px 0 2px;font-size:30px;font-weight:900;font-variant-numeric:tabular-nums}
.mxv-xif span{min-width:26px;padding:0 3px;border-radius:8px;border:3px solid transparent}
.mxv-xif .mk{background:#fef08a;border-color:#ca8a04}
.mxv-xif .a,.mxv-a{color:#c2410c}.mxv-xif .b,.mxv-b{color:#1d4ed8}
.mxv-xif .a{border-bottom-color:#fdba74}.mxv-xif .b{border-bottom-color:#93c5fd}
.mxv-sub{font-size:14px;font-weight:700;color:#475569;text-align:center;margin:4px 0}
.mx-escala.mxv-esc .act span,.mx-escala.mxv-esc .act b{background:#fef9c3;outline:3px solid #facc15;outline-offset:-3px}
.mxv-tira{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;align-items:center;font-size:13px;font-weight:800;color:#475569;margin:2px 0}
.mxv-tira span{min-width:28px;text-align:center;padding:2px 6px;border-radius:999px;background:#fff;border:2px solid #cbd5e1;color:#1e293b}
.mxv-tira span.ko{border-color:#ef4444;background:#fef2f2;color:#b91c1c;text-decoration:line-through}
.mxv-pista{margin:6px auto 0;padding:8px 10px;border-radius:12px;background:#fffbeb;border:2px dashed #f59e0b;font-size:15px;max-width:320px;text-align:center}
.mxv-pot{border-collapse:separate;border-spacing:4px 3px;margin:6px auto;font-size:19px;font-weight:900;font-variant-numeric:tabular-nums}
.mxv-pot th{font-size:15px;color:#475569;padding:0 4px;text-align:right}.mxv-pot thead th{text-align:center;font-size:13px}
.mxv-pot td{min-width:42px;height:34px;text-align:center;border-radius:8px;background:#fff;border:2px solid #e2e8f0}
.mxv-pot td.buit{background:transparent;border-style:dashed}
.mxv-pot .com{background:#ecfdf5;border-color:#86efac}.mxv-pot thead th.com{color:#15803d}
.mxv-pot td.mk{background:#fef08a;border:3px solid #ca8a04}
.mxv-com{color:#16a34a}
.mxv-par{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}
.mxv-par span{padding:4px 10px;border-radius:999px;background:#fff;border:2px solid #cbd5e1;font-weight:800;font-size:15px}
.mxv-par span.ok{background:#dcfce7;border-color:#22c55e}
.mxv-recta{width:100%;max-width:360px;display:block;margin:4px auto}
.mxv-raj{width:100%;display:block;margin:4px auto}
.mxv-tema{margin:10px 0;padding:10px 12px;border-radius:14px;background:#f8fafc;border:2px solid var(--vora,#e2e8f0)}
.mxv-tema>small{font-weight:900;color:#64748b;letter-spacing:.3px}
.mx-dv .mk{background:#fef08a;outline:2px solid #ca8a04;border-radius:3px}
.mx-dv .pr{color:#b91c1c}
.mx-dv .bx{background:#dbeafe;outline:2px solid #2563eb;border-radius:3px}`;document.head.appendChild(s)}
if(typeof module!=="undefined")module.exports={MXV,mxVistaTema};
