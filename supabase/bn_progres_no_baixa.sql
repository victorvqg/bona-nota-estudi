-- Bona Nota · el progrés desat al núvol no pot baixar d'estrelles (n2522, 9 nov 2026).
-- Executar UNA vegada al projecte Supabase «bonanota» (agippwtqvhpxdockuigl). Es pot tornar a executar («create or replace»).
--
-- Què passava: un aparell amb el progrés vell (p. ex. 71 ⭐ a Català) obria el món amb el nen ja actiu, no baixava el núvol
-- (366 ⭐) i, en jugar, hi desava els seus 71 amb l'hora d'ara. bn_progres_desa es quedava sempre amb el desat més recent
-- (mod), i el núvol passava de 366 a 71. El rànquing (màxim del registre) continuava dient 366: no quadrava amb el món.
--
-- Ara: si el núvol ja té MÉS estrelles que el que arriba (i no hi ha hagut cap reinici entremig), no es desa i torna -2.
-- L'app (motor/plantilla-estudi-interactiu.html, nuvolPuja) baixa el núvol, el fusiona (sempre el més alt) i torna a pujar.
-- Les estrelles d'un món només baixen amb un reinici de l'admin, i aquest ja esborra la fila de bn_priv.progres
-- (bn_admin_reinicia.sql), de manera que no xoca amb aquesta regla. Les apps antigues ignoren el -2: el núvol es queda el més alt.
-- La resta és igual que a bn_admin_reinicia.sql (PIN, mida màxima, -1 si l'estat és d'abans d'un reinici).

create or replace function public.bn_progres_desa(p_nom text, p_pin text, p_assig text, p_estat jsonb, p_mod bigint)
returns bigint
language plpgsql security definer set search_path = '' as $$
declare ri_estat bigint; vell jsonb; p_nou numeric; p_vell numeric; ri_vell bigint;
begin
  if not bn_priv.pin_ok(p_nom, p_pin) then raise exception 'pin incorrecte' using errcode = '28000'; end if;
  if pg_column_size(p_estat) > 300000 or char_length(p_assig) > 40 then raise exception 'massa gran' using errcode = '22023'; end if;
  ri_estat := case when (p_estat->>'reinici') ~ '^[0-9]{1,15}$' then (p_estat->>'reinici')::bigint else 0 end;
  if ri_estat < bn_priv.reinici_ms(lower(trim(p_nom)), p_assig) then
    return -1;
  end if;
  -- el núvol té més estrelles que el que arriba (mateix reinici o més nou): no es trepitja
  select g.estat into vell from bn_priv.progres g where g.k = lower(trim(p_nom)) and g.assig = p_assig;
  if vell is not null then
    p_nou  := case when (p_estat->>'punts') ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (p_estat->>'punts')::numeric else 0 end;
    p_vell := case when (vell->>'punts')    ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (vell->>'punts')::numeric    else 0 end;
    ri_vell := case when (vell->>'reinici') ~ '^[0-9]{1,15}$' then (vell->>'reinici')::bigint else 0 end;
    if p_vell > p_nou and ri_vell >= ri_estat then
      return -2;
    end if;
  end if;
  insert into bn_priv.progres(k,assig,estat,mod,ts) values (lower(trim(p_nom)), p_assig, p_estat, p_mod, now())
    on conflict (k,assig) do update set estat = excluded.estat, mod = excluded.mod, ts = now()
    where bn_priv.progres.mod <= excluded.mod;
  return p_mod;
end $$;
revoke all on function public.bn_progres_desa(text, text, text, jsonb, bigint) from public;
grant execute on function public.bn_progres_desa(text, text, text, jsonb, bigint) to anon, authenticated;
