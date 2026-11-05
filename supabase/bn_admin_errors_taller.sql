-- Bona Nota · tauler d'admin: «✏️ Taller de mates: on s'equivoquen»
-- Executar una vegada al SQL Editor de Supabase, DESPRÉS de bn_admin_tauler.sql (fa servir bn_priv.admin_ok,
-- bn_priv.desde i bn_priv.logs). Com les altres funcions del tauler, demana el correu i la contrasenya d'admin
-- i torna les dades JA AGREGADES (el navegador no rep el registre cru).
--
-- Paràmetres (els mateixos que les funcions de bn_admin_tauler.sql):
--   p_email, p_pass
--   p_periode  'avui' | '7d' | '30d' | 'curs'   (curs = des de l'1 de setembre)
--   p_assig    id del món (divisibilitat…) o null = tots
--   p_nom      nom del nen o null = tots
--
-- D'on surten les dades: el Taller de mates (motor/eines/exercicis-mates.js) afegeix al «detall» dels events
-- «joc» i «examen» el camp  "ep": ["gen|pas|codi", …]  amb una entrada per cada resposta equivocada:
--   gen  = generador de l'exercici (escala, mcmmcd, problema, criteri, divisors, multiples, primer, divisio…)
--   pas  = pas de l'exercici on s'ha equivocat (primer, quocient, exp, factors, calcul, dades, tria…)
--   codi = error típic detectat, o «-» si no és cap dels coneguts
-- (també porta «nivell», «mode» i «pasos», que aquí no es fan servir). Els registres antics no porten «ep».
--
-- Torna un json: [{gen, pas, codi, n, nens}, …]  ordenat per n (vegades) de més a menys, com a màxim 30 files.
--   n    = quantes vegades s'ha fet aquest error
--   nens = quants nens diferents l'han fet

create or replace function public.bn_admin_errors_taller(p_email text, p_pass text, p_periode text default 'curs', p_assig text default null, p_nom text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(x order by x.n desc, x.nens desc, x.gen, x.pas, x.codi) from (
    select left(split_part(e, '|', 1), 40) as gen,
           coalesce(nullif(left(split_part(e, '|', 2), 40), ''), '-') as pas,
           coalesce(nullif(left(split_part(e, '|', 3), 40), ''), '-') as codi,
           count(*) as n,
           count(distinct lower(trim(l.nom))) as nens
    from bn_priv.logs(bn_priv.desde(p_periode), now() + interval '1 minute', p_assig, p_nom) l,
         jsonb_array_elements_text(case when jsonb_typeof(l.detall->'ep') = 'array' then l.detall->'ep' else '[]'::jsonb end) e
    where l.event in ('joc', 'examen') and e like '%|%' and split_part(e, '|', 1) <> ''
    group by 1, 2, 3
    order by count(*) desc, count(distinct lower(trim(l.nom))) desc
    limit 30) x), '[]'::jsonb);
end $$;

-- permisos: com les altres del tauler (només funciona amb el correu i la contrasenya de l'admin)
revoke all on function public.bn_admin_errors_taller(text,text,text,text,text) from public;
grant execute on function public.bn_admin_errors_taller(text,text,text,text,text) to anon, authenticated;
