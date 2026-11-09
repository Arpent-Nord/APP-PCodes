/* Pcodes et Liaisons – Arpent-Nord : fonctionnement hors ligne.
   Changer VERSION à chaque publication pour que les téléphones prennent la nouvelle copie. */
const VERSION = "2.2.0";
const CACHE = "pcodes-" + VERSION;
const FICHIERS = ["./", "./index.html", "./manifest.json", "./logo.png", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("pcodes-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Copie locale d'abord (rapide au terrain), mise à jour en arrière-plan quand il y a du réseau. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL("./", self.registration.scope).pathname)) return;
  const cle = req.mode === "navigate" ? "./index.html" : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const local = await c.match(cle, {ignoreSearch: true});
    const reseau = fetch(req, {cache: "no-cache"}).then(r => {
      if (r && r.ok && r.type === "basic") c.put(cle, r.clone());
      return r;
    }).catch(() => null);
    if (local) { e.waitUntil(reseau); return local; }
    return (await reseau) || new Response("Hors ligne : ouvrez l'outil une fois avec du réseau.", {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}});
  }));
});
