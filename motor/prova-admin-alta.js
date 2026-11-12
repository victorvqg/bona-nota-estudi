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
   if (f === "bn_admin_alertes") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(d.alertes || []) });
   if (["bn_admin_activitat", "bn_admin_calor", "bn_admin_domini", "bn_admin_fallades", "bn_admin_evolucio", "bn_admin_errors_taller", "bn_admin_rep_pendents"].includes(f)) {
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   }
   if (f === "bn_admin_benestar") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", mons: [], nens: [] }) });
   if (f === "bn_admin_fonts_dia") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ periode: "7d", dies: [], total: {} }) });
   if (f === "bn_admin_dificultat") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ min_respostes: 8, dies: 365, assig: null, resum: { preguntes_vistes: 0, amb_dades: 0, dificils: 0, normals: 0, facils: 0 }, preguntes: [] }) });
   if (f === "bn_ranking_mons") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ nom: "Pau", punts: 160, punts_max: 120, setmana: 35, temps_s: 1800, mons: { socials: 120, biogeo: 40 } }]) });
   if (f === "bn_admin_xat_resum") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ parlat: 1, frases: 2, al_maxim: 0, vots: 1 }) });
   if (f === "bn_admin_xat_config") {
    if (cos.p_cfg && typeof cos.p_cfg.actiu === "boolean") d.ctrl.xat_actiu = cos.p_cfg.actiu;
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ est_credit: 10, max_dia: 5, espera_s: 10, actiu: d.ctrl.xat_actiu }) });
   }
   if (f === "bn_admin_copies") {
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ id: 1, ts: new Date().toISOString(), motiu: "automàtica", files: { bn_log: 3, perfils: 3, progres: 2, amagats: 0, config: 1, reinicis: 0 }, mida: 15200 }]) });
   }
   if (f === "bn_admin_control") {
    if (cos.p_cfg && typeof cos.p_cfg === "object") {
     if (typeof cos.p_cfg.xat_actiu === "boolean") d.ctrl.xat_actiu = cos.p_cfg.xat_actiu;
     if (typeof cos.p_cfg.horari_actiu === "boolean") d.ctrl.horari.actiu = cos.p_cfg.horari_actiu;
     if (typeof cos.p_cfg.tanca_min === "number") d.ctrl.horari.tanca_min = cos.p_cfg.tanca_min;
     if (typeof cos.p_cfg.obre_min === "number") d.ctrl.horari.obre_min = cos.p_cfg.obre_min;
     if (Array.isArray(cos.p_cfg.mons_tancats)) d.ctrl.mons_tancats = cos.p_cfg.mons_tancats.slice();
     if (cos.p_cfg.llindars && typeof cos.p_cfg.llindars === "object") d.ctrl.llindars = JSON.parse(JSON.stringify(cos.p_cfg.llindars));
     if (cos.p_cfg.reset_llindars) delete d.ctrl.llindars;
     if (cos.p_cfg.ranquing && typeof cos.p_cfg.ranquing === "object") d.ctrl.ranquing = JSON.parse(JSON.stringify(cos.p_cfg.ranquing));
     if (cos.p_cfg.reset_ranquing) delete d.ctrl.ranquing;
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
  const menu = async v => { const sel = await p.isVisible("#navInf") ? "#navInf" : "#nav"; await p.click(`${sel} [data-v="${v}"]`) };
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null }, s);
  return { p, ctx, d, crides, errors, menu, txt };
 }

 console.log("1) Admin ?demo: Inici (6 KPIs, Control ràpid d'1 clic, ajuda plegable), Configuració (4 pestanyes i panell lateral) i nivells (M5)");
 {
  const { p, ctx, crides, errors, menu, txt } = await obreAdmin("/admin/?demo");
  await p.waitForSelector("#control #ctrlXatSw");
  ok((await txt("#titol")) === "Inici" && !(await p.isHidden("#periodeWrap")), "s'obre per defecte a Inici amb el selector de període visible");
  ok((await p.$$("#iniciKpis .kpi")).length === 6 && (await p.$$("#iniciKpis .kpi-s")).length === 0,
   "Inici mostra exactament 6 KPIs compactes i cap subtítol sota les xifres");
  const ctrlTxt = await txt("#control");
  const idsCtrl = await p.$$eval("#control [data-ctrl-mon]", bs => bs.map(b => b.dataset.ctrlMon));
  ok(ctrlTxt.includes("Control ràpid") && idsCtrl.length === 7 && idsCtrl[0] === "angles" && idsCtrl[6] === "socials",
   "targeta «Control ràpid» a Inici amb interruptor del xat i dels 7 mons ordenats del més nou ('angles') al més antic ('socials')");
  // Ajuda plegable (i)
  const btAj = "#control .btn-ajuda", boxAj = "#control .ajuda-box";
  ok((await p.isHidden(boxAj)) === true, "l'explicació secundària (i) està plegada per defecte");
  await p.click(btAj);
  ok((await p.isHidden(boxAj)) === false && (await p.getAttribute(btAj, "aria-expanded")) === "true", "clicar el botó (i) desplega l'ajuda");

  // Alertes plegables amb filtres i drecera ⚙ Ajusta (g21)
  await p.waitForSelector("#tAlertes table");
  const alResTxt = await txt("#alResum");
  ok((await p.getAttribute("#alertes", "data-plegat")) === "0" && !(await p.isHidden("#alCos")) && alResTxt.includes("malament") && alResTxt.includes("avís"),
   "Inici → Alertes s'obre desplegada quan hi ha malament/avís i mostra el resum de pastilles a la capçalera");
  await p.click("#btAlPlega");
  ok((await p.getAttribute("#alertes", "data-plegat")) === "1" && (await p.isHidden("#alCos")) === true && (await p.getAttribute("#btAlPlega", "aria-expanded")) === "false",
   "clicar #btAlPlega plega el cos d'Alertes mantenint visible la capçalera amb el recompte");
  await p.click("#btAlPlega");
  ok((await p.isHidden("#alCos")) === false && (await p.inputValue("#fAlGrav")) === "rellevants",
   "tornar a clicar #btAlPlega el desplega i el filtre per defecte és «Malament + Avís»");
  const nRel = (await p.$$("#tAlertes tbody tr")).length;
  await p.selectOption("#fAlGrav", "totes");
  const nTot = (await p.$$("#tAlertes tbody tr")).length;
  await p.selectOption("#fAlGrav", "malament");
  const nMal = (await p.$$("#tAlertes tbody tr")).length;
  ok(nTot > nRel && nRel > nMal && nMal >= 1,
   `el desplegable de gravetat filtra les alertes (totes: ${nTot}, rellevants: ${nRel}, malament: ${nMal})`);
  await p.selectOption("#fAlGrav", "totes");
  await p.selectOption("#fAlTipus", "pendent");
  ok((await p.$$("#tAlertes tbody tr")).length >= 1 && (await txt("#tAlertes")).includes("pendent"),
   "el desplegable de tipus filtra les alertes informatives («Temes pendents»)");
  await p.selectOption("#fAlTipus", "");
  await p.click("#btAlAjusta");
  await p.waitForSelector("#tLlindarsAl table");
  ok(p.url().includes("v=config") && p.url().includes("tab=llindars"),
   "el botó «Ajusta» d'Alertes porta directament a Configuració → Llindars (?v=config&tab=llindars)");
  ok((await p.$$("#tLlindarsAl th")).length === 3 && (await p.$$("#tLlindarsAl [data-ll-al-grav]")).length === 6 &&
     (await p.$$("#tLlindarsBen th")).length === 3 && (await p.$$("#tLlindarsBen [data-ll-be-niv]")).length === 11 &&
     (await p.$$("#tLlindarsPed th")).length === 4 && (await p.isDisabled("#btDesaLlindars")) === true,
   "Configuració → Llindars mostra les 6 regles d'Alertes (3 cols), els 11 senyals editables de Benestar (3 cols) i les regles pedagògiques (4 cols), desactivades en ?demo");

  // Enllaç ràpid a Configuració -> Horaris, Rànquing i Còpies
  await p.click('[data-vtab="ranquing"]');
  await p.waitForSelector("#cfgRanquingVis");
  ok((await p.inputValue("#rkCfgTop")) === "10" && (await p.isDisabled("#btDesaRkCfg")) === true && (await p.$$("[data-rk-tab]")).length === 5,
   "Configuració → Rànquing mostra el tall XX primers per defecte (Top 10), les 5 pestanyes i els controls desactivats en ?demo");
  await p.click('[data-vtab="horaris"]');
  await p.waitForSelector("#xcF");
  ok((await txt("#titol")) === "Configuració" && (await p.isHidden("#periodeWrap")) === true && p.url().includes("v=config"),
   "Configuració amaga el selector de període i sincronitza ?v=config a l'URL");
  await p.click('[data-vtab="copies"]');
  await p.waitForSelector("#tCop table");
  ok((await p.$$("#tCop th")).length === 4, "Configuració → Còpies té exactament 4 columnes (Data, Abast, Mida o detall, Acció)");
  await p.click("#tCop [data-cp-prev]");
  await p.waitForSelector("#panell:not([hidden]) .cp-det");
  ok((await txt("#panellTitol")).startsWith("Còpia #") && (await p.$$("#panellCos [data-cr]")).length === 1,
   "clicar Detall a Còpies obre el desglossament i les accions al panell lateral (#panell)");
  await p.click("#panellTanca");
  ok(await p.isHidden("#panell"), "tancar el panell lateral l'amaga netament");

  await menu("nens");
  await p.waitForSelector("#tNens table");
  ok((await p.$("#embutAlta")) === null, "s'ha tret «Embut d'alta» de la vista Nens");
  const nensCols = await p.$$("#tNens th");
  const nensTxt = await txt("#tNens");
  ok(nensCols.length === 7 && nensTxt.includes("Estrelles i nivell") && (await p.$$("#tNens .niv-p")).length >= 5 && (await p.$("#tNens .tb-q")) !== null && (await p.$("#tNens [data-tcsv]")) !== null,
   "taula de Nens compleix 7 columnes (≤ 8), porta cerca i CSV, i mostra les pastilles de nivell i benestar");
  await p.click('#tNens [data-obre-nen="àlex"]');
  await p.waitForSelector("#tb-nuv");
  const detTxt = await txt("#contingut");
  ok(detTxt.includes("Estrelles") && (await p.$$(".perfil .niv-p")).length === 1 && p.url().includes("v=nens") && p.url().includes("id="),
   "fitxa del nen mostra el nivell a la capçalera i reflecteix ?v=nens&id=… a l'URL");
  await p.click("#tb-nuv");
  await p.waitForSelector('#nuv[data-estat="fet"]');
  ok((await p.$$("#nuv .niv-p")).length >= 1, "pestanya «Núvol i gestió» mostra el nivell del nen");
  // Sessions: 3 pestanyes (Sessions amb filtres per món/nen/data, Log complet per dia amb filtres compartits i Activitat sense filtres)
  await menu("sessions");
  await p.waitForSelector("#tSes table");
  ok((await p.$("#fAssig")) !== null && (await p.$("#fNen")) !== null && (await p.$("#fDia")) !== null && (await p.$("#fDiaCal")) !== null && (await p.$$("#tSes th")).length === 6,
   "Sessions → Sessions té filtres locals per món (#fAssig), nen (#fNen) i data (#fDia + #fDiaCal) i 6 columnes");
  await p.click('[data-vtab="activitat"]');
  await p.waitForSelector("#actFontsCos .fest");
  ok((await p.$("#fAssig")) === null && (await p.$("#fNen")) === null && (await txt("#actFonts")).includes("Evolució d'estrelles per origen"),
   "Sessions → Activitat mostra l'evolució diària d'estrelles per origen sense barra de filtres locals");
  await p.click('[data-vtab="registre"]');
  await p.waitForSelector("#logDies .log-dia");
  ok((await p.$("#fAssig")) !== null && (await p.$("#fNen")) !== null && (await p.$("#fDia")) !== null && (await p.$("#fDiaCal")) !== null && (await p.$("#fEvent")) !== null && (await p.$("#fLogQ")) !== null && (await p.$("#flcsv")) !== null,
   "Sessions → Log complet per dia mostra la cronologia agrupada per dia («Qui ha entrat» i què fa) amb filtres per món, nen, data, tipus i cerca");
  // Filtrar per un nen i un dia concret a Log complet per dia
  await p.selectOption("#fNen", "Àlex");
  const diesOpc = await p.$$eval("#fDia option", os => os.map(o => o.value).filter(Boolean));
  ok(diesOpc.length >= 1, "en triar l'Àlex a #fNen, #fDia mostra els dies en què l'Àlex ha entrat");
  await p.selectOption("#fDia", diesOpc[0]);
  const diesVis = await p.$$eval("#logDies .log-dia", ds => ds.map(d => d.dataset.dia));
  const nensLin = await p.$$eval("#logDies .log-lin .nen-b", bs => [...new Set(bs.map(b => b.textContent.trim()))]);
  ok(diesVis.length === 1 && diesVis[0] === diesOpc[0] && nensLin.length === 1 && nensLin[0] === "Àlex",
   "filtrar per nen ('Àlex') i data mostra només el bloc d'aquell dia i les accions de l'Àlex");
  await p.click("#fNeteja");
  // Alternar al mode Taula (#tLog)
  await p.click('#logVistaSeg [data-lv="taula"]');
  await p.waitForSelector("#tLog table");
  ok((await p.$$("#tLog th")).length === 6, "el selector de format a Log complet per dia permet veure també la Taula ordenable de 6 columnes");
  await p.click('#logVistaSeg [data-lv="dies"]');
  // Comprovació ràpida d'amplada mòbil 360px al Log complet per dia
  await p.setViewportSize({ width: 360, height: 800 });
  const swLog = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(swLog <= 360, `Log complet per dia no desborda a 360 px (${swLog}px)`);
  ok(crides.length === 0 && errors.length === 0, "cap crida a Supabase ni error de JS en mode demo");
  await ctx.close();
 }

 console.log("2) Admin amb credencials: càrrega sota demanda a Inici, control d'1 clic, Configuració → Horaris i nivells M5");
 {
  const { p, ctx, crides, errors, menu, txt } = await obreAdmin("/admin/", { cred: CRED });
  await p.waitForSelector("#control #ctrlXatSw");
  await p.waitForTimeout(120);
  // Verifiquem que Inici NO dispara la bateria d'11-12 RPCs d'altres seccions
  const noInici = ["bn_admin_domini", "bn_admin_fallades", "bn_admin_activitat", "bn_admin_calor", "bn_admin_evolucio", "bn_admin_benestar", "bn_admin_dificultat", "bn_admin_rep_pendents", "bn_admin_copies", "bn_admin_xat_msgs"];
  ok(noInici.every(f => !crides.some(c => c.f === f)),
   "càrrega sota demanda: entrar a Inici no demana cap RPC de Mons, Sessions, Benestar, Xat ni Còpies");

  // Tanquem el xat des del botó ràpid d'1 clic a Inici
  await p.click("#ctrlXatSw");
  await p.waitForTimeout(80);
  ok((await p.getAttribute("#ctrlXatSw", "aria-checked")) === "false" && (await txt("#ctrlXatEstat")).includes("Tancat manualment"),
   "clicar #ctrlXatSw tanca el xat i actualitza l'estat a «Tancat manualment»");

  // Tanquem el món de Socials des d'Inici
  await p.click('#control [data-ctrl-mon="socials"]');
  await p.waitForTimeout(80);
  ok((await p.getAttribute('#control [data-ctrl-mon="socials"]', "aria-checked")) === "false" && (await txt("#ctrlMonsEstat")).includes("6 de 7 oberts"),
   "clicar l'interruptor d'un món el tanca i actualitza el comptador a «6 de 7 oberts»");

  // Canviem l'horari i el desem des de Configuració → Horaris i crèdits
  await p.click("#btConfig");
  await p.waitForSelector("#xcF");
  await p.fill("#xcTancaH", "22:00");
  await p.fill("#xcObreH", "07:30");
  await p.click("#xcDesa");
  await p.waitForTimeout(100);
  const cHor = crides.filter(x => x.f === "bn_admin_control" && x.cos.p_cfg && x.cos.p_cfg.tanca_min === 1320 && x.cos.p_cfg.obre_min === 450);
  ok(cHor.length === 1, "Configuració → Horaris envia tanca_min=1320 (22:00) i obre_min=450 (07:30) a bn_admin_control");

  // Comprovem que el filtre local #fNen (a Sessions) mostra tots els nens de bn_admin_ids
  await menu("sessions");
  await p.waitForSelector("#fNen");
  const fNenTxt = await txt("#fNen");
  ok(fNenTxt.includes("Leyre") && fNenTxt.includes("Sebastià") && fNenTxt.includes("Pau") && fNenTxt.includes("Laia"),
   "el filtre local #fNen mostra tots els nens de bn_admin_ids encara que no tinguin registres en el període triat");

  // Obrir el detall d'una sessió al panell lateral
  await p.waitForSelector("#tSes tr[data-ses]");
  await p.click("#tSes tr[data-ses]");
  await p.waitForSelector("#panell:not([hidden]) .lin");
  ok((await txt("#panellTitol")).startsWith("Sessió de "), "clicar una fila a Sessions n'obre el detall al panell lateral (#panell)");
  await p.keyboard.press("Escape");
  ok(await p.isHidden("#panell"), "Escape tanca el panell lateral");

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

 console.log("2a2) Fase 3 (Mons i Fitxa del món) + autorefresc a ?v=sessions&p=curs + horari tanca_h/obre_h");
 {
  // Mode ?demo: Mons → Llista (0 KPIs, ≤ 7 cols), Fitxa del món (Taller només a mates, Obertes obre #panell)
  const dm = await obreAdmin("/admin/?demo&v=mons&p=30d");
  await dm.p.waitForSelector("#tMons tbody tr[data-mon]");
  const nColsMons = await dm.p.$$eval("#tMons thead th", ths => ths.length);
  ok((await dm.p.$$("#contingut .kpi")).length === 0 && nColsMons === 7,
   `Mons → Llista té 0 KPIs i exactament 7 columnes (obtingut: ${nColsMons})`);
  await dm.p.click('#tMons tr[data-mon="socials"] td:first-child');
  await dm.p.waitForSelector("#selFitxaMon");
  const tabsSoc = await dm.p.$$eval('#contingut [role="tablist"] [role="tab"]', bs => bs.map(b => b.id.replace(/^mtb-/, "")));
  ok(dm.p.url().includes("v=mons") && dm.p.url().includes("id=socials") && tabsSoc.join(",") === "resum,domini,obertes",
   `Fitxa de Socials té les 3 pestanyes sense Taller (${tabsSoc.join(",")})`);
  await dm.p.click("#mtb-obertes");
  await dm.p.waitForSelector("#tMonObe tbody tr.clic");
  await dm.p.click("#tMonObe tbody tr.clic td:first-child");
  await dm.p.waitForSelector("#panell:not([hidden])");
  ok((await dm.txt("#panellCos")).includes("Pregunta oberta"), "clicar una resposta oberta a la Fitxa del món obre el detall a #panell");
  await dm.p.keyboard.press("Escape");
  await dm.p.selectOption("#selFitxaMon", "divisibilitat");
  await dm.p.waitForSelector("#mtb-taller");
  const tabsDiv = await dm.p.$$eval('#contingut [role="tablist"] [role="tab"]', bs => bs.map(b => b.id.replace(/^mtb-/, "")));
  ok(tabsDiv.join(",") === "resum,domini,obertes,taller", `Fitxa de Divisibilitat mostra la 4a pestanya Taller (${tabsDiv.join(",")})`);
  await dm.p.goto(BASE + "/admin/?demo&v=mons&id=socials&tab=taller");
  await dm.p.waitForSelector('#mtb-resum[aria-selected="true"]');
  ok(!dm.p.url().includes("tab=taller"), "enllaç directe amb tab=taller a un món que no és mates cau netament a Resum");
  ok(dm.errors.length === 0, "cap error de JS a Mons/Fitxa del món en ?demo");
  await dm.ctx.close();

  // Amb credencials: interruptor directe a Mons → Llista, horari amb tanca_h/obre_h sense tanca_min i autorefresc a ?v=sessions&p=curs
  const cr = await obreAdmin("/admin/?v=mons", { cred: CRED });
  cr.d.ctrl.horari = { actiu: true, tanca_h: "21:45", obre_h: "08:00" }; // format bn_xat.sql sense tanca_min/obre_min
  await cr.p.waitForSelector('#tMons [data-mon-sw="socials"]');
  await cr.p.click('#tMons [data-mon-sw="socials"]');
  await cr.p.waitForFunction(() => document.querySelector('#tMons [data-mon-sw="socials"]')?.getAttribute("aria-checked") === "false");
  const cMon = cr.crides.filter(x => x.f === "bn_admin_control" && x.cos.p_cfg && Array.isArray(x.cos.p_cfg.mons_tancats)).pop();
  ok(cMon && cMon.cos.p_cfg.mons_tancats.includes("socials"), "l'interruptor directe de Mons → Llista tanca 'socials' via bn_admin_control");

  await cr.p.click("#btConfig");
  await cr.p.waitForSelector("#xcTancaH");
  ok((await cr.p.inputValue("#xcTancaH")) === "21:45" && (await cr.p.inputValue("#xcObreH")) === "08:00",
   "Configuració → Horaris llegeix tanca_h='21:45' i obre_h='08:00' encara que el servidor no enviï tanca_min/obre_min");

  // Autorefresc a ?v=sessions&p=curs conservant el text de cerca
  await cr.p.goto(BASE + "/admin/?v=sessions&p=curs");
  await cr.p.waitForSelector("#tSes table");
  await cr.p.fill("#tSes input.tb-q", "Biel");
  ok((await cr.p.$$("#tSes tbody tr[data-ses]")).length === 0, "abans que entri en Biel, la cerca 'Biel' no té cap sessió");
  cr.d.logs.push({ id: 99, ts: new Date().toISOString(), assig: "socials", nom: "Biel", sessio: "s-biel-live", aparell: "ap-b", event: "entra", detall: { punts: 50 } });
  await cr.p.evaluate(() => window.bnAdminAutoRefresca(true));
  await cr.p.waitForFunction(() => (document.querySelector("#tSes")?.textContent || "").includes("Biel"));
  ok((await cr.p.inputValue("#tSes input.tb-q")) === "Biel" && (await cr.txt("#tSes")).includes("Biel"),
   "autorefresc a ?v=sessions&p=curs incorpora la nova sessió d'en Biel sense perdre la cerca activa");
  // Alertes auto-plegada quan no hi ha cap malament/avís, resolució d'enunciat de preguntes.json i desat/restauració de Llindars (g21)
  cr.d.alertes = [{ tipus: "pregunta", gravetat: 1, nom: null, assig: "socials", text: "La pregunta temps/3 la falla el 75 % dels nens (3 de 4)" }];
  await cr.p.goto(BASE + "/admin/");
  await cr.p.waitForSelector('#alertes[data-plegat="1"]');
  ok((await cr.p.isHidden("#alCos")) === true && (await cr.txt("#alResum")).includes("1 informatiu"),
   "quan només hi ha alertes informatives (cap malament ni avís), Inici → Alertes arrenca plegada automàticament amb «1 informatiu»");
  await cr.p.click("#btAlPlega");
  await cr.p.selectOption("#fAlGrav", "totes");
  ok((await cr.txt("#tAlertes")).includes("Quants anys de dades calen per parlar de clima?"),
   "les alertes de «Pregunta fallada» resolen i mostren l'enunciat real de preguntes.json");
  await cr.p.click("#btAlAjusta");
  await cr.p.waitForSelector("#tLlindarsAl table");
  await cr.p.selectOption('[data-ll-al-grav="encallat"]', "2");
  await cr.p.fill('input.ll-in[data-ll-grp="al"][data-ll-k="encallat"][data-ll-f="vegades"]', "4");
  await cr.p.selectOption('[data-ll-be-niv="xat"]', "off");
  await cr.p.fill('input.ll-in[data-ll-grp="be"][data-ll-k="nit"][data-ll-f="nits_malament"]', "3");
  await cr.p.click("#btDesaLlindars");
  await cr.p.waitForFunction(() => (document.querySelector("#toasts")?.textContent || "").includes("desats"));
  const cLl = cr.crides.filter(x => x.f === "bn_admin_control" && x.cos.p_cfg && x.cos.p_cfg.llindars).pop();
  ok(cLl && cLl.cos.p_cfg.llindars.alertes.encallat.grav === 2 && cLl.cos.p_cfg.llindars.alertes.encallat.vegades === 4 &&
     cLl.cos.p_cfg.llindars.benestar.xat.nivell === "off" && cLl.cos.p_cfg.llindars.benestar.nit.nits_malament === 3,
   "Desa els llindars envia p_cfg.llindars a bn_admin_control amb la gravetat i els números ajustats");
  await cr.p.click("#btResetLlindars");
  await cr.p.waitForSelector("#dlg[open] #dlgOk");
  await cr.p.click("#dlgOk");
  await cr.p.waitForFunction(() => (document.querySelector("#toasts")?.textContent || "").includes("inicials"));
  const cRst = cr.crides.filter(x => x.f === "bn_admin_control" && x.cos.p_cfg && x.cos.p_cfg.reset_llindars === true).pop();
  ok(!!cRst && (await cr.p.inputValue('[data-ll-al-grav="encallat"]')) === "3",
   "Restaura per defecte demana confirmació (#dlg), envia { reset_llindars: true } a bn_admin_control i recupera els valors inicials");

  // Configuració del Rànquing des de Rànquing → Classificació (#btRkAjusta → ?v=config&tab=ranquing) (g22)
  await cr.p.goto(BASE + "/admin/?v=ranquing");
  await cr.p.waitForSelector("#btRkAjusta");
  ok((await cr.txt("#rkTopPill")) === "Top 10", "Rànquing → Classificació mostra la pastilla activa «Top 10»");
  await cr.p.click("#btRkAjusta");
  await cr.p.waitForSelector("#cfgRanquingVis");
  ok(cr.p.url().includes("v=config") && cr.p.url().includes("tab=ranquing"),
   "el botó «Configura» de Classificació porta directament a Configuració → Rànquing (?v=config&tab=ranquing)");
  await cr.p.click('[data-rk-preset="5"]');
  await cr.p.click('[data-rk-tab="nivell"]');
  await cr.p.selectOption("#rkCfgIni", "remuntada");
  await cr.p.fill("#rkCfgMetaEst", "25");
  await cr.p.click("#btDesaRkCfg");
  await cr.p.waitForFunction(() => (document.querySelector("#toasts")?.textContent || "").includes("Top 5"));
  const cRk = cr.crides.filter(x => x.f === "bn_admin_control" && x.cos.p_cfg && x.cos.p_cfg.ranquing).pop();
  ok(cRk && cRk.cos.p_cfg.ranquing.top === 5 && cRk.cos.p_cfg.ranquing.pestanya_inicial === "remuntada" &&
     cRk.cos.p_cfg.ranquing.pestanyes.nivell === false && cRk.cos.p_cfg.ranquing.meta_estrelles === 25,
   "Desa la configuració del rànquing envia p_cfg.ranquing amb top=5, pestanya_inicial='remuntada', nivell=false i meta_estrelles=25");
  await cr.p.click("#btResetRkCfg");
  await cr.p.waitForSelector("#dlg[open] #dlgOk");
  await cr.p.click("#dlgOk");
  await cr.p.waitForFunction(() => (document.querySelector("#toasts")?.textContent || "").includes("inicials"));
  const cRkRst = cr.crides.filter(x => x.f === "bn_admin_control" && x.cos.p_cfg && x.cos.p_cfg.reset_ranquing === true).pop();
  ok(!!cRkRst && (await cr.p.inputValue("#rkCfgTop")) === "10",
   "Restaura per defecte al rànquing envia { reset_ranquing: true } i recupera Top 10");

  ok(cr.errors.length === 0, "cap error de JS a Mons + autorefresc + Llindars + Rànquing");
  await cr.ctx.close();
 }

 console.log("2b) Mòbil (360, 390 i 430 px): barra inferior fixa de 5 eixos, ≤ 8 columnes per taula i zero desbordament");
 for (const w of [360, 390, 430]) {
  const { p, ctx, errors } = await obreAdmin("/admin/?demo", { viewport: { width: w, height: 800 } });
  await p.waitForSelector("#control #ctrlXatSw");
  const maxCols = () => p.$$eval("#contingut table", ts => Math.max(0, ...ts.map(t => t.querySelectorAll("thead th").length)));
  const navInfVis = await p.isVisible("#navInf"), navLatVis = await p.isVisible(".menu");
  const sw1 = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), mc1 = await maxCols();
  await p.click("#btConfig");
  await p.waitForSelector("#xcF");
  const sw2 = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), mc2 = await maxCols();
  await p.click('[data-vtab="ranquing"]');
  await p.waitForSelector("#cfgRanquingVis");
  const sw2r = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), mc2r = await maxCols();
  await p.click('[data-vtab="llindars"]');
  await p.waitForSelector("#tLlindarsAl table");
  const sw2l = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), mc2l = await maxCols();
  await p.click('#navInf [data-v="mons"]');
  await p.waitForSelector('#tMons tr[data-mon="socials"]');
  const sw3 = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), mc3 = await maxCols();
  await p.click('#tMons tr[data-mon="socials"] td:first-child');
  await p.waitForSelector("#selFitxaMon");
  const sw4 = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), mc4 = await maxCols();
  await p.click('#navInf [data-v="sessions"]');
  await p.waitForSelector("#tSes tbody tr");
  await p.click("#tSes tbody tr:first-child");
  await p.waitForSelector("#panell:not([hidden])");
  const sw5 = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), mc5 = await maxCols();
  ok(navInfVis && !navLatVis && sw1 <= w && sw2 <= w && sw2r <= w && sw2l <= w && sw3 <= w && sw4 <= w && sw5 <= w && Math.max(mc1, mc2, mc2r, mc2l, mc3, mc4, mc5) <= 8 && errors.length === 0,
   `${w} px: barra inferior #navInf activa, ≤ 8 columnes i zero desbordament (Inici ${sw1}px, Config ${sw2}px, Rànquing ${sw2r}px, Llindars ${sw2l}px, Mons ${sw3}px, Fitxa món ${sw4}px, Sessions+panell ${sw5}px)`);
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
  const idsPort = await p.$$eval("main .as[data-id]", as => as.map(a => a.dataset.id));
  ok(idsPort[0] === "angles" && idsPort[idsPort.length - 1] === "socials",
   `la portada mostra primer els mons més nous (${idsPort.join(" → ")})`);
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

 console.log("4) Horari nocturn connectat (bn_estat_web.horari → portada #avisNitPortada i món #modalNit + #avisNit dins d'un tema)");
 {
  const ctx = await nav.newContext({ viewport: { width: 360, height: 780 } }), p = await ctx.newPage();
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  await p.route("**/rest/v1/bn_log**", r => r.fulfill({ status: 201, contentType: "application/json", body: "" }));
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0];
   if (f === "bn_estat_web") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ xat_obert_ara: false, xat_en_horari_tancat: true, horari: { actiu: true, tanca_h: "21:15", obre_h: "07:30" }, mons_tancats: [] }) });
   if (f === "bn_vigilia") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ dia0: "2026-11-02", fase: "aprendre", assig: "socials", nit_h: "21:30", nit_vigilia_h: "22:00", obre_h: "06:00" }) });
   if (f === "bn_punts_mons") return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
   if (f === "bn_reinicis") return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
   if (f === "bn_progres_llegeix") return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
   if (f === "bn_punts_maxim") return r.fulfill({ status: 200, contentType: "application/json", body: "0" });
   if (f === "bn_perfil_id") return r.fulfill({ status: 200, contentType: "application/json", body: "12" });
   if (f === "bn_progres_desa") return r.fulfill({ status: 200, contentType: "application/json", body: "1" });
   return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await p.addInitScript(() => {
   localStorage.setItem("bn_jugador", "Biel");
   localStorage.setItem("bn_pins", JSON.stringify({ biel: "4587B" }));
   localStorage.setItem("bn_noms_aparell", JSON.stringify(["Biel"]));
   window.__bnHoraProva = "21:20";
  });
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + "/");
  await p.waitForSelector("#avisNitPortada:not([hidden])");
  const portTxt = await p.textContent("#avisNitPortada");
  const swPort = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(portTxt.includes("Biel") && portTxt.includes("21:15") && swPort <= 360,
   `portada a 360 px mostra #avisNitPortada amb 'Biel' i l'hora de l'admin '21:15' sense desbordament (${swPort}px)`);

  // Dins del món: comencem a les 21:10 (abans de 21:15) estudiant dins d'un test de tema (no pas a #inici)
  await p.goto(BASE + "/sociales/t3-clima/");
  await p.waitForSelector("#app .hero, #modalNit");
  await p.evaluate(() => {
   const m = document.getElementById("modalNit"); if (m) m.remove();
   NIT_ULTIM_AVIS = 0; AVIS_NIT_TANCAT = false;
   HORA_PROVA = { dia: "2026-11-05", hm: "21:10", min: 1270 };
   comprovaBonUsTick();
   obre(0); pest = "test"; pintaTema();
  });
  ok((await p.$("#modalNit")) === null && (await p.$("#avisNit")) === null,
   "a les 21:10 (abans de les 21:15 de l'admin) no surt ni #modalNit ni #avisNit");

  // Passen a ser les 21:20 mentre en Biel continua dins del test del Tema 1
  await p.evaluate(() => {
   HORA_PROVA = { dia: "2026-11-05", hm: "21:20", min: 1280 };
   comprovaBonUsTick();
  });
  await p.waitForSelector("#modalNit");
  const nitTit = await p.textContent("#nitTit");
  const nitCos = await p.textContent("#modalNit");
  const swMon = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  const teSuau = await p.evaluate(() => document.body.classList.contains("suau"));
  ok(nitTit.includes("Biel") && nitCos.includes("21:15") && (await p.$("#avisNit")) !== null && teSuau && swMon <= 360,
   `a les 21:20 dins d'un test salta #modalNit + #avisNit amb '21:15', activa mode suau i no desborda a 360 px (${swMon}px)`);

  // Clicant «Acabo el que estic fent» tanca el diàleg però manté #avisNit visible encara que canviï de pestanya/joc
  await p.click("#btNitAcabo");
  await p.evaluate(() => { pest = "fitxa"; pintaTema(); });
  ok((await p.$("#modalNit")) === null && (await p.isVisible("#avisNit")),
   "després d'«Acabo el que estic fent», #avisNit es manté visible en canviar de pestanya dins del tema");
  ok(errors.length === 0, "cap error de JS en tot el flux nocturn");
  await ctx.close();
 }

 await nav.close(); srv.close();
 if (fallades) { console.error(`\n✗ ${fallades} comprovacions han fallat`); process.exit(1) }
 console.log("\n✓ Totes les comprovacions de nivells (M5) i control de xat/horari/mons han passat");
})();
