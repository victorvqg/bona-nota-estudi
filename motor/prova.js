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
 // qualitat del banc de preguntes (avisos, no errors)
 const q=await p.evaluate(()=>{const st=s=>String(s).replace(/<[^>]+>/g,'').length;let tot=0,llarga=0;const pocs=[];
  T.forEach(t=>{if(t.q.length<8)pocs.push(t.id+'('+t.q.length+')');t.q.forEach(x=>{tot++;const L=x[1].map(st),c=L[x[2]];if(c===Math.max(...L)&&L.filter(l=>l===c).length===1)llarga++})});
  return {tot,llarga,pc:Math.round(llarga*100/tot),pocs}});
 console.log(`banc: ${q.tot} preguntes · correcta = opció més llarga en el ${q.pc}% (ideal entre 15 i 40%)`+(q.pocs.length?` · temes amb menys de 8 preguntes: ${q.pocs.join(', ')}`:''));
 if(process.env.ESTRICTE&&(q.pc>40||q.pc<15||q.pocs.length))errs.push('banc de preguntes per sota del mínim');
 // cada tema: fitxa, targetes, test perfecte
 for(let i=0;i<info.temes;i++){
  await p.evaluate(i=>{aturaSeg();obre(i)},i);await p.evaluate(()=>{pest='targetes';pintaTema()});await p.evaluate(()=>{pest='test';pintaTema()});
  const n=await p.evaluate(()=>Math.min(tema.q.length,NTEST));
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
  else if(t==='custom'){const ok=await p.evaluate(id=>{const j=ASSIG.jocs.find(x=>x.id===id);return j.prova?window[j.prova](j):'sense prova'},id);if(ok!==true)errs.push(`joc ${id}: ${ok}`);else{const fet=await p.evaluate(id=>id in S.jocs,id);if(!fet)errs.push(`joc ${id}: no ha cridat fiJoc`)}}
  else if(t==='figura'){const n=await p.evaluate(id=>ASSIG.jocs.find(j=>j.id===id).q.length,id);for(let k=0;k<n;k++){await p.locator('.opt').first().click();await p.click('#seg')}}
  await tanca();
 }
 // examen de veritat: 10 preguntes encertades → nota 10
 await p.evaluate(()=>{aturaSeg();joc('examreal')});await p.click('#exGo');
 for(let k=0;k<10;k++){await p.evaluate(()=>{const q=EXR.qs[EXR.k];[...document.querySelectorAll('.opt')].find(o=>+o.dataset.i===q[2]).click()});await p.waitForTimeout(300)}
 await p.click('#exFi');await tanca();
 const nota=await p.evaluate(()=>document.querySelector('.ex-nota')?.textContent||'');if(!/^10/.test(nota))errs.push('examen de veritat: nota '+nota);
 // efectes suaus i descans
 await p.evaluate(()=>{canviaSuau()});const su=await p.evaluate(()=>document.body.classList.contains('suau'));await p.evaluate(()=>canviaSuau());
 await p.evaluate(()=>{descans()});const dsc=await p.locator('.descans').count();await p.click('#dSalta');
 if(!su||dsc!==1)errs.push('suau/descans: '+su+' '+dsc);
 console.log(`examen de veritat: ${nota} · efectes suaus i descans ok`);
 const jocsFets=await p.evaluate(()=>Object.keys(S.jocs).join(","));
 // repàs espaiat: falla 2 preguntes del primer tema i després repassa-les encertant
 await p.evaluate(()=>{aturaSeg();obre(0);pest='test';pintaTema()});
 for(let k=0;k<Math.min(await p.evaluate(()=>tema.q.length),6);k++){await p.evaluate(k=>{const q=tema.q.find(x=>x[0]===document.querySelector('.pregunta').innerHTML);const o=[...document.querySelectorAll('.opt')].find(o=>(k<2)?+o.dataset.i!==q[2]:+o.dataset.i===q[2]);o.click()},k);await p.click('#seg')}
 await tanca();
 const r0=await p.evaluate(()=>repPendents().length);
 await p.evaluate(()=>{aturaSeg();repas()});
 for(let k=0;k<r0;k++){await p.evaluate(()=>{const q=T.flatMap(t=>t.q).find(x=>x[0]===document.querySelector('.pregunta').innerHTML);[...document.querySelectorAll('.opt')].find(o=>+o.dataset.i===q[2]).click()});await p.click('#seg')}
 await tanca();
 const r1=await p.evaluate(()=>[repPendents().length,repTots().length,repTots().every(r=>r.c===1)]);
 if(r0<2||r1[0]!==0||r1[1]!==r0||!r1[2])errs.push(`repàs: abans ${r0}, després ${r1}`);
 console.log(`repàs: ${r0} errors → repassats, ara pendents ${r1[0]} (tornaran d'aquí a 3 dies)`);
 await p.evaluate(()=>{aturaSeg();joc('examen')});for(let k=0;k<15;k++){await p.locator('.opt').first().click();await p.click('#seg')}
 await p.evaluate(()=>{const a=document.querySelector('.arc');if(a)a.click();obertes(0)});await p.fill('#resp','Resposta de prova prou llarga per comprovar-ho tot.');await p.click('#veu');await p.check('.pk >> nth=0');await p.click('#nota');
 await p.evaluate(()=>vista('analitica'));await p.screenshot({path:f.replace(/\.html$/,'_analitica.png'),fullPage:true});
 await p.evaluate(()=>vista('inici'));await p.screenshot({path:f.replace(/\.html$/,'_inici.png')});
 const nv=await p.evaluate(()=>[nivell(S.punts).n,window.NIVELLS_MOSTRATS||0]);if(nv[0]<2||nv[1]<1)errs.push('nivells: '+nv);
 console.log(`nivell ${nv[0]} · level up mostrats ${nv[1]} · jocs fets ${jocsFets} · examens ${await p.evaluate(()=>S.examens.length)} · errors:`,errs.length?errs:'cap');
 await b.close();process.exit(errs.length?1:0);
})();
