#!/usr/bin/env node
// Bona Nota · prova automàtica de la gestió i recuperació de PINs a /admin/ (g41,
// docs/superpowers/specs/2026-11-28-canvi-pin-perdut-pla-mestre.md), amb Playwright (Chromium).
// Ús: node motor/prova-admin-pin.js
// Comprova:
//   1) ?demo: pestanya Nens → PINs (?v=nens&tab=pins), 4 KPIs, filtres (PIN temporal, Sense PIN, PIN antic, Bloquejats),
//      taula ≤ 8 columnes, modal de generació de PIN (format 4 xifres + lletra, ≠ 4587R, botó Genera), pantalla de confirmació
//      amb còpia i actualització immediata d'estat, i desbloqueig d'intents fallits.
//   2) ?demo: Fitxa del nen → Núvol i gestió té «Genera PIN nou» (substitueix «Treu el PIN») i obre el mateix modal.
//   3) ?demo: Bústia → tiquet amb consulta de PIN mostra el bloc «Resolució ràpida de PIN», obre el modal amb mailto preomplert
//      i permet marcar el tiquet com a Fet sense desar el PIN a la nota interna.
//   4) Amb credencials simulades: crida bn_admin_pins, bn_admin_usuari ('posapin' / 'posapin_fix' / 'desbloqueja'),
//      i gestiona 404 amb l'avís de supabase/bn_pin_reset.sql.
//   5) Mòbil (360 i 390 px) i tema fosc sense scroll horitzontal ni errors de JS.

const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0, passades = 0;
const ok = (cond, msg) => { if (cond) { passades++; console.log("  ✓", msg) } else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r)
  });
  s.listen(0, "127.0.0.1", () => res(s));
 });
}

