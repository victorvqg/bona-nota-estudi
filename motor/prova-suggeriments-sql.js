#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL de suggeriments (supabase/bn_suggeriments.sql) amb PGlite.
// Ús: node motor/prova-suggeriments-sql.js
const fs = require("fs"), path = require("path");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")); }
catch (e) { console.error("✗ Falta PGlite (@electric-sql/pglite)."); process.exit(1); }

const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg); } };
const ADM = ["admin@prova.cat", "contrasenya-de-prova"], DOLENTA = [ADM[0], "dolenta"];

(async () => {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  const q = async (sql, p) => (await db.query(sql, p || [])).rows;
  const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined; };
  const falla = async (sql, p) => { try { await db.query(sql, p || []); return null; } catch (e) { return e.message || String(e); } };
  const envia = (cat, mon, rol, msg, mail, url, hash, trap = "") =>
    val("select public.bn_suggeriment_envia($1,$2,$3,$4,$5,$6,$7,$8) r", [cat, mon, rol, msg, mail, url, hash, trap]);

  // Base mínima: rols anon/authenticated + taula bn_priv.admin_ok
  await db.exec(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
    end $$;
    create schema if not exists bn_priv;
    create or replace function bn_priv.admin_ok(p_email text, p_pass text) returns void language plpgsql as $$
    begin
      if lower(trim(coalesce(p_email,''))) <> 'admin@prova.cat' or coalesce(p_pass,'') <> 'contrasenya-de-prova' then
        raise exception 'Credencials incorrectes';
      end if;
    end $$;
  `);

  console.log("1) Idempotència de bn_suggeriments.sql");
  await db.exec(fitxer("supabase/bn_suggeriments.sql"));
  await db.exec(fitxer("supabase/bn_suggeriments.sql"));
  ok(true, "executat dues vegades sense errors");

  console.log("2) Validacions, honeypot i privacitat de menors");
  const rTrap = await envia("idea", null, "familia", "Un missatge de bot amb camp trampa", "bot@a.cat", "/suggeriments/", "hash1", "http://spam");
  ok(rTrap.ok === true && rTrap.ref === "SUG-000", "honeypot descarta silenciosament");
  ok((await val("select count(*)::int from bn_priv.suggeriments")) === 0, "el honeypot no desa res a la taula");

  const rCurt = await envia("idea", null, "familia", "curt", null, null, "hash1");
  ok(rCurt.ok === false && rCurt.codi === "curt", "rebutja missatges < 10 caràcters");

  const rCat = await envia("inventada", null, "familia", "Missatge prou llarg de prova", null, null, "hash1");
  ok(rCat.ok === false && rCat.codi === "categoria", "rebutja categories no vàlides");

  const rMail = await envia("familia", null, "familia", "Missatge prou llarg de prova", "no-es-email", null, "hash1");
  ok(rMail.ok === false && rMail.codi === "email", "rebutja correus mal formats");

  const rAlumne = await envia("error", "prehistoria", "alumne", "Hi ha una falta a la pregunta 3 del tema 1", "nen@prova.cat", "/sociales/prehistoria/", "hash_alumne");
  ok(rAlumne.ok === true && rAlumne.ref === "SUG-001", "alumne pot enviar error: " + rAlumne.ref);
  const mailGuardat = await val("select email from bn_priv.suggeriments where id = 1");
  ok(mailGuardat === null, "privacitat menors: el correu s'esborra automàticament si rol=alumne");

  console.log("3) Duplicats i rate limit (3/hora)");
  const rDup = await envia("error", "prehistoria", "alumne", "Hi ha una falta a la pregunta 3 del tema 1", null, null, "hash_alumne");
  ok(rDup.ok === false && rDup.codi === "duplicat", "bloqueja duplicat exacte en 10 min");

  const r2 = await envia("idea", "enters", "familia", "Seria genial tenir un joc nou de fraccions!", "mare@casa.cat", "/suggeriments/", "hash_alumne");
  const r3 = await envia("familia", null, "docent", "Podem fer servir Bona Nota a classe amb projector?", "profe@insti.cat", "/pares/", "hash_alumne");
  const r4 = await envia("idea", null, "familia", "Quart missatge en menys d'una hora ha de fallar", null, null, "hash_alumne");
  ok(r2.ok && r3.ok, "2n i 3r enviament acceptats");
  ok(r4.ok === false && r4.codi === "massa_rapid", "4t enviament en 60 min bloquejat (rate limit)");

  console.log("4) Admin CRUD i permisos anon");
  const errBad = await falla("select public.bn_admin_suggeriments($1,$2,null)", DOLENTA);
  ok(!!errBad, "admin rebutja credencials dolentes");

  const llista = await val("select public.bn_admin_suggeriments($1,$2,null) r", ADM);
  ok(llista.compt.tot === 3 && llista.compt.nou === 3 && llista.items.length === 3, "admin llegeix els 3 suggeriments i comptadors");

  const upd = await val("select public.bn_admin_suggeriment_estat($1,$2,$3,$4,$5) r", [...ADM, 1, "fet", "Corregit al PR #161"]);
  ok(upd.ok === true && upd.estat === "fet", "admin canvia estat i desa nota");

  const llistaFet = await val("select public.bn_admin_suggeriments($1,$2,'fet') r", ADM);
  ok(llistaFet.items.length === 1 && llistaFet.items[0].nota_admin === "Corregit al PR #161" && llistaFet.compt.nou === 2, "filtre per estat i nota interna correctes");

  // Permisos anon: NO pot llegir bn_priv.suggeriments directament
  await db.exec("set role anon");
  const errAnon = await falla("select * from bn_priv.suggeriments");
  ok(!!errAnon, "anon NO pot fer SELECT sobre bn_priv.suggeriments");
  await db.exec("reset role");

  if (fallades) { console.log(`\n✗ ${fallades} fallades`); process.exit(1); }
  console.log("\n✓ Totes les comprovacions SQL de suggeriments superades");
})();
