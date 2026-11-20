// Revisor de contingut d'un món (motor/dades/<id>.js): troba els errors que la prova estricta no explica bé o no mira.
//   node motor/revisa-mon.js [id…]      (sense ids, revisa tots els mons de motor/mons.json; surt amb 1 si hi ha errors)
// També es fa servir com a mòdul: revisaFont(src) i revisaMon(id) → {errors: [...], avisos: [...]}.
const fs = require("fs"), path = require("path");
const PALETA_BOSS = /^[.KWRYGgOCDdMm]{16}$/;
const BOSS_PECES_CAT = { tret: ["estrella", "rosa", "llapis"], atac: ["embat", "taca", "ensurt"], mort: ["pixels", "goma", "esvaeix"] };
const net = s => String(s).replace(/<[^>]+>/g, "");

function bossPecesMon(ASSIG) {
  const b = (ASSIG && ASSIG.boss) || {};
  const tePix = Array.isArray(b.pix) && b.pix.length === 16;
  const spr = b.spr || (tePix ? "" : "monstre");
  const fx = b.fx || "explosio";
  const mort = BOSS_PECES_CAT.mort.includes(b.mort) ? b.mort : ((fx === "esborra" || fx === "espiral") ? "goma" : (fx === "focus" || fx === "tempesta") ? "esvaeix" : "pixels");
  const esLlengua = /^(catala|castellano|angles)/i.test((ASSIG && ASSIG.id) || "");
  const tret = BOSS_PECES_CAT.tret.includes(b.tret) ? b.tret : (esLlengua ? "llapis" : "estrella");
  const atac = BOSS_PECES_CAT.atac.includes(b.atac) ? b.atac : ((spr === "fantasma" || spr === "borrasca") ? "ensurt" : (spr === "monstre" || spr === "signes" || spr === "faltas") ? "taca" : "embat");
  return { tret, atac, mort };
}

// Avalua el fitxer de dades del repo (motor/dades/<id>.js), igual que fan tot.py i qids.py: és codi del projecte, no entrada externa.
function carrega(src) {
  const g = { document: { getElementById: () => ({}), createElement: () => ({}), head: { appendChild: () => {} } }, window: {}, location: { search: "" } };
  return new Function("document", "window", "location", src + `
;return {ASSIG, T, OB, fig: n => { try { const f = eval(n); return typeof f === "function" ? f : null } catch (e) { return null } }}`)(g.document, g.window, g.location);
}

