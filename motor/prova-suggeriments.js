#!/usr/bin/env node
// Bona Nota · prova E2E de la guia i recuperació de PIN a la Bústia (/suggeriments/) i els enllaços d'ajuda
// des de la portada i els mons (g43, docs/superpowers/specs/2026-11-28-bustia-recuperacio-pin-pla-mestre.md).
// Ús: node motor/prova-suggeriments.js
// Comprova:
//   1) /suggeriments/?tipus=pin&nom=Rachita&mon=prehistoria: activa mode PIN perdut, mostra la guia visual de 3 passos
//      («No perds res!»), pre-omple nom i món, valida dispositiu i correu de tutor, i envia un missatge estructurat
//      [RECUPERACIÓ DE PIN] amb p_categoria='privacitat' i p_rol='familia'.
//   2) Portada (index.html): enllaç dinàmic #lkOblidatPin s'actualitza amb el nom escrit i l'error de PIN incorrecte
//      ofereix l'enllaç directe a suggeriments/?tipus=pin&nom=Rachita.
//   3) Món (bio-i-geo/univers/): la pantalla d'entrada mostra #lkOblidatMon amb ?tipus=pin&mon=biogeo.
//   4) Mòbil (360 i 390 px): /suggeriments/?tipus=pin sense desbordament horitzontal ni errors de JS.

const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ARREL = path.resolve(__dirname, "..");
const TIPUS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml" };
let fallades = 0, passades = 0;
const ok = (cond, msg) => { if (cond) { passades++; console.log("  ✓", msg) } else { fallades++; console.log("  ✗", msg) } };

