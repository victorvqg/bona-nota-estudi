-- ⚠ SUBSTITUÏT per bn_ranking_net.sql (rànquing amb codi de grup, filtre de noms i límit d'estrelles). No el tornis a executar.
-- Bona Nota · rànquing de la portada (amb noms): estrelles totals, temps d'estudi i estrelles màximes en un món.
-- Executar una vegada al SQL Editor de Supabase.
create or replace function public.bn_ranking()
returns table(nom text, punts int, temps_s int, punts_max int)
language sql stable security definer set search_path = '' as $$
  with per as (
    select lower(l.nom) k, max(l.nom) nom, l.assig,
           coalesce(max((l.detall->>'punts')::numeric),0) p,
           coalesce(sum((l.detall->>'s')::numeric) filter (where l.event='temps'),0) t
    from public.bn_log l
    where l.ts > now() - interval '120 days'
    group by 1, 3)
  select max(nom), sum(p)::int, sum(t)::int, max(p)::int
  from per group by k
  having sum(p) > 0 or sum(t) > 0
  order by 2 desc
  limit 200
$$;
revoke all on function public.bn_ranking() from public;
grant execute on function public.bn_ranking() to anon, authenticated;
