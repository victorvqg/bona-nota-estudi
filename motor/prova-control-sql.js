#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de control (supabase/bn_control.sql) dins d'un Postgres de prova (PGlite).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-control-sql.js
// Casos:
//   1) Idempotència (executar bn_control.sql dues vegades sense error).
//   2) Contrasenya d'admin incorrecta a bn_admin_control.
//   3) Lectura i actualització de xat_actiu, horari automàtic (tanca_min, obre_min) i mons_tancats via bn_admin_control.
//   4) Validació d'entrades a bn_admin_control (hores fora de 0..1439 o mons desconeguts).
//   5) bn_estat_web públic retorna xat_obert_ara, xat_en_horari_tancat, horari i mons_tancats.
//   6) Quan l'horari automàtic cobreix tot el dia (tanca_min = obre_min) o quan xat_actiu = false, bn_xat_envia retorna {"ok":false,"codi":"tancat"} i bn_xat_llegeix retorna actiu=false.
//   7) Permisos: anon pot cridar bn_estat_web i bn_admin_control (amb credencials), però no cap funció de bn_priv.

const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l amb: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }

const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
const SQL_CTRL = fitxer("supabase/bn_control.sql");
let fallades = 0, passades = 0;
const ok = (cond, msg) => { if (cond) { passades++; console.log("  ✓", msg) } else { fallades++; console.log("  ✗", msg) } };

const ADM = ["admin@prova.cat", "contrasenya-de-prova"], DOLENTA = [ADM[0], "dolenta"];

