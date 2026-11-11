#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de dificultat calculada (supabase/bn_admin_dificultat.sql, issue #16) amb PGlite.
// Ús: node motor/prova-dificultat-sql.js
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }

const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
const SQL = fitxer("supabase/bn_admin_dificultat.sql");
let fallades = 0;
const ok = (c, m) => { if (c) console.log("  ✓", m); else { fallades++; console.log("  ✗", m) } };
const ADM = ["admin@prova.cat", "secret-prova"], DOLENTA = [ADM[0], "incorrecta"];

(async () => {
 const t0 = Date.now();
 const db = await PGlite.create({ extensions: { pgcrypto } });
 await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
 for (const f of ["supabase/bn_log.sql", "supabase/bn_ranking_net.sql", "supabase/bn_admin_tauler.sql"]) await db.exec(fitxer(f));
 await db.query("insert into bn_priv.admin(email, hash) values ($1, extensions.crypt($2, extensions.gen_salt('bf')))", ADM);

 const q = async (sql, p) => (await db.query(sql, p || [])).rows;
 const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
 const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };

 console.log("1) Aplicació idempotent de bn_admin_dificultat.sql i control d'accés");
 await db.exec(SQL);
 await db.exec(SQL);
 ok((await val("select count(*)::int from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.proname = 'bn_admin_dificultat'")) === 1,
  "bn_admin_dificultat creada sense duplicats");
 ok(/acces denegat/.test(await falla("select public.bn_admin_dificultat($1, $2)", DOLENTA) || ""),
  "contrasenya incorrecta → acces denegat");

 console.log("2) Càlcul d'encert (<55 % → 3, 55..90 % → 2, >90 % → 1), llindar p_min i exclusions");
 await db.exec("set session_replication_role = replica");
 const ins = (nom, assig, event, qs, diesFa = 1) => db.query(
  `insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall)
   values (now() - make_interval(days => $5), $2, $1, 's', 'a', $3, $4::jsonb)`,
  [nom, assig, event, JSON.stringify({ q: qs }), diesFa]
 );
 // temps/1: 4/10 encerts (40% < 55%) → dificultat 3 (difícil)
 for (let i = 0; i < 10; i++) await ins("Nen" + i, "socials", "test", [`temps/1:${i < 4 ? 1 : 0}:6:0`]);
 // temps/2: 8/10 encerts (80%, entre 55% i 90%) → dificultat 2 (normal)
 for (let i = 0; i < 10; i++) await ins("Nen" + i, "socials", "examen", [`temps/2:${i < 8 ? 1 : 0}:5:1`]);
 // temps/3: 10/10 encerts (100% > 90%) → dificultat 1 (fàcil)
 for (let i = 0; i < 10; i++) await ins("Nen" + i, "socials", "test", [`temps/3:1:4:2`]);
 // temps/4: 9/10 encerts (exactament 90,0%, NO > 90%) → dificultat 2 (normal)
 for (let i = 0; i < 10; i++) await ins("Nen" + i, "socials", "test", [`temps/4:${i < 9 ? 1 : 0}:4:2`]);
 // temps/5: només 5 respostes (< 8) → suficient = false, dificultat = null
 for (let i = 0; i < 5; i++) await ins("Nen" + i, "socials", "test", [`temps/5:0:7:1`]);
 // efecte repetició (encert_1a vs encert): a adj1/6, 4 nens fallen a la 1a però un d'ells repeteix 6 cops encertant → encert = 60% (2), encert_1a = 0%
 for (let i = 0; i < 4; i++) await ins("Alum" + i, "angles", "test", ["adj1/6:0:8:1"], 2);
 for (let r = 0; r < 6; r++) await ins("Alum0", "angles", "test", ["adj1/6:1:3:0"], 1);
 // coses que NO han de comptar: joc/repas, preguntes de joc j-*, amagats, noms prohibits, _alta i dades brutes
 await db.query("insert into bn_priv.amagats(k) values ('amagat1')");
 for (let i = 0; i < 12; i++) {
  await ins("Nen" + i, "socials", "joc", ["temps/3:0:5:0"]);          // event joc (repàs) → ignorat
  await ins("amagat1", "socials", "test", ["temps/3:0:5:0"]);         // nen amagat → ignorat
  await ins("tonto", "socials", "test", ["temps/3:0:5:0"]);          // nom prohibit → ignorat
  await ins("_alta", "socials", "test", ["temps/3:0:5:0"]);           // _alta → ignorat
  await ins("Nen" + i, "socials", "test", ["j-climo/1:0:5:0", "brut", "temps/3:x:abc:0"]); // j-* i mal formades → ignorades
 }
 await db.exec("set session_replication_role = origin");

 const r = await val("select public.bn_admin_dificultat($1, $2) r", ADM);
 const preg = (a, qid) => r.preguntes.find(x => x.assig === a && x.qid === qid);
 ok(r.min_respostes === 8 && r.resum.preguntes_vistes === 6 && r.resum.amb_dades === 5,
  "resum: 6 preguntes vàlides vistes i 5 amb >= 8 respostes");
 ok(preg("socials", "temps/1").dificultat === 3 && preg("socials", "temps/1").encert === 40,
  "temps/1 amb 40 % d'encert (< 55 %) → dificultat 3 (difícil)");
 ok(preg("socials", "temps/2").dificultat === 2 && preg("socials", "temps/2").encert === 80,
  "temps/2 amb 80 % d'encert → dificultat 2 (normal)");
 ok(preg("socials", "temps/3").dificultat === 1 && preg("socials", "temps/3").encert === 100 && preg("socials", "temps/3").n === 10,
  "temps/3 amb 100 % (> 90 %) → dificultat 1 (fàcil), ignorant joc/repas, amagats, demo, _alta i j-*");
 ok(preg("socials", "temps/4").dificultat === 2 && preg("socials", "temps/4").encert === 90,
  "temps/4 amb exactament 90,0 % → dificultat 2 (només > 90 % és fàcil)");
 ok(preg("socials", "temps/5").suficient === false && preg("socials", "temps/5").dificultat === null,
  "temps/5 amb 5 respostes (< 8) → suficient=false i dificultat=null");
 ok(preg("angles", "adj1/6").encert === 60 && preg("angles", "adj1/6").encert_1a === 0 && preg("angles", "adj1/6").nens === 4,
  "adj1/6 distingeix l'encert total (60 %) de l'encert a la primera resposta de cada nen (encert_1a = 0 %)");

 console.log("3) Filtre per món (p_assig), p_min personalitzat i permisos de seguretat");
 const rAng = await val("select public.bn_admin_dificultat($1, $2, 'angles', 4, 30) r", ADM);
 ok(rAng.assig === "angles" && rAng.preguntes.length === 1 && rAng.preguntes[0].qid === "adj1/6",
  "filtre p_assig='angles' retorna només les preguntes d'anglès");
 const fn = "public.bn_admin_dificultat(text,text,text,integer,integer)";
 const pubX = await val(`select coalesce(bool_or(a.grantee = 0 and a.privilege_type = 'EXECUTE'), false)
                         from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a where p.oid = $1::regprocedure`, [fn]);
 const cfg = (await q("select prosecdef, proconfig from pg_proc where oid = $1::regprocedure", [fn]))[0];
 ok(pubX === false && cfg.prosecdef === true && JSON.stringify(cfg.proconfig) === '["search_path=\\"\\""]',
  "PUBLIC revocat, security definer i search_path = ''");
 await db.exec("set role anon");
 ok((await val("select (public.bn_admin_dificultat($1, $2, 'angles') -> 'resum' ->> 'amb_dades')::int", ADM)) === 1,
  "anon amb credencials d'admin pot executar bn_admin_dificultat");
 await db.exec("reset role");
 await db.close();

 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : `\n✓ Tot correcte (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ Error:", e); process.exit(1) });
