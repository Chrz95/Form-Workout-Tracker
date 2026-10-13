const CACHE_NAME = "form-static-v1";
const CORE_ASSETS = ["/", "/exercises.json", "/icon.svg", "/manifest.webmanifest"];
/** Preloads read-only catalog resources for offline browsing. */
self.addEventListener("install", (event) => { event.waitUntil(fetch("/precache.json").then((response) => response.json()).then((assets) => caches.open(CACHE_NAME).then((cache) => cache.addAll([...CORE_ASSETS, ...assets])))); self.skipWaiting(); });
/** Removes obsolete static caches without touching workout records. */
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))); self.clients.claim(); });
/** Caches same-origin static GETs; API writes and authenticated responses are never cached. */
self.addEventListener("fetch", (event) => {
 const requestUrl = new URL(event.request.url);
 if (event.request.method !== "GET" || event.request.headers.has("range") || requestUrl.pathname.endsWith(".mp4") || requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith("/api/") || event.request.headers.has("authorization")) { return; }
 event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
  try { const response = await fetch(event.request); if (response.ok) { await cache.put(event.request, response.clone()).catch(() => {}); } return response; }
  catch { return (await cache.match(event.request)) || (event.request.mode === "navigate" ? await cache.match("/") : Response.error()); }
 }));
});
