#!/usr/bin/env node
// Bona Nota · prova E2E del flux de PIN temporal i sessió caducada a la portada i dins d'un món (g42,
// docs/superpowers/specs/2026-11-28-canvi-pin-perdut-pla-mestre.md), amb Playwright (Chromium).
// Ús: node motor/prova-pin-reset.js
// Comprova:
//   1) Portada (index.html): entrar amb PIN temporal (pin_temp: true) obre #npPop amb títol «TRIA EL TEU PIN NOU»,
//      sense botó «Ara no», rebutja repetir el mateix PIN temporal, accepta un PIN personal nou i el desa a localStorage.bn_pins.
//   2) Portada amb sessió vella oberta i PIN caducat (bn_progres_llegeix → pin): mostra l'avís #avisPinCaducat sense esborrar
//      el progrés local, i clicar «Escriu el PIN nou» obre el formulari amb el nom ja omplert.
//   3) Món (bio-i-geo/univers/): sessió oberta amb PIN caducat mostra #avisPinCaducatMon conservant les estrelles locals;
//      entrar amb un PIN temporal obre pantallaNouPin («Tria el teu PIN nou») i completa el canvi.

const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml" };
let fallades = 0, passades = 0;
const ok = (cond, msg) => { if (cond) { passades++; console.log("  ✓", msg) } else { fallades++; console.log("  ✗", msg) } };

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

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obre(url, respostes, seed = {}) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const crides = [];
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0];
   const cos = r.request().postDataJSON() || {};
   crides.push({ f, cos });
   let resp = respostes[f];
   if (typeof resp === "function") resp = resp(cos);
   if (resp === undefined) return r.fulfill({ status: 200, contentType: "application/json", body: "null" });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) });
  });
  await p.route("**/rest/v1/bn_log", r => r.fulfill({ status: 201, body: "" }));
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  if (Object.keys(seed).length) {
   await p.addInitScript(s => { if (!sessionStorage.getItem("_seed")) { for (const k in s) localStorage.setItem(k, s[k]); sessionStorage.setItem("_seed", "1") } }, seed);
  }
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url);
  return { ctx, p, crides, errors };
 }

 try {
  console.log("1) Portada: entrada amb PIN temporal obre modal obligatori i rebutja repetir el temporal");
  {
   const { ctx, p, crides, errors } = await obre("/", {
    bn_estat_web: { horari: { actiu: false }, mons_tancats: [] },
    bn_ranking_mons: [],
    bn_aspectes: [],
    bn_xat_llegeix: { actiu: false, msgs: [] },
    bn_perfil_existeix: true,
    bn_progres_llegeix: cos => cos.p_pin === "7392K" ? { mod: 1, estat: null, log: null, reinici: 0, pin_temp: true } : { ok: false, codi: "pin" },
    bn_perfil_canvia_pin: cos => cos.p_nou === "7392K" ? "mateix" : "ok"
   });
   await p.waitForSelector("#entrada:not([hidden]) #enNom");
   await p.fill("#enNom", "Rachita");
   await p.fill("#enPin", "7392K");
   await p.click('#entrada button[type="submit"]');
   await p.waitForSelector("#npPop:not([hidden])");
   const tit = await p.textContent("#npTit");
   ok(tit && tit.includes("TRIA EL TEU PIN NOU") && await p.isHidden("#npAra"), `obre #npPop amb títol temporal i sense botó «Ara no» (${tit})`);
   // Intenta repetir el mateix PIN temporal → rebutjat
   await p.fill("#npP1", "7392K");
   await p.fill("#npP2", "7392K");
   await p.click('#npForm button[type="submit"]');
   ok((await p.textContent("#npAvis")).includes("diferent del PIN temporal"), "rebutja reutilitzar el mateix PIN temporal");
   // Escriu un PIN personal nou → acceptat i desat
   await p.fill("#npP1", "8844M");
   await p.fill("#npP2", "8844M");
   await p.click('#npForm button[type="submit"]');
   await p.waitForSelector("#npPop", { state: "hidden" });
   const pins = await p.evaluate(() => JSON.parse(localStorage.getItem("bn_pins") || "{}"));
   ok(pins.rachita === "8844M" && crides.some(c => c.f === "bn_perfil_canvia_pin" && c.cos.p_nou === "8844M"), "desa el PIN personal nou 8844M i entra a la portada");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("2) Portada: sessió oberta amb PIN caducat mostra avís amable sense esborrar el progrés local");
  {
   const { ctx, p, errors } = await obre("/", {
    bn_estat_web: { horari: { actiu: false }, mons_tancats: [] },
    bn_ranking_mons: [],
    bn_aspectes: [],
    bn_xat_llegeix: { actiu: false, msgs: [] },
    bn_reinicis: {},
    bn_progres_llegeix: { ok: false, codi: "pin" }
   }, {
    bn_jugador: "Rachita",
    bn_pins: JSON.stringify({ rachita: "1111A" }),
    bn_soc_perfils: JSON.stringify({ Rachita: { nom: "Rachita", punts: 120, temes: {} } })
   });
   await p.waitForSelector("#avisPinCaducat:not([hidden]) #btPinCaducat");
   const progAbans = await p.evaluate(() => JSON.parse(localStorage.getItem("bn_soc_perfils") || "{}"));
   ok(progAbans.Rachita && progAbans.Rachita.punts === 120, "conserva intacte el progrés local (120 ⭐)");
   await p.click("#btPinCaducat");
   await p.waitForSelector("#entrada:not([hidden]) #enNom");
   ok((await p.inputValue("#enNom")) === "Rachita", "clicar «Escriu el PIN nou» obre el formulari amb el nom preomplert");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("3) Món: sessió caducada mostra #avisPinCaducatMon i PIN temporal obre pantallaNouPin");
  {
   const { ctx, p, errors } = await obre("/bio-i-geo/univers/", {
    bn_estat_web: { horari: { actiu: false }, mons_tancats: [] },
    bn_perfil_id: 7,
    bn_punts_mons: [],
    bn_punts_maxim: 0,
    bn_reinicis: {},
    bn_perfil_existeix: true,
    bn_progres_llegeix: cos => cos.p_pin === "7392K" ? { mod: 10, estat: null, log: null, reinici: 0, pin_temp: true } : { ok: false, codi: "pin" },
    bn_perfil_canvia_pin: "ok",
    bn_progres_desa: c => c.p_mod
   }, {
    bn_jugador: "Rachita",
    bn_pins: JSON.stringify({ rachita: "1111A" }),
    bn_vol: "0",
    bn_biogeo_actiu: "Rachita",
    bn_biogeo_perfils: JSON.stringify({ Rachita: { nom: "Rachita", id: 7, punts: 85, temes: {}, mod: Date.now() - 36e5 } })
   });
   await p.waitForSelector("#avisPinCaducatMon #btPinCaducatMon");
   ok((await p.evaluate(() => S.punts)) === 85, "el món conserva les 85 ⭐ locals i mostra l'avís de PIN caducat");
   await p.click("#btPinCaducatMon");
   await p.waitForSelector("#fp #pin");
   await p.fill("#pin", "7392K");
   await p.click('#fp button[type="submit"]');
   await p.waitForSelector("#fnp #pinN1");
   ok((await p.textContent("#app h2")).includes("Tria el teu PIN nou"), "en posar el PIN temporal dins del món, obre pantallaNouPin");
   await p.fill("#pinN1", "9123P");
   await p.fill("#pinN2", "9123P");
   await p.click('#fnp button[type="submit"]');
   await p.waitForSelector(".hero");
   const pins = await p.evaluate(() => JSON.parse(localStorage.getItem("bn_pins") || "{}"));
   ok(pins.rachita === "9123P", "desa el nou PIN personal 9123P i torna a l'inici del món");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }
 } finally {
  await nav.close();
  srv.close();
 }

 console.log(`\n${fallades === 0 ? "✓" : "✗"} prova-pin-reset: ${passades} passades, ${fallades} fallades`);
 process.exit(fallades ? 1 : 0);
})();
