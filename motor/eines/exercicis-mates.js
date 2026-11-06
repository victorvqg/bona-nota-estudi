// ===================== ✏️ TALLER DE MATES (motor/eines/exercicis-mates.js) =====================
// Exercicis com els de l'escola: el nen ESCRIU el resultat (teclat numèric), pas a pas com a la llibreta,
// amb números nous cada vegada (generadors), apartats a) b) c) d), avisos dels errors típics,
// la solució «com s'escriu a la llibreta» i un examen simulat sobre 10 amb nota parcial per passos.
// S'inclou a les dades d'un món amb la línia  //@inclou eines/exercicis-mates.js  (ho fa build.py).
// Joc d'una fitxa:  {id:"fx-…",tipus:"custom",fn:"mxFitxa",prova:"mxProva",mx:{tipus:["criteri",…],n:4}, …}
// Examen:           {id:"ex-mates",tipus:"custom",fn:"mxExamen",prova:"mxProva",mx:{examen:[["criteri",1],…]}, …}
// Repàs barrejat:   {id:"…",tipus:"custom",fn:"mxFitxa",prova:"mxProva",mx:{barreja:["criteri","escala",…],n:5}, …}
// Troba l'error:    {id:"…",tipus:"custom",fn:"mxError",prova:"mxErrProva",mx:{error:["mcm_exp",…],n:5}, …}
// Modes d'una fitxa: 👀 Mira (exemple resolt) · ✍️ Completa (la primera meitat de passos ja feta) · 💪 Tot sol. Botó 💡 Pista a cada pas.
// Cada generador rep el nivell (1 bàsic, 2 mitjà, 3 d'examen) i retorna {enun, passos:[…], sol}.
// Pas: {t:"num"|"llista"|"tria"|"fact", q, r (resposta), op (tria), primers (fact), w (pes a l'examen),
//       err(v) → missatge de l'error típic, o mxE(codi, missatge) perquè el codi vagi al registre (o null),
//       ctx() → HTML que es pinta sobre el pas (p. ex. l'escala), id (nom curt del pas), pista, perque {q, op, r}, noEx}.

const MX_R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const MX_T=a=>a[Math.floor(Math.random()*a.length)];
const MX_B=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[a[i],a[k]]=[a[k],a[i]]}return a};
const MX_SUP={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
// 1234 → «1.234» (com a l'escola)
const mxN=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,".");
const mxEsPrimer=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true};
function mxFactors(n){const f={};let d=2;while(n>1&&d<=n){while(n%d===0){f[d]=(f[d]||0)+1;n/=d}d++}return f}
const mxVal=f=>Object.keys(f).reduce((a,p)=>a*Math.pow(+p,f[p]),1);
// {2:2,3:1} → «2² · 3»
function mxPot(f){const k=Object.keys(f).map(Number).filter(p=>f[p]>0).sort((a,b)=>a-b);return k.length?k.map(p=>p+(f[p]>1?String(f[p]).split("").map(c=>MX_SUP[c]).join(""):"")).join(" · "):"1"}
function mxDivisors(n){const d=[];for(let i=1;i<=n;i++)if(n%i===0)d.push(i);return d}
const mxMCD=(a,b)=>b?mxMCD(b,a%b):a;
const mxMCM=(a,b)=>a/mxMCD(a,b)*b;
const mxLlista=a=>a.map(mxN).join(", ");

