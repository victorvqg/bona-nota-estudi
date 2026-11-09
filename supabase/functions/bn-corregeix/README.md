# 📷 bn-corregeix · Correcció de la foto del quadern

El nen fa una foto de l'exercici a la llibreta. Aquesta funció la passa a Claude, que:

1. **copia** el que hi ha escrit, línia per línia, tal com ho veu (sense corregir res);
2. ho **compara** amb la resposta model i les idees clau;
3. diu quina és la **primera línia equivocada** i per què, en una frase curta i amable, **sense donar la solució**.

Si la foto no es llegeix o no és aquest exercici, ho diu.

- **La foto no es desa enlloc** i no s'escriu als registres (logs). El PIN tampoc.
- Només s'hi pot entrar amb **nom i PIN** (la mateixa comprovació que l'app: 5 errors en 15 minuts bloquegen el nom).
- **Límit:** 10 fotos per nen i dia, i 200 entre tots els nens cada dia. Si Claude no respon, la foto no compta.
- Fitxers: `index.ts` (la funció) i `supabase/bn_fotos.sql` (el comptador de fotos i la comprovació del PIN).

**Adreça:** `https://agippwtqvhpxdockuigl.supabase.co/functions/v1/bn-corregeix`

---

## Com s'activa (una sola vegada)

### 1. La base de dades

Al panell de Supabase: **SQL Editor** → enganxa tot `supabase/bn_fotos.sql` → **Run**.
Crea la taula `bn_fotos` (quantes fotos envia cada nen cada dia) i les funcions `bn_foto_permis` i `bn_foto_torna`.
Només les pot fer servir el servidor, no els nens.

### 2. La clau de Claude (Anthropic)

1. A https://console.anthropic.com → **API Keys** → crea una clau (comença per `sk-ant-`).
2. Al panell de Supabase: **Edge Functions** → **Secrets** → afegeix `ANTHROPIC_API_KEY` amb aquesta clau.

O bé, des d'un Terminal del Mac (amb el CLI de Supabase i `supabase login` fet):

```
supabase secrets set ANTHROPIC_API_KEY=sk-ant-LA_TEVA_CLAU --project-ref agippwtqvhpxdockuigl
```

Mai posis la clau en cap fitxer del repo.

**Opcionals** (si no hi són, es fan servir els valors de la dreta). Es canvien als mateixos Secrets i no cal tornar a desplegar:

| Secret | Què és | Per defecte |
|---|---|---|
| `BN_MODEL` | Model de Claude | `claude-sonnet-5-5` |
| `BN_FOTOS_DIA` | Fotos per nen i dia | `10` |
| `BN_FOTOS_TOTAL` | Fotos entre tots els nens cada dia | `200` |

`SUPABASE_URL` i la clau de servei ja hi són per defecte: no cal posar-les.

### 3. Desplegar la funció, SENSE verificació de JWT

L'app fa servir les claus noves (`sb_publishable_…`), que no són JWT. Per això la funció
**s'ha de desplegar amb la verificació de JWT apagada**. Si no, totes les fotos fallaran.
La funció ja comprova el nom i el PIN pel seu compte.

**Opció A · Terminal del Mac**, des de la carpeta del repo:

```
supabase functions deploy bn-corregeix --no-verify-jwt --project-ref agippwtqvhpxdockuigl
```

(Si no tens el CLI instal·lat: `npx supabase functions deploy …` amb els mateixos paràmetres.)

**Opció B · Panell de Supabase:** **Edge Functions** → **Deploy a new function** → **Via Editor**.
Nom: `bn-corregeix`. Enganxa tot `index.ts` i fes **Deploy**.
Després, a la pàgina de la funció → **Details** (o **Settings**), apaga **Verify JWT** («Enforce JWT verification») i desa.

Cada vegada que canviï `index.ts`, cal tornar a desplegar (amb la verificació de JWT apagada).

### 4. Comprovar que funciona

Des d'un Terminal. Aquesta prova no envia cap foto i no gasta res:

```
curl -s https://agippwtqvhpxdockuigl.supabase.co/functions/v1/bn-corregeix \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_e0JKwY8VUWCagsm2OzzKpg_9pU_M94p" \
  -d '{"nom":"prova","pin":"0000A","enunciat":"Prova","imatge":""}'
```

Ha de tornar `{"ok":false,"error":"imatge","missatge":"No ha arribat cap foto. …"}`.

- Si torna `"error":"no_configurat"`: falta el secret `ANTHROPIC_API_KEY` (pas 2).
- Si torna un error 401 (per exemple `Invalid JWT` o `Missing authorization header`): la funció s'ha desplegat
  amb la verificació de JWT encesa (pas 3).

Després, prova-ho des de l'app amb un nen de veritat. Si torna `"error":"intern"`, mira els registres (a sota):
sovint vol dir que falta executar `bn_fotos.sql` (pas 1).

---

## Què rep i què torna

**Petició** (POST, JSON): `{nom, pin, assig, enunciat, model, punts, imatge}`

- `enunciat`: el text de l'exercici (pot portar HTML senzill com `<b>`); `model`: la resposta model;
  `punts`: la llista d'idees clau; `imatge`: `"data:image/jpeg;base64,…"` (l'app ja la redueix a 1.600 px).
- Si la foto passa d'uns 4 MB, es rebutja.

**Resposta:** sempre HTTP 200 i JSON.

- Bé: `{"ok":true, "llegit":["línia 1", …], "correcte":true|false, "primer_error":{"linia":2, "que":"…", "per_que":"…"} | null, "missatge":"…", "queden":7}`
  - `linia` és la posició dins de `llegit`, comptant des de 0. `queden` = fotos que li queden avui.
- Error: `{"ok":false, "error":"…", "missatge":"frase per al nen"}`

| Error | Quan passa |
|---|---|
| `no_configurat` | Falta el secret `ANTHROPIC_API_KEY` |
| `pin` | Nom o PIN incorrectes, o el nom està bloquejat 15 minuts per massa intents |
| `limit` | Ja ha enviat les fotos del dia (o tota l'app ha arribat al màxim). El missatge diu quantes es poden enviar |
| `imatge` | No hi ha foto, és massa gran, no és una foto, no es llegeix o no és aquest exercici |
| `intern` | Qualsevol altra cosa (Claude no respon, la base de dades no respon…) |

Només accepta peticions del navegador des de `https://bonanota.net`, `https://victorvqg.github.io`, `http://localhost:8000` i `http://127.0.0.1:8000`.

## Registres i fotos enviades

- **Registres:** panell de Supabase → **Edge Functions** → `bn-corregeix` → **Logs**.
  Cada correcció escriu una línia com `corregit · correcte=false · 6 línies · 9200 ms · tokens 1850+240`.
  Mai hi surt la foto, el PIN ni el que ha escrit el nen.
- **Quantes fotos s'envien** (SQL Editor):

```
select dia, sum(n) as fotos, count(*) as nens from public.bn_fotos group by dia order by dia desc;
```
