// Prova de la pàgina 404.html (n2921): estat 404, adreça segura amb textContent (XSS), cap ruta relativa,
// sense desbordament a 360/390/430 px, botons visibles sense scroll a 1280×780 i 390×844, i «Torna a la portada» → «/».
//   node motor/prova-404.js
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");

const arrel = path.join(__dirname, "..");
const f404 = path.join(arrel, "404.html");
const MIME = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".js": "application/javascript", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json" };

function arrencaServidor() {
  return new Promise(res => {
    const srv = http.createServer((req, resp) => {
      const ruta = decodeURIComponent((req.url || "/").split("?")[0]);
      const net = path.normalize(ruta).replace(/^(\.\.[/\\])+/, "");
      let fitx = path.join(arrel, net);
      if (fs.existsSync(fitx) && fs.statSync(fitx).isDirectory()) fitx = path.join(fitx, "index.html");
      if (fitx.startsWith(arrel) && fs.existsSync(fitx) && fs.statSync(fitx).isFile()) {
        const ext = path.extname(fitx);
        resp.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        fs.createReadStream(fitx).pipe(resp);
        return;
      }
      const html = fs.readFileSync(f404);
      resp.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      resp.end(html);
    });
    srv.listen(0, "127.0.0.1", () => res({ srv, port: srv.address().port }));
  });
}

