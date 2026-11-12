#!/usr/bin/env node
// Bona Nota · prova automàtica del xat al panell d'admin (Rànquing → Xat i Configuració → Horaris / Catàleg)
// amb Playwright (Chromium).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-xat.js
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
  ocults: [5],
  amagats: ["ona"],
  rk: [
   { nom: "Pau", punts: 180, temps_s: 3600, punts_max: 140, setmana: 45, mons: { socials: 140, divisibilitat: 40 }, dies: 8 },
   { nom: "Jana", punts: 120, temps_s: 2900, punts_max: 95, setmana: 0, mons: { socials: 25, comarques: 95 }, dies: 6 },
   { nom: "Àlex", punts: 90, temps_s: 2100, punts_max: 90, setmana: 30, mons: { divisibilitat: 90 }, dies: 5 },
   { nom: "Ona", punts: 60, temps_s: 1500, punts_max: 60, setmana: 10, mons: { angles: 60 }, dies: 3 }
  ],
  sil: [{ k: "hugo", fins: ara + 2 * 864e5, motiu: "Repeteix el mateix missatge" }] };
}
function respon(st, f, cos) {
 if (f === "bn_admin_logs") return [{ id: 1, ts: new Date().toISOString(), assig: "socials", nom: "Biel", sessio: "s1", aparell: "a1", event: "entra", detall: { punts: 0 } }];
 if (f === "bn_admin_ids") return [{ k: "biel", nom: "Biel", id: 1 }, { k: "pau", nom: "Pau", id: 2 }, { k: "jana", nom: "Jana", id: 3 }, { k: "àlex", nom: "Àlex", id: 4 }, { k: "ona", nom: "Ona", id: 5 }];
 if (f === "bn_aspectes" || f === "bn_admin_alertes") return [];
 if (f === "bn_ranking_mons") return st.rk.filter(r => !st.amagats.includes(r.nom.toLowerCase()));
 if (f === "bn_admin_altes") return st.rk.map((r, i) => ({ k: r.nom.toLowerCase(), nom: r.nom, id: i + 2, punts: r.punts, mons: Object.keys(r.mons).length, dies7: r.dies, amagat: st.amagats.includes(r.nom.toLowerCase()), te_pin: true }));
 if (f === "bn_admin_usuari") {
  const k = String(cos.p_nom || "").trim().toLowerCase();
  if (cos.p_accio === "amaga") { if (!st.amagats.includes(k)) st.amagats.push(k); return 1 }
  if (cos.p_accio === "mostra") { st.amagats = st.amagats.filter(x => x !== k); return 1 }
  if (cos.p_accio === "estat") return (st.amagats.includes(k) ? 1 : 0) | 6;
  return 1;
 }
 if (f === "bn_admin_resum") return { periode: cos.p_periode || "7d", ara: { nens: 1, minuts: 10, tests: 1, nota: 80, encert: 80 }, abans: null };
 if (f === "bn_admin_fonts_dia") return { periode: cos.p_periode || "7d", dies: [], total: { temes: 52, combo: 14 } };
 if (f === "bn_admin_control") {
  if (cos.p_cfg && typeof cos.p_cfg.xat_actiu === "boolean") st.cfg.actiu = cos.p_cfg.xat_actiu;
  return { xat_actiu: st.cfg.actiu, xat_obert_ara: st.cfg.actiu, horari: { actiu: true, tanca_min: 1290, obre_min: 420 }, mons_tancats: [] };
 }
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
  const vesXat = async () => {
   if (await p.isVisible("#navInf")) await p.click('#navInf [data-v="ranquing"]');
   else await p.click('#nav [data-v="ranquing"]');
   await p.waitForSelector('[data-vtab="xat"]');
   await p.click('[data-vtab="xat"]');
  };
  if (o.obreXat !== false) await vesXat();
  const crida = async (f, n) => { for (let i = 0; i < 60; i++) { const c = crides.filter(x => x.f === f); if (c.length >= (n || 1)) { await p.waitForTimeout(120); return c[c.length - 1] } await p.waitForTimeout(50) } return null };
  const txt = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null }, s);
  const errG = () => p.evaluate(() => getComputedStyle(document.getElementById("errG")).display !== "none");
  return { p, ctx, st, crides, errors, crida, txt, errG, vesXat };
 }

 console.log("1) ?demo: Rànquing → Xat i Configuració → Catàleg amb dades de mostra i sense cap crida");
 { const { p, ctx, crides, errors, txt, errG } = await obre("/admin/?demo");
  await p.waitForSelector("#xMsgs .xm");
  ok((await txt("#titol")) === "Rànquing", "títol «Rànquing» amb la sub-pestanya Xat");
  ok((await p.getAttribute('#nav [data-v="ranquing"]', "aria-current")) === "page" && (await p.getAttribute('[data-vtab="xat"]', "aria-selected")) === "true", "entrada «Rànquing» marcada i sub-pestanya «Xat» seleccionada");
  ok((await txt("#contingut .avis")).includes("Mode demo"), "avís de mode demo");
  ok((await p.$$("#xRes .kpi")).length === 4, "resum del dia amb 4 KPIs compactes");
  ok((await p.$$("#tXMsgs thead th")).length === 5, "taula de missatges del xat compactada a 5 columnes (Hora, Nen, Text, Estat, Silenciar)");
  ok((await txt('#xMsgs .xm[data-xid="12"] .xm-t')) === "Vaig a pel teu lloc!", "text compost amb contracció: «Vaig a pel teu lloc!»");
  ok((await txt('#xMsgs .xm[data-xid="7"]')).includes("Peça desactivada") && (await txt('#xMsgs .xm[data-xid="1"] .xm-t')) === "Vaig a per …!", "peça desactivada marcada i peça que no existeix com «…»");
  ok((await p.$$("#xMsgs .xm.esb")).length === 2, "els missatges esborrats també surten");
  ok((await p.$('#xMsgs .xm[data-xid="13"]:not(.esb) .pill[title^="Nom amagat"]')) !== null && (await txt('#xMsgs .xm[data-xid="13"]')).includes("No surt a la portada") && !(await txt('#xMsgs .xm[data-xid="12"]')).includes("No surt a la portada"), "un missatge de mostra que no surt a la portada, marcat");
  await p.click('#xFil [data-f="vis"]'); await p.waitForTimeout(50);
  const vd = await p.$$eval("#xMsgs .xm", xs => xs.map(x => x.dataset.xid));
  ok(vd.length > 3 && !vd.includes("13") && !vd.includes("6") && !vd.includes("5") && (await txt('#xFil [data-f="vis"]')) === "Visibles " + vd.length, "«Visibles» fa servir vis (" + vd.join(",") + ")");
  await p.click('#xFil [data-f="tots"]');
  ok((await txt("#xSil")).includes("Hugo"), "un silenci actiu en demo");
  const activesMod = await p.$$eval("#xatModSw, #xMsgs .xm-a button, #xSil button", bs => bs.filter(b => !b.disabled).length);
  ok(activesMod === 0, "totes les accions de moderació desactivades en demo");
  ok((await p.getAttribute("[data-xesb]", "title")) === "No disponible en demo", "«No disponible en demo» als botons");
  // Rànquing → Classificació en demo: 4 KPIs, selector Total/Per món/Setmana, 5 columnes i bloc d'amagats (Ona)
  await p.click('[data-vtab="classificacio"]');
  await p.waitForSelector("#tRk tbody tr");
  ok((await p.$$("#rkKpis .kpi")).length === 4 && (await p.$$("#rkKpis .kpi-s")).length === 0 && (await p.$$("#tRk thead th")).length === 5,
   "Rànquing → Classificació té 4 KPIs sense subtítol i taula de 5 columnes");
  ok((await txt("#rkAmagats")).includes("Ona") && !(await txt("#tRk")).includes("Ona"),
   "el bloc inferior d'amagats mostra l'Ona i la classificació pública l'exclou");
  await p.click('[data-vtab="xat"]'); await p.waitForSelector('[data-go-cfg="cataleg"]');
  // enllaç ràpid cap a Configuració → Catàleg
  await p.click('[data-go-cfg="cataleg"]');
  await p.waitForSelector("#xkTaula tbody tr");
  ok((await txt("#xkDemo")) === "Mostra de demo", "el catàleg en demo surt marcat com a mostra");
  const nColsCat = await p.$$eval("#xkTaula thead th", ths => ths.length);
  ok(nColsCat === 5, `taula del catàleg compactada a 5 columnes (obtingut: ${nColsCat})`);
  await p.click('#xkTab [data-t="peces"]'); await p.waitForTimeout(100);
  ok((await p.$$("#xkTaula tbody tr")).length === 10 && (await p.$$("#xkTaula tr.xoff")).length === 1, "el catàleg de mostra (peces) es pot mirar, amb la desactivada marcada");
  await p.click("#btNovaPeca"); await p.waitForSelector("#panell:not([hidden]) #xnBt");
  const activesCat = await p.$$eval("#xCat button.sw, #xnBt", bs => bs.filter(b => !b.disabled).length);
  ok(activesCat === 0, "interruptors del catàleg i #xnBt al drawer desactivats en demo");
  await p.click("#panellTanca");
  await p.click('[data-vtab="horaris"]'); await p.waitForSelector("#xcDesa");
  const activesHor = await p.$$eval("#xcDesa, #xcAct, #xcHorari", bs => bs.filter(b => !b.disabled).length);
  ok(activesHor === 0, "accions d'horaris i crèdits desactivades en demo");
  ok(crides.length === 0, "cap crida a Supabase en demo (" + crides.map(c => c.f).join(", ") + ")");
  ok(errors.length === 0 && !(await errG()), "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("2) amb credencials: moderació (Rànquing → Xat) + Horaris i Catàleg (Configuració)");
 { const { p, ctx, st, crides, errors, crida, txt, errG, vesXat } = await obre("/admin/", { cred: CRED });
  await p.waitForSelector("#xMsgs .xm");
  const fs5 = ["bn_admin_xat_resum", "bn_admin_xat_msgs", "bn_admin_xat_silencis", "bn_admin_xat_config", "bn_admin_xat_cataleg"];
  ok(fs5.every(f => crides.some(c => c.f === f)), "en obrir Rànquing → Xat es demanen resum, missatges, silencis, configuració i catàleg");
  ok((crides.find(c => c.f === "bn_admin_xat_msgs") || { cos: {} }).cos.p_dies === 7, "els missatges es demanen per al període de dalt (p_dies 7)");
  ok((await txt("#xRes")).includes("9") && (await txt("#xRes")).includes("Xat obert"), "el resum mostra les xifres del servidor i l'estat");
  ok((await txt('.xm[data-xid="11"] .xm-t')) === "Vaig a pel teu lloc!", "«Vaig a per ___!» + «el teu lloc» → «Vaig a pel teu lloc!»");
  ok((await txt('.xm[data-xid="9"] .xm-t')) === "El test? Bufar i fer ampolles!", "majúscula si la frase comença pel forat");
  ok((await txt('.xm[data-xid="8"] .xm-t')) === "Ningú m'atura als jocs", "a + els → als");
  ok((await txt('.xm[data-xid="10"] .xm-t')) === "Compte, <b>Jana</b>, que vinc!" && (await p.$('.xm[data-xid="10"] .xm-t b b')) === null, "el nom del company s'escapa (cap HTML del servidor)");
  ok((await txt('.xm[data-xid="6"] .xm-t')) === "Vaig a per …!" && (await txt('.xm[data-xid="6"]')).includes("La peça ja no existeix"), "peça que no existeix → «…»");
  ok((await txt('.xm[data-xid="7"]')).includes("Esborrat") && (await txt('.xm[data-xid="7"]')).includes("Frase desactivada") && (await txt('.xm[data-xid="7"] .xm-t')) === "El wifi de l'institut: -1000 d'aura", "missatge esborrat amb frase desactivada: es veu, marcat");
  ok((await txt('.xm[data-xid="7"]')).includes("Silenciat fins"), "l'autor silenciat surt marcat");
  ok((await txt('.xm[data-xid="11"] .xm-v')).endsWith("2"), "vots «Ben dit» de cada missatge");
  ok((await p.$('.xm[data-xid="5"]:not(.esb) .pill[title^="Nom amagat"]')) !== null && !(await txt('.xm[data-xid="7"]')).includes("No surt a la portada") && !(await txt('.xm[data-xid="11"]')).includes("No surt a la portada"), "vis false sense esborrar → «No surt a la portada»");
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

  // silenciar des de la targeta (amb el nom de NOMS_TOTS a la llista) i des d'un missatge; cancel·lar no fa res
  ok((await p.$$eval("#xsNom option", os => os.map(o => o.textContent))).includes("Biel"), "per silenciar es pot triar també un nom conegut de l'admin");
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
  await p.click('[data-xsil="laia"]'); await p.waitForSelector("#dlg[open]"); await p.fill("#xsMotiu", "Amb Retorn"); await p.press("#xsMotiu", "Enter");
  c = await crida("bn_admin_xat_silencia", 4);
  ok(c && c.cos.p_nom === "laia" && c.cos.p_dies === 1 && c.cos.p_motiu === "Amb Retorn" && (await p.$("#dlg[open]")) === null, "Retorn al camp «Motiu» confirma el silenci");

  // Configuració → Horaris i crèdits
  await p.click('[data-go-cfg="horaris"]');
  await p.waitForSelector("#xcF");
  ok(await p.evaluate(() => document.getElementById("periodeWrap").hidden), "a Configuració s'amaga el selector global de període");
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
  ok((await p.getAttribute("#xcAct", "aria-checked")) === "false", "l'interruptor #xcAct queda apagat");

  // Configuració → Catàleg del xat: desactivar una peça i crear-ne dues des del panell lateral (#panell)
  await p.click('[data-vtab="cataleg"]'); await p.waitForSelector("#xkTaula tbody tr");
  await p.click('#xkTab [data-t="peces"]'); await p.waitForTimeout(100);
  await p.click('#xCat [data-xsw="peca"][data-id="1"]'); c = await crida("bn_admin_xat_actiu");
  ok(c && c.cos.p_taula === "peca" && c.cos.p_id === 1 && c.cos.p_actiu === false, "desactivar → bn_admin_xat_actiu {p_taula:'peca', p_id:1, p_actiu:false}");
  await p.waitForTimeout(100);
  ok((await p.getAttribute('#xCat [data-xsw="peca"][data-id="1"]', "aria-checked")) === "false", "l'interruptor de la peça queda apagat");
  await p.click('#xkTab [data-t="frases"]'); await p.waitForTimeout(100);
  await p.click('#xCat [data-xsw="frase"][data-id="13"]'); c = await crida("bn_admin_xat_actiu", 2);
  ok(c && c.cos.p_taula === "frase" && c.cos.p_id === 13 && c.cos.p_actiu === true, "activar una frase → p_taula 'frase', p_actiu true");

  // peça nova al drawer lateral (#panell): per nivell (amb previsualització) i per món
  await p.click("#btNovaPeca"); await p.waitForSelector("#panell:not([hidden]) #xnText");
  await p.fill("#xnText", "el volcà"); await p.selectOption("#xnTipus", "P"); await p.selectOption("#xnNiv", "3");
  ok((await txt("#xnPrev")) === "Vaig a pel volcà!", "previsualització de la peça nova amb la contracció dins del panell lateral");
  await p.click("#xnBt"); c = await crida("bn_admin_xat_peca_nova");
  ok(c && c.cos.p_tipus === "P" && c.cos.p_text === "el volcà" && c.cos.p_nivell === 3 && c.cos.p_mon === null, "peça nova → bn_admin_xat_peca_nova {p_tipus:'P', p_text, p_nivell:3, p_mon:null}");
  await p.waitForTimeout(150);
  ok((await p.evaluate(() => document.getElementById("panell").hidden)) && (await txt("#xkTaula")).includes("1001") && (await txt("#xkTaula")).includes("el volcà"), "el panell lateral es tanca i la peça nova surt al catàleg");
  await p.click("#btNovaPeca"); await p.waitForSelector("#panell:not([hidden]) #xnText");
  await p.click('#xnQue [data-q="m"]'); await p.fill("#xnText", "la boira"); await p.selectOption("#xnMon", "socials"); await p.click("#xnBt");
  c = await crida("bn_admin_xat_peca_nova", 2);
  ok(c && c.cos.p_nivell === null && c.cos.p_mon === "socials" && c.cos.p_text === "la boira", "peça nova per món → p_mon 'socials', p_nivell null");

  // tornem a Rànquing → Xat per comprovar que veu el xat tancat i la peça #1 desactivada
  await vesXat(); await p.waitForSelector("#xMsgs .xm");
  ok((await txt("#xRes")).includes("Xat tancat") && (await txt('.xm[data-xid="10"] .xm-t')).includes("Jana"), "Rànquing → Xat mostra «Xat tancat»");

  // Rànquing → Classificació amb credencials: selector Total / Per món / Setmana + amagar i tornar a mostrar en 1 clic
  await p.click('[data-vtab="classificacio"]');
  await p.waitForSelector("#tRk tbody tr");
  const rkKpisTxt = await txt("#rkKpis");
  ok(rkKpisTxt.includes("3") && rkKpisTxt.includes("1") && rkKpisTxt.includes("66") && rkKpisTxt.includes("6"),
   "els 4 KPIs de Classificació mostren visibles (3), amagats (1), estrelles del període (66) i missatges avui (6)");
  await p.click('#rkVista [data-rkv="mon"]');
  await p.selectOption("#rkMon", "divisibilitat");
  const filesDiv = await p.$$eval("#tRk tbody tr", trs => trs.map(tr => tr.cells[1].textContent.trim()));
  ok(filesDiv[0].includes("Àlex") && filesDiv[1].includes("Pau") && filesDiv.length === 2,
   `selector «Per món» (Divisibilitat) ordena Àlex (90) davant d'en Pau (40): ${filesDiv.join(", ")}`);
  await p.click('#rkVista [data-rkv="setmana"]');
  const filesSetm = await p.$$eval("#tRk tbody tr", trs => trs.map(tr => tr.cells[1].textContent.trim()));
  ok(filesSetm.length === 2 && !filesSetm.some(x => x.includes("Jana")),
   "selector «Setmana» mostra només qui ha sumat estrelles en 7 dies (Pau +45, Àlex +30)");
  await p.click('#rkVista [data-rkv="total"]');
  await p.click('#tRk [data-rk-vis="jana"]');
  c = await crida("bn_admin_usuari");
  ok(c && c.cos.p_nom === "Jana" && c.cos.p_accio === "amaga", "desactivar Visible a #tRk envia bn_admin_usuari {p_nom:'Jana', p_accio:'amaga'}");
  await p.waitForTimeout(150);
  ok(!(await txt("#tRk")).includes("Jana") && (await txt("#rkAmagats")).includes("Jana") && (await txt("#rkAmagats")).includes("Ona"),
   "la Jana passa immediatament al bloc inferior d'amagats");
  await p.click('#rkAmagats [data-rk-mostra="ona"]');
  c = await crida("bn_admin_usuari", 2);
  ok(c && c.cos.p_nom === "Ona" && c.cos.p_accio === "mostra", "activar l'interruptor d'amagats envia bn_admin_usuari {p_nom:'Ona', p_accio:'mostra'}");
  await p.waitForTimeout(150);
  ok((await txt("#tRk")).includes("Ona") && !(await txt("#rkAmagats")).includes("Ona"),
   "l'Ona torna a sortir a la classificació pública en un sol clic");

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
  ok((await txt('#xFil [data-f="vis"]')) === "Visibles 6" && !(await txt("#xMsgs")).includes("No surt a la portada"), "SQL d'abans (sense «vis»): visibles = no esborrats");
  ok(errors.length === 0, "cap error de JavaScript" + (errors[0] ? ": " + errors[0] : "")); await ctx.close() }

 console.log("4) mòbil (360, 390 i 430 px), tema fosc");
 for (const wPx of [360, 390, 430]) {
  const { p, ctx, errors, txt } = await obre("/admin/?demo", { viewport: { width: wPx, height: 844 } });
  await p.waitForSelector("#xMsgs .xm");
  await p.evaluate(() => document.getElementById("tema").click());
  await p.waitForSelector("#xMsgs .xm");
  if (wPx === 390) ok((await p.evaluate(() => document.documentElement.dataset.tema)) === "fosc", "390 px: tema fosc");
  const ample = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  const fora = await p.$$eval("#xMsgs .xm-a button, #xsBt", bs => bs.filter(b => { const r = b.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1 }).length);
  ok(ample <= wPx && fora === 0, `${wPx} px · Rànquing → Xat: res no surt per la dreta (ample ${ample}) i botons sencers`);
  await p.click('[data-vtab="classificacio"]'); await p.waitForSelector("#tRk tbody tr");
  const ampleRk = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(ampleRk <= wPx, `${wPx} px · Rànquing → Classificació: res no surt per la dreta (ample ${ampleRk})`);
  await p.click("#btConfig"); await p.waitForSelector("#xcDesa");
  const ampleCfg = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  ok(ampleCfg <= wPx && (await txt("#titol")) === "Configuració", `${wPx} px · Configuració → Horaris: res no surt per la dreta (ample ${ampleCfg})`);
  ok(errors.length === 0, `${wPx} px: cap error de JavaScript` + (errors[0] ? ": " + errors[0] : ""));
  await ctx.close();
 }

 await nav.close(); srv.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de la pestanya Xat de l'admin passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
