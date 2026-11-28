-- Bona Nota · gestió i recuperació de PIN perdut des de /admin/ (g41)
-- Executar UNA vegada al SQL Editor del projecte Supabase «bonanota» (agippwtqvhpxdockuigl).
-- Idempotent: es pot tornar a executar tantes vegades com calgui («if not exists» / «create or replace»).
-- Depèn de: bn_log.sql, bn_ranking_net.sql, bn_pin_nou.sql, bn_admin_tauler.sql, bn_admin_reinicia.sql, bn_admin_fitxa.sql.
--
-- Què afegeix:
--   1) bn_priv.perfils.pin_temp (boolean, default false): marca un PIN temporal assignat per l'admin.
--   2) public.bn_admin_usuari:
--      · 'posapin'     → assigna/genera un PIN temporal (pin_temp = true) fent UPSERT sense esborrar id, creat ni aspecte,
--                        i neteja qualsevol bloqueig d'intents fallits (bn_priv.intents).
--      · 'posapin_fix' → igual però PIN definitiu (pin_temp = false).
--      · 'desbloqueja' → esborra el bloqueig d'intents (bn_priv.intents) sense tocar el PIN.
--      · 'estat'       → afegeix +8 (pin_temp = true) i +16 (bloquejat ara mateix per ≥5 intents en 15 min).
--      · conserva totes les accions anteriors ('esborra', 'canvia', 'amaga', 'mostra', 'treupin').
--   3) public.bn_admin_pins(correu, contrasenya): llista única amb l'estat del PIN de tots els nens per a Nens → PINs.
--   4) public.bn_perfil_canvia_pin: posa pin_temp = false, rebutja '4587R' ('exemple') i repetir el PIN temporal ('mateix'),
--      sense fer raise quan pin_ok torna false (conserva el comptador bn_priv.intents, docs/TRAMPES.md).
--   5) public.bn_progres_llegeix: afegeix «pin_temp» (boolean) al JSONB retornat.
--   6) public.bn_admin_fitxa: afegeix «pin_temp» dins l'objecte «perfil».

-- ---------- 1) columna pin_temp ----------
alter table bn_priv.perfils add column if not exists pin_temp boolean not null default false;

