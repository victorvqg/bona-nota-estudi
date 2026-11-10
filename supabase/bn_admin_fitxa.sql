-- Bona Nota · tauler d'admin, fase B pas 1 (n2537): la fitxa del nen amb l'estat real del núvol (M1) i les altes (M2).
-- Executar al SQL Editor de Supabase DESPRÉS de bn_admin_tauler.sql (fa servir bn_priv.admin_ok i bn_priv.desde).
-- També cal que ja hi hagi bn_ranking_net.sql (amagats, nom_prohibit), bn_pin_nou.sql (pin_v, pin_ts), l'id dels perfils
-- (bn_ids_i_punts.sql) i bn_aspecte.sql (aspecte_ts). Idempotent: es pot tornar a executar tantes vegades com calgui.
--
--  · bn_priv.perfils.creat: quan es va crear el perfil (el nom amb PIN). Es posa en DOS PASSOS: primer la columna sense
--    default (els perfils vells queden buits) i després el default now() per a les altes noves. En un sol pas
--    («add column creat timestamptz default now()») Postgres posaria la data d'avui a tots els perfils vells.
--    Si la taula ja té una columna «ts» de data (no se sap: es va crear amb una migració que no és al repo), se'n copia
--    el valor als perfils que encara no tenen «creat». bn_perfil_crea posa les columnes pel nom: «creat» agafa el default.
--
--  · public.bn_admin_fitxa(correu, contrasenya, nom) → jsonb: el perfil del nen, si està amagat i, per a cada món desat
--    al núvol (bn_priv.progres: només el desen els nens amb PIN), el RESUM de l'estat, no l'estat sencer (pot fer 300 KB).
--    Els mons surten encara que el nen ja no tingui perfil: «Treu el PIN» esborra el perfil (perfil: null) però no el progrés.
--      {"k", "perfil": null | {"nom","id","pin_v","creat","pin_ts","aspecte_ts"}, "amagat",
--       "mons": [{"assig","mod","ts","reinici","punts","temps","dies","dia_ult","ultim",
--                 "temes": {id: {"fitxa","fc","n","max","ult","d_ult","fallades": {pregunta: vegades}}},
--                 "rep": [{"tid","q","c","prox"}] (ordenats per prox, fins a 200), "rep_n", "rep_avui",
--                 "ob": {n: pc}, "examens": [{"d","pc","real"}] (els 20 últims), "boss", "apresos",
--                 "jocs": {id: {"n","max","ult"}}, "fonts", "ftema", "fjoc", "est"}]}
--    L'ESTAT L'ESCRIU EL NAVEGADOR DEL NEN: NO ÉS DE FIAR. Es mira el tipus de cada peça (jsonb_typeof) i els números
--    amb una expressió regular (com a la resta del repo); el que no quadra es deixa fora o surt null. Si l'estat d'un món
--    no és un objecte, o no es pot llegir, aquell món surt com {"assig","mod","ts","error": true} i la resta de la fitxa
--    surt igual. Hores (creat, pin_ts, aspecte_ts, mod, ts, reinici) en mil·lisegons d'època (com Date.now()) o null.
--    Dates del joc ('AAAA-MM-DD') tal com les desa, en UTC (avui() del joc és toISOString): rep_avui compta els errors
--    amb prox ≤ la data UTC d'avui, igual que el repàs del joc.
--
--  · public.bn_admin_altes(correu, contrasenya, període) → jsonb: nens nous del període ('avui' | '7d' | '30d' | 'curs',
--    com el tauler), dels perfils i dels noms del registre (sense els noms no permesos). Per nen:
--      {"k","nom","alta","primer","creat","pin_ts","aspecte_ts","id","mons","punts","dies7","amagat","te_pin"}
--    primer = el primer registre de sempre; alta = least(creat, primer), la primera vegada que veiem el nen (least no fa
--    cas dels null): un nen que jugava sense PIN i el crea avui no surt com a nou d'avui. Mai detall.nou de «entra» (vol
--    dir «nou en aquell aparell»). mons = mons amb estrelles; punts = suma del màxim de cada món (com el rànquing, però de
--    sempre); dies7 = dies diferents (hora de Catalunya) amb registre els 7 primers dies des de l'alta. Ordenat per alta,
--    del més nou al més vell, fins a 500. Un perfil sense cap registre també hi surt (primer = null: «encara no ha jugat»).

create index if not exists bn_log_nom on public.bn_log((lower(trim(nom))));

-- ---------- columna creat (dos passos) ----------
alter table bn_priv.perfils add column if not exists creat timestamptz;   -- pas 1: sense default, els vells queden buits
alter table bn_priv.perfils alter column creat set default now();        -- pas 2: només per a les altes noves

