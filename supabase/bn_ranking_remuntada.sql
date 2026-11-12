-- Bona Nota 2.0 · pestanya «Remuntada» del rànquing: errors recuperats al repàs espaiat els últims 7 dies, per nen (g22).
-- Puntuació per cada sessió de repàs (event «joc», joc = «repas»), alineada amb les estrelles de la font «repas»:
--   · +1 per cada error encertat al repàs («bones» de test + numeradors «b» d'«ext»: frase:b/n, mapa:b/n, taller:b/n…), amb topall de 20 per partida.
--   · +2 extra per cada error que arriba al 3r repàs i queda après del tot («apr»), amb topall de 20 per partida.
-- Mateixos filtres que el rànquing (noms amagats i noms no permesos fora). Manté la signatura nom + apr per compatibilitat.
create or replace function public.bn_ranking_remuntada()
returns table(nom text, apr int)
language sql stable security definer set search_path = '' as $$
  with punts_sessio as (
    select l.nom,
           (
             least(
               (case when l.detall->>'bones' ~ '^[0-9]{1,4}$' then (l.detall->>'bones')::int else 0 end)
               + coalesce((
                   select sum((m[1])::int)
                   from pg_catalog.regexp_matches(coalesce(l.detall->>'ext', ''), '(?:^|,)[a-z0-9_]+:([0-9]{1,4})/[0-9]{1,4}', 'g') as m
                 ), 0),
               20
             )
             + 2 * least(case when l.detall->>'apr' ~ '^[0-9]{1,4}$' then (l.detall->>'apr')::int else 0 end, 20)
           ) as pts
    from public.bn_log l
    where l.ts > now() - interval '7 days'
      and l.event = 'joc'
      and l.detall->>'joc' = 'repas'
      and not exists (select 1 from bn_priv.amagats a where a.k = lower(trim(l.nom)))
      and not bn_priv.nom_prohibit(l.nom)
  )
  select max(p.nom), sum(p.pts)::int
  from punts_sessio p
  where p.pts > 0
  group by lower(trim(p.nom))
  order by 2 desc
  limit 200
$$;
revoke all on function public.bn_ranking_remuntada() from public;
grant execute on function public.bn_ranking_remuntada() to anon, authenticated;
