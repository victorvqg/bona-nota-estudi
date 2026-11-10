-- Bona Nota · Embut d'alta (M7 · n2537)
-- 1) Amplia el check d'event de public.bn_log per admetre 'alta' (de manera idempotent).
-- 2) Trigger aa_bn_log_alta_net: neteja qualsevol registre 'alta' perquè:
--    · assig sigui sempre 'portada';
--    · abans de tenir perfil (passos 'nom' i 'pin_ko'), nom sigui sempre '_alta' (mai el nom escrit);
--    · detall només pugui portar {pas, ok, motiu} amb codis tancats (mai punts, fonts, ni el PIN ni la seva llargada).
-- 3) Actualitza bn_priv.logs i bn_admin_altes perquè excloguin l'event 'alta' i el nom tècnic '_alta'.
-- 4) Funció public.bn_admin_alta_embut(p_email, p_pass, p_periode) per a la targeta «Embut d'alta» de l'admin.

do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    where c.conrelid = 'public.bn_log'::regclass
      and c.contype = 'c'
      and a.attname = 'event'
  loop
    execute format('alter table public.bn_log drop constraint %I', r.conname);
  end loop;
  alter table public.bn_log
    add constraint bn_log_event_check
    check (event in ('entra','fitxa','targetes','test','joc','examen','oberta','valora','temps','alta'));
end $$;

create or replace function bn_priv.bn_log_alta_net()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_pas text;
  v_ok int;
  v_motiu text;
  v_det jsonb;
begin
  if new.event <> 'alta' then
    return new;
  end if;
  v_pas := coalesce(new.detall ->> 'pas', '');
  if v_pas not in ('nom', 'pin_creat', 'pin_ko', 'perfil', 'pin_ara_no') then
    raise exception 'pas d alta no valid' using errcode = '22023';
  end if;
  new.assig := 'portada';
  if v_pas in ('nom', 'pin_ko') then
    new.nom := '_alta';
    if new.aparell not like 'alta:%' then
      new.aparell := left('alta:' || coalesce(new.aparell, '?'), 40);
    end if;
  end if;
  v_ok := case
    when v_pas = 'pin_ko' then 0
    when v_pas in ('pin_creat', 'perfil', 'pin_ara_no') then 1
    when (new.detall ->> 'ok') in ('0', 'false') then 0
    else 1
  end;
  v_motiu := coalesce(new.detall ->> 'motiu', '');
  v_det := jsonb_build_object('pas', v_pas, 'ok', v_ok);
  if v_motiu in ('massa_noms', 'prohibit', 'existeix', 'format', 'exemple', 'incorrecte', 'no_coincideix', 'bloc', 'canvi') then
    v_det := v_det || jsonb_build_object('motiu', v_motiu);
  end if;
  new.detall := v_det;
  return new;
end $$;

drop trigger if exists aa_bn_log_alta_net on public.bn_log;
create trigger aa_bn_log_alta_net
  before insert on public.bn_log
  for each row execute function bn_priv.bn_log_alta_net();

-- Exclou 'alta' i '_alta' dels registres d'estudi del tauler (resum, activitat, calor, alertes, respostes)
create or replace function bn_priv.logs(p_desde timestamptz, p_fins timestamptz, p_assig text, p_nom text)
returns setof public.bn_log language sql stable set search_path = '' as $$
  select * from public.bn_log l
  where l.ts >= p_desde and l.ts < p_fins
    and l.event <> 'alta'
    and lower(trim(l.nom)) <> '_alta'
    and (p_assig is null or p_assig = '' or l.assig = p_assig)
    and (p_nom is null or p_nom = '' or lower(trim(l.nom)) = lower(trim(p_nom)))
$$;

