// Prova visual d'un món al mòbil (360, 390 i 430 px): res no surt de la pantalla i els textos dels dibuixos caben.
//   node motor/prova-visual.js <carpeta> [<carpeta>…]      p. ex. node motor/prova-visual.js bio-i-geo/geosfera
// Mira la targeta de la portada, la fitxa del primer tema (?tema=0), cada joc de tipus «figura» i «error» (?joc=<id>)
// i la celebració del boss (?demoBoss=1). Comprova: cap desplaçament horitzontal, cap <text> d'un SVG fora del seu
// viewBox ni fora de la caixa (<rect>) on és, i cap error de JavaScript. Desa captures a motor/.captures/<id>/.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const arrel = path.join(__dirname, ".."), AMPLADES = [360, 390, 430];
const carpetes = process.argv.slice(2);
if (!carpetes.length) { console.error("Ús: node motor/prova-visual.js <carpeta> [<carpeta>…]"); process.exit(2); }

function jocsVisuals(carpeta) {
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, "mons.json"), "utf8")).find(x => x.carpeta === carpeta);
  if (!m) throw new Error(`${carpeta} no és a motor/mons.json`);
  const src = fs.readFileSync(path.join(__dirname, "dades", `${m.dades}.js`), "utf8");   // dades del repo, com a tot.py
  const g = { document: { getElementById: () => ({}), createElement: () => ({}) }, window: {}, location: { search: "" } };
  const A = new Function("document", "window", "location", src + ";return ASSIG")(g.document, g.window, g.location);
  return { id: m.dades, jocs: A.jocs.filter(j => j.tipus === "figura" || j.tipus === "error").map(j => j.id) };
}

// S'executa a la pàgina: problemes de mida (desplaçament horitzontal i textos d'SVG que no caben). «ambit»: només dins
// d'aquest element (a la portada, la targeta del món). Les il·lustracions (.ilu) poden sobresortir del viewBox a posta.
function mesura(ambit) {
  const prob = [], de = document.documentElement, arrel = ambit ? document.querySelector(ambit) : document;
  if (!arrel) return prob;
  if (de.scrollWidth > de.clientWidth + 1) prob.push(`desplaçament horitzontal: ${de.scrollWidth}px > ${de.clientWidth}px`);
  const dins = (a, b, t = 1.5) => a.x >= b.x - t && a.y >= b.y - t && a.x + a.width <= b.x + b.width + t && a.y + a.height <= b.y + b.height + t;
  for (const svg of arrel.querySelectorAll("svg")) {
    const textos = [...svg.querySelectorAll("text")].filter(t => t.textContent.trim());
    if (!textos.length || svg.closest("[hidden]")) continue;
    const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : null;
    const rects = [...svg.querySelectorAll("rect")].map(r => r.getBBox()).filter(b => b.width > 0 && b.height > 0);
    for (const t of textos) {
      const b = t.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2, nom = t.textContent.trim().slice(0, 30);
      if (vb && !svg.classList.contains("ilu") && !dins(b, vb, 3)) { const fora = Math.max(vb.x - b.x, vb.y - b.y, b.x + b.width - vb.x - vb.width, b.y + b.height - vb.y - vb.height); prob.push(`SVG: «${nom}» surt del dibuix (${fora.toFixed(1)} unitats)`); }
      const caixa = rects.filter(r => cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height).sort((p, q) => p.width * p.height - q.width * q.height)[0];
      if (caixa && !dins(b, caixa)) prob.push(`SVG: «${nom}» surt de la seva caixa (${Math.round(b.width)} px de text en ${Math.round(caixa.width)} px)`);
    }
  }
  return prob;
}

(async () => {
  const nav = await chromium.launch();
  let mal = 0;
  for (const carpeta of carpetes) {
    const { id, jocs } = jocsVisuals(carpeta), dir = path.join(__dirname, ".captures", id), mal0 = mal;
    fs.mkdirSync(dir, { recursive: true });
    const vistes = [["portada", "file://" + path.join(arrel, "index.html"), 600], ["tema0", "?tema=0", 800],
      ...jocs.map(j => [`joc-${j}`, `?joc=${j}`, 800]), ["boss", "?demoBoss=1", 1500]];
    for (const w of AMPLADES) {
      const p = await nav.newPage({ viewport: { width: w, height: 820 } }), errs = [];
      p.on("pageerror", e => errs.push(e.message));
      for (const [nom, url, espera] of vistes) {
        await p.goto(url.startsWith("file://") ? url : "file://" + path.join(arrel, carpeta, "index.html") + url);
        await p.waitForTimeout(espera);
        if (nom === "portada") await p.evaluate(i => { const c = document.querySelector(`.as[data-id="${i}"]`); if (c) c.scrollIntoView({ block: "center" }); }, id);
        const prob = await p.evaluate(mesura, nom === "portada" ? `.as[data-id="${id}"]` : null);
        if (nom === "portada" && !(await p.$(`.as[data-id="${id}"]`))) prob.push("la targeta del món no és a la portada");
        await p.screenshot({ path: path.join(dir, `${w}-${nom}.png`) });
        const unics = [...new Set(prob)];
        if (unics.length) { mal += unics.length; console.log(`✗ ${id} · ${w}px · ${nom}`); unics.forEach(x => console.log("    " + x)); }
      }
      if (errs.length) { mal += errs.length; console.log(`✗ ${id} · ${w}px · errors de JavaScript: ${[...new Set(errs)].join(" | ")}`); }
      await p.close();
    }
    console.log(`${mal > mal0 ? "✗" : "✓"} ${id}: ${vistes.length} vistes × ${AMPLADES.length} amplades revisades (captures a motor/.captures/${id}/)`);
  }
  await nav.close();
  console.log(mal ? `\n✗ ${mal} problemes visuals` : "\n✓ prova-visual: res surt de la pantalla ni dels dibuixos");
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
