// ─── Sequence Tracker Service Worker ─────────────────────────────────────────
// Strategy:
//   • App-shell assets  → Cache-first  (fast loads)
//   • Navigation (HTML) → Network-first with cache fallback (always fresh)
//   • Everything else   → Network-only (API calls, fonts, etc.)

const CACHE_VERSION = "v1";
const CACHE_NAME = `sequence-tracker-${CACHE_VERSION}`;

// Assets to pre-cache on install (app shell)
const PRECACHE_URLS = ["/", "/icon-192x192.png", "/icon-512x512.png"];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME) // delete old caches
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim()) // take control of all open tabs
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip Next.js internal routes and HMR websocket
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/_next/static/chunks") ||
    url.pathname.startsWith("/__nextjs")
  ) {
    return;
  }

  // Navigation requests → network-first, fall back to cached "/"
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy of the page
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match("/").then(
            (cached) => cached ?? new Response("Offline", { status: 503 })
          )
        )
    );
    return;
  }

  // Static assets (_next/static, public files) → stale-while-revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          });
          return cached ?? networkFetch;
        })
      )
    );
    return;
  }

  // Everything else → network only
});
