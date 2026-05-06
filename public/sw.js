const CACHE_NAME = "mejoraapp-v4";
const STATIC_ASSETS = ["/", "/index.html"];

// Assets to pre-cache on install
const PRECACHE_URLS = STATIC_ASSETS;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy for navigation requests
// Cache-first for static assets (CSS, JS, images)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Skip cross-origin and API requests
  if (!req.url.startsWith(self.location.origin)) return;

  const url = new URL(req.url);

  // Navigation requests: network-first with offline fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match("/") || caches.match("/index.html"))
    );
    return;
  }

  // Static assets (hashed filenames): cache-first
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "MejoraApp", body: event.data.text() };
  }

  const title = payload.title || "MejoraApp";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/favicon.png",
    badge: payload.badge || "/favicon.png",
    data: { url: payload.url || "/" },
    tag: payload.tag || "mejoraapp-notification",
    renotify: true,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Open new window
      self.clients.openWindow(url);
    })
  );
});
