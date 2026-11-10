#!/usr/bin/env node
// Bona Nota · prova automàtica dels apartats «Combos i repàs» (M3) i «Errors pendents de la colla» (M4) del tauler del panell d'admin
// (admin/index.html, n2537 fase B pas 2) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-fonts-rep.js
// Engega un servidor estàtic local sobre l'arrel del repo i simula Supabase amb page.route: el tauler (bn_admin_resum, …) amb dades mínimes,
// i bn_admin_fonts_dia i bn_admin_rep_pendents amb el contracte de supabase/bn_admin_fonts_rep.sql. Chart.js se substitueix per un Chart
// de mentida que guarda la configuració de cada gràfic (així es pot comprovar què es dibuixa). No toca res de debò.
// Casos: 1) ?demo: les dues targetes amb dades inventades coherents (repàs = 2 per error après), entrades del menú, cap crida
//        2) amb credencials: crides amb el període, l'assignatura i el nen (i SENSE paràmetres que la funció no té); gràfic apilat per dia,
//           xifres del període, «Les altres fonts» (plegable, amb una clau nova), taula per nen; per món, temes amb títol de preguntes.json,
//           nens, «toquen avui» i preguntes més repetides; filtres d'assignatura, de nen i de període; en memòria en canviar de tema
//        3) 404 de cada funció: l'avís de supabase/bn_admin_fonts_rep.sql només a la targeta afectada; la resta del tauler es veu; un 500
//        4) escapament: un nom, un món, una font, un tid i unes preguntes amb <img onerror> no s'executen · 5) respostes buides
//        6) mòbil (390 px), tema clar i fosc: res surt per la dreta i els errors pendents es llegeixen sense desplaçar-se de costat
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
const AVUI = diaMad(), D = n => sumaD(AVUI, n);
// Chart.js de mentida: guarda el canvas i la configuració de cada gràfic
const CHART = `window.__charts=[];window.Chart=class{constructor(c,cfg){this.canvas=c;this.config=cfg;window.__charts.push(this)}destroy(){this.mort=true}};
window.Chart.defaults={font:{},plugins:{legend:{labels:{}},tooltip:{}}};`;

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r) });
  s.listen(0, "127.0.0.1", () => res(s)) });
}

