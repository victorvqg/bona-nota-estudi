#!/usr/bin/env node
// Bona Nota · prova automàtica de l'apartat «Benestar» del tauler del panell d'admin (admin/index.html, n2540 · M8) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-benestar.js
// Engega un servidor estàtic local sobre l'arrel del repo i simula Supabase amb page.route: el tauler (bn_admin_resum, …) amb dades
// mínimes, i bn_admin_benestar i bn_admin_examen_desa AMB ESTAT, amb el contracte de .nucli/pla-n2540.md. No toca res de debò.
// Casos: 1) ?demo: semàfors de cada color, una vigília en blau, dos aparells, una data d'examen posada, accions desactivades, cap crida
//        2) amb credencials: bn_admin_benestar amb p_email, p_pass, el període i el nen (sense p_assig); semàfors ordenats de pitjor a millor,
//           el blau no compta com a vermell, motius en paraules planeres, el nom obre la fitxa; filtres d'assignatura i de nen; fase de cada món
//        3) la data d'examen: Desa envia bn_admin_examen_desa {p_assig, p_data}; esborrar demana confirmació (Cancel·la no envia res)
//        4) el SQL encara no hi és (404) → avís de supabase/bn_admin_benestar.sql només en aquest apartat; la resta del tauler es veu
//        5) escapament: un nom, un món, un codi i uns valors amb <img onerror> no s'executen · 6) mòbil (390 px), tema fosc: res surt per la dreta
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };
const XSS = '<img src=x onerror="window.__xss=1">';
// dies «AAAA-MM-DD» a l'hora de Catalunya, com el panell i el servidor
const diaMad = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dU = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)), sumaD = (d, n) => new Date(dU(d) + n * 864e5).toISOString().slice(0, 10);
const AVUI = diaMad(), D = n => sumaD(AVUI, n), DLL = ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"];
const DIA = n => n === 0 ? "Avui" : n === 1 ? "Ahir" : DLL[new Date(dU(D(-n))).getUTCDay()].replace(/^./, c => c.toUpperCase()); // com el panell, per als dies 0-6

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r) });
  s.listen(0, "127.0.0.1", () => res(s)) });
}