-- ---------- 2) bn_admin_usuari ampliat ----------
create or replace function public.bn_admin_usuari(
  p_email text,
  p_pass  text,
  p_nom   text,
  p_accio text,
  p_nou   text default null::text
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  n  int;
  kk text := lower(trim(coalesce(p_nom, '')));
  kn text := lower(trim(coalesce(p_nou, '')));
  nn text := trim(coalesce(p_nou, ''));
  pp text := upper(trim(coalesce(p_nou, '')));
  nm text := trim(coalesce(p_nom, ''));
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  if p_accio = 'esborra' then
    delete from public.bn_log l where lower(trim(l.nom)) = kk;
    get diagnostics n = row_count;
    delete from bn_priv.perfils p where p.k = kk;
    delete from bn_priv.progres g where g.k = kk;
    delete from bn_priv.intents i where i.k = kk;
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

  elsif p_accio in ('posapin', 'posapin_fix') then
    if char_length(nm) not between 1 and 40 or bn_priv.nom_prohibit(nm) then
      raise exception 'nom no permes' using errcode = '22023';
    end if;
    if pp !~ '^[0-9]{4}[A-Z]$' then
      raise exception 'pin no valid' using errcode = '22023';
    end if;
    if pp = '4587R' then
      raise exception 'pin exemple no permes' using errcode = '22023';
    end if;
    -- UPSERT atòmic: conserva id, creat, aspecte i aspecte_ts si el perfil ja existia
    insert into bn_priv.perfils(k, nom, pin, pin_v, pin_ts, pin_temp)
      values (kk, nm, extensions.crypt(pp, extensions.gen_salt('bf')), 2, now(), p_accio = 'posapin')
      on conflict (k) do update set
        pin      = extensions.crypt(pp, extensions.gen_salt('bf')),
        pin_v    = 2,
        pin_ts   = now(),
        pin_temp = (p_accio = 'posapin');
    delete from bn_priv.intents i where i.k = kk;
    return 1;

  elsif p_accio = 'desbloqueja' then
    delete from bn_priv.intents i where i.k = kk;
    get diagnostics n = row_count;
    return n;

  elsif p_accio = 'estat' then
    return (case when exists (select 1 from bn_priv.amagats a where a.k = kk) then 1 else 0 end)
         + (case when exists (select 1 from bn_priv.perfils p where p.k = kk) then 2 else 0 end)
         + (case when exists (select 1 from bn_priv.perfils p where p.k = kk and p.pin_v = 2) then 4 else 0 end)
         + (case when exists (select 1 from bn_priv.perfils p where p.k = kk and p.pin_temp) then 8 else 0 end)
         + (case when exists (select 1 from bn_priv.intents i where i.k = kk and i.n >= 5 and i.ts > now() - interval '15 minutes') then 16 else 0 end);

  else
    raise exception 'accio desconeguda';
  end if;

  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.bn_admin_usuari(text,text,text,text,text) from public;
grant execute on function public.bn_admin_usuari(text,text,text,text,text) to anon, authenticated;

-- ---------- 3) consulta global d'estat de PINs per a Nens → PINs ----------
create or replace function public.bn_admin_pins(p_email text, p_pass text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'k',              s.k,
      'nom',            s.nom,
      'id',             s.id,
      'te_pin',         s.te_pin,
      'pin_v',          s.pin_v,
      'pin_ts',         bn_priv.fitxa_ms(s.pin_ts),
      'pin_temp',       s.pin_temp,
      'intents_n',      s.intents_n,
      'bloquejat_fins', bn_priv.fitxa_ms(s.bloquejat_fins),
      'amagat',         s.amagat,
      'ult_log',        bn_priv.fitxa_ms(s.ult_log)
    ) order by
      (s.bloquejat_fins is not null) desc,
      s.pin_temp desc,
      (not s.te_pin) desc,
      (s.te_pin and coalesce(s.pin_v, 1) < 2) desc,
      s.k asc)
    from (
      select
        coalesce(p.k, l.k) as k,
        coalesce(p.nom, l.nom) as nom,
        p.id,
        (p.k is not null) as te_pin,
        p.pin_v,
        p.pin_ts,
        coalesce(p.pin_temp, false) as pin_temp,
        case when i.ts is not null and i.ts > now() - interval '15 minutes' then i.n else 0 end as intents_n,
        case when i.n >= 5 and i.ts > now() - interval '15 minutes' then i.ts + interval '15 minutes' else null end as bloquejat_fins,
        exists (select 1 from bn_priv.amagats a where a.k = coalesce(p.k, l.k)) as amagat,
        l.ult_log
      from bn_priv.perfils p
      full join (
        select lower(trim(x.nom)) as k, max(x.nom) as nom, max(x.ts) as ult_log
        from public.bn_log x
        where trim(coalesce(x.nom, '')) <> ''
        group by 1
      ) l on l.k = p.k
      left join bn_priv.intents i on i.k = coalesce(p.k, l.k)
      where not bn_priv.nom_prohibit(coalesce(p.nom, l.nom))
    ) s
  ), '[]'::jsonb);
end $$;

revoke all on function public.bn_admin_pins(text,text) from public;
grant execute on function public.bn_admin_pins(text,text) to anon, authenticated;

-- ---------- 4) bn_perfil_canvia_pin: neteja pin_temp i evita repetir el PIN temporal ----------
create or replace function public.bn_perfil_canvia_pin(p_nom text, p_pin text, p_nou text)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  kk   text := lower(trim(coalesce(p_nom, '')));
  pp   text := upper(trim(coalesce(p_pin, '')));
  nn   text := upper(trim(coalesce(p_nou, '')));
  temp boolean := false;
