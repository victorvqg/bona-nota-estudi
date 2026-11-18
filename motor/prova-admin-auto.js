#!/usr/bin/env node
// Bona Nota · prova automàtica de l'actualització SENSE pantallasso a admin/index.html (fase 1 del pla
// docs/superpowers/specs/2026-11-18-admin-ordre-paginacio-pla-mestre.md), amb Playwright (Chromium).
// Comprova:
//   1) la comprovació automàtica (comprovaNovetats i el temporitzador) no toca la pantalla si no hi ha res nou;
//   2) amb accions noves només surt l'avís «N novetats · Mostra-les» i la vista no canvia;
//   3) «Mostra-les» repinta sense que es vegi cap esquelet (repintaSuau) i manté l'scroll;
//   4) a Inici, les 6 xifres canvien al seu lloc sense repintar la resta;
//   5) canviar el període tampoc ensenya esquelets;
//   6) una versió nova del tauler mostra la banda «Recarrega» i no recarrega sola.
// Ús: node motor/prova-admin-auto.js
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
 const noms = ["Pau", "Laia", "Jana", "Àlex", "Nora", "Hugo"];
 const logs = [];
 // prou sessions perquè la pàgina tingui scroll
 for (let i = 0; i < 60; i++) {
  const nom = noms[i % noms.length], s = "s" + i;
  logs.push({ id: 1000 - i * 2, ts: iso(2 + i * 3), assig: "socials", nom, sessio: s, aparell: "a" + (i % 3), event: "entra", detall: { punts: 10 + i } });
  logs.push({ id: 999 - i * 2, ts: iso(2 + i * 3 - 0.1), assig: "socials", nom, sessio: s, aparell: "a" + (i % 3), event: "test", detall: { tema: "t1", pc: 70 } });
 }
 logs.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
 return { logs, resum: { nens: 6, sessions: 60, minuts: 300, nota: 70, encert: 75 }, lents: false };
}

