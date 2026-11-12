#!/usr/bin/env node
// Prova de coherència de les regles del joc (M6 · n2537):
// Comprova que motor/regles.json i admin/regles.json coincideixen amb les constants
// de motor/plantilla-estudi-interactiu.html i que cap còpia manual (portada, perfil,
// admin i SQL del xat i del tauler) s'ha desquadrat.
// Ús: node motor/prova-regles.js

const fs = require("fs");
const path = require("path");

const arrel = path.resolve(__dirname, "..");
let ok = 0;
function prova(cond, msg) {
  if (!cond) {
    console.error("✗ ERROR a prova-regles:", msg);
    process.exit(1);
  }
  ok++;
}

const fMotor = path.join(arrel, "motor", "regles.json");
const fAdmin = path.join(arrel, "admin", "regles.json");
prova(fs.existsSync(fMotor), "Falta motor/regles.json (executa python3 motor/tot.py)");
prova(fs.existsSync(fAdmin), "Falta admin/regles.json (executa python3 motor/tot.py)");

const txtMotor = fs.readFileSync(fMotor, "utf8");
const txtAdmin = fs.readFileSync(fAdmin, "utf8");
prova(txtMotor === txtAdmin, "motor/regles.json i admin/regles.json no són idèntics");

const regles = JSON.parse(txtMotor);
const CLAUS = [
  "NIVELLS", "COM_GUANYAR", "SUPER_PREMIS", "SUPER_MAX",
  "OB_COMBO_PC", "OB_COMBO_PREMIS", "OB_COMBO_MAX", "OB_PARAULES_IDEA",
  "APROVA", "REP_PREMI", "REP_MAX"
];
for (const k of CLAUS) {
  prova(k in regles, `Falta la clau ${k} a regles.json`);
}

// 1) Coincidència exacta amb motor/plantilla-estudi-interactiu.html
const tpl = fs.readFileSync(path.join(arrel, "motor", "plantilla-estudi-interactiu.html"), "utf8");
const decls = ["NIVELLS", "COM_GUANYAR", "SUPER_PREMIS", "OB_COMBO_PC", "APROVA", "REP_PREMI"].map(k => {
  const m = tpl.match(new RegExp("^\\s*const " + k + "=[^;]+;", "m"));
  prova(!!m, `No s'ha trobat 'const ${k}=...' a motor/plantilla-estudi-interactiu.html`);
  return m[0];
}).join("\n");
const extret = new Function(decls + "\nreturn {" + CLAUS.join(",") + "}")();
for (const k of CLAUS) {
  prova(
    JSON.stringify(regles[k]) === JSON.stringify(extret[k]),
    `regles.${k} (${JSON.stringify(regles[k])}) no coincideix amb la plantilla (${JSON.stringify(extret[k])})`
  );
}

prova(Array.isArray(regles.NIVELLS) && regles.NIVELLS.length === 10, "NIVELLS ha de tenir 10 nivells");
prova(regles.NIVELLS[0][0] === 0, "El primer nivell ha de començar a 0 estrelles");
for (let i = 1; i < regles.NIVELLS.length; i++) {
  prova(regles.NIVELLS[i][0] > regles.NIVELLS[i - 1][0], "Els llindars de NIVELLS han d'anar en ordre creixent");
}
prova(Number.isInteger(regles.APROVA) && regles.APROVA > 0 && regles.APROVA <= 100, "APROVA ha de ser un enter entre 1 i 100");

const llindars = regles.NIVELLS.map(x => x[0]);
const nomsNivell = regles.NIVELLS.map(x => x[1]);
const aprova = regles.APROVA;

