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

// Capçalera d'un món (pàgina ja carregada): el títol, el nom i el curs s'han de veure; a l'ordinador, el menú centrat;
// i el text blanc del menú ha de tenir prou contrast (≥ 4,5) sobre la banda fosca damunt dels 3 colors del degradat.
function capcalera(ordinador) {
  const prob = [], r = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
  S.nom = "Mireia Puigdollers"; S.id = 8; pintaCap();
  const h = r("#hola"), c = r("#curs"), q = r("#qui");
  if (!h || h.width < 140) prob.push(`capçalera: el títol només té ${h ? Math.round(h.width) : 0} px d'ample (mínim 140)`);
  if (ASSIG.curs && (!c || c.width < 20)) prob.push("capçalera: no es veu el curs");
  if (!q || q.width < 40) prob.push("capçalera: no es veu el nom");
  if (ordinador) {
    const bs = [...document.querySelectorAll("#nav > a, #nav > button")].map(e => e.getBoundingClientRect()), W = document.documentElement.clientWidth;
    const esq = bs[0].left, dre = W - bs[bs.length - 1].right;
    if (Math.abs(esq - dre) > 8) prob.push(`menú no centrat: ${Math.round(esq)} px a l'esquerra i ${Math.round(dre)} px a la dreta`);
    const fons = getComputedStyle(document.getElementById("nav")).backgroundColor.match(/[\d.]+/g).map(Number), al = fons[3] === undefined ? 1 : fons[3];
    const hex = v => { const m = getComputedStyle(document.documentElement).getPropertyValue(v).trim().match(/^#([0-9a-f]{6})$/i); return m ? [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16)) : null; };
    const lum = c => { const x = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * x[0] + .7152 * x[1] + .0722 * x[2]; };
    for (const v of ["--g1", "--g2", "--g3"]) { const g = hex(v); if (!g) continue; const bg = g.map((x, i) => x * (1 - al) + fons[i] * al), cr = 1.05 / (lum(bg) + .05);
      if (cr < 4.5) prob.push(`menú: contrast ${cr.toFixed(1)} del text blanc sobre ${v} (mínim 4,5)`); }
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
      ...jocs.map(j => [`joc-${j}`, `?joc=${j}`, 800]), ["boss-combat", "?demoCombat=1", 900], ["boss", "?demoBoss=1", 1500]];
    for (const w of AMPLADES) {
      const p = await nav.newPage({ viewport: { width: w, height: 820 } }), errs = [];
      p.on("pageerror", e => errs.push(e.message));
      const llista = w === 390 ? [...vistes, ...[1, 2, 3, 4, 5].map(f => [`boss-f${f}`, `?demoBoss=1&fase=${f}`, 450])] : vistes;
      for (const [nom, url, espera] of llista) {
        await p.goto(url.startsWith("file://") ? url : "file://" + path.join(arrel, carpeta, "index.html") + url);
        await p.waitForTimeout(espera);
        if (nom === "portada") await p.evaluate(i => { const c = document.querySelector(`.as[data-id="${i}"]`); if (c) c.scrollIntoView({ block: "center" }); }, id);
        const prob = await p.evaluate(mesura, nom === "portada" ? `.as[data-id="${id}"]` : null);
        if (nom === "tema0") prob.push(...await p.evaluate(capcalera, false));
        if (nom === "portada" && !(await p.$(`.as[data-id="${id}"]`))) prob.push("la targeta del món no és a la portada");
        await p.screenshot({ path: path.join(dir, `${w}-${nom}.png`) });
        const unics = [...new Set(prob)];
        if (unics.length) { mal += unics.length; console.log(`✗ ${id} · ${w}px · ${nom}`); unics.forEach(x => console.log("    " + x)); }
      }
      if (errs.length) { mal += errs.length; console.log(`✗ ${id} · ${w}px · errors de JavaScript: ${[...new Set(errs)].join(" | ")}`); }
      await p.close();
    }
    { // ordinador: la capçalera a 1400 px (menú centrat i contrast)
      const p = await nav.newPage({ viewport: { width: 1400, height: 800 } });
      await p.goto("file://" + path.join(arrel, carpeta, "index.html") + "?tema=0"); await p.waitForTimeout(800);
      const prob = await p.evaluate(capcalera, true);
      await p.screenshot({ path: path.join(dir, `1400-capcalera.png`), clip: { x: 0, y: 0, width: 1400, height: 160 } });
      if (prob.length) { mal += prob.length; console.log(`✗ ${id} · 1400px · capçalera`); prob.forEach(x => console.log("    " + x)); }
      await p.close();
    }
    console.log(`${mal > mal0 ? "✗" : "✓"} ${id}: ${vistes.length} vistes × ${AMPLADES.length} amplades revisades (captures a motor/.captures/${id}/)`);
  }
  await nav.close();
  console.log(mal ? `\n✗ ${mal} problemes visuals` : "\n✓ prova-visual: res surt de la pantalla ni dels dibuixos");
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
