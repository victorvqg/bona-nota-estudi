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
    const ePriv3 = await falla("select bn_priv.llindars_cfg()");
    const ePriv4 = await falla("select bn_priv.ranquing_cfg()");
    ok(ePriv1 !== null && ePriv2 !== null && ePriv3 !== null && ePriv4 !== null, "anon no pot cridar bn_priv.mons_tancats(), bn_priv.xat_obert_ara(), bn_priv.llindars_cfg() ni bn_priv.ranquing_cfg()");
    await db.exec("reset role;");
  }

  console.log("7) llindars configurables d'Alertes i Benestar (bn_admin_control + bn_admin_alertes)");
  {
    const d0 = await ctrl(null);
    ok(d0.llindars && d0.llindars.alertes.inactiu.dies_avis === 3 && d0.llindars.alertes.encallat.grav === 3 && d0.llindars.benestar.marato_bloc.min === 60,
      "per defecte bn_admin_control retorna llindars inicials complets (alertes i benestar)");

    // Rebutja valors fora de rang o estructura invàlida
    const eGrav = await falla("select public.bn_admin_control($1, $2, '{\"llindars\":{\"alertes\":{\"encallat\":{\"grav\":9}}}}'::jsonb)", ADM);
    ok(eGrav !== null, "gravetat fora de 0..3 a llindars.alertes és rebutjada");
    const eNiv = await falla("select public.bn_admin_control($1, $2, '{\"llindars\":{\"benestar\":{\"pressa\":{\"nivell\":\"blau\"}}}}'::jsonb)", ADM);
    ok(eNiv !== null, "nivell desconegut a llindars.benestar és rebutjat");
    const eDies = await falla("select public.bn_admin_control($1, $2, '{\"llindars\":{\"alertes\":{\"inactiu\":{\"dies_avis\":10,\"dies_malament\":5}}}}'::jsonb)", ADM);
    ok(eDies !== null, "dies_malament < dies_avis és rebutjat");

    // Muntem dades a bn_log per comprovar bn_admin_alertes amb llindars per defecte vs personalitzats:
    // - Pau: va entrar fa 5 dies (amb per defecte >=3d -> gravetat 2; si apugem dies_avis a 6 -> no surt; si posem grav=3 -> gravetat 3)
    // - Ona: 2 tests suspesos del mateix tema (amb vegades=3 per defecte -> no surt; amb vegades=2 i grav=2 -> surt amb gravetat 2)
    await db.exec(`
      set session_replication_role = replica;
      insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values
        (now() - interval '5 days', 'socials', 'Pau', 'sp1', 'ap1', 'entra', '{}'),
        (now() - interval '1 day',  'catala',  'Ona', 'so1', 'ap2', 'test',  '{"tema":"c1","titol":"Tema 1","mode":"tema","pc":50}'),
        (now() - interval '12 hours','catala', 'Ona', 'so2', 'ap2', 'test',  '{"tema":"c1","titol":"Tema 1","mode":"tema","pc":60}');
      set session_replication_role = origin;
    `);
    const al0 = await val("select public.bn_admin_alertes($1, $2, '30d', null, null)", ADM);
    const pau0 = al0.find(a => a.tipus === "inactiu" && a.nom === "Pau");
    const ona0 = al0.find(a => a.tipus === "encallat" && a.nom === "Ona");
    ok(pau0 && pau0.gravetat === 2 && !ona0, "amb llindars per defecte: Pau surt com inactiu (grav 2) i Ona encara no està encallada (2 < 3)");

    // Personalitzem llindars: inactiu desactivat (grav 0) i encallat a partir de 2 vegades amb gravetat 1 (informatiu)
    const d1 = await ctrl({ llindars: { alertes: { inactiu: { grav: 0, dies_avis: 4, dies_malament: 8 }, encallat: { grav: 1, vegades: 2 } }, benestar: { pressa: { nivell: "vermell", seg: 4 } } } });
    ok(d1.llindars.alertes.inactiu.grav === 0 && d1.llindars.alertes.encallat.vegades === 2 && d1.llindars.benestar.pressa.nivell === "vermell",
      "bn_admin_control desa i fusiona els llindars personalitzats");

    const al1 = await val("select public.bn_admin_alertes($1, $2, '30d', null, null)", ADM);
    const pau1 = al1.find(a => a.tipus === "inactiu" && a.nom === "Pau");
    const ona1 = al1.find(a => a.tipus === "encallat" && a.nom === "Ona");
    ok(!pau1 && ona1 && ona1.gravetat === 1, "bn_admin_alertes aplica de seguida grav=0 (desactiva inactiu) i vegades=2 amb grav=1 a encallat");

    // Restaura valors per defecte
    const dReset = await ctrl({ reset_llindars: true });
    ok(dReset.llindars.alertes.inactiu.grav === 2 && dReset.llindars.alertes.encallat.vegades === 3 && dReset.llindars.benestar.pressa.nivell === "groc",
      "reset_llindars=true restaura tots els valors inicials");
  }

  console.log("8) configuració pública del rànquing (top XX primers, pestanyes, meta i premis · g22)");
  {
    const d0 = await ctrl(null);
    ok(d0.ranquing && d0.ranquing.actiu === true && d0.ranquing.top === 10 && d0.ranquing.mostrar_propia === true &&
       d0.ranquing.pestanya_inicial === "punts" && d0.ranquing.meta_estrelles === 30 && d0.ranquing.meta_pct === 75,
      "per defecte bn_admin_control retorna ranquing inicial complet (top=10, actiu=true, meta=30⭐/75%)");

    const w0 = await val("select public.bn_estat_web()");
    ok(w0.ranquing && w0.ranquing.top === 10 && w0.ranquing.pestanyes.remuntada === true,
      "bn_estat_web exposa ranquing per defecte a la portada");

    // Rebutja valors invàlids
    ok(await falla("select public.bn_admin_control($1, $2, '{\"ranquing\":{\"top\":2}}'::jsonb)", ADM) !== null,
      "top < 3 és rebutjat");
    ok(await falla("select public.bn_admin_control($1, $2, '{\"ranquing\":{\"top\":150}}'::jsonb)", ADM) !== null,
      "top > 100 és rebutjat");
    ok(await falla("select public.bn_admin_control($1, $2, '{\"ranquing\":{\"pestanyes\":{\"punts\":false,\"dies\":false,\"nivell\":false,\"setmana\":false,\"remuntada\":false}}}'::jsonb)", ADM) !== null,
      "desactivar totes les pestanyes és rebutjat");
    ok(await falla("select public.bn_admin_control($1, $2, '{\"ranquing\":{\"pestanyes\":{\"dies\":false},\"pestanya_inicial\":\"dies\"}}'::jsonb)", ADM) !== null,
      "pestanya_inicial inactiva explícita és rebutjada");

    // Actualització parcial i reflex immediat a bn_estat_web
    const d1 = await ctrl({ ranquing: { top: 5, mostrar_propia: false, pestanya_inicial: "remuntada", pestanyes: { nivell: false }, meta_estrelles: 20, meta_pct: 80, mostra_premis: false } });
    ok(d1.ranquing.top === 5 && d1.ranquing.mostrar_propia === false && d1.ranquing.pestanya_inicial === "remuntada" &&
       d1.ranquing.pestanyes.nivell === false && d1.ranquing.pestanyes.punts === true && d1.ranquing.meta_estrelles === 20 && d1.ranquing.mostra_premis === false,
      "bn_admin_control desa i fusiona parcialment la configuració del rànquing");

    const w1 = await val("select public.bn_estat_web()");
    ok(w1.ranquing.top === 5 && w1.ranquing.pestanya_inicial === "remuntada" && w1.ranquing.pestanyes.nivell === false,
      "bn_estat_web reflecteix de seguida top=5 i pestanya_inicial='remuntada'");

    // Si desactivem la pestanya que era inicial sense passar pestanya_inicial nova, salta sola a la primera activa
    const d2 = await ctrl({ ranquing: { pestanyes: { remuntada: false } } });
    ok(d2.ranquing.pestanya_inicial === "punts", "si es desactiva la pestanya inicial actual, passa sola a la primera activa");

    // Restaura valors inicials
    const dReset = await ctrl({ reset_ranquing: true });
    ok(dReset.ranquing.top === 10 && dReset.ranquing.pestanya_inicial === "punts" && dReset.ranquing.pestanyes.nivell === true && dReset.ranquing.mostra_premis === true,
      "reset_ranquing=true restaura tots els valors inicials");
  }

  if (fallades) {
    console.error(`✗ ${fallades} errors de ${passades + fallades}`);
    process.exit(1);
  }
  console.log(`✓ prova-control-sql: ${passades} comprovacions passades`);
})();
