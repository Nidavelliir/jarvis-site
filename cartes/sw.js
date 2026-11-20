/* Garde l'appli et les séries déjà ouvertes en mémoire du téléphone (marche aussi sans réseau). */
var CACHE = "ma-collection-v1";
self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  var page = url.pathname.endsWith("/") || url.pathname.endsWith(".html") || url.pathname.endsWith("catalogue.json");
  e.respondWith(caches.open(CACHE).then(function (c) {
    if (page) {  // toujours la dernière version si le réseau est là
      return fetch(e.request).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; })
        .catch(function () { return c.match(e.request); });
    }
    return c.match(e.request).then(function (m) {
      return m || fetch(e.request).then(function (r) { if (r.ok && url.origin === location.origin) c.put(e.request, r.clone()); return r; });
    });
  }));
});
