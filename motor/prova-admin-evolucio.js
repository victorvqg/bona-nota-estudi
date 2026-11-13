#!/usr/bin/env node
// Bona Nota · prova automàtica del gràfic «Evolució de les notes» (g31) a admin/index.html amb Playwright (Chromium).
// Comprova: mida ampliada (.cv-evo), línies 50% i 70% aprovat (evoLlindars), filtres bones/dolentes, pantalla completa (#evoDlg)
// tant a Sessions → Activitat (gEvo) com a Mons → Fitxa del món → Resum (gMonEvo), i mòbil (360 px i 390 px, tema fosc).
// Ús: node motor/prova-admin-evolucio.js
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };

// Mock mínim de Chart.js per provar datasets, destruccions i el plugin evoLlindars sense dependre d'Internet
const MOCK_CHART_JS = `
(function(){
 window.__charts = [];
 window.__destroyed = 0;
 const byCanvas = new WeakMap();
 function MockChart(canvas, cfg){
  this.canvas = canvas;
  this.cfg = cfg;
  this.id = canvas.id;
  this.ctx = canvas.getContext("2d");
  this.chartArea = { left: 40, right: 640, top: 16, bottom: 320 };
  this.scales = { y: { getPixelForValue: v => 320 - (v / 100) * 304 } };
  byCanvas.set(canvas, this);
  window.__charts.push(this);
  if (Array.isArray(cfg.plugins)) {
   const op = (cfg.options && cfg.options.plugins) || {};
   cfg.plugins.forEach(p => { if (p && typeof p.afterDatasetsDraw === "function") p.afterDatasetsDraw(this, {}, op[p.id]); });
  }
 }
 MockChart.prototype.destroy = function(){ window.__destroyed++; byCanvas.delete(this.canvas); };
 MockChart.getChart = function(canvas){ return byCanvas.get(canvas) || null; };
 MockChart.defaults = { animation: true, font: {}, plugins: { legend: { labels: {} }, tooltip: {} } };
 window.Chart = MockChart;
})();
`;

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no"); }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
   fs.createReadStream(f).pipe(r);
  });
  s.listen(0, "127.0.0.1", () => res(s));
 });
}

function dades(nomMon) {
 const ara = Date.now(), iso = h => new Date(ara - h * 36e5).toISOString();
 const pt = (nom, h, pc, tema, ev) => ({ nom, ts: iso(h), pc, tema: tema || "Tema 1", event: ev || "tema" });
 const evoSessions = [
  pt("Àlex", 30, 90), pt("Àlex", 12, 85, "Repàs", "examen"),
  pt("Berta", 25, 72), pt("Berta", 10, 60),
  pt("Pau", 20, 55),
  pt("Roc", 18, 35), pt("Roc", 6, 20)
 ];
 const evoMon = [pt("Àlex", 8, 92), pt("Berta", 4, 78)];
 const logs = [
  { id: 1, ts: iso(5), assig: nomMon, nom: "Àlex", sessio: "s1", aparell: "a1", event: "entra", detall: { punts: 120 } },
  { id: 2, ts: iso(4), assig: nomMon, nom: "Berta", sessio: "s2", aparell: "a2", event: "tema", detall: { tid: "t1", pc: 78 } }
 ];
 return { evoSessions, evoMon, logs };
}

