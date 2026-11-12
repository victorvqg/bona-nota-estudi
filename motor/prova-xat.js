#!/usr/bin/env node
// Bona Nota · prova automàtica del xat de la colla a la portada (index.html: rànquing → pestanya Xat) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-xat.js
// Engega un servidor estàtic local sobre l'arrel del repo i simula Supabase (page.route): el rànquing i un «servidor» del xat
// AMB ESTAT que segueix el contracte de .nucli/pla-n2528.md (estrelles d'avui, crèdits, espera, vots, missatges). No toca res de debò.
// Casos de l'encàrrec: 1) 4 ⭐ → INSERT COIN · 2) 10 ⭐ → 1 crèdit, s'envia, moneda grisa, missatge al xat i a la bafarada
//   3) 5 frases → TORNA DEMÀ · 4) votar sense crèdit → avís i no vota · 5) frases de company: només noms del rànquing i no el propi
//   6) contraccions («Vaig a pel teu lloc!») · 7) «Digues-li…» obre el xat amb la frase i el nom posats · 8) 390 px: xat sota el podi i ENVIA sencer.
// I a més: ?demo sense cap crida al núvol · SQL no aplicat (404) → el rànquing com abans i «El xat arriba aviat» · sense PIN → es llegeix
//   però no s'envia ni es vota · codis «espera», «silenci», «tancat» i «pin» · lectura cada 10 s (i s'atura) · comptador de nous
//   · bn_hs_prev_* intactes a la pestanya Xat · teclat · bafarada que obre el missatge · «CRÈDIT +1» · text del servidor escapat
//   · peça desactivada = «…» · «Efectes suaus» · cap error de JavaScript.
// Arranjaments de la revisió: lectura incremental des de l'últim llegit (cap missatge perdut, en ordre) · esborrats que desapareixen
//   · xat que respon tard (> 1,5 s) · estat que es refresca a mitjanit, en tornar a la pestanya i en tornar d'un món · estat bo que es queda
//   si falla la xarxa · espera del servidor que desbloqueja ENVIA sola · PIN dolent que s'esborra de l'aparell · silenci sense data.
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };

// el catàleg de la portada (bloc XAT-CATALEG): el «servidor» simulat desbloqueja amb els mateixos nivells i mons
// (new Function sobre el nostre propi index.html, que és codi del repo: no hi entra res de fora)
const HTML = fs.readFileSync(path.join(ARREL, "index.html"), "utf8");
const BLOC = HTML.split("/* XAT-CATALEG:inici")[1].split("/* XAT-CATALEG:fi */")[0];
const { XAT_FR, XAT_PC } = new Function(BLOC.slice(BLOC.indexOf("*/") + 2) + ";return {XAT_FR,XAT_PC}")();

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r) });
  s.listen(0, "127.0.0.1", () => res(s)) });
}

// rànquing simulat: «Prova» és 3a a Estrelles (surt al podi i té la Jana just al davant). Nivell 4 (Savi): 60 ⭐ al millor món
const RANK = [
 { nom: "Pau", punts: 263, temps_s: 9400, punts_max: 150, setmana: 71, dies: 14, mons: { socials: 150, biogeo: 36 } },
 { nom: "Jana", punts: 241, temps_s: 7100, punts_max: 190, setmana: 22, dies: 11, mons: { socials: 190, biogeo: 51 } },
 { nom: "Prova", punts: 200, temps_s: 5000, punts_max: 60, setmana: 30, dies: 9, mons: { socials: 60, biogeo: 30, divisibilitat: 10 } },
 { nom: "Nora", punts: 151, temps_s: 5200, punts_max: 120, setmana: 9, dies: 12, mons: { socials: 120, castellano: 31 } },
 { nom: "Hugo", punts: 112, temps_s: 3900, punts_max: 112, setmana: 40, dies: 6, mons: { castellano: 112 } },
 { nom: "Ona", punts: 97, temps_s: 4400, punts_max: 60, setmana: 0, dies: 7, mons: { biogeo: 60, comarques: 37 } }];
const ARA = Date.now(), MIN = 6e4;
// missatges de partida (ids 1–5): la Nora (id 3) té 2 vots i és el missatge del dia
const BASE = () => [
 { id: 1, nom: "Pau", f: 26, c: "Jana", ts: ARA - 40 * MIN }, { id: 2, nom: "Jana", f: 11, c: "Pau", ts: ARA - 30 * MIN },
 { id: 3, nom: "Nora", f: 17, p: 44, ts: ARA - 20 * MIN }, { id: 4, nom: "Hugo", f: 12, p: 2, ts: ARA - 10 * MIN },
 { id: 5, nom: "Ona", f: 1, p: 1, ts: ARA - 5 * MIN }];

// «servidor» del xat amb estat, segons el contracte del pla (bn_xat_llegeix, bn_xat_estat, bn_xat_envia, bn_xat_vota)
function servidorXat(o = {}) {
 const S = { est: o.est ?? 14, cfg: Object.assign({ est_credit: 10, max_dia: 5, espera_s: 10, actiu: true }, o.cfg || {}), env: o.enviats || 0, ult: 0, seq: 100,
  msgs: (o.msgs || BASE()).map(m => Object.assign({ p: null, c: null, esborrat: false }, m)), vots: o.vots || { 3: new Set(["pau", "jana"]) }, silenci: o.silenci || null,
  forca: Object.assign({}, o.forca || {}), off: o.off || { f: [], p: [] }, noves: o.noves || [], pin: "1234A", nivell: o.nivell || 4,
  mons: o.mons || { socials: 60, biogeo: 30, divisibilitat: 10 }, fi: o.fi || 0, xarxa: {}, retard: o.retard || {} }; // xarxa[f]: la propera crida falla · retard[f]: ms
 const k = s => String(s || "").trim().toLowerCase(), fiDia = () => { const d = new Date(); d.setHours(24, 0, 0, 0); return +d };
 const nv = id => (S.vots[id] || new Set()).size, pub = m => ({ id: m.id, nom: m.nom, f: m.f, p: m.p, c: m.c, ts: m.ts, v: nv(m.id) });
 const vis = () => S.msgs.filter(m => !m.esborrat).sort((a, b) => a.id - b.id);
 const mddAhir = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const a0 = +d - 864e5; let m = null;
  vis().forEach(x => { if (x.ts >= a0 && x.ts < +d && nv(x.id) >= 1 && (!m || nv(x.id) > nv(m.id))) m = x }); return m };
 const tePremi = () => { const m = mddAhir(); return !!m && k(m.nom) === "prova" };
 const gec = () => Math.min(S.cfg.max_dia, Math.floor(S.est / S.cfg.est_credit)), bo = () => tePremi() ? 1 : 0;
 const g = () => gec() + bo(), q = () => Math.max(0, g() - S.env);
 const falten = () => { const b = Math.max(gec(), Math.max(0, S.env - bo())); return b >= S.cfg.max_dia ? 0 : (b + 1) * S.cfg.est_credit - S.est };
 const teF = f => !S.off.f.includes(f.id) && f.n <= S.nivell, teP = w => !S.off.p.includes(w.id) && (w.m ? (S.mons[w.m] || 0) >= 25 : w.n <= S.nivell);
 function rpc(f, b) {
  if (S.forca[f]) { const r = S.forca[f]; delete S.forca[f]; return r }
  const ara = Date.now();
  if (f === "bn_xat_llegeix") {
   const ms = vis().slice(-60), avui = new Date(); avui.setHours(0, 0, 0, 0); const ult = {}, ma = mddAhir(); let mdd = null;
   vis().forEach(m => { if (m.ts >= ara - 864e5) ult[k(m.nom)] = m; if (m.ts >= +avui && nv(m.id) >= 1 && (!mdd || nv(m.id) > nv(mdd.id))) mdd = m });
   return { ara, actiu: S.cfg.actiu, msgs: ms.filter(m => m.id > (+b.p_des_de || 0)).map(pub), vots: Object.fromEntries(ms.map(m => [m.id, nv(m.id)])), ultims: Object.values(ult).map(pub), mdd: mdd && pub(mdd), mdd_ahir: ma && pub(ma), off: S.off, noves: S.noves } }
  if (b.p_pin !== S.pin) return { codi: "pin" };
  if (f === "bn_xat_estat") return { codi: "ok", ara, fi_dia: S.fi || fiDia(), est_avui: S.est, premi_ahir: tePremi(), guanyats: g(), enviats: S.env, queden: q(), falten: falten(), nivell: S.nivell, mons: S.mons,
   acabats: Object.keys(S.mons).filter(m => S.mons[m] >= 25), frases: XAT_FR.filter(teF).map(x => x.id), peces: XAT_PC.filter(teP).map(w => w.id).concat(S.noves.map(w => w.id)),
   meus: S.msgs.filter(m => (S.vots[m.id] || new Set()).has("prova")).map(m => m.id), cfg: S.cfg, espera_fins: S.ult + S.cfg.espera_s * 1000, silenci: S.silenci };
  if (S.silenci && (S.silenci.fins == null || S.silenci.fins > ara)) return { codi: "silenci", fins: S.silenci.fins ?? null }; // fins null: amagat o nom prohibit
  if (!S.cfg.actiu) return { codi: "tancat" };
  if (f === "bn_xat_envia") {
   const fr = XAT_FR.find(x => x.id === b.p_frase), w = b.p_peca != null ? XAT_PC.find(x => x.id === b.p_peca) : null, C = fr && fr.s === "C";
   if (!fr || !teF(fr) || (C ? b.p_peca != null || !b.p_company : b.p_company != null || !w || w.s !== fr.s || !teP(w))) return { codi: "bloquejada" };
   const r = C && RANK.find(x => k(x.nom) === k(b.p_company));
   if (C && (!r || k(r.nom) === "prova")) return { codi: "company" };
   if (S.env >= S.cfg.max_dia + bo()) return { codi: "max_dia" };
   if (q() <= 0) return { codi: "sense_credit", falten: falten() };
   if (ara - S.ult < S.cfg.espera_s * 1000) return { codi: "espera", ms: S.cfg.espera_s * 1000 - (ara - S.ult) };
   S.env++; S.ult = ara; const m = { id: ++S.seq, nom: "Prova", f: fr.id, p: C ? null : w.id, c: C ? r.nom : null, ts: ara, esborrat: false }; S.msgs.push(m);
   return { codi: "ok", id: m.id, queden: q(), enviats: S.env, espera_fins: ara + S.cfg.espera_s * 1000 } }
  if (f === "bn_xat_vota") {
   const m = vis().find(x => x.id === +b.p_msg);
   if (!m) return { codi: "no_existeix" }; if (k(m.nom) === "prova") return { codi: "propi" }; if (S.est < S.cfg.est_credit) return { codi: "sense_credit", falten: falten() };
   const v = S.vots[m.id] = S.vots[m.id] || new Set(); if (v.has("prova")) v.delete("prova"); else v.add("prova"); return { codi: "ok", on: v.has("prova"), vots: v.size } }
  return undefined }
 return { S, rpc };
}