-- Exclou 'alta' i '_alta' del càlcul de «Primer registre» i llista de nens nous a bn_admin_altes
create or replace function public.bn_admin_altes(p_email text, p_pass text, p_periode text default '30d')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare d timestamptz;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  d := bn_priv.desde(coalesce(p_periode, '30d'));
  return coalesce((select jsonb_agg(jsonb_build_object(
      'k', s.k, 'nom', s.nom, 'alta', bn_priv.fitxa_ms(s.alta), 'primer', bn_priv.fitxa_ms(s.primer),
      'creat', bn_priv.fitxa_ms(s.creat), 'pin_ts', bn_priv.fitxa_ms(s.pin_ts), 'aspecte_ts', bn_priv.fitxa_ms(s.aspecte_ts),
      'id', s.id, 'mons', pt.mons, 'punts', pt.punts, 'dies7', d7.dies, 'amagat', s.amagat, 'te_pin', s.te_pin)
      order by s.alta desc, s.k)
    from (
      select t.*, exists (select 1 from bn_priv.amagats a where a.k = t.k) amagat
      from (
        select coalesce(p.k, l.k) k, coalesce(p.nom, l.nom) nom, p.id, p.creat, p.pin_ts, p.aspecte_ts, l.primer,
               least(p.creat, l.primer) alta, p.k is not null te_pin
        from bn_priv.perfils p
        full join (select lower(trim(x.nom)) k, max(x.nom) nom, min(x.ts) primer
                   from public.bn_log x
                   where x.event <> 'alta' and lower(trim(x.nom)) <> '_alta'
                   group by 1) l on l.k = p.k
      ) t
      where t.alta >= d and t.k <> '_alta' and not bn_priv.nom_prohibit(t.nom)
      order by t.alta desc, t.k
      limit 500) s
    cross join lateral (
      select count(*) filter (where x.p > 0)::int mons, coalesce(sum(x.p), 0) punts
      from (select max(case when l.detall ->> 'punts' ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (l.detall ->> 'punts')::numeric end) p
            from public.bn_log l where lower(trim(l.nom)) = s.k and l.event <> 'alta' group by l.assig) x) pt
    cross join lateral (
      select count(distinct (l.ts at time zone 'Europe/Madrid')::date)::int dies
      from public.bn_log l
      where lower(trim(l.nom)) = s.k and l.event <> 'alta' and l.ts >= s.alta and l.ts < s.alta + interval '7 days') d7
  ), '[]'::jsonb);
end $$;