// ---------- GENERADORS (un per tipus d'exercici de l'escola) ----------
const MXG={
 // ✔️ Criteris de divisibilitat: el nen fa el càlcul del criteri i després decideix
 criteri(nv){
  const d=MX_T(nv===1?[2,3,5,10]:nv===2?[2,3,5,9,10]:[3,9,11,5,2]);
  const dig=nv===1?MX_R(2,3):nv===2?MX_R(3,4):MX_R(3,5);
  let n,vol=Math.random()<.5;
  for(let k=0;k<200;k++){n=MX_R(Math.pow(10,dig-1),Math.pow(10,dig)-1);if((n%d===0)===vol)break}
  const si=n%d===0,x=String(n).split("").map(Number),suma=x.reduce((a,b)=>a+b,0);
  const passos=[];let sol;
  if(d===3||d===9){
   passos.push({t:"num",id:"suma",q:`Suma les xifres de <b>${mxN(n)}</b>.`,r:suma,pista:`Escriu les xifres separades i suma-les a la llibreta: ${x.join(" + ")} = ?`,
    err:v=>mxE("suma_xifres",`Suma xifra a xifra: ${x.join(" + ")}. Revisa el compte.`)});
   passos.push({t:"tria",id:"tria",q:`Mira si la suma és múltiple de ${d}. Llavors, ${mxN(n)} és divisible per ${d}?`,op:["Sí, és divisible","No, no és divisible"],r:si?0:1,
    pista:`Mira si ${suma} és a la taula del ${d}: ${d}, ${2*d}, ${3*d}, ${4*d}, ${5*d}…`,
    perque:{q:"Per què ho saps?",op:[`Perquè la suma de les xifres (${suma}) ${si?"és":"no és"} múltiple de ${d}`,`Perquè ${mxN(n)} acaba en ${x[x.length-1]}`,`Perquè ${mxN(n)} és ${n%2?"senar":"parell"}`],r:0,expl:`Per al ${d} només compta la suma de les xifres.`},
    err:()=>si?`${suma} = ${d} · ${suma/d}: sí que és múltiple de ${d}.`:`${suma} no és a la taula del ${d} (${d}, ${2*d}, ${3*d}, ${4*d}…).`});
   sol=`${mxN(n)} → ${x.join(" + ")} = ${suma}<br>${suma} ${si?"<b>és</b>":"<b>no és</b>"} múltiple de ${d}<br>→ ${mxN(n)} <b>${si?"SÍ":"NO"}</b> és divisible per ${d}.`;
  }else if(d===11){
   const r=[...x].reverse(),sen=r.filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0),par=r.filter((_,i)=>i%2===1).reduce((a,b)=>a+b,0),dif=Math.abs(sen-par);
   passos.push({t:"num",id:"dif",q:`Per l'11: suma les xifres de lloc senar (començant per la dreta) i, a part, les de lloc parell. Quant dona la diferència (la gran menys la petita)?`,r:dif,
    err:()=>mxE("calcul",`Llocs senars (des de la dreta): ${r.filter((_,i)=>i%2===0).join(" + ")} = ${sen}. Llocs parells: ${r.filter((_,i)=>i%2===1).join(" + ")||0} = ${par}.`)});
   passos.push({t:"tria",id:"tria",q:`Llavors, ${mxN(n)} és divisible per 11?`,op:["Sí, és divisible","No, no és divisible"],r:si?0:1,
    err:()=>`Ha de donar 0 o un múltiple d'11 (11, 22…). Aquí dona ${dif}.`});
   sol=`${mxN(n)} → senars: ${sen} · parells: ${par}<br>${Math.max(sen,par)} − ${Math.min(sen,par)} = ${dif}<br>→ ${mxN(n)} <b>${si?"SÍ":"NO"}</b> és divisible per 11.`;
  }else{
   const u=x[x.length-1];
   passos.push({t:"tria",id:"xifra",q:`Per saber si <b>${mxN(n)}</b> és divisible per ${d}, en quina xifra t'has de fixar?`,op:["En l'última xifra","En la primera xifra","En la suma de totes les xifres"],r:0,
    err:v=>mxE("criteri_xifra",v===2?`La suma de les xifres és el criteri del 3 i del 9. Per ${d} només mires l'última.`:`La primera xifra no diu res. Mira com acaba el nombre.`)});
   const regla={2:"acaba en 0, 2, 4, 6 o 8",5:"acaba en 0 o en 5",10:"acaba en 0"}[d];
   passos.push({t:"tria",id:"tria",q:`${mxN(n)} acaba en <b>${u}</b>. És divisible per ${d}?`,op:["Sí, és divisible","No, no és divisible"],r:si?0:1,
    perque:{q:"Per què n'hi ha prou de mirar una sola xifra?",op:[`Perquè el criteri del ${d} només mira com acaba el nombre`,`Perquè la suma de les xifres és ${suma}`,`Perquè la primera xifra és ${x[0]}`],r:0},
    err:()=>`Per ${d}, el nombre ${regla}. ${mxN(n)} acaba en ${u}.`});
   sol=`${mxN(n)} acaba en ${u}<br>Criteri del ${d}: ${regla}<br>→ ${mxN(n)} <b>${si?"SÍ":"NO"}</b> és divisible per ${d}.`;
  }
  return {enun:`És <b>${mxN(n)}</b> divisible per <b>${d}</b>? Fes servir el criteri, sense dividir.`,passos,sol};
 },
 // 🔢 Múltiples
 multiples(nv){
  if(nv>1&&Math.random()<.4){
   const b=nv===2?MX_R(7,19):MX_R(11,29),m=MX_T(nv===2?[100,200,250,500]:[500,1000,2000]);
   const q=Math.floor(m/b),res=m%b,r=(q+1)*b;
   return {enun:`Quin és el <b>primer múltiple de ${b}</b> més gran que <b>${mxN(m)}</b>?`,
    passos:[{t:"num",id:"quocient",q:`Divideix ${mxN(m)} : ${b}. Quin és el quocient (sense decimals)?`,r:q,err:()=>mxE("quocient",`${b} · ${q} = ${mxN(b*q)} i ${b} · ${q+1} = ${mxN(b*(q+1))}. Quin cap dins de ${mxN(m)}?`)},
     {t:"num",id:"multiple",q:`Ara multiplica ${b} pel següent nombre (${q} + 1). Quin és el múltiple?`,r,err:v=>mxE("calcul",v===q*b?`${mxN(q*b)} és més petit que ${mxN(m)}: has d'agafar el següent.`:`${b} · ${q+1} = ?`)}],
    sol:`${mxN(m)} : ${b} = ${q} i en sobren ${res}<br>${b} · ${q} = ${mxN(q*b)} (encara no arriba)<br>${b} · ${q+1} = <b>${mxN(r)}</b> → és el primer múltiple de ${b} després de ${mxN(m)}.`};
  }
  const b=nv===1?MX_R(3,9):nv===2?MX_R(6,15):MX_R(11,25);
  const a=MX_R(2,nv===1?8:12)*b-MX_R(1,b-1),c=a+b*MX_R(3,5)+MX_R(0,b-1);
  const r=[];for(let k=Math.ceil(a/b)*b;k<=c;k+=b)r.push(k);
  return {enun:`Escriu tots els <b>múltiples de ${b}</b> compresos entre <b>${a}</b> i <b>${c}</b>.`,
   passos:[{t:"llista",id:"llista",q:`Escriu-los separats per comes (toca «,» entre nombre i nombre).`,r,pista:`El primer és ${r[0]}. Després ves sumant ${b} fins que passis de ${c}.`,
    err:v=>{const no=v.filter(x=>x%b);if(no.length)return mxE("multiple_no",`${no[0]} no és múltiple de ${b}: ${no[0]} : ${b} no és exacta.`);
     const fora=v.filter(x=>x<a||x>c);if(fora.length)return mxE("fora_rang",`${fora[0]} és múltiple de ${b}, però no és entre ${a} i ${c}.`);
     const f=r.filter(x=>!v.includes(x));return f.length?mxE("falten",`Molt bé els que has posat, però ${f.length===1?"en falta 1":`en falten ${f.length}`}. Ves sumant ${b}: ${r[0]}, ${r[0]+b}…`):null}}],
   sol:`Taula del ${b}: … ${r.map((x,i)=>`${b} · ${x/b} = ${x}`).join(" · ")}<br>Entre ${a} i ${c}: <b>${mxLlista(r)}</b>`};
 },
 // 🧩 Divisors (per parelles)
 divisors(nv){
  const n=MX_T(nv===1?[12,18,20,24,28,30,16,32]:nv===2?[36,40,42,45,48,54,60,72,80]:[84,90,96,100,108,120,126,144,150]);
  const r=mxDivisors(n),par=r.filter(x=>x*x<=n).map(x=>`${x} · ${n/x}`);
  return {enun:`Escriu <b>tots els divisors de ${n}</b>.`,
   passos:[{t:"llista",id:"llista",q:`Escriu-los de petit a gran, separats per comes. Truc: busca'ls per parelles (1 · ${n}, 2 · …).`,r,pista:`Prova 1, 2, 3, 4… i per a cada un que divideixi ${n}, apunta també la seva parella: ${par[0]}, ${par[1]||"…"}…`,
    err:v=>{const no=v.filter(x=>n%x);if(no.length){const x=no[0];return mxE("divisor_no",`${x} no és divisor de ${n}: ${n} : ${x} = ${Math.floor(n/x)} i en sobren ${n%x}.`)}
     if(!v.includes(1)||!v.includes(n))return mxE("falten",`Recorda: l'1 i el mateix ${n} sempre són divisors de ${n}.`);
     const f=r.filter(x=>!v.includes(x));return f.length?mxE("falten",`${f.length===1?"En falta 1":`En falten ${f.length}`}. Fes les parelles: ${par.slice(0,2).join(", ")}…`):null}}],
   sol:`Parelles: ${par.join(" · ")}<br>Divisors de ${n}: <b>${mxLlista(r)}</b> (${r.length} divisors)`};
 },
 // 💎 Primer o compost
 primer(nv){
  const prim=nv===1?[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47]:nv===2?[53,59,61,67,71,73,79,83,89,97,101,103]:[101,107,109,113,127,131,137,139,149,151,157,163,173,191,197,199,211];
  const comp=nv===1?[9,15,21,25,27,33,35,39,45,49]:nv===2?[51,57,63,69,77,81,87,91,93,99,111,119]:[119,121,133,143,161,169,187,203,209,221,247,253];
  const n=Math.random()<.5?MX_T(prim):MX_T(comp),p=mxEsPrimer(n),d=n===1?1:(()=>{for(let k=2;k*k<=n;k++)if(n%k===0)return k})();
  const lim=Math.floor(Math.sqrt(n)),prova=[2,3,5,7,11,13,17].filter(x=>x<=lim);
  const passos=[{t:"tria",id:"tria",q:`Prova de dividir ${mxN(n)} per 2, 3, 5, 7… Què és ${mxN(n)}?`,op:["Primer","Compost"],r:p?0:1,
   pista:`Prova els primers per ordre (2, 3, 5, 7…). Només cal arribar fins a ${lim}, perquè ${lim+1} · ${lim+1} ja passa de ${mxN(n)}.`,
   perque:p?{q:`Per què ${mxN(n)} és primer?`,op:["Perquè només es pot dividir per 1 i per ell mateix","Perquè és senar","Perquè és un nombre gran"],r:0}
    :{q:`Per què ${mxN(n)} és compost?`,op:[`Perquè té més divisors: per exemple, el ${d}`,"Perquè és senar","Perquè acaba en "+String(n).slice(-1)],r:0},
   err:()=>mxE("primer_compost",p?`Prova-ho: ${mxN(n)} no és divisible per ${prova.join(", ")||"cap primer"}. No cal provar més enllà de ${lim} (perquè ${lim+1} · ${lim+1} ja passa de ${mxN(n)}).`:`Compte! ${mxN(n)} = ${d} · ${n/d}. Té més divisors que l'1 i ell mateix.`)}];
  if(!p)passos.push({t:"num",id:"divisor",q:`Demostra-ho: escriu un divisor de ${mxN(n)} que no sigui ni 1 ni ${mxN(n)}.`,r:d,ok:v=>v>1&&v<n&&n%v===0,
   err:v=>mxE("divisor_no",v===1||v===n?`L'1 i el ${mxN(n)} no compten: tots els nombres els tenen.`:`${mxN(n)} : ${v} no és exacta. Prova amb ${d}.`)});
  return {enun:`El nombre <b>${mxN(n)}</b>, és primer o compost?`,passos,
   sol:p?`Provo ${prova.map(x=>`${x}: no`).join(" · ")||"—"}<br>(no cal passar de ${lim}, perquè ${lim+1}² > ${mxN(n)})<br>→ ${mxN(n)} és <b>PRIMER</b>.`
    :`Provo ${d}: ${mxN(n)} : ${d} = ${n/d}, exacte!<br>${mxN(n)} = ${d} · ${n/d}<br>→ ${mxN(n)} és <b>COMPOST</b>.`};
 },
 // 🪜 Descomposició amb l'escala (fila a fila, com a la llibreta)
 escala(nv){
  const base=nv===1?[2,2,3,3,5]:nv===2?[2,2,2,3,3,5,7]:[2,2,2,3,3,5,7,11];
  let n,f;for(let k=0;k<100;k++){const m=nv===1?MX_R(2,3):nv===2?MX_R(3,5):MX_R(4,6);f=MX_B(base).slice(0,m);n=f.reduce((a,b)=>a*b,1);if(n>=(nv===1?12:nv===2?60:200)&&n<=(nv===1?100:nv===2?600:2500))break}
  f.sort((a,b)=>a-b);const files=[];let c=n;for(const p of f){files.push([c,p]);c/=p}
  const F=mxFactors(n),passos=[];
  const pinta=k=>`<div class="mx-escala">${files.slice(0,k).map(([a,p])=>`<div><span>${mxN(a)}</span><b>${p}</b></div>`).join("")}<div><span>${mxN(k<files.length?files[k][0]:1)}</span><b>${k<files.length?"?":""}</b></div></div>`;
  files.forEach(([a,p],k)=>{
   passos.push({t:"num",id:"primer",q:`Per quin <b>primer</b> divideixes ${mxN(a)}?`,r:p,ctx:()=>pinta(k),
    pista:`Prova els primers per ordre: el 2 si és parell, el 3 si la suma de les xifres és de la taula del 3, el 5 si acaba en 0 o 5, després el 7…`,
    err:v=>a%v?mxE("no_divideix",`${mxN(a)} no és divisible per ${v}. ${p===2?"És parell!":p===3?"Suma'n les xifres…":p===5?"Mira com acaba…":`Prova amb el ${p}.`}`)
     :!mxEsPrimer(v)?mxE("no_primer",`${v} no és primer: a l'escala només hi van nombres primers (2, 3, 5, 7, 11…).`)
     :mxE("no_menor",`Funciona, però a classe es comença sempre pel primer més petit que hi va: prova amb el ${p}.`)});
   passos.push({t:"num",id:"quocient",q:`Quant dona ${mxN(a)} : ${p}?`,r:a/p,ctx:()=>pinta(k).replace(/<b>\?<\/b><\/div><\/div>$/,`<b>${p}</b></div></div>`),
    err:v=>mxE("quocient",`Revisa la divisió: ${p} · ${v} = ${mxN(p*v)}, no ${mxN(a)}.`)});
  });
  passos.push({t:"fact",id:"exp",q:`Ja has arribat a 1! Ara escriu ${mxN(n)} amb <b>potències</b>: quantes vegades has dividit per cada primer?`,r:F,primers:[2,3,5,7,11],ctx:()=>pinta(files.length),
   err:v=>{for(const p of [2,3,5,7,11]){const a=v[p]||0,b=F[p]||0;if(a!==b)return mxE("exponent",b?`Compta les vegades que hi ha el ${p} a l'escala: hi surt ${b} ${b>1?"vegades":"vegada"}.`:`A l'escala no hi ha cap ${p}.`)}return null}});
  return {enun:`Descompon <b>${mxN(n)}</b> en factors primers amb l'escala de divisions.`,passos,
   sol:`<div class="mx-escala">${files.map(([a,p])=>`<div><span>${mxN(a)}</span><b>${p}</b></div>`).join("")}<div><span>1</span><b></b></div></div>${mxN(n)} = <b>${mxPot(F)}</b>`,w0:true};
 },
 // 🤝 MCM i MCD pas a pas (taula de factors)
 mcmmcd(nv,quin){
  quin=quin||MX_T(["MCD","MCM"]);
  let a,b;for(let k=0;k<200;k++){const g=MX_T(nv===1?[2,3,4,5,6]:nv===2?[4,6,8,9,10,12]:[6,8,12,14,15,18]);
   a=g*MX_T(nv===1?[2,3,5]:[2,3,4,5,7]);b=g*MX_T(nv===1?[3,4,5]:[3,5,6,7,8]);
   if(a!==b&&mxMCD(a,b)>1&&a<=(nv===1?60:nv===2?150:300)&&b<=(nv===1?60:nv===2?150:300)&&a%b&&b%a)break}
  if(a>b)[a,b]=[b,a];
  const Fa=mxFactors(a),Fb=mxFactors(b),ps=[...new Set([...Object.keys(Fa),...Object.keys(Fb)].map(Number))].sort((x,y)=>x-y);
  const Fr={};ps.forEach(p=>{const x=Fa[p]||0,y=Fb[p]||0,e=quin==="MCD"?Math.min(x,y):Math.max(x,y);if(e)Fr[p]=e});
  const r=quin==="MCD"?mxMCD(a,b):mxMCM(a,b),pr=[2,3,5,7,11,13];
  const desc=(n,F)=>({t:"fact",id:"factors",q:`Descompon ${n} en factors primers (fes l'escala a la llibreta).`,r:F,primers:pr,w:1,pista:`Fes l'escala de ${n} a la llibreta: divideix pel primer més petit que puguis fins arribar a 1.`,
   err:v=>{const x=mxVal(v);return x===n?null:mxE("calcul",`El que has posat fa ${mxPot(v)} = ${mxN(x)}, no ${n}. Revisa l'escala.`)}});
  const est=quin==="MCM"?[`Més gran o igual que ${b}`,`Més petit que ${a}`,`Entre ${a} i ${b}`]:[`Més petit o igual que ${a}`,`Més gran que ${b}`,`Entre ${a} i ${b}`],eo=MX_B([0,1,2]);
  const taula=()=>`<div class="mx-taula">${a} = ${mxPot(Fa)}<br>${b} = ${mxPot(Fb)}</div>`;
  return {enun:`Calcula el <b>${quin} (${a}, ${b})</b> descomponent els nombres.`,
   passos:[{t:"tria",id:"estima",noEx:true,q:`🤔 <b>Abans de calcular:</b> el ${quin} (${a}, ${b}) serà…`,op:eo.map(i=>est[i]),r:eo.indexOf(0),
     err:()=>mxE("estima",quin==="MCM"?`El MCM és un múltiple dels dos: mai pot ser més petit que el més gran, ${b}.`:`El MCD divideix els dos nombres: mai pot ser més gran que el més petit, ${a}.`)},
    desc(a,Fa),desc(b,Fb),
    {t:"tria",id:"tria",q:`Quins factors agafes per al ${quin}?`,op:["Només els comuns, amb l'exponent més petit","Tots (comuns i no comuns), amb l'exponent més gran","Només els comuns, amb l'exponent més gran"],r:quin==="MCD"?0:1,ctx:taula,
     pista:quin==="MCD"?"El MCD ha de dividir els dos nombres: pensa què hi pot cabre dins de tots dos.":"El MCM ha de ser múltiple dels dos: ha de contenir tot el que té cada un.",
     perque:quin==="MCD"?{q:"Per què només els comuns?",op:["Perquè el MCD ha de dividir els dos nombres, i només pot tenir el que tenen tots dos","Perquè els comuns són més grans","Perquè així surt un nombre més gran"],r:0}
      :{q:"Per què tots, amb l'exponent més gran?",op:["Perquè el MCM ha de ser múltiple dels dos: ha de contenir tots els factors de cada un","Perquè així surt el nombre més petit possible de tots","Perquè els no comuns no compten"],r:0},
     err:v=>quin==="MCD"?(v===1?mxE("confon_mcm_mcd","Això és el MCM. El MCD (el divisor més gran) només pot tenir el que tenen tots dos."):mxE("mcd_exp_gran","Comuns sí, però amb l'exponent MÉS PETIT: el MCD ha de cabre dins de tots dos."))
      :(v===0?mxE("confon_mcm_mcd","Això és el MCD. El MCM (el múltiple més petit) ha de contenir els dos nombres sencers."):mxE("mcm_falta","Al MCM hi van TOTS els factors, també els que només té un dels dos."))},
    {t:"fact",id:"exp",q:`Escriu el ${quin} amb potències.`,r:Fr,primers:pr,ctx:taula,w:2,
     err:v=>{for(const p of pr){const x=Fa[p]||0,y=Fb[p]||0,e=v[p]||0,bo=Fr[p]||0;if(e===bo)continue;
      if(quin==="MCD"){if(!x||!y)return e?mxE("mcd_no_comu",`El ${p} només és a un dels dos nombres: al MCD no hi va.`):null;return e>bo?mxE("mcd_exp_gran",`Al MCD l'exponent del ${p} és el MÉS PETIT (${p}${MX_SUP[x]||""} i ${p}${MX_SUP[y]||""}).`):mxE("exponent",`Del ${p}, agafa l'exponent més petit, però no el treguis.`)}
      if(!e)return mxE("mcm_falta",`Al MCM hi van TOTS els factors: et falta el ${p}.`);return e<bo?mxE("mcm_exp_petit",`Al MCM l'exponent del ${p} és el MÉS GRAN.`):mxE("exponent",`Massa ${p}: agafa l'exponent més gran que surt, no el sumis.`)}return null}},
    {t:"num",id:"calcul",q:`Ara calcula'l: quant val el ${quin} (${a}, ${b})?`,r,ctx:taula,w:2,err:v=>mxE("calcul",`Fes la multiplicació amb calma: ${mxPot(Fr)}.`)}],
   sol:`${a} = ${mxPot(Fa)}<br>${b} = ${mxPot(Fb)}<br>${quin==="MCD"?"Comuns, exponent més petit":"Tots, exponent més gran"}:<br><b>${quin} (${a}, ${b}) = ${mxPot(Fr)} = ${mxN(r)}</b>`};
 },
 // 🧠 Problemes en 4 passos: dades → MCM o MCD? → càlcul → resposta completa
 problema(nv){
  const mcm=Math.random()<.5;let a,b;
  for(let k=0;k<200;k++){const g=MX_T(mcm?[2,3,4,5,6]:[4,6,8,9,10,12,15]);a=g*MX_R(2,mcm?6:8);b=g*MX_R(2,mcm?6:8);
   if(a!==b&&mxMCD(a,b)>1&&a%b&&b%a&&(mcm?mxMCM(a,b)<=(nv===1?60:180):true))break}
  if(a>b)[a,b]=[b,a];
  const m=mcm?mxMCM(a,b):mxMCD(a,b);let txt,frases,clau,extra=MX_R(2,9);
  const hhmm=(h,mi)=>`${h} h ${String(mi).padStart(2,"0")} min`;
  if(mcm){const k=MX_R(0,3);
   if(k===0){const h=MX_R(8,17),mi=MX_T([0,15,30,45]),t=h*60+mi+m;
    txt=`A l'estació, els trens de la línia groga surten cada <b>${a} minuts</b> i els de la línia blava cada <b>${b} minuts</b>. Avui ${extra} trens han sortit junts a les ${hhmm(h,mi)}, l'últim a les ${hhmm(h,mi)}. A quina hora tornaran a sortir junts?`;
    const t2=h*60+mi+mxMCD(a,b);frases=[`Tornaran a sortir junts a les ${hhmm(Math.floor(t/60),t%60)}.`,`Tornaran a sortir junts d'aquí a ${m} hores.`,`Tornaran a sortir junts a les ${hhmm(Math.floor(t2/60),t2%60)}.`]}
   else if(k===1){txt=`Tenim rajoles de <b>${a} cm × ${b} cm</b>. Volem fer amb elles el <b>quadrat més petit</b> possible, sense tallar-ne cap. La caixa porta ${extra*10} rajoles. Quant farà de costat el quadrat?`;
    frases=[`El quadrat farà ${m} cm de costat.`,`El quadrat farà ${mxMCD(a,b)} cm de costat.`,`El quadrat farà ${m} rajoles de costat.`]}
   else if(k===2){txt=`En Pau va a la piscina cada <b>${a} dies</b> i la Laia cada <b>${b} dies</b>. Avui, que és dia ${extra}, hi han coincidit. D'aquí a quants dies hi tornaran a coincidir?`;
    frases=[`Hi tornaran a coincidir d'aquí a ${m} dies.`,`Hi tornaran a coincidir d'aquí a ${a+b} dies.`,`Hi tornaran a coincidir el dia ${m} del mes, segur.`]}
   else{txt=`Un far s'encén cada <b>${a} segons</b> i un altre cada <b>${b} segons</b>. Fa ${extra} minuts que funcionen i ara mateix s'han encès alhora. D'aquí a quants segons es tornaran a encendre junts?`;
    frases=[`Es tornaran a encendre junts d'aquí a ${m} segons.`,`Es tornaran a encendre junts d'aquí a ${mxMCD(a,b)} segons.`,`Es tornaran a encendre junts d'aquí a ${m} minuts.`]}
   clau="«tornar a coincidir» o «el més petit que contingui els dos» → busquem un MÚLTIPLE comú → MCM";
  }else{const k=MX_R(0,3);
   if(k===0){txt=`Tenim una cinta de <b>${a} cm</b> i una altra de <b>${b} cm</b>. Les volem tallar en trossos iguals, <b>tan llargs com sigui possible</b> i sense que en sobri gens. Les tisores costen ${extra} €. Quant ha de fer cada tros?`;
    frases=[`Cada tros ha de fer ${m} cm.`,`Cada tros ha de fer ${mxMCM(a,b)} cm.`,`Hi haurà ${m} trossos.`]}
   else if(k===1){txt=`De colònies hi van <b>${a} nens</b> i <b>${b} adults</b>. Volen fer cabanes amb el mateix nombre de persones, sense barrejar nens i adults, i amb el <b>màxim</b> de persones a cada cabana. L'estada dura ${MX_R(2,5)} dies. Quantes persones hi haurà a cada cabana?`;
    frases=[`A cada cabana hi haurà ${m} persones.`,`Hi haurà ${m} cabanes en total.`,`A cada cabana hi haurà ${mxMCM(a,b)} persones.`]}
   else if(k===2){txt=`Tenim <b>${a} caramels de maduixa</b> i <b>${b} de llimona</b>. Els volem posar en bosses iguals, sense barrejar gustos i amb el <b>màxim</b> de caramels a cada bossa. Som ${extra} amics. Quants caramels hi haurà a cada bossa?`;
    frases=[`A cada bossa hi haurà ${m} caramels.`,`A cada bossa hi haurà ${a+b} caramels.`,`Hi haurà ${m} bosses.`]}
   else{txt=`Un hort rectangular fa <b>${a} m × ${b} m</b>. El volem dividir en parcel·les quadrades iguals, <b>les més grans possible</b>. Hi ha ${extra} pomeres. Quant farà de costat cada parcel·la?`;
    frases=[`Cada parcel·la farà ${m} m de costat.`,`Cada parcel·la farà ${mxMCM(a,b)} m de costat.`,`Hi haurà ${m} parcel·les.`]}
   clau="«repartir en parts iguals, el màxim / el més gran possible, sense que en sobri» → busquem un DIVISOR comú → MCD";
  }
  const ord=MX_B([0,1,2]);
  return {enun:txt,passos:[
   {t:"llista",id:"dades",q:`1️⃣ <b>Dades.</b> Quins dos nombres necessites per resoldre'l? (Compte: n'hi ha un que no serveix.)`,r:[a,b],w:1,pista:"Les dades que serveixen són les dues quantitats que es repeteixen o es reparteixen (estan en negreta).",
    err:v=>v.includes(extra)||v.includes(extra*10)?mxE("dada_sobrant",`El ${v.includes(extra)?extra:extra*10} és una dada de més: no té res a veure amb la pregunta.`):`Busca els dos nombres en negreta que es repeteixen o es reparteixen.`},
   {t:"tria",id:"tria",q:`2️⃣ <b>Què he de calcular?</b>`,op:["El MCM (mínim comú múltiple)","El MCD (màxim comú divisor)"],r:mcm?0:1,w:1,pista:"Coincidir de nou → MCM. Repartir en parts iguals, tan grans com es pugui → MCD.",
    perque:{q:"Quina idea de l'enunciat t'ho diu?",op:mcm?["Les coses es repeteixen i volem saber quan tornen a coincidir (o el més petit que contingui els dos)","Volem repartir en parts iguals tan grans com es pugui","Hi ha dos nombres"]:["Volem repartir o tallar en parts iguals, tan grans com es pugui, sense que en sobri","Les coses es repeteixen i volem saber quan tornen a coincidir","Hi ha dos nombres"],r:0},
    err:()=>mxE("confon_mcm_mcd",`Pista: ${clau}.`)},
   {t:"num",id:"calcul",q:`3️⃣ <b>Calcula</b> el que has decidit al pas 2. Quin resultat et dona?`,r:m,w:2,
    err:v=>v===(mcm?mxMCD(a,b):mxMCM(a,b))?mxE("confon_mcm_mcd",`Aquest és el ${mcm?"MCD":"MCM"}! Has de calcular el ${mcm?"MCM":"MCD"}.`):mxE("calcul",`Descompon: ${a} = ${mxPot(mxFactors(a))} i ${b} = ${mxPot(mxFactors(b))}.`)},
   {t:"tria",id:"frase",q:`4️⃣ <b>Resposta.</b> Quina frase respon bé la pregunta (amb la unitat)?`,op:ord.map(i=>frases[i]),r:ord.indexOf(0),w:1,
    err:()=>mxE("unitat",`Torna a llegir la pregunta: què et demana exactament, i en quina unitat?`)}],
   sol:`Dades: ${a} i ${b}<br>${clau.replace(/^.*→ /,"Busco el ")}<br>${a} = ${mxPot(mxFactors(a))} · ${b} = ${mxPot(mxFactors(b))}<br>${mcm?"MCM":"MCD"} (${a}, ${b}) = ${mxN(m)}<br><b>${frases[0]}</b>`};
 }
};

