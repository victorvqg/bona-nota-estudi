# Historial de versions

Les versions de Bona Nota, la més nova a dalt. **La primera entrada és la versió actual.**
Com es numeren i com es puja una versió: apartat «Versions» del [README](README.md).

Les versions fins a la 2.3.0 es van numerar després de publicar-les, a partir de l'historial de commits.

## 2.5.0 · 2026-11-09

### Afegit
- Tauler d'admin: apartat «Repàs, boss i missions», amb errors apresos, repassos, intents i victòries de boss i estrelles de missions per nen.
- La capçalera del tauler mostra el número de versió.

### Corregit
- Tauler: les estrelles de boss, missions, repàs i rècords ja no surten com «D'abans (sense detall)».
- Tauler: l'examen de mates surt amb la seva nota, en lloc de «undefined%» i d'un «Millor examen» sense número.
- Tauler: les sessions expliquen el resultat del boss, els errors apresos al repàs i les pistes.

## 2.4.0 · 2026-11-09

### Afegit
- 🏷️ El número de versió surt al peu de la portada i de cada món.

### Canviat
- El peu dels mons ja no mostra la línia amb el llibre i el tema.

### Corregit
- 📷 La funció que corregeix la foto del quadern accepta peticions des de bonanota.net.

## 2.3.0 · 2026-11-08

### Afegit
- 👾 El boss del món també s'obre si treus un 70 % o més en un examen (sorpresa o de veritat).
- 🔄 Actualització automàtica: en obrir la portada o un món, si la còpia del mòbil és vella, l'app es posa al dia sola. No toca mai el progrés, el nom ni el PIN.

### Corregit
- Rànquing al mòbil: la cinta de notícies ja no es queda quieta a l'iPhone, i la festa dels 5 tocs i els efectes de les pestanyes tornen a sortir bé.
- Els errors de «🔍 Troba l'error» de mates tornen a entrar al repàs.

## 2.2.0 · 2026-11-07

### Afegit
- 🔍 «Troba l'error» de mates més complet: l'error pot ser a qualsevol línia, cal tornar a escriure bé la línia dolenta, surt la llibreta corregida sencera i els errors van al repàs.
- 🔍 «Troba l'error al climograma» al món del clima, amb un tipus de joc nou que pot fer servir qualsevol món.
- ⌨️ Dreceres de teclat als tests, les targetes i les finestres.
- Barra dins de cada tema per anar a «Tots els temes» o canviar entre la fitxa i el test, i botó ⏸ Pausa als reptes amb compte enrere.
- ⭐ Insígnia a la portada amb les estrelles de tots els mons, que obre el rànquing.
- ♿ Accessibilitat amb teclat i lector de pantalla a la portada i a tots els mons.
- 🔗 Accés directe per provar pantalles: `?demo`, `?joc=`, `?tema=`, `?vista=` i `?llibreta=1`.
- 📄 Skill modular per generar els PDFs d'estudi (`skills/bona-nota/`).
- 🧰 Nucli: regles, docs i comprovacions comunes per als agents d'IA.

### Canviat
- Mates: la multiplicació s'escriu amb el punt volat `·`, i la llibreta correcta (vora verda) es distingeix de la que té l'error (vora vermella).

### Corregit
- `?joc=` obre bé el joc demanat, també amb l'àlies `err` de «Troba l'error».

## 2.1.0 · 2026-11-06

### Afegit
- 📖 Món 6 · Català, tema 2: la literatura, el nom i la puntuació.
- 🌐 Domini propi: [bonanota.net](https://bonanota.net).

### Canviat
- Tauler d'admin: el domini per tema i les preguntes més fallades surten plegats per món.

## 2.0.0 · 2026-11-06

Bona Nota 2.0.

### Afegit
- Repàs d'errors ampliat al Taller de mates i al mapa de comarques, 💡 pistes als tests i 🛡️ escut del combo.
- 🎯 Missions d'avui, meta de la colla i pestanya 🧠 Remuntada al rànquing.
- 👾 Boss del món.

## 1.0.0 · 2026-11-05

Recull de tot el que hi havia abans de Bona Nota 2.0.

### Afegit
- Motor comú i 5 mons: clima, Biologia i Geologia, Castellano, comarques i Matemàtiques.
- Portada arcade, entrada amb nom i PIN, progrés al núvol, estrelles, nivells i rànquing.
- Taller de mates i correcció de la foto del quadern.
- Tauler d'admin, base de dades pròpia i còpies de seguretat.
