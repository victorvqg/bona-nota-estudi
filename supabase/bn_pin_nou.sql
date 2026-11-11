-- Bona Nota · PIN nou: 4 xifres + 1 lletra al final (ex. 4587R)
-- Pas 1 (compatible amb el PIN antic de 4 xifres, per no trencar res mentre es publica la web nova):
--   · bn_priv.perfils: columnes pin_v (1 = antic, 2 = nou) i pin_ts (quan es va posar el PIN nou)
--   · bn_priv.pin_ok: compara sempre en majúscules i sense espais
--   · bn_perfil_crea: accepta els dos formats (el pas 2 només deixa el nou)
--   · bn_perfil_canvia_pin(nom, pin_actual, pin_nou): l'«actualització de seguretat»
--   · bn_admin_usuari 'estat': +4 si ja té el PIN nou
-- Pas 2 (quan la web nova ja està publicada): bn_perfil_crea només accepta 4 xifres + 1 lletra.

-- ============ PAS 1 ============
alter table bn_priv.perfils add column if not exists pin_v smallint not null default 1;
alter table bn_priv.perfils add column if not exists pin_ts timestamptz;

create or replace function bn_priv.pin_ok(p_nom text, p_pin text)
 returns boolean language plpgsql security definer set search_path to ''
as $function$
declare kk text := lower(trim(p_nom)); r bn_priv.perfils; i bn_priv.intents; pp text := upper(trim(coalesce(p_pin,'')));
begin
  select * into r from bn_priv.perfils p where p.k = kk;
  if not found then return false; end if;
  select * into i from bn_priv.intents x where x.k = kk;
  if found and i.n >= 5 and i.ts > now() - interval '15 minutes' then
    raise exception 'massa intents' using errcode = '28000';
  end if;
  if r.pin = extensions.crypt(pp, r.pin) then
    delete from bn_priv.intents x where x.k = kk;
    return true;
  end if;
  insert into bn_priv.intents(k,n,ts) values (kk,1,now())
    on conflict (k) do update set n = case when bn_priv.intents.ts < now() - interval '15 minutes' then 1 else bn_priv.intents.n + 1 end, ts = now();
  perform pg_sleep(1);
  return false;
end $function$;

create or replace function public.bn_perfil_crea(p_nom text, p_pin text)
 returns text language plpgsql security definer set search_path to ''
as $function$
declare pp text := upper(trim(coalesce(p_pin,'')));
begin
  if pp !~ '^[0-9]{4}[A-Z]?$' then raise exception 'pin no valid' using errcode = '22023'; end if;
  if char_length(trim(p_nom)) not between 1 and 40 or bn_priv.nom_prohibit(p_nom) then raise exception 'nom no permes' using errcode = '22023'; end if;
  insert into bn_priv.perfils(k,nom,pin,pin_v,pin_ts)
    values (lower(trim(p_nom)), trim(p_nom), extensions.crypt(pp, extensions.gen_salt('bf')),
            case when pp ~ '^[0-9]{4}[A-Z]$' then 2 else 1 end, case when pp ~ '^[0-9]{4}[A-Z]$' then now() end)
    on conflict (k) do nothing;
  if found then return 'creat'; end if;
  return 'existeix';
end $function$;

create or replace function public.bn_perfil_canvia_pin(p_nom text, p_pin text, p_nou text)
 returns text language plpgsql security definer set search_path to ''
as $function$
declare nn text := upper(trim(coalesce(p_nou,'')));
begin
  if nn !~ '^[0-9]{4}[A-Z]$' then raise exception 'pin no valid' using errcode = '22023'; end if;
  -- sense raise quan pin_ok torna false: així l'intent fallit es conserva a bn_priv.intents (issue #33)
  if not bn_priv.pin_ok(p_nom, p_pin) then return 'pin'; end if;
  update bn_priv.perfils p set pin = extensions.crypt(nn, extensions.gen_salt('bf')), pin_v = 2, pin_ts = now()
   where p.k = lower(trim(p_nom));
  return 'ok';
