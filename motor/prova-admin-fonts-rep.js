#!/usr/bin/env node
// Bona Nota · prova automàtica dels apartats «Combos i repàs» (Rànquing → Reptes), «Estrelles per origen» (Inici)
// i «Errors pendents de la colla» (Mons → Errors pendents) del panell d'admin (admin/index.html) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-fonts-rep.js
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
const CRED = { e: "admin@prova.cat", p: "secret-de-prova" };
const XSS = '<img src=x onerror="window.__xss=1">';
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
 if (f === "bn_admin_ids" || f === "bn_aspectes" || f === "bn_admin_altes" || f === "bn_ranking_mons") return [];
 if (f === "bn_admin_control") return { xat_actiu: true, xat_obert_ara: true, horari: { actiu: true, tanca_min: 1290, obre_min: 420 }, mons_tancats: [] };
 if (f === "bn_admin_usuari" && cos.p_accio === "estat") return 0;
 if (f === "bn_admin_resum") return RESUM(cos.p_periode);
 if (["bn_admin_activitat", "bn_admin_calor", "bn_admin_domini", "bn_admin_fallades", "bn_admin_evolucio", "bn_admin_alertes", "bn_admin_errors_taller"].includes(f)) return [];
 if (f === "bn_admin_benestar") return { periode: cos.p_periode || "7d", mons: [], nens: [] };
 if (f === "bn_admin_dificultat") return { min_respostes: 8, dies: 365, assig: null, resum: { preguntes_vistes: 0, amb_dades: 0, dificils: 0, normals: 0, facils: 0 }, preguntes: [] };
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
  const clicMenu = async v => {
   if (await p.isVisible("#navInf")) await p.click(`#navInf [data-v="${v}"]`);
   else await p.click(`#nav [data-v="${v}"]`);
  };
  const vesCombos = async () => {
   await clicMenu("ranquing");
   await p.waitForSelector('[data-vtab="reptes"]');
   await p.click('[data-vtab="reptes"]');
   await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 });
   await p.waitForTimeout(60);
  };
  const vesPendents = async () => {
   await clicMenu("mons");
   await p.waitForSelector('[data-vtab="pendents"]');
   await p.click('[data-vtab="pendents"]');
   await p.waitForSelector("#tRep:not([aria-busy]) > *", { timeout: 10000 });
   await p.waitForTimeout(60);
  };
  const graf = id => p.evaluate(id => { const c = (window.__charts || []).filter(x => !x.mort && x.canvas.id === id && x.canvas.isConnected).pop(); if (!c) return null; const g = c.config, sc = g.options.scales || {};
   return { tipus: g.type, labels: g.data.labels, ds: g.data.datasets.map(d => ({ label: d.label, data: d.data, color: d.backgroundColor })), apilat: !!(sc.x && sc.x.stacked && sc.y && sc.y.stacked) } }, id);
  const kpis = sel => p.$$eval(sel + " .kpi", ks => ks.map(k => ({ font: k.dataset.font || null, t: k.querySelector(".kpi-t").textContent.trim(), v: k.querySelector(".kpi-v").textContent.trim(), s: (k.querySelector(".kpi-s") || { textContent: "" }).textContent.trim() })));
  const files = sel => p.$$eval(sel + " tbody tr", trs => trs.map(tr => [...tr.cells].map(td => td.innerText.replace(/\s+/g, " ").trim())));
  return { p, ctx, st, crides, errors, crida, n, txt, errG, vesCombos, vesPendents, graf, kpis, files };
 }

 console.log("1) ?demo: Inici + Rànquing → Reptes + Mons → Errors pendents, sense cap crida");
 { const { p, ctx, crides, errors, txt, errG, vesCombos, vesPendents, graf, kpis, files } = await obre("/admin/?demo");
  await p.waitForSelector("#fontsDiaCos:not([aria-busy]) > *");
  ok((await p.$$("#fontsDiaCos .fest")).length >= 4, "Inici mostra el resum compacte d'estrelles per origen");
  await vesCombos();
  ok((await txt("#combos h2")) === "Combos i repàs" && (await txt("#motivacio h2")) === "Repàs i boss", "Rànquing → Reptes mostra «Combos i repàs» i «Repàs i boss»");
  await p.click("#combos .btn-ajuda");
  ok((await txt("#combos-aj")).includes("2.9.0") && (await txt("#combos-aj")).includes("2.10.0") && (await txt("#combos-aj")).includes("és la base"), "l'ajuda plegable (i) explica d'on surt i la 2.9.0/2.10.0");
  const K = await kpis("#tCom");
  ok(K.filter(k => k.font).map(k => k.font).join(",") === "combo,triple,super,repas" && K.some(k => k.t === "Totes les fonts"), "xifres del període: combo, triple, super, repàs i totes les fonts");
  ok(K.find(k => k.font === "combo").t === "Combos" && K.find(k => k.font === "triple").t === "Triple combo (obertes)" && K.find(k => k.font === "super").t === "Super combo (difícils)" && K.find(k => k.font === "repas").t === "Repàs dels errors", "amb els noms de «D'on surten les estrelles»");
  const g = await graf("gCom");
  ok(g && g.tipus === "bar" && g.apilat && g.ds.map(d => d.label).join("|") === "Combos|Triple combo (obertes)|Super combo (difícils)|Repàs dels errors" && g.labels.length >= 8, "gràfic de barres apilades per dia amb les 4 fonts (" + (g ? g.labels.length : 0) + " dies)");
  ok((await files("#tComN")).length >= 5, "taula per nen");
  // coherència: amb 30 dies (tot el registre de la demo), el repàs val 2 estrelles per error après de «Repàs i boss»
  await p.click('#periode [data-d="30"]');
  await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 }); await p.waitForTimeout(80);
  const apr = +(await p.$$eval("#tMot .kpi", ks => (ks.find(k => k.querySelector(".kpi-t").textContent.trim() === "Errors apresos") || { querySelector: () => ({ textContent: "-1" }) }).querySelector(".kpi-v").textContent.trim()));
  const rep = +(await kpis("#tCom")).find(k => k.font === "repas").v;
  ok(apr > 0 && rep === 2 * apr, `demo coherent: repàs ${rep} ⭐ = 2 × ${apr} errors apresos`);
  await vesPendents();
  ok((await txt("#pendents h2")) === "Errors pendents de la colla" && (await p.$$("#tRep details.dm-as")).length >= 3 && !(await txt("#tRep")).includes("no és a preguntes.json"), "Mons → Errors pendents per món, amb els títols de preguntes.json");
  ok(crides.length === 0, "cap crida a Supabase en demo (" + crides.map(c => c.f).join(", ") + ")");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("2) amb credencials: crides sota demanda, gràfic, xifres, taules i filtres");
 { const { p, ctx, crides, errors, crida, n, txt, errG, vesCombos, vesPendents, graf, kpis, files } = await obre("/admin/", { cred: CRED });
  await p.waitForSelector("#fontsDiaCos:not([aria-busy]) > *");
  ok(n("bn_admin_rep_pendents") === 0, "bn_admin_rep_pendents NO es crida a Inici (càrrega sota demanda)");
  let c = await crida("bn_admin_fonts_dia");
  ok(c && Object.keys(c.cos).sort().join(",") === "p_assig,p_email,p_nom,p_periode" && c.cos.p_email === CRED.e && c.cos.p_pass === CRED.p && c.cos.p_periode === "7d" && c.cos.p_assig === null && c.cos.p_nom === null
   || (c && Object.keys(c.cos).sort().join(",") === "p_assig,p_email,p_nom,p_pass,p_periode" && c.cos.p_email === CRED.e && c.cos.p_pass === CRED.p && c.cos.p_periode === "7d" && c.cos.p_assig === null && c.cos.p_nom === null),
   "bn_admin_fonts_dia {p_email, p_pass, p_periode:'7d', p_assig:null, p_nom:null}");
  await vesCombos();
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
  // la resta de fonts, plegada: s'obre i dibuixa el seu gràfic
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
  // canviar de tema a Rànquing → Reptes no torna a cridar i manté «Les altres fonts» obert
  const n0 = n("bn_admin_fonts_dia");
  await p.click("#tema"); await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 }); await p.waitForTimeout(150);
  ok(n("bn_admin_fonts_dia") === n0, "en canviar de tema no es torna a cridar bn_admin_fonts_dia");
  ok((await p.$eval("#tCom details.fr-altres", d => d.open)) && !!(await graf("gComA")), "«Les altres fonts» es queda obert i amb el gràfic");
  // filtres locals a Rànquing → Reptes
  await p.selectOption("#fAssig", "socials"); c = await crida("bn_admin_fonts_dia", n0 + 1);
  await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 });
  ok(c && c.cos.p_assig === "socials" && (await kpis("#tCom")).find(k => k.font === "combo").v === "5", "amb l'assignatura Socials a Reptes, p_assig 'socials' i combos = 5");
  await p.selectOption("#fNen", "Pau"); c = await crida("bn_admin_fonts_dia", n0 + 2);
  await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 });
  ok(c && c.cos.p_nom === "Pau" && c.cos.p_assig === "socials" && (await files("#tComN")).map(x => x[0]).join(",") === "Pau", "amb el nen Pau, p_nom 'Pau' i només la seva fila");
  await p.selectOption("#fNen", ""); await p.selectOption("#fAssig", "");
  await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 });
  const nPre30 = n("bn_admin_fonts_dia");
  await p.click('#periode [data-d="30"]'); c = await crida("bn_admin_fonts_dia", nPre30 + 1);
  await p.waitForSelector("#tCom:not([aria-busy]) > *", { timeout: 10000 });
  ok(c && c.cos.p_periode === "30d" && (await txt("#tCom")).includes("dels últims 30 dies") && (await graf("gCom")).labels.length === 31, "amb 30 dies, p_periode '30d' i 31 dies al gràfic");
  // ara Mons → Errors pendents
  await vesPendents();
  let r = await crida("bn_admin_rep_pendents");
  ok(r && Object.keys(r.cos).sort().join(",") === "p_assig,p_email,p_pass" && r.cos.p_assig === null, "bn_admin_rep_pendents {p_email, p_pass, p_assig:null}, sense p_periode ni p_nom");
  const mons = await p.$$eval("#tRep details.dm-as", ds => ds.map(d => d.dataset.a));
  ok(mons.join(",") === "socials,divisibilitat", "mons ordenats pels errors pendents: " + mons.join(","));
  const KR = await kpis("#tRep");
  ok(KR.map(k => k.t + ":" + k.v).join(",") === "Errors pendents:15,Toquen avui:7,Temes amb errors:4" && KR[1].s === "47 % dels pendents", "xifres: 15 errors pendents, 7 toquen avui (47 %), 4 temes");
  ok((await txt('#tRep details[data-a="socials"] .dm-meta')) === "2 temes i errors sense tema · 9 errors pendents · 2 toquen avui" && (await txt('#tRep details[data-a="socials"] .dm-pit')) === "Més: Temps i clima", "capçalera de Socials correcta");
  await p.click('#tRep [data-dm="obre"]'); await p.waitForTimeout(100);
  const S = await files('#tRep details[data-a="socials"]'), M = await files('#tRep details[data-a="divisibilitat"]');
  ok(S.map(x => x[0]).join("|") === "Temps i clima|Sense tema errors de jocs com «Troba l'error»|L'atmosfera: capes i funcions", "temes de Socials amb el títol de preguntes.json");
  const pq = await p.$$eval('#tRep details[data-a="socials"] tbody tr:first-child li', ls => ls.map(l => l.querySelector("b").textContent + " " + l.querySelector(".nv-q").textContent));
  ok(S[0].slice(1, 4).join(",") === "5,3,2" && pq.join(" | ") === "×3 «Demà nevarà al Pirineu». És… | ×2 Una altra pregunta del tema", "Temps i clima: 5 errors, 3 nens, 2 toquen avui, i preguntes en ordre");
  ok(M[0][0] === "Mínim comú múltiple (MCM)" && M[1][0] === "xyz no és a preguntes.json" && M[1][4] === "—", "un tema que no és a preguntes.json surt amb l'id i ho diu");
  ok((await p.$$eval("#tRep thead", ts => ts.every(t => getComputedStyle(t).display !== "none"))) && (await p.$$eval("#tRep .fr-l", ls => ls.every(l => getComputedStyle(l).display === "none"))), "a l'ordinador, taula amb capçalera");
  ok(!(await p.$("#tRep .fr-nota")), "sense filtre de nen, cap nota");
  const r0 = n("bn_admin_rep_pendents");
  await p.selectOption("#fAssig", "socials"); r = await crida("bn_admin_rep_pendents", r0 + 1);
  await p.waitForSelector("#tRep:not([aria-busy]) > *", { timeout: 10000 });
  ok(r && r.cos.p_assig === "socials" && (await p.$$eval("#tRep details.dm-as", ds => ds.map(d => d.dataset.a + ":" + d.open))).join(",") === "socials:true", "filtre Socials a Errors pendents: p_assig 'socials' i món obert");
  const r1 = n("bn_admin_rep_pendents");
  await p.selectOption("#fNen", "Pau");
  await p.waitForSelector("#tRep:not([aria-busy]) > *", { timeout: 10000 });
  ok(n("bn_admin_rep_pendents") === r1 && (await txt("#tRep .fr-nota")).includes("el filtre de nen no s'hi aplica"), "els errors pendents no es tornen a demanar amb filtre de nen i ho avisen");
  // obrir la fitxa d'un nen des de Rànquing → Reptes
  await vesCombos();
  await p.click('#tComN [data-obre-nen="pau"]'); await p.waitForSelector(".perfil h2");
  ok((await txt(".perfil h2")) === "Pau", "el nom obre la fitxa del nen");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("3) el SQL encara no hi és (404) o falla: avís només a la targeta afectada");
 { const { p, ctx, errors, txt, errG, vesCombos, vesPendents } = await obre("/admin/", { cred: CRED, fd: 404, rp: 404 });
  await p.waitForSelector("#iniciKpis .kpi");
  ok((await p.$$("#iniciKpis .kpi")).length === 6 && !!(await p.$('#fontsDiaCos [data-copia="supabase/bn_admin_fonts_rep.sql"]')), "Inici mostra els 6 KPIs i l'avís només a #fontsDiaCos");
  await vesCombos();
  ok(!!(await p.$('#tCom [data-copia="supabase/bn_admin_fonts_rep.sql"]')) && (await txt("#tCom .avis")).includes("combos i repàs") && !!(await p.$("#tMot")), "avís a #tCom i la resta de Reptes es veu");
  await vesPendents();
  ok(!!(await p.$('#tRep [data-copia="supabase/bn_admin_fonts_rep.sql"]')) && (await txt("#tRep .avis")).includes("errors pendents"), "avís a #tRep");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }
 { const { p, ctx, errors, txt, errG, vesCombos, vesPendents } = await obre("/admin/", { cred: CRED, fd: 500 });
  await vesCombos();
  ok((await txt("#tCom .avis.err")).includes("(500)") && !(await p.$("#tCom [data-copia]")), "un error 500 de bn_admin_fonts_dia mostra avís d'error sense SQL");
  await vesPendents();
  ok(!!(await p.$("#tRep details.dm-as")), "i els errors pendents continuen funcionant");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("4) escapament: el que ve del servidor no s'executa");
 { const { p, ctx, errors, txt, errG, vesCombos, vesPendents } = await obre("/admin/", { cred: CRED, xss: true });
  await vesCombos(); await p.click("#tCom details.fr-altres summary"); await p.waitForTimeout(150);
  const tc = await txt("#tCom");
  ok(tc.includes(XSS) && (await p.$$("#tCom img, #tCom [onerror]")).length === 0, "Combos escapa XSS sense cap <img> ni onerror");
  ok(await p.evaluate(x => [...document.querySelectorAll("#tCom [data-obre-nen]")].some(e => e.dataset.obreNen === x.toLowerCase()), XSS), "atribut data-obre-nen escapat");
  ok(await p.evaluate(x => [...document.querySelectorAll("#tCom .fest[data-font]")].some(e => e.dataset.font === x), XSS), "atribut data-font escapat");
  ok(!tc.includes("NaN") && !tc.includes("undefined"), "cap NaN ni undefined a Combos");
  await vesPendents(); await p.click('#tRep [data-dm="obre"]'); await p.waitForTimeout(150);
  const tr = await txt("#tRep");
  ok(tr.includes(XSS) && (await p.$$("#tRep img, #tRep [onerror]")).length === 0 && !tr.includes("NaN") && !tr.includes("undefined"), "Errors pendents escapa XSS sense NaN ni undefined");
  ok((await p.evaluate(() => window.__xss)) === undefined, "window.__xss no s'ha posat");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("5) respostes buides");
 { const { p, ctx, errors, txt, errG, vesCombos, vesPendents } = await obre("/admin/", { cred: CRED, buit: true });
  await vesCombos();
  ok((await txt("#tCom .buit")).startsWith("Cap estrella de combo ni de repàs en aquest període.") && !(await p.$("#gCom")), "sense estrelles: missatge buit i cap gràfic");
  await vesPendents();
  ok((await txt("#tRep .buit")).startsWith("Cap error pendent de repàs."), "sense errors pendents: missatge buit");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("6) mòbil (360, 390 i 430 px), tema clar i fosc");
 for (const wPx of [360, 390, 430]) {
  const fosc = wPx === 390;
  const { p, ctx, errors, vesCombos, vesPendents, graf } = await obre(fosc ? "/admin/?demo" : "/admin/", { cred: fosc ? null : CRED, fosc, viewport: { width: wPx, height: 844 } });
  await vesCombos(); await p.click("#tCom details.fr-altres summary"); await p.waitForTimeout(150);
  if (fosc) ok((await p.evaluate(() => document.documentElement.dataset.tema)) === "fosc" && (await graf("gCom")).ds[0].color === "#fb923c", "390 px: tema fosc i colors de gràfic foscos");
  const w1 = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(w1 <= wPx, `${wPx} px · Reptes: res no surt per la dreta (ample ${w1})`);
  await vesPendents(); await p.click('#tRep [data-dm="obre"]'); await p.waitForTimeout(150);
  const w2 = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  const fora = await p.$$eval("#tRep .kpi, #tRep .dm-as, #tRep tbody tr, #tRep tbody td, #tRep .llegenda", es => es.filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1 }).length);
  ok(w2 <= wPx && fora === 0, `${wPx} px · Errors pendents: res no surt per la dreta (ample ${w2})`);
  ok(await p.$$eval("#tRep thead", ts => ts.length > 0 && ts.every(t => getComputedStyle(t).display === "none")) && await p.$$eval("#tRep tbody tr", trs => trs.length > 0 && trs.every(t => getComputedStyle(t).display === "grid")),
   `${wPx} px · cada tema dels errors pendents és un bloc sense desplaçar-se de costat`);
  ok(errors.length === 0, `${wPx} px: cap error de JavaScript` + (errors[0] ? ": " + errors[0] : ""));
  await ctx.close();
 }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de «Combos i repàs» i «Errors pendents de la colla» passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
