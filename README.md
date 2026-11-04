# ⭐ Bona Nota · Estudia jugant (1r ESO)

**Web:** https://victorvqg.github.io/bona-nota-estudi/

Bona Nota és una web per **repassar** els temes de 1r d'ESO **jugant**. Cada tema és un «món» amb fitxes, targetes,
tests, jocs i preguntes d'examen. Els nens hi guanyen estrelles, pugen de nivell i competeixen en un rànquing.

No serveix per aprendre un tema des de zero. Primer s'estudia amb el llibre i els apunts de l'institut.
Després, aquí es comprova si se sap de veritat.

| Món | Assignatura | Tema | Carpeta |
|---|---|---|---|
| 1 | Ciències socials | Tema 3: El clima | `sociales/t3-clima/` |
| 2 | Biologia i Geologia | Bloc 1: Univers, Terra i cèl·lula | `bio-i-geo/univers/` |
| 3 | Lengua Castellana | Temas 2 y 3 | `castellano/t2-t3/` |
| 4 | Ciències socials | Les comarques de Catalunya | `sociales/comarques/` |

La llista oficial de mons és `motor/mons.json`.

---

## 🎮 Com funciona (per als nens)

- **Entrar:** a la portada, el nen escriu el seu **nom i un PIN** i de seguida **tria el món**. Dins dels mons ja no
  li torna a demanar res. Amb el PIN, el progrés es desa al núvol i el pot recuperar des d'un altre aparell.
  En un mateix aparell hi poden entrar com a màxim 2 noms. «No ets tu?» (a la portada) o «Canviar d'usuari» (dins d'un món) canvien de nen.
- **Cada tema té 3 passos:** 📄 fitxa → 🃏 targetes → ✅ test.
  El test fa 6 preguntes a l'atzar del tema. Amb un **70 %** s'aprova i es passa sol al tema següent.
- **Repàs dels errors:** el que falla torna a sortir avui, i el que encerta torna d'aquí a 3 dies i després a 7 dies.
- **Jocs:** ordenar, fer parelles, classificar, llegir un dibuix, i jocs propis de cada món (per exemple, el mapa de les comarques).
- **Exàmens:** l'examen sorpresa (15 preguntes barrejades) i l'examen de veritat, amb nota sobre 10.
- **Preguntes obertes:** el nen escriu la resposta, la compara amb la resposta model i marca les idees clau que ha posat.
- **🔊 Escolta:** llegeix en veu alta la fitxa o la pregunta.
- **Mode suau:** treu les animacions fortes (també s'activa sol si l'aparell ho té demanat).
- **App:** es pot afegir a la pantalla d'inici del mòbil i funciona sense connexió.

### ⭐ Estrelles, superestrelles i nivells

- **Estrelles:** +1 per cada encert als tests i als jocs, +1 per idea clau a les obertes, i regals per combos
  (×5 seguides: +1; ×10: +2). Per jugar net, cada pregunta només dona estrella un cop al dia.
- **A dalt de tot** es veu el total de **tots els mons**. Si toques les estrelles, surt el detall per món.
  El total compta el que hi ha en aquell aparell i també el que hi ha al núvol.
- **🌠 Superestrelles:** cada 50 ⭐ (sumant tots els mons) en surt una, amb animació i música pròpies.
- **Nivells:** d'🐣 Aprenent a 🌟 Llegenda d'or, segons les estrelles de cada món.

### 🏆 Rànquing (a la portada)

- Podi, taula de classificació amb les estrelles de cada món, fletxes ▲▼ (llocs pujats o baixats des de l'última
  vegada), la teva posició («Et falten 13 ⭐ per atrapar…») i els premis de la colla.
- Pestanyes: ⭐ Estrelles, ⏱ Temps, 🏅 Nivell i 📈 Setmana. Compta els últims 120 dies.
- **Demo amb nens inventats:** obre la portada amb `?demo` (per exemple `http://localhost:8000/?demo`).
- **🥚 Secret:** toca **5 vegades seguides i ràpid** dins del rànquing (fora dels botons) i es fa una **festa amb música**.
  Del 2n al 4t toc surt una guspira ✨⚡🔥 i un «bip» cada cop més agut. Cada vegada surt una festa diferent:
  🌋 **Terratrèmol** (Grieg, «A la cova del rei de la muntanya», cada cop més ràpid i amb un BUM final),
  🥁 **Desfilada** (Mozart, «Marxa turca», amb els nens del rànquing desfilant) i
  🐝 **Abellots** (Rimski-Kórsakov, «El vol del borinot»). Totes tres músiques són de domini públic.
  Si el so està apagat, la festa només es veu. En mode suau només surt un rètol quiet.

