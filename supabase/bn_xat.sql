-- Bona Nota · xat de la colla amb crèdits (n2528)
-- Els nens es parlen amb peces: una frase del catàleg amb un forat (___) i el que l'omple, que és una peça (paraula d'estudi,
-- cosa de classe o cosa teva) o el nom d'un company del rànquing. Mai text lliure: a xat_msg només hi ha números, el nom del nen
-- i el nom del company tal com surt al rànquing. El text de cada missatge es compon al navegador amb el catàleg.
-- Per parlar t'ho has de guanyar: cada 10 ⭐ guanyades avui (Europe/Madrid) = 1 crèdit = 1 frase, fins a 5 al dia.
-- Les estrelles no es gasten ni es toquen: es llegeixen de public.bn_log (ja han passat pel fre de bn_priv.bn_log_net).
--   · bn_priv.xat_frases i xat_peces: el catàleg, el MATEIX que el bloc XAT-CATALEG d'index.html (motor/prova-xat-sql.js ho comprova)
--   · bn_priv.xat_msg, xat_vots i xat_silenci: missatges, vots «Ben dit» i noms silenciats. Cap taula és accessible des del navegador.
--   · bn_priv.config, clau «xat»: estrelles per crèdit, màxim de frases al dia, espera i xat obert o tancat (ho canvia l'admin)
--   · bn_xat_estat(nom, pin): crèdits, desbloquejos i vots del nen
--   · bn_xat_envia(nom, pin, frase, peça, company): desa el missatge si tot quadra, en aquest ordre:
--     pin → silenci → tancat → bloquejada → company → max_dia / sense_credit → espera. Si en falla una, no desa res.
--     Un nom amagat o prohibit és com un silenciat sense data ({"codi":"silenci","fins":null}): els seus missatges no els veuria ningú.
--   · bn_xat_llegeix(des_de): els 60 últims missatges visibles amb els vots, les bafarades i el missatge del dia (sense PIN, com el rànquing)
--   · bn_xat_vota(nom, pin, msg): posa o treu «Ben dit» (cal el primer crèdit d'avui; mai al propi)
--   · bn_admin_xat_*: missatges (amb «vis»: si surt a la portada), esborrar, silenciar, configuració, catàleg, peça nova i resum del dia
-- Fa servir bn_priv.pin_ok (bn_pin_nou.sql), bn_priv.admin_ok (bn_admin_tauler.sql), bn_priv.nom_prohibit, bn_priv.amagats i
-- bn_priv.config (bn_ranking_net.sql). El nivell i les estrelles de cada món es compten com bn_ranking_mons (últims 120 dies).
-- Idempotent: es pot executar tantes vegades com calgui a l'editor SQL del projecte bonanota (agippwtqvhpxdockuigl).
-- Tornar-lo a executar no trepitja la configuració ni el que l'admin hagi activat o desactivat del catàleg.
-- Sense aquest SQL la portada es veu com abans (la pestanya Xat diu «El xat arriba aviat»).

-- ---------- taules (esquema privat) ----------
create table if not exists bn_priv.xat_frases(
  id int primary key,
  cat text not null check (cat in ('repte', 'aura', 'classe', 'colla')),
  text text not null check (char_length(text) between 4 and 80 and char_length(text) - char_length(replace(text, '___', '')) = 3),
  slot char(1) not null check (slot in ('P', 'E', 'J', 'C')),
  nivell smallint not null check (nivell between 1 and 10),
  actiu boolean not null default true
);
create table if not exists bn_priv.xat_peces(
  id int primary key,
  tipus char(1) not null check (tipus in ('P', 'E', 'J')),
  text text not null check (char_length(text) between 1 and 60),
  nivell smallint check (nivell between 1 and 10),
  mon text check (mon ~ '^[a-z0-9_-]{1,40}$'),
  actiu boolean not null default true,
  check ((nivell is null) <> (mon is null))
);
-- un missatge és {qui, frase, peça o company}: cap columna per a text lliure
create table if not exists bn_priv.xat_msg(
  id bigint generated always as identity primary key,
  k text not null check (char_length(k) between 1 and 40),
  nom text not null check (char_length(nom) between 1 and 40),
  frase int not null references bn_priv.xat_frases(id),
  peca int references bn_priv.xat_peces(id),
  company text check (char_length(company) between 1 and 40),
  ts timestamptz not null default now(),
  esborrat boolean not null default false,
  check ((peca is null) <> (company is null))
);
create index if not exists xat_msg_k_ts on bn_priv.xat_msg(k, ts desc);
create index if not exists xat_msg_ts on bn_priv.xat_msg(ts desc);
create table if not exists bn_priv.xat_vots(
  msg bigint not null references bn_priv.xat_msg(id) on delete cascade,
  k text not null check (char_length(k) between 1 and 40),
  ts timestamptz not null default now(),
  primary key (msg, k)
);
create index if not exists xat_vots_k on bn_priv.xat_vots(k, msg);
create table if not exists bn_priv.xat_silenci(
  k text primary key check (char_length(k) between 1 and 40),
  fins timestamptz not null,
  motiu text not null default '' check (char_length(motiu) <= 200),
  ts timestamptz not null default now()
);
-- només les funcions d'aquest fitxer hi entren (security definer); RLS sense polítiques per si algun dia algú hi dona permisos
alter table bn_priv.xat_frases enable row level security;
alter table bn_priv.xat_peces enable row level security;
alter table bn_priv.xat_msg enable row level security;
alter table bn_priv.xat_vots enable row level security;
alter table bn_priv.xat_silenci enable row level security;
revoke all on bn_priv.xat_frases, bn_priv.xat_peces, bn_priv.xat_msg, bn_priv.xat_vots, bn_priv.xat_silenci from public, anon, authenticated;
revoke all on sequence bn_priv.xat_msg_id_seq from public, anon, authenticated;

-- configuració inicial (si ja hi és, la deixa com l'hagi posada l'admin)
insert into bn_priv.config(clau, valor) values ('xat', '{"est_credit":10,"max_dia":5,"espera_s":10,"actiu":true}')
  on conflict (clau) do nothing;

-- catàleg (el mateix que el bloc XAT-CATALEG d'index.html): tot menys «actiu», que és de l'admin
insert into bn_priv.xat_frases(id, cat, text, slot, nivell) values
  (1, 'repte', 'Vaig a per ___!', 'P', 1),
  (2, 'repte', 'Qui s''atreveix amb ___?', 'P', 1),
  (3, 'repte', '___? Bufar i fer ampolles!', 'P', 1),
  (4, 'repte', 'Algú m''ajuda amb ___?', 'P', 1),
  (5, 'repte', 'Avui toca ___', 'P', 2),
  (6, 'repte', 'Ningú m''atura a ___', 'P', 3),
  (7, 'repte', 'Pista: repassa ___', 'P', 4),
  (8, 'repte', 'Revenja a ___?', 'P', 5),
  (9, 'repte', 'Ja tinc ___ a la butxaca', 'P', 6),
  (10, 'repte', 'Mode llegenda: ___', 'P', 9),
  (11, 'aura', '+1000 d''aura per a ___', 'C', 1),
  (12, 'aura', '___: +500 d''aura', 'P', 1),
  (13, 'aura', '___: -1000 d''aura', 'E', 1),
  (14, 'aura', '-100 d''aura per a mi: ___', 'J', 1),
  (15, 'aura', 'Res té més aura que ___', 'P', 2),
  (16, 'aura', 'Aura infinita per a ___', 'C', 7),
  (17, 'classe', 'Quin dia: ___', 'E', 1),
  (18, 'classe', 'Jo contra ___: 0 a 1', 'E', 1),
  (19, 'classe', 'Confessió: ___', 'J', 2),
  (20, 'classe', 'Que algú m''expliqui ___', 'E', 3),
  (21, 'classe', 'Top 1 de l''institut: ___', 'E', 4),
  (22, 'colla', 'Bona, ___!', 'C', 1),
  (23, 'colla', 'Compte, ___, que vinc!', 'C', 1),
  (24, 'colla', 'GG, ___!', 'C', 2),
  (25, 'colla', '___, et toca moure fitxa!', 'C', 4),
  (26, 'colla', 'Respecte per a ___', 'C', 7)
on conflict (id) do update set cat = excluded.cat, text = excluded.text, slot = excluded.slot, nivell = excluded.nivell;

insert into bn_priv.xat_peces(id, tipus, text, nivell, mon) values
  (1, 'P', 'el teu lloc', 1, null),
  (2, 'P', 'el test', 1, null),
  (3, 'P', 'l''examen sorpresa', 1, null),
  (4, 'P', 'els jocs', 1, null),
  (5, 'P', 'el repàs', 1, null),
  (6, 'P', 'les targetes', 1, null),
  (7, 'P', 'el rècord', 2, null),
  (8, 'P', 'la remuntada', 2, null),
  (9, 'P', 'el podi', 3, null),
  (10, 'P', 'la setmana', 3, null),
  (11, 'P', 'la corona', 4, null),
  (12, 'P', 'el combo', 4, null),
  (13, 'P', 'el boss final', 5, null),
  (14, 'P', 'el mode turbo', 5, null),
  (15, 'P', 'el primer lloc', 6, null),
  (16, 'P', 'la glòria', 6, null),
  (17, 'P', 'el tron', 7, null),
  (18, 'P', 'la galàxia', 7, null),
  (19, 'P', 'el número u', 8, null),
  (20, 'P', 'l''olimp', 8, null),
  (21, 'P', 'l''infinit', 9, null),
  (22, 'P', 'la Lluna', 9, null),
  (23, 'P', 'l''univers', 10, null),
  (24, 'P', 'el Bona Nota d''or', 10, null),
  (25, 'P', 'els nombres primers', null, 'divisibilitat'),
  (26, 'P', 'el MCD', null, 'divisibilitat'),
  (27, 'P', 'el MCM', null, 'divisibilitat'),
  (28, 'P', 'la tramuntana', null, 'socials'),
  (29, 'P', 'el climograma', null, 'socials'),
  (30, 'P', 'l''anticicló', null, 'socials'),
  (31, 'P', 'la cèl·lula', null, 'biogeo'),
  (32, 'P', 'el mantell', null, 'biogeo'),
  (33, 'P', 'la Via Làctia', null, 'biogeo'),
  (34, 'P', 'les 43 comarques', null, 'comarques'),
  (35, 'P', 'l''Anoia', null, 'comarques'),
  (36, 'P', 'les capitals', null, 'comarques'),
  (37, 'P', 'los sustantivos', null, 'castellano'),
  (38, 'P', 'la noticia', null, 'castellano'),
  (39, 'P', 'los determinantes', null, 'castellano'),
  (40, 'P', 'la literatura oral', null, 'catala'),
  (41, 'P', 'els signes de puntuació', null, 'catala'),
  (42, 'P', 'el nom', null, 'catala'),
  (43, 'E', 'el wifi de l''institut', 1, null),
  (44, 'E', 'un examen sorpresa en dilluns', 1, null),
  (45, 'E', 'la campana a mitja frase', 1, null),
  (46, 'E', 'la motxilla de 20 quilos', 1, null),
  (47, 'E', 'la calculadora sense piles', 2, null),
  (48, 'E', 'la fila del menjador', 2, null),
  (49, 'E', 'el projector que no s''encén', 3, null),
  (50, 'E', 'els deures per al pont', 3, null),
  (51, 'E', 'el boli que s''acaba a mig examen', 4, null),
  (52, 'E', 'la classe de després del pati', 4, null),
  (53, 'E', 'l''educació física sota la pluja', 5, null),
  (54, 'E', 'el «traieu un full»', 5, null),
  (55, 'E', 'l''última hora del divendres', 6, null),
  (56, 'E', 'la calor de juny a l''aula', 6, null),
  (57, 'E', 'l''excursió de final de curs', 7, null),
  (58, 'J', 'm''he deixat els deures a casa', 1, null),
  (59, 'J', 'he estudiat el tema que no tocava', 1, null),
  (60, 'J', 'he fallat la pregunta més fàcil', 2, null),
  (61, 'J', 'm''he menjat l''esmorzar a primera hora', 3, null),
  (62, 'J', 'he anat a l''aula equivocada', 4, null),
  (63, 'J', 'he dit «present» quan no em cridaven', 5, null),
  (64, 'P', 'el Present Continuous', null, 'angles'),
  (65, 'P', 'els stative verbs', null, 'angles'),
  (66, 'P', 'el tresor de Fenn', null, 'angles')
on conflict (id) do update set tipus = excluded.tipus, text = excluded.text, nivell = excluded.nivell, mon = excluded.mon;

-- ---------- ajudes internes (bn_priv: el navegador no les pot cridar) ----------
-- configuració amb valors per defecte i límits: un valor estrany a bn_priv.config no trenca el xat
create or replace function bn_priv.xat_cfg() returns jsonb
language plpgsql stable set search_path = '' as $$
declare t text; j jsonb;
begin
  select c.valor into t from bn_priv.config c where c.clau = 'xat';
  begin j := t::jsonb; exception when others then j := null; end;
  if jsonb_typeof(j) is distinct from 'object' then j := '{}'::jsonb; end if;
  return jsonb_build_object(
    'est_credit', case when j->>'est_credit' ~ '^[0-9]{1,6}$' then least(greatest((j->>'est_credit')::int, 1), 100) else 10 end,
    'max_dia',    case when j->>'max_dia'    ~ '^[0-9]{1,6}$' then least(greatest((j->>'max_dia')::int, 1), 20) else 5 end,
    'espera_s',   case when j->>'espera_s'   ~ '^[0-9]{1,6}$' then least((j->>'espera_s')::int, 600) else 10 end,
    'actiu',      case when j->>'actiu' in ('true', 'false') then (j->>'actiu')::boolean else true end);
end $$;

-- configuració d'horari automàtic del xat (clau 'xat_horari' a bn_priv.config; per defecte desactivat, 21:30 -> 07:00)
create or replace function bn_priv.xat_horari_cfg() returns jsonb
language plpgsql stable set search_path = '' as $$
declare t text; j jsonb;
begin
  select c.valor into t from bn_priv.config c where c.clau = 'xat_horari';
  begin j := t::jsonb; exception when others then j := null; end;
  if jsonb_typeof(j) is distinct from 'object' then j := '{}'::jsonb; end if;
  return jsonb_build_object(
    'actiu',   case when j->>'actiu' in ('true', 'false') then (j->>'actiu')::boolean else false end,
    'tanca_h', case when j->>'tanca_h' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then j->>'tanca_h' else '21:30' end,
    'obre_h',  case when j->>'obre_h'  ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then j->>'obre_h'  else '07:00' end);
end $$;

-- comprova si una hora cau dins la franja de tancament automàtic (en hora de Catalunya, Europe/Madrid)
create or replace function bn_priv.xat_en_horari_tancat(
  p_horari_actiu boolean,
  p_tanca_h text,
  p_obre_h text,
  p_ara timestamptz default now()
) returns boolean
language plpgsql stable set search_path = '' as $$
declare
  hm text;
  tanca text := coalesce(p_tanca_h, '21:30');
  obre text := coalesce(p_obre_h, '07:00');
begin
  if not coalesce(p_horari_actiu, false) then return false; end if;
  if tanca !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then tanca := '21:30'; end if;
  if obre  !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then obre  := '07:00'; end if;
  if tanca = obre then return true; end if;
  hm := to_char(p_ara at time zone 'Europe/Madrid', 'HH24:MI');
  if tanca < obre then
    return hm >= tanca and hm < obre;
  else
    return hm >= tanca or hm < obre;
  end if;
end $$;

-- estat efectiu del xat (actiu manualment I fora d'horari tancat)
create or replace function bn_priv.xat_obert_ara(
  p_cfg jsonb default null,
  p_ara timestamptz default now()
) returns boolean
language plpgsql stable set search_path = '' as $$
declare
  c jsonb := coalesce(p_cfg, bn_priv.xat_cfg());
  h jsonb := bn_priv.xat_horari_cfg();
begin
  if not coalesce((c->>'actiu')::boolean, true) then return false; end if;
  if bn_priv.xat_en_horari_tancat((h->>'actiu')::boolean, h->>'tanca_h', h->>'obre_h', p_ara) then return false; end if;
  return true;
end $$;

-- «avui» comença a la mitjanit de Catalunya, també els dies de canvi d'hora (el càlcul es fa en hora local, no en UTC)
create or replace function bn_priv.xat_mitjanit() returns timestamptz
language sql stable set search_path = '' as $$
  select date_trunc('day', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid'
$$;
create or replace function bn_priv.xat_ahir_mitjanit() returns timestamptz
language sql stable set search_path = '' as $$
  select (date_trunc('day', now() at time zone 'Europe/Madrid') - interval '1 day') at time zone 'Europe/Madrid'
$$;
create or replace function bn_priv.xat_fi_dia() returns timestamptz
language sql stable set search_path = '' as $$
  select (date_trunc('day', now() at time zone 'Europe/Madrid') + interval '1 day') at time zone 'Europe/Madrid'
$$;

-- temps en mil·lisegons d'època (el que fa servir el navegador)
create or replace function bn_priv.xat_ms(p_ts timestamptz) returns bigint
language sql immutable set search_path = '' as $$
  select floor(extract(epoch from p_ts) * 1000)::bigint
$$;

-- punts d'un registre, amb la mateixa precaució que la resta (un valor estrany no fa petar res: compta com si no hi fos)
create or replace function bn_priv.xat_punts(p_detall jsonb) returns numeric
language sql immutable set search_path = '' as $$
  select case when p_detall->>'punts' ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (p_detall->>'punts')::numeric end
$$;

-- estrelles guanyades avui: per a cada món, el màxim d'avui menys el màxim d'abans de mitjanit (0 si no n'hi ha), mínim 0;
-- i la suma de tots els mons. Hi entren totes les fonts (tests, jocs, repàs, missions, boss). El filtre per nen fa servir bn_log_nom.
create or replace function bn_priv.xat_est_avui(p_k text) returns int
language sql stable set search_path = '' as $$
  with m as (select bn_priv.xat_mitjanit() t),
  per as (
    select max(bn_priv.xat_punts(l.detall)) filter (where l.ts >= m.t) avui,
           max(bn_priv.xat_punts(l.detall)) filter (where l.ts < m.t) abans
    from public.bn_log l cross join m
    where lower(trim(l.nom)) = p_k
    group by l.assig)
  select coalesce(sum(greatest(per.avui - coalesce(per.abans, 0), 0)), 0)::int from per where per.avui is not null
$$;

-- estrelles de cada món com les compta el rànquing (bn_ranking_mons): el màxim dels últims 120 dies
create or replace function bn_priv.xat_mons(p_k text) returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(jsonb_object_agg(x.assig, x.p::int) filter (where x.p > 0), '{}'::jsonb)
  from (select l.assig, coalesce(max(bn_priv.xat_punts(l.detall)), 0) p
        from public.bn_log l
        where lower(trim(l.nom)) = p_k and l.ts > now() - interval '120 days'
        group by l.assig) x
$$;

-- nivell 1..10 amb els llindars de NIV de la portada (0, 10, 25, 45, 70, 100, 140, 190, 250, 330)
create or replace function bn_priv.xat_niv(p_punts numeric) returns int
language sql immutable set search_path = '' as $$
  select greatest(1, (select count(*)::int from unnest(array[0, 10, 25, 45, 70, 100, 140, 190, 250, 330]) t where t <= coalesce(p_punts, 0)))
$$;

-- el nom tal com surt al rànquing (mateixos filtres que bn_ranking_mons: 120 dies, estrelles o temps, ni amagat ni prohibit), o null
create or replace function bn_priv.xat_al_ranquing(p_k text) returns text
language sql stable set search_path = '' as $$
  select max(x.nm)
  from (select max(l.nom) nm, coalesce(max(bn_priv.xat_punts(l.detall)), 0) p,
               coalesce(sum(case when l.detall->>'s' ~ '^[0-9]{1,9}(\.[0-9]+)?$' then (l.detall->>'s')::numeric end)
                          filter (where l.event = 'temps'), 0) t
        from public.bn_log l
        where lower(trim(l.nom)) = p_k and l.ts > now() - interval '120 days'
          and not exists (select 1 from bn_priv.amagats a where a.k = p_k)
          and not bn_priv.nom_prohibit(l.nom)
        group by l.assig) x
  having sum(x.p) > 0 or sum(x.t) > 0
$$;

-- un nom amagat o prohibit no surt enlloc (ni com a autor ni com a company) i no pot escriure ni votar
create or replace function bn_priv.xat_ocult(p_k text, p_nom text) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from bn_priv.amagats a where a.k = p_k) or bn_priv.nom_prohibit(p_nom)
$$;

-- un nen existeix si té perfil o algun registre: «Treu el PIN» (esborra el perfil) no l'amaga; «Esborra del tot» (perfil i registre), sí.
-- El registre es busca amb l'índex bn_log_nom.
create or replace function bn_priv.xat_existeix(p_k text) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from bn_priv.perfils p where p.k = p_k)
      or exists (select 1 from public.bn_log l where lower(trim(l.nom)) = p_k)
$$;

-- un missatge es veu si no està esborrat, l'autor existeix i no està amagat ni és prohibit,
-- i el company que nomena (si n'hi ha) també existeix i tampoc no està amagat ni és prohibit.
create or replace function bn_priv.xat_vis(p_k text, p_nom text, p_company text, p_esborrat boolean) returns boolean
language sql stable set search_path = '' as $$
  select not p_esborrat
     and not bn_priv.xat_ocult(p_k, p_nom) and bn_priv.xat_existeix(p_k)
     and (p_company is null or (not bn_priv.xat_ocult(lower(trim(p_company)), p_company)
                                and bn_priv.xat_existeix(lower(trim(p_company)))))
$$;

-- missatge del dia d'ahir: el missatge visible més votat escrit ahir (en hora de Catalunya, amb com a mínim 1 vot; empat: el primer).
-- L'autor porta avui la corona «👑 Missatge d'ahir» i rep +1 crèdit extra per parlar (sense donar estrelles ni tocar bn_log).
create or replace function bn_priv.xat_mdd_ahir()
returns table(id bigint, k text, nom text, frase int, peca int, company text, ts timestamptz, n int)
language sql stable set search_path = '' as $$
  select m.id, m.k, m.nom, m.frase, m.peca, m.company, m.ts, count(*)::int n
  from bn_priv.xat_msg m join bn_priv.xat_vots v on v.msg = m.id
  where m.ts >= bn_priv.xat_ahir_mitjanit() and m.ts < bn_priv.xat_mitjanit()
    and bn_priv.xat_vis(m.k, m.nom, m.company, m.esborrat)
  group by m.id
  order by count(*) desc, m.id
  limit 1
$$;

-- tot el que cal saber d'un nen per decidir: estrelles i crèdits d'avui (+1 extra si va guanyar el missatge d'ahir), nivell, mons acabats (25 ⭐) i l'últim missatge.
-- «enviats» compta també els que l'admin ha esborrat: esborrar no torna el crèdit. «falten» és per al proper crèdit d'estudi que podrà gastar:
-- si n'ha enviat més dels que ara guanyaria (l'admin ha apujat les estrelles per crèdit a mig dia), és l'enviats (descomptat el premi) + 1.
drop function if exists bn_priv.xat_nen(text, jsonb);
create or replace function bn_priv.xat_nen(p_k text, p_cfg jsonb,
  out est_avui int, out enviats int, out guanyats int, out queden int, out falten int, out premi_ahir boolean,
  out nivell int, out mons jsonb, out acabats text[], out ultim timestamptz)
language plpgsql stable set search_path = '' as $$
declare ec int := (p_cfg->>'est_credit')::int; md int := (p_cfg->>'max_dia')::int; gec int; bo int; n int;
begin
  est_avui := bn_priv.xat_est_avui(p_k);
  premi_ahir := exists (select 1 from bn_priv.xat_mdd_ahir() d where d.k = p_k);
  bo := case when premi_ahir then 1 else 0 end;
  select count(*) filter (where m.ts >= bn_priv.xat_mitjanit())::int, max(m.ts) into enviats, ultim
    from bn_priv.xat_msg m where m.k = p_k;
  gec := least(md, est_avui / ec);
  guanyats := gec + bo;
  queden := greatest(0, guanyats - enviats);
  n := greatest(gec, greatest(0, enviats - bo));
  falten := case when n >= md then 0 else (n + 1) * ec - est_avui end;
  mons := bn_priv.xat_mons(p_k);
  nivell := bn_priv.xat_niv((select max(e.value::numeric) from jsonb_each_text(mons) e));
  acabats := coalesce((select array_agg(e.key order by e.key) from jsonb_each_text(mons) e where e.value::numeric >= 25), '{}'::text[]);
end $$;

-- els 60 missatges visibles més nous (el que porta bn_xat_llegeix)
create or replace function bn_priv.xat_ultims60() returns table(id bigint, k text, nom text, frase int, peca int, company text, ts timestamptz)
language sql stable set search_path = '' as $$
  select m.id, m.k, m.nom, m.frase, m.peca, m.company, m.ts
  from bn_priv.xat_msg m
  where bn_priv.xat_vis(m.k, m.nom, m.company, m.esborrat)
  order by m.id desc limit 60
$$;

revoke all on function bn_priv.xat_cfg() from public, anon, authenticated;
revoke all on function bn_priv.xat_horari_cfg() from public, anon, authenticated;
revoke all on function bn_priv.xat_en_horari_tancat(boolean, text, text, timestamptz) from public, anon, authenticated;
revoke all on function bn_priv.xat_obert_ara(jsonb, timestamptz) from public, anon, authenticated;
revoke all on function bn_priv.xat_mitjanit() from public, anon, authenticated;
revoke all on function bn_priv.xat_ahir_mitjanit() from public, anon, authenticated;
revoke all on function bn_priv.xat_fi_dia() from public, anon, authenticated;
revoke all on function bn_priv.xat_ms(timestamptz) from public, anon, authenticated;
revoke all on function bn_priv.xat_punts(jsonb) from public, anon, authenticated;
revoke all on function bn_priv.xat_est_avui(text) from public, anon, authenticated;
revoke all on function bn_priv.xat_mons(text) from public, anon, authenticated;
revoke all on function bn_priv.xat_niv(numeric) from public, anon, authenticated;
revoke all on function bn_priv.xat_al_ranquing(text) from public, anon, authenticated;
revoke all on function bn_priv.xat_ocult(text, text) from public, anon, authenticated;
revoke all on function bn_priv.xat_existeix(text) from public, anon, authenticated;
revoke all on function bn_priv.xat_vis(text, text, text, boolean) from public, anon, authenticated;
revoke all on function bn_priv.xat_mdd_ahir() from public, anon, authenticated;
revoke all on function bn_priv.xat_nen(text, jsonb) from public, anon, authenticated;
revoke all on function bn_priv.xat_ultims60() from public, anon, authenticated;

-- ---------- 1) estat del nen (amb PIN) ----------
-- PIN dolent: {"codi":"pin"} sense excepció, perquè l'intent fallit quedi apuntat (massa intents sí que és l'excepció de pin_ok).
-- «meus»: missatges que ha votat, dels últims 2 dies o d'entre els 60 que es veuen al xat (només amb PIN: ningú més ho pot saber).
-- «silenci»: null, {"fins": ms} si l'admin l'ha silenciat, o {"fins": null} si el nom està amagat o és prohibit (sense data; guanya).
create or replace function public.bn_xat_estat(p_nom text, p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare kk text := lower(trim(coalesce(p_nom, ''))); c jsonb; r record; s timestamptz; ef timestamptz;
begin
  if not bn_priv.pin_ok(p_nom, p_pin) then return jsonb_build_object('codi', 'pin'); end if;
  c := bn_priv.xat_cfg();
  select * into r from bn_priv.xat_nen(kk, c);
  select x.fins into s from bn_priv.xat_silenci x where x.k = kk and x.fins > now();
  ef := r.ultim + make_interval(secs => (c->>'espera_s')::int);
  return jsonb_build_object(
    'codi', 'ok', 'ara', bn_priv.xat_ms(now()), 'fi_dia', bn_priv.xat_ms(bn_priv.xat_fi_dia()),
    'est_avui', r.est_avui, 'guanyats', r.guanyats, 'enviats', r.enviats, 'queden', r.queden, 'falten', r.falten, 'premi_ahir', r.premi_ahir,
    'nivell', r.nivell, 'mons', r.mons, 'acabats', to_jsonb(r.acabats),
    'frases', coalesce((select jsonb_agg(f.id order by f.id) from bn_priv.xat_frases f where f.actiu and f.nivell <= r.nivell), '[]'::jsonb),
    'peces', coalesce((select jsonb_agg(x.id order by x.id) from bn_priv.xat_peces x
                        where x.actiu and (x.nivell <= r.nivell or x.mon = any(r.acabats))), '[]'::jsonb),
    'meus', coalesce((select jsonb_agg(v.msg order by v.msg) from bn_priv.xat_vots v join bn_priv.xat_msg m on m.id = v.msg
                       where v.k = kk and (m.ts > now() - interval '2 days'
                                           or m.id >= (select coalesce(min(u.id), 0) from bn_priv.xat_ultims60() u))), '[]'::jsonb),
    'cfg', c || jsonb_build_object('actiu', bn_priv.xat_obert_ara(c)),
    'espera_fins', case when ef > now() then bn_priv.xat_ms(ef) end,
    'silenci', case when bn_priv.xat_ocult(kk, p_nom) then jsonb_build_object('fins', null)
                    when s is not null then jsonb_build_object('fins', bn_priv.xat_ms(s)) end);
end $$;
revoke all on function public.bn_xat_estat(text, text) from public;
grant execute on function public.bn_xat_estat(text, text) to anon, authenticated;

-- ---------- 2) enviar un missatge (amb PIN) ----------
create or replace function public.bn_xat_envia(p_nom text, p_pin text, p_frase int, p_peca int default null, p_company text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare kk text := lower(trim(coalesce(p_nom, ''))); comp text := nullif(trim(coalesce(p_company, '')), '');
  c jsonb; r record; fr bn_priv.xat_frases; pc bn_priv.xat_peces; s timestamptz; ef timestamptz; nom_c text; nm text; nou bigint;
begin
  if not bn_priv.pin_ok(p_nom, p_pin) then return jsonb_build_object('codi', 'pin'); end if;
  -- un enviament alhora per nen: dos clics seguits no poden gastar el mateix crèdit
  perform pg_advisory_xact_lock(hashtext('bn_xat:' || kk));
  -- amagat o prohibit: silenci sense data (els seus missatges no els veuria ningú, ni ell en tornar a obrir el xat)
  if bn_priv.xat_ocult(kk, p_nom) then return jsonb_build_object('codi', 'silenci', 'fins', null); end if;
  select x.fins into s from bn_priv.xat_silenci x where x.k = kk and x.fins > now();
  if s is not null then return jsonb_build_object('codi', 'silenci', 'fins', bn_priv.xat_ms(s)); end if;
  c := bn_priv.xat_cfg();
  if not bn_priv.xat_obert_ara(c) then return jsonb_build_object('codi', 'tancat'); end if;
  select * into r from bn_priv.xat_nen(kk, c);
  -- frase activa i desbloquejada; el forat, omplert amb el que demana (peça del seu tipus o company, mai totes dues coses)
  select * into fr from bn_priv.xat_frases x where x.id = p_frase;
  if fr.id is null or not fr.actiu or fr.nivell > r.nivell then return jsonb_build_object('codi', 'bloquejada'); end if;
  if fr.slot = 'C' then
    if p_peca is not null then return jsonb_build_object('codi', 'bloquejada'); end if;
  else
    if comp is not null then return jsonb_build_object('codi', 'bloquejada'); end if;
    select * into pc from bn_priv.xat_peces x where x.id = p_peca;
    if pc.id is null or not pc.actiu or pc.tipus <> fr.slot
       or not coalesce(pc.nivell <= r.nivell or pc.mon = any(r.acabats), false) then
      return jsonb_build_object('codi', 'bloquejada');
    end if;
  end if;
  -- company: qualsevol nom del rànquing menys un mateix (sense amagats ni prohibits); es desa tal com surt al rànquing
  if fr.slot = 'C' then
    if comp is null or lower(comp) = kk then return jsonb_build_object('codi', 'company'); end if;
    nom_c := bn_priv.xat_al_ranquing(lower(comp));
    if nom_c is null then return jsonb_build_object('codi', 'company'); end if;
  end if;
  if r.enviats >= (c->>'max_dia')::int + (case when r.premi_ahir then 1 else 0 end) then return jsonb_build_object('codi', 'max_dia'); end if;
  if r.queden <= 0 then return jsonb_build_object('codi', 'sense_credit', 'falten', r.falten); end if;
  ef := r.ultim + make_interval(secs => (c->>'espera_s')::int);
  if ef > now() then return jsonb_build_object('codi', 'espera', 'ms', ceil(extract(epoch from ef - now()) * 1000)::bigint); end if;
  select x.nom into nm from bn_priv.perfils x where x.k = kk;
  insert into bn_priv.xat_msg(k, nom, frase, peca, company)
    values (kk, coalesce(nullif(trim(nm), ''), trim(p_nom)), fr.id, pc.id, nom_c)
    returning id into nou;
  ef := now() + make_interval(secs => (c->>'espera_s')::int);
  return jsonb_build_object('codi', 'ok', 'id', nou, 'queden', r.queden - 1, 'enviats', r.enviats + 1,
                            'espera_fins', case when ef > now() then bn_priv.xat_ms(ef) end);
end $$;
revoke all on function public.bn_xat_envia(text, text, int, int, text) from public;
grant execute on function public.bn_xat_envia(text, text, int, int, text) to anon, authenticated;

-- ---------- 3) llegir el xat (sense PIN, com el rànquing; es crida cada 10 s amb la pestanya Xat oberta) ----------
-- msgs: els 60 més nous visibles (amb p_des_de, només els d'id més gran) · vots: comptador de cadascun dels 60
-- ultims: l'últim missatge de cada nen de les últimes 24 h (bafarades) · mdd: el més votat d'avui (empat: el primer)
-- off: frases i peces desactivades (es veuen com «…») · noves: peces de l'admin (id ≥ 1001) amb el seu text
create or replace function public.bn_xat_llegeix(p_des_de bigint default null) returns jsonb
language sql stable security definer set search_path = '' as $$
  with ult as (select * from bn_priv.xat_ultims60()),
  vc as (select v.msg, count(*)::int n from bn_priv.xat_vots v where v.msg in (select u.id from ult u) group by v.msg),
  u24 as (
    select distinct on (m.k) m.id, m.nom, m.frase, m.peca, m.company, m.ts
    from bn_priv.xat_msg m
    where m.ts > now() - interval '24 hours' and bn_priv.xat_vis(m.k, m.nom, m.company, m.esborrat)
    order by m.k, m.id desc),
  mdd as (
    select m.id, m.nom, m.frase, m.peca, m.company, m.ts, count(*)::int n
    from bn_priv.xat_msg m join bn_priv.xat_vots v on v.msg = m.id
    where m.ts >= bn_priv.xat_mitjanit() and bn_priv.xat_vis(m.k, m.nom, m.company, m.esborrat)
    group by m.id
    order by count(*) desc, m.id
    limit 1)
  select jsonb_build_object(
    'ara', bn_priv.xat_ms(now()),
    'actiu', bn_priv.xat_obert_ara(),
    'msgs', coalesce((select jsonb_agg(jsonb_build_object('id', u.id, 'nom', u.nom, 'f', u.frase, 'p', u.peca, 'c', u.company,
                                                          'ts', bn_priv.xat_ms(u.ts), 'v', coalesce(vc.n, 0)) order by u.id)
                      from ult u left join vc on vc.msg = u.id where p_des_de is null or u.id > p_des_de), '[]'::jsonb),
    'vots', coalesce((select jsonb_object_agg(u.id::text, coalesce(vc.n, 0)) from ult u left join vc on vc.msg = u.id), '{}'::jsonb),
    'ultims', coalesce((select jsonb_agg(jsonb_build_object('id', u.id, 'nom', u.nom, 'f', u.frase, 'p', u.peca, 'c', u.company,
                                                            'ts', bn_priv.xat_ms(u.ts),
                                                            'v', (select count(*)::int from bn_priv.xat_vots v where v.msg = u.id)) order by u.id)
                        from u24 u), '[]'::jsonb),
    'mdd', (select jsonb_build_object('id', d.id, 'nom', d.nom, 'f', d.frase, 'p', d.peca, 'c', d.company, 'ts', bn_priv.xat_ms(d.ts), 'v', d.n)
            from mdd d),
    'mdd_ahir', (select jsonb_build_object('id', d.id, 'nom', d.nom, 'f', d.frase, 'p', d.peca, 'c', d.company, 'ts', bn_priv.xat_ms(d.ts), 'v', d.n)
                 from bn_priv.xat_mdd_ahir() d),
    'off', jsonb_build_object(
             'f', coalesce((select jsonb_agg(f.id order by f.id) from bn_priv.xat_frases f where not f.actiu), '[]'::jsonb),
             'p', coalesce((select jsonb_agg(x.id order by x.id) from bn_priv.xat_peces x where not x.actiu), '[]'::jsonb)),
    'noves', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 's', x.tipus, 't', x.text, 'n', x.nivell, 'm', x.mon) order by x.id)
                       from bn_priv.xat_peces x where x.actiu and x.id >= 1001), '[]'::jsonb))
