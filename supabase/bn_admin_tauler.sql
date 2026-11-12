-- Bona Nota · tauler d'admin: funcions que tornen les dades JA AGREGADES (el navegador no rep el log cru).
-- Totes comproven correu + contrasenya igual que bn_admin_logs (bn_priv.admin). Executar una vegada al SQL Editor de Supabase.
--
-- Paràmetres comuns:  p_email, p_pass,
--   p_periode  'avui' | '7d' | '30d' | 'curs'   (curs = des de l'1 de setembre)
--   p_assig    id del món (socials, comarques, biogeo, castellano, divisibilitat…) o null = tots
--   p_nom      nom del nen o null = tots
--
-- Format de les preguntes al detall (des del 4-11-2026): "q": ["tema/núm:encert(1|0):segons|-:opció|-", …]
-- Les hores es compten a l'hora de Catalunya (Europe/Madrid). Dia de la setmana: 1 = dilluns … 7 = diumenge.

create index if not exists bn_log_event_ts on public.bn_log(event, ts desc);
create index if not exists bn_log_nom on public.bn_log((lower(trim(nom))));

-- ---------- ajudes (esquema privat) ----------
create or replace function bn_priv.admin_ok(p_email text, p_pass text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
end $$;

create or replace function bn_priv.desde(p_periode text) returns timestamptz
language sql stable set search_path = '' as $$
  select case coalesce(p_periode, '7d')
    when 'avui' then (date_trunc('day', now() at time zone 'Europe/Madrid')) at time zone 'Europe/Madrid'
    when '30d'  then now() - interval '30 days'
    when 'curs' then (make_date(extract(year from now() at time zone 'Europe/Madrid')::int
                        - case when extract(month from now() at time zone 'Europe/Madrid') < 9 then 1 else 0 end, 9, 1)::timestamp)
                      at time zone 'Europe/Madrid'
    else now() - interval '7 days' end
$$;

-- registres filtrats (assignatura, nen i interval)
create or replace function bn_priv.logs(p_desde timestamptz, p_fins timestamptz, p_assig text, p_nom text)
returns setof public.bn_log language sql stable set search_path = '' as $$
  select * from public.bn_log l
  where l.ts >= p_desde and l.ts < p_fins
    and (p_assig is null or p_assig = '' or l.assig = p_assig)
    and (p_nom is null or p_nom = '' or lower(trim(l.nom)) = lower(trim(p_nom)))
$$;

-- una fila per resposta: d'on surt cada pregunta contestada (tests, examens, repàs i jocs de preguntes)
create or replace function bn_priv.respostes(p_desde timestamptz, p_fins timestamptz, p_assig text, p_nom text)
returns table(ts timestamptz, assig text, k text, nom text, qid text, ok boolean, segons int, op text, event text, mode text)
language sql stable set search_path = '' as $$
  select l.ts, l.assig, lower(trim(l.nom)), l.nom,
         split_part(x, ':', 1), split_part(x, ':', 2) = '1',
         case when split_part(x, ':', 3) ~ '^[0-9]{1,7}$' then split_part(x, ':', 3)::int end,
         nullif(split_part(x, ':', 4), '-'), l.event, l.detall->>'mode'
  from bn_priv.logs(p_desde, p_fins, p_assig, p_nom) l,
       jsonb_array_elements_text(case when jsonb_typeof(l.detall->'q') = 'array' then l.detall->'q' else '[]'::jsonb end) x
  where l.event in ('test', 'examen', 'joc') and x like '%:%'
$$;

-- xifres d'un interval (per al resum i per comparar amb el període anterior)
create or replace function bn_priv.xifres(p_desde timestamptz, p_fins timestamptz, p_assig text, p_nom text) returns jsonb
language sql stable set search_path = '' as $$
  with l as (select * from bn_priv.logs(p_desde, p_fins, p_assig, p_nom)),
       r as (select * from bn_priv.respostes(p_desde, p_fins, p_assig, p_nom))
  select jsonb_build_object(
    'nens',      (select count(distinct lower(trim(nom))) from l),
    'sessions',  (select count(distinct sessio) from l),
    'dies',      (select count(distinct (lower(trim(nom)), (ts at time zone 'Europe/Madrid')::date)) from l),
    'minuts',    (select round(coalesce(sum((detall->>'s')::numeric), 0) / 60) from l where event = 'temps' and detall->>'s' ~ '^\d+(\.\d+)?$'),
    'tests',     (select count(*) from l where event = 'test'),
    'nota',      (select round(avg((detall->>'pc')::numeric)) from l where event = 'test' and detall->>'pc' ~ '^[0-9]{1,7}$'),
    'aprovats',  (select round(100.0 * count(*) filter (where (detall->>'pc')::int >= 70) / nullif(count(*), 0))
                    from l where event = 'test' and detall->>'pc' ~ '^[0-9]{1,7}$'),
    'examens',   (select count(*) from l where event = 'examen'),
    'nota_exam', (select round(avg((detall->>'pc')::numeric)) from l where event = 'examen' and detall->>'pc' ~ '^\d+$'),
    'jocs',      (select count(*) from l where event = 'joc'),
    'obertes',   (select count(*) from l where event = 'oberta'),
    'fitxes',    (select count(*) from l where event = 'fitxa'),
    'respostes', (select count(*) from r),
    'encert',    (select round(100.0 * count(*) filter (where ok) / nullif(count(*), 0)) from r),
    'seg_preg',  (select round(avg(segons)::numeric, 1) from r where segons is not null)
  )
$$;

-- ---------- 1) resum global (amb el període anterior per comparar) ----------
create or replace function public.bn_admin_resum(p_email text, p_pass text, p_periode text default '7d', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare d timestamptz; ant timestamptz;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  d := bn_priv.desde(p_periode);
  ant := d - (now() - d);
  return jsonb_build_object('periode', coalesce(p_periode, '7d'), 'desde', d,
    'ara', bn_priv.xifres(d, now() + interval '1 minute', p_assig, p_nom),
    'abans', case when p_periode = 'curs' then null else bn_priv.xifres(ant, d, p_assig, p_nom) end);
end $$;

-- ---------- 2) activitat per dia i per nen ----------
create or replace function public.bn_admin_activitat(p_email text, p_pass text, p_periode text default '7d', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(x order by x.dia, x.nom) from (
    select (l.ts at time zone 'Europe/Madrid')::date as dia, max(l.nom) as nom,
           round(coalesce(sum((l.detall->>'s')::numeric) filter (where l.event = 'temps' and l.detall->>'s' ~ '^\d+(\.\d+)?$'), 0) / 60, 1) as minuts,
           count(*) filter (where l.event <> 'temps') as accions,
           count(*) filter (where l.event = 'test') as tests,
           round(avg((l.detall->>'pc')::numeric) filter (where l.event = 'test' and l.detall->>'pc' ~ '^\d+$')) as nota
    from bn_priv.logs(bn_priv.desde(p_periode), now() + interval '1 minute', p_assig, p_nom) l
    group by 1, lower(trim(l.nom))) x), '[]'::jsonb);
