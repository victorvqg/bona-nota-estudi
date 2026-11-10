#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de la fitxa al núvol i de les altes (supabase/bn_admin_fitxa.sql) dins d'un Postgres de prova (PGlite).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-fitxa-sql.js
// No toca Supabase ni la xarxa: munta una base mínima amb els fitxers REALS del repo (bn_log.sql, bn_ranking_net.sql, bn_pin_nou.sql,
// bn_admin_tauler.sql i bn_aspecte.sql) i taules simulades per a bn_priv.perfils, intents i progres (a producció no tenen SQL al repo).
// Rellotge: la prova avança el rellotge de PGlite (llegeix Date.now) fins a les 23:30 UTC d'avui, quan a Madrid ja és l'endemà.
//   Així es distingeix de debò la data UTC (la del joc: rep_avui) de la de Madrid (la del tauler: dies7).
// Casos: 1) creat en dos passos (en un sol pas els vells prendrien data) i el SQL dues vegades · 2) contrasenya dolenta
//        3) nen sense perfil · 4) amb perfil i sense progrés · 5) dos mons (resums d'intents, jocs, rep ordenat, rep_avui, exàmens…)
//        6) estat mal format sense petar · 7) un món que fa petar el resum surt amb "error": true · 8) altes · 9) permisos
//        10) còpia de perfils.ts a creat si la columna existeix (segona base) i res si és d'un altre tipus (tercera base).
// Cal PGlite:  npm install --no-save @electric-sql/pglite@0.5   (l'Action «Revisa Bona Nota» ja l'instal·la)
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite (el Postgres de prova). Instal·la'l des de l'arrel del repo:\n    npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }
const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
const SQL = fitxer("supabase/bn_admin_fitxa.sql");
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
// comparació sense dependre de l'ordre de les claus (jsonb les reordena)
const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const igual = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const claus = o => o && typeof o === "object" ? Object.keys(o).sort().join(",") : String(o);
const mateixesClaus = (o, llista) => claus(o) === [...llista].sort().join(",");
const PIN = "1234A", ADM = ["admin@prova.cat", "contrasenya-de-prova"], DOLENTA = [ADM[0], "dolenta"];
const K_TOP = ["k", "perfil", "amagat", "mons"], K_PERFIL = ["nom", "id", "pin_v", "creat", "pin_ts", "aspecte_ts"];
const K_MON = ["assig", "mod", "ts", "reinici", "punts", "temps", "dies", "dia_ult", "ultim", "temes", "rep", "rep_n", "rep_avui",
               "ob", "examens", "boss", "apresos", "jocs", "fonts", "ftema", "fjoc", "est"];
const K_ERR = ["assig", "mod", "ts", "error"], K_TEMA = ["fitxa", "fc", "n", "max", "ult", "d_ult", "fallades"];
const K_ALTA = ["k", "nom", "alta", "primer", "creat", "pin_ts", "aspecte_ts", "id", "mons", "punts", "dies7", "amagat", "te_pin"];

// ---------- rellotge: 23:30 UTC d'avui (PGlite fa servir Date.now per a now()) ----------
const REAL = Date.now.bind(Date), ARA0 = REAL(), d0 = new Date(ARA0);
const DESPL = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate(), 23, 30) - ARA0;
Date.now = () => REAL() + DESPL;
const D = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);   // data UTC (la del joc) d'aquí a n dies
const diaMadrid = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now()));
const T0 = "(date_trunc('day', now() at time zone 'UTC') at time zone 'UTC')";   // la mitjanit UTC d'avui

// base mínima amb els fitxers reals; «extra» = columnes de més a bn_priv.perfils (p. ex. un «ts» com el que potser hi ha a producció)
async function base(extra = "") {
 const db = await PGlite.create({ extensions: { pgcrypto } });
 await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
 await db.exec(fitxer("supabase/bn_log.sql"));
 await db.exec(`create table bn_priv.perfils(k text primary key, nom text not null, pin text not null, pin_v smallint not null default 1,
                  pin_ts timestamptz, id bigint generated always as identity unique, aspecte jsonb, aspecte_ts timestamptz${extra});
                create table bn_priv.intents(k text primary key, n int not null default 0, ts timestamptz not null default now());
                create table bn_priv.progres(k text not null, assig text not null, estat jsonb, mod bigint, ts timestamptz, primary key (k, assig));
                revoke all on bn_priv.perfils, bn_priv.intents, bn_priv.progres from public, anon, authenticated;`);
 for (const f of ["supabase/bn_ranking_net.sql", "supabase/bn_pin_nou.sql", "supabase/bn_admin_tauler.sql", "supabase/bn_aspecte.sql"]) await db.exec(fitxer(f));
 await db.query("insert into bn_priv.admin(email, hash) values ($1, extensions.crypt($2, extensions.gen_salt('bf')))", ADM);
 return db;
}

