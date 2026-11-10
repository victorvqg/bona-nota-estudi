#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de l'embut d'alta (supabase/bn_admin_alta.sql) dins d'un Postgres de prova (PGlite).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-admin-alta-sql.js
// Casos:
//   1) Idempotència (executar bn_admin_alta.sql dues vegades sense error) i check d'event='alta' a public.bn_log.
//   2) Contrasenya d'admin incorrecta a bn_admin_alta_embut.
//   3) Seguretat del trigger aa_bn_log_alta_net:
//      - força assig='portada';
//      - força nom='_alta' i aparell='alta:...' en els passos d'abans de tenir perfil ('nom' i 'pin_ko'), encara que el client enviï un nom real;
//      - neteja detall perquè mai quedi punts, fonts, pin ni cap clau o motiu fora de la llista blanca;
//      - rebutja un pas d'alta desconegut.
//   4) Exclusió de 'alta' i '_alta' a bn_ranking, bn_admin_resum, bn_admin_altes (primer registre queda null si encara no ha jugat a cap món) i bn_admin_benestar.
//   5) Càlcul de bn_admin_alta_embut (aparells, passos, motius i directes_mon) per període.
//   6) Permisos (anon pot inserir event='alta' a bn_log i cridar bn_admin_alta_embut, però no bn_priv.bn_log_alta_net).

const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite. Instal·la'l amb: npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }

const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
const SQL = fitxer("supabase/bn_admin_alta.sql");
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
    "supabase/bn_aspecte.sql",
    "supabase/bn_admin_fitxa.sql",
    "supabase/bn_admin_benestar.sql"
  ]) {
    await db.exec(fitxer(f));
  }
  await db.query("insert into bn_priv.admin(email, hash) values ($1, extensions.crypt($2, extensions.gen_salt('bf')))", ADM);

  const q = async (sql, p) => (await db.query(sql, p || [])).rows;
  const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
  const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };
  const executa = async sql => { try { await db.exec(sql); return null } catch (e) { return e.message || String(e) } };
  const embut = (per = "30d", cred = ADM) => val("select public.bn_admin_alta_embut($1, $2, $3)", [...cred, per]);

  console.log("1) abans del SQL, 'alta' és rebutjat pel check de bn_log; després d'aplicar bn_admin_alta.sql dues vegades, s'accepta");
  {
    const errAbans = await falla("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('portada', '_alta', 's1', 'ap1', 'alta', '{\"pas\":\"nom\",\"ok\":1}')");
    ok(errAbans !== null, "abans del SQL, event='alta' falla pel check constraint");
    const e1 = await executa(SQL);
    ok(e1 === null, "primera execució de bn_admin_alta.sql sense errors" + (e1 ? ": " + e1 : ""));
    const e2 = await executa(SQL);
    ok(e2 === null, "segona execució idempotent de bn_admin_alta.sql sense errors" + (e2 ? ": " + e2 : ""));
  }

  console.log("2) contrasenya d'admin incorrecta a bn_admin_alta_embut");
  {
    const err = await falla("select public.bn_admin_alta_embut($1, $2, '7d')", DOLENTA);
    ok(err && /acces denegat/i.test(err), "contrasenya dolenta rebutjada amb acces denegat");
  }

  console.log("3) trigger aa_bn_log_alta_net: neteja detall, força _alta abans de perfil i mai guarda PIN ni punts");
  {
    // Intent maliciós o erroni d'enviar nom real, punts, fonts i pin en un pas 'pin_ko'
    await q(
      "insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('socials', 'Laia', 's1', 'ap1', 'alta', $1::jsonb)",
      [JSON.stringify({ pas: "pin_ko", ok: 1, motiu: "exemple", pin: "4587R", punts: 999, fonts: { combo: 50 }, extra: "secret" })]
    );
    const r1 = (await q("select assig, nom, aparell, detall from public.bn_log where event = 'alta' order by id desc limit 1"))[0];
    ok(r1.assig === "portada", "assig forçat a 'portada'");
    ok(r1.nom === "_alta", "en pas 'pin_ko' el nom es força sempre a '_alta' (mai guarda el nom escrit abans de tenir perfil)");
    ok(r1.aparell === "alta:ap1", "en pas pre-perfil l'aparell porta el prefix 'alta:'");
    ok(JSON.stringify(r1.detall) === JSON.stringify({ ok: 0, pas: "pin_ko", motiu: "exemple" }), "detall netejat: sense pin, sense punts, sense fonts i ok=0 en pin_ko");

    // Motiu fora de la llista blanca (p. ex. si algú hi posés el PIN per error) s'esborra
    await q(
      "insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('portada', 'NomInventat', 's1', 'ap1', 'alta', $1::jsonb)",
      [JSON.stringify({ pas: "nom", ok: 0, motiu: "1234A" })]
    );
    const r2 = (await q("select nom, detall from public.bn_log where event = 'alta' order by id desc limit 1"))[0];
    ok(r2.nom === "_alta", "en pas 'nom' el nom es força sempre a '_alta'");
    ok(!("motiu" in r2.detall) && r2.detall.ok === 0 && r2.detall.pas === "nom", "motiu desconegut (possible PIN) s'elimina del detall");

    // Pas desconegut és rebutjat
    const errPas = await falla("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('portada', '_alta', 's1', 'ap1', 'alta', '{\"pas\":\"inventat\"}')");
    ok(errPas && /pas d alta no valid/i.test(errPas), "pas d'alta desconegut és rebutjat");
  }

  console.log("4) exclusió d'_alta i d'alta al rànquing, resum del tauler, altes i benestar");
  {
    await db.exec("delete from public.bn_log;");
    // Aparell ap1: prova nom (ko per prohibit), escriu nom (ok), falla pin (exemple), crea perfil i PIN, i tria perfil arcade
    await val("select public.bn_perfil_crea('Laia', '4587A')");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '2 hours', 'portada', '_alta', 's1', 'alta:ap1', 'alta', '{\"pas\":\"nom\",\"ok\":0,\"motiu\":\"prohibit\"}')");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '2 hours', 'portada', '_alta', 's1', 'alta:ap1', 'alta', '{\"pas\":\"nom\",\"ok\":1}')");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '2 hours', 'portada', '_alta', 's1', 'alta:ap1', 'alta', '{\"pas\":\"pin_ko\",\"ok\":0,\"motiu\":\"exemple\"}')");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '2 hours', 'portada', 'Laia', 's1', 'ap1', 'alta', '{\"pas\":\"pin_creat\",\"ok\":1}')");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '1 hour', 'portada', 'Laia', 's1', 'ap1', 'alta', '{\"pas\":\"perfil\",\"ok\":1}')");

    // Encara NO ha jugat a cap món:
    const rk = await q("select * from public.bn_ranking()");
    ok(rk.length === 0, "bn_ranking no mostra ni _alta ni Laia si només té events 'alta'");

    const res = await val("select public.bn_admin_resum($1, $2, '7d', null, null)", ADM);
    ok(res.ara.nens === 0 && res.ara.sessions === 0, "bn_admin_resum no compta _alta ni els events 'alta' com a sessions d'estudi");

    const alt = await val("select public.bn_admin_altes($1, $2, '7d')", ADM);
    ok(alt.length === 1 && alt[0].k === "laia" && alt[0].primer === null, "bn_admin_altes mostra la Laia amb primer=null (encara no ha jugat a cap món) i exclou _alta");

    const ben = await val("select public.bn_admin_benestar($1, $2, '7d', null)", ADM);
    ok(ben.nens.length === 0 && ben.mons.length === 0, "bn_admin_benestar exclou _alta i l'assig 'portada' dels events 'alta'");
  }

  console.log("5) càlcul complet de bn_admin_alta_embut (aparells, passos, motius i directes_mon)");
  {
    // Aparell ap2: s'encalla al PIN (format i incorrecte) i no arriba a crear perfil
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '3 hours', 'portada', '_alta', 's2', 'alta:ap2', 'alta', '{\"pas\":\"nom\",\"ok\":1}')");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '3 hours', 'portada', '_alta', 's2', 'alta:ap2', 'alta', '{\"pas\":\"pin_ko\",\"ok\":0,\"motiu\":\"format\"}')");
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '3 hours', 'portada', '_alta', 's2', 'alta:ap2', 'alta', '{\"pas\":\"pin_ko\",\"ok\":0,\"motiu\":\"incorrecte\"}')");

    // Aparell ap3: nen amb PIN antic ('Marc') que entra i prem «Ara no» al canvi de PIN
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '1 hour', 'portada', 'Marc', 's3', 'ap3', 'alta', '{\"pas\":\"pin_ara_no\",\"ok\":1}')");

    // Aparell ap4: nen ('Nil') que entra directament a un món per enllaç directe sense passar per la portada (cap event 'alta')
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '30 minutes', 'socials', 'Nil', 's4', 'ap4', 'entra', '{\"punts\":10}')");
    // I la Laia (ap1) ara entra a jugar a socials (sí que havia passat per 'alta')
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '20 minutes', 'socials', 'Laia', 's1', 'ap1', 'entra', '{\"punts\":20}')");

    // Event antic (de fa 20 dies) que no ha d'entrar a '7d' però sí a '30d'
    await q("insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (now() - interval '20 days', 'portada', '_alta', 's9', 'alta:ap9', 'alta', '{\"pas\":\"nom\",\"ok\":0,\"motiu\":\"massa_noms\"}')");

    const e7 = await embut("7d");
    ok(e7.periode === "7d", "periode 7d retornat");
    ok(e7.resum.aparells === 3, "3 aparells amb alta en 7d (ap1, ap2, ap3)");
    ok(e7.resum.nom_ok === 2 && e7.resum.nom_ko === 1, "nom_ok=2 (ap1, ap2) i nom_ko=1 (ap1)");
    ok(e7.resum.pin_creat === 1 && e7.resum.pin_ko === 2, "pin_creat=1 (Laia) i pin_ko=2 aparells (ap1, ap2)");
    ok(e7.resum.perfil === 1 && e7.resum.pin_ara_no === 1, "perfil=1 (Laia) i pin_ara_no=1 (Marc)");
    ok(e7.resum.directes_mon === 1, "directes_mon=1 (Nil va entrar a socials sense passar per alta; Laia sí que hi havia passat)");

    const mNom = e7.passos.find(p => p.pas === "nom");
    const mPinKo = e7.passos.find(p => p.pas === "pin_ko");
    ok(mNom && mNom.total === 3 && mNom.ok === 2 && mNom.ko === 1 && mNom.motius.prohibit === 1, "pas 'nom' en 7d: 3 intents (2 ok, 1 ko per prohibit)");
    ok(mPinKo && mPinKo.total === 3 && mPinKo.aparells === 2 && mPinKo.motius.exemple === 1 && mPinKo.motius.format === 1 && mPinKo.motius.incorrecte === 1, "pas 'pin_ko' en 7d: 3 errors en 2 aparells (exemple, format, incorrecte)");

    const e30 = await embut("30d");
    const mNom30 = e30.passos.find(p => p.pas === "nom");
    ok(e30.resum.aparells === 4 && mNom30.motius.massa_noms === 1, "en 30d s'inclou ap9 amb motiu massa_noms");
  }

  console.log("6) permisos per a anon");
  {
    await db.exec("set role anon;");
    const errIns = await falla("insert into public.bn_log(assig, nom, sessio, aparell, event, detall) values ('portada', '_alta', 'sa', 'alta:apa', 'alta', '{\"pas\":\"nom\",\"ok\":1}')");
    ok(errIns === null, "anon pot inserir events 'alta' a public.bn_log");
    const rAnon = await embut("7d");
    ok(rAnon && rAnon.resum.aparells === 4, "anon pot cridar bn_admin_alta_embut amb credencials d'admin");
    const errPriv = await falla("select bn_priv.bn_log_alta_net()");
    ok(errPriv !== null, "anon no pot cridar directament bn_priv.bn_log_alta_net()");
    await db.exec("reset role;");
  }

  if (fallades) {
    console.error(`✗ ${fallades} errors de ${passades + fallades}`);
    process.exit(1);
  }
  console.log(`✓ prova-admin-alta-sql: ${passades} comprovacions passades`);
})();