end $$;

-- ---------- 3) mapa de calor: hora × dia de la setmana ----------
create or replace function public.bn_admin_calor(p_email text, p_pass text, p_periode text default '30d', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(x order by x.dw, x.h) from (
    select extract(isodow from l.ts at time zone 'Europe/Madrid')::int as dw,
           extract(hour from l.ts at time zone 'Europe/Madrid')::int as h,
           round(coalesce(sum((l.detall->>'s')::numeric) filter (where l.event = 'temps' and l.detall->>'s' ~ '^\d+(\.\d+)?$'), 0) / 60, 1) as minuts,
           count(*) filter (where l.event <> 'temps') as accions,
           count(distinct lower(trim(l.nom))) as nens
    from bn_priv.logs(bn_priv.desde(p_periode), now() + interval '1 minute', p_assig, p_nom) l
    group by 1, 2) x), '[]'::jsonb);
end $$;

-- ---------- 4) domini per nen × tema ----------
create or replace function public.bn_admin_domini(p_email text, p_pass text, p_periode text default 'curs', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(x order by x.nom, x.assig, x.tema) from (
    select max(l.nom) as nom, l.assig, l.detall->>'tema' as tema, max(l.detall->>'titol') as titol,
           max((l.detall->>'pc')::int) filter (where l.event = 'test') as millor,
           round(avg((l.detall->>'pc')::numeric) filter (where l.event = 'test')) as mitjana,
           count(*) filter (where l.event = 'test') as intents,
           (array_agg((l.detall->>'pc')::int order by l.ts desc) filter (where l.event = 'test'))[1] as ultima,
           max(l.ts) filter (where l.event = 'test') as ultim,
           max(l.ts) as vist,
           (array_agg(l.detall->>'v' order by l.ts desc) filter (where l.event = 'valora'))[1] as valoracio,
           coalesce(sum((l.detall->>'s')::int) filter (where l.event in ('fitxa', 'targetes') and l.detall->>'s' ~ '^[0-9]{1,7}$'), 0) as segons_estudi,
           count(*) filter (where l.event = 'fitxa') as fitxes
    from bn_priv.logs(bn_priv.desde(p_periode), now() + interval '1 minute', p_assig, p_nom) l
    where l.event in ('test', 'fitxa', 'targetes', 'valora') and coalesce(l.detall->>'tema', '') <> ''
      and (l.event <> 'test' or l.detall->>'pc' ~ '^[0-9]{1,7}$')
    group by lower(trim(l.nom)), l.assig, l.detall->>'tema') x), '[]'::jsonb);
