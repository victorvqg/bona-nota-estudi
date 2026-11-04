// ===================== ✏️ TALLER DE MATES (motor/eines/exercicis-mates.js) =====================
// Exercicis com els de l'escola: el nen ESCRIU el resultat (teclat numèric), pas a pas com a la llibreta,
// amb números nous cada vegada (generadors), apartats a) b) c) d), avisos dels errors típics,
// la solució «com s'escriu a la llibreta» i un examen simulat sobre 10 amb nota parcial per passos.
// S'inclou a les dades d'un món amb la línia  //@inclou eines/exercicis-mates.js  (ho fa build.py).
// Joc d'una fitxa:  {id:"fx-…",tipus:"custom",fn:"mxFitxa",prova:"mxProva",mx:{tipus:["criteri",…],n:4}, …}
// Examen:           {id:"ex-mates",tipus:"custom",fn:"mxExamen",prova:"mxProva",mx:{examen:[["criteri",1],…]}, …}
// Cada generador rep el nivell (1 bàsic, 2 mitjà, 3 d'examen) i retorna {enun, passos:[…], sol}.
// Pas: {t:"num"|"llista"|"tria"|"fact", q, r (resposta), op (tria), primers (fact), w (pes a l'examen),
//       err(v) → missatge de l'error típic (o null), ctx() → HTML que es pinta sobre el pas (p. ex. l'escala)}.

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
   passos.push({t:"num",q:`Suma les xifres de <b>${mxN(n)}</b>.`,r:suma,
    err:v=>`Suma xifra a xifra: ${x.join(" + ")}. Revisa el compte.`});
   passos.push({t:"tria",q:`Mira si la suma és múltiple de ${d}. Llavors, ${mxN(n)} és divisible per ${d}?`,op:["Sí, és divisible","No, no és divisible"],r:si?0:1,
    err:()=>si?`${suma} = ${d} · ${suma/d}: sí que és múltiple de ${d}.`:`${suma} no és a la taula del ${d} (${d}, ${2*d}, ${3*d}, ${4*d}…).`});
   sol=`${mxN(n)} → ${x.join(" + ")} = ${suma}<br>${suma} ${si?"<b>és</b>":"<b>no és</b>"} múltiple de ${d}<br>→ ${mxN(n)} <b>${si?"SÍ":"NO"}</b> és divisible per ${d}.`;
  }else if(d===11){
   const r=[...x].reverse(),sen=r.filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0),par=r.filter((_,i)=>i%2===1).reduce((a,b)=>a+b,0),dif=Math.abs(sen-par);
   passos.push({t:"num",q:`Per l'11: suma les xifres de lloc senar (començant per la dreta) i, a part, les de lloc parell. Quant dona la diferència (la gran menys la petita)?`,r:dif,
    err:()=>`Llocs senars (des de la dreta): ${r.filter((_,i)=>i%2===0).join(" + ")} = ${sen}. Llocs parells: ${r.filter((_,i)=>i%2===1).join(" + ")||0} = ${par}.`});
   passos.push({t:"tria",q:`Llavors, ${mxN(n)} és divisible per 11?`,op:["Sí, és divisible","No, no és divisible"],r:si?0:1,
    err:()=>`Ha de donar 0 o un múltiple d'11 (11, 22…). Aquí dona ${dif}.`});
   sol=`${mxN(n)} → senars: ${sen} · parells: ${par}<br>${Math.max(sen,par)} − ${Math.min(sen,par)} = ${dif}<br>→ ${mxN(n)} <b>${si?"SÍ":"NO"}</b> és divisible per 11.`;
  }else{
   const u=x[x.length-1];
   passos.push({t:"tria",q:`Per saber si <b>${mxN(n)}</b> és divisible per ${d}, en quina xifra t'has de fixar?`,op:["En l'última xifra","En la primera xifra","En la suma de totes les xifres"],r:0,
    err:v=>v===2?`La suma de les xifres és el criteri del 3 i del 9. Per ${d} només mires l'última.`:`La primera xifra no diu res. Mira com acaba el nombre.`});
   const regla={2:"acaba en 0, 2, 4, 6 o 8",5:"acaba en 0 o en 5",10:"acaba en 0"}[d];
   passos.push({t:"tria",q:`${mxN(n)} acaba en <b>${u}</b>. És divisible per ${d}?`,op:["Sí, és divisible","No, no és divisible"],r:si?0:1,
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
    passos:[{t:"num",q:`Divideix ${mxN(m)} : ${b}. Quin és el quocient (sense decimals)?`,r:q,err:()=>`${b} · ${q} = ${mxN(b*q)} i ${b} · ${q+1} = ${mxN(b*(q+1))}. Quin cap dins de ${mxN(m)}?`},
     {t:"num",q:`Ara multiplica ${b} pel següent nombre (${q} + 1). Quin és el múltiple?`,r,err:v=>v===q*b?`${mxN(q*b)} és més petit que ${mxN(m)}: has d'agafar el següent.`:`${b} · ${q+1} = ?`}],
    sol:`${mxN(m)} : ${b} = ${q} i en sobren ${res}<br>${b} · ${q} = ${mxN(q*b)} (encara no arriba)<br>${b} · ${q+1} = <b>${mxN(r)}</b> → és el primer múltiple de ${b} després de ${mxN(m)}.`};
  }
  const b=nv===1?MX_R(3,9):nv===2?MX_R(6,15):MX_R(11,25);
  const a=MX_R(2,nv===1?8:12)*b-MX_R(1,b-1),c=a+b*MX_R(3,5)+MX_R(0,b-1);
  const r=[];for(let k=Math.ceil(a/b)*b;k<=c;k+=b)r.push(k);
  return {enun:`Escriu tots els <b>múltiples de ${b}</b> compresos entre <b>${a}</b> i <b>${c}</b>.`,
   passos:[{t:"llista",q:`Escriu-los separats per comes (toca «,» entre nombre i nombre).`,r,
    err:v=>{const no=v.filter(x=>x%b);if(no.length)return `${no[0]} no és múltiple de ${b}: ${no[0]} : ${b} no és exacta.`;
     const fora=v.filter(x=>x<a||x>c);if(fora.length)return `${fora[0]} és múltiple de ${b}, però no és entre ${a} i ${c}.`;
     const f=r.filter(x=>!v.includes(x));return f.length?`Molt bé els que has posat, però ${f.length===1?"en falta 1":`en falten ${f.length}`}. Ves sumant ${b}: ${r[0]}, ${r[0]+b}…`:null}}],
   sol:`Taula del ${b}: … ${r.map((x,i)=>`${b} · ${x/b} = ${x}`).join(" · ")}<br>Entre ${a} i ${c}: <b>${mxLlista(r)}</b>`};
 },
 // 🧩 Divisors (per parelles)
 divisors(nv){
  const n=MX_T(nv===1?[12,18,20,24,28,30,16,32]:nv===2?[36,40,42,45,48,54,60,72,80]:[84,90,96,100,108,120,126,144,150]);
  const r=mxDivisors(n),par=r.filter(x=>x*x<=n).map(x=>`${x} · ${n/x}`);
  return {enun:`Escriu <b>tots els divisors de ${n}</b>.`,
   passos:[{t:"llista",q:`Escriu-los de petit a gran, separats per comes. Truc: busca'ls per parelles (1 · ${n}, 2 · …).`,r,
    err:v=>{const no=v.filter(x=>n%x);if(no.length){const x=no[0];return `${x} no és divisor de ${n}: ${n} : ${x} = ${Math.floor(n/x)} i en sobren ${n%x}.`}
     if(!v.includes(1)||!v.includes(n))return `Recorda: l'1 i el mateix ${n} sempre són divisors de ${n}.`;
     const f=r.filter(x=>!v.includes(x));return f.length?`${f.length===1?"En falta 1":`En falten ${f.length}`}. Fes les parelles: ${par.slice(0,2).join(", ")}…`:null}}],
   sol:`Parelles: ${par.join(" · ")}<br>Divisors de ${n}: <b>${mxLlista(r)}</b> (${r.length} divisors)`};
 },
 // 💎 Primer o compost
 primer(nv){
  const prim=nv===1?[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47]:nv===2?[53,59,61,67,71,73,79,83,89,97,101,103]:[101,107,109,113,127,131,137,139,149,151,157,163,173,191,197,199,211];
  const comp=nv===1?[9,15,21,25,27,33,35,39,45,49]:nv===2?[51,57,63,69,77,81,87,91,93,99,111,119]:[119,121,133,143,161,169,187,203,209,221,247,253];
  const n=Math.random()<.5?MX_T(prim):MX_T(comp),p=mxEsPrimer(n),d=n===1?1:(()=>{for(let k=2;k*k<=n;k++)if(n%k===0)return k})();
  const lim=Math.floor(Math.sqrt(n)),prova=[2,3,5,7,11,13,17].filter(x=>x<=lim);
  const passos=[{t:"tria",q:`Prova de dividir ${mxN(n)} per 2, 3, 5, 7… Què és ${mxN(n)}?`,op:["Primer","Compost"],r:p?0:1,
   err:()=>p?`Prova-ho: ${mxN(n)} no és divisible per ${prova.join(", ")||"cap primer"}. No cal provar més enllà de ${lim} (perquè ${lim+1} · ${lim+1} ja passa de ${mxN(n)}).`:`Compte! ${mxN(n)} = ${d} · ${n/d}. Té més divisors que l'1 i ell mateix.`}];
  if(!p)passos.push({t:"num",q:`Demostra-ho: escriu un divisor de ${mxN(n)} que no sigui ni 1 ni ${mxN(n)}.`,r:d,ok:v=>v>1&&v<n&&n%v===0,
   err:v=>v===1||v===n?`L'1 i el ${mxN(n)} no compten: tots els nombres els tenen.`:`${mxN(n)} : ${v} no és exacta. Prova amb ${d}.`});
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
   passos.push({t:"num",q:`Per quin <b>primer</b> divideixes ${mxN(a)}?`,r:p,ctx:()=>pinta(k),
    err:v=>a%v?`${mxN(a)} no és divisible per ${v}. ${p===2?"És parell!":p===3?"Suma'n les xifres…":p===5?"Mira com acaba…":`Prova amb el ${p}.`}`
     :!mxEsPrimer(v)?`${v} no és primer: a l'escala només hi van nombres primers (2, 3, 5, 7, 11…).`
     :`Funciona, però a classe es comença sempre pel primer més petit que hi va: prova amb el ${p}.`});
   passos.push({t:"num",q:`Quant dona ${mxN(a)} : ${p}?`,r:a/p,ctx:()=>pinta(k).replace(/<b>\?<\/b><\/div><\/div>$/,`<b>${p}</b></div></div>`),
    err:v=>`Revisa la divisió: ${p} · ${v} = ${mxN(p*v)}, no ${mxN(a)}.`});
  });
  passos.push({t:"fact",q:`Ja has arribat a 1! Ara escriu ${mxN(n)} amb <b>potències</b>: quantes vegades has dividit per cada primer?`,r:F,primers:[2,3,5,7,11],ctx:()=>pinta(files.length),
   err:v=>{for(const p of [2,3,5,7,11]){const a=v[p]||0,b=F[p]||0;if(a!==b)return b?`Compta les vegades que hi ha el ${p} a l'escala: hi surt ${b} ${b>1?"vegades":"vegada"}.`:`A l'escala no hi ha cap ${p}.`}return null}});
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
  const desc=(n,F)=>({t:"fact",q:`Descompon ${n} en factors primers (fes l'escala a la llibreta).`,r:F,primers:pr,w:1,
   err:v=>{const x=mxVal(v);return x===n?null:`El que has posat fa ${mxPot(v)} = ${mxN(x)}, no ${n}. Revisa l'escala.`}});
  const taula=()=>`<div class="mx-taula">${a} = ${mxPot(Fa)}<br>${b} = ${mxPot(Fb)}</div>`;
  return {enun:`Calcula el <b>${quin} (${a}, ${b})</b> descomponent els nombres.`,
   passos:[desc(a,Fa),desc(b,Fb),
    {t:"tria",q:`Quins factors agafes per al ${quin}?`,op:["Només els comuns, amb l'exponent més petit","Tots (comuns i no comuns), amb l'exponent més gran","Només els comuns, amb l'exponent més gran"],r:quin==="MCD"?0:1,ctx:taula,
     err:v=>quin==="MCD"?(v===1?"Això és el MCM. El MCD (el divisor més gran) només pot tenir el que tenen tots dos.":"Comuns sí, però amb l'exponent MÉS PETIT: el MCD ha de cabre dins de tots dos.")
      :(v===0?"Això és el MCD. El MCM (el múltiple més petit) ha de contenir els dos nombres sencers.":"Al MCM hi van TOTS els factors, també els que només té un dels dos.")},
    {t:"fact",q:`Escriu el ${quin} amb potències.`,r:Fr,primers:pr,ctx:taula,w:2,
     err:v=>{for(const p of pr){const x=Fa[p]||0,y=Fb[p]||0,e=v[p]||0,bo=Fr[p]||0;if(e===bo)continue;
      if(quin==="MCD"){if(!x||!y)return e?`El ${p} només és a un dels dos nombres: al MCD no hi va.`:null;return e>bo?`Al MCD l'exponent del ${p} és el MÉS PETIT (${p}${MX_SUP[x]||""} i ${p}${MX_SUP[y]||""}).`:`Del ${p}, agafa l'exponent més petit, però no el treguis.`}
      if(!e)return `Al MCM hi van TOTS els factors: et falta el ${p}.`;return e<bo?`Al MCM l'exponent del ${p} és el MÉS GRAN.`:`Massa ${p}: agafa l'exponent més gran que surt, no el sumis.`}return null}},
    {t:"num",q:`Ara calcula'l: quant val el ${quin} (${a}, ${b})?`,r,ctx:taula,w:2,err:v=>`Fes la multiplicació amb calma: ${mxPot(Fr)}.`}],
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
   {t:"llista",q:`1️⃣ <b>Dades.</b> Quins dos nombres necessites per resoldre'l? (Compte: n'hi ha un que no serveix.)`,r:[a,b],w:1,
    err:v=>v.includes(extra)||v.includes(extra*10)?`El ${v.includes(extra)?extra:extra*10} és una dada de més: no té res a veure amb la pregunta.`:`Busca els dos nombres en negreta que es repeteixen o es reparteixen.`},
   {t:"tria",q:`2️⃣ <b>Què he de calcular?</b>`,op:["El MCM (mínim comú múltiple)","El MCD (màxim comú divisor)"],r:mcm?0:1,w:1,err:()=>`Pista: ${clau}.`},
   {t:"num",q:`3️⃣ <b>Calcula</b> el que has decidit al pas 2. Quin resultat et dona?`,r:m,w:2,
    err:v=>v===(mcm?mxMCD(a,b):mxMCM(a,b))?`Aquest és el ${mcm?"MCD":"MCM"}! Has de calcular el ${mcm?"MCM":"MCD"}.`:`Descompon: ${a} = ${mxPot(mxFactors(a))} i ${b} = ${mxPot(mxFactors(b))}.`},
   {t:"tria",q:`4️⃣ <b>Resposta.</b> Quina frase respon bé la pregunta (amb la unitat)?`,op:ord.map(i=>frases[i]),r:ord.indexOf(0),w:1,
    err:()=>`Torna a llegir la pregunta: què et demana exactament, i en quina unitat?`}],
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

