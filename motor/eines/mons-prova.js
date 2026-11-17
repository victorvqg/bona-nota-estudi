// Per a les proves: quants mons hi ha i quins són surt de motor/mons.json, així un món nou no trenca cap prova.
//   const { N, ids, nou, vell, catalegXat } = require("./eines/mons-prova");
//   N: nombre de mons · ids: del més nou al més antic · nou / vell: el primer i l'últim · catalegXat(): {XAT_FR, XAT_PC} d'index.html
const fs = require("fs"), path = require("path"), vm = require("vm");
const arrel = path.join(__dirname, "..", "..");
const mons = JSON.parse(fs.readFileSync(path.join(arrel, "motor", "mons.json"), "utf8"));
const ids = mons.map(m => m.dades).reverse();
function catalegXat() {
  const h = fs.readFileSync(path.join(arrel, "index.html"), "utf8"), a = h.indexOf("/* XAT-CATALEG:inici"), b = h.indexOf("/* XAT-CATALEG:fi */");
  return vm.runInNewContext(h.slice(a, b) + "\n;({XAT_FR, XAT_PC})", {});
}
module.exports = { N: ids.length, ids, nou: ids[0], vell: ids[ids.length - 1], catalegXat };
