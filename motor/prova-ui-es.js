// Prova la traducció de la interfície del motor al castellà (motor/eines/ui-es.js), sense navegador.
//   node motor/prova-ui-es.js
const { uiEs } = require("./eines/ui-es.js");
const casos = [
  ["Toca la paraula que falta.", "Toca la palabra que falta."],
  ["❌ No és aquesta. 💡 Tema definido y orden lógico.", "❌ No es esta. 💡 Tema definido y orden lógico."],
  ["Comença per «ad…» i són 2 paraules.", "Empieza por «ad…» y son 2 palabras."],
  ["🔒 Per obrir-lo: aprova 11 dels 15 temes (ara: 0) o treu un 70 % en un examen", "🔒 Para abrirlo: aprueba 11 de los 15 temas (ahora: 0) o saca un 70 % en un examen"],
  ["Nivell 3 · Investigador", "Nivel 3 · Investigador"],
  ["🎉 Fet (amb 2 errors)! ¡Muy bien!", "🎉 ¡Hecho (con 2 errores)! ¡Muy bien!"],
  ["temes", "temas"],
  ["Et falten 10 ⭐ per a 🧭 Explorador", "Te faltan 10 ⭐ para 🧭 Explorador"],
  // el contingut en castellà no es toca, encara que contingui paraules que també són catalanes
  ["tú temes al perro", "tú temes al perro"],
  ["El sustantivo es el núcleo del sintagma.", "El sustantivo es el núcleo del sintagma."],
  ["Juego", "Juego"]
];
let mal = 0;
for (const [a, b] of casos) { const r = uiEs(a); if (r !== b) { mal++; console.log(`✗ «${a}» → «${r}» (esperava «${b}»)`); } }
if (mal) { console.log(`✗ prova-ui-es: ${mal} errors`); process.exit(1); }
console.log(`✓ prova-ui-es: ${casos.length} casos bé`);
