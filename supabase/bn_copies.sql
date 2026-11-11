-- Bona Nota · CÒPIES DE SEGURETAT de les dades de Bona Nota, gestionables des de l'admin (n2429).
-- Executar UNA vegada al SQL Editor del projecte «bonanota» (es pot tornar a executar: tot és «if not exists» / «create or replace»).
--
-- Què guarda cada còpia: el registre d'activitat (bn_log), els perfils (nom + PIN xifrat), el progrés al núvol, els noms amagats,
-- la configuració i els reinicis. NO guarda els administradors (així restaurar una còpia mai no et deixa fora del panell).
--
-- Quan se'n fan:
--  · automàtica: cada nit a les 3:00 (hora d'aquí) amb pg_cron;
--  · abans d'esborrar o canviar: just abans que l'admin esborri un nen, li esborri el progrés, li tregui el PIN o li canviï el nom
--    (triggers de sentència a bn_log, perfils i progres; una sola còpia per operació);
--  · manual: amb el botó «Fes una còpia ara» de l'admin;
--  · abans de restaurar: restaurar una còpia sempre en fa una abans de l'estat actual (així es pot desfer).
-- Quant temps es guarden: les automàtiques 30 dies; les altres 90 dies.
--
-- Funcions per a l'admin (comproven correu + contrasenya com la resta: bn_priv.admin_ok):
--   bn_admin_copies(correu, contrasenya)                → llista (sense les dades)
--   bn_admin_copia_fes(correu, contrasenya)             → fa una còpia manual i en torna l'id
--   bn_admin_copia_baixa(correu, contrasenya, id)       → la còpia sencera (JSON) per descarregar-la
--   bn_admin_copia_restaura(correu, contrasenya, id)    → torna les dades a com eren en aquella còpia
--   bn_admin_copia_esborra(correu, contrasenya, id)     → esborra una còpia

create table if not exists bn_priv.copies(
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  motiu text not null,
  files jsonb not null,
  mida int not null,
  dades jsonb not null
);
alter table bn_priv.copies enable row level security;
create index if not exists copies_ts on bn_priv.copies (ts desc);

-- fa una còpia de totes les dades de Bona Nota (menys els administradors) i aplica la retenció
create or replace function bn_priv.fes_copia(p_motiu text)
returns bigint
language plpgsql security definer set search_path = '' as $$
declare d jsonb; f jsonb; nid bigint;
begin
  d := jsonb_build_object(
    'versio', 2,
    'bn_log',   (select coalesce(jsonb_agg(to_jsonb(x) order by x.id), '[]') from public.bn_log x),
    'perfils',  (select coalesce(jsonb_agg(to_jsonb(x) order by x.k), '[]') from bn_priv.perfils x),
    'progres',  (select coalesce(jsonb_agg(to_jsonb(x) order by x.k, x.assig), '[]') from bn_priv.progres x),
    'amagats',  (select coalesce(jsonb_agg(to_jsonb(x) order by x.k), '[]') from bn_priv.amagats x),
    'config',   (select coalesce(jsonb_agg(to_jsonb(x) order by x.clau), '[]') from bn_priv.config x),
    'reinicis', (select coalesce(jsonb_agg(to_jsonb(x) order by x.k, x.assig), '[]') from bn_priv.reinicis x));
  if to_regclass('bn_priv.xat_msg') is not null then
    d := d || jsonb_build_object(
      'xat_frases',  (select coalesce(jsonb_agg(to_jsonb(x) order by x.id), '[]') from bn_priv.xat_frases x),
      'xat_peces',   (select coalesce(jsonb_agg(to_jsonb(x) order by x.id), '[]') from bn_priv.xat_peces x),
      'xat_msg',     (select coalesce(jsonb_agg(to_jsonb(x) order by x.id), '[]') from bn_priv.xat_msg x),
      'xat_vots',    (select coalesce(jsonb_agg(to_jsonb(x) order by x.msg, x.k), '[]') from bn_priv.xat_vots x),
      'xat_silenci', (select coalesce(jsonb_agg(to_jsonb(x) order by x.k), '[]') from bn_priv.xat_silenci x));
  end if;
  f := jsonb_build_object('bn_log', jsonb_array_length(d->'bn_log'), 'perfils', jsonb_array_length(d->'perfils'),
                          'progres', jsonb_array_length(d->'progres'), 'amagats', jsonb_array_length(d->'amagats'),
                          'config', jsonb_array_length(d->'config'), 'reinicis', jsonb_array_length(d->'reinicis'));
  if d ? 'xat_msg' then
    f := f || jsonb_build_object('xat_msg', jsonb_array_length(d->'xat_msg'), 'xat_vots', jsonb_array_length(d->'xat_vots'),
                                 'xat_silenci', jsonb_array_length(d->'xat_silenci'));
  end if;
  insert into bn_priv.copies(motiu, files, mida, dades)
  values (left(coalesce(p_motiu, 'manual'), 80), f, octet_length(d::text), d)
  returning id into nid;
  delete from bn_priv.copies c
   where (c.motiu = 'automàtica' and c.ts < now() - interval '30 days') or c.ts < now() - interval '90 days';
  return nid;
end $$;
revoke all on function bn_priv.fes_copia(text) from public, anon, authenticated;

-- trigger: una còpia just abans que l'admin esborri o canviï dades (una sola per operació/transacció)
create or replace function bn_priv.copia_abans()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(current_setting('bn.copia_tx', true), '') = txid_current()::text then return null; end if;
  perform set_config('bn.copia_tx', txid_current()::text, true);
  perform bn_priv.fes_copia(case when tg_op = 'UPDATE' then 'abans de canviar' else 'abans d''esborrar' end);
  return null;
end $$;
revoke all on function bn_priv.copia_abans() from public, anon, authenticated;
drop trigger if exists bn_copia_abans on public.bn_log;
create trigger bn_copia_abans before delete or update on public.bn_log for each statement execute function bn_priv.copia_abans();
drop trigger if exists bn_copia_abans on bn_priv.perfils;
create trigger bn_copia_abans before delete on bn_priv.perfils for each statement execute function bn_priv.copia_abans();
drop trigger if exists bn_copia_abans on bn_priv.progres;
create trigger bn_copia_abans before delete on bn_priv.progres for each statement execute function bn_priv.copia_abans();

-- llista de còpies (sense les dades)
create or replace function public.bn_admin_copies(p_email text, p_pass text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'ts', c.ts, 'motiu', c.motiu, 'files', c.files, 'mida', c.mida) order by c.ts desc), '[]')
          from bn_priv.copies c);
