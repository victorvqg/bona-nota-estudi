#!/usr/bin/env node
// Bona Nota · prova automàtica de la pestanya «Al núvol» de la fitxa del nen i de la targeta «Nens nous» del panell d'admin
// (admin/index.html, n2537 fase B pas 1) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-fitxa.js
// Engega un servidor estàtic local sobre l'arrel del repo i simula Supabase amb page.route (bn_admin_fitxa i bn_admin_altes
// amb el contracte de .nucli/pla-n2537-b1.md): no toca res de debò.
// Casos: 1) ?demo: altes i «Al núvol» amb dades inventades (dos mons, sense PIN, PIN sense estat), pestanyes amb el teclat, cap crida
//        2) amb credencials: «Al núvol» crida bn_admin_fitxa (p_email, p_pass, p_nom) només en obrir-la i una sola vegada;
//           títols de tema de preguntes.json, xifres, repàs, exàmens, boss, món mal format; altes amb el període de dalt
//        3) XSS: preguntes de «fallades», «tid», claus de temes, jocs i fonts, i el nom d'una alta amb <img onerror> no s'executen
//        4) el SQL encara no hi és (404) → avís de supabase/bn_admin_fitxa.sql i la resta funciona · 5) mòbil (390 px), tema fosc.
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };
const XSS = '<img src=x onerror="window.__xss=1">';

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r) });
  s.listen(0, "127.0.0.1", () => res(s)) });
}

