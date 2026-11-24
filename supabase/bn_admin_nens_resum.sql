-- Bona Nota · Onada 2: Resum agregat de Nens a Postgres (sense baixar bn_log cru fora de Sessions)
-- Executar UNA vegada al SQL Editor del projecte «bonanota» (idempotent: create or replace).
--
-- RPC public.bn_admin_nens_resum(p_email text, p_pass text, p_dies int default null) -> jsonb
-- Retorna:
--   {
--     "total_nens": <int>,
--     "nens": [
--       { "k", "nom", "id", "te_pin", "amagat", "ult", "dies", "ratxa", "temps", "nota", "tests", "est", "est_max" }
--     ]
--   }

create or replace function public.bn_admin_nens_resum(p_email text, p_pass text, p_dies int default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_des timestamptz := case when p_dies is not null and p_dies > 0 then now() - make_interval(days => p_dies) else null end;
  v_total int := 0;
  v_nens jsonb := '[]'::jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  select count(*)::int into v_total
  from (
    select p.k from bn_priv.perfils p where not bn_priv.nom_prohibit(p.nom)
    union
    select lower(trim(l.nom)) as k
    from public.bn_log l
    where l.nom is not null and trim(l.nom) <> ''
      and coalesce(l.assig, '') <> '_alta'
      and not bn_priv.nom_prohibit(l.nom)
  ) t;

  with logs_per as (
    select
      lower(trim(l.nom)) as k,
      l.nom,
      lower(trim(coalesce(l.assig, ''))) as assig,
      l.event,
      l.ts,
      (l.ts at time zone 'Europe/Madrid')::date as dia,
      l.detall
    from public.bn_log l
    where l.nom is not null and trim(l.nom) <> ''
      and coalesce(l.assig, '') <> '_alta'
      and not bn_priv.nom_prohibit(l.nom)
      and (v_des is null or l.ts >= v_des)
  ),
  act_agg as (
    select
      k,
      max(nom) as nom,
      max(ts) as ult,
      count(distinct dia)::int as dies,
      coalesce(sum(
        case when (detall ->> 's') ~ '^[0-9]+(\.[0-9]+)?$'
          then least(greatest((detall ->> 's')::numeric, 0), 7200)
          else 0 end
      ), 0)::int as temps,
      count(*) filter (where event = 'test' and (detall ->> 'pc') ~ '^[0-9]+(\.[0-9]+)?$')::int as tests,
      round(avg(
        case when event = 'test' and (detall ->> 'pc') ~ '^[0-9]+(\.[0-9]+)?$'
          then (detall ->> 'pc')::numeric end
      ))::int as nota
    from logs_per
    group by k
  ),
  dies_unics as (
    select distinct k, dia from logs_per
  ),
  ratxes_grp as (
    select k, dia - (row_number() over (partition by k order by dia))::int as grp
    from dies_unics
  ),
  ratxes_max as (
    select k, max(cnt)::int as ratxa
    from (select k, grp, count(*) as cnt from ratxes_grp group by k, grp) s
    group by k
  ),
  punts_per_mon as (
    select k, assig, max(pts)::int as pts
    from (
      select g.k, lower(trim(g.assig)) as assig,
        case when (g.estat ->> 'punts') ~ '^[0-9]+(\.[0-9]+)?$' then round((g.estat ->> 'punts')::numeric)::int else 0 end as pts
      from bn_priv.progres g
      where g.k in (select k from act_agg)
      union all
      select lp.k, lp.assig,
        case when (lp.detall ->> 'punts') ~ '^[0-9]+(\.[0-9]+)?$' then round((lp.detall ->> 'punts')::numeric)::int else 0 end as pts
      from logs_per lp
      where lp.assig <> ''
    ) u
    group by k, assig
  ),
  punts_agg as (
    select k, coalesce(sum(pts), 0)::int as est, coalesce(max(pts), 0)::int as est_max
    from punts_per_mon
    group by k
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'k', a.k,
    'nom', coalesce(p.nom, a.nom),
    'id', p.id,
    'te_pin', (p.k is not null),
    'amagat', exists (select 1 from bn_priv.amagats am where am.k = a.k),
    'ult', (extract(epoch from a.ult) * 1000)::bigint,
    'dies', a.dies,
    'ratxa', coalesce(r.ratxa, 0),
    'temps', a.temps,
    'nota', a.nota,
    'tests', a.tests,
    'est', coalesce(pa.est, 0),
    'est_max', coalesce(pa.est_max, 0)
  ) order by a.ult desc), '[]'::jsonb)
  into v_nens
  from act_agg a
  left join bn_priv.perfils p on p.k = a.k
  left join ratxes_max r on r.k = a.k
  left join punts_agg pa on pa.k = a.k;

  return jsonb_build_object('total_nens', v_total, 'nens', v_nens);
end $$;

revoke all on function public.bn_admin_nens_resum(text,text,int) from public;
grant execute on function public.bn_admin_nens_resum(text,text,int) to anon, authenticated;
