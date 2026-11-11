#!/usr/bin/env node
// Bona Nota · prova automàtica del bloqueig d'intents de PIN (issue #33) dins d'un Postgres de prova (PGlite).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-pin-intents-sql.js
// Comprova que bn_aspecte_desa, bn_progres_desa, bn_progres_llegeix i bn_perfil_canvia_pin NO fan raise
// quan bn_priv.pin_ok torna false, de manera que el comptador bn_priv.intents es conserva, s'acumula fins a 5
// i al 6è intent llança 'massa intents'. També comprova que un PIN bo reinicia el comptador i que passats 15 minuts caduca.

const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l amb: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }

const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
let fallades = 0, passades = 0;
const ok = (cond, msg) => { if (cond) { passades++; console.log("  ✓", msg) } else { fallades++; console.log("  ✗", msg) } };

(async () => {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
  await db.exec(fitxer("supabase/bn_log.sql"));
  await db.exec(`create table bn_priv.perfils(k text primary key, nom text not null, pin text not null, pin_v smallint not null default 1,
                   pin_ts timestamptz, id bigint generated always as identity unique, aspecte jsonb, aspecte_ts timestamptz);
                 create table bn_priv.intents(k text primary key, n int not null default 0, ts timestamptz not null default now());
                 create table bn_priv.progres(k text not null, assig text not null, estat jsonb, mod bigint, ts timestamptz, primary key (k, assig));
                 create or replace function bn_priv.reconstrueix(p_k text, p_assig text) returns jsonb language sql stable set search_path = '' as $$ select null::jsonb $$;
                 revoke all on bn_priv.perfils, bn_priv.intents, bn_priv.progres from public, anon, authenticated;`);

  const q = async (sql, p) => (await db.query(sql, p || [])).rows;
  const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
  const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };
  const executa = async sql => { try { await db.exec(sql); return null } catch (e) { return e.message || String(e) } };

  console.log("1) idempotència dels fitxers SQL amb PIN");
  for (const f of [
    "supabase/bn_ranking_net.sql",
    "supabase/bn_pin_nou.sql",
    "supabase/bn_aspecte.sql",
    "supabase/bn_admin_reinicia.sql",
    "supabase/bn_progres_no_baixa.sql"
  ]) {
    const e1 = await executa(fitxer(f));
    const e2 = await executa(fitxer(f));
    ok(e1 === null && e2 === null, `${f} idempotent (dues execucions sense errors)` + (e1 || e2 ? `: ${e1 || e2}` : ""));
  }

  // Creem un nen de prova amb PIN 4587A
  await val("select public.bn_perfil_crea('Marti', '4587A')");
  const intentsDe = k => val("select n from bn_priv.intents where k = $1", [k.toLowerCase()]);
  const netejaIntents = k => q("delete from bn_priv.intents where k = $1", [k.toLowerCase()]);

  console.log("2) bn_aspecte_desa: 5 PIN dolents retornen 'pin' i persisteixen a bn_priv.intents; el 6è llança 'massa intents'");
  {
    await netejaIntents("marti");
    for (let i = 1; i <= 5; i++) {
      const r = await val("select public.bn_aspecte_desa('Marti', '0000Z', '{\"av\":\"fox\"}'::jsonb)");
      const n = await intentsDe("marti");
      if (r !== "pin" || n !== i) {
        ok(false, `intent ${i}: esperava r='pin' i n=${i}, però r=${JSON.stringify(r)} i n=${n}`);
      }
    }
    ok((await intentsDe("marti")) === 5, "després de 5 PIN dolents a bn_aspecte_desa, bn_priv.intents.n val 5");
    const err6 = await falla("select public.bn_aspecte_desa('Marti', '0000Z', '{\"av\":\"fox\"}'::jsonb)");
    ok(err6 && /massa intents/i.test(err6), "el 6è intent a bn_aspecte_desa queda bloquejat amb 'massa intents'");
  }

  console.log("3) bn_progres_desa: 5 PIN dolents retornen -3 i persisteixen a bn_priv.intents; el 6è llança 'massa intents'");
  {
    await netejaIntents("marti");
    for (let i = 1; i <= 5; i++) {
      const r = Number(await val("select public.bn_progres_desa('Marti', '0000Z', 'socials', '{\"punts\":10}'::jsonb, 1000)"));
      const n = await intentsDe("marti");
      if (r !== -3 || n !== i) {
        ok(false, `intent ${i}: esperava r=-3 i n=${i}, però r=${r} i n=${n}`);
      }
    }
    ok((await intentsDe("marti")) === 5, "després de 5 PIN dolents a bn_progres_desa, bn_priv.intents.n val 5");
    const err6 = await falla("select public.bn_progres_desa('Marti', '0000Z', 'socials', '{\"punts\":10}'::jsonb, 1000)");
    ok(err6 && /massa intents/i.test(err6), "el 6è intent a bn_progres_desa queda bloquejat amb 'massa intents'");
  }

  console.log("4) bn_progres_llegeix: 5 PIN dolents retornen {\"ok\":false,\"codi\":\"pin\"} i el 6è llança 'massa intents'");
  {
    await netejaIntents("marti");
    for (let i = 1; i <= 5; i++) {
      const r = await val("select public.bn_progres_llegeix('Marti', '0000Z', 'socials')");
      const n = await intentsDe("marti");
      if (!r || r.ok !== false || r.codi !== "pin" || n !== i) {
        ok(false, `intent ${i}: esperava {ok:false,codi:'pin'} i n=${i}, però r=${JSON.stringify(r)} i n=${n}`);
      }
    }
    ok((await intentsDe("marti")) === 5, "després de 5 PIN dolents a bn_progres_llegeix, bn_priv.intents.n val 5");
    const err6 = await falla("select public.bn_progres_llegeix('Marti', '0000Z', 'socials')");
    ok(err6 && /massa intents/i.test(err6), "el 6è intent a bn_progres_llegeix queda bloquejat amb 'massa intents'");
  }

  console.log("5) bn_perfil_canvia_pin: 5 PIN dolents retornen 'pin' i el 6è llança 'massa intents'");
  {
    await netejaIntents("marti");
    for (let i = 1; i <= 5; i++) {
      const r = await val("select public.bn_perfil_canvia_pin('Marti', '0000Z', '9999B')");
      const n = await intentsDe("marti");
      if (r !== "pin" || n !== i) {
        ok(false, `intent ${i}: esperava r='pin' i n=${i}, però r=${JSON.stringify(r)} i n=${n}`);
      }
    }
    ok((await intentsDe("marti")) === 5, "després de 5 PIN dolents a bn_perfil_canvia_pin, bn_priv.intents.n val 5");
    const err6 = await falla("select public.bn_perfil_canvia_pin('Marti', '0000Z', '9999B')");
    ok(err6 && /massa intents/i.test(err6), "el 6è intent a bn_perfil_canvia_pin queda bloquejat amb 'massa intents'");
  }

  console.log("6) caducitat de 15 minuts i reinici amb PIN correcte");
  {
    // Si han passat 16 minuts, el bloqueig caduca i un error posa n = 1
    await q("update bn_priv.intents set ts = now() - interval '16 minutes' where k = 'marti'");
    const rCad = await val("select public.bn_aspecte_desa('Marti', '0000Z', '{\"av\":\"fox\"}'::jsonb)");
    ok(rCad === "pin" && (await intentsDe("marti")) === 1, "passats 15 minuts el bloqueig caduca i el comptador torna a 1");

    // Un PIN correcte esborra bn_priv.intents
    const rOk = await val("select public.bn_aspecte_desa('Marti', '4587A', '{\"av\":\"fox\"}'::jsonb)");
    ok(rOk === "ok" && (await intentsDe("marti")) === undefined, "un PIN correcte desa i esborra el comptador d'intents");
  }

  console.log(`\n${fallades === 0 ? "✓" : "✗"} prova-pin-intents-sql: ${passades} passades, ${fallades} fallades`);
  process.exit(fallades ? 1 : 0);
})();
