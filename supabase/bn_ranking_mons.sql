-- Rànquing amb el desglossament per món: igual que bn_ranking i, a més, «mons» = {assig: estrelles} i «dies» = dies diferents d'estudi (Europe/Madrid, últims 120 dies).
-- La portada el fa servir per mostrar el total, les estrelles de cada món i la pestanya «Dies» (BON-US PR F · ADR-0008). bn_ranking es manté igual.
begin;
drop function if exists public.bn_ranking_mons(text);
create or replace function public.bn_ranking_mons(p_codi text default null)
returns table(nom text, punts int, temps_s int, punts_max int, setmana int, mons jsonb, dies int)
language sql stable security definer set search_path = '' as $$
  with base as (
    select lower(trim(l.nom)) k, l.nom, l.assig, l.ts, l.event, l.detall
    from public.bn_log l
    where l.ts > now() - interval '120 days'
      and l.event <> 'alta'
      and l.nom is not null and trim(l.nom) <> ''
      and not exists (select 1 from bn_priv.amagats a where a.k = lower(trim(l.nom)))
      and not bn_priv.nom_prohibit(l.nom)
  ),
  per as (
    select b.k, max(b.nom) nm, b.assig,
           coalesce(max((b.detall->>'punts')::numeric),0) p,
           coalesce(max((b.detall->>'punts')::numeric) filter (where b.ts <= now() - interval '7 days'),0) p_abans,
           coalesce(sum((b.detall->>'s')::numeric) filter (where b.event='temps'),0) t
    from base b
    group by 1, 3
  ),
  dies_k as (
    select b.k, count(distinct (b.ts at time zone 'Europe/Madrid')::date)::int d
    from base b
    group by 1
  )
  select max(per.nm), sum(per.p)::int, sum(per.t)::int, max(per.p)::int, sum(greatest(per.p - per.p_abans,0))::int,
         coalesce(jsonb_object_agg(per.assig, per.p::int) filter (where per.p > 0), '{}'::jsonb),
         coalesce(max(dk.d), 0)::int
  from per
  left join dies_k dk on dk.k = per.k
  group by per.k
  having sum(per.p) > 0 or sum(per.t) > 0
  order by 2 desc
  limit 200
$$;
revoke all on function public.bn_ranking_mons(text) from public;
grant execute on function public.bn_ranking_mons(text) to anon, authenticated;
commit;
