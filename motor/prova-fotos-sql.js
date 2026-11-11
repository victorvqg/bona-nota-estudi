#!/usr/bin/env node
// Bona Nota · prova automàtica de supabase/bn_fotos.sql dins de PGlite (Postgres de prova, sense xarxa).
// Ús: node motor/prova-fotos-sql.js
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l amb: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }
const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };

(async () => {
 const db = await PGlite.create({ extensions: { pgcrypto } });
 const q = async (sql, p) => (await db.query(sql, p || [])).rows;
 const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
 const falla = async sql => { try { await db.exec(sql); return null } catch (e) { return e.message || String(e) } };

 await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema extensions; create extension pgcrypto with schema extensions;
 `);
 await db.exec(fitxer("supabase/bn_log.sql"));
 await db.exec(`
  create table bn_priv.perfils(k text primary key, nom text not null, pin text not null, pin_v smallint not null default 1, pin_ts timestamptz);
  create table bn_priv.intents(k text primary key, n int not null default 0, ts timestamptz not null default now());
  create table bn_priv.progres(k text not null, assig text not null, estat jsonb, mod bigint, primary key (k, assig));
  revoke all on bn_priv.perfils, bn_priv.intents, bn_priv.progres from public, anon, authenticated;
 `);
 // treu el pg_sleep(1) en local perquè la prova de 5 intents vagi a l'instant
 await db.exec(fitxer("supabase/bn_ranking_net.sql"));
 await db.exec(fitxer("supabase/bn_pin_nou.sql").replace(/perform pg_sleep\([^)]+\);/g, ""));

 console.log("1) bn_fotos.sql és idempotent i tanca permisos a anon/authenticated");
 let e1 = await falla(fitxer("supabase/bn_fotos.sql")), e2 = await falla(fitxer("supabase/bn_fotos.sql"));
 ok(e1 === null && e2 === null, "s'executa dues vegades sense errors" + (e1 || e2 || ""));
 ok((await falla("set local role anon; select * from public.bn_fotos")) !== null, "anon no pot llegir bn_fotos");
 ok((await falla("set local role anon; select public.bn_foto_permis('Biel','1234A',10,200)")) !== null, "anon no pot cridar bn_foto_permis");

 console.log("2) comprovació de PIN, límits per nen i total, retorn de foto i bloqueig als 5 intents");
 await val("select public.bn_perfil_crea('Biel', '1234A')");
 await val("select public.bn_perfil_crea('Nora', '5678B')");

 let r = await val("select public.bn_foto_permis('Biel', '1234A', 2, 3)");
 ok(r.ok === true && r.queden === 1 && r.max === 2, "1a foto de Biel acceptada (queden 1 de 2)");
 r = await val("select public.bn_foto_permis('Biel', '1234A', 2, 3)");
 ok(r.ok === true && r.queden === 0, "2a foto de Biel acceptada (queden 0)");
 r = await val("select public.bn_foto_permis('Biel', '1234A', 2, 3)");
 ok(r.ok === false && r.motiu === "limit", "3a foto de Biel aturada pel límit individual");

 await q("select public.bn_foto_torna('Biel')");
 r = await val("select public.bn_foto_permis('Biel', '1234A', 2, 3)");
 ok(r.ok === true && r.queden === 0, "bn_foto_torna retorna el torn si la IA no ha pogut respondre");

 r = await val("select public.bn_foto_permis('Nora', '5678B', 2, 3)");
 ok(r.ok === true, "1a foto de Nora acceptada (total app = 3)");
 r = await val("select public.bn_foto_permis('Nora', '5678B', 2, 3)");
 ok(r.ok === false && r.motiu === "limit_total", "següent foto aturada pel límit total de l'app (3)");

 for (let i = 0; i < 5; i++) {
  r = await val("select public.bn_foto_permis('Nora', '0000Z', 10, 200)");
  ok(r.ok === false && r.motiu === "pin", `intent fallit ${i + 1}/5 retorna motiu='pin' i es conserva`);
 }
 r = await val("select public.bn_foto_permis('Nora', '5678B', 10, 200)");
 ok(r.ok === false && r.motiu === "bloquejat", "al 6è intent retorna motiu='bloquejat' fins i tot amb el PIN bo");

 await db.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : "\n✓ Totes les comprovacions de bn_fotos.sql passen");
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