(async () => {
 const srv = await servidor(), BASEURL = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 const SEED = { bn_jugador: "Prova", bn_pins: JSON.stringify({ prova: "1234A" }), bn_vol: "0" };
 // obre la portada amb un estat de l'aparell i un «servidor» del xat (null = el SQL encara no hi és: 404), i obre el rànquing
 async function obre(o = {}) {
  const ctx = await nav.newContext({ viewport: o.viewport || { width: 1280, height: 1000 }, reducedMotion: o.suau ? "reduce" : "no-preference" }), p = await ctx.newPage();
  const X = o.xat === null ? null : servidorXat(o.xat || {}), crides = [], nuvol = [];
  await p.route("**/*", async r => { const u = r.request().url();
   if (/supabase\.co/.test(u)) { nuvol.push(u); if (!/\/rest\/v1\/rpc\//.test(u)) return r.abort();
    const f = u.split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {}; crides.push({ f, cos });
    if (X && X.S.xarxa[f]) { delete X.S.xarxa[f]; return r.abort() } // sense connexió
    const resp = f === "bn_ranking_mons" ? RANK : f === "bn_ranking_remuntada" ? (o.remuntada || []) : f === "bn_estat_web" ? o.estat_web : f === "bn_aspectes" ? [] : X && /^bn_xat_/.test(f) ? X.rpc(f, cos) : undefined;
    if (X && X.S.retard[f]) await new Promise(res => setTimeout(res, X.S.retard[f]));
    if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) }) }
   if (/fonts\.googleapis\.com/.test(u)) return r.fulfill({ status: 200, contentType: "text/css", body: "" });
   if (/fonts\.gstatic\.com/.test(u)) return r.abort();
   if (/\/versio\.json/.test(u)) return r.fulfill({ status: 404, body: "" }); // que l'actualització automàtica no recarregui la pàgina
   return r.continue() });
  await p.addInitScript(s => { if (sessionStorage.getItem("seed")) return; sessionStorage.setItem("seed", "1"); for (const k in s) localStorage.setItem(k, s[k]) }, o.seed || SEED);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASEURL + "/" + (o.q || ""));
  if (!/demo/.test(o.q || "")) await p.click("#btHs");
  await p.waitForSelector("#hs .podi, #hs .hs-pausa", { timeout: 8000 }); await p.waitForTimeout(400);
  const n = f => crides.filter(c => c.f === f).length;
  return { p, ctx, X, crides, nuvol, errors, n, xat: () => p.click('.hs-tab[data-t="xat"]').then(() => p.waitForTimeout(350)) };
 }
 const txt = (p, s) => p.$eval(s, e => e.textContent.replace(/\s+/g, " ").trim()).catch(() => "");
 const toast = p => p.waitForSelector("#hsPop .xtoast.vis", { timeout: 2000 }).then(() => txt(p, "#hsPop .xtoast")).catch(() => "");
 const peca = (p, id) => p.click(`#xPc .x-xip[data-xp="${id}"]`);
 const sense = (e) => ok(e.errors.length === 0, "cap error de JavaScript" + (e.errors[0] ? ": " + e.errors[0] : ""));

 console.log("1) amb 4 ⭐ avui: INSERT COIN i ENVIA bloquejat");
 { const e = await obre({ xat: { est: 4 } }), { p } = e; await e.xat();
  ok((await txt(p, "#xLock .xl-t")) === "INSERT COIN", "surt INSERT COIN");
  ok(/Per parlar, guanya 10 .*avui\. En portes 4/.test(await txt(p, "#xLock p")), "«Per parlar, guanya 10 ⭐ avui. En portes 4.»");
  ok((await p.$$("#xLock [data-xtest]")).length === 1, "botó «CONTINUA ESTUDIANT»");
  ok((await p.$$(".xmon.plena")).length === 0 && (await p.$$(".xmon.buida")).length === 5, "5 monedes buides");
  await peca(p, 1); await p.waitForTimeout(100);
  ok((await txt(p, "#xPrevi")) === "Vaig a pel teu lloc!" && await p.isDisabled("#xEnvia"), "es pot preparar el missatge, però ENVIA està bloquejat");
  sense(e); await e.ctx.close() }

 console.log("2) amb 10 ⭐: 1 crèdit; en enviar, la moneda queda grisa i el missatge surt al xat i a la bafarada");
 { const e = await obre({ xat: { est: 10 } }), { p } = e;
  ok(/Tens 1 crèdit per parlar/.test(await txt(p, ".xpeek .xpk-c")), "la targeta diu «Tens 1 crèdit per parlar»");
  await e.xat();
  ok((await p.$$(".xmon.plena")).length === 1 && (await p.$$(".xmon.buida")).length === 4, "1 moneda plena i 4 per guanyar");
  ok(/Avui portes 10 .* Següent crèdit a 20 · et falten 10/.test(await txt(p, ".xc-s")), "«Avui portes 10 ⭐ · Següent crèdit a 20 · et falten 10»");
  ok((await txt(p, "#xLock")) === "", "sense bloqueig");
  const estat0 = e.n("bn_xat_estat");
  await peca(p, 1); await p.waitForTimeout(100); ok(!(await p.isDisabled("#xEnvia")), "ENVIA actiu amb frase i peça");
  await p.click("#xEnvia"); await p.waitForTimeout(700);
  const c = e.crides.find(x => x.f === "bn_xat_envia");
  ok(c && JSON.stringify(c.cos) === JSON.stringify({ p_nom: "Prova", p_pin: "1234A", p_frase: 1, p_peca: 1, p_company: null }), "la crida porta només números (frase 1, peça 1), cap text: " + JSON.stringify(c && c.cos));
  ok((await p.$$(".xmon.gastada")).length === 1 && (await p.$$(".xmon.plena")).length === 0, "la moneda queda grisa (gastada)");
  ok((await txt(p, "#xFeed .x-msg.jo:last-child .x-mt")) === "Vaig a pel teu lloc!", "el missatge surt al xat, a la dreta (propi)");
  ok((await txt(p, '#hs .pd:has(.pd-nom[title="Prova"]) .xbaf')) === "Vaig a pel teu lloc!", "i a la bafarada del podi");
  ok(await p.isDisabled("#xEnvia") && (await txt(p, "#xLock .xl-t")) === "SENSE CRÈDITS", "sense més crèdits: SENSE CRÈDITS");
  ok(/Guanya 10 .*més i tindràs una altra frase/.test(await txt(p, "#xLock p")), "«Guanya 10 ⭐ més i tindràs una altra frase»");
  ok(e.n("bn_xat_estat") > estat0, "després d'enviar es torna a demanar l'estat");
  ok(e.X.S.env === 1 && e.X.S.msgs.some(m => m.id === 101 && m.nom === "Prova"), "el servidor l'ha desat");
  sense(e); await e.ctx.close() }

 console.log("3) després de 5 frases surt TORNA DEMÀ, encara que tingui més estrelles");
 { const e = await obre({ xat: { est: 80, cfg: { espera_s: 0 } } }), { p } = e; await e.xat();
  ok((await p.$$(".xmon.plena")).length === 5, "5 crèdits (el màxim) amb 80 ⭐");
  for (let i = 1; i <= 5; i++) { await peca(p, [1, 2, 3, 4, 5][i - 1]); await p.click("#xEnvia"); await p.waitForFunction(n => document.querySelectorAll(".xmon.gastada").length === n, i, { timeout: 3000 }).catch(() => {}) }
  ok((await p.$$(".xmon.gastada")).length === 5 && e.X.S.env === 5, "5 frases enviades");
  ok((await txt(p, "#xLock .xl-t")) === "TORNA DEMÀ" && /mitjanit \(d'aquí a \d+ h \d+ min\)/.test(await txt(p, "#xLock")), "TORNA DEMÀ amb el compte enrere fins a mitjanit");
  await peca(p, 6); ok(await p.isDisabled("#xEnvia"), "ENVIA bloquejat");
  ok((await p.$$("#xLock [data-xtest]")).length === 0, "sense «CONTINUA ESTUDIANT» (ja no cal estudiar per parlar avui)");
  ok(/Ja tens els 5 crèdits d'avui/.test(await txt(p, ".xc-s")), "«Ja tens els 5 crèdits d'avui»");
  ok((await p.$$("#xFeed .x-msg.jo")).length === 5, "els 5 missatges al xat");
  sense(e); await e.ctx.close() }

 console.log("4) votar sense crèdit mostra l'avís i no vota; amb crèdit, posa i treu el vot");
 { const e = await obre({ xat: { est: 4 } }), { p } = e; await e.xat();
  await p.click('#xFeed .x-vot[data-xv="3"]'); const t = await toast(p);
  ok(/Per votar «Ben dit», guanya 10 estrelles avui \(et falten 6\)/.test(t), "avís: " + t);
  ok(e.n("bn_xat_vota") === 0 && (await txt(p, '#xFeed .x-vot[data-xv="3"] i')) === "2", "no ha votat (cap crida, el comptador segueix a 2)");
  sense(e); await e.ctx.close() }
 { const e = await obre({ xat: { est: 12 } }), { p } = e; await e.xat();
  await p.click('#xFeed .x-vot[data-xv="3"]'); await p.waitForTimeout(400);
  ok((await txt(p, '#xFeed .x-vot[data-xv="3"] i')) === "3" && (await p.getAttribute('#xFeed .x-vot[data-xv="3"]', "aria-pressed")) === "true", "amb crèdit: vota (3 vots, premut)");
  await p.click('#xFeed .x-vot[data-xv="3"]'); await p.waitForTimeout(400);
  ok((await txt(p, '#xFeed .x-vot[data-xv="3"] i')) === "2" && (await p.getAttribute('#xFeed .x-vot[data-xv="3"]', "aria-pressed")) === "false", "i el pot treure (2 vots)");
  ok(/3 «Ben dit»|2 «Ben dit»/.test(await txt(p, "#xMdd")) && /Nora/.test(await txt(p, "#xMdd")) && !/estrella/.test(await txt(p, "#xMdd")), "missatge del dia: el de la Nora, sense cap premi d'estrelles");
  await peca(p, 1); await p.click("#xEnvia"); await p.waitForTimeout(600);
  ok(await p.isDisabled("#xFeed .x-msg.jo .x-vot"), "el «Ben dit» del missatge propi està desactivat");
  sense(e); await e.ctx.close() }

 console.log("5) les frases de company només deixen triar noms del rànquing, i no el propi");
 { const e = await obre({ xat: { est: 10 } }), { p } = e; await e.xat();
  await p.click('.x-cat[data-xcat="colla"]'); await p.click('#xFr .x-xip[data-xf="22"]'); await p.waitForTimeout(100);
  const noms = await p.$$eval("#xPc .x-xip", es => es.map(x => x.textContent.trim()));
  ok(JSON.stringify(noms) === JSON.stringify(["Pau", "Jana", "Nora", "Hugo", "Ona"]), "noms del rànquing sense «Prova»: " + noms.join(", "));
  ok(/TRIA UN COMPANY/.test(await txt(p, "#xPas")), "pas 2: «TRIA UN COMPANY»");
  await p.click('#xPc .x-xip[data-xp="c:Nora"]'); ok((await txt(p, "#xPrevi")) === "Bona, Nora!", "previsualització «Bona, Nora!»");
  ok((await p.$$('#xFr .x-xip.tancat[data-xf="26"]')).length === 1 && /Campió/.test(await txt(p, '#xFr .x-xip[data-xf="26"]')), "«Respecte per a …» bloquejada amb cadenat (Campió)");
  await p.click('#xFr .x-xip[data-xf="26"]'); ok(/nivell 7 \(Campió\)/.test(await toast(p)), "en tocar-la, l'avís diu com aconseguir-la");
  await p.click('.x-cat[data-xcat="aura"]'); await p.waitForTimeout(100);
  ok((await p.$$('#xFr .x-xip.sel[data-xf="11"]')).length === 1 && (await p.$$('#xPc .x-xip[data-xp="c:Pau"]')).length === 1, "Aura: «+1000 d'aura per a …» amb els companys");
  await p.click('#xFr .x-xip[data-xf="13"]'); await p.waitForTimeout(100);
  ok(/COSA DE CLASSE/.test(await txt(p, "#xPas")) && (await p.$$('#xPc .x-xip[data-xp^="c:"]')).length === 0, "«___: -1000 d'aura» només amb coses de classe, mai amb un company");
  sense(e); await e.ctx.close() }

 console.log("6) contraccions i majúscules (el text es compon al navegador)");
 { const e = await obre({ xat: { est: 10 } }), { p } = e; await e.xat();
  await peca(p, 1); ok((await txt(p, "#xPrevi")) === "Vaig a pel teu lloc!", "«Vaig a per» + «el teu lloc» = «Vaig a pel teu lloc!»");
  ok((await txt(p, '#xFeed .x-msg[data-xid="5"] .x-mt')) === "Vaig a pel teu lloc!", "també als missatges que arriben del servidor");
  await p.click('#xFr .x-xip[data-xf="3"]'); await peca(p, 2); ok((await txt(p, "#xPrevi")) === "El test? Bufar i fer ampolles!", "la peça del davant va amb majúscula");
  await p.click('#xFr .x-xip[data-xf="6"]'); await peca(p, 9); ok((await txt(p, "#xPrevi")) === "Ningú m'atura al podi", "«a» + «el podi» = «al podi»");
  await p.click('#xFr .x-xip[data-xf="4"]'); await peca(p, 4); ok((await txt(p, "#xPrevi")) === "Algú m'ajuda amb els jocs?", "«amb els» no es contrau");
  ok((await txt(p, '#xFeed .x-msg[data-xid="4"] .x-mt')) === "El test: +500 d'aura", "«___: +500 d'aura» amb majúscula");
  ok((await p.$$('#xPc .x-xip.tancat[data-xp="13"]')).length === 1 && /Expert/.test(await txt(p, '#xPc .x-xip[data-xp="13"]')), "«el boss final» bloquejada (Expert)");
  ok(/Acaba Mates/.test(await txt(p, '#xPc .x-xip[data-xp="26"]')), "«el MCD» bloquejada: «Acaba Mates»");
  await peca(p, 26); ok(/quan acabes Mates/.test(await toast(p)), "l'avís diu quin món cal acabar");
  ok((await p.$$('#xPc .x-xip.xm[data-xp="28"]:not(.tancat)')).length === 1, "«la tramuntana» desbloquejada (Socials acabat: 60 ⭐)");
  sense(e); await e.ctx.close() }

 console.log("7) el botó «Digues-li…» obre el xat amb la frase i el nom ja posats");
 { const e = await obre({ xat: { est: 10 } }), { p } = e;
  ok((await txt(p, ".hs-tu .xat-digues")) === "Digues-li alguna cosa a Jana", "a «Ets el 3r!» hi ha «Digues-li alguna cosa a Jana» (qui tens just al davant)");
  await p.click(".hs-tu .xat-digues"); await p.waitForTimeout(400);
  ok((await p.getAttribute('.hs-tab[data-t="xat"]', "aria-selected")) === "true", "s'obre la pestanya Xat");
  ok((await p.getAttribute('.x-cat[data-xcat="colla"]', "aria-pressed")) === "true" && (await p.$$('#xFr .x-xip.sel[data-xf="23"]')).length === 1, "categoria Colla i «Compte, …, que vinc!» triades");
  ok((await p.$$('#xPc .x-xip.sel[data-xp="c:Jana"]')).length === 1 && (await txt(p, "#xPrevi")) === "Compte, Jana, que vinc!", "la Jana triada: «Compte, Jana, que vinc!»");
  await p.click("#xEnvia"); await p.waitForTimeout(500);
  const c = e.crides.find(x => x.f === "bn_xat_envia");
  ok(c && c.cos.p_frase === 23 && c.cos.p_company === "Jana" && c.cos.p_peca === null, "s'envia frase 23 amb el company «Jana»");
  sense(e); await e.ctx.close() }

 console.log("8) a 390 px el xat va sota el podi i el botó ENVIA es veu sencer");
 { const e = await obre({ xat: { est: 10 }, viewport: { width: 390, height: 844 } }), { p } = e; await e.xat();
  const r = await p.evaluate(() => { const b = s => document.querySelector(s).getBoundingClientRect(), dins = document.querySelector(".hs-caixa").getBoundingClientRect().right - 4;
   // tot el que hi ha dins del xat i de «Com es guanya parlar» cap dins de la caixa (les capes d'efectes del podi no compten: la caixa les retalla)
   const fora = [...document.querySelectorAll("#hs .a-xat *, #hs .a-xinfo *")].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > dins + .5 }).map(e => e.className.baseVal ?? e.className);
   return { podi: b("#hs .a-podi"), xat: b("#hs .a-xat"), info: b("#hs .a-xinfo"), fora, ample: Math.max(...[...document.querySelectorAll("#hs .xat, #hs .x-compo, #hs .xinfo, #hs .x-env, #hs .x-xips")].map(e => e.scrollWidth - e.clientWidth)) } });
  ok(r.xat.top >= r.podi.bottom - 1 && r.info.top >= r.xat.bottom - 1, "ordre: podi → xat → «Com es guanya parlar»");
  ok(r.ample <= 0 && r.fora.length === 0, "res del xat surt per la dreta del rànquing" + (r.fora.length ? ": " + r.fora.slice(0, 5).join(", ") : ""));
  await peca(p, 1); await p.$eval("#xEnvia", b => b.scrollIntoView({ block: "center" })); await p.waitForTimeout(150);
  const v = await p.evaluate(() => { const b = document.getElementById("xEnvia"), r = b.getBoundingClientRect(), el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { r: { l: r.left, r: r.right, t: r.top, b: r.bottom }, tapat: !(el && b.contains(el)), w: innerWidth, h: innerHeight } });
  ok(v.r.l >= 0 && v.r.r <= v.w && v.r.t >= 0 && v.r.b <= v.h && !v.tapat, "ENVIA sencer i sense res a sobre: " + JSON.stringify(v.r));
  await p.click("#xEnvia"); await p.waitForTimeout(600);
  await p.$eval("#xLock", b => b.scrollIntoView({ block: "center" }));
  const l = await p.evaluate(() => { const r = document.querySelector("#xLock .x-lock").getBoundingClientRect(), bt = document.querySelector("#xLock .x-bt").getBoundingClientRect(); return { l: r.left, r: r.right, bl: bt.left, br: bt.right, w: innerWidth } });
  ok(l.l >= 0 && l.r <= l.w && l.bl >= 0 && l.br <= l.w, "el bloqueig (SENSE CRÈDITS) i el seu botó es veuen sencers");
  sense(e); await e.ctx.close() }

 console.log("9) ?demo: xat amb missatges i crèdits inventats, sense cap crida al núvol");
 { const e = await obre({ q: "?demo", seed: {} }), { p } = e;
  await p.waitForTimeout(500);
  ok((await p.$$("#hs .xbaf")).length === 3 && (await p.$$("#hs .xpeek")).length === 1, "bafarades al podi i targeta del xat");
  ok((await txt(p, "#xatNou")) === "3", "3 missatges nous a la pestanya");
  ok(/Digues-li alguna cosa a Nora/.test(await txt(p, ".hs-tu")), "«Digues-li alguna cosa a Nora» (la Laia és 5a)");
  await e.xat();
  ok((await p.$$("#xFeed .x-msg")).length === 10 && /Avui portes 14/.test(await txt(p, ".xc-s")), "10 missatges i la Laia porta 14 ⭐ (1 crèdit)");
  await peca(p, 1); await p.click("#xEnvia"); await p.waitForTimeout(500);
  ok((await txt(p, "#xFeed .x-msg.jo:last-child .x-mt")) === "Vaig a pel teu lloc!" && (await txt(p, "#xLock .xl-t")) === "SENSE CRÈDITS", "la Laia envia el seu missatge i es queda SENSE CRÈDITS");
  await p.click('#xFeed .x-vot[data-xv="45"]'); await p.waitForTimeout(400);
  ok((await txt(p, '#xFeed .x-vot[data-xv="45"] i')) === "6", "pot votar «Ben dit» (té el primer crèdit d'avui)");
  ok(!/\+1 estrella|21:30/.test(await p.textContent("#hs")), "el missatge del dia no promet cap estrella");
  ok(e.nuvol.length === 0, "cap crida a supabase.co" + (e.nuvol[0] ? ": " + e.nuvol[0] : ""));
  sense(e); await e.ctx.close() }
 { const e = await obre({ q: "?demo&estrelles=4", seed: {} }), { p } = e; await p.waitForTimeout(300); await e.xat();
  ok((await txt(p, "#xLock .xl-t")) === "INSERT COIN" && e.nuvol.length === 0, "?demo&estrelles=4: INSERT COIN (i cap crida al núvol)"); sense(e); await e.ctx.close() }

 console.log("10) el SQL encara no s'ha aplicat (404 a bn_xat_*): el rànquing es veu com abans");
 { const e = await obre({ xat: null }), { p } = e;
  ok((await p.$$("#hs .a-peek, #hs .xpeek, #hs .xbaf, #hs .xat-digues")).length === 0, "sense targeta, bafarades ni «Digues-li…»");
  ok(await p.isHidden("#xatNou"), "sense comptador a la pestanya");
  const cos = await p.$$eval("#hs .hs-cos > *", es => es.map(x => x.className));
  ok(JSON.stringify(cos) === JSON.stringify(["a-podi", "hs-col dre", "a-premis", "a-taula"]) && (await p.$$eval("#hs .hs-col.dre > *", es => es.map(x => x.className))).join() === "a-meta,a-tu", "la mateixa composició d'abans: " + cos.join(" · "));
  ok(!(await p.evaluate(() => [...document.querySelectorAll("#hsTicker .tk-it")].some(x => x.querySelector("svg") && /«/.test(x.textContent)))), "la cinta no porta missatges");
  await e.xat();
  ok(/EL XAT ARRIBA AVIAT/.test(await txt(p, "#hs .a-xat")) && (await p.$$("#hs .a-xinfo, #hs .x-compo")).length === 0, "la pestanya Xat diu «El xat arriba aviat»");
  ok((await p.$$("#hs .a-taula, #hs .a-premis")).length === 0 && (await p.$$("#hs .podi .pd")).length === 3, "amb el podi d'Estrelles i sense classificació");
  await p.click('.hs-tab[data-t="punts"]'); await p.waitForTimeout(300);
  ok((await p.$$("#hs .a-taula .ht-fila")).length > 3, "en tornar a Estrelles, la classificació hi és");
  sense(e); await e.ctx.close() }

 console.log("11) sense PIN: es pot llegir, però no enviar ni votar");
 for (const [nom, seed] of [["amb nom i sense PIN", { bn_jugador: "Prova", bn_vol: "0" }], ["sense nom", { bn_vol: "0" }]]) {
  const e = await obre({ xat: { est: 30 }, seed }), { p } = e; await e.xat();
  ok((await p.$$("#xFeed .x-msg")).length === 5, nom + ": es llegeixen els missatges");
  ok(/Entra amb el teu nom per parlar/.test(await txt(p, "#xLock")), nom + ": «Entra amb el teu nom per parlar»");
  await peca(p, 1); ok(await p.isDisabled("#xEnvia"), nom + ": ENVIA bloquejat");
  await p.click('#xFeed .x-vot[data-xv="3"]'); ok(/Entra amb el teu nom per votar/.test(await toast(p)), nom + ": votar → «Entra amb el teu nom…»");
  ok(e.n("bn_xat_vota") === 0 && e.n("bn_xat_envia") === 0 && e.n("bn_xat_estat") === 0, nom + ": cap crida amb PIN");
  sense(e); await e.ctx.close() }

 console.log("12) codis del servidor: «espera», «silenci», «tancat» i «pin»");
 { const e = await obre({ xat: { est: 30, forca: { bn_xat_envia: { codi: "espera", ms: 7000 } } } }), { p } = e; await e.xat();
  await peca(p, 1); await p.click("#xEnvia"); const t = await toast(p);
  ok(/Espera 7 segons/.test(t) && await p.isDisabled("#xEnvia"), "«espera»: avís i ENVIA desactivat mentre dura: " + t);
  ok((await p.$$(".xmon.gastada")).length === 0, "no ha gastat cap crèdit");
  sense(e); await e.ctx.close() }
 { const fins = Date.now() + 2 * 864e5, e = await obre({ xat: { est: 30, forca: { bn_xat_envia: { codi: "silenci", fins } } } }), { p } = e; await e.xat();
  await peca(p, 1); await p.click("#xEnvia"); const t = await toast(p);
  ok(/no pots escriure/.test(t) && (await txt(p, "#xLock .xl-t")) === "XAT EN PAUSA" && /Fins al \S+ \d+ a les \d\d:\d\d/.test(await txt(p, "#xLock")), "«silenci»: avís i XAT EN PAUSA amb la data");
  ok(await p.isDisabled("#xEnvia"), "ENVIA bloquejat");
  sense(e); await e.ctx.close() }
 { const e = await obre({ xat: { est: 30, silenci: { fins: Date.now() + 864e5 } } }), { p } = e; await e.xat();
  ok((await txt(p, "#xLock .xl-t")) === "XAT EN PAUSA", "silenciat des de l'admin: XAT EN PAUSA en obrir");
  await p.click('#xFeed .x-vot[data-xv="3"]'); ok(/no pots votar/.test(await toast(p)) && e.n("bn_xat_vota") === 0, "i no pot votar");
  ok((await p.$$("#xFeed .x-msg")).length === 5, "però pot llegir"); sense(e); await e.ctx.close() }
 { const e = await obre({ xat: { est: 30, cfg: { actiu: false } } }), { p } = e;
  ok((await p.$$(".xat-digues")).length === 0, "xat tancat: sense «Digues-li…»"); await e.xat();
  ok((await txt(p, "#xLock .xl-t")) === "XAT TANCAT" && (await p.$$("#xFeed .x-msg")).length === 5, "xat tancat: XAT TANCAT i es pot llegir"); sense(e); await e.ctx.close() }
 { const e = await obre({ xat: { est: 30 }, seed: { bn_jugador: "Prova", bn_pins: JSON.stringify({ prova: "9999Z" }), bn_vol: "0" } }), { p } = e; await e.xat();
  ok((await txt(p, "#xLock .xl-t")) === "TORNA A ENTRAR" && await p.isDisabled("#xEnvia"), "PIN de l'aparell incorrecte: «Torna a entrar…»");
  const n0 = e.n("bn_xat_estat"); await p.keyboard.press("Escape"); await p.click("#btHs"); await p.waitForTimeout(500);
  ok(n0 === 1 && e.n("bn_xat_estat") === 1, "no torna a provar el PIN dolent en reobrir el rànquing (cada intent compta per al bloqueig)"); sense(e); await e.ctx.close() }

 console.log("13) lectura cada 10 s només amb la pestanya Xat oberta (s'atura en canviar de pestanya i en tancar)");
 { const e = await obre({ xat: { est: 10 } }), { p } = e;
  ok(await p.evaluate(() => XAT.tL === null), "a Estrelles no es llegeix periòdicament");
  await e.xat(); ok(await p.evaluate(() => XAT.tL !== null), "a la pestanya Xat, sí");
  e.X.S.msgs.push({ id: 50, nom: "Hugo", f: 22, p: null, c: "Pau", ts: Date.now(), esborrat: false });
  const l0 = e.crides.filter(c => c.f === "bn_xat_llegeix").length; await p.waitForTimeout(10800);
  const ll = e.crides.filter(c => c.f === "bn_xat_llegeix").slice(l0);
  ok(ll.length >= 1 && ll[0].cos.p_des_de === 5, "al cap de 10 s, bn_xat_llegeix amb p_des_de = l'últim (5)");
  ok((await txt(p, '#xFeed .x-msg[data-xid="50"] .x-mt')) === "Bona, Pau!", "el missatge nou surt al xat sense repintar el rànquing");
  await p.click('.hs-tab[data-t="dies"]'); await p.waitForTimeout(250); ok(await p.evaluate(() => XAT.tL === null), "en canviar de pestanya s'atura");
  ok((await txt(p, "#hs .p1 .pd-nom")) === "Pau" && (await txt(p, "#hs .p2 .pd-nom")) === "Nora" && /dies d'estudi/.test(await txt(p, "#hs .p1 .pd-val")), "pestanya Dies: ordena per dies d'estudi (Pau 14, Nora 12)");
  await e.xat(); await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  ok(await p.isHidden("#hsPop") && await p.evaluate(() => XAT.tL === null), "en tancar el rànquing (Escape) s'atura");
  sense(e); await e.ctx.close() }

 console.log("14) comptador de nous, bn_hs_prev_* intactes, teclat, bafarada i «CRÈDIT +1»");
 { const e = await obre({ xat: { est: 10 }, seed: Object.assign({ bn_xat_vist: "3" }, SEED) }), { p } = e;
  ok((await txt(p, "#xatNou")) === "2" && await p.isVisible("#xatNou"), "2 missatges nous des de l'última vegada (bn_xat_vist)");
  ok(await p.isVisible(".hs-caixa .xc-flash") || (await p.evaluate(() => JSON.parse(localStorage.getItem("bn_xat_cred") || "{}").g)) === 1, "«CRÈDIT +1» (bn_xat_cred desat amb g = 1)");
  await p.evaluate(() => localStorage.setItem("bn_hs_prev_punts", '{"sentinella":1}'));
  await p.focus('.hs-tab[data-t="remuntada"]'); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(350);
  ok((await p.getAttribute('.hs-tab[data-t="xat"]', "aria-selected")) === "true" && await p.evaluate(() => document.activeElement.dataset.t === "xat"), "fletxa dreta des de Remuntada → Xat");
  ok(await p.isHidden("#xatNou") && (await p.evaluate(() => localStorage.getItem("bn_xat_vist"))) === "5", "en obrir el xat, el comptador s'amaga i es desa l'últim vist");
  ok((await p.evaluate(() => [localStorage.getItem("bn_hs_prev_punts"), localStorage.getItem("bn_hs_prev_xat")])).join("|") === '{"sentinella":1}|', "la pestanya Xat no desa bn_hs_prev_xat ni trepitja bn_hs_prev_punts");
  ok((await p.$$("#hs .a-taula, #hs .a-premis, #hs .a-peek")).length === 0 && /COM ES GUANYA PARLAR/.test(await txt(p, "#hs .a-xinfo")), "vista Xat: sense classificació ni premis, amb «Com es guanya parlar»");
  await p.keyboard.press("Home"); await p.waitForTimeout(300); ok((await p.getAttribute('.hs-tab[data-t="punts"]', "aria-selected")) === "true", "Home → Estrelles");
  await p.keyboard.press("End"); await p.waitForTimeout(300); ok((await p.getAttribute('.hs-tab[data-t="xat"]', "aria-selected")) === "true", "End → Xat");
  await p.click('.hs-tab[data-t="punts"]'); await p.waitForTimeout(300);
  await p.click('#hs .pd:has(.pd-nom[title="Pau"]) .xbaf'); await p.waitForTimeout(400);
  ok((await p.getAttribute('.hs-tab[data-t="xat"]', "aria-selected")) === "true" && (await p.$$('#xFeed .x-msg.flash[data-xid="1"]')).length === 1, "tocar la bafarada del Pau obre el xat en aquell missatge, il·luminat");
  await p.keyboard.press("Escape"); await p.waitForTimeout(150); await p.click("#btHs"); await p.waitForTimeout(500);
  ok((await p.$$(".hs-caixa .xc-flash")).length === 0, "en tornar a obrir el rànquing, cap «CRÈDIT +1» repetit");
  sense(e); await e.ctx.close() }

 console.log("15) text del servidor escapat, peça desactivada = «…», peça nova de l'admin");
 { const msgs = BASE().concat([{ id: 6, nom: "<img src=x onerror=alert(1)>", f: 22, c: "<b>Pau</b>", ts: ARA - MIN }, { id: 7, nom: "Hugo", f: 12, p: 7, ts: ARA - MIN }, { id: 8, nom: "Nora", f: 1, p: 1001, ts: ARA - MIN }]);
  const e = await obre({ xat: { est: 10, msgs, off: { f: [], p: [7] }, noves: [{ id: 1001, s: "P", t: "la paraula <i>nova</i>", n: 1, m: null }] } }), { p } = e; await e.xat();
  ok((await p.$$("#xFeed img:not(svg), #xFeed .x-mt b b, #xFeed i:not(.x-vot i)")).length === 0 && /<img src=x/.test(await txt(p, '#xFeed .x-msg[data-xid="6"] .x-mh b')), "noms i company del servidor es mostren com a text (esc)");
  ok((await txt(p, '#xFeed .x-msg[data-xid="7"] .x-mt')) === "…: +500 d'aura", "una peça desactivada es veu com «…»");
  ok((await txt(p, '#xFeed .x-msg[data-xid="8"] .x-mt')) === "Vaig a per la paraula <i>nova</i>!", "la peça nova (id 1001) es compon amb el seu text, escapat");
  ok((await p.$$('#xPc .x-xip[data-xp="7"]')).length === 0 && (await p.$$('#xPc .x-xip[data-xp="1001"]')).length === 1, "al constructor no hi surt la desactivada i sí la nova");
  sense(e); await e.ctx.close() }

 console.log("16) «Efectes suaus» (prefers-reduced-motion): sense rètols ni monedes que salten");
 { const e = await obre({ xat: { est: 10 }, suau: true }), { p } = e;
  ok(/CRÈDIT \+1/.test(await toast(p)) && (await p.$$(".hs-caixa .xc-flash")).length === 0, "«CRÈDIT +1» com a avís de text, sense rètol animat");
  await e.xat(); await peca(p, 1); await p.click("#xEnvia"); await p.waitForTimeout(100);
  ok((await p.$$(".xcoin-fly")).length === 0 && (await p.$$(".xmon.gastada")).length === 1, "s'envia sense la moneda que salta");
  sense(e); await e.ctx.close() }

 const ids = p => p.$$eval("#xFeed .x-msg", es => es.map(e => +e.dataset.xid).join());
 const lock = p => txt(p, "#xLock .xl-t");
 console.log("17) lectura incremental: cap missatge perdut ni desordenat, estat bo si falla la xarxa i esborrats que desapareixen");
 { const e = await obre({ xat: { est: 10 } }), { p } = e; await e.xat(); const t0 = Date.now(), S = e.X.S;
  await peca(p, 1);
  S.msgs.push({ id: ++S.seq, nom: "Hugo", f: 22, p: null, c: "Pau", ts: Date.now(), esborrat: false }); // 101: un altre escriu just abans d'enviar
  S.xarxa.bn_xat_estat = 1; // i l'estat que es demana després d'enviar no arriba (xarxa)
  await p.click("#xEnvia"); await p.waitForTimeout(700);
  ok((await ids(p)) === "1,2,3,4,5,102", "el missatge propi (102) surt de seguida: " + await ids(p));
  ok((await lock(p)) === "SENSE CRÈDITS" && (await p.$$(".xmon.gastada")).length === 1, "si l'estat de després d'enviar falla per la xarxa, es queda l'últim bo (SENSE CRÈDITS, no SENSE CONNEXIÓ): " + await lock(p));
  const l0 = e.n("bn_xat_llegeix"), s0 = e.n("bn_xat_estat");
  await p.waitForTimeout(Math.max(0, t0 + 10800 - Date.now()));
  const ll = e.crides.filter(c => c.f === "bn_xat_llegeix").slice(l0);
  ok(ll.length >= 1 && ll[0].cos.p_des_de === 5, "al tic, bn_xat_llegeix des de l'últim que ha llegit del servidor (5), no des del propi (102): " + JSON.stringify(ll[0] && ll[0].cos));
  ok((await ids(p)) === "1,2,3,4,5,101,102" && (await txt(p, '#xFeed .x-msg[data-xid="101"] .x-mt')) === "Bona, Pau!", "el de l'Hugo (101) surt al xat, al seu lloc (abans del propi): " + await ids(p));
  ok(e.n("bn_xat_estat") > s0 && (await p.evaluate(() => XAT.estErr)) === "", "i al mateix tic es torna a demanar l'estat que havia fallat");
  // l'admin esborra el de la Nora (3, el missatge del dia) i amaga el nom de l'Hugo (101): al tic següent ja no hi són
  S.msgs.find(m => m.id === 3).esborrat = true; S.msgs.find(m => m.id === 101).esborrat = true;
  await p.evaluate(() => { const t = tickerHs; window.__tk = null; tickerHs = function (nt) { window.__tk = nt.slice(); return t.apply(this, arguments) } });
  await p.waitForTimeout(Math.max(0, t0 + 20800 - Date.now()));
  ok((await ids(p)) === "1,2,4,5,102", "els missatges esborrats o de noms amagats desapareixen del xat obert: " + await ids(p));
  ok(/Encara cap vot avui/.test(await txt(p, "#xMdd")) && !/Nora/.test(await txt(p, "#xMdd")), "el missatge del dia (el de la Nora) també");
  const tk = await p.evaluate(() => window.__tk);
  ok(tk && /Vaig a pel teu lloc!/.test(tk[0]) && !tk.some(x => /Bona, Pau!/.test(x)), "i la cinta torna a començar sense el missatge amagat");
  sense(e); await e.ctx.close() }

 console.log("18) l'espera que diu el servidor (espera_fins) desbloqueja ENVIA sola quan s'acaba, sense esperar el tic");
 { const e = await obre({ xat: { est: 12, cfg: { espera_s: 3 } } }), { p } = e; await e.xat();
  await peca(p, 1); await p.waitForTimeout(100); ok(!(await p.isDisabled("#xEnvia")), "ENVIA actiu");
  e.X.S.ult = Date.now(); // ha enviat des d'un altre aparell fa un moment
  await p.click('#xFeed .x-vot[data-xv="3"]'); await p.waitForTimeout(500); // votar torna a demanar l'estat
  ok(await p.isDisabled("#xEnvia"), "l'estat porta una espera: ENVIA desactivat");
  await p.waitForFunction(() => !document.getElementById("xEnvia").disabled, null, { timeout: 4000 }).catch(() => {});
  ok(!(await p.isDisabled("#xEnvia")), "quan s'acaba (3 s), ENVIA torna a estar actiu sol (el tic és a 10 s)");
  sense(e); await e.ctx.close() }

 console.log("19) el xat respon tard (més d'1,5 s): quan arriba, targeta, «Digues-li…» i cinta, sense repintar el rànquing");
 { const e = await obre({ xat: { est: 10, retard: { bn_xat_llegeix: 3000 } } }), { p } = e;
  ok((await p.$$("#hs .a-peek, #hs .xat-digues, #hs .xbaf")).length === 0, "el rànquing es pinta sense esperar el xat");
  await p.evaluate(() => { window.__n = { p: 0, c: 0, r: 0 }; const w = (n, k) => { const f = window[n]; window[n] = function () { __n[k]++; return f.apply(this, arguments) } }; w("pintaHs", "p"); w("confetiHs", "c"); w("redoble", "r") });
  await p.waitForSelector("#hs .a-peek", { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(300);
  ok(await p.evaluate(() => { const d = document.querySelector("#hs .hs-col.dre"); return !!d && d.firstElementChild.classList.contains("a-peek") && !!d.querySelector(".xpeek") }), "la targeta «Xat de la colla» surt a dalt de la columna dreta");
  ok(/Tens 1 crèdit per parlar/.test(await txt(p, ".xpeek .xpk-c")), "amb els crèdits");
  ok((await txt(p, ".hs-tu .xat-digues")) === "Digues-li alguna cosa a Jana", "«Digues-li alguna cosa a Jana» a «Ets el 3r!»");
  ok((await p.$$("#hs .xbaf")).length === 2 && (await txt(p, "#xatNou")) === "5", "bafarades i comptador");
  ok(await p.evaluate(() => [...document.querySelectorAll("#hsTicker .tk-it")].some(x => /«/.test(x.textContent))), "la cinta torna a començar amb els missatges al davant");
  ok((await p.evaluate(() => JSON.stringify(__n))) === '{"p":0,"c":0,"r":0}', "sense repintar el rànquing ni tornar a llançar confeti ni redoble: " + await p.evaluate(() => JSON.stringify(__n)));
  sense(e); await e.ctx.close() }

 console.log("20) l'estat es torna a demanar a mitjanit, en tornar a la pestanya i en tornar d'un món (Enrere)");
 { const e = await obre({ xat: { est: 80, enviats: 5, fi: Date.now() + 4000 } }), { p } = e; await e.xat(); const S = e.X.S;
  ok((await lock(p)) === "TORNA DEMÀ", "TORNA DEMÀ abans de mitjanit");
  const s0 = e.n("bn_xat_estat"); S.env = 0; S.est = 0; S.fi = 0; // passa mitjanit: dia nou, crèdits a zero
  await p.waitForFunction(() => (document.querySelector("#xLock .xl-t") || {}).textContent === "INSERT COIN", null, { timeout: 5000 }).catch(() => {});
  ok((await lock(p)) === "INSERT COIN" && e.n("bn_xat_estat") === s0 + 1, "en passar fi_dia, es torna a demanar l'estat sol i el bloqueig canvia (INSERT COIN): " + await lock(p));
  S.est = 10; const s1 = e.n("bn_xat_estat");
  await p.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); await p.waitForTimeout(400);
  ok(e.n("bn_xat_estat") === s1 + 1 && (await txt(p, "#xLock")) === "", "en tornar a la pestanya (visibilitychange → visible) es torna a demanar l'estat");
  await p.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); await p.waitForTimeout(300);
  ok(e.n("bn_xat_estat") === s1 + 1, "però com a molt un cop cada pocs segons");
  sense(e); await e.ctx.close() }
 { const e = await obre({ xat: { est: 30, fi: Date.now() + 3500 } }), { p } = e; const s0 = e.n("bn_xat_estat");
  const torna = per => p.evaluate(x => dispatchEvent(new PageTransitionEvent("pageshow", { persisted: x })), per).then(() => p.waitForTimeout(400));
  await p.keyboard.press("Escape"); await torna(true);
  ok(e.n("bn_xat_estat") === s0, "amb el rànquing tancat, tornar a la pàgina no demana res");
  await p.waitForTimeout(Math.max(0, e.X.S.fi + 1500 - Date.now()));
  ok(e.n("bn_xat_estat") === s0, "ni a mitjanit (el temporitzador s'atura en tancar)");
  await p.click("#btHs"); await p.waitForTimeout(500); const s1 = e.n("bn_xat_estat");
  await torna(false); ok(e.n("bn_xat_estat") === s1, "pageshow d'una càrrega normal: res");
  await torna(true); ok(e.n("bn_xat_estat") === s1 + 1, "Enrere des d'un món (pageshow persisted) amb el rànquing obert: es torna a demanar l'estat");
  sense(e); await e.ctx.close() }

 console.log("21) un PIN guardat que ja no serveix s'esborra de l'aparell i no es torna a provar");
 { const e = await obre({ xat: { est: 30 }, seed: { bn_jugador: "Prova", bn_pins: JSON.stringify({ prova: "9999Z", ona: "1111A" }), bn_vol: "0" } }), { p } = e;
  const pins = JSON.parse(await p.evaluate(() => localStorage.getItem("bn_pins")));
  ok(e.n("bn_xat_estat") === 1 && !("prova" in pins) && pins.ona === "1111A", "bn_xat_estat → {codi:'pin'}: el PIN de la Prova surt de bn_pins (el de l'Ona es queda): " + JSON.stringify(pins));
  await e.xat(); ok((await lock(p)) === "TORNA A ENTRAR", "«TORNA A ENTRAR»");
  await p.reload(); await p.click("#btHs"); await p.waitForSelector("#hs .podi", { timeout: 8000 }); await p.waitForTimeout(400); await e.xat();
  ok(e.n("bn_xat_estat") === 1, "en tornar a carregar la portada no es torna a provar (no gasta més intents)");
  ok((await lock(p)) === "ENTRA PER PARLAR" && /Entra amb el teu nom per parlar/.test(await txt(p, "#xLock")), "«Entra amb el teu nom per parlar»");
  sense(e); await e.ctx.close() }
 { const e = await obre({ xat: { est: 30, forca: { bn_xat_envia: { codi: "pin" } } } }), { p } = e; await e.xat();
  await peca(p, 1); await p.click("#xEnvia"); await p.waitForTimeout(500);
  ok(!("prova" in JSON.parse(await p.evaluate(() => localStorage.getItem("bn_pins")))) && (await lock(p)) === "TORNA A ENTRAR" && await p.isDisabled("#xEnvia"), "bn_xat_envia → {codi:'pin'}: també s'esborra i surt «TORNA A ENTRAR»");
  sense(e); await e.ctx.close() }

 console.log("22) silenci sense data (nom amagat o prohibit): bloqueig «Ara no pots escriure al xat»");
 { const e = await obre({ xat: { est: 30, silenci: { fins: null } } }), { p } = e; await e.xat();
  ok((await lock(p)) === "XAT EN PAUSA" && /Ara no pots escriure al xat/.test(await txt(p, "#xLock")) && !/Fins al/.test(await txt(p, "#xLock")), "bn_xat_estat → silenci {fins:null}: «Ara no pots escriure al xat», sense data");
  await peca(p, 1); ok(await p.isDisabled("#xEnvia"), "ENVIA bloquejat");
  await p.click('#xFeed .x-vot[data-xv="3"]'); ok(/no pots votar/.test(await toast(p)) && e.n("bn_xat_vota") === 0, "i no pot votar");
  sense(e); await e.ctx.close() }
 for (const f of ["bn_xat_envia", "bn_xat_vota"]) {
  const e = await obre({ xat: { est: 30, forca: { [f]: { codi: "silenci", fins: null } } } }), { p } = e; await e.xat();
  if (f === "bn_xat_envia") { await peca(p, 1); await p.click("#xEnvia") } else await p.click('#xFeed .x-vot[data-xv="3"]');
  const t = await toast(p);
  ok(/no pots (escriure|votar)/.test(t) && (await lock(p)) === "XAT EN PAUSA" && /Ara no pots escriure al xat/.test(await txt(p, "#xLock")) && await p.isDisabled("#xEnvia"), f + " → {codi:'silenci',fins:null}: el mateix bloqueig, sense data");
  sense(e); await e.ctx.close() }

 console.log("23) missatge d'ahir (mdd_ahir): corona al xat i +1 crèdit extra (premi_ahir) sense tocar estrelles");
 { const d0 = new Date(); d0.setHours(0, 0, 0, 0); const ahTs = +d0 - 3600e3;
  // 23a: la Jana va guanyar ahir → surt «👑 Missatge d'ahir: Jana» a #xMdd i la insígnia «👑 Ahir» als seus missatges
  const msgsJ = [{ id: 10, nom: "Jana", f: 1, p: 1, ts: ahTs }, ...BASE()];
  const votsJ = { 10: new Set(["pau", "nora", "ona"]), 3: new Set(["pau", "jana"]) };
  const e1 = await obre({ xat: { est: 14, msgs: msgsJ, vots: votsJ } }), { p: p1 } = e1; await e1.xat();
  const mddTxt = await txt(p1, "#xMdd");
  ok(/👑 Missatge d'ahir: Jana/.test(mddTxt) && /\+1 crèdit avui/.test(mddTxt) && !/estrella/.test(mddTxt), "#xMdd mostra «👑 Missatge d'ahir: Jana» i «+1 crèdit avui», sense la paraula estrella: " + mddTxt);
  ok((await txt(p1, '#xFeed .x-msg[data-xid="2"] .x-cor')) === "👑 Ahir" && (await p1.$$('#xFeed .x-msg[data-xid="3"] .x-cor')).length === 0, "insígnia «👑 Ahir» només als missatges de la guanyadora d'ahir");
  sense(e1); await e1.ctx.close();

  // 23b: «Prova» va guanyar ahir → amb 0 ⭐ té 1 crèdit a punt (6 monedes totals), pot enviar però votar demana 10 ⭐
  const msgsP = [{ id: 10, nom: "Prova", f: 1, p: 1, ts: ahTs }, ...BASE()];
  const votsP = { 10: new Set(["pau", "jana"]), 3: new Set(["pau"]) };
  const e2 = await obre({ xat: { est: 0, msgs: msgsP, vots: votsP } }), { p: p2 } = e2; await e2.xat();
  ok((await txt(p2, "#xLock")) === "", "amb 0 ⭐ i premi_ahir=true no surt INSERT COIN");
  ok((await p2.$$(".xmon.plena")).length === 1 && (await p2.$$(".xmon.buida")).length === 5, "6 monedes: 1 plena (premi d'ahir) i 5 per guanyar estudiant");
  ok(/👑 \+1 pel missatge d'ahir/.test(await txt(p2, ".xc-s")) && /Frases avui: 0 de 6/.test(await txt(p2, "#xAvui")), "indica el crèdit d'ahir i el topall de 6 frases");
  await p2.click('#xFeed .x-vot[data-xv="3"]');
  ok(/10/.test(await toast(p2)), "votar «Ben dit» continua demanant 10 ⭐ estudiades avui");
  await peca(p2, 1); await p2.waitForTimeout(100); ok(!(await p2.isDisabled("#xEnvia")), "ENVIA actiu amb el crèdit d'ahir");
  await p2.click("#xEnvia"); await p2.waitForTimeout(700);
  ok((await p2.$$(".xmon.gastada")).length === 1 && (await lock(p2)) === "SENSE CRÈDITS", "un cop gastat el crèdit d'ahir amb 0 ⭐, passa a SENSE CRÈDITS");
  sense(e2); await e2.ctx.close();

  // 23c: amb 60 ⭐ i 6 frases enviades arriba a TORNA DEMÀ («Ja has dit les 6 frases d'avui»)
  const e3 = await obre({ xat: { est: 60, enviats: 6, msgs: msgsP, vots: votsP } }), { p: p3 } = e3; await e3.xat();
  ok((await lock(p3)) === "TORNA DEMÀ" && /Ja has dit les 6 frases d'avui/.test(await txt(p3, "#xLock p")), "amb premi_ahir, TORNA DEMÀ surt després de 6 frases");
  sense(e3); await e3.ctx.close() }

 console.log("24) pestanya Remuntada (g22): podi, taula «Repàs», premi i missatge quan encara no hi ets");
 { const e = await obre({ suau: true, remuntada: [{ nom: "Hugo", apr: 12 }, { nom: "Nora", apr: 5 }, { nom: "Ona", apr: 1 }] }), { p } = e;
  await p.click('.hs-tab[data-t="remuntada"]'); await p.waitForTimeout(250);
  ok(/Hugo/.test(await txt(p, "#hs .pd.p1 .pd-nom")) && /12.*errors recuperats/.test(await txt(p, "#hs .pd.p1 .pd-val")), "podi 1r Remuntada: Hugo amb 12 errors recuperats");
  ok(/1.*error recuperat/.test(await txt(p, "#hs .pd.p3 .pd-val")), "singular correcte: 1 error recuperat");
  ok(/Repàs/.test(await txt(p, "#hs .ht-cap .c-x")), "capçalera de columna activa: Repàs");
  ok(/Repassa els teus errors i sortiràs a la remuntada/.test(await txt(p, "#hs .hs-tu p")), "missatge motivador a .hs-tu quan encara no tens repassos");
  ok(/Remuntada de la setmana[\s\S]*Hugo[\s\S]*12[\s\S]*al repàs en 7 dies/.test(await txt(p, "#hs .hs-caixeta")), "premi «Remuntada de la setmana» actualitzat");
  sense(e); await e.ctx.close() }

 console.log("25) configuració del rànquing des de l'admin (bn_estat_web.ranquing): XX primers, pròpia fila, pestanyes, meta i pausa");
 { const seedOna = { bn_jugador: "Ona", bn_pins: JSON.stringify({ ona: "1111A" }), bn_vol: "0" };
  const e1 = await obre({
   suau: true, seed: seedOna,
   estat_web: { ranquing: { actiu: true, top: 3, mostrar_propia: true, pestanya_inicial: "setmana", pestanyes: { punts: true, dies: true, nivell: false, setmana: true, remuntada: true }, mostra_premis: false, mostra_meta: true, meta_estrelles: 20, meta_pct: 50 } }
  }), { p: p1 } = e1;
  ok((await p1.getAttribute('.hs-tab[data-t="setmana"]', "aria-selected")) === "true", "obre directament a la pestanya inicial configurada («setmana»)");
  ok(await p1.isHidden('.hs-tab[data-t="nivell"]'), "la pestanya desactivada («nivell») queda amagada");
  await p1.click('.hs-tab[data-t="punts"]'); await p1.waitForTimeout(200);
  ok(/Top 3 de 6 jugadors/.test(await txt(p1, "#hs .a-taula .hs-sec small")), "indica «Top 3 de 6 jugadors» quan hi ha més jugadors que el tall");
  const files1 = await p1.$$eval("#hs .hs-taula .ht-fila:not(.ht-mat):not(.ht-cap) .nm", ns => ns.map(n => n.textContent.trim()));
  ok(files1.length === 4 && files1[0].startsWith("Pau") && files1[2].startsWith("Prova") && files1[3].startsWith("Ona") && (await p1.$("#hs .hs-taula .ht-salt")) !== null,
   "amb mostrar_propia=true, l'Ona (#6) es veu sota «···» sense ensenyar els #4 i #5: " + files1.join(" | "));
  ok((await p1.$$("#hs .a-premis")).length === 0 && /Aconseguida! 4 de 6 heu fet 20/.test(await txt(p1, "#hs .hs-meta")),
   "premis amagats (mostra_premis=false) i meta de la colla ajustada a 50% i 20 ⭐ (4 de 6 → aconseguida!)");
  sense(e1); await e1.ctx.close();

  const e2 = await obre({
   suau: true, seed: seedOna,
   estat_web: { ranquing: { actiu: true, top: 3, mostrar_propia: false } }
  }), { p: p2 } = e2;
  const files2 = await p2.$$eval("#hs .hs-taula .ht-fila:not(.ht-mat):not(.ht-cap) .nm", ns => ns.map(n => n.textContent.trim()));
  ok(files2.length === 3 && !files2.some(n => n.startsWith("Ona")) && (await p2.$("#hs .hs-taula .ht-salt")) === null,
   "amb mostrar_propia=false, la taula talla exactament als 3 primers sense fila pròpia extra");
  sense(e2); await e2.ctx.close();

  const e3 = await obre({
   suau: true,
   estat_web: { ranquing: { actiu: false } }
  }), { p: p3 } = e3;
  ok(/EL RÀNQUING ESTÀ EN PAUSA ARA MATEIX/.test(await txt(p3, "#hs .hs-pausa")) && await p3.isHidden('.hs-tab[data-t="punts"]') && !(await p3.isHidden('.hs-tab[data-t="xat"]')),
   "amb actiu=false, mostra la pantalla de pausa del rànquing, amaga les pestanyes de punts i manté oberta la pestanya Xat");
  await e3.xat();
  ok((await p3.$("#xFeed")) !== null, "tot i tenir el rànquing en pausa, el xat de la colla continua accessible");
  sense(e3); await e3.ctx.close() }

 console.log("26) pastilles de repàs i examen a les targetes de la portada i sense targeta «Pròximament» (g23)");
 { const avuiIso = new Date().toISOString().slice(0, 10);
  const demaIso = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const futurIso = new Date(Date.now() + 4 * 864e5).toISOString().slice(0, 10);
  const seedG23 = {
   bn_jugador: "Prova", bn_pins: JSON.stringify({ prova: "1234A" }), bn_vol: "0",
   bn_angles_perfils: JSON.stringify({ Prova: { nom: "Prova", punts: 12, rep: { "fenn|Q1": { tid: "fenn", q: "Q1", c: 0, prox: avuiIso }, "fenn|Q2": { tid: "fenn", q: "Q2", c: 1, prox: "2020-01-01" }, "fenn|Q3": { tid: "fenn", q: "Q3", c: 0, prox: "2099-01-01" } }, vigilia_dies: [avuiIso] } }),
   bn_soc_perfils: JSON.stringify({ Prova: { nom: "Prova", punts: 8, rep: { "temps|Q1": { tid: "temps", q: "Q1", c: 0, prox: avuiIso } } } })
  };
  const e = await obre({
   suau: true, seed: seedG23, viewport: { width: 390, height: 844 },
   estat_web: { mons_tancats: [], examens: { socials: futurIso } }
  }), { p } = e;
  await p.click("#hsTanca"); await p.evaluate(d => { window.__bnDiaProva = d; window.bnPintaAvisosMons() }, avuiIso);
  ok((await p.$$("main .prox")).length === 0, "la targeta buida «Pròximament» (.prox) ja no surt al final de la portada");
  const angTxt = await txt(p, 'main .as[data-id="angles"] .avisos-mon');
  const socTxt = await txt(p, 'main .as[data-id="socials"] .avisos-mon');
  ok(/Examen demà!/.test(angTxt) && /2 per repassar/.test(angTxt), "Anglès mostra «📅 Examen demà!» (de vigilia_dies) i «🧠 2 per repassar»: " + angTxt);
  ok(/Examen /.test(socTxt) && /1 per repassar/.test(socTxt), "Socials mostra la data d'examen d'admin (bn_estat_web.examens) i «🧠 1 per repassar»: " + socTxt);
  const desborda = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok(!desborda, "cap desbordament horitzontal a 390px amb les pastilles .avisos-mon");
  // En mode tast les pastilles personals s'amaguen
  await p.evaluate(() => activaTastPortada(false));
  ok(await p.isHidden('main .as[data-id="angles"] .avisos-mon'), "en mode tast anònim s'amaguen les pastilles .avisos-mon");
  sense(e); await e.ctx.close() }

 // 27) horari nocturn propi dels mons (22:00 → 08:00) a la portada i les 5 festes del rànquing (g26)
 console.log("27) horari nocturn propi dels mons (22:00 → 08:00) i les 5 festes del rànquing (Gravetat zero + Foc de Drac · g26)");
 { const e = await obre({
   suau: false, seed: { bn_jugador: "Laia" },
   estat_web: { mons_tancats: [], horari: { actiu: false, tanca_mons: true, mons_tanca_h: "22:00", mons_obre_h: "08:00" } }
  }), { p } = e;
  // Disparem les 5 festes seguides (incloent GRAVETAT ZERO! i FOC DE DRAC!)
  const rotuls = await p.evaluate(() => {
   const vista = [];
   for (let k = 0; k < 5; k++) { festa(); const r = document.querySelector(".hs-rotul"); if (r) vista.push(r.textContent); fiFesta(true); }
   return vista;
  });
  ok(rotuls.includes("GRAVETAT ZERO!") && rotuls.includes("FOC DE DRAC!") && rotuls.length === 5, "les 5 festes del rànquing (incloent GRAVETAT ZERO! i FOC DE DRAC!) s'executen sense errors: " + rotuls.join(" · "));
  await p.click("#hsTanca");
  await p.evaluate(() => { window.__bnHoraProva = "22:10"; window.bnRefrescaMonsPortada(); window.bnPintaAvisNitPortada(); });
  const nTancatsNit = await p.$$eval("main .as.mon-tancat[data-tancat-nit='08:00']", xs => xs.length);
  ok(nTancatsNit === 7, `a les 22:10 tots els 7 mons queden apagats per descans nocturn fins a les 08:00 (obtingut: ${nTancatsNit})`);
  ok((await txt(p, 'main .as[data-id="biogeo"] .tag-tancat')) === "🌙 DESCANS" && (await txt(p, 'main .as[data-id="biogeo"] .juga span')) === "🌙 FINS 08:00", "les targetes mostren «🌙 DESCANS» i «🌙 FINS 08:00»");
  ok(await p.isVisible("#avisNitPortada") && (await txt(p, "#avisNitPortada")).includes("22:00") && (await txt(p, "#avisNitPortada")).includes("08:00"), "#avisNitPortada mostra la franja nocturna pròpia dels mons (22:00–08:00)");
  await p.click('main .as[data-id="biogeo"]', { force: true });
  ok((await txt(p, "#monTancatToast")).includes("08:00"), "en clicar un món apagat de nit surt l'avís amable amb l'hora d'obertura (08:00)");
  await p.evaluate(() => { window.__bnHoraProva = "08:05"; window.bnRefrescaMonsPortada(); window.bnPintaAvisNitPortada(); });
  const nTancatsDia = await p.$$eval("main .as.mon-tancat", xs => xs.length);
  ok(nTancatsDia === 0 && await p.isHidden("#avisNitPortada"), "a les 08:05 tots els 7 mons es reobren sols i desapareix l'avís nocturn");
  sense(e); await e.ctx.close() }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions del xat de la colla passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
