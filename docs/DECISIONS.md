# Decisions

Una entrada per decisió, la més nova a sota. Els números no es reutilitzen mai, tampoc els de les decisions revertides.

Com s'escriu una entrada:

    ## ADR-0001 · Títol curt
    Data: AAAA-MM-DD
    Decisió: què hem decidit (també val «no farem X»).
    Motiu: per què, i quines alternatives hem descartat.
    Com revertir-la: què caldria desfer.

## ADR-0001 · El boss del món també s'obre amb un examen aprovat
Data: 2026-11-08
Decisió: el boss s'obre quan has aprovat el 70 % dels temes o quan treus un 70 % o més en un examen (sorpresa o de veritat). Els temes només es compten amb el test de cada tema, com fins ara.
Motiu: un nen va treure un 15/15 a l'examen sorpresa (preguntes de 9 temes) i el boss li seguia tancat perquè només tenia 5 temes aprovats amb el test de tema. Tots dos exàmens barregen preguntes de tot el món, així que un d'aprovat ja demostra el domini. Descartat: fer que les preguntes de l'examen aprovin temes (un tema es podria donar per aprovat amb una sola pregunta).
Com revertir-la: treure `exam` de `bossEstat()` i el text «o treu un 70 % en un examen» de `bossCarta()` a la plantilla, esborrar `bnProvaBossExamen` i regenerar amb `python3 motor/tot.py`.

## ADR-0002 · Els canvis es publiquen amb un PR que l'agent puja i fusiona
Data: 2026-11-08
Decisió: cap agent fa push directe a `main`. Treballa en una branca, la puja, obre un PR cap a `main` i, quan l'Action «Revisa Bona Nota» del PR surt en verd, el fusiona amb squash i esborra la branca.
Motiu: abans l'AGENTS.md prohibia el push als agents, però a la pràctica es pujava directament a `main`. Amb el PR queda un registre de cada canvi i la revisió automàtica passa abans de publicar, sense que el Víctor hagi de fer res. Descartat: que el Víctor fusioni cada PR a mà (més lent i no ho vol).
Com revertir-la: tornar la línia «Mai: push, merge, deploy…» a l'AGENTS.md i treure l'apartat «Pujar i publicar».

## ADR-0003 · Versions de tres números amb CHANGELOG.md i etiquetes de git
Data: 2026-11-09
Decisió: el producte es numera `MAJOR.MENOR.PEDAÇ`. La primera entrada de `CHANGELOG.md` és la versió actual, la capçalera del README en repeteix el número i cada versió porta una etiqueta de git `vX.Y.Z`. Les versions 1.0.0 a 2.3.0 s'han assignat a posteriori a partir de l'historial; el 2 ve de «Bona Nota 2.0», com ja es deia als commits.
Motiu: fins ara només hi havia empremtes automàtiques (`versio.json`, `VERSIO` de `sw.js`), que serveixen per refrescar les còpies dels mòbils però no diuen què ha canviat. Descartat: fer servir `versio.json` per al número (`tot.py` el reescriu a cada canvi) i un fitxer de versió a part (un lloc més per mantenir).
Com revertir-la: esborrar `CHANGELOG.md`, la versió de la capçalera i l'apartat «Versions» del README, la regla de `docs/CONVENCIONS.md` i les etiquetes `v*`.

## ADR-0004 · L'aspecte del nen viu al seu perfil (`bn_priv.perfils`) i es llegeix amb `bn_aspectes()`
Data: 2026-11-09
Decisió: el que el nen tria a `/perfil/` (animal, perfil arcade i estil) es guarda a la columna `aspecte` de la seva fila de `bn_priv.perfils`, amb `bn_aspecte_desa(nom, pin, aspecte)` protegida pel PIN, i es llegeix per a tothom amb `bn_aspectes()`, pública. A l'aparell es cacheja al mapa `bn_aspectes` i, si la pujada falla, queda pendent i es reintenta.
Motiu: l'aspecte l'han de veure tots els nens (rànquing) i tots els aparells del mateix nen, així que ha de ser al núvol i llegible sense PIN. Descartat: guardar-lo com a event de `bn_log` (és només d'inserció, té la llista d'events tancada per un `check` i ningú el pot llegir des del navegador) i guardar-lo només a l'aparell (els altres no el veurien i es perdria en canviar de mòbil). La lectura pública no exposa res que no surti ja al rànquing.
Com revertir-la: treure la columna i les dues funcions (`supabase/bn_aspecte.sql`), la pàgina `perfil/`, `bn_aspectes` de `carregaHs()` i d'`avatar()` a la portada i al tauler, i `heroAv()`/`heroAsp()` de la plantilla; regenerar amb `python3 motor/tot.py`.

