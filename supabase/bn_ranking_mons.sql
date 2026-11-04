-- Rànquing amb el desglossament per món: igual que bn_ranking i, a més, «mons» = {assig: estrelles}.
-- La portada el fa servir per mostrar el total i les estrelles de cada món. bn_ranking es manté igual.
create or replace function public.bn_ranking_mons(p_codi text default null)
returns table(nom text, punts int, temps_s int, punts_max int, setmana int, mons jsonb)
language sql stable security definer set search_path = '' as $$
  with per as (
    select lower(trim(l.nom)) k, max(l.nom) nm, l.assig,
           coalesce(max((l.detall->>'punts')::numeric),0) p,
           coalesce(max((l.detall->>'punts')::numeric) filter (where l.ts <= now() - interval '7 days'),0) p_abans,
           coalesce(sum((l.detall->>'s')::numeric) filter (where l.event='temps'),0) t
    from public.bn_log l
    where l.ts > now() - interval '120 days'
      and not exists (select 1 from bn_priv.amagats a where a.k = lower(trim(l.nom)))
      and not bn_priv.nom_prohibit(l.nom)
    group by 1, 3)
  select max(per.nm), sum(per.p)::int, sum(per.t)::int, max(per.p)::int, sum(greatest(per.p - per.p_abans,0))::int,
         coalesce(jsonb_object_agg(per.assig, per.p::int) filter (where per.p > 0), '{}'::jsonb)
  from per group by per.k
  having sum(per.p) > 0 or sum(per.t) > 0
  order by 2 desc
  limit 200
$$;
revoke all on function public.bn_ranking_mons(text) from public;
grant execute on function public.bn_ranking_mons(text) to anon, authenticated;
