const CACHE_NAME = "xcashme-pos-v2-offline-cache";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching static POS shell");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[ServiceWorker] Some static assets could not be cached during install:", err);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // For backend API requests, try network first with fallback JSON for offline queuing
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request.clone())
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          console.warn("[ServiceWorker] API request failed (Offline). Returning offline queued fallback:", url.pathname);
          return new Response(
            JSON.stringify({
              status: "offline_queued",
              offline: true,
              timestamp: new Date().toISOString(),
              message: "Network offline. Request trapped by ServiceWorker and queued locally."
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          );
        })
    );
    return;
  }

  // For static app requests (HTML, CSS, JS, Fonts), use Stale-While-Revalidate strategy
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If network fails and we have no cached response, fallback to /index.html for navigation requests (SPA)
            if (event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html")) {
              return caches.match("/index.html");
            }
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