$$;
revoke all on function public.bn_xat_llegeix(bigint) from public;
grant execute on function public.bn_xat_llegeix(bigint) to anon, authenticated;

-- ---------- 4) votar «Ben dit» (amb PIN): posa o treu el vot ----------
create or replace function public.bn_xat_vota(p_nom text, p_pin text, p_msg bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare kk text := lower(trim(coalesce(p_nom, ''))); c jsonb; r record; s timestamptz; autor text; posat boolean; n int;
begin
  if not bn_priv.pin_ok(p_nom, p_pin) then return jsonb_build_object('codi', 'pin'); end if;
  if bn_priv.xat_ocult(kk, p_nom) then return jsonb_build_object('codi', 'silenci', 'fins', null); end if;
  select x.fins into s from bn_priv.xat_silenci x where x.k = kk and x.fins > now();
  if s is not null then return jsonb_build_object('codi', 'silenci', 'fins', bn_priv.xat_ms(s)); end if;
  c := bn_priv.xat_cfg();
  if not bn_priv.xat_obert_ara(c) then return jsonb_build_object('codi', 'tancat'); end if;
  select m.k into autor from bn_priv.xat_msg m where m.id = p_msg and bn_priv.xat_vis(m.k, m.nom, m.company, m.esborrat);
  if autor is null then return jsonb_build_object('codi', 'no_existeix'); end if;
  if autor = kk then return jsonb_build_object('codi', 'propi'); end if;
  select * into r from bn_priv.xat_nen(kk, c);
  -- cal el PRIMER crèdit d'estudi d'avui (no el premi d'ahir ni el següent per gastar): en falten est_credit − est_avui
  if r.est_avui < (c->>'est_credit')::int then return jsonb_build_object('codi', 'sense_credit', 'falten', (c->>'est_credit')::int - r.est_avui); end if;
  delete from bn_priv.xat_vots v where v.msg = p_msg and v.k = kk;
  posat := not found;
  if posat then insert into bn_priv.xat_vots(msg, k) values (p_msg, kk) on conflict do nothing; end if;
  select count(*)::int into n from bn_priv.xat_vots v where v.msg = p_msg;
  return jsonb_build_object('codi', 'ok', 'on', posat, 'vots', n);
end $$;
revoke all on function public.bn_xat_vota(text, text, bigint) from public;
grant execute on function public.bn_xat_vota(text, text, bigint) to anon, authenticated;

-- ---------- 5) admin (correu + contrasenya, com la resta del tauler) ----------
-- missatges dels últims p_dies dies, també els esborrats, del més nou al més vell (fins a 500).
-- «vis»: si surt a la portada (el mateix criteri que bn_xat_llegeix: no esborrat, autor i company existeixen i no amagats ni prohibits)
create or replace function public.bn_admin_xat_msgs(p_email text, p_pass text, p_dies int default 7) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(to_jsonb(x) order by x.ts desc, x.id desc) from (
    select m.id, m.nom, m.frase f, m.peca p, m.company c, bn_priv.xat_ms(m.ts) ts, m.esborrat,
           (select count(*)::int from bn_priv.xat_vots v where v.msg = m.id) v, bn_priv.xat_vis(m.k, m.nom, m.company, m.esborrat) vis
    from bn_priv.xat_msg m
    where m.ts > now() - make_interval(days => least(greatest(coalesce(p_dies, 7), 1), 365))
    order by m.ts desc, m.id desc limit 500) x), '[]'::jsonb);
