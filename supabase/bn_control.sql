-- ============================================================
-- BONA NOTA · Control ràpid de Xat, Horari automàtic i Mons
-- Idempotent. Permet configurar l'horari automàtic del xat
-- (tanca_h / obre_h en hora de Catalunya, Europe/Madrid) i
-- activar o desactivar cada món per separat des de l'admin.
-- Depèn de: bn_xat.sql i bn_admin_tauler.sql
-- ============================================================

-- Configuració inicial (si ja hi és, la deixa com l'hagi posada l'admin)
create table if not exists bn_priv.examens(
  assig text primary key check (assig ~ '^[a-z0-9_-]{1,40}$'),
  data  date not null,
  ts    timestamptz not null default now()
);
revoke all on bn_priv.examens from public, anon, authenticated;

insert into bn_priv.config(clau, valor)
values
  ('xat_horari', '{"actiu":false,"tanca_mons":false,"tanca_h":"21:30","obre_h":"07:00"}'),
  ('mons', '{"tancats":[]}')
on conflict (clau) do nothing;

-- 1. Configuració d'horari automàtic del xat i dels mons (amb valors per defecte segurs)
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
    'actiu',      case when j->>'actiu' in ('true', 'false') then (j->>'actiu')::boolean else false end,
    'tanca_mons', case when j->>'tanca_mons' in ('true', 'false') then (j->>'tanca_mons')::boolean else false end,
    'tanca_h',    th,
    'obre_h',     oh,
    'tanca_min',  split_part(th, ':', 1)::int * 60 + split_part(th, ':', 2)::int,
    'obre_min',   split_part(oh, ':', 1)::int * 60 + split_part(oh, ':', 2)::int);
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

-- 4b. Configuració de llindars d'Alertes d'Inici i de Benestar (clau 'llindars' a bn_priv.config)
create or replace function bn_priv.ll_int(p_v jsonb, p_def int, p_min int, p_max int, p_estricte boolean default false)
returns int language plpgsql immutable set search_path = '' as $$
declare n int;
begin
  if p_v is null then return p_def; end if;
  if jsonb_typeof(p_v) <> 'number' or (p_v::text) !~ '^[0-9]{1,5}$' then
    if p_estricte then raise exception 'llindars no valids' using errcode = '22023'; end if;
    return p_def;
  end if;
  n := (p_v::text)::int;
  if n < p_min or n > p_max then
    if p_estricte then raise exception 'llindars fora de rang' using errcode = '22023'; end if;
    return least(p_max, greatest(p_min, n));
  end if;
  return n;
end $$;

create or replace function bn_priv.ll_grav(p_v jsonb, p_def int, p_estricte boolean default false)
returns int language plpgsql immutable set search_path = '' as $$
begin
  if p_v is null then return p_def; end if;
  if jsonb_typeof(p_v) <> 'number' or (p_v::text) not in ('0','1','2','3') then
    if p_estricte then raise exception 'gravetat no valida' using errcode = '22023'; end if;
    return p_def;
  end if;
  return (p_v::text)::int;
end $$;

create or replace function bn_priv.ll_niv(p_v jsonb, p_def text, p_estricte boolean default false)
returns text language plpgsql immutable set search_path = '' as $$
declare s text;
begin
  if p_v is null then return p_def; end if;
  if jsonb_typeof(p_v) <> 'string' then
    if p_estricte then raise exception 'nivell no valid' using errcode = '22023'; end if;
    return p_def;
  end if;
  s := p_v #>> '{}';
  if s not in ('vermell', 'groc', 'context', 'off') then
    if p_estricte then raise exception 'nivell no valid' using errcode = '22023'; end if;
    return p_def;
  end if;
  return s;
end $$;

create or replace function bn_priv.llindars_normalitza(p_raw jsonb, p_estricte boolean default false)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  j jsonb := case when jsonb_typeof(p_raw) = 'object' then p_raw else '{}'::jsonb end;
  al jsonb;
  be jsonb;
  da int;
  dm int;
  na int;
  nm int;
  k text;