end $$;

create or replace function public.bn_admin_copia_fes(p_email text, p_pass text)
returns bigint
language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return bn_priv.fes_copia('manual');
end $$;

create or replace function public.bn_admin_copia_baixa(p_email text, p_pass text, p_id bigint)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r bn_priv.copies;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  select * into r from bn_priv.copies c where c.id = p_id;
  if not found then raise exception 'no existeix' using errcode = 'P0002'; end if;
  return jsonb_build_object('app', 'Bona Nota', 'copia', r.id, 'ts', r.ts, 'motiu', r.motiu, 'files', r.files, 'dades', r.dades);
end $$;

create or replace function public.bn_admin_copia_esborra(p_email text, p_pass text, p_id bigint)
returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  delete from bn_priv.copies c where c.id = p_id;
  get diagnostics n = row_count;
  return n;
end $$;

-- restaurar: primer una còpia de l'estat actual («abans de restaurar»), després es buiden les taules i es tornen a omplir
-- amb la còpia. Els triggers del registre (bn_log_net, bn_log_reinici) no s'apliquen: les dades es tornen tal com eren.
create or replace function public.bn_admin_copia_restaura(p_email text, p_pass text, p_id bigint)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d jsonb; abans bigint;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  select c.dades into d from bn_priv.copies c where c.id = p_id;
  if d is null then raise exception 'no existeix' using errcode = 'P0002'; end if;
  abans := bn_priv.fes_copia('abans de restaurar la #' || p_id);
  perform set_config('bn.copia_tx', txid_current()::text, true); -- que els triggers de còpia no en facin una altra
  alter table public.bn_log disable trigger user;
  delete from public.bn_log;
  insert into public.bn_log overriding system value select * from jsonb_populate_recordset(null::public.bn_log, d->'bn_log');
  alter table public.bn_log enable trigger user;
  delete from bn_priv.perfils;
  insert into bn_priv.perfils overriding system value select * from jsonb_populate_recordset(null::bn_priv.perfils, d->'perfils');
  delete from bn_priv.progres;
  insert into bn_priv.progres select * from jsonb_populate_recordset(null::bn_priv.progres, d->'progres');
  delete from bn_priv.amagats;
  insert into bn_priv.amagats select * from jsonb_populate_recordset(null::bn_priv.amagats, d->'amagats');
  delete from bn_priv.config;
  insert into bn_priv.config select * from jsonb_populate_recordset(null::bn_priv.config, d->'config');
  delete from bn_priv.reinicis;
  insert into bn_priv.reinicis select * from jsonb_populate_recordset(null::bn_priv.reinicis, d->'reinicis');
  if to_regclass('bn_priv.xat_msg') is not null and jsonb_typeof(d->'xat_msg') = 'array' then
    delete from bn_priv.xat_vots;
    delete from bn_priv.xat_msg;
    delete from bn_priv.xat_silenci;
    if jsonb_typeof(d->'xat_frases') = 'array' and jsonb_array_length(d->'xat_frases') > 0 then
      delete from bn_priv.xat_peces;
      delete from bn_priv.xat_frases;
      insert into bn_priv.xat_frases select * from jsonb_populate_recordset(null::bn_priv.xat_frases, d->'xat_frases');
      insert into bn_priv.xat_peces select * from jsonb_populate_recordset(null::bn_priv.xat_peces, d->'xat_peces');
    end if;
    insert into bn_priv.xat_msg overriding system value select * from jsonb_populate_recordset(null::bn_priv.xat_msg, d->'xat_msg');
    if jsonb_typeof(d->'xat_vots') = 'array' then
      insert into bn_priv.xat_vots select * from jsonb_populate_recordset(null::bn_priv.xat_vots, d->'xat_vots');
    end if;
    if jsonb_typeof(d->'xat_silenci') = 'array' then
      insert into bn_priv.xat_silenci select * from jsonb_populate_recordset(null::bn_priv.xat_silenci, d->'xat_silenci');
    end if;
    perform setval(pg_get_serial_sequence('bn_priv.xat_msg', 'id'), coalesce((select max(m.id) from bn_priv.xat_msg m), 0) + 1, false);
  end if;
  perform setval(pg_get_serial_sequence('public.bn_log', 'id'), greatest(coalesce((select max(l.id) from public.bn_log l), 0), (select last_value from public.bn_log_id_seq)) + 1, false);
  perform setval(pg_get_serial_sequence('bn_priv.perfils', 'id'), coalesce((select max(p.id) from bn_priv.perfils p), 0) + 1, false);
  return jsonb_build_object('restaurada', p_id, 'copia_abans', abans,
    'bn_log', jsonb_array_length(d->'bn_log'), 'perfils', jsonb_array_length(d->'perfils'), 'progres', jsonb_array_length(d->'progres'));
end $$;

revoke all on function public.bn_admin_copies(text, text) from public;
revoke all on function public.bn_admin_copia_fes(text, text) from public;
revoke all on function public.bn_admin_copia_baixa(text, text, bigint) from public;
revoke all on function public.bn_admin_copia_esborra(text, text, bigint) from public;
revoke all on function public.bn_admin_copia_restaura(text, text, bigint) from public;
grant execute on function public.bn_admin_copies(text, text) to anon, authenticated, service_role;
grant execute on function public.bn_admin_copia_fes(text, text) to anon, authenticated, service_role;
grant execute on function public.bn_admin_copia_baixa(text, text, bigint) to anon, authenticated, service_role;
grant execute on function public.bn_admin_copia_esborra(text, text, bigint) to anon, authenticated, service_role;
grant execute on function public.bn_admin_copia_restaura(text, text, bigint) to anon, authenticated, service_role;

-- còpia automàtica cada nit: 2:00 UTC = 3:00 a l'hivern (4:00 a l'estiu)
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('bn-copia-diaria', '0 2 * * *', $$select bn_priv.fes_copia('automàtica')$$);

-- la primera còpia, ara mateix
select bn_priv.fes_copia('manual');
