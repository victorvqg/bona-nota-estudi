# Bona Nota · Estudi interactiu (1r ESO)

Pàgines d'estudi interactives per assignatura, publicades amb GitHub Pages.

- Inici: `index.html` (menú d'assignatures)
- Cada tema: `<assignatura>/<tema>/index.html` (generat, no s'edita a mà). Ex.: `sociales/t3-clima/`
- Motor comú: `motor/plantilla-estudi-interactiu.html`
- Contingut de cada assignatura: `motor/dades/<assignatura>.js`

## Afegir o actualitzar un món

1. Dades a `motor/dades/<id>.js` (mateix format que les altres: `ASSIG`, `T`, `OB`).
2. Una entrada a `motor/mons.json`: `dades`, `carpeta`, `mon`, `materia`, `titol`, `desc`, `colors` (3), `ic` (i `llengua: "es"` si és en castellà).
3. Regenerar-ho tot (pàgines i targetes de la portada):

```
cd motor
python3 tot.py
ESTRICTE=1 node prova.js $PWD/../<carpeta>/index.html   # prova automàtica (Playwright)
```

4. Commit + push. GitHub Pages publica en 1-2 minuts.

**Revisió automàtica:** a cada push, GitHub Actions (`.github/workflows/revisa.yml`) torna a generar-ho tot i
falla si alguna pàgina generada no coincideix (editada a mà o sense regenerar), i passa la prova de cada món en
mode estricte (8 preguntes per tema com a mínim; la resposta correcta no pot ser la més llarga en més del 40 %
ni en menys del 15 % de les preguntes). Mira la pestanya «Actions» del repo.

**App instal·lable:** `manifest.webmanifest`, `icones/` i `sw.js` (generat per `tot.py` amb la llista de mons i una versió nova a cada canvi) permeten afegir Bona Nota a la pantalla d'inici i fer-la servir sense connexió.

Les millores del motor es fan a la plantilla i es regeneren tots els mons amb `tot.py`.
El progrés de cada nen es guarda al navegador del seu aparell (localStorage), separat per nom.
