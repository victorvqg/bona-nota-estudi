// Passa en local les mateixes proves que l'Action «Revisa Bona Nota» i en fa un resum.
//   node motor/prova-tot.js                 → base + sql + interficie
//   node motor/prova-tot.js base|sql|interficie|mons [carpeta…]
// «mons» passa la prova estricta (ESTRICTE=1) dels mons indicats (per defecte, tots els de motor/mons.json).
// Una sola ordre (sense &&, | ni cd) perquè la configuració local la deixi passar sense finestra de permís.
const { spawnSync } = require("child_process"), path = require("path"), fs = require("fs");
const arrel = path.join(__dirname, "..");
const GRUPS = {
  base: [["python3", "motor/tot.py"], ["node", "prova-generadors.js", { cwd: "motor" }], ["node", "motor/prova-regles.js"],
    ["node", "motor/prova-admin-fonts.js"], ["node", "motor/prova-mons.js"]],
  sql: ["prova-xat-sql", "prova-admin-fitxa-sql", "prova-admin-benestar-sql", "prova-bon-us-sql", "prova-admin-fonts-rep-sql",
    "prova-control-sql", "prova-pin-intents-sql", "prova-fotos-sql", "prova-dificultat-sql"].map(p => ["node", `motor/${p}.js`]),
  interficie: ["prova-nuvol", "prova-perfil", "prova-pares", "prova-tast", "prova-xat", "prova-admin-xat", "prova-admin-fitxa",
    "prova-admin-benestar", "prova-admin-fonts-rep", "prova-admin-alta", "prova-admin-dificultat", "prova-admin-evolucio"].map(p => ["node", `motor/${p}.js`])
};
const args = process.argv.slice(2), grup = args[0];
let tasques;
if (grup === "mons") {
  const carpetes = args.length > 1 ? args.slice(1) : JSON.parse(fs.readFileSync(path.join(arrel, "motor/mons.json"), "utf8")).map(m => m.carpeta);
  tasques = carpetes.map(c => ["node", "prova.js", { cwd: "motor", env: { ESTRICTE: "1" }, arg: path.join(arrel, c, "index.html") }]);
} else if (!grup) tasques = [...GRUPS.base, ...GRUPS.sql, ...GRUPS.interficie];
else if (GRUPS[grup]) tasques = GRUPS[grup];
else { console.error(`Grup desconegut: ${grup} (base, sql, interficie o mons)`); process.exit(2); }

let mal = 0;
for (const [bin, fitxer, opc = {}] of tasques) {
  const t0 = Date.now(), nom = opc.arg ? `${fitxer} ${path.relative(arrel, opc.arg)}` : fitxer;
  const r = spawnSync(bin, opc.arg ? [fitxer, opc.arg] : [fitxer], { cwd: path.join(arrel, opc.cwd || ""), env: { ...process.env, ...(opc.env || {}) }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const sortida = (r.stdout || "") + (r.stderr || "");
  const fallades = sortida.split("\n").filter(l => /^\s*✗/.test(l));
  const bo = r.status === 0;   // totes les proves acaben amb process.exit(1) si alguna comprovació falla
  console.log(`${bo ? "✓" : "✗"} ${nom} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  if (!bo) { mal++; console.log((fallades.length ? fallades : sortida.trim().split("\n").slice(-12)).map(l => "    " + l.trim()).join("\n")); }
}
console.log(mal ? `\n✗ ${mal} de ${tasques.length} proves han fallat` : `\n✓ ${tasques.length} proves en verd`);
process.exit(mal ? 1 : 0);
