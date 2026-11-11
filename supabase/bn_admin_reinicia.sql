-- Bona Nota · l'admin pot esborrar el PROGRÉS d'un nen (d'un món o de tots) sense esborrar-li el nom ni el PIN (n2409).
-- Executar UNA vegada al SQL Editor de Supabase (es pot tornar a executar: tot és «if not exists» / «create or replace»).
--
--  · bn_priv.reinicis(k, assig, ts): marca de cada reinici (assig = '*' vol dir «tots els mons»).
--  · public.bn_admin_reinicia(correu, contrasenya, nom, assig|null): esborra el registre (public.bn_log, d'on surten el
--    rànquing i la reconstrucció del progrés) i el progrés desat al núvol (bn_priv.progres). NO toca bn_priv.perfils
--    (el PIN es queda) ni bn_priv.amagats. Torna quantes files ha esborrat.
--  · public.bn_progres_llegeix: igual que abans + «reinici» (ms del reinici més recent d'aquell món o de '*'; 0 si no n'hi ha).
--    L'app, si el reinici és més nou que el que coneix, buida el progrés d'aquell món al dispositiu abans de fusionar.
--  · public.bn_progres_desa: igual que abans, però si el progrés que arriba és d'abans d'un reinici (estat.reinici més vell)
--    no el desa i torna -1 (així un dispositiu vell no fa tornar el progrés esborrat; l'app torna a baixar el progrés).
--  · trigger bn_log_reinici: si un dispositiu que encara no sap el reinici envia estrelles acumulades (detall.punts / fonts),
--    se'ls treuen (el registre de l'activitat es manté). L'app hi posa detall.ri = l'últim reinici que coneix.
--  · public.bn_reinicis(nom): els reinicis d'un nen (sense PIN: només hi ha dates), per a la portada i el total de tots els mons.

create table if not exists bn_priv.reinicis(
  k text not null,
  assig text not null,
  ts timestamptz not null default now(),
  primary key (k, assig)
);

-- mil·lisegons del reinici més recent d'un nen en un món (compta també el de '*'); 0 si no n'hi ha cap
create or replace function bn_priv.reinici_ms(p_k text, p_assig text)
returns bigint
language sql stable security definer set search_path = '' as $$
  select coalesce(max(floor(extract(epoch from r.ts) * 1000))::bigint, 0)
  from bn_priv.reinicis r where r.k = p_k and r.assig in (p_assig, '*')
$$;
revoke all on function bn_priv.reinici_ms(text, text) from public;

-- l'admin esborra el progrés d'un nen d'un món (p_assig) o de tots (p_assig null)
create or replace function public.bn_admin_reinicia(p_email text, p_pass text, p_nom text, p_assig text default null)
returns int
language plpgsql security definer set search_path = '' as $$
declare kk text := lower(trim(coalesce(p_nom, ''))); nl int := 0; np int := 0;
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
  if kk = '' then raise exception 'falta el nom'; end if;
  if p_assig is null or p_assig = '*' then
    delete from public.bn_log l where lower(trim(l.nom)) = kk;
    get diagnostics nl = row_count;
    delete from bn_priv.progres g where g.k = kk;
    get diagnostics np = row_count;
    insert into bn_priv.reinicis(k, assig, ts) values (kk, '*', now())
      on conflict (k, assig) do update set ts = excluded.ts;
  else
    delete from public.bn_log l where lower(trim(l.nom)) = kk and l.assig = p_assig;
    get diagnostics nl = row_count;
    delete from bn_priv.progres g where g.k = kk and g.assig = p_assig;
    get diagnostics np = row_count;
    insert into bn_priv.reinicis(k, assig, ts) values (kk, p_assig, now())
      on conflict (k, assig) do update set ts = excluded.ts;
  end if;
  return nl + np;
end $$;
revoke all on function public.bn_admin_reinicia(text, text, text, text) from public;
grant execute on function public.bn_admin_reinicia(text, text, text, text) to anon, authenticated;

-- bn_progres_llegeix: la mateixa definició que hi havia (PIN + registre reconstruït + progrés desat) i ara també «reinici»
-- sense raise quan pin_ok torna false: torna {"ok":false,"codi":"pin"} i conserva bn_priv.intents (issue #33)
create or replace function public.bn_progres_llegeix(p_nom text, p_pin text, p_assig text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r bn_priv.progres; lg jsonb; ri bigint;
begin
  if not bn_priv.pin_ok(p_nom, p_pin) then return jsonb_build_object('ok', false, 'codi', 'pin'); end if;
  lg := bn_priv.reconstrueix(lower(trim(p_nom)), p_assig);
  ri := bn_priv.reinici_ms(lower(trim(p_nom)), p_assig);
  select * into r from bn_priv.progres g where g.k = lower(trim(p_nom)) and g.assig = p_assig;
  if not found then return jsonb_build_object('mod', 0, 'estat', null, 'log', lg, 'reinici', ri); end if;
  return jsonb_build_object('mod', r.mod, 'estat', r.estat, 'log', lg, 'reinici', ri);
end $$;

-- bn_progres_desa: la mateixa definició que hi havia + no desa un progrés d'abans d'un reinici (-1), ni amb menys estrelles (-2), ni fa raise amb PIN incorrecte (-3)
create or replace function public.bn_progres_desa(p_nom text, p_pin text, p_assig text, p_estat jsonb, p_mod bigint)
returns bigint
language plpgsql security definer set search_path = '' as $$
declare ri_estat bigint; vell jsonb; p_nou numeric; p_vell numeric; ri_vell bigint;
begin
  if not bn_priv.pin_ok(p_nom, p_pin) then return -3; end if;
  if pg_column_size(p_estat) > 300000 or char_length(p_assig) > 40 then raise exception 'massa gran' using errcode = '22023'; end if;
  ri_estat := case when (p_estat->>'reinici') ~ '^[0-9]{1,15}$' then (p_estat->>'reinici')::bigint else 0 end;
  if ri_estat < bn_priv.reinici_ms(lower(trim(p_nom)), p_assig) then
    return -1;
  end if;
  select g.estat into vell from bn_priv.progres g where g.k = lower(trim(p_nom)) and g.assig = p_assig;
  if vell is not null then
    p_nou  := case when (p_estat->>'punts') ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (p_estat->>'punts')::numeric else 0 end;
    p_vell := case when (vell->>'punts')    ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (vell->>'punts')::numeric    else 0 end;
    ri_vell := case when (vell->>'reinici') ~ '^[0-9]{1,15}$' then (vell->>'reinici')::bigint else 0 end;
    if p_vell > p_nou and ri_vell >= ri_estat then
      return -2;
    end if;
  end if;
  insert into bn_priv.progres(k,assig,estat,mod,ts) values (lower(trim(p_nom)), p_assig, p_estat, p_mod, now())
    on conflict (k,assig) do update set estat = excluded.estat, mod = excluded.mod, ts = now()
    where bn_priv.progres.mod <= excluded.mod;
  return p_mod;
end $$;

-- registre: estrelles acumulades d'un dispositiu que encara no sap el reinici → fora (l'esdeveniment es desa igual)
create or replace function bn_priv.bn_log_reinici()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare ri bigint;
begin
  if new.detall is not null and (new.detall ? 'punts' or new.detall ? 'fonts') then
    ri := case when (new.detall->>'ri') ~ '^[0-9]{1,15}$' then (new.detall->>'ri')::bigint else 0 end;
    if ri < bn_priv.reinici_ms(lower(trim(new.nom)), new.assig) then
      new.detall := new.detall - 'punts' - 'fonts';
    end if;
  end if;
  if new.detall is not null then new.detall := new.detall - 'ri'; end if;
  return new;
end $$;
drop trigger if exists bn_log_reinici on public.bn_log;
create trigger bn_log_reinici before insert on public.bn_log
  for each row execute function bn_priv.bn_log_reinici();

-- reinicis d'un nen: {"socials": ms, "*": ms, …} (sense PIN: només són dates, com les estrelles de bn_punts_mons)
create or replace function public.bn_reinicis(p_nom text)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(r.assig, floor(extract(epoch from r.ts) * 1000)::bigint), '{}'::jsonb)
  from bn_priv.reinicis r where r.k = lower(trim(p_nom))
$$;
revoke all on function public.bn_reinicis(text) from public;
grant execute on function public.bn_reinicis(text) to anon, authenticated;
