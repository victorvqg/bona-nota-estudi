// Prova pura (sense navegador): motor/mons.json és l'única font de cada món, i el que en genera motor/tot.py coincideix.
//   node motor/prova-mons.js
// Comprova: camps de cada entrada (curt, spr, xat), ids de peça únics i < 1001, el bloc MONS-ADMIN d'admin/index.html,
// BN_MON de sprites.js i les peces de món del xat a index.html (XAT-MONS) i a supabase/bn_xat.sql.
const fs = require("fs"), path = require("path"), vm = require("vm");
const arrel = path.join(__dirname, "..");
const llegeix = f => fs.readFileSync(path.join(arrel, f), "utf8");
let errors = 0;
const ok = (c, msg) => { console.log((c ? "  ✓ " : "  ✗ ") + msg); if (!c) errors++; };
const bloc = (txt, ini, fi) => { const a = txt.indexOf(ini), b = txt.indexOf(fi); return a >= 0 && b > a ? txt.slice(a + ini.length, b) : null; };

const mons = JSON.parse(llegeix("motor/mons.json"));
const ids = mons.map(m => m.dades), nouAVell = ids.slice().reverse();
const ctx = { window: {}, document: { createElement: () => ({}) } };
vm.runInNewContext(llegeix("sprites.js") + "\n;this.BN_SPR=BN_SPR;this.BN_MON=BN_MON;", ctx);

console.log("1) camps de cada món a motor/mons.json");
const totsXat = [];
for (const m of mons) {
  ok(typeof m.curt === "string" && m.curt.trim() !== "", `${m.dades}: té «curt» (${m.curt})`);
  ok(typeof m.spr === "string" && !!ctx.BN_SPR[m.spr], `${m.dades}: «spr» existeix a BN_SPR (${m.spr})`);
  ok(Array.isArray(m.xat) && m.xat.length === 3 && m.xat.every(p => Number.isInteger(p[0]) && typeof p[1] === "string" && p[1].trim()), `${m.dades}: 3 peces de xat [id, "text"]`);
  (m.xat || []).forEach(p => totsXat.push(p[0]));
}
ok(new Set(totsXat).size === totsXat.length, "els ids de les peces de món són únics");
ok(totsXat.every(id => id > 0 && id < 1001), "els ids de les peces de món són < 1001 (les de l'admin comencen a 1001)");
{ const h = llegeix("index.html"), a = h.indexOf("const XAT_PC_BASE=["), b = h.indexOf("];", a);
  const base = new Set([...h.slice(a, b).matchAll(/\{id:(\d+),/g)].map(x => +x[1]));
  ok(base.size > 0 && totsXat.every(id => !base.has(id)), "cap peça de món repeteix l'id d'una peça general (XAT_PC_BASE)"); }

console.log("2) admin/index.html · bloc MONS-ADMIN");
const adm = bloc(llegeix("admin/index.html"), "/* MONS-ADMIN:inici (generat per motor/tot.py, no editar a mà) */", "/* MONS-ADMIN:fi */");
ok(adm !== null, "admin/index.html té el bloc MONS-ADMIN");
if (adm !== null) {
  const A = vm.runInNewContext(adm + "\n;({ASSIGS, COL_MON, XMON, DEMO_JOCS})", {});
  ok(JSON.stringify(Object.keys(A.ASSIGS)) === JSON.stringify(nouAVell), "ASSIGS té els mons de mons.json, del més nou al més antic");
  ok(mons.every(m => A.ASSIGS[m.dades] === m.curt), "ASSIGS[id] = curt");
  ok(ids.every(id => Array.isArray(A.COL_MON[id]) && A.COL_MON[id].length === 8 && A.COL_MON[id].every(c => /^#[0-9a-f]{6}$/i.test(c))), "COL_MON: 8 colors #rrggbb per món");
  ok(ids.every(id => typeof A.XMON[id] === "string" && A.XMON[id]), "XMON: un nom per món");
  ok(ids.every(id => Array.isArray(A.DEMO_JOCS[id]) && A.DEMO_JOCS[id].length > 0), "DEMO_JOCS: jocs de la demo per món");
}
const admTot = llegeix("admin/index.html");
ok((admTot.match(/const (ASSIGS|COL_MON|XMON)\s*=/g) || []).length === 3, "ASSIGS, COL_MON i XMON només es defineixen un cop (al bloc)");

console.log("3) sprites.js · BN_MON");
ok(JSON.stringify(Object.keys(ctx.BN_MON).sort()) === JSON.stringify(ids.slice().sort()), "BN_MON té exactament els mons de mons.json");
ok(mons.every(m => ctx.BN_MON[m.dades] && ctx.BN_MON[m.dades].ic === m.spr && ctx.BN_MON[m.dades].mat === m.materia), "BN_MON[id] = {ic: spr, mat: materia}");

console.log("4) peces de món del xat · index.html i supabase/bn_xat.sql");
const idx = bloc(llegeix("index.html"), "/* XAT-MONS:inici (generat per motor/tot.py des de motor/mons.json, no editar a mà) */", "/* XAT-MONS:fi */");
ok(idx !== null, "index.html té el bloc XAT-MONS");
if (idx !== null) {
  const P = vm.runInNewContext(idx + "\n;XAT_PC_MONS", {});
  const esperat = mons.flatMap(m => m.xat.map(([id, t]) => ({ id, s: "P", t, m: m.dades }))).sort((a, b) => a.id - b.id);
  ok(JSON.stringify(P) === JSON.stringify(esperat), "XAT_PC_MONS = les peces de mons.json, per id");
}
const sql = bloc(llegeix("supabase/bn_xat.sql"), "-- XAT-MONS:inici (generat per motor/tot.py des de motor/mons.json, no editar a mà)", "-- XAT-MONS:fi");
ok(sql !== null, "supabase/bn_xat.sql té el bloc XAT-MONS");
if (sql !== null) ok(mons.every(m => m.xat.every(([id, t]) => sql.includes(`(${id}, 'P', '${t.replace(/'/g, "''")}', null, '${m.dades}')`))), "cada peça de món és al bloc SQL");

console.log(errors ? `\n✗ ${errors} comprovacions han fallat` : "\n✓ prova-mons: mons.json, admin, sprites i xat coincideixen");
process.exit(errors ? 1 : 0);
