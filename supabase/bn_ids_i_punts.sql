-- Bona Nota · ID numèric per nen i recuperació d'estrelles (migracions «bn_perfils_id_numeric» i «bn_punts_maxim», 2 nov 2026)
-- bn_priv.perfils.id (identity, únic) · bn_perfil_id(nom) · bn_admin_ids(email, pass) · bn_punts_maxim(nom, assig) = màxim d'estrelles registrades al bn_log.
-- bn_admin_ids torna tots els nens (tant els que tenen perfil a bn_priv.perfils com els del registre public.bn_log sense perfil, amb id = null),
-- perquè el filtre de dalt del panell d'admin (#fNen) sempre mostri tots els nens independentment del període triat.

alter table bn_priv.perfils add column if not exists id bigint generated always as identity unique;
alter table bn_priv.perfils add column if not exists creat timestamptz;

create or replace function public.bn_admin_ids(p_email text, p_pass text)
 returns table(k text, nom text, id bigint, ts timestamp with time zone)
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
begin
  if not exists (select 1 from bn_priv.admin a where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5); raise exception 'acces denegat' using errcode = '28000';
  end if;
  return query
    select coalesce(p.k, l.k) as k,
           coalesce(p.nom, l.nom) as nom,
           p.id,
           coalesce(p.creat, l.primer) as ts
      from bn_priv.perfils p
      full join (
        select lower(trim(x.nom)) as k, max(x.nom) as nom, min(x.ts) as primer
          from public.bn_log x
         where lower(trim(x.nom)) <> '' and lower(trim(x.nom)) <> '_alta'
         group by 1
      ) l on l.k = p.k
     where not bn_priv.nom_prohibit(coalesce(p.nom, l.nom))
     order by p.id nulls last, coalesce(p.k, l.k);
end $function$;
revoke all on function public.bn_admin_ids(text, text) from public;
grant execute on function public.bn_admin_ids(text, text) to anon, authenticated;
