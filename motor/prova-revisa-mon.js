// Prova del revisor de contingut (motor/revisa-mon.js): troba cada error típic i no en troba cap als mons de veritat.
//   node motor/prova-revisa-mon.js
const fs = require("fs"), path = require("path");
const { revisaFont, revisaMon } = require("./revisa-mon");
let errors = 0;
const ok = (c, msg) => { console.log((c ? "  ✓ " : "  ✗ ") + msg); if (!c) errors++; };

// Món mínim vàlid: 1 tema de 8 preguntes (la correcta és la més llarga en 2 de 8 = 25 %), un joc de cada tipus i un boss a mida.
const qs = [0, 1, 2, 3, 4, 5, 6, 7].map(i => i < 2
  ? `["Pregunta ${i}?",["opció bona llarga","opció dos","opció tres"],0,"perquè"]`
  : `["Pregunta ${i}?",["curta","opció llarga dos","opció tres"],0,"perquè"]`).join(",");
const VALID = {
  assig: `const ASSIG={id:"prova",blocs:[{titol:"B",n:1}],jocs:[
    {id:"ord",tipus:"ordena",items:[["A","",""],["B","",""]]},
    {id:"cla",tipus:"classifica",caixes:[["x","X"],["y","Y"]],items:[["u","x"],["v","y"]]},
    {id:"par",tipus:"parelles",pars:[["a","1"],["b","2"]]},
    {id:"fig",tipus:"figura",figura:"svgProva",q:[["Q?",["a","b","c"],1,"e"]]},
    {id:"err",tipus:"error",exercicis:[{id:"e1",linies:["l0","l1"],mal:1,per:["a","b","c"],t:"tria",q:"Q",op:["x","y"],r:1,llibreta:["l0","L1"],ok:[1]}]}
  ]};`,
  t: `const T=[{id:"t1",titol:"Tema u",font:"Esquema",q:[${qs}]}];`,
  ob: `const OB=[{t:"Tema u",q:"Explica-ho",p:["idea"],m:"model"}];`,
  fig: `function svgProva(){return '<svg viewBox="0 0 10 10"></svg>'}`,
  boss: `ASSIG.boss={nom:"B",fx:"explosio",pix:Array(16).fill("....KKKKMMmm....")};`
};
const font = (canvis = {}) => { const v = Object.assign({}, VALID, canvis); return [v.assig, v.t, v.ob, v.fig, v.boss].join("\n"); };
const troba = (src, re) => revisaFont(src).errors.some(e => re.test(e));

console.log("1) un món ben fet no té errors");
{ const r = revisaFont(font()); ok(r.errors.length === 0, "món mínim vàlid: 0 errors" + (r.errors.length ? " · " + r.errors.join(" | ") : "")); }

console.log("2) cada error típic es detecta");
ok(troba(font({ t: VALID.t.replace(/,\["Pregunta 7\?"[^\]]*\][^\]]*\]/, "") }), /mínim 8/), "un tema amb 7 preguntes");
ok(troba(font({ t: VALID.t.replace('["curta","opció llarga dos","opció tres"],0', '["curta","opció llarga dos"],0') }), /3 opcions/), "una pregunta amb 2 opcions");
ok(troba(font({ t: VALID.t.replace('"opció tres"],0,"perquè"]', '"opció tres"],5,"perquè"]') }), /fora de rang/), "la correcta fora de rang");
ok(troba(font({ t: VALID.t.replace('["curta","opció llarga dos","opció tres"]', '["curta","curta","opció tres"]') }), /opcions repetides/), "dues opcions iguals");
ok(troba(font({ t: VALID.t.replace('"Pregunta 3?"', '"Pregunta 2?"') }), /preguntes repetides/), "dues preguntes iguals al mateix tema");
ok(troba(font({ assig: VALID.assig.replace("n:1", "n:2") }), /blocs/), "els blocs no sumen els temes");
ok(troba(font({ ob: VALID.ob.replace('p:["idea"],', '') }), /OB/), "una oberta sense idees clau");
ok(troba(font({ assig: VALID.assig.replace('["B","",""]', '["A","",""]') }), /repetit/), "ítems repetits a ordena");
ok(troba(font({ assig: VALID.assig.replace('["v","y"]', '["v","z"]') }), /caixa/), "classifica amb una caixa que no existeix");
ok(troba(font({ assig: VALID.assig.replace('["b","2"]', '["b","1"]') }), /parelles repetides/), "parelles repetides");
ok(troba(font({ assig: VALID.assig.replace('figura:"svgProva"', 'figura:"svgNoHiEs"') }), /figura/), "una figura que no és cap funció");
ok(troba(font({ fig: "function svgProva(){return '<div></div>'}" }), /figura/), "una figura que no torna un <svg>");
ok(troba(font({ assig: VALID.assig.replace("mal:1", "mal:9") }), /mal/), "un exercici «error» amb la línia dolenta fora de rang");
ok(troba(font({ assig: VALID.assig.replace('per:["a","b","c"]', 'per:["a","b"]') }), /per/), "un exercici «error» sense 3 motius");
ok(troba(font({ boss: 'ASSIG.boss={nom:"B",fx:"explosio",pix:Array(16).fill("....KKKKMMmm...")};' }), /pix/), "un sprite de boss que no fa 16×16");
ok(troba(font({ boss: 'ASSIG.boss={nom:"B",fx:"explosio",pix:Array(16).fill("....KKKKMMmmNN..")};' }), /pix/), "un sprite de boss amb un color que no és de la paleta");
ok(troba(font({ t: VALID.t.replace(/\["curta","opció llarga dos","opció tres"\]/g, '["opció bona llarga","opció dos","opció tres"]') }), /15 i el 40/), "la correcta és la més llarga massa sovint (100 %)");
ok(troba(font({ t: VALID.t.replace(/\["opció bona llarga","opció dos","opció tres"\]/g, '["curta","opció llarga dos","opció tres"]') }), /15 i el 40/), "la correcta no és mai la més llarga (0 %)");

console.log("3) els mons de motor/mons.json no tenen errors");
for (const m of JSON.parse(fs.readFileSync(path.join(__dirname, "mons.json"), "utf8"))) {
  const r = revisaMon(m.dades); ok(r.errors.length === 0, `${m.dades}: 0 errors` + (r.errors.length ? " · " + r.errors.slice(0, 3).join(" | ") : ""));
}

console.log(errors ? `\n✗ ${errors} comprovacions han fallat` : "\n✓ prova-revisa-mon: el revisor troba els errors i els mons hi passen");
process.exit(errors ? 1 : 0);