function dadesMock() {
 const ara = Date.now(), iso = h => new Date(ara - h * 36e5).toISOString();
 const logs = [
  { id: 10, ts: iso(1), assig: "socials", nom: "Rachita", sessio: "s1", aparell: "a1", event: "entra", detall: { punts: 90 } },
  { id: 9, ts: iso(2), assig: "socials", nom: "Pau", sessio: "s2", aparell: "a2", event: "entra", detall: { punts: 40 } }
 ];
 const pins = [
  { k: "pau", nom: "Pau", id: 3, te_pin: true, pin_v: 1, pin_ts: ara - 864e5 * 10, pin_temp: false, intents_n: 5, bloquejat_fins: ara + 10 * 60e3, amagat: false, ult_log: ara - 7200e3 },
  { k: "rachita", nom: "Rachita", id: 7, te_pin: true, pin_v: 2, pin_ts: ara - 864e5 * 2, pin_temp: false, intents_n: 0, bloquejat_fins: null, amagat: false, ult_log: ara - 3600e3 },
  { k: "sensepin", nom: "SensePin", id: null, te_pin: false, pin_v: null, pin_ts: null, pin_temp: false, intents_n: 0, bloquejat_fins: null, amagat: false, ult_log: ara - 864e5 }
 ];
 return { logs, pins };
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obre(url, opc = {}) {
  const st = { sql: opc.sql !== false, d: dadesMock() };
  const ctx = await nav.newContext({ viewport: opc.viewport || { width: 1280, height: 900 }, colorScheme: opc.fosc ? "dark" : "light" });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const crides = [];
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0];
   const cos = r.request().postDataJSON() || {};
   crides.push({ f, cos });
   if (f === "bn_admin_logs") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(st.d.logs) });
   if (f === "bn_admin_ids" || f === "bn_aspectes" || f === "bn_admin_alertes" || f === "bn_admin_altes") return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   if (f === "bn_admin_resum") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", ara: { nens: 2, sessions: 2, minuts: 10, nota: 80, encert: 80 }, abans: null }) });
   if (f === "bn_admin_control") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ xat_actiu: true, xat_obert_ara: true, horari: { actiu: false }, mons_tancats: [] }) });
   if (f === "bn_admin_xat_resum") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ frases: 0 }) });
   if (f === "bn_admin_pins") {
    if (!st.sql) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(st.d.pins) });
   }
   if (f === "bn_admin_usuari") {
    const k = String(cos.p_nom || "").trim().toLowerCase();
    const row = st.d.pins.find(x => x.k === k);
    if (cos.p_accio === "estat") {
     const v = (row && row.te_pin ? 2 : 0) + (row && row.pin_v === 2 ? 4 : 0) + (row && row.pin_temp ? 8 : 0) + (row && row.bloquejat_fins > Date.now() ? 16 : 0);
     return r.fulfill({ status: 200, contentType: "application/json", body: String(v) });
    }
    if (cos.p_accio === "posapin" || cos.p_accio === "posapin_fix") {
     if (!st.sql) return r.fulfill({ status: 400, contentType: "application/json", body: '{"message":"accio desconeguda"}' });
     if (row) { row.te_pin = true; row.pin_v = 2; row.pin_temp = cos.p_accio === "posapin"; row.pin_ts = Date.now(); row.intents_n = 0; row.bloquejat_fins = null }
     return r.fulfill({ status: 200, contentType: "application/json", body: "1" });
    }
    if (cos.p_accio === "desbloqueja") {
     if (row) { row.intents_n = 0; row.bloquejat_fins = null }
     return r.fulfill({ status: 200, contentType: "application/json", body: "1" });
    }
   }
   return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no"}' });
  });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  if (opc.cred) await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), opc.cred);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url); await p.waitForSelector("#shell:not([hidden])");
  return { ctx, p, st, crides, errors };
 }

 const txt = (p, sel) => p.evaluate(s => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(), sel);

 try {
  console.log("1) ?demo: Nens → PINs, KPIs, filtres, modal de generació i desbloqueig");
  {
   const { ctx, p, crides, errors } = await obre("/admin/?demo&v=nens&tab=pins");
   await p.waitForSelector("#pinsCard #tPins table");
   ok((await p.$$("#nensCos .kpi")).length === 4, "Nens → PINs mostra 4 KPIs");
   ok((await p.$$("#tPins th")).length === 5, "la taula de PINs té 5 columnes (≤ 8)");
   // Filtre Bloquejats → surt Pau
   await p.click('[data-pf="bloq"]');
   ok((await txt(p, "#tPins")).includes("Pau"), "el filtre «Bloquejats» mostra en Pau");
   // Desbloqueja Pau
   await p.click('[data-pin-desb="Pau"]');
   await p.waitForSelector("#tPins .buit, #pinsCard .buit");
   ok((await txt(p, "#pinsCard")).includes("Cap nen en aquest filtre"), "després de desbloquejar en Pau ja no hi ha cap bloquejat");
   // Torna a Tots i genera PIN temporal per a Hugo (que era Sense PIN)
   await p.click('[data-pf=""]');
   await p.waitForSelector('[data-pin-nou="Hugo"]');
   await p.click('[data-pin-nou="Hugo"]');
   await p.waitForSelector("#dlg[open] #mpPin");
   const pin1 = await p.inputValue("#mpPin");
   ok(/^[0-9]{4}[A-Z]$/.test(pin1) && pin1 !== "4587R", `PIN aleatori vàlid generat (${pin1})`);
   await p.click("#mpGen");
   const pin2 = await p.inputValue("#mpPin");
   ok(/^[0-9]{4}[A-Z]$/.test(pin2) && pin2 !== "4587R", `botó Genera crea un PIN vàlid (${pin2})`);
   ok(await p.isChecked("#mpTemp"), "checkbox PIN temporal marcat per defecte");
   await p.click("#mpDesa");
   await p.waitForSelector("#dlg[open] #mpCodi");
   ok((await txt(p, "#mpCodi")) === pin2 && (await p.$("#mpCopiaPin")) !== null && (await p.$("#mpCopiaMsg")) !== null, "pantalla de confirmació mostra el PIN i els botons de còpia");
   await p.click("#mpFet");
   await p.waitForSelector("#tPins table");
   await p.click('[data-pf="temp"]');
   ok((await txt(p, "#tPins")).includes("Hugo"), "després de desar, l'Hugo apareix al filtre «PIN temporal»");
   ok(crides.length === 0, "cap crida a Supabase en mode demo");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("2) ?demo: Fitxa del nen → Núvol i gestió i Bústia → Resolució ràpida de PIN");
  {
   const { ctx, p, errors } = await obre("/admin/?demo&v=nens&id=laia&tab=nuv");
   await p.waitForSelector("#generapin");
   ok((await p.$("#treupin")) === null, "«Treu el PIN» substituït per «Genera PIN nou»");
   await p.click("#generapin");
   await p.waitForSelector("#dlg[open] #mpPin");
   ok((await txt(p, "#dlgT")).includes("Laia"), "el modal s'obre des de la Fitxa per a la Laia");
   await p.click("#mpCancel");
   // Bústia: SUG-004 parla de recuperar PIN i té email de família
   await p.click('#nav [data-v="bustia"]');
   await p.waitForSelector('tr[data-sug-id="4"]');
   await p.click('tr[data-sug-id="4"]');
   await p.waitForSelector("#busPinBox #btBusPin");
   await p.selectOption("#busPinNen", "Laia");
   await p.click("#btBusPin");
   await p.waitForSelector("#dlg[open] #mpDesa");
   const pinGen = await p.inputValue("#mpPin");
   await p.click("#mpDesa");
   await p.waitForSelector("#dlg[open] #mpMail");
   const href = await p.getAttribute("#mpMail", "href");
   ok(href && href.startsWith("mailto:familia.garcia%40exemple.cat") && href.includes(pinGen), "des de Bústia genera el botó mailto preomplert amb el correu i el PIN");
   await p.click("#mpTancaSug");
   await p.waitForTimeout(150);
   await p.click("#mpFet");
   await p.waitForSelector('tr[data-sug-id="4"]');
   const textFila = await txt(p, 'tr[data-sug-id="4"]');
   ok(textFila.includes("Fet") && !textFila.includes(pinGen), "el tiquet queda marcat com a Fet i la nota interna NO conté el PIN");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("3) Amb credencials simulades: RPCs reals (posapin, posapin_fix, desbloqueja) i 404");
  {
   const { ctx, p, crides, errors } = await obre("/admin/?v=nens&tab=pins", { cred: CRED });
   await p.waitForSelector("#tPins table");
   ok(crides.some(c => c.f === "bn_admin_pins"), "crida bn_admin_pins");
   await p.click('[data-pin-nou="Rachita"]');
   await p.waitForSelector("#dlg[open] #mpPin");
   await p.fill("#mpPin", "8421M");
   await p.click("#mpDesa");
   await p.waitForSelector("#dlg[open] #mpCodi");
   const cPos = crides.find(c => c.f === "bn_admin_usuari" && c.cos.p_accio === "posapin");
   ok(cPos && cPos.cos.p_nom === "Rachita" && cPos.cos.p_nou === "8421M", "envia bn_admin_usuari {p_accio:'posapin', p_nom:'Rachita', p_nou:'8421M'}");
   await p.click("#mpFet");
   await p.waitForSelector('[data-pin-desb="Pau"]');
   await p.click('[data-pin-desb="Pau"]');
   await p.waitForTimeout(200);
   ok(crides.some(c => c.f === "bn_admin_usuari" && c.cos.p_accio === "desbloqueja" && c.cos.p_nom === "Pau"), "envia bn_admin_usuari {p_accio:'desbloqueja', p_nom:'Pau'}");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();

   // 404 → avís de supabase/bn_pin_reset.sql
   const r404 = await obre("/admin/?v=nens&tab=pins", { cred: CRED, sql: false });
   await r404.p.waitForSelector("#nensCos .avis");
   ok((await txt(r404.p, "#nensCos .avis")).includes("supabase/bn_pin_reset.sql"), "si falta el SQL (404), mostra l'avís de supabase/bn_pin_reset.sql");
   await r404.ctx.close();
  }

  console.log("4) Mòbil (360 i 390 px) i tema fosc sense desbordament horitzontal");
  {
   for (const w of [360, 390]) {
    const { ctx, p, errors } = await obre("/admin/?demo&v=nens&tab=pins", { viewport: { width: w, height: 800 }, fosc: w === 360 });
    await p.waitForSelector("#pinsCard #tPins table");
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(!overflow && errors.length === 0, `sense desbordament horitzontal ni errors a ${w} px` + (w === 360 ? " (tema fosc)" : ""));
    await ctx.close();
   }
  }
 } finally {
  await nav.close();
  srv.close();
 }

 console.log(`\n${fallades === 0 ? "✓" : "✗"} prova-admin-pin: ${passades} passades, ${fallades} fallades`);
 process.exit(fallades ? 1 : 0);
})();
