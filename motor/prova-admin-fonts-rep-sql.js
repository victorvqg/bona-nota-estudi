#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de combos i repàs per dia (M3) i dels errors pendents de la colla (M4)
// (supabase/bn_admin_fonts_rep.sql) dins d'un Postgres de prova (PGlite).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-fonts-rep-sql.js
// No toca Supabase ni la xarxa: munta una base mínima amb els fitxers REALS del repo (bn_log.sql, bn_ranking_net.sql,
// bn_admin_tauler.sql i bn_admin_reinicia.sql) i taules simulades per a bn_priv.perfils, intents i progres (a producció no tenen SQL al repo).
// Rellotge: la prova el fixa (i el deixa córrer) a dimecres 18-11-2026 a les 23:30 UTC, quan a Madrid ja és dijous 19 a les 0:30.
//   Així es distingeix de debò la data UTC (la del joc: «avui» del repàs) de la de Madrid (la del tauler: els dies de M3).
//   Els registres es posen en hora de Madrid (al novembre no hi ha canvi d'hora).
// Casos: 1) el SQL dues vegades · 2) contrasenya dolenta · 3) M3: forma de la resposta, increments entre registres (de tots els events
//        amb fonts), base del primer registre, només files > 0 · 4) base anterior al període i dies sencers · 5) dia de Madrid
//        6) reinicis que tallen la sèrie (el del món, el de tots, el d'un altre món, el d'abans de la base) i un reinici de debò
//        7) un valor que baixa (aparell vell) → 0 i no es compta dues vegades en tornar a pujar · 8) claus i valors estranys
//        9) filtres (període, món, nen) i per defecte · 10) M4: agregat (n, nens, avui amb la data UTC, top preguntes, tid null)
//        11) M4: estat mal format sense petar, textos llargs i límit de 300 · 12) zona horària de la sessió · 13) M3: límit de 5.000
//        14) índexs · 15) permisos.
// Cal PGlite:  npm install --no-save @electric-sql/pglite@0.5   (l'Action «Revisa Bona Nota» ja l'instal·la)
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite (el Postgres de prova). Instal·la'l des de l'arrel del repo:\n    npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }
const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
const SQL = fitxer("supabase/bn_admin_fonts_rep.sql");
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
// comparació sense dependre de l'ordre de les claus (jsonb les reordena)
const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const igual = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const claus = o => o && typeof o === "object" ? Object.keys(o).sort().join(",") : String(o);
const mateixesClaus = (o, llista) => claus(o) === [...llista].sort().join(",");
const ADM = ["admin@prova.cat", "contrasenya-de-prova"], DOLENTA = [ADM[0], "dolenta"];
const K_TOP = ["periode", "dies", "total"], K_DIA = ["dia", "k", "nom", "assig", "f"];
const K_REP = ["assig", "tid", "n", "nens", "avui", "preguntes"], K_PREG = ["q", "n"];

// ---------- rellotge: 18-11-2026 23:30 UTC (19-11 0:30 a Madrid); PGlite fa servir Date.now per a now() ----------
const REAL = Date.now.bind(Date), DESPL = Date.UTC(2026, 10, 18, 23, 30, 0) - REAL();
Date.now = () => REAL() + DESPL;
const UTC_AVUI = "2026-11-18", MADRID_AVUI = "2026-11-19";

