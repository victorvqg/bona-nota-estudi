// Bona Nota · service worker (generat per motor/tot.py, no editar a mà)
// Permet instal·lar l'app i fer-la servir sense connexió.
// Pàgines: primer la xarxa (per tenir sempre l'última versió) i, si no hi ha connexió, la còpia guardada.
// Fonts i icones: primer la còpia guardada. Supabase (rànquing, registre): sempre xarxa, mai a la memòria cau.
const VERSIO = "bn-b31de4808e";
const FITXERS = ["./", "index.html", "manifest.webmanifest", "icones/icona-192.png", "icones/icona-512.png", "sociales/t3-clima/", "bio-i-geo/univers/", "castellano/t2-t3/", "sociales/comarques/", "matematiques/divisibilitat/"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIO).then(c => Promise.all(FITXERS.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSIO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.hostname.endsWith("supabase.co")) return;
  const esPagina = r.mode === "navigate" || (r.headers.get("accept") || "").includes("text/html");
  if (esPagina) {
    e.respondWith(fetch(r).then(resp => { const cp = resp.clone(); caches.open(VERSIO).then(c => c.put(r, cp)); return resp; })
      .catch(() => caches.match(r).then(m => m || caches.match(u.pathname.endsWith("/") ? u.pathname + "index.html" : r))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(resp => {
    if (resp.ok && (u.origin === location.origin || u.hostname.includes("fonts.g"))) { const cp = resp.clone(); caches.open(VERSIO).then(c => c.put(r, cp)); }
    return resp;
  })));
});
