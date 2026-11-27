-- ============================================================
-- BONA NOTA · Bústia de Contacte i Suggeriments (/suggeriments/)
-- Idempotent. Emmagatzema missatges privats (mai públics) i
-- permet gestionar-los des de la pestanya «Bústia» de /admin/.
-- Depèn de: bn_admin_tauler.sql (bn_priv.admin_ok)
-- ============================================================

create schema if not exists bn_priv;

create table if not exists bn_priv.suggeriments (
  id             bigint generated always as identity primary key,
  ts             timestamptz not null default now(),
  categoria      text not null check (categoria in ('error', 'idea', 'familia', 'privacitat')),
  mon            text check (mon is null or mon ~ '^[a-z0-9_-]{1,40}$'),
  rol            text check (rol is null or rol in ('familia', 'docent', 'alumne')),
  missatge       text not null check (char_length(missatge) between 10 and 1500),
  email          text check (email is null or char_length(email) <= 160),
  origen_url     text check (origen_url is null or char_length(origen_url) <= 200),
  origen_hash    text not null check (char_length(origen_hash) between 4 and 64),
  estat          text not null default 'nou' check (estat in ('nou', 'en_curs', 'fet', 'arxivat')),
  nota_admin     text check (nota_admin is null or char_length(nota_admin) <= 1000),
  actualitzat_ts timestamptz not null default now()
);

create index if not exists suggeriments_ts_idx on bn_priv.suggeriments (ts desc);
create index if not exists suggeriments_estat_idx on bn_priv.suggeriments (estat, ts desc);
create index if not exists suggeriments_hash_ts_idx on bn_priv.suggeriments (origen_hash, ts desc);

revoke all on bn_priv.suggeriments from public, anon, authenticated;