async function base() {
 const db = await PGlite.create({ extensions: { pgcrypto } });
 await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
 await db.exec(fitxer("supabase/bn_log.sql"));
 await db.exec(`create table bn_priv.perfils(k text primary key, nom text not null, pin text not null, pin_v smallint not null default 1,
                  pin_ts timestamptz, id bigint generated always as identity unique, aspecte jsonb, aspecte_ts timestamptz);
                create table bn_priv.intents(k text primary key, n int not null default 0, ts timestamptz not null default now());
                create table bn_priv.progres(k text not null, assig text not null, estat jsonb, mod bigint, ts timestamptz, primary key (k, assig));
                revoke all on bn_priv.perfils, bn_priv.intents, bn_priv.progres from public, anon, authenticated;`);
 for (const f of ["supabase/bn_ranking_net.sql", "supabase/bn_admin_tauler.sql", "supabase/bn_admin_reinicia.sql"]) await db.exec(fitxer(f));
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
 const fonts = (periode = "7d", assig = null, nom = null, cred = ADM) => val("select public.bn_admin_fonts_dia($1, $2, $3, $4, $5) r", [...cred, periode, assig, nom]);
 const rep = (assig = null, cred = ADM) => val("select public.bn_admin_rep_pendents($1, $2, $3) r", [...cred, assig]);
 // registres (sense triggers, per poder muntar l'historial): es guarden i es desen tots de cop
 const pendents = [];
 const ev = (nom, assig, event, hora, detall = {}, aparell = "a") => pendents.push([nom, assig, event, hora, JSON.stringify(detall), aparell]);
 const fo = (nom, assig, hora, f, event = "temps", aparell = "a") => ev(nom, assig, event, hora, { s: 60, fonts: f }, aparell);
 const desa = async () => {
  await db.exec("set session_replication_role = replica");
  for (const r of pendents) await db.query(`insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall)
                                             values ($4::timestamp at time zone 'Europe/Madrid', $2, $1, 's', $6, $3, $5::jsonb)`, r);
  pendents.length = 0;
  await db.exec("set session_replication_role = origin") };
 const reinici = (k, assig, hora) => q("insert into bn_priv.reinicis(k, assig, ts) values ($1, $2, $3::timestamp at time zone 'Europe/Madrid')", [k, assig, hora]);
 const prog = (k, assig, txt) => q("insert into bn_priv.progres(k, assig, estat, mod, ts) values ($1, $2, $3::text::jsonb, 1, now())", [k, assig, txt]);
 const fila = (r, dia, k, assig) => (r.dies || []).filter(x => x.dia === dia && x.k === k && (!assig || x.assig === assig));
 const delNen = (r, k) => (r.dies || []).filter(x => x.k === k).map(x => ({ dia: x.dia, assig: x.assig, f: x.f }));
 const D = (dia, k, assig, f) => ({ dia, k, assig, f });
 const sense = r => (r.dies || []).map(x => D(x.dia, x.k, x.assig, x.f));   // sense el nom (es mira a part)
 const suma = dies => { const t = {}; for (const x of dies) for (const [c, n] of Object.entries(x.f)) t[c] = (t[c] || 0) + n; return t };

 console.log("0) rellotge de la prova: " + new Date(Date.now()).toISOString());
 ok(Math.abs(new Date(await val("select now()")).getTime() - Date.now()) < 5000, "PGlite fa servir aquest rellotge per a now()");
 ok((await val("select to_char(now() at time zone 'Europe/Madrid', 'YYYY-MM-DD')")) === MADRID_AVUI && (await val("select to_char(now() at time zone 'UTC', 'YYYY-MM-DD')")) === UTC_AVUI,
  "a Madrid ja és " + MADRID_AVUI + " i en UTC encara és " + UTC_AVUI);

 console.log("1) bn_admin_fonts_rep.sql dues vegades");
 { let e = await executa(SQL); ok(e === null, "primera execució sense errors" + (e ? ": " + e : ""));
  e = await executa(SQL); ok(e === null, "segona execució sense errors" + (e ? ": " + e : ""));
  ok((await val("select count(*)::int from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.proname in ('bn_admin_fonts_dia', 'bn_admin_rep_pendents')")) === 2,
   "hi ha bn_admin_fonts_dia i bn_admin_rep_pendents (una de cada, sense duplicats)") }

 console.log("2) contrasenya dolenta");
 { ok(/acces denegat/.test(await falla("select public.bn_admin_fonts_dia($1, $2, '7d')", DOLENTA) || ""), "bn_admin_fonts_dia amb la contrasenya dolenta → acces denegat");
  ok(/acces denegat/.test(await falla("select public.bn_admin_rep_pendents($1, $2)", DOLENTA) || ""), "bn_admin_rep_pendents amb la contrasenya dolenta → acces denegat") }

 // ---------- dades del registre (hora de Madrid). Períodes: 7d = des del 12-11 0:00 · 30d = des del 20-10 0:00 · avui = el 19-11 ----------
 // Ona: increments entre registres; un «test» també porta fonts (detallLog, n2522); un «fitxa» no en porta
 fo("Ona", "socials", "2026-11-13 10:00", { temes: 5, combo: 2 }, "entra");                        // el primer de sempre: base
 fo("Ona", "socials", "2026-11-13 10:30", { temes: 8, combo: 4, triple: 1 });
 ev("Ona", "socials", "fitxa", "2026-11-14 17:50", { tema: "t1", s: 30 });
 fo("Ona", "socials", "2026-11-14 18:00", { temes: 10, combo: 4, triple: 1, super: 2 }, "test");
 fo("ONA ", "socials", "2026-11-14 18:30", { temes: 10, combo: 7, triple: 1, super: 2, repas: 3 });
 fo("Ona", "socials", "2026-11-14 19:00", { temes: 10, combo: 7, triple: 1, super: 2, repas: 3 });  // res de nou
 // Tanca: l'últim registre és un «joc» (el navegador es tanca de cop i no arriba cap «temps»): les seves estrelles compten igual
 fo("Tanca", "socials", "2026-11-13 10:00", { jocs: 2 }, "entra");
 fo("Tanca", "socials", "2026-11-13 10:20", { jocs: 5 }, "joc");
 // Base: la base del període és l'últim registre d'abans
 fo("Base", "biogeo", "2026-10-01 10:00", { combo: 1 });
 fo("Base", "biogeo", "2026-11-01 10:00", { combo: 10 });
 fo("Base", "biogeo", "2026-11-05 10:00", { combo: 15 });
 fo("Base", "biogeo", "2026-11-13 10:00", { combo: 18 });
 // Limit: el període de 7 dies comença a la mitjanit del 12 (dies sencers), no a now() − 7 dies (el 12 a les 0:30)
 fo("Limit", "catala", "2026-11-11 23:50", { combo: 1 });
 fo("Limit", "catala", "2026-11-12 00:10", { combo: 3 });
 fo("Limit", "catala", "2026-11-12 00:40", { combo: 6 });
 // Mitjanit: el 16 a les 0:30 de Madrid és el 15 a les 23:30 UTC
 fo("Mitjanit", "catala", "2026-11-15 22:00", { repas: 1 });
 fo("Mitjanit", "catala", "2026-11-16 00:30", { repas: 4 });
 // reinicis
 for (const [nom, assig] of [["Reini", "socials"], ["ReiniTot", "biogeo"], ["ReiniAltre", "socials"]]) {
  fo(nom, assig, "2026-11-13 10:00", { combo: 20 }); fo(nom, assig, "2026-11-13 11:00", { combo: 25 }) }
 fo("Reini", "socials", "2026-11-14 10:00", { combo: 2, repas: 2 }); fo("Reini", "socials", "2026-11-14 11:00", { combo: 6, repas: 2 });
 fo("ReiniTot", "biogeo", "2026-11-14 10:00", { combo: 2, repas: 2 }); fo("ReiniTot", "biogeo", "2026-11-14 11:00", { combo: 6, repas: 2 });
 fo("ReiniAltre", "socials", "2026-11-14 10:00", { combo: 27 });
 fo("ReiniBase", "catala", "2026-11-05 10:00", { combo: 50 });                                       // base d'abans del període… i d'abans del reinici
 fo("ReiniBase", "catala", "2026-11-13 10:00", { combo: 3 }); fo("ReiniBase", "catala", "2026-11-13 11:00", { combo: 5 });
 // Vell: un aparell vell entra amb valors baixos (abans de baixar el núvol) i després tornen els de sempre
 fo("Vell", "comarques", "2026-11-13 10:00", { combo: 10 }, "temps", "a");
 fo("Vell", "comarques", "2026-11-13 11:00", { combo: 5 }, "entra", "b");
 fo("Vell", "comarques", "2026-11-13 12:00", { combo: 12 }, "temps", "b");
 fo("Vell", "comarques", "2026-11-13 13:00", { combo: 3 }, "entra", "c");
 // Rar: claus i valors estranys; fonts que no són un objecte no compten ni tallen res
 fo("Rar", "catala", "2026-11-13 10:00", { combo: 1, xyz: 1 });
 ev("Rar", "catala", "temps", "2026-11-13 10:30", { s: 60, fonts: [1, 2] });
 ev("Rar", "catala", "temps", "2026-11-13 10:40", { s: 60, fonts: "molts" });
 ev("Rar", "catala", "temps", "2026-11-13 10:45", { s: 60, fonts: null });
 ev("Rar", "catala", "test", "2026-11-13 10:50", { pc: 80 });
 fo("Rar", "catala", "2026-11-13 11:00", { combo: "3", temes: -5, jocs: 1e30, examen: "molts", "Bad Key": 5, "<img src=x>": 3, nova_font: 4,
                                         obertes: true, record: null, boss: { a: 1 }, missio: [1], xyz: 3, super: 2.5, "combo ": 9, "_x": 1 });
 fo("Rar", "catala", "2026-11-13 12:00", { combo: 4 });
 // Quiet: només la base i un registre igual → cap fila
 fo("Quiet", "socials", "2026-11-13 10:00", { combo: 3 }); fo("Quiet", "socials", "2026-11-13 11:00", { combo: 3 });
 // Avui: la base d'«avui» és el registre d'ahir a les 23:00 (Madrid)
 fo("Avui", "socials", "2026-11-18 23:00", { combo: 1 });
 fo("Avui", "socials", "2026-11-19 00:05", { combo: 2 });
 fo("Avui", "socials", "2026-11-19 00:20", { combo: 4 });
 // Fora: tot d'abans dels 30 dies (només surt al curs)
 fo("Fora", "socials", "2026-10-01 10:00", { combo: 1 }); fo("Fora", "socials", "2026-10-02 10:00", { combo: 5 });
 await desa();
 await reinici("reini", "socials", "2026-11-14 09:00");
 await reinici("reinitot", "*", "2026-11-14 09:00");
 await reinici("reinialtre", "catala", "2026-11-14 09:00");
 await reinici("reinibase", "catala", "2026-11-10 09:00");

 // el que ha de sortir amb 7 dies (ordenat per dia, k i assig)
 const E7 = [
  D("2026-11-12", "limit", "catala", { combo: 5 }),
  D("2026-11-13", "base", "biogeo", { combo: 3 }),
  D("2026-11-13", "ona", "socials", { temes: 3, combo: 2, triple: 1 }),
  D("2026-11-13", "rar", "catala", { combo: 3, nova_font: 4, xyz: 2, super: 2.5 }),
  D("2026-11-13", "reini", "socials", { combo: 5 }),
  D("2026-11-13", "reinialtre", "socials", { combo: 5 }),
  D("2026-11-13", "reinibase", "catala", { combo: 2 }),
  D("2026-11-13", "reinitot", "biogeo", { combo: 5 }),
  D("2026-11-13", "tanca", "socials", { jocs: 3 }),
  D("2026-11-13", "vell", "comarques", { combo: 2 }),
  D("2026-11-14", "ona", "socials", { temes: 2, super: 2, combo: 3, repas: 3 }),
  D("2026-11-14", "reini", "socials", { combo: 4 }),
  D("2026-11-14", "reinialtre", "socials", { combo: 2 }),
  D("2026-11-14", "reinitot", "biogeo", { combo: 4 }),
  D("2026-11-16", "mitjanit", "catala", { repas: 3 }),
  D("2026-11-19", "avui", "socials", { combo: 3 })];
 const E7b = [...E7, D("2026-11-19", "real", "socials", { combo: 3 })];   // a partir del cas 6 (el reinici de debò)

 const r7 = await fonts("7d");
 console.log("3) M3: forma de la resposta i increments entre registres");
 { ok(mateixesClaus(r7, K_TOP) && r7.periode === "7d" && Array.isArray(r7.dies) && r7.total && typeof r7.total === "object" && !Array.isArray(r7.total),
   "claus de la resposta: " + claus(r7) + " · periode " + r7.periode);
  ok(r7.dies.every(x => mateixesClaus(x, K_DIA) && /^\d{4}-\d{2}-\d{2}$/.test(x.dia) && typeof x.nom === "string" && typeof x.assig === "string"),
   "claus de cada fila: " + claus(r7.dies[0]) + " (dia AAAA-MM-DD)");
  ok(r7.dies.every(x => Object.keys(x.f).length > 0 && Object.values(x.f).every(n => typeof n === "number" && n > 0)), "cada fila té alguna font i totes són números > 0");
  ok(igual(sense(r7), E7), "les files de 7 dies, exactament (ordenades per dia, k i assig): " + JSON.stringify(sense(r7)));
  ok(igual(r7.total, suma(E7)) && r7.total.combo === 48 && r7.total.repas === 6, "total = la suma de cada font del període: " + JSON.stringify(r7.total));
  ok(igual(delNen(r7, "ona"), [{ dia: "2026-11-13", assig: "socials", f: { temes: 3, combo: 2, triple: 1 } },
                               { dia: "2026-11-14", assig: "socials", f: { temes: 2, super: 2, combo: 3, repas: 3 } }]),
   "Ona: el primer registre (5 temes, 2 combos) és la base i no compta; el «test» també porta fonts (2 super); el registre repetit no suma");
  ok(igual(delNen(r7, "tanca"), [{ dia: "2026-11-13", assig: "socials", f: { jocs: 3 } }]),
   "Tanca: si l'últim registre és un «joc» (sense cap «temps» després: navegador tancat de cop) les seves estrelles compten (+3)");
  const ona = fila(r7, "2026-11-14", "ona")[0] || {};
  ok(ona.nom && ona.nom.trim().toLowerCase() === "ona" && fila(r7, "2026-11-14", "ona").length === 1, "«Ona» i «ONA » són el mateix nen (una fila per dia), amb un dels seus noms: " + JSON.stringify(ona.nom));
  ok(!r7.dies.some(x => x.k === "quiet") && !r7.dies.some(x => x.k === "fora"), "un nen sense cap increment (només la base i un registre igual) no surt; el de fa més de 30 dies, tampoc") }

 console.log("4) base anterior al període i dies sencers");
 { ok(igual(delNen(r7, "base"), [{ dia: "2026-11-13", assig: "biogeo", f: { combo: 3 } }]), "7 dies: la base és l'últim registre d'abans (15) → +3, ni 18 − 10 ni 0");
  const r30 = await fonts("30d");
  ok(igual(delNen(r30, "base"), [{ dia: "2026-11-01", assig: "biogeo", f: { combo: 9 } }, { dia: "2026-11-05", assig: "biogeo", f: { combo: 5 } },
                                 { dia: "2026-11-13", assig: "biogeo", f: { combo: 3 } }]), "30 dies: la base és el de l'1-10 (fora del període) → +9, +5, +3: " + JSON.stringify(delNen(r30, "base")));
  ok(igual(delNen(r7, "limit"), [{ dia: "2026-11-12", assig: "catala", f: { combo: 5 } }]),
   "el període comença a la mitjanit del 12 (dies sencers): el de les 0:10 compta (+2) i la base és el de l'11 a les 23:50");
  const rc = await fonts("curs");
  ok(rc.periode === "curs" && igual(delNen(rc, "fora"), [{ dia: "2026-10-02", assig: "socials", f: { combo: 4 } }]) && igual(delNen(rc, "base"), delNen(r30, "base")),
   "curs (des de l'1-9): la Fora surt (+4) i la Base és com als 30 dies") }

 console.log("5) dia de Madrid");
 { ok(igual(delNen(r7, "mitjanit"), [{ dia: "2026-11-16", assig: "catala", f: { repas: 3 } }]), "un registre del 16 a les 0:30 de Madrid (15 a les 23:30 UTC) va al 16") }

 console.log("6) reinicis");
 { ok(igual(delNen(r7, "reini"), [{ dia: "2026-11-13", assig: "socials", f: { combo: 5 } }, { dia: "2026-11-14", assig: "socials", f: { combo: 4 } }]),
   "reinici del món: el primer registre després (2 combos, 2 repàs) torna a ser base i el següent compta (+4); el repàs no surt");
  ok(igual(delNen(r7, "reinitot"), [{ dia: "2026-11-13", assig: "biogeo", f: { combo: 5 } }, { dia: "2026-11-14", assig: "biogeo", f: { combo: 4 } }]), "reinici de tots els mons ('*'): igual");
  ok(igual(delNen(r7, "reinialtre"), [{ dia: "2026-11-13", assig: "socials", f: { combo: 5 } }, { dia: "2026-11-14", assig: "socials", f: { combo: 2 } }]), "un reinici d'un altre món no talla res (25 → 27: +2)");
  ok(igual(delNen(r7, "reinibase"), [{ dia: "2026-11-13", assig: "catala", f: { combo: 2 } }]), "un reinici entre la base (50) i el període: el primer del període torna a ser base (3 → 5: +2)");
  // un reinici de debò: bn_admin_reinicia esborra el registre; el dispositiu que el sap (detall.ri) desa fonts i el vell no (trigger)
  fo("Real", "socials", "2026-11-19 00:10", { combo: 7 }); fo("Real", "socials", "2026-11-19 00:15", { combo: 9 }); await desa();
  ok(igual(delNen(await fonts("avui"), "real"), [{ dia: MADRID_AVUI, assig: "socials", f: { combo: 2 } }]), "abans del reinici: +2 avui");
  await val("select public.bn_admin_reinicia($1, $2, 'Real', 'socials')", ADM);
  const ri = await val("select bn_priv.reinici_ms('real', 'socials')");
  for (const [n, d] of [[1, { ri }], [4, { ri }], [30, {}]])
   await q("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('socials', 'Real', 's', 'a', 'temps', $1::jsonb)", [JSON.stringify(Object.assign({ s: 60, fonts: { combo: n } }, d))]);
  ok((await val("select count(*)::int from public.bn_log where nom = 'Real' and detall ? 'fonts'")) === 2, "el trigger de reinicis treu les fonts de l'aparell que no sap el reinici");
  ok(igual(delNen(await fonts("avui"), "real"), [{ dia: MADRID_AVUI, assig: "socials", f: { combo: 3 } }]), "després del reinici: el primer registre és la base (1) i el següent compta (+3); el vell (30) no") }

 console.log("7) un valor que baixa (aparell vell)");
 { ok(igual(delNen(r7, "vell"), [{ dia: "2026-11-13", assig: "comarques", f: { combo: 2 } }]),
   "10 → 5 (aparell vell) → 12 → 3: +2 en total (el que passa del màxim d'abans), mai negatiu ni la pujada 5 → 12 comptada dues vegades");
  ok(r7.dies.every(x => Object.values(x.f).every(n => n > 0)), "cap increment negatiu ni zero a cap fila") }

 console.log("8) claus i valors estranys");
 { const rar = delNen(r7, "rar");
  ok(igual(rar, [{ dia: "2026-11-13", assig: "catala", f: { combo: 3, nova_font: 4, xyz: 2, super: 2.5 } }]),
   "text amb xifres («3») i decimals compten; negatius, 1e30, text, booleans, null, objectes i llistes no; claus amb espais, majúscules, símbols o «_» al davant fora; una clau nova ben formada (nova_font) es torna: " + JSON.stringify(rar));
  ok(!JSON.stringify(r7).includes("<img") && !JSON.stringify(r7).includes("Bad Key"), "les claus estranyes no surten enlloc (ni al total)") }

 console.log("9) filtres i per defecte");
 { const t7 = await fonts("7d");
  ok(igual(sense(t7), E7b), "7 dies, ara amb el nen del reinici de debò");
  const s = await fonts("7d", "socials");
  ok(igual(sense(s), E7b.filter(x => x.assig === "socials")) && igual(s.total, suma(E7b.filter(x => x.assig === "socials"))), "món 'socials': només les seves files i el seu total");
  const o = await fonts("7d", null, "  ONA ");
  ok(igual(sense(o), E7.filter(x => x.k === "ona")) && igual(o.total, suma(E7.filter(x => x.k === "ona"))), "nen «  ONA » (lower(trim)): només la Ona i el seu total");
  ok(igual(sense(await fonts("7d", "biogeo", "Base")), [D("2026-11-13", "base", "biogeo", { combo: 3 })]), "món i nen alhora");
  const n = await fonts("7d", null, "ningu");
  ok(igual(n, { periode: "7d", dies: [], total: {} }), "un nen que no hi és → dies [] i total {}");
  ok(igual(await fonts("7d", "", ""), t7), "món i nom buits = tots");
  const a = await fonts("avui");
  ok(a.periode === "avui" && igual(sense(a), [D(MADRID_AVUI, "avui", "socials", { combo: 3 }), D(MADRID_AVUI, "real", "socials", { combo: 3 })]),
   "'avui' (dia de Madrid): només el 19, amb la base del registre d'ahir a les 23:00: " + JSON.stringify(sense(a)));
  const per = await val("select public.bn_admin_fonts_dia($1, $2) r", ADM);
  ok(per.periode === "30d" && igual(per, await fonts("30d")), "per defecte: 30 dies, tots els mons i tots els nens");
  ok((await fonts(null)).periode === "30d", "període null → '30d'") }

 // ---------- M4: progrés desat (estat.rep) ----------
 await prog("ana", "socials", JSON.stringify({ punts: 5, rep: {
  "t1|Q1": { tid: "t1", q: "Q1", c: 0, prox: UTC_AVUI },                // avui (UTC)
  "t1|Q2": { tid: "t1", q: "Q2", c: 1, prox: MADRID_AVUI },             // demà en UTC (avui a Madrid): encara no toca
  "t2|Q3": { tid: "t2", q: "Q3", c: 2, prox: "2026-11-10" },
  "err_gen|j1|e1": { tipus: "err_gen", clau: "j1|e1", jid: "j1", eid: "e1", pas: 2, c: 0, prox: "2026-11-17" } } }));
 await prog("biel", "socials", JSON.stringify({ rep: { "t1|Q1": { tid: "t1", q: "Q1", c: 0, prox: "2026-11-20" }, "t1|Q4": { tid: "t1", q: "Q4", c: 0, prox: "2026-11-01" } } }));
 await prog("cesc", "socials", JSON.stringify({ rep: { "t1|Q1": { tid: "t1", q: "Q1", c: 0, prox: UTC_AVUI } } }));
 await q("insert into bn_priv.amagats(k) values ('cesc')");                                            // amagat: compta igual
 await prog("dani", "biogeo", JSON.stringify({ rep: { "b1|X": { tid: "b1", q: "X", c: 0, prox: UTC_AVUI }, "7|Y": { tid: 7, q: "Y", c: 0, prox: "2026-11-25" } } }));
 await prog("eva", "biogeo", JSON.stringify({ rep: { "b1|X": { tid: "b1", q: "X", c: 1, prox: MADRID_AVUI }, "b1|Z": { tid: "b1", q: "Z", c: 0, prox: UTC_AVUI } } }));
 await prog("eva", "catala", JSON.stringify({ punts: 3, rep: {} }));
 const ERS = [
  { assig: "socials", tid: "t1", n: 5, nens: 3, avui: 3, preguntes: [{ q: "Q1", n: 3 }, { q: "Q2", n: 1 }, { q: "Q4", n: 1 }] },
  { assig: "biogeo", tid: "b1", n: 3, nens: 2, avui: 2, preguntes: [{ q: "X", n: 2 }, { q: "Z", n: 1 }] },
  { assig: "biogeo", tid: "7", n: 1, nens: 1, avui: 0, preguntes: [{ q: "Y", n: 1 }] },
  { assig: "socials", tid: "t2", n: 1, nens: 1, avui: 1, preguntes: [{ q: "Q3", n: 1 }] },
  { assig: "socials", tid: null, n: 1, nens: 1, avui: 1, preguntes: [] }];

 console.log("10) M4: errors pendents agregats per món i tema");
 { const r = await rep();
  ok(Array.isArray(r) && r.every(x => mateixesClaus(x, K_REP) && Array.isArray(x.preguntes) && x.preguntes.every(p => mateixesClaus(p, K_PREG))),
   "una llista; claus de cada fila: " + claus(r[0]) + " · de cada pregunta: " + claus(r[0] && r[0].preguntes[0]));
  ok(igual(r, ERS), "exactament (ordenat per n desc, nens desc, assig, tid; tid null al final): " + JSON.stringify(r));
  ok(r[0].avui === 3, "avui = prox ≤ la data UTC (" + UTC_AVUI + "): la de demà en UTC, que a Madrid ja és avui, no compta");
  ok(r[0].nens === 3, "la Cesc (amagada) compta: és per a l'admin");
  ok(r[4].tid === null && r[4].preguntes.length === 0, "l'error d'«err_gen» (sense tid ni q) va a tid null, sense preguntes");
  ok(r[2].tid === "7", "un tid numèric surt com a text");
  ok(!/"(k|nom)"/.test(JSON.stringify(r)) && !/ana|biel|cesc|dani|eva/.test(JSON.stringify(r)), "cap nom de nen a la resposta: només comptes");
  ok(igual(await rep("biogeo"), ERS.filter(x => x.assig === "biogeo")) && igual(await rep(""), ERS) && igual(await val("select public.bn_admin_rep_pendents($1, $2) r", ADM), ERS),
   "filtre per món; '' i per defecte = tots");
  ok(igual(await rep("catala"), []) && igual(await rep("cap"), []), "un món amb rep buit o sense progrés → []");
  // top 5 preguntes: 4 nens d'un món, 7 preguntes
  const qs = { qa: [1, 2, 3, 4], qb: [1, 2, 3], qc: [1, 2], qd: [1], qe: [2], qf: [3], qg: [4] };
  for (let i = 1; i <= 4; i++) await prog("top" + i, "top", JSON.stringify({ rep: Object.fromEntries(Object.entries(qs).filter(([, ns]) => ns.includes(i)).map(([x]) => ["tt|" + x, { tid: "tt", q: x, c: 0, prox: "2026-12-01" }])) }));
  const t = await rep("top");
  ok(igual(t, [{ assig: "top", tid: "tt", n: 13, nens: 4, avui: 0, preguntes: [{ q: "qa", n: 4 }, { q: "qb", n: 3 }, { q: "qc", n: 2 }, { q: "qd", n: 1 }, { q: "qe", n: 1 }] }]),
   "les 5 preguntes més repetides (per n desc i q), però n i nens les compten totes: " + JSON.stringify(t)) }

 console.log("11) M4: estat mal format, textos llargs i límit de 300 files");
 { for (const [a, e] of Object.entries({ m_text: '"hola"', m_llista: "[1, 2]", m_num: "5", m_reptext: '{"rep": "x"}',
                                         m_repllista: JSON.stringify({ rep: [{ tid: "t1", q: "x", prox: UTC_AVUI }] }),
                                         m_entrades: JSON.stringify({ rep: { a: 5, b: null, c: [1], d: "x", e: { tid: { x: 1 }, q: 3, prox: "demà" },
                                                                             f: { tid: "t9", q: "ok", prox: 20261118 }, g: {}, h: { tid: true, q: ["x"], prox: "2026-1-1" } } }) }))
   await prog("mal", a, e);
  await q("insert into bn_priv.progres(k, assig, estat, mod, ts) values ('mal', 'm_null', null, null, now())");
  let r = null, err = null;
  try { r = await rep() } catch (e) { err = e.message }
  ok(err === null && Array.isArray(r), "no peta amb estats que no són objectes, rep que no és un objecte ni entrades estranyes" + (err ? ": " + err : ""));
  const m = (r || []).filter(x => x.assig.startsWith("m_"));
  ok(igual(m, [{ assig: "m_entrades", tid: null, n: 3, nens: 1, avui: 0, preguntes: [] }, { assig: "m_entrades", tid: "t9", n: 1, nens: 1, avui: 0, preguntes: [{ q: "ok", n: 1 }] }]),
   "només compten les entrades que són objectes (e, f, g, h); tid objecte/booleà, q número/llista i prox «demà»/número/«2026-1-1» → null: " + JSON.stringify(m));
  ok(igual((r || []).filter(x => !x.assig.startsWith("m_") && x.assig !== "top"), ERS), "la resta surt igual");
  await prog("llarg", "llarg", JSON.stringify({ rep: { "x": { tid: "b".repeat(500), q: "a".repeat(1000), prox: UTC_AVUI } } }));
  const l = (await rep("llarg"))[0] || {};
  ok(l.tid === "b".repeat(100) && l.preguntes && l.preguntes[0].q === "a".repeat(300) && l.avui === 1, "textos llargs retallats: tid a 100 caràcters i q a 300");
  await prog("molts", "molts", JSON.stringify({ rep: Object.fromEntries(Array.from({ length: 301 }, (_, i) => ["k" + i, { tid: "t" + String(i).padStart(3, "0"), q: "q", prox: UTC_AVUI }])) }));
  const ms = await rep("molts");
  ok(ms.length === 300 && ms.every(x => x.n === 1 && x.avui === 1) && ms[0].tid === "t000" && !ms.some(x => x.tid === "t300"), "301 temes → 300 files (fins a 300): " + ms.length);
  ok((await rep()).length === 300, "sense filtre, també 300 com a màxim") }

 console.log("12) zona horària de la sessió");
 { const fs7 = [], avs = [];
  for (const z of ["Pacific/Kiritimati", "Pacific/Pago_Pago", "Europe/Madrid", "UTC"]) {
   await db.exec(`set timezone = '${z}'`);
   fs7.push(await fonts("7d")); avs.push((await rep("socials"))[0].avui) }
  ok(fs7.every(x => igual(x, fs7[3])) && igual(sense(fs7[3]), E7b), "M3: les mateixes files sigui quina sigui la zona horària de la sessió");
  ok(avs.every(x => x === 3), "M4: «avui» és el mateix sigui quina sigui la zona horària de la sessió: " + avs.join(",")) }

 console.log("13) M3: fins a 5.000 files (es queden els dies més recents sencers) i el total les compta totes");
 { const abans = await fonts("30d"), combo0 = abans.total.combo || 0;
  // 170 nens d'un món nou: una base el 19-10 (fora dels 30 dies) i un registre cada dia del 20-10 al 18-11 amb +1 combo → 5.100 files
  await db.exec("set session_replication_role = replica");
  await db.exec(`insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall)
                 select ((date '2026-10-19' + d) + time '12:00') at time zone 'Europe/Madrid', 'massa', 'm' || lpad(k::text, 3, '0'), 's', 'a', 'temps',
                        jsonb_build_object('s', 60, 'fonts', jsonb_build_object('combo', d))
                 from generate_series(1, 170) k, generate_series(0, 30) d`);
  await db.exec("set session_replication_role = origin");
  const t = REAL(), r = await fonts("30d"), ms = REAL() - t;
  const n20 = abans.dies.filter(x => x.dia === "2026-10-20").length;
  ok(abans.dies.length < 70 && n20 === 0 && r.dies.length === 5100 - 170 + abans.dies.length,
   "5.100 + " + abans.dies.length + " files possibles: fora el dia més vell sencer (el 20-10, 170 files) → " + r.dies.length + " (≤ 5.000)");
  ok(r.total.combo === combo0 + 5100, "el total compta les 5.100 de més igualment: " + r.total.combo);
  ok(r.dies.every((x, i) => i === 0 || r.dies[i - 1].dia <= x.dia) && r.dies[0].dia === "2026-10-21" && r.dies[r.dies.length - 1].dia === MADRID_AVUI,
   "ordenades per dia, del " + r.dies[0].dia + " al " + r.dies[r.dies.length - 1].dia);
  const nm = await fonts("30d", "massa"), per = d => nm.dies.filter(x => x.dia === d).length;
  ok(nm.dies.length === 4930 && per("2026-10-20") === 0 && per("2026-10-21") === 170 && per("2026-11-18") === 170 && nm.total.combo === 5100 && nm.dies.every(x => igual(x.f, { combo: 1 })),
   "només el món «massa»: 5.100 → 4.930 files de +1 (cap dia a mitges) i total 5.100");
  console.log("     (" + ms + " ms per a 5.300 registres a PGlite)") }

 console.log("14) índexs");
 { await db.exec("set enable_seqscan = off");   // amb tan poques files el planificador triaria llegir la taula sencera
  const pb = JSON.stringify(await q("explain select x.id from public.bn_log x where lower(trim(x.nom)) = 'ona' and x.assig = 'socials' and x.ts < now() order by x.ts desc, x.id desc limit 1"));
  const pp = JSON.stringify(await q("explain select x.id from public.bn_log x where x.ts >= now() - interval '7 days' and x.ts < now()"));
  await db.exec("set enable_seqscan = on");
  ok(/bn_log_nom|bn_log_ts/.test(pb) && !/Seq Scan on bn_log/.test(pb), "la base d'un nen (l'últim registre d'abans) pot fer servir un índex (bn_log_nom o bn_log_ts)");
  ok(/bn_log_ts/.test(pp), "els registres del període poden fer servir l'índex bn_log_ts") }

 console.log("15) permisos");
 { const fn = ["public.bn_admin_fonts_dia(text,text,text,text,text)", "public.bn_admin_rep_pendents(text,text,text)"];
  const pubX = f => val(`select coalesce(bool_or(a.grantee = 0 and a.privilege_type = 'EXECUTE'), false)
                         from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a where p.oid = $1::regprocedure`, [f]);
  for (const f of fn) {
   ok((await val("select has_function_privilege('anon', $1, 'execute') and has_function_privilege('authenticated', $1, 'execute')", [f])) === true, f + ": anon i authenticated la poden cridar");
   ok((await pubX(f)) === false, f + ": PUBLIC no hi té permís");
   const p = (await q("select prosecdef, proconfig from pg_proc where oid = $1::regprocedure", [f]))[0];
   ok(p.prosecdef === true && igual(p.proconfig, ['search_path=""']), f + ": security definer i search_path = ''") }
  await db.exec("set role anon");
  const r = await fonts("7d"), e = await rep("biogeo");
  ok(r && igual(sense(r).filter(x => x.assig !== "massa"), E7b) && igual(e, ERS.filter(x => x.assig === "biogeo")), "anon amb el correu i la contrasenya de l'admin: les dues funcions van");
  ok(/acces denegat/.test(await falla("select public.bn_admin_fonts_dia($1, $2)", DOLENTA) || "") && /acces denegat/.test(await falla("select public.bn_admin_rep_pendents($1, $2)", DOLENTA) || ""),
   "anon amb la contrasenya dolenta → acces denegat");
  ok((await falla("select * from bn_priv.progres limit 1")) !== null && (await falla("select * from public.bn_log limit 1")) !== null && (await falla("select * from bn_priv.reinicis limit 1")) !== null,
   "anon: no pot llegir bn_priv.progres, public.bn_log ni bn_priv.reinicis");
  await db.exec("reset role") }
 await db.close();

 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : `\n✓ Tot correcte (${((REAL() - t0) / 1000).toFixed(1)} s)`);
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
