-- Bona Nota · registre d'activitat per al panell /admin
-- Els nens només poden INSERIR registres; ningú no els pot llegir excepte
-- la funció bn_admin_logs(), que comprova correu + contrasenya (xifrada amb bcrypt).
-- La contrasenya NO es desa aquí: s'afegeix a part (vegeu el final).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.bn_log(
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  assig text not null check (char_length(assig) <= 40),
  nom text not null check (char_length(nom) between 1 and 40),
  sessio text not null check (char_length(sessio) <= 40),
  aparell text not null check (char_length(aparell) <= 40),
  event text not null check (event in ('entra','fitxa','targetes','test','joc','examen','oberta','valora','temps')),
  detall jsonb not null default '{}'::jsonb check (pg_column_size(detall) <= 2000)
);
create index if not exists bn_log_ts on public.bn_log(ts desc);
alter table public.bn_log enable row level security;
drop policy if exists bn_log_insert on public.bn_log;
create policy bn_log_insert on public.bn_log for insert to anon, authenticated with check (true);
revoke all on public.bn_log from anon, authenticated;
grant insert on public.bn_log to anon, authenticated;

create schema if not exists bn_priv;
revoke all on schema bn_priv from public, anon, authenticated;
create table if not exists bn_priv.admin(email text not null, hash text primary key);
revoke all on bn_priv.admin from public, anon, authenticated;

create or replace function public.bn_admin_logs(p_email text, p_pass text, p_dies int default 30)
returns setof public.bn_log
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from bn_priv.admin a
                 where a.email = lower(trim(p_email)) and a.hash = extensions.crypt(p_pass, a.hash)) then
    perform pg_sleep(1.5);
    raise exception 'acces denegat' using errcode = '28000';
  end if;
  return query select * from public.bn_log l
    where l.ts > now() - make_interval(days => least(greatest(p_dies,1),365))
    order by l.ts desc limit 20000;
end $$;
revoke all on function public.bn_admin_logs(text,text,int) from public;
grant execute on function public.bn_admin_logs(text,text,int) to anon, authenticated;

-- Contrasenya de l'admin (executar a part, posant-hi la contrasenya; no la deixis en cap fitxer):
-- insert into bn_priv.admin(email, hash)
-- values ('victorvqg@gmail.com', extensions.crypt('LA_TEVA_CONTRASENYA', extensions.gen_salt('bf')))
-- (per canviar-la: delete from bn_priv.admin; i torna a fer l insert)
