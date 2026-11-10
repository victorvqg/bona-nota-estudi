-- Bona Nota · tauler d'admin, fase B pas 2 (n2537): historial de combos i repàs per dia (M3) i errors pendents de la colla (M4).
-- Executar al SQL Editor de Supabase DESPRÉS de bn_admin_tauler.sql (bn_priv.admin_ok, bn_priv.desde) i de bn_admin_reinicia.sql
-- (bn_priv.reinicis). No fa servir les ajudes de bn_admin_fitxa.sql. Idempotent: es pot tornar a executar tantes vegades com calgui.
--
--  · public.bn_admin_fonts_dia(correu, contrasenya, període = '30d', assig = null, nom = null) → jsonb
--      {"periode", "dies": [{"dia": "AAAA-MM-DD", "k", "nom", "assig", "f": {"combo": n, …}}], "total": {"combo": n, …}}
--    D'ON SURT: detall.fonts del registre (public.bn_log): les estrelles ACUMULADES de cada font en aquell món i aparell
--    ({temes, jocs, examen, obertes, combo, record, repas, missio, boss, triple, super}). La porten «entra» i «temps» i, des de la
--    n2522, també «test», «joc», «examen» i «oberta» (detallLog() de la plantilla): es fan servir TOTS els registres que en porten
--    (un objecte). Si el detall era massa llarg el joc l'hi treu (retalla()), i el trigger de reinicis també: aquells no compten.
--    COM ES COMPTA: per a cada nen (lower(trim(nom))) i món, els registres amb fonts en ordre (ts, id). L'increment d'una font en
--    un registre és el que passa del MÀXIM que aquella font tenia als registres d'abans del mateix tram: greatest(0, actual − màxim).
--    No es compara amb el registre just anterior (lag) perquè «entra» s'envia ABANS de baixar el núvol: un aparell vell envia uns
--    valors baixos i, en fusionar (el joc es queda el màxim), torna als de sempre; amb lag, aquella pujada es comptaria dues vegades.
--    Un valor que baixa dona 0 (mai negatiu). Una font que no era als registres d'abans compta des de 0.
--      - El PRIMER registre d'un tram és la base: no compta (no se sap de quan són aquelles estrelles).
--      - Trams: la sèrie es talla als reinicis (bn_priv.reinicis del nen per a aquell món o '*'): el primer registre després
--        d'un reinici torna a ser base.
--      - Base anterior al període: per a cada nen i món del període, l'últim registre amb fonts d'abans del període (no es llegeix
--        tota la història: si aquell registre és d'un aparell vell, el primer increment del període pot sortir de més).
--      - L'increment va al dia (hora de Catalunya, Europe/Madrid) del registre on apareix. Granularitat: la del registre (sessió,
--        test, joc…), no el moment exacte de cada estrella. Abans de la 2.9.0 i la 2.10.0 no hi havia triple ni super.
--    Claus: les que tenen forma de nom ('^[a-z][a-z0-9_]{0,23}$') i valor numèric (número o text amb xifres, 0 … 999.999.999):
--      les conegudes i les noves del joc es tornen tal qual; la resta (negatius, text, booleans, 1e30, claus estranyes) no compta.
--    període: 'avui' | '7d' | '30d' | 'curs' (com la resta del tauler), comptat en DIES SENCERS: des de la mitjanit (Madrid) del dia
--      on comença bn_priv.desde (com bn_admin_benestar). assig i nom: null o '' = tots (nom amb lower(trim)).
--    dies: només files amb algun increment > 0; «f» només porta les fonts > 0. Ordenades per dia, k i assig. Fins a 5.000 files
--      (si n'hi ha més, es queden els dies més recents SENCERS: cap dia surt a mitges). total: la suma de cada font de TOT el període
--      (encara que «dies» s'hagi retallat). nom = un dels noms amb què el nen ha escrit (max). Nens amagats inclosos (com la resta
--      del tauler).
--
--  · public.bn_admin_rep_pendents(correu, contrasenya, assig = null) → jsonb: una LLISTA (no un objecte)
--      [{"assig", "tid", "n", "nens", "avui", "preguntes": [{"q", "n"}]}]
--    D'ON SURT: estat.rep de bn_priv.progres ({clau: {tid, q, c, prox}}), l'estat d'ARA dels nens amb PIN (no un historial).
--    L'ESTAT L'ESCRIU EL NAVEGADOR: no és de fiar. Es mira el tipus de cada peça: un estat o un rep que no són objectes no
--    aporten res, les entrades que no són objectes es deixen fora, i dins de cada entrada tid (text o número; fins a 100 caràcters),
--    q (text; fins a 300) i prox ('AAAA-MM-DD') que no quadren surten null. Mai peta.
--    Agrupat per assig i tid: n = errors pendents, nens = nens diferents, avui = errors amb prox ≤ la data UTC d'avui (com el repàs
--    del joc: avui() fa toISOString), preguntes = les 5 q més repetides ({q, n}, per n desc i q). Les entrades sense tid (p. ex. els
--    errors d'«err_gen» dels jocs generats) van a tid null. Ordenat per n desc (i nens desc, assig, tid). Fins a 300 files.
--    Nens amagats i sense perfil inclosos (és per a l'admin), però sense cap nom: només comptes.

create index if not exists bn_log_nom on public.bn_log((lower(trim(nom))));   -- la base de cada nen (ja hi és a producció)

-- ---------- M3 · estrelles de cada font per dia (diferències entre registres) ----------
create or replace function public.bn_admin_fonts_dia(p_email text, p_pass text, p_periode text default '30d',
                                                     p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_per text := coalesce(p_periode, '30d');
  v_assig text := nullif(p_assig, '');
  v_kk text := nullif(lower(trim(coalesce(p_nom, ''))), '');
  v_fins timestamptz := now() + interval '1 minute';
  v_d0 timestamptz;      -- inici del període: la mitjanit (Madrid) del primer dia
  v_dies jsonb;
  v_total jsonb;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  v_d0 := date_trunc('day', bn_priv.desde(v_per) at time zone 'Europe/Madrid') at time zone 'Europe/Madrid';

  with
  p as (    -- registres del període que porten fonts (un objecte), del món i del nen triats si n'hi ha
    select x.id, x.ts, x.assig, lower(trim(x.nom)) k, x.nom, x.detall -> 'fonts' fo
    from public.bn_log x
    where x.ts >= v_d0 and x.ts < v_fins
      and (v_assig is null or x.assig = v_assig)
      and (v_kk is null or lower(trim(x.nom)) = v_kk)
      and jsonb_typeof(x.detall -> 'fonts') = 'object'
  ),
  km as (   -- cada nen i món del període, amb els seus reinicis (el del món i el de tots: la clau és (k, assig), un de cada)
    select z.k, z.assig,
           (select r.ts from bn_priv.reinicis r where r.k = z.k and r.assig = z.assig) ra,
           (select r.ts from bn_priv.reinicis r where r.k = z.k and r.assig = '*') rt
    from (select distinct p.k, p.assig from p) z
  ),
  b as (    -- la base: l'últim registre amb fonts d'abans del període, per nen i món
    select y.id, y.ts, y.assig, km.k, y.nom, y.fo
    from km
    cross join lateral (
      select x.id, x.ts, x.assig, x.nom, x.detall -> 'fonts' fo
      from public.bn_log x
      where lower(trim(x.nom)) = km.k and x.assig = km.assig and x.ts < v_d0
        and jsonb_typeof(x.detall -> 'fonts') = 'object'
      order by x.ts desc, x.id desc
      limit 1) y
  ),
  s as (    -- tram de cada registre (quants reinicis té al darrere) i el seu ordre dins el tram (1 = la base)
    select t.*, row_number() over (partition by t.k, t.assig, t.tram order by t.ts, t.id) n
    from (select r.*, (case when km.ra <= r.ts then 1 else 0 end) + (case when km.rt <= r.ts then 1 else 0 end) tram
          from (select * from p union all select * from b) r
          join km on km.k = r.k and km.assig = r.assig) t
  ),
  v as (    -- un valor per font: claus amb forma de nom i valors amb xifres (la resta, null)
    select s.id, s.ts, s.k, s.assig, s.tram, s.n, e.key clau,
           case when jsonb_typeof(e.value) in ('number', 'string') and (e.value #>> '{}') ~ '^[0-9]{1,9}(\.[0-9]+)?$'
                then (e.value #>> '{}')::numeric end val
    from s
    cross join lateral jsonb_each(s.fo) e
    where e.key ~ '^[a-z][a-z0-9_]{0,23}$'
  ),
  i as (    -- increment: el que passa del màxim d'abans dins el tram (0 si no n'hi havia); la base no compta
    select w.ts, w.k, w.assig, w.clau,
           case when w.n = 1 then 0 else greatest(0, w.val - coalesce(w.abans, 0)) end inc
    from (select v.*, max(v.val) over (partition by v.k, v.assig, v.tram, v.clau order by v.ts, v.id
                                       rows between unbounded preceding and 1 preceding) abans
          from v where v.val is not null) w
  ),
  d as (    -- per dia de Madrid, nen, món i font: només el període i només el que suma
    select (i.ts at time zone 'Europe/Madrid')::date dia, i.k, i.assig, i.clau, sum(i.inc) n
    from i
    where i.ts >= v_d0 and i.inc > 0
    group by 1, 2, 3, 4
  ),
  f as (select d.dia, d.k, d.assig, jsonb_object_agg(d.clau, d.n) f from d group by d.dia, d.k, d.assig),
  nm as (select p.k, max(p.nom) nom from p group by p.k)
  select coalesce((select jsonb_agg(jsonb_build_object('dia', z.dia, 'k', z.k, 'nom', nm.nom, 'assig', z.assig, 'f', z.f)
                                    order by z.dia, z.k, z.assig)
                   from (select f.*, count(*) over (order by f.dia desc) acum from f) z   -- files fins al final d'aquell dia
                   join nm on nm.k = z.k
                   where z.acum <= 5000), '[]'::jsonb),
         coalesce((select jsonb_object_agg(t.clau, t.n) from (select d.clau, sum(d.n) n from d group by d.clau) t), '{}'::jsonb)
    into v_dies, v_total;

  return jsonb_build_object('periode', v_per, 'dies', v_dies, 'total', v_total);
end $$;

-- ---------- M4 · errors pendents de repàs de tota la colla, per món i tema ----------
create or replace function public.bn_admin_rep_pendents(p_email text, p_pass text, p_assig text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_assig text := nullif(p_assig, '');
  v_avui text := to_char(now() at time zone 'UTC', 'YYYY-MM-DD');   -- avui segons el joc (UTC), no segons Madrid
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((
    with
    e as (    -- un error pendent per fila (només les entrades que són objectes), amb cada peça comprovada
      select g.k, g.assig,
             case when jsonb_typeof(x.value -> 'tid') in ('string', 'number') then left(x.value ->> 'tid', 100) end tid,
             case when jsonb_typeof(x.value -> 'q') = 'string' then left(x.value ->> 'q', 300) end q,
             case when jsonb_typeof(x.value -> 'prox') = 'string' and (x.value ->> 'prox') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
                  then x.value ->> 'prox' end prox
      from bn_priv.progres g
      cross join lateral jsonb_each(case when jsonb_typeof(g.estat) = 'object' and jsonb_typeof(g.estat -> 'rep') = 'object'
                                         then g.estat -> 'rep' else '{}'::jsonb end) x
      where (v_assig is null or g.assig = v_assig) and jsonb_typeof(x.value) = 'object'
    ),
    t as (
      select e.assig, e.tid, count(*)::int n, count(distinct e.k)::int nens,
             count(*) filter (where e.prox <= v_avui)::int avui
      from e
      group by e.assig, e.tid
      order by n desc, nens desc, e.assig, e.tid nulls last
      limit 300
    )
    select jsonb_agg(jsonb_build_object(
             'assig', t.assig, 'tid', t.tid, 'n', t.n, 'nens', t.nens, 'avui', t.avui,
             'preguntes', coalesce((select jsonb_agg(jsonb_build_object('q', w.q, 'n', w.n) order by w.n desc, w.q)
                                    from (select e.q, count(*)::int n from e
                                          where e.assig = t.assig and e.tid is not distinct from t.tid and e.q is not null
                                          group by e.q order by n desc, e.q limit 5) w), '[]'::jsonb))
           order by t.n desc, t.nens desc, t.assig, t.tid nulls last)
    from t), '[]'::jsonb);
end $$;

-- ---------- permisos: només funcionen amb el correu i la contrasenya de l'admin ----------
revoke all on function public.bn_admin_fonts_dia(text,text,text,text,text) from public;
grant execute on function public.bn_admin_fonts_dia(text,text,text,text,text) to anon, authenticated;
revoke all on function public.bn_admin_rep_pendents(text,text,text) from public;
grant execute on function public.bn_admin_rep_pendents(text,text,text) to anon, authenticated;
