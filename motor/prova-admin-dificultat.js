#!/usr/bin/env node
// Bona Nota · prova automàtica de l'apartat «Dificultat real de les preguntes» del tauler d'admin (admin/index.html, g11 · #16) amb Playwright.
// Comprova: 1) ?demo sense cap crida a Supabase, amb KPIs, modes, blocs plegables i botó JSON desactivat
//           2) credencials: contracte de bn_admin_dificultat {p_email, p_pass, p_assig}, comparació amb motor/dificultat.json
//              (➕ Proposa ⚡, ➖ Revisa ⚡, ⚡ Confirmada, Fàcil i < 8 resp.), modes (≥ 8 / Canvis / Totes), filtre #fAssig, avís amb #fNen i descàrrega JSON
//           3) 404 → avís de supabase/bn_admin_dificultat.sql només a #tDif; la resta del tauler es veu
//           4) protecció XSS i vista mòbil (390 px) sense desbordament horitzontal.
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };
const XSS = '<img src=x onerror="window.__xss=1">';

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
   fs.createReadStream(f).pipe(r);
  });
  s.listen(0, "127.0.0.1", () => res(s));
 });
}

const RESUM = p => ({ periode: p || "7d", desde: new Date().toISOString(), ara: { nens: 3, dies: 5, minuts: 90, sessions: 4, tests: 4, nota: 75, aprovats: 75, encert: 72, respostes: 40, examens: 1, nota_exam: 80, seg_preg: 7, jocs: 2, obertes: 1, fitxes: 2 }, abans: null });

