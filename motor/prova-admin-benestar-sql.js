#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL del Benestar (supabase/bn_admin_benestar.sql) dins d'un Postgres de prova (PGlite).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-benestar-sql.js
// No toca Supabase ni la xarxa: munta una base mínima amb els fitxers REALS del repo (bn_log.sql, bn_ranking_net.sql, bn_pin_nou.sql,
// bn_admin_tauler.sql, bn_ranking_mons.sql i, a mitja prova, bn_xat.sql) i taules simulades per a bn_priv.perfils, intents i progres.
// Rellotge: la prova el fixa (i el deixa córrer) a dimecres 18 de novembre de 2026 a les 12:00 de Madrid, perquè els dies de la
//   setmana (cap de setmana +30 min) i les vigílies no depenguin del dia que s'executa. Els registres es posen en hora de Madrid.
// Casos: 1) el SQL dues vegades · 2) contrasenya dolenta · 3) forma de la resposta i ordre · 4) marató (bloc, dia, pausa de 5 min,
//        +30 en cap de setmana, període en dies sencers) · 5) vigília per pic i marató en blau · 6) nit · 7) pressa · 8) repetir
//        9) frustració · 10) enganxa · 11) inactiu · 12) poc i sovint · 13) aprèn dels errors · 14) dos aparells · 15) semàfor
//        16) dades brutes sense petar · 17) xat: absent (sense bn_xat.sql) i present · 18) pic del grup (5 nens, la meitat, el triple,
//        fora dels dies 3-12, sense mediana) · 19) data d'examen: desar, canviar, esborrar, mana sobre el pic, contrasenya dolenta
//        20) filtre per nen, període 'avui' i per defecte · 21) tornar a executar el SQL conserva les dates · 22) permisos.
// Cal PGlite:  npm install --no-save @electric-sql/pglite@0.5   (l'Action «Revisa Bona Nota» ja l'instal·la)
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite (el Postgres de prova). Instal·la'l des de l'arrel del repo:\n    npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }
const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
const SQL = fitxer("supabase/bn_admin_benestar.sql");
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
// comparació sense dependre de l'ordre de les claus (jsonb les reordena)
const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const igual = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const claus = o => o && typeof o === "object" ? Object.keys(o).sort().join(",") : String(o);
const mateixesClaus = (o, llista) => claus(o) === [...llista].sort().join(",");
const ADM = ["admin@prova.cat", "contrasenya-de-prova"], DOLENTA = [ADM[0], "dolenta"];
const K_TOP = ["periode", "mons", "nens"], K_MON = ["assig", "dia0", "examen", "vigilies", "normal"];
const K_NEN = ["k", "nom", "semafor", "senyals"], K_SEN = ["codi", "nivell", "dia", "assig", "valor", "llindar"];
const CODIS = ["marato_bloc", "marato_dia", "nit", "pressa", "repetir", "frustracio_suspesos", "frustracio_costa", "enganxa", "xat",
               "inactiu", "poc_sovint", "apren_errors", "fa_descans", "salta_descans", "examen_dema", "dos_aparells"];
const NIVELLS = ["vermell", "groc", "blau", "context", "bo"], SEMAFORS = ["vermell", "groc", "verd"];
const EXTRA = { pressa: ["encert"], xat: ["minuts"] };   // claus de més d'alguns senyals
const clausSenyal = s => mateixesClaus(s, [...K_SEN, ...(EXTRA[s.codi] || [])]);

// ---------- rellotge: dimecres 18-11-2026 12:00 a Madrid (11:00 UTC); PGlite fa servir Date.now per a now() ----------
const REAL = Date.now.bind(Date), DESPL = Date.UTC(2026, 10, 18, 11, 0, 0) - REAL();
Date.now = () => REAL() + DESPL;
// hores «de paret» de Madrid com a text 'AAAA-MM-DD HH:MM' (al novembre no hi ha canvi d'hora)
const L = s => Date.parse(s.replace(" ", "T") + ":00Z");
const F = ms => new Date(ms).toISOString().slice(0, 16).replace("T", " ");
const mes = (s, min) => F(L(s) + min * 60000);
const dia = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);