// el que tornaria el servidor. Fonts per dia: combo 6, triple 3, super 5, repàs 6 (les 4: 20); altres: temes 10, jocs 4, missio 2, boss 10 i una clau nova (7).
// En Biel té estrelles però cap registre al període (el seu nom no obre la fitxa).
function dades(xss) {
 const ara = Date.now(), iso = h => new Date(ara - h * 36e5).toISOString();
 const log = (nom, assig, h, event, detall) => ({ id: 0, ts: iso(h), assig, nom, sessio: "s-" + nom, aparell: "a1", event, detall });
 const logs = [log("Pau", "socials", 2, "entra", { punts: 40 }), log("Laia", "biogeo", 3, "entra", { punts: 10 }), log("Nora", "socials", 4, "entra", { punts: 5 })];
 const fd = [
  { dia: D(-6), k: "pau", nom: "Pau", assig: "socials", f: { combo: 3, repas: 2, temes: 10 } },
  { dia: D(-6), k: "laia", nom: "Laia", assig: "biogeo", f: { combo: 1 } },
  { dia: D(-2), k: "pau", nom: "Pau", assig: "divisibilitat", f: { triple: 3, super: 5, jocs: 4 } },
  { dia: D(0), k: "nora", nom: "Nora", assig: "socials", f: { repas: 4, missio: 2, nova_font: 7 } },
  { dia: D(0), k: "biel", nom: "Biel", assig: "socials", f: { combo: 2, boss: 10 } }];
 const rp = [
  { assig: "socials", tid: "temps", n: 5, nens: 3, avui: 2, preguntes: [{ q: "«Demà nevarà al Pirineu». És…", n: 3 }, { q: "Una altra pregunta del tema", n: 2 }] },
  { assig: "divisibilitat", tid: "mcm", n: 4, nens: 2, avui: 4, preguntes: [{ q: "Quin és el MCM de 4 i 6?", n: 2 }] },
  { assig: "socials", tid: null, n: 3, nens: 1, avui: 0, preguntes: [{ q: "Troba l'error: 3 + 3 = 7", n: 1 }] },
  { assig: "divisibilitat", tid: "xyz", n: 2, nens: 1, avui: 1, preguntes: [] },
  { assig: "socials", tid: "atmos", n: 1, nens: 1, avui: 0, preguntes: [{ q: "Quina capa té l'ozó?", n: 1 }] }];
 if (xss) {
  logs.push(log(XSS, "socials", 1, "entra", { punts: 1 }));
  fd.push({ dia: D(-1), k: XSS.toLowerCase(), nom: XSS, assig: XSS, f: { [XSS]: 3, combo: 2, repas: XSS } }, { dia: XSS, k: "x", nom: "X", assig: "socials", f: { combo: 9 } });
  rp.push({ assig: XSS, tid: XSS, n: 2, nens: XSS, avui: 1, preguntes: [{ q: XSS, n: 2 }, { q: XSS + "2", n: "x" }] }, { assig: "socials", tid: XSS, n: 1, nens: 1, avui: XSS, preguntes: [{ q: XSS, n: 1 }] });
 }
 return { logs, fd, rp };
}
const RESUM = p => ({ periode: p, desde: new Date().toISOString(), ara: { nens: 3, dies: 5, minuts: 190, sessions: 4, tests: 2, nota: 70, aprovats: 50, encert: 60, respostes: 20, examens: 0, nota_exam: null, seg_preg: 5, jocs: 1, obertes: 0, fitxes: 1 }, abans: null });
function respon(st, f, cos) {
 if (f === "bn_admin_logs") return st.d.logs;
 if (f === "bn_admin_ids" || f === "bn_aspectes") return [];
 if (f === "bn_admin_usuari" && cos.p_accio === "estat") return 0;
 if (f === "bn_admin_resum") return RESUM(cos.p_periode);
 if (["bn_admin_activitat", "bn_admin_calor", "bn_admin_domini", "bn_admin_fallades", "bn_admin_evolucio", "bn_admin_alertes", "bn_admin_errors_taller"].includes(f)) return [];
 if (f === "bn_admin_benestar") return { periode: cos.p_periode || "7d", mons: [], nens: [] };
 if (f === "bn_admin_fonts_dia") {
  if (st.fd === 404) return undefined; if (st.fd === 500) return 500;
  const k = String(cos.p_nom || "").trim().toLowerCase(), a = cos.p_assig || "";
  const dies = st.buit ? [] : st.d.fd.filter(r => (!a || r.assig === a) && (!k || r.k === k)), total = {};
  dies.forEach(r => Object.entries(r.f).forEach(([c, v]) => { if (typeof v === "number") total[c] = (total[c] || 0) + v }));
  return { periode: cos.p_periode || "30d", dies, total } }
 if (f === "bn_admin_rep_pendents") {
  if (st.rp === 404) return undefined;
  return st.buit ? [] : st.d.rp.filter(r => !cos.p_assig || r.assig === cos.p_assig) }
 return undefined;
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 async function obre(url, opcions) {
  const o = opcions || {}, st = { d: dades(o.xss), fd: o.fd, rp: o.rp, buit: o.buit };
  const ctx = await nav.newContext({ viewport: o.viewport || { width: 1280, height: 900 }, colorScheme: o.fosc ? "dark" : "light" }), p = await ctx.newPage(), crides = [];
  await p.route("**/rest/v1/rpc/**", r => { const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {}; crides.push({ f, cos });
   const resp = respon(st, f, cos);
   if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
   if (resp === 500) return r.fulfill({ status: 500, contentType: "application/json", body: '{"message":"error"}' });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) }) });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: CHART }));
  if (o.cred) await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), o.cred);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url); await p.waitForSelector("#shell:not([hidden])");
  const crida = async (f, n) => { for (let i = 0; i < 80; i++) { const c = crides.filter(x => x.f === f); if (c.length >= (n || 1)) { await p.waitForTimeout(80); return c[c.length - 1] } await p.waitForTimeout(50) } return null };
  const n = f => crides.filter(x => x.f === f).length;
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null }, s);
  const errG = () => p.evaluate(() => getComputedStyle(document.getElementById("errG")).display !== "none");
  const llest = async () => { await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 }); await p.waitForSelector("#tRep:not([aria-busy]) > *", { timeout: 10000 }); await p.waitForTimeout(60) };
  // el gràfic viu d'un canvas: etiquetes, sèries (nom, dades i color) i si és apilat
  const graf = id => p.evaluate(id => { const c = (window.__charts || []).filter(x => !x.mort && x.canvas.id === id && x.canvas.isConnected).pop(); if (!c) return null; const g = c.config, sc = g.options.scales || {};
   return { tipus: g.type, labels: g.data.labels, ds: g.data.datasets.map(d => ({ label: d.label, data: d.data, color: d.backgroundColor })), apilat: !!(sc.x && sc.x.stacked && sc.y && sc.y.stacked) } }, id);
  const kpis = sel => p.$$eval(sel + " .kpi", ks => ks.map(k => ({ font: k.dataset.font || null, t: k.querySelector(".kpi-t").textContent.trim(), v: k.querySelector(".kpi-v").textContent.trim(), s: (k.querySelector(".kpi-s") || { textContent: "" }).textContent.trim() })));
  // files d'una taula: el text visible de cada cel·la (innerText: sense les etiquetes del mòbil, amagades a l'ordinador)
  const files = sel => p.$$eval(sel + " tbody tr", trs => trs.map(tr => [...tr.cells].map(td => td.innerText.replace(/\s+/g, " ").trim())));
  return { p, ctx, st, crides, errors, crida, n, txt, errG, llest, graf, kpis, files };
 }

 console.log("1) ?demo: les dues targetes amb dades inventades, sense cap crida");
 { const { p, ctx, crides, errors, txt, errG, llest, graf, kpis, files } = await obre("/admin/?demo");
  await llest();
  ok((await txt("#combos h2")) === "Combos i repàs" && (await txt("#pendents h2")) === "Errors pendents de la colla", "apartats «Combos i repàs» i «Errors pendents de la colla» al tauler");
  const secs = await p.$$eval("#nav .sub button", bs => bs.map(b => [b.dataset.sec, b.textContent.trim()]));
  const im = secs.findIndex(s => s[0] === "motivacio");
  ok(secs[im + 1] && secs[im + 1][0] === "combos" && secs[im + 1][1] === "Combos i repàs" && secs[im + 2] && secs[im + 2][0] === "pendents" && secs[im + 2][1] === "Errors pendents de la colla", "entrades al menú d'apartats, després de «Repàs i boss»");
  ok((await txt("#combos .sub")).includes("2.9.0") && (await txt("#combos .sub")).includes("2.10.0") && (await txt("#combos .sub")).includes("és la base"), "el text explica d'on surt (diferències entre registres, el primer és la base) i la 2.9.0/2.10.0");
  const K = await kpis("#tCom");
  ok(K.filter(k => k.font).map(k => k.font).join(",") === "combo,triple,super,repas" && K.some(k => k.t === "Totes les fonts"), "xifres del període: combo, triple, super, repàs i totes les fonts");
  ok(K.find(k => k.font === "combo").t === "Combos" && K.find(k => k.font === "triple").t === "Triple combo (obertes)" && K.find(k => k.font === "super").t === "Super combo (difícils)" && K.find(k => k.font === "repas").t === "Repàs dels errors", "amb els noms de «D'on surten les estrelles»");
  const g = await graf("gCom");
  ok(g && g.tipus === "bar" && g.apilat && g.ds.map(d => d.label).join("|") === "Combos|Triple combo (obertes)|Super combo (difícils)|Repàs dels errors" && g.labels.length >= 8, "gràfic de barres apilades per dia amb les 4 fonts (" + (g ? g.labels.length : 0) + " dies)");
  ok((await files("#tComN")).length >= 5, "taula per nen");
  ok((await p.$$("#tRep details.dm-as")).length >= 3 && !(await txt("#tRep")).includes("no és a preguntes.json"), "errors pendents per món, amb els títols de preguntes.json");
  // coherència: amb 30 dies (tot el registre de la demo), el repàs val 2 estrelles per error après de «Repàs, boss i missions»
  await p.click('#periode [data-d="30"]'); await p.waitForTimeout(300); await llest();
  const apr = +(await p.$$eval("#tMot .kpi", ks => (ks.find(k => k.querySelector(".kpi-t").textContent.trim() === "Errors apresos") || { querySelector: () => ({ textContent: "-1" }) }).querySelector(".kpi-v").textContent.trim()));
  const rep = +(await kpis("#tCom")).find(k => k.font === "repas").v;
  ok(apr > 0 && rep === 2 * apr, `demo coherent: repàs ${rep} ⭐ = 2 × ${apr} errors apresos`);
  await p.click('#nav .sub [data-sec="pendents"]'); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => { const r = document.getElementById("pendents").getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 }), "l'entrada del menú porta a l'apartat");
  ok(crides.length === 0, "cap crida a Supabase en demo (" + crides.map(c => c.f).join(", ") + ")");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("2) amb credencials: crides, gràfic, xifres, taules i filtres");
 { const { p, ctx, crides, errors, crida, n, txt, errG, llest, graf, kpis, files } = await obre("/admin/", { cred: CRED });
  await llest();
  let c = await crida("bn_admin_fonts_dia"), r = await crida("bn_admin_rep_pendents");
  ok(c && Object.keys(c.cos).sort().join(",") === "p_assig,p_email,p_nom,p_pass,p_periode" && c.cos.p_email === CRED.e && c.cos.p_pass === CRED.p && c.cos.p_periode === "7d" && c.cos.p_assig === null && c.cos.p_nom === null,
   "bn_admin_fonts_dia {p_email, p_pass, p_periode:'7d', p_assig:null, p_nom:null}");
  ok(r && Object.keys(r.cos).sort().join(",") === "p_assig,p_email,p_pass" && r.cos.p_assig === null, "bn_admin_rep_pendents {p_email, p_pass, p_assig:null}, sense p_periode ni p_nom (la funció no els té)");
  // gràfic: 8 dies (avui fa 7 dies → avui), apilat, les 4 fonts al dia que toca
  const g = await graf("gCom"), i6 = 1, i2 = 5, i0 = 7;
  ok(g && g.apilat && g.labels.length === 8, "gràfic apilat amb els 8 dies del període, també els que no tenen estrelles");
  const ds = g ? Object.fromEntries(g.ds.map(d => [d.label, d.data])) : {};
  ok(g && ds["Combos"][i6] === 4 && ds["Combos"][i0] === 2 && ds["Triple combo (obertes)"][i2] === 3 && ds["Super combo (difícils)"][i2] === 5 && ds["Repàs dels errors"][i6] === 2 && ds["Repàs dels errors"][i0] === 4 && ds["Combos"].reduce((a, b) => a + b, 0) === 6,
   "cada font al seu dia (combo 4 i 2, triple 3, super 5, repàs 2 i 4)");
  ok(g && g.ds.length === 4 && new Set(g.ds.map(d => d.color)).size === 4, "4 sèries, cada una d'un color");
  const K = await kpis("#tCom"), kf = f => K.find(k => k.font === f) || {};
  ok(kf("combo").v === "6" && kf("triple").v === "3" && kf("super").v === "5" && kf("repas").v === "6", "xifres del període: combo 6, triple 3, super 5, repàs 6");
  ok(kf("combo").s === "3 nens · 2 dies" && kf("triple").s === "1 nen · 1 dia", "amb quants nens i quants dies: «3 nens · 2 dies», «1 nen · 1 dia»");
  const tot = K.find(k => k.t === "Totes les fonts");
  ok(tot && tot.v === "53" && tot.s === "38 % de combos i repàs", "totes les fonts: 53 (38 % de combos i repàs)");
  // la resta de fonts, plegada: s'obre i dibuixa el seu gràfic (també una clau que el panell no coneix)
  ok(!(await p.$eval("#tCom details.fr-altres", d => d.open)) && !(await graf("gComA")), "«Les altres fonts» plegat i sense gràfic fins que s'obre");
  ok((await txt("#tCom details.fr-altres summary")) === "Les altres fonts: 33 estrelles (tests dels temes, jocs, missions del dia…)", "resum: «Les altres fonts: 33 estrelles (tests dels temes, jocs, missions del dia…)»");
  await p.click("#tCom details.fr-altres summary"); await p.waitForTimeout(150);
  const ga = await graf("gComA");
  ok(ga && ga.apilat && ga.ds.map(d => d.label).join("|") === "Tests dels temes|Jocs|Missions del dia|Boss del món|nova_font", "en obrir-lo, gràfic apilat de les altres fonts (amb la clau nova «nova_font» tal qual)");
  ok((await p.$$eval("#tCom .fr-altres .fest", fs => fs.map(f => f.dataset.font + ":" + f.querySelector("b").textContent))).join(",") === "temes:10,jocs:4,missio:2,boss:10,nova_font:7", "i el total de cada una");
  // taula per nen, ordenada per «Combos i repàs»
  const T = await files("#tComN");
  ok(T.map(x => x[0]).join(",") === "Pau,Nora,Biel,Laia", "per nen, de més a menys combos i repàs: " + T.map(x => x[0]).join(","));
  ok(T[0].slice(1).join(",") === "3,3,5,2,13,27" && T[1].slice(1).join(",") === "0,0,0,4,4,13", "Pau: 3, 3, 5, 2 → 13 (27 de totes les fonts); Nora: repàs 4 (13)");
  ok(!!(await p.$('#tComN [data-obre-nen="pau"]')) && !(await p.$('#tComN [data-obre-nen="biel"]')), "el nom obre la fitxa si el nen té registre al període (en Biel no)");
  // errors pendents per món: Socials (9) abans que Mates (6); títols, sense tema, nens, toquen avui i preguntes
  const mons = await p.$$eval("#tRep details.dm-as", ds => ds.map(d => d.dataset.a));
  ok(mons.join(",") === "socials,divisibilitat", "mons ordenats pels errors pendents: " + mons.join(","));
  const KR = await kpis("#tRep");
  ok(KR.map(k => k.t + ":" + k.v).join(",") === "Errors pendents:15,Toquen avui:7,Temes amb errors:4" && KR[1].s === "47 % dels pendents", "xifres: 15 errors pendents, 7 toquen avui (47 %), 4 temes");
  ok((await txt('#tRep details[data-a="socials"] .dm-meta')) === "2 temes i errors sense tema · 9 errors pendents · 2 toquen avui" && (await txt('#tRep details[data-a="socials"] .dm-pit')) === "Més: Temps i clima", "capçalera de Socials: «2 temes i errors sense tema · 9 errors pendents · 2 toquen avui» i «Més: Temps i clima»");
  await p.click('#tRep [data-dm="obre"]'); await p.waitForTimeout(100);
  const S = await files('#tRep details[data-a="socials"]'), M = await files('#tRep details[data-a="divisibilitat"]');
  ok(S.map(x => x[0]).join("|") === "Temps i clima|Sense tema errors de jocs com «Troba l'error»|L'atmosfera: capes i funcions", "temes de Socials amb el títol de preguntes.json, de més a menys errors (i «Sense tema»)");
  const pq = await p.$$eval('#tRep details[data-a="socials"] tbody tr:first-child li', ls => ls.map(l => l.querySelector("b").textContent + " " + l.querySelector(".nv-q").textContent));
  ok(S[0].slice(1, 4).join(",") === "5,3,2" && pq.join(" | ") === "×3 «Demà nevarà al Pirineu». És… | ×2 Una altra pregunta del tema", "Temps i clima: 5 errors, 3 nens, 2 toquen avui, i les preguntes més repetides en ordre");
  ok(M[0][0] === "Mínim comú múltiple (MCM)" && M[1][0] === "xyz no és a preguntes.json" && M[1][4] === "—", "un tema que no és a preguntes.json surt amb l'id i ho diu");
  ok((await p.$$eval("#tRep thead", ts => ts.every(t => getComputedStyle(t).display !== "none"))) && (await p.$$eval("#tRep .fr-l", ls => ls.every(l => getComputedStyle(l).display === "none"))), "a l'ordinador, taula amb capçalera (les etiquetes del mòbil, amagades)");
  ok(!(await p.$("#tRep .fr-nota")), "sense filtre de nen, cap nota");
  // tornar a pintar (tema) no torna a cridar; «Les altres fonts» es queda obert
  const n0 = n("bn_admin_fonts_dia"), r0 = n("bn_admin_rep_pendents");
  await p.click("#tema"); await llest(); await p.waitForTimeout(150);
  ok(n("bn_admin_fonts_dia") === n0 && n("bn_admin_rep_pendents") === r0, "en canviar de tema no es torna a cridar (en memòria fins a tornar a carregar)");
  ok((await p.$eval("#tCom details.fr-altres", d => d.open)) && !!(await graf("gComA")), "«Les altres fonts» es queda obert i amb el gràfic");
  // filtre d'assignatura: va a totes dues funcions
  await p.selectOption("#fAssig", "socials"); c = await crida("bn_admin_fonts_dia", n0 + 1); r = await crida("bn_admin_rep_pendents", r0 + 1); await llest();
  ok(c && c.cos.p_assig === "socials" && r && r.cos.p_assig === "socials" && Object.keys(r.cos).sort().join(",") === "p_assig,p_email,p_pass", "amb l'assignatura Socials, p_assig 'socials' a totes dues");
  ok((await kpis("#tCom")).find(k => k.font === "combo").v === "5" && (await p.$$eval("#tRep details.dm-as", ds => ds.map(d => d.dataset.a + ":" + d.open))).join(",") === "socials:true", "combos de Socials (5) i només el món de Socials, obert");
  // filtre de nen: només a bn_admin_fonts_dia (bn_admin_rep_pendents no porta noms: no es torna a cridar i ho diu)
  const r1 = n("bn_admin_rep_pendents");
  await p.selectOption("#fNen", "Pau"); c = await crida("bn_admin_fonts_dia", n0 + 2); await llest();
  ok(c && c.cos.p_nom === "Pau" && c.cos.p_assig === "socials" && (await files("#tComN")).map(x => x[0]).join(",") === "Pau", "amb el nen Pau, p_nom 'Pau' i només la seva fila");
  ok(n("bn_admin_rep_pendents") === r1 && (await txt("#tRep .fr-nota")).includes("el filtre de nen no s'hi aplica"), "els errors pendents no es tornen a demanar i diuen que el filtre de nen no s'hi aplica");
  await p.selectOption("#fNen", ""); await p.selectOption("#fAssig", ""); await llest();
  // període: només a bn_admin_fonts_dia
  await p.click('#periode [data-d="30"]'); c = await crida("bn_admin_fonts_dia", n0 + 5); await llest(); // n0+3 i n0+4: en treure el nen i l'assignatura
  const rr = crides.filter(x => x.f === "bn_admin_rep_pendents").pop();
  ok(c && c.cos.p_periode === "30d" && !("p_periode" in rr.cos) && (await txt("#tCom")).includes("dels últims 30 dies"), "amb 30 dies, p_periode '30d' (i bn_admin_rep_pendents continua sense p_periode)");
  ok((await graf("gCom")).labels.length === 31, "el gràfic de 30 dies té els 31 dies del període");
  await p.click('#tComN [data-obre-nen="pau"]'); await p.waitForSelector(".perfil h2");
  ok((await txt(".perfil h2")) === "Pau", "el nom obre la fitxa del nen");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("3) el SQL encara no hi és (404) o falla: avís només a la targeta afectada");
 { const { p, ctx, errors, txt, errG, llest } = await obre("/admin/", { cred: CRED, fd: 404, rp: 404 });
  await llest();
  ok(!!(await p.$('#tCom [data-copia="supabase/bn_admin_fonts_rep.sql"]')) && !!(await p.$('#tRep [data-copia="supabase/bn_admin_fonts_rep.sql"]')), "avís de supabase/bn_admin_fonts_rep.sql a cada una de les dues targetes");
  ok((await txt("#tCom .avis")).includes("combos i repàs") && (await txt("#tRep .avis")).includes("errors pendents"), "cada avís diu quin apartat és");
  ok((await p.$$("#contingut .avis")).length === 2 && (await p.$$("#resum .kpi")).length >= 10 && !!(await p.$("#tBen .buit")) && !!(await p.$("#tMot")) && !(await p.$('[data-copia="supabase/bn_admin_tauler.sql"]')), "la resta del tauler es veu (xifres, benestar…) i no hi ha cap altre avís");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }
 { const { p, ctx, errors, txt, errG, llest, graf } = await obre("/admin/", { cred: CRED, rp: 404 });
  await llest();
  ok(!!(await graf("gCom")) && !(await p.$("#tCom .avis")) && !!(await p.$('#tRep [data-copia="supabase/bn_admin_fonts_rep.sql"]')), "si només falta bn_admin_rep_pendents, els combos es veuen i l'avís només surt a «Errors pendents»");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }
 { const { p, ctx, errors, txt, errG, llest } = await obre("/admin/", { cred: CRED, fd: 500 });
  await llest();
  ok((await txt("#tCom .avis.err")).includes("(500)") && !(await p.$("#tCom [data-copia]")) && !!(await p.$("#tRep details.dm-as")), "un error 500 de bn_admin_fonts_dia: avís d'error a la seva targeta (sense «executa el SQL»), i la resta es veu");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("4) escapament: el que ve del servidor no s'executa");
 { const { p, ctx, errors, txt, errG, llest } = await obre("/admin/", { cred: CRED, xss: true });
  await llest(); await p.click('#tRep [data-dm="obre"]'); await p.click("#tCom details.fr-altres summary"); await p.waitForTimeout(200);
  const tc = await txt("#tCom"), tr = await txt("#tRep");
  ok(tc.includes(XSS) && tr.includes(XSS), "el nom, la font, el món, el tid i les preguntes amb HTML surten com a text");
  ok((await p.$$("#tCom img, #tRep img")).length === 0 && (await p.$$("#tCom [onerror], #tRep [onerror]")).length === 0, "cap <img> ni atribut onerror injectat");
  ok(await p.evaluate(x => [...document.querySelectorAll("#tCom [data-obre-nen]")].some(e => e.dataset.obreNen === x.toLowerCase()), XSS), "l'atribut del botó del nom porta el text escapat i es llegeix tal qual");
  ok(await p.evaluate(x => [...document.querySelectorAll("#tCom .fest[data-font]")].some(e => e.dataset.font === x), XSS), "la font desconeguda, escapada també a l'atribut");
  ok(!tc.includes("NaN") && !tr.includes("NaN") && !tc.includes("undefined") && !tr.includes("undefined"), "cap «NaN» ni «undefined» amb valors que no són números");
  await p.click("#tema"); await llest(); await p.waitForTimeout(200);
  ok((await p.evaluate(() => window.__xss)) === undefined, "window.__xss no s'ha posat");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("5) respostes buides");
 { const { p, ctx, errors, txt, errG, llest } = await obre("/admin/", { cred: CRED, buit: true });
  await llest();
  ok((await txt("#tCom .buit")).startsWith("Cap estrella de combo ni de repàs en aquest període.") && !(await p.$("#gCom")), "sense estrelles: «Cap estrella de combo ni de repàs en aquest període.»");
  ok((await txt("#tRep .buit")).startsWith("Cap error pendent de repàs."), "sense errors pendents: «Cap error pendent de repàs.»");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("6) mòbil (390 px), tema clar i fosc");
 for (const [url, o, nom] of [["/admin/?demo", { fosc: true }, "demo, fosc"], ["/admin/", { cred: CRED }, "amb credencials, clar"]]) {
  const { p, ctx, errors, llest, graf } = await obre(url, Object.assign({ viewport: { width: 390, height: 844 } }, o));
  await llest(); await p.click('#tRep [data-dm="obre"]'); await p.click("#tCom details.fr-altres summary"); await p.waitForTimeout(200);
  if (o.fosc) ok((await p.evaluate(() => document.documentElement.dataset.tema)) === "fosc" && (await graf("gCom")).ds[0].color === "#fb923c", "tema fosc, i el gràfic amb els colors del tema fosc");
  const w = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(w <= 390, `${nom}: res no surt per la dreta (ample ${w})`);
  const fora = await p.$$eval("#tCom .kpi, #tCom .cv, #tCom .fest, #tCom .taula-w, #tRep .kpi, #tRep .dm-as, #tRep tbody tr, #tRep tbody td, #tRep .llegenda", es => es.filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1 }).length);
  ok(fora === 0, `${nom}: xifres, gràfics, mons i temes es veuen sencers`);
  ok(await p.$$eval("#tRep thead", ts => ts.length > 0 && ts.every(t => getComputedStyle(t).display === "none")) && await p.$$eval("#tRep tbody tr", trs => trs.length > 0 && trs.every(t => getComputedStyle(t).display === "grid")),
   `${nom}: cada tema dels errors pendents és un bloc (sense desplaçar-se de costat)`);
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de «Combos i repàs» i «Errors pendents de la colla» passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