// Pantalla inicial: tria el nivell
function mxInici(j,examen){mxCss();MX=null;
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>${examen?"Un examen com el del profe: <b>6 exercicis</b>, nota <b>sobre 10</b>. No et diré si vas bé fins al final. Si el procediment és bo però t'equivoques al resultat, tens part del punt.":`Una fitxa com les de classe: <b>${j.mx.n} apartats</b> (a, b, c…). Escriu els resultats amb el teclat i fes els passos a la llibreta. Cada vegada surten números nous.`}</p>
 <p><b>Tria el nivell:</b></p><div class="mx-niv"><button class="btn sec" onclick="mxComença('${j.id}',1)">🟢 Bàsic</button><button class="btn sec" onclick="mxComença('${j.id}',2)">🟡 Mitjà</button><button class="btn" onclick="mxComença('${j.id}',3)">🔴 D'examen</button></div><div id="zona"></div></div>`}
function mxFitxa(j){mxInici(j,false)}
function mxExamen(j){mxInici(j,true)}
function mxComença(id,nv){const j=ASSIG.jocs.find(x=>x.id===id),ex=!!j.mx.examen;let llista;
 if(ex)llista=j.mx.examen.map(([g,p])=>{const e=MXG[g](nv);e.punts=p;return e});
 else{const t=j.mx.tipus;llista=[...Array(j.mx.n)].map((_,i)=>{const g=t[i%t.length];return Array.isArray(g)?MXG[g[0]](nv,g[1]):MXG[g](nv)})}
 MX={j,nv,ex,llista,e:0,p:0,v:"",f:{},int:0,bones:0,errs:0,resp:[],ok:{},fi:false,apFet:false};mxPinta()}
const MX_LL="abcdefghij";
function mxPinta(){const {j,llista,e,p,ex}=MX,E=llista[e],P=E.passos[p];
 const fets=E.passos.slice(0,p).map((x,i)=>`<div class="mx-fet">${ex?"✏️":"✅"} ${x.q.replace(/<[^>]+>/g,"").slice(0,70)}${x.q.length>70?"…":""} → <b>${mxMostra(x,(MX.resp[e]||[])[i])}</b></div>`).join("");
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box">
 <div class="mx-cap"><span class="mx-ap">${ex?`Exercici ${e+1} de ${llista.length} · ${String(E.punts).replace(".",",")} punt${E.punts===1?"":"s"}`:`Apartat ${MX_LL[e]}) de ${llista.length}`}</span><span class="prog">${["","🟢 Bàsic","🟡 Mitjà","🔴 D'examen"][MX.nv]}</span></div>
 <div class="mx-enun"><b>${ex?e+1+".":MX_LL[e]+")"}</b> ${E.enun}</div>${fets}
 <div class="mx-pas">${P.ctx?`<div style="text-align:center">${P.ctx()}</div>`:""}<div>${P.q}</div><div id="mxFb"></div>${mxEntrada(P)}</div>
 <div id="zona"></div></div>`;MX.v="";MX.f={};MX.int=0;mxVista()}
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
function mxRespon(i){if(!MX||MX.fi||MX.apFet||MX.esp)return;const E=MX.llista[MX.e],P=E.passos[MX.p],v=mxLlegeix(P,i),fb=document.getElementById("mxFb");
 if(P.t!=="tria"&&(v===null||(P.t==="llista"&&!v.length)||(P.t==="fact"&&!Object.keys(v).length))){fb.innerHTML=`<div class="fb">✏️ Primer escriu la resposta.</div>`;return}
 (MX.resp[MX.e]=MX.resp[MX.e]||[])[MX.p]=v;const bo=mxBo(P,v);
 if(MX.ex){(MX.ok=MX.ok||{})[MX.e+"_"+MX.p]=bo;if(typeof so==="function")so("clic");return mxSeg()}
 if(bo){if(!MX.int){MX.bones++;if(typeof suma==="function"&&typeof JOCSTAR!=="undefined"&&JOCSTAR)suma(JOCSTAR)}if(typeof so==="function")so("ok");return mxSeg()}
 MX.errs++;MX.int++;const pas=document.querySelector(".mx-pas");if(pas&&typeof sacseja==="function")sacseja(pas);
 const msg=(P.err&&P.err(v))||"No és correcte. Torna-ho a mirar.";
 if(MX.int>=2){(MX.resp[MX.e])[MX.p]=P.r;fb.innerHTML=`<div class="fb">❌ ${msg}<br>👉 La resposta és <b>${mxMostra(P,P.r)}</b>. Apunta-te-la i seguim.</div><div class="fila"><button class="btn" onclick="mxSeg()">D'acord, seguim ▶</button></div>`;MX.esp=true;return}
 fb.innerHTML=`<div class="fb" style="background:#fef2f2;border-color:#fecaca">❌ ${msg}</div>`}
function mxSeg(){const E=MX.llista[MX.e];MX.esp=false;
 if(MX.p+1<E.passos.length){MX.p++;return mxPinta()}
 if(MX.ex){if(MX.e+1<MX.llista.length){MX.e++;MX.p=0;return mxPinta()}return mxFiExamen()}
 // apartat acabat: solució de llibreta
 const ult=MX.e+1>=MX.llista.length;MX.apFet=true;
 app.querySelector(".mx-pas").outerHTML=`<div class="fb ok">✅ Apartat ${MX_LL[MX.e]}) fet!</div><div class="mx-llib"><h4>📒 Així s'escriu a la llibreta</h4>${E.sol}</div>`;
 document.getElementById("zona").innerHTML=`<div class="fila"><button class="btn" id="mxSeg" onclick="${ult?"mxFiFitxa()":"mxApartat()"}">${ult?"Acaba la fitxa 🏁":`Apartat ${MX_LL[MX.e+1]}) ▶`}</button></div>`}