end $function$;
revoke all on function public.bn_perfil_canvia_pin(text,text,text) from public;
grant execute on function public.bn_perfil_canvia_pin(text,text,text) to anon, authenticated;

create or replace function public.bn_admin_usuari(p_email text, p_pass text, p_nom text, p_accio text, p_nou text default null::text)
 returns integer language plpgsql security definer set search_path to ''
as $function$
declare n int; kk text := lower(trim(coalesce(p_nom, ''))); kn text := lower(trim(coalesce(p_nou, ''))); nn text := trim(coalesce(p_nou, ''));
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
  if p_accio = 'esborra' then
    delete from public.bn_log l where lower(trim(l.nom)) = kk;
    get diagnostics n = row_count;
    delete from bn_priv.perfils p where p.k = kk;
    delete from bn_priv.progres g where g.k = kk;
    return n;
  elsif p_accio = 'canvia' then
    if p_nou is null or char_length(nn) not between 1 and 40 then
      raise exception 'nom nou no valid';
    end if;
    update public.bn_log l set nom = nn where lower(trim(l.nom)) = kk;
    get diagnostics n = row_count;
    update bn_priv.perfils p set k = kn, nom = nn where p.k = kk
      and not exists (select 1 from bn_priv.perfils q where q.k = kn);
    update bn_priv.progres g set k = kn where g.k = kk
      and not exists (select 1 from bn_priv.progres q where q.k = kn and q.assig = g.assig);
    if to_regclass('bn_priv.xat_msg') is not null then
      update bn_priv.xat_msg m set k = kn, nom = nn where m.k = kk;
      update bn_priv.xat_msg m set company = nn where m.company is not null and lower(trim(m.company)) = kk;
      delete from bn_priv.xat_vots v where v.k = kk and exists (select 1 from bn_priv.xat_vots q where q.msg = v.msg and q.k = kn);
      update bn_priv.xat_vots v set k = kn where v.k = kk;
      update bn_priv.xat_silenci s set k = kn where s.k = kk and not exists (select 1 from bn_priv.xat_silenci q where q.k = kn);
      delete from bn_priv.xat_silenci s where s.k = kk;
    end if;
    return n;
  elsif p_accio = 'amaga' then
    insert into bn_priv.amagats(k) values (kk) on conflict do nothing;
  elsif p_accio = 'mostra' then
    delete from bn_priv.amagats a where a.k = kk;
  elsif p_accio = 'treupin' then
    delete from bn_priv.perfils p where p.k = kk;
    delete from bn_priv.intents i where i.k = kk;
  elsif p_accio = 'estat' then
    return (case when exists (select 1 from bn_priv.amagats a where a.k = kk) then 1 else 0 end)
         + (case when exists (select 1 from bn_priv.perfils p where p.k = kk) then 2 else 0 end)
         + (case when exists (select 1 from bn_priv.perfils p where p.k = kk and p.pin_v = 2) then 4 else 0 end);
  else
    raise exception 'accio desconeguda';
  end if;
  get diagnostics n = row_count;
  return n;
end $function$;

-- ============ PAS 2 (després de publicar la web nova) ============
-- create or replace function public.bn_perfil_crea(p_nom text, p_pin text)
--  returns text language plpgsql security definer set search_path to ''
-- as $function$
-- declare pp text := upper(trim(coalesce(p_pin,'')));
-- begin
--   if pp !~ '^[0-9]{4}[A-Z]$' then raise exception 'pin no valid' using errcode = '22023'; end if;
--   if char_length(trim(p_nom)) not between 1 and 40 or bn_priv.nom_prohibit(p_nom) then raise exception 'nom no permes' using errcode = '22023'; end if;
--   insert into bn_priv.perfils(k,nom,pin,pin_v,pin_ts)
--     values (lower(trim(p_nom)), trim(p_nom), extensions.crypt(pp, extensions.gen_salt('bf')), 2, now())
--     on conflict (k) do nothing;
--   if found then return 'creat'; end if;
--   return 'existeix';
-- end $function$;
