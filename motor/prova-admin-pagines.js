#!/usr/bin/env node
// Bona Nota · prova automàtica de la paginació del tauler (fase 2 del pla
// docs/superpowers/specs/2026-11-18-admin-ordre-paginacio-pla-mestre.md), amb Playwright (Chromium).
// Comprova:
//   1) una taula de 340 sessions en pinta 25; «Següent» porta a 26-50; cercar i ordenar tornen a la pàgina 1;
//      el CSV porta les 340 files; el selector de 50 es recorda (localStorage) i la pàgina es manté en repintar;
//   2) el log per dia ja no talla: 7 dies per pàgina, 50 accions per dia amb «Mostra'n 50 més» i s'arriba
//      a la primera acció del període; la vista Taula també les té totes (paginades);
//   3) les alertes d'Inici van de 10 en 10, amb les «malament» primer;
//   4) al mòbil (390 px) el paginador no fa scroll horitzontal.
// Ús: node motor/prova-admin-pagines.js
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };

const MOCK_CHART_JS = `(function(){const m=new WeakMap();function C(c,cfg){this.canvas=c;this.cfg=cfg;m.set(c,this)}
C.prototype.destroy=function(){m.delete(this.canvas)};C.prototype.resize=function(){};C.prototype.update=function(){};
C.getChart=c=>m.get(c)||null;C.defaults={animation:true,font:{},plugins:{legend:{labels:{}},tooltip:{}}};window.Chart=C})();`;

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r) });
  s.listen(0, "127.0.0.1", () => res(s)) });
}

function dades() {
 const ara = Date.now(), iso = h => new Date(ara - h * 36e5).toISOString();
 const noms = ["Pau", "Laia", "Jana", "Àlex", "Nora", "Hugo", "Biel", "Ona"];
 const logs = [];
 let id = 100000;
 // 340 sessions repartides en uns 30 dies (2 accions per sessió)
 for (let i = 0; i < 340; i++) {
  const nom = i === 339 ? "Zoe" : noms[i % noms.length], s = "s" + i, h = 3 + i * 2.1;
  logs.push({ id: id--, ts: iso(h), assig: "socials", nom, sessio: s, aparell: "a1", event: "entra", detall: { punts: i } });
  logs.push({ id: id--, ts: iso(h - 0.05), assig: "socials", nom, sessio: s, aparell: "a1", event: "test", detall: { tema: "t1", pc: 70 } });
 }
 // un dia (fa 1 h - 2 h) amb 120 accions d'una mateixa sessió
 for (let i = 0; i < 120; i++) logs.push({ id: id--, ts: iso(1 + i / 200), assig: "socials", nom: "Pau", sessio: "s-llarga", aparell: "a1", event: "joc", detall: { joc: "j" + i } });
 logs.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
 const alertes = [];
 for (let i = 0; i < 14; i++) alertes.push({ tipus: "inactiu", gravetat: i < 2 ? 3 : i < 5 ? 2 : 1, nom: noms[i % noms.length], assig: null, text: "Alerta de prova " + i });
 return { logs, alertes };
}

