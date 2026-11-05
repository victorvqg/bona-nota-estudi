-- Bona Nota · correcció de la foto del quadern (Edge Function «bn-corregeix», a supabase/functions/bn-corregeix/)
-- Executar una vegada al SQL Editor de Supabase. Necessita bn_pin_nou.sql (bn_priv.pin_ok).
--
-- La foto NO es desa enlloc. Aquí només es compta QUANTES fotos envia cada nom cada dia, per al límit.
--
-- · public.bn_fotos: una fila per nom i dia, amb el nombre de fotos (n). Ningú hi pot entrar des del navegador.
-- · public.bn_foto_permis(nom, pin, max_nom, max_total): comprova nom + PIN i, si tot va bé, compta la foto.
--     Ho fa tot d'un cop: dues fotos que arriben alhora no es poden saltar el límit.
--     Torna json {ok, motiu, queden, max}. Valors de «motiu» quan ok = false:
--       'pin'         nom o PIN incorrectes (compta com un intent de PIN, igual que a l'app)
--       'bloquejat'   massa intents de PIN: el nom està bloquejat 15 minuts
--       'limit'       aquest nom ja ha enviat avui el màxim de fotos (max = fotos per dia)
--       'limit_total' entre tots els nens ja s'ha arribat avui al màxim de l'app (max = total per dia)
-- · public.bn_foto_torna(nom): torna enrere l'última foto d'avui d'aquest nom quan Claude no l'ha pogut corregir
--     (per exemple, si el servei de Claude no respon). Així el nen no perd fotos per culpa d'un error nostre.
-- Les dues funcions només les pot cridar el servidor (service_role), mai els nens (anon) ni cap usuari.
-- El dia es compta a l'hora de Catalunya (Europe/Madrid).

create table if not exists public.bn_fotos(
  nom text not null check (char_length(nom) between 1 and 40),
  dia date not null,
  n int not null default 0 check (n >= 0),
  primary key (nom, dia)
);
alter table public.bn_fotos enable row level security;
-- sense cap política: amb RLS activat i sense permisos, anon i authenticated no hi poden llegir ni escriure
revoke all on public.bn_fotos from public, anon, authenticated;

create or replace function public.bn_foto_permis(p_nom text, p_pin text, p_max_nom int default 10, p_max_total int default 200)
returns json language plpgsql security definer set search_path to '' as $$
declare
  kk   text := lower(trim(coalesce(p_nom, '')));
  avui date := (now() at time zone 'Europe/Madrid')::date;
  mx   int  := greatest(coalesce(p_max_nom, 10), 1);
  mt   int  := greatest(coalesce(p_max_total, 200), 1);
  meu  int;
  tot  int;
begin
  if kk = '' or char_length(kk) > 40 then
    return json_build_object('ok', false, 'motiu', 'pin');
  end if;

  -- 1) nom + PIN (la mateixa comprovació que l'app: bcrypt, i 5 errors en 15 minuts bloquegen el nom)
  begin
    if not coalesce(bn_priv.pin_ok(p_nom, p_pin), false) then
      return json_build_object('ok', false, 'motiu', 'pin');
    end if;
  exception when sqlstate '28000' then
    return json_build_object('ok', false, 'motiu', 'bloquejat');
  end;

  -- 2) límit del dia. Un sol comptador alhora: dues peticions juntes no es poden saltar el límit.
  perform pg_advisory_xact_lock(hashtext('bn_fotos'));
  delete from public.bn_fotos f where f.dia < avui - 120;   -- no cal guardar-ho més temps
  select coalesce(sum(f.n), 0) into tot from public.bn_fotos f where f.dia = avui;
  select f.n into meu from public.bn_fotos f where f.nom = kk and f.dia = avui;
  if coalesce(meu, 0) >= mx then
    return json_build_object('ok', false, 'motiu', 'limit', 'max', mx);
  end if;
  if tot >= mt then
    return json_build_object('ok', false, 'motiu', 'limit_total', 'max', mt);
  end if;

  -- 3) compta la foto
  insert into public.bn_fotos as f (nom, dia, n) values (kk, avui, 1)
    on conflict (nom, dia) do update set n = f.n + 1
    returning f.n into meu;
  return json_build_object('ok', true, 'queden', greatest(mx - meu, 0), 'max', mx);
end $$;

create or replace function public.bn_foto_torna(p_nom text)
returns void language sql security definer set search_path to '' as $$
  update public.bn_fotos f set n = f.n - 1
   where f.nom = lower(trim(coalesce(p_nom, '')))
     and f.dia = (now() at time zone 'Europe/Madrid')::date
     and f.n > 0;
$$;

-- permisos: només el servidor (la Edge Function, amb la clau de servei)
revoke all on function public.bn_foto_permis(text, text, int, int) from public, anon, authenticated;
grant execute on function public.bn_foto_permis(text, text, int, int) to service_role;
revoke all on function public.bn_foto_torna(text) from public, anon, authenticated;
grant execute on function public.bn_foto_torna(text) to service_role;

-- Per veure quantes fotos s'han enviat (SQL Editor):
-- select dia, sum(n) as fotos, count(*) as nens from public.bn_fotos group by dia order by dia desc;
