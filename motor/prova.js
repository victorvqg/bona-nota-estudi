// Prova automàtica d'un estudi interactiu: node prova.js fitxer.html
const {chromium}=require('playwright');
(async()=>{
 const f=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:860}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const tanca=async()=>{for(let r=0;r<4;r++){await p.evaluate(()=>document.querySelectorAll('.arc').forEach(a=>a.click()));await p.waitForTimeout(350)}};
 await p.goto('file://'+f);await p.fill('#nom','Prova');await p.click('#fn button');
 // dades bàsiques
 const info=await p.evaluate(()=>({temes:T.length,ob:OB.length,jocs:ASSIG.jocs.map(j=>j.id+':'+j.tipus),blocs:ASSIG.blocs.reduce((a,b)=>a+b.n,0),
   malament:T.flatMap(t=>t.q.filter(q=>!(q[2]>=0&&q[2]<q[1].length)).map(q=>t.id+': '+q[0])),fcBuides:T.filter(t=>!t.fc.length||!t.q.length).map(t=>t.id)}));
 console.log(JSON.stringify(info));
 if(info.blocs!==info.temes)errs.push(`blocs sumen ${info.blocs} però hi ha ${info.temes} temes`);
 if(info.malament.length)errs.push('respostes fora de rang: '+info.malament.join(' | '));
 // cada tema: fitxa, targetes, test perfecte
 for(let i=0;i<info.temes;i++){
  await p.evaluate(i=>{aturaSeg();obre(i)},i);await p.evaluate(()=>{pest='targetes';pintaTema()});await p.evaluate(()=>{pest='test';pintaTema()});
  const n=await p.evaluate(()=>tema.q.length);
  for(let k=0;k<n;k++){await p.evaluate(()=>{const q=tema.q.find(x=>x[0]===document.querySelector('.pregunta').innerHTML)||tema.q.find(x=>document.querySelector('.pregunta').textContent===x[0].replace(/<[^>]+>/g,''));const o=[...document.querySelectorAll('.opt')].find(o=>+o.dataset.i===q[2]);o.click()});await p.click('#seg');}
  await tanca();
 }
 const aprov=await p.evaluate(()=>T.filter(t=>millor(t.id)===100).length);
 if(aprov!==info.temes)errs.push(`només ${aprov}/${info.temes} temes amb 100%`);
 // jocs
 for(const id of await p.evaluate(()=>ASSIG.jocs.map(j=>j.id))){
  await p.evaluate(id=>{aturaSeg();joc(id)},id);
  const t=await p.evaluate(id=>ASSIG.jocs.find(j=>j.id===id).tipus,id);
  if(t==='ordena'){const it=await p.evaluate(id=>ASSIG.jocs.find(j=>j.id===id).items.map(x=>x[0]),id);for(const x of it)await p.evaluate(x=>[...document.querySelectorAll('#xips .chip')].find(c=>c.textContent===x).click(),x)}
  else if(t==='parelles'){const ps=await p.evaluate(id=>ASSIG.jocs.find(j=>j.id===id).pars,id);for(const [a,c] of ps){await p.evaluate(([a,c])=>{[...document.querySelectorAll('#esq .chip')].find(x=>x.textContent===a).click();[...document.querySelectorAll('#dre .chip')].find(x=>x.textContent===c).click()},[a,c])}}
  else if(t==='classifica'){const it=await p.evaluate(id=>ASSIG.jocs.find(j=>j.id===id).items,id);for(const [fr,k] of it){await p.evaluate(([fr,k])=>{[...document.querySelectorAll('#fr .chip')].find(x=>x.textContent===fr).click();document.querySelector(`.cub[data-k="${k}"]`).click()},[fr,k])}}
  else if(t==='figura'){const n=await p.evaluate(id=>ASSIG.jocs.find(j=>j.id===id).q.length,id);for(let k=0;k<n;k++){await p.locator('.opt').first().click();await p.click('#seg')}}
  await tanca();
 }
 const jocsFets=await p.evaluate(()=>Object.keys(S.jocs).length);
 await p.evaluate(()=>{aturaSeg();joc('examen')});for(let k=0;k<15;k++){await p.locator('.opt').first().click();await p.click('#seg')}
 await p.evaluate(()=>{const a=document.querySelector('.arc');if(a)a.click();obertes(0)});await p.fill('#resp','Resposta de prova prou llarga per comprovar-ho tot.');await p.click('#veu');await p.check('.pk >> nth=0');await p.click('#nota');
 await p.evaluate(()=>vista('analitica'));await p.screenshot({path:f.replace(/\.html$/,'_analitica.png'),fullPage:true});
 await p.evaluate(()=>vista('inici'));await p.screenshot({path:f.replace(/\.html$/,'_inici.png')});
 const nv=await p.evaluate(()=>[nivell(S.punts).n,window.NIVELLS_MOSTRATS||0]);if(nv[0]<2||nv[1]<1)errs.push('nivells: '+nv);
 console.log(`nivell ${nv[0]} · level up mostrats ${nv[1]} · jocs fets ${jocsFets} · examens ${await p.evaluate(()=>S.examens.length)} · errors:`,errs.length?errs:'cap');
 await b.close();process.exit(errs.length?1:0);
})();