function revisaFont(src) {
  const errors = [], avisos = [];
  let D;
  try { D = carrega(src); } catch (e) { return { errors: [`no es pot carregar el fitxer: ${e.message}`], avisos }; }
  const { ASSIG, T, OB } = D;
  // ids de joc únics: dos jocs amb el mateix id es trepitgen el progrés i el repàs
  { const vist = new Set(); for (const j of ASSIG.jocs || []) { if (vist.has(j.id)) errors.push(`joc ${j.id}: id repetit`); vist.add(j.id); } }
  // temes i preguntes de test
  let tot = 0, llarga = 0;
  for (const t of T) {
    if (!t.font) avisos.push(`tema ${t.id}: sense «font»`);
    if (!Array.isArray(t.q)) { errors.push(`tema ${t.id}: sense preguntes («q»)`); continue; }
    if (t.q.length < 8) errors.push(`tema ${t.id}: només ${t.q.length} preguntes (mínim 8)`);
    const vistes = new Set();
    t.q.forEach((q, i) => {
      const id = `${t.id}/${i + 1}`;
      if (vistes.has(net(q[0]))) errors.push(`tema ${t.id}: preguntes repetides («${net(q[0])}»)`);
      vistes.add(net(q[0]));
      if (!Array.isArray(q[1]) || q[1].length !== 3) { errors.push(`${id}: té ${(q[1] || []).length} opcions; n'hi ha d'haver 3 opcions`); return; }
      if (!(Number.isInteger(q[2]) && q[2] >= 0 && q[2] < q[1].length)) errors.push(`${id}: la correcta (${q[2]}) és fora de rang`);
      if (new Set(q[1].map(net)).size !== q[1].length) errors.push(`${id}: opcions repetides`);
      tot++;
      const L = q[1].map(o => net(o).length), c = L[q[2]];
      if (c === Math.max(...L) && L.filter(l => l === c).length === 1) llarga++;
    });
  }
  if (tot) {
    const pc = Math.round(llarga * 100 / tot);
    if (pc < 15 || pc > 40) errors.push(`la correcta és l'opció més llarga en el ${pc} % de les preguntes (ha d'estar entre el 15 i el 40 %)`);
  }
  const blocs = (ASSIG.blocs || []).reduce((a, b) => a + b.n, 0);
  if (blocs !== T.length) errors.push(`els blocs sumen ${blocs} però hi ha ${T.length} temes`);
  (OB || []).forEach((o, i) => { if (!o.q || !Array.isArray(o.p) || !o.p.length || !o.m) errors.push(`OB ${i + 1} («${o.t}»): falta q, p (idees clau) o m (resposta model)`); });
  // jocs
  for (const j of ASSIG.jocs || []) {
    const nom = `joc ${j.id}`;
    if (j.tipus === "ordena" || j.tipus === "classifica") {
      const vistos = new Set();
      for (const it of j.items || []) { if (vistos.has(it[0])) errors.push(`${nom}: ítem repetit «${it[0]}»`); vistos.add(it[0]); }
    }
    if (j.tipus === "classifica") {
      const k = new Set((j.caixes || []).map(c => c[0]));
      for (const it of j.items || []) if (!k.has(it[1])) errors.push(`${nom}: «${it[0]}» va a la caixa «${it[1]}», que no existeix`);
    }
    if (j.tipus === "parelles") {
      const a = (j.pars || []).map(p => p[0]), b = (j.pars || []).map(p => p[1]);
      if (new Set(a).size !== a.length || new Set(b).size !== b.length) errors.push(`${nom}: parelles repetides`);
    }
    if (j.tipus === "figura") {
      const f = D.fig(j.figura);
      if (!f) errors.push(`${nom}: la figura «${j.figura}» no és cap funció`);
      else { let s = ""; try { s = String(f()); } catch (e) { s = ""; } if (!/^\s*<svg[\s\S]*<\/svg>\s*$/.test(s)) errors.push(`${nom}: la figura «${j.figura}» no torna un <svg>…</svg>`); }
      if (!Array.isArray(j.q) || !j.q.length) avisos.push(`${nom}: figura sense preguntes`);
      (j.q || []).forEach((q, i) => {
        if (!Array.isArray(q[1]) || q[1].length !== 3) errors.push(`${nom}/${i + 1}: n'hi ha d'haver 3 opcions`);
        else if (!(Number.isInteger(q[2]) && q[2] >= 0 && q[2] < 3)) errors.push(`${nom}/${i + 1}: la correcta és fora de rang`);
      });
    }
    if (j.tipus === "error") {
      for (const e of j.exercicis || []) {
        const n = `${nom} · ${e.id}`;
        if (!(Number.isInteger(e.mal) && e.mal >= 0 && e.mal < (e.linies || []).length)) errors.push(`${n}: «mal» fora de rang`);
        if (!Array.isArray(e.per) || e.per.length !== 3) errors.push(`${n}: cal «per» amb 3 motius`);
        if (e.t === "tria" && !(Array.isArray(e.op) && Number.isInteger(e.r) && e.r >= 0 && e.r < e.op.length)) errors.push(`${n}: «r» fora de rang de «op»`);
        if (e.t === "num" && typeof e.r !== "number") errors.push(`${n}: «r» ha de ser un número`);
        const llib = e.llibreta || e.linies || [];
        for (const k of e.ok || []) if (!(k >= 0 && k < llib.length)) errors.push(`${n}: «ok» (${k}) fora de rang de la llibreta`);
      }
    }
  }
  // boss
  const b = ASSIG.boss || {};
  if (b.pix) {
    if (!Array.isArray(b.pix) || b.pix.length !== 16 || b.pix.some(f => typeof f !== "string" || f.length !== 16)) errors.push("boss: el pix ha de fer 16×16");
    else b.pix.forEach((f, i) => { if (!PALETA_BOSS.test(f)) errors.push(`boss: pix fila ${i} amb un color que no és de la paleta (K W R Y G g O C D d M m)`); });
  }
  for (const [k, vals] of Object.entries(BOSS_PECES_CAT)) {
    if (b[k] !== undefined && b[k] !== "" && !vals.includes(b[k])) errors.push(`boss: ${k} «${b[k]}» no és al catàleg (${vals.join(" · ")})`);
  }
  const bossPeces = bossPecesMon(ASSIG);
  return { errors, avisos, bossPeces };
}

const revisaMon = id => revisaFont(fs.readFileSync(path.join(__dirname, "dades", `${id}.js`), "utf8"));

if (require.main === module) {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(fs.readFileSync(path.join(__dirname, "mons.json"), "utf8")).map(m => m.dades);
  let n = 0;
  for (const id of ids) {
    const r = revisaMon(id);
    n += r.errors.length;
    const p = r.bossPeces ? ` [boss: ${r.bossPeces.tret} · ${r.bossPeces.atac} · ${r.bossPeces.mort}]` : "";
    console.log(`${r.errors.length ? "✗" : "✓"} ${id}: ${r.errors.length} errors, ${r.avisos.length} avisos${p}`);
    r.errors.forEach(e => console.log("    ✗ " + e));
    r.avisos.forEach(a => console.log("    · " + a));
  }
  console.log(`\n${ids.length} mons revisats · ${n} errors`);
  process.exit(n ? 1 : 0);
}
module.exports = { revisaFont, revisaMon, BOSS_PECES_CAT, bossPecesMon };
