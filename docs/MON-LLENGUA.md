# Com es construeix un món de llengua (Català, Castellano…)

Guia per als mons de llengua, feta a partir del de Català (`motor/dades/catala.js`, `catala/t2`). Les frases amb buits funcionen
igual que a Anglès: el format complet és a [`docs/MON-ANGLES.md`](MON-ANGLES.md), apartat 3. Aquí hi ha el que és propi de llengua.
El pla que en va sortir és a `docs/superpowers/specs/2026-11-17-mon-catala-pla-mestre.md`.

## 1. Frases d'ús, no de regla

Una frase ha de **fer servir** la regla, no recitar-la.

| ❌ De regla | ✅ D'ús |
|---|---|
| «Darrere d'un interrogant s'escriu ___.» (majúscula) | «Quina hora és? ___ tard: corre!» (`Ja és` / `ja és`) |
| «Darrere dels dos punts d'una llista s'escriu ___.» | «Hi ha quatre gèneres: ___, narrativa…» (`poesia` / `Poesia`) |

Deixa'n només 3 o 4 de regla, les més importants. Si canvies el text d'una frase ja publicada, posa-hi `id` amb l'id antic perquè no es perdi el repàs.

- **Fitxes del banc exactes:** a les frases de triar i d'ordenar, les fitxes es comparen tal com són. «?» no és «!», ni «Demà» és «demà». Les respostes escrites (`r`) continuen sense tenir en compte les majúscules ni el punt final.
- **`per`** a cada opció falsa: per què està malament («*llapissos*: llapis és pla i ja acaba en -s»). A les d'escriure, la clau és l'error típic escrit (`cavalla`, `virussos`).
- **`clau`:** la paraula que decideix la resposta (*Quina*, *On*, *a l'hivern*, *dos*).

## 2. Puntuar textos i escoltar

- **Textos sencers:** una frase amb diversos buits, un per signe (`ok:[".",":","."]`, `no:["?","!"]`). Els diàlegs van amb `<br>` i el nom de qui parla (`LAIA:`) surt en gris.
- **`escoltaAbans:true`** al joc: surt «🔊 Escolta-la primer». Llegeix la frase resolta, i l'entonació diu si és pregunta o exclamació. Fes-lo servir només en un joc pensat per a això (al Tema 2, «Escolta i puntua»).
- **`escolta`** a la frase: el text que es llegeix en lloc de la frase resolta. Serveix per als fragments literaris (així no es llegeix la resposta).

## 3. Joc «Pinta les paraules» (`motor/eines/marca-llengua.js`)

```js
{id:"mc-sn",grup:"🏷️ El nom",tipus:"custom",fn:"jocMarca",prova:"jocMarcaProva",ic:"🖍️",titol:"Pinta les peces del SN",sub:"…",col:"#dcfce7",
 enunciat:"🖍️ Pinta les tres peces del sintagma nominal",
 cats:[["E","Especificador","#fde68a"],["N","Nucli","#93c5fd"],["C","Complement","#bbf7d0"]],
 items:[{t:"els teus ulls verds",m:"EENC",ex:"El nucli és <b>ulls</b>…",pista:"(opcional)"}], n:6}
```

- `m` té una lletra per paraula de `t`. `-` vol dir que aquella paraula no es pinta (el nen no l'ha de tocar).
- 1 ⭐ per frase bé a la primera. En fallar, es marquen les paraules mal pintades; al segon intent, surt la solució.
- Usos: les peces del SN, propi o comú, masculí o femení, i més endavant subjecte i predicat.
- Cal `//@inclou eines/marca-llengua.js` al final de les dades. La prova estricta el juga sencer, amb un error a la primera frase.

## 4. Esquemes a la teoria

`T[i].esquema` es pinta a la fitxa sota la idea clau:

```js
esquema:{titol:"Les tres peces del SN",marca:{t:"els teus ulls verds",m:"EENC"},joc:"mc-sn"}   // frase pintada amb els colors del joc
esquema:{titol:"Gènere i nombre",html:"<table>…</table>"}                                      // taula o quadre (classes esq-col, ex)
```

Posa també `practica:"id-del-joc"` al tema perquè surti «✏️ Practica-ho com a classe».

## 5. Mons en castellà: les activitats en castellà

Afegeix `//@inclou eines/ui-es.js` al final de les dades. Els textos del motor que surten dins del contingut (#app) passen al castellà, i la capçalera i el menú es queden en català, iguals a tots els mons. Si veus un text del motor encara en català, afegeix-lo a `UIES` (una entrada `["català","castellano"]` o una regex) i un cas a `motor/prova-ui-es.js`. Una paraula sola només es canvia si és tot el text del node, perquè no toqui el contingut («tú temes»).

## 6. Llista de comprovació

1. Frases d'ús, `per` a les opcions falses i `clau` on calgui.
2. Un joc de pintar per a la gramàtica del tema, amb `esquema` i `practica` al tema.
3. Puntuació: un joc de textos sencers i, si hi ha entonació, un d'«Escolta i puntua».
4. Literatura: fragments curts per classificar (escrits per nosaltres o populars, de domini públic), amb `escolta`.
5. `python3 motor/tot.py`, `node motor/revisa-mon.js <id>` i `node motor/prova-tot.js mons <carpeta>`.