(async () => {
  const errors = [];
  const ok = (c, m) => { if (!c) errors.push(m); };

  ok(fs.existsSync(f404), "no existeix 404.html a l'arrel del repo");
  const src = fs.readFileSync(f404, "utf8");
  ok(/<html\s+lang="ca"/.test(src), "404.html ha de portar lang=\"ca\"");
  ok(/<meta\s+name="robots"\s+content="noindex"/.test(src), "404.html ha de portar <meta name=\"robots\" content=\"noindex\">");
  ok(/prefers-reduced-motion/.test(src), "404.html ha de respectar prefers-reduced-motion");
  ok(!/sprites\.js|supabase|serviceWorker/i.test(src), "404.html ha de ser autocontinguda (sense sprites.js, Supabase ni service worker)");
  // Totes les rutes (href/src) han de ser absolutes (comencen per «/» o «https://»)
  for (const m of src.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const v = m[1];
    ok(v.startsWith("/") || v.startsWith("https://"), `ruta relativa a 404.html: ${v}`);
  }
  // sw.js només desa pàgines si resp.ok
  const swSrc = fs.readFileSync(path.join(arrel, "sw.js"), "utf8");
  ok(/if\s*\(\s*resp\.ok\s*\)\s*\{[^}]*c\.put\(r,\s*cp\)/.test(swSrc), "sw.js ha de desar les pàgines només si resp.ok");

  const { srv, port } = await arrencaServidor();
  const base = `http://127.0.0.1:${port}`;
  const nav = await chromium.launch();
  try {
    // 1) Estat 404 + adreça amb XSS (cap <img> ni alert) + «Torna enrere» amagat amb history.length===1
    const ctx1 = await nav.newContext({ viewport: { width: 1280, height: 780 } });
    await ctx1.addInitScript(() => { Object.defineProperty(window.history, "length", { get: () => 1 }); });
    const p1 = await ctx1.newPage();
    await p1.goto(`${base}/sociales/`);
    ok(await p1.locator("#enrere").isHidden(), "«Torna enrere» ha d'estar amagat quan history.length <= 1");
    await ctx1.close();

    const ctx = await nav.newContext({ viewport: { width: 1280, height: 780 } });
    const p = await ctx.newPage();
    let dialegs = 0, errsJs = [];
    p.on("dialog", async d => { dialegs++; await d.dismiss(); });
    p.on("pageerror", e => errsJs.push(e.message));
    const rXss = await p.goto(`${base}/%3Cimg%20src=x%20onerror=alert(1)%3E`);
    ok(rXss && rXss.status() === 404, `estat esperat 404, rebut ${rXss && rXss.status()}`);
    const adrTxt = await p.locator("#adreca").textContent();
    ok(adrTxt && adrTxt.includes("<img src=x onerror=alert(1)>"), `l'adreça ha de sortir com a text a #adreca (surt: ${adrTxt})`);
    ok((await p.locator("img").count()) === 0, "amb payload XSS no hi ha d'haver cap <img> al DOM");
    ok(dialegs === 0, "amb payload XSS no s'ha d'obrir cap diàleg alert()");
    ok(errsJs.length === 0, `errors de JS: ${errsJs.join(" | ")}`);

    // 2) Límit de 60 caràcters a #adreca
    await p.goto(`${base}/aquest/es/un/cami/molt/llarg/que/supera/de/llarg/els/seixanta/caracters`);
    const adrLlarg = await p.locator("#adreca").textContent();
    ok(adrLlarg.length <= 60, `l'adreça no ha de superar 60 caràcters (en té ${adrLlarg.length})`);

    // 3) Amb pàgina anterior (history.length > 1): els dos botons visibles sense scroll a 1280×780 i 390×844
    for (const [w, h] of [[1280, 780], [390, 844]]) {
      await p.setViewportSize({ width: w, height: h });
      const r404 = await p.goto(`${base}/sociales/`);
      ok(r404 && r404.status() === 404, `/sociales/ ha de tornar estat 404 (${w}×${h})`);
      ok(!(await p.locator("#enrere").isHidden()), `«Torna enrere» ha de ser visible amb pàgina anterior (${w}×${h})`);
      const b1 = await p.locator("a.bt-pral").boundingBox();
      const b2 = await p.locator("#enrere").boundingBox();
      ok(b1 && b1.y + b1.height <= h, `«Torna a la portada» ha de ser visible sense scroll a ${w}×${h} (bottom=${b1 && Math.round(b1.y + b1.height)})`);
      ok(b2 && b2.y + b2.height <= h, `«Torna enrere» ha de ser visible sense scroll a ${w}×${h} (bottom=${b2 && Math.round(b2.y + b2.height)})`);
    }

    // 4) Sense desbordament horitzontal a 360, 390 i 430 px
    for (const w of [360, 390, 430]) {
      await p.setViewportSize({ width: w, height: 820 });
      await p.goto(`${base}/sociales/`);
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(ov <= 1, `desbordament horitzontal a ${w}px (+${ov}px)`);
    }

    // 5) «Torna a la portada» porta a «/»
    ok((await p.locator("a.bt-pral").getAttribute("href")) === "/", "«Torna a la portada» ha de tenir href=\"/\"");
    await p.locator("a.bt-pral").click();
    await p.waitForLoadState("domcontentloaded");
    ok(new URL(p.url()).pathname === "/", `clicar «Torna a la portada» ha de portar a «/» (ha anat a ${p.url()})`);
    await ctx.close();

    // 6) Sense JavaScript: frase de reserva
    const ctxNoJs = await nav.newContext({ javaScriptEnabled: false });
    const pNoJs = await ctxNoJs.newPage();
    await pNoJs.goto(`${base}/sociales/`);
    const pTxt = (await pNoJs.locator("main p").textContent()).replace(/\s+/g, " ").trim();
    ok(pTxt.includes("L'adreça que has obert no porta enlloc"), `sense JS la frase ha de dir «L'adreça que has obert no porta enlloc» (diu: ${pTxt})`);
    await ctxNoJs.close();
  } finally {
    await nav.close();
    srv.close();
  }

  if (errors.length) {
    errors.forEach(e => console.error("✗", e));
    process.exit(1);
  }
  console.log("✓ prova-404: estat 404, XSS segur, rutes absolutes, 360/390/430 px i 1280×780 sense scroll, portada «/» i sw.js ok");
})().catch(e => { console.error(e); process.exit(1); });
