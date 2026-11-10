#!/usr/bin/env node
// Bona Nota · prova automàtica del pas 4 de la fase B (n2537):
//   - M5: nivells al tauler (llista de nens, fitxa i pestanya «Al núvol»), llegits d'admin/regles.json
//   - M7: embut d'alta a la portada (index.html), al perfil (perfil/index.html) i a l'admin (admin/index.html)
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-alta.js
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r) });
  s.listen(0, "127.0.0.1", () => res(s)) });
}

function dadesAdmin() {
 const ara = Date.now(), dia = n => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }, iso = h => new Date(ara - h * 36e5).toISOString();
 const log = (nom, assig, h, event, detall, aparell) => ({ id: 0, ts: iso(h), assig, nom, sessio: "s-" + nom, aparell: aparell || "a1", event, detall });
 const logs = [
  log("Pau", "socials", 2, "entra", { punts: 120 }),
  log("Pau", "divisibilitat", 5, "temps", { s: 300, punts: 40 }),
  log("Laia", "biogeo", 3, "entra", { punts: 15 }),
  // Events d'alta: un d'abans de tenir perfil (_alta) i un amb perfil (Pau). No han de sortir a Nens ni als filtres d'assignatura/nen, però sí al Log complet.
  log("_alta", "portada", 1, "alta", { pas: "pin_ko", ok: 0, motiu: "exemple" }, "alta:ap-nou"),
  log("Pau", "portada", 1, "alta", { pas: "perfil", ok: 1 }, "a1")
 ];
 const fitxa = {
  pau: { k: "pau", perfil: { nom: "Pau", id: 3, pin_v: 2, creat: ara - 5 * 864e5, pin_ts: ara - 5 * 864e5, aspecte_ts: ara - 4 * 864e5 }, amagat: false, mons: [
   { assig: "divisibilitat", mod: ara - 7200e3, ts: ara - 7200e3, reinici: null, punts: 40, temps: 1800, dies: 4, dia_ult: dia(-1), ultim: 2,
    temes: {}, rep: [], rep_n: 0, rep_avui: 0, ob: {}, examens: [], boss: null, apresos: 0, jocs: {}, fonts: { temes: 40 }, ftema: {}, fjoc: {}, est: null },
   { assig: "socials", mod: ara - 3600e3, ts: ara - 3600e3, reinici: null, punts: 120, temps: 5400, dies: 9, dia_ult: dia(0), ultim: 1,
    temes: {}, rep: [], rep_n: 0, rep_avui: 0, ob: {}, examens: [], boss: null, apresos: 0, jocs: {}, fonts: { temes: 120 }, ftema: {}, fjoc: {}, est: null }
  ] }
 };
 const altes = [
  { k: "pau", nom: "Pau", alta: ara - 5 * 864e5, primer: ara - 6 * 864e5, creat: ara - 5 * 864e5, pin_ts: ara - 5 * 864e5, aspecte_ts: ara - 4 * 864e5, id: 3, mons: 2, punts: 160, dies7: 4, amagat: false, te_pin: true }
 ];
 const embut = {
  periode: "7d",
  resum: { aparells_inici: 6, aparells_nom_ok: 5, aparells_pin_creat: 3, aparells_encallats_pin: 2, aparells_perfil: 2, aparells_ara_no: 1, entrades_directes_mon: 1 },
  passos: [
   { pas: "nom", total: 7, ok: 5, ko: 2, aparells: 6, motius: { existeix: 1, prohibit: 1 } },
   { pas: "pin_ko", total: 4, ok: 0, ko: 4, aparells: 2, motius: { exemple: 2, format: 1, no_coincideix: 1 } },
   { pas: "pin_creat", total: 3, ok: 3, ko: 0, aparells: 3, motius: {} },
   { pas: "perfil", total: 2, ok: 2, ko: 0, aparells: 2, motius: {} },
   { pas: "pin_ara_no", total: 1, ok: 1, ko: 0, aparells: 1, motius: {} }
  ]
 };
 return { logs, fitxa, altes, embut };
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obreAdmin(url, opcions) {
  const o = opcions || {}, d = dadesAdmin();
  const ctx = await nav.newContext({ viewport: o.viewport || { width: 1280, height: 900 } }), p = await ctx.newPage(), crides = [];
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {};
   crides.push({ f, cos });
   if (f === "bn_admin_logs") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(d.logs) });
   if (f === "bn_admin_ids" || f === "bn_aspectes") return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   if (f === "bn_admin_usuari" && cos.p_accio === "estat") return r.fulfill({ status: 200, contentType: "application/json", body: "6" });
   if (f === "bn_admin_fitxa") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(d.fitxa[String(cos.p_nom || "").trim().toLowerCase()] || { k: "?", perfil: null, amagat: false, mons: [] }) });
   if (f === "bn_admin_altes") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(d.altes) });
   if (f === "bn_admin_alta_embut") {
    if (o.embut404) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(Object.assign({}, d.embut, { periode: cos.p_periode || "7d" })) });
   }
   return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
  });
  if (o.regles) {
   await p.route("**/admin/regles.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(o.regles) }));
  }
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  if (o.cred) await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), o.cred);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url); await p.waitForSelector("#shell:not([hidden])");
  const menu = async v => { if (await p.isVisible("#obreMenu")) await p.click("#obreMenu"); await p.click(`#nav [data-v="${v}"]`) };
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null }, s);
  return { p, ctx, crides, errors, menu, txt };
 }

 console.log("1) Admin ?demo: nivells (M5) i embut d'alta (M7) sense cap crida al núvol");
 {
  const { p, ctx, crides, errors, menu, txt } = await obreAdmin("/admin/?demo");
  await menu("nens");
  await p.waitForSelector("#embutCos table");
  const emTxt = await txt("#embutAlta");
  ok(emTxt.includes("Embut d'alta") && (await p.$$("#embutCos .kpi")).length === 6 && (await p.$$("#tEmbut tbody tr")).length === 5,
   "targeta «Embut d'alta» en mode demo amb 6 KPIs i els 5 passos");
  const nensTxt = await txt("#tNens");
  ok(nensTxt.includes("Nivell") && (await p.$$("#tNens .niv-p")).length >= 5,
   "taula de Nens mostra la columna Nivell amb les pastilles de nivell");
  await p.click('#tNens [data-obre-nen="àlex"]');
  await p.waitForSelector("#tb-nuv");
  const detTxt = await txt("#contingut");
  ok(detTxt.includes("Nivell") && (await p.$$(".perfil .niv-p")).length === 1,
   "fitxa del nen mostra el nivell a la capçalera i als KPIs");
  await p.click("#tb-nuv");
  await p.waitForSelector('#nuv[data-estat="fet"]');
  ok((await p.$$("#nuv .niv-p")).length >= 1, "pestanya «Al núvol» mostra el nivell del nen");
  ok(crides.length === 0 && errors.length === 0, "cap crida a Supabase ni error de JS en mode demo");
  await ctx.close();
 }

 console.log("2) Admin amb credencials: M5 (regles.json) + M7 (embut d'alta, exclusió de _alta i portada, i Log complet)");
 {
  const { p, ctx, crides, errors, menu, txt } = await obreAdmin("/admin/", { cred: CRED });
  await menu("nens");
  await p.waitForSelector("#embutCos table");
  const cEmbut = crides.find(x => x.f === "bn_admin_alta_embut");
  ok(!!cEmbut && cEmbut.cos.p_email === CRED.e && cEmbut.cos.p_periode === "7d",
   "bn_admin_alta_embut es crida amb les credencials i el període actiu (7d)");
  const emTxt = await txt("#embutAlta");
  ok(emTxt.includes("Ha posat l'exemple 4587R") && emTxt.includes("El nom ja té PIN") && emTxt.includes("Nom no permès"),
   "taula de l'embut mostra els motius d'entrebanc llegibles");

  // Filtres i taula de Nens: _alta i portada NO hi han de sortir
  const nensTxt = await txt("#tNens");
  const fAssigTxt = await txt("#fAssig");
  const fNenTxt = await txt("#fNen");
  ok(!nensTxt.includes("_alta") && !fNenTxt.includes("_alta") && !fAssigTxt.includes("portada"),
   "_alta i assig=portada no surten ni a la taula de Nens ni als selectors de filtre");

  // Nivells de Pau (160 ⭐ total, 120 ⭐ al món més alt → nivell 6 · Mestre segons NIVELLS d'admin/regles.json)
  const filaPau = await txt('#tNens tr:has([data-obre-nen="pau"])');
  ok(filaPau.includes("6 · Mestre") && filaPau.includes("160"),
   "a la taula de Nens en Pau (màx 120 ⭐ a un món, 160 ⭐ totals) té el nivell 6 · Mestre segons admin/regles.json");
  const filaLaia = await txt('#tNens tr:has([data-obre-nen="laia"])');
  ok(filaLaia.includes("2 · Explorador") && filaLaia.includes("15"),
   "a la taula de Nens la Laia (15 ⭐) té el nivell 2 · Explorador");

  // Fitxa d'en Pau i pestanya Al núvol (socials=120 ⭐ → 6 · Mestre, divisibilitat=40 ⭐ → 3 · Investigador)
  await p.click('#tNens [data-obre-nen="pau"]');
  await p.waitForSelector("#tb-nuv");
  await p.click("#tb-nuv");
  await p.waitForSelector('#nuv[data-estat="fet"]');
  const nuvTxt = await txt("#nuv");
  ok(nuvTxt.includes("6 · Mestre") && nuvTxt.includes("3 · Investigador") && nuvTxt.includes("falten 20 ⭐ per a Campió"),
   "a «Al núvol» es mostra el nivell de cada món (6 · Mestre per a 120 ⭐ i 3 · Investigador per a 40 ⭐) i les estrelles que falten");

  // Log complet: sí que ha de mostrar els events alta (tant el de _alta com el de Pau)
  await menu("log");
  await p.waitForSelector("#tl table");
  const logTxt = await txt("#tl");
  ok(logTxt.includes("Error de PIN") && logTxt.includes("Aparell (abans de perfil)") && logTxt.includes("Perfil arcade triat"),
   "la vista «Log complet» sí que mostra els events «alta» i etiqueta «_alta» com a «Aparell (abans de perfil)»");
  ok(errors.length === 0, "cap error de JS a la consola");
  await ctx.close();
 }

 console.log("3) Admin M5: si admin/regles.json canvia els llindars, el tauler fa servir els nous i si bn_admin_alta_embut dóna 404 mostra l'avís SQL");
 {
  const reglesCustom = { NIVELLS: [[0, "NovellProva", "🌱"], [50, "CrackProva", "🚀"]], APROVA: 80 };
  const { p, ctx, errors, menu, txt } = await obreAdmin("/admin/", { cred: CRED, regles: reglesCustom, embut404: true });
  await menu("nens");
  await p.waitForSelector("#embutCos .avis");
  const avTxt = await txt("#embutCos");
  ok(avTxt.includes("supabase/bn_admin_alta.sql"), "si bn_admin_alta_embut respon 404, surt l'avís d'executar supabase/bn_admin_alta.sql");
  const nensTxt = await txt("#tNens");
  ok(nensTxt.includes("2 · CrackProva") && nensTxt.includes("1 · NovellProva"),
   "el tauler llegeix NIVELLS dinàmicament d'admin/regles.json");
  ok(errors.length === 0, "cap error de JS");
  await ctx.close();
 }

 console.log("4) Portada (index.html) i Perfil (perfil/index.html): l'embut d'alta envia els passos i MAI el PIN ni el nom d'abans del perfil");
 {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } }), p = await ctx.newPage();
  const logsEnviats = [];
  let fallaCanviPin = false;
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  await p.route("**/rest/v1/bn_log*", r => {
   const cos = r.request().postDataJSON();
   if (cos) logsEnviats.push(cos);
   return r.fulfill({ status: 201, contentType: "application/json", body: "" });
  });
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {};
   if (f === "bn_ranking" || f === "bn_ranquing" || f === "bn_aspectes") return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   if (f === "bn_xat_llegeix") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ actiu: true, msgs: [] }) });
   if (f === "bn_perfil_existeix") {
    const n = String(cos.p_nom || "").trim().toLowerCase();
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(n === "laia" || n === "pau") });
   }
   if (f === "bn_progres_llegeix") {
    const n = String(cos.p_nom || "").trim().toLowerCase();
    if (n === "laia" && cos.p_pin !== "8392M") return r.fulfill({ status: 400, contentType: "application/json", body: '{"message":"pin incorrecte"}' });
    return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
   }
   if (f === "bn_perfil_crea") {
    const n = String(cos.p_nom || "").trim().toLowerCase();
    if (n === "tonto") return r.fulfill({ status: 400, contentType: "application/json", body: '{"message":"nom no permes"}' });
    if (n === "ocupat") return r.fulfill({ status: 200, contentType: "application/json", body: '"existeix"' });
    return r.fulfill({ status: 200, contentType: "application/json", body: '"ok"' });
   }
   if (f === "bn_perfil_canvia_pin") {
    if (fallaCanviPin) return r.fulfill({ status: 503, contentType: "application/json", body: '{"message":"xarxa"}' });
    return r.fulfill({ status: 200, contentType: "application/json", body: '"ok"' });
   }
   if (f === "bn_aspecte_desa") return r.fulfill({ status: 200, contentType: "application/json", body: '"ok"' });
   return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + "/");
  await p.waitForSelector("#entrada:not([hidden])");

  // 4a) Nom no permès ("tonto") amb un PIN vàlid ("2345B")
  await p.fill("#enNom", "tonto");
  await p.fill("#enPin", "2345B");
  await p.click("#entrada button[type=submit]");
  await p.waitForTimeout(120);
  ok(logsEnviats.some(l => l.event === "alta" && l.nom === "_alta" && /^alta:/.test(l.aparell) && l.detall.pas === "nom" && l.detall.ok === 0 && l.detall.motiu === "prohibit"),
   "nom no permès envia pas=nom, ok=0, motiu=prohibit amb nom='_alta' i aparell='alta:...'");

  // 4b) Nom que ja té PIN ("Laia") → escriu PIN incorrecte ("9999Z")
  await p.fill("#enNom", "Laia");
  await p.fill("#enPin", "9999Z");
  await p.click("#entrada button[type=submit]");
  await p.waitForTimeout(120);
  ok(logsEnviats.some(l => l.event === "alta" && l.nom === "_alta" && l.detall.pas === "pin_ko" && l.detall.motiu === "incorrecte"),
   "PIN incorrecte envia pas=pin_ko, motiu=incorrecte amb nom='_alta'");

  // 4c) Nom nou ("SecretNom") → prova format dolent ("12"), exemple ("4587R") i finalment crea el PIN ("2345B")
  await p.fill("#enNom", "SecretNom");
  await p.fill("#enPin", "12");
  await p.click("#entrada button[type=submit]");
  await p.fill("#enPin", "4587R");
  await p.click("#entrada button[type=submit]");
  await p.waitForTimeout(80);

  // Comprova que abans de crear el perfil, "SecretNom" NO ha sortit a cap log
  ok(!JSON.stringify(logsEnviats).includes("SecretNom"),
   "abans de tenir perfil, el nom escrit ('SecretNom') no s'ha enviat a bn_log");

  await p.fill("#enPin", "2345B");
  await p.click("#entrada button[type=submit]");
  await p.waitForTimeout(150);

  ok(logsEnviats.some(l => l.event === "alta" && l.nom === "_alta" && l.detall.pas === "nom" && l.detall.ok === 1),
   "pas=nom amb ok=1 continua portant nom='_alta' i aparell='alta:...'");
  ok(logsEnviats.some(l => l.event === "alta" && l.nom === "SecretNom" && !/^alta:/.test(l.aparell) && l.detall.pas === "pin_creat" && l.detall.ok === 1),
   "un cop creat el perfil, pin_creat porta el nom del perfil i l'aparell normal");

  // 4d) Perfil (/perfil/): triar una habilitat i desar el perfil envia pas='perfil', ok=1
  await p.goto(BASE + "/perfil/");
  await p.waitForSelector("#cats .sk");
  await p.click("#cats .sk");
  await p.click("#btDesa");
  await p.waitForTimeout(150);
  ok(logsEnviats.some(l => l.event === "alta" && l.nom === "SecretNom" && l.detall.pas === "perfil" && l.detall.ok === 1),
   "desar el perfil a /perfil/ envia event=alta, pas=perfil, ok=1");

  // 4e) PIN antic ("Pau", PIN "1234") → obre #npPop → prova no_coincideix → falla xarxa i prem «Ara no» → envia pas='pin_ara_no'
  await p.goto(BASE + "/");
  await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await p.reload();
  await p.waitForSelector("#entrada:not([hidden])");
  await p.fill("#enNom", "Pau");
  await p.fill("#enPin", "1234");
  await p.click("#entrada button[type=submit]");
  await p.waitForSelector("#npPop:not([hidden])");
  await p.fill("#npP1", "2345B");
  await p.fill("#npP2", "2345C");
  await p.click("#npForm button[type=submit]");
  fallaCanviPin = true;
  await p.fill("#npP2", "2345B");
  await p.click("#npForm button[type=submit]");
  await p.waitForSelector("#npAra:not([hidden])");
  await p.click("#npAra");
  await p.waitForTimeout(120);

  const motiusKo = logsEnviats.filter(l => l.detall && l.detall.pas === "pin_ko").map(l => l.detall.motiu);
  ok(motiusKo.includes("format") && motiusKo.includes("exemple") && motiusKo.includes("no_coincideix"),
   "s'han registrat els motius format, exemple (4587R) i no_coincideix a pin_ko");
  ok(logsEnviats.some(l => l.event === "alta" && l.nom === "Pau" && l.detall.pas === "pin_ara_no" && l.detall.ok === 1),
   "prémer «Ara no» al canvi de PIN antic envia event=alta, pas=pin_ara_no, ok=1");

  // Comprovació de privadesa estricta: cap PIN ("9999Z", "4587R", "2345B", "2345C", "1234") ni "tonto" ni "punts" apareix a cap bn_log
  const totJson = JSON.stringify(logsEnviats);
  ok(!totJson.includes("9999Z") && !totJson.includes("4587R") && !totJson.includes("2345B") && !totJson.includes("2345C") && !totJson.includes("1234") && !totJson.includes("tonto") && !totJson.includes('"punts"'),
   "PRIVADESA: cap PIN, cap nom rebutjat ('tonto') i cap camp 'punts' s'ha enviat mai a bn_log");
  ok(errors.length === 0, "cap error de JS a la portada ni al perfil");
  await ctx.close();
 }

 await nav.close(); srv.close();
 if (fallades) { console.error(`\n✗ ${fallades} comprovacions han fallat`); process.exit(1) }
 console.log("\n✓ Totes les comprovacions de nivells (M5) i embut d'alta (M7) han passat");
})();
