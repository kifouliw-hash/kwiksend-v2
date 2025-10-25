// Service Worker KwikSend
const CACHE_NAME = "kwiksend-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/app.js",
  "/translate.js"
];

console.log("📦 Service Worker en cours d'installation…");

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  console.log("🔄 Requête interceptée :", event.request.url); // ✅ déplacé ici
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