// dades simulades del servidor (el que tornarien bn_admin_fitxa i bn_admin_altes); hores en mil·lisegons d'època, dies 'AAAA-MM-DD' en UTC
function dades() {
 const ara = Date.now(), dia = n => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }, iso = h => new Date(ara - h * 36e5).toISOString();
 const log = (nom, assig, h, event, detall) => ({ id: 0, ts: iso(h), assig, nom, sessio: "s-" + nom, aparell: "a1", event, detall });
 const logs = [log("Pau", "socials", 2, "entra", { punts: 120 }), log("Pau", "divisibilitat", 5, "temps", { s: 300, punts: 40 }), log("Laia", "biogeo", 3, "entra", { punts: 10 }),
  log("Biel", "socials", 4, "entra", { punts: 0 }), log("Rita", "socials", 6, "entra", { punts: 5 })];
 const fitxa = {
  pau: { k: "pau", perfil: { nom: "Pau", id: 3, pin_v: 2, creat: ara - 5 * 864e5, pin_ts: ara - 5 * 864e5, aspecte_ts: null }, amagat: false, mons: [
   { assig: "catala", mod: null, ts: ara - 864e5, error: true },
   { assig: "divisibilitat", mod: ara - 7200e3, ts: ara - 7200e3, reinici: null, punts: 40, temps: 1800, dies: 4, dia_ult: dia(-1), ultim: 2,
    temes: { relacio: { fitxa: true, fc: 6, n: 2, max: 60, ult: 60, d_ult: dia(-1), fallades: { "Quin és el MCD de 12 i 18?": 3 } } },
    rep: [{ tid: "relacio", q: "Quin és el MCD de 12 i 18?", c: 0, prox: dia(2) }], rep_n: 1, rep_avui: 0, ob: {}, examens: [], boss: null, apresos: 0, jocs: {},
    fonts: { temes: 20 }, ftema: { relacio: 20 }, fjoc: {}, est: null },
   { assig: "socials", mod: ara - 3600e3, ts: ara - 3600e3, reinici: ara - 20 * 864e5, punts: 120, temps: 5400, dies: 9, dia_ult: dia(0), ultim: 1,
    temes: { temps: { fitxa: true, fc: 10, n: 3, max: 85, ult: 80, d_ult: dia(0), fallades: { "«Demà nevarà al Pirineu». És…": 4, "Una altra pregunta del tema": 1 } },
     atmos: { fitxa: true, fc: 0, n: 0, max: null, ult: null, d_ult: null, fallades: {} }, xyz: { fitxa: false, fc: 0, n: 1, max: 40, ult: 40, d_ult: dia(-2), fallades: {} } },
    rep: [{ tid: "temps", q: "Pregunta de repàs A", c: 0, prox: dia(-1) }, { tid: "temps", q: "Pregunta de repàs B", c: 1, prox: dia(0) }, { tid: "elements", q: "Pregunta de repàs C", c: 2, prox: dia(3) }],
    rep_n: 3, rep_avui: 2, ob: { "1": 80, "2": 60 }, examens: [{ d: dia(-3), pc: 75, real: false }, { d: dia(-1), pc: 90, real: true }], boss: { v: 2, cors: 3, d: dia(-1) }, apresos: 5,
    jocs: { climo: { n: 4, max: 95, ult: 80 } }, fonts: { temes: 60, jocs: 30, boss: 20 }, ftema: { temps: 40, atmos: 10 }, fjoc: { climo: 12 }, est: null }] },
  laia: { k: "laia", perfil: { nom: "Laia", id: 4, pin_v: 1, creat: null, pin_ts: ara - 30 * 864e5, aspecte_ts: ara - 864e5 }, amagat: false, mons: [] },
  biel: { k: "biel", perfil: null, amagat: false, mons: [] },
  // tot el que ve de l'estat porta HTML: no s'ha d'executar res (i els números que no ho són surten com a 0 o «—»)
  rita: { k: "rita", perfil: { nom: XSS, id: 9, pin_v: 2, creat: null, pin_ts: null, aspecte_ts: null }, amagat: true, mons: [
   { assig: XSS, mod: 1, ts: ara, reinici: null, punts: XSS, temps: 60, dies: XSS, dia_ult: XSS, ultim: null,
    temes: { [XSS]: { fitxa: true, fc: 1, n: 1, max: 50, ult: XSS, d_ult: XSS, fallades: { [XSS]: 2 } } },
    rep: [{ tid: XSS, q: XSS, c: XSS, prox: XSS }], rep_n: 1, rep_avui: 1, ob: { [XSS]: 50 }, examens: [{ d: XSS, pc: 50, real: XSS }], boss: { v: 1, cors: XSS, d: XSS }, apresos: 0,
    jocs: { [XSS]: { n: 1, max: 50, ult: 50 } }, fonts: { [XSS]: 5 }, ftema: { [XSS]: 5 }, fjoc: { [XSS]: 5 }, est: null }] } };
 const altes = [
  { k: "nou", nom: "Nou", alta: ara - 2 * 36e5, primer: null, creat: ara - 2 * 36e5, pin_ts: ara - 2 * 36e5, aspecte_ts: null, id: 12, mons: 0, punts: 0, dies7: 0, amagat: false, te_pin: true },
  { k: XSS.toLowerCase(), nom: XSS, alta: ara - 5 * 36e5, primer: null, creat: ara - 5 * 36e5, pin_ts: null, aspecte_ts: null, id: 13, mons: 0, punts: 0, dies7: 0, amagat: false, te_pin: true },
  { k: "pau", nom: "Pau", alta: ara - 5 * 864e5, primer: ara - 6 * 864e5, creat: ara - 5 * 864e5, pin_ts: ara - 5 * 864e5, aspecte_ts: ara - 4 * 864e5, id: 3, mons: 2, punts: 160, dies7: 4, amagat: false, te_pin: true },
  { k: "biel", nom: "Biel", alta: ara - 6 * 864e5, primer: ara - 6 * 864e5, creat: null, pin_ts: null, aspecte_ts: null, id: null, mons: 0, punts: 0, dies7: 1, amagat: false, te_pin: false }];
 return { logs, fitxa, altes };
}
function respon(st, f, cos) {
 if (f === "bn_admin_logs") return st.d.logs;
 if (f === "bn_admin_ids" || f === "bn_aspectes") return [];
 if (f === "bn_admin_usuari" && cos.p_accio === "estat") return { pau: 6, laia: 2, rita: 7 }[String(cos.p_nom).trim().toLowerCase()] || 0;
 if (f === "bn_admin_resum") return { periode: cos.p_periode || "7d", ara: { nens: 4, sessions: 5, minuts: 5, nota: 80, encert: 80 }, abans: null };
 if (["bn_admin_alertes", "bn_admin_domini", "bn_admin_fallades"].includes(f)) return [];
 if (f === "bn_admin_benestar") return { periode: cos.p_periode || "7d", mons: [], nens: [{ k: "pau", nom: "Pau", semafor: "verd", dies_estudi: 2, descansos_fets: 1, descansos_saltats: 0, senyals: [] }] };
 if (f === "bn_admin_fonts_dia") return { periode: cos.p_periode || "7d", dies: [], total: {} };
 if (f === "bn_admin_control") return { xat_actiu: true, xat_obert_ara: true, xat_en_horari_tancat: false, horari: { actiu: false, tanca_min: 1290, obre_min: 420 }, mons_tancats: [] };
 if (f === "bn_admin_xat_resum") return { frases: 2 };
 if (!st.sql) return undefined;
 if (f === "bn_admin_fitxa") return st.d.fitxa[String(cos.p_nom || "").trim().toLowerCase()] || { k: String(cos.p_nom || "").trim().toLowerCase(), perfil: null, amagat: false, mons: [] };
 if (f === "bn_admin_altes") return st.d.altes;
 return undefined;
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 // obre l'admin amb (o sense) credencials i amb el Supabase simulat; torna les crides fetes a Supabase
 async function obre(url, opcions) {
  const o = opcions || {}, st = { sql: o.sql !== false, d: dades() };
  const ctx = await nav.newContext({ viewport: o.viewport || { width: 1280, height: 900 }, colorScheme: o.fosc ? "dark" : "light" }), p = await ctx.newPage(), crides = [];
  await p.route("**/rest/v1/rpc/**", r => { const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {}; crides.push({ f, cos });
   const resp = respon(st, f, cos); if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) }) });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  if (o.cred) await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), o.cred);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url); await p.waitForSelector("#shell:not([hidden])");
  const menu = async v => { const sel = await p.isVisible("#navInf") ? "#navInf" : "#nav"; await p.click(`${sel} [data-v="${v}"]`) };
  const crida = async (f, n) => { for (let i = 0; i < 60; i++) { const c = crides.filter(x => x.f === f); if (c.length >= (n || 1)) { await p.waitForTimeout(80); return c[c.length - 1] } await p.waitForTimeout(50) } return null };
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null }, s);
  const errG = () => p.evaluate(() => getComputedStyle(document.getElementById("errG")).display !== "none");
  // valor i subtítol d'una xifra (kpi) pel títol, dins d'un apartat
  const kpi = (dins, t) => p.evaluate(([dins, t]) => { const k = [...document.querySelectorAll(dins + " .kpi")].find(x => x.querySelector(".kpi-t").textContent.trim() === t);
   return k ? { v: k.querySelector(".kpi-v").textContent.trim(), s: (k.querySelector(".kpi-s") || k.querySelector(".kpi-p") || { textContent: "" }).textContent.trim() } : null }, [dins, t]);
  // obre la fitxa d'un nen des de la taula de Nens i, si cal, la pestanya «Al núvol»
  const fitxa = async (k, nuvol) => { await menu("nens"); await p.waitForSelector(`#tNens [data-obre-nen="${k}"]`); await p.click(`#tNens [data-obre-nen="${k}"]`); await p.waitForSelector("#tb-nuv");
   if (nuvol) { await p.click("#tb-nuv"); await p.waitForSelector('#nuv[data-estat="fet"], #nuv .avis') } };
  return { p, ctx, st, crides, errors, menu, crida, txt, errG, kpi, fitxa };
 }

 console.log("1) ?demo: Nens nous a Inici, Nens → Llista compacta (4 KPIs i 7 col.) i Fitxa completa de 4 pestanyes sense cap crida");
 { const { p, ctx, crides, errors, menu, txt, errG, fitxa } = await obre("/admin/?demo");
  await p.waitForSelector("#altesCos table");
  const at = await txt("#altes");
  ok(at.startsWith("Nens nous") && at.includes("dels últims 7 dies"), "targeta «Nens nous» a Inici amb el període de dalt (7 dies)");
  ok(at.includes("Gina") && at.includes("Encara no ha jugat") && (await p.$('#altesCos [data-obre-nen="gina"]')) === null, "un perfil sense registre surt com «Encara no ha jugat», sense enllaç a la fitxa");
  ok((await p.$('#altesCos [data-obre-nen="laia"]')) !== null && (await p.$('#altesCos [data-obre-nen="nora"]')) !== null, "els nens nous amb registre al període tenen enllaç a la fitxa");
  // Nens → Llista: 4 KPIs sense subtítol, 7 columnes i sense duplicats d'altes ni d'estrelles per origen
  await menu("nens"); await p.waitForSelector("#tNens table");
  ok((await p.$$("#nensKpis .kpi")).length === 4 && (await p.$$("#nensKpis .kpi-s")).length === 0 && (await p.$$("#tNens th")).length === 7 && (await p.$("#altes")) === null && (await p.$("#origens")) === null,
   "Nens → Llista té 4 KPIs sense subtítol, 7 columnes i zero targetes duplicades");
  // Tornem a Inici i obrim la fitxa des d'una alta
  await menu("inici"); await p.waitForSelector('#altesCos [data-obre-nen="laia"]');
  await p.click('#altesCos [data-obre-nen="laia"]'); await p.waitForSelector("#tb-nuv");
  ok((await txt("#titol")) === "Fitxa del nen" && (await txt(".perfil h2")) === "Laia" && (await p.$("#selFitxaNen")) !== null, "el nom d'una alta obre la seva fitxa amb el selector ràpid de nen (#selFitxaNen)");
  // 4 pestanyes amb el teclat: Resum i estrelles · Aprenentatge · Sessions i benestar · Núvol i gestió
  const nomsTabs = await p.$$eval(".pestanyes [role=tab]", bs => bs.map(b => b.textContent.trim()));
  ok(nomsTabs.join(" | ") === "Resum i estrelles | Aprenentatge | Sessions i benestar | Núvol i gestió", "les 4 pestanyes de la Fitxa tenen l'estructura nova");
  await p.click("#tb-ses"); await p.keyboard.press("ArrowRight"); await p.waitForSelector('#nuv[data-estat="fet"]');
  ok((await p.getAttribute("#tb-nuv", "aria-selected")) === "true" && (await p.evaluate(() => document.activeElement.id)) === "tb-nuv" && !(await p.isHidden("#tp-nuv")) && (await p.isHidden("#tp-ses")), "fletxa dreta des de Sessions i benestar obre «Núvol i gestió» (amb el focus)");
  await p.keyboard.press("Home");
  ok((await p.getAttribute("#tb-resum", "aria-selected")) === "true" && (await p.isHidden("#tp-nuv")), "Home torna a Resum i estrelles");
  await p.keyboard.press("End");
  ok((await p.getAttribute("#tb-nuv", "aria-selected")) === "true" && (await p.getAttribute("#tb-nuv", "tabindex")) === "0" && (await p.getAttribute("#tb-resum", "tabindex")) === "-1", "End va a «Núvol i gestió» (tabindex mòbil)");
  ok((await p.$$("#nuv .dm-as")).length >= 1 && (await txt("#nuv .nv-perfil")).includes("PIN nou") && (await p.$("#fitxaCopies #fCopFes")) !== null && (await p.$("#canvia")) !== null,
   "«Núvol i gestió» agrupa el progrés al núvol, l'accés directe a còpia i les accions del compte");
  // Pestanya Aprenentatge + selector ràpid #selFitxaNen conserva la pestanya activa (?v=nens&id=àlex&tab=apr)
  await p.click("#tb-apr"); await p.waitForSelector("#fDom .dm-as, #fDom .buit");
  await p.selectOption("#selFitxaNen", "àlex");
  await p.waitForSelector("#fDom .dm-as");
  ok((await txt(".perfil h2")) === "Àlex" && (await p.getAttribute("#tb-apr", "aria-selected")) === "true" && p.url().includes("tab=apr"),
   "el selector ràpid #selFitxaNen canvia de nen mantenint la pestanya activa (Aprenentatge)");
  // Obrir detall d'una resposta oberta al panell lateral (#panell)
  if ((await p.$$("#tFitxaObe tbody tr[data-fobe]")).length > 0) {
   await p.click("#tFitxaObe tbody tr[data-fobe]"); await p.waitForSelector("#panell:not([hidden]) .obe-txt");
   ok((await txt("#panellTitol")).startsWith("Oberta ·"), "clicar una resposta oberta a Fitxa → Aprenentatge n'obre el detall al panell lateral");
   await p.click("#panellTanca");
  }
  // Pestanya Sessions i benestar: semàfor individual i cronologia al panell lateral
  await p.click("#tb-ses"); await p.waitForSelector("#fBen:not([aria-busy]) .pill");
  await p.click("#tFitxaSes tbody tr[data-fses]"); await p.waitForSelector("#panell:not([hidden]) .lin");
  ok((await txt("#panellTitol")).startsWith("Sessió de Àlex") && (await p.$$("#tp-ses .kpi")).length === 4,
   "Fitxa → Sessions i benestar mostra 4 KPIs, el benestar individual i obre la sessió al panell lateral");
  await p.click("#panellTanca");
  // l'Àlex a Núvol i gestió: perfil d'abans i dos mons, amb títols de preguntes.json
  await p.click("#tb-nuv"); await p.waitForSelector('#nuv[data-estat="fet"]');
  const a = await txt("#nuv");
  ok((await p.$$("#nuv .dm-as")).length === 2 && a.includes("2 mons"), "l'Àlex de demo té dos mons");
  ok(a.includes("Alta: d'abans") && a.includes("Què és la ciència") && a.includes("Temes aprovats") && a.includes("Errors pendents de repàs") && a.includes("D'on surten les estrelles"), "amb títols de tema de preguntes.json i els apartats del pla");
  // tema fosc amb la fitxa oberta: es queda a «Núvol i gestió»
  await p.click("#tema"); await p.waitForSelector('#nuv[data-estat="fet"]');
  ok((await p.getAttribute("#tb-nuv", "aria-selected")) === "true" && (await p.$$("#nuv .dm-as")).length === 2, "en canviar de tema es queda a «Núvol i gestió», sense tornar a carregar");
  await p.click("#tema");
  await fitxa("pau", true);
  ok((await txt("#nuv")).includes("Té PIN, però encara no ha desat res al núvol") && (await p.$$("#nuv .dm-as")).length === 0 && (await txt("#nuv .nv-perfil")).includes("PIN antic"), "en Pau (PIN antic, res desat): «Té PIN, però encara no ha desat res al núvol»");
  // l'Hugo i l'Ona no tenen PIN; l'Hugo fa 9 dies que no juga: cal el període de 30 dies per tenir-lo a la llista
  await p.click('#periode [data-d="30"]'); await p.waitForTimeout(200);
  await fitxa("hugo", true);
  ok((await txt("#nuv")).includes("No té PIN: només hi ha el registre (pestanyes anteriors)") && (await txt("#nuv .nv-perfil")).includes("Sense PIN"), "l'Hugo (sense PIN): «No té PIN: només hi ha el registre (pestanyes anteriors)»");
  await fitxa("ona", true);
  ok((await txt("#nuv")).includes("No té PIN") && (await txt("#nuv .nv-perfil")).includes("Amagat del rànquing"), "l'Ona (sense PIN, amagada)");
  await menu("inici"); await p.waitForSelector("#altesCos table");
  ok((await txt("#altes")).includes("dels últims 30 dies") && (await p.$$("#altesCos tbody tr")).length >= 6, "amb 30 dies a Inici, més altes (" + (await p.$$("#altesCos tbody tr")).length + ")");
  ok(crides.length === 0, "cap crida a Supabase en demo (" + crides.map(c => c.f).join(", ") + ")");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("1b) ?demo: descàrrega d'informe complet (.html / PDF i .md) directament des de ?v=nens&id=àlex&p=curs sense obrir abans altres pestanyes");
 { const { p, ctx, crides, errors, errG } = await obre("/admin/?demo&v=nens&id=àlex&p=curs");
  await p.waitForSelector("#btInfHtml");
  ok((await p.getAttribute("#tb-resum", "aria-selected")) === "true" && (await p.isHidden("#tp-apr")) && (await p.isHidden("#tp-nuv")),
   "s'obre directament a Resum i estrelles sense haver obert Aprenentatge, Sessions ni Núvol");
  const [dlHtml] = await Promise.all([p.waitForEvent("download"), p.click("#btInfHtml")]);
  const fHtml = fs.readFileSync(await dlHtml.path(), "utf8");
  ok(/^informe-alex-curs-\d{4}-\d{2}-\d{2}\.html$/.test(dlHtml.suggestedFilename()), "fitxer HTML amb nom net: " + dlHtml.suggestedFilename());
  ok(fHtml.includes("1. Resum i estrelles (Tot el curs)") && fHtml.includes("2. Aprenentatge (Tot el curs)") && fHtml.includes("3. Sessions i benestar (Tot el curs)") && fHtml.includes("4. Al núvol") && fHtml.includes("Què és la ciència") && fHtml.includes("window.print()"),
   "l'informe HTML inclou les 4 seccions completes (inclòs Domini, Sessions i Al núvol carregats sota demanda) i el botó d'imprimir/PDF");
  const [dlMd] = await Promise.all([p.waitForEvent("download"), p.click("#btInfMd")]);
  const fMd = fs.readFileSync(await dlMd.path(), "utf8");
  ok(/^informe-alex-curs-\d{4}-\d{2}-\d{2}\.md$/.test(dlMd.suggestedFilename()), "fitxer Markdown amb nom net: " + dlMd.suggestedFilename());
  ok(fMd.includes("# Informe complet · Àlex (#1)") && fMd.includes("## 1. Resum i estrelles (Tot el curs)") && fMd.includes("## 2. Aprenentatge (Tot el curs)") && fMd.includes("## 3. Sessions i benestar (Tot el curs)") && fMd.includes("## 4. Al núvol") && fMd.includes("Cronologia detallada de sessions"),
   "l'informe .md conté totes les taules, cronologia de sessions i progrés al núvol");
  ok(crides.length === 0 && errors.length === 0 && !(await errG()), "cap crida ni error de JS en descarregar els informes en demo");
  await ctx.close() }

 console.log("2) amb credencials: «Núvol i gestió» sota demanda i «Nens nous» a Inici");
 { const { p, ctx, crides, errors, menu, crida, txt, errG, kpi, fitxa } = await obre("/admin/", { cred: CRED });
  await p.waitForSelector("#altesCos table");
  let c = await crida("bn_admin_altes");
  ok(c && c.cos.p_periode === "7d" && c.cos.p_email === CRED.e && c.cos.p_pass === CRED.p, "Inici crida bn_admin_altes amb p_email, p_pass i el període de dalt (p_periode '7d')");
  const at = await txt("#altes");
  ok((await p.$('#altesCos [data-obre-nen="pau"]')) !== null && (await p.$('#altesCos [data-obre-nen="biel"]')) !== null, "en Pau i en Biel (amb registre al període) tenen enllaç a la fitxa");
  ok((await p.$('#altesCos [data-obre-nen="nou"]')) === null && at.includes("Nou") && at.includes("Encara no ha jugat"), "en Nou (perfil sense registre): «Encara no ha jugat» i sense enllaç");
  ok(at.includes("Sense PIN") && at.includes("4 de 7") && (await p.$$("#altesCos tbody tr")).length === 4, "PIN, dies actius la primera setmana i les 4 files d'altes");
  await menu("nens"); await p.waitForSelector("#tNens table");
  ok((await p.$$("#tNens tbody tr")).length === 4, "Nens → Llista mostra els 4 nens amb activitat");
  await menu("inici"); await p.waitForSelector('#altesCos [data-obre-nen="pau"]');
  await p.click('#altesCos [data-obre-nen="pau"]'); await p.waitForSelector("#tb-nuv");
  ok((await txt(".perfil h2")) === "Pau", "el nom d'una alta obre la fitxa");
  await p.waitForTimeout(150);
  ok(!crides.some(x => x.f === "bn_admin_fitxa") && !crides.some(x => x.f === "bn_admin_domini"), "bn_admin_fitxa i bn_admin_domini no es criden fins que s'obren les seves pestanyes");
  await p.click("#tb-apr"); await p.waitForSelector("#fDom .buit, #fDom .dm-as");
  ok(crides.some(x => x.f === "bn_admin_domini" && x.cos.p_nom === "Pau") && crides.some(x => x.f === "bn_admin_fallades" && x.cos.p_nom === "Pau"), "obrir Fitxa → Aprenentatge demana bn_admin_domini i bn_admin_fallades només per a en Pau");
  await p.click("#tb-nuv"); await p.waitForSelector('#nuv[data-estat="fet"]');
  c = await crida("bn_admin_fitxa");
  ok(c && c.cos.p_nom === "Pau" && c.cos.p_email === CRED.e && c.cos.p_pass === CRED.p, "«Núvol i gestió» crida bn_admin_fitxa {p_email, p_pass, p_nom:'Pau'}");
  const t = await txt("#nuv");
  ok((await p.$$("#nuv .dm-as")).length === 3 && t.includes("3 mons"), "tres mons (un mal format)");
  ok(t.includes("Temps i clima") && t.includes("L'atmosfera: capes i funcions") && t.includes("La relació de divisibilitat"), "títols de tema de preguntes.json");
  ok(t.includes("xyz") && t.includes("no és a preguntes.json"), "un tema que no és a preguntes.json surt amb l'id");
  const so = await txt('#nuv .dm-as[data-a="socials"]');
  ok(so.includes("1/10") && so.includes("85") && so.includes("Aprovat") && so.includes("Per millorar") && so.includes("Només ha estudiat"), "socials: 1 de 10 temes aprovats (85 ≥ 70; j-climo és un joc i no compta, xyz no és del món), un per millorar (40) i un només estudiat");
  ok(so.includes("«Demà nevarà al Pirineu». És…") && so.includes("×4"), "les preguntes que més falla, amb les vegades");
  const kR = await kpi('#nuv .dm-as[data-a="socials"]', "Errors per repassar"), kT = await kpi('#nuv .dm-as[data-a="socials"]', "Temes aprovats"), kE = await kpi('#nuv .dm-as[data-a="socials"]', "Estrelles");
  ok(kR && kR.v === "3" && kR.s.includes("2 toquen avui") && kR.s.includes("5 apresos") && so.includes("Pregunta de repàs A") && so.includes("Elements i factors del clima"), "errors pendents de repàs: quants (3), quants toquen avui (2), apresos, la pregunta i el tema");
  ok(kT && kT.v === "1/10" && kE && kE.v === "120" && kE.s.includes("1 h 30 min"), "xifres: temes aprovats 1/10, 120 estrelles i el temps jugat");
  ok((await p.$$('#nuv .dm-as[data-a="socials"] .pill.warn')).length >= 2, "els errors que ja toquen surten marcats «Avui»");
  ok(so.includes("2 victòries") && so.includes("millor: 3 cors") && so.includes("de veritat") && so.includes("90%") && so.includes("2 fetes · mitjana 70%"), "boss, exàmens i obertes");
  ok(so.includes("climo") && so.includes("Tests dels temes") && so.includes("Boss del món") && so.includes("9 dies") && so.includes("reiniciat"), "jocs, fonts de les estrelles, dies d'estudi i reinici");
  ok((await txt('#nuv .dm-as[data-a="catala"]')).includes("mal format") && (await p.$('#nuv .dm-as[data-a="catala"] .avis.err')) !== null, "un món mal format surt amb un avís i la resta es veu igual");
  await p.click('#nuv .dm-as[data-a="socials"] summary'); await p.waitForTimeout(80);
  ok(await p.evaluate(() => document.querySelector('#nuv .dm-as[data-a="socials"]').open), "cada món es pot desplegar");
  await p.click("#tb-resum"); await p.click("#tb-nuv"); await p.waitForTimeout(200);
  ok(crides.filter(x => x.f === "bn_admin_fitxa").length === 1, "tornar a la pestanya no torna a cridar (en memòria per a la fitxa oberta)");
  await fitxa("laia", true);
  ok((await txt("#nuv")).includes("Té PIN, però encara no ha desat res al núvol") && (await crida("bn_admin_fitxa", 2)).cos.p_nom === "Laia", "la Laia (PIN, cap món): «Té PIN, però encara no ha desat res al núvol»");
  await fitxa("biel", true);
  ok((await txt("#nuv")).includes("No té PIN: només hi ha el registre (pestanyes anteriors)"), "en Biel (sense perfil): «No té PIN: només hi ha el registre (pestanyes anteriors)»");
  // el període de dalt també mana a les altes d'Inici
  await menu("inici"); await p.click('#periode [data-d="30"]'); await p.waitForSelector("#altesCos table");
  c = await crida("bn_admin_altes", 2);
  ok(c && c.cos.p_periode === "30d" && (await txt("#altesSub")).includes("dels últims 30 dies"), "amb 30 dies, bn_admin_altes rep p_periode '30d'");
  ok((await p.$$(".toast.err-t")).length === 0, "cap avís d'error");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("3) XSS: el que va escriure el navegador d'un nen no s'executa");
 { const { p, ctx, errors, txt, errG, kpi, fitxa } = await obre("/admin/", { cred: CRED });
  await p.waitForSelector("#altesCos table"); await p.waitForTimeout(300);
  ok((await txt("#altes")).includes(XSS), "el nom d'una alta amb HTML surt com a text a Inici");
  await fitxa("rita", true); await p.waitForTimeout(400);
  const t = await txt("#nuv");
  ok(t.includes(XSS) && t.includes("×2"), "la pregunta de «fallades», el «tid» i les claus amb HTML surten com a text");
  ok((await p.$$('#nuv img, #altes img')).length === 0, "cap <img> injectat a «Núvol i gestió» ni a les altes");
  ok((await p.$$("#nuv [onerror], #altes [onerror]")).length === 0, "cap atribut onerror al DOM");
  ok(await p.evaluate(() => [...document.querySelectorAll("#nuv [title]")].some(e => e.title === '<img src=x onerror="window.__xss=1">')), "als atributs (title) el text també va escapat i es llegeix tal qual");
  const kE = await kpi("#nuv", "Estrelles"), kD = await kpi("#nuv", "Dies d'estudi");
  ok((await txt("#nuv .nv-perfil")).includes("Amagat del rànquing") && kE && kE.v === "0" && kD && kD.v === "—", "un número que no ho és (punts i dies amb HTML) surt com a 0 o «—»");
  await p.click("#nuv .dm-as summary"); await p.waitForTimeout(300);
  ok((await p.evaluate(() => window.__xss)) === undefined, "window.__xss no s'ha posat");
  const [dlXss] = await Promise.all([p.waitForEvent("download"), p.click("#btInfHtml")]);
  const htmlXss = fs.readFileSync(await dlXss.path(), "utf8");
  ok(!htmlXss.includes(XSS) && htmlXss.includes("&lt;img src=x onerror=&quot;window.__xss=1&quot;&gt;"),
   "a l'informe HTML descarregat, tot el contingut del nen/núvol va escapat sense cap etiqueta executable");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("4) el SQL encara no hi és (404)");
 { const { p, ctx, crides, errors, menu, txt, errG, fitxa } = await obre("/admin/", { cred: CRED, sql: false });
  await p.waitForSelector("#altesCos .avis");
  ok((await txt("#altesCos .avis")).includes("supabase/bn_admin_fitxa.sql") && (await p.$('#altesCos [data-copia="supabase/bn_admin_fitxa.sql"]')) !== null, "altes a Inici: avís aïllat de supabase/bn_admin_fitxa.sql");
  await menu("nens"); await p.waitForSelector("#tNens table");
  ok((await p.$$("#tNens tbody tr")).length === 4, "la llista de nens es veu igual");
  await fitxa("pau", true);
  ok((await txt("#nuv .avis")).includes("supabase/bn_admin_fitxa.sql") && (await p.$('#nuv [data-copia="supabase/bn_admin_fitxa.sql"]')) !== null, "«Núvol i gestió»: avís de supabase/bn_admin_fitxa.sql");
  await p.click("#tb-resum");
  ok(!(await p.isHidden("#tp-resum")) && (await txt("#tp-resum")).includes("Estrelles"), "la resta de la fitxa funciona igual");
  ok(crides.some(x => x.f === "bn_admin_fitxa"), "s'ha intentat la crida");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("5) mòbil (360, 390 i 430 px), tema fosc: Inici, Nens i les 4 pestanyes de la Fitxa");
 for (const mw of [360, 390, 430]) {
  const { p, ctx, errors, menu, txt, fitxa } = await obre("/admin/?demo", { viewport: { width: mw, height: 844 }, fosc: true });
  await p.waitForSelector("#altesCos table");
  if (mw === 390) ok((await p.evaluate(() => document.documentElement.dataset.tema)) === "fosc", "tema fosc");
  const ample = () => p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  let w = await ample(); ok(w <= mw, `${mw} px · Inici amb les altes: res no surt per la dreta (ample ${w})`);
  await menu("nens"); await p.waitForSelector("#tNens table");
  w = await ample(); ok(w <= mw, `${mw} px · Nens → Llista: res no surt per la dreta (ample ${w})`);
  await fitxa("àlex", true); await p.click("#nuv .dm-as summary"); await p.waitForTimeout(120);
  w = await ample(); ok(w <= mw, `${mw} px · Fitxa «Núvol i gestió» desplegada: res no surt per la dreta (ample ${w})`);
  const fora = await p.$$eval("#nuv .kpi, #nuv .dm-cap, .pestanyes", es => es.filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1 }).length);
  ok(fora === 0, `${mw} px · xifres, capçaleres dels mons i pestanyes es veuen senceres`);
  await p.click("#tb-apr"); await p.waitForSelector("#fDom .dm-as");
  w = await ample(); ok(w <= mw, `${mw} px · Fitxa «Aprenentatge»: res no surt per la dreta (ample ${w})`);
  await p.click("#tb-ses"); await p.waitForSelector("#fBen:not([aria-busy]) .pill");
  w = await ample(); ok(w <= mw, `${mw} px · Fitxa «Sessions i benestar»: res no surt per la dreta (ample ${w})`);
  if (mw === 390) ok((await txt("#tb-nuv")) === "Núvol i gestió", "la pestanya «Núvol i gestió» es veu al mòbil");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de «Al núvol» i «Nens nous» passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