function respon(st, f, cos) {
 if (f === "bn_admin_logs") return st.logs;
 if (f === "bn_admin_ids" || f === "bn_aspectes") return [];
 if (f === "bn_admin_resum") return { periode: cos.p_periode || "7d", ara: { nens: 4, sessions: 5, minuts: 45, nota: 68, encert: 72 }, abans: null };
 if (f === "bn_admin_activitat") return [{ dia: new Date().toISOString().slice(0, 10), nom: "Àlex", minuts: 20 }];
 if (f === "bn_admin_calor") return [{ dw: 1, h: 18, minuts: 15, accions: 3, nens: 2 }];
 if (f === "bn_admin_evolucio") return cos.p_assig ? st.evoMon : st.evoSessions;
 if (f === "bn_admin_fonts_dia") return { periode: cos.p_periode || "7d", dies: [], total: {} };
 if (f === "bn_admin_domini" || f === "bn_admin_fallades" || f === "bn_admin_alertes") return [];
 if (f === "bn_admin_control") return { xat_actiu: true, xat_obert_ara: true, xat_en_horari_tancat: false, horari: { actiu: false, tanca_min: 1290, obre_min: 420 }, mons_tancats: [] };
 if (f === "bn_admin_xat_resum") return { frases: 0 };
 return undefined;
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obre(opc = {}) {
  const st = dades(opc.mon || "angles");
  const ctx = await nav.newContext({ viewport: opc.viewport || { width: 1280, height: 900 }, colorScheme: opc.fosc ? "dark" : "light" });
  const p = await ctx.newPage(); p.setDefaultTimeout(6000);
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {};
   const resp = respon(st, f, cos);
   if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no"}' });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) });
  });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: MOCK_CHART_JS }));
  await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), CRED);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + "/admin/"); await p.waitForSelector("#shell:not([hidden])");
  const menu = async v => { const sel = await p.isVisible("#navInf") ? "#navInf" : "#nav"; await p.click(`${sel} [data-v="${v}"]`); };
  return { ctx, p, errors, menu };
 }

 try {
  console.log("1) Desktop · Sessions → Activitat: mida, llindars 50/70, filtres i pantalla completa");
  {
   const { ctx, p, errors, menu } = await obre();
   await menu("sessions");
   await p.click('main .pestanyes button[data-vtab="activitat"]');
   await p.waitForSelector("#gEvoBox .evo-bar");

   const altInline = await p.$eval("#gEvoBox .cv-evo", el => el.getBoundingClientRect().height);
   ok(altInline >= 340, `alçada ampliada en línia (${Math.round(altInline)} px >= 340 px)`);

   const dIni = await p.evaluate(() => {
    const ch = window.__charts.filter(c => c.id === "gEvo").pop();
    return {
     labels: ch.cfg.data.datasets.map(d => d.label),
     llindars: ch.cfg.options.plugins.evoLlindars.linies,
     res: document.querySelector("#gEvoBox .evo-res").textContent.trim()
    };
   });
   ok(JSON.stringify(dIni.labels) === JSON.stringify(["Àlex", "Berta", "Pau", "Roc"]), "tots 4 nens visibles sense filtre");
   ok(dIni.res === "4 nens · 7 notes", `comptador inicial («${dIni.res}»)`);
   ok(dIni.llindars.length === 2 && dIni.llindars[0].v === 50 && dIni.llindars[1].v === 70 && /70%/.test(dIni.llindars[1].t), "línies de llindar 50% i 70% configurades");

   await p.click('#gEvoBox [data-ef="bones"]');
   const dBones = await p.evaluate(() => {
    const ch = window.__charts.filter(c => c.id === "gEvo").pop();
    return { labels: ch.cfg.data.datasets.map(d => d.label), res: document.querySelector("#gEvoBox .evo-res").textContent.trim(), destroyed: window.__destroyed };
   });
   ok(JSON.stringify(dBones.labels) === JSON.stringify(["Àlex", "Berta"]) && dBones.res === "2 nens · 3 notes", `filtre Bones (≥ 70%): ${dBones.res}`);
   ok(dBones.destroyed >= 1, "destrueix la instància Chart anterior en filtrar");

   await p.click('#gEvoBox [data-ef="fluixes"]');
   const dFluixes = await p.evaluate(() => window.__charts.filter(c => c.id === "gEvo").pop().cfg.data.datasets.map(d => d.label));
   ok(JSON.stringify(dFluixes) === JSON.stringify(["Berta", "Pau", "Roc"]), "filtre Fluixes (< 70%) mostra Berta, Pau i Roc");

   await p.click('[data-evo-amp="gEvo"]');
   await p.waitForSelector("#evoDlg[open] #gEvoModalBox");
   const modalInfo = await p.evaluate(() => ({
    alt: document.querySelector("#evoDlg .cv-evo").getBoundingClientRect().height,
    actiu: document.querySelector('#gEvoModalBox .evo-f[aria-pressed="true"]').dataset.ef,
    titol: document.querySelector("#evoDlgT").textContent.trim()
   }));
   ok(modalInfo.alt >= 500, `modal pantalla completa té canvas gran (${Math.round(modalInfo.alt)} px >= 500 px)`);
   ok(modalInfo.actiu === "fluixes", "el modal hereta el filtre actiu de la targeta");
   ok(modalInfo.titol.includes("Evolució de les notes"), "títol del modal correcte");

   await p.click('#gEvoModalBox [data-ef="dolentes"]');
   const dDolentesModal = await p.evaluate(() => window.__charts.filter(c => c.id === "gEvoModal").pop().cfg.data.datasets.map(d => d.label));
   ok(JSON.stringify(dDolentesModal) === JSON.stringify(["Roc"]), "filtre Dolentes (< 50%) dins modal deixa només Roc");

   await p.keyboard.press("Escape");
   await p.waitForSelector("#evoDlg:not([open])", { state: "hidden" });
   const synced = await p.$eval('#gEvoBox .evo-f[aria-pressed="true"]', b => b.dataset.ef);
   ok(synced === "dolentes", "en tancar el modal, la targeta conserva el filtre seleccionat dins del modal");

   ok(errors.length === 0, "cap error de JS a desktop");
   await ctx.close();
  }

  console.log("2) Mons → Fitxa del món → Resum: filtre buit conserva controls i modal porta nom del món");
  {
   const { ctx, p, errors, menu } = await obre({ mon: "angles" });
   await menu("mons");
   await p.waitForSelector('tr[data-mon="angles"]');
   await p.click('tr[data-mon="angles"]');
   await p.waitForSelector("#gMonEvoBox .evo-bar");

   await p.click('#gMonEvoBox [data-ef="dolentes"]');
   const buitVis = await p.isVisible("#gMonEvoBox .evo-buit");
   const filtsVis = await p.isVisible("#gMonEvoBox .evo-filts");
   ok(buitVis && filtsVis, "quan un filtre té 0 notes mostra missatge buit però manté els filtres visibles");

   await p.click('#gMonEvoBox [data-ef="totes"]');
   await p.click('[data-evo-amp="gMonEvo"]');
   await p.waitForSelector("#evoDlg[open]");
   const tMon = await p.$eval("#evoDlgT", el => el.textContent.trim());
   ok(tMon.includes("Anglès"), `títol del modal inclou el món («${tMon}»)`);
   await p.click("#evoDlgTanca");
   await p.waitForSelector("#evoDlg:not([open])", { state: "hidden" });
   ok(errors.length === 0, "cap error de JS a fitxa de món");
   await ctx.close();
  }

  console.log("3) Mòbil 360px, 390px i 430px en tema fosc: sense scroll horitzontal i modal responent");
  for (const w of [360, 390, 430]) {
   const { ctx, p, errors, menu } = await obre({ viewport: { width: w, height: 780 }, fosc: true });
   await menu("sessions");
   await p.click('main .pestanyes button[data-vtab="activitat"]');
   await p.waitForSelector("#gEvoBox .evo-bar");
   const ov1 = await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
   ok(ov1, `sense desbordament horitzontal a ${w}px (tema fosc)`);
   await p.click('[data-evo-amp="gEvo"]');
   await p.waitForSelector("#evoDlg[open]");
   const dlgRect = await p.$eval("#evoDlg", el => el.getBoundingClientRect());
   ok(dlgRect.width <= w && dlgRect.height >= 400, `modal a ${w}px cap dins pantalla (${Math.round(dlgRect.width)}x${Math.round(dlgRect.height)} px)`);
   ok(errors.length === 0, `cap error de JS a ${w}px`);
   await ctx.close();
  }
 } finally {
  await nav.close();
  srv.close();
 }

 console.log(fallades ? `\n✗ ${fallades} fallades` : "\n✓ Totes les comprovacions d'Evolució de les notes superades");
 process.exit(fallades ? 1 : 0);
})();
