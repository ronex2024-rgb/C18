// M-PAS Service Worker for offline storage & resilience
const CACHE_NAME = "mpas-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Let browser handle online requests normally
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }
});