-- 1. Enviar un suggeriment des de /suggeriments/ (pública amb anti-spam)
create or replace function public.bn_suggeriment_envia(
  p_categoria   text,
  p_mon         text default null,
  p_rol         text default null,
  p_missatge    text default '',
  p_email       text default null,
  p_origen_url  text default null,
  p_origen_hash text default 'anon',
  p_trap        text default ''
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cat  text := lower(trim(coalesce(p_categoria, '')));
  v_mon  text := nullif(lower(trim(coalesce(p_mon, ''))), '');
  v_rol  text := nullif(lower(trim(coalesce(p_rol, ''))), '');
  v_msg  text := trim(coalesce(p_missatge, ''));
  v_mail text := nullif(trim(coalesce(p_email, '')), '');
  v_url  text := nullif(left(trim(coalesce(p_origen_url, '')), 200), '');
  v_hash text := left(regexp_replace(coalesce(p_origen_hash, 'anon'), '[^a-zA-Z0-9_-]', '', 'g'), 64);
  v_n    int;
  v_id   bigint;
begin
  -- Honeypot: si un bot omple el camp trampa, retornem ok fals sense desar res
  if trim(coalesce(p_trap, '')) <> '' then
    return jsonb_build_object('ok', true, 'ref', 'SUG-000');
  end if;

  if v_cat not in ('error', 'idea', 'familia', 'privacitat') then
    return jsonb_build_object('ok', false, 'codi', 'categoria');
  end if;

  if v_mon is not null and v_mon !~ '^[a-z0-9_-]{1,40}$' then
    v_mon := null;
  end if;

  if v_rol is not null and v_rol not in ('familia', 'docent', 'alumne') then
    v_rol := null;
  end if;

  if char_length(v_msg) < 10 then
    return jsonb_build_object('ok', false, 'codi', 'curt');
  end if;

  if char_length(v_msg) > 1500 then
    return jsonb_build_object('ok', false, 'codi', 'llarg');
  end if;

  -- Privacitat de menors: si marca rol 'alumne', no guardem correu electrònic
  if v_rol = 'alumne' then
    v_mail := null;
  elsif v_mail is not null then
    if char_length(v_mail) > 160 or v_mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      return jsonb_build_object('ok', false, 'codi', 'email');
    end if;
  end if;

  if char_length(v_hash) < 4 then
    v_hash := 'anon_default';
  end if;

  -- Rate limit: màxim 3 enviaments en 60 minuts per origen
  select count(*)::int into v_n
    from bn_priv.suggeriments
   where origen_hash = v_hash
     and ts > now() - interval '60 minutes';
  if v_n >= 3 then
    return jsonb_build_object('ok', false, 'codi', 'massa_rapid');
  end if;

  -- Bloqueig de duplicat exacte dins dels últims 10 minuts
  if exists (
    select 1 from bn_priv.suggeriments
     where origen_hash = v_hash
       and missatge = v_msg
       and ts > now() - interval '10 minutes'
  ) then
    return jsonb_build_object('ok', false, 'codi', 'duplicat');
  end if;

  insert into bn_priv.suggeriments (categoria, mon, rol, missatge, email, origen_url, origen_hash)
  values (v_cat, v_mon, v_rol, v_msg, v_mail, v_url, v_hash)
  returning id into v_id;

  return jsonb_build_object(
    'ok', true,
    'id', v_id,
    'ref', 'SUG-' || lpad(v_id::text, 3, '0')
  );
end $$;

-- 2. Llistar suggeriments i comptadors per al tauler /admin/
create or replace function public.bn_admin_suggeriments(
  p_email text,
  p_pass  text,
  p_estat text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_est text := nullif(lower(trim(coalesce(p_estat, ''))), '');
  v_ll  jsonb;
  v_cnt jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'ref', 'SUG-' || lpad(s.id::text, 3, '0'),
    'ts', s.ts,
    'categoria', s.categoria,
    'mon', s.mon,
    'rol', s.rol,
    'missatge', s.missatge,
    'email', s.email,
    'origen_url', s.origen_url,
    'estat', s.estat,
    'nota_admin', s.nota_admin,
    'actualitzat_ts', s.actualitzat_ts
  ) order by s.ts desc, s.id desc), '[]'::jsonb)
  into v_ll
  from bn_priv.suggeriments s
  where v_est is null or s.estat = v_est;

  select jsonb_build_object(
    'tot',     count(*)::int,
    'nou',     count(*) filter (where estat = 'nou')::int,
    'en_curs', count(*) filter (where estat = 'en_curs')::int,
    'fet',     count(*) filter (where estat = 'fet')::int,
    'arxivat', count(*) filter (where estat = 'arxivat')::int
  )
  into v_cnt
  from bn_priv.suggeriments;

  return jsonb_build_object('items', v_ll, 'compt', v_cnt);
end $$;

-- 3. Canviar estat i/o nota interna d'un suggeriment (admin)
create or replace function public.bn_admin_suggeriment_estat(
  p_email text,
  p_pass  text,
  p_id    bigint,
  p_estat text,
  p_nota  text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_est  text := lower(trim(coalesce(p_estat, '')));
  v_nota text := nullif(left(trim(coalesce(p_nota, '')), 1000), '');
  v_id   bigint;
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  if v_est not in ('nou', 'en_curs', 'fet', 'arxivat') then
    raise exception 'Estat no vàlid';
  end if;

  update bn_priv.suggeriments
     set estat = v_est,
         nota_admin = case when p_nota is null then nota_admin else v_nota end,
         actualitzat_ts = now()
   where id = p_id
  returning id into v_id;

  if v_id is null then
    raise exception 'Suggeriment inexistent';
  end if;

  return jsonb_build_object('ok', true, 'id', v_id, 'estat', v_est);
end $$;

revoke all on function public.bn_suggeriment_envia(text, text, text, text, text, text, text, text) from public;
grant execute on function public.bn_suggeriment_envia(text, text, text, text, text, text, text, text) to anon, authenticated;

revoke all on function public.bn_admin_suggeriments(text, text, text) from public;
grant execute on function public.bn_admin_suggeriments(text, text, text) to anon, authenticated;

revoke all on function public.bn_admin_suggeriment_estat(text, text, bigint, text, text) from public;
grant execute on function public.bn_admin_suggeriment_estat(text, text, bigint, text, text) to anon, authenticated;