begin
  if nn !~ '^[0-9]{4}[A-Z]$' then
    raise exception 'pin no valid' using errcode = '22023';
  end if;
  if nn = '4587R' then
    return 'exemple';
  end if;
  -- sense raise quan pin_ok torna false: així l'intent fallit es conserva a bn_priv.intents (issue #33)
  if not bn_priv.pin_ok(p_nom, p_pin) then
    return 'pin';
  end if;
  select coalesce(p.pin_temp, false) into temp from bn_priv.perfils p where p.k = kk;
  if temp and nn = pp then
    return 'mateix';
  end if;
  update bn_priv.perfils p
     set pin      = extensions.crypt(nn, extensions.gen_salt('bf')),
         pin_v    = 2,
         pin_ts   = now(),
         pin_temp = false
   where p.k = kk;
  return 'ok';
end $$;

revoke all on function public.bn_perfil_canvia_pin(text,text,text) from public;
grant execute on function public.bn_perfil_canvia_pin(text,text,text) to anon, authenticated;

-- ---------- 5) bn_progres_llegeix: afegeix «pin_temp» al JSONB retornat ----------
create or replace function public.bn_progres_llegeix(p_nom text, p_pin text, p_assig text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  kk text := lower(trim(coalesce(p_nom, '')));
  r  bn_priv.progres;
  lg jsonb;
  ri bigint;
  pt boolean := false;
begin
  if not bn_priv.pin_ok(p_nom, p_pin) then
    return jsonb_build_object('ok', false, 'codi', 'pin');
  end if;
  select coalesce(p.pin_temp, false) into pt from bn_priv.perfils p where p.k = kk;
  lg := bn_priv.reconstrueix(kk, p_assig);
  ri := bn_priv.reinici_ms(kk, p_assig);
  select * into r from bn_priv.progres g where g.k = kk and g.assig = p_assig;
  if not found then
    return jsonb_build_object('mod', 0, 'estat', null, 'log', lg, 'reinici', ri, 'pin_temp', pt);
  end if;
  return jsonb_build_object('mod', r.mod, 'estat', r.estat, 'log', lg, 'reinici', ri, 'pin_temp', pt);
end $$;

revoke all on function public.bn_progres_llegeix(text,text,text) from public;
grant execute on function public.bn_progres_llegeix(text,text,text) to anon, authenticated;

-- ---------- 6) bn_admin_fitxa: afegeix «pin_temp» dins l'objecte «perfil» ----------
create or replace function public.bn_admin_fitxa(p_email text, p_pass text, p_nom text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  kk   text := lower(trim(coalesce(p_nom, '')));
  pf   jsonb;
  mons jsonb := '[]';
  pv   jsonb := '[]';
  m    jsonb;
  r    record;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  select jsonb_build_object(
           'nom',        p.nom,
           'id',         p.id,
           'pin_v',      p.pin_v,
           'pin_temp',   coalesce(p.pin_temp, false),
           'creat',      bn_priv.fitxa_ms(p.creat),
           'pin_ts',     bn_priv.fitxa_ms(p.pin_ts),
           'aspecte_ts', bn_priv.fitxa_ms(p.aspecte_ts))
    into pf from bn_priv.perfils p where p.k = kk;
  for r in select g.assig, g.estat, g.mod, g.ts from bn_priv.progres g where g.k = kk order by g.assig loop
    begin
      m := bn_priv.fitxa_mon(r.assig, r.estat, r.mod, r.ts);
    exception when others then
      m := jsonb_build_object('assig', r.assig, 'mod', r.mod, 'ts', bn_priv.fitxa_ms(r.ts), 'error', true);
    end;
    mons := mons || jsonb_build_array(m);
  end loop;
  if to_regclass('bn_priv.premis_visuals') is not null then
    execute $q$
      select coalesce(jsonb_agg(jsonb_build_object(
        'reward_key', x.reward_key, 'stars', x.stars, 'ts', bn_priv.fitxa_ms(x.ts)) order by x.ts desc), '[]'::jsonb)
      from bn_priv.premis_visuals x where x.k = $1
    $q$ into pv using kk;
  end if;
  return jsonb_build_object('k', kk, 'perfil', pf, 'amagat', exists (select 1 from bn_priv.amagats a where a.k = kk),
                            'mons', mons, 'premis_visuals', coalesce(pv, '[]'::jsonb));
end $$;

revoke all on function public.bn_admin_fitxa(text,text,text) from public;
grant execute on function public.bn_admin_fitxa(text,text,text) to anon, authenticated;