// ---------- ESTAT I PINTAT ----------
let MX=null;
function mxCss(){if(document.getElementById("mxCss"))return;const s=document.createElement("style");s.id="mxCss";s.textContent=`
.mx-cap{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.mx-ap{font-size:15px;font-weight:900;color:var(--suau)}
.mx-enun{font-size:18px;line-height:1.5;margin:6px 0 4px}
.mx-fet{font-size:14.5px;color:#166534;margin:4px 0;padding-left:4px}
.mx-pas{margin-top:12px;padding:12px 14px;border-radius:14px;background:#f8fafc;border:2px solid var(--vora)}
.mx-disp{min-height:52px;margin:10px 0 6px;padding:10px 14px;border-radius:14px;border:3px solid var(--blau);background:#fff;font-size:24px;font-weight:900;letter-spacing:1px;font-variant-numeric:tabular-nums;text-align:center;color:var(--fosc)}
.mx-disp.buit{color:#94a3b8;font-weight:700;font-size:16px;line-height:30px}
.mx-tec{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;max-width:360px;margin:0 auto}
.mx-tec button{border:0;border-radius:12px;padding:13px 0;font-size:21px;font-weight:900;background:#fff;color:var(--fosc);box-shadow:0 0 0 2px var(--vora) inset,0 3px 0 var(--vora);cursor:pointer;font-family:inherit}
.mx-tec button:active{transform:translateY(2px)}
.mx-tec .ok{background:var(--blau);color:#fff;box-shadow:0 3px 0 var(--blau2)}
.mx-tec .esb{background:#fee2e2}
.mx-opc{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.mx-opc button{text-align:left;font:inherit;font-weight:700;padding:12px 14px;border-radius:12px;border:2px solid var(--vora);background:#fff;cursor:pointer}
.mx-fact{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}
.mx-fact .f{display:flex;flex-direction:column;align-items:center;background:#fff;border:2px solid var(--vora);border-radius:12px;padding:6px 8px;min-width:62px}
.mx-fact .f b{font-size:24px}.mx-fact .f sup{font-size:15px;color:var(--blau)}
.mx-fact .f button{border:0;background:#e2e8f0;border-radius:8px;width:40px;height:30px;font-size:18px;font-weight:900;cursor:pointer}
.mx-fact .f.zero{opacity:.45}
.mx-vista{text-align:center;font-size:20px;font-weight:900;margin-top:4px}
.mx-escala{display:flex;width:max-content;flex-direction:column;margin:8px auto;font-size:20px;font-weight:800;font-variant-numeric:tabular-nums}
.mx-escala div{display:flex}.mx-escala span{min-width:70px;text-align:right;padding:2px 10px;border-right:3px solid #334155}.mx-escala b{min-width:36px;padding:2px 10px;color:var(--blau)}
.mx-taula{font-size:17px;font-weight:800;background:#fff;border-radius:10px;padding:8px 12px;margin:6px 0;display:inline-block}
.mx-llib{margin-top:12px;padding:14px 18px;border-radius:6px;color:#1e293b;font-size:18px;line-height:1.75;
 background-color:#fffef5;background-image:linear-gradient(#93c5fd55 1px,transparent 1px),linear-gradient(90deg,#93c5fd55 1px,transparent 1px);background-size:22px 22px;
 font-family:"Segoe Print","Bradley Hand","Comic Sans MS","Chalkboard SE",cursive;box-shadow:inset 4px 0 0 #f87171}
.mx-llib h4{margin:0 0 4px;font-family:Nunito,system-ui,sans-serif;font-size:14px;color:#b91c1c}
.mx-llib .mx-escala span{border-right-color:#1e293b}
.mx-nota{font-size:56px;font-weight:900;text-align:center;line-height:1.1}
.mx-pts{width:100%;border-collapse:collapse;margin-top:10px;font-size:15px}.mx-pts td,.mx-pts th{padding:6px 8px;border-bottom:1px solid var(--vora);text-align:left}.mx-pts td:last-child,.mx-pts th:last-child{text-align:right;white-space:nowrap}
.mx-niv{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px}
@media(max-width:520px){.mx-enun{font-size:17px}.mx-tec button{padding:12px 0}}`;document.head.appendChild(s)}

// ---------- MODES, PISTES I ERRORS AMB CODI ----------
// Modes d'una fitxa: 👀 mira (exemple resolt, pas a pas) · ✍️ completa (la primera meitat de passos ja feta) · 💪 sol.
// Un pas pot portar: id (nom curt per al registre), pista (text del botó 💡), perque {q, op, r, expl} (pregunta «per què?»
// després d'encertar), noEx (no surt a l'examen). err(v) pot tornar un text o mxE(codi, text): el codi va al registre (ep).
const mxE=(c,m)=>({c,m});
const mxMsg=x=>x==null?null:typeof x==="string"?{c:"-",m:x}:x;
const mxTxt=q=>{const t=String(q).replace(/<[^>]+>/g,"");return t.length>70?t.slice(0,70)+"…":t};
const MX_PISTA={num:"Fes el càlcul a la llibreta i escriu només el resultat.",llista:"Ves per ordre, de petit a gran, i no te'n deixis cap.",tria:"Llegeix totes les opcions abans de triar: només n'hi ha una de bona.",fact:"Compta quantes vegades surt cada primer i posa-ho amb els botons ＋ i −."};
const MX_MODES=[["mira","👀","Mira com es fa","Un exemple resolt, pas a pas"],["completa","✍️","Completa","Uns passos ja fets: tu acabes"],["sol","💪","Tot sol","Tu fas tots els passos"]];
let MX_MODE="sol";
const mxNomG=g=>Array.isArray(g)?g[0]:g;
function mxCss2(){if(document.getElementById("mxCss2"))return;const s=document.createElement("style");s.id="mxCss2";s.textContent=`
.mx-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 4px}
.mx-mode{display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;padding:10px 6px;border-radius:14px;border:2px solid var(--vora);background:#fff;cursor:pointer;text-align:center;color:var(--fosc)}
.mx-mode span{font-size:26px}.mx-mode b{font-size:14.5px}.mx-mode small{font-size:12px;color:var(--suau);line-height:1.25}
.mx-mode.on{border-color:var(--blau);background:#eff6ff;box-shadow:0 0 0 2px var(--blau) inset}
.mx-fet.pre{color:#475569}
.mx-ajuda{display:flex;justify-content:flex-end;margin-top:8px}
.mx-ajuda .btn{padding:6px 12px;font-size:14px}
.mx-sol{margin:10px 0;padding:10px 14px;border-radius:12px;background:#ecfdf5;border:2px solid #6ee7b7;font-size:20px;text-align:center}
.mx-pas.mira{border-color:#93c5fd;background:#f0f9ff}
.mx-err{display:flex;flex-direction:column;gap:4px}
.mx-lin{display:block;width:100%;text-align:left;font:inherit;font-size:18px;line-height:1.5;padding:4px 10px;border:2px dashed transparent;border-radius:8px;background:transparent;cursor:pointer;color:inherit;font-family:inherit}
.mx-lin:hover{border-color:#93c5fd}
.mx-lin.mal{border-color:#ef4444;background:#fef2f2;text-decoration:line-through;text-decoration-color:#ef4444}
.mx-lin.no{opacity:.5}
.mx-divw{display:inline-flex;align-items:flex-start;margin:6px auto;background:#fff;padding:8px 12px;border-radius:10px}
.mx-div{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:21px;line-height:1.3;font-weight:800;margin:0;white-space:pre;text-align:left}
.mx-dsor{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:21px;line-height:1.3;font-weight:800;border-left:3px solid #334155;text-align:left}
.mx-dsor .d{border-bottom:3px solid #334155;padding:0 12px}.mx-dsor .q{padding:0 12px;color:var(--blau);min-height:1.3em}
.mx-fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 3px;font-weight:900;line-height:1.15}
.mx-fr i{font-style:normal;border-top:2px solid currentColor;min-width:1.2em;text-align:center}
.mx-expr{font-size:22px;font-weight:900;letter-spacing:.5px;text-align:center;margin:6px 0}
.mx-eq i{font-family:Georgia,serif}
@media(max-width:520px){.mx-modes{gap:6px}.mx-mode small{display:none}}`;document.head.appendChild(s)}

