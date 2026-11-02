# Bona Nota · Estudi interactiu (1r ESO)

Pàgines d'estudi interactives per assignatura, publicades amb GitHub Pages.

- Inici: `index.html` (menú d'assignatures)
- Cada assignatura: `<assignatura>/index.html` (generat, no s'edita a mà)
- Motor comú: `motor/plantilla-estudi-interactiu.html`
- Contingut de cada assignatura: `motor/dades/<assignatura>.js`

## Afegir o actualitzar una assignatura

```
cd motor
python3 build.py naturals                      # genera ../naturals/index.html
node prova.js $PWD/../naturals/index.html      # prova automàtica (Playwright)
```

Després, afegir la targeta a `index.html` i fer commit + push. GitHub Pages publica en 1-2 minuts.

Les millores del motor es fan a la plantilla i es regeneren totes les assignatures.
El progrés de cada nen es guarda al navegador del seu aparell (localStorage), separat per nom.