(async () => {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
  await db.exec(fitxer("supabase/bn_log.sql"));
  await db.exec(`create table bn_priv.perfils(k text primary key, nom text not null, pin text not null, pin_v smallint not null default 1,
                   pin_ts timestamptz, id bigint generated always as identity unique, aspecte jsonb, aspecte_ts timestamptz);
                 create table bn_priv.intents(k text primary key, n int not null default 0, ts timestamptz not null default now());
                 create table bn_priv.progres(k text not null, assig text not null, estat jsonb, mod bigint, ts timestamptz, primary key (k, assig));
                 revoke all on bn_priv.perfils, bn_priv.intents, bn_priv.progres from public, anon, authenticated;`);
  for (const f of [
    "supabase/bn_ranking_net.sql",
    "supabase/bn_ranking_sense_codi.sql",
    "supabase/bn_pin_nou.sql",
    "supabase/bn_admin_tauler.sql",
    "supabase/bn_xat.sql"
  ]) {
    await db.exec(fitxer(f));
  }
  await db.query("insert into bn_priv.admin(email, hash) values ($1, extensions.crypt($2, extensions.gen_salt('bf')))", ADM);

  const q = async (sql, p) => (await db.query(sql, p || [])).rows;
  const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
  const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };
  const executa = async sql => { try { await db.exec(sql); return null } catch (e) { return e.message || String(e) } };
  const ctrl = (cfg = null, cred = ADM) => val("select public.bn_admin_control($1, $2, $3::jsonb)", [...cred, cfg ? JSON.stringify(cfg) : null]);

  console.log("1) idempotència de supabase/bn_control.sql");
  {
    const e1 = await executa(SQL_CTRL);
    ok(e1 === null, "primera execució de bn_control.sql sense errors" + (e1 ? ": " + e1 : ""));
    const e2 = await executa(SQL_CTRL);
    ok(e2 === null, "segona execució idempotent de bn_control.sql sense errors" + (e2 ? ": " + e2 : ""));
  }

  console.log("2) contrasenya d'admin incorrecta a bn_admin_control");
  {
    const err = await falla("select public.bn_admin_control($1, $2, null)", DOLENTA);
    ok(err && /acces denegat/i.test(err), "contrasenya dolenta rebutjada amb acces denegat");
  }

  console.log("3) valors per defecte i actualització de xat, horari i mons_tancats");
  {
    const d0 = await ctrl(null);
    ok(d0.xat_actiu === true && d0.xat_obert_ara === true && d0.horari.actiu === false && Array.isArray(d0.mons_tancats) && d0.mons_tancats.length === 0,
      "per defecte: xat obert, horari desactivat (21:30–07:00) i cap món tancat");

    const d1 = await ctrl({ mons_tancats: ["socials", "divisibilitat", "socials"] });
    ok(JSON.stringify(d1.mons_tancats) === JSON.stringify(["divisibilitat", "socials"]),
      "mons_tancats desa sense duplicats i ordenats");

    const web1 = await val("select public.bn_estat_web()");
    ok(JSON.stringify(web1.mons_tancats) === JSON.stringify(["divisibilitat", "socials"]) && web1.xat_obert_ara === true,
      "bn_estat_web reflecteix de seguida els mons tancats i l'estat del xat");
  }

  console.log("4) validació d'entrades a bn_admin_control");
  {
    const eHora = await falla("select public.bn_admin_control($1, $2, '{\"tanca_min\":1500}'::jsonb)", ADM);
    ok(eHora && /tanca_min/i.test(eHora), "tanca_min fora de 0..1439 és rebutjat");
    const eMon = await falla("select public.bn_admin_control($1, $2, '{\"mons_tancats\":[\"inventat\"]}'::jsonb)", ADM);
    ok(eMon && /mon no valid/i.test(eMon), "món desconegut a mons_tancats és rebutjat");
  }

  console.log("5) horari automàtic del xat i bloqueig d'enviament i vots quan està tancat per horari");
  {
    await val("select public.bn_perfil_crea('Laia', '4587A')");
    await db.exec("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('socials', 'Laia', 's1', 'ap1', 'test', '{\"punts\":50}');");
    // tanca_min = obre_min (p. ex. 1290 = 1290) amb horari_actiu=true vol dir tancat les 24h per horari
    const dh = await ctrl({ xat_actiu: true, horari_actiu: true, tanca_min: 1290, obre_min: 1290 });
    ok(dh.xat_actiu === true && dh.xat_en_horari_tancat === true && dh.xat_obert_ara === false,
      "amb horari actiu en franja tancada, xat_en_horari_tancat=true i xat_obert_ara=false encara que xat_actiu sigui true");

    const ll = await val("select public.bn_xat_llegeix()");
    ok(ll.actiu === false, "bn_xat_llegeix retorna actiu=false quan l'horari tanca el xat");

    const env = await val("select public.bn_xat_envia('Laia', '4587A', 1, 1, null)");
    ok(env && env.codi === "tancat", "bn_xat_envia retorna codi='tancat' quan l'horari automàtic té el xat tancat");

    // Desactivem l'horari automàtic → el xat torna a estar obert
    const dObert = await ctrl({ horari_actiu: false, mons_tancats: [] });
    ok(dObert.xat_obert_ara === true && dObert.mons_tancats.length === 0, "en desactivar l'horari i buidar mons_tancats, tot torna a estar obert");
  }

  console.log("6) permisos per a anon");
  {
    await db.exec("set role anon;");
    const w = await val("select public.bn_estat_web()");
    ok(w && w.xat_obert_ara === true, "anon pot cridar bn_estat_web()");
    const c = await ctrl(null);
    ok(c && c.xat_obert_ara === true, "anon pot cridar bn_admin_control amb credencials d'admin");
    const ePriv1 = await falla("select bn_priv.mons_tancats()");
    const ePriv2 = await falla("select bn_priv.xat_obert_ara()");
    ok(ePriv1 !== null && ePriv2 !== null, "anon no pot cridar bn_priv.mons_tancats() ni bn_priv.xat_obert_ara()");
    await db.exec("reset role;");
  }

  if (fallades) {
    console.error(`✗ ${fallades} errors de ${passades + fallades}`);
    process.exit(1);
  }
  console.log(`✓ prova-control-sql: ${passades} comprovacions passades`);
})();