// Pantalla inicial: tria com ho vols fer (fitxes) i el nivell
function mxInici(j,examen){mxCss();mxCss2();MX=null;const bar=!!j.mx.barreja;
 const txt=examen?`Un examen com el del profe: <b>${j.mx.examen.length} exercicis</b>, nota <b>sobre 10</b>. No et diré si vas bé fins al final. Si el procediment és bo però t'equivoques al resultat, tens part del punt.`
  :bar?`<b>Repàs barrejat:</b> ${j.mx.n} exercicis de tipus diferents, un darrere l'altre. Així has de decidir cada vegada quin mètode toca, com a l'examen. Escriu els resultats amb el teclat i fes els passos a la llibreta.`
  :`Una fitxa com les de classe: <b>${j.mx.n} apartats</b> (a, b, c…). Escriu els resultats amb el teclat i fes els passos a la llibreta. Cada vegada surten números nous.`;
 const modes=examen||bar?"":`<p><b>Com ho vols fer?</b></p><div class="mx-modes">${MX_MODES.map(([m,ic,t,s])=>`<button class="mx-mode${MX_MODE===m?" on":""}" data-m="${m}" onclick="mxMode('${m}')"><span>${ic}</span><b>${t}</b><small>${s}</small></button>`).join("")}</div>`;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>${txt}</p>${modes}
 <p><b>Tria el nivell:</b></p><div class="mx-niv"><button class="btn sec" onclick="mxComença('${j.id}',1)">🟢 Bàsic</button><button class="btn sec" onclick="mxComença('${j.id}',2)">🟡 Mitjà</button><button class="btn" onclick="mxComença('${j.id}',3)">🔴 D'examen</button></div><div id="zona"></div></div>`}
function mxMode(m){MX_MODE=m;document.querySelectorAll(".mx-mode").forEach(b=>b.classList.toggle("on",b.dataset.m===m))}
function mxFitxa(j){mxInici(j,false)}
function mxExamen(j){mxInici(j,true)}
function mxBarreja(j){mxInici(j,false)}
function mxComença(id,nv){const j=ASSIG.jocs.find(x=>x.id===id),ex=!!j.mx.examen,bar=!!j.mx.barreja,mode=ex?"examen":bar?"barreja":MX_MODE;
 const fes=g=>{const E=Array.isArray(g)?MXG[g[0]](nv,g[1]):MXG[g](nv);E.g=mxNomG(g);E.gs=g;E.nv=nv;if(ex)E.passos=E.passos.filter(P=>!P.noEx);return E};
 let llista;
 if(ex)llista=j.mx.examen.map(([g,p])=>{const E=fes(g);E.punts=p;return E});
 else if(bar){llista=[];let deck=[],prev=null;for(let i=0;i<j.mx.n;i++){if(!deck.length)deck=MX_B(j.mx.barreja);let k=deck.findIndex(g=>mxNomG(g)!==prev);if(k<0)k=0;const g=deck.splice(k,1)[0];prev=mxNomG(g);llista.push(fes(g))}}
 else{const t=j.mx.tipus,n=mode==="mira"?1:j.mx.n,o=mode==="mira"?MX_R(0,t.length-1):0;llista=[...Array(n)].map((_,i)=>fes(t[(i+o)%t.length]))}
 MX={j,nv,ex,mode,llista,e:0,p:0,v:"",f:{},int:0,ajut:0,bones:0,errs:0,resp:[],ok:{},fi:false,apFet:false,ep:[],pistes:0,pq:0,pqb:0,
  pre:llista.map(E=>mode==="completa"&&E.passos.length>1?Math.floor(E.passos.length/2):0)};
 mxIniciaApartat();mxPinta();window.scrollTo(0,0)}
// mode «completa»: els primers passos de cada apartat ja surten fets (amb la resposta bona)
function mxIniciaApartat(){const pre=MX.pre[MX.e]||0,E=MX.llista[MX.e];if(MX.rep&&E.nv)MX.nv=E.nv;MX.p=pre;MX.resp[MX.e]=E.passos.slice(0,pre).map(P=>P.r)}
const MX_LL="abcdefghij";
function mxPinta(){const {j,llista,e,p,ex,mode}=MX,E=llista[e],P=E.passos[p],pre=MX.pre[e]||0,mira=mode==="mira",bar=mode==="barreja";
 const fets=E.passos.slice(0,p).map((x,i)=>`<div class="mx-fet${i<pre?" pre":""}">${ex?"✏️":i<pre||mira?"👀":"✅"} ${mxTxt(x.q)} → <b>${mxMostra(x,(MX.resp[e]||[])[i])}</b></div>`).join("");
 const cap=`<div class="mx-cap"><span class="mx-ap">${ex?`Exercici ${e+1} de ${llista.length} · ${String(E.punts).replace(".",",")} punt${E.punts===1?"":"s"}`:mira?"👀 Mira com es fa":mode==="control"?`📒 Resultat ${p+1} de ${E.passos.length}`:bar?`Exercici ${e+1} de ${llista.length}`:`Apartat ${MX_LL[e]}) de ${llista.length}${mode==="completa"?" · ✍️ Completa":""}`}</span><span class="prog">${["","🟢 Bàsic","🟡 Mitjà","🔴 D'examen"][MX.nv]}</span></div>`;
 const ctx=P.ctx?`<div style="text-align:center">${P.ctx()}</div>`:"";
 const pas=mira?`<div class="mx-pas mira">${ctx}<div>${P.q}</div><div class="mx-sol">👉 <b>${mxMostra(P,P.r)}</b></div>${mxExplica(P)?`<div class="fb">💡 ${mxExplica(P)}</div>`:""}<div class="fila"><button class="btn" id="mxSeg" onclick="mxSegMira()">${p+1<E.passos.length?"Següent pas ▶":"Mira com queda a la llibreta ▶"}</button></div></div>`
  :`<div class="mx-pas">${ctx}<div>${P.q}</div><div id="mxFb"></div>${mxEntrada(P)}${ex?"":`<div class="mx-ajuda"><button class="btn sec" onclick="mxPista()">💡 Pista</button></div>`}</div>`;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box">${cap}
 <div class="mx-enun"><b>${ex||bar?e+1+".":mira||mode==="control"?"":MX_LL[e]+")"}</b> ${E.enun}</div>${pre&&p===pre?`<div class="prog" style="margin:2px 0 4px">👀 Els primers passos ja estan fets. Mira'ls bé i continua tu.</div>`:""}${fets}
 ${pas}<div id="zona"></div></div>`;MX.v="";MX.f={};MX.int=0;MX.ajut=0;if(!mira)mxVista()}
function mxExplica(P){return P.expl||(P.perque&&P.perque.op[P.perque.r])||P.pista||""}
function mxSegMira(){const E=MX.llista[MX.e];(MX.resp[MX.e]=MX.resp[MX.e]||[])[MX.p]=E.passos[MX.p].r;
 if(MX.p+1<E.passos.length){MX.p++;return mxPinta()}
 MX.fi=true;const id=MX.j.id,nv=MX.nv;
 app.querySelector(".mx-pas").outerHTML=`<div class="mx-llib"><h4>📒 Així s'escriu a la llibreta</h4>${E.sol}</div>`;
 document.getElementById("zona").innerHTML=`<div class="fb ok">👀 Ja has vist com es fa. Ara et toca a tu!</div><div class="fila"><button class="btn" onclick="MX_MODE='completa';mxComença('${id}',${nv})">✍️ Completa'n un</button><button class="btn sec" onclick="MX_MODE='sol';mxComença('${id}',${nv})">💪 Fes-ne un tot sol</button><button class="btn sec" onclick="MX_MODE='mira';mxComença('${id}',${nv})">👀 Un altre exemple</button></div>`}
function mxMostra(P,v){if(v===undefined||v===null)return "—";if(P.t==="tria")return P.op[v];if(P.t==="fact")return mxPot(v);if(P.t==="llista")return mxLlista(v);return mxN(v)}
function mxEntrada(P){
 if(P.t==="tria")return `<div class="mx-opc">${P.op.map((o,i)=>`<button onclick="mxRespon(${i})">${o}</button>`).join("")}</div>`;
 if(P.t==="fact")return `<div class="mx-fact">${P.primers.map(p=>`<div class="f zero" data-p="${p}"><button onclick="mxExp(${p},1)" aria-label="més ${p}">＋</button><b>${p}<sup>0</sup></b><button onclick="mxExp(${p},-1)" aria-label="menys ${p}">−</button></div>`).join("")}</div>
  <div class="mx-vista" id="mxVis">= ?</div><div class="fila"><button class="btn" onclick="mxRespon()">Comprova ✔</button></div>`;
 const k=P.t==="llista"?[7,8,9,"⌫",4,5,6,",",1,2,3,"C","",0,"",""]:[7,8,9,"⌫",4,5,6,"C",1,2,3,"",0,"","",""];
 return `<div class="mx-disp buit" id="mxDisp">${P.t==="llista"?"Escriu els nombres separats per comes":"Escriu el resultat"}</div>
 <div class="mx-tec">${k.map(x=>x===""?"<span></span>":`<button class="${x==="⌫"||x==="C"?"esb":""}" onclick="mxTecla('${x}')">${x}</button>`).join("")}</div>
 <div class="fila"><button class="btn" onclick="mxRespon()">Comprova ✔</button></div>`}
function mxTecla(x){if(!MX||MX.fi)return;if(x==="⌫")MX.v=MX.v.slice(0,-1);else if(x==="C")MX.v="";else if(x===","){if(MX.v&&!/,\s*$/.test(MX.v))MX.v+=", "}else if(MX.v.replace(/\D/g,"").length<40)MX.v+=x;
 if(typeof so==="function"&&x!=="")so("clic");mxVista()}
function mxExp(p,d){MX.f[p]=Math.max(0,Math.min(9,(MX.f[p]||0)+d));mxVista()}
function mxVista(){const P=MX.llista[MX.e].passos[MX.p];
 if(P.t==="fact"){document.querySelectorAll(".mx-fact .f").forEach(el=>{const p=+el.dataset.p,e=MX.f[p]||0;el.classList.toggle("zero",!e);el.querySelector("b").innerHTML=`${p}<sup>${e}</sup>`});
  const v=document.getElementById("mxVis");if(v){const t=Object.values(MX.f).some(x=>x);v.innerHTML=t?`${mxPot(MX.f)} = ${mxN(mxVal(MX.f))}`:"= ?"}return}
 const d=document.getElementById("mxDisp");if(!d)return;d.classList.toggle("buit",!MX.v);d.textContent=MX.v?MX.v.replace(/\d+/g,m=>mxN(+m)):(P.t==="llista"?"Escriu els nombres separats per comes":"Escriu el resultat")}
function mxLlegeix(P,i){if(P.t==="tria")return i;if(P.t==="fact"){const f={};for(const k in MX.f)if(MX.f[k])f[k]=MX.f[k];return f}
 const ns=(MX.v.match(/\d+/g)||[]).map(Number);return P.t==="llista"?ns:(ns.length?ns[0]:null)}
function mxBo(P,v){if(v===null||v===undefined)return false;if(P.ok)return P.ok(v);
 if(P.t==="llista"){const a=[...new Set(v)].sort((x,y)=>x-y),b=[...P.r].sort((x,y)=>x-y);return a.length===b.length&&a.every((x,i)=>x===b[i])}
 if(P.t==="fact"){const ks=new Set([...Object.keys(v),...Object.keys(P.r)]);return [...ks].every(k=>(v[k]||0)===(P.r[k]||0))}
 return v===P.r}
// cada resposta equivocada es desa com «generador|pas|codi» (p. ex. «escala|primer|no_primer») per al tauler d'admin
function mxApunta(E,P,c){if(MX.ep.length<40)MX.ep.push(`${E.g||"?"}|${P.id||P.t}|${c||"-"}`);if(MX.errE)MX.errE[MX.e]=(MX.errE[MX.e]||0)+1;mxRepErr(E,P,c)}
function mxRespon(i){if(!MX||MX.fi||MX.apFet||MX.esp||MX.perq||MX.mode==="mira")return;const E=MX.llista[MX.e],P=E.passos[MX.p],v=mxLlegeix(P,i),fb=document.getElementById("mxFb");
 if(P.t!=="tria"&&(v===null||(P.t==="llista"&&!v.length)||(P.t==="fact"&&!Object.keys(v).length))){fb.innerHTML=`<div class="fb">✏️ Primer escriu la resposta.</div>`;return}
 (MX.resp[MX.e]=MX.resp[MX.e]||[])[MX.p]=v;const bo=mxBo(P,v);
 const em=bo?null:(mxMsg(P.err&&P.err(v))||{c:"-",m:"No és correcte. Torna-ho a mirar."});
 if(MX.ex){MX.ok[MX.e+"_"+MX.p]=bo;if(!bo)mxApunta(E,P,em.c);if(typeof so==="function")so("clic");return mxSeg()}
 if(bo){if(!MX.int&&!MX.ajut){MX.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)}if(typeof so==="function")so("ok");
  if(P.perque&&(MX.forcaPq||Math.random()<.5))return mxPerque(P);return mxSeg()}
 MX.errs++;MX.int++;mxApunta(E,P,em.c);const pas=document.querySelector(".mx-pas");if(pas&&typeof sacseja==="function")sacseja(pas);
 if(MX.int>=2){(MX.resp[MX.e])[MX.p]=P.r;fb.innerHTML=`<div class="fb">❌ ${em.m}<br>👉 La resposta és <b>${mxMostra(P,P.r)}</b>. Apunta-te-la i seguim.</div><div class="fila"><button class="btn" onclick="mxSeg()">D'acord, seguim ▶</button></div>`;MX.esp=true;return}
 fb.innerHTML=`<div class="fb" style="background:#fef2f2;border-color:#fecaca">❌ ${em.m}</div>`}