// 2) Portada (index.html) i perfil (perfil/index.html): NIV i aprovat
for (const rel of ["index.html", "perfil/index.html"]) {
  const src = fs.readFileSync(path.join(arrel, rel), "utf8");
  const mNiv = src.match(/const NIV=(\[\[[^\n;]+?\]);/);
  prova(!!mNiv, `No s'ha trobat 'const NIV=[...]' a ${rel}`);
  const nivVal = new Function("return " + mNiv[1])();
  prova(
    JSON.stringify(nivVal) === JSON.stringify(regles.NIVELLS),
    `NIV a ${rel} no coincideix amb NIVELLS de la plantilla`
  );
}

const idxSrc = fs.readFileSync(path.join(arrel, "index.html"), "utf8");
const mIdxAp = idxSrc.match(/Math\.max\(\.\.\.t\.intents\.map\(i=>i\.pc\)\)>=(\d+)/);
prova(!!mIdxAp, "No s'ha trobat el filtre de temes aprovats (Math.max(...t.intents.map(i=>i.pc))>=...) a index.html");
prova(+mIdxAp[1] === aprova, `L'aprovat de la portada (${mIdxAp[1]}) no coincideix amb APROVA (${aprova})`);

// 3) SQL del xat (supabase/bn_xat.sql): bn_priv.xat_niv
const xatSql = fs.readFileSync(path.join(arrel, "supabase", "bn_xat.sql"), "utf8");
const mXat = xatSql.match(/create or replace function bn_priv\.xat_niv[\s\S]*?unnest\(array\[([^\]]+)\]\)/);
prova(!!mXat, "No s'ha trobat unnest(array[...]) dins de bn_priv.xat_niv a supabase/bn_xat.sql");
const xatLlindars = mXat[1].split(",").map(s => +s.trim());
prova(
  JSON.stringify(xatLlindars) === JSON.stringify(llindars),
  `Els llindars de bn_priv.xat_niv (${JSON.stringify(xatLlindars)}) no coincideixen amb NIVELLS (${JSON.stringify(llindars)})`
);

// 4) SQL del tauler (supabase/bn_admin_tauler.sql): aprovat (resum i alertes)
const taulerSql = fs.readFileSync(path.join(arrel, "supabase", "bn_admin_tauler.sql"), "utf8");
const mResumAp = taulerSql.match(/'aprovats'[\s\S]*?\(detall->>'pc'\)::int\s*>=\s*(\d+)/);
prova(!!mResumAp, "No s'ha trobat el càlcul d'aprovats a bn_admin_resum (supabase/bn_admin_tauler.sql)");
prova(+mResumAp[1] === aprova, `L'aprovat de bn_admin_resum (${mResumAp[1]}) no coincideix amb APROVA (${aprova})`);

const mAlBaixa = taulerSql.match(/z\.p\[1\]\s*<\s*z\.p\[2\]\s*and\s*z\.p\[2\]\s*<\s*z\.p\[3\]\s*and\s*z\.p\[1\]\s*<\s*(?:coalesce\(v_baixa_pc,\s*)?(\d+)\)?/);
prova(!!mAlBaixa, "No s'ha trobat l'alerta de nota que baixa a bn_admin_alertes (supabase/bn_admin_tauler.sql)");
prova(+mAlBaixa[1] === aprova, `El llindar de l'alerta 'baixa' (${mAlBaixa[1]}) no coincideix amb APROVA (${aprova})`);

const mAlEncallat = taulerSql.match(/having\s+(?:v_enc_g\s*>\s*0\s+and\s+)?count\(\*\)\s*>=\s*(?:coalesce\(v_enc_n,\s*3\)|3)\s*and\s*max\(\(l\.detall->>'pc'\)::int\)\s*<\s*(\d+)/);
prova(!!mAlEncallat, "No s'ha trobat l'alerta d'encallat a bn_admin_alertes (supabase/bn_admin_tauler.sql)");
prova(+mAlEncallat[1] === aprova, `El llindar de l'alerta 'encallat' (${mAlEncallat[1]}) no coincideix amb APROVA (${aprova})`);

