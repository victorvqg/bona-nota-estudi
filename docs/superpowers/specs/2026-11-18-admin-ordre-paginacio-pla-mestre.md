# Pla mestre · Tauler d'admin sense pantallassos, més ordenat i amb paginació

18/11/2026 · Versió 2.54.0 · Revisió de `admin/index.html` (4.549 línies), feta amb el codi i captures del mode demo (`/admin/?demo`) a 1280 px.

**Estat:** decisions preses el 18/11/2026: totes les recomanacions de la secció 4. **Fase 1 feta a la 2.55.0, fase 2 a la 2.56.0, fase 3 a la 2.57.0 i fase 4 a la 2.58.0** (cal aplicar `supabase/bn_log.sql` a Supabase). Diferències amb el pla:
- La comprovació mira les 50 últimes accions del registre (`bn_admin_logs?limit=50`): les novetats que no passen pel registre (missatges nous del xat) no fan sortir l'avís.
- «Actualitza» també repinta sense esquelets.
- La banda de versió nova té «Més tard», que l'amaga fins a la versió següent.
- Fase 2: la pàgina es manté en actualitzar les taules que conserven la cerca (sessions, mons, log…); les altres, i qualsevol canvi de filtre o de període, tornen a la pàgina 1.
- Fase 3: la secció Xat és una sola pàgina amb les dues targetes (Missatges i Silenciats), sense pestanyes. L'id intern de «Activitat» continua sent `sessions` (`?v=sessions`) perquè els enllaços vells funcionin. La pàgina de cada taula no va a l'adreça: es recorda en memòria mentre el tauler és obert.
- Fase 4: `p_des_id` compara per id (l'identitat de `bn_log` creix amb cada fila). El tauler detecta un SQL vell per l'error 404/400 i ho recorda (`LOGS_INCR=false`) fins que es torna a entrar.

**En poques línies.** El tauler funciona: les 12 proves de la interfície surten en verd (`node motor/prova-tot.js interficie`, amb les 7 de l'admin). Però té tres problemes:
1. **El «pantallasso».** Cada 30 segons, i cada vegada que es torna a la pestanya, **es torna a pintar tota la pantalla**: esquelets grisos, gràfics destruïts i refets i taules noves. I quan es publica una versió nova del web, **la pàgina es recarrega sola**. Amb les fusions automàtiques, això passa diverses vegades al dia.
2. **Cap taula té paginació.** Es pinten totes les files de cop. A «Curs» (365 dies) poden ser centenars de sessions i milers d'accions, i el log complet **talla a 500 o 1.500 accions** sense deixar veure la resta.
3. **L'ordre.** Hi ha coses repetides (el «Log complet» és una pestanya i també un botó) i altres de mal trobar: la moderació del xat és dins de Rànquing, i «Dificultat real» surt a dos llocs.

Proposo 5 fases. Les dues primeres resolen el que molesta més (el pantallasso i la paginació) i no toquen la base de dades. Al final hi ha 6 decisions.

---

## 1. Com és ara

### 1.1 Les seccions

| Menú | Pestanyes | Què hi ha |
|---|---|---|
| **Inici** | — | 6 xifres, Control ràpid (xat i mons), Alertes, Nens nous, Estrelles per origen… |
| **Nens** | Llista · Benestar · Missatges al nen | Taula de nens → fitxa amb 4 pestanyes (Resum, Aprenentatge, Sessions, Núvol) |
| **Mons** | Llista · Dificultat real | Taula de mons → fitxa amb 4 pestanyes (Resum, Domini i errors, Obertes, Taller) |
| **Sessions** | Sessions · Log complet per dia · Activitat | Taula de sessions, el log (per dia o en taula) i gràfics |
| **Rànquing** | Classificació · Reptes · Xat | Classificació pública, combos i repàs, i la moderació del xat |
| **Configuració** (engranatge) | Horaris i crèdits · Rànquing · Catàleg del xat · Llindars · Còpies | |

A dalt de tot hi ha el període (Avui · 7 dies · 30 dies · Curs), «Actualitzat a les 10:37 · auto» i el botó «Actualitza».

### 1.2 D'on surt el pantallasso (el codi)

| Causa | On | Què fa |
|---|---|---|
| **A · Actualització automàtica** | `refrescaAuto()` (cada 5 s mira si han passat 30 s: `AUTO_MS`), i també en tornar a la pestanya (`visibilitychange`), en tornar el focus a la finestra i en recuperar la connexió | Esborra **totes** les dades guardades (`invalidarDades`) i crida `pinta()`. Cada vista fa `c.innerHTML=…` amb esquelets (`esqKpis`, `esq esq-f`), destrueix tots els gràfics (`GRAF.forEach(g=>g.destroy())`) i els torna a fer, amb animació. Després torna l'scroll al seu lloc (`scrollTo(0,sy)`), però durant un moment la pantalla salta. |
| **B · Versió nova del web** | `comprovaVersioAdmin()`, en carregar i cada vegada que es torna a la pestanya | Si `VERSIO_ADMIN` del servidor és diferent, fa `location.replace(…)`: **recàrrega sencera** i es perd el que s'estava mirant (panell lateral obert, una fila desplegada…). |
| **C · Es torna a baixar tot el registre** | `baixaLogs()` dins de `refrescaAuto` | Baixa el registre sencer del període cada 30 s, en pàgines de 1.000, fins a 20.000 files. A «Curs» és lent i fa que l'espera (i el salt) sigui més llarga. |

L'actualització ja s'atura si hi ha un diàleg obert, el panell lateral obert o s'està escrivint en un camp, però no en els altres casos: llegint una taula, amb un dia del log desplegat, amb un gràfic a la vista…

### 1.3 On hi ha moltes dades i no hi ha paginació

`taula()` (la taula comuna, amb cerca, ordenació i CSV) **pinta totes les files**. Les llistes que poden créixer molt:

| Llista | On | Mida possible a «Curs» |
|---|---|---|
| Sessions | Sessions | Centenars o milers |
| Log complet (per dia i en taula) | Sessions | Milers d'accions; avui **talla a 500 o 1.500** (`slice(0,500)`, `slice(0,1500)`) |
| Historial de sessions del nen | Fitxa del nen · Sessions | Centenars |
| Respostes obertes | Fitxa del nen i fitxa del món | Centenars |
| Dificultat real de les preguntes | Mons · Dificultat real i fitxa del món | Fins a les 808 preguntes |
| Missatges del xat | Rànquing · Xat | Centenars |
| Alertes | Inici | Desenes (amb 14 informatius ja és llarga) |
| Còpies de seguretat | Configuració · Còpies | Una per nit: més de 300 en un curs |

Les llistes petites (nens, mons, classificació, nens nous) no en necessiten.

### 1.4 Desordre

- **«Log complet per dia»** és una pestanya de Sessions i també un botó dins la pestanya Sessions.
- **La moderació del xat** és dins de Rànquing, però el catàleg i els horaris del xat són a Configuració. Per moderar s'han de fer 2 clics.
- **«Dificultat real»** surt com a pestanya de Mons (tots els mons) i dins de cada fitxa del món. Està bé tenir-la als dos llocs, però s'han de poder distingir pel títol.
- **Inici és llarga** (1.400 px a 1280 px d'ample): el Control ràpid queda per sobre de les Alertes, que és el que cal mirar primer.
- El rètol diu «S'actualitza sol cada 30 s», cosa que és justament el que molesta.

---

## 2. Proposta

### A · Actualització sense pantallasso (el més important)

1. **L'actualització automàtica no torna a pintar mai la pantalla.**
   - Cada 60 s, només si la pestanya és visible, demana al servidor les dades noves **en segon pla**.
   - **Si no hi ha res nou:** no toca res, i només canvia l'hora d'«Actualitzat a les…».
   - **Si hi ha novetats:** apareix un avís petit a la capçalera, «🔵 3 accions noves · Mostra-les». Només en clicar-lo es repinta la vista, i sense esquelets.
2. **Les 6 xifres de dalt sí que s'actualitzen soles,** però al seu lloc: canvia el número i res més es mou.
3. **Quan es repinta (en clicar «Mostra-les», «Actualitza» o en canviar el període):**
   - El contingut vell es queda a la vista fins que el nou és a punt, i aleshores es canvia d'una vegada. Els esquelets només surten la primera vegada que s'obre una vista.
   - Els gràfics s'actualitzen amb `chart.update("none")`, sense destruir-los ni animar-los.
   - Es manté tot: scroll, pestanya, pàgina de cada taula, files i dies desplegats, cerca i ordenació.
4. **Versió nova del web:** no recarrega sola. Surt una banda a dalt, «Hi ha una versió nova del tauler · Recarrega», i és l'admin qui decideix quan.
5. **Tornar a la pestanya** fa la mateixa comprovació silenciosa del punt 1, no una recàrrega.

### B · Paginació a totes les taules llargues

Una sola peça a `taula()`, que fan servir totes les taules:
- **25 files per pàgina** per defecte, amb un selector de 25 · 50 · 100.
- A sota: «‹ Anterior · Pàgina 2 de 14 · Següent ›» i «Files 26-50 de 340».
- **La cerca, l'ordenació i el CSV** treballen amb **totes** les files, no només amb la pàgina. En cercar o ordenar es torna a la pàgina 1.
- Es recorda la pàgina de cada taula (en tornar d'una fitxa i en actualitzar).
- Les taules de menys de 25 files no mostren res de nou.

**El log per dia**, que no és una taula:
- **7 dies per pàgina** («Dies més antics ›»).
- Dins de cada dia, les primeres 50 accions i un botó «Mostra'n 50 més».
- **Es treu el tall de 500 o 1.500**: es pot arribar a qualsevol acció del període.

**Les alertes:** 10 per pàgina, amb «malament» i «avís» sempre primer.

### C · Més ordre

Proposta de menú:

| Menú | Pestanyes | Canvi |
|---|---|---|
| **Inici** | — | Alertes **a dalt**, sota les 6 xifres. Després el Control ràpid, Nens nous i Estrelles. |
| **Nens** | Llista · Benestar · Missatges al nen | Igual |
| **Mons** | Llista · Dificultat real | Igual. A la fitxa del món, el títol passa a «Dificultat real d'aquest món». |
| **Activitat** (abans «Sessions») | Sessions · Log per dia · Gràfics | Es treu el botó repetit «Log complet per dia». |
| **Rànquing** | Classificació · Reptes | Se'n treu el Xat |
| **Xat** (nou al menú) | Missatges · Silenciats | La moderació en un clic. El catàleg i els horaris es queden a Configuració, amb un enllaç «Horaris i catàleg ›». |
| **Configuració** | Igual | — |

I a més:
- El rètol de l'hora passa a dir «Actualitzat a les 10:37 · comprova novetats cada minut».
- Totes les pestanyes, pàgines i filtres van a l'adreça (`?v=…&tab=…&pg=…`), com ja passa amb la vista i el període, perquè «Enrere» del navegador torni exactament on s'era.

### D · Baixar només el que és nou (opcional, toca la base de dades)

- Afegir un paràmetre `p_des_id` a `bn_admin_logs` (`supabase/bn_admin_tauler.sql`) perquè torni només les files posteriors a l'última que ja té el tauler.
- La comprovació del punt A.1 passa de baixar fins a 20.000 files a baixar-ne unes poques, i és instantània.
- Cal aplicar l'SQL a Supabase a mà (el Víctor), com sempre. Si no s'aplica, el tauler continua funcionant amb la baixada sencera.

### E · Revisió de correcció

Abans de tocar res, es comproven a mà en mode demo i amb les proves:
- les xifres d'Inici contra el log (sessions, temps, nens actius) als 4 períodes;
- que cada fila clicable obre la fitxa o el panell bons, i que «Enrere» hi torna;
- el mòbil (390 px): la barra de baix, les taules amb scroll horitzontal i la paginació a sota;
- el tema fosc a totes les seccions.

En aquesta revisió no he trobat cap error de càlcul. Si n'apareix algun, s'arregla a la fase on toqui.

---

## 3. Fases

| Fase | Què | Toca | Mida |
|---|---|---|---|
| **1** | **Sense pantallasso:** comprovació silenciosa cada 60 s, avís «N novetats · Mostra-les», xifres al seu lloc, canvi d'una vegada sense esquelets, gràfics amb `update`, i banda de versió nova en lloc de recàrrega | `admin/index.html` | M |
| **2** | **Paginació** a `taula()` (25/50/100, recordada), log per dia paginat amb «Mostra'n 50 més» i sense tall, alertes de 10 en 10 | `admin/index.html` | M |
| **3** | **Ordre:** menú amb «Activitat» i «Xat», alertes a dalt a Inici, fora el botó repetit, títols, i pestanya i pàgina a l'adreça | `admin/index.html`, `registres.py` si cal | S-M |
| **4** | *(opcional)* **Baixada incremental** amb `p_des_id` | `supabase/bn_admin_tauler.sql`, `admin/index.html`, prova SQL | S |
| **5** | Docs (`ARQUITECTURA.md`, `ESTAT.md`, `CHANGELOG.md`), versió i captures | docs | S |

Cada fase és un PR, amb `python3 motor/tot.py`, `node motor/prova-tot.js base` i `node motor/prova-tot.js interficie`.

**Proves noves:**
- `motor/prova-admin-auto.js`:
  - Amb dades iguals, una actualització automàtica **no canvia cap node** del contingut: es comprova que el mateix element `#contingut > *` continua al DOM, que no hi ha cap `.esq` i que l'scroll no s'ha mogut.
  - Amb dades noves, surt l'avís i la vista no canvia fins que es clica.
  - Una versió nova mostra la banda i **no** recarrega.
- `motor/prova-admin-pagines.js`:
  - Una taula de 340 files en pinta 25.
  - «Següent» porta a 26-50.
  - Cercar torna a la pàgina 1.
  - El CSV porta les 340.
  - El log arriba a la primera acció del període.

**Criteris de fet:**
- Amb el tauler obert 10 minuts a «Curs», la pantalla no salta ni una vegada si no es clica res.
- Publicar una versió nova no recarrega el tauler de ningú.
- A «Curs», la taula de sessions i el log es poden recórrer fins a la primera acció, de 25 en 25 o de dia en dia.
- La moderació del xat és a un clic del menú.

---

## 4. Decisions que has de prendre

1. **Novetats automàtiques:** avís «N novetats · Mostra-les» (no es mou res sense clicar) o que s'actualitzin soles però sense salt? *Recomano l'avís, amb les 6 xifres actualitzades soles.*
2. **Cada quant es comprova:** 30 s, 60 s o només en tornar a la pestanya? *Recomano 60 s, i també en tornar a la pestanya.*
3. **Files per pàgina:** 25, 50 o 100 per defecte? *Recomano 25, amb el selector per canviar-ho.*
4. **Xat al menú principal** (i fora de Rànquing)? *Recomano que sí.*
5. **Canviar el nom de «Sessions» per «Activitat»?** *Recomano que sí: hi ha sessions, log i gràfics.*
6. **Fase 4 (baixada incremental, cal aplicar SQL a Supabase):** ara o més endavant? *Recomano fer-la després de les fases 1-3, quan ja no hi hagi pantallasso.*
