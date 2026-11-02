-- Bona Nota · comparativa anònima per a la pantalla «Com vas» dels nens.
-- Retorna una fila per nen (SENSE nom): estrelles, encert mitjà als tests, nombre de tests i temps d'estudi.
-- Executar una vegada al SQL Editor de Supabase.
create or replace function public.bn_comparativa(p_assig text)
returns table(punts int, encert int, tests int, temps_s int)
language sql stable security definer set search_path = '' as $$
  select coalesce(max((l.detall->>'punts')::numeric),0)::int,
         round(avg((l.detall->>'pc')::numeric) filter (where l.event='test'))::int,
         (count(*) filter (where l.event='test'))::int,
         coalesce(sum((l.detall->>'s')::numeric) filter (where l.event='temps'),0)::int
  from public.bn_log l
  where l.assig = p_assig and l.ts > now() - interval '120 days'
  group by lower(l.nom)
  having count(*) filter (where l.event in ('test','temps','joc')) > 0
  order by 1 desc
  limit 500
$$;
revoke all on function public.bn_comparativa(text) from public;
grant execute on function public.bn_comparativa(text) to anon, authenticated;