end $$;

-- esborrar (true) o recuperar (false) un missatge; esborrar no torna el crèdit al nen
create or replace function public.bn_admin_xat_esborra(p_email text, p_pass text, p_msg bigint, p_esborrat boolean) returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  update bn_priv.xat_msg m set esborrat = coalesce(p_esborrat, true) where m.id = p_msg;
  get diagnostics n = row_count;
  return n;
end $$;

-- silenciar un nom 1, 3 o 7 dies (pot llegir però no escriure ni votar); 0 treu el silenci. El motiu només el veu l'admin.
create or replace function public.bn_admin_xat_silencia(p_email text, p_pass text, p_nom text, p_dies int, p_motiu text default '')
returns int language plpgsql security definer set search_path = '' as $$
declare kk text := lower(trim(coalesce(p_nom, ''))); n int;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  if char_length(kk) not between 1 and 40 then raise exception 'nom no valid' using errcode = '22023'; end if;
  if p_dies = 0 then
    delete from bn_priv.xat_silenci x where x.k = kk;
  elsif p_dies in (1, 3, 7) then
    insert into bn_priv.xat_silenci(k, fins, motiu, ts)
      values (kk, now() + make_interval(days => p_dies), left(trim(coalesce(p_motiu, '')), 200), now())
      on conflict (k) do update set fins = excluded.fins, motiu = excluded.motiu, ts = excluded.ts;
  else
    raise exception 'dies no valids (0, 1, 3 o 7)' using errcode = '22023';
  end if;
  get diagnostics n = row_count;
  return n;