// 5) Admin (admin/index.html): APROVAT, XNIV, domini, banda de color i alertes/resum DEMO
const admSrc = fs.readFileSync(path.join(arrel, "admin", "index.html"), "utf8");
const mAdmAp = admSrc.match(/(?:const|let)\s+APROVAT=(\d+)\b/);
prova(!!mAdmAp, "No s'ha trobat APROVAT=... a admin/index.html");
prova(+mAdmAp[1] === aprova, `APROVAT a admin/index.html (${mAdmAp[1]}) no coincideix amb APROVA (${aprova})`);

const mXNiv = admSrc.match(/(?:const|let)\s+XNIV=(\[[^\n;]+?\]);/);
prova(!!mXNiv, "No s'ha trobat XNIV=[...] a admin/index.html");
const xnivVal = new Function("return " + mXNiv[1])();
prova(
  JSON.stringify(xnivVal) === JSON.stringify(nomsNivell),
  `XNIV a admin/index.html (${JSON.stringify(xnivVal)}) no coincideix amb els noms de NIVELLS (${JSON.stringify(nomsNivell)})`
);

const mBand = admSrc.match(/const bandPc=pc=>pc==null\?"bfx":pc>=90\?"b90":pc>=(APROVAT|\d+)\?"b70"/);
prova(!!mBand, "No s'ha trobat bandPc a admin/index.html");
prova(mBand[1] === "APROVAT" || +mBand[1] === aprova, `El llindar b70 de bandPc (${mBand[1]}) no coincideix amb APROVA (${aprova})`);

const mDomini = admSrc.match(/const estat=c=>!c\?"no":c\.millor==null\?"fitxa":c\.millor>=(APROVAT|\d+)\?"aprovat":"suspes"/);
prova(!!mDomini, "No s'ha trobat estat a tDomini d'admin/index.html");
prova(mDomini[1] === "APROVAT" || +mDomini[1] === aprova, `L'aprovat de tDomini (${mDomini[1]}) no coincideix amb APROVA (${aprova})`);

const mDemoResum = admSrc.match(/aprovats:te\.length\?Math\.round\(100\*te\.filter\(l=>l\.detall\.pc>=(APROVAT|\d+)\)\.length\/te\.length\):null/);
prova(!!mDemoResum, "No s'ha trobat el càlcul d'aprovats DEMO a admin/index.html");
prova(mDemoResum[1] === "APROVAT" || +mDemoResum[1] === aprova, `L'aprovat DEMO (${mDemoResum[1]}) no coincideix amb APROVA (${aprova})`);

const mDemoEnc = admSrc.match(/if\((?:LA\.encallat\.grav>0&&)?g\.length>=(?:LA\.encallat\.vegades|3)&&mx<(APROVAT|\d+)\)al\.push\(\{tipus:"encallat"/);
prova(!!mDemoEnc, "No s'ha trobat l'alerta DEMO 'encallat' a admin/index.html");
prova(mDemoEnc[1] === "APROVAT" || +mDemoEnc[1] === aprova, `El llindar DEMO 'encallat' (${mDemoEnc[1]}) no coincideix amb APROVA (${aprova})`);

const mDemoBaixa = admSrc.match(/p\[2\]<p\[1\]&&p\[1\]<p\[0\]&&p\[2\]<(?:\(LA\.baixa\.nota_max\|\|)?(APROVAT|\d+)\)?\)al\.push\(\{tipus:"baixa"/);
prova(!!mDemoBaixa, "No s'ha trobat l'alerta DEMO 'baixa' a admin/index.html");
prova(mDemoBaixa[1] === "APROVAT" || +mDemoBaixa[1] === aprova, `El llindar DEMO 'baixa' (${mDemoBaixa[1]}) no coincideix amb APROVA (${aprova})`);

console.log(`✓ prova-regles: ${ok} comprovacions passades (NIVELLS=${llindars.join("/")}, APROVA=${aprova})`);
