#!/usr/bin/env node
// Bona Nota · prova automàtica de la sincronització amb el núvol d'un món (n2522), amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-nuvol.js
// Engega un servidor estàtic local sobre l'arrel del repo i simula les crides a Supabase (page.route): no toca res de debò.
// El cas real (Biel, 9 nov 2026): un aparell amb el progrés vell (71 ⭐) obre el món amb el nen ja actiu, no baixa el núvol (366 ⭐)
// i, en jugar, hi desa els seus 71 per sobre. Casos:
//  1) aparell vell amb el nen actiu: en obrir el món baixa el núvol, es queda amb 366 i mai puja menys de 366
//  2) si no pot baixar el núvol (error de xarxa), no hi puja res
//  3) el núvol respon -2 (té més estrelles): torna a baixar, fusiona i puja un sol cop més
//  4) -2 sempre: no entra en bucle (2 intents com a màxim)
//  5) els tests i jocs registrats porten les estrelles del món (punts) i les fonts, perquè el rànquing no se'n perdi cap
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml" };
const MON = "/bio-i-geo/univers/", CL = "bn_biogeo_";
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

const AHIR = Date.now() - 86400000, FA3DIES = Date.now() - 3 * 86400000;
// aparell: el nen «Prova» ja és l'actiu d'aquest món, amb PIN, i té el progrés vell (71 ⭐)
const SEED = { bn_jugador: "Prova", bn_pins: JSON.stringify({ prova: "1234A" }), bn_vol: "0",
 [CL + "perfils"]: JSON.stringify({ Prova: { nom: "Prova", id: 77, punts: 71, temes: {}, fonts: { temes: 40, jocs: 31 }, mod: FA3DIES } }), [CL + "actiu"]: "Prova" };
