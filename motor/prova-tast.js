#!/usr/bin/env node
// Bona Nota · prova automàtica del Mode Tast Anònim (pares/ → portada → món → perfil/) amb Playwright.
// Comprova: 3 portes d'entrada, Tema 1 + 1r joc + 1a oberta (lectura), límits amb convidaPin(),
// ZERO escriptures a bn_log / RPC d'usuari / bn-corregeix, i que localStorage dels germans queda 100 % intacte.
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = {
 ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
 ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml",
 ".png": "image/png", ".webmanifest": "application/manifest+json"
};
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };

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

const RPC_PROHIBIDES = [
 "bn_perfil_entra", "bn_perfil_crea", "bn_perfil_estat", "bn_perfil_desbloquejos",
 "bn_progres_llegeix", "bn_progres_desa", "bn_punts_altres", "bn_comparativa",
 "bn_xat_estat", "bn_xat_envia", "bn_xat_vota", "bn_aspecte_desa"
];

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
 const p = await ctx.newPage();

 const cridesProhibides = [];
 await p.route("**/*", r => {
  const u = r.request().url();
  if (/fonts\.googleapis\.com/.test(u)) return r.fulfill({ status: 200, contentType: "text/css", body: "" });
  if (/fonts\.gstatic\.com/.test(u)) return r.abort();
  if (/\/versio\.json/.test(u)) return r.fulfill({ status: 404, body: "" });
  if (/\/functions\/v1\//.test(u)) {
   cridesProhibides.push("edge:" + u);
   return r.fulfill({ status: 403, contentType: "application/json", body: '{"error":"prohibit"}' });
  }
  if (/\/rest\/v1\//.test(u)) {
   if (u.includes("/rest/v1/bn_log")) {
    cridesProhibides.push("bn_log:" + r.request().method());
    return r.fulfill({ status: 201, body: "" });
   }
   const m = u.match(/\/rest\/v1\/rpc\/([a-z0-9_]+)/i);
   const fn = m ? m[1] : "";
   if (RPC_PROHIBIDES.includes(fn)) cridesProhibides.push("rpc:" + fn);
   if (fn === "bn_estat_web") return r.fulfill({ status: 200, contentType: "application/json", body: '{"mons_tancats":["castellano"],"xat":{"actiu":true}}' });
   if (fn === "bn_vigilia") return r.fulfill({ status: 200, contentType: "application/json", body: '{"fase":"aprendre","dia0":"2026-11-10","examen":null}' });
   if (fn === "bn_xat_llegeix") {
    const ara = Date.now();
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ara, actiu: true, msgs: [{ id: 1, nom: "Jana", f: 1, p: 1, c: null, ts: ara, v: 2 }], vots: { 1: 2 }, ultims: [], mdd: null, off: { f: [], p: [] }, noves: [] }) });
   }
   if (fn === "bn_ranking_mons") return r.fulfill({ status: 200, contentType: "application/json", body: '[{"nom":"Jana","punts":80,"dies":4,"setmana":25,"mons":{"socials":80}}]' });
   return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  }
  return r.continue();
 });

 const errors = [];
 p.on("pageerror", e => errors.push(e.message));

 // Pre-sembrem 2 germans (MAX_NOMS = 2 ple!) a l'aparell per demostrar que el Mode Tast no els toca gens
 await p.goto(BASE + "/pares/");
 await p.evaluate(() => {
  localStorage.setItem("bn_jugador", "Jan");
  localStorage.setItem("bn_noms_aparell", JSON.stringify(["Jan", "Pau"]));
  localStorage.setItem("bn_pins", JSON.stringify({ jan: "1234A", pau: "5678B" }));
  localStorage.setItem("bn_socials_actiu", "Jan");
  localStorage.setItem("bn_socials_perfils", JSON.stringify({ Jan: { punts: 42, niv: 2 } }));
 });
 cridesProhibides.length = 0;

 console.log("1) Porta des de /pares/ cap a la portada en mode tast sense tocar la sessió desada del germà");
 await p.click("#btParesTast");
 await p.waitForSelector("#hola .hola-tast");
 ok(p.url().includes("tast=1"), "la portada s'obre amb ?tast=1");
 ok(await p.isVisible("#enTastEntra") && await p.isVisible("#enTastSurt"), "es mostren els botons d'entrar amb PIN i sortir del tast");
 ok((await p.locator('a.as[data-id="socials"] .juga').textContent()).includes("TASTA"), "les targetes obertes diuen «TASTA ▶»");
 await p.waitForFunction(() => document.querySelector('a.as[data-id="castellano"]').classList.contains("mon-tancat"));
 ok(await p.locator('a.as[data-id="castellano"]').evaluate(el => el.classList.contains("mon-tancat")), "un món tancat per l'admin continua tancat en mode tast");

 console.log("2) Rànquing visible i Xat de la Colla en mode només lectura");
 await p.click("#btHs");
 await p.waitForSelector("#hs .podi");
 await p.click('.hs-tab[data-t="xat"]');
 await p.waitForSelector("#xLock .xl-t");
 ok((await p.locator("#xLock .xl-t").textContent()).includes("MODE TAST"), "el xat indica MODE TAST ANÒNIM");
 ok(await p.locator("#xEnvia").isDisabled(), "el botó d'enviar al xat està desactivat");
 await p.click("#hsTanca");

 console.log("3) Entrada a un món en mode tast: Tema 1, 1r joc i 1a oberta de lectura; resta tancada amb convidaPin()");
 await p.click('a.as[data-id="socials"]');
 await p.waitForSelector("#tastBanner:not([hidden])");
 ok(p.url().includes("/sociales/t3-clima/") && p.url().includes("tast=1"), "navega al món amb ?tast=1");
 ok((await p.locator("#punts").textContent()).includes("Tast anònim"), "el comptador superior mostra «👀 Tast anònim» en lloc d'estrelles");

 // Tema 1 obert: fitxa + targetes + 5 preguntes de mostra sense sumar estrelles
 await p.evaluate(() => { obre(0); pest = "test"; pintaTema(); });
 ok((await p.locator("#zona .prog").first().textContent()).includes("Pregunta 1 de 5"), "el test del Tema 1 té exactament 5 preguntes de mostra");
 for (let i = 0; i < 5; i++) {
  await p.evaluate(() => {
   const q = tema.q.find(x => x[0] === document.querySelector(".pregunta").innerHTML);
   [...document.querySelectorAll(".opt")].find(o => +o.dataset.i === q[2]).click();
   document.getElementById("seg").click();
  });
 }
 ok((await p.locator("#zona").textContent()).includes("Has completat la mostra del Tema 1"), "surt la pantalla final de mostra del Tema 1");
 ok((await p.evaluate(() => S.punts)) === 0, "acabar la mostra del Tema 1 manté 0 estrelles");

 // Tema 2 bloquejat -> convidaPin
 await p.evaluate(() => obre(1));
 ok(await p.isVisible("#popTastWrap"), "el Tema 2 obre el diàleg amable convidaPin()");
 await p.click("#btTastSegueix");
 ok(!(await p.isVisible("#popTastWrap")), "es pot tancar el diàleg i seguir tastant");

 // 1r joc obert, 2n joc i exàmens i boss bloquejats
 const jocsIds = await p.evaluate(() => ASSIG.jocs.map(j => j.id));
 await p.evaluate(id => joc(id), jocsIds[0]);
 ok(!(await p.isVisible("#popTastWrap")), "el 1r joc del món s'obre en mode tast");
 if (jocsIds[1]) {
  await p.evaluate(id => joc(id), jocsIds[1]);
  ok(await p.isVisible("#popTastWrap"), "el 2n joc del món demana entrar amb nom i PIN");
  await p.evaluate(() => tancaConvidaPin());
 }
 for (const fn of ["examen", "examenReal", "boss"]) {
  await p.evaluate(f => window[f](), fn);
  ok(await p.isVisible("#popTastWrap"), `${fn}() obre convidaPin() en mode tast`);
  await p.evaluate(() => tancaConvidaPin());
 }

 // 1a oberta només lectura (sense textarea #resp ni resposta model), 2a oberta bloquejada
 await p.evaluate(() => obertes(0));
 ok((await p.locator("#app").textContent()).includes("Mostra · Pregunta 1"), "la 1a pregunta oberta es mostra com a exemple de lectura");
 ok((await p.locator("#resp").count()) === 0, "la 1a oberta no mostra cap camp d'escriptura ni foto");
 await p.evaluate(() => obertes(1));
 ok(await p.isVisible("#popTastWrap"), "la 2a pregunta oberta obre convidaPin()");
 await p.evaluate(() => tancaConvidaPin());

 // Comprova que una tercera clau no s'hagi escrit a localStorage (ni tan sols bn_mons_tancats)
 const lsClausMon = await p.evaluate(() => Object.keys(localStorage).sort().join(","));
 ok(lsClausMon === "bn_jugador,bn_noms_aparell,bn_pins,bn_socials_actiu,bn_socials_perfils", `localStorage intacte dins del món (${lsClausMon})`);

 console.log("4) /perfil/?tast=1 no agafa el nom del germà i noms reservats es rebutgen");
 await p.goto(BASE + "/perfil/?tast=1");
 await p.waitForSelector("#sense:not([hidden])");
 ok(await p.isVisible("#sense"), "/perfil/?tast=1 demana entrar i no modifica el perfil d'en Jan");

 await p.goto(BASE + "/?tast=1");
 await p.click("#enTastSurt");
 const lsDespres = await p.evaluate(() => ({
  jugador: localStorage.getItem("bn_jugador"),
  noms: localStorage.getItem("bn_noms_aparell"),
  socialsActiu: localStorage.getItem("bn_socials_actiu"),
  socialsPunts: JSON.parse(localStorage.getItem("bn_socials_perfils") || "{}").Jan?.punts,
  tastSessio: sessionStorage.getItem("bn_tast")
 }));
 ok(lsDespres.jugador === "Jan" && lsDespres.noms === '["Jan","Pau"]' && lsDespres.socialsActiu === "Jan" && lsDespres.socialsPunts === 42 && !lsDespres.tastSessio,
  "en sortir del tast es restaura intacta la sessió d'en Jan i els 2 germans de localStorage");

 // Comprovació del botó #btTastPortada sense cap sessió i rebuig de noms reservats
 await p.evaluate(() => localStorage.clear());
 await p.goto(BASE + "/");
 await p.waitForSelector("#btTastPortada");
 await p.fill("#enNom", "Convidat");
 await p.fill("#enPin", "1234A");
 await p.click('#entrada button[type="submit"]');
 ok((await p.locator("#enAvis").textContent()).includes("no es pot fer servir"), "el formulari rebutja noms reservats com «Convidat»");
 await p.click("#btTastPortada");
 ok(await p.isVisible("#hola .hola-tast"), "el botó #btTastPortada activa el mode tast des de la portada");

 // També la porta #btTastMon des de la benvinguda d'un món sense sessió
 await p.evaluate(() => sessionStorage.clear());
 await p.goto(BASE + "/sociales/t3-clima/");
 await p.waitForSelector("#btTastMon");
 await p.click("#btTastMon");
 await p.waitForSelector("#tastBanner:not([hidden])");
 ok(await p.isVisible("#tastBanner"), "el botó #btTastMon activa el mode tast des de la benvinguda del món");

 ok(cridesProhibides.length === 0, "zero peticions a bn_log, bn-corregeix ni RPC d'usuari" + (cridesProhibides.length ? ": " + cridesProhibides.join(", ") : ""));
 ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : ""));

 await ctx.close(); await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions del Mode Tast Anònim passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
