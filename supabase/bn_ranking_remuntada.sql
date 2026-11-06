-- Bona Nota 2.0 · pestanya «Remuntada» del rànquing: errors apresos al repàs espaiat els últims 7 dies, per nen.
-- Surt del camp «apr» que el motor afegeix al registre de cada repàs (event «joc», joc = «repas») des de la fase 1 (n2445).
-- Funció nova i només de lectura: no canvia bn_ranking_mons ni cap taula. Mateixos filtres que el rànquing
-- (noms amagats i noms no permesos fora). Cada registre compta com a màxim 20 (ningú no ho pot inflar des del navegador).
create or replace function public.bn_ranking_remuntada()
returns table(nom text, apr int)
language sql stable security definer set search_path = '' as $$
  select max(l.nom),
         sum(least(case when l.detall->>'apr' ~ '^[0-9]{1,4}$' then (l.detall->>'apr')::int else 0 end, 20))::int
  from public.bn_log l
  where l.ts > now() - interval '7 days'
    and l.event = 'joc' and l.detall->>'joc' = 'repas' and l.detall ? 'apr'
    and not exists (select 1 from bn_priv.amagats a where a.k = lower(trim(l.nom)))
    and not bn_priv.nom_prohibit(l.nom)
  group by lower(trim(l.nom))
  having sum(least(case when l.detall->>'apr' ~ '^[0-9]{1,4}$' then (l.detall->>'apr')::int else 0 end, 20)) > 0
  order by 2 desc
  limit 200
$$;
revoke all on function public.bn_ranking_remuntada() from public;
grant execute on function public.bn_ranking_remuntada() to anon, authenticated;