const nuvol = p => ({ estat: { nom: "Prova", id: 77, punts: p, temes: {}, fonts: { temes: 200, jocs: p - 200 > 0 ? p - 200 : 0 } }, mod: AHIR, log: null, reinici: 0 });

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 // obre el món amb l'estat de l'aparell i una resposta simulada per a cada funció de Supabase
 // (respostes: valor fix, {status} o funció (cos, n) → valor, on n és quantes vegades s'ha cridat abans aquella funció)
 async function obre(respostes) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } }), p = await ctx.newPage();
  const crides = [], logs = [], n = {};
  await p.route("**/rest/v1/rpc/**", r => { const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON(); crides.push({ f, cos });
   let resp = respostes[f]; if (typeof resp === "function") resp = resp(cos, n[f] = (n[f] || 0) + 1);
   if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
   if (resp && resp.status) return r.fulfill({ status: resp.status, contentType: "application/json", body: resp.body || "{}" });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) }) });
  await p.route("**/rest/v1/bn_log", r => { try { logs.push(r.request().postDataJSON()) } catch (e) {} r.fulfill({ status: 201, body: "" }) });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.addInitScript(s => { if (!sessionStorage.getItem("_seed")) { for (const k in s) localStorage.setItem(k, s[k]); sessionStorage.setItem("_seed", "1") } }, SEED);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + MON); await p.waitForTimeout(1500);
  const desades = () => crides.filter(c => c.f === "bn_progres_desa").map(c => +(c.cos.p_estat || {}).punts);
  return { p, ctx, crides, logs, errors, desades, punts: () => p.evaluate(() => S.punts) };
 }
 const base = extra => Object.assign({ bn_perfil_id: 77, bn_punts_mons: [], bn_reinicis: {}, bn_progres_desa: c => c.p_mod }, extra);

 console.log("1) aparell vell (71 ⭐) amb el nen actiu i el núvol a 366 ⭐");
 { const { p, ctx, crides, errors, desades, punts } = await obre(base({ bn_progres_llegeix: nuvol(366), bn_punts_maxim: 366 }));
  ok(crides.some(c => c.f === "bn_progres_llegeix"), "en obrir el món baixa el progrés del núvol");
  ok(await punts() === 366, `es queda amb 366 ⭐ (té ${await punts()})`);
  await p.evaluate(() => { desa(); return nuvolPuja() }); await p.waitForTimeout(400);
  const d = desades();
  ok(d.length > 0 && d.every(x => x >= 366), `al núvol només hi puja 366 o més (pujades: ${d.join(", ") || "cap"})`);
  ok((await p.textContent("body")).includes("366 en aquest món") || (await p.textContent("#punts")).includes("366"), "la pantalla mostra les 366 ⭐");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("2) no pot baixar el núvol (error de xarxa)");
 { const { p, ctx, errors, desades, punts } = await obre(base({ bn_progres_llegeix: { status: 500 }, bn_punts_maxim: { status: 500 } }));
  await p.evaluate(() => { desa(); return nuvolPuja() }); await p.waitForTimeout(400);
  ok(desades().length === 0, `no puja el progrés vell al núvol (pujades: ${desades().join(", ") || "cap"})`);
  ok(await punts() === 71, "a l'aparell es queda el que tenia (71 ⭐)");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("3) el núvol respon -2 (un altre aparell hi ha posat més estrelles)");
 { const { p, ctx, errors, desades, punts } = await obre(base({ bn_progres_llegeix: (c, n) => nuvol(n === 1 ? 60 : 366), bn_punts_maxim: 0,
    bn_progres_desa: (c, n) => n === 1 ? -2 : c.p_mod }));
  await p.waitForTimeout(500);
  const d = desades();
  ok(d.length === 2 && d[0] === 71 && d[1] === 366, `torna a baixar, fusiona i puja 366 (pujades: ${d.join(", ") || "cap"})`);
  ok(await punts() === 366, `l'aparell es queda amb 366 ⭐ (té ${await punts()})`);
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("4) el núvol respon sempre -2");
 { const { p, ctx, errors, desades } = await obre(base({ bn_progres_llegeix: nuvol(60), bn_punts_maxim: 0, bn_progres_desa: -2 }));
  await p.waitForTimeout(800);
  ok(desades().length === 2, `no entra en bucle: ${desades().length} intents (han de ser 2)`);
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("5) els tests i jocs registrats porten les estrelles del món");
 { const { p, ctx, logs, errors } = await obre(base({ bn_progres_llegeix: nuvol(366), bn_punts_maxim: 366 }));
  await p.evaluate(() => { registra("test", { tema: "x", pc: 100 }); registra("joc", { joc: "y", pc: 80 }) }); await p.waitForTimeout(300);
  const t = logs.find(l => l.event === "test"), j = logs.find(l => l.event === "joc");
  ok(t && t.detall.punts === 366 && t.detall.fonts && typeof t.detall.fonts === "object", "el test porta punts: 366 i les fonts");
  ok(j && j.detall.punts === 366, "el joc porta punts: 366");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("6) PIN incorrecte com a codi normal sense raise (issue #33: {ok:false,codi:'pin'} i -3)");
 { const { p, ctx, errors, desades } = await obre(base({ bn_progres_llegeix: { ok: false, codi: "pin" }, bn_punts_maxim: 0 }));
  await p.waitForTimeout(400);
  const pins = await p.evaluate(() => JSON.parse(localStorage.getItem("bn_pins") || "{}"));
  ok(!pins.prova, "quan bn_progres_llegeix torna {ok:false,codi:'pin'}, esborra el PIN caducat de l'aparell");
  ok(desades().length === 0, "i no intenta pujar el progrés amb el PIN caducat");
  const errDesa = await p.evaluate(() => rpc("bn_progres_desa", { p_nom: "Prova", p_pin: "0000A", p_assig: "biogeo", p_estat: {}, p_mod: 1 }).then(() => "ok", e => e));
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }
 { const { p, ctx } = await obre(base({ bn_progres_llegeix: nuvol(366), bn_punts_maxim: 366, bn_progres_desa: -3 }));
  const errDesa = await p.evaluate(() => rpc("bn_progres_desa", { p_nom: "Prova", p_pin: "0000A", p_assig: "biogeo", p_estat: {}, p_mod: 1 }).then(() => "ok", e => e));
  ok(errDesa === "pin", `bn_progres_desa amb resposta -3 es tracta com a error 'pin' (rebut: ${errDesa})`); await ctx.close() }

 await nav.close(); srv.close();
 console.log(fallades ? `errors: ${fallades}` : "errors: cap");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
