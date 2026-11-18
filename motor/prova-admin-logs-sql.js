#!/usr/bin/env node
// Bona Nota · prova automàtica de la baixada incremental del registre (supabase/bn_log.sql, bn_admin_logs amb p_des_id;
// fase 4 del pla docs/superpowers/specs/2026-11-18-admin-ordre-paginacio-pla-mestre.md) dins d'un Postgres de prova (PGlite).
// Comprova: el fitxer s'aplica dues vegades; si hi havia la versió vella de 3 paràmetres, en queda una sola (PostgREST no
// sabria triar); contrasenya dolenta → acces denegat; sense p_des_id torna tot el període; amb p_des_id només les files
// posteriors; i la crida amb 3 paràmetres (un tauler vell) continua funcionant.
// Ús: node motor/prova-admin-logs-sql.js
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }

const ARREL = path.resolve(__dirname, "..");
const SQL = fs.readFileSync(path.join(ARREL, "supabase/bn_log.sql"), "utf8");
let fallades = 0;
const ok = (c, m) => { if (c) console.log("  ✓", m); else { fallades++; console.log("  ✗", m) } };
const ADM = ["admin@prova.cat", "secret-prova"], DOLENTA = [ADM[0], "incorrecta"];

(async () => {
 const t0 = Date.now();
 const db = await PGlite.create({ extensions: { pgcrypto } });
 await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
 const q = async (sql, p) => (await db.query(sql, p || [])).rows;
 const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
 const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };
 const nFuncions = () => val("select count(*)::int from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.proname = 'bn_admin_logs'");

 console.log("1) Aplicació idempotent i substitució de la versió vella de 3 paràmetres");
 await db.exec(SQL);
 await db.query("insert into bn_priv.admin(email, hash) values ($1, extensions.crypt($2, extensions.gen_salt('bf')))", ADM);
 // simula la base de producció d'abans: la funció vella (3 paràmetres) conviu amb la nova
 await db.exec(`create function public.bn_admin_logs(p_email text, p_pass text, p_dies int default 30) returns setof public.bn_log
                language sql security definer set search_path = '' as $$ select * from public.bn_log limit 0 $$;`);
 ok((await nFuncions()) === 2, "abans de tornar a aplicar el fitxer hi ha 2 versions (la vella i la nova)");
 await db.exec(SQL);
 await db.exec(SQL);
 ok((await nFuncions()) === 1, "després d'aplicar-lo (dues vegades) només en queda una");
 ok((await val("select pg_get_function_identity_arguments('public.bn_admin_logs'::regproc)")) === "p_email text, p_pass text, p_dies integer, p_des_id bigint",
  "la que queda té el paràmetre p_des_id");
 ok((await val("select has_function_privilege('anon', 'public.bn_admin_logs(text,text,int,bigint)', 'execute')")) === true, "anon la pot executar");
 ok(/acces denegat/.test(await falla("select * from public.bn_admin_logs($1, $2)", DOLENTA) || ""), "contrasenya incorrecta → acces denegat");

 console.log("2) Sense p_des_id, tot el període; amb p_des_id, només les files noves");
 const ins = (nom, h) => db.query(`insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall)
   values (now() - make_interval(mins => $2), 'socials', $1, 's', 'a', 'entra', '{}'::jsonb)`, [nom, Math.round(h * 60)]);
 for (let i = 0; i < 10; i++) await ins("Nen" + i, 30 - i);   // 10 files dins dels 7 dies
 await ins("Vell", 24 * 40);                                     // una fora del període de 30 dies
 const tot = await q("select * from public.bn_admin_logs($1, $2, 30)", ADM);
 ok(tot.length === 10 && tot[0].nom === "Nen9", `sense p_des_id torna les 10 del període, la més nova primer (${tot.length})`);
 const tres = await q("select * from public.bn_admin_logs($1, $2)", ADM);
 ok(tres.length === 10, "la crida d'un tauler vell (només correu i contrasenya, o amb 3 paràmetres) continua funcionant");
 const maxId = Math.max(...tot.map(r => +r.id));
 await ins("Nou1", 0.5); await ins("Nou2", 0.1);
 const nous = await q("select * from public.bn_admin_logs($1, $2, 30, $3)", [...ADM, maxId]);
 ok(nous.length === 2 && nous.map(r => r.nom).join(",") === "Nou2,Nou1", `amb p_des_id=${maxId} només torna les 2 files noves (${nous.map(r => r.nom).join(",")})`);
 const res = await q("select * from public.bn_admin_logs($1, $2, 30, $3)", [...ADM, Math.max(...nous.map(r => +r.id))]);
 ok(res.length === 0, "amb l'id més nou no torna res");
 const nul = await q("select * from public.bn_admin_logs($1, $2, 30, null)", ADM);
 ok(nul.length === 12, "p_des_id null és com no posar-lo (12 files)");
 const curt = await q("select * from public.bn_admin_logs($1, $2, 1, $3)", [...ADM, 0]);
 ok(curt.length === 2 + curt.filter(r => !/^Nou/.test(r.nom)).length && curt.every(r => r.nom !== "Vell"), "p_des_id respecta el període (p_dies)");

 console.log(`\n${fallades ? "✗ " + fallades + " fallades" : "✓ Totes les comprovacions de bn_admin_logs amb p_des_id superades"} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
 process.exit(fallades ? 1 : 0);
})();
