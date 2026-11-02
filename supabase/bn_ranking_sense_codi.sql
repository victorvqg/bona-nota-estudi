-- Bona Nota · rànquing SENSE codi de grup (substitueix la part del codi de bn_ranking_net.sql).
-- Es mantenen: filtre de noms, límit d'estrelles (trigger) i noms amagats per l'admin.
drop function if exists public.bn_ranking(text);
create or replace function public.bn_ranking(p_codi text default null)
returns table(nom text, punts int, temps_s int, punts_max int)
language sql stable security definer set search_path = '' as $$
  with per as (
    select lower(trim(l.nom)) k, max(l.nom) nm, l.assig,
           coalesce(max((l.detall->>'punts')::numeric),0) p,
           coalesce(sum((l.detall->>'s')::numeric) filter (where l.event='temps'),0) t
    from public.bn_log l
    where l.ts > now() - interval '120 days'
      and not exists (select 1 from bn_priv.amagats a where a.k = lower(trim(l.nom)))
      and not bn_priv.nom_prohibit(l.nom)
    group by 1, 3)
  select max(per.nm), sum(per.p)::int, sum(per.t)::int, max(per.p)::int
  from per group by per.k
  having sum(per.p) > 0 or sum(per.t) > 0
  order by 2 desc
  limit 200
$$;
revoke all on function public.bn_ranking(text) from public;
grant execute on function public.bn_ranking(text) to anon, authenticated;
delete from bn_priv.config where clau = 'codi_grup';
