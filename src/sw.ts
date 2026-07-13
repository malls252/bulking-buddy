/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";

// This file is used by vite-plugin-pwa with `strategies: "injectManifest"`.
// It will be compiled into the final service worker.

// Workbox injects `__WB_MANIFEST` at build time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wbManifest = (self as any).__WB_MANIFEST || [];
precacheAndRoute(wbManifest);
cleanupOutdatedCaches();

const handler = createHandlerBoundToURL("/index.html");

self.addEventListener("fetch", (event: FetchEvent) => {
  const req = event.request;

  // For navigation requests, always fallback to index.html (SPA)
  if (req.mode === "navigate") {
    event.respondWith(handler({ event, request: req, url: new URL(req.url) } as any));
    return;
  }
});

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    // VitePWA/Workbox config sets skipWaiting. Keep this for compatibility.
  }
});



