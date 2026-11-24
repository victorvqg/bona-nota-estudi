-- Bona Nota · seguiment de laboratoris visuals per al panell d'administració (/admin/)
-- Executar UNA vegada al SQL Editor del projecte «bonanota» (es pot tornar a executar: tot és «create or replace»).
--
-- Afegeix una sola RPC protegida amb admin_ok (sense crear taules noves):
--   public.bn_admin_visuals(p_email text, p_pass text, p_assig text default null) -> jsonb
--     Torna:
--       {
--         "premis":  [{ "k","nom","id","reward_key","stars","ts" }],
--         "progres": [{ "k","nom","id","assig","visuals","ts" }],
--         "logs":    [{ "k","nom","id","assig","reward_key","explored","total","mastered","completed","premi","stars","inici_ts","ultim_ts" }],
--         "actius":  [{ "k","nom","id","assig","te_pin" }]
--       }
--     El panell admin creua aquestes 4 fonts amb LABS_MON (generat per motor/tot.py) per resoldre
--     qualsevol parell world <-> assig (ex. clima <-> socials) sense tocar l'SQL quan s'afegeixin nous laboratoris.
--     Totes les marques de temps (ts, inici_ts, ultim_ts) van en mil·lisegons d'època (bigint).

create or replace function public.bn_admin_visuals(p_email text, p_pass text, p_assig text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_assig text := nullif(lower(trim(coalesce(p_assig, ''))), '');
  v_premis jsonb := '[]'::jsonb;
  v_progres jsonb := '[]'::jsonb;
  v_logs jsonb := '[]'::jsonb;
  v_actius jsonb := '[]'::jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  -- 1) Premis oficials cobrats (+10 ⭐) a bn_priv.premis_visuals
  if to_regclass('bn_priv.premis_visuals') is not null then
    execute $q$
      select coalesce(jsonb_agg(jsonb_build_object(
        'k', x.k,
        'nom', coalesce(p.nom, x.k),
        'id', p.id,
        'reward_key', x.reward_key,
        'stars', x.stars,
        'ts', (extract(epoch from x.ts) * 1000)::bigint
      ) order by x.ts desc), '[]'::jsonb)
      from bn_priv.premis_visuals x
      left join bn_priv.perfils p on p.k = x.k
      where not bn_priv.nom_prohibit(coalesce(p.nom, x.k))
    $q$ into v_premis;
  end if;

  -- 2) Estat detallat desat al núvol (bn_priv.progres.estat -> 'visuals')
  select coalesce(jsonb_agg(jsonb_build_object(
    'k', g.k,
    'nom', coalesce(p.nom, nullif(trim(g.estat ->> 'nom'), ''), g.k),
    'id', p.id,
    'assig', g.assig,
    'visuals', g.estat -> 'visuals',
    'ts', (extract(epoch from g.ts) * 1000)::bigint
  ) order by g.ts desc), '[]'::jsonb)
  into v_progres
  from bn_priv.progres g
  left join bn_priv.perfils p on p.k = g.k
  where jsonb_typeof(g.estat -> 'visuals') = 'object'
    and g.estat -> 'visuals' <> '{}'::jsonb
    and (v_assig is null or lower(g.assig) = v_assig)
    and not bn_priv.nom_prohibit(coalesce(p.nom, g.k));

  -- 3) Historial agregat de public.bn_log (cobreix també alumnes sense PIN i avenços parcials)
  select coalesce(jsonb_agg(jsonb_build_object(
    'k', s.k,
    'nom', coalesce(p.nom, s.nom),
    'id', p.id,
    'assig', s.assig,
    'reward_key', s.rk,
    'explored', s.explored,
    'total', s.total,
    'mastered', s.mastered,
    'completed', s.completed,
    'premi', s.premi,
    'stars', s.stars,
    'inici_ts', (extract(epoch from s.inici_ts) * 1000)::bigint,
    'ultim_ts', (extract(epoch from s.ultim_ts) * 1000)::bigint
  ) order by s.ultim_ts desc), '[]'::jsonb)
  into v_logs
  from (
    select
      lower(trim(l.nom)) as k,
      max(l.nom) as nom,
      l.assig,
      l.detall ->> 'joc' as rk,
      max(case when (l.detall ->> 'explored') ~ '^[0-9]+$' then (l.detall ->> 'explored')::int end) as explored,
      max(case when (l.detall ->> 'total') ~ '^[0-9]+$' then (l.detall ->> 'total')::int end) as total,
      max(case when (l.detall ->> 'mastered') ~ '^[0-9]+$' then (l.detall ->> 'mastered')::int end) as mastered,
      bool_or(coalesce((l.detall ->> 'completed') = 'true', false)
              or coalesce(l.detall ->> 'pas', '') = 'premi'
              or (l.detall ? 'stars' and coalesce(l.detall ->> 'pas', '') <> 'progres')) as completed,
      bool_or(coalesce(l.detall ->> 'pas', '') = 'premi'
              or (l.detall ? 'stars' and coalesce(l.detall ->> 'pas', '') <> 'progres')) as premi,
      max(case when (l.detall ->> 'stars') ~ '^[0-9]+$' then (l.detall ->> 'stars')::int end) as stars,
      min(l.ts) as inici_ts,
      max(l.ts) as ultim_ts
    from public.bn_log l
    where l.event = 'joc'
      and coalesce(l.detall ->> 'joc', '') like 'visual_%'
      and (v_assig is null or lower(l.assig) = v_assig)
      and not bn_priv.nom_prohibit(l.nom)
    group by lower(trim(l.nom)), l.assig, l.detall ->> 'joc'
  ) s
  left join bn_priv.perfils p on p.k = s.k;

  -- 4) Alumnes actius per món (per calcular «Pendents» sobre els alumnes reals de cada assignatura)
  select coalesce(jsonb_agg(jsonb_build_object(
    'k', a.k,
    'nom', coalesce(p.nom, a.nom),
    'id', p.id,
    'assig', a.assig,
    'te_pin', (p.k is not null)
  ) order by a.assig, coalesce(p.nom, a.nom)), '[]'::jsonb)
  into v_actius
  from (
    select u.k, max(u.nom) as nom, u.assig
    from (
      select g.k, coalesce(nullif(trim(g.estat ->> 'nom'), ''), g.k) as nom, g.assig
      from bn_priv.progres g
      where (v_assig is null or lower(g.assig) = v_assig)
      union all
      select lower(trim(l.nom)) as k, l.nom, l.assig
      from public.bn_log l
      where l.nom is not null and trim(l.nom) <> ''
        and (v_assig is null or lower(l.assig) = v_assig)
    ) u
    where not bn_priv.nom_prohibit(u.nom)
    group by u.k, u.assig
  ) a
  left join bn_priv.perfils p on p.k = a.k;

  return jsonb_build_object(
    'premis', coalesce(v_premis, '[]'::jsonb),
    'progres', coalesce(v_progres, '[]'::jsonb),
    'logs', coalesce(v_logs, '[]'::jsonb),
    'actius', coalesce(v_actius, '[]'::jsonb)
  );
end $$;

revoke all on function public.bn_admin_visuals(text,text,text) from public;
grant execute on function public.bn_admin_visuals(text,text,text) to anon, authenticated;