end $$;

-- silencis vigents
create or replace function public.bn_admin_xat_silencis(p_email text, p_pass text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return coalesce((select jsonb_agg(jsonb_build_object('k', x.k, 'fins', bn_priv.xat_ms(x.fins), 'motiu', x.motiu) order by x.fins desc)
                   from bn_priv.xat_silenci x where x.fins > now()), '[]'::jsonb);
end $$;

-- llegir la configuració o desar-ne una (només les claus que s'envien; si un valor surt dels límits, no desa res)
create or replace function public.bn_admin_xat_config(p_email text, p_pass text, p_cfg jsonb default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare c jsonb; t text;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  if p_cfg is not null then
    if jsonb_typeof(p_cfg) <> 'object' then raise exception 'configuracio no valida' using errcode = '22023'; end if;
    c := bn_priv.xat_cfg();
    if p_cfg ? 'est_credit' then
      t := p_cfg->>'est_credit';
      if (case when t ~ '^[0-9]{1,3}$' then t::int not between 1 and 100 else true end) then raise exception 'estrelles per credit: de 1 a 100' using errcode = '22023'; end if;
      c := c || jsonb_build_object('est_credit', t::int);
    end if;
    if p_cfg ? 'max_dia' then
      t := p_cfg->>'max_dia';
      if (case when t ~ '^[0-9]{1,3}$' then t::int not between 1 and 20 else true end) then raise exception 'maxim de frases al dia: de 1 a 20' using errcode = '22023'; end if;
      c := c || jsonb_build_object('max_dia', t::int);
    end if;
    if p_cfg ? 'espera_s' then
      t := p_cfg->>'espera_s';
      if (case when t ~ '^[0-9]{1,3}$' then t::int not between 0 and 600 else true end) then raise exception 'espera: de 0 a 600 segons' using errcode = '22023'; end if;
      c := c || jsonb_build_object('espera_s', t::int);
    end if;
    if p_cfg ? 'actiu' then
      t := p_cfg->>'actiu';
      if t is null or t not in ('true', 'false') then raise exception 'actiu ha de ser true o false' using errcode = '22023'; end if;
      c := c || jsonb_build_object('actiu', t::boolean);
    end if;
    insert into bn_priv.config(clau, valor) values ('xat', c::text) on conflict (clau) do update set valor = excluded.valor;
  end if;
  return bn_priv.xat_cfg();
end $$;

-- el catàleg sencer, també el que està desactivat
create or replace function public.bn_admin_xat_cataleg(p_email text, p_pass text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return jsonb_build_object(
    'frases', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'cat', f.cat, 'text', f.text, 'slot', f.slot,
                                                            'nivell', f.nivell, 'actiu', f.actiu) order by f.id)
                        from bn_priv.xat_frases f), '[]'::jsonb),
    'peces', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'tipus', x.tipus, 'text', x.text, 'nivell', x.nivell,
                                                           'mon', x.mon, 'actiu', x.actiu) order by x.id)
                       from bn_priv.xat_peces x), '[]'::jsonb));
