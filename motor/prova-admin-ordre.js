#!/usr/bin/env node
// Bona Nota · prova automàtica de l'ordre del tauler (fase 3 del pla
// docs/superpowers/specs/2026-11-18-admin-ordre-paginacio-pla-mestre.md), amb Playwright (Chromium).
// Comprova: menú Inici · Nens · Mons · Activitat · Rànquing · Xat; Inici amb les Alertes abans del Control ràpid;
// Activitat sense el botó repetit del log; Rànquing sense Xat; l'adreça vella ?v=ranquing&tab=xat porta a ?v=xat;
// i la barra inferior del mòbil amb 6 botons sense scroll horitzontal.
// Ús: node motor/prova-admin-ordre.js
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
 const txt = (p, sel) => p.evaluate(s => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(), sel);
 try {
  console.log("1) Menú i Inici");
  {
   const { ctx, p, errors } = await obre("/admin/");
   await p.waitForSelector("#tAlertes table");
   const menu = await p.$$eval("#nav .nav-b", b => b.map(x => x.textContent.trim()).join(" · "));
   ok(menu === "Inici · Control ràpid · Nens · Mons · Activitat · Rànquing · Xat · Bústia", `menú: ${menu}`);
   const ordre = await p.$$eval("#contingut .graella > section, #contingut .graella > div", s => s.map(x => x.id).filter(Boolean));
   ok(ordre.indexOf("alertes") > -1 && !ordre.includes("control"), `Alertes a Inici i Control ràpid fora d'Inici (${ordre.join(", ")})`);
   await p.click('#nav [data-v="control"]');
   await p.waitForSelector("#control #ctrlXatSw");
   ok((await txt(p, "#titol")) === "Control ràpid" && (await p.isHidden("#periodeWrap")), "Control ràpid s'obre des del menú lateral amb el selector de període amagat");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }
  console.log("2) Activitat i Rànquing");
  {
   const { ctx, p, errors } = await obre("/admin/?v=sessions");
   await p.waitForSelector("#tSes table");
   ok((await txt(p, "#titol")) === "Activitat" && (await p.$("#btVeureLog")) === null, "la secció es diu «Activitat» i ja no té el botó repetit «Log complet per dia»");
   ok((await p.$$eval("main .pestanyes [data-vtab]", b => b.map(x => x.textContent.trim()).join(" · "))) === "Sessions · Log per dia · Gràfics", "pestanyes: Sessions · Log per dia · Gràfics");
   await p.click('#nav [data-v="ranquing"]');
   await p.waitForSelector("main .pestanyes");
   ok((await p.$$eval("main .pestanyes [data-vtab]", b => b.map(x => x.dataset.vtab).join(","))) === "classificacio,reptes", "Rànquing només té Classificació i Reptes");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }
  console.log("2b) Les files de pestanyes no tenen barra de desplaçament vertical (2.58.3)");
  for (const [w, url] of [[1280, "/admin/?v=nens"], [1280, "/admin/?v=sessions"], [390, "/admin/?v=config"]]) {
   const { ctx, p } = await obre(url, { viewport: { width: w, height: 800 } });
   await p.waitForSelector("main .pestanyes");
   const v = await p.$$eval("main .pestanyes", els => els.map(e => [getComputedStyle(e).overflowY, e.scrollHeight - e.clientHeight]));
   ok(v.length && v.every(([o]) => o === "hidden"), `${w} px ${url}: les pestanyes no es poden desplaçar en vertical (${JSON.stringify(v)})`);
   await ctx.close();
  }
  console.log("3) Adreça vella del xat");
  {
   const { ctx, p } = await obre("/admin/?v=ranquing&tab=xat");
   await p.waitForFunction(() => document.querySelector("#titol")?.textContent === "Xat");
   ok(p.url().includes("v=xat") && !p.url().includes("tab=xat"), "?v=ranquing&tab=xat porta a la secció Xat (?v=xat)");
   await ctx.close();
  }
  console.log("4) Mòbil: barra inferior amb 8 botons");
  for (const w of [360, 390]) {
   const { ctx, p, errors } = await obre("/admin/", { viewport: { width: w, height: 760 } });
   await p.waitForSelector("#navInf button");
   const n = await p.$$eval("#navInf button", b => b.filter(x => x.offsetParent).length);
   ok(n === 8 && await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${w} px: 8 botons a la barra de baix i cap scroll horitzontal`);
   ok(errors.length === 0, "cap error de JS");
   await ctx.close();
  }
 } finally {
  await nav.close();
  srv.close();
 }
 console.log(fallades ? `\n✗ ${fallades} fallades` : "\n✓ Totes les comprovacions de l'ordre del tauler superades");
 process.exit(fallades ? 1 : 0);
})();
