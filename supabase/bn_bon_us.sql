-- ==========================================================================
-- Bona Nota · Bon ús segons la fase del món, descans, avís d'examen i nit (g5)
-- Idempotent: es pot tornar a executar tantes vegades com calgui.
-- Depèn de: supabase/bn_log.sql (i opcionalment bn_ranking_net.sql, bn_admin_benestar.sql).
--
--  1. Eixampla el CHECK d'events de public.bn_log amb 'descans' i 'examen_dema'
--     (i conserva 'alta' per compatibilitat amb qualsevol entorn).
--  2. Clau 'bon_us' a bn_priv.config: {"nit_h":"21:30","nit_vigilia_h":"22:00","obre_h":"06:00"}.
--  3. Funció pública bn_vigilia(p_assig, p_neix): retorna la fase actual del món
--     ('aprendre' | 'vigilia' | 'despres'), dia0, data d'examen (si l'admin l'ha posada),
--     si avui hi ha pic de vigília del grup i les hores de la franja de nit.
--     No exposa cap nom de nen ni cap dada personal.
-- ==========================================================================

-- 1) nous events al registre d'activitat
alter table public.bn_log drop constraint if exists bn_log_event_check;
alter table public.bn_log add constraint bn_log_event_check
  check (event in ('entra','fitxa','targetes','test','joc','examen','oberta','valora','temps','alta','descans','examen_dema'));

create schema if not exists bn_priv;
revoke all on schema bn_priv from public, anon, authenticated;

create table if not exists bn_priv.config(clau text primary key, valor text not null);
create table if not exists bn_priv.examens(
  assig text primary key check (assig ~ '^[a-z0-9_-]{1,40}$'),
  data  date not null,
  ts    timestamptz not null default now()
);
revoke all on bn_priv.config, bn_priv.examens from public, anon, authenticated;

create index if not exists bn_log_assig_ts on public.bn_log(assig, ts);

-- 2) configuració d'horari de nit per als mons (es deixa com estigui si l'admin ja l'ha tocada)
insert into bn_priv.config(clau, valor)
values ('bon_us', '{"nit_h":"21:30","nit_vigilia_h":"22:00","obre_h":"06:00"}')
on conflict (clau) do nothing;

create or replace function bn_priv.bon_us_cfg() returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  t text;
  j jsonb;
  nh text;
  vh text;
  oh text;
  nm int;
  vm int;
  om int;
begin
  select c.valor into t from bn_priv.config c where c.clau = 'bon_us';
  begin j := t::jsonb; exception when others then j := null; end;
  if jsonb_typeof(j) is distinct from 'object' then j := '{}'::jsonb; end if;
  nh := case when j ->> 'nit_h' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then j ->> 'nit_h' else '21:30' end;
  vh := case when j ->> 'nit_vigilia_h' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then j ->> 'nit_vigilia_h' else '22:00' end;
  oh := case when j ->> 'obre_h' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then j ->> 'obre_h' else '06:00' end;
  nm := split_part(nh, ':', 1)::int * 60 + split_part(nh, ':', 2)::int;
  vm := split_part(vh, ':', 1)::int * 60 + split_part(vh, ':', 2)::int;
  om := split_part(oh, ':', 1)::int * 60 + split_part(oh, ':', 2)::int;
  return jsonb_build_object(
    'nit_h', nh,
    'nit_vigilia_h', vh,
    'obre_h', oh,
    'nit_min', case when nm < 360 then nm + 1440 else nm end,
    'nit_vigilia_min', case when vm < 360 then vm + 1440 else vm end,
    'obre_min', om
  );
end $$;
revoke all on function bn_priv.bon_us_cfg() from public, anon, authenticated;

-- 3) fase del món per al navegador (sense cap nom de nen)
create or replace function public.bn_vigilia(p_assig text, p_neix date default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_assig text := lower(trim(coalesce(p_assig, '')));
  v_avui date := (now() at time zone 'Europe/Madrid')::date;
  v_dia0 date;
  v_prim date;
  v_examen date;
  v_nens int := 0;
  v_vg_dies date[] := '{}'::date[];
  v_vg_grup boolean := false;
  v_fase text := 'aprendre';
  v_cfg jsonb := bn_priv.bon_us_cfg();
begin
  if v_assig = '' or v_assig !~ '^[a-z0-9_-]{1,40}$' then
    raise exception 'mon no valid' using errcode = '22023';
  end if;
  if p_neix is not null and p_neix not between date '2020-01-01' and date '2100-12-31' then
    p_neix := null;
  end if;

  select e.data into v_examen from bn_priv.examens e where e.assig = v_assig;
  select (min(x.ts) at time zone 'Europe/Madrid')::date,
         count(distinct lower(trim(x.nom)))::int
    into v_prim, v_nens
    from public.bn_log x
   where x.assig = v_assig and x.event <> 'alta' and lower(trim(x.nom)) <> '_alta';

  v_dia0 := coalesce(p_neix, v_prim);

  if v_examen is not null then
    v_vg_grup := false;
    v_fase := case
      when v_avui = v_examen - 1 then 'vigilia'
      when v_avui >= v_examen then 'despres'
      else 'aprendre'
    end;
  else
    if v_dia0 is not null and v_nens > 0 then
      with md as (
        select t.dia, sum(t.s) s, count(*) nens
        from (
          select (x.ts at time zone 'Europe/Madrid')::date dia, lower(trim(x.nom)) k,
                 sum(case when (x.detall ->> 's') ~ '^\s*[0-9]{1,9}(\.[0-9]{1,4})?\s*$'
                          then (x.detall ->> 's')::numeric else 0 end) s
          from public.bn_log x
          where x.assig = v_assig and x.event = 'temps' and lower(trim(x.nom)) <> '_alta'
          group by 1, 2
        ) t
        where t.s > 0
        group by 1
      )
      select coalesce(array_agg(md.dia order by md.dia), '{}'::date[])
        into v_vg_dies
        from md
       where md.dia - v_dia0 between 3 and 12
         and (md.nens >= 5 or md.nens * 2 >= v_nens)
         and md.s >= 3 * (select percentile_cont(0.5) within group (order by o.s)
                          from md o where o.dia <> md.dia);
    end if;

    v_vg_grup := v_avui = any(v_vg_dies);
    if v_vg_grup then
      v_fase := 'vigilia';
    elsif v_dia0 is not null and (v_avui - v_dia0 > 12 or exists (select 1 from unnest(v_vg_dies) d where d < v_avui)) then
      v_fase := 'despres';
    else
      v_fase := 'aprendre';
    end if;
  end if;

  return jsonb_build_object(
    'assig', v_assig,
    'dia0', v_dia0,
    'examen', v_examen,
    'fase', v_fase,
    'vigilia_grup', v_vg_grup,
    'nit_h', v_cfg ->> 'nit_h',
    'nit_vigilia_h', v_cfg ->> 'nit_vigilia_h',
    'obre_h', v_cfg ->> 'obre_h'
  );
end $$;

revoke all on function public.bn_vigilia(text, date) from public;
grant execute on function public.bn_vigilia(text, date) to anon, authenticated;
