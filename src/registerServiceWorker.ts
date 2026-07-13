export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    // vite-plugin-pwa registers the SW in production builds automatically.
    // This file exists only if you want to add custom runtime logic later.
  });
}

