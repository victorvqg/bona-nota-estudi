-- Bona Nota · càlcul de la dificultat real i agregació detallada de dubtes («🤔 Pregunta confusa?») a partir del registre (issue #16, g24, g25).
-- Executar al SQL Editor de Supabase DESPRÉS de bn_ranking_net.sql, bn_bon_us.sql i bn_admin_tauler.sql (fa servir bn_priv.admin_ok,
-- bn_priv.amagats i bn_priv.nom_prohibit). Idempotent («create or replace»).
--
-- Criteri (issue #16):
--   · Es llegeix el camp detall->'q' («tema/núm:ok(1|0):segons:opció») dels events «test» i «examen» (NO «joc»/«repas»,
--     perquè el repàs només treu preguntes ja fallades i esbiaixaria l'encert a la baixa).
--   · S'exclouen _alta, els noms prohibits (demo, test…) i els perfils amagats (bn_priv.amagats), i es filtren entrades
--     mal formades o de jocs (j-*).
--   · Amb menys de p_min respostes (per defecte 8): suficient = false i dificultat = null.
--   · Amb p_min respostes o més:
--       encert < 55 %  → dificultat 3 (difícil ⚡)
--       encert > 90 %  → dificultat 1 (fàcil)
--       55 % .. 90 %   → dificultat 2 (normal)
--   · També calcula encert_1a (encert comptant només la primera resposta de cada nen a la pregunta, sense l'efecte de repetir).
--   · A més (g24/g25), recull els avisos «dubte» amb detall de cada nen, motiu, resultat (ok), quan i on han sorgit
--     (test del tema, repàs d'errors, examen sorpresa o examen de veritat).

create or replace function public.bn_admin_dificultat(
  p_email text,
  p_pass text,
  p_assig text default null,
  p_min int default 8,
  p_dies int default 365
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_assig text := nullif(lower(trim(coalesce(p_assig, ''))), '');
  v_min int := least(greatest(coalesce(p_min, 8), 1), 1000);
  v_dies int := least(greatest(coalesce(p_dies, 365), 1), 1825);
  v_desde timestamptz := now() - make_interval(days => v_dies);
  v_fins timestamptz := now() + interval '1 minute';
  v_preg jsonb;
  v_dubtes jsonb;
  v_resum jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);

  with crues as (
    select l.id, l.ts, l.assig, lower(trim(l.nom)) k,
           split_part(q.x, ':', 1) qid,
           (split_part(q.x, ':', 2) = '1') ok,
           case when split_part(q.x, ':', 3) ~ '^[0-9]{1,4}$' then split_part(q.x, ':', 3)::int end seg
    from public.bn_log l,
         jsonb_array_elements_text(case when jsonb_typeof(l.detall -> 'q') = 'array' then l.detall -> 'q' else '[]'::jsonb end) q(x)
    where l.ts >= v_desde and l.ts < v_fins
      and l.event in ('test', 'examen')
      and (v_assig is null or l.assig = v_assig)
      and lower(trim(l.nom)) <> '_alta'
      and not bn_priv.nom_prohibit(l.nom)
      and not exists (select 1 from bn_priv.amagats a where a.k = lower(trim(l.nom)))
      and split_part(q.x, ':', 1) ~ '^[a-z0-9_-]{1,40}/[0-9]{1,5}$'
      and split_part(q.x, ':', 1) not like 'j-%'
      and split_part(q.x, ':', 2) in ('0', '1')
  ),
  ord as (
    select c.*, row_number() over (partition by c.assig, c.qid, c.k order by c.ts, c.id) ord_k
    from crues c
  ),
  ag as (
    select o.assig, o.qid,
           count(*)::int n,
           (count(*) filter (where o.ok))::int bones,
           count(distinct o.k)::int nens,
           round(100.0 * count(*) filter (where o.ok) / count(*), 1) encert,
           round(100.0 * count(*) filter (where o.ord_k = 1 and o.ok) / nullif(count(*) filter (where o.ord_k = 1), 0), 1) encert_1a,
           round(avg(o.seg) filter (where o.seg between 1 and 600), 1) seg_mig,
           (count(*) >= v_min) suficient,
           case
             when count(*) < v_min then null::int
             when 100.0 * count(*) filter (where o.ok) / count(*) < 55 then 3
             when 100.0 * count(*) filter (where o.ok) / count(*) > 90 then 1
             else 2
           end dificultat
    from ord o
    group by o.assig, o.qid
  ),
  dubtes_cru as (
    select l.id,
           l.ts,
           l.assig,
           trim(l.nom) nom,
           lower(trim(l.nom)) k,
           (l.detall ->> 'qid') qid,
           (l.detall ->> 'motiu') motiu,
           case
             when (l.detall ->> 'ok') in ('1', 'true') then true
             when (l.detall ->> 'ok') in ('0', 'false') then false
             else null::boolean
           end ok,
           coalesce(
             case when (l.detall ->> 'on') in ('test', 'repas', 'examen', 'examen-real') then (l.detall ->> 'on') end,
             cx.origen
           ) origen
    from public.bn_log l
    left join lateral (
      select case
               when l2.event = 'joc' and coalesce(l2.detall ->> 'joc', '') = 'repas' then 'repas'
               when l2.event = 'examen' and coalesce(l2.detall ->> 'mode', '') like 'real%' then 'examen-real'
               when l2.event = 'examen' then 'examen'
               when l2.event = 'test' then 'test'
               else null
             end origen
      from public.bn_log l2
      where l2.ts between l.ts - interval '30 minutes' and l.ts + interval '30 minutes'
        and l2.assig = l.assig
        and l2.sessio = l.sessio
        and (l2.event in ('test', 'examen') or (l2.event = 'joc' and coalesce(l2.detall ->> 'joc', '') = 'repas'))
      order by (
        exists (
          select 1
          from jsonb_array_elements_text(case when jsonb_typeof(l2.detall -> 'q') = 'array' then l2.detall -> 'q' else '[]'::jsonb end) qx(v)
          where split_part(qx.v, ':', 1) = (l.detall ->> 'qid')
        )
      ) desc,
      abs(extract(epoch from (l2.ts - l.ts))) asc,
      l2.id desc
      limit 1
    ) cx on true
    where l.ts >= v_desde and l.ts < v_fins
      and l.event = 'dubte'
      and (v_assig is null or l.assig = v_assig)
      and lower(trim(l.nom)) <> '_alta'
      and not bn_priv.nom_prohibit(l.nom)
      and not exists (select 1 from bn_priv.amagats a where a.k = lower(trim(l.nom)))
      and jsonb_typeof(l.detall) = 'object'
      and (l.detall ->> 'qid') ~ '^[a-z0-9_-]{1,40}/[0-9]{1,5}$'
      and (l.detall ->> 'qid') not like 'j-%'
      and (l.detall ->> 'motiu') in ('enunciat', 'resposta', 'pista')
  ),
  dub_ord as (
    select dc.*,
           row_number() over (partition by dc.assig, dc.qid order by dc.ts desc, dc.id desc) rn_q
    from dubtes_cru dc
  ),
  dub as (
    select d.assig, d.qid,
           count(*)::int dubtes,
           count(distinct d.k)::int dubtes_nens,
           jsonb_build_object(
             'enunciat', (count(*) filter (where d.motiu = 'enunciat'))::int,
             'resposta', (count(*) filter (where d.motiu = 'resposta'))::int,
             'pista',    (count(*) filter (where d.motiu = 'pista'))::int
           ) dubtes_motius,
           coalesce(
             jsonb_agg(
               jsonb_build_object(
                 'nom', d.nom,
                 'k', d.k,
                 'motiu', d.motiu,
                 'ok', d.ok,
                 'origen', d.origen,
                 'ts', floor(extract(epoch from d.ts))::bigint
               )
               order by d.ts desc, d.id desc
             ) filter (where d.rn_q <= 20),
             '[]'::jsonb
           ) dubtes_detall
    from dub_ord d
    group by d.assig, d.qid
  ),
  tot as (
    select coalesce(ag.assig, dub.assig) assig,
           coalesce(ag.qid, dub.qid) qid,
           coalesce(ag.n, 0) n,
           coalesce(ag.bones, 0) bones,
           coalesce(ag.nens, 0) nens,
           ag.encert,
           ag.encert_1a,
           ag.seg_mig,
           coalesce(ag.suficient, false) suficient,
           ag.dificultat,
           coalesce(dub.dubtes, 0) dubtes,
           coalesce(dub.dubtes_nens, 0) dubtes_nens,
           coalesce(dub.dubtes_motius, '{"enunciat":0,"resposta":0,"pista":0}'::jsonb) dubtes_motius,
           coalesce(dub.dubtes_detall, '[]'::jsonb) dubtes_detall
    from ag
    full outer join dub on ag.assig = dub.assig and ag.qid = dub.qid
  )
  select
    coalesce((select jsonb_agg(jsonb_build_object(
      'assig', tot.assig, 'qid', tot.qid, 'n', tot.n, 'bones', tot.bones, 'nens', tot.nens,
      'encert', tot.encert, 'encert_1a', tot.encert_1a, 'seg_mig', tot.seg_mig,
      'suficient', tot.suficient, 'dificultat', tot.dificultat,
      'dubtes', tot.dubtes, 'dubtes_nens', tot.dubtes_nens,
      'dubtes_motius', tot.dubtes_motius, 'dubtes_detall', tot.dubtes_detall
    ) order by tot.assig, split_part(tot.qid, '/', 1), split_part(tot.qid, '/', 2)::int) from tot), '[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object(
      'assig', u.assig, 'qid', u.qid, 'nom', u.nom, 'k', u.k,
      'motiu', u.motiu, 'ok', u.ok, 'origen', u.origen,
      'ts', floor(extract(epoch from u.ts))::bigint
    ) order by u.ts desc, u.id desc)
    from (select * from dubtes_cru order by ts desc, id desc limit 200) u), '[]'::jsonb),
    jsonb_build_object(
      'preguntes_vistes', (select count(*)::int from tot),
      'amb_dades',        (select count(*)::int from tot where tot.suficient),
      'dificils',         (select count(*)::int from tot where tot.dificultat = 3),
      'normals',          (select count(*)::int from tot where tot.dificultat = 2),
      'facils',           (select count(*)::int from tot where tot.dificultat = 1),
      'amb_dubtes',       (select count(*)::int from tot where tot.dubtes > 0),
      'total_dubtes',     (select count(*)::int from dubtes_cru)
    )
  into v_preg, v_dubtes, v_resum;

  return jsonb_build_object(
    'min_respostes', v_min,
    'dies', v_dies,
    'assig', v_assig,
    'resum', v_resum,
    'dubtes_llista', v_dubtes,
    'preguntes', v_preg
  );
end $$;

revoke all on function public.bn_admin_dificultat(text, text, text, int, int) from public;
grant execute on function public.bn_admin_dificultat(text, text, text, int, int) to anon, authenticated;