-- Embut d'alta (M7): on s'encallen els nens nous a la portada i al perfil
create or replace function public.bn_admin_alta_embut(p_email text, p_pass text, p_periode text default '30d')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_per text := coalesce(nullif(trim(p_periode), ''), '30d');
  v_d0 timestamptz := bn_priv.desde(v_per);
  v_resum jsonb;
  v_passos jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  with
  ev as (
    select l.ts,
           regexp_replace(coalesce(l.aparell, '?'), '^alta:', '') as ap,
           case when lower(trim(l.nom)) = '_alta' then null else lower(trim(l.nom)) end as k,
           l.detall ->> 'pas' as pas,
           case when (l.detall ->> 'ok') in ('0', 'false') then 0 else 1 end as ok,
           nullif(l.detall ->> 'motiu', '') as motiu
    from public.bn_log l
    where l.event = 'alta'
      and l.ts >= v_d0
      and (l.detall ->> 'pas') in ('nom', 'pin_creat', 'pin_ko', 'perfil', 'pin_ara_no')
  ),
  primers as (
    select lower(trim(x.nom)) as k,
           min(x.ts) as primer,
           (array_agg(regexp_replace(coalesce(x.aparell, '?'), '^alta:', '') order by x.ts asc))[1] as ap0
    from public.bn_log x
    where x.event <> 'alta'
      and lower(trim(x.nom)) <> '_alta'
      and not bn_priv.nom_prohibit(x.nom)
    group by 1
  ),
  directes as (
    select count(*)::int as n
    from primers p
    where p.primer >= v_d0
      and not exists (
        select 1 from public.bn_log a
        where a.event = 'alta'
          and a.ts <= p.primer + interval '1 minute'
          and (lower(trim(a.nom)) = p.k or regexp_replace(coalesce(a.aparell, '?'), '^alta:', '') = p.ap0)
      )
  )
  select jsonb_build_object(
    'aparells',    count(distinct ev.ap)::int,
    'nom_ok',      count(distinct ev.ap) filter (where (ev.pas = 'nom' and ev.ok = 1) or ev.pas = 'pin_creat')::int,
    'nom_ko',      count(distinct ev.ap) filter (where ev.pas = 'nom' and ev.ok = 0)::int,
    'pin_creat',   count(distinct coalesce(ev.k, ev.ap)) filter (where ev.pas = 'pin_creat' and ev.ok = 1)::int,
    'pin_ko',      count(distinct ev.ap) filter (where ev.pas = 'pin_ko')::int,
    'perfil',      count(distinct coalesce(ev.k, ev.ap)) filter (where ev.pas = 'perfil' and ev.ok = 1)::int,
    'pin_ara_no',  count(distinct coalesce(ev.k, ev.ap)) filter (where ev.pas = 'pin_ara_no')::int,
    'directes_mon', (select d.n from directes d)
  ) into v_resum
  from ev;

  with
  ordre(pas, ord) as (
    values ('nom', 1), ('pin_ko', 2), ('pin_creat', 3), ('perfil', 4), ('pin_ara_no', 5)
  ),
  ev as (
    select regexp_replace(coalesce(l.aparell, '?'), '^alta:', '') as ap,
           case when lower(trim(l.nom)) = '_alta' then null else lower(trim(l.nom)) end as k,
           l.detall ->> 'pas' as pas,
           case when (l.detall ->> 'ok') in ('0', 'false') then 0 else 1 end as ok,
           nullif(l.detall ->> 'motiu', '') as motiu
    from public.bn_log l
    where l.event = 'alta'
      and l.ts >= v_d0
      and (l.detall ->> 'pas') in ('nom', 'pin_creat', 'pin_ko', 'perfil', 'pin_ara_no')
  ),
  mot as (
    select m.pas, jsonb_object_agg(m.motiu, m.n order by m.n desc, m.motiu) as motius
    from (
      select ev.pas, ev.motiu, count(*)::int as n
      from ev
      where ev.motiu is not null
      group by ev.pas, ev.motiu
    ) m
    group by m.pas
  ),
  ag as (
    select o.pas, o.ord,
           count(ev.pas)::int as total,
           count(ev.pas) filter (where ev.ok = 1)::int as ok,
           count(ev.pas) filter (where ev.ok = 0)::int as ko,
           count(distinct ev.ap)::int as aparells,
           count(distinct ev.k)::int as nens,
           coalesce(mot.motius, '{}'::jsonb) as motius
    from ordre o
    left join ev on ev.pas = o.pas
    left join mot on mot.pas = o.pas
    group by o.pas, o.ord, mot.motius
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'pas', ag.pas, 'total', ag.total, 'ok', ag.ok, 'ko', ag.ko,
    'aparells', ag.aparells, 'nens', ag.nens, 'motius', ag.motius
  ) order by ag.ord), '[]'::jsonb)
  into v_passos
  from ag;

  return jsonb_build_object('periode', v_per, 'resum', v_resum, 'passos', v_passos);
end $$;

revoke all on function bn_priv.bn_log_alta_net() from public, anon, authenticated;
revoke all on function public.bn_admin_alta_embut(text, text, text) from public;
grant execute on function public.bn_admin_alta_embut(text, text, text) to anon, authenticated;

-- Si bn_admin_benestar ja existeix a la base de dades, n'exclou també 'alta' i '_alta' sense haver de tornar a executar bn_admin_benestar.sql
do $$
declare s text;
begin
  if to_regprocedure('public.bn_admin_benestar(text,text,text,text)') is not null then
    s := pg_get_functiondef('public.bn_admin_benestar(text,text,text,text)'::regprocedure);
    if position('x.event <> ''alta''' in s) = 0 then
      s := replace(s,
        'select distinct x.assig from public.bn_log x where x.ts >= v_d0 and x.ts < v_fins',
        'select distinct x.assig from public.bn_log x where x.ts >= v_d0 and x.ts < v_fins and x.event <> ''alta''');
      s := replace(s,
        'and (v_kk is null or lower(trim(x.nom)) = v_kk)',
        'and x.event <> ''alta'' and lower(trim(x.nom)) <> ''_alta'' and (v_kk is null or lower(trim(x.nom)) = v_kk)');
      execute s;
    end if;
  end if;
end $$;
