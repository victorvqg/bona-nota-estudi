#!/usr/bin/env node
// Bona Nota · prova automàtica del SQL del xat de la colla (supabase/bn_xat.sql) dins d'un Postgres de prova (PGlite, WebAssembly).
// Ús (des de l'arrel del repo o des de motor/):   node motor/prova-xat-sql.js
// No toca Supabase ni la xarxa: munta una base mínima amb els fitxers REALS del repo (bn_log.sql, bn_ranking_net.sql, bn_pin_nou.sql,
// bn_admin_tauler.sql i bn_ranking_mons.sql) i taules simulades per a bn_priv.perfils, intents i progres (a producció no tenen SQL al repo).
// Casos: 1) bn_xat.sql dues vegades (el que ha canviat l'admin sobreviu) · 2) catàleg idèntic al d'index.html i xat_msg sense text lliure
//        3) estrelles d'avui, canvi de dia a mitjanit de Madrid i nivell/mons com el rànquing · 4) desbloquejos per nivell i per món
//        5) cada codi de bn_xat_envia i l'ordre de les comprovacions · 6) bn_xat_vota · 7) bn_xat_llegeix · 8) funcions d'admin
//        9) permisos: anon no llegeix cap taula del xat però sí que crida les funcions públiques
//        10) l'admin apuja les estrelles per crèdit a mig dia (falten) · amagat o prohibit = silenciat sense data
//        11) l'autor i el company han d'existir (perfil o registre): «Treu el PIN» no amaga res · «vis» a bn_admin_xat_msgs.
// Cal PGlite:  npm install --no-save @electric-sql/pglite@0.5   (l'Action «Revisa Bona Nota» ja l'instal·la)
const fs = require("fs"), path = require("path"), vm = require("vm");
let PGlite, pgcrypto;
try { ({ PGlite } = require("@electric-sql/pglite")); ({ pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto")) }
catch (e) { console.error("✗ Falta PGlite (el Postgres de prova). Instal·la'l des de l'arrel del repo:\n    npm install --no-save @electric-sql/pglite@0.5"); process.exit(1) }
const ARREL = path.resolve(__dirname, "..");
const fitxer = f => fs.readFileSync(path.join(ARREL, f), "utf8");
let fallades = 0;
const ok = (cond, msg) => { if (cond) console.log("  ✓", msg); else { fallades++; console.log("  ✗", msg) } };
// comparació sense dependre de l'ordre de les claus (jsonb les reordena)
const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const igual = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const PIN = "1234A", ADM = ["admin@prova.cat", "contrasenya-de-prova"], DOLENTA = [ADM[0], "dolenta"];
const M = "bn_priv.xat_mitjanit()";                       // la mitjanit d'avui a Madrid, tal com la calcula el SQL
const AVUI_FA = `greatest(${M}, now() - interval '1 hour')`; // avui però fa una estona (sense espera)

(async () => {
 const t0 = Date.now();
 const db = await PGlite.create({ extensions: { pgcrypto } });
 const q = async (sql, p) => (await db.query(sql, p || [])).rows;
 const val = async (sql, p) => { const r = (await q(sql, p))[0]; return r ? Object.values(r)[0] : undefined };
 const falla = async (sql, p) => { try { await db.query(sql, p || []); return null } catch (e) { return e.message || String(e) } };
 const executa = async sql => { try { await db.exec(sql); return null } catch (e) { return e.message || String(e) } }; // un fitxer sencer (diverses sentències)
 // crides a les funcions públiques, com les faria el navegador
 const estat = (nom, pin = PIN) => val("select public.bn_xat_estat($1, $2) r", [nom, pin]);
 const envia = (nom, f, p = null, c = null, pin = PIN) => val("select public.bn_xat_envia($1, $2, $3, $4, $5) r", [nom, pin, f, p, c]);
 const vota = (nom, m, pin = PIN) => val("select public.bn_xat_vota($1, $2, $3) r", [nom, pin, m]);
 const llegeix = des => val("select public.bn_xat_llegeix($1) r", [des === undefined ? null : des]);
 const adm = (f, args = [], cred = ADM) => val(`select public.${f}(${[...cred, ...args].map((_, i) => "$" + (i + 1)).join(", ")}) r`, [...cred, ...args]);
 const cfg = (j, cred = ADM) => val("select public.bn_admin_xat_config($1, $2, $3::text::jsonb) r", [...cred, j === null ? null : JSON.stringify(j)]);
 // dades de prova: registres d'estrelles (cru = sense el fre de bn_log_net, per muntar l'historial) i missatges/vots directes
 const log = async (nom, assig, punts, ts = "now()", cru = true, event = "test", camp = "punts") => {
  if (cru) await db.exec("set session_replication_role = replica");
  await q(`insert into public.bn_log(ts, assig, nom, sessio, aparell, event, detall) values (${ts}, $1, $2, 's', 'a', $3, jsonb_build_object($4::text, $5::numeric))`, [assig, nom, event, camp, punts]);
  if (cru) await db.exec("set session_replication_role = origin") };
 const msg = (k, nom, f, p, c, ts = "now()", esb = false) =>
  val(`insert into bn_priv.xat_msg(k, nom, frase, peca, company, ts, esborrat) values ($1, $2, $3, $4, $5, ${ts}, $6) returning id`, [k, nom, f, p, c, esb]);
 const vot = (m, k, ts = "now()") => q(`insert into bn_priv.xat_vots(msg, k, ts) values ($1, $2, ${ts})`, [m, k]);
 const nMsg = () => val("select count(*)::int from bn_priv.xat_msg");

 // ---------- base mínima amb els fitxers reals ----------
 await db.exec("create role anon; create role authenticated; create schema extensions; create extension pgcrypto with schema extensions;");
 await db.exec(fitxer("supabase/bn_log.sql"));
 // bn_priv.perfils, intents i progres existeixen a producció però no tenen definició al repo: les simulem amb les mateixes columnes
 await db.exec(`create table bn_priv.perfils(k text primary key, nom text not null, pin text not null, pin_v smallint not null default 1,
                  pin_ts timestamptz, aspecte jsonb, aspecte_ts timestamptz);
                create table bn_priv.intents(k text primary key, n int not null default 0, ts timestamptz not null default now());
                create table bn_priv.progres(k text not null, assig text not null, estat jsonb, mod bigint, primary key (k, assig));
                revoke all on bn_priv.perfils, bn_priv.intents, bn_priv.progres from public, anon, authenticated;`);
 for (const f of ["supabase/bn_ranking_net.sql", "supabase/bn_pin_nou.sql", "supabase/bn_admin_tauler.sql", "supabase/bn_ranking_mons.sql"]) await db.exec(fitxer(f));
 await q("insert into bn_priv.admin(email, hash) values ($1, extensions.crypt($2, extensions.gen_salt('bf')))", ADM);

 console.log("1) bn_xat.sql dues vegades: idempotent i respecta el que ha canviat l'admin");
 { const sql = fitxer("supabase/bn_xat.sql");
  let e = await executa(sql); ok(e === null, "primera execució sense errors" + (e ? ": " + e : ""));
  ok((await val("select count(*)::int from bn_priv.xat_frases")) === 26 && (await val("select count(*)::int from bn_priv.xat_peces")) === 63, "26 frases i 63 peces");
  ok(igual(await cfg(null), { est_credit: 10, max_dia: 5, espera_s: 10, actiu: true }), "configuració inicial 10 ⭐ · 5 al dia · 10 s · obert");
  ok((await adm("bn_admin_xat_actiu", ["frase", 13, false])) === 1 && (await adm("bn_admin_xat_actiu", ["peca", 44, false])) === 1, "l'admin desactiva la frase 13 i la peça 44");
  ok((await cfg({ est_credit: 12 })).est_credit === 12, "l'admin canvia les estrelles per crèdit a 12");
  ok((await adm("bn_admin_xat_peca_nova", ["P", "la paraula de la setmana", 1, null])) === 1001, "peça nova de l'admin: id 1001");
  await q("update bn_priv.xat_frases set text = 'Text ___ tocat a mà' where id = 1");
  e = await executa(sql); ok(e === null, "segona execució sense errors" + (e ? ": " + e : ""));
  ok((await val("select actiu from bn_priv.xat_frases where id = 13")) === false && (await val("select actiu from bn_priv.xat_peces where id = 44")) === false, "la frase i la peça desactivades continuen desactivades");
  ok((await cfg(null)).est_credit === 12 && JSON.parse(await val("select valor from bn_priv.config where clau = 'xat'")).est_credit === 12, "la configuració de l'admin sobreviu");
  ok((await val("select text from bn_priv.xat_peces where id = 1001")) === "la paraula de la setmana" && (await val("select count(*)::int from bn_priv.xat_peces")) === 64, "la peça nova de l'admin sobreviu");
  ok((await val("select text from bn_priv.xat_frases where id = 1")) === "Vaig a per ___!", "el text del catàleg torna a ser el del fitxer");
  await cfg({ est_credit: 10 }) }

 console.log("2) catàleg igual que el bloc XAT-CATALEG d'index.html, i xat_msg sense text lliure");
 { const html = fitxer("index.html"), a = html.indexOf("/* XAT-CATALEG:inici"), b = html.indexOf("/* XAT-CATALEG:fi */");
  ok(a > 0 && b > a, "index.html té el bloc XAT-CATALEG");
  const { XAT_FR, XAT_PC } = vm.runInNewContext(html.slice(a, b) + "\n;({XAT_FR, XAT_PC})");
  const fr = (await q("select id, cat, text, slot, nivell from bn_priv.xat_frases where id < 1001 order by id")).map(r => ({ id: r.id, c: r.cat, t: r.text, s: r.slot, n: r.nivell }));
  const pc = (await q("select id, tipus, text, nivell, mon from bn_priv.xat_peces where id < 1001 order by id")).map(r => ({ id: r.id, s: r.tipus, t: r.text, n: r.nivell, m: r.mon }));
  const frJ = XAT_FR.map(f => ({ id: f.id, c: f.c, t: f.t, s: f.s, n: f.n })), pcJ = XAT_PC.map(p => ({ id: p.id, s: p.s, t: p.t, n: p.n ?? null, m: p.m ?? null }));
  ok(frJ.length === 26 && igual(fr, frJ), "les 26 frases són idèntiques (text, categoria, forat i nivell)" + (igual(fr, frJ) ? "" : ": " + JSON.stringify(fr.find((x, i) => !igual(x, frJ[i])))));
  ok(pcJ.length === 63 && igual(pc, pcJ), "les 63 peces són idèntiques (text, tipus i nivell o món)" + (igual(pc, pcJ) ? "" : ": " + JSON.stringify(pc.find((x, i) => !igual(x, pcJ[i])))));
  ok(XAT_FR.every(f => f.s !== "C" || ["aura", "colla"].includes(f.c)) && XAT_FR.filter(f => f.s === "C").every(f => !/-\d/.test(f.t)), "regla d'or: el nom d'un company només va en frases d'aura o de colla, cap de negativa");
  const cols = (await q("select column_name c, data_type t from information_schema.columns where table_schema = 'bn_priv' and table_name = 'xat_msg' order by ordinal_position")).map(r => r.c + ":" + r.t);
  ok(igual(cols, ["id:bigint", "k:text", "nom:text", "frase:integer", "peca:integer", "company:text", "ts:timestamp with time zone", "esborrat:boolean"]), "xat_msg només té ids, el nom del nen, el company, l'hora i «esborrat»: " + cols.join(" "));
  ok((await falla("insert into bn_priv.xat_msg(k, nom, frase, company) values ('a', 'a', 22, repeat('x', 41))")) !== null, "el company no pot passar de 40 caràcters");
  ok((await falla("insert into bn_priv.xat_msg(k, nom, frase, peca, company) values ('a', 'a', 1, 1, 'Bet')")) !== null, "un missatge porta peça o company, mai totes dues coses");
  const args = await q(`select p.proname f, a.n, format_type(a.t, null) t from pg_proc p join pg_namespace s on s.oid = p.pronamespace,
                        unnest(p.proargnames, p.proargtypes::oid[]) a(n, t) where s.nspname = 'public' and p.proname like 'bn_xat_%'`);
  ok(args.length > 0 && args.filter(r => r.t === "text").every(r => ["p_nom", "p_pin", "p_company"].includes(r.n)), "les funcions dels nens no accepten cap text més que el nom, el PIN i el nom del company") }

 // ---------- la colla de prova ----------
 const passat = await val(`select now() > ${M} + interval '1 minute'`); // la fila de «mitjanit + 1 minut» només si ja ha passat
 for (const n of ["Laia", "Bet", "Hugo", "Ona", "Max", "Pau", "Nora", "Èric", "Jana", "Leo", "Martina"]) await val("select public.bn_perfil_crea($1, $2)", [n, PIN]);
 await q("insert into bn_priv.perfils(k, nom, pin) values ('merda', 'merda', extensions.crypt('1234A', extensions.gen_salt('bf')))"); // prohibit (entrat d'abans del filtre)
 // Laia: 90 fa 3 dies, 100 a les 23:59 d'ahir, 114 ara → 14 ⭐ avui (i un missatge d'ahir a les 23:59 que no compta)
 await log("Laia", "socials", 90, `${M} - interval '3 days'`); await log("Laia", "socials", 100, `${M} - interval '1 minute'`);
 if (passat) await log("Laia", "socials", 108, `${M} + interval '1 minute'`);
 await log("Laia", "socials", 114); await msg("laia", "Laia", 1, 1, null, `${M} - interval '1 minute'`);
 // Leo: 10 a les 23:59 d'ahir i 30 a les 00:01 d'avui → 20 ⭐; un missatge a cada banda de la mitjanit
 await log("Leo", "socials", 10, `${M} - interval '1 minute'`); await msg("leo", "Leo", 1, 2, null, `${M} - interval '1 minute'`);
 if (passat) { await log("Leo", "socials", 30, `${M} + interval '1 minute'`); await msg("leo", "Leo", 1, 3, null, `${M} + interval '1 minute'`) }
 await log("Bet", "biogeo", 30, "now() - interval '2 days'");
 await log("Hugo", "socials", 20, "now() - interval '1 day'"); await q("insert into bn_priv.amagats(k) values ('hugo')");
 await log("Gina", "socials", 60, "now()", true, "temps", "s"); // només temps: també surt al rànquing
 await log("Vell", "socials", 50, "now() - interval '130 days'"); // fa més de 120 dies: ja no surt al rànquing
 await log("Ona", "socials", 4);
 await log("Max", "comarques", 60); for (let i = 0; i < 5; i++) await msg("max", "Max", 1, 1, null, AVUI_FA);
 await log("Pau", "socials", 30);
 await log("Martina", "socials", 40);
 // Èric: biogeo 45 (nivell 4 · Savi), divisibilitat 25 (acabat), socials 24 (no), comarques 40 fa 130 dies (no compta); avui +12 a biogeo
 await log("Èric", "biogeo", 45, "now() - interval '3 days'"); await log("Èric", "divisibilitat", 25, "now() - interval '3 days'");
 await log("Èric", "socials", 24, "now() - interval '3 days'"); await log("Èric", "comarques", 40, "now() - interval '130 days'");
 await log("Èric", "biogeo", 57);
 // Jana: diversos mons avui (+7, i un que baixa, que compta 0) i un registre retallat pel fre del servidor (999 → 150)
 await log("Jana", "socials", 50, "now() - interval '2 days'"); await log("Jana", "socials", 57);
 await log("Jana", "catala", 20, "now() - interval '2 days'"); await log("Jana", "catala", 15);
 await log("Jana", "biogeo", 999, "now()", false); await log("Jana", "castellano", 300, "now()", true, "temps", "s");
 await adm("bn_admin_xat_silencia", ["Nora", 3, "prova"]);

 console.log("3) estrelles d'avui, canvi de dia a mitjanit de Madrid i nivell com el rànquing");
 { const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const parts = d => Object.fromEntries(f.formatToParts(d).map(x => [x.type, x.value]));
  const mitjanitJS = dies => { const a = parts(new Date()); for (const off of [-1, -2]) { const t = Date.UTC(+a.year, +a.month - 1, +a.day + dies) + off * 3600e3, p = parts(new Date(t)); if (p.hour === "00" && p.minute === "00") return t } };
  const mSQL = await val(`select bn_priv.xat_ms(${M})`);
  ok(mSQL === mitjanitJS(0), "xat_mitjanit() és la mitjanit d'avui a Madrid (" + new Date(mSQL).toISOString() + ")");
  const zones = [];
  for (const z of ["America/New_York", "Asia/Tokyo", "UTC"]) { await db.exec(`set timezone = '${z}'`); zones.push(await val(`select bn_priv.xat_ms(${M})`)) }
  ok(zones.every(z => z === mSQL), "dona el mateix sigui quina sigui la zona horària de la sessió");
  const e = await estat("Laia");
  ok(e.codi === "ok" && e.fi_dia === mitjanitJS(1), "fi_dia és la mitjanit de demà a Madrid");
  ok(e.est_avui === 14 && e.guanyats === 1 && e.queden === 1 && e.falten === 6, "Laia: el registre de les 23:59 d'ahir no compta → 14 ⭐, 1 crèdit, en falten 6: " + JSON.stringify([e.est_avui, e.guanyats, e.queden, e.falten]));
  ok(e.enviats === 0, "el missatge de les 23:59 d'ahir no gasta cap crèdit d'avui");
  const l = await estat("Leo");
  if (passat) ok(l.est_avui === 20 && l.enviats === 1 && l.queden === 1, "Leo: el registre i el missatge de les 00:01 sí que compten avui → 20 ⭐ i 1 enviat");
  else ok(l.est_avui === 0 && l.enviats === 0, "Leo: encara no és les 00:01; res d'avui");
  const j = await estat("Jana");
  ok((await val("select (detall->>'retallat')::boolean from public.bn_log where nom = 'Jana' and assig = 'biogeo'")) === true, "el fre del servidor ha retallat el 999 de la Jana a 150");
  ok(j.est_avui === 157 && j.guanyats === 5 && j.falten === 0, "Jana: +7 + 0 (un món que baixa) + 150 (retallat) = 157 ⭐ → 5 crèdits (el màxim), no en falta cap: " + j.est_avui);
  ok((await val("select bn_priv.xat_est_avui('gina')")) === 0, "un registre de temps no són estrelles");
  ok((await val(`select bn_priv.xat_punts('{"punts":"abc"}')`)) === null && (await val(`select bn_priv.xat_punts('{"punts":-5}')`)) === null && Number(await val(`select bn_priv.xat_punts('{"punts":"12.5"}')`)) === 12.5, "un valor de punts estrany no fa petar res (no compta)");
  // nivell i mons amb els mateixos números que el rànquing (bn_ranking_mons) i els llindars NIV de la portada
  const lin = fitxer("index.html").match(/const NIV=(\[.*?\]);/), NIV = lin ? vm.runInNewContext(lin[1]) : [];
  const niv = p => { let i = 0; while (i < NIV.length - 1 && p >= NIV[i + 1][0]) i++; return i };
  ok(igual(NIV.map(x => x[0]), [0, 10, 25, 45, 70, 100, 140, 190, 250, 330]), "els llindars NIV de la portada són els del SQL");
  const rq = await q("select nom, punts_max, mons from public.bn_ranking_mons()"); let iguals = rq.length > 5;
  for (const r of rq) { const k = await val("select lower(trim($1))", [r.nom]), mons = await val("select bn_priv.xat_mons($1)", [k]), nen = await q("select * from bn_priv.xat_nen($1, bn_priv.xat_cfg())", [k]);
   if (!igual(mons, r.mons) || nen[0].nivell !== niv(r.punts_max) + 1) { iguals = false; console.log("    ", r.nom, JSON.stringify(mons), JSON.stringify(r.mons), nen[0].nivell, niv(r.punts_max) + 1) } }
  ok(iguals, `mons i nivell coincideixen amb bn_ranking_mons per als ${rq.length} nens del rànquing`);
  ok((await val("select bn_priv.xat_al_ranquing('bet')")) === "Bet" && (await val("select bn_priv.xat_al_ranquing('gina')")) === "Gina", "al rànquing amb estrelles o només amb temps");
  ok((await val("select bn_priv.xat_al_ranquing('hugo')")) === null && (await val("select bn_priv.xat_al_ranquing('vell')")) === null && (await val("select bn_priv.xat_al_ranquing('fantasma')")) === null, "fora del rànquing: amagat, de fa més de 120 dies o desconegut") }

 console.log("4) desbloquejos per nivell i per món (25 ⭐)");
 { const e = await estat("Èric");
  ok(e.nivell === 4 && igual(e.acabats, ["biogeo", "divisibilitat"]), "Èric: nivell 4 (Savi) i mons acabats biogeo i divisibilitat: " + e.nivell + " " + JSON.stringify(e.acabats));
  ok(igual(e.mons, { biogeo: 57, divisibilitat: 25, socials: 24 }), "mons dels últims 120 dies (el de fa 130 dies no hi és)");
  ok(e.frases.includes(7) && !e.frases.includes(8) && !e.frases.includes(13), "frases: la 7 (Savi) sí, la 8 (Expert) no, la 13 (desactivada) no");
  ok(e.peces.includes(11) && !e.peces.includes(13) && e.peces.includes(25) && e.peces.includes(31) && !e.peces.includes(28) && !e.peces.includes(34) && !e.peces.includes(44), "peces: nivell 4 sí i 5 no; divisibilitat i biogeo sí; socials (24 ⭐), comarques (fa 130 dies) i la desactivada no");
  ok(e.peces.includes(1001), "la peça nova de l'admin (nivell 1) també");
  const o = await estat("Ona");
  ok(o.nivell === 1 && igual(o.frases, [1, 2, 3, 4, 11, 12, 14, 17, 18, 22, 23]), "Ona (4 ⭐): només les frases de nivell 1 actives");
  const r = await envia("Èric", 7, 25);
  ok(r.codi === "ok", "Èric pot dir «Pista: repassa els nombres primers» (Savi + Mates acabat): " + JSON.stringify(r)) }

 console.log("5) bn_xat_envia: cada codi i l'ordre de les comprovacions (sense desar res si en falla una)");
 { const abans = await nMsg();
  let r = await envia("Laia", 1, 1, null, "0000Z");
  ok(igual(r, { codi: "pin" }), "pin: PIN dolent");
  ok((await val("select n from bn_priv.intents where k = 'laia'")) === 1, "l'intent fallit queda apuntat (no és una excepció)");
  ok(igual(await envia("Nora", 1, 1, null, "9999Z"), { codi: "pin" }), "ordre: PIN dolent i silenciada → pin");
  await q("insert into bn_priv.intents(k, n, ts) values ('ona', 5, now()) on conflict (k) do update set n = 5, ts = now()");
  ok(/massa intents/.test(await falla("select public.bn_xat_envia('Ona', '1234A', 1, 1, null)") || ""), "massa intents: l'excepció de pin_ok passa tal qual");
  await q("delete from bn_priv.intents where k = 'ona'");
  r = await envia("Nora", 1, 1);
  ok(r.codi === "silenci" && r.fins > Date.now() + 2.9 * 864e5, "silenci: silenciada 3 dies (i sense crèdit: surt silenci)");
  await cfg({ actiu: false });
  ok((await envia("Nora", 1, 1)).codi === "silenci", "ordre: silenciada i xat tancat → silenci");
  ok(igual(await envia("Laia", 1, 1), { codi: "tancat" }), "tancat: l'admin ha tancat el xat");
  ok((await envia("Martina", 999, 1)).codi === "tancat", "ordre: tancat i frase que no existeix → tancat");
  ok((await estat("Laia")).cfg.actiu === false && (await llegeix()).actiu === false, "estat i llegeix diuen que està tancat");
  await cfg({ actiu: true });
  const blq = [[999, 1, null, "frase que no existeix"], [null, 1, null, "sense frase"], [13, 43, null, "frase desactivada"], [7, 11, null, "frase no desbloquejada (Savi)"],
   [1, 9999, null, "peça que no existeix"], [1, null, null, "forat de peça sense peça"], [17, 44, null, "peça desactivada"], [1, 11, null, "peça no desbloquejada (nivell)"],
   [1, 25, null, "peça no desbloquejada (món sense acabar)"], [1, 43, null, "peça d'un altre tipus"], [1, 1, "Bet", "forat de peça amb peça i company"],
   [1, null, "Bet", "forat de peça amb company"], [22, 1, null, "forat de company amb peça"], [22, 1, "Bet", "forat de company amb peça i company"]];
  for (const [f, p, c, txt] of blq) { const x = await envia("Martina", f, p, c); ok(igual(x, { codi: "bloquejada" }), "bloquejada: " + txt + (x.codi === "bloquejada" ? "" : " → " + JSON.stringify(x))) }
  ok((await envia("Ona", 999, 1)).codi === "bloquejada", "ordre: bloquejada i sense crèdit → bloquejada");
  for (const [c, txt] of [[null, "sense nom"], ["Martina", "el propi nom"], [" martina ", "el propi nom amb espais i minúscules"], ["Hugo", "un nom amagat"],
   ["Fantasma", "un nom que no és al rànquing"], ["Vell", "un nom de fa més de 120 dies"], ["merda", "un nom prohibit"], ["hola, com estàs?", "un text qualsevol"]]) {
   const x = await envia("Martina", 22, null, c); ok(igual(x, { codi: "company" }), "company: " + txt + (x.codi === "company" ? "" : " → " + JSON.stringify(x))) }
  ok((await envia("Ona", 22, null, "Fantasma")).codi === "company", "ordre: company dolent i sense crèdit → company");
  r = await envia("Max", 1, 1);
  ok(igual(r, { codi: "max_dia" }), "max_dia: ja n'ha dit 5 avui (i té 60 ⭐)");
  await msg("max", "Max", 1, 1, null); ok((await envia("Max", 1, 1)).codi === "max_dia", "ordre: al màxim i en espera → max_dia");
  r = await envia("Ona", 1, 1);
  ok(igual(r, { codi: "sense_credit", falten: 6 }), "sense_credit: 4 ⭐ avui, en falten 6");
  ok((await nMsg()) === abans + 1, "cap de les comprovacions fallides no ha desat res");
  // ok: el nom desat és el del perfil, encara que s'escrigui diferent
  await db.exec("begin"); r = await envia(" laia ", 1, 1);
  ok(r.codi === "ok" && (await val("select count(*)::int from pg_locks where locktype = 'advisory' and granted")) >= 1, "ok, amb el bloqueig del nen agafat fins al final de la transacció");
  await db.exec("rollback");
  r = await envia(" laia ", 1, 1);
  ok(r.codi === "ok" && r.queden === 0 && r.enviats === 1 && typeof r.id === "number", "ok: «Vaig a per el teu lloc!» → queden 0, enviats 1: " + JSON.stringify(r));
  const fila = (await q("select k, nom, frase, peca, company from bn_priv.xat_msg where id = $1", [r.id]))[0];
  ok(igual(fila, { k: "laia", nom: "Laia", frase: 1, peca: 1, company: null }), "es desa {qui, frase, peça} amb el nom del perfil: " + JSON.stringify(fila));
  const e = await estat("Laia");
  ok(e.enviats === 1 && e.queden === 0 && e.espera_fins > e.ara && e.espera_fins <= e.ara + 10000, "estat: 1 enviat, 0 per gastar i l'espera de 10 s");
  ok(igual(await envia("Laia", 1, 1), { codi: "sense_credit", falten: 6 }), "ordre: sense crèdit i en espera → sense_credit");
  r = await envia("Pau", 12, 9);
  ok(r.codi === "ok" && r.queden === 2, "Pau (30 ⭐): ok, en queden 2");
  r = await envia("Pau", 12, 9);
  ok(r.codi === "espera" && r.ms > 0 && r.ms <= 10000, "espera: han passat menys de 10 s (" + r.ms + " ms)");
  await q("update bn_priv.xat_msg set ts = ts - interval '11 seconds' where k = 'pau'");
  ok((await envia("Pau", 12, 9)).codi === "ok", "passats 10 s, ja pot tornar a parlar");
  r = await envia("Martina", 22, null, " bet ");
  ok(r.codi === "ok" && (await val("select company from bn_priv.xat_msg where id = $1", [r.id])) === "Bet", "company: es desa el nom tal com surt al rànquing («Bet»)");
  await q("update bn_priv.xat_msg set ts = ts - interval '11 seconds' where k = 'martina'");
  ok((await envia("Martina", 22, null, "Gina")).codi === "ok", "company: un nen que només té temps al rànquing també");
  ok((await val("select count(*)::int from bn_priv.xat_msg where company is not null and bn_priv.xat_al_ranquing(lower(company)) is null")) === 0, "tots els companys desats són noms del rànquing") }

 console.log("6) bn_xat_vota");
 { const laia = await val("select max(id) from bn_priv.xat_msg where k = 'laia'"), bet = await msg("bet", "Bet", 22, null, "Laia", AVUI_FA);
  ok(igual(await vota("Pau", laia, "0000Z"), { codi: "pin" }), "pin: PIN dolent");
  ok((await vota("Nora", laia)).codi === "silenci", "silenci: silenciada no pot votar");
  await cfg({ actiu: false }); ok(igual(await vota("Pau", laia), { codi: "tancat" }), "tancat: amb el xat tancat no es vota"); await cfg({ actiu: true });
  ok(igual(await vota("Ona", bet), { codi: "sense_credit", falten: 6 }), "sense_credit: cal el primer crèdit d'avui");
  ok(igual(await vota("Laia", laia), { codi: "propi" }), "propi: mai al missatge propi");
  ok(igual(await vota("Pau", 999999), { codi: "no_existeix" }), "no_existeix: un id que no hi és");
  let r = await vota("Pau", laia);
  ok(igual(r, { codi: "ok", on: true, vots: 1 }), "posa el vot");
  ok((await estat("Pau")).meus.includes(laia) && !(await estat("Laia")).meus.includes(laia), "el vot surt a «meus» del Pau (amb PIN) i no al de la Laia");
  r = await vota("Pau", laia); ok(igual(r, { codi: "ok", on: false, vots: 0 }), "el treu");
  r = await vota("Pau", laia); ok(r.on === true && r.vots === 1, "el torna a posar");
  ok(igual(await vota("Laia", bet), { codi: "ok", on: true, vots: 1 }), "la Laia (1 crèdit, ja gastat) també pot votar: cal haver-lo guanyat, no tenir-lo");
  await adm("bn_admin_xat_esborra", [bet, true]);
  ok(igual(await vota("Pau", bet), { codi: "no_existeix" }), "no_existeix: missatge esborrat per l'admin");
  await adm("bn_admin_xat_esborra", [bet, false]);
  const hugo = await msg("hugo", "Hugo", 1, 1, null);
  ok(igual(await vota("Pau", hugo), { codi: "no_existeix" }), "no_existeix: l'autor està amagat") }

 console.log("7) bn_xat_llegeix: visibilitat, 60 últims, vots, missatge del dia i bafarades");
 { await db.exec("truncate bn_priv.xat_vots, bn_priv.xat_msg restart identity");
  const vell = await msg("bet", "Bet", 12, 7, null, "now() - interval '3 days'");
  const ahir = await msg("bet", "Bet", 1, 2, null, "now() - interval '25 hours'");
  const m23 = await msg("bet", "Bet", 22, null, "Laia", "now() - interval '23 hours'");
  const ocults = [await msg("hugo", "Hugo", 1, 1, null), await msg("merda", "merda", 1, 1, null), await msg("fantasma", "Fantasma", 1, 1, null),
   await msg("max", "Max", 22, null, "Hugo"), await msg("pau", "Pau", 1, 1, null, "now()", true)];
  const A = await msg("laia", "Laia", 1, 1, null), B = await msg("martina", "Martina", 17, 44, null), C = await msg("leo", "Leo", 1, 3, null);
  for (const k of ["a", "b", "c", "d", "e"]) await vot(ahir, k);
  await vot(vell, "pau");
  let x = await llegeix();
  ok(igual(x.msgs.map(m => m.id), [vell, ahir, m23, A, B, C]), "es veuen els 6 visibles, en ordre: " + x.msgs.map(m => m.id));
  ok(!x.msgs.some(m => ocults.includes(m.id)), "no surten: autor amagat, autor prohibit, autor sense perfil, company amagat ni esborrat");
  ok(igual(Object.keys(x.msgs[0]).sort(), ["c", "f", "id", "nom", "p", "ts", "v"]), "cada missatge porta només id, nom, f, p, c, ts i v (cap text)");
  const mb = x.msgs.find(m => m.id === m23), mp = x.msgs.find(m => m.id === B);
  ok(mb.c === "Laia" && mb.p === null && mb.f === 22 && mp.p === 44, "company i peça (també una peça desactivada, que el navegador mostra «…»)");
  ok(x.msgs.find(m => m.id === ahir).v === 5 && x.vots[ahir] === 5 && x.vots[A] === 0 && Object.keys(x.vots).length === 6, "vots: comptador de cadascun");
  ok(x.mdd === null, "mdd: cap missatge d'avui té vots → null (el d'ahir amb 5 no compta)");
  ok(igual(x.ultims.map(m => m.nom).sort(), ["Bet", "Laia", "Leo", "Martina"]) && x.ultims.find(m => m.nom === "Bet").id === m23, "ultims: l'últim de cada nen de les últimes 24 h (el de fa 25 h no)");
  ok(x.off.f.includes(13) && x.off.p.includes(44), "off: la frase 13 i la peça 44 desactivades");
  ok(igual(x.noves, [{ id: 1001, s: "P", t: "la paraula de la setmana", n: 1, m: null }]), "noves: la peça de l'admin amb el seu text");
  ok((await estat("Pau")).meus.includes(vell), "meus: un vot de fa 3 dies surt si el missatge encara es veu al xat");
  for (const k of ["pau", "max"]) await vot(A, k);
  for (const k of ["pau", "laia"]) await vot(B, k);
  await vot(C, "max");
  for (const k of ["a", "b", "c", "d", "e"]) { await vot(ocults[0], k); await vot(ocults[4], k) }
  x = await llegeix();
  ok(x.mdd && x.mdd.id === A && x.mdd.v === 2 && x.mdd.nom === "Laia", "mdd: empat a 2 → el primer (els ocults amb 5 vots no compten)");
  await vot(B, "leo"); x = await llegeix();
  ok(x.mdd.id === B && x.mdd.v === 3, "mdd: el més votat d'avui");
  x = await llegeix(A);
  ok(igual(x.msgs.map(m => m.id), [B, C]) && Object.keys(x.vots).length === 6 && x.vots[B] === 3, "p_des_de: només els nous, però els vots dels 60");
  await db.exec("set session_replication_role = replica");
  const ids = []; for (let i = 0; i < 70; i++) ids.push(await msg("bet", "Bet", 1, 2, null, "now() - interval '30 hours'"));
  await db.exec("set session_replication_role = origin");
  await q("update bn_priv.xat_msg set esborrat = true where id = any($1)", [ids.slice(-5)]);
  x = await llegeix();
  ok(x.msgs.length === 60 && x.msgs[0].id === ids[5] && x.msgs[59].id === ids[64] && x.msgs.every((m, i) => !i || m.id > x.msgs[i - 1].id), "60 últims visibles en ordre (els 5 esborrats no ocupen lloc)");
  ok(Object.keys(x.vots).length === 60 && x.mdd.id === B && x.ultims.length === 4, "vots dels 60; el missatge del dia i les bafarades no canvien");
  ok(igual((await llegeix(ids[60])).msgs.map(m => m.id), ids.slice(61, 65)), "p_des_de amb 60 missatges al davant");
  const meus = (await estat("Pau")).meus;
  ok(!meus.includes(vell) && meus.includes(A) && meus.includes(B), "meus: el vot vell ja no (fora del xat i de fa més de 2 dies); els d'avui sí") }

 console.log("8) funcions d'admin (contrasenya bona i dolenta)");
 { const fns = [["bn_admin_xat_msgs", [7]], ["bn_admin_xat_esborra", [1, true]], ["bn_admin_xat_silencia", ["Leo", 1, ""]], ["bn_admin_xat_silencis", []],
   ["bn_admin_xat_config", [null]], ["bn_admin_xat_cataleg", []], ["bn_admin_xat_actiu", ["frase", 1, false]], ["bn_admin_xat_peca_nova", ["P", "x", 1, null]], ["bn_admin_xat_resum", []]];
  const n0 = await nMsg(), e0 = await val("select count(*)::int from bn_priv.xat_msg where esborrat");
  for (const [f, a] of fns) ok(/acces denegat/.test(await falla(`select public.${f}(${[...DOLENTA, ...a].map((_, i) => "$" + (i + 1)).join(", ")})`, [...DOLENTA, ...a]) || ""), f + ": contrasenya dolenta → accés denegat");
  ok((await nMsg()) === n0 && (await val("select count(*)::int from bn_priv.xat_msg where esborrat")) === e0 && (await val("select actiu from bn_priv.xat_frases where id = 1")) && !(await val("select count(*)::int from bn_priv.xat_silenci where k = 'leo'")), "amb la contrasenya dolenta no ha canviat res");
  let m = await adm("bn_admin_xat_msgs", [7]);
  ok(m.length === 81 && m.some(x => x.esborrat) && igual(Object.keys(m[0]).sort(), ["c", "esborrat", "f", "id", "nom", "p", "ts", "v", "vis"]), "msgs: tots (també els esborrats) amb id, nom, f, p, c, ts, esborrat, v i vis");
  ok(m.every((x, i) => !i || x.ts <= m[i - 1].ts) && m[0].ts >= m[1].ts, "msgs: del més nou al més vell");
  ok((await adm("bn_admin_xat_msgs", [1])).length < m.length && !(await adm("bn_admin_xat_msgs", [1])).some(x => x.f === 12), "msgs: p_dies filtra (el de fa 3 dies no surt amb 1 dia)");
  const A = (await llegeix()).mdd.id;
  ok((await adm("bn_admin_xat_esborra", [A, true])) === 1 && (await llegeix()).mdd.id !== A, "esborra: el missatge desapareix del xat");
  ok((await adm("bn_admin_xat_esborra", [A, false])) === 1 && (await llegeix()).mdd.id === A && (await adm("bn_admin_xat_esborra", [999999, true])) === 0, "esborra false: es recupera · id que no hi és: 0");
  ok((await adm("bn_admin_xat_silencia", ["Leo", 1, "x".repeat(250)])) === 1, "silencia: 1 dia");
  let s = (await adm("bn_admin_xat_silencis")).find(x => x.k === "leo");
  ok(s && s.motiu.length === 200 && Math.abs(s.fins - Date.now() - 864e5) < 60e3, "silencis: hi és, amb el motiu retallat a 200 i fins d'aquí a 1 dia");
  ok((await estat("Leo")).silenci && (await envia("Leo", 1, 1)).codi === "silenci", "el nen silenciat ho veu a l'estat i no pot escriure");
  ok(/dies no valids/.test(await falla("select public.bn_admin_xat_silencia($1, $2, 'Leo', 2, '')", ADM) || ""), "silencia: 2 dies no és vàlid");
  ok((await adm("bn_admin_xat_silencia", ["Leo", 0, ""])) === 1 && !(await adm("bn_admin_xat_silencis")).some(x => x.k === "leo") && (await estat("Leo")).silenci === null, "silencia 0: treu el silenci");
  await q("insert into bn_priv.xat_silenci(k, fins) values ('caducat', now() - interval '1 minute')");
  s = await adm("bn_admin_xat_silencis");
  ok(s.some(x => x.k === "nora") && !s.some(x => x.k === "caducat"), "silencis: només els vigents");
  ok(igual(await cfg(null), { est_credit: 10, max_dia: 5, espera_s: 10, actiu: true }), "config: llegeix");
  ok(igual(await cfg({ max_dia: "3", espera_s: 0 }), { est_credit: 10, max_dia: 3, espera_s: 0, actiu: true }), "config: desa només les claus que s'envien");
  for (const [j, t] of [[{ est_credit: 0 }, "0 ⭐ per crèdit"], [{ est_credit: 101 }, "101 ⭐ per crèdit"], [{ max_dia: 21 }, "21 al dia"], [{ espera_s: 601 }, "601 s"], [{ actiu: "si" }, "actiu «si»"], [{ max_dia: 2.5 }, "2,5 al dia"], [[1], "una llista"]])
   ok((await falla("select public.bn_admin_xat_config($1, $2, $3::text::jsonb)", [...ADM, JSON.stringify(j)])) !== null, "config: rebutja " + t);
  ok((await cfg(null)).max_dia === 3, "config: un valor dolent no desa res");
  await cfg({ max_dia: 5, espera_s: 10 });
  const ct = await adm("bn_admin_xat_cataleg");
  ok(ct.frases.length === 26 && ct.peces.length === 64 && ct.frases.find(f => f.id === 13).actiu === false && igual(Object.keys(ct.peces[0]).sort(), ["actiu", "id", "mon", "nivell", "text", "tipus"]), "cataleg: tot, també el desactivat");
  ok((await adm("bn_admin_xat_actiu", ["frase", 2, false])) === 1 && (await llegeix()).off.f.includes(2) && (await adm("bn_admin_xat_actiu", ["frase", 2, true])) === 1, "actiu: desactiva i torna a activar");
  ok((await adm("bn_admin_xat_actiu", ["peca", 9999, true])) === 0 && /taula no valida/.test(await falla("select public.bn_admin_xat_actiu($1, $2, 'msg', 1, true)", ADM) || ""), "actiu: id que no hi és → 0 · taula que no existeix → error");
  ok((await adm("bn_admin_xat_peca_nova", ["e", " el timbre nou ", null, "Socials"])) === 1002, "peca_nova: la següent és la 1002 (tipus i món en minúscules o majúscules)");
  const p2 = (await q("select tipus, text, nivell, mon from bn_priv.xat_peces where id = 1002"))[0];
  ok(igual(p2, { tipus: "E", text: "el timbre nou", nivell: null, mon: "socials" }), "peca_nova: desada neta");
  for (const [a, t] of [[["X", "hola", 1, null], "tipus X"], [["P", "  ", 1, null], "text buit"], [["P", "x".repeat(61), 1, null], "61 caràcters"], [["P", "dues\nlínies", 1, null], "salt de línia"],
   [["P", "hola", 1, "socials"], "nivell i món alhora"], [["P", "hola", null, null], "ni nivell ni món"], [["P", "hola", 11, null], "nivell 11"], [["P", "hola", null, "Mates!"], "món estrany"]])
   ok((await falla("select public.bn_admin_xat_peca_nova($1, $2, $3, $4, $5, $6)", [...ADM, ...a])) !== null, "peca_nova: rebutja " + t);
  ok((await adm("bn_admin_xat_actiu", ["peca", 1002, false])) === 1 && !(await llegeix()).noves.some(p => p.id === 1002) && (await llegeix()).off.p.includes(1002), "una peça nova desactivada no surt a noves (i sí a off)");
  // resum d'un dia controlat: Laia 2 frases, Max 5 (al màxim), Bet 1 d'ahir; 3 vots avui i 1 d'ahir
  await db.exec("truncate bn_priv.xat_vots, bn_priv.xat_msg restart identity");
  const l1 = await msg("laia", "Laia", 1, 1, null, AVUI_FA); await msg("laia", "Laia", 1, 2, null, AVUI_FA, true);
  for (let i = 0; i < 5; i++) await msg("max", "Max", 1, 1, null, AVUI_FA);
  const b1 = await msg("bet", "Bet", 1, 1, null, `${M} - interval '1 minute'`);
  await vot(l1, "max"); await vot(l1, "bet"); await vot(b1, "max"); await vot(b1, "laia", `${M} - interval '1 minute'`);
  ok(igual(await adm("bn_admin_xat_resum"), { vots: 3, frases: 7, parlat: 2, al_maxim: 1 }), "resum: han parlat 2, 7 frases (també l'esborrada), 1 al màxim i 3 vots avui") }

 console.log("9) permisos: anon no llegeix cap taula del xat, però sí que crida les funcions públiques");
 { const taules = ["xat_frases", "xat_peces", "xat_msg", "xat_vots", "xat_silenci"];
  for (const r of ["anon", "authenticated"]) {
   const priv = await val(`select bool_or(has_table_privilege($1, 'bn_priv.' || t, 'select,insert,update,delete')) from unnest(array['${taules.join("','")}']) t`, [r]);
   ok(priv === false, r + ": cap permís sobre les taules bn_priv.xat_*") }
  const ajudes = await val(`select bool_or(has_function_privilege('anon', p.oid, 'execute')) from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'bn_priv' and p.proname like 'xat\\_%'`);
  ok(ajudes === false, "anon no pot executar cap ajuda interna bn_priv.xat_*");
  const pub = await val(`select bool_and(has_function_privilege('anon', p.oid, 'execute')) from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and (p.proname like 'bn\\_xat\\_%' or p.proname like 'bn\\_admin\\_xat\\_%')`);
  ok(pub === true, "anon pot executar totes les funcions públiques del xat");
  await db.exec("set role anon");
  for (const t of taules) ok((await falla(`select * from bn_priv.${t} limit 1`)) !== null, "anon: select a bn_priv." + t + " → denegat");
  ok((await falla("insert into bn_priv.xat_msg(k, nom, frase, company) values ('a', 'a', 22, 'Bet')")) !== null, "anon: no pot inserir missatges directament");
  ok((await falla("select bn_priv.xat_est_avui('laia')")) !== null, "anon: no pot cridar les ajudes internes");
  const ll = await llegeix(), es = await estat("Laia"), en = await envia("Ona", 1, 1), vo = await vota("Ona", 1), rs = await adm("bn_admin_xat_resum");
  ok(Array.isArray(ll.msgs) && es.codi === "ok" && en.codi === "sense_credit" && vo.codi === "sense_credit" && rs.frases === 7, "anon: llegeix, estat, envia, vota i les d'admin funcionen");
  await db.exec("reset role") }

 console.log("10) l'admin apuja les estrelles per crèdit a mig dia; un nen amagat o prohibit és com un silenciat sense data");
 { await val("select public.bn_perfil_crea($1, $2)", ["Quim", PIN]); await log("Quim", "socials", 25);
  for (let i = 0; i < 2; i++) await msg("quim", "Quim", 1, 1, null, AVUI_FA);
  const bet = await msg("bet", "Bet", 1, 2, null, AVUI_FA);
  let e = await estat("Quim");
  ok(e.guanyats === 2 && e.enviats === 2 && e.queden === 0 && e.falten === 5, "Quim: 25 ⭐ i 2 frases dites → per a la tercera en falten 5: " + JSON.stringify([e.guanyats, e.enviats, e.queden, e.falten]));
  await cfg({ est_credit: 20 }); e = await estat("Quim");
  ok(e.guanyats === 1 && e.queden === 0 && e.falten === 35, "l'admin posa 20 ⭐ per crèdit: ja n'ha dit 2, la propera és la tercera → en falten 35 (3 × 20 − 25), no 15: " + JSON.stringify([e.guanyats, e.queden, e.falten]));
  ok(igual(await envia("Quim", 1, 1), { codi: "sense_credit", falten: 35 }), "envia: sense_credit amb els mateixos 35");
  await log("Quim", "socials", 60); let r = await envia("Quim", 1, 1);
  ok(r.codi === "ok" && r.enviats === 3 && r.queden === 0, "amb 35 ⭐ més (60 = 3 crèdits de 20) ja diu la tercera: " + JSON.stringify(r));
  await cfg({ est_credit: 100 }); e = await estat("Quim");
  ok(e.guanyats === 0 && e.falten === 340, "a 100 ⭐ per crèdit, per a la quarta frase en falten 340 (4 × 100 − 60): " + e.falten);
  ok(igual(await vota("Quim", bet), { codi: "sense_credit", falten: 40 }), "vota: només cal el primer crèdit d'avui → en falten 40 (100 − 60), no 340");
  await cfg({ est_credit: 10 });
  // amagat (Hugo) o prohibit (merda), i amb crèdits d'avui: no els poden gastar en missatges que ningú veuria (ni ells mateixos en reobrir)
  await log("Hugo", "socials", 40); await log("merda", "socials", 30);
  const n0 = await nMsg(), v0 = await val("select count(*)::int from bn_priv.xat_vots");
  for (const nom of ["Hugo", "merda"]) {
   e = await estat(nom);
   ok(e.codi === "ok" && e.queden >= 2 && igual(e.silenci, { fins: null }), nom + ": té crèdits, però l'estat diu silenci sense data: " + JSON.stringify(e.silenci));
   ok(igual(await envia(nom, 1, 1), { codi: "silenci", fins: null }), nom + ": envia → silenci sense data");
   ok(igual(await vota(nom, bet), { codi: "silenci", fins: null }), nom + ": vota → silenci sense data") }
  ok(igual(await envia("Hugo", 1, 1, null, "0000Z"), { codi: "pin" }), "ordre: PIN dolent i amagat → pin");
  await adm("bn_admin_xat_silencia", ["Hugo", 3, "prova"]);
  ok((await estat("Hugo")).silenci.fins === null && igual(await envia("Hugo", 1, 1), { codi: "silenci", fins: null }), "amagat i silenciat 3 dies: guanya l'amagat (sense data)");
  await adm("bn_admin_xat_silencia", ["Hugo", 0, ""]);
  await cfg({ actiu: false }); ok(igual(await envia("merda", 1, 1), { codi: "silenci", fins: null }), "ordre: prohibit i xat tancat → silenci"); await cfg({ actiu: true });
  ok((await nMsg()) === n0 && (await val("select count(*)::int from bn_priv.xat_vots")) === v0, "no s'ha desat cap missatge ni cap vot") }

 console.log("11) l'autor i el company han d'existir (perfil o registre); «vis» a bn_admin_xat_msgs");
 { await val("select public.bn_perfil_crea($1, $2)", ["Txell", PIN]); await log("Txell", "biogeo", 30, "now() - interval '2 days'");
  const t1 = await msg("txell", "Txell", 1, 1, null, AVUI_FA), t2 = await msg("bet", "Bet", 22, null, "Txell", AVUI_FA);
  const hugo = await msg("hugo", "Hugo", 1, 1, null, AVUI_FA), bona = await msg("pau", "Pau", 1, 4, null, AVUI_FA);
  let x = await llegeix(), ids = x.msgs.map(m => m.id);
  ok(ids.includes(t1) && ids.includes(t2) && x.ultims.some(m => m.id === t1), "la Txell té perfil i registre: es veuen el seu missatge, la seva bafarada i el que la nomena");
  await adm("bn_admin_usuari", ["Txell", "treupin"]);
  ok((await val("select count(*)::int from bn_priv.perfils where k = 'txell'")) === 0, "«Treu el PIN» esborra el perfil de la Txell");
  x = await llegeix(); ids = x.msgs.map(m => m.id);
  ok(ids.includes(t1) && ids.includes(t2) && x.ultims.some(m => m.id === t1), "sense perfil però amb registre: el missatge, la bafarada i el que la nomena continuen sortint");
  await adm("bn_admin_usuari", ["Txell", "esborra"]);
  ok((await val("select count(*)::int from public.bn_log where lower(trim(nom)) = 'txell'")) === 0, "«Esborra del tot»: ja no té ni perfil ni registre");
  x = await llegeix(); ids = x.msgs.map(m => m.id);
  ok(!ids.includes(t1) && !x.ultims.some(m => m.id === t1), "esborrada del tot: el seu missatge i la seva bafarada ja no surten");
  ok(!ids.includes(t2) && x.ultims.some(m => m.nom === "Bet") && !x.ultims.some(m => m.id === t2), "tampoc el missatge que la nomena com a companya (la bafarada de la Bet torna a ser l'anterior)");
  ok(igual(await vota("Pau", t2), { codi: "no_existeix" }), "no es pot votar un missatge que nomena una nena esborrada del tot");
  const am = await adm("bn_admin_xat_msgs", [7]), vis = id => (am.find(m => m.id === id) || {}).vis;
  ok(am.length > 10 && am.every(m => typeof m.vis === "boolean" && m.vis === ids.includes(m.id)), "msgs: «vis» és exactament el que surt a la portada (" + am.filter(m => m.vis).length + " de " + am.length + ")");
  ok(vis(bona) === true && vis(t1) === false && vis(t2) === false && vis(hugo) === false && am.some(m => m.esborrat && m.vis === false),
   "vis: true si surt; false si l'autora o la companya s'han esborrat del tot, si l'autor està amagat o si està esborrat") }

 await db.close();
 console.log(fallades ? `\n✗ ${fallades} comprovacions han fallat` : `\n✓ Tot correcte (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
 process.exit(fallades ? 1 : 0);
})().catch(e => { console.error("✗ La prova s'ha aturat:", e); process.exit(1) });