// el que tornaria el servidor: registre (perquè els noms obrin la fitxa), el tauler mínim i el benestar
function dades(xss) {
 const ara = Date.now(), iso = h => new Date(ara - h * 36e5).toISOString();
 const log = (nom, assig, h, event, detall) => ({ id: 0, ts: iso(h), assig, nom, sessio: "s-" + nom, aparell: "a1", event, detall });
 const logs = [log("Pau", "comarques", 2, "entra", { punts: 40 }), log("Pau", "comarques", 1, "temps", { s: 6600, punts: 40 }), log("Nora", "socials", 3, "entra", { punts: 10 }),
  log("Jana", "comarques", 20, "temps", { s: 4800, punts: 60 }), log("Jana", "divisibilitat", 4, "entra", { punts: 5 }), log("Ot", "socials", 5, "entra", { punts: 3 })];
 if (xss) logs.push(log(XSS, "socials", 1, "entra", { punts: 1 }));
 const S = (codi, nivell, o) => Object.assign({ codi, nivell, dia: null, assig: null, valor: null, llindar: null }, o);
 // amb la forma de supabase/bn_admin_benestar.sql (valor i llindar, números) i, a propòsit, NO en l'ordre bo: el panell ordena de pitjor a millor
 const nens = [
  { k: "jana", nom: "Jana", semafor: "verd", senyals: [S("marato_dia", "blau", { dia: D(-1), assig: "comarques", valor: 130, llindar: 120 }), S("examen_dema", "context", { dia: D(-1), assig: "comarques", valor: 1, llindar: 2 }), S("poc_sovint", "bo", { dia: D(-1), valor: 4, llindar: 3 }), S("apren_errors", "bo", { dia: D(-2), valor: 6, llindar: 2 }), S("fa_descans", "bo", { dia: AVUI, valor: 3, llindar: 4 })] },
  { k: "nora", nom: "Nora", semafor: "groc", senyals: [S("pressa", "groc", { dia: D(-1), assig: "socials", valor: 2, llindar: 3 })] },
  { k: "pau", nom: "Pau", semafor: "vermell", senyals: [S("dos_aparells", "context", { dia: AVUI, valor: 2, llindar: 2 }),
   S("nit", "vermell", { dia: D(-1), assig: "comarques", valor: 1330, llindar: 1290 }), S("nit", "vermell", { dia: D(-2), assig: "comarques", valor: 1300, llindar: 1290 }), S("nit", "vermell", { dia: D(-3), assig: "comarques", valor: 1470, llindar: 1290 }),
   S("marato_bloc", "vermell", { dia: D(-5), assig: "comarques", valor: 70, llindar: 60 }), S("marato_bloc", "vermell", { dia: AVUI, assig: "comarques", valor: 110, llindar: 60 }), S("marato_dia", "vermell", { dia: D(-3), assig: "comarques", valor: 100, llindar: 90 })] },
  { k: "biel", nom: "Biel", semafor: "groc", senyals: [S("inactiu", "groc", { dia: D(-9), valor: 9, llindar: 3 })] },
  { k: "ot", nom: "Ot", semafor: "groc", senyals: [S("nit", "groc", { dia: D(-2), assig: "socials", valor: 1470, llindar: 1290 }), S("frustracio_costa", "groc", { dia: D(-1), assig: "socials", valor: 2, llindar: 2 }),
   S("frustracio_suspesos", "groc", { dia: D(-2), assig: "divisibilitat", valor: 3, llindar: 3 }), S("repetir", "groc", { dia: D(-1), assig: "socials", valor: 5, llindar: 4 }), S("salta_descans", "groc", { dia: D(-1), assig: "socials", valor: 2, llindar: 2 }), S("enganxa", "groc", { dia: D(-1), assig: "castellano", valor: 2, llindar: 1 }),
   S("xat", "groc", { dia: AVUI, valor: 14, llindar: 10 }), S("dos_aparells", "context", { dia: D(-1), valor: 2, llindar: 2 }), S("dos_aparells", "context", { dia: D(-2), valor: 2, llindar: 2 })] }];
 if (xss) nens.push({ k: XSS.toLowerCase(), nom: XSS, semafor: XSS, senyals: [S(XSS, "groc", { dia: XSS, assig: XSS, valor: XSS, llindar: XSS }), S("nit", "groc", { dia: XSS, valor: XSS, llindar: XSS }), S("nit", "groc", { dia: D(-1), valor: { hora: XSS }, llindar: XSS }),
  S("marato_bloc", "vermell", { dia: XSS, assig: XSS, valor: XSS }), S("pressa", "groc", { assig: XSS, valor: XSS, llindar: XSS })] });
 const mons = st => {
  const m = [{ assig: "comarques", dia0: D(-8), vigilies: [D(-1)], normal: 25 }, { assig: "divisibilitat", dia0: D(-6), vigilies: [], normal: 30 }, { assig: "socials", dia0: D(-20), vigilies: [], normal: 22 }, { assig: "castellano", dia0: D(-1), vigilies: [], normal: null }]
   .map(x => Object.assign(x, { examen: st.examens[x.assig] || null }));
  if (xss) m.push({ assig: XSS, dia0: XSS, examen: XSS, vigilies: [XSS, D(-2)], normal: XSS, fase: XSS });
  return m };
 return { logs, nens, mons };
}
const RESUM = p => ({ periode: p, desde: new Date().toISOString(), ara: { nens: 3, dies: 5, minuts: 190, sessions: 4, tests: 2, nota: 70, aprovats: 50, encert: 60, respostes: 20, examens: 0, nota_exam: null, seg_preg: 5, jocs: 1, obertes: 0, fitxes: 1 }, abans: null });
function respon(st, f, cos) {
 if (f === "bn_admin_logs") return st.d.logs;
 if (f === "bn_admin_ids" || f === "bn_aspectes") return [];
 if (f === "bn_admin_usuari" && cos.p_accio === "estat") return 0;
 if (f === "bn_admin_resum") return RESUM(cos.p_periode);
 if (["bn_admin_activitat", "bn_admin_calor", "bn_admin_domini", "bn_admin_fallades", "bn_admin_evolucio", "bn_admin_alertes", "bn_admin_errors_taller"].includes(f)) return [];
 // les targetes del pas 2 (bn_admin_fonts_rep.sql) també es carreguen al tauler: respostes buides perquè no surtin avisos de més
 if (f === "bn_admin_fonts_dia") return { periode: cos.p_periode || "30d", dies: [], total: {} };
 if (f === "bn_admin_rep_pendents") return [];
 if (!st.sql) return undefined;
 if (f === "bn_admin_benestar") { const k = String(cos.p_nom || "").trim().toLowerCase(); return { periode: cos.p_periode || "7d", mons: st.d.mons(st), nens: st.d.nens.filter(n => !k || n.k === k) } }
 if (f === "bn_admin_examen_desa") { if (cos.p_data == null) delete st.examens[cos.p_assig]; else st.examens[cos.p_assig] = cos.p_data; return Object.entries(st.examens).map(([assig, data]) => ({ assig, data })) }
 return undefined;
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 async function obre(url, opcions) {
  const o = opcions || {}, st = { sql: o.sql !== false, d: dades(o.xss), examens: { divisibilitat: D(3) } };
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
  const crida = async (f, n) => { for (let i = 0; i < 80; i++) { const c = crides.filter(x => x.f === f); if (c.length >= (n || 1)) { await p.waitForTimeout(80); return c[c.length - 1] } await p.waitForTimeout(50) } return null };
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null }, s);
  const errG = () => p.evaluate(() => getComputedStyle(document.getElementById("errG")).display !== "none");
  const llest = () => p.waitForSelector("#tBen:not([aria-busy]) .bs-l, #tBen:not([aria-busy]) .avis, #tBen:not([aria-busy]) .buit", { timeout: 10000 });
  // files del benestar: [{k, sem, motius:[{nivell, text}]}], en l'ordre de la pantalla
  const files = () => p.$$eval("#tBen .bs-f", fs => fs.map(f => ({ k: f.dataset.k, sem: f.dataset.sem, nom: f.querySelector(".bs-n").textContent.trim(), boto: !!f.querySelector("[data-obre-nen]"),
   motius: [...f.querySelectorAll(".bs-x")].map(x => ({ nivell: [...x.classList].find(c => c !== "bs-x"), text: x.textContent.replace(/^(Vermell|Groc|Blau|Bo|Context): /, "").replace(/\s+/g, " ").trim() })) })));
  const mon = a => p.$(`#tBen .bs-mon[data-a="${a}"]`);
  return { p, ctx, st, crides, errors, crida, txt, errG, llest, files, mon };
 }

 console.log("1) ?demo: semàfors, vigília en blau, dos aparells i una data d'examen, sense cap crida");
 { const { p, ctx, crides, errors, txt, errG, llest, files } = await obre("/admin/?demo");
  await llest();
  ok((await txt("#benestar h2")) === "Benestar", "apartat «Benestar» al tauler");
  const secs = await p.$$eval("#nav .sub button", bs => bs.map(b => b.dataset.sec));
  ok(secs.includes("benestar") && secs.indexOf("benestar") === secs.indexOf("alertes") + 1, "entrada «Benestar» a la llista d'apartats de dalt, després d'Alertes");
  const F = await files(), sems = F.map(f => f.sem), nivs = F.flatMap(f => f.motius.map(m => m.nivell));
  ok(sems.includes("vermell") && sems.includes("groc") && sems.includes("verd"), "un nen de cada color (vermell, groc, verd)");
  ok(sems.join(",") === [...sems].sort((a, b) => ["vermell", "groc", "verd"].indexOf(a) - ["vermell", "groc", "verd"].indexOf(b)).join(","), "ordenat de pitjor a millor: " + sems.join(", "));
  const jana = F.find(f => f.k === "jana");
  ok(jana && jana.sem === "verd" && jana.motius.some(m => m.nivell === "blau" && m.text.startsWith("Vigília de Comarques: ")), "la Jana: vigília de Comarques en blau, i el semàfor en verd (el blau no compta com a vermell)");
  ok(nivs.includes("bo") && nivs.includes("context") && F.some(f => f.motius.some(m => m.text.includes("dos aparells alhora"))), "senyals bons (verd) i de context (dos aparells)");
  ok((await txt("#tBen .bs-avis")) === "El temps es compta per aparell: si un nen en fa servir dos alhora, els minuts poden sortir doblats.", "avís fix dels dos aparells");
  ok((await txt("#tBen")).includes("Llindars (inicials") && (await txt("#tBen .llegenda")).includes("Blau:"), "llegenda dels colors i llindars inicials");
  const ex = await p.$$eval("#tBen input[type=date]", is => is.map(i => ({ v: i.value, dis: i.disabled })));
  ok(ex.some(x => x.v) && ex.every(x => x.dis), "una data d'examen posada i les caselles desactivades en demo");
  ok((await p.$$eval("#tBen .bs-ex button", bs => bs.every(b => b.disabled))), "botons de desar i esborrar desactivats en demo");
  const fases = await p.$$eval("#tBen [data-fase]", es => es.map(e => e.dataset.fase));
  ok(["vigilia", "aprendre", "novetat", "despres"].every(f => fases.includes(f)), "fase de cada món (vigília, aprendre, novetat, després): " + fases.join(", "));
  await p.click('#nav .sub [data-sec="benestar"]'); await p.waitForTimeout(700);
  ok(await p.evaluate(() => { const r = document.getElementById("benestar").getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 }), "l'entrada del menú porta a l'apartat");
  await p.click("#tema"); await llest();
  ok((await files()).length === F.length, "en canviar de tema es torna a pintar igual");
  ok(crides.length === 0, "cap crida a Supabase en demo (" + crides.map(c => c.f).join(", ") + ")");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("2) amb credencials: crida, semàfors, motius, filtres i fases");
 { const { p, ctx, crides, errors, crida, txt, errG, llest, files, mon } = await obre("/admin/", { cred: CRED });
  await llest();
  let c = await crida("bn_admin_benestar");
  ok(c && c.cos.p_email === CRED.e && c.cos.p_pass === CRED.p && c.cos.p_periode === "7d" && c.cos.p_nom === null && !("p_assig" in c.cos), "crida bn_admin_benestar {p_email, p_pass, p_periode:'7d', p_nom:null}, sense p_assig");
  const F = await files();
  ok(F.map(f => f.k).join(",") === "pau,ot,biel,nora,jana", "ordenat de pitjor a millor (vermell; groc, primer qui en té més; verd): " + F.map(f => f.k).join(","));
  ok(F.map(f => f.sem).join(",") === "vermell,groc,groc,groc,verd", "semàfors: vermell, groc, groc, groc, verd");
  const [pau, ot, biel, nora, jana] = F, te = (f, niv, t) => f.motius.some(m => m.nivell === niv && m.text === t);
  ok(te(pau, "vermell", "Avui va estudiar 1 h 50 min seguides"), "marató de bloc: «Avui va estudiar 1 h 50 min seguides» en vermell");
  ok(te(pau, "vermell", `${DIA(3)} va estudiar 1 h 40 min en total`), `marató del dia: «${DIA(3)} va estudiar 1 h 40 min en total»`);
  ok(te(pau, "vermell", "i 1 dia més amb molta estona") && pau.motius.filter(m => m.text.includes("va estudiar")).length === 2, "de marató, els 2 dies més recents i «i 1 dia més amb molta estona»");
  ok(te(pau, "vermell", "Va entrar 3 nits després de les 21:30") && pau.motius.filter(m => m.text.includes("nit") || m.text.includes("entrar")).length === 1, "les 3 nits en un sol motiu: «Va entrar 3 nits després de les 21:30»");
  ok(te(pau, "context", "Fa servir dos aparells alhora: els minuts poden sortir doblats"), "dos aparells, com a context: «Fa servir dos aparells alhora: els minuts poden sortir doblats»");
  ok(pau.motius[pau.motius.length - 1].nivell === "context", "els motius de vigilar van abans que el context");
  ok(jana.sem === "verd" && jana.motius[0].nivell === "blau" && jana.motius[0].text === "Vigília de Comarques: 2 h 10 min", "vigília en blau: «Vigília de Comarques: 2 h 10 min», i la Jana es queda en verd (el blau no compta com a vermell)");
  ok(te(jana, "bo", "Estudia poc i sovint: 4 dies") && te(jana, "bo", "Aprèn dels errors: 6 aquesta setmana, 2 la passada") && te(jana, "bo", "Fa els descansos quan toca: 3 de 4"), "bons en verd: poc i sovint, aprèn dels errors i fa els descansos (3 de 4)");
  ok(te(jana, "context", "Ahir va marcar «Demà tinc examen» a Comarques (1 de 2)"), "examen_dema com a context: «Ahir va marcar «Demà tinc examen» a Comarques (1 de 2)»");
  ok(te(nora, "groc", "Respon molt de pressa: 2 s per pregunta i encerta menys de la meitat") && nora.motius[0].tt === undefined, "pressa: «Respon molt de pressa: 2 s per pregunta i encerta menys de la meitat»");
  ok(await p.evaluate(() => { const x = document.querySelector('#tBen .bs-f[data-k="nora"] .bs-x'); return !!x && x.title.startsWith("Socials (clima)") }), "el món i el dia del senyal surten en passar-hi el ratolí (title)");
  ok(te(biel, "groc", "Fa 9 dies que no entra"), "deixa de venir: «Fa 9 dies que no entra»");
  ok(te(ot, "groc", `La nit de ${DIA(2).toLowerCase()} va entrar a les 0:30`), `una nit (després de mitjanit): «La nit de ${DIA(2).toLowerCase()} va entrar a les 0:30»`);
  ok(te(ot, "groc", "Ha dit 2 vegades que un tema de Socials (clima) li costa") && te(ot, "groc", "Ha suspès 3 vegades seguides un tema de Mates (divisibilitat)"), "frustració: «Ha dit 2 vegades que un tema … li costa» i «Ha suspès 3 vegades seguides un tema …»");
  ok(te(ot, "groc", "Ahir va repetir 5 vegades un test de Socials (clima) sense estrelles noves"), "repetir: «Ahir va repetir 5 vegades un test de Socials (clima) sense estrelles noves»");
  ok(te(ot, "groc", "Ahir es va saltar el descans 2 vegades seguides a Socials (clima)"), "salta_descans: «Ahir es va saltar el descans 2 vegades seguides a Socials (clima)»");
  ok(te(ot, "groc", "Ha intentat enganxar text a les preguntes obertes (2 vegades)") && te(ot, "groc", "Entra sobretot per xatejar: 14 frases en 7 dies i menys d'1 h d'estudi"), "enganxa text i entra per xatejar");
  ok(te(ot, "context", "Fa servir dos aparells alhora (2 dies): els minuts poden sortir doblats"), "dos aparells en dos dies, en un sol motiu");
  ok(pau.boto && jana.boto && nora.boto && ot.boto && !biel.boto, "el nom obre la fitxa si el nen té registre (en Biel no en té al període)");
  const rs = await txt("#tBen .bs-res");
  ok(rs.includes("1 en vermell") && rs.includes("3 en groc") && rs.includes("1 en verd") && rs.includes("1 vigília en blau"), "resum: 1 en vermell, 3 en groc, 1 en verd, 1 vigília en blau");
  const fase = async a => (await mon(a)) ? p.$eval(`#tBen .bs-mon[data-a="${a}"] [data-fase]`, e => e.dataset.fase) : null;
  ok((await fase("comarques")) === "despres" && (await fase("divisibilitat")) === "aprendre" && (await fase("socials")) === "despres" && (await fase("castellano")) === "novetat", "fases: Comarques després (la vigília va ser ahir), Mates aprendre, Socials després (dia 20), Castellano novetat");
  const tc = await txt('#tBen .bs-mon[data-a="comarques"]'), td = await txt('#tBen .bs-mon[data-a="divisibilitat"]');
  ok(tc.includes("pic del grup") && tc.includes("Un dia normal: 25 min entre tots"), "Comarques: la vigília detectada pel pic del grup i el dia normal");
  ok(td.includes("per la data de l'examen") && (await p.$eval('#tBen .bs-mon[data-a="divisibilitat"] input[type=date]', i => i.value)) === D(3), "Mates: la data d'examen a la casella i la vigília per la data");
  ok(!!(await mon("biogeo")) && !!(await mon("catala")) && (await txt('#tBen .bs-mon[data-a="biogeo"]')).includes("Sense activitat en aquest període") && !(await p.$eval('#tBen .bs-mon[data-a="biogeo"] input[type=date]', i => i.disabled)), "els mons sense activitat al període també hi són, per posar-los la data");
  await p.click('#tBen [data-obre-nen="pau"]'); await p.waitForSelector(".perfil h2");
  ok((await txt("#titol")) === "Fitxa del nen" && (await txt(".perfil h2")) === "Pau", "el nom obre la fitxa del nen");
  await p.click('#nav [data-v="tauler"]'); await llest();
  ok(crides.filter(x => x.f === "bn_admin_benestar").length === 1, "tornar al tauler no torna a cridar (en memòria fins a tornar a carregar)");
  // filtre d'assignatura: només aquell món i els seus senyals (i els generals), sense cap crida nova
  await p.selectOption("#fAssig", "comarques"); await llest(); await p.waitForTimeout(150);
  const FA = await files();
  ok((await p.$$("#tBen .bs-mon")).length === 1 && !!(await mon("comarques")), "amb l'assignatura Comarques, només el món de Comarques");
  ok(!FA.some(f => f.k === "nora") && FA.some(f => f.k === "pau") && FA.some(f => f.k === "jana"), "només els nens d'aquell món (la Nora no hi ha estudiat)");
  ok(crides.filter(x => x.f === "bn_admin_benestar").length === 1, "el filtre d'assignatura es fa al panell (cap crida nova)");
  await p.selectOption("#fAssig", ""); await llest();
  // període i nen van al servidor
  await p.click('#periode [data-d="30"]'); c = await crida("bn_admin_benestar", 2); await llest();
  ok(c && c.cos.p_periode === "30d" && (await txt("#tBen .bs-res")).includes("dels últims 30 dies"), "amb 30 dies, p_periode '30d'");
  await p.selectOption("#fNen", "Pau"); c = await crida("bn_admin_benestar", 3); await llest();
  ok(c && c.cos.p_nom === "Pau" && (await files()).map(f => f.k).join(",") === "pau", "amb el filtre de nen, p_nom 'Pau' i només la seva fila");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("3) la data d'examen: desar i esborrar (amb confirmació)");
 { const { p, ctx, st, crides, errors, crida, txt, errG, llest } = await obre("/admin/", { cred: CRED });
  await llest();
  const sel = a => `#tBen .bs-mon[data-a="${a}"]`;
  await p.fill(sel("comarques") + " input[type=date]", D(4)); await p.click(`${sel("comarques")} [data-bs-desa]`);
  let c = await crida("bn_admin_examen_desa");
  ok(c && c.cos.p_assig === "comarques" && c.cos.p_data === D(4) && c.cos.p_email === CRED.e && c.cos.p_pass === CRED.p, "Desa envia bn_admin_examen_desa {p_email, p_pass, p_assig:'comarques', p_data:'" + D(4) + "'}");
  await crida("bn_admin_benestar", 2); await p.waitForSelector(`${sel("comarques")} [data-bs-esb]`);
  ok(st.examens.comarques === D(4) && (await txt(sel("comarques"))).includes("Examen el") && (await txt(sel("comarques"))).includes("per la data de l'examen"), "després de desar, el món diu la data i la vigília per la data (i es torna a demanar el benestar)");
  ok((await txt("#toasts")).includes("Examen de Comarques"), "avís «Examen de Comarques: …»");
  // esborrar: Cancel·la no envia res
  const n0 = crides.filter(x => x.f === "bn_admin_examen_desa").length;
  await p.click(`${sel("divisibilitat")} [data-bs-esb]`); await p.waitForSelector("#dlg[open]");
  ok((await txt("#dlgT")).includes("Mates (divisibilitat)") && (await txt("#dlg")).includes("pic del grup"), "esborrar demana confirmació, amb el món i què passarà");
  await p.click("#dlgNo"); await p.waitForTimeout(250);
  ok(crides.filter(x => x.f === "bn_admin_examen_desa").length === n0 && st.examens.divisibilitat === D(3), "Cancel·la: no s'envia res i la data es queda");
  await p.click(`${sel("divisibilitat")} [data-bs-esb]`); await p.waitForSelector("#dlg[open]"); await p.click("#dlgOk");
  c = await crida("bn_admin_examen_desa", n0 + 1);
  ok(c && c.cos.p_assig === "divisibilitat" && c.cos.p_data === null, "confirmat: bn_admin_examen_desa {p_assig:'divisibilitat', p_data:null}");
  await p.waitForTimeout(300); await llest();
  ok(!st.examens.divisibilitat && !(await p.$(`${sel("divisibilitat")} [data-bs-esb]`)) && (await p.$eval(sel("divisibilitat") + " input[type=date]", i => i.value)) === "", "la data de Mates ja no hi és");
  // buidar la casella i prémer Retorn també és esborrar (amb confirmació)
  await p.fill(sel("comarques") + " input[type=date]", ""); await p.press(sel("comarques") + " input[type=date]", "Enter"); await p.waitForSelector("#dlg[open]");
  ok((await txt("#dlgT")).includes("Comarques"), "buidar la casella i prémer Retorn demana confirmació");
  await p.click("#dlgOk"); c = await crida("bn_admin_examen_desa", n0 + 2);
  ok(c && c.cos.p_assig === "comarques" && c.cos.p_data === null && !st.examens.comarques, "i, confirmat, l'esborra");
  ok((await p.$$(".toast.err-t")).length === 0, "cap avís d'error");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("4) el SQL encara no hi és (404): avís només en aquest apartat");
 { const { p, ctx, crides, errors, txt, errG, llest } = await obre("/admin/", { cred: CRED, sql: false });
  await llest();
  ok((await txt("#tBen .avis")).includes("supabase/bn_admin_benestar.sql") && !!(await p.$('#tBen [data-copia="supabase/bn_admin_benestar.sql"]')), "avís de supabase/bn_admin_benestar.sql a l'apartat");
  ok((await p.$$("#resum .kpi")).length >= 10 && (await txt("#tAl")).includes("Cap alerta") && !!(await p.$("#tDom .buit")) && !!(await p.$("#tMot")), "la resta del tauler es veu (xifres, alertes, domini…)");
  ok((await p.$$("#contingut .avis")).length === 1 && !(await p.$('[data-copia="supabase/bn_admin_tauler.sql"]')), "cap altre avís al tauler");
  ok(crides.some(x => x.f === "bn_admin_benestar"), "s'ha intentat la crida");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("5) escapament: el que ve del servidor no s'executa");
 { const { p, ctx, errors, txt, errG, llest, files } = await obre("/admin/", { cred: CRED, xss: true });
  await llest(); await p.waitForTimeout(300);
  const t = await txt("#tBen");
  ok(t.includes(XSS), "el nom (i el codi) amb HTML surten com a text");
  ok((await p.$$("#tBen img")).length === 0 && (await p.$$("#tBen [onerror]")).length === 0, "cap <img> ni atribut onerror injectat");
  ok(await p.evaluate(x => [...document.querySelectorAll("#tBen [data-obre-nen]")].some(e => e.dataset.obreNen === x.toLowerCase()), XSS), "l'atribut del botó del nom porta el text escapat i es llegeix tal qual");
  const F = await files(), x = F.find(f => f.nom === XSS);
  ok(x && x.sem === "vermell", "un semàfor que no és cap color es calcula amb els senyals (vermell)");
  ok(!t.includes("NaN") && !t.includes("undefined"), "cap «NaN» ni «undefined» amb valors que no són números");
  ok((await p.$$("#tBen .bs-mon")).length === 8 && (await p.$$eval("#tBen .bs-mon h4", hs => hs.some(h => h.textContent.includes("<img")))), "el món amb HTML (i dates que no ho són) es pinta com a text, sense trencar res");
  await p.click("#tema"); await llest(); await p.waitForTimeout(200);
  ok((await p.evaluate(() => window.__xss)) === undefined, "window.__xss no s'ha posat");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("6) mòbil (390 px), tema fosc i clar");
 for (const [url, o, nom] of [["/admin/?demo", { fosc: true }, "demo, fosc"], ["/admin/", { cred: CRED }, "amb credencials, clar"]]) {
  const { p, ctx, errors, llest } = await obre(url, Object.assign({ viewport: { width: 390, height: 844 } }, o));
  await llest(); await p.waitForTimeout(200);
  if (o.fosc) ok((await p.evaluate(() => document.documentElement.dataset.tema)) === "fosc", "tema fosc");
  const w = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(w <= 390, `${nom}: res no surt per la dreta (ample ${w})`);
  const fora = await p.$$eval("#tBen .bs-f, #tBen .bs-x, #tBen .bs-mon, #tBen .bs-ex input, #tBen .bs-avis", es => es.filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1 }).length);
  ok(fora === 0, `${nom}: files, motius, mons i caselles es veuen senceres`);
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions del Benestar passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
