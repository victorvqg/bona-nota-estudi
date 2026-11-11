-- Bona Nota · aspecte del nen (n2497): animal, perfil arcade i estil que tria a /perfil/
--   · bn_priv.perfils: columnes aspecte (jsonb {av, sk, v}) i aspecte_ts
--   · bn_aspecte_desa(nom, pin, aspecte): comprova el PIN (bn_priv.pin_ok, amb el mateix bloqueig de 15 min),
--     neteja l'objecte (només av, sk i v, amb lletres i mides controlades) i el desa al perfil del nen
--   · bn_aspectes(): (nom, aspecte) de tots els nens que n'han triat un; lectura pública (és el que es veu al rànquing),
--     sense els noms amagats per l'admin ni els noms no permesos
-- Idempotent: es pot executar tantes vegades com calgui a l'editor SQL del projecte bonanota (agippwtqvhpxdockuigl).
-- Sense aquest SQL la web funciona igual: la tria queda a l'aparell i es puja sola quan les funcions existeixen.

alter table bn_priv.perfils add column if not exists aspecte jsonb;
alter table bn_priv.perfils add column if not exists aspecte_ts timestamptz;

create or replace function public.bn_aspecte_desa(p_nom text, p_pin text, p_aspecte jsonb)
 returns text language plpgsql security definer set search_path to ''
as $function$
declare a jsonb := '{}'::jsonb; t text;
begin
  -- sense raise quan pin_ok torna false: així l'intent fallit es conserva a bn_priv.intents (issue #33)
  if not bn_priv.pin_ok(p_nom, p_pin) then return 'pin'; end if;
  if jsonb_typeof(p_aspecte) = 'object' then
    t := p_aspecte->>'av'; if t ~ '^[a-z0-9_]{1,24}$' then a := a || jsonb_build_object('av', t); end if;
    t := p_aspecte->>'sk'; if t ~ '^[a-z0-9_]{1,24}$' then a := a || jsonb_build_object('sk', t); end if;
    t := p_aspecte->>'v';  if t in ('A','B') then a := a || jsonb_build_object('v', t); end if;
  end if;
  update bn_priv.perfils p set aspecte = a, aspecte_ts = now() where p.k = lower(trim(p_nom));
  return 'ok';
end $function$;
revoke all on function public.bn_aspecte_desa(text,text,jsonb) from public;
grant execute on function public.bn_aspecte_desa(text,text,jsonb) to anon, authenticated;

create or replace function public.bn_aspectes()
returns table(nom text, aspecte jsonb)
language sql stable security definer set search_path = '' as $$
  select p.nom, p.aspecte
  from bn_priv.perfils p
  where p.aspecte is not null and p.aspecte <> '{}'::jsonb
    and not exists (select 1 from bn_priv.amagats a where a.k = p.k)
    and not bn_priv.nom_prohibit(p.nom)
  limit 500
$$;
revoke all on function public.bn_aspectes() from public;
grant execute on function public.bn_aspectes() to anon, authenticated;