// 💡 pista abans de respondre: ajuda, però aquell pas ja no dona estrella
function mxPista(){if(!MX||MX.fi||MX.apFet||MX.esp||MX.perq)return;const P=MX.llista[MX.e].passos[MX.p],fb=document.getElementById("mxFb");if(!fb)return;
 if(!MX.ajut){MX.ajut=1;MX.pistes++}if(MX.ajutE)MX.ajutE[MX.e]=1;
 fb.innerHTML=`<div class="fb">💡 ${P.pista||MX_PISTA[P.t]}<br><small>Aquest pas ja no dona estrella, però t'ajuda a aprendre.</small></div>`}
// 🤔 «per què?» després d'encertar (no compta per a la nota: serveix per entendre)
function mxPerque(P){MX.perq=true;const q=P.perque,ord=MX_B(q.op.map((_,i)=>i)),pas=app.querySelector(".mx-pas");
 pas.innerHTML=`<div class="fb ok">✅ Ben fet! → <b>${mxMostra(P,P.r)}</b></div><div style="margin-top:10px;font-weight:800">🤔 ${q.q||"Per què?"}</div><div class="mx-opc">${ord.map(k=>`<button onclick="mxPerqueResp(${k})">${q.op[k]}</button>`).join("")}</div><div id="mxPq"></div>`}
function mxPerqueResp(k){const P=MX.llista[MX.e].passos[MX.p],q=P.perque,out=document.getElementById("mxPq");if(!out||out.dataset.fet)return;out.dataset.fet=1;
 const bo=k===q.r;MX.pq++;if(bo)MX.pqb++;if(typeof so==="function")so(bo?"ok":"ko");
 out.innerHTML=`<div class="fb ${bo?"ok":""}">${bo?"👏 Exacte!":"No ben bé."} ${q.expl||q.op[q.r]+"."}</div><div class="fila"><button class="btn" id="mxSeg" onclick="mxPerqueFi()">Seguim ▶</button></div>`}
function mxPerqueFi(){MX.perq=false;mxSeg()}
function mxSeg(){const E=MX.llista[MX.e];MX.esp=false;
 if(MX.p+1<E.passos.length){MX.p++;return mxPinta()}
 if(MX.ex){if(MX.e+1<MX.llista.length){MX.e++;MX.p=0;return mxPinta()}return mxFiExamen()}
 // apartat acabat: solució de llibreta
 const ult=MX.e+1>=MX.llista.length,bar=MX.mode==="barreja";MX.apFet=true;
 app.querySelector(".mx-pas").outerHTML=`<div class="fb ok">✅ ${bar?`Exercici ${MX.e+1}`:`Apartat ${MX_LL[MX.e]})`} fet!</div><div class="mx-llib"><h4>📒 Així s'escriu a la llibreta</h4>${E.sol}</div>`;
 document.getElementById("zona").innerHTML=`<div class="fila"><button class="btn" id="mxSeg" onclick="${ult?(MX.onFi?"MX.onFi()":"mxFiFitxa()"):"mxApartat()"}">${ult?(MX.onFi?"Veure el resultat 🏁":"Acaba la fitxa 🏁"):bar?`Exercici ${MX.e+2} ▶`:`Apartat ${MX_LL[MX.e+1]}) ▶`}</button></div>`}
function mxApartat(){MX.apFet=false;MX.e++;mxIniciaApartat();mxPinta();window.scrollTo(0,0)}
function mxFiFitxa(){MX.fi=true;const {j,bones,errs}=MX,tot=MX.llista.reduce((a,E,i)=>a+E.passos.length-(MX.pre[i]||0),0),bar=MX.mode==="barreja";
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>Has fet ${bar?`els <b>${MX.llista.length} exercicis</b>`:`els <b>${MX.llista.length} apartats</b>`}: <b>${bones}</b> de ${tot} passos bé a la primera${errs?` i <b>${errs}</b> errors`:""}${MX.pistes?` · ${MX.pistes} pista${MX.pistes>1?"s":""}`:""}.${MX.pq?` Has encertat ${MX.pqb} de ${MX.pq} «per què?».`:""}</p>${MX.mode==="completa"?`<p class="prog">Quan et surti fàcil, prova el mode 💪 <b>Tot sol</b>.</p>`:""}<div id="zona"></div></div>`;
 fiJoc(j,Math.max(1,bones),errs,{nivell:MX.nv,mode:MX.mode,pasos:`${bones}/${tot}`,ep:MX.ep,pistes:MX.pistes})}
function mxFiExamen(){MX.fi=true;const {j,llista}=MX;let nota=0;
 const fil=llista.map((E,e)=>{const tw=E.passos.reduce((a,P)=>a+(P.w||1),0),bw=E.passos.reduce((a,P,p)=>a+(MX.ok[e+"_"+p]?(P.w||1):0),0);
  const pts=Math.round(E.punts*bw/tw*4)/4;nota+=pts;return {E,e,pts}});
 nota=Math.round(nota*100)/100;const n10=Math.round(nota*10);
 const col=nota>=9?"#16a34a":nota>=7?"#2563eb":nota>=5?"#d97706":"#dc2626",txt=nota>=9?"Excel·lent":nota>=7?"Notable":nota>=6?"Bé":nota>=5?"Suficient":"Insuficient";
 if(typeof registra==="function")registra("examen",{joc:j.id,nota,nivell:MX.nv,mode:"examen",ep:MX.ep});
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><div class="mx-nota" style="color:${col}">${String(nota).replace(".",",")}</div><p style="text-align:center;font-weight:900;margin:0">${txt} · nota sobre 10</p>
 <table class="mx-pts"><tr><th>Exercici</th><th>Punts</th></tr>${fil.map(({E,e,pts})=>`<tr><td>${e+1}. ${E.enun.replace(/<[^>]+>/g,"").slice(0,60)}…</td><td><b>${String(pts).replace(".",",")}</b> / ${String(E.punts).replace(".",",")}</td></tr>`).join("")}</table>
 <h3 style="margin-top:18px">📒 Correcció</h3>${fil.map(({E,e,pts})=>`<div class="mx-llib"><h4>Exercici ${e+1} · ${String(pts).replace(".",",")} / ${String(E.punts).replace(".",",")}</h4><div style="font-family:Nunito,system-ui,sans-serif;font-size:15px;margin-bottom:6px">${E.enun}</div>
  ${E.passos.map((P,p)=>`<div style="font-family:Nunito,system-ui,sans-serif;font-size:14.5px">${MX.ok[e+"_"+p]?"✅":"❌"} ${P.q.replace(/<[^>]+>/g,"").slice(0,80)} → tu: <b>${mxMostra(P,(MX.resp[e]||[])[p])}</b>${MX.ok[e+"_"+p]?"":` · bona: <b>${mxMostra(P,P.r)}</b>`}</div>`).join("")}
  <div style="margin-top:6px">${E.sol}</div></div>`).join("")}<div id="zona"></div></div>`;
 fiJoc(j,Math.max(1,n10),100-n10,{nivell:MX.nv,mode:"examen"});
 document.getElementById("zona").innerHTML=`<div class="fb ${nota>=5?"ok":""}">${nota>=5?"🎉 Aprovat!":"💪 Encara no: repassa els exercicis amb ❌ i torna-hi."} Mira la correcció de dalt: és com la del profe.</div><div class="fila"><button class="btn" onclick="joc('${j.id}')">Un altre examen</button><button class="btn sec" onclick="vista('jocs')">Altres jocs</button></div>`}
// teclat físic (ordinador)
if(typeof addEventListener!=="undefined")addEventListener("keydown",e=>{if(!MX||MX.fi||MX.apFet||MX.perq||MX.mode==="mira"||!document.getElementById("mxDisp"))return;
 if(/^[0-9]$/.test(e.key))mxTecla(e.key);else if(e.key===","||e.key===" ")mxTecla(",");else if(e.key==="Backspace")mxTecla("⌫");else if(e.key==="Enter"){e.preventDefault();MX.esp?mxSeg():mxRespon()}else return;e.preventDefault()});

// ---------- GENERADORS NOUS: divisió llarga (aquest tema) · combinades, fraccions i equacions (per a temes futurs) ----------
// Cada generador nou també retorna «chk»: dades perquè motor/prova-generadors.js comprovi que els càlculs són bons.
const mxOpera=(a,o,b)=>o==="+"?a+b:o==="−"?a-b:o==="·"?a*b:a/b;
// quina operació toca segons la jerarquia: parèntesis de dins → · i : (esquerra a dreta) → + i − (esquerra a dreta)
function mxPasOp(t){let ini=0,fi=t.length-1;const tanc=t.indexOf(")");if(tanc>=0){fi=tanc-1;ini=t.lastIndexOf("(",tanc)+1}
 for(let i=ini;i<=fi;i++)if(t[i]==="·"||t[i]===":")return i;
 for(let i=ini;i<=fi;i++)if(t[i]==="+"||t[i]==="−")return i;return -1}
function mxAplica(t,i){const r=mxOpera(t[i-1],t[i],t[i+1]);t=[...t.slice(0,i-1),r,...t.slice(i+2)];
 for(let k=0;k<t.length-2;k++)if(t[k]==="("&&typeof t[k+1]==="number"&&t[k+2]===")"){t=[...t.slice(0,k),t[k+1],...t.slice(k+3)];k=-1}
 return t}