end $$;

-- activar o desactivar una frase o una peça (una peça desactivada deixa de sortir també als missatges vells)
create or replace function public.bn_admin_xat_actiu(p_email text, p_pass text, p_taula text, p_id int, p_actiu boolean) returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  if p_actiu is null then raise exception 'cal dir si queda activa o no' using errcode = '22023'; end if;
  if p_taula = 'frase' then
    update bn_priv.xat_frases f set actiu = p_actiu where f.id = p_id;
  elsif p_taula = 'peca' then
    update bn_priv.xat_peces x set actiu = p_actiu where x.id = p_id;
  else
    raise exception 'taula no valida (frase o peca)' using errcode = '22023';
  end if;
  get diagnostics n = row_count;
  return n;
end $$;

-- peça nova (p. ex. la paraula de la setmana): id des de l'1001, tipus P/E/J, text d'1 a 60 caràcters, nivell 1..10 o món
create or replace function public.bn_admin_xat_peca_nova(p_email text, p_pass text, p_tipus text, p_text text,
  p_nivell int default null, p_mon text default null) returns int
language plpgsql security definer set search_path = '' as $$
declare t text := upper(trim(coalesce(p_tipus, ''))); tx text := trim(coalesce(p_text, ''));
  mn text := nullif(lower(trim(coalesce(p_mon, ''))), ''); nou int;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  if t not in ('P', 'E', 'J') then raise exception 'tipus no valid (P, E o J)' using errcode = '22023'; end if;
  if char_length(tx) not between 1 and 60 or tx ~ '[[:cntrl:]]' then
    raise exception 'el text ha de tenir de 1 a 60 caracters' using errcode = '22023';
  end if;
  if (p_nivell is null) = (mn is null) then raise exception 'cal un nivell o un mon (nomes un dels dos)' using errcode = '22023'; end if;
  if p_nivell is not null and p_nivell not between 1 and 10 then raise exception 'nivell no valid (1 a 10)' using errcode = '22023'; end if;
  if mn is not null and mn !~ '^[a-z0-9_-]{1,40}$' then raise exception 'mon no valid' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext('bn_xat:peca_nova'));
  select greatest(1000, coalesce(max(x.id), 0)) + 1 into nou from bn_priv.xat_peces x;
  insert into bn_priv.xat_peces(id, tipus, text, nivell, mon) values (nou, t, tx, p_nivell, mn);
  return nou;