-- si bn_priv.perfils té una columna «ts» de data, se'n copia el valor (dinàmic: si no hi és, aquest bloc no fa res)
do $$
declare t regtype;
begin
  select a.atttypid::regtype into t from pg_catalog.pg_attribute a
   where a.attrelid = 'bn_priv.perfils'::regclass and a.attname = 'ts' and a.attnum > 0 and not a.attisdropped;
  if t in ('timestamp with time zone'::regtype, 'timestamp without time zone'::regtype, 'date'::regtype) then
    execute 'update bn_priv.perfils p set creat = p.ts::timestamptz where p.creat is null and p.ts is not null';
  elsif t is not null then
    raise notice 'bn_priv.perfils.ts és de tipus %: no es copia a creat', t;
  end if;
end $$;

-- ---------- ajudes (esquema privat) ----------
-- una hora en mil·lisegons d'època (com Date.now() al navegador)
create or replace function bn_priv.fitxa_ms(p timestamptz) returns bigint
language sql immutable set search_path = '' as $$
  select floor(extract(epoch from p) * 1000)::bigint
$$;

-- un número de l'estat (número o text amb xifres; 0 … 999.999.999); res més: negatius, text, booleans, 1e30 → null
create or replace function bn_priv.fitxa_num(v jsonb) returns numeric
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(v) in ('number', 'string') and (v #>> '{}') ~ '^[0-9]{1,9}(\.[0-9]+)?$'
              then (v #>> '{}')::numeric end
$$;

-- uns mil·lisegons de l'estat (mod, reinici)
create or replace function bn_priv.fitxa_nms(v jsonb) returns bigint
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(v) in ('number', 'string') and (v #>> '{}') ~ '^[0-9]{1,15}(\.[0-9]+)?$'
              then floor((v #>> '{}')::numeric)::bigint end
$$;

-- una data del joc ('AAAA-MM-DD'), si en té la forma
create or replace function bn_priv.fitxa_dia(v jsonb) returns text
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(v) = 'string' and (v #>> '{}') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then v #>> '{}' end
$$;

-- un id o un text curt (text o número); la resta → null
create or replace function bn_priv.fitxa_txt(v jsonb) returns text
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(v) in ('string', 'number') then v #>> '{}' end
$$;

-- un objecte tal qual; si no és un objecte → null
create or replace function bn_priv.fitxa_obj(v jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(v) = 'object' then v end
$$;

-- avui segons el joc: la data UTC (avui() fa new Date().toISOString().slice(0,10)), no la de Madrid
create or replace function bn_priv.fitxa_avui() returns text
language sql stable set search_path = '' as $$
  select to_char(now() at time zone 'UTC', 'YYYY-MM-DD')
$$;

-- resum d'un món a partir de l'estat desat (bn_priv.progres.estat), comprovant el tipus de cada peça
create or replace function bn_priv.fitxa_mon(p_assig text, p_estat jsonb, p_mod bigint, p_ts timestamptz) returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  e jsonb := p_estat;
  cap jsonb := jsonb_build_object('assig', p_assig, 'mod', coalesce(p_mod, bn_priv.fitxa_nms(p_estat -> 'mod')),
                                  'ts', bn_priv.fitxa_ms(p_ts));
  v_temes jsonb := '{}'; v_rep jsonb := '[]'; v_rep_n int := 0; v_rep_avui int := 0;
  v_ob jsonb := '{}'; v_ex jsonb := '[]'; v_jocs jsonb := '{}'; v_dies int := 0; v_dia_ult text;
begin
  if jsonb_typeof(e) is distinct from 'object' then
    return cap || jsonb_build_object('error', true);
  end if;

  -- temes: {id: {fitxa, fc, intents: [{d, pc}], fallades: {pregunta: n}}}
  if jsonb_typeof(e -> 'temes') = 'object' then
    select coalesce(jsonb_object_agg(t.key, jsonb_build_object(
             'fitxa', coalesce(t.value -> 'fitxa' = 'true'::jsonb, false),
             'fc', bn_priv.fitxa_num(t.value -> 'fc'),
             'n', i.n, 'max', i.mx, 'ult', i.ult, 'd_ult', i.d_ult, 'fallades', f.f)), '{}')
      into v_temes
      from jsonb_each(e -> 'temes') t
      cross join lateral (
        select count(*)::int n, max(x.pc) mx,
               (array_agg(x.pc order by x.o desc))[1] ult, (array_agg(x.d order by x.o desc))[1] d_ult
        from (select bn_priv.fitxa_num(a.v -> 'pc') pc, bn_priv.fitxa_dia(a.v -> 'd') d, a.o
              from jsonb_array_elements(case when jsonb_typeof(t.value -> 'intents') = 'array'
                                             then t.value -> 'intents' else '[]'::jsonb end) with ordinality a(v, o)
              where jsonb_typeof(a.v) = 'object') x
        where x.pc is not null) i
      cross join lateral (
        select coalesce(jsonb_object_agg(g.key, bn_priv.fitxa_num(g.value)), '{}') f
        from jsonb_each(case when jsonb_typeof(t.value -> 'fallades') = 'object'
                             then t.value -> 'fallades' else '{}'::jsonb end) g
        where bn_priv.fitxa_num(g.value) is not null) f
      where jsonb_typeof(t.value) = 'object';
  end if;

  -- rep: {clau: {tid, q, c, prox}} → llista ordenada per prox (fins a 200) + quants n'hi ha i quants toquen avui
  if jsonb_typeof(e -> 'rep') = 'object' then
    with r as (
      select bn_priv.fitxa_txt(x.value -> 'tid') tid,
             case when jsonb_typeof(x.value -> 'q') = 'string' then x.value ->> 'q' end q,
             bn_priv.fitxa_num(x.value -> 'c') c, bn_priv.fitxa_dia(x.value -> 'prox') prox
      from jsonb_each(e -> 'rep') x
      where jsonb_typeof(x.value) = 'object')
    select (select count(*) from r), (select count(*) from r where r.prox <= bn_priv.fitxa_avui()),
           coalesce((select jsonb_agg(jsonb_build_object('tid', s.tid, 'q', s.q, 'c', s.c, 'prox', s.prox)
                                      order by s.prox nulls last, s.tid, s.q)
                     from (select * from r order by r.prox nulls last, r.tid, r.q limit 200) s), '[]')
      into v_rep_n, v_rep_avui, v_rep;
  end if;

  -- ob: {n: pc}
  if jsonb_typeof(e -> 'ob') = 'object' then
    select coalesce(jsonb_object_agg(o.key, bn_priv.fitxa_num(o.value)), '{}') into v_ob
      from jsonb_each(e -> 'ob') o where bn_priv.fitxa_num(o.value) is not null;
  end if;

  -- examens: [{d, pc, real?}] → els 20 últims, en l'ordre del joc (del més vell al més nou)
  if jsonb_typeof(e -> 'examens') = 'array' then
    select coalesce(jsonb_agg(jsonb_build_object('d', x.d, 'pc', x.pc, 'real', x.re) order by x.o), '[]') into v_ex
      from (select bn_priv.fitxa_dia(a.v -> 'd') d, bn_priv.fitxa_num(a.v -> 'pc') pc,
                   coalesce(a.v -> 'real' = 'true'::jsonb or bn_priv.fitxa_num(a.v -> 'real') > 0, false) re, a.o
            from jsonb_array_elements(e -> 'examens') with ordinality a(v, o)
            where jsonb_typeof(a.v) = 'object' and bn_priv.fitxa_num(a.v -> 'pc') is not null
            order by a.o desc limit 20) x;
  end if;

  -- jocs: {id: [pc, …]} → {id: {n, max, ult}}
  if jsonb_typeof(e -> 'jocs') = 'object' then
    select coalesce(jsonb_object_agg(j.key, jsonb_build_object('n', s.n, 'max', s.mx, 'ult', s.ult)), '{}') into v_jocs
      from jsonb_each(e -> 'jocs') j
      cross join lateral (
        select count(x.pc)::int n, max(x.pc) mx, (array_agg(x.pc order by x.o desc) filter (where x.pc is not null))[1] ult
        from (select bn_priv.fitxa_num(a.v) pc, a.o
              from jsonb_array_elements(case when jsonb_typeof(j.value) = 'array' then j.value else '[]'::jsonb end)
                   with ordinality a(v, o)) x) s
      where jsonb_typeof(j.value) = 'array';
  end if;

  -- dies: ['AAAA-MM-DD', …] → quants dies diferents i l'últim
  if jsonb_typeof(e -> 'dies') = 'array' then
    select count(distinct x.d)::int, max(x.d) into v_dies, v_dia_ult
      from (select bn_priv.fitxa_dia(a.v) d from jsonb_array_elements(e -> 'dies') a(v)) x where x.d is not null;
  end if;

  return cap || jsonb_build_object(
    'reinici', bn_priv.fitxa_nms(e -> 'reinici'),
    'punts', bn_priv.fitxa_num(e -> 'punts'), 'temps', bn_priv.fitxa_num(e -> 'temps'),
    'dies', v_dies, 'dia_ult', v_dia_ult, 'ultim', bn_priv.fitxa_num(e -> 'ultim'),
    'temes', v_temes, 'rep', v_rep, 'rep_n', v_rep_n, 'rep_avui', v_rep_avui,
    'ob', v_ob, 'examens', v_ex, 'boss', bn_priv.fitxa_obj(e -> 'boss'), 'apresos', bn_priv.fitxa_num(e -> 'apresos'),
    'jocs', v_jocs, 'fonts', bn_priv.fitxa_obj(e -> 'fonts'), 'ftema', bn_priv.fitxa_obj(e -> 'ftema'),
    'fjoc', bn_priv.fitxa_obj(e -> 'fjoc'), 'est', bn_priv.fitxa_obj(e -> 'est'));
end $$;

-- ---------- 1) fitxa del nen amb l'estat real ----------
create or replace function public.bn_admin_fitxa(p_email text, p_pass text, p_nom text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare kk text := lower(trim(coalesce(p_nom, ''))); pf jsonb; mons jsonb := '[]'; m jsonb; r record;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  select jsonb_build_object('nom', p.nom, 'id', p.id, 'pin_v', p.pin_v, 'creat', bn_priv.fitxa_ms(p.creat),
                            'pin_ts', bn_priv.fitxa_ms(p.pin_ts), 'aspecte_ts', bn_priv.fitxa_ms(p.aspecte_ts))
    into pf from bn_priv.perfils p where p.k = kk;
  -- els mons surten encara que no hi hagi perfil: «Treu el PIN» (bn_admin_usuari 'treupin') esborra el perfil però no el progrés
  for r in select g.assig, g.estat, g.mod, g.ts from bn_priv.progres g where g.k = kk order by g.assig loop
    begin
      m := bn_priv.fitxa_mon(r.assig, r.estat, r.mod, r.ts);
    exception when others then   -- un món que no es pot llegir no fa caure la fitxa
      m := jsonb_build_object('assig', r.assig, 'mod', r.mod, 'ts', bn_priv.fitxa_ms(r.ts), 'error', true);
    end;
    mons := mons || jsonb_build_array(m);
  end loop;
  return jsonb_build_object('k', kk, 'perfil', pf, 'amagat', exists (select 1 from bn_priv.amagats a where a.k = kk),
                            'mons', mons);
end $$;

-- ---------- 2) altes: nens nous del període ----------
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
               least(p.creat, l.primer) alta, p.k is not null te_pin   -- la primera vegada que el veiem (least no fa cas dels null)
        from bn_priv.perfils p
        full join (select lower(trim(x.nom)) k, max(x.nom) nom, min(x.ts) primer
                   from public.bn_log x group by 1) l on l.k = p.k
      ) t
      where t.alta >= d and not bn_priv.nom_prohibit(t.nom)
      order by t.alta desc, t.k
      limit 500) s
    -- estrelles de sempre: el màxim de cada món (com el rànquing, sense el límit de 120 dies)
    cross join lateral (
      select count(*) filter (where x.p > 0)::int mons, coalesce(sum(x.p), 0) punts
      from (select max(case when l.detall ->> 'punts' ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (l.detall ->> 'punts')::numeric end) p
            from public.bn_log l where lower(trim(l.nom)) = s.k group by l.assig) x) pt
    -- dies diferents (hora de Catalunya) amb registre durant els 7 primers dies des de l'alta
    cross join lateral (
      select count(distinct (l.ts at time zone 'Europe/Madrid')::date)::int dies
      from public.bn_log l
      where lower(trim(l.nom)) = s.k and l.ts >= s.alta and l.ts < s.alta + interval '7 days') d7
  ), '[]'::jsonb);
end $$;

-- ---------- permisos: les públiques només funcionen amb el correu i la contrasenya de l'admin ----------
revoke all on function public.bn_admin_fitxa(text,text,text) from public;
grant execute on function public.bn_admin_fitxa(text,text,text) to anon, authenticated;
revoke all on function public.bn_admin_altes(text,text,text) from public;
grant execute on function public.bn_admin_altes(text,text,text) to anon, authenticated;
revoke all on function bn_priv.fitxa_ms(timestamptz) from public, anon, authenticated;
revoke all on function bn_priv.fitxa_num(jsonb) from public, anon, authenticated;
revoke all on function bn_priv.fitxa_nms(jsonb) from public, anon, authenticated;
revoke all on function bn_priv.fitxa_dia(jsonb) from public, anon, authenticated;
revoke all on function bn_priv.fitxa_txt(jsonb) from public, anon, authenticated;
revoke all on function bn_priv.fitxa_obj(jsonb) from public, anon, authenticated;
revoke all on function bn_priv.fitxa_avui() from public, anon, authenticated;
revoke all on function bn_priv.fitxa_mon(text,jsonb,bigint,timestamptz) from public, anon, authenticated;
