-- Estrelles d'un nom a cada món (per a la capçalera: «⭐ suma de tots els mons»).
-- Mateix càlcul que el rànquing (màxim de punts registrat els últims 120 dies per món),
-- i si el progrés desat al núvol (amb PIN) en té més, agafa aquest.
-- No retorna res que el rànquing no mostri ja (el total per nom és públic); només el desglossa per món.
create or replace function public.bn_punts_mons(p_nom text)
returns table(assig text, punts int)
language sql stable security definer set search_path = '' as $$
  with l as (
    select l.assig, max((l.detall->>'punts')::numeric) p
    from public.bn_log l
    where lower(trim(l.nom)) = lower(trim(p_nom)) and l.ts > now() - interval '120 days'
    group by 1),
  pr as (
    select g.assig,
           case when (g.estat->>'punts') ~ '^[0-9]+(\.[0-9]+)?$' then (g.estat->>'punts')::numeric else 0 end p
    from bn_priv.progres g
    where g.k = lower(trim(p_nom)))
  select coalesce(l.assig, pr.assig), greatest(coalesce(l.p,0), coalesce(pr.p,0))::int
  from l full join pr on pr.assig = l.assig
$$;
revoke all on function public.bn_punts_mons(text) from public;
grant execute on function public.bn_punts_mons(text) to anon, authenticated;
