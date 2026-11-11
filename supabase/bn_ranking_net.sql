-- ⚠ ACTUALITZACIÓ (2 nov 2026): el codi de grup s'ha tret a petició. Vegeu bn_ranking_sense_codi.sql:
--   bn_ranking(p_codi default null) ja no demana codi i la fila codi_grup s'ha esborrat.
-- Bona Nota · rànquing net (paquet 2)
-- 1) Filtre de noms: rebutja paraulotes i caràcters estranys en entrar al registre.
-- 2) Límit d'estrelles: com a màxim +150 per registre i +300 en 24 h per nom i assignatura
--    (si algú envia «999999 ⭐» des del navegador, es retalla).
-- 3) Codi de grup: el rànquing amb noms només es veu amb el codi correcte.
-- 4) L'admin pot amagar un nom del rànquing (i tornar-lo a mostrar) o canviar el codi.

create table if not exists bn_priv.config(clau text primary key, valor text not null);
insert into bn_priv.config(clau,valor) values ('codi_grup','ANOIA') on conflict (clau) do nothing;
create table if not exists bn_priv.amagats(k text primary key, ts timestamptz not null default now());
revoke all on bn_priv.config, bn_priv.amagats from public, anon, authenticated;

-- nom normalitzat (minúscules, sense accents)
create or replace function bn_priv.norm(t text) returns text language sql immutable set search_path = '' as $$
  select translate(lower(trim(t)),'àáâäèéêëìíîïòóôöùúûüçñ·','aaaaeeeeiiiioooouuuucn.')
$$;

create or replace function bn_priv.nom_prohibit(t text) returns boolean language sql immutable set search_path = '' as $$
  select bn_priv.norm(t) !~ '^[a-z0-9 ._''-]+$'
      or bn_priv.norm(t) ~ '^_|^(tast|convidat|anonim|visitant|guest|demo_tast)$'
      or bn_priv.norm(t) ~ ('(^|[^a-z])(puta|puto|putes|putos|merda|mierda|cabron|cabro|polla|cony|cono|collons|cojones|gilipolles|gilipollas|imbecil|idiota|subnormal|maricon|marica|mongol|mongolo|joputa|zorra|guarra|pene|penis|culo|cul|caca|pipi|pedo|pet|tonto|tonta|burro|fuck|shit|bitch|dick|ass|nazi|hitler|porno|porn|sexo|sex|teta|tetes|tetas|xixa|chocho|verga|follar|folla)([^a-z]|$)')
      or bn_priv.norm(t) ~ '(fill ?de ?puta|hijo ?de ?puta|me cago|em cago)'
$$;

create or replace function bn_priv.bn_log_net() returns trigger language plpgsql security definer set search_path = '' as $$
declare k text := lower(trim(new.nom)); prev numeric; prev24 numeric; p numeric;
begin
  if bn_priv.nom_prohibit(new.nom) then
    raise exception 'nom no permes' using errcode = '22023';
  end if;
  if new.detall ? 'punts' then
    p := greatest(coalesce((new.detall->>'punts')::numeric, 0), 0);
    select coalesce(max((l.detall->>'punts')::numeric),0) into prev
      from public.bn_log l where lower(trim(l.nom)) = k and l.assig = new.assig;
    select coalesce(max((l.detall->>'punts')::numeric),0) into prev24
      from public.bn_log l where lower(trim(l.nom)) = k and l.assig = new.assig and l.ts < now() - interval '24 hours';
    if p > least(prev + 150, prev24 + 300) then
      p := greatest(prev, least(prev + 150, prev24 + 300));
      new.detall := new.detall || jsonb_build_object('punts', p, 'retallat', true);
    end if;
  end if;
  return new;
exception when invalid_text_representation then
  new.detall := new.detall - 'punts';
  return new;
end $$;
drop trigger if exists bn_log_net on public.bn_log;
create trigger bn_log_net before insert on public.bn_log for each row execute function bn_priv.bn_log_net();

-- rànquing amb codi de grup (la versió sense codi s'elimina)
drop function if exists public.bn_ranking();
create or replace function public.bn_ranking(p_codi text)
returns table(nom text, punts int, temps_s int, punts_max int)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from bn_priv.config c where c.clau = 'codi_grup' and upper(trim(c.valor)) = upper(trim(coalesce(p_codi,'')))) then
    perform pg_sleep(0.8);
    raise exception 'codi incorrecte' using errcode = '28000';
  end if;
  return query
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
  limit 200;
end $$;
revoke all on function public.bn_ranking(text) from public;
grant execute on function public.bn_ranking(text) to anon, authenticated;

-- admin: amaga / mostra del rànquing, canvia el codi de grup
create or replace function public.bn_admin_usuari(p_email text, p_pass text, p_nom text, p_accio text, p_nou text default null)
returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
  if p_accio = 'esborra' then
    delete from public.bn_log l where lower(trim(l.nom)) = lower(trim(p_nom));
  elsif p_accio = 'canvia' then
    if p_nou is null or char_length(trim(p_nou)) not between 1 and 40 then
      raise exception 'nom nou no valid';
    end if;
    update public.bn_log l set nom = trim(p_nou) where lower(trim(l.nom)) = lower(trim(p_nom));
  elsif p_accio = 'amaga' then
    insert into bn_priv.amagats(k) values (lower(trim(p_nom))) on conflict do nothing;
  elsif p_accio = 'mostra' then
    delete from bn_priv.amagats a where a.k = lower(trim(p_nom));
  elsif p_accio = 'codi' then
    if p_nou is null or char_length(trim(p_nou)) not between 3 and 30 then
      raise exception 'codi no valid';
    end if;
    update bn_priv.config set valor = upper(trim(p_nou)) where clau = 'codi_grup';
  elsif p_accio = 'estat' then
    null;
  else
    raise exception 'accio desconeguda';
  end if;
  get diagnostics n = row_count;
  if p_accio = 'estat' then
    select case when exists (select 1 from bn_priv.amagats a where a.k = lower(trim(p_nom))) then 1 else 0 end into n;
  end if;
  return n;
end $$;
revoke all on function public.bn_admin_usuari(text,text,text,text,text) from public;
grant execute on function public.bn_admin_usuari(text,text,text,text,text) to anon, authenticated;

-- l'admin pot llegir el codi actual
create or replace function public.bn_admin_codi(p_email text, p_pass text)
returns text language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
  return (select valor from bn_priv.config where clau = 'codi_grup');
end $$;
revoke all on function public.bn_admin_codi(text,text) from public;
grant execute on function public.bn_admin_codi(text,text) to anon, authenticated;
