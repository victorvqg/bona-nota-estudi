# Com es construeix un món de Matemàtiques

Guia per fer un món nou de mates (un tema del llibre) igual que el de Divisibilitat (`motor/dades/divisibilitat.js`,
publicat a `matematiques/divisibilitat`). El motor és el mateix de tots els mons: aquí només hi ha el que és propi de mates.
Els passos comuns (`mons.json`, `tot.py`, proves, versió) són a l'apartat «Afegir o actualitzar un món» del [README](../README.md).
El pla que va donar forma al taller visual és a `docs/superpowers/specs/2026-11-17-mons-mates-pla-mestre.md`.

## 1. Les eines

Al final del fitxer de dades, en aquest ordre:

```js
//@inclou eines/vistes-mates.js      // dibuixos de la llibreta amb marques (MXV) i la vista de la teoria
//@inclou eines/exercicis-mates.js   // ✏️ taller: generadors, fitxes, examen, repàs barrejat, Troba l'error
//@inclou eines/manipulatius-mates.js // 🧸 rectangles, arbre, granotes, rajoles
//@inclou eines/quadern.js           // 📒 comprovar el quadern i la foto a les obertes
//@inclou eines/pissarra.js          // ✏️ full de brut
```

## 2. Un generador del taller

Cada tipus d'exercici és una funció de `MXG` que rep el nivell (1, 2, 3) i torna `{enun, passos, sol}`. Els números surten
nous cada vegada i el càlcul el fa el programa. Cada pas:

| Camp | Què és |
|---|---|
| `t` | `num` (teclat), `llista` (nombres amb comes), `tria` (opcions), `fact` (potències amb ＋ i −) |
| `q`, `r` | La pregunta i la resposta bona (`op` a les de triar, `primers` a les de potències) |
| `err(v)` | L'error típic: `mxE("codi","missatge")`. El codi va al tauler |
| `ctx(mk)` | **El dibuix del pas.** Sense `mk`, net; amb `mk`, marca on cal mirar. Ve de la pista 2, d'un error (`mk.v` és el valor equivocat) o del mode 👀 Mira |
| `pista` | 💡 Graó 1: una pregunta que fa pensar. No treu l'estrella |
| `pista2` | 💡💡 Graó 2: el text que acompanya la marca del dibuix. Des d'aquí, el pas ja no dona estrella |
| `mig` | 💡💡💡 Graó 3: mig resultat. Si no n'hi ha, el motor el fa sol (primera xifra, la meitat de la llista, quins primers hi surten o treure una opció) |
| `perque`, `noEx`, `w`, `id` | «🤔 Per què?», no surt a l'examen, pes a l'examen i nom curt per al registre |

Escriu el `ctx` amb les vistes de `MXV`, i no amb HTML a mà: així totes les fitxes s'assemblen i la marca és igual a tot arreu.

## 3. Les vistes (`motor/eines/vistes-mates.js`)

| Vista | Per a | La marca |
|---|---|---|
| `MXV.xifres(n, modo, mk, suma)` | Criteris: `ult` (2, 5, 10), `dues`, `suma` (3, 9), `alt` (11) | Les xifres que manen, en groc i amb contorn |
| `MXV.escala(files, k, {mk, err, p, tira})` | L'escala de divisions | La fila que toca, la tira de primers (l'error en vermell) i com es prova el primer |
| `MXV.potencies(files, quin, mk)` | MCM i MCD, alineats per columnes de primers | Les columnes comunes, sempre en verd. Amb `mk`, les potències que s'agafen |
| `MXV.parelles(n, k)` | Divisors per parelles | — |
| `MXV.proves(n)` | Primer o compost | La primera divisió exacta |
| `MXV.taula(b, de, fins)` | Múltiples en un rang | Els que hi entren |
| `MXV.recta(a, b, fins)` | MCM: salts de dos nombres | — |
| `MXV.rajola(a, b)` | MCD: el terra amb la quadrícula | — |

La divisió llarga té el dibuix propi dins del generador `divisio`: hi marca el nombre que es divideix, el que es resta, la xifra que baixa (↓) i el quocient.
A l'examen no hi ha marques. Per a temes nous (fraccions, enters, potències), afegeix-hi una vista i un cas a `motor/prova-vistes-mates.js`.

## 4. La teoria amb un exemple dibuixat

Un tema pot portar `vista`, que es pinta a la fitxa sota la idea clau:

```js
{id:"mcd",vista:{tipus:"potencies",a:12,b:18,quin:"MCD",titol:"MCD (12, 18) = 2 · 3 = 6"},…}
```

Tipus: `escala` (`n`), `potencies` (`a`, `b`, `quin`), `xifres` (`n`, `d`) i `parelles` (`n`).

## 5. Ponts amb els manipulatius

- **Del taller als manipulatius.** A «🤔 Abans de calcular» del MCM i del MCD i a la pista 2 dels problemes surt «🐸 granotes» (MCM fins a 60) o «🧱 rajoles» (MCD amb nombres fins a 60), amb els mateixos números. En acabar, torna a l'exercici. Fer-ho no paga i aquell pas ja no dona estrella.
- **Dels manipulatius al taller.** En acabar les granotes o les rajoles surt «✏️ Ara calcula el MCM / MCD com a classe», que obre la fitxa amb aquells números (`mxComençaAmb`).

## 6. Com es veu

- Els passos fets es pleguen («✅ 6 passos fets»). Hi ha una barra de passos, i a partir del 2n pas la pantalla es col·loca al dibuix.
- El teclat porta «Comprova» a l'última fila. A 360 px, el dibuix, la pregunta i el teclat hi caben sense scroll a tots els passos de nivell 🟢 i 🟡. Al 🔴, el primer pas i el de potències d'una escala de 7 o 8 files encara demanen una mica de scroll.
- 👀 Mira: a cada pas, primer «Pensa-hi tu» amb el dibuix marcat i després «Mostra la resposta». Al final, «✍️ Fes aquest mateix tu».

## 7. Comprovació abans de publicar

```
python3 motor/tot.py
node motor/prova-vistes-mates.js
node motor/prova-generadors.js
node motor/prova-tot.js mons matematiques/<carpeta>
```

La prova del món juga cada fitxa en els tres modes, i també amb **un error a cada pas**. Comprova que el dibuix hi reacciona i que les 3 pistes van en ordre i treuen l'estrella a partir de la segona.