begin
  if p_estricte and p_raw is not null and jsonb_typeof(p_raw) <> 'object' then
    raise exception 'llindars ha de ser un objecte' using errcode = '22023';
  end if;
  if p_estricte then
    for k in select jsonb_object_keys(j) loop
      if k not in ('alertes', 'benestar') then raise exception 'clau de llindars desconeguda' using errcode = '22023'; end if;
    end loop;
    if (j ? 'alertes') and jsonb_typeof(j->'alertes') <> 'object' then
      raise exception 'alertes ha de ser un objecte' using errcode = '22023';
    end if;
    if (j ? 'benestar') and jsonb_typeof(j->'benestar') <> 'object' then
      raise exception 'benestar ha de ser un objecte' using errcode = '22023';
    end if;
  end if;

  al := case when jsonb_typeof(j->'alertes') = 'object' then j->'alertes' else '{}'::jsonb end;
  be := case when jsonb_typeof(j->'benestar') = 'object' then j->'benestar' else '{}'::jsonb end;

  if p_estricte then
    for k in select jsonb_object_keys(al) loop
      if k not in ('inactiu','encallat','baixa','rapid','pregunta','pendent') or jsonb_typeof(al->k) <> 'object' then
        raise exception 'regla d''alerta no valida' using errcode = '22023';
      end if;
    end loop;
    for k in select jsonb_object_keys(be) loop
      if k not in ('marato_bloc','marato_dia','nit','salta_descans','pressa','repetir','frustracio_suspesos','frustracio_costa','enganxa','xat','inactiu')
         or jsonb_typeof(be->k) <> 'object' then
        raise exception 'senyal de benestar no valid' using errcode = '22023';
      end if;
    end loop;
  end if;

  da := bn_priv.ll_int(al #> '{inactiu,dies_avis}', 3, 1, 30, p_estricte);
  dm := bn_priv.ll_int(al #> '{inactiu,dies_malament}', 7, 1, 60, p_estricte);
  if dm < da then
    if p_estricte then raise exception 'dies_malament ha de ser >= dies_avis' using errcode = '22023'; end if;
    dm := da;
  end if;

  na := bn_priv.ll_int(be #> '{nit,nits_avis}', 1, 1, 10, p_estricte);
  nm := bn_priv.ll_int(be #> '{nit,nits_malament}', 2, 1, 14, p_estricte);
  if nm < na then
    if p_estricte then raise exception 'nits_malament ha de ser >= nits_avis' using errcode = '22023'; end if;
    nm := na;
  end if;

  return jsonb_build_object(
    'alertes', jsonb_build_object(
      'inactiu', jsonb_build_object(
        'grav',          bn_priv.ll_grav(al #> '{inactiu,grav}', 2, p_estricte),
        'dies_avis',     da,
        'dies_malament', dm),
      'encallat', jsonb_build_object(
        'grav',          bn_priv.ll_grav(al #> '{encallat,grav}', 3, p_estricte),
        'vegades',       bn_priv.ll_int(al #> '{encallat,vegades}', 3, 2, 15, p_estricte)),
      'baixa', jsonb_build_object(
        'grav',          bn_priv.ll_grav(al #> '{baixa,grav}', 2, p_estricte),
        'nota_max',      bn_priv.ll_int(al #> '{baixa,nota_max}', 70, 30, 100, p_estricte)),
      'rapid', jsonb_build_object(
        'grav',          bn_priv.ll_grav(al #> '{rapid,grav}', 2, p_estricte),
        'seg_max',       bn_priv.ll_int(al #> '{rapid,seg_max}', 3, 1, 10, p_estricte),
        'tests_min',     bn_priv.ll_int(al #> '{rapid,tests_min}', 2, 1, 10, p_estricte)),
      'pregunta', jsonb_build_object(
        'grav',          bn_priv.ll_grav(al #> '{pregunta,grav}', 1, p_estricte),
        'pct_error',     bn_priv.ll_int(al #> '{pregunta,pct_error}', 50, 20, 95, p_estricte),
        'nens_min',      bn_priv.ll_int(al #> '{pregunta,nens_min}', 3, 2, 30, p_estricte)),
      'pendent', jsonb_build_object(
        'grav',          bn_priv.ll_grav(al #> '{pendent,grav}', 1, p_estricte),
        'temes_min',     bn_priv.ll_int(al #> '{pendent,temes_min}', 1, 1, 20, p_estricte))
    ),
    'benestar', jsonb_build_object(
      'marato_bloc', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{marato_bloc,nivell}', 'vermell', p_estricte),
        'min',           bn_priv.ll_int(be #> '{marato_bloc,min}', 60, 20, 240, p_estricte),
        'min_vig',       bn_priv.ll_int(be #> '{marato_bloc,min_vig}', 120, 30, 300, p_estricte)),
      'marato_dia', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{marato_dia,nivell}', 'vermell', p_estricte),
        'min',           bn_priv.ll_int(be #> '{marato_dia,min}', 90, 30, 300, p_estricte),
        'min_vig',       bn_priv.ll_int(be #> '{marato_dia,min_vig}', 120, 30, 360, p_estricte)),
      'nit', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{nit,nivell}', 'groc', p_estricte),
        'nits_avis',     na,
        'nits_malament', nm),
      'salta_descans', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{salta_descans,nivell}', 'groc', p_estricte),
        'salts',         bn_priv.ll_int(be #> '{salta_descans,salts}', 2, 1, 10, p_estricte)),
      'pressa', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{pressa,nivell}', 'groc', p_estricte),
        'seg',           bn_priv.ll_int(be #> '{pressa,seg}', 3, 1, 10, p_estricte),
        'encert_max',    bn_priv.ll_int(be #> '{pressa,encert_max}', 50, 10, 95, p_estricte)),
      'repetir', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{repetir,nivell}', 'groc', p_estricte),
        'tests',         bn_priv.ll_int(be #> '{repetir,tests}', 4, 2, 15, p_estricte)),
      'frustracio_suspesos', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{frustracio_suspesos,nivell}', 'groc', p_estricte),
        'suspesos',      bn_priv.ll_int(be #> '{frustracio_suspesos,suspesos}', 3, 2, 10, p_estricte)),
      'frustracio_costa', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{frustracio_costa,nivell}', 'groc', p_estricte),
        'costa',         bn_priv.ll_int(be #> '{frustracio_costa,costa}', 2, 1, 10, p_estricte)),
      'enganxa', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{enganxa,nivell}', 'groc', p_estricte),
        'intents',       bn_priv.ll_int(be #> '{enganxa,intents}', 1, 1, 10, p_estricte)),
      'xat', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{xat,nivell}', 'groc', p_estricte),
        'frases',        bn_priv.ll_int(be #> '{xat,frases}', 10, 2, 50, p_estricte),
        'min_estudi_max',bn_priv.ll_int(be #> '{xat,min_estudi_max}', 60, 10, 240, p_estricte)),
      'inactiu', jsonb_build_object(
        'nivell',        bn_priv.ll_niv(be #> '{inactiu,nivell}', 'groc', p_estricte),
        'dies',          bn_priv.ll_int(be #> '{inactiu,dies}', 3, 1, 30, p_estricte))
    )
  );
end $$;

create or replace function bn_priv.llindars_cfg() returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  t text;
  j jsonb;
begin
  select c.valor into t from bn_priv.config c where c.clau = 'llindars';
  begin j := t::jsonb; exception when others then j := null; end;
  return bn_priv.llindars_normalitza(j, false);
end $$;

revoke all on function bn_priv.ll_int(jsonb, int, int, int, boolean) from public, anon, authenticated;
revoke all on function bn_priv.ll_grav(jsonb, int, boolean) from public, anon, authenticated;
revoke all on function bn_priv.ll_niv(jsonb, text, boolean) from public, anon, authenticated;
revoke all on function bn_priv.llindars_normalitza(jsonb, boolean) from public, anon, authenticated;
revoke all on function bn_priv.llindars_cfg() from public, anon, authenticated;

-- 4ter. Configuració pública del rànquing (bn_priv.config, clau 'ranquing' · g22)
create or replace function bn_priv.rk_bool(p_v jsonb, p_def boolean, p_estricte boolean default false)
returns boolean language plpgsql immutable set search_path = '' as $$
begin
  if p_v is null or jsonb_typeof(p_v) = 'null' then return p_def; end if;
  if jsonb_typeof(p_v) <> 'boolean' then
    if p_estricte then raise exception 'valor boolea no valid' using errcode = '22023'; end if;
    return p_def;
  end if;
  return (p_v #>> '{}')::boolean;
end $$;

create or replace function bn_priv.ranquing_normalitza(p_raw jsonb, p_estricte boolean default false)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  j jsonb := case when jsonb_typeof(p_raw) = 'object' then p_raw else '{}'::jsonb end;
  ps jsonb;
  ps_out jsonb;
  ini text;
  k text;
  b_punts boolean;
  b_dies boolean;
  b_nivell boolean;
  b_setmana boolean;
  b_remuntada boolean;
begin
  if p_estricte and p_raw is not null and jsonb_typeof(p_raw) <> 'object' then
    raise exception 'ranquing ha de ser un objecte' using errcode = '22023';
  end if;
  if p_estricte then
    for k in select jsonb_object_keys(j) loop
      if k not in ('actiu','top','mostrar_propia','pestanya_inicial','pestanyes','mostra_premis','mostra_meta','meta_estrelles','meta_pct') then
        raise exception 'clau de ranquing desconeguda' using errcode = '22023';
      end if;
    end loop;
    if (j ? 'pestanyes') and jsonb_typeof(j->'pestanyes') <> 'object' then
      raise exception 'pestanyes ha de ser un objecte' using errcode = '22023';
    end if;
  end if;

  ps := case when jsonb_typeof(j->'pestanyes') = 'object' then j->'pestanyes' else '{}'::jsonb end;
  if p_estricte then
    for k in select jsonb_object_keys(ps) loop
      if k not in ('punts','dies','nivell','setmana','remuntada') then
        raise exception 'pestanya de ranquing desconeguda' using errcode = '22023';
      end if;
    end loop;
  end if;

  b_punts     := bn_priv.rk_bool(ps->'punts',     true, p_estricte);
  b_dies      := bn_priv.rk_bool(ps->'dies',      true, p_estricte);
  b_nivell    := bn_priv.rk_bool(ps->'nivell',    true, p_estricte);
  b_setmana   := bn_priv.rk_bool(ps->'setmana',   true, p_estricte);
  b_remuntada := bn_priv.rk_bool(ps->'remuntada', true, p_estricte);

  if not (b_punts or b_dies or b_nivell or b_setmana or b_remuntada) then
    if p_estricte then raise exception 'cal almenys una pestanya activa al ranquing' using errcode = '22023'; end if;
    b_punts := true;
  end if;

  ps_out := jsonb_build_object(
    'punts', b_punts,
    'dies', b_dies,
    'nivell', b_nivell,
    'setmana', b_setmana,
    'remuntada', b_remuntada
  );

  if j ? 'pestanya_inicial' and jsonb_typeof(j->'pestanya_inicial') <> 'null' then
    if jsonb_typeof(j->'pestanya_inicial') <> 'string' then
      if p_estricte then raise exception 'pestanya_inicial no valida' using errcode = '22023'; end if;
      ini := 'punts';
    else
      ini := lower(trim(j->>'pestanya_inicial'));
      if ini not in ('punts','dies','nivell','setmana','remuntada') then
        if p_estricte then raise exception 'pestanya_inicial no valida' using errcode = '22023'; end if;
        ini := 'punts';
      end if;
    end if;
  else
    ini := 'punts';
  end if;

  if not (ps_out->>ini)::boolean then
    if p_estricte and (j ? 'pestanya_inicial') then
      raise exception 'pestanya_inicial ha d''estar activa' using errcode = '22023';
    end if;
    ini := case
      when b_punts then 'punts'
      when b_dies then 'dies'
      when b_nivell then 'nivell'
      when b_setmana then 'setmana'
      else 'remuntada'
    end;
  end if;

  return jsonb_build_object(
    'actiu',            bn_priv.rk_bool(j->'actiu', true, p_estricte),
    'top',              bn_priv.ll_int(j->'top', 10, 3, 100, p_estricte),
    'mostrar_propia',   bn_priv.rk_bool(j->'mostrar_propia', true, p_estricte),
    'pestanya_inicial', ini,
    'pestanyes',        ps_out,
    'mostra_premis',    bn_priv.rk_bool(j->'mostra_premis', true, p_estricte),
    'mostra_meta',      bn_priv.rk_bool(j->'mostra_meta', true, p_estricte),
    'meta_estrelles',   bn_priv.ll_int(j->'meta_estrelles', 30, 5, 200, p_estricte),
    'meta_pct',         bn_priv.ll_int(j->'meta_pct', 75, 25, 100, p_estricte)
  );
end $$;

create or replace function bn_priv.ranquing_cfg() returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  t text;
  j jsonb;
begin
  select c.valor into t from bn_priv.config c where c.clau = 'ranquing';
  begin j := t::jsonb; exception when others then j := null; end;
  return bn_priv.ranquing_normalitza(j, false);
end $$;

revoke all on function bn_priv.rk_bool(jsonb, boolean, boolean) from public, anon, authenticated;
revoke all on function bn_priv.ranquing_normalitza(jsonb, boolean) from public, anon, authenticated;
revoke all on function bn_priv.ranquing_cfg() from public, anon, authenticated;

-- 4d. Dates d'examen properes per mostrar a les targetes de la portada (sense cap dada personal · g23)
create or replace function bn_priv.examens_propers() returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  v_avui date := (now() at time zone 'Europe/Madrid')::date;
  v_res jsonb;
begin
  select coalesce(jsonb_object_agg(e.assig, to_char(e.data, 'YYYY-MM-DD') order by e.assig), '{}'::jsonb)
    into v_res
    from bn_priv.examens e
   where e.data between v_avui and (v_avui + 30);
  return coalesce(v_res, '{}'::jsonb);
end $$;
revoke all on function bn_priv.examens_propers() from public, anon, authenticated;

-- 5. RPC pública: estat de la web (mons tancats, estat del xat/horari, rànquing i exàmens propers, sense PIN)
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
    'mons_tancats_nit', (en_horari and coalesce((h->>'tanca_mons')::boolean, false)),
    'horari', h,
    'xat', jsonb_build_object(
      'actiu',         obert,
      'manual',        (c->>'actiu')::boolean,
      'horari_actiu',  (h->>'actiu')::boolean,
      'horari_tancat', en_horari,
      'tanca_h',       h->>'tanca_h',
      'obre_h',        h->>'obre_h'
    ),
    'mons_tancats', bn_priv.mons_tancats(),
    'ranquing', bn_priv.ranquing_cfg(),
    'examens', bn_priv.examens_propers()
  );
end $$;

revoke all on function public.bn_estat_web() from public;
grant execute on function public.bn_estat_web() to anon, authenticated;

-- 6. RPC Admin per al panell de Control ràpid (Xat, Horari automàtic, Mons, Llindars i Rànquing)
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
  ll jsonb;
  ll_in jsonb;
  ll_al jsonb;
  ll_be jsonb;
  rk jsonb;
  rk_in jsonb;
  rk_ps jsonb;
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
  ll := bn_priv.llindars_cfg();
  rk := bn_priv.ranquing_cfg();

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

    -- B) Configurar l'horari automàtic del xat i dels mons (accepta tanca_h/obre_h o tanca_min/obre_min i horari_tanca_mons)
    if (p_cfg ? 'horari_actiu') or (p_cfg ? 'horari_tanca_mons') or (p_cfg ? 'tanca_h') or (p_cfg ? 'obre_h') or (p_cfg ? 'tanca_min') or (p_cfg ? 'obre_min') then
      if p_cfg ? 'horari_actiu' then
        t := p_cfg->>'horari_actiu';
        if t is null or t not in ('true', 'false') then
          raise exception 'horari_actiu ha de ser true o false' using errcode = '22023';
        end if;
        h := h || jsonb_build_object('actiu', t::boolean);
      end if;
      if p_cfg ? 'horari_tanca_mons' then
        t := p_cfg->>'horari_tanca_mons';
        if t is null or t not in ('true', 'false') then
          raise exception 'horari_tanca_mons ha de ser true o false' using errcode = '22023';
        end if;
        h := h || jsonb_build_object('tanca_mons', t::boolean);
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
      values ('xat_horari', jsonb_build_object(
        'actiu', (h->>'actiu')::boolean,
        'tanca_mons', coalesce((h->>'tanca_mons')::boolean, false),
        'tanca_h', h->>'tanca_h',
        'obre_h', h->>'obre_h'
      )::text)
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

    -- E) Restaurar els llindars d'Alertes i Benestar als valors inicials
    if p_cfg ? 'reset_llindars' then
      t := p_cfg->>'reset_llindars';
      if t is null or t not in ('true', 'false') then
        raise exception 'reset_llindars ha de ser true o false' using errcode = '22023';
      end if;
      if t = 'true' then
        delete from bn_priv.config where clau = 'llindars';
        ll := bn_priv.llindars_cfg();
      end if;
    end if;

    -- F) Desar els llindars d'Alertes i Benestar (accepta objecte complet o parcial)
    if p_cfg ? 'llindars' then
      ll_in := p_cfg->'llindars';
      if ll_in is null or jsonb_typeof(ll_in) <> 'object' then
        raise exception 'llindars ha de ser un objecte' using errcode = '22023';
      end if;
      -- Validem estructura i fusionem amb l'actual abans de validar tipus, rangs i coherència creuada
      for t in select jsonb_object_keys(ll_in) loop
        if t not in ('alertes', 'benestar') or jsonb_typeof(ll_in->t) <> 'object' then
          raise exception 'clau de llindars no valida' using errcode = '22023';
        end if;
      end loop;
      ll_al := ll->'alertes';
      if ll_in ? 'alertes' then
        for t in select jsonb_object_keys(ll_in->'alertes') loop
          if t not in ('inactiu','encallat','baixa','rapid','pregunta','pendent') or jsonb_typeof(ll_in->'alertes'->t) <> 'object' then
            raise exception 'regla d''alerta no valida' using errcode = '22023';
          end if;
          ll_al := jsonb_set(ll_al, array[t], coalesce(ll_al->t, '{}'::jsonb) || (ll_in->'alertes'->t));
        end loop;
      end if;
      ll_be := ll->'benestar';
      if ll_in ? 'benestar' then
        for t in select jsonb_object_keys(ll_in->'benestar') loop
          if t not in ('marato_bloc','marato_dia','nit','salta_descans','pressa','repetir','frustracio_suspesos','frustracio_costa','enganxa','xat','inactiu')
             or jsonb_typeof(ll_in->'benestar'->t) <> 'object' then
            raise exception 'senyal de benestar no valid' using errcode = '22023';
          end if;
          ll_be := jsonb_set(ll_be, array[t], coalesce(ll_be->t, '{}'::jsonb) || (ll_in->'benestar'->t));
        end loop;
      end if;
      ll := bn_priv.llindars_normalitza(jsonb_build_object('alertes', ll_al, 'benestar', ll_be), true);
      insert into bn_priv.config(clau, valor)
      values ('llindars', ll::text)
      on conflict (clau) do update set valor = excluded.valor;
    end if;

    -- G) Restaurar la configuració del rànquing als valors inicials
    if p_cfg ? 'reset_ranquing' then
      t := p_cfg->>'reset_ranquing';
      if t is null or t not in ('true', 'false') then
        raise exception 'reset_ranquing ha de ser true o false' using errcode = '22023';
      end if;
      if t = 'true' then
        delete from bn_priv.config where clau = 'ranquing';
        rk := bn_priv.ranquing_cfg();
      end if;
    end if;

    -- H) Desar la configuració pública del rànquing (accepta objecte complet o parcial)
    if p_cfg ? 'ranquing' then
      rk_in := p_cfg->'ranquing';
      if rk_in is null or jsonb_typeof(rk_in) <> 'object' then
        raise exception 'ranquing ha de ser un objecte' using errcode = '22023';
      end if;
      if (rk_in ? 'pestanyes') and jsonb_typeof(rk_in->'pestanyes') <> 'object' then
        raise exception 'pestanyes ha de ser un objecte' using errcode = '22023';
      end if;
      rk_ps := coalesce(rk->'pestanyes', '{}'::jsonb) || case when jsonb_typeof(rk_in->'pestanyes') = 'object' then rk_in->'pestanyes' else '{}'::jsonb end;
      rk_in := (rk || rk_in) || jsonb_build_object('pestanyes', rk_ps);
      if not (p_cfg->'ranquing' ? 'pestanya_inicial') and coalesce((rk_ps->>(rk_in->>'pestanya_inicial'))::boolean, false) = false then
        rk_in := rk_in - 'pestanya_inicial';
      end if;
      rk := bn_priv.ranquing_normalitza(rk_in, true);
      insert into bn_priv.config(clau, valor)
      values ('ranquing', rk::text)
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
    'mons_tancats_nit', (en_horari and coalesce((h->>'tanca_mons')::boolean, false)),
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
    'mons_tancats', tancats,
    'llindars', ll,
    'ranquing', rk
  );
end $$;

revoke all on function public.bn_admin_control(text, text, jsonb) from public;
grant execute on function public.bn_admin_control(text, text, jsonb) to anon, authenticated;
