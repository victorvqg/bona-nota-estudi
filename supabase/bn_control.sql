-- ============================================================
-- BONA NOTA · Control ràpid de Xat, Horari automàtic i Mons
-- Idempotent. Permet configurar l'horari automàtic del xat
-- (tanca_h / obre_h en hora de Catalunya, Europe/Madrid) i
-- activar o desactivar cada món per separat des de l'admin.
-- Depèn de: bn_xat.sql i bn_admin_tauler.sql
-- ============================================================

-- Configuració inicial (si ja hi és, la deixa com l'hagi posada l'admin)
insert into bn_priv.config(clau, valor)
values
  ('xat_horari', '{"actiu":false,"tanca_h":"21:30","obre_h":"07:00"}'),
  ('mons', '{"tancats":[]}')
on conflict (clau) do nothing;

-- 1. Configuració d'horari automàtic del xat (amb valors per defecte segurs)
create or replace function bn_priv.xat_horari_cfg() returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  t text;
  j jsonb;
  th text;
  oh text;
begin
  select c.valor into t from bn_priv.config c where c.clau = 'xat_horari';
  begin j := t::jsonb; exception when others then j := null; end;
  if jsonb_typeof(j) is distinct from 'object' then j := '{}'::jsonb; end if;
  th := case when j->>'tanca_h' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then j->>'tanca_h' else '21:30' end;
  oh := case when j->>'obre_h'  ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then j->>'obre_h'  else '07:00' end;
  return jsonb_build_object(
    'actiu',     case when j->>'actiu' in ('true', 'false') then (j->>'actiu')::boolean else false end,
    'tanca_h',   th,
    'obre_h',    oh,
    'tanca_min', split_part(th, ':', 1)::int * 60 + split_part(th, ':', 2)::int,
    'obre_min',  split_part(oh, ':', 1)::int * 60 + split_part(oh, ':', 2)::int);
end $$;

-- 2. Comprova si una hora cau dins la franja de tancament automàtic (Europe/Madrid)
create or replace function bn_priv.xat_en_horari_tancat(
  p_horari_actiu boolean,
  p_tanca_h text,
  p_obre_h text,
  p_ara timestamptz default now()
) returns boolean
language plpgsql stable set search_path = '' as $$
declare
  hm text;
  tanca text := coalesce(p_tanca_h, '21:30');
  obre text := coalesce(p_obre_h, '07:00');
begin
  if not coalesce(p_horari_actiu, false) then return false; end if;
  if tanca !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then tanca := '21:30'; end if;
  if obre  !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then obre  := '07:00'; end if;
  if tanca = obre then return true; end if;
  hm := to_char(p_ara at time zone 'Europe/Madrid', 'HH24:MI');
  if tanca < obre then
    -- Franja dins del mateix dia (p. ex. 09:00 -> 17:00)
    return hm >= tanca and hm < obre;
  else
    -- Franja nocturna que creua mitjanit (p. ex. 21:30 -> 07:00)
    return hm >= tanca or hm < obre;
  end if;
end $$;

