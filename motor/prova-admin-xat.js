#!/usr/bin/env node
// Bona Nota · prova automàtica de la pestanya «Xat» del panell d'admin (admin/index.html) amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-xat.js
// Engega un servidor estàtic local sobre l'arrel del repo i simula Supabase amb page.route (un estat petit en memòria): no toca res de debò.
// Casos: 0) composició del text (la funció pura de l'admin, sense navegador: forat, contraccions, majúscula, desactivat, «…»)
//        1) ?demo: la pestanya es pinta sense errors, amb dades de mostra, accions desactivades i cap crida al núvol
//        2) amb credencials: totes les crides porten p_email i p_pass; text compost; «vis» («No surt a la portada» i el filtre Visibles);
//           esborrar, recuperar, silenciar (i cancel·lar, i Retorn al motiu confirma), treure el silenci, desar la configuració
//           (i un valor fora de límits), tancar el xat, desactivar una peça i peça nova
//        3) el SQL encara no hi és (404) → avís de supabase/bn_xat.sql · SQL d'abans sense «vis» · 4) mòbil (390 px): res no surt per la dreta.
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

// estat simulat del servidor (el contracte de .nucli/pla-n2528.md); els temps en mil·lisegons d'època
function estatNou() {
 const ara = Date.now(), fa = min => ara - min * 6e4;
 return {
  cfg: { est_credit: 10, max_dia: 5, espera_s: 10, actiu: true },
  resum: { parlat: 4, frases: 6, al_maxim: 1, vots: 9 },
  cat: {
   frases: [{ id: 1, cat: "repte", text: "Vaig a per ___!", slot: "P", nivell: 1, actiu: true }, { id: 3, cat: "repte", text: "___? Bufar i fer ampolles!", slot: "P", nivell: 1, actiu: true },
    { id: 6, cat: "repte", text: "Ningú m'atura a ___", slot: "P", nivell: 3, actiu: true }, { id: 13, cat: "aura", text: "___: -1000 d'aura", slot: "E", nivell: 1, actiu: false },
    { id: 23, cat: "colla", text: "Compte, ___, que vinc!", slot: "C", nivell: 1, actiu: true }],
   peces: [{ id: 1, tipus: "P", text: "el teu lloc", nivell: 1, mon: null, actiu: true }, { id: 2, tipus: "P", text: "el test", nivell: 1, mon: null, actiu: true },
    { id: 4, tipus: "P", text: "els jocs", nivell: 1, mon: null, actiu: true }, { id: 25, tipus: "P", text: "els nombres primers", nivell: null, mon: "divisibilitat", actiu: true },
    { id: 43, tipus: "E", text: "el wifi de l'institut", nivell: 1, mon: null, actiu: true }] },
  msgs: [{ id: 11, nom: "Laia", f: 1, p: 1, c: null, ts: fa(5), esborrat: false, v: 2 },
   { id: 10, nom: "Pau", f: 23, p: null, c: "<b>Jana</b>", ts: fa(9), esborrat: false, v: 1 },
   { id: 9, nom: "Àlex", f: 3, p: 2, c: null, ts: fa(15), esborrat: false, v: 4 },
   { id: 8, nom: "Nora", f: 6, p: 4, c: null, ts: fa(30), esborrat: false, v: 0 },
   { id: 7, nom: "Hugo", f: 13, p: 43, c: null, ts: fa(40), esborrat: true, v: 0 },
   { id: 5, nom: "Gina", f: 1, p: 2, c: null, ts: fa(50), esborrat: false, v: 0 },
   { id: 6, nom: "Ona", f: 1, p: 999, c: null, ts: fa(60), esborrat: false, v: 1 }],
  ocults: [5], // el servidor diu vis:false (nom amagat, prohibit o nen esborrat) encara que no estigui esborrat
  sil: [{ k: "hugo", fins: ara + 2 * 864e5, motiu: "Repeteix el mateix missatge" }] };
}
function respon(st, f, cos) {
 if (f === "bn_admin_logs") return [{ id: 1, ts: new Date().toISOString(), assig: "socials", nom: "Biel", sessio: "s1", aparell: "a1", event: "entra", detall: { punts: 0 } }];
 if (f === "bn_admin_ids" || f === "bn_aspectes") return [];
 if (!st.sql || !f.startsWith("bn_admin_xat_")) return undefined;
 if (f === "bn_admin_xat_resum") return st.resum;
 if (f === "bn_admin_xat_msgs") return st.sinVis ? st.msgs : st.msgs.map(m => Object.assign({}, m, { vis: !m.esborrat && !st.ocults.includes(m.id) }));
 if (f === "bn_admin_xat_silencis") return st.sil.filter(s => s.fins > Date.now());
 if (f === "bn_admin_xat_config") { if (cos.p_cfg) st.cfg = Object.assign({}, st.cfg, cos.p_cfg); return st.cfg }
 if (f === "bn_admin_xat_cataleg") return st.cat;
 if (f === "bn_admin_xat_esborra") { const m = st.msgs.find(x => x.id === cos.p_msg); if (m) m.esborrat = cos.p_esborrat; return m ? 1 : 0 }
 if (f === "bn_admin_xat_silencia") { st.sil = st.sil.filter(s => s.k !== cos.p_nom); if (cos.p_dies > 0) st.sil.push({ k: cos.p_nom, fins: Date.now() + cos.p_dies * 864e5, motiu: cos.p_motiu || "" }); return 1 }
 if (f === "bn_admin_xat_actiu") { const r = st.cat[cos.p_taula === "frase" ? "frases" : "peces"].find(x => x.id === cos.p_id); if (r) r.actiu = cos.p_actiu; return r ? 1 : 0 }
 if (f === "bn_admin_xat_peca_nova") { const id = 1001 + st.cat.peces.filter(x => x.id >= 1001).length; st.cat.peces.push({ id, tipus: cos.p_tipus, text: cos.p_text, nivell: cos.p_nivell, mon: cos.p_mon, actiu: true }); return id }
 return undefined;
}

