-- Bona Nota · Onada 1: Matriu Alumnes × Temes per món + índexs de rendiment a bn_log
-- Executar UNA vegada al SQL Editor del projecte «bonanota» (es pot tornar a executar: tot és «if not exists» / «create or replace»).
--
-- 1) Índexs compostos a public.bn_log per accelerar les consultes d'admin (Mons, Nens, Sessions, Dificultat).
-- 2) RPC public.bn_admin_matriu_mon(p_email text, p_pass text, p_assig text) -> jsonb
--    Torna un array d'alumnes actius al món p_assig amb:
--      { k, nom, id, te_pin, punts, ultim_ts, rep_n, boss_v, exam_max, temes: { <tid>: { max, n, fitxa } }, visuals, premi_visual }

create index if not exists bn_log_assig_ts_idx on public.bn_log (assig, ts desc);
create index if not exists bn_log_event_ts_idx on public.bn_log (event, ts desc);
create index if not exists bn_log_nom_ts_idx   on public.bn_log ((lower(trim(nom))), ts desc);

create or replace function public.bn_admin_matriu_mon(p_email text, p_pass text, p_assig text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_assig text := lower(trim(coalesce(p_assig, '')));
  v_premis jsonb := '[]'::jsonb;
  v_res jsonb := '[]'::jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  if v_assig = '' then
    return '[]'::jsonb;
  end if;

  if to_regclass('bn_priv.premis_visuals') is not null then
    execute $q$
      select coalesce(jsonb_agg(jsonb_build_object(
        'k', x.k, 'reward_key', x.reward_key, 'stars', x.stars,
        'ts', (extract(epoch from x.ts) * 1000)::bigint)), '[]'::jsonb)
      from bn_priv.premis_visuals x
    $q$ into v_premis;
  end if;

  with actius as (
    select u.k, max(u.nom) as nom, max(u.ultim_ts) as ultim_ts
    from (
      select g.k, coalesce(nullif(trim(g.estat ->> 'nom'), ''), g.k) as nom, g.ts as ultim_ts
      from bn_priv.progres g
      where lower(g.assig) = v_assig
      union all
      select lower(trim(l.nom)) as k, l.nom, l.ts as ultim_ts
      from public.bn_log l
      where lower(l.assig) = v_assig and l.nom is not null and trim(l.nom) <> ''
    ) u
    where not bn_priv.nom_prohibit(u.nom)
    group by u.k
  ),
  log_temes as (
    select
      lower(trim(l.nom)) as k,
      l.detall ->> 'tema' as tid,
      max(case when l.event = 'test' and (l.detall ->> 'pc') ~ '^[0-9]+(\.[0-9]+)?$' then round((l.detall ->> 'pc')::numeric)::int end) as max_pc,
      count(*) filter (where l.event = 'test')::int as n_tests,
      bool_or(l.event in ('fitxa', 'targetes')) as te_fitxa
    from public.bn_log l
    where lower(l.assig) = v_assig
      and l.event in ('test', 'fitxa', 'targetes')
      and coalesce(l.detall ->> 'tema', '') <> ''
    group by lower(trim(l.nom)), l.detall ->> 'tema'
  ),
  log_temes_agg as (
    select k,
      jsonb_object_agg(tid, jsonb_build_object('max', max_pc, 'n', n_tests, 'fitxa', te_fitxa)) as temes_log
    from log_temes
    group by k
  ),
  log_extra as (
    select
      lower(trim(l.nom)) as k,
      max(case when l.event = 'examen' and (l.detall ->> 'pc') ~ '^[0-9]+(\.[0-9]+)?$' then round((l.detall ->> 'pc')::numeric)::int end) as exam_max,
      count(*) filter (where l.event = 'joc' and l.detall ->> 'joc' = 'boss' and coalesce((l.detall ->> 'guanya')::boolean, false))::int as boss_v,
      max(case when (l.detall ->> 'punts') ~ '^[0-9]+(\.[0-9]+)?$' then round((l.detall ->> 'punts')::numeric)::int end) as punts_log
    from public.bn_log l
    where lower(l.assig) = v_assig
    group by lower(trim(l.nom))
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'k', a.k,
    'nom', coalesce(p.nom, a.nom),
    'id', p.id,
    'te_pin', (p.k is not null),
    'punts', coalesce(
      case when (g.estat ->> 'punts') ~ '^[0-9]+(\.[0-9]+)?$' then round((g.estat ->> 'punts')::numeric)::int end,
      le.punts_log, 0),
    'ultim_ts', (extract(epoch from a.ultim_ts) * 1000)::bigint,
    'rep_n', case when jsonb_typeof(g.estat -> 'rep') = 'array' then jsonb_array_length(g.estat -> 'rep') else 0 end,
    'boss_v', greatest(
      coalesce(case when (g.estat -> 'boss' ->> 'v') ~ '^[0-9]+$' then (g.estat -> 'boss' ->> 'v')::int end, 0),
      coalesce(le.boss_v, 0)),
    'exam_max', greatest(
      (select max(case when (e ->> 'pc') ~ '^[0-9]+(\.[0-9]+)?$' then round((e ->> 'pc')::numeric)::int end)
       from jsonb_array_elements(case when jsonb_typeof(g.estat -> 'examens') = 'array' then g.estat -> 'examens' else '[]'::jsonb end) e),
      le.exam_max),
    'temes_progres', case when jsonb_typeof(g.estat -> 'temes') = 'object' then g.estat -> 'temes' else '{}'::jsonb end,
    'temes_log', coalesce(lt.temes_log, '{}'::jsonb),
    'visuals', case when jsonb_typeof(g.estat -> 'visuals') = 'object' then g.estat -> 'visuals' else '{}'::jsonb end
  ) order by coalesce(p.nom, a.nom)), '[]'::jsonb)
  into v_res
  from actius a
  left join bn_priv.perfils p on p.k = a.k
  left join bn_priv.progres g on g.k = a.k and lower(g.assig) = v_assig
  left join log_temes_agg lt on lt.k = a.k
  left join log_extra le on le.k = a.k;

  return jsonb_build_object('assig', v_assig, 'alumnes', v_res, 'premis_visuals', v_premis);
end $$;

revoke all on function public.bn_admin_matriu_mon(text,text,text) from public;
grant execute on function public.bn_admin_matriu_mon(text,text,text) to anon, authenticated;
