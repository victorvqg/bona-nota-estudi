-- Bona Nota · l'admin pot canviar el nom d'un nen o esborrar-ne tot el registre.
-- Comprova correu + contrasenya igual que bn_admin_logs. Executar una vegada al SQL Editor de Supabase.
create or replace function public.bn_admin_usuari(p_email text, p_pass text, p_nom text, p_accio text, p_nou text default null)
returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
  if p_accio = 'esborra' then
    delete from public.bn_log l where lower(trim(l.nom)) = lower(trim(p_nom));
  elsif p_accio = 'canvia' then
    if p_nou is null or char_length(trim(p_nou)) not between 1 and 40 then
      raise exception 'nom nou no valid';
    end if;
    update public.bn_log l set nom = trim(p_nou) where lower(trim(l.nom)) = lower(trim(p_nom));
  else
    raise exception 'accio desconeguda';
  end if;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.bn_admin_usuari(text,text,text,text,text) from public;
grant execute on function public.bn_admin_usuari(text,text,text,text,text) to anon, authenticated;