const mxExprTxt=t=>t.map(x=>typeof x==="number"?mxN(x):x).join(" ").replace(/\( /g,"(").replace(/ \)/g,")");
const mxFr=(x,y)=>`<span class="mx-fr">${x}<i>${y}</i></span>`;
Object.assign(MXG,{
 // ➗ Divisió llarga, xifra a xifra, com a la llibreta (la «caixa»). Acaba decidint si és divisible.
 divisio(nv){
  let d,D;for(let k=0;k<300;k++){d=nv===1?MX_R(2,9):nv===2?(Math.random()<.6?MX_R(3,9):MX_R(11,19)):MX_R(12,35);
   const exacta=Math.random()<.5,q=nv===1?MX_R(12,99):nv===2?MX_R(21,199):MX_R(21,299);D=d*q+(exacta?0:MX_R(1,d-1));
   if(D>=10*d&&D<(nv===1?1000:10000))break}
  const s=String(D),L=s.length,cic=[];let i=0,parc=+s[0];while(parc<d&&i+1<L){i++;parc=parc*10+ +s[i]}
  for(;;){const q=Math.floor(parc/d),rest=parc-q*d;cic.push({parc,q,prod:q*d,rest,fi:i});if(i+1>=L)break;i++;parc=rest*10+ +s[i]}
  const fila=()=>Array(L+1).fill(" "),posa=(r,t,fi)=>{t=String(t);for(let k=0;k<t.length;k++)r[fi+1-(t.length-1-k)]=t[k]};
  // nc = cicles acabats; fase del cicle següent: 0 res, 1 producte escrit, 2 resta escrita (sense baixar la xifra)
  const dib=(nc,fase)=>{const rows=[],r0=fila();posa(r0,s,L-1);rows.push(r0);let qs="";
   for(let c=0;c<cic.length&&c<nc+(fase?1:0);c++){const C=cic[c];qs+=C.q;const pr=fila();posa(pr,C.prod,C.fi);pr[C.fi+1-String(C.prod).length]="−";rows.push(pr);
    if(c>=nc&&fase<2)break;const re=fila();posa(re,C.rest,C.fi);if(c<nc&&c+1<cic.length)re[C.fi+2]=s[C.fi+1];rows.push(re)}
   return `<div class="mx-divw"><pre class="mx-div">${rows.map(r=>r.join("")).join("\n")}</pre><div class="mx-dsor"><div class="d">${d}</div><div class="q">${qs||" "}</div></div></div>`};
  const passos=[];
  cic.forEach((C,c)=>{
   passos.push({t:"num",id:"xifra",q:`Quantes vegades cap el <b>${d}</b> dins de <b>${C.parc}</b>?`,r:C.q,ctx:()=>dib(c,0),
    pista:`Fes la taula del ${d} (${d}, ${2*d}, ${3*d}…) i busca el més gran que no passi de ${C.parc}.`,
    err:v=>mxE("calcul",v*d>C.parc?`${d} · ${v} = ${v*d}, que és més gran que ${C.parc}: t'has passat.`:`${d} · ${v} = ${v*d}, però encara hi cap una vegada més: ${d} · ${v+1} = ${(v+1)*d}.`)});
   passos.push({t:"num",id:"resta",q:`${d} · ${C.q} = ${C.prod}. Quant sobra? (${C.parc} − ${C.prod})`,r:C.rest,ctx:()=>dib(c,1),
    err:v=>mxE("resta",`Resta amb calma: ${C.parc} − ${C.prod}.`)});
   if(c+1<cic.length){const nx=s[C.fi+1];
    passos.push({t:"num",id:"baixar",q:`Baixa la xifra següent, el <b>${nx}</b>. Quin nombre tens ara?`,r:cic[c+1].parc,ctx:()=>dib(c,2),
     err:v=>mxE("baixar",`Escriu el ${nx} al costat del ${C.rest}: queda ${cic[c+1].parc}.`)})}});
  const Q=Math.floor(D/d),R=D%d,qd=cic.map(C=>C.q).join("");
  passos.push({t:"num",id:"quocient",q:`Quin és el <b>quocient</b>? (les xifres de dalt, en ordre)`,r:Q,ctx:()=>dib(cic.length,0),err:v=>mxE("calcul",`Ajunta les xifres que has anat trobant: ${qd.split("").join(", ")}.`)});
  passos.push({t:"num",id:"residu",q:`I el <b>residu</b> (el que sobra al final)?`,r:R,ctx:()=>dib(cic.length,0),err:v=>mxE("calcul",`És l'última resta que has fet.`)});
  passos.push({t:"tria",id:"tria",q:`Llavors, ${mxN(D)} és divisible per ${d}?`,op:["Sí: la divisió és exacta (residu 0)","No: la divisió no és exacta"],r:R?1:0,ctx:()=>dib(cic.length,0),
   perque:{q:"Quan és divisible un nombre per un altre?",op:["Quan la divisió és exacta: el residu és 0","Quan el quocient és parell","Quan el divisor és més petit"],r:0},
   err:()=>mxE("-",R?`El residu és ${R}, no 0: la divisió no és exacta.`:`El residu és 0: la divisió és exacta, i per tant sí que és divisible.`)});
  return {enun:`Fes la divisió <b>${mxN(D)} : ${d}</b> a la llibreta, xifra a xifra. És exacta?`,passos,
   sol:`${dib(cic.length,0)}<br>${mxN(D)} : ${d} = <b>${mxN(Q)}</b> i el residu és <b>${R}</b><br>Prova: ${d} · ${mxN(Q)} + ${R} = ${mxN(D)}<br>→ ${mxN(D)} <b>${R?"NO":"SÍ"}</b> és divisible per ${d}.`,chk:{tipus:"divisio",D,d,Q,R}};
 },
 // 🧮 Operacions combinades (jerarquia): primer quina operació toca, després el resultat
 combinades(nv){
  const P1=[()=>[MX_R(2,20),"+",MX_R(2,9),"·",MX_R(2,9)],()=>{const a=MX_R(2,9),b=MX_R(2,9);return [a,"·",b,"−",MX_R(1,a*b-1)]},()=>{const b=MX_R(2,9);return [MX_R(1,20),"+",b*MX_R(2,9),":",b]}];
  const P2=[()=>{const d=MX_R(1,8);return [MX_R(2,20),"+",MX_R(2,6),"·","(",d+MX_R(1,8),"−",d,")"]},
   ()=>{const a=MX_R(2,9),b=MX_R(2,9),c=MX_R(2,6);return ["(",a,"+",b,")","·",c,"−",MX_R(1,(a+b)*c-1)]},
   ()=>{const c=MX_R(2,6),q=MX_R(2,9);return [MX_R(2,9),"·",MX_R(2,9),"+",c*q,":",c]}];
  const P3=[()=>{const c=MX_R(2,6),q=MX_R(2,9);return [q+MX_R(1,15),"−",c*q,":",c,"+",MX_R(2,6),"·",MX_R(2,6)]},
   ()=>{const d=MX_R(2,5),k=MX_R(1,4),b=MX_R(1,6);return [d*k,"·","(",b,"+",MX_R(1,6),")",":",d]},
   ()=>{const b=MX_R(2,5),c=MX_R(1,4),e=MX_R(1,4);return [b*(c+e)+MX_R(1,20),"−",b,"·","(",c,"+",e,")"]}];
  for(let intent=0;intent<50;intent++){
   let t=MX_T(nv===1?P1:nv===2?P2:P3)();const passos=[],hist=[mxExprTxt(t)];let ok=true;
   while(t.length>1){const i=mxPasOp(t);if(i<0){ok=false;break}const r=mxOpera(t[i-1],t[i],t[i+1]);if(r<0||!Number.isInteger(r)){ok=false;break}
    const ops=[];for(let k=1;k<t.length-1;k++)if(["+","−","·",":"].includes(t[k])&&typeof t[k-1]==="number"&&typeof t[k+1]==="number")ops.push(k);
    const tt=t,txt=k=>`${mxN(tt[k-1])} ${tt[k]} ${mxN(tt[k+1])}`,cur=mxExprTxt(t),dins=t.includes("(");
    if(ops.length>1){const ord=MX_B([i,...ops.filter(k=>k!==i).slice(0,2)]);
     passos.push({t:"tria",id:"ordre",q:`Quina operació fas primer?`,op:ord.map(txt),r:ord.indexOf(i),ctx:()=>`<div class="mx-expr">${cur}</div>`,
      pista:"Primer el que hi ha dins dels parèntesis; després multiplicacions i divisions (d'esquerra a dreta); al final sumes i restes (d'esquerra a dreta).",
      perque:{q:`Per què primer ${txt(i)}?`,op:[dins?"Perquè és dins del parèntesi":tt[i]==="·"||tt[i]===":"?"Perquè multiplicacions i divisions van abans que sumes i restes":"Perquè, quan són del mateix tipus, es fa d'esquerra a dreta","Perquè és la primera que es veu","Perquè té els nombres més grans"],r:0},
      err:v=>{const k=ord[v];return mxE("jerarquia",dins?"Primer has de fer el que hi ha dins del parèntesi.":(tt[k]==="+"||tt[k]==="−")&&(tt[i]==="·"||tt[i]===":")?"Multiplicacions i divisions van abans que sumes i restes.":"Quan les operacions són del mateix tipus, es fan d'esquerra a dreta.")}})}
    passos.push({t:"num",id:"calcul",q:`Quant fa <b>${txt(i)}</b>?`,r,ctx:()=>`<div class="mx-expr">${cur}</div>`,err:()=>mxE("calcul",`Torna a fer ${txt(i)} a la llibreta.`)});
    t=mxAplica(t,i);hist.push(mxExprTxt(t))}
   if(!ok)continue;
   return {enun:`Calcula respectant la jerarquia de les operacions:<div class="mx-expr">${hist[0]}</div>`,passos,sol:hist.map((h,k)=>(k?"= ":"")+h).join("<br>")+`<br><b>Resultat: ${mxN(t[0])}</b>`,chk:{tipus:"combinades",expr:hist[0],res:t[0]}}}
  return MXG.combinades(1);
 },
 // 🍰 Suma i resta de fraccions amb denominadors diferents (MCM, fraccions equivalents, operar, simplificar)
 fraccions(nv){
  for(let k=0;k<300;k++){let b,d;
   if(nv===1){b=MX_T([2,3,4,5]);d=b*MX_T([2,3])}else if(nv===2){[b,d]=MX_B([MX_T([2,3,4,5]),MX_T([3,5,7])])}else{const g=MX_T([2,3]);b=g*MX_T([2,3,5]);d=g*MX_T([2,3,4,5])}
   if(b===d)continue;const a=MX_R(1,b-1),c=MX_R(1,d-1),resta=nv>1&&Math.random()<.4;if(mxMCD(a,b)>1||mxMCD(c,d)>1)continue;
   const m=mxMCM(b,d),n1=a*m/b,n2=c*m/d,num=resta?n1-n2:n1+n2;if(num<=0)continue;
   const g=mxMCD(num,m),fn=num/g,fd=m/g,op=resta?"−":"+",F=mxFr;
   const passos=[
    {t:"num",id:"mcm",q:`Quin és el <b>MCM dels denominadors</b> (${b} i ${d})?`,r:m,pista:`Busca el múltiple més petit que tenen en comú el ${b} i el ${d}.`,
     err:v=>v===b+d?mxE("denominador",`Els denominadors no se sumen! Busca el MCM de ${b} i ${d}.`):mxE("calcul",v===b*d&&b*d!==m?`${b*d} també és múltiple de tots dos, però n'hi ha un de més petit.`:`Múltiples de ${Math.max(b,d)}: ${[1,2,3,4].map(x=>x*Math.max(b,d)).join(", ")}… Quin és també múltiple de ${Math.min(b,d)}?`)},
    {t:"num",id:"equiv",q:`${F(a,b)} = ${F("?",m)} · Quin numerador hi va?`,r:n1,pista:`${m} : ${b} = ${m/b}. Multiplica el numerador per ${m/b}.`,err:()=>mxE("calcul",`${m} : ${b} = ${m/b}, i ${a} · ${m/b} = ?`)},
    {t:"num",id:"equiv",q:`${F(c,d)} = ${F("?",m)} · Quin numerador hi va?`,r:n2,err:()=>mxE("calcul",`${m} : ${d} = ${m/d}, i ${c} · ${m/d} = ?`)},
    {t:"num",id:"opera",q:`Ara ${resta?"resta":"suma"} els numeradors: ${F(n1,m)} ${op} ${F(n2,m)} = ${F("?",m)}`,r:num,err:()=>mxE("calcul",`${n1} ${op} ${n2} = ? El denominador (${m}) no canvia.`)},
    {t:"tria",id:"simpl",q:`Es pot simplificar ${F(num,m)}?`,op:[`Sí: ${num} i ${m} es poden dividir pel mateix nombre`,"No: ja és irreductible"],r:g>1?0:1,
     err:()=>mxE("simplifica",g>1?`${num} i ${m} es poden dividir tots dos per ${g}.`:`${num} i ${m} no tenen cap divisor comú (a part de l'1).`)}];
   if(g>1)passos.push({t:"num",id:"simpl",q:`Per quin nombre els divideixes? (el més gran que divideix ${num} i ${m}: el seu MCD)`,r:g,err:()=>mxE("calcul",`Busca el MCD (${num}, ${m}).`)},
    {t:"num",id:"simpl",q:`${num} : ${g} = ? (el numerador del resultat)`,r:fn,err:()=>mxE("calcul",`${num} : ${g} = ?`)},
    {t:"num",id:"simpl",q:`${m} : ${g} = ? (el denominador del resultat)`,r:fd,err:v=>mxE(v===m?"simplifica":"calcul",`També s'ha de dividir el denominador: ${m} : ${g}.`)});
   return {enun:`Calcula i simplifica: ${F(a,b)} ${op} ${F(c,d)}`,passos,
    sol:`${F(a,b)} ${op} ${F(c,d)} = ${F(n1,m)} ${op} ${F(n2,m)} = ${F(num,m)}${g>1?` = <b>${F(fn,fd)}</b>`:" ← <b>ja és irreductible</b>"}`,chk:{tipus:"fraccions",a,b,c,d,op,fn,fd}}}
 },
 // ⚖️ Equacions de primer grau (transposició de termes: el que suma passa restant, el que multiplica passa dividint…)
 equacio(nv){
  const x=MX_R(2,nv===3?15:12),X=`<i>x</i>`,E=t=>`<span class="mx-eq">${t}</span>`;
  if(nv===1){const b=MX_R(2,20),c=x+b;
   return {enun:`Resol l'equació: <div class="mx-expr">${E(`${X} + ${b} = ${c}`)}</div>`,passos:[
    {t:"tria",id:"transposa",q:`El <b>+ ${b}</b> passa a l'altre costat…`,op:[`restant (− ${b})`,`sumant (+ ${b})`,"multiplicant"],r:0,err:()=>mxE("signe","El que està sumant passa a l'altre costat fent el contrari: restant.")},
    {t:"num",id:"x",q:`${E(`${X} = ${c} − ${b}`)}. Quant val <i>x</i>?`,r:x,err:()=>mxE("calcul",`${c} − ${b} = ?`)}],
    sol:`${X} + ${b} = ${c}<br>${X} = ${c} − ${b}<br><b>${X} = ${x}</b><br>Comprovació: ${x} + ${b} = ${c} ✔`,chk:{tipus:"equacio",a:1,b,c:0,e:c,x}}}
  if(nv===2){const a=MX_R(2,6),b=MX_R(1,20),c=a*x+b;
   return {enun:`Resol l'equació: <div class="mx-expr">${E(`${a}${X} + ${b} = ${c}`)}</div>`,passos:[
    {t:"tria",id:"transposa",q:`Primer, el <b>+ ${b}</b> passa a l'altre costat…`,op:[`restant (− ${b})`,`sumant (+ ${b})`,`dividint (: ${b})`],r:0,err:()=>mxE("signe","El que està sumant passa a l'altre costat restant.")},
    {t:"num",id:"calcul",q:`${E(`${a}${X} = ${c} − ${b}`)}. Quant fa ${c} − ${b}?`,r:c-b,err:()=>mxE("calcul",`${c} − ${b} = ?`)},
    {t:"tria",id:"transposa",q:`Ara el <b>${a}</b> que multiplica la <i>x</i> passa a l'altre costat…`,op:["dividint","restant","multiplicant"],r:0,err:()=>mxE("signe","El que està multiplicant passa a l'altre costat dividint.")},
    {t:"num",id:"x",q:`${E(`${X} = ${c-b} : ${a}`)}. Quant val <i>x</i>?`,r:x,err:()=>mxE("calcul",`${c-b} : ${a} = ?`)}],
    sol:`${a}${X} + ${b} = ${c}<br>${a}${X} = ${c} − ${b} = ${c-b}<br>${X} = ${c-b} : ${a}<br><b>${X} = ${x}</b><br>Comprovació: ${a} · ${x} + ${b} = ${c} ✔`,chk:{tipus:"equacio",a,b,c:0,e:c,x}}}
  let a,c,b,e;for(let k=0;k<100;k++){c=MX_R(1,5);a=c+MX_R(1,4);b=MX_R(1,15);e=a*x+b-c*x;if(e>b)break}
  return {enun:`Resol l'equació: <div class="mx-expr">${E(`${a}${X} + ${b} = ${c===1?"":c}${X} + ${e}`)}</div>`,passos:[
   {t:"tria",id:"transposa",q:`Passem les <i>x</i> a l'esquerra: el <b>${c===1?"":c}${X}</b> de la dreta passa…`,op:[`restant (− ${c===1?"":c}${X})`,`sumant (+ ${c===1?"":c}${X})`,"dividint"],r:0,err:()=>mxE("signe","Està sumant a la dreta: passa a l'esquerra restant.")},
   {t:"num",id:"calcul",q:`${E(`${a}${X} − ${c===1?"":c}${X}`)} = ? · ${X} (quantes <i>x</i> queden?)`,r:a-c,err:()=>mxE("calcul",`${a} − ${c} = ?`)},
   {t:"tria",id:"transposa",q:`Ara el <b>+ ${b}</b> de l'esquerra passa a la dreta…`,op:[`restant (− ${b})`,`sumant (+ ${b})`,"multiplicant"],r:0,err:()=>mxE("signe","El que està sumant passa a l'altre costat restant.")},
   {t:"num",id:"calcul",q:`${e} − ${b} = ?`,r:e-b,err:()=>mxE("calcul",`${e} − ${b} = ?`)},
   {t:"num",id:"x",q:`${E(`${a-c===1?"":a-c}${X} = ${e-b}`)}. Quant val <i>x</i>?`,r:x,err:()=>mxE("calcul",a-c===1?`Si 1 · x = ${e-b}, quant val x?`:`${e-b} : ${a-c} = ?`)}],
   sol:`${a}${X} + ${b} = ${c===1?"":c}${X} + ${e}<br>${a}${X} − ${c===1?"":c}${X} = ${e} − ${b}<br>${a-c===1?"":a-c}${X} = ${e-b}<br><b>${X} = ${x}</b><br>Comprovació: ${a} · ${x} + ${b} = ${a*x+b} i ${c} · ${x} + ${e} = ${c*x+e} ✔`,chk:{tipus:"equacio",a,b,c,e,x}};
 }
});

