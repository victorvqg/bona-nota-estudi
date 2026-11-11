-- Bona Nota · l'admin pot canviar el nom d'un nen o esborrar-ne tot el registre (i xat/silenci si hi són).
-- Comprova correu + contrasenya igual que bn_admin_logs. Executar una vegada al SQL Editor de Supabase.
create or replace function public.bn_admin_usuari(p_email text, p_pass text, p_nom text, p_accio text, p_nou text default null)
returns int
language plpgsql security definer set search_path = '' as $$
declare n int; kk text := lower(trim(coalesce(p_nom, ''))); kn text := lower(trim(coalesce(p_nou, ''))); nn text := trim(coalesce(p_nou, ''));
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
  if p_accio = 'esborra' then
    delete from public.bn_log l where lower(trim(l.nom)) = kk;
    get diagnostics n = row_count;
    if to_regclass('bn_priv.perfils') is not null then delete from bn_priv.perfils p where p.k = kk; end if;
    if to_regclass('bn_priv.progres') is not null then delete from bn_priv.progres g where g.k = kk; end if;
    return n;
  elsif p_accio = 'canvia' then
    if p_nou is null or char_length(nn) not between 1 and 40 then
      raise exception 'nom nou no valid';
    end if;
    update public.bn_log l set nom = nn where lower(trim(l.nom)) = kk;
    get diagnostics n = row_count;
    if to_regclass('bn_priv.perfils') is not null then
      update bn_priv.perfils p set k = kn, nom = nn where p.k = kk
        and not exists (select 1 from bn_priv.perfils q where q.k = kn);
    end if;
    if to_regclass('bn_priv.progres') is not null then
      update bn_priv.progres g set k = kn where g.k = kk
        and not exists (select 1 from bn_priv.progres q where q.k = kn and q.assig = g.assig);
    end if;
    if to_regclass('bn_priv.xat_msg') is not null then
      update bn_priv.xat_msg m set k = kn, nom = nn where m.k = kk;
      update bn_priv.xat_msg m set company = nn where m.company is not null and lower(trim(m.company)) = kk;
      delete from bn_priv.xat_vots v where v.k = kk and exists (select 1 from bn_priv.xat_vots q where q.msg = v.msg and q.k = kn);
      update bn_priv.xat_vots v set k = kn where v.k = kk;
      update bn_priv.xat_silenci s set k = kn where s.k = kk and not exists (select 1 from bn_priv.xat_silenci q where q.k = kn);
      delete from bn_priv.xat_silenci s where s.k = kk;
    end if;
    return n;
  elsif p_accio = 'amaga' then
    insert into bn_priv.amagats(k) values (kk) on conflict do nothing;
  elsif p_accio = 'mostra' then
    delete from bn_priv.amagats a where a.k = kk;
  elsif p_accio = 'treupin' then
    if to_regclass('bn_priv.perfils') is not null then delete from bn_priv.perfils p where p.k = kk; end if;
    if to_regclass('bn_priv.intents') is not null then delete from bn_priv.intents i where i.k = kk; end if;
  elsif p_accio = 'estat' then
    return (case when exists (select 1 from bn_priv.amagats a where a.k = kk) then 1 else 0 end)
         + (case when to_regclass('bn_priv.perfils') is not null and exists (select 1 from bn_priv.perfils p where p.k = kk) then 2 else 0 end)
         + (case when to_regclass('bn_priv.perfils') is not null and exists (select 1 from bn_priv.perfils p where p.k = kk and p.pin_v = 2) then 4 else 0 end);
  else
    raise exception 'accio desconeguda';
  end if;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.bn_admin_usuari(text,text,text,text,text) from public;
grant execute on function public.bn_admin_usuari(text,text,text,text,text) to anon, authenticated;