end $$;

-- resum d'avui: quants nens han parlat, quantes frases s'han dit (també les esborrades), quants són al màxim i quants vots
create or replace function public.bn_admin_xat_resum(p_email text, p_pass text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d timestamptz := bn_priv.xat_mitjanit(); md int := (bn_priv.xat_cfg()->>'max_dia')::int;
begin
  perform bn_priv.admin_ok(p_email, p_pass);
  return (with per as (select m.k, count(*) n from bn_priv.xat_msg m where m.ts >= d group by m.k)
          select jsonb_build_object(
            'parlat', (select count(*) from per),
            'frases', (select coalesce(sum(per.n), 0) from per),
            'al_maxim', (select count(*) from per where per.n >= md),
            'vots', (select count(*) from bn_priv.xat_vots v where v.ts >= d)));
end $$;

revoke all on function public.bn_admin_xat_msgs(text, text, int) from public;
revoke all on function public.bn_admin_xat_esborra(text, text, bigint, boolean) from public;
revoke all on function public.bn_admin_xat_silencia(text, text, text, int, text) from public;
revoke all on function public.bn_admin_xat_silencis(text, text) from public;
revoke all on function public.bn_admin_xat_config(text, text, jsonb) from public;
revoke all on function public.bn_admin_xat_cataleg(text, text) from public;
revoke all on function public.bn_admin_xat_actiu(text, text, text, int, boolean) from public;
revoke all on function public.bn_admin_xat_peca_nova(text, text, text, text, int, text) from public;
revoke all on function public.bn_admin_xat_resum(text, text) from public;
grant execute on function public.bn_admin_xat_msgs(text, text, int) to anon, authenticated;
grant execute on function public.bn_admin_xat_esborra(text, text, bigint, boolean) to anon, authenticated;
grant execute on function public.bn_admin_xat_silencia(text, text, text, int, text) to anon, authenticated;
grant execute on function public.bn_admin_xat_silencis(text, text) to anon, authenticated;
grant execute on function public.bn_admin_xat_config(text, text, jsonb) to anon, authenticated;
grant execute on function public.bn_admin_xat_cataleg(text, text) to anon, authenticated;
grant execute on function public.bn_admin_xat_actiu(text, text, text, int, boolean) to anon, authenticated;
grant execute on function public.bn_admin_xat_peca_nova(text, text, text, text, int, text) to anon, authenticated;
grant execute on function public.bn_admin_xat_resum(text, text) to anon, authenticated;
