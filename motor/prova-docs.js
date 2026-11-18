// Prova que la documentació no es quedi enrere respecte del motor (sense navegador).
// Pla docs/superpowers/specs/2026-11-18-readme-changelog-motor-pla-mestre.md (fase 3). Comprova:
//   1) cada eina de motor/eines/*.js surt al README (apartat 5, «Eines») i a docs/ARQUITECTURA.md;
//   2) cada prova de motor/ (prova*.js, prova*.py) surt a l'apartat 10 del README (la taula de proves);
//   3) el CHANGELOG només fa servir els apartats Afegit, Canviat, Corregit i Eliminat;
//   4) la capçalera del README diu la mateixa versió que la primera entrada del CHANGELOG (la posa motor/tot.py).
//   node motor/prova-docs.js      (surt amb 1 si falta alguna cosa, i diu què i on)
const fs = require("fs"), path = require("path");
const arrel = path.join(__dirname, "..");
const llegeix = f => fs.readFileSync(path.join(arrel, f), "utf8");
const readme = llegeix("README.md"), arq = llegeix("docs/ARQUITECTURA.md"), canvis = llegeix("CHANGELOG.md");
let mal = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { mal++; console.log("  ✗", msg) } };
const tros = (t, ini, fi) => { const i = t.indexOf(ini), j = fi ? t.indexOf(fi, i + 1) : -1; return i < 0 ? "" : t.slice(i, j < 0 ? undefined : j) };

console.log("1) Eines de motor/eines/");
const eines = fs.readdirSync(path.join(__dirname, "eines")).filter(f => f.endsWith(".js")).sort();
const rEines = tros(readme, "### Eines (`motor/eines/`)", "\n### ");
const aEines = tros(arq, "## Eines compartides", "\n## ");
const senseR = eines.filter(f => !rEines.includes("`" + f + "`")), senseA = eines.filter(f => !aEines.includes("`" + f + "`"));
ok(rEines && !senseR.length, `les ${eines.length} eines surten a l'apartat «Eines» del README` + (senseR.length ? ` (falten: ${senseR.join(", ")})` : ""));
ok(aEines && !senseA.length, `les ${eines.length} eines surten a «Eines compartides» de docs/ARQUITECTURA.md` + (senseA.length ? ` (falten: ${senseA.join(", ")})` : ""));

console.log("2) Proves de motor/");
const proves = fs.readdirSync(__dirname).filter(f => /^prova.*\.(js|py)$/.test(f)).sort();
const r10 = tros(readme, "## 10. ", "\n## 11. ");
const senseP = proves.filter(f => !r10.includes(f));
ok(r10 && !senseP.length, `les ${proves.length} proves surten a l'apartat 10 del README` + (senseP.length ? ` (falten: ${senseP.join(", ")})` : ""));

console.log("3) Apartats del CHANGELOG");
const BONS = new Set(["Afegit", "Canviat", "Corregit", "Eliminat"]);
const dolents = [...canvis.matchAll(/^### (.+)$/gm)].map(m => m[1].trim()).filter(t => !BONS.has(t));
ok(!dolents.length, "el CHANGELOG només fa servir Afegit, Canviat, Corregit i Eliminat" + (dolents.length ? ` (també: ${[...new Set(dolents)].join(", ")})` : ""));

console.log("4) Versió");
const vC = (canvis.match(/^## (\d+\.\d+\.\d+)\b/m) || [])[1], vR = (readme.match(/\*\*Versió:\*\* (\d+\.\d+\.\d+)/) || [])[1];
ok(vC && vC === vR, `la capçalera del README (${vR}) i el CHANGELOG (${vC}) diuen la mateixa versió` + (vC !== vR ? ": executa python3 motor/tot.py" : ""));

console.log(mal ? `\n✗ ${mal} comprovacions de documentació fallades` : "\n✓ La documentació està al dia amb el motor");
process.exit(mal ? 1 : 0);