function mxApartat(){MX.apFet=false;MX.e++;MX.p=0;mxPinta();window.scrollTo(0,0)}
function mxFiFitxa(){MX.fi=true;const {j,bones,errs}=MX;
 if(typeof registra==="function")registra("joc",{joc:j.id,titol:j.titol,pc:Math.round(100*bones/Math.max(1,bones+errs)),nivell:MX.nv});
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><p>Has fet els <b>${MX.llista.length} apartats</b>: <b>${bones}</b> passos bé a la primera${errs?` i <b>${errs}</b> errors`:""}.</p><div id="zona"></div></div>`;
 fiJoc(j,Math.max(1,bones),errs)}
function mxFiExamen(){MX.fi=true;const {j,llista}=MX;let nota=0;
 const fil=llista.map((E,e)=>{const tw=E.passos.reduce((a,P)=>a+(P.w||1),0),bw=E.passos.reduce((a,P,p)=>a+(MX.ok[e+"_"+p]?(P.w||1):0),0);
  const pts=Math.round(E.punts*bw/tw*4)/4;nota+=pts;return {E,e,pts}});
 nota=Math.round(nota*100)/100;const n10=Math.round(nota*10);
 const col=nota>=9?"#16a34a":nota>=7?"#2563eb":nota>=5?"#d97706":"#dc2626",txt=nota>=9?"Excel·lent":nota>=7?"Notable":nota>=6?"Bé":nota>=5?"Suficient":"Insuficient";
 if(typeof registra==="function")registra("examen",{joc:j.id,nota,nivell:MX.nv});
 app.innerHTML=`<h2 class="sec">${j.enunciat||j.titol}</h2><div class="box"><div class="mx-nota" style="color:${col}">${String(nota).replace(".",",")}</div><p style="text-align:center;font-weight:900;margin:0">${txt} · nota sobre 10</p>
 <table class="mx-pts"><tr><th>Exercici</th><th>Punts</th></tr>${fil.map(({E,e,pts})=>`<tr><td>${e+1}. ${E.enun.replace(/<[^>]+>/g,"").slice(0,60)}…</td><td><b>${String(pts).replace(".",",")}</b> / ${String(E.punts).replace(".",",")}</td></tr>`).join("")}</table>
 <h3 style="margin-top:18px">📒 Correcció</h3>${fil.map(({E,e,pts})=>`<div class="mx-llib"><h4>Exercici ${e+1} · ${String(pts).replace(".",",")} / ${String(E.punts).replace(".",",")}</h4><div style="font-family:Nunito,system-ui,sans-serif;font-size:15px;margin-bottom:6px">${E.enun}</div>
  ${E.passos.map((P,p)=>`<div style="font-family:Nunito,system-ui,sans-serif;font-size:14.5px">${MX.ok[e+"_"+p]?"✅":"❌"} ${P.q.replace(/<[^>]+>/g,"").slice(0,80)} → tu: <b>${mxMostra(P,(MX.resp[e]||[])[p])}</b>${MX.ok[e+"_"+p]?"":` · bona: <b>${mxMostra(P,P.r)}</b>`}</div>`).join("")}
  <div style="margin-top:6px">${E.sol}</div></div>`).join("")}<div id="zona"></div></div>`;
 fiJoc(j,Math.max(1,n10),100-n10);
 document.getElementById("zona").innerHTML=`<div class="fb ${nota>=5?"ok":""}">${nota>=5?"🎉 Aprovat!":"💪 Encara no: repassa els exercicis amb ❌ i torna-hi."} Mira la correcció de dalt: és com la del profe.</div><div class="fila"><button class="btn" onclick="joc('${j.id}')">Un altre examen</button><button class="btn sec" onclick="vista('jocs')">Altres jocs</button></div>`}
// teclat físic (ordinador)
if(typeof addEventListener!=="undefined")addEventListener("keydown",e=>{if(!MX||MX.fi||MX.apFet||!document.getElementById("mxDisp"))return;
 if(/^[0-9]$/.test(e.key))mxTecla(e.key);else if(e.key===","||e.key===" ")mxTecla(",");else if(e.key==="Backspace")mxTecla("⌫");else if(e.key==="Enter"){e.preventDefault();MX.esp?mxSeg():mxRespon()}else return;e.preventDefault()});

// ---------- PROVA AUTOMÀTICA (motor/prova.js): resol la fitxa o l'examen amb les respostes bones ----------
function mxProva(j){(j.mx.examen?mxExamen:mxFitxa)(j);mxComença(j.id,3);let seg=0;
 while(MX&&!MX.fi&&seg++<500){const b=document.getElementById("mxSeg");if(b){b.click();continue}const P=MX.llista[MX.e].passos[MX.p];
  if(P.t==="tria"){mxRespon(P.r);continue}
  if(P.t==="fact"){MX.f={...P.r};mxRespon();continue}
  MX.v=P.t==="llista"?P.r.join(", "):String(P.r);mxRespon()}
 if(!MX||!MX.fi)return "no ha acabat";
 if(j.mx.examen&&!/10/.test(document.querySelector(".mx-nota").textContent))return "l'examen perfecte no dona un 10";
 return true}
