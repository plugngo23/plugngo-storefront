const CACHE = "plugngo-shell-v96-20261121-seller-invitation";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/manifest-dashboard.webmanifest", "/plugngo-icon-192.png", "/plugngo-icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    // Only the app shell is cached for offline use. Other pages (such as the seller invitation page)
    // load from the network and never replace the cached shell.
    const path = new URL(request.url).pathname;
    if (path !== "/" && path !== "/index.html") return;
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put("/index.html", copy));
      return response;
    }).catch(() => caches.match("/index.html")));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && ["script", "style", "image", "font"].includes(request.destination)) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});
