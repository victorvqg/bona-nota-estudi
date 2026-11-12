#!/usr/bin/env node
// Bona Nota · prova automàtica de:
//   - M5: nivells al tauler (llista de nens, fitxa i pestanya «Al núvol»), llegits d'admin/regles.json
//   - Control ràpid (n2537): activar/desactivar xat, horari automàtic i mons per separat a l'admin i a la web (portada i món)
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
  log("Laia", "biogeo", 3, "entra", { punts: 15 })
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
 const ctrl = {
  xat_actiu: true,
  xat_obert_ara: true,
  xat_en_horari_tancat: false,
  horari: { actiu: true, tanca_min: 1290, obre_min: 420 },
  mons_tancats: []
 };
 return { logs, fitxa, altes, ctrl };
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
   if (f === "bn_admin_ids") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ k: "pau", nom: "Pau", id: 1 }, { k: "laia", nom: "Laia", id: 2 }, { k: "leyre", nom: "Leyre", id: 3 }, { k: "sebastià", nom: "Sebastià", id: null }]) });
   if (f === "bn_aspectes") return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   if (f === "bn_admin_usuari" && cos.p_accio === "estat") return r.fulfill({ status: 200, contentType: "application/json", body: "6" });
   if (f === "bn_admin_fitxa") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(d.fitxa[String(cos.p_nom || "").trim().toLowerCase()] || { k: "?", perfil: null, amagat: false, mons: [] }) });
   if (f === "bn_admin_altes") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(d.altes) });
   if (f === "bn_admin_resum") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", ara: { nens: 2, dies: 3, minuts: 15, sessions: 3, tests: 4, nota: 80, aprovats: 75, encert: 80, respostes: 24 }, abans: null }) });
   if (["bn_admin_activitat", "bn_admin_calor", "bn_admin_domini", "bn_admin_fallades", "bn_admin_evolucio", "bn_admin_alertes", "bn_admin_errors_taller", "bn_admin_rep_pendents"].includes(f)) {
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   }
   if (f === "bn_admin_benestar") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", mons: [], nens: [] }) });
   if (f === "bn_admin_fonts_dia") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", dies: [], total: {} }) });
   if (f === "bn_admin_dificultat") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ min_respostes: 8, dies: 365, assig: null, resum: { preguntes_vistes: 0, amb_dades: 0, dificils: 0, normals: 0, facils: 0 }, preguntes: [] }) });
   if (f === "bn_admin_control") {
    if (cos.p_cfg && typeof cos.p_cfg === "object") {
     if (typeof cos.p_cfg.xat_actiu === "boolean") d.ctrl.xat_actiu = cos.p_cfg.xat_actiu;
     if (typeof cos.p_cfg.horari_actiu === "boolean") d.ctrl.horari.actiu = cos.p_cfg.horari_actiu;
     if (typeof cos.p_cfg.tanca_min === "number") d.ctrl.horari.tanca_min = cos.p_cfg.tanca_min;
     if (typeof cos.p_cfg.obre_min === "number") d.ctrl.horari.obre_min = cos.p_cfg.obre_min;
     if (Array.isArray(cos.p_cfg.mons_tancats)) d.ctrl.mons_tancats = cos.p_cfg.mons_tancats.slice();
     d.ctrl.xat_obert_ara = d.ctrl.xat_actiu;
    }
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(d.ctrl) });
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

 console.log("1) Admin ?demo: panell de Control ràpid i nivells (M5) sense cap crida al núvol, i sense Embut d'alta");
 {
  const { p, ctx, crides, errors, menu, txt } = await obreAdmin("/admin/?demo");
  await p.waitForSelector("#control #ctrlXatSw");
  const ctrlTxt = await txt("#control");
  ok(ctrlTxt.includes("Control ràpid: Xat, Horari i Mons") && (await p.$$("#control [data-ctrl-mon]")).length === 7,
   "targeta «Control ràpid: Xat, Horari i Mons» al Tauler amb els 7 mons");
  await menu("nens");
  ok((await p.$("#embutAlta")) === null, "s'ha tret «Embut d'alta» de la vista Nens");
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

 console.log("2) Admin amb credencials: activar/desactivar xat, horari i mons des de #control, i nivells M5");
 {
  const { p, ctx, crides, errors, menu, txt } = await obreAdmin("/admin/", { cred: CRED });
  await p.waitForSelector("#control #ctrlXatSw");
  // Tanquem el xat des del botó ràpid
  await p.click("#ctrlXatSw");
  await p.waitForTimeout(80);
  ok((await p.getAttribute("#ctrlXatSw", "aria-checked")) === "false" && (await txt("#ctrlXatEstat")).includes("Tancat manualment"),
   "clicar #ctrlXatSw tanca el xat i actualitza l'estat a «Tancat manualment»");

  // Canviem l'horari i el desem
  await p.fill("#ctrlTancaH", "22:00");
  await p.fill("#ctrlObreH", "07:30");
  await p.click("#ctrlHorariDesa");
  await p.waitForTimeout(80);
  const cHor = crides.filter(x => x.f === "bn_admin_control" && x.cos.p_cfg && x.cos.p_cfg.tanca_min === 1320 && x.cos.p_cfg.obre_min === 450);
  ok(cHor.length === 1, "Desa l'horari envia tanca_min=1320 (22:00) i obre_min=450 (07:30) a bn_admin_control");

  // Tanquem el món de Socials
  await p.click('#control [data-ctrl-mon="socials"]');
  await p.waitForTimeout(80);
  ok((await p.getAttribute('#control [data-ctrl-mon="socials"]', "aria-checked")) === "false" && (await txt("#ctrlMonsEstat")).includes("6 de 7 oberts"),
   "clicar l'interruptor d'un món el tanca i actualitza el comptador a «6 de 7 oberts»");

  // Comprovem els nivells a Nens i que #fNen mostra tots els nens de bn_admin_ids (encara que no tinguin registres al període)
  const fNenTxt = await txt("#fNen");
  ok(fNenTxt.includes("Leyre") && fNenTxt.includes("Sebastià") && fNenTxt.includes("Pau") && fNenTxt.includes("Laia"),
   "el filtre superior #fNen mostra tots els nens de bn_admin_ids encara que no tinguin registres en el període triat");
  await menu("nens");
  await p.waitForSelector("#tNens table");
  const filaPau = await txt('#tNens tr:has([data-obre-nen="pau"])');
  ok(filaPau.includes("6 · Mestre") && filaPau.includes("160"),
   "a la taula de Nens en Pau (màx 120 ⭐ a un món, 160 ⭐ totals) té el nivell 6 · Mestre segons admin/regles.json");
  await p.click('#tNens [data-obre-nen="pau"]');
  await p.waitForSelector("#tb-nuv");
  await p.click("#tb-nuv");
  await p.waitForSelector('#nuv[data-estat="fet"]');
  const nuvTxt = await txt("#nuv");
  ok(nuvTxt.includes("6 · Mestre") && nuvTxt.includes("3 · Investigador") && nuvTxt.includes("falten 20 ⭐ per a Campió"),
   "a «Al núvol» es mostra el nivell de cada món i les estrelles que falten");
  ok(errors.length === 0, "cap error de JS a la consola");
  await ctx.close();
 }

 console.log("3) Portada (index.html) i món: un món tancat surt en gris amb 🔒 TANCAT i no deixa entrar-hi, però conserva el rànquing");
 {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } }), p = await ctx.newPage();
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0];
   if (f === "bn_estat_web") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ xat_obert_ara: false, xat_en_horari_tancat: true, horari: { actiu: true, tanca_min: 1290, obre_min: 420 }, mons_tancats: ["socials"] }) });
   if (f === "bn_ranking" || f === "bn_ranquing") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ nom: "Pau", assig: "socials", punts: 120 }]) });
   if (f === "bn_aspectes") return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   if (f === "bn_xat_llegeix") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ actiu: false, msgs: [] }) });
   return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await p.addInitScript(() => {
   localStorage.setItem("bn_jugador", "Pau");
   localStorage.setItem("bn_pins", JSON.stringify({ pau: "4587A" }));
   localStorage.setItem("bn_noms_aparell", JSON.stringify(["Pau"]));
  });
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + "/");
  await p.waitForSelector('.as[data-id="socials"].mon-tancat');
  const txtSoc = await p.textContent('.as[data-id="socials"] .juga span');
  ok(txtSoc.includes("TANCAT"), "a la portada el món tancat ('socials') mostra «🔒 TANCAT»");

  // Intentem fer clic al món tancat: no ha de navegar i ha de mostrar l'avís
  await p.click('.as[data-id="socials"]', { force: true });
  await p.waitForSelector("#monTancatToast.vis");
  ok(p.url() === BASE + "/" && (await p.textContent("#monTancatToast")).includes("tancat"),
   "clicar un món tancat a la portada no hi entra i mostra l'avís que està tancat");

  // I si hi entra per enllaç directe (/sociales/t3-clima/), el món mostra la pantalla de món tancat
  await p.goto(BASE + "/sociales/t3-clima/");
  await p.waitForSelector("#monTancatBox");
  const monTxt = await p.textContent("#monTancatBox");
  ok(monTxt.includes("està tancat ara mateix") && monTxt.includes("Tria un altre món"),
   "entrar per enllaç directe a un món tancat mostra la pantalla «està tancat ara mateix»");
  ok(errors.length === 0, "cap error de JS a la portada ni al món");
  await ctx.close();
 }

 await nav.close(); srv.close();
 if (fallades) { console.error(`\n✗ ${fallades} comprovacions han fallat`); process.exit(1) }
 console.log("\n✓ Totes les comprovacions de nivells (M5) i control de xat/horari/mons han passat");
})();