---

## 🗂️ Com està fet

Tots els mons fan servir el **mateix motor**. Només canvien les **dades** de cada món.

```
index.html                     Portada: targetes dels mons + rànquing
<assignatura>/<tema>/index.html  Pàgina de cada món (GENERADA: no s'edita a mà)
motor/
  plantilla-estudi-interactiu.html   El motor (tot el que fa un món)
  dades/<id>.js                      Contingut de cada món (temes, preguntes, jocs, obertes)
  mons.json                          Llista de mons (carpeta, número, títol, colors, icona…)
  build.py                           Genera un món: plantilla + dades → pàgina
  tot.py                             Genera TOTS els mons, les targetes de la portada i sw.js
  prova.js                           Prova automàtica d'un món (Playwright)
  local.py                           Servidor local que es posa al dia sol amb GitHub
  eines/mapa-comarques.js            Genera el mapa SVG de les comarques
admin/                         Panell d'administració (activitat, noms, rànquing)
supabase/*.sql                 Base de dades: registre, rànquing, perfils amb PIN, progrés al núvol
sw.js, manifest.webmanifest, icones/   App instal·lable i sense connexió (sw.js el genera tot.py)
```

---

## 🛠️ Feines habituals

### Veure-ho en local

Des de la carpeta del repo, en un Terminal:

```
python3 motor/local.py
```

Obre http://localhost:8000. Cada 20 segons baixa de GitHub el que hi hagi de nou: només cal recarregar la pàgina.
Ctrl+C l'atura.

> Compte: en local també es fa servir la base de dades real. El que hi facis compta al rànquing.
> Per provar, fes servir `?demo` a la portada.

### Afegir o actualitzar un món

1. Escriu o amplia les dades a `motor/dades/<id>.js` (mateix format que els altres: `ASSIG`, `T`, `OB`).
2. Si és un món nou, afegeix-lo a `motor/mons.json`:
   `dades`, `carpeta`, `mon`, `materia`, `titol`, `desc`, `colors` (3), `ic` (i `llengua: "es"` si és en castellà).
3. Regenera-ho tot i passa la prova:

```
cd motor
python3 tot.py
ESTRICTE=1 node prova.js $PWD/../<carpeta>/index.html
```

La prova ha d'acabar amb «errors: cap».

**Regles del contingut:** tot surt dels apunts o del llibre (res inventat). Mínim **8 preguntes per tema**,
3 opcions i una sola correcta. Els errors falsos han de ser errors típics, mai opcions absurdes.
Si una dada és dubtosa, no va al test i la fitxa diu «pregunta-ho al profe».

### Millorar el motor

Els canvis comuns a tots els mons (sons, estrelles, pantalles…) es fan a `motor/plantilla-estudi-interactiu.html`.
Després, `python3 tot.py` els aplica a tots els mons, i cal passar la prova de cada món.
**Mai s'edita una pàgina generada** (`<assignatura>/<tema>/index.html`): el canvi es perdria i la revisió fallaria.

### Publicar

Fes commit i push a `main`. GitHub Pages ho publica en 1 o 2 minuts.
Per provar una cosa gran abans de publicar-la, treballa en una altra branca i mira-la en local.

---

## ✅ Revisió automàtica

A cada push, GitHub Actions (`.github/workflows/revisa.yml`) fa dues coses:

1. Torna a generar tots els mons i la portada. Si una pàgina pujada no coincideix (editada a mà o sense regenerar), falla i diu quins fitxers.
2. Passa la prova de cada món en mode estricte: tests, jocs, exàmens, repàs, obertes, estrelles, superestrelles i rànquing de la capçalera.
   També exigeix 8 preguntes per tema, i que la resposta correcta no sigui massa sovint (ni massa poc) la més llarga.

El resultat surt a la pestanya **Actions** del repo.

---

## 🔒 Dades

- **Al navegador** (localStorage): el progrés de cada nom, separat per món.
- **Al núvol** (Supabase), només amb nom i PIN: el progrés de cada món, per poder canviar d'aparell.
- **Registre d'activitat** (`bn_log`): què fa cada nen i quan, per al panell d'admin i el rànquing. Només s'hi pot escriure; llegir-lo només ho pot fer l'admin.
- **Rànquing:** `bn_ranking_mons` (total i estrelles per món). Els noms amagats o no permesos no hi surten.
- Els canvis a la base de dades es fan a Supabase i el seu SQL es desa a `supabase/`.