// ---------- 🔍 TROBA L'ERROR: un exercici resolt amb un error típic. El nen toca la línia dolenta i diu per què ----------
// Joc: {id:"…",tipus:"custom",fn:"mxError",prova:"mxErrProva",mx:{error:["mcm_exp",…],n:5}, …}
// Cada tipus retorna {enun, linies:[…], mal (índex de la línia dolenta), per:[la bona primer, 2 de falses], bona, pista}.
const MX_NOMS=["en Pau","la Laia","en Nil","la Carla","l'Oriol","la Martina"];
const mxEsc=(n,ps)=>{const r=[];let c=n;for(const p of ps){r.push(`${mxN(c)} │ ${p}`);c/=p}r.push(`${mxN(c)} │`);return r};
const mxPrimersDe=n=>{const r=[];let d=2;while(n>1){while(n%d===0){r.push(d);n/=d}d++}return r};
const MXE={
 mcm_exp(){let a,b,Fa,Fb;for(let k=0;k<200;k++){a=MX_T([12,18,20,24,28,36,40,45,48,54,60,72,90]);b=MX_T([8,15,16,18,20,27,30,32,36,50]);if(a===b||a%b===0||b%a===0)continue;Fa=mxFactors(a);Fb=mxFactors(b);if(Object.keys(Fa).some(p=>Fb[p]&&Fb[p]!==Fa[p]))break}
  const ps=[...new Set([...Object.keys(Fa),...Object.keys(Fb)].map(Number))],Fm={},Fo={};ps.forEach(p=>{const x=Fa[p]||0,y=Fb[p]||0;Fo[p]=Math.max(x,y);Fm[p]=x&&y?Math.min(x,y):Math.max(x,y)});
  return {enun:`Calcula el MCM (${a}, ${b}).`,linies:[`${a} = ${mxPot(Fa)}`,`${b} = ${mxPot(Fb)}`,`Agafo tots els factors, comuns i no comuns.`,`MCM (${a}, ${b}) = ${mxPot(Fm)} = ${mxN(mxVal(Fm))}`],mal:3,
   per:["Dels factors comuns s'ha d'agafar l'exponent més gran, no el més petit","Al MCM només hi van els factors comuns","Els exponents s'havien de sumar"],
   bona:`MCM (${a}, ${b}) = ${mxPot(Fo)} = <b>${mxN(mxVal(Fo))}</b>`,pista:"Mira bé els exponents del resultat."}},
 mcd_nocomu(){let a,b,Fa,Fb;for(let k=0;k<200;k++){a=MX_T([12,18,20,24,30,36,40,42,60,72,84,90]);b=MX_T([8,15,16,27,28,32,35,45,50,54,63,75]);if(a===b)continue;Fa=mxFactors(a);Fb=mxFactors(b);const ks=[...new Set([...Object.keys(Fa),...Object.keys(Fb)])];if(mxMCD(a,b)>1&&ks.some(p=>!(Fa[p]&&Fb[p])))break}
  const ps=[...new Set([...Object.keys(Fa),...Object.keys(Fb)].map(Number))].sort((x,y)=>x-y),Fo={};ps.forEach(p=>{if(Fa[p]&&Fb[p])Fo[p]=Math.min(Fa[p],Fb[p])});
  const nc=ps.find(p=>!(Fa[p]&&Fb[p])),Fm={...Fo,[nc]:Fa[nc]||Fb[nc]};
  return {enun:`Calcula el MCD (${a}, ${b}).`,linies:[`${a} = ${mxPot(Fa)}`,`${b} = ${mxPot(Fb)}`,`Agafo els comuns, amb l'exponent més petit.`,`MCD (${a}, ${b}) = ${mxPot(Fm)} = ${mxN(mxVal(Fm))}`],mal:3,
   per:[`El ${nc} no el tenen tots dos nombres: al MCD només hi van els factors comuns`,"Al MCD s'agafa l'exponent més gran","El MCD sempre és 1"],
   bona:`MCD (${a}, ${b}) = ${mxPot(Fo)} = <b>${mxN(mxVal(Fo))}</b>`,pista:"Mira si tots els factors del resultat surten als dos nombres."}},
 escala_noprimer(){const n=MX_T([48,72,80,96,112,144,160,176,208,240]),ps=mxPrimersDe(n);// n = 2·4·… (té almenys tres 2)
  const mal=[2,4,...ps.slice(3)],l=mxEsc(n,mal);
  return {enun:`Descompon ${mxN(n)} en factors primers.`,linies:[...l,`${mxN(n)} = ${mal.join(" · ")}`],mal:1,
   per:["4 no és primer: a l'escala només hi van nombres primers","La divisió no és exacta","S'havia de començar pel 3"],
   bona:`${mxEsc(n,ps).join("<br>")}<br>${mxN(n)} = <b>${mxPot(mxFactors(n))}</b>`,pista:"Mira bé els nombres de la columna de la dreta."}},
 escala_divisio(){let n,ps,k,w,c;for(let t=0;t<200;t++){n=MX_T([60,84,90,126,132,150,156,168,180,198]);ps=mxPrimersDe(n);k=MX_R(0,ps.length-3);c=n;for(let i=0;i<=k;i++)c/=ps[i];w=c+2;if(w%2===0&&w!==c)break}
  const ant=c*ps[k],l=mxEsc(n,ps).slice(0,k+1),wps=mxPrimersDe(w);l.push(...mxEsc(w,wps));
  return {enun:`Descompon ${mxN(n)} en factors primers.`,linies:[...l,`${mxN(n)} = ${[...ps.slice(0,k+1),...wps].join(" · ")}`],mal:k+1,
   per:[`${mxN(ant)} : ${ps[k]} no fa ${w}, fa ${c}`,`${w} no es pot dividir per ${wps[0]}`,"S'havia de dividir per un nombre més gran"],
   bona:`${mxEsc(n,ps).join("<br>")}<br>${mxN(n)} = <b>${mxPot(mxFactors(n))}</b>`,pista:"Comprova cada divisió de l'escala."}},
 primer_u(){const p=MX_T([7,11,13,17,19,23]),q=MX_T([9,15,21,25,27,33]),dv=x=>mxDivisors(x).join(", ");
  const l=MX_B([`${p}: els seus divisors són ${dv(p)} → és primer.`,`${q}: els seus divisors són ${dv(q)} → és compost.`,`1: només es pot dividir per 1 → és primer.`,`2: els seus divisors són 1 i 2 → és primer.`]);
  return {enun:`Classifica 1, 2, ${p} i ${q} en primers i compostos.`,linies:l,mal:l.findIndex(x=>x.startsWith("1:")),
   per:["Un primer ha de tenir exactament dos divisors, i l'1 només en té un","L'1 és parell","Tots els nombres d'una xifra són primers"],
   bona:`1: només té un divisor → <b>no és ni primer ni compost</b>.`,pista:"Recorda la definició: quants divisors ha de tenir un nombre primer?"}},
 primer_fals(){const n=MX_T([51,57,87,93,111,117,123,129,141,159,177]),x=String(n).split(""),s=x.reduce((a,b)=>a+ +b,0);
  return {enun:`${n} és primer o compost?`,linies:[`${n} és senar → no és divisible per 2.`,`${x.join(" + ")} = ${s} → no és múltiple de 3 → no és divisible per 3.`,`No acaba en 0 ni en 5 → no és divisible per 5.`,`→ ${n} és primer.`],mal:1,
   per:[`${s} sí que és múltiple de 3: ${n} = 3 · ${n/3}`,`${n} és parell`,"El criteri del 3 mira l'última xifra"],
   bona:`${x.join(" + ")} = ${s} → <b>sí</b> és múltiple de 3 → ${n} = 3 · ${n/3} → ${n} és <b>compost</b>.`,pista:"Comprova els criteris un per un."}},
 divisors_falta(){const n=MX_T([24,30,36,40,48,60,72]),dv=mxDivisors(n),par=dv.filter(x=>x*x<=n),mig=dv.filter(x=>x!==1&&x!==n&&x*x!==n),tr=MX_T(mig),pa=Math.min(tr,n/tr);
  return {enun:`Escriu tots els divisors de ${n}.`,linies:[...par.map(x=>`${x} · ${n/x} = ${n}`),`Divisors de ${n}: ${dv.filter(x=>x!==tr).join(", ")}`],mal:par.length,
   per:[`Hi falta el ${tr}: surt a la parella ${pa} · ${n/pa}`,`Hi sobra el ${n}: un nombre no és divisor d'ell mateix`,"L'1 no és divisor de cap nombre"],
   bona:`Divisors de ${n}: <b>${dv.join(", ")}</b>`,pista:"Compara la llista final amb les parelles."}},
 criteri3(){let n;for(let k=0;k<200;k++){n=MX_R(102,9999);if(n%3===0&&n%10%3!==0)break}const x=String(n).split(""),u=+x[x.length-1],s=x.reduce((a,b)=>a+ +b,0);
  return {enun:`${mxN(n)} és divisible per 3?`,linies:[`Vull saber si ${mxN(n)} és divisible per 3.`,`Miro l'última xifra: és un ${u}.`,`${u} no és de la taula del 3.`,`→ ${mxN(n)} no és divisible per 3.`],mal:1,
   per:["Pel 3 s'han de sumar totes les xifres; l'última xifra només serveix per al 2, el 5 i el 10","L'última xifra és un 0","S'havia de mirar la primera xifra"],
   bona:`${x.join(" + ")} = ${s}, que és múltiple de 3 → ${mxN(n)} <b>sí</b> és divisible per 3.`,pista:"Quin criteri es fa servir per al 3?"}},
 problema_confon(){let a,b;for(let k=0;k<200;k++){const g=MX_T([2,3,4,6]);a=g*MX_R(2,6);b=g*MX_R(2,6);if(a!==b&&a%b&&b%a&&mxMCD(a,b)>1)break}if(a>b)[a,b]=[b,a];
  const g=mxMCD(a,b),m=mxMCM(a,b);
  if(Math.random()<.5)return {enun:`Dos autobusos surten junts. Un passa cada ${a} minuts i l'altre cada ${b}. D'aquí a quant tornaran a sortir junts?`,
   linies:[`Dades: ${a} min i ${b} min.`,`Volem saber quan tornen a coincidir → calculo el MCD.`,`MCD (${a}, ${b}) = ${g}`,`Tornaran a sortir junts d'aquí a ${g} minuts.`],mal:1,
   per:["«Tornar a coincidir» vol dir buscar un múltiple comú: és un problema de MCM","Les dades estan malament","S'havien de sumar els dos temps"],
   bona:`MCM (${a}, ${b}) = ${m} → tornaran a sortir junts d'aquí a <b>${m} minuts</b>.`,pista:"Què vol dir «tornar a coincidir»?"};
  return {enun:`Tenim dues cintes de ${a} cm i ${b} cm. Les volem tallar en trossos iguals, tan llargs com es pugui, sense que en sobri. Quant farà cada tros?`,
   linies:[`Dades: ${a} cm i ${b} cm.`,`Tallar en trossos iguals → calculo el MCM.`,`MCM (${a}, ${b}) = ${m}`,`Cada tros farà ${m} cm.`],mal:1,
   per:["Tallar en trossos iguals, tan llargs com es pugui, és buscar un divisor comú: és un problema de MCD","Les dades estan malament","S'havien de multiplicar les dues longituds"],
   bona:`MCD (${a}, ${b}) = ${g} → cada tros farà <b>${g} cm</b>.`,pista:"Un tros pot ser més llarg que la cinta?"}},
 multiple_reves(){const b=MX_R(3,12),k=MX_R(3,9),a=b*k;
  return {enun:`Fes la divisió ${a} : ${b} i digues què és cada nombre de l'altre.`,linies:[`${a} : ${b} = ${k}, i el residu és 0.`,`La divisió és exacta.`,`→ ${b} és múltiple de ${a}.`,`→ ${a} és divisible per ${b}.`],mal:2,
   per:[`És al revés: ${a} és múltiple de ${b}, i ${b} és divisor de ${a}`,"La divisió no és exacta",`${b} és més gran que ${a}`],
   bona:`→ ${a} és <b>múltiple</b> de ${b}, i ${b} és <b>divisor</b> de ${a}.`,pista:"El múltiple és el nombre gran; el divisor, el petit."}},
 // per a temes futurs
 jerarquia(){const a=MX_R(2,9),b=MX_R(2,9),c=MX_R(2,9);
  return {enun:`Calcula ${a} + ${b} · ${c}.`,linies:[`${a} + ${b} · ${c}`,`= ${a+b} · ${c}`,`= ${(a+b)*c}`],mal:1,
   per:["S'ha de multiplicar abans de sumar","S'havia de restar","La suma està mal feta"],bona:`${a} + ${b} · ${c} = ${a} + ${b*c} = <b>${a+b*c}</b>`,pista:"Quina operació va primer?"}},
 fraccio_den(){const b=MX_T([2,3,4,5]),d=MX_T([3,5,7].filter(x=>x!==b)),a=1,c=1,m=mxMCM(b,d);
  return {enun:`Calcula ${mxFr(a,b)} + ${mxFr(c,d)}.`,linies:[`${mxFr(a,b)} + ${mxFr(c,d)}`,`= ${mxFr(a+c,b+d)}`],mal:1,
   per:["Els denominadors no se sumen: primer s'han de posar amb el mateix denominador (el MCM)","S'havien de multiplicar els numeradors","Està bé"],
   bona:`${mxFr(a,b)} + ${mxFr(c,d)} = ${mxFr(a*m/b,m)} + ${mxFr(c*m/d,m)} = <b>${mxFr(a*m/b+c*m/d,m)}</b>`,pista:"Què passa amb els denominadors quan se sumen fraccions?"}}
};
let MXR=null;
function mxError(j){mxCss();mxCss2();const ts=MX_B(j.mx.error||Object.keys(MXE)).slice(0,j.mx.n||5);
 MXR={j,llista:ts.map(t=>{const E=MXE[t]();E.tipus=t;E.nom=MX_T(MX_NOMS);E.ord=MX_B([0,1,2]);return E}),e:0,fase:"linia",bones:0,errs:0,int:0,ep:[],fi:false};mxErrPinta()}
