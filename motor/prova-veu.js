// Prova la veu bilingüe (trossos i veuLexic de la plantilla) amb les dades del món d'Anglès, sense navegador.
//   node motor/prova-veu.js            (surt amb 1 si algun cas no sona en la llengua esperada)
const fs = require("fs"), path = require("path");
const plant = fs.readFileSync(path.join(__dirname, "plantilla-estudi-interactiu.html"), "utf8");
const bloc = plant.slice(plant.indexOf("// >>> veu-bilingue"), plant.indexOf("// <<< veu-bilingue"));
if (!bloc) { console.error("✗ no trobo el bloc veu-bilingue a la plantilla"); process.exit(1); }
const V = new Function(bloc + ";return {trossos, veuLexic}")();
const g = { document: { getElementById: () => ({}), createElement: () => ({}), head: { appendChild: () => {} } }, window: {}, location: { search: "" } };
const D = new Function("document", "window", "location", fs.readFileSync(path.join(__dirname, "dades/angles.js"), "utf8") + ";return {ASSIG,T,OB}")(g.document, g.window, g.location);
const lex = V.veuLexic(D.ASSIG, D.T), CA = "ca-ES", EN = "en-GB";
const so = h => V.trossos(h, CA, EN, lex);
const llengua = (h, frag) => { const s = so(h).find(x => x.t.toLowerCase().includes(frag.toLowerCase())); return s ? s.lang : "(no hi és)"; };
let mal = 0;
const cas = (nom, h, esperat) => {
  for (const [frag, l] of esperat) {
    const r = llengua(h, frag);
    if (r !== l) { mal++; console.log(`✗ ${nom}: «${frag}» sona ${r} i hauria de sonar ${l}\n   ${JSON.stringify(so(h))}`); }
  }
};
const adj1 = D.T.find(t => t.id === "adj1");
cas("revers de targeta en anglès", "She's got curly hair.", [["curly hair", EN]]);
cas("revers amb plurals", "people · men · women", [["people", EN], ["women", EN]]);
cas("pregunta de test en anglès", "My grandad is 85. He's…", [["grandad", EN], ["He's", EN]]);
cas("pregunta en català amb paraula en negreta", "Quin és el contrari de <b>tall</b>?", [["Quin", CA], ["tall", EN]]);
cas("punt de la fitxa", adj1.pts[3], [["Els cabells", CA], ["curly", EN], ["arrissat", CA], ["straight", EN], ["llis", CA]]);
cas("punt de la fitxa amb frase anglesa", adj1.pts[5], [["Dues maneres", CA], ["She's got curly hair", EN]]);
cas("compte de la fitxa", adj1.compte, [["vol dir dues coses", CA], ["Her hair is red", EN]]);
cas("enunciat d'oberta", D.OB[0].q, [["Write the opposite", EN], ["Escriu el contrari", CA]]);
cas("resposta model en anglès", D.OB[3].m, [["The children are playing", EN], ["Recorda", CA]]);
cas("explicació de frase", "<b>Hair</b> va en singular: Her hair <b>is</b>…, mai «are».", [["Hair", EN], ["va en singular", CA]]);
cas("marca lang", 'Diu <span lang="en">Hola</span> i prou', [["Hola", EN], ["Diu", CA]]);
cas("lletra en català", 'Quin és el contrari? <span lang="ca">A</span>: short', [["short", EN]]);
cas("targeta del davant", "El contrari de curly?", [["El contrari", CA], ["curly", EN]]);
cas("fitxa amb traduccions entre parèntesis", adj1.pts[1], [["fat", EN], ["gras", CA], ["prim", CA]]);
cas("resposta model amb regles", D.OB[2].m, [["dancing", EN], ["perd la e", CA]]);
cas("enunciat en català d'oberta", D.OB[8].q, [["Com es diu", CA]]);
cas("«I» en català", "I hair va en singular.", [["va en singular", CA]]);
cas("«I» en anglès", "Quina és bona? I really like comics.", [["really like comics", EN], ["Quina", CA]]);
// tots els textos es parteixen sense petar i no deixen trossos buits
let n = 0;
for (const t of D.T) for (const x of [t.titol, t.idea, t.truc, t.compte, ...t.pts, ...t.fc.flat(), ...t.q.map(q => q[0])]) { const r = so(x); n++; if (r.some(s => !s.t)) { mal++; console.log("✗ tros buit:", x); } }
if (mal) { console.log(`✗ prova-veu: ${mal} errors`); process.exit(1); }
console.log(`✓ prova-veu: tots els casos sonen bé (${n} textos del món d'Anglès partits)`);
