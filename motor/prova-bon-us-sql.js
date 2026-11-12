#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de Bon ús (supabase/bn_bon_us.sql) dins d'un Postgres de prova (PGlite).
// Ús: node motor/prova-bon-us-sql.js
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l amb: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }

const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };

// Rellotge fixat a dimecres 18-11-2026 12:00 a Madrid (11:00 UTC)
const REAL = Date.now.bind(Date), DESPL = Date.UTC(2026, 10, 18, 11, 0, 0) - REAL();
Date.now = () => REAL() + DESPL;

(async () => {
 const t0 = REAL();
 const db = await PGlite.create({ extensions: { pgcrypto } });
 await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
 await db.exec(fitxer("supabase/bn_log.sql"));
 await db.exec(fitxer("supabase/bn_ranking_net.sql"));

 const q = async (sql, p) => (await db.query(sql, p || [])).rows;
 const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
 const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };

 console.log("1) execució idempotent de bn_bon_us.sql i nous events a bn_log");
 await db.exec(fitxer("supabase/bn_bon_us.sql"));
 await db.exec(fitxer("supabase/bn_bon_us.sql"));
 await db.exec("set role anon");
 const errDesc = await falla("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('angles', 'Laia', 's1', 'ap1', 'descans', '{\"accio\":\"fet\"}'::jsonb)");
 const errExD = await falla("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('angles', 'Laia', 's1', 'ap1', 'examen_dema', '{\"dia\":\"2026-11-18\"}'::jsonb)");
 const errInv = await falla("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('angles', 'Laia', 's1', 'ap1', 'inventat', '{}'::jsonb)");
 ok(errDesc === null, "anon pot inserir event 'descans'");
 ok(errExD === null, "anon pot inserir event 'examen_dema'");
 ok(errInv !== null, "event desconegut continua rebutjat pel CHECK");
 await db.exec("reset role");

 console.log("2) bn_vigilia: fases segons neix, data d'admin i finestra de 12 dies");
 { const r1 = await val("select public.bn_vigilia('angles', '2026-11-15')");
  ok(r1.assig === "angles" && r1.dia0 === "2026-11-15" && r1.fase === "aprendre" && r1.vigilia_grup === false,
   "món de 3 dies sense examen: fase 'aprendre' (" + JSON.stringify(r1) + ")");
  ok(r1.nit_h === "21:30" && r1.nit_vigilia_h === "22:00" && r1.obre_h === "06:00", "horari de nit per defecte: 21:30 / 22:00 → 06:00");
  ok(!JSON.stringify(r1).toLowerCase().includes("laia"), "bn_vigilia no exposa mai cap nom de nen");

  const rVell = await val("select public.bn_vigilia('socials', '2026-11-02')");
  ok(rVell.fase === "despres", "món de més de 12 dies (2026-11-02 el 18-11): fase 'despres'");

  await db.query("insert into bn_priv.examens(assig, data) values ('socials', '2026-11-19')");
  const rExVig = await val("select public.bn_vigilia('socials', '2026-11-02')");
  ok(rExVig.examen === "2026-11-19" && rExVig.fase === "vigilia", "data d'admin demà (19-11): fase 'vigilia'");

  await db.query("update bn_priv.examens set data = '2026-11-18' where assig = 'socials'");
  const rExAvui = await val("select public.bn_vigilia('socials', '2026-11-02')");
  ok(rExAvui.fase === "despres", "el mateix dia de l'examen o després: fase 'despres'");

  await db.query("update bn_priv.examens set data = '2026-11-22' where assig = 'socials'");
  const rExFut = await val("select public.bn_vigilia('socials', '2026-11-02')");
  ok(rExFut.fase === "aprendre", "data d'admin més endavant (22-11): fase 'aprendre'");
  await db.query("delete from bn_priv.examens where assig = 'socials'"); }

 console.log("3) bn_vigilia: detecció del pic del grup i transició a 'despres' l'endemà");
 { await db.exec("set session_replication_role = replica");
  for (let d = 10; d <= 16; d++) {
   await db.query("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values ($1::timestamp at time zone 'Europe/Madrid', 'catala', 'Ona', 's', 'a', 'temps', '{\"s\":600}'::jsonb)", [`2026-11-${d} 18:00`]);
  }
  for (const nm of ["N1", "N2", "N3", "N4", "N5"]) {
   await db.query("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values ('2026-11-18 17:00'::timestamp at time zone 'Europe/Madrid', 'catala', $1, 's', 'a', 'temps', '{\"s\":600}'::jsonb)", [nm]);
  }
  await db.exec("set session_replication_role = origin");
  const rPic = await val("select public.bn_vigilia('catala', '2026-11-10')");
  ok(rPic.vigilia_grup === true && rPic.fase === "vigilia", "5 nens i ≥3× mediana al dia 8: pic de vigília detectat");

  // Si el pic va ser ahir (17-11), avui (18-11) ja passa a 'despres'
  await db.exec("update public.bn_log set ts = ts - interval '1 day' where assig = 'catala' and nom in ('N1','N2','N3','N4','N5')");
  const rEndema = await val("select public.bn_vigilia('catala', '2026-11-10')");
  ok(rEndema.vigilia_grup === false && rEndema.fase === "despres", "l'endemà del pic de vigília: fase 'despres'"); }

 console.log("4) configuració d'horari de nit a bn_priv.config i permisos");
 { await db.query("update bn_priv.config set valor = '{\"nit_h\":\"21:15\",\"nit_vigilia_h\":\"21:45\",\"obre_h\":\"06:30\"}' where clau = 'bon_us'");
  await db.exec("set role anon");
  const rCfg = await val("select public.bn_vigilia('angles', '2026-11-15')");
  ok(rCfg.nit_h === "21:15" && rCfg.nit_vigilia_h === "21:45" && rCfg.obre_h === "06:30", "anon llegeix l'horari personalitzat a través de bn_vigilia");
  ok(await falla("select bn_priv.bon_us_cfg()") !== null, "anon no pot cridar bn_priv.bon_us_cfg directament");
  ok(/mon no valid/.test(await falla("select public.bn_vigilia('món amb espais')") || ""), "bn_vigilia rebutja assig no vàlid");
  await db.exec("reset role"); }

 console.log("5) bn_ranking_remuntada: errors recuperats al repàs (+1 per encert de test/ext, +2 extra per error après)");
 { await db.exec(fitxer("supabase/bn_ranking_remuntada.sql"));
  await db.exec(fitxer("supabase/bn_ranking_remuntada.sql")); // idempotent
  await db.exec("set session_replication_role = replica");
  const insRep = (ts, nom, det) => db.query(
   "insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values ($1::timestamp at time zone 'Europe/Madrid', 'angles', $2, 's', 'a', 'joc', $3::jsonb)",
   [ts, nom, JSON.stringify(Object.assign({ joc: "repas" }, det))]
  );
  // Biel: 4 bones de test + ext 'frase:5/5,mapa:1/2' (10) + una altra amb 2 bones i 1 après (2 + 2*1 = 4) → 14
  await insRep("2026-11-17 18:00", "Biel", { bones: 4, n: 5, ext: "frase:5/5,mapa:1/2", pc: 83 });
  await insRep("2026-11-18 09:00", "Biel", { bones: 2, n: 2, apr: 1, pc: 100 });
  // Berta: només extensió (sense camp bones) 'frase:3/4' → 3; i un repàs fallat (0/2) → +0; i un de fa 9 dies → fora de finestra
  await insRep("2026-11-16 17:00", "Berta", { ext: "frase:3/4", pc: 75 });
  await insRep("2026-11-16 17:10", "Berta", { bones: 0, n: 2, ext: "frase:0/2", pc: 0 });
  await insRep("2026-11-08 17:00", "Berta", { bones: 9, n: 9, apr: 3, pc: 100 });
  // Sam: intent d'inflar des del navegador (bones: 999, apr: 999) → retallat a 20 + 2*20 = 60
  await insRep("2026-11-18 10:00", "Sam", { bones: 999, apr: 999, pc: 100 });
  // Amagat: no ha de sortir
  await insRep("2026-11-18 10:00", "Amagat", { bones: 5, n: 5, pc: 100 });
  await db.query("insert into bn_priv.amagats(k) values ('amagat')");
  // Cap sessió amb 0 punts no ha d'aparèixer
  await insRep("2026-11-18 10:00", "Zero", { bones: 0, n: 3, pc: 0 });
  await db.exec("set session_replication_role = origin");

  await db.exec("set role anon");
  const rk = await q("select nom, apr from public.bn_ranking_remuntada()");
  await db.exec("reset role");
  ok(JSON.stringify(rk) === JSON.stringify([
   { nom: "Sam", apr: 60 },
   { nom: "Biel", apr: 14 },
   { nom: "Berta", apr: 3 }
  ]), "suma test + ext + 2×apr en 7 dies, filtra 0/amagats/antics i aplica topall (" + JSON.stringify(rk) + ")"); }

 await db.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : `\n✓ Tot correcte (${((REAL() - t0) / 1000).toFixed(1)} s)`);
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