function mxErrPinta(){const {j,llista,e}=MXR,E=llista[e];MXR.fase="linia";MXR.int=0;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><div class="mx-cap"><span class="mx-ap">Exercici ${e+1} de ${llista.length}</span></div>
 <p>🔍 <b>${E.nom.charAt(0).toUpperCase()+E.nom.slice(1)}</b> ha fet aquest exercici i hi ha <b>un error</b>. Toca la primera línia que està malament.</p>
 <div class="mx-enun">${E.enun}</div><div class="mx-llib mx-err">${E.linies.map((l,i)=>`<button class="mx-lin" data-i="${i}" onclick="mxErrLin(${i})">${l}</button>`).join("")}</div><div id="mxFb"></div><div id="zona"></div></div>`}
function mxErrLin(i){if(!MXR||MXR.fase!=="linia")return;const E=MXR.llista[MXR.e],b=document.querySelector(`.mx-lin[data-i="${i}"]`),fb=document.getElementById("mxFb");
 if(i!==E.mal){MXR.errs++;MXR.int++;if(MXR.ep.length<40)MXR.ep.push(`error|${E.tipus}|linia`);if(b){b.classList.add("no");if(typeof sacseja==="function")sacseja(b)}
  fb.innerHTML=`<div class="fb" style="background:#fef2f2;border-color:#fecaca">Aquesta línia està bé. ${MXR.int>=2?"💡 "+E.pista:"Busca'n una altra."}</div>`;return}
 if(!MXR.int){MXR.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)}if(typeof so==="function")so("ok");
 if(b)b.classList.add("mal");MXR.fase="per";
 fb.innerHTML=`<div class="fb ok">🎯 L'has trobada! Ara: <b>per què està malament?</b></div><div class="mx-opc">${E.ord.map(k=>`<button onclick="mxErrPer(${k})">${E.per[k]}</button>`).join("")}</div>`}
function mxErrPer(k){if(!MXR||MXR.fase!=="per")return;const E=MXR.llista[MXR.e],bo=k===0;MXR.fase="fet";
 if(bo){MXR.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR);if(typeof so==="function")so("ok")}
 else{MXR.errs++;if(MXR.ep.length<40)MXR.ep.push(`error|${E.tipus}|per`);if(typeof so==="function")so("ko")}
 const ult=MXR.e+1>=MXR.llista.length;
 document.getElementById("mxFb").innerHTML=`<div class="fb ${bo?"ok":""}">${bo?"👏 Exacte!":"No ben bé."} ${E.per[0]}.</div><div class="mx-llib"><h4>📒 Com s'hauria d'escriure</h4>${E.bona}</div><div class="fila"><button class="btn" id="mxSeg" onclick="${ult?"mxErrFi()":"mxErrSeg()"}">${ult?"Acaba 🏁":"Següent exercici ▶"}</button></div>`}
function mxErrSeg(){MXR.e++;mxErrPinta();window.scrollTo(0,0)}
function mxErrFi(){const {j,bones,errs,llista}=MXR;MXR.fi=true;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>Has revisat <b>${llista.length} exercicis</b>: <b>${bones}</b> encerts i <b>${errs}</b> errors. Buscar els errors dels altres és una manera molt bona de no fer-los tu!</p><div id="zona"></div></div>`;
 fiJoc(j,Math.max(1,bones),errs,{mode:"error",ep:MXR.ep})}
function mxErrProva(j){mxError(j);let s=0;while(MXR&&!MXR.fi&&s++<100){const b=document.getElementById("mxSeg");if(b){b.click();continue}const E=MXR.llista[MXR.e];if(MXR.fase==="linia")mxErrLin(E.mal);else if(MXR.fase==="per")mxErrPer(0)}return MXR&&MXR.fi?true:"Troba l'error: no ha acabat"}

// ---------- PROVA AUTOMÀTICA (motor/prova.js): resol la fitxa o l'examen amb les respostes bones ----------
// Fitxes: prova els tres modes (mira → completa → sol) i també les preguntes «per què?». Examen: ha de donar un 10.
function mxProva(j){const fitxa=!j.mx.examen&&!j.mx.barreja;
 const resol=(mode)=>{if(fitxa)MX_MODE=mode;(j.mx.examen?mxExamen:mxFitxa)(j);mxComença(j.id,3);MX.forcaPq=true;let seg=0;
  while(MX&&!MX.fi&&seg++<800){const b=document.getElementById("mxSeg");if(b){b.click();continue}const P=MX.llista[MX.e].passos[MX.p];
   if(MX.perq){mxPerqueResp(P.perque.r);continue}
   if(P.t==="tria"){mxRespon(P.r);continue}
   if(P.t==="fact"){MX.f={...P.r};mxRespon();continue}
   MX.v=P.t==="llista"?P.r.join(", "):String(P.r);mxRespon()}
  return !!(MX&&MX.fi)};
 if(fitxa){MX_MODE="mira";mxFitxa(j);mxComença(j.id,2);let s=0;
  while(MX&&!MX.fi&&s++<300){const b=document.getElementById("mxSeg");if(!b)return "mode mira: no hi ha el botó de seguir";b.click()}
  if(!MX||!MX.fi||!document.querySelector(".mx-llib"))return "el mode mira no acaba amb la solució de llibreta";
  if(!resol("completa"))return "el mode completa no acaba";
  if(MX.bones<1||MX.errs)return "el mode completa no compta bé els passos";}
 const ok=resol("sol");MX_MODE="sol";
 if(!ok)return "no ha acabat";
 if(MX.errs)return `hi ha ${MX.errs} errors amb les respostes bones`;
 if(j.mx.examen&&!/10/.test(document.querySelector(".mx-nota").textContent))return "l'examen perfecte no dona un 10";
 return true}

// ===================== 🔁 REPÀS DELS ERRORS DEL TALLER (Bona Nota 2.0) =====================
// Cada exercici amb algun pas fallat (fitxes, repàs barrejat i examen) entra al repàs dels errors del món: un per generador i nivell.
// Al repàs es fa un exercici NOU del mateix tipus i nivell (números nous). Si el fa sense cap error ni pista, compta com a recordat
// i avança de capsa (avui → 3 dies → 7 dies → après, +2 ⭐). Els passos del repàs no donen estrella.
function mxRepClau(gs,nv){return JSON.stringify(gs)+"|"+nv}
function mxRepErr(E,P,c){if(typeof repAnotaExt!=="function"||!MX||E.gs===undefined||MX.mode==="control"||MX.mode==="mira")return;
 if(!MXG[mxNomG(E.gs)])return;const nv=E.nv||MX.nv;repAnotaExt("mx",mxRepClau(E.gs,nv),{g:E.gs,nv,pas:(P&&(P.id||P.t))||"",codi:c||"-"},false)}
// nom per a la llista del repàs: la fitxa del Taller d'on surt aquell tipus d'exercici
function mxRepNom(g){const jj=(ASSIG.jocs||[]).filter(x=>x.fn==="mxFitxa"&&x.mx&&Array.isArray(x.mx.tipus)),gj=JSON.stringify(g);
 const j=jj.find(x=>x.mx.tipus.some(t=>JSON.stringify(t)===gj))||jj.find(x=>x.mx.tipus.some(t=>mxNomG(t)===mxNomG(g)));
 return j?`${j.ic||"✏️"} ${j.titol}`:"✏️ Taller de mates"}
function mxRepas(items,fi){mxCss();mxCss2();
 const j={id:"rp-taller",titol:"🔁 Repàs del Taller",mx:{}};
 const llista=items.map(r=>{const nv=r.nv||2,E=Array.isArray(r.g)?MXG[r.g[0]](nv,r.g[1]):MXG[r.g](nv);E.g=mxNomG(r.g);E.gs=r.g;E.nv=nv;return E});
 const jst=typeof JOCSTAR!=="undefined"?JOCSTAR:0;JOCSTAR=0;
 MX={j,nv:llista[0].nv,ex:false,mode:"barreja",llista,e:0,p:0,v:"",f:{},int:0,ajut:0,bones:0,errs:0,resp:[],ok:{},fi:false,apFet:false,ep:[],pistes:0,pq:0,pqb:0,
  pre:llista.map(()=>0),errE:[],ajutE:[],rep:true};
 MX.onFi=()=>{MX.fi=true;JOCSTAR=jst;fi(llista.map((E,i)=>!(MX.errE[i]||MX.ajutE[i])))};
 mxIniciaApartat();mxPinta();window.scrollTo(0,0)}
(window.BN_REP_TIPUS=window.BN_REP_TIPUS||{}).mx={ic:"✏️",max:3,titol:"Ara, exercicis del Taller que et van costar",
 peu:"Números nous, el mateix tipus d'exercici. Si el fas sense cap error ni pista, compta com a recordat.",
 valid:r=>r.g!==undefined&&typeof MXG!=="undefined"&&!!MXG[mxNomG(r.g)],
 nom:r=>`${mxRepNom(r.g)} · ${["","🟢 Bàsic","🟡 Mitjà","🔴 D'examen"][r.nv||2]}`,
 juga:mxRepas};
// prova automàtica (motor/prova.js): un pas fallat entra al repàs; al repàs, un exercici nou fet bé el passa a la capsa 1
function mxRepProva(){const repAbans=JSON.stringify(S.rep||{}),apAbans=S.apresos||0;
 try{const fx=(ASSIG.jocs||[]).find(x=>x.fn==="mxFitxa"&&x.mx&&Array.isArray(x.mx.tipus));if(!fx)return true;
  const g=fx.mx.tipus[0];S.rep={};
  MX_MODE="sol";mxFitxa(fx);mxComença(fx.id,1);const P=MX.llista[0].passos[0];
  if(P.t==="tria")mxRespon((P.r+1)%P.op.length);else if(P.t==="fact"){MX.f={7:9};mxRespon()}else{MX.v="999999";mxRespon()}
  const k="mx|"+mxRepClau(g,1);if(!S.rep[k])return "el pas fallat no ha entrat al repàs";
  if(!repPendents().some(x=>x.tipus==="mx"))return "el repàs no veu l'error del Taller";
  repas();const b=document.getElementById("repSeg");if(!b)return "el repàs no ofereix els exercicis del Taller";b.click();
  if(!MX||!MX.rep)return "el repàs no ha obert el Taller";
  let seg=0;while(MX&&!MX.fi&&seg++<400){const s=document.getElementById("mxSeg");if(s){s.click();continue}const Q=MX.llista[MX.e].passos[MX.p];
   if(MX.perq){mxPerqueResp(Q.perque.r);continue}if(Q.t==="tria"){mxRespon(Q.r);continue}if(Q.t==="fact"){MX.f={...Q.r};mxRespon();continue}
   MX.v=Q.t==="llista"?Q.r.join(", "):String(Q.r);mxRespon()}
  const r2=S.rep[k];if(!r2||r2.c!==1)return `després del repàs, la capsa hauria de ser 1 (és ${r2?r2.c:"fora"})`;
  if(REPAS)return "el repàs no s'ha tancat";
  if(!/recordats/.test(app.textContent))return "no surt el resum del repàs";
  return true}finally{REPAS=false;S.rep=JSON.parse(repAbans);S.apresos=apAbans;desa()}}
if(typeof window!=="undefined")(window.BN_PROVES=window.BN_PROVES||[]).push("mxRepProva");