## ADR-0005 · Estrelles justes 2: el combo només compta el que paga i el repàs dona premi
Data: 2026-11-09
Decisió: el combo dels tests només puja amb les respostes que donen estrella (no amb les repetides del dia ni amb el repàs, que tampoc el trenquen); el repàs paga +1 ⭐ per error encertat, un cop per error i dia i fins a 10 al dia per món (`premiRepas`, comptadors a `diaEst().r` i `.rn`); i cada activitat apunta al registre les estrelles que ha donat (`est`). És la primera part (#13) de l'estudi n2505 i del pla n2506 (`docs/superpowers/specs/2026-11-09-estrelles-estudi.md`, `docs/superpowers/plans/2026-11-09-estrelles-combos.md`); el triple combo (#14) i el super combo (#15) en depenen.
Motiu: les dades del 9/11/2026 mostraven que el combo es podia alimentar repetint tests (1 de cada 3 tests era repetit el mateix dia) i que 51 sessions de repàs havien donat 0 ⭐. Sense tancar el primer forat, els combos nous el multiplicarien; sense `est` i els orígens fiables al tauler, no es podria saber si funcionen. Descartat: un sistema dur contra les trampes (el primer del rànquing guanyava menys estrelles per minut que el segon i el fre del servidor no havia saltat mai).
Com revertir-la: a `test()`, tornar a cridar `ratxa(true)` sense la condició `nova>0`; treure `premiRepas` de `repMou`; treure `detallLog`/`iniciActivitat` de `registra`; regenerar amb `python3 motor/tot.py`.

## ADR-0006 · El xat de la colla es parla amb peces i es paga amb les estrelles d'avui
Data: 2026-11-10
Decisió: el rànquing té una pestanya «Xat» on els nens només poden dir frases del catàleg (26 frases amb un forat i 63 peces, o el nom d'un company del rànquing), sense cap text lliure. Cada 10 ⭐ guanyades avui donen 1 crèdit = 1 frase, fins a 5 al dia; els crèdits tornen a zero a mitjanit (Europe/Madrid) i les estrelles no es gasten mai. Llegir és lliure i sense PIN; votar «Ben dit» demana el primer crèdit del dia; entre missatge i missatge hi ha 10 s d'espera. El nom d'un company només surt en frases bones (felicitar, donar aura o reptar); per riure només hi ha coses de classe o un mateix. Les peces es desbloquegen pel nivell del rànquing o per tenir 25 ⭐ en un món. Al servidor es guarden números (qui, quina frase, quina peça o quin company), mai text; el servidor (`supabase/bn_xat.sql`) decideix els crèdits i els desbloquejos i el navegador compon el text amb el catàleg. El navegador llegeix el xat cada 10 s només mentre la pestanya és oberta, sense Realtime. El missatge del dia no té premi. Des de l'admin es pot canviar les estrelles per crèdit, el màxim al dia, l'espera i obrir o tancar el xat; esborrar missatges, silenciar noms i activar o desactivar peces.
Motiu: es volia que els nens es parlin dins de l'app sense que ningú hagi de vigilar què escriuen: la regla d'or es compleix perquè les frases estan fetes així. Pagar amb estrelles d'avui fa que parlar sigui un premi per estudiar (uns 5 minuts d'estudi per frase, segons l'estudi d'estrelles n2505) i el límit diari evita que el xat es mengi l'estudi. Descartat: text lliure o emojis lliures (caldria moderar), gastar estrelles (faria baixar el rànquing), Realtime (obligaria a obrir les taules a tothom) i calcular «món acabat» amb tots els temes aprovats (el servidor no sap quants temes té cada món sense copiar-ne la llista al SQL).
Com revertir-la: treure la pestanya, les bafarades, la targeta i el codi del xat d'`index.html` i la pestanya Xat d'`admin/index.html`; esborrar les funcions `bn_xat_*` i `bn_admin_xat_*` i les taules `bn_priv.xat_*` (i la clau `xat` de `bn_priv.config`); treure les proves `prova-xat*.js` i `prova-admin-xat.js` de l'Action; regenerar amb `python3 motor/tot.py`.