end $$;

-- ---------- 5) preguntes més fallades (top 20 per assignatura) ----------
create or replace function public.bn_admin_fallades(p_email text, p_pass text, p_periode text default 'curs', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(y order by y.assig, y.ordre) from (
    select x.*, row_number() over (partition by x.assig order by x.errors desc, x.pct_error desc, x.intents desc) as ordre from (
      select r.assig, r.qid, count(*) as intents, count(*) filter (where not r.ok) as errors,
             round(100.0 * count(*) filter (where not r.ok) / count(*)) as pct_error,
             count(distinct r.k) as nens, count(distinct r.k) filter (where not r.ok) as nens_fallen,
             mode() within group (order by r.op) filter (where not r.ok and r.op is not null) as opcio_parany,
             round(avg(r.segons)::numeric, 1) as segons
      from bn_priv.respostes(bn_priv.desde(p_periode), now() + interval '1 minute', p_assig, p_nom) r
      where r.qid <> '?' group by r.assig, r.qid having count(*) filter (where not r.ok) > 0) x) y
    where y.ordre <= 20), '[]'::jsonb);
end $$;

-- ---------- 6) evolució de les notes (tests i examens) ----------
create or replace function public.bn_admin_evolucio(p_email text, p_pass text, p_periode text default 'curs', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(x order by x.ts) from (
    select l.ts, l.nom, l.assig, l.event, coalesce(l.detall->>'tema', l.detall->>'joc') as tema,
           (l.detall->>'pc')::int as pc, l.detall->>'mode' as mode
    from bn_priv.logs(bn_priv.desde(p_periode), now() + interval '1 minute', p_assig, p_nom) l
    where l.event in ('test', 'examen') and l.detall->>'pc' ~ '^[0-9]{1,7}$'
    order by l.ts desc limit 3000) x), '[]'::jsonb);
end $$;

