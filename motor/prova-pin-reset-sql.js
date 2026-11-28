#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de recuperació i gestió de PIN perdut (supabase/bn_pin_reset.sql, g41)
// dins d'un Postgres de prova (PGlite).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-pin-reset-sql.js
// Comprova:
//   1) Idempotència (dues execucions consecutives sense errors)
//   2) Autenticació d'admin a bn_admin_usuari ('posapin', 'posapin_fix', 'desbloqueja') i bn_admin_pins
//   3) 'posapin' sobre un perfil existent conserva id, creat, aspecte i aspecte_ts, posa pin_temp=true i neteja intents
//   4) 'posapin' sobre un nen sense perfil crea el perfil amb pin_temp=true; 'posapin_fix' posa pin_temp=false
//   5) Validacions: rebutja formats invàlids, '4587R' i noms prohibits
//   6) 'bn_progres_llegeix' torna pin_temp=true amb el PIN temporal i pin_temp=false després de 'bn_perfil_canvia_pin'
//   7) 'bn_perfil_canvia_pin' rebutja '4587R' ('exemple') i repetir el mateix PIN temporal ('mateix'), i conserva intents en error
//   8) 'desbloqueja' aixeca el bloqueig de 5 intents sense canviar el PIN; 'estat' retorna +8 (temp) i +16 (bloquejat)
//   9) 'bn_admin_pins' retorna tots els nens (perfils ∪ bn_log, sense prohibits) ordenats i amb tots els camps, i 'bn_admin_fitxa' porta pin_temp

const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l amb: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }

const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
let fallades = 0, passades = 0;
const ok = (cond, msg) => { if (cond) { passades++; console.log("  ✓", msg) } else { fallades++; console.log("  ✗", msg) } };
const ADM = ["admin@prova.cat", "contrasenya-de-prova"];
const DOLENTA = [ADM[0], "incorrecta"];

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

  for (const f of [
    "supabase/bn_ranking_net.sql",
    "supabase/bn_pin_nou.sql",
    "supabase/bn_admin_tauler.sql",
    "supabase/bn_aspecte.sql",
    "supabase/bn_admin_reinicia.sql",
    "supabase/bn_admin_fitxa.sql"
  ]) {
    await db.exec(fitxer(f));
  }
  await db.query("insert into bn_priv.admin(email, hash) values ($1, extensions.crypt($2, extensions.gen_salt('bf')))", ADM);

  const q = async (sql, p) => (await db.query(sql, p || [])).rows;
  const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
  const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };
  const executa = async sql => { try { await db.exec(sql); return null } catch (e) { return e.message || String(e) } };

  console.log("1) Idempotència de supabase/bn_pin_reset.sql");
  {
    const sql = fitxer("supabase/bn_pin_reset.sql");
    const e1 = await executa(sql);
    const e2 = await executa(sql);
    ok(e1 === null && e2 === null, "bn_pin_reset.sql s'executa dues vegades sense errors" + (e1 || e2 ? `: ${e1 || e2}` : ""));
  }

  console.log("2) Autenticació d'admin i validacions");
  {
    const e1 = await falla("select public.bn_admin_usuari($1, $2, 'Rachita', 'posapin', '7392K')", DOLENTA);
    const e2 = await falla("select public.bn_admin_pins($1, $2)", DOLENTA);
    ok(e1 && /acces denegat/i.test(e1) && e2 && /acces denegat/i.test(e2), "credencials d'admin dolentes rebutjades");

    const eFmt = await falla("select public.bn_admin_usuari($1, $2, 'Rachita', 'posapin', '1234')", ADM);
    const eEx  = await falla("select public.bn_admin_usuari($1, $2, 'Rachita', 'posapin', '4587R')", ADM);
    const eNom = await falla("select public.bn_admin_usuari($1, $2, 'tast', 'posapin', '7392K')", ADM);
    ok(eFmt && /pin no valid/i.test(eFmt), "rebutja PIN sense lletra (4 xifres)");
    ok(eEx && /exemple/i.test(eEx), "rebutja el PIN d'exemple 4587R");
    ok(eNom && /nom no permes/i.test(eNom), "rebutja noms prohibits");
  }

  console.log("3) posapin conserva id, creat, aspecte i aspecte_ts, i neteja intents");
  {
    await val("select public.bn_perfil_crea('Rachita', '1111A')");
    await val("select public.bn_aspecte_desa('Rachita', '1111A', '{\"av\":\"fox\",\"marc\":\"or\"}'::jsonb)");
    await q("insert into bn_priv.progres(k, assig, estat, mod, ts) values ('rachita', 'socials', '{\"punts\":150}'::jsonb, 9999, now())");
    await q("insert into bn_priv.intents(k, n, ts) values ('rachita', 5, now())");

    const abans = (await q("select id, creat, aspecte, aspecte_ts from bn_priv.perfils where k = 'rachita'"))[0];
    const estBloq = await val("select public.bn_admin_usuari($1, $2, 'Rachita', 'estat')", ADM);
    ok((estBloq & 16) === 16 && (estBloq & 8) === 0, `abans de posapin, estat marca bloquejat (+16) i no temporal (${estBloq})`);

    const r = await val("select public.bn_admin_usuari($1, $2, 'Rachita', 'posapin', '7392k')", ADM);
    ok(r === 1, "posapin retorna 1 i normalitza el PIN a majúscules");

    const despres = (await q("select id, creat, aspecte, aspecte_ts, pin_v, pin_temp from bn_priv.perfils where k = 'rachita'"))[0];
    ok(String(despres.id) === String(abans.id), "conserva exactament el mateix id (#N)");
    ok(String(despres.creat) === String(abans.creat), "conserva exactament la data original creat");
    ok(JSON.stringify(despres.aspecte) === JSON.stringify(abans.aspecte) && String(despres.aspecte_ts) === String(abans.aspecte_ts), "conserva intacte l'aspecte arcade i aspecte_ts");
    ok(despres.pin_v === 2 && despres.pin_temp === true, "marca pin_v = 2 i pin_temp = true");
    ok((await val("select count(*)::int from bn_priv.intents where k = 'rachita'")) === 0, "esborra el bloqueig d'intents en assignar PIN nou");

    const estTemp = await val("select public.bn_admin_usuari($1, $2, 'Rachita', 'estat')", ADM);
    ok((estTemp & 2) === 2 && (estTemp & 4) === 4 && (estTemp & 8) === 8 && (estTemp & 16) === 0, `després de posapin, estat porta +2 +4 +8 i sense +16 (${estTemp})`);

    // el PIN antic ja no serveix, el nou sí
    const rVell = await val("select public.bn_progres_llegeix('Rachita', '1111A', 'socials')");
    ok(rVell && rVell.ok === false && rVell.codi === "pin", "el PIN antic deixa de funcionar immediatament");
    const rNou = await val("select public.bn_progres_llegeix('Rachita', '7392K', 'socials')");
    ok(rNou && rNou.pin_temp === true && rNou.estat && rNou.estat.punts === 150, "el PIN temporal recupera el progrés al núvol i torna pin_temp = true");
  }

  console.log("4) bn_perfil_canvia_pin desactiva pin_temp i valida regles");
  {
    const rEx = await val("select public.bn_perfil_canvia_pin('Rachita', '7392K', '4587R')");
    ok(rEx === "exemple", "rebutja triar el PIN d'exemple 4587R");

    const rMat = await val("select public.bn_perfil_canvia_pin('Rachita', '7392K', '7392K')");
    ok(rMat === "mateix", "rebutja repetir el mateix PIN temporal");

    // error de PIN actual conserva l'intent fallit (docs/TRAMPES.md)
    const rDol = await val("select public.bn_perfil_canvia_pin('Rachita', '0000Z', '8844M')");
    const nInt = await val("select n from bn_priv.intents where k = 'rachita'");
    ok(rDol === "pin" && nInt === 1, "PIN actual erroni retorna 'pin' i conserva l'intent a bn_priv.intents");

    const rOk = await val("select public.bn_perfil_canvia_pin('Rachita', '7392K', '8844M')");
    ok(rOk === "ok", "canvi a un PIN personal nou torna 'ok'");

    const rLlegeix = await val("select public.bn_progres_llegeix('Rachita', '8844M', 'socials')");
    ok(rLlegeix && rLlegeix.pin_temp === false && rLlegeix.estat.punts === 150, "després del canvi, pin_temp torna a ser false");

    const estDef = await val("select public.bn_admin_usuari($1, $2, 'Rachita', 'estat')", ADM);
    ok((estDef & 8) === 0 && (estDef & 6) === 6, `estat ja no té bit +8 (${estDef})`);
  }

  console.log("5) posapin sobre nen sense perfil, posapin_fix i desbloqueja");
  {
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now(), 'socials', 'SensePin', 's1', 'a1', 'entra', '{}'::jsonb)");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now(), 'socials', 'Biel', 's2', 'a2', 'entra', '{}'::jsonb)");
    await val("select public.bn_admin_usuari($1, $2, 'Biel', 'posapin_fix', '6204P')", ADM);
    const pfBiel = (await q("select pin_v, pin_temp from bn_priv.perfils where k = 'biel'"))[0];
    ok(pfBiel && pfBiel.pin_v === 2 && pfBiel.pin_temp === false, "posapin_fix crea el perfil com a definitiu (pin_temp = false)");

    // bloqueig de 5 intents sobre Biel + desbloqueja sense canviar PIN
    for (let i = 0; i < 5; i++) await val("select public.bn_progres_llegeix('Biel', '0000Z', 'socials')");
    const errBloq = await falla("select public.bn_progres_llegeix('Biel', '6204P', 'socials')");
    ok(errBloq && /massa intents/i.test(errBloq), "Biel queda bloquejat després de 5 intents fallits");

    const d = await val("select public.bn_admin_usuari($1, $2, 'Biel', 'desbloqueja')", ADM);
    ok(d === 1, "desbloqueja retorna 1");
    const rBiel = await val("select public.bn_progres_llegeix('Biel', '6204P', 'socials')");
    ok(rBiel && rBiel.pin_temp === false, "després de desbloqueja, Biel torna a entrar amb el mateix PIN");
  }

  console.log("6) bn_admin_pins i bn_admin_fitxa");
  {
    // Posem un nen amb PIN antic (pin_v = 1) i un bloquejat
    await val("select public.bn_perfil_crea('Pau', '1234')");
    await q("insert into bn_priv.intents(k, n, ts) values ('pau', 5, now())");
    await val("select public.bn_admin_usuari($1, $2, 'Laia', 'posapin', '5512C')", ADM);

    const llista = await val("select public.bn_admin_pins($1, $2)", ADM);
    ok(Array.isArray(llista) && llista.length >= 5, `bn_admin_pins torna tots els nens (${llista && llista.length})`);
    const byK = Object.fromEntries(llista.map(x => [x.k, x]));
    ok(byK.pau && byK.pau.pin_v === 1 && byK.pau.bloquejat_fins > Date.now() && byK.pau.intents_n === 5, "Pau surt amb pin_v = 1 i bloquejat_fins futur");
    ok(byK.laia && byK.laia.pin_temp === true && byK.laia.te_pin === true, "Laia surt amb pin_temp = true");
    ok(byK.sensepin && byK.sensepin.te_pin === false && byK.sensepin.ult_log > 0, "SensePin (només al log) surt amb te_pin = false");
    ok(llista[0].k === "pau", `l'ordre posa primer els bloquejats (primer: ${llista[0].k})`);

    const fitxaLaia = await val("select public.bn_admin_fitxa($1, $2, 'Laia')", ADM);
    ok(fitxaLaia && fitxaLaia.perfil && fitxaLaia.perfil.pin_temp === true, "bn_admin_fitxa inclou perfil.pin_temp = true");
  }

  console.log(`\n${fallades === 0 ? "✓" : "✗"} prova-pin-reset-sql: ${passades} passades, ${fallades} fallades`);
  process.exit(fallades ? 1 : 0);
})();
