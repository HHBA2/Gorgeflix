// Gorgflix service worker: caches the app shell so it opens offline.
// Only same-origin files are handled, so addon/API requests are never touched.
// To ship an update: change V (and VER in index.html), then redeploy.
const V = "gorgflix-v1.2.0";
const SHELL = ["./", "index.html", "manifest.webmanifest", "favicon.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "config.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (r.mode === "navigate" || u.pathname.endsWith("config.js")) {
    e.respondWith(fetch(r).then(x => { const c = x.clone(); caches.open(V).then(ch => ch.put(r.mode === "navigate" ? "index.html" : r, c)); return x; }).catch(() => caches.match(r.mode === "navigate" ? "index.html" : r)));
    return;
  }
  e.respondWith(caches.match(r).then(h => h || fetch(r).then(x => { const c = x.clone(); caches.open(V).then(ch => ch.put(r, c)); return x; })));
});
