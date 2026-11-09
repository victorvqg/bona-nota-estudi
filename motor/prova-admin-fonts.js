// Prova (issue #13): orígens de les estrelles i estrelles per minut al tauler d'admin.
// Avalua les funcions pures d'admin/index.html que hi ha entre «// [estrelles-pures]» i «// [/estrelles-pures]».
// Ús: node motor/prova-admin-fonts.js
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'admin', 'index.html'), 'utf8');
const m = src.match(/\/\/ \[estrelles-pures\][^\n]*\n([\s\S]*?)\/\/ \[\/estrelles-pures\]/);
if (!m) { console.error('prova-admin-fonts: no trobo els marcadors // [estrelles-pures] a admin/index.html'); process.exit(1); }
const { afegeixFonts, resumFonts } = new Function(m[1] + ';return {afegeixFonts,resumFonts}')();

const errs = [];
const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) errs.push(`${msg}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };
const L = (nom, assig, event, detall) => ({ nom, assig, event, detall, ts: '2026-11-09T10:00:00Z' });

// un dispositiu nou envia menys fonts que l'anterior: es queda el màxim de cada clau i de les estrelles
const d = {};
afegeixFonts(d, L('Anna', 'catala', 'temps', { punts: 14, fonts: { jocs: 10, temes: 4 } }));
afegeixFonts(d, L('Anna', 'catala', 'entra', { punts: 6, fonts: { jocs: 6 } }));
eq(d.catala && d.catala.f, { jocs: 10, temes: 4 }, 'màxim per clau');
eq(d.catala && d.catala.p, 14, 'màxim de punts');

// resum de tots els nens: fonts sumades per nen i ritme (est i segons) per activitat
const r = resumFonts([
  L('Anna', 'catala', 'temps', { punts: 14, fonts: { jocs: 10, temes: 4 } }),
  L('anna ', 'catala', 'entra', { punts: 6, fonts: { jocs: 6 } }),
  L('Biel', 'socials', 'temps', { punts: 5, fonts: { jocs: 5 } }),
  L('Anna', 'catala', 'test', { est: 5, s: 60 }),
  L('Anna', 'catala', 'joc', { est: 3, s: 30 }),
  L('Anna', 'catala', 'temps', { s: 300 }),
]);
eq(r.fonts, { jocs: 15, temes: 4 }, 'fonts de tots els nens');
eq(r.ritme.test, { est: 5, s: 60 }, 'ritme dels tests');
eq(r.ritme.joc, { est: 3, s: 30 }, 'ritme dels jocs');
eq('temps' in r.ritme, false, 'temps no és una activitat');

// un registre amb est però sense segons (examen del Taller, repàs només d'eines) no ha d'inflar les estrelles per minut
const r2 = resumFonts([L('Anna', 'matematiques', 'examen', { est: 4 }), L('Anna', 'matematiques', 'examen', { est: 2, s: 130 })]);
eq(r2.ritme.examen, { est: 2, s: 130 }, 'est sense segons fora del ritme');

if (errs.length) { console.error('prova-admin-fonts: ' + errs.join(' · ')); process.exit(1); }
console.log('prova-admin-fonts: ok');