-- ---------- 7) alertes ----------
-- gravetat: 3 = atenció ara · 2 = cal mirar-ho · 1 = per saber-ho (configurables des de bn_priv.config clau 'llindars')
create or replace function public.bn_admin_alertes(p_email text, p_pass text, p_periode text default '30d', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d timestamptz;
  v_cfg_t text;
  v_al jsonb;
  v_inact_g int := 2;
  v_inact_da int := 3;
  v_inact_dm int := 7;
  v_baixa_g int := 2;
  v_baixa_pc int := 70;
  v_enc_g int := 3;
  v_enc_n int := 3;
  v_rap_g int := 2;
  v_rap_seg int := 3;
  v_rap_tests int := 2;
  v_preg_g int := 1;
  v_preg_pct int := 50;
  v_preg_nens int := 3;
  v_pend_g int := 1;
  v_pend_min int := 1;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  d := bn_priv.desde(p_periode);
  if to_regclass('bn_priv.config') is not null then
    execute 'select c.valor from bn_priv.config c where c.clau = ''llindars''' into v_cfg_t;
    begin v_al := (v_cfg_t::jsonb)->'alertes'; exception when others then v_al := null; end;
    if jsonb_typeof(v_al) = 'object' then
      if (v_al #>> '{inactiu,grav}') in ('0','1','2','3') then v_inact_g := (v_al #>> '{inactiu,grav}')::int; end if;
      if (v_al #>> '{inactiu,dies_avis}') ~ '^[0-9]{1,3}$' then v_inact_da := least(30, greatest(1, (v_al #>> '{inactiu,dies_avis}')::int)); end if;
      if (v_al #>> '{inactiu,dies_malament}') ~ '^[0-9]{1,3}$' then v_inact_dm := least(60, greatest(v_inact_da, (v_al #>> '{inactiu,dies_malament}')::int)); else v_inact_dm := greatest(v_inact_da, v_inact_dm); end if;
      if (v_al #>> '{baixa,grav}') in ('0','1','2','3') then v_baixa_g := (v_al #>> '{baixa,grav}')::int; end if;
      if (v_al #>> '{baixa,nota_max}') ~ '^[0-9]{1,3}$' then v_baixa_pc := least(100, greatest(30, (v_al #>> '{baixa,nota_max}')::int)); end if;
      if (v_al #>> '{encallat,grav}') in ('0','1','2','3') then v_enc_g := (v_al #>> '{encallat,grav}')::int; end if;
      if (v_al #>> '{encallat,vegades}') ~ '^[0-9]{1,3}$' then v_enc_n := least(15, greatest(2, (v_al #>> '{encallat,vegades}')::int)); end if;
      if (v_al #>> '{rapid,grav}') in ('0','1','2','3') then v_rap_g := (v_al #>> '{rapid,grav}')::int; end if;
      if (v_al #>> '{rapid,seg_max}') ~ '^[0-9]{1,3}$' then v_rap_seg := least(10, greatest(1, (v_al #>> '{rapid,seg_max}')::int)); end if;
      if (v_al #>> '{rapid,tests_min}') ~ '^[0-9]{1,3}$' then v_rap_tests := least(10, greatest(1, (v_al #>> '{rapid,tests_min}')::int)); end if;
      if (v_al #>> '{pregunta,grav}') in ('0','1','2','3') then v_preg_g := (v_al #>> '{pregunta,grav}')::int; end if;
      if (v_al #>> '{pregunta,pct_error}') ~ '^[0-9]{1,3}$' then v_preg_pct := least(95, greatest(20, (v_al #>> '{pregunta,pct_error}')::int)); end if;
      if (v_al #>> '{pregunta,nens_min}') ~ '^[0-9]{1,3}$' then v_preg_nens := least(30, greatest(2, (v_al #>> '{pregunta,nens_min}')::int)); end if;
      if (v_al #>> '{pendent,grav}') in ('0','1','2','3') then v_pend_g := (v_al #>> '{pendent,grav}')::int; end if;
      if (v_al #>> '{pendent,temes_min}') ~ '^[0-9]{1,3}$' then v_pend_min := least(20, greatest(1, (v_al #>> '{pendent,temes_min}')::int)); end if;
    end if;
  end if;
  return coalesce((select jsonb_agg(a order by a.gravetat desc, a.nom) from (
    -- a) fa N dies o més que no entra (entre els que han estudiat els últims 30 dies)
    select 'inactiu' as tipus,
           case when v_inact_g = 2 and max(l.ts) < now() - make_interval(days => v_inact_dm) then 3 else v_inact_g end as gravetat,
           max(l.nom) as nom, null::text as assig,
           format('Fa %s dies que no estudia', (now()::date - max(l.ts)::date)) as text
    from bn_priv.logs(now() - interval '30 days', now() + interval '1 minute', p_assig, p_nom) l
    group by lower(trim(l.nom)) having v_inact_g > 0 and max(l.ts) < now() - make_interval(days => v_inact_da)
    union all
    -- b) les tres últimes notes de test baixen
    select 'baixa', v_baixa_g, z.nom, z.assig, format('Les notes de test baixen: %s → %s → %s %%', z.p[3], z.p[2], z.p[1])
    from (select max(l.nom) as nom, l.assig, (array_agg((l.detall->>'pc')::int order by l.ts desc))[1:3] as p
          from bn_priv.logs(d, now() + interval '1 minute', p_assig, p_nom) l
          where l.event = 'test' and l.detall->>'pc' ~ '^[0-9]{1,7}$' group by lower(trim(l.nom)), l.assig) z
    where v_baixa_g > 0 and cardinality(z.p) = 3 and z.p[1] < z.p[2] and z.p[2] < z.p[3] and z.p[1] < coalesce(v_baixa_pc, 70)
    union all
    -- c) un tema suspès N vegades o més sense aprovar-lo mai
    select 'encallat', v_enc_g, max(l.nom), l.assig,
           format('Ha suspès «%s» %s vegades (millor nota %s %%)', max(l.detall->>'titol'), count(*), max((l.detall->>'pc')::int))
    from bn_priv.logs(d, now() + interval '1 minute', p_assig, p_nom) l
    where l.event = 'test' and l.detall->>'pc' ~ '^[0-9]{1,7}$' and coalesce(l.detall->>'mode', 'tema') = 'tema'
    group by lower(trim(l.nom)), l.assig, l.detall->>'tema'
    having v_enc_g > 0 and count(*) >= coalesce(v_enc_n, 3) and max((l.detall->>'pc')::int) < 70
    union all
    -- d) respon massa ràpid (menys de N s per pregunta de mitjana en M tests o més): potser endevina
    select 'rapid', v_rap_g, max(t.nom), t.assig, format('Respon massa ràpid: %s s per pregunta de mitjana en %s tests (potser endevina)', round(avg(t.sp), 1), count(*))
    from (select r.nom, r.k, r.assig, r.ts, avg(r.segons) as sp
          from bn_priv.respostes(d, now() + interval '1 minute', p_assig, p_nom) r where r.segons is not null
          group by r.nom, r.k, r.assig, r.ts having count(*) >= 4) t
    where v_rap_g > 0 and t.sp < v_rap_seg group by t.k, t.assig having count(*) >= v_rap_tests
    union all
    -- e) pregunta que falla més del % indicat dels nens que l'han contestada (mínim M nens)
    select 'pregunta', v_preg_g, null, q.assig, format('La pregunta %s la falla el %s %% dels nens (%s de %s)', q.qid, round(100.0 * q.f / q.n), q.f, q.n)
    from (select r.assig, r.qid, count(distinct r.k) as n, count(distinct r.k) filter (where not r.ok) as f
          from bn_priv.respostes(d, now() + interval '1 minute', p_assig, p_nom) r where r.qid <> '?' group by r.assig, r.qid) q
    where v_preg_g > 0 and q.n >= v_preg_nens and q.f * 100 > q.n * v_preg_pct
    union all
    -- f) temes que altres nens ja han treballat i ell encara no ha obert (dins de les assignatures que fa)
    select 'pendent', v_pend_g, k.nom, k.assig, format('No ha obert %s temes que altres ja han fet', count(*))
    from (select distinct lower(trim(l.nom)) as k, max(l.nom) over (partition by lower(trim(l.nom))) as nom, l.assig
          from bn_priv.logs(d, now() + interval '1 minute', p_assig, p_nom) l) k
    join (select distinct l.assig, l.detall->>'tema' as tema from public.bn_log l
          where l.event in ('fitxa', 'test') and l.ts >= d and coalesce(l.detall->>'tema', '') <> '') t on t.assig = k.assig
    where v_pend_g > 0 and not exists (select 1 from public.bn_log l2 where lower(trim(l2.nom)) = k.k and l2.assig = k.assig
                      and l2.event in ('fitxa', 'test', 'targetes') and l2.detall->>'tema' = t.tema)
    group by k.k, k.nom, k.assig having count(*) >= v_pend_min
  ) a), '[]'::jsonb);
end $$;

-- permisos: només es poden cridar amb el correu i la contrasenya de l'admin
do $$ declare f text; begin
  foreach f in array array['bn_admin_resum','bn_admin_activitat','bn_admin_calor','bn_admin_domini','bn_admin_fallades','bn_admin_evolucio','bn_admin_alertes'] loop
    execute format('revoke all on function public.%I(text,text,text,text,text) from public', f);
    execute format('grant execute on function public.%I(text,text,text,text,text) to anon, authenticated', f);
  end loop;
end $$;
revoke all on function bn_priv.admin_ok(text,text) from public, anon, authenticated;
revoke all on function bn_priv.desde(text) from public, anon, authenticated;
revoke all on function bn_priv.logs(timestamptz,timestamptz,text,text) from public, anon, authenticated;
revoke all on function bn_priv.respostes(timestamptz,timestamptz,text,text) from public, anon, authenticated;
revoke all on function bn_priv.xifres(timestamptz,timestamptz,text,text) from public, anon, authenticated;