function respon(st, f, cos) {
 if (f === "bn_admin_logs") return st.logs;
 if (f === "bn_admin_ids" || f === "bn_aspectes") return [];
 if (f === "bn_admin_resum") return { periode: "7d", ara: st.resum, abans: null };
 if (f === "bn_admin_alertes" || f === "bn_admin_activitat" || f === "bn_admin_calor" || f === "bn_admin_evolucio" || f === "bn_admin_domini" || f === "bn_admin_fallades") return [];
 if (f === "bn_admin_altes") return [];
 if (f === "bn_admin_fonts_dia") return { periode: "7d", dies: [], total: {} };
 if (f === "bn_admin_control") return { xat_actiu: true, xat_obert_ara: true, xat_en_horari_tancat: false, horari: { actiu: false, tanca_min: 1290, obre_min: 420 }, mons_tancats: [] };
 if (f === "bn_admin_xat_resum") return { frases: 3 };
 return undefined;
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obre(url, opc = {}) {
  const st = dades();
  const ctx = await nav.newContext({ viewport: opc.viewport || { width: 1280, height: 800 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const crides = [];
  await p.route("**/rest/v1/rpc/**", async r => {
   const u = r.request().url(), f = u.split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {};
   crides.push({ f, limit: (u.match(/[?&]limit=(\d+)/) || [])[1] });
   const resp = respon(st, f, cos);
   if (st.lents && f !== "bn_admin_logs") await new Promise(x => setTimeout(x, 400));
   if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no"}' });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) });
  });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: MOCK_CHART_JS }));
  await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), CRED);
  // vigila si mai es veu un esquelet fora del #contingut amagat del repintat suau
  await p.addInitScript(() => {
   window.__esqVisibles = 0;
   new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1 || !window.__vigila) return;
    const es = [...(n.matches(".esq") ? [n] : []), ...n.querySelectorAll(".esq")];
    es.forEach(e => { if (!e.closest(".suau-nou")) window.__esqVisibles++ });
   }))).observe(document, { childList: true, subtree: true });
  });
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url); await p.waitForSelector("#shell:not([hidden])");
  return { ctx, p, st, crides, errors };
 }
 const marca = p => p.evaluate(() => { const e = document.querySelector("#contingut > *"); e.dataset.marcaProva = "1" });
 const teMarca = p => p.evaluate(() => !!document.querySelector('#contingut > [data-marca-prova="1"]'));

 try {
  console.log("1-3) Sessions: comprovació silenciosa, avís de novetats i «Mostra-les» sense esquelets");
  {
   const { ctx, p, st, crides, errors } = await obre("/admin/?v=sessions&p=curs");
   await p.waitForSelector("#tSes table");
   await marca(p);
   await p.evaluate(() => scrollTo(0, 400));
   const sy0 = await p.evaluate(() => scrollY);
   ok(sy0 > 0, `la pàgina de sessions té scroll (${sy0} px)`);

   const r1 = await p.evaluate(() => window.bnAdminComprovaNovetats());
   ok(r1 === false && await teMarca(p) && await p.isHidden("#novetats"), "sense accions noves: no surt l'avís i el contingut és el mateix (cap node canviat)");
   ok((await p.evaluate(() => scrollY)) === sy0 && (await p.$$("#contingut .esq")).length === 0, "l'scroll no es mou i no surt cap esquelet");
   const cLim = crides.filter(c => c.f === "bn_admin_logs").pop();
   ok(cLim && cLim.limit === "50", "la comprovació només demana les 50 últimes accions (?limit=50), no tot el registre");

   // temporitzador automàtic: amb dades iguals, en 6 s no es repinta mai
   const nAbans = crides.filter(c => c.f === "bn_admin_logs").length;
   await p.evaluate(() => { window.__BN_AUTO_MS = 1000 });
   await p.waitForTimeout(6500);
   const nDespres = crides.filter(c => c.f === "bn_admin_logs").length;
   ok(nDespres > nAbans, `el temporitzador comprova sol (${nDespres - nAbans} comprovacions en 6 s)`);
   ok(await teMarca(p) && (await p.evaluate(() => scrollY)) === sy0, "i amb dades iguals la pantalla no es toca");
   await p.evaluate(() => { window.__BN_AUTO_MS = 3600e3 });

   // arriba una acció nova: només l'avís
   st.logs.unshift({ id: 5000, ts: new Date().toISOString(), assig: "socials", nom: "Biel", sessio: "s-biel", aparell: "ab", event: "entra", detall: { punts: 50 } });
   const r2 = await p.evaluate(() => window.bnAdminComprovaNovetats());
   ok(r2 === true && !(await p.isHidden("#novetats")) && /1 novetat · Mostra-les/.test(await p.textContent("#novetats")), "amb 1 acció nova surt «1 novetat · Mostra-les»");
   ok(await teMarca(p) && !(await p.textContent("#tSes")).includes("Biel"), "la vista no canvia fins que es clica (en Biel encara no hi és)");

   // «Mostra-les»: repinta suau
   await p.evaluate(() => { window.__vigila = true; window.__esqVisibles = 0 });
   // clic directe (p.click fa scroll per arribar al botó de la capçalera enganxada i falsejaria la prova de l'scroll)
   await p.evaluate(() => document.querySelector("#novetats").click());
   await p.waitForFunction(() => (document.querySelector("#tSes")?.textContent || "").includes("Biel") && !document.querySelector(".suau-nou,#contingutVell"));
   const esq = await p.evaluate(() => { window.__vigila = false; return window.__esqVisibles });
   ok(esq === 0, `en clicar «Mostra-les» no es veu cap esquelet (${esq})`);
   ok(await p.isHidden("#novetats") && (await p.$$("#contingut")).length === 1, "l'avís desapareix i només queda un #contingut");
   { const sy1 = await p.evaluate(() => scrollY); ok(Math.abs(sy1 - sy0) <= 2, `l'scroll es manté després del repintat (${sy0} → ${sy1} px)`) }
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("4) Inici: les 6 xifres canvien al seu lloc");
  {
   const { ctx, p, st, errors } = await obre("/admin/");
   await p.waitForFunction(() => document.querySelectorAll("#iniciKpis .kpi").length === 6);
   await marca(p);
   await p.evaluate(() => window.bnAdminComprovaNovetats()); // fixa la base
   st.resum = { ...st.resum, sessions: 61 };
   st.logs.unshift({ id: 6000, ts: new Date().toISOString(), assig: "socials", nom: "Biel", sessio: "s-b2", aparell: "ab", event: "entra", detall: {} });
   await p.evaluate(() => window.bnAdminComprovaNovetats());
   await p.waitForFunction(() => /61/.test(document.querySelector("#iniciKpis")?.textContent || ""));
   ok(await teMarca(p), "la xifra de sessions passa a 61 i la resta de la pantalla no es repinta");
   ok(!(await p.isHidden("#novetats")), "i surt l'avís de novetats");
   ok(errors.length === 0, "cap error de JS");
   await ctx.close();
  }

  console.log("5) Canviar el període no ensenya esquelets");
  {
   const { ctx, p, st, errors } = await obre("/admin/?v=sessions");
   await p.waitForSelector("#tSes table");
   st.lents = true;
   await p.evaluate(() => { window.__vigila = true; window.__esqVisibles = 0 });
   await p.click('#periode button[data-d="30"]');
   await p.waitForFunction(() => !document.querySelector(".suau-nou,#contingutVell") && document.querySelector("#tSes table"));
   const esq = await p.evaluate(() => { window.__vigila = false; return window.__esqVisibles });
   ok(esq === 0 && p.url().includes("p=30d"), `canvi a 30 dies sense cap esquelet a la vista (${esq})`);
   ok(errors.length === 0, "cap error de JS");
   await ctx.close();
  }

  console.log("6) Versió nova: banda «Recarrega», sense recàrrega automàtica");
  {
   const { ctx, p, errors } = await obre("/admin/?v=sessions");
   await p.waitForSelector("#tSes table");
   await marca(p);
   const url0 = p.url();
   await p.evaluate(() => window.bnAdminAvisVersio("v-prova-nova"));
   await p.waitForTimeout(300);
   ok(!(await p.isHidden("#versioBar")) && p.url() === url0 && await teMarca(p), "surt la banda «Hi ha una versió nova del tauler» i la pàgina no es recarrega");
   await p.click("#btVersioMesTard");
   ok(await p.isHidden("#versioBar"), "«Més tard» amaga la banda");
   await p.evaluate(() => window.bnAdminAvisVersio("v-prova-nova"));
   ok(await p.isHidden("#versioBar"), "i no torna a sortir per a la mateixa versió");
   const src = fs.readFileSync(path.join(ARREL, "admin/index.html"), "utf8");
   const fn = src.slice(src.indexOf("function comprovaVersioAdmin("), src.indexOf("let VERSIO_MES_TARD"));
   ok(fn.length > 0 && !fn.includes("location.replace"), "comprovaVersioAdmin ja no fa location.replace");
   ok(errors.length === 0, "cap error de JS");
   await ctx.close();
  }
 } finally {
  await nav.close();
  srv.close();
 }
 console.log(fallades ? `\n✗ ${fallades} fallades` : "\n✓ Totes les comprovacions de l'actualització sense pantallasso superades");
 process.exit(fallades ? 1 : 0);
})();