function dadesDif(assig, xss) {
 const totes = [
  { assig: "socials", qid: "temps/1", n: 10, bones: 4, nens: 6, encert: 40.0, encert_1a: 33.3, seg_mig: 9.4, suficient: true, dificultat: 3 },      // no és a dificultat.json → ➕ Proposa ⚡
  { assig: "socials", qid: "atmos/9", n: 10, bones: 8, nens: 6, encert: 80.0, encert_1a: 75.0, seg_mig: 6.2, suficient: true, dificultat: 2 },      // és 3 a dificultat.json i >= 75 % → ➖ Revisa ⚡
  { assig: "socials", qid: "atmos/4", n: 11, bones: 5, nens: 7, encert: 45.5, encert_1a: 42.9, seg_mig: 11.1, suficient: true, dificultat: 3 },     // és 3 a dificultat.json i < 75 % → ⚡ Confirmada
  { assig: "socials", qid: "temps/5", n: 12, bones: 11, nens: 7, encert: 91.7, encert_1a: 90.0, seg_mig: 5.0, suficient: true, dificultat: 1 },     // > 90 % i no marcada ⚡ → Fàcil
  { assig: "socials", qid: "temps/3", n: 4, bones: 2, nens: 3, encert: 50.0, encert_1a: 50.0, seg_mig: 8.0, suficient: false, dificultat: null },   // < 8 resp.
  { assig: "angles", qid: "adjectius/1", n: 9, bones: 3, nens: 5, encert: 33.3, encert_1a: 25.0, seg_mig: 10.0, suficient: true, dificultat: 3 }
 ];
 if (xss) totes.push({ assig: XSS, qid: XSS, n: 10, bones: 3, nens: 4, encert: 30.0, encert_1a: 30.0, seg_mig: 7.0, suficient: true, dificultat: 3 });
 const pr = assig ? totes.filter(r => r.assig === assig) : totes;
 const suf = pr.filter(r => r.suficient);
 return {
  min_respostes: 8, dies: 365, assig: assig || null,
  resum: { preguntes_vistes: pr.length, amb_dades: suf.length, dificils: suf.filter(r => r.dificultat === 3).length, normals: suf.filter(r => r.dificultat === 2).length, facils: suf.filter(r => r.dificultat === 1).length },
  preguntes: pr
 };
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obre(url, opcions) {
  const o = opcions || {}, crides = [], errors = [];
  const ctx = await nav.newContext({ viewport: o.viewport || { width: 1280, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage();
  p.on("pageerror", e => errors.push(e.message));
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {};
   crides.push({ f, cos });
   if (f === "bn_admin_logs") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ id: 1, ts: new Date().toISOString(), assig: "socials", nom: "Pau", sessio: "s1", aparell: "a1", event: "entra", detall: { punts: 20 } }]) });
   if (f === "bn_admin_ids") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ k: "pau", nom: "Pau", id: 1 }]) });
   if (f === "bn_aspectes") return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   if (f === "bn_admin_resum") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(RESUM(cos.p_periode)) });
   if (["bn_admin_activitat", "bn_admin_calor", "bn_admin_domini", "bn_admin_fallades", "bn_admin_evolucio", "bn_admin_alertes", "bn_admin_errors_taller", "bn_admin_rep_pendents"].includes(f)) {
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   }
   if (f === "bn_admin_benestar") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", mons: [], nens: [] }) });
   if (f === "bn_admin_fonts_dia") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", dies: [], total: {} }) });
   if (f === "bn_admin_control") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ xat_actiu: true, xat_obert_ara: true, horari: { actiu: true, tanca_min: 1290, obre_min: 420 }, mons_tancats: [] }) });
   if (f === "bn_admin_dificultat") {
    if (o.falta) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(dadesDif(cos.p_assig, o.xss)) });
   }
   return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
  });
  if (o.cred) await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), o.cred);
  await p.goto(BASE + url + (url.includes("?") ? "&" : "?") + "v=mons&tab=dificultat");
  await p.waitForSelector("#shell:not([hidden])");
  await p.waitForFunction(() => { const e = document.querySelector("#tDif"); return e && !e.hasAttribute("aria-busy") });
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : "" }, s);
  return { p, ctx, crides, errors, txt };
 }

 console.log("1) Mode ?demo: cap crida a Supabase, KPIs i blocs plegables de dificultat real");
 {
  const { p, ctx, crides, errors, txt } = await obre("/admin/?demo");
  ok(crides.length === 0, "cap crida de xarxa a Supabase en mode ?demo");
  ok((await p.$$("#tDif .kpi")).length === 4, "es pinten els 4 KPIs de dificultat real");
  ok((await p.$$("#tDif details.dm-as")).length >= 6, "hi ha blocs plegables per als mons en ?demo");
  ok(await p.locator("#btDifJson").isDisabled(), "el botó Baixa JSON està desactivat en ?demo");
  ok(errors.length === 0, "sense errors de consola en ?demo");
  await ctx.close();
 }

 console.log("2) Credencials: càrrega sota demanda, contracte RPC, estats (Proposa ⚡, Revisa ⚡, Confirmada, Fàcil), modes, filtres i JSON");
 {
  const { p, ctx, crides, errors, txt } = await obre("/admin/", { cred: CRED });
  const c0 = crides.find(x => x.f === "bn_admin_dificultat");
  ok(c0 && Object.keys(c0.cos).sort().join(",") === "p_assig,p_email,p_pass" && c0.cos.p_assig === null, "crida bn_admin_dificultat {p_email, p_pass, p_assig:null}");
  ok(["bn_admin_resum", "bn_admin_domini", "bn_admin_fallades", "bn_admin_benestar"].every(f => !crides.some(x => x.f === f)),
   "càrrega sota demanda: obrir Mons → Dificultat no demana el resum, domini, fallades ni benestar");
  await p.click('#tDif [data-dm="obre"]');
  const tSoc = await txt('#tDif details[data-a="socials"]');
  ok(tSoc.includes("➕ Proposa ⚡") && tSoc.includes("➖ Revisa ⚡") && tSoc.includes("⚡ Confirmada") && tSoc.includes("Fàcil (> 90 %)"),
   "compara bé amb motor/dificultat.json: Proposa ⚡, Revisa ⚡, Confirmada i Fàcil");
  ok(!tSoc.includes("temps/3"), "per defecte (≥ 8 resp.) no mostra les preguntes amb menys de 8 respostes");

  // Mode «Canvis»: només les 2 de socials i 1 d'anglès que demanen acció
  await p.click('#difModes [data-dif-v="proposta"]');
  const tCanvis = await txt('#tDif details[data-a="socials"]');
  ok(tCanvis.includes("➕ Proposa ⚡") && tCanvis.includes("➖ Revisa ⚡") && !tCanvis.includes("Fàcil (> 90 %)"),
   "el mode «Canvis» mostra només les propostes d'afegir o revisar");

  // Mode «Totes»: inclou temps/3 (< 8 resp.)
  await p.click('#difModes [data-dif-v="totes"]');
  ok((await txt('#tDif details[data-a="socials"]')).includes("temps/3") && (await txt('#tDif details[data-a="socials"]')).includes("< 8 resp."),
   "el mode «Totes» inclou també les preguntes amb < 8 respostes");

  // Filtre de nen: no torna a cridar bn_admin_dificultat i mostra l'avís .fr-nota
  const nAbans = crides.filter(x => x.f === "bn_admin_dificultat").length;
  await p.selectOption("#fNen", "Pau");
  await p.waitForSelector("#tDif .fr-nota");
  ok(crides.filter(x => x.f === "bn_admin_dificultat").length === nAbans && (await txt("#tDif .fr-nota")).includes("el filtre de nen"),
   "filtrar per nen no torna a cridar bn_admin_dificultat i n'informa amb .fr-nota");
  await p.selectOption("#fNen", "");

  // Filtre d'assignatura: crida nova amb p_assig = 'socials'
  await p.selectOption("#fAssig", "socials");
  await p.waitForFunction(() => document.querySelectorAll("#tDif details.dm-as").length === 1);
  const cSoc = crides.filter(x => x.f === "bn_admin_dificultat").pop();
  ok(cSoc && cSoc.cos.p_assig === "socials", "filtrar per assignatura demana p_assig='socials'");

  // Descàrrega JSON per a dificultat.py --proposa
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#btDifJson")]);
  ok(dl.suggestedFilename().startsWith("bn-dificultat-") && dl.suggestedFilename().endsWith(".json"), "Baixa JSON descarrega bn-dificultat-AAAA-MM-DD.json");
  ok(errors.length === 0, "sense errors de consola amb credencials");
  await ctx.close();
 }

 console.log("3) SQL pendent (404): avís aïllat a #tDif i resta del tauler intacta");
 {
  const { p, ctx, txt } = await obre("/admin/", { cred: CRED, falta: true });
  ok((await txt("#tDif .avis")).includes("supabase/bn_admin_dificultat.sql") && (await p.$$("#contingut .avis")).length === 1,
   "un 404 mostra l'avís de supabase/bn_admin_dificultat.sql només a #tDif");
  await ctx.close();
 }

 console.log("4) Escapament XSS i disseny mòbil (360, 390 i 430 px)");
 for (const mw of [360, 390, 430]) {
  const { p, ctx, errors } = await obre("/admin/", { cred: CRED, xss: true, viewport: { width: mw, height: 844 } });
  const xssExec = await p.evaluate(() => !!window.__xss);
  const desborda = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok(!xssExec && !desborda && errors.length === 0, `${mw} px: cap injecció XSS, zero desbordament i zero errors`);
  await ctx.close();
 }

 await nav.close(); srv.close();
 if (fallades) { console.error(`✗ ${fallades} errors a prova-admin-dificultat`); process.exit(1); }
 console.log("✓ prova-admin-dificultat ok");
})();