function respon(st, f) {
 if (f === "bn_admin_logs") return st.logs;
 if (f === "bn_admin_ids" || f === "bn_aspectes") return [];
 if (f === "bn_admin_resum") return { periode: "curs", ara: { nens: 8, sessions: 340, minuts: 900, nota: 70, encert: 75 }, abans: null };
 if (f === "bn_admin_alertes") return st.alertes;
 if (["bn_admin_activitat", "bn_admin_calor", "bn_admin_evolucio", "bn_admin_domini", "bn_admin_fallades", "bn_admin_altes"].includes(f)) return [];
 if (f === "bn_admin_fonts_dia") return { periode: "curs", dies: [], total: {} };
 if (f === "bn_admin_control") return { xat_actiu: true, xat_obert_ara: true, xat_en_horari_tancat: false, horari: { actiu: false, tanca_min: 1290, obre_min: 420 }, mons_tancats: [] };
 if (f === "bn_admin_xat_resum") return { frases: 3 };
 return undefined;
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obre(url, opc = {}) {
  const st = dades();
  const ctx = await nav.newContext({ viewport: opc.viewport || { width: 1280, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0];
   const resp = respon(st, f);
   if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no"}' });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) });
  });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: MOCK_CHART_JS }));
  await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), CRED);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url); await p.waitForSelector("#shell:not([hidden])");
  return { ctx, p, st, errors };
 }
 const files = (p, sel) => p.$$eval(sel + " tbody tr", t => t.length);
 const txt = (p, sel) => p.evaluate(s => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(), sel);

 try {
  console.log("1) Sessions: 340 files, 25 per pàgina");
  {
   const { ctx, p, errors } = await obre("/admin/?v=sessions&p=curs");
   await p.waitForSelector("#tSes table");
   ok((await files(p, "#tSes")) === 25 && /Files 1-25 de 341/.test(await txt(p, "#tSes .tb-pag")) && /Pàgina 1 de 14/.test(await txt(p, "#tSes .tb-pag")),
    `pinta 25 files i el paginador diu «Files 1-25 de 341 · Pàgina 1 de 14» (${await txt(p, "#tSes .tb-pag-t")})`);
   ok(await p.isDisabled('#tSes button[data-tpg="-1"]'), "«Anterior» està desactivat a la primera pàgina");
   await p.click('#tSes button[data-tpg="1"]');
   ok(/Files 26-50 de 341/.test(await txt(p, "#tSes .tb-pag")) && (await files(p, "#tSes")) === 25, "«Següent» porta a les files 26-50");
   // CSV amb totes les files
   const [dl] = await Promise.all([p.waitForEvent("download"), p.click('#tSes button[data-tcsv="tSes"]')]);
   const csv = fs.readFileSync(await dl.path(), "utf8").trim().split("\n");
   ok(csv.length === 342, `el CSV porta totes les files (${csv.length - 1} sessions + capçalera), no només la pàgina`);
   // cerca: torna a la pàgina 1 i cerca a totes les files
   await p.fill("#tSes input.tb-q", "Zoe");
   ok((await files(p, "#tSes")) === 1 && (await txt(p, "#tSes tbody")).includes("Zoe") && (await txt(p, "#tSes .tb-pag")) === "",
    "cercar «Zoe» (la sessió més antiga, a l'última pàgina) la troba i treu el paginador");
   await p.fill("#tSes input.tb-q", "");
   ok(/Files 1-25 de 341/.test(await txt(p, "#tSes .tb-pag")), "en esborrar la cerca torna a la pàgina 1");
   // ordenar torna a la pàgina 1
   await p.click('#tSes button[data-tpg="1"]');
   await p.click('#tSes th button.ord[data-k="nom"]');
   ok(/Files 1-25/.test(await txt(p, "#tSes .tb-pag")), "ordenar per una columna torna a la pàgina 1");
   // mida 50, recordada
   await p.selectOption("#tSes select[data-tmida]", "50");
   ok((await files(p, "#tSes")) === 50 && /Pàgina 1 de 7/.test(await txt(p, "#tSes .tb-pag")), "triar 50 per pàgina en pinta 50 (7 pàgines)");
   ok((await p.evaluate(() => localStorage.getItem("bn_admin_pag"))) === "50", "i la mida es desa al navegador");
   // la pàgina es manté en repintar (Actualitza)
   await p.click('#tSes button[data-tpg="1"]');
   await p.click("#refresca");
   await p.waitForFunction(() => !document.querySelector(".suau-nou,#contingutVell") && /Files 51-100/.test(document.querySelector("#tSes .tb-pag")?.textContent || ""));
   ok(true, "després d'«Actualitza» continua a la pàgina 2 (files 51-100)");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("2) Log complet per dia: sense tall, 7 dies per pàgina i 50 accions per dia");
  {
   const { ctx, p, errors } = await obre("/admin/?v=sessions&tab=registre&p=curs");
   await p.waitForSelector("#logDies");
   const nDies = await p.$$eval("#logDies .log-dia", d => d.length);
   const cpt = await txt(p, "#logCard .eines-t");
   ok(nDies === 7 && /800 accions/.test(cpt) && !/Es mostren/.test(cpt), `7 dies a la pàgina i el comptador diu totes les accions sense tall («${cpt.match(/\d+ accions en \d+ dies/)}»)`);
   ok((await p.$$eval("#logDies .log-dia:first-child .log-lin", l => l.length)) === 50, "el dia amb més de 50 accions n'ensenya 50");
   const bMes = await txt(p, '#logDies .log-dia:first-child [data-log-mes]');
   ok(/Mostra'n 50 més/.test(bMes), `i un botó «${bMes}»`);
   await p.click('#logDies .log-dia:first-child [data-log-mes]');
   ok((await p.$$eval("#logDies .log-dia:first-child .log-lin", l => l.length)) === 100, "«Mostra'n 50 més» n'ensenya 100");
   // fins a l'última pàgina de dies
   let guard = 0;
   while (!(await p.isDisabled('.log-pag button[data-log-pag="1"]')) && guard++ < 20) await p.click('.log-pag button[data-log-pag="1"]');
   await p.click("#logDies .log-dia:last-child button[data-log-pleg]").catch(() => {});
   const ultim = await txt(p, "#logDies .log-dia:last-child");
   ok(/Zoe/.test(ultim), "a l'última pàgina de dies hi ha la primera acció del període (en Zoe)");
   // vista Taula: totes les accions, paginades
   await p.click('#logVistaSeg button[data-lv="taula"]');
   await p.waitForSelector("#tLog table");
   ok((await files(p, "#tLog")) === 25 && /de 800/.test(await txt(p, "#tLog .tb-pag")), "la vista Taula té les 800 accions (abans tallava a 1.500), de 25 en 25");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("3) Inici: alertes de 10 en 10, les «malament» primer");
  {
   const { ctx, p, errors } = await obre("/admin/");
   await p.waitForSelector("#tAlertes table");
   await p.selectOption("#fAlGrav", "totes");
   ok((await files(p, "#tAlertes")) === 10 && /Files 1-10 de 14/.test(await txt(p, "#tAlertes .tb-pag")), "14 alertes: se'n veuen 10 i el paginador diu «1-10 de 14»");
   ok(/malament/.test(await txt(p, "#tAlertes tbody tr:first-child")), "la primera és una «malament»");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("4) Mòbil 390 px: el paginador no fa scroll horitzontal");
  {
   const { ctx, p, errors } = await obre("/admin/?v=sessions&p=curs", { viewport: { width: 390, height: 800 } });
   await p.waitForSelector("#tSes .tb-pag button");
   ok(await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "sense scroll horitzontal a 390 px");
   ok(errors.length === 0, "cap error de JS");
   await ctx.close();
  }
 } finally {
  await nav.close();
  srv.close();
 }
 console.log(fallades ? `\n✗ ${fallades} fallades` : "\n✓ Totes les comprovacions de la paginació del tauler superades");
 process.exit(fallades ? 1 : 0);
})();
