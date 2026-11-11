-- Bona Nota · càlcul de la dificultat real de cada pregunta a partir del registre (issue #16, fase 4 de n2505/n2506).
-- Executar al SQL Editor de Supabase DESPRÉS de bn_ranking_net.sql i bn_admin_tauler.sql (fa servir bn_priv.admin_ok,
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
  )
  select
    coalesce((select jsonb_agg(jsonb_build_object(
      'assig', ag.assig, 'qid', ag.qid, 'n', ag.n, 'bones', ag.bones, 'nens', ag.nens,
      'encert', ag.encert, 'encert_1a', ag.encert_1a, 'seg_mig', ag.seg_mig,
      'suficient', ag.suficient, 'dificultat', ag.dificultat
    ) order by ag.assig, split_part(ag.qid, '/', 1), split_part(ag.qid, '/', 2)::int) from ag), '[]'::jsonb),
    jsonb_build_object(
      'preguntes_vistes', (select count(*)::int from ag),
      'amb_dades',        (select count(*)::int from ag where ag.suficient),
      'dificils',         (select count(*)::int from ag where ag.dificultat = 3),
      'normals',          (select count(*)::int from ag where ag.dificultat = 2),
      'facils',           (select count(*)::int from ag where ag.dificultat = 1)
    )
  into v_preg, v_resum;

  return jsonb_build_object(
    'min_respostes', v_min,
    'dies', v_dies,
    'assig', v_assig,
    'resum', v_resum,
    'preguntes', v_preg
  );
end $$;

revoke all on function public.bn_admin_dificultat(text, text, text, int, int) from public;
grant execute on function public.bn_admin_dificultat(text, text, text, int, int) to anon, authenticated;
