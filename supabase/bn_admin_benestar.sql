-- Bona Nota · tauler d'admin, M8 · Benestar (n2540): senyals de bon ús per nen i vigílies d'examen per món (docs/BON-US.md, apartats 2 i 5).
-- Executar al SQL Editor de Supabase DESPRÉS de bn_admin_tauler.sql (fa servir bn_priv.admin_ok, bn_priv.desde i bn_priv.respostes).
-- El xat (bn_xat.sql) és opcional: si bn_priv.xat_msg no existeix, el senyal «xat» no surt i la resta funciona igual.
-- Idempotent: es pot tornar a executar tantes vegades com calgui; les dates d'examen desades es conserven.
--
-- COMPTE: EL TEMPS ES COMPTA PER APARELL. Cada aparell envia els seus events «temps»: si un nen en fa servir dos alhora, els minuts
-- poden sortir doblats (per això hi ha el senyal «dos_aparells»). Tot es compta a l'hora de Catalunya (Europe/Madrid).
-- Els llindars són VALORS INICIALS per ajustar amb dades (BON-US §5 i §7), no una norma mèdica.
--
--  · bn_priv.examens(assig, data, ts): la data de l'examen de cada món, si l'admin la sap. Sense accés del navegador.
--  · public.bn_admin_examen_desa(correu, contrasenya, assig, data) → [{"assig","data"}] (totes, per assig). data null = l'esborra.
--
--  · public.bn_admin_benestar(correu, contrasenya, període = '7d', nom = null) → jsonb
--      {"periode",
--       "mons": [{"assig","dia0","examen","vigilies":["AAAA-MM-DD",…],"normal"}],
--       "nens": [{"k","nom","semafor","senyals":[{"codi","nivell","dia","assig","valor","llindar"},…]}]}
--      (a més, el senyal «pressa» porta «encert» i el de «xat» porta «minuts»)
--    període: 'avui' | '7d' | '30d' | 'curs' (com la resta del tauler), comptat en DIES SENCERS: des de la mitjanit (Madrid) del primer dia.
--    nom: un sol nen (lower(trim)) o null = tots. Els mons són del grup i no depenen del nom.
--
--    MONS: els que tenen activitat al període i els que tenen data d'examen.
--      dia0     = dia del primer registre d'aquell món (de qualsevol nen). Dies 0-2 = novetat (ho pinta el tauler).
--      examen   = la data de bn_priv.examens o null.
--      vigilies = si hi ha data, només data − 1 (LA DATA MANA: aquell món no fa servir el pic). Si no, els dies de PIC DEL GRUP:
--                 un dia entre el 3 i el 12 del món (dia − dia0) amb (a) 5 nens o més amb minuts > 0 aquell dia, o la meitat dels nens
--                 del món (els que hi tenen algun registre, de sempre), i (b) minuts del grup ≥ 3 × la mediana dels minuts diaris del
--                 grup en ELS ALTRES dies amb minuts del món. Si no hi ha cap altre dia amb minuts, no hi ha mediana i no hi ha pic.
--      normal   = mediana dels minuts diaris del grup als dies amb minuts que no són vigília (minuts enters, o null).
--      Minuts = suma de detall.s dels events «temps» (només xifres, fins a 999.999 s per event; la resta no compta).
--
--    NENS: els que tenen registres al període, més els de «inactiu» i «xat» (encara que no hagin vingut al període).
--      semafor = el pitjor nivell dels senyals de vigilar: 'vermell' > 'groc' > 'verd'. 'blau', 'context' i 'bo' no compten (verd).
--      Ordenats de pitjor a millor (semàfor, quants vermells, quants grocs, k); els senyals de cada nen, també
--      (vermell, groc, blau, context, bo; i dins de cada nivell, del dia més recent al més vell).
--      Cada senyal: codi, nivell ('vermell' | 'groc' | 'blau' | 'context' | 'bo'), dia ('AAAA-MM-DD' de Madrid), assig (o null),
--      valor i llindar (números; què volen dir depèn del codi). Dos senyals porten una clau de més: «pressa» porta «encert»
--      (percentatge enter 0-100) i «xat» porta «minuts» (minuts d'estudi dels últims 7 dies, enter).
--
--      codi                 nivell              quan surt (llindar inicial)                                  dia / assig / valor / llindar
--      marato_bloc          vermell (blau a     un bloc de minuts seguits > 60 min (+30 dissabte i diumenge)  dia del bloc / món principal del dia /
--                           la vigília)         a la vigília del món principal del dia: > 120 (+30)            minuts del bloc / el llindar
--      marato_dia           vermell (blau)      minuts del dia > 90 (+30 dissabte i diumenge; vigília: 120)    dia / món principal / minuts del dia / llindar
--                           Bloc: events «temps» del nen (de tots els mons i aparells) on l'inici del següent (ts − s) és a MENYS de 5 min
--                           del final de l'anterior (ts). Màxim un senyal de marató per nen i dia: el de bloc si passa, si no el del dia.
--                           Món principal del dia = el de més minuts del nen aquell dia. Es compara en minuts arrodonits.
--      nit                  groc (2 nits o      una entrada («entra») a partir de les 21:30, o de les 22:00 si aquell dia és vigília del món de
--                           més: vermell)       l'entrada, fins a les 6:00 (una entrada a les 0:30 és de la nit d'abans). Un senyal per nit.
--                                               dia = la nit / món de l'última entrada / valor = hora de l'última entrada en minuts des de la
--                                               mitjanit de la nit (22:40 = 1360; 0:30 = 1470) / llindar = 1290 (21:30) o 1320 (22:00).
--                                               Es fa servir l'hora del servidor (ts); detall.h (hora de l'aparell, sense minuts) no cal.
--      pressa               groc                per nen i món al període: 10 respostes o més (bn_priv.respostes, amb segons), mitjana < 3 s
--                                               i encert < 50 %. dia = l'última / valor = segons per pregunta (1 decimal) / llindar = 3
--                                               encert = percentatge d'encert (enter 0-100)
--      repetir              groc                4 tests o més del mateix tema el mateix dia amb est = 0 (cap estrella nova). Tests de tema
--                                               (mode 'tema' o sense mode). valor = tests / llindar = 4
--      frustracio_suspesos  groc                3 suspesos seguits (pc < 70) del mateix tema (tests de tema, en ordre). valor = la ratxa més
--                                               llarga / llindar = 3 / dia = l'últim suspès
--      frustracio_costa     groc                2 «Costa» o més (valora) en un món al període. valor = quants / llindar = 2
--      enganxa              groc                qualsevol intent d'enganxar en una oberta (detall.enganxat > 0). valor = intents / llindar = 1
--      xat                  groc                10 frases o més al xat (bn_priv.xat_msg, també les esborrades) i menys de 60 min d'estudi, tots
--                                               dos en els ÚLTIMS 7 DIES (sigui quin sigui el període). valor = frases / llindar = 10 / assig null
--                                               minuts = minuts d'estudi d'aquests 7 dies (enter)
--      inactiu              groc                com l'alerta «inactiu» de bn_admin_alertes: ha vingut els últims 30 dies però no els últims 3.
--                                               dia = l'últim registre / valor = dies sense venir / llindar = 3 / assig null
--      poc_sovint           bo                  3 dies o més amb 10-40 min (tots els mons) en els ÚLTIMS 7 DIES (avui i els 6 d'abans).
--                                               dia = l'últim / valor = dies / llindar = 3 / assig null
--      apren_errors         bo                  errors apresos al repàs (joc 'repas', detall.apr) dels últims 7 dies > els dels 7 dies d'abans.
--                                               dia = l'últim amb apr / valor = apresos aquesta setmana / llindar = els de la setmana d'abans
--      dos_aparells         context             el mateix dia, dos events «temps» del nen d'aparells diferents que se solapen: els minuts poden
--                                               sortir doblats. Un senyal per dia. valor = aparells / llindar = 2 / assig null

create index if not exists bn_log_assig_ts on public.bn_log(assig, ts);   -- dia 0 i minuts de cada món sense llegir tot el registre

-- ---------- dates d'examen ----------
create table if not exists bn_priv.examens(
  assig text primary key check (assig ~ '^[a-z0-9_-]{1,40}$'),
  data date not null,
  ts timestamptz not null default now()
);
alter table bn_priv.examens enable row level security;
revoke all on bn_priv.examens from public, anon, authenticated;

-- ---------- ajuda (esquema privat) ----------
-- un número del detall (text amb xifres, 0 … 999.999); res més: negatius, text, 1e30, buit → null (mai peta)
create or replace function bn_priv.benestar_num(p text) returns numeric
language sql immutable set search_path = '' as $$
  select case when p ~ '^[0-9]{1,6}(\.[0-9]+)?$' then p::numeric end
$$;

-- ---------- 1) desar o esborrar la data d'un examen ----------
create or replace function public.bn_admin_examen_desa(p_email text, p_pass text, p_assig text, p_data date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_assig text := lower(trim(coalesce(p_assig, '')));
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  if v_assig !~ '^[a-z0-9_-]{1,40}$' then raise exception 'mon no valid' using errcode = '22023'; end if;
  if p_data is null then
    delete from bn_priv.examens e where e.assig = v_assig;
  else
    if p_data not between date '2020-01-01' and date '2100-12-31' then
      raise exception 'data no valida' using errcode = '22023';
    end if;
    insert into bn_priv.examens(assig, data) values (v_assig, p_data)
      on conflict (assig) do update set data = excluded.data, ts = now();
  end if;
  return coalesce((select jsonb_agg(jsonb_build_object('assig', e.assig, 'data', e.data) order by e.assig)
                   from bn_priv.examens e), '[]'::jsonb);
end $$;

-- ---------- 2) benestar: mons (vigílies) i senyals per nen ----------
create or replace function public.bn_admin_benestar(p_email text, p_pass text, p_periode text default '7d', p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_per text := coalesce(p_periode, '7d');
  v_kk text := nullif(lower(trim(coalesce(p_nom, ''))), '');
  v_ara timestamptz := now();
  v_fins timestamptz := now() + interval '1 minute';
  v_avui date := (now() at time zone 'Europe/Madrid')::date;
  v_d0 timestamptz;      -- inici del període: la mitjanit (Madrid) del primer dia
  v_dmin timestamptz;    -- el que cal llegir: el període i, com a mínim, els 14 últims dies (senyals setmanals)
  v_mons jsonb;
  v_xat jsonb;           -- {k: {n, nom, ult}} dels últims 7 dies; null si no hi ha xat
  v_nens jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  v_d0 := date_trunc('day', bn_priv.desde(v_per) at time zone 'Europe/Madrid') at time zone 'Europe/Madrid';
  v_dmin := least(v_d0, (v_avui - 13)::timestamp at time zone 'Europe/Madrid');

  -- mons: dia 0, data d'examen, vigílies (la data mana; si no, el pic del grup) i el dia normal
  with mm as (
    select distinct x.assig from public.bn_log x where x.ts >= v_d0 and x.ts < v_fins
    union
    select e.assig from bn_priv.examens e
  ),
  mb as (
    select mm.assig, e.data examen,
           (select (min(x.ts) at time zone 'Europe/Madrid')::date from public.bn_log x where x.assig = mm.assig) dia0,
           (select count(distinct lower(trim(x.nom))) from public.bn_log x where x.assig = mm.assig) nens
    from mm left join bn_priv.examens e on e.assig = mm.assig
  ),
  md as (   -- minuts del grup per món i dia (només els dies amb minuts) i quants nens hi han estudiat
    select t.assig, t.dia, sum(t.s) s, count(*) nens
    from (select x.assig, (x.ts at time zone 'Europe/Madrid')::date dia, lower(trim(x.nom)) k,
                 sum(bn_priv.benestar_num(x.detall ->> 's')) s
          from public.bn_log x
          where x.assig in (select mm.assig from mm) and x.event = 'temps'
          group by 1, 2, 3) t
    where t.s > 0
    group by 1, 2
  ),
  vg as (
    select mb.assig, mb.examen - 1 dia from mb where mb.examen is not null
    union
    select mb.assig, md.dia
    from mb join md on md.assig = mb.assig
    where mb.examen is null
      and md.dia - mb.dia0 between 3 and 12
      and (md.nens >= 5 or md.nens * 2 >= mb.nens)
      and md.s >= 3 * (select percentile_cont(0.5) within group (order by o.s)
                       from md o where o.assig = md.assig and o.dia <> md.dia)
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'assig', mb.assig, 'dia0', mb.dia0, 'examen', mb.examen,
           'vigilies', coalesce((select jsonb_agg(vg.dia order by vg.dia) from vg where vg.assig = mb.assig), '[]'::jsonb),
           'normal', (select round((percentile_cont(0.5) within group (order by md.s))::numeric / 60)
                      from md where md.assig = mb.assig
                        and not exists (select 1 from vg where vg.assig = md.assig and vg.dia = md.dia)))
         order by mb.assig), '[]'::jsonb)
    into v_mons
  from mb;

  -- xat (dinàmic: si bn_xat.sql no s'ha aplicat, la taula no existeix i el senyal no surt)
  if to_regclass('bn_priv.xat_msg') is not null then
    execute 'select coalesce(jsonb_object_agg(z.k, jsonb_build_object(''n'', z.n, ''nom'', z.nom, ''ult'', z.ult)), ''{}''::jsonb)
             from (select m.k, count(*)::int n, max(m.nom) nom, max(m.ts) ult
                   from bn_priv.xat_msg m
                   where m.ts >= $1 and m.ts < $2 and ($3::text is null or m.k = $3)
                   group by m.k) z'
      into v_xat using v_ara - interval '7 days', v_fins, v_kk;
  end if;

  with
  vig as (
    select m ->> 'assig' assig, (v #>> '{}')::date dia
    from jsonb_array_elements(v_mons) m, jsonb_array_elements(m -> 'vigilies') v
  ),
  l as (    -- registres que calen (primer pel temps: índex bn_log_ts), del nen triat si n'hi ha
    select x.ts, x.assig, x.nom, lower(trim(x.nom)) k, x.aparell, x.event, x.detall, x.ts at time zone 'Europe/Madrid' lt
    from public.bn_log x
    where x.ts >= v_dmin and x.ts < v_fins and (v_kk is null or lower(trim(x.nom)) = v_kk)
  ),
  lp as (select l.* from l where l.ts >= v_d0),   -- només el període
  tm as (   -- temps del període: cada event és un tram [ini, fi] de s segons d'un aparell
    select z.k, z.assig, z.aparell, z.fi, z.fi - make_interval(secs => z.s::float8) ini, z.s,
           (z.fi at time zone 'Europe/Madrid')::date dia
    from (select lp.k, lp.assig, lp.aparell, lp.ts fi, bn_priv.benestar_num(lp.detall ->> 's') s
          from lp where lp.event = 'temps') z
    where z.s > 0
  ),
  tb as (   -- blocs: n'arrenca un de nou quan l'inici és a 5 min o més del final de l'anterior (mateix nen, ordenat pel final)
    select y.*, sum(y.nou) over (partition by y.k order by y.fi, y.ini rows unbounded preceding) bloc
    from (select tm.*, case when lag(tm.fi) over w is null or tm.ini - lag(tm.fi) over w >= interval '5 minutes'
                            then 1 else 0 end nou
          from tm window w as (partition by tm.k order by tm.fi, tm.ini)) y
  ),
  bl as (select tb.k, tb.bloc, sum(tb.s) s, (min(tb.fi) at time zone 'Europe/Madrid')::date dia from tb group by tb.k, tb.bloc),
  bm as (select bl.k, bl.dia, max(bl.s) s from bl group by bl.k, bl.dia),
  ta as (select tm.k, tm.dia, tm.assig, sum(tm.s) s from tm group by tm.k, tm.dia, tm.assig),
  td as (select ta.k, ta.dia, sum(ta.s) s, (array_agg(ta.assig order by ta.s desc, ta.assig))[1] assig
         from ta group by ta.k, ta.dia),
  mt as (
    select td.k, td.dia, td.assig, v.vg, round(coalesce(bm.s, 0) / 60) mbloc, round(td.s / 60) mdia,
           (case when v.vg then 120 else 60 end) + w.extra lbloc,
           (case when v.vg then 120 else 90 end) + w.extra ldia
    from td
    left join bm on bm.k = td.k and bm.dia = td.dia
    cross join lateral (select exists (select 1 from vig where vig.assig = td.assig and vig.dia = td.dia) vg) v
    cross join lateral (select case when extract(isodow from td.dia) >= 6 then 30 else 0 end extra) w
  ),
  ne as (   -- entrades de nit (de 21:30, o 22:00 la vigília del món, fins a les 6:00); la nit és la del dia que comença
    select y.*
    from (select z.*, case when exists (select 1 from vig where vig.assig = z.assig and vig.dia = z.nit) then 1320 else 1290 end llindar
          from (select lp.k, lp.assig, (lp.lt - interval '6 hours')::date nit,
                       floor(extract(epoch from lp.lt - ((lp.lt - interval '6 hours')::date)::timestamp) / 60) mins
                from lp where lp.event = 'entra') z) y
    where y.mins >= y.llindar
  ),
  nn as (
    select ne.k, ne.nit, (array_agg(ne.assig order by ne.mins desc))[1] assig, max(ne.mins) mins,
           (array_agg(ne.llindar order by ne.mins desc))[1] llindar, count(*) over (partition by ne.k) nits
    from ne group by ne.k, ne.nit
  ),
  pr as (
    select r.k, r.assig, count(*) n, avg(r.segons) sp, avg(case when r.ok then 1.0 else 0.0 end) enc, max(r.ts) ult
    from bn_priv.respostes(v_d0, v_fins, null::text, v_kk) r
    where r.segons is not null
    group by r.k, r.assig
  ),
  tt as (   -- tests de tema del període amb tema
    select lp.k, lp.assig, lp.ts, lp.lt::date dia, lp.detall ->> 'tema' tema,
           bn_priv.benestar_num(lp.detall ->> 'pc') pc, bn_priv.benestar_num(lp.detall ->> 'est') est
    from lp
    where lp.event = 'test' and coalesce(lp.detall ->> 'mode', 'tema') = 'tema' and coalesce(lp.detall ->> 'tema', '') <> ''
  ),
  fx as (   -- ratxes de suspesos per tema (illes de suspesos seguits)
    select z.*, row_number() over (partition by z.k, z.assig, z.tema order by z.ts)
              - row_number() over (partition by z.k, z.assig, z.tema, z.sus order by z.ts) grp
    from (select tt.k, tt.assig, tt.tema, tt.ts, tt.pc < 70 sus from tt where tt.pc is not null) z
  ),
  fr as (select fx.k, fx.assig, fx.tema, count(*) n, max(fx.ts) ult from fx where fx.sus
         group by fx.k, fx.assig, fx.tema, fx.grp having count(*) >= 3),
  ia as (   -- com l'alerta «inactiu»: ha vingut els últims 30 dies, però no els últims 3
    select lower(trim(x.nom)) k, max(x.nom) nom, max(x.ts) ult
    from public.bn_log x
    where x.ts >= v_ara - interval '30 days' and x.ts < v_fins and (v_kk is null or lower(trim(x.nom)) = v_kk)
    group by 1 having max(x.ts) < v_ara - interval '3 days'
  ),
  xt as (
    select x.key k, (x.value ->> 'n')::int n, x.value ->> 'nom' nom, (x.value ->> 'ult')::timestamptz ult
    from jsonb_each(coalesce(v_xat, '{}'::jsonb)) x
  ),
  dm as (   -- minuts per nen i dia (tots els mons), dels 14 últims dies o més
    select z.k, z.dia, sum(z.s) s
    from (select l.k, l.ts, l.lt::date dia, bn_priv.benestar_num(l.detall ->> 's') s from l where l.event = 'temps') z
    where z.s > 0
    group by z.k, z.dia
  ),
  xm as (   -- minuts d'estudi dels últims 7 dies (per al xat)
    select z.k, round(sum(z.s) / 60) m
    from (select l.k, bn_priv.benestar_num(l.detall ->> 's') s from l where l.event = 'temps' and l.ts >= v_ara - interval '7 days') z
    where z.s > 0
    group by z.k
  ),
  ap as (
    select z.k, sum(z.apr) filter (where z.dia >= v_avui - 6) ara, sum(z.apr) filter (where z.dia < v_avui - 6) abans,
           max(z.dia) filter (where z.dia >= v_avui - 6 and z.apr > 0) ult
    from (select l.k, l.lt::date dia, bn_priv.benestar_num(l.detall ->> 'apr') apr
          from l where l.event = 'joc' and l.detall ->> 'joc' = 'repas' and l.lt::date >= v_avui - 13) z
    where z.apr is not null
    group by z.k
  ),
  sen as (
    -- marató (un per nen i dia: el de bloc si passa, si no el del dia)
    select mt.k, case when mt.mbloc > mt.lbloc then 'marato_bloc' else 'marato_dia' end codi,
           case when mt.vg then 'blau' else 'vermell' end nivell, mt.dia, mt.assig,
           case when mt.mbloc > mt.lbloc then mt.mbloc else mt.mdia end::numeric valor,
           case when mt.mbloc > mt.lbloc then mt.lbloc else mt.ldia end::numeric llindar,
           null::jsonb extra   -- claus de més (només pressa i xat)
    from mt where mt.mbloc > mt.lbloc or mt.mdia > mt.ldia
    union all
    -- nit (un per nit)
    select nn.k, 'nit', case when nn.nits >= 2 then 'vermell' else 'groc' end, nn.nit, nn.assig, nn.mins::numeric, nn.llindar::numeric, null::jsonb
    from nn
    union all
    -- pressa
    select pr.k, 'pressa', 'groc', (pr.ult at time zone 'Europe/Madrid')::date, pr.assig, round(pr.sp, 1), 3::numeric,
           jsonb_build_object('encert', round(pr.enc * 100))
    from pr where pr.n >= 10 and pr.sp < 3 and pr.enc < 0.5
    union all
    -- repetir sense aprendre
    select tt.k, 'repetir', 'groc', tt.dia, tt.assig, count(*)::numeric, 4::numeric, null::jsonb
    from tt where tt.est = 0
    group by tt.k, tt.dia, tt.assig, tt.tema having count(*) >= 4
    union all
    -- frustració: suspesos seguits d'un tema
    select fr.k, 'frustracio_suspesos', 'groc', (max(fr.ult) at time zone 'Europe/Madrid')::date, fr.assig, max(fr.n)::numeric, 3::numeric, null::jsonb
    from fr group by fr.k, fr.assig, fr.tema
    union all
    -- frustració: «Costa» repetit en un món
    select lp.k, 'frustracio_costa', 'groc', (max(lp.ts) at time zone 'Europe/Madrid')::date, lp.assig, count(*)::numeric, 2::numeric, null::jsonb
    from lp where lp.event = 'valora' and lp.detall ->> 'v' = 'Costa'
    group by lp.k, lp.assig having count(*) >= 2
    union all
    -- enganxa text a les obertes
    select z.k, 'enganxa', 'groc', (max(z.ts) at time zone 'Europe/Madrid')::date, z.assig, sum(z.n), 1::numeric, null::jsonb
    from (select lp.k, lp.assig, lp.ts,
                 case when lp.detall -> 'enganxat' = 'true'::jsonb then 1 else bn_priv.benestar_num(lp.detall ->> 'enganxat') end n
          from lp where lp.event = 'oberta') z
    where z.n > 0
    group by z.k, z.assig
    union all
    -- entra per xatejar (últims 7 dies)
    select xt.k, 'xat', 'groc', (xt.ult at time zone 'Europe/Madrid')::date, null::text, xt.n::numeric, 10::numeric,
           jsonb_build_object('minuts', coalesce(xm.m, 0))
    from xt left join xm on xm.k = xt.k
    where xt.n >= 10 and coalesce(xm.m, 0) < 60
    union all
    -- deixa de venir
    select ia.k, 'inactiu', 'groc', (ia.ult at time zone 'Europe/Madrid')::date, null::text,
           (v_avui - (ia.ult at time zone 'Europe/Madrid')::date)::numeric, 3::numeric, null::jsonb
    from ia
    union all
    -- poc i sovint (últims 7 dies)
    select dm.k, 'poc_sovint', 'bo', max(dm.dia), null::text, count(*)::numeric, 3::numeric, null::jsonb
    from dm where dm.dia >= v_avui - 6 and round(dm.s / 60) between 10 and 40
    group by dm.k having count(*) >= 3
    union all
    -- aprèn dels errors (aquesta setmana > la d'abans)
    select ap.k, 'apren_errors', 'bo', ap.ult, null::text, ap.ara, coalesce(ap.abans, 0), null::jsonb
    from ap where coalesce(ap.ara, 0) > coalesce(ap.abans, 0)
    union all
    -- dos aparells que se solapen el mateix dia
    select a.k, 'dos_aparells', 'context', a.dia, null::text, count(distinct a.aparell)::numeric, 2::numeric, null::jsonb
    from tm a join tm b on b.k = a.k and b.dia = a.dia and b.aparell <> a.aparell and a.ini < b.fi and b.ini < a.fi
    group by a.k, a.dia
  ),
  nk as (
    select lp.k, lp.nom from lp
    union all
    select ia.k, ia.nom from ia
    union all
    select xt.k, xt.nom from xt where exists (select 1 from sen where sen.k = xt.k and sen.codi = 'xat')
  ),
  nm as (select nk.k, max(nk.nom) nom from nk group by nk.k)
  select coalesce(jsonb_agg(jsonb_build_object('k', nm.k, 'nom', nm.nom, 'semafor', s.semafor, 'senyals', s.senyals)
                            order by s.ord, s.nv desc, s.ng desc, nm.k), '[]'::jsonb)
    into v_nens
  from nm
  cross join lateral (
    select case when bool_or(x.nivell = 'vermell') then 'vermell' when bool_or(x.nivell = 'groc') then 'groc' else 'verd' end semafor,
           case when bool_or(x.nivell = 'vermell') then 0 when bool_or(x.nivell = 'groc') then 1 else 2 end ord,
           count(*) filter (where x.nivell = 'vermell') nv,
           count(*) filter (where x.nivell = 'groc') ng,
           coalesce(jsonb_agg(jsonb_build_object('codi', x.codi, 'nivell', x.nivell, 'dia', x.dia, 'assig', x.assig,
                                                 'valor', x.valor, 'llindar', x.llindar) || coalesce(x.extra, '{}'::jsonb)
                              order by case x.nivell when 'vermell' then 0 when 'groc' then 1 when 'blau' then 2
                                                     when 'context' then 3 else 4 end,
                                       x.dia desc nulls last, x.codi, x.assig), '[]'::jsonb) senyals
    from sen x where x.k = nm.k
  ) s;

  return jsonb_build_object('periode', v_per, 'mons', v_mons, 'nens', v_nens);
end $$;

-- ---------- permisos: les públiques només funcionen amb el correu i la contrasenya de l'admin ----------
revoke all on function public.bn_admin_benestar(text,text,text,text) from public;
grant execute on function public.bn_admin_benestar(text,text,text,text) to anon, authenticated;
revoke all on function public.bn_admin_examen_desa(text,text,text,date) from public;
grant execute on function public.bn_admin_examen_desa(text,text,text,date) to anon, authenticated;
revoke all on function bn_priv.benestar_num(text) from public, anon, authenticated;
