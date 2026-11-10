#!/usr/bin/env node
// Bona Nota · prova automàtica de la pàgina de perfil (perfil/index.html) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-perfil.js
// Engega un servidor estàtic local sobre l'arrel del repo i simula les crides a Supabase (page.route): no toca res de debò.
// Casos: 1) sense nen entrat · 2) tria i desa (núvol «ok») · 3) la funció SQL encara no hi és (404) → queda pendent i es puja després
//        4) PIN incorrecte · 5) Sorpresa · 6) «Efectes suaus»: cap animació.
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
 const SEED = { bn_jugador: "Prova", bn_pins: JSON.stringify({ prova: "1234A" }), bn_vol: "0",
  bn_biogeo_perfils: JSON.stringify({ Prova: { nom: "Prova", id: 77, punts: 30, temes: {} } }) };
 // obre la pàgina amb un estat de l'aparell i una resposta simulada per a cada funció de Supabase
 async function obre(seed, respostes, extra) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, ...(extra || {}) }), p = await ctx.newPage();
  const crides = [];
  await p.route("**/rest/v1/rpc/**", r => { const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON(); crides.push({ f, cos });
   const resp = (respostes || {})[f]; if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
   if (resp && resp.status) return r.fulfill({ status: resp.status, contentType: "application/json", body: resp.body || "" });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) }) });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.addInitScript(s => { for (const k in s) localStorage.setItem(k, s[k]) }, seed || {});
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + "/perfil/"); await p.waitForTimeout(300);
  return { p, ctx, crides, errors, asp: () => p.evaluate(() => JSON.parse(localStorage.getItem("bn_aspectes") || "{}")) };
 }

 console.log("1) sense nen entrat");
 { const { p, ctx, errors } = await obre({});
  ok(await p.isVisible("#sense"), "surt l'avís «entra amb el teu nom»");
  ok(!(await p.isVisible("#app")) && (await p.$$(".sk")).length === 0, "no hi ha graella ni fitxa");
  ok((await p.getAttribute("#sense a.en-bt", "href")) === "../", "l'enllaç porta a la portada");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("2) tria animal, perfil i estil i desa (núvol «ok»)");
 { const { p, ctx, crides, errors, asp } = await obre(SEED, { bn_aspecte_desa: "ok" });
  ok(await p.isVisible("#app") && (await p.textContent("#fNom")).includes("Prova") && (await p.textContent("#fNom")).includes("#77"), "fitxa amb el nom i l'id");
  ok((await p.$$(".an")).length === 20 && (await p.$$(".sk")).length === 50 && (await p.$$(".est")).length === 3, "20 animals, 50 perfils i 3 estils");
  ok((await p.getAttribute("#btDesa", "aria-disabled")) === "true", "«Desa» desactivat sense canvis");
  await p.click('.an[data-an="whale"]'); await p.waitForTimeout(250);
  ok((await p.getAttribute('.an[data-an="whale"]', "aria-checked")) === "true" && (await p.textContent("#rodaPeu")) === "Balena", "animal triat amb clic");
  await p.focus('.an[data-an="whale"]'); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(250);
  ok((await p.getAttribute('.an[data-an="fox"]', "aria-checked")) === "true" || (await p.evaluate(() => document.querySelector(".an.on").dataset.an)) !== "whale", "les fletxes del teclat canvien l'animal");
  await p.click('.sk[data-sk="ninja"]'); await p.waitForTimeout(350);
  ok((await p.getAttribute('.sk[data-sk="ninja"]', "aria-checked")) === "true" && (await p.textContent("#fSk")) === "NINJA", "perfil triat amb clic i nom a la fitxa");
  await p.focus('.sk[data-sk="ninja"]'); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(350);
  ok((await p.textContent("#fSk")) === "PILOT F1", "les fletxes del teclat canvien el perfil");
  await p.click('.est[data-v="A"]'); await p.waitForTimeout(350);
  ok((await p.getAttribute('.est[data-v="A"]', "aria-checked")) === "true" && (await p.textContent("#fEst")).includes("OFENSIVA"), "estil triat");
  ok((await p.getAttribute("#btDesa", "aria-disabled")) === "false", "«Desa» activat amb canvis");
  await p.click("#btDesa"); await p.waitForTimeout(600);
  const a = (await asp()).prova, c = crides.find(x => x.f === "bn_aspecte_desa");
  ok(a && a.sk === "pilot_f1" && a.v === "A" && BN_AV_OK(a.av) && !a.pendent, "guardat a l'aparell sense «pendent»: " + JSON.stringify(a));
  ok(c && c.cos.p_nom === "Prova" && c.cos.p_pin === "1234A" && c.cos.p_aspecte.sk === "pilot_f1" && c.cos.p_aspecte.v === "A", "la crida porta nom, PIN i aspecte");
  ok((await p.$$(".toast")).length === 1, "rètol «GUARDAT!»");
  await p.waitForTimeout(1600);
  ok((await p.textContent("#btDesa")).includes("RÀNQUING"), "el botó passa a «Veure'm al rànquing»");
  ok((await p.getAttribute("#btDesa", "aria-disabled")) === "false", "el botó torna a estar actiu");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("3) la funció SQL encara no existeix (404): queda pendent i es puja en tornar");
 { const { p, ctx, errors, asp } = await obre(SEED, {});
  await p.click('.sk[data-sk="piro"]'); await p.click("#btDesa"); await p.waitForTimeout(600);
  const a = (await asp()).prova;
  ok(a && a.sk === "piro" && a.pendent === true, "guardat amb «pendent»");
  ok((await p.textContent("#avis")).includes("Guardat en aquest aparell"), "avís de guardat a l'aparell");
  ok(errors.length === 0, "cap error de JavaScript"); await ctx.close();
  const seed2 = Object.assign({}, SEED, { bn_aspectes: JSON.stringify({ prova: { sk: "piro", v: "", pendent: true, mod: 1 } }) });
  const t = await obre(seed2, { bn_aspecte_desa: "ok" }); await t.p.waitForTimeout(500);
  const b = (await t.asp()).prova, cr = t.crides.find(x => x.f === "bn_aspecte_desa");
  ok(cr && cr.cos.p_aspecte.sk === "piro", "en tornar a obrir, reintenta la pujada");
  ok(b && !b.pendent && b.sk === "piro", "i treu la marca de pendent");
  ok((await t.p.textContent("#fSk")) === "PIRO", "la fitxa surt amb el perfil guardat"); await t.ctx.close() }

 console.log("4) PIN incorrecte (tant per HTTP 400 com per codi normal sense raise, issue #33)");
 { const { p, ctx, asp } = await obre(SEED, { bn_aspecte_desa: { status: 400, body: '{"message":"pin incorrecte"}' } });
  await p.click('.sk[data-sk="mag"]'); await p.click("#btDesa"); await p.waitForTimeout(600);
  ok((await asp()).prova.pendent === true, "queda pendent (HTTP 400)");
  ok(/PIN/.test(await p.textContent("#avis")) && (await p.$("#avis a")) !== null, "avís de PIN amb enllaç a la portada (HTTP 400)"); await ctx.close() }
 { const { p, ctx, asp } = await obre(SEED, { bn_aspecte_desa: "pin" });
  await p.click('.sk[data-sk="mag"]'); await p.click("#btDesa"); await p.waitForTimeout(600);
  ok((await asp()).prova.pendent === true, "queda pendent (codi 'pin' sense raise)");
  ok(/PIN/.test(await p.textContent("#avis")) && (await p.$("#avis a")) !== null, "avís de PIN amb enllaç a la portada (codi 'pin')"); await ctx.close() }
 { const { p, ctx, asp } = await obre(SEED, { bn_aspecte_desa: { ok: false, codi: "pin" } });
  await p.click('.sk[data-sk="mag"]'); await p.click("#btDesa"); await p.waitForTimeout(600);
  ok((await asp()).prova.pendent === true, "queda pendent (codi JSON {ok:false,codi:'pin'})");
  ok(/PIN/.test(await p.textContent("#avis")) && (await p.$("#avis a")) !== null, "avís de PIN amb enllaç a la portada (codi JSON)"); await ctx.close() }

 console.log("5) Sorpresa");
 { const { p, ctx } = await obre(SEED, { bn_aspecte_desa: "ok" });
  const abans = await p.evaluate(() => [document.querySelector(".an.on").dataset.an, (document.querySelector(".sk.on") || {}).dataset, document.querySelector(".est.on").dataset.v]);
  await p.click("#btSorpresa"); await p.waitForTimeout(2400);
  const despres = await p.evaluate(() => ({ av: document.querySelector(".an.on").dataset.an, sk: document.querySelector(".sk.on") && document.querySelector(".sk.on").dataset.sk, v: document.querySelector(".est.on").dataset.v, txt: document.querySelector("#fSk").textContent }));
  ok(despres.sk && despres.txt !== "Tria el teu perfil arcade", "ha triat un perfil: " + despres.sk);
  ok(despres.av !== abans[0], "ha canviat l'animal");
  ok((await p.getAttribute("#btDesa", "aria-disabled")) === "false", "«Desa» actiu després de la Sorpresa");
  ok(!(await p.isDisabled("#btSorpresa")), "el botó Sorpresa torna a estar actiu"); await ctx.close() }

 console.log("6) «Efectes suaus»: cap animació en marxa");
 { const { p, ctx } = await obre(Object.assign({}, SEED, { bn_suau: "1" }), { bn_aspecte_desa: "ok" });
  await p.click('.sk[data-sk="drifter"]'); await p.waitForTimeout(200);
  ok((await p.evaluate(() => document.body.classList.contains("suau") && document.getAnimations().length)) === 0, "cap animació CSS en marxa");
  await p.click("#btSorpresa"); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelector(".sk.on") !== null && document.querySelector("#btDesa").getAttribute("aria-disabled") === "false"), "la Sorpresa és instantània");
  await p.click("#btDesa"); await p.waitForTimeout(200);
  ok((await p.$$(".pluja")).length === 0, "sense pluja d'estrelles"); await ctx.close() }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de la pàgina de perfil passen");
 process.exit(fallades ? 1 : 0);
 function BN_AV_OK(av) { return typeof av === "string" && av.length > 0 }
})().catch(e => { console.error(e); process.exit(1) });
