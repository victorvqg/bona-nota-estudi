// Bona Nota · genera el MAPA interactiu de les 43 comarques (camins SVG) i l'escriu a motor/dades/comarques.js
// entre les marques «// MAPA:inici» i «// MAPA:fi».
// Font de les geometries: límits municipals de github.com/sirisacademic/catalonia-cartography (cat-municipis.json,
// derivat de l'ICGC/Idescat). Les comarques s'obtenen ajuntant municipis; el Lluçanès (2023) són els 8 municipis
// que van sortir d'Osona: Alpens, Lluçà, Olost, Oristà, Perafita, Prats de Lluçanès, Sant Martí d'Albars i Sobremunt
// (Sant Feliu Sasserra va tornar al Bages el juny de 2023).
// Ús: npm i topojson-client topojson-simplify d3-geo polylabel@1 ; node mapa-comarques.js /camí/cat-municipis.json
const fs=require('fs'),path=require('path');
const tc=require('topojson-client'),ts=require('topojson-simplify'),d3=require('d3-geo'),polylabel=require('polylabel');
let topo=JSON.parse(fs.readFileSync(process.argv[2]));
topo=ts.simplify(ts.presimplify(topo),ts.quantile(ts.presimplify(topo),0.35));
const geoms=topo.objects.municipis.geometries;
// codis Idescat antics (ordre alfabètic, 42 = Moianès) → nom
const IDN=["","Alt Camp","Alt Empordà","Alt Penedès","Alt Urgell","Alta Ribagorça","Anoia","Bages","Baix Camp","Baix Ebre","Baix Empordà","Baix Llobregat","Baix Penedès","Barcelonès","Berguedà","Cerdanya","Conca de Barberà","Garraf","Garrigues","Garrotxa","Gironès","Maresme","Montsià","Noguera","Osona","Pallars Jussà","Pallars Sobirà","Pla d'Urgell","Pla de l'Estany","Priorat","Ribera d'Ebre","Ripollès","Segarra","Segrià","Selva","Solsonès","Tarragonès","Terra Alta","Urgell","Vall d'Aran","Vallès Occidental","Vallès Oriental","Moianès"];
const LLU=["Alpens","Lluçà","Olost","Oristà","Perafita","Prats de Lluçanès","Sant Martí d'Albars","Sobremunt"];
const dadesF=path.join(__dirname,'..','dades','comarques.js');let dades=fs.readFileSync(dadesF,'utf8');
const COM=eval(dades.match(/const COM=(\[.*?\]\]);/)[1]); // [n,nom,capital,demarcació]
const comDe=g=>LLU.includes(g.properties.nom)?"Lluçanès":IDN[g.properties.comarca];
geoms.forEach(g=>{g.properties.c=comDe(g);if(!COM.find(c=>c[1]===g.properties.c))throw "sense comarca: "+g.properties.nom});
const tot=tc.merge(topo,geoms);
const W=600,H=640,proj=d3.geoMercator().fitExtent([[6,6],[W-6,H-6]],tot),pth=d3.geoPath(proj);
const r1=x=>Math.round(x*10)/10;
const curt=d=>d.replace(/\d+\.\d+/g,m=>String(r1(+m))).replace(/\.0(?=\D)/g,'');
const MUNI={"Vielha":"Vielha e Mijaran"}; // capital → nom del terme municipal
const norm=s=>s.toLowerCase().replace(/^(el|la|les|l')\s*/,'');
const out=COM.map(([n,nom,cap,dem])=>{
 const gs=geoms.filter(g=>g.properties.c===nom),f=tc.merge(topo,gs);
 const d=curt(pth(f));
 // punt de l'etiqueta: dins del polígon més gran
 const polys=(f.type==="Polygon"?[f.coordinates]:f.coordinates).map(p=>p.map(r=>r.map(proj)));
 const area=p=>Math.abs(p[0].reduce((a,q,i,arr)=>{const r=arr[(i+1)%arr.length];return a+q[0]*r[1]-r[0]*q[1]},0));
 const gran=polys.sort((a,b)=>area(b)-area(a))[0];const lab=polylabel(gran,0.5);
 // capitals: centre del terme municipal de cada capital
 const caps=cap.split(/ i (?=Terrassa)/).map(c=>{const m=geoms.find(g=>norm(g.properties.nom)===norm(MUNI[c]||c));if(!m)throw "capital no trobada: "+c;
   const [x,y]=pth.centroid(tc.feature(topo,m));return [r1(x),r1(y)]});
 return [n,d,r1(lab[0]),r1(lab[1]),caps];
});
const dem=COM.reduce((o,c)=>(o[c[1]]=c[3],o),{});
const prov=curt(pth(tc.mesh(topo,topo.objects.municipis,(a,b)=>a!==b&&dem[a.properties.c]!==dem[b.properties.c])));
const vora=curt(pth(tc.mesh(topo,topo.objects.municipis,(a,b)=>a===b)));
const js=`// MAPA:inici (generat per motor/eines/mapa-comarques.js · no editar a mà)\nconst MAPA={w:${W},h:${H},c:${JSON.stringify(out)},prov:${JSON.stringify(prov)},vora:${JSON.stringify(vora)}};\n// MAPA:fi`;
if(/\/\/ MAPA:inici[\s\S]*?\/\/ MAPA:fi/.test(dades))dades=dades.replace(/\/\/ MAPA:inici[\s\S]*?\/\/ MAPA:fi/,()=>js);else dades+="\n"+js+"\n";
fs.writeFileSync(dadesF,dades);console.log("MAPA:",js.length,"bytes ·",out.length,"comarques");
