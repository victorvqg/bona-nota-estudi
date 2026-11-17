// Prova les vistes de mates (motor/eines/vistes-mates.js) amb casos límit, sense navegador.
//   node motor/prova-vistes-mates.js      (surt amb 1 si alguna vista no dibuixa el que toca)
const { MXV, mxVistaTema } = require("./eines/vistes-mates.js");
let mal = 0;
const ok = (nom, cond, h) => { if (!cond) { mal++; console.log(`✗ ${nom}\n   ${String(h).slice(0, 300)}`); } };
const compta = (h, re) => (h.match(re) || []).length;
// xifres
let h = MXV.xifres(975, "ult", true); ok("xifres ult: només l'última marcada", compta(h, /class="mk"/g) === 1 && /<span class="mk">5<\/span>/.test(h), h);
h = MXV.xifres(975, "ult", false); ok("xifres sense marca", !/class="mk"/.test(h), h);
h = MXV.xifres(741, "suma", true, 12); ok("xifres suma amb el resultat", /7 \+ 4 \+ 1 = <b>12<\/b>/.test(h) && compta(h, /class="mk"/g) === 3, h);
h = MXV.xifres(1243, "alt"); ok("xifres 11: llocs alterns des de la dreta", /<span class="b">1<\/span><span class="a">2<\/span><span class="b">4<\/span><span class="a">3<\/span>/.test(h), h);
// escala
const files = [[60, 2], [30, 2], [15, 3], [5, 5]];
h = MXV.escala(files, 2, { mk: true, err: 4 }); ok("escala: fila 15 activa, criteri del 3 i el 4 en vermell", /class="act"><span>15<\/span><b>\?<\/b>/.test(h) && /El 3:/.test(h) && /class="ko">4</.test(h), h);
h = MXV.escala(files, 4); ok("escala acabada en 1 sense tira", /<span>1<\/span>/.test(h) && !/mxv-tira/.test(h), h);
h = MXV.escala([[7, 7]], 0, { mk: true }); ok("escala d'un primer sol (7): prova la taula", /prova la taula: 7 · 1 = 7/.test(h), h);
h = MXV.escala([[1024, 2]], 0, { mk: true }); ok("escala amb punt de milers", /1\.024/.test(h), h);
// potències alineades
const F12 = { 2: 2, 3: 1 }, F18 = { 2: 1, 3: 2 }, F7 = { 7: 1 };
h = MXV.potencies([[12, F12], [18, F18]], "MCD", true); ok("MCD (12, 18): marca 3 (del 12) i 2 (del 18)", compta(h, /class="com mk"/g) === 2 && /com mk">3</.test(h) && /com mk">2</.test(h), h);
h = MXV.potencies([[12, F12], [18, F18]], "MCM", true); ok("MCM (12, 18): marca 2² i 3²", /com mk">2²</.test(h) && /com mk">3²</.test(h) && compta(h, /mk"/g) === 2, h);
h = MXV.potencies([[12, F12], [7, F7]], "MCD", true); ok("MCD sense comuns: cap marca", !/mk"/.test(h), h);
h = MXV.potencies([[12, F12], [7, F7]], "MCM", true); ok("MCM amb el 7 de només un: marcat", /buit">—|mk">7</.test(h) && compta(h, /mk"/g) === 3, h);
h = MXV.potencies([[1024, { 2: 10 }], [6, { 2: 1, 3: 1 }]], "MCM", true); ok("exponent de dues xifres", /2¹⁰/.test(h), h);
// parelles, proves, taula, recta, rajola
h = MXV.parelles(36, Infinity); ok("parelles de 36 (fins a 6 · 6)", /<b>6<\/b> · <b>6<\/b>/.test(h) && compta(h, /<span><b>/g) === 5, h);
h = MXV.parelles(36, 2); ok("parelles retallades amb …", /…/.test(h), h);
h = MXV.proves(91); ok("91 = 7 · 13: la prova del 7 és exacta", /91 : 7 ✔ exacta/.test(h) && !/: 11/.test(h), h);
h = MXV.proves(97); ok("97 primer: cap exacta, fins a 9", !/exacta/.test(h) && /fins a 9/.test(h), h);
h = MXV.taula(7, 20, 50); ok("taula del 7 entre 20 i 50", /7 · 3 = 21/.test(h) && /7 · 7 = 49/.test(h), h);
h = MXV.recta(4, 6, 12); ok("recta fins a 12 sense passar", /<svg/.test(h) && !/>24</.test(h), h);
h = MXV.rajola(60, 45); ok("rajola gran sense quadrícula", /<svg/.test(h) && !/<line/.test(h), h);
// teoria
for (const v of [{ tipus: "escala", n: 60 }, { tipus: "potencies", a: 12, b: 18, quin: "MCD" }, { tipus: "xifres", n: 741, d: 3 }, { tipus: "parelles", n: 36 }])
  ok(`vista de tema ${v.tipus}`, /mxv-tema/.test(mxVistaTema(v)), mxVistaTema(v));
ok("vista de tema desconeguda: res", mxVistaTema({ tipus: "x" }) === "", "");
h = mxVistaTema({ tipus: "escala", n: 60 }); ok("tema escala 60 = 2² · 3 · 5", /2² · 3 · 5/.test(h), h);
if (mal) { console.log(`✗ prova-vistes-mates: ${mal} errors`); process.exit(1); }
console.log("✓ prova-vistes-mates: totes les vistes dibuixen el que toca");