(async () => {
 // ---- 0) la composició del text, tal qual és a l'admin (bloc // [xat-pures]) ----
 console.log("0) composició del text (funció pura de l'admin)");
 { const src = fs.readFileSync(path.join(ARREL, "admin", "index.html"), "utf8"), m = src.match(/\/\/ \[xat-pures\][^\n]*\n([\s\S]*?)\/\/ \[\/xat-pures\]/);
  ok(!!m, "l'admin té el bloc // [xat-pures]");
  // el codi avaluat és el del mateix repo (admin/index.html), com a prova-admin-fonts.js: no hi entra res de fora
  const xatCompon = new Function((m ? m[1] : "") + ";return xatCompon")();
  const FR = { 1: { text: "Vaig a per ___!", actiu: true }, 2: { text: "Revenja a ___?", actiu: true }, 3: { text: "___? Bufar i fer ampolles!", actiu: true }, 4: { text: "Que algú m'expliqui ___", actiu: true },
   5: { text: "Pista: repassa ___", actiu: true }, 6: { text: "Ningú m'atura de ___", actiu: false }, 7: { text: "Compte, ___, que vinc!", actiu: true }, 8: { text: "___, et toca moure fitxa!", actiu: true }, 9: { text: "Respecte per a ___", actiu: true } };
  const PC = { 1: { text: "el teu lloc", tipus: "P", actiu: true }, 4: { text: "els jocs", tipus: "P", actiu: true }, 3: { text: "l'examen sorpresa", tipus: "P", actiu: true }, 9: { text: "el podi", tipus: "P", actiu: false },
   43: { text: "el wifi de l'institut", tipus: "E", actiu: true }, 50: { text: "els nombres primers", tipus: "P", actiu: true }, 60: { text: "<script>", tipus: "P", actiu: true } };
  const t = (f, p, c) => xatCompon({ f, p, c }, FR, PC);
  ok(t(1, 1).text === "Vaig a pel teu lloc!", "per + el → pel: «" + t(1, 1).text + "»");
  ok(t(1, 50).text === "Vaig a pels nombres primers!", "per + els → pels");
  ok(t(2, 4).text === "Revenja als jocs?", "a + els → als");
  ok(t(2, 1).text === "Revenja al teu lloc?", "a + el → al");
  ok(t(6, 1).text === "Ningú m'atura del teu lloc" && t(6, 50).text === "Ningú m'atura dels nombres primers", "de + el → del · de + els → dels");
  ok(t(1, 3).text === "Vaig a per l'examen sorpresa!", "sense contracció amb «l'»");
  ok(t(5, 1).text === "Pista: repassa el teu lloc", "sense contracció si davant no hi ha a, de ni per");
  ok(t(3, 1).text === "El teu lloc? Bufar i fer ampolles!" && t(8, null, "pau").text === "Pau, et toca moure fitxa!", "majúscula si la frase comença pel forat (peça i company)");
  ok(t(7, null, "Jana").text === "Compte, Jana, que vinc!" && t(7, null, "Jana").html.includes('<b class="xt C">Jana</b>'), "company al forat, marcat com a company");
  ok(t(9, null, "els").text === "Respecte per a els", "un nom de company no es contrau mai");
  ok(t(1, 999).text === "Vaig a per …!" && t(1, 999).marques.includes("peca_falta"), "una peça que no existeix surt com «…»");
  ok(t(2, 9).text === "Revenja al podi?" && t(2, 9).marques.includes("peca_off") && t(2, 9).html.includes("xt P off"), "peça desactivada: es veu, marcada");
  ok(t(6, 1).marques.includes("frase_off"), "frase desactivada: marcada");
  ok(t(77, 1).text === "…" && t(77, 1).marques.includes("frase_falta"), "una frase que no existeix surt com «…»");
  ok(t(1, 60).html === "Vaig a per <b class=\"xt P\">&lt;script&gt;</b>!" && !t(7, null, "<img src=x>").html.includes("<img"), "el text de les peces i els noms s'escapen") }

 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();
 // obre l'admin amb (o sense) credencials, amb l'estat simulat del servidor; torna les crides fetes a Supabase
 async function obre(url, opcions) {
  const o = opcions || {}, st = Object.assign(estatNou(), { sql: o.sql !== false, sinVis: !!o.sinVis });
  const ctx = await nav.newContext({ viewport: o.viewport || { width: 1280, height: 900 } }), p = await ctx.newPage(), crides = [];
  await p.route("**/rest/v1/rpc/**", r => { const f = r.request().url().split("/rpc/")[1].split("?")[0], cos = r.request().postDataJSON() || {}; crides.push({ f, cos });
   const resp = respon(st, f, cos); if (resp === undefined) return r.fulfill({ status: 404, contentType: "application/json", body: '{"message":"no existeix"}' });
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp) }) });
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  await p.route("https://cdn.jsdelivr.net/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  if (o.cred) await p.addInitScript(c => sessionStorage.setItem("bn_admin", JSON.stringify(c)), o.cred);
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url); await p.waitForSelector("#shell:not([hidden])");
  if (await p.isVisible("#obreMenu")) await p.click("#obreMenu"); // al mòbil, el menú és plegat
  await p.click('#nav [data-v="xat"]');
  // espera que hi hagi una crida a f (n vegades) i torna l'última
  const crida = async (f, n) => { for (let i = 0; i < 60; i++) { const c = crides.filter(x => x.f === f); if (c.length >= (n || 1)) { await p.waitForTimeout(120); return c[c.length - 1] } await p.waitForTimeout(50) } return null };
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null }, s);
  const errG = () => p.evaluate(() => getComputedStyle(document.getElementById("errG")).display !== "none");
  return { p, ctx, st, crides, errors, crida, txt, errG };
 }

 console.log("1) ?demo: la pestanya es pinta amb dades de mostra i sense cap crida");
 { const { p, ctx, crides, errors, txt, errG } = await obre("/admin/?demo");
  await p.waitForSelector("#xMsgs .xm");
  ok((await txt("#titol")) === "Xat de la colla", "títol «Xat de la colla»");
  ok((await p.getAttribute('#nav [data-v="xat"]', "aria-current")) === "page" && (await p.$('#nav [data-v="xat"] svg.ic path')) !== null, "entrada «Xat» al menú, marcada i amb icona");
  ok((await txt("#contingut .avis")).includes("Mode demo"), "avís de mode demo");
  ok((await p.$$("#xRes .kpi")).length === 5, "resum del dia amb 5 xifres");
  ok((await txt('#xMsgs .xm[data-xid="12"] .xm-t')) === "Vaig a pel teu lloc!", "text compost amb contracció: «Vaig a pel teu lloc!»");
  ok((await txt('#xMsgs .xm[data-xid="7"]')).includes("Peça desactivada") && (await txt('#xMsgs .xm[data-xid="1"] .xm-t')) === "Vaig a per …!", "peça desactivada marcada i peça que no existeix com «…»");
  ok((await p.$$("#xMsgs .xm.esb")).length === 2, "els missatges esborrats també surten");
  ok((await p.$('#xMsgs .xm[data-xid="13"]:not(.esb) .pill[title^="Nom amagat"]')) !== null && (await txt('#xMsgs .xm[data-xid="13"]')).includes("No surt a la portada") && !(await txt('#xMsgs .xm[data-xid="12"]')).includes("No surt a la portada"), "un missatge de mostra que no surt a la portada, marcat (i el perquè al title)");
  await p.click('#xFil [data-f="vis"]'); await p.waitForTimeout(50);
  const vd = await p.$$eval("#xMsgs .xm", xs => xs.map(x => x.dataset.xid));
  ok(vd.length > 3 && !vd.includes("13") && !vd.includes("6") && !vd.includes("5") && (await txt('#xFil [data-f="vis"]')) === "Visibles " + vd.length, "«Visibles» fa servir vis: ni els esborrats ni el que no surt a la portada (" + vd.join(",") + ")");
  await p.click('#xFil [data-f="tots"]');
  ok((await txt("#xSil")).includes("Hugo") && (await txt("#xkT")).includes("Mostra de demo"), "un silenci i el catàleg marcat com a mostra");
  const actives = await p.$$eval("#xMsgs button, #xSil button, #xcDesa, #xcAct, #xnBt, #xCat button.sw", bs => bs.filter(b => !b.disabled).length);
  ok(actives === 0, "totes les accions desactivades en demo");
  ok((await p.getAttribute("[data-xesb]", "title")) === "No disponible en demo", "«No disponible en demo» als botons");
  await p.click('#xkTab [data-t="peces"]'); await p.waitForTimeout(100);
  ok((await p.$$("#xkTaula tbody tr")).length === 10 && (await p.$$("#xkTaula tr.xoff")).length === 1, "el catàleg de mostra (peces) es pot mirar, amb la desactivada marcada");
  ok(crides.length === 0, "cap crida a Supabase en demo (" + crides.map(c => c.f).join(", ") + ")");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("2) amb credencials: crides, text compost i accions");
 { const { p, ctx, st, crides, errors, crida, txt, errG } = await obre("/admin/", { cred: CRED });
  await p.waitForSelector("#xMsgs .xm");
  const fs5 = ["bn_admin_xat_resum", "bn_admin_xat_msgs", "bn_admin_xat_silencis", "bn_admin_xat_config", "bn_admin_xat_cataleg"];
  ok(fs5.every(f => crides.some(c => c.f === f)), "en obrir la pestanya es demanen resum, missatges, silencis, configuració i catàleg");
  ok((crides.find(c => c.f === "bn_admin_xat_msgs") || { cos: {} }).cos.p_dies === 7, "els missatges es demanen per al període de dalt (p_dies 7)");
  ok((await txt("#xRes")).includes("9") && (await txt("#xRes")).includes("Obert"), "el resum mostra les xifres del servidor i l'estat");
  ok((await txt('.xm[data-xid="11"] .xm-t')) === "Vaig a pel teu lloc!", "«Vaig a per ___!» + «el teu lloc» → «Vaig a pel teu lloc!»");
  ok((await txt('.xm[data-xid="9"] .xm-t')) === "El test? Bufar i fer ampolles!", "majúscula si la frase comença pel forat");
  ok((await txt('.xm[data-xid="8"] .xm-t')) === "Ningú m'atura als jocs", "a + els → als");
  ok((await txt('.xm[data-xid="10"] .xm-t')) === "Compte, <b>Jana</b>, que vinc!" && (await p.$('.xm[data-xid="10"] .xm-t b b')) === null, "el nom del company s'escapa (cap HTML del servidor)");
  ok((await txt('.xm[data-xid="6"] .xm-t')) === "Vaig a per …!" && (await txt('.xm[data-xid="6"]')).includes("La peça ja no existeix"), "peça que no existeix → «…»");
  ok((await txt('.xm[data-xid="7"]')).includes("Esborrat") && (await txt('.xm[data-xid="7"]')).includes("Frase desactivada") && (await txt('.xm[data-xid="7"] .xm-t')) === "El wifi de l'institut: -1000 d'aura", "missatge esborrat amb frase desactivada: es veu, marcat");
  ok((await txt('.xm[data-xid="7"]')).includes("Silenciat fins"), "l'autor silenciat surt marcat");
  ok((await txt('.xm[data-xid="11"] .xm-v')).endsWith("2"), "vots «Ben dit» de cada missatge");
  ok((await p.$('.xm[data-xid="5"]:not(.esb) .pill[title^="Nom amagat"]')) !== null && !(await txt('.xm[data-xid="7"]')).includes("No surt a la portada") && !(await txt('.xm[data-xid="11"]')).includes("No surt a la portada"), "vis false sense esborrar → «No surt a la portada» (ni als esborrats ni als que surten)");
  await p.click('#xFil [data-f="vis"]'); await p.waitForTimeout(50);
  ok(JSON.stringify(await p.$$eval("#xMsgs .xm", xs => xs.map(x => x.dataset.xid))) === '["11","10","9","8","6"]' && (await txt('#xFil [data-f="vis"]')) === "Visibles 5", "«Visibles» fa servir el vis del servidor");
  await p.click('#xFil [data-f="tots"]');

  // esborrar (amb confirmació) i recuperar
  await p.click('[data-xesb="11"]'); await p.waitForSelector("#dlg[open]");
  ok((await txt("#dlg")).includes("Vaig a pel teu lloc!"), "el diàleg d'esborrar diu quin missatge");
  await p.click("#dlgOk"); let c = await crida("bn_admin_xat_esborra");
  ok(c && c.cos.p_msg === 11 && c.cos.p_esborrat === true, "esborrar → bn_admin_xat_esborra {p_msg:11, p_esborrat:true}");
  ok(await p.$('.xm[data-xid="11"].esb [data-xrec="11"]') !== null, "el missatge queda esborrat i es pot recuperar");
  await p.click('[data-xrec="7"]'); c = await crida("bn_admin_xat_esborra", 2);
  ok(c && c.cos.p_msg === 7 && c.cos.p_esborrat === false, "recuperar → bn_admin_xat_esborra {p_msg:7, p_esborrat:false}");
  ok(await p.$('.xm[data-xid="7"]:not(.esb) [data-xesb="7"]') !== null, "el missatge torna a ser visible");
  await p.waitForTimeout(150);
  ok((await txt('#xFil [data-f="vis"]')) === "Visibles 5" && (await txt('#xFil [data-f="esb"]')) === "Esborrats 1" && !(await txt('.xm[data-xid="7"]')).includes("No surt a la portada"), "comptadors: l'esborrat ja no surt i el recuperat sí");

  // silenciar des de la targeta (amb el nom del registre a la llista) i des d'un missatge; cancel·lar no fa res
  ok((await p.$$eval("#xsNom option", os => os.map(o => o.textContent))).includes("Biel"), "per silenciar es pot triar també un nom del registre");
  await p.selectOption("#xsNom", "pau"); await p.click("#xsBt"); await p.waitForSelector("#dlg[open]");
  await p.selectOption("#xsDies", "3"); await p.fill("#xsMotiu", "Prova de silenci"); await p.click("#dlgOk");
  c = await crida("bn_admin_xat_silencia");
  ok(c && c.cos.p_nom === "pau" && c.cos.p_dies === 3 && c.cos.p_motiu === "Prova de silenci", "silenciar → bn_admin_xat_silencia {p_nom:'pau', p_dies:3, p_motiu}");
  await p.waitForTimeout(150);
  ok((await p.$('#xSil [data-xtreu="pau"]')) !== null && (await txt("#xSil .xs-l")).includes("Prova de silenci"), "en Pau surt a la llista de silenciats, amb el motiu");
  await p.click('[data-xsil="laia"]'); await p.waitForSelector("#dlg[open]"); await p.click("#dlgNo"); await p.waitForTimeout(200);
  ok(crides.filter(x => x.f === "bn_admin_xat_silencia").length === 1, "cancel·lar el diàleg no silencia ningú");
  await p.click('[data-xsil="nora"]'); await p.waitForSelector("#dlg[open]"); await p.selectOption("#xsDies", "7"); await p.click("#dlgOk");
  c = await crida("bn_admin_xat_silencia", 2);
  ok(c && c.cos.p_nom === "nora" && c.cos.p_dies === 7 && c.cos.p_motiu === "", "silenciar des d'un missatge, 7 dies");
  await p.click('[data-xtreu="hugo"]'); c = await crida("bn_admin_xat_silencia", 3);
  ok(c && c.cos.p_nom === "hugo" && c.cos.p_dies === 0, "treure el silenci → p_dies 0");
  await p.waitForTimeout(150);
  ok((await p.$('#xSil [data-xtreu="hugo"]')) === null && !(await txt("#xSil .xs-l")).includes("Hugo"), "en Hugo ja no surt a la llista");
  // Retorn al camp «Motiu»: el primer botó del formulari és «Cancel·la», i abans tancava el diàleg sense silenciar ni avisar
  await p.click('[data-xsil="laia"]'); await p.waitForSelector("#dlg[open]"); await p.fill("#xsMotiu", "Amb Retorn"); await p.press("#xsMotiu", "Enter");
  c = await crida("bn_admin_xat_silencia", 4);
  ok(c && c.cos.p_nom === "laia" && c.cos.p_dies === 1 && c.cos.p_motiu === "Amb Retorn" && (await p.$("#dlg[open]")) === null, "Retorn al camp «Motiu» confirma el silenci (no el cancel·la)");

  // configuració: un valor fora de límits no s'envia; després es desa; tancar el xat demana confirmació
  await p.fill("#xcMax", "50"); await p.click("#xcDesa"); await p.waitForTimeout(200);
  ok(!crides.some(x => x.f === "bn_admin_xat_config" && x.cos.p_cfg) && (await txt("#xcErr")).includes("1 a 20"), "un màxim de 50 no s'envia i surt l'avís");
  await p.fill("#xcMax", "5"); await p.fill("#xcEst", "12"); await p.click("#xcDesa");
  for (let i = 0; i < 40 && !crides.some(x => x.f === "bn_admin_xat_config" && x.cos.p_cfg); i++) await p.waitForTimeout(50);
  c = crides.filter(x => x.f === "bn_admin_xat_config" && x.cos.p_cfg).pop();
  ok(c && JSON.stringify(c.cos.p_cfg) === JSON.stringify({ est_credit: 12, max_dia: 5, espera_s: 10, actiu: true }), "desar → bn_admin_xat_config amb p_cfg " + (c ? JSON.stringify(c.cos.p_cfg) : "—"));
  await p.waitForTimeout(150);
  await p.click("#xcAct"); await p.click("#xcDesa"); await p.waitForSelector("#dlg[open]");
  ok((await txt("#dlgT")) === "Tancar el xat?", "tancar el xat demana confirmació");
  await p.click("#dlgOk");
  for (let i = 0; i < 40 && !crides.some(x => x.f === "bn_admin_xat_config" && x.cos.p_cfg && x.cos.p_cfg.actiu === false); i++) await p.waitForTimeout(50);
  ok(crides.some(x => x.f === "bn_admin_xat_config" && x.cos.p_cfg && x.cos.p_cfg.actiu === false && x.cos.p_cfg.est_credit === 12), "tancar → p_cfg.actiu false");
  await p.waitForTimeout(150);
  ok((await txt("#xRes")).includes("Tancat") && (await p.getAttribute("#xcAct", "aria-checked")) === "false", "el resum diu «Tancat»");

  // catàleg: desactivar una peça (el missatge vell es veu igual, marcat)
  await p.click('#xkTab [data-t="peces"]'); await p.waitForTimeout(100);
  await p.click('#xCat [data-xsw="peca"][data-id="1"]'); c = await crida("bn_admin_xat_actiu");
  ok(c && c.cos.p_taula === "peca" && c.cos.p_id === 1 && c.cos.p_actiu === false, "desactivar → bn_admin_xat_actiu {p_taula:'peca', p_id:1, p_actiu:false}");
  await p.waitForTimeout(100);
  ok((await p.getAttribute('#xCat [data-xsw="peca"][data-id="1"]', "aria-checked")) === "false" && (await txt('.xm[data-xid="11"]')).includes("Peça desactivada") && (await txt('.xm[data-xid="11"] .xm-t')) === "Vaig a pel teu lloc!", "l'interruptor queda apagat i el missatge surt marcat");
  await p.click('#xkTab [data-t="frases"]'); await p.waitForTimeout(100);
  await p.click('#xCat [data-xsw="frase"][data-id="13"]'); c = await crida("bn_admin_xat_actiu", 2);
  ok(c && c.cos.p_taula === "frase" && c.cos.p_id === 13 && c.cos.p_actiu === true, "activar una frase → p_taula 'frase', p_actiu true");

  // peça nova: per nivell (amb la previsualització) i per món
  await p.fill("#xnText", "el volcà"); await p.selectOption("#xnTipus", "P"); await p.selectOption("#xnNiv", "3");
  ok((await txt("#xnPrev")) === "Vaig a pel volcà!", "previsualització de la peça nova amb la contracció");
  await p.click("#xnBt"); c = await crida("bn_admin_xat_peca_nova");
  ok(c && c.cos.p_tipus === "P" && c.cos.p_text === "el volcà" && c.cos.p_nivell === 3 && c.cos.p_mon === null, "peça nova → bn_admin_xat_peca_nova {p_tipus:'P', p_text, p_nivell:3, p_mon:null}");
  await p.waitForTimeout(150);
  ok((await txt("#xkTaula")).includes("1001") && (await txt("#xkTaula")).includes("el volcà"), "la peça nova surt al catàleg");
  await p.click('#xnQue [data-q="m"]'); await p.fill("#xnText", "la boira"); await p.selectOption("#xnMon", "socials"); await p.click("#xnBt");
  c = await crida("bn_admin_xat_peca_nova", 2);
  ok(c && c.cos.p_nivell === null && c.cos.p_mon === "socials" && c.cos.p_text === "la boira", "peça nova per món → p_mon 'socials', p_nivell null");

  const xat = crides.filter(x => x.f.startsWith("bn_admin_xat_"));
  ok(xat.length > 10 && xat.every(x => x.cos.p_email === CRED.e && x.cos.p_pass === CRED.p), `les ${xat.length} crides bn_admin_xat_* porten p_email i p_pass`);
  ok((await p.$$(".toast.err-t")).length === 0, "cap avís d'error");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("3) el SQL encara no hi és (404), o és d'abans (sense «vis»)");
 { const { p, ctx, errors, txt, errG } = await obre("/admin/", { cred: CRED, sql: false });
  await p.waitForSelector("#contingut .avis");
  const t = await txt("#contingut .avis");
  ok(t.includes("Cal executar supabase/bn_xat.sql") && (await p.$('#contingut [data-copia="supabase/bn_xat.sql"]')) !== null, "avís clar: «Cal executar supabase/bn_xat.sql»");
  ok((await p.$("#xMsgs")) === null, "no es pinta res més");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }
 { const { p, ctx, errors, txt } = await obre("/admin/", { cred: CRED, sinVis: true });
  await p.waitForSelector("#xMsgs .xm");
  ok((await txt('#xFil [data-f="vis"]')) === "Visibles 6" && !(await txt("#xMsgs")).includes("No surt a la portada"), "SQL d'abans (sense «vis»): visibles = no esborrats, com abans, i cap «No surt a la portada»");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("4) mòbil (390 px), tema fosc");
 { const { p, ctx, errors, txt } = await obre("/admin/?demo", { viewport: { width: 390, height: 844 } });
  await p.waitForSelector("#xMsgs .xm"); await p.evaluate(() => document.getElementById("tema").click()); await p.waitForSelector("#xMsgs .xm");
  ok((await p.evaluate(() => document.documentElement.dataset.tema)) === "fosc", "tema fosc");
  const ample = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(ample <= 390, "res no surt per la dreta (ample " + ample + ")");
  const fora = await p.$$eval("#xMsgs .xm-a button, #xcDesa, #xnBt, #xsBt", bs => bs.filter(b => { const r = b.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1 }).length);
  ok(fora === 0, "els botons es veuen sencers");
  ok((await txt("#titol")) === "Xat de la colla", "la pestanya es veu al mòbil");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de la pestanya Xat de l'admin passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
