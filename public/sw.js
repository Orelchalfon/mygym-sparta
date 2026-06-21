// Minimal service worker for PWA installability.
// Having an active SW with a fetch handler is required for the browser to fire
// `beforeinstallprompt` (the "install app" offer) on Chrome/Edge/Android.
// We deliberately keep it a network passthrough — no offline caching — to avoid
// serving stale content for this SSR app.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op handler: presence satisfies installability; requests hit the network
  // normally (we don't call respondWith).
});