(async () => {
 const t0 = REAL();
 const db = await base();
 const q = async (sql, p) => (await db.query(sql, p || [])).rows;
 const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
 const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };
 const executa = async sql => { try { await db.exec(sql); return null } catch (e) { return e.message || String(e) } };
 const fitxa = (nom, cred = ADM) => val("select public.bn_admin_fitxa($1, $2, $3) r", [...cred, nom]);
 const altes = (periode, cred = ADM) => val("select public.bn_admin_altes($1, $2, $3) r", [...cred, periode]);
 const crea = nom => val("select public.bn_perfil_crea($1, $2)", [nom, PIN]);
 // progrés desat (txt = el JSON de l'estat tal qual, o null = NULL de SQL)
 const prog = (k, assig, txt, mod = 1762790000001, ts = "now() - interval '1 hour'") =>
  q(`insert into bn_priv.progres(k, assig, estat, mod, ts) values ($1, $2, $3::text::jsonb, $4, ${ts})`, [k, assig, txt, mod]);
 // registre (cru = sense el trigger de bn_log_net, per poder posar un nom prohibit d'abans del filtre)
 const log = async (nom, assig, punts, ts = "now()", cru = true, event = "test", camp = "punts") => {
  if (cru) await db.exec("set session_replication_role = replica");
  await q(`insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (${ts}, $1, $2, 's', 'a', $3, jsonb_build_object($4::text, $5::numeric))`, [assig, nom, event, camp, punts]);
  if (cru) await db.exec("set session_replication_role = origin") };

 console.log("0) rellotge de la prova: " + new Date(Date.now()).toISOString() + " (UTC " + D(0) + " · Madrid " + diaMadrid() + ")");
 ok(diaMadrid() === D(1), "a aquesta hora a Madrid ja és demà (UTC): les dates UTC i les de Madrid no coincideixen");
 ok(Math.abs(new Date(await val("select now()")).getTime() - Date.now()) < 5000, "PGlite fa servir aquest rellotge per a now()");

 // perfils vells (d'abans d'aquest SQL): no han de prendre cap data inventada
 await crea("Avi"); await crea("Vella");
 await q("insert into bn_priv.perfils(k, nom, pin) values ('merda', 'merda', extensions.crypt('1234A', extensions.gen_salt('bf')))"); // prohibit (d'abans del filtre)
 await log("Avi", "socials", 50, "now() - interval '60 days'");

 console.log("1) creat en dos passos i bn_admin_fitxa.sql dues vegades");
 { await db.exec("create table bn_priv.prova_1pas as select k from bn_priv.perfils; alter table bn_priv.prova_1pas add column creat timestamptz default now();");
  const n1 = await val("select count(*)::int from bn_priv.prova_1pas where creat is not null");
  ok(n1 === 3, "per què dos passos: en un sol pas («add column … default now()») els 3 perfils vells prendrien la data d'avui (" + n1 + ")");
  await db.exec("drop table bn_priv.prova_1pas");
  let e = await executa(SQL); ok(e === null, "primera execució sense errors" + (e ? ": " + e : ""));
  ok((await val("select column_default from information_schema.columns where table_schema = 'bn_priv' and table_name = 'perfils' and column_name = 'creat'")) === "now()",
   "bn_priv.perfils.creat té default now() (per a les altes noves)");
  ok((await val("select count(*)::int from bn_priv.perfils where creat is null")) === 3, "els 3 perfils vells tenen creat buit (no la data d'avui)");
  await crea("Pau"); await crea("Nova"); await crea("Txell"); await crea("Rut");
  const nou = await val("select creat from bn_priv.perfils where k = 'pau'");
  ok(nou && Math.abs(new Date(nou).getTime() - Date.now()) < 60000, "un perfil nou (bn_perfil_crea) té creat = ara");
  const abans = JSON.stringify(await q("select k, creat from bn_priv.perfils order by k"));
  e = await executa(SQL); ok(e === null, "segona execució sense errors" + (e ? ": " + e : ""));
  ok(JSON.stringify(await q("select k, creat from bn_priv.perfils order by k")) === abans, "la segona execució no canvia cap creat (vells buits, nous amb la seva data)");
  ok((await val("select count(*)::int from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.proname in ('bn_admin_fitxa', 'bn_admin_altes')")) === 2,
   "hi ha bn_admin_fitxa i bn_admin_altes (una de cada, sense duplicats)") }

 console.log("2) contrasenya dolenta");
 { ok(/acces denegat/.test(await falla("select public.bn_admin_fitxa($1, $2, $3)", [...DOLENTA, "Pau"]) || ""), "bn_admin_fitxa amb la contrasenya dolenta → acces denegat");
  ok(/acces denegat/.test(await falla("select public.bn_admin_altes($1, $2, $3)", [...DOLENTA, "30d"]) || ""), "bn_admin_altes amb la contrasenya dolenta → acces denegat") }

 console.log("3) nen sense perfil (sense PIN): el registre i, si n'havia desat, el progrés");
 { await log("Gina", "socials", 60, "now() - interval '1 day'"); await log("GINA ", "socials", 62, "now() - interval '1 day' + interval '5 minutes'");
  let f = await fitxa("  GINA ");
  ok(mateixesClaus(f, K_TOP), "claus de la resposta: " + claus(f));
  ok(f.k === "gina" && f.perfil === null && f.amagat === false && igual(f.mons, []), "k normalitzat, perfil null, no amagat i mons []: " + JSON.stringify(f));
  // «Treu el PIN» de l'admin esborra el perfil però conserva el progrés: l'admin l'ha de continuar veient
  await crea("Biel"); await prog("biel", "socials", JSON.stringify({ punts: 33, dies: [D(-1)] }));
  ok((await fitxa("Biel")).perfil !== null && (await fitxa("Biel")).mons.length === 1, "Biel amb PIN: perfil i un món desat");
  await val("select public.bn_admin_usuari($1, $2, $3, $4)", [...ADM, "Biel", "treupin"]);   // torna les files d'intents esborrades, no les del perfil
  ok((await val("select count(*)::int from bn_priv.perfils where k = 'biel'")) === 0 && (await val("select count(*)::int from bn_priv.progres where k = 'biel'")) === 1,
   "«Treu el PIN» esborra el perfil i deixa el progrés");
  f = await fitxa("Biel");
  ok(f.perfil === null && f.mons.length === 1 && f.mons[0].assig === "socials" && f.mons[0].punts === 33 && f.mons[0].dies === 1 && mateixesClaus(f.mons[0], K_MON),
   "progrés amb el perfil esborrat → perfil null i mons amb el món: " + JSON.stringify(f.mons.map(m => [m.assig, m.punts])));
  await q("insert into bn_priv.amagats(k) values ('gina')");
  ok((await fitxa("Gina")).amagat === true, "amagada per l'admin → amagat: true");
  f = await fitxa("Ningú");
  ok(f.k === "ningú" && f.perfil === null && igual(f.mons, []), "un nom que no existeix: perfil null i mons []");
  f = await fitxa(null);
  ok(f.k === "" && f.perfil === null && igual(f.mons, []), "sense nom: no peta (k buit)") }

 console.log("4) amb perfil i sense progrés");
 { let f = await fitxa("Nova");
  ok(mateixesClaus(f.perfil, K_PERFIL), "claus del perfil: " + claus(f.perfil));
  const id = await val("select id::int from bn_priv.perfils where k = 'nova'");
  ok(f.perfil.nom === "Nova" && f.perfil.id === id && f.perfil.pin_v === 2, "nom, id i pin_v (2: PIN nou) del perfil");
  ok(Number.isInteger(f.perfil.creat) && Math.abs(f.perfil.creat - Date.now()) < 60000, "creat en mil·lisegons d'època (ara)");
  ok(Number.isInteger(f.perfil.pin_ts) && Math.abs(f.perfil.pin_ts - Date.now()) < 60000 && f.perfil.aspecte_ts === null, "pin_ts en ms i aspecte_ts null (encara no ha triat perfil)");
  ok(igual(f.mons, []) && f.amagat === false, "mons []: té PIN però encara no ha desat res al núvol");
  await val("select public.bn_aspecte_desa($1, $2, $3::text::jsonb)", ["Nova", PIN, JSON.stringify({ av: "gat", v: "A" })]);
  f = await fitxa("Nova");
  ok(Number.isInteger(f.perfil.aspecte_ts) && Math.abs(f.perfil.aspecte_ts - Date.now()) < 60000, "en triar el perfil, aspecte_ts en ms");
  ok((await fitxa("Avi")).perfil.creat === null, "un perfil vell té creat null") }

 console.log("5) dos mons: resums d'intents, jocs, repàs ordenat, rep_avui (data UTC), exàmens i la resta");
 { const exs = Array.from({ length: 25 }, (_, i) => i % 5 === 4 ? { d: D(-30 + i), pc: 40 + i, real: 1 } : { d: D(-30 + i), pc: 40 + i });
  const SOC = {
   nom: "Pau", id: 3, punts: 57, temps: 1234, ultim: 2, mod: 1762790000999, reinici: 1762000000000,
   dies: [D(-3), D(-1), D(0), D(0)],
   temes: { t1: { fitxa: true, fc: 3, intents: [{ d: D(-3), pc: 40 }, { d: D(-1), pc: 80 }, { d: D(0), pc: 60 }],
                  fallades: { "Quina és la capital?": 3, "Riu més llarg?": 1 }, valoracio: 4 },
            t2: { fitxa: false, fc: 0, intents: [], fallades: {} } },
   rep: { "t1|Q1": { tid: "t1", q: "Q1 demà", c: 0, prox: D(1) },        // demà en UTC = avui a Madrid a aquesta hora: encara no toca
          "t1|Q2": { tid: "t1", q: "Q2 avui", c: 1, prox: D(0) },
          "t2|Q3": { tid: "t2", q: "Q3 endarrerit", c: 2, prox: D(-2) },
          "g|x": { tipus: "err_gen", q: "Q4 d'aquí a 5 dies", c: 0, prox: D(5) } },
   ob: { "0": 75, "3": 50 }, obv: { "0": D(7) },
   examens: exs, boss: { cors: 3, d: D(0), v: 2 }, apresos: 4,
   jocs: { parelles: [50, 90, 70], ordena: [100] },
   fonts: { temes: 30, jocs: 27 }, ftema: { t1: 20 }, fjoc: { parelles: 10 }, est: { d: D(0), r: { "t1|Q2": 1 } },
   xyz: "no ha de sortir" };
  const BIO = { punts: 12, mod: 1762790000555, temes: { b1: { fitxa: true, fc: 1, intents: [{ d: D(-2), pc: 100 }], fallades: {} } }, dies: [D(-2)] };
  await prog("pau", "socials", JSON.stringify(SOC), 1762790000001, "now() - interval '1 hour'");
  await prog("pau", "biogeo", JSON.stringify(BIO), null, "now() - interval '2 days'");
  await log("Pau", "socials", 57);
  const f = await fitxa("Pau");
  ok(f.perfil && f.perfil.nom === "Pau" && f.mons.length === 2 && f.mons.map(m => m.assig).join() === "biogeo,socials", "dos mons, ordenats per assig: " + f.mons.map(m => m.assig));
  const [b, s] = f.mons;
  ok(mateixesClaus(s, K_MON) && mateixesClaus(b, K_MON), "claus de cada món, exactament les del contracte (res de nom, id, obv ni xyz): " + claus(s));
  ok(s.mod === 1762790000001 && b.mod === 1762790000555, "mod: el de la fila de progres (i, si és null, el de l'estat)");
  ok(Math.abs(s.ts - (Date.now() - 3600e3)) < 60000 && Math.abs(b.ts - (Date.now() - 2 * 864e5)) < 60000, "ts: l'hora de l'últim desat en ms");
  ok(s.reinici === 1762000000000 && b.reinici === null, "reinici en ms (o null)");
  ok(s.punts === 57 && s.temps === 1234 && s.ultim === 2 && s.apresos === 4, "punts, temps, ultim i apresos");
  ok(s.dies === 3 && s.dia_ult === D(0) && b.dies === 1 && b.dia_ult === D(-2), "dies diferents (3, el repetit no compta) i l'últim dia");
  ok(igual(s.temes.t1, { fitxa: true, fc: 3, n: 3, max: 80, ult: 60, d_ult: D(0), fallades: { "Quina és la capital?": 3, "Riu més llarg?": 1 } }),
   "tema t1: fitxa, fc, 3 intents, millor 80, última 60 (la del final de la llista) i les fallades: " + JSON.stringify(s.temes.t1));
  ok(igual(s.temes.t2, { fitxa: false, fc: 0, n: 0, max: null, ult: null, d_ult: null, fallades: {} }), "tema t2 sense intents: n 0 i max/ult/d_ult null");
  ok(mateixesClaus(s.temes.t1, K_TEMA) && !("valoracio" in s.temes.t1), "claus de cada tema: " + claus(s.temes.t1));
  ok(s.rep.map(r => r.q).join(" | ") === "Q3 endarrerit | Q2 avui | Q1 demà | Q4 d'aquí a 5 dies", "rep ordenat per prox: " + s.rep.map(r => r.prox).join(" "));
  ok(igual(s.rep[0], { tid: "t2", q: "Q3 endarrerit", c: 2, prox: D(-2) }) && s.rep[3].tid === null, "cada error del repàs: tid, q, c, prox (el de tipus «err_gen» no té tid)");
  ok(s.rep_n === 4 && s.rep_avui === 2, "rep_n 4 i rep_avui 2: el d'avui UTC sí, el de demà UTC (que a Madrid ja és avui) no: " + [s.rep_n, s.rep_avui]);
  const avuis = [];
  for (const z of ["Europe/Madrid", "Pacific/Kiritimati", "Pacific/Pago_Pago", "UTC"]) { await db.exec(`set timezone = '${z}'`); avuis.push((await fitxa("Pau")).mons[1].rep_avui) }
  ok(avuis.every(x => x === 2), "rep_avui és el mateix sigui quina sigui la zona horària de la sessió: " + avuis.join(","));
  ok(igual(s.ob, { "0": 75, "3": 50 }), "ob: {n: pc}");
  ok(s.examens.length === 20 && igual(s.examens[0], { d: D(-25), pc: 45, real: false }) && igual(s.examens[19], { d: D(-6), pc: 64, real: true }),
   "examens: els 20 últims, del més vell al més nou, amb real true/false: " + JSON.stringify([s.examens[0], s.examens[19]]));
  ok(s.examens.filter(x => x.real).length === 4 && s.examens.every(x => mateixesClaus(x, ["d", "pc", "real"])), "examens: 4 de reals entre els 20 i claus d, pc, real");
  ok(igual(s.boss, SOC.boss) && igual(s.fonts, SOC.fonts) && igual(s.ftema, SOC.ftema) && igual(s.fjoc, SOC.fjoc) && igual(s.est, SOC.est), "boss, fonts, ftema, fjoc i est tal qual");
  ok(igual(s.jocs, { parelles: { n: 3, max: 90, ult: 70 }, ordena: { n: 1, max: 100, ult: 100 } }), "jocs: {id: {n, max, ult}}: " + JSON.stringify(s.jocs));
  ok(igual(b.temes, { b1: { fitxa: true, fc: 1, n: 1, max: 100, ult: 100, d_ult: D(-2), fallades: {} } }), "el segon món, amb el seu tema");
  ok(igual(b.rep, []) && b.rep_n === 0 && b.rep_avui === 0 && igual(b.ob, {}) && igual(b.examens, []) && igual(b.jocs, {}) &&
     b.boss === null && b.fonts === null && b.temps === null && b.ultim === null && b.apresos === null,
   "les claus que l'estat no té surten buides ([], {}, 0 o null), no fan petar res");
  // mida: amb 250 errors al repàs, la llista es retalla a 200 (els més urgents) però rep_n i rep_avui els compten tots
  const molts = Object.fromEntries(Array.from({ length: 250 }, (_, i) => ["t1|R" + i, { tid: "t1", q: "R" + i, c: 0, prox: D(i < 120 ? -1 - (i % 9) : 1 + (i % 9)) }]));
  await prog("pau", "zz_rep", JSON.stringify({ rep: molts }));
  const z = (await fitxa("Pau")).mons.find(x => x.assig === "zz_rep");
  ok(z && z.rep.length === 200 && z.rep_n === 250 && z.rep_avui === 120 && z.rep.every((x, i) => i === 0 || z.rep[i - 1].prox <= x.prox),
   "250 errors al repàs: la llista en porta 200 (ordenats per prox), rep_n 250 i rep_avui 120: " + (z && [z.rep.length, z.rep_n, z.rep_avui]));
  await q("delete from bn_priv.progres where k = 'pau' and assig = 'zz_rep'") }

 console.log("6) estat mal format: el resum no peta");
 { const MAL = {
   a_llista: { temes: [1, 2, 3], rep: [{ tid: "t1", q: "x", c: 0, prox: D(0) }], ob: "x", examens: { a: 1 }, jocs: { j: "no" }, dies: "avui",
               boss: [1], fonts: "x", ftema: 5, fjoc: null, est: true, punts: "molts", temps: -5, reinici: "abc", apresos: true, ultim: "t1" },
   b_text: { temes: "hola", punts: 1e30 },
   c_intents: { temes: { t1: { fitxa: "si", fc: "tres", intents: "no", fallades: [1] },
                         t2: { fitxa: 1, intents: [{ d: "ahir", pc: "setanta" }, { d: D(0), pc: 70 }, 5, null, { pc: 1e30 }, { pc: -3 }, { d: D(0), pc: "65" }],
                               fallades: { q: "molt", q2: 2, q3: { n: 1 } } },
                         t3: 7, t4: null, t5: [1] },
                rep: { a: 5, b: { tid: { x: 1 }, q: 3, c: "x", prox: "demà" }, c: null },
                examens: [5, { pc: "x" }, { d: "x", pc: 90, real: "si" }, null],
                jocs: { a: [1, "x", null, 50, -2], b: {}, c: "no" }, dies: ["2026-11-01", 5, "no", null, "2026-11-01"] },
   d_text: "hola", e_llista: [1, 2], f_null: null, g_num: 5, h_bo: { punts: 5 } };
  for (const [a, e] of Object.entries(MAL)) await prog("txell", a, JSON.stringify(e));
  await prog("txell", "i_sqlnull", null, null);
  let f = null, err = null;
  try { f = await fitxa("Txell") } catch (e) { err = e.message }
  ok(err === null && f && f.mons.length === 9, "la fitxa surt igual, amb els 9 mons" + (err ? ": " + err : ""));
  const m = Object.fromEntries((f ? f.mons : []).map(x => [x.assig, x]));
  const a = m.a_llista || {}, c = m.c_intents || {};
  ok(mateixesClaus(a, K_MON) && !a.error && igual(a.temes, {}) && igual(a.rep, []) && a.rep_n === 0 && igual(a.ob, {}) && igual(a.examens, []) && igual(a.jocs, {}) && a.dies === 0,
   "temes com a llista, rep llista, ob text, examens objecte, jocs amb text, dies text → buits: " + JSON.stringify(a));
  ok(a.boss === null && a.fonts === null && a.ftema === null && a.fjoc === null && a.est === null && a.punts === null && a.temps === null && a.reinici === null && a.apresos === null && a.ultim === null,
   "boss llista, fonts text, punts text, temps negatiu, reinici text, apresos booleà… → null");
  ok(igual(m.b_text && m.b_text.temes, {}) && m.b_text.punts === null, "temes com a text → {}; punts 1e30 → null (no peta per desbordament)");
  ok(c.temes && claus(c.temes) === "t1,t2", "temes que no són objectes (número, null, llista) es deixen fora: " + claus(c.temes));
  ok(igual(c.temes && c.temes.t1, { fitxa: false, fc: null, n: 0, max: null, ult: null, d_ult: null, fallades: {} }), "intents no llista, fitxa «si», fc text, fallades llista → buits");
  ok(igual(c.temes && c.temes.t2, { fitxa: false, fc: null, n: 2, max: 70, ult: 65, d_ult: D(0), fallades: { q2: 2 } }),
   "pc no numèric, negatiu, 1e30 o intents que no són objectes no compten (n 2, millor 70, última 65); fallades no numèriques fora: " + JSON.stringify(c.temes && c.temes.t2));
  ok(igual(c.rep, [{ tid: null, q: null, c: null, prox: null }]) && c.rep_n === 1 && c.rep_avui === 0, "rep: les entrades que no són objectes fora; tid objecte, q número, prox «demà» → null");
  ok(igual(c.examens, [{ d: null, pc: 90, real: false }]), "examens: només els que tenen pc numèric; d «x» → null; real «si» → false");
  ok(igual(c.jocs, { a: { n: 2, max: 50, ult: 50 } }) && c.dies === 1 && c.dia_ult === "2026-11-01", "jocs: només llistes i només números; dies: només dates vàlides i diferents");
  for (const x of ["d_text", "e_llista", "f_null", "g_num", "i_sqlnull"])
   ok(m[x] && mateixesClaus(m[x], K_ERR) && m[x].error === true && m[x].assig === x && Number.isInteger(m[x].ts), "estat " + x + " (no és un objecte) → {assig, mod, ts, error: true}: " + JSON.stringify(m[x]));
  ok(m.h_bo && m.h_bo.punts === 5 && !("error" in m.h_bo), "un món bo del mateix nen surt bé (sense «error»)") }

 console.log("7) si el resum d'un món peta igualment, aquell món surt amb error i la fitxa no cau");
 { await db.exec(`create or replace function bn_priv.fitxa_mon(p_assig text, p_estat jsonb, p_mod bigint, p_ts timestamptz) returns jsonb
                  language plpgsql stable set search_path = '' as $$ begin
                    if p_assig = 'h_bo' then raise exception 'peta a propòsit'; end if; return jsonb_build_object('assig', p_assig); end $$`);
  let f = null, err = null;
  try { f = await fitxa("Txell") } catch (e) { err = e.message }
  const h = f && f.mons.find(x => x.assig === "h_bo");
  ok(err === null && h && igual(h, { assig: "h_bo", mod: 1762790000001, ts: h.ts, error: true }) && Number.isInteger(h.ts), "h_bo → {assig, mod, ts, error: true}" + (err ? ": " + err : ""));
  const e = await executa(SQL); ok(e === null, "tornar a executar el SQL ho deixa com estava" + (e ? ": " + e : ""));
  f = await fitxa("Txell");
  ok(f.mons.find(x => x.assig === "h_bo").punts === 5, "h_bo torna a sortir bé") }

 console.log("8) altes: nens nous del període");
 { await log("Olga", "socials", 10, `${T0} - interval '10 days' + interval '23 hours 10 minutes'`);   // primer registre (dia D-9 a Madrid)
  await log("Olga", "socials", 25, `${T0} - interval '9 days' + interval '10 minutes'`);              // un altre dia UTC, però el mateix a Madrid
  await log("Olga", "biogeo", 15, `${T0} - interval '8 days' + interval '12 hours'`);
  await log("Olga", "catala", 60, `${T0} - interval '4 days' + interval '12 hours'`, true, "temps", "s");
  await log("Olga", "socials", 20, `${T0} - interval '3 days' + interval '23 hours 50 minutes'`);    // 40 min després dels 7 primers dies
  await log("Olga", "socials", 22, `${T0} - interval '1 day' + interval '12 hours'`);
  await log("Rut", "socials", 80, "now() - interval '150 days'"); await log("Rut", "biogeo", 5, "now() - interval '1 day'");   // jugava sense PIN; el perfil és d'avui
  await log("Sara", "socials", 12, "now() - interval '3 days'"); await log("Sara", "socials", 18); await crea("Sara");          // fa 3 dies sense PIN, el crea avui
  await log("Quim", "socials", 100, "now() - interval '200 days'"); await log("Quim", "socials", 110);
  await log("caca", "socials", 30);   // nom prohibit (entrat d'abans del filtre)
  await q("update bn_priv.perfils set creat = now() where k = 'merda'");
  const a30 = await altes("30d"), per = Object.fromEntries(a30.map(x => [x.k, x]));
  ok(Array.isArray(a30) && a30.every(x => mateixesClaus(x, K_ALTA)), "claus de cada alta: " + claus(a30[0]));
  ok(Object.keys(per).sort().join() === "gina,nova,olga,pau,sara,txell", "30 dies: Gina, Nova, Olga, Pau, Sara i Txell: " + Object.keys(per).sort());
  ok(!per.avi && !per.vella && !per.quim, "fora: els perfils vells sense creat (Avi, amb el primer registre fa 60 dies; Vella, sense registre) i en Quim (fa 200 dies)");
  ok(!per.rut, "fora: la Rut jugava sense PIN des de fa 150 dies i ha creat el perfil avui (alta = el primer registre, no la data del perfil)");
  ok(!per.biel, "fora: en Biel (PIN tret, sense registre: no hi ha cap data d'alta)");
  ok(!per.merda && !per.caca, "fora: els noms prohibits (un perfil i un registre)");
  ok(a30.every((x, i) => i === 0 || a30[i - 1].alta >= x.alta) && a30.slice(-3).map(x => x.k).join() === "gina,sara,olga", "ordenat per alta, del més nou al més vell: " + a30.map(x => x.k));
  const o = per.olga || {}, olgaPrimer = new Date(await val(`select ${T0} - interval '10 days' + interval '23 hours 10 minutes'`)).getTime();
  ok(o.te_pin === false && o.id === null && o.creat === null && o.primer === olgaPrimer && o.alta === olgaPrimer, "sense perfil: alta = primer registre (ms), te_pin false, id i creat null");
  ok(o.mons === 2 && o.punts === 40, "mons amb estrelles 2 i punts 40 (màxim de cada món: 25 + 15): " + [o.mons, o.punts]);
  ok(o.dies7 === 3, "dies7 = 3: dos registres del mateix dia de Madrid (dies UTC diferents) compten 1 i el de 40 min després dels 7 dies no compta: " + o.dies7);
  const n = per.nova || {};
  ok(n.te_pin === true && n.primer === null && n.dies7 === 0 && n.mons === 0 && n.punts === 0, "perfil sense cap registre: hi surt amb primer null («encara no ha jugat»)");
  ok(n.alta === n.creat && Math.abs(n.creat - Date.now()) < 120000 && n.id === (await val("select id::int from bn_priv.perfils where k = 'nova'")) && Number.isInteger(n.pin_ts) && Number.isInteger(n.aspecte_ts),
   "alta = creat (ms), amb id, pin_ts i aspecte_ts");
  const s = per.sara || {}, saraPrimer = new Date(await val("select min(ts) from public.bn_log where nom = 'Sara'")).getTime();
  ok(s.te_pin === true && s.primer === saraPrimer && s.alta === s.primer && s.creat > s.alta && Math.abs(s.creat - Date.now()) < 120000,
   "Sara (registre de fa 3 dies, perfil d'avui): alta = el primer registre, que és anterior a creat (least)");
  ok(s.dies7 === 2 && s.punts === 18 && s.mons === 1, "Sara: dies7 compta des del primer registre (fa 3 dies i avui): " + [s.dies7, s.punts, s.mons]);
  const pau = per.pau || {};
  ok(pau.alta === pau.creat && pau.primer > pau.creat, "Pau (perfil i després el registre): alta = creat, que és anterior al primer registre");
  ok(pau.dies7 === 1 && pau.punts === 57, "Pau: un registre des de l'alta (dies7 1) i 57 ⭐");
  ok(per.gina && per.gina.amagat === true && per.gina.te_pin === false && per.gina.punts === 62 && per.nova.amagat === false, "amagat: true només per a la Gina; els registres «Gina» i «GINA » són el mateix nen");
  const a7 = (await altes("7d")).map(x => x.k).sort().join(), av = (await altes("avui")).map(x => x.k).sort().join();
  ok(a7 === "gina,nova,pau,sara,txell", "7 dies: sense l'Olga (fa 10 dies) ni la Rut (registre de fa 150 dies i perfil creat avui): " + a7);
  ok(av === "nova,pau,txell", "avui (dia de Madrid): sense la Gina (ahir) ni la Sara (fa 3 dies, encara que el perfil sigui d'avui): " + av);
  ok(igual(await val("select public.bn_admin_altes($1, $2) r", ADM), a30), "per defecte, 30 dies");
  await db.exec("set enable_seqscan = off");   // amb tan poques files el planificador triaria llegir la taula sencera
  const pla = JSON.stringify(await q("explain select 1 from public.bn_log l where lower(trim(l.nom)) = 'olga'"));
  await db.exec("set enable_seqscan = on");
  ok(/bn_log_nom/.test(pla), "el filtre per nen (lower(trim(nom)) = k) pot fer servir l'índex bn_log_nom") }

 console.log("9) permisos");
 { const fn = ["public.bn_admin_fitxa(text,text,text)", "public.bn_admin_altes(text,text,text)"];
  const ajudes = ["bn_priv.fitxa_ms(timestamptz)", "bn_priv.fitxa_num(jsonb)", "bn_priv.fitxa_nms(jsonb)", "bn_priv.fitxa_dia(jsonb)", "bn_priv.fitxa_txt(jsonb)",
                  "bn_priv.fitxa_obj(jsonb)", "bn_priv.fitxa_avui()", "bn_priv.fitxa_mon(text,jsonb,bigint,timestamptz)"];
  // PUBLIC (grantee 0) pot executar? Sense proacl (null) valen els permisos per defecte, que sí que l'hi donen
  const pubX = f => val(`select coalesce(bool_or(a.grantee = 0 and a.privilege_type = 'EXECUTE'), false)
                         from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a where p.oid = $1::regprocedure`, [f]);
  for (const f of fn) {
   ok((await val("select has_function_privilege('anon', $1, 'execute') and has_function_privilege('authenticated', $1, 'execute')", [f])) === true, f + ": anon i authenticated la poden cridar");
   ok((await pubX(f)) === false, f + ": PUBLIC no hi té permís");
   const p = (await q("select prosecdef, proconfig from pg_proc where oid = $1::regprocedure", [f]))[0];
   ok(p.prosecdef === true && igual(p.proconfig, ['search_path=""']), f + ": security definer i search_path = ''") }
  const ningu = await val(`select bool_or(has_function_privilege(r, f, 'execute')) from unnest(array['anon', 'authenticated']) r, unnest($1::text[]) f`, [ajudes]);
  ok(ningu === false, "cap ajuda bn_priv.fitxa_* no la poden executar anon ni authenticated");
  let pub = ""; for (const f of ajudes) pub += (await pubX(f)) ? f + " " : "";
  ok(pub === "", "cap ajuda bn_priv.fitxa_* té permís per a PUBLIC " + pub);
  await db.exec("set role anon");
  const f = await fitxa("Pau"), al = await altes("30d");
  ok(f && f.mons.length === 2 && Array.isArray(al) && al.length === 6, "anon amb el correu i la contrasenya de l'admin: la fitxa i les altes funcionen");
  ok(/acces denegat/.test(await falla("select public.bn_admin_fitxa($1, $2, $3)", [...DOLENTA, "Pau"]) || ""), "anon amb la contrasenya dolenta → acces denegat");
  ok((await falla("select bn_priv.fitxa_mon('x', '{}'::jsonb, 1, now())")) !== null && (await falla("select bn_priv.fitxa_num('1'::jsonb)")) !== null, "anon: no pot cridar les ajudes internes");
  ok((await falla("select * from bn_priv.progres limit 1")) !== null && (await falla("select * from bn_priv.perfils limit 1")) !== null, "anon: no pot llegir bn_priv.progres ni bn_priv.perfils");
  await db.exec("reset role") }
 await db.close();

 console.log("10) perfils.ts: si existeix (de data), es copia a creat; si és d'un altre tipus, no es toca res");
 { const db2 = await base(", ts timestamptz");
  const q2 = async (sql, p) => (await db2.query(sql, p || [])).rows;
  await q2("insert into bn_priv.perfils(k, nom, pin, ts) values ('a1', 'A1', 'x', now() - interval '20 days'), ('a2', 'A2', 'x', null)");
  let e = null; try { await db2.exec(SQL) } catch (x) { e = x.message }
  ok(e === null, "amb una columna ts timestamptz: el SQL s'executa sense errors" + (e ? ": " + e : ""));
  let rs = await q2("select k, creat = ts igual, creat from bn_priv.perfils order by k");
  ok(rs[0].igual === true && rs[1].creat === null, "a1: creat = ts; a2 (ts null): creat buit");
  const abans = JSON.stringify(await q2("select k, creat from bn_priv.perfils order by k"));
  try { await db2.exec(SQL) } catch (x) { e = x.message }
  ok(e === null && JSON.stringify(await q2("select k, creat from bn_priv.perfils order by k")) === abans, "segona execució: sense errors i cap creat canviat");
  await q2("select public.bn_perfil_crea($1, $2)", ["Nou", PIN]);
  const cn = (await q2("select creat from bn_priv.perfils where k = 'nou'"))[0].creat;
  ok(cn && Math.abs(new Date(cn).getTime() - Date.now()) < 60000, "un perfil nou té creat = ara");
  const al = (await q2("select public.bn_admin_altes($1, $2, '30d') r", ADM))[0].r.map(x => x.k).sort().join();
  ok(al === "a1,nou", "altes de 30 dies: a1 (alta = el seu ts, sense registre) i el nou; a2 no (sense data): " + al);
  await db2.close();
  const db3 = await base(", ts bigint");
  await db3.query("insert into bn_priv.perfils(k, nom, pin, ts) values ('b1', 'B1', 'x', 1700000000000)");
  e = null; try { await db3.exec(SQL) } catch (x) { e = x.message }
  ok(e === null && (await db3.query("select creat from bn_priv.perfils where k = 'b1'")).rows[0].creat === null, "amb una columna ts bigint: no peta i creat queda buit" + (e ? ": " + e : ""));
  await db3.close() }

 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : `\n✓ Tot correcte (${((REAL() - t0) / 1000).toFixed(1)} s)`);
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