function servidor() {
 return new Promise(res => {
  const s = http.createServer((req, r) => {
   let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
   const f = path.join(ARREL, p);
   if (!f.startsWith(ARREL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("no") }
   r.writeHead(200, { "Content-Type": TIPUS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r)
  });
  s.listen(0, "127.0.0.1", () => res(s));
 });
}

(async () => {
 const srv = await servidor(), BASE = `http://127.0.0.1:${srv.address().port}`;
 const nav = await chromium.launch();

 async function obre(url, respostes = {}, viewport = { width: 1280, height: 900 }) {
  const ctx = await nav.newContext({ viewport });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const crides = [];
  await p.route("**/rest/v1/rpc/**", r => {
   const f = r.request().url().split("/rpc/")[1].split("?")[0];
   const cos = r.request().postDataJSON() || {};
   crides.push({ f, cos });
   let resp = respostes[f];
   if (typeof resp === "function") resp = resp(cos);
   return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(resp === undefined ? null : resp) });
  });
  await p.route("**/rest/v1/bn_log", r => r.fulfill({ status: 201, body: "" }));
  await p.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p.route("https://fonts.gstatic.com/**", r => r.abort());
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(BASE + url);
  return { ctx, p, crides, errors };
 }

 try {
  console.log("1) Bústia (?tipus=pin&nom=Rachita&mon=prehistoria): guia de 3 passos, camps guiats i enviament estructurat");
  {
   const { ctx, p, crides, errors } = await obre("/suggeriments/?tipus=pin&nom=Rachita&mon=prehistoria", {
    bn_suggeriment_envia: { ok: true, ref: "SUG-042" }
   });
   await p.waitForSelector("#pinGuia.on");
   await p.waitForFunction(() => document.querySelector("#sMon")?.value === "prehistoria");
   ok((await p.textContent("#pinGuia")).includes("No perds res!") && (await p.$$("#pinGuia .pin-pas")).length === 3, "mostra el missatge de tranquil·litat i els 3 passos");
   ok((await p.inputValue("#sPinNom")) === "Rachita" && (await p.inputValue("#sMon")) === "prehistoria", "pre-omple el nom (Rachita) i el món (prehistoria) des de la URL");
   ok(await p.isHidden("#campRol"), "amaga el selector de rol (envia automàticament com a família)");
   // Sense triar dispositiu → error de validació
   await p.fill("#sMail", "mare.rachita@exemple.cat");
   await p.click("#btEnvia");
   ok((await p.textContent("#errBox")).includes("dispositiu habitual"), "exigeix indicar el dispositiu habitual per verificar");
   // Tria Tauleta i espera el temps mínim anti-bot (1.8 s)
   await p.click('[data-pd="Tauleta"]');
   await p.waitForTimeout(1900);
   await p.click("#btEnvia");
   await p.waitForSelector("#fetBox.on");
   const env = crides.find(c => c.f === "bn_suggeriment_envia");
   ok(env && env.cos.p_categoria === "privacitat" && env.cos.p_rol === "familia" && env.cos.p_email === "mare.rachita@exemple.cat", "envia amb categoria 'privacitat', rol 'familia' i correu del tutor");
   ok(env && env.cos.p_missatge.includes("[RECUPERACIÓ DE PIN]") && env.cos.p_missatge.includes("Nom d'usuari: Rachita") && env.cos.p_missatge.includes("Dispositiu habitual: Tauleta"), "genera el missatge estructurat amb totes les dades de verificació");
   ok((await p.textContent("#fetTxt")).includes("Rachita") && (await p.textContent("#fetTxt")).includes("PIN temporal"), "confirmació personalitzada tranquil·litzadora");
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("2) Portada: enllaç «Has oblidat el PIN?» dinàmic i dins l'error de PIN incorrecte");
  {
   const { ctx, p, errors } = await obre("/", {
    bn_estat_web: { horari: { actiu: false }, mons_tancats: [] },
    bn_ranking_mons: [],
    bn_aspectes: [],
    bn_xat_llegeix: { actiu: false, msgs: [] },
    bn_perfil_existeix: true,
    bn_progres_llegeix: { ok: false, codi: "pin" }
   });
   await p.waitForSelector("#entrada:not([hidden]) #lkOblidatPin");
   await p.fill("#enNom", "Rachita");
   const href1 = await p.getAttribute("#lkOblidatPin", "href");
   ok(href1 === "suggeriments/?tipus=pin&nom=Rachita", `l'enllaç de portada s'actualitza amb el nom (${href1})`);
   await p.fill("#enPin", "0000Z");
   await p.click('#entrada button[type="submit"]');
   await p.waitForSelector('#enAvis a[href*="tipus=pin"]');
   const hrefErr = await p.getAttribute('#enAvis a[href*="tipus=pin"]', "href");
   ok(hrefErr && hrefErr.includes("nom=Rachita"), `l'avís de PIN incorrecte inclou l'enllaç directe (${hrefErr})`);
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("3) Món: pantalla d'entrada inclou l'enllaç «Has oblidat el PIN?» amb el món");
  {
   const { ctx, p, errors } = await obre("/bio-i-geo/univers/", {
    bn_estat_web: { horari: { actiu: false }, mons_tancats: [] }
   });
   await p.waitForSelector("#lkOblidatMon");
   await p.fill("#nom", "Rachita");
   const hrefMon = await p.getAttribute("#lkOblidatMon", "href");
   ok(hrefMon === "../../suggeriments/?tipus=pin&mon=biogeo&nom=Rachita", `l'enllaç del món porta món i nom (${hrefMon})`);
   ok(errors.length === 0, "cap error de JS" + (errors.length ? ": " + errors.join(" | ") : ""));
   await ctx.close();
  }

  console.log("4) Mòbil (360 i 390 px): /suggeriments/?tipus=pin sense desbordament horitzontal");
  {
   for (const w of [360, 390]) {
    const { ctx, p, errors } = await obre("/suggeriments/?tipus=pin&demo=1", {}, { width: w, height: 800 });
    await p.waitForSelector("#pinGuia.on");
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(!overflow && errors.length === 0, `sense desbordament horitzontal ni errors a ${w} px`);
    await ctx.close();
   }
  }
 } finally {
  await nav.close();
  srv.close();
 }

 console.log(`\n${fallades === 0 ? "✓" : "✗"} prova-suggeriments: ${passades} passades, ${fallades} fallades`);
 process.exit(fallades ? 1 : 0);
})();
