#!/usr/bin/env node
// Bona Nota · prova automàtica de la guia per a les famílies (pares/index.html) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-pares.js
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r) });
  s.listen(0, "127.0.0.1", () => res(s)) });
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
 const p = await ctx.newPage();
 await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
 await p.route("https://fonts.gstatic.com/**", r => r.abort());
 await p.route("**/rest/v1/rpc/**", r => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
 const errors = [];
 p.on("pageerror", e => errors.push(e.message));

 console.log("1) enllaç des de la portada cap a /pares/ i contingut complet sense argot tècnic");
 await p.goto(BASE + "/");
 ok((await p.locator('footer a.pares-lk[href="pares/"]').count()) === 1, "la portada enllaça cap a pares/ des del peu");
 await p.click('footer a.pares-lk[href="pares/"]');
 await p.waitForSelector("main#contingut");
 ok(p.url().endsWith("/pares/"), "s'obre /pares/ des de la portada");

 for (const id of ["que-fa", "estrelles", "bon-us", "xat", "privadesa", "a-casa", "dubtes"]) {
  ok(await p.isVisible("#" + id), `secció #${id} visible`);
 }
 const txt = (await p.innerText("body")).toLowerCase();
 const prohibits = ["supabase", "localstorage", "postgresql", "bcrypt", "service worker", "json", "postgrest"];
 const trobats = prohibits.filter(w => txt.includes(w));
 ok(trobats.length === 0, "cap tecnicisme informàtic al text visible" + (trobats.length ? ": " + trobats.join(", ") : ""));
 ok(txt.includes("25 minuts") && txt.includes("21:30") && txt.includes("4 números i 1 lletra"), "explica el descans de 25 min, la nit (21:30) i el PIN");
 ok(txt.includes("mode tast anònim") && (await p.locator('#btParesTast[href="../?tast=1#mons"]').count()) === 1, "explica el mode tast anònim i porta el botó directe per tastar un món");
 ok((await p.locator("footer .bn-versio").textContent()).trim().startsWith("versió "), "porta el número de versió al peu");

 console.log("2) acordió de preguntes freqüents i retorn a la portada");
 const primerDet = p.locator("#dubtes details").first();
 ok(!(await primerDet.evaluate(el => el.open)), "les preguntes freqüents comencen plegades");
 await primerDet.locator("summary").click();
 ok(await primerDet.evaluate(el => el.open), "en clicar s'obre la resposta");

 console.log("3) sense desbordament ni pestanyes tallades al menú superior (360, 390, 430, 960 i 1280 px)");
 for (const w of [360, 390, 430, 960, 1280]) {
  await p.setViewportSize({ width: w, height: 844 });
  const est = await p.evaluate(() => {
   const desborda = document.documentElement.scrollWidth > window.innerWidth;
   const navBox = document.querySelector(".salt-llista").getBoundingClientRect();
   const tallades = [...document.querySelectorAll(".salt-llista a")].filter(a => {
    const r = a.getBoundingClientRect();
    return r.left < 0 || r.right > window.innerWidth || r.left < navBox.left - 1 || r.right > navBox.right + 1 || a.scrollWidth > a.clientWidth + 1;
   }).map(a => a.textContent.trim());
   return { desborda, tallades };
  });
  ok(!est.desborda && est.tallades.length === 0, `amplada ${w} px: sense scroll horitzontal i les 7 pestanyes senceres` + (est.tallades.length ? ` (tallades: ${est.tallades.join(", ")})` : ""));
 }

 await p.click("a.torna");
 await p.waitForSelector("main#mons");
 ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : ""));

 await ctx.close(); await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de pares/ passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