async function base() {
 const db = await PGlite.create({ extensions: { pgcrypto } });
 await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
 await db.exec(fitxer("supabase/bn_log.sql"));
 await db.exec(`create table bn_priv.perfils(k text primary key, nom text not null, pin text not null, pin_v smallint not null default 1,
                  pin_ts timestamptz, id bigint generated always as identity unique, aspecte jsonb, aspecte_ts timestamptz);
                create table bn_priv.intents(k text primary key, n int not null default 0, ts timestamptz not null default now());
                create table bn_priv.progres(k text not null, assig text not null, estat jsonb, mod bigint, ts timestamptz, primary key (k, assig));
                revoke all on bn_priv.perfils, bn_priv.intents, bn_priv.progres from public, anon, authenticated;`);
 for (const f of ["supabase/bn_ranking_net.sql", "supabase/bn_pin_nou.sql", "supabase/bn_admin_tauler.sql", "supabase/bn_ranking_mons.sql"]) await db.exec(fitxer(f));
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
 const benestar = (periode = "7d", nom = null, cred = ADM) => val("select public.bn_admin_benestar($1, $2, $3, $4) r", [...cred, periode, nom]);
 const examen = (assig, data, cred = ADM) => val("select public.bn_admin_examen_desa($1, $2, $3, $4::date) r", [...cred, assig, data]);
 // registres (sense el trigger de bn_log_net, per poder muntar l'historial): es guarden i es desen tots de cop
 const pendents = [];
 const ev = (nom, assig, event, hora, detall = {}, aparell = "a") => pendents.push([nom, assig, event, hora, JSON.stringify(detall), aparell]);
 const tmp = (nom, assig, fi, min, aparell = "a") => ev(nom, assig, "temps", fi, { s: Math.round(min * 60) }, aparell);   // un tram que acaba a «fi»
 const bloc = (nom, assig, ini, trams, pausa = 0, aparell = "a") => { let t = ini; for (const m of trams) { const fi = mes(t, m); tmp(nom, assig, fi, m, aparell); t = mes(fi, pausa) } };
 const desa = async () => {
  await db.exec("set session_replication_role = replica");
  for (const r of pendents) await db.query(`insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall)
                                             values ($4::timestamp at time zone 'Europe/Madrid', $2, $1, 's', $6, $3, $5::jsonb)`, r);
  pendents.length = 0;
  await db.exec("set session_replication_role = origin") };
 const resp = (n, bones, seg) => Array.from({ length: n }, (_, i) => `t1/${i + 1}:${i < bones ? 1 : 0}:${seg}:a`);
 const nen = (b, k) => b.nens.find(n => n.k === k);
 const sen = (b, k, codi) => ((nen(b, k) || { senyals: [] }).senyals).filter(s => !codi || s.codi === codi);
 const codis = (b, k) => sen(b, k).map(s => s.codi).sort().join(",");
 const mon = (b, a) => b.mons.find(m => m.assig === a);
 const S = (codi, nivell, dia, assig, valor, llindar) => ({ codi, nivell, dia, assig, valor, llindar });

 console.log("0) rellotge de la prova: " + new Date(Date.now()).toISOString());
 ok(Math.abs(new Date(await val("select now()")).getTime() - Date.now()) < 5000, "PGlite fa servir aquest rellotge per a now()");
 ok(/^2026-11-18 12:0\d 3$/.test(await val("select to_char(now() at time zone 'Europe/Madrid', 'YYYY-MM-DD HH24:MI ID')")), "a Madrid és dimecres (ID 3) 18-11-2026 a les 12:00");

 console.log("1) bn_admin_benestar.sql dues vegades");
 { let e = await executa(SQL); ok(e === null, "primera execució sense errors" + (e ? ": " + e : ""));
  e = await executa(SQL); ok(e === null, "segona execució sense errors" + (e ? ": " + e : ""));
  ok((await val("select count(*)::int from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.proname in ('bn_admin_benestar', 'bn_admin_examen_desa')")) === 2,
   "hi ha bn_admin_benestar i bn_admin_examen_desa (una de cada, sense duplicats)");
  ok((await val("select to_regclass('bn_priv.examens') is not null")) === true && (await val("select to_regclass('public.bn_log_assig_ts') is not null")) === true,
   "existeixen la taula bn_priv.examens i l'índex bn_log_assig_ts") }

 console.log("2) contrasenya dolenta");
 { ok(/acces denegat/.test(await falla("select public.bn_admin_benestar($1, $2)", DOLENTA) || ""), "bn_admin_benestar amb la contrasenya dolenta → acces denegat");
  ok(/acces denegat/.test(await falla("select public.bn_admin_examen_desa($1, $2, 'comarques', '2026-11-20')", DOLENTA) || ""), "bn_admin_examen_desa amb la contrasenya dolenta → acces denegat");
  ok((await val("select count(*)::int from bn_priv.examens")) === 0, "i no ha desat cap data") }

 // ---------- dades: mons amb el dia 0 lluny (cap pic possible) per als senyals de cada nen ----------
 ev("Arrel", "biogeo", "entra", "2026-09-20 10:00"); ev("Arrel", "catala", "entra", "2026-09-20 10:00");
 // comarques neix el dilluns 9-11; un dia normal, l'Ona sola, 15 min; dimarts 17-11 (dia 8) 5 nens i 290 min: vigília pel pic
 for (let n = 0; n < 8; n++) tmp("Ona", "comarques", `${dia("2026-11-09", n)} 18:15`, 15);
 bloc("Vigi", "comarques", "2026-11-17 16:00", [26, 26, 26, 26, 26]);        // 130 min seguits la vigília → blau
 bloc("Vigi2", "comarques", "2026-11-17 16:00", [25, 25, 25, 25]);           // 100 min seguits la vigília → res (llindar 120)
 for (const p of ["P1", "P2", "P3"]) tmp(p, "comarques", "2026-11-17 17:20", 20);
 ev("NitVigi", "comarques", "entra", "2026-11-17 21:45");                    // vigília: la nit comença a les 22:00
 ev("NitVigi2", "comarques", "entra", "2026-11-17 22:05");
 bloc("NoVigi", "biogeo", "2026-11-17 16:00", [26, 26, 26, 26, 26]);          // el mateix dia, però biogeo no és a la vigília → vermell
 ev("NitBio", "biogeo", "entra", "2026-11-17 21:45");
 // marató (dijous 12-11, biogeo)
 tmp("Bloc", "biogeo", "2026-11-12 10:25", 25); tmp("BLOC ", "biogeo", "2026-11-12 10:50", 25); tmp(" bloc", "biogeo", "2026-11-12 11:15", 25);
 bloc("Gap4", "biogeo", "2026-11-12 10:00", [40, 40], 4);                    // 4 min de pausa: el mateix bloc (80)
 bloc("Pausa", "biogeo", "2026-11-12 10:00", [40, 40], 5);                   // 5 min de pausa: dos blocs de 40 (i 80 al dia)
 for (const h of ["09:00", "11:00", "16:00"]) bloc("Dia", "biogeo", `2026-11-12 ${h}`, [35]);   // 105 al dia
 bloc("Dia85", "biogeo", "2026-11-12 09:00", [30]); bloc("Dia85", "biogeo", "2026-11-12 11:00", [30]); bloc("Dia85", "biogeo", "2026-11-12 16:00", [25]);
 bloc("Exacte", "biogeo", "2026-11-12 09:00", [30, 30]); bloc("Exacte", "biogeo", "2026-11-12 15:00", [30]);   // 60 seguits i 90 al dia: no passen
 bloc("Dissabte", "biogeo", "2026-11-14 10:00", [40, 40]); bloc("Dissabte", "biogeo", "2026-11-14 16:00", [35]); // 80 i 115: dissabte no passen
 bloc("Diumenge", "biogeo", "2026-11-15 10:00", [45, 50]);                   // 95 seguits en diumenge → passa (llindar 90)
 bloc("DiumengeDia", "biogeo", "2026-11-15 09:00", [50]); bloc("DiumengeDia", "biogeo", "2026-11-15 12:00", [50]); bloc("DiumengeDia", "biogeo", "2026-11-15 17:00", [25]);
 bloc("Limit", "biogeo", "2026-11-11 08:00", [25, 25, 25]);                  // dimecres 11 a les 8: dins dels 7 dies (dies sencers)
 bloc("Fora", "biogeo", "2026-11-10 08:00", [25, 25, 25]);                   // dimarts 10: fora dels 7 dies
 // nit (catala)
 ev("Nit1", "catala", "entra", "2026-11-12 21:45");
 ev("Nit2", "catala", "entra", "2026-11-12 22:10"); ev("Nit2", "catala", "entra", "2026-11-13 00:30"); ev("Nit2", "catala", "entra", "2026-11-14 23:00");
 ev("Nit2130", "catala", "entra", "2026-11-12 21:30");
 ev("Tarda", "catala", "entra", "2026-11-12 21:29", { h: 23 }); ev("Tarda", "catala", "entra", "2026-11-13 06:00");
 ev("Matinada", "catala", "entra", "2026-11-13 02:00");
 // pressa (catala, divendres 13-11)
 const test = (nom, assig, hora, d) => ev(nom, assig, "test", hora, Object.assign({ tema: "c1", mode: "tema", pc: 33 }, d));
 test("Pressa", "catala", "2026-11-13 10:00", { q: resp(12, 4, 2) });
 test("Rapid9", "catala", "2026-11-13 10:00", { q: resp(9, 0, 2) });
 test("RapidBe", "catala", "2026-11-13 10:00", { q: resp(12, 9, 2) });
 test("Lent", "catala", "2026-11-13 10:00", { q: resp(12, 2, 5) });
 test("Pressa50", "catala", "2026-11-13 10:00", { q: resp(12, 6, 2) });
 test("Pressa3", "catala", "2026-11-13 10:00", { q: resp(12, 0, 3) });
 test("PressaArr", "catala", "2026-11-13 10:00", { q: resp(12, 5, 1) });        // 5 de 12 = 41,7 % → 42
 test("PressaDos", "catala", "2026-11-13 10:00", { q: resp(6, 0, 1) }); test("PressaDos", "biogeo", "2026-11-13 11:00", { q: resp(6, 0, 1) });
 ev("Real", "catala", "examen", "2026-11-13 10:00", { pc: 0, mode: "real", q: Array.from({ length: 12 }, (_, i) => `x${i}:0:-:a`) });
 // repetir sense aprendre (biogeo, divendres 13-11)
 const tb = (nom, hora, d) => ev(nom, "biogeo", "test", hora, Object.assign({ tema: "b1", mode: "tema", pc: 80, est: 0 }, d));
 for (const h of ["10:00", "10:10", "10:20", "10:30"]) tb("Repetir", `2026-11-13 ${h}`);
 for (const h of ["10:00", "10:10", "10:20"]) tb("Repetir3", `2026-11-13 ${h}`); tb("Repetir3", "2026-11-13 10:30", { est: 2 });
 tb("RepetirDies", "2026-11-13 10:00"); tb("RepetirDies", "2026-11-13 10:10"); tb("RepetirDies", "2026-11-14 10:00"); tb("RepetirDies", "2026-11-14 10:10");
 for (const h of ["10:00", "10:10", "10:20", "10:30"]) tb("RepetirMode", `2026-11-13 ${h}`, { mode: "sorpresa" });
 for (const h of ["10:00", "10:10", "10:20", "10:30"]) ev("RepetirSenseMode", "biogeo", "test", `2026-11-13 ${h}`, { tema: "b1", pc: 80, est: 0 });
 // frustració (biogeo)
 const ts2 = (nom, hora, pc, tema = "b2") => ev(nom, "biogeo", "test", hora, { tema, mode: "tema", pc, est: 1 });
 ts2("Suspes", "2026-11-13 10:00", 50); ts2("Suspes", "2026-11-13 11:00", 60); ts2("Suspes", "2026-11-14 10:00", 65);
 ts2("Suspes2", "2026-11-13 10:00", 50); ts2("Suspes2", "2026-11-13 11:00", 60); ts2("Suspes2", "2026-11-13 12:00", 80); ts2("Suspes2", "2026-11-14 10:00", 65);
 ts2("SuspesAltres", "2026-11-13 10:00", 50); ts2("SuspesAltres", "2026-11-13 11:00", 60, "b3"); ts2("SuspesAltres", "2026-11-13 12:00", 65);
 ev("Costa", "biogeo", "valora", "2026-11-13 10:00", { tema: "b1", v: "Costa" }); ev("Costa", "biogeo", "valora", "2026-11-14 10:00", { tema: "b2", v: "Costa" });
 ev("Costa1", "biogeo", "valora", "2026-11-13 10:00", { tema: "b1", v: "Costa" }); ev("Costa1", "biogeo", "valora", "2026-11-14 10:00", { tema: "b2", v: "Bé" });
 ev("CostaDos", "biogeo", "valora", "2026-11-13 10:00", { tema: "b1", v: "Costa" }); ev("CostaDos", "catala", "valora", "2026-11-14 10:00", { tema: "c1", v: "Costa" });
 // enganxa (biogeo)
 ev("Enganxa", "biogeo", "oberta", "2026-11-13 10:00", { n: 0, tema: "b1", pc: 50, enganxat: 2 });
 ev("NoEnganxa", "biogeo", "oberta", "2026-11-13 10:00", { n: 0, tema: "b1", pc: 70 }); ev("NoEnganxa", "biogeo", "oberta", "2026-11-13 11:00", { n: 1, pc: 70, enganxat: 0 });
 // inactiu (biogeo)
 ev("Absent", "biogeo", "entra", "2026-11-13 10:00");
 ev("Absent12", "biogeo", "entra", "2026-11-06 10:00");
 ev("Recent", "biogeo", "entra", "2026-11-16 10:00");
 ev("Fantasma", "biogeo", "entra", "2026-10-01 10:00");
 // poc i sovint (catala; setmana = del 12 al 18)
 for (const d of ["2026-11-13", "2026-11-15", "2026-11-17"]) tmp("Sovint", "catala", `${d} 17:20`, 20);
 tmp("Poc2", "catala", "2026-11-13 17:20", 20); tmp("Poc2", "catala", "2026-11-15 17:20", 20); bloc("Poc2", "catala", "2026-11-17 17:00", [25, 25]);
 tmp("SovintLimits", "catala", "2026-11-12 17:20", 10); tmp("SovintLimits", "catala", "2026-11-14 17:40", 40); tmp("SovintLimits", "catala", "2026-11-16 17:30", 25);
 tmp("SovintFora", "catala", "2026-11-12 17:20", 9); tmp("SovintFora", "catala", "2026-11-14 17:41", 41); tmp("SovintFora", "catala", "2026-11-16 17:20", 20); tmp("SovintFora", "catala", "2026-11-17 17:20", 20);
 for (const d of ["2026-11-11", "2026-11-13", "2026-11-15"]) tmp("SovintVell", "catala", `${d} 17:20`, 20);
 // aprèn dels errors (catala; aquesta setmana = del 12 al 18; l'anterior = del 5 a l'11)
 const rep = (nom, hora, apr) => ev(nom, "catala", "joc", hora, { joc: "repas", pc: 80, apr });
 rep("Apren", "2026-11-16 10:00", 3); rep("Apren", "2026-11-17 10:00", 2); rep("Apren", "2026-11-08 10:00", 2);
 rep("NoApren", "2026-11-16 10:00", 2); rep("NoApren", "2026-11-09 10:00", 3);
 rep("AprenIgual", "2026-11-16 10:00", 2); rep("AprenIgual", "2026-11-09 10:00", 2);
 rep("AprenNou", "2026-11-17 10:00", 1);
 rep("AprenLimit", "2026-11-12 10:00", 4); rep("AprenLimit", "2026-11-11 10:00", 3);
 rep("AprenVell", "2026-11-04 10:00", 5); rep("AprenVell", "2026-11-16 10:00", 1);
 // dos aparells (catala, dimarts 17-11)
 tmp("Dos", "catala", "2026-11-17 10:30", 30, "a"); tmp("Dos", "catala", "2026-11-17 10:45", 30, "b");
 tmp("DosSeq", "catala", "2026-11-17 10:30", 30, "a"); tmp("DosSeq", "catala", "2026-11-17 11:01", 30, "b");
 tmp("DosMateix", "catala", "2026-11-17 10:30", 30, "a"); tmp("DosMateix", "catala", "2026-11-17 10:45", 30, "a");
 // dades brutes: res d'això ha de fer petar la funció ni comptar
 for (const s of ["abc", -5, 99999999, "12a", null, 1e30, "", true]) ev("Brut", "catala", "temps", "2026-11-17 12:00", { s });
 ev("Brut", "catala", "test", "2026-11-17 12:10", { tema: "c1", pc: "x", est: "zero", q: "no" }); ev("Brut", "catala", "test", "2026-11-17 12:11", { tema: { a: 1 }, pc: [1] });
 ev("Brut", "catala", "oberta", "2026-11-17 12:20", { enganxat: "molts" }); ev("Brut", "catala", "joc", "2026-11-17 12:30", { joc: "repas", apr: "x" });
 ev("Brut", "catala", "valora", "2026-11-17 12:40", { v: 5 }); ev("Brut", "catala", "entra", "2026-11-17 12:50", { h: "nit" });
 // el xat: els seus nens ja estudien (o no); els missatges es posen quan hi hagi bn_xat.sql
 tmp("Xatejador", "catala", "2026-11-16 17:30", 30);
 for (const d of ["2026-11-14", "2026-11-15", "2026-11-16"]) tmp("XatEstudia", "catala", `${d} 17:30`, 30);
 tmp("XatGairebe", "catala", "2026-11-15 17:30", 30); tmp("XatGairebe", "catala", "2026-11-16 17:30", 29);   // 59 min: encara surt
 ev("Xat9", "catala", "entra", "2026-11-17 10:00"); ev("XatVell", "catala", "entra", "2026-11-17 10:00"); ev("XatEsborrat", "catala", "entra", "2026-11-17 10:00");
 ev("Avui", "catala", "entra", "2026-11-18 10:00");
 await desa();

 const b = await benestar("7d");
 console.log("3) forma de la resposta i ordre");
 { ok(mateixesClaus(b, K_TOP) && b.periode === "7d", "claus de la resposta: " + claus(b) + " · periode " + b.periode);
  ok(Array.isArray(b.mons) && b.mons.every(m => mateixesClaus(m, K_MON)), "claus de cada món: " + claus(b.mons[0]));
  ok(b.mons.map(m => m.assig).join() === "biogeo,catala,comarques", "mons: els que tenen activitat al període, per assig: " + b.mons.map(m => m.assig));
  ok(Array.isArray(b.nens) && b.nens.every(n => mateixesClaus(n, K_NEN) && SEMAFORS.includes(n.semafor) && Array.isArray(n.senyals)), "claus de cada nen i semàfor vermell/groc/verd");
  const tots = b.nens.flatMap(n => n.senyals);
  ok(tots.length > 0 && tots.every(clausSenyal), "claus de cada senyal: " + claus(tots[0]) + " (i «encert» de més a pressa)");
  ok(tots.filter(s => s.codi === "pressa").every(s => Number.isInteger(s.encert) && s.encert >= 0 && s.encert <= 100), "pressa: encert enter de 0 a 100");
  ok(tots.every(s => CODIS.includes(s.codi) && NIVELLS.includes(s.nivell) && /^\d{4}-\d{2}-\d{2}$/.test(s.dia) && typeof s.valor === "number" && typeof s.llindar === "number"
                && (s.assig === null || typeof s.assig === "string")), "cada senyal: codi i nivell coneguts, dia AAAA-MM-DD, valor i llindar numèrics");
  const r = s => SEMAFORS.indexOf(s), rn = s => NIVELLS.indexOf(s.nivell);
  ok(b.nens.every((n, i) => i === 0 || r(b.nens[i - 1].semafor) <= r(n.semafor)), "els nens van de pitjor a millor: " + b.nens.map(n => n.semafor[0]).join(""));
  ok(b.nens.every(n => n.senyals.every((s, i) => i === 0 || rn(n.senyals[i - 1]) <= rn(s))), "els senyals de cada nen van de pitjor a millor (vermell, groc, blau, context, bo)");
  ok(b.nens.every(n => n.semafor === (n.senyals.some(s => s.nivell === "vermell") ? "vermell" : n.senyals.some(s => s.nivell === "groc") ? "groc" : "verd")),
   "semàfor = el pitjor senyal de vigilar (blau, context i bo no compten)");
  ok(new Set(b.nens.map(n => n.k)).size === b.nens.length, "cada nen surt una sola vegada") }

 console.log("4) marató");
 { ok(igual(sen(b, "bloc", "marato_bloc"), [S("marato_bloc", "vermell", "2026-11-12", "biogeo", 75, 60)]), "3 trams seguits de 25 min (amb el nom escrit de 3 maneres) → bloc de 75 > 60: " + JSON.stringify(sen(b, "bloc", "marato_bloc")));
  ok(igual(sen(b, "gap4", "marato_bloc"), [S("marato_bloc", "vermell", "2026-11-12", "biogeo", 80, 60)]), "pausa de 4 min: el mateix bloc (80)");
  ok(sen(b, "pausa").filter(s => s.codi.startsWith("marato")).length === 0, "pausa de 5 min: dos blocs de 40 i 80 al dia → res");
  ok(igual(sen(b, "dia", "marato_dia"), [S("marato_dia", "vermell", "2026-11-12", "biogeo", 105, 90)]) && sen(b, "dia", "marato_bloc").length === 0, "tres blocs de 35 → 105 al dia > 90 (sense bloc llarg)");
  ok(sen(b, "dia85").filter(s => s.codi.startsWith("marato")).length === 0, "85 al dia → res");
  ok(sen(b, "exacte").filter(s => s.codi.startsWith("marato")).length === 0, "60 seguits i 90 al dia exactes → res (ha de passar el llindar)");
  ok(sen(b, "dissabte").filter(s => s.codi.startsWith("marato")).length === 0, "dissabte: bloc de 80 i 115 al dia → res (+30: 90 i 120)");
  ok(igual(sen(b, "diumenge", "marato_bloc"), [S("marato_bloc", "vermell", "2026-11-15", "biogeo", 95, 90)]), "diumenge: bloc de 95 > 90");
  ok(igual(sen(b, "diumengedia", "marato_dia"), [S("marato_dia", "vermell", "2026-11-15", "biogeo", 125, 120)]), "diumenge: 125 al dia > 120");
  ok(sen(b, "bloc").filter(s => s.codi.startsWith("marato")).length === 1, "màxim un senyal de marató per nen i dia");
  ok(sen(b, "limit", "marato_bloc").length === 1, "el període de 7 dies compta en dies sencers: el dimecres 11 a les 8 hi entra");
  ok(sen(b, "fora", "marato_bloc").length === 0 && sen(await benestar("30d"), "fora", "marato_bloc").length === 1, "el dimarts 10 no hi entra (sí als 30 dies)") }

 console.log("5) vigília pel pic del grup i marató en blau");
 { const c = mon(b, "comarques");
  ok(igual(c, { assig: "comarques", dia0: "2026-11-09", examen: null, vigilies: ["2026-11-17"], normal: 15 }), "comarques: dia 0 el 9, vigília el 17 (dia 8: 5 nens, 290 min ≥ 3 × 15) i un dia normal de 15 min: " + JSON.stringify(c));
  ok(igual(sen(b, "vigi"), [S("marato_bloc", "blau", "2026-11-17", "comarques", 130, 120)]) && nen(b, "vigi").semafor === "verd", "130 min seguits la vigília → blau (llindar 120), i el semàfor queda verd");
  ok(sen(b, "vigi2").length === 0, "100 min seguits la vigília → res (un altre dia seria vermell)");
  ok(igual(sen(b, "novigi", "marato_bloc"), [S("marato_bloc", "vermell", "2026-11-17", "biogeo", 130, 60)]), "130 min el mateix dia però a biogeo (no és la seva vigília) → vermell");
  ok(igual(mon(b, "biogeo").vigilies, []) && igual(mon(b, "catala").vigilies, []), "biogeo i catala (dia 0 al setembre) no tenen vigília") }

 console.log("6) nit");
 { ok(igual(sen(b, "nit1", "nit"), [S("nit", "groc", "2026-11-12", "catala", 1305, 1290)]), "una entrada a les 21:45 → groc (valor 1305 = 21:45, llindar 1290 = 21:30)");
  ok(igual(sen(b, "nit2", "nit"), [S("nit", "vermell", "2026-11-14", "catala", 1380, 1290), S("nit", "vermell", "2026-11-12", "catala", 1470, 1290)]),
   "22:10 i 0:30 són la mateixa nit (la del 12; valor de l'última, 0:30 = 1470) i 23:00 del 14 una altra → 2 nits: vermell: " + JSON.stringify(sen(b, "nit2", "nit")));
  ok(igual(sen(b, "nit2130", "nit"), [S("nit", "groc", "2026-11-12", "catala", 1290, 1290)]), "a les 21:30 en punt ja és nit");
  ok(sen(b, "tarda", "nit").length === 0, "21:29 (encara que detall.h digui 23) i les 6:00 → res: mana l'hora del servidor");
  ok(igual(sen(b, "matinada", "nit"), [S("nit", "groc", "2026-11-12", "catala", 1560, 1290)]), "a les 2:00 del 13 → la nit del 12 (valor 1560 = 26:00)");
  ok(sen(b, "nitvigi", "nit").length === 0, "la vigília de comarques, a les 21:45 a comarques → res (la nit comença a les 22:00)");
  ok(igual(sen(b, "nitvigi2", "nit"), [S("nit", "groc", "2026-11-17", "comarques", 1325, 1320)]), "la vigília, a les 22:05 → groc amb llindar 1320 (22:00)");
  ok(igual(sen(b, "nitbio", "nit"), [S("nit", "groc", "2026-11-17", "biogeo", 1305, 1290)]), "el mateix dia a les 21:45 però a biogeo (no és vigília) → groc") }

 console.log("7) pressa");
 { ok(igual(sen(b, "pressa", "pressa"), [Object.assign(S("pressa", "groc", "2026-11-13", "catala", 2, 3), { encert: 33 })]),
   "12 respostes a 2 s i 4 encerts → groc (valor 2 s, llindar 3, encert 33): " + JSON.stringify(sen(b, "pressa", "pressa")));
  ok(igual(sen(b, "pressaarr", "pressa"), [Object.assign(S("pressa", "groc", "2026-11-13", "catala", 1, 3), { encert: 42 })]), "5 de 12 (41,7 %) → encert 42 (arrodonit)");
  for (const [k, per] of [["rapid9", "9 respostes (mínim 10)"], ["rapidbe", "75 % d'encert"], ["lent", "5 s per pregunta"], ["pressa50", "50 % d'encert justos"],
                          ["pressa3", "3 s justos"], ["pressados", "6 + 6 respostes en dos mons (es compta per món)"], ["real", "examen real sense segons"]])
   ok(sen(b, k, "pressa").length === 0, "res amb " + per) }

 console.log("8) repetir sense aprendre");
 { ok(igual(sen(b, "repetir", "repetir"), [S("repetir", "groc", "2026-11-13", "biogeo", 4, 4)]), "4 tests del mateix tema el mateix dia amb est 0 → groc");
  ok(igual(sen(b, "repetirsensemode", "repetir"), [S("repetir", "groc", "2026-11-13", "biogeo", 4, 4)]), "un test sense mode és de tema → també");
  ok(sen(b, "repetir3", "repetir").length === 0, "3 amb est 0 i 1 amb estrelles → res");
  ok(sen(b, "repetirdies", "repetir").length === 0, "2 un dia i 2 l'endemà → res");
  ok(sen(b, "repetirmode", "repetir").length === 0, "4 tests sorpresa (no de tema) → res") }

 console.log("9) frustració");
 { ok(igual(sen(b, "suspes", "frustracio_suspesos"), [S("frustracio_suspesos", "groc", "2026-11-14", "biogeo", 3, 3)]), "50, 60 i 65 seguits del mateix tema → groc (dia de l'últim)");
  ok(sen(b, "suspes2", "frustracio_suspesos").length === 0, "50, 60, 80, 65 → res (la ratxa es trenca)");
  ok(sen(b, "suspesaltres", "frustracio_suspesos").length === 0, "3 suspesos seguits però de dos temes → res");
  ok(igual(sen(b, "costa", "frustracio_costa"), [S("frustracio_costa", "groc", "2026-11-14", "biogeo", 2, 2)]), "2 «Costa» a biogeo → groc");
  ok(sen(b, "costa1", "frustracio_costa").length === 0 && sen(b, "costados", "frustracio_costa").length === 0, "1 «Costa» i 1 «Bé», o un «Costa» a cada món → res") }

 console.log("10) enganxa text");
 { ok(igual(sen(b, "enganxa", "enganxa"), [S("enganxa", "groc", "2026-11-13", "biogeo", 2, 1)]), "una oberta amb 2 intents d'enganxar → groc");
  ok(sen(b, "noenganxa", "enganxa").length === 0, "obertes sense enganxat o amb enganxat 0 → res") }

 console.log("11) deixa de venir");
 { ok(igual(sen(b, "absent"), [S("inactiu", "groc", "2026-11-13", null, 5, 3)]) && nen(b, "absent").semafor === "groc", "l'últim registre fa 5 dies → inactiu groc (valor 5, llindar 3)");
  ok(igual(sen(b, "absent12"), [S("inactiu", "groc", "2026-11-06", null, 12, 3)]), "fa 12 dies (fora del període de 7 dies): també surt, com l'alerta");
  ok(nen(b, "recent") && sen(b, "recent").length === 0, "fa 2 dies → res");
  ok(!nen(b, "fantasma"), "fa més de 30 dies → no surt") }

 console.log("12) poc i sovint");
 { ok(igual(sen(b, "sovint"), [S("poc_sovint", "bo", "2026-11-17", null, 3, 3)]) && nen(b, "sovint").semafor === "verd", "20 min tres dies de la setmana → bo, semàfor verd");
  ok(igual(sen(b, "sovintlimits", "poc_sovint"), [S("poc_sovint", "bo", "2026-11-16", null, 3, 3)]), "10 i 40 min justos compten");
  ok(sen(b, "poc2", "poc_sovint").length === 0, "2 dies de 20 i un de 50 → res");
  ok(sen(b, "sovintfora", "poc_sovint").length === 0, "9 i 41 min no compten → res");
  ok(sen(b, "sovintvell", "poc_sovint").length === 0, "un dels tres dies (l'11) és de fa 7 dies: fora de la setmana → res") }

 console.log("13) aprèn dels errors");
 { ok(igual(sen(b, "apren"), [S("apren_errors", "bo", "2026-11-17", null, 5, 2)]), "5 apresos aquesta setmana > 2 l'anterior → bo");
  ok(igual(sen(b, "aprennou"), [S("apren_errors", "bo", "2026-11-17", null, 1, 0)]), "1 > 0 → bo");
  ok(igual(sen(b, "aprenlimit", "apren_errors"), [S("apren_errors", "bo", "2026-11-12", null, 4, 3)]), "el 12 és d'aquesta setmana i l'11 de l'anterior (4 > 3)");
  ok(igual(sen(b, "aprenvell"), [S("apren_errors", "bo", "2026-11-16", null, 1, 0)]), "el 4 (fa 14 dies) ja no és de la setmana anterior");
  ok(sen(b, "noapren", "apren_errors").length === 0 && sen(b, "aprenigual", "apren_errors").length === 0, "menys o igual que la setmana anterior → res") }

 console.log("14) dos aparells");
 { ok(igual(sen(b, "dos"), [S("dos_aparells", "context", "2026-11-17", null, 2, 2)]) && nen(b, "dos").semafor === "verd", "dos aparells que se solapen → context (semàfor verd), sense marató (60 justos)");
  ok(sen(b, "dosseq", "dos_aparells").length === 0, "dos aparells un darrere l'altre → res");
  ok(sen(b, "dosmateix", "dos_aparells").length === 0, "el mateix aparell → res") }

 console.log("15) semàfor");
 { ok(nen(b, "nit2").semafor === "vermell" && nen(b, "nit1").semafor === "groc" && nen(b, "ona").semafor === "verd" && codis(b, "ona") === "poc_sovint", "vermell, groc i verd (l'Ona: només poc i sovint)");
  ok(nen(b, "avui") && nen(b, "avui").semafor === "verd" && nen(b, "avui").senyals.length === 0 && nen(b, "avui").nom === "Avui", "un nen sense senyals surt en verd amb senyals []");
  ok(nen(b, "bloc").nom.trim().toLowerCase() === "bloc", "el nom és un dels que ha fet servir") }

 console.log("16) dades brutes");
 { ok(nen(b, "brut") && codis(b, "brut") === "", "temps amb s text, negatiu, enorme o buit; pc, est, enganxat i apr que no són números → no peta i no compta: " + codis(b, "brut")) }

 console.log("17) xat");
 { ok((await val("select to_regclass('bn_priv.xat_msg')")) === null && b.nens.every(n => n.senyals.every(s => s.codi !== "xat")), "sense bn_xat.sql no hi ha bn_priv.xat_msg: cap senyal de xat i no peta");
  let e = await executa(fitxer("supabase/bn_xat.sql")); ok(e === null, "s'aplica bn_xat.sql" + (e ? ": " + e : ""));
  const msgs = async (k, nom, n, hora, esb = 0) => { for (let i = 0; i < n; i++) await q(`insert into bn_priv.xat_msg(k, nom, frase, company, ts, esborrat)
       values ($1, $2, 1, 'Bet', ($3::timestamp at time zone 'Europe/Madrid') + make_interval(mins => $4), $5)`, [k, nom, hora, i, i < esb]) };
  await msgs("xatejador", "Xatejador", 10, "2026-11-16 18:00"); await msgs("xatestudia", "XatEstudia", 12, "2026-11-16 18:00");
  await msgs("xat9", "Xat9", 9, "2026-11-17 18:00"); await msgs("xatvell", "XatVell", 15, "2026-11-10 18:00");
  await msgs("xatsol", "XatSol", 10, "2026-11-17 18:00"); await msgs("xatesborrat", "XatEsborrat", 10, "2026-11-17 18:00", 5);
  await msgs("xatgairebe", "XatGairebe", 10, "2026-11-17 18:00");
  const x = await benestar("7d");
  ok(igual(sen(x, "xatejador", "xat"), [Object.assign(S("xat", "groc", "2026-11-16", null, 10, 10), { minuts: 30 })]), "10 frases i 30 min d'estudi en 7 dies → groc (valor 10, llindar 10, minuts 30)");
  ok(igual(sen(x, "xatgairebe", "xat"), [Object.assign(S("xat", "groc", "2026-11-17", null, 10, 10), { minuts: 59 })]), "10 frases i 59 min → encara surt (minuts 59)");
  ok(x.nens.flatMap(n => n.senyals).every(clausSenyal), "claus de cada senyal, amb «minuts» de més al de xat");
  ok(sen(x, "xatestudia", "xat").length === 0, "12 frases però 90 min d'estudi → res");
  ok(nen(x, "xat9") && sen(x, "xat9", "xat").length === 0, "9 frases → res");
  ok(sen(x, "xatvell", "xat").length === 0, "15 frases de fa 8 dies → res");
  ok(nen(x, "xatsol") && nen(x, "xatsol").nom === "XatSol" && igual(sen(x, "xatsol"), [Object.assign(S("xat", "groc", "2026-11-17", null, 10, 10), { minuts: 0 })]), "només xateja (cap registre): surt igualment, amb el nom del xat i minuts 0");
  ok(sen(x, "xatesborrat", "xat").length === 1 && sen(x, "xatesborrat", "xat")[0].minuts === 0, "les frases esborrades per l'admin també compten");
  ok(igual(sen(x, "pressa"), sen(b, "pressa")) && x.nens.length === b.nens.length + 1, "la resta no canvia (un nen més: el que només xateja)") }

 console.log("18) pic del grup");
 { // tots els mons neixen l'1-10 (dia 0); un dia normal, un nen sol 10 min (dies 1-4); la resta de nens només entren el dia 0
  const D0 = "2026-10-01", nens = (a, n) => Array.from({ length: n }, (_, i) => `${a}_${i + 1}`);
  const mon0 = (a, total, dies = [0, 1, 2, 3, 4]) => { const ns = nens(a, total); ns.slice(1).forEach(n => ev(n, a, "entra", `${D0} 09:00`)); for (const d of dies) tmp(ns[0], a, `${dia(D0, d)} 18:10`, 10); return ns };
  const pic = (ns, a, d, n, min) => ns.slice(0, n).forEach(k => tmp(k, a, `${dia(D0, d)} 19:00`, min));
  let ns = mon0("p5", 12); pic(ns, "p5", 6, 5, 10);                       // 5 nens de 12, 50 min ≥ 30 → vigília
  ns = mon0("p4", 12); pic(ns, "p4", 6, 4, 10);                           // 4 nens de 12 (ni 5 ni la meitat) → no
  ns = mon0("meitat", 6, [0, 1, 2, 4]); pic(ns, "meitat", 5, 3, 15);      // 3 de 6 = la meitat → vigília
  ns = mon0("meitatno", 7, [0, 1, 2, 4]); pic(ns, "meitatno", 5, 3, 15);  // 3 de 7 → no
  ns = mon0("triple", 5); pic(ns, "triple", 6, 5, 6);                     // 30 min = 3 × 10 justos → vigília
  ns = mon0("tripleno", 5); pic(ns, "tripleno", 6, 5, 5.8);               // 29 min < 30 → no
  ns = mon0("finestra", 5, [0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15]);
  for (const d of [2, 3, 12, 13]) pic(ns, "finestra", d, 5, 20);         // pics els dies 2, 3, 12 i 13 → només el 3 i el 12
  ev("sensemed_1", "sensemed", "entra", `${D0} 09:00`); pic(nens("sensemed", 5), "sensemed", 5, 5, 20);   // un sol dia amb minuts: sense mediana
  ns = mon0("pica", 12); pic(ns, "pica", 6, 5, 10);
  await desa();
  const c = await benestar("curs"), v = a => (mon(c, a) || {}).vigilies;
  ok(c.periode === "curs" && igual(v("p5"), ["2026-10-07"]), "5 nens amb minuts (de 12) i el triple, el dia 6 → vigília: " + JSON.stringify(v("p5")));
  ok(igual(v("p4"), []), "4 nens de 12 (ni 5 ni la meitat) → no hi ha vigília");
  ok(igual(v("meitat"), ["2026-10-06"]), "3 nens de 6 (la meitat) → vigília");
  ok(igual(v("meitatno"), []), "3 nens de 7 → no");
  ok(igual(v("triple"), ["2026-10-07"]), "30 min = 3 × la mediana (10) justos → vigília");
  ok(igual(v("tripleno"), []), "29 min < 3 × 10 → no");
  ok(igual(v("finestra"), ["2026-10-04", "2026-10-13"]), "pics els dies 2, 3, 12 i 13 → només el 3 i el 12 compten: " + JSON.stringify(v("finestra")));
  ok(igual(v("sensemed"), []) && mon(c, "sensemed").normal === 100, "un sol dia amb minuts: sense mediana no hi ha pic (normal = aquell dia, 100)");
  ok(mon(c, "p5").dia0 === D0 && mon(c, "p5").normal === 10 && mon(c, "finestra").normal === 10 && mon(c, "p5").examen === null, "dia0 i normal (sense comptar les vigílies)");
  ok(!mon(b, "p5"), "amb 7 dies els mons sense activitat al període no surten") }

 console.log("19) dates d'examen");
 { let r = await examen(" PICA ", "2026-10-20");
  ok(igual(r, [{ assig: "pica", data: "2026-10-20" }]), "desar: torna la llista [{assig, data}] (assig en minúscules i sense espais): " + JSON.stringify(r));
  let c = await benestar("curs");
  ok(igual(mon(c, "pica"), Object.assign({}, mon(c, "pica"), { examen: "2026-10-20", vigilies: ["2026-10-19"] })),
   "la data mana: vigília = data − 1 (el 19, dia 18 del món, fora de la finestra) i el pic del dia 6 ja no compta: " + JSON.stringify(mon(c, "pica")));
  ok(mon(c, "pica").normal === 10 && mon(c, "p5").examen === null && igual(mon(c, "p5").vigilies, ["2026-10-07"]), "els altres mons no canvien");
  ok(mon(await benestar("7d"), "pica") && mon(await benestar("7d"), "pica").examen === "2026-10-20", "un món amb data surt a la llista encara que no tingui activitat al període");
  r = await examen("pica", "2026-10-09");
  ok(igual(r, [{ assig: "pica", data: "2026-10-09" }]) && igual(mon(await benestar("curs"), "pica").vigilies, ["2026-10-08"]), "canviar la data: una sola fila i la vigília nova");
  await examen("biogeo", "2026-12-01");
  ok(/acces denegat/.test(await falla("select public.bn_admin_examen_desa($1, $2, 'pica', null)", DOLENTA) || ""), "esborrar amb la contrasenya dolenta → acces denegat");
  ok((await val("select count(*)::int from bn_priv.examens")) === 2, "i no ha esborrat res");
  r = await examen("pica", null);
  ok(igual(r, [{ assig: "biogeo", data: "2026-12-01" }]) && igual(mon(await benestar("curs"), "pica").vigilies, ["2026-10-07"]), "esborrar amb null: torna la resta i el pic torna a comptar");
  ok(/mon no valid/.test(await falla("select public.bn_admin_examen_desa($1, $2, 'Món d''algú', '2026-11-20')", ADM) || "") &&
     /mon no valid/.test(await falla("select public.bn_admin_examen_desa($1, $2, '', '2026-11-20')", ADM) || ""), "un món que no és un id (accents, espais, buit) → error");
  ok(/data no valida/.test(await falla("select public.bn_admin_examen_desa($1, $2, 'pica', '0026-11-20')", ADM) || ""), "una data absurda (any 0026) → error");
  // la data mana també sobre els senyals de cada nen
  await examen("comarques", "2026-11-13");
  let x = await benestar("7d");
  ok(igual(mon(x, "comarques").vigilies, ["2026-11-12"]) && mon(x, "comarques").examen === "2026-11-13", "comarques amb examen el 13: vigília el 12 (el pic del 17 ja no compta)");
  ok(igual(sen(x, "vigi"), [S("marato_bloc", "vermell", "2026-11-17", "comarques", 130, 60)]) && nen(x, "vigi").semafor === "vermell", "els 130 min del 17 ja no són de vigília → vermell");
  ok(igual(sen(x, "vigi2"), [S("marato_bloc", "vermell", "2026-11-17", "comarques", 100, 60)]), "i els 100 min, també");
  ok(igual(sen(x, "nitvigi", "nit"), [S("nit", "groc", "2026-11-17", "comarques", 1305, 1290)]), "i les 21:45 del 17 ja són nit");
  await examen("comarques", "2026-11-18");
  x = await benestar("7d");
  ok(igual(mon(x, "comarques").vigilies, ["2026-11-17"]) && igual(sen(x, "vigi"), [S("marato_bloc", "blau", "2026-11-17", "comarques", 130, 120)]), "examen el 18: vigília el 17 → torna a ser blau");
  await examen("comarques", null); await examen("biogeo", null);
  ok((await val("select count(*)::int from bn_priv.examens")) === 0 && igual(await benestar("7d"), await benestar("7d")), "tot esborrat") }

 console.log("20) filtre per nen, període 'avui' i per defecte");
 { const t = await benestar("7d"), f = await benestar("7d", "  VIGI ");
  ok(f.nens.length === 1 && f.nens[0].k === "vigi" && igual(f.nens[0], nen(t, "vigi")), "un sol nen (lower(trim)): el mateix que a la llista sencera");
  ok(igual(f.mons, t.mons), "els mons (del grup) no depenen del nen triat");
  ok(igual((await benestar("7d", "ningu")).nens, []) && igual((await benestar("7d", "Absent12")).nens.map(n => n.k), ["absent12"]), "un nen que no hi és → []; un d'inactiu fora del període → surt");
  ok(igual(await benestar("7d", ""), t), "nom buit = tots");
  const a = await benestar("avui");
  ok(a.periode === "avui" && nen(a, "avui") && !nen(a, "sovint") && nen(a, "absent") && a.mons.map(m => m.assig).join() === "catala",
   "'avui': els nens d'avui i els inactius; mons: només catala: " + a.mons.map(m => m.assig));
  ok(igual(sen(a, "absent"), sen(t, "absent")), "els inactius surten igual sigui quin sigui el període");
  const per = await val("select public.bn_admin_benestar($1, $2) r", ADM);
  ok(per.periode === "7d" && igual(per, t), "per defecte: 7 dies i tots els nens");
  await db.exec("set enable_seqscan = off");
  const pla = JSON.stringify(await q("explain select min(ts) from public.bn_log where assig = 'comarques'"));
  await db.exec("set enable_seqscan = on");
  ok(/bn_log_assig_ts/.test(pla), "el dia 0 d'un món pot fer servir l'índex bn_log_assig_ts") }

 console.log("21) tornar a executar el SQL conserva les dates");
 { await examen("comarques", "2026-11-20");
  const e = await executa(SQL); ok(e === null, "tercera execució sense errors" + (e ? ": " + e : ""));
  ok(igual(await q("select assig, data::text from bn_priv.examens"), [{ assig: "comarques", data: "2026-11-20" }]), "la data desada hi continua");
  await examen("comarques", null) }

 console.log("21b) descans (fa_descans i salta_descans) i botó «demà tinc examen» (examen_dema)");
 { ev("DescBo", "biogeo", "descans", "2026-11-15 17:00", { accio: "fet" });
  ev("DescBo", "biogeo", "descans", "2026-11-16 17:00", { accio: "salta" });
  ev("DescBo", "biogeo", "descans", "2026-11-16 17:10", { accio: "fet" }); // 2 fets de 3 (66,7%) → fa_descans
  ev("DescPoc", "biogeo", "descans", "2026-11-16 17:00", { accio: "fet" }); // només 1 fet → no arriba al mínim de 2
  ev("Salta2", "biogeo", "descans", "2026-11-16 18:00", { accio: "salta" });
  ev("Salta2", "biogeo", "descans", "2026-11-16 18:10", { accio: "salta" }); // 2 salts seguits dia normal → groc
  // nen que prem «demà tinc examen» el dia 16 en un món recent (comarques, dia0 = 9-11 → dia 7): vigília individual (marató en blau i llindar 3 salts)
  ev("ExNen", "comarques", "examen_dema", "2026-11-16 16:00", { dia: "2026-11-16" });
  bloc("ExNen", "comarques", "2026-11-16 16:05", [45, 45]); // 90 min seguits: sense vigília seria vermell (>60), amb examen_dema és dins de 120 → no salta marató
  ev("ExNen", "comarques", "entra", "2026-11-16 21:45"); // 21:45 a la vigília individual (<22:00) → no és nit
  ev("ExNen", "comarques", "descans", "2026-11-16 17:00", { accio: "salta" });
  ev("ExNen", "comarques", "descans", "2026-11-16 17:10", { accio: "salta" }); // 2 salts a la vigília (<3) → no salta_descans
  // màxim 2 dies per món: el 3r dia que un nen prem examen_dema en el mateix món s'ignora
  ev("ExTres", "comarques", "examen_dema", "2026-11-14 10:00", {});
  ev("ExTres", "comarques", "examen_dema", "2026-11-15 10:00", {});
  ev("ExTres", "comarques", "examen_dema", "2026-11-16 10:00", {});
  await desa();
  const x = await benestar("7d");
  ok(igual(sen(x, "descbo", "fa_descans"), [S("fa_descans", "bo", "2026-11-16", null, 2, 3)]), "fa_descans: 2 de 3 descansos fets → bo");
  ok(sen(x, "descpoc", "fa_descans").length === 0, "1 sol descans fet no dispara fa_descans");
  ok(igual(sen(x, "salta2", "salta_descans"), [S("salta_descans", "groc", "2026-11-16", "biogeo", 2, 2)]), "salta_descans: 2 salts seguits un dia normal → groc");
  ok(igual(sen(x, "exnen", "examen_dema"), [S("examen_dema", "context", "2026-11-16", "comarques", 1, 2)]), "examen_dema registrat com a senyal de context (1 de 2)");
  ok(sen(x, "exnen", "marato_bloc").length === 0 && sen(x, "exnen", "nit").length === 0 && sen(x, "exnen", "salta_descans").length === 0,
   "examen_dema activa els llindars de vigília (120 min, 22:00 i 3 salts) per a aquell nen i món");
  ok(sen(x, "extres", "examen_dema").length === 2, "màxim 2 avisos examen_dema per nen i món"); }

 console.log("22) permisos");
 { const fn = ["public.bn_admin_benestar(text,text,text,text)", "public.bn_admin_examen_desa(text,text,text,date)"];
  const pubX = f => val(`select coalesce(bool_or(a.grantee = 0 and a.privilege_type = 'EXECUTE'), false)
                         from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a where p.oid = $1::regprocedure`, [f]);
  for (const f of fn) {
   ok((await val("select has_function_privilege('anon', $1, 'execute') and has_function_privilege('authenticated', $1, 'execute')", [f])) === true, f + ": anon i authenticated la poden cridar");
   ok((await pubX(f)) === false, f + ": PUBLIC no hi té permís");
   const p = (await q("select prosecdef, proconfig from pg_proc where oid = $1::regprocedure", [f]))[0];
   ok(p.prosecdef === true && igual(p.proconfig, ['search_path=""']), f + ": security definer i search_path = ''") }
  const h = "bn_priv.benestar_num(text)";
  ok((await val("select has_function_privilege('anon', $1, 'execute') or has_function_privilege('authenticated', $1, 'execute')", [h])) === false && (await pubX(h)) === false,
   "l'ajuda bn_priv.benestar_num: ni anon, ni authenticated, ni PUBLIC");
  ok(igual((await q("select proconfig from pg_proc where oid = $1::regprocedure", [h]))[0].proconfig, ['search_path=""']), "l'ajuda també té search_path = ''");
  ok((await val("select has_table_privilege('anon', 'bn_priv.examens', 'select') or has_table_privilege('authenticated', 'bn_priv.examens', 'insert')")) === false, "bn_priv.examens: cap permís per al navegador");
  await db.exec("set role anon");
  const r = await benestar("7d"), d = await examen("catala", "2026-11-25");
  ok(r && r.nens.length > 10 && igual(d, [{ assig: "catala", data: "2026-11-25" }]), "anon amb el correu i la contrasenya de l'admin: les dues funcions van");
  ok(/acces denegat/.test(await falla("select public.bn_admin_benestar($1, $2)", DOLENTA) || ""), "anon amb la contrasenya dolenta → acces denegat");
  ok((await falla("select * from bn_priv.examens")) !== null && (await falla("select bn_priv.benestar_num('1')")) !== null, "anon: no pot llegir bn_priv.examens ni cridar l'ajuda");
  ok((await falla("insert into bn_priv.examens(assig, data) values ('x', '2026-11-20')")) !== null, "anon: no pot escriure a bn_priv.examens");
  await db.exec("reset role") }
 await db.close();

 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : `\n✓ Tot correcte (${((REAL() - t0) / 1000).toFixed(1)} s)`);
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