-- 3. Estat efectiu del xat (actiu manualment I fora d'horari tancat)
create or replace function bn_priv.xat_obert_ara(
  p_cfg jsonb default null,
  p_ara timestamptz default now()
) returns boolean
language plpgsql stable set search_path = '' as $$
declare
  c jsonb := coalesce(p_cfg, bn_priv.xat_cfg());
  h jsonb := bn_priv.xat_horari_cfg();
begin
  if not coalesce((c->>'actiu')::boolean, true) then return false; end if;
  if bn_priv.xat_en_horari_tancat((h->>'actiu')::boolean, h->>'tanca_h', h->>'obre_h', p_ara) then return false; end if;
  return true;
end $$;

-- 4. Llista de mons tancats (clau 'mons' a bn_priv.config)
create or replace function bn_priv.mons_tancats() returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  t text;
  j jsonb;
  arr jsonb;
begin
  select c.valor into t from bn_priv.config c where c.clau = 'mons';
  begin j := t::jsonb; exception when others then j := null; end;
  if jsonb_typeof(j) is distinct from 'object' then j := '{}'::jsonb; end if;
  if jsonb_typeof(j->'tancats') = 'array' then
    select coalesce(jsonb_agg(distinct v order by v), '[]'::jsonb)
      into arr
      from jsonb_array_elements_text(j->'tancats') as x(v)
     where v in ('socials','biogeo','castellano','comarques','divisibilitat','catala','angles');
  else
    arr := '[]'::jsonb;
  end if;
  return coalesce(arr, '[]'::jsonb);
end $$;

revoke all on function bn_priv.xat_horari_cfg() from public, anon, authenticated;
revoke all on function bn_priv.xat_en_horari_tancat(boolean, text, text, timestamptz) from public, anon, authenticated;
revoke all on function bn_priv.xat_obert_ara(jsonb, timestamptz) from public, anon, authenticated;
revoke all on function bn_priv.mons_tancats() from public, anon, authenticated;

-- 5. RPC pública: estat de la web (mons tancats i estat del xat/horari, sense PIN)
create or replace function public.bn_estat_web() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  c jsonb := bn_priv.xat_cfg();
  h jsonb := bn_priv.xat_horari_cfg();
  en_horari boolean := bn_priv.xat_en_horari_tancat((h->>'actiu')::boolean, h->>'tanca_h', h->>'obre_h', now());
  obert boolean := (c->>'actiu')::boolean and not en_horari;
begin
  return jsonb_build_object(
    'ara', bn_priv.xat_ms(now()),
    'xat_actiu', (c->>'actiu')::boolean,
    'xat_obert_ara', obert,
    'xat_en_horari_tancat', en_horari,
    'horari', h,
    'xat', jsonb_build_object(
      'actiu',         obert,
      'manual',        (c->>'actiu')::boolean,
      'horari_actiu',  (h->>'actiu')::boolean,
      'horari_tancat', en_horari,
      'tanca_h',       h->>'tanca_h',
      'obre_h',        h->>'obre_h'
    ),
    'mons_tancats', bn_priv.mons_tancats()
  );
end $$;

revoke all on function public.bn_estat_web() from public;
grant execute on function public.bn_estat_web() to anon, authenticated;

-- 6. RPC Admin per al panell de Control ràpid (Xat, Horari automàtic i Mons)
create or replace function public.bn_admin_control(
  p_email text,
  p_pass text,
  p_cfg jsonb default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  c jsonb;
  h jsonb;
  tancats jsonb;
  t text;
  m int;
  mon_id text;
  mon_actiu boolean;
  en_horari boolean;
  obert boolean;
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  c := bn_priv.xat_cfg();
  h := bn_priv.xat_horari_cfg();
  tancats := bn_priv.mons_tancats();

  if p_cfg is not null then
    if jsonb_typeof(p_cfg) <> 'object' then
      raise exception 'configuracio no valida' using errcode = '22023';
    end if;

    -- A) Activar o desactivar el xat manualment
    if p_cfg ? 'xat_actiu' then
      t := p_cfg->>'xat_actiu';
      if t is null or t not in ('true', 'false') then
        raise exception 'xat_actiu ha de ser true o false' using errcode = '22023';
      end if;
      c := c || jsonb_build_object('actiu', t::boolean);
      insert into bn_priv.config(clau, valor)
      values ('xat', c::text)
      on conflict (clau) do update set valor = excluded.valor;
    end if;

    -- B) Configurar l'horari automàtic del xat (accepta tanca_h/obre_h o tanca_min/obre_min)
    if (p_cfg ? 'horari_actiu') or (p_cfg ? 'tanca_h') or (p_cfg ? 'obre_h') or (p_cfg ? 'tanca_min') or (p_cfg ? 'obre_min') then
      if p_cfg ? 'horari_actiu' then
        t := p_cfg->>'horari_actiu';
        if t is null or t not in ('true', 'false') then
          raise exception 'horari_actiu ha de ser true o false' using errcode = '22023';
        end if;
        h := h || jsonb_build_object('actiu', t::boolean);
      end if;
      if p_cfg ? 'tanca_min' then
        t := coalesce(p_cfg->>'tanca_min', '');
        if t !~ '^[0-9]{1,4}$' or t::int < 0 or t::int > 1439 then
          raise exception 'tanca_min ha de ser entre 0 i 1439' using errcode = '22023';
        end if;
        m := t::int;
        h := h || jsonb_build_object('tanca_h', lpad((m / 60)::text, 2, '0') || ':' || lpad((m % 60)::text, 2, '0'));
      end if;
      if p_cfg ? 'obre_min' then
        t := coalesce(p_cfg->>'obre_min', '');
        if t !~ '^[0-9]{1,4}$' or t::int < 0 or t::int > 1439 then
          raise exception 'obre_min ha de ser entre 0 i 1439' using errcode = '22023';
        end if;
        m := t::int;
        h := h || jsonb_build_object('obre_h', lpad((m / 60)::text, 2, '0') || ':' || lpad((m % 60)::text, 2, '0'));
      end if;
      if p_cfg ? 'tanca_h' then
        t := coalesce(p_cfg->>'tanca_h', '');
        if t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
          raise exception 'tanca_h ha de tenir format HH:MM' using errcode = '22023';
        end if;
        h := h || jsonb_build_object('tanca_h', t);
      end if;
      if p_cfg ? 'obre_h' then
        t := coalesce(p_cfg->>'obre_h', '');
        if t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
          raise exception 'obre_h ha de tenir format HH:MM' using errcode = '22023';
        end if;
        h := h || jsonb_build_object('obre_h', t);
      end if;
      insert into bn_priv.config(clau, valor)
      values ('xat_horari', jsonb_build_object('actiu', (h->>'actiu')::boolean, 'tanca_h', h->>'tanca_h', 'obre_h', h->>'obre_h')::text)
      on conflict (clau) do update set valor = excluded.valor;
      h := bn_priv.xat_horari_cfg();
    end if;

    -- C) Substituir la llista sencera de mons_tancats
    if p_cfg ? 'mons_tancats' then
      if jsonb_typeof(p_cfg->'mons_tancats') <> 'array' then
        raise exception 'mons_tancats ha de ser una llista' using errcode = '22023';
      end if;
      if exists (
        select 1 from jsonb_array_elements_text(p_cfg->'mons_tancats') as x(v)
        where v not in ('socials','biogeo','castellano','comarques','divisibilitat','catala','angles')
      ) then
        raise exception 'mon no valid' using errcode = '22023';
      end if;
      select coalesce(jsonb_agg(distinct v order by v), '[]'::jsonb)
        into tancats
        from jsonb_array_elements_text(p_cfg->'mons_tancats') as x(v);
      tancats := coalesce(tancats, '[]'::jsonb);
      insert into bn_priv.config(clau, valor)
      values ('mons', jsonb_build_object('tancats', tancats)::text)
      on conflict (clau) do update set valor = excluded.valor;
    end if;

    -- D) Activar o desactivar un món individual (mon + mon_actiu)
    if (p_cfg ? 'mon') or (p_cfg ? 'mon_actiu') then
      mon_id := lower(trim(coalesce(p_cfg->>'mon', '')));
      if mon_id not in ('socials','biogeo','castellano','comarques','divisibilitat','catala','angles') then
        raise exception 'mon no valid' using errcode = '22023';
      end if;
      t := p_cfg->>'mon_actiu';
      if t is null or t not in ('true', 'false') then
        raise exception 'mon_actiu ha de ser true o false' using errcode = '22023';
      end if;
      mon_actiu := t::boolean;
      if mon_actiu then
        select coalesce(jsonb_agg(v order by v), '[]'::jsonb)
          into tancats
          from jsonb_array_elements_text(tancats) as x(v)
         where v <> mon_id;
      else
        select coalesce(jsonb_agg(distinct v order by v), '[]'::jsonb)
          into tancats
          from (
            select v from jsonb_array_elements_text(tancats) as x(v)
            union all
            select mon_id
          ) s;
      end if;
      tancats := coalesce(tancats, '[]'::jsonb);
      insert into bn_priv.config(clau, valor)
      values ('mons', jsonb_build_object('tancats', tancats)::text)
      on conflict (clau) do update set valor = excluded.valor;
    end if;
  end if;

  en_horari := bn_priv.xat_en_horari_tancat((h->>'actiu')::boolean, h->>'tanca_h', h->>'obre_h', now());
  obert := (c->>'actiu')::boolean and not en_horari;

  return jsonb_build_object(
    'hora_madrid', to_char(now() at time zone 'Europe/Madrid', 'HH24:MI'),
    'xat_actiu', (c->>'actiu')::boolean,
    'xat_obert_ara', obert,
    'xat_en_horari_tancat', en_horari,
    'horari', h,
    'xat', jsonb_build_object(
      'actiu',         (c->>'actiu')::boolean,
      'obert_ara',     obert,
      'horari_actiu',  (h->>'actiu')::boolean,
      'horari_tancat', en_horari,
      'tanca_h',       h->>'tanca_h',
      'obre_h',        h->>'obre_h',
      'est_credit',    (c->>'est_credit')::int,
      'max_dia',       (c->>'max_dia')::int,
      'espera_s',      (c->>'espera_s')::int
    ),
    'mons_tancats', tancats
  );
end $$;

revoke all on function public.bn_admin_control(text, text, jsonb) from public;
grant execute on function public.bn_admin_control(text, text, jsonb) to anon, authenticated;
