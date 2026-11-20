const VERSION = "fc289751c2239324";
const ROOT = new URL('./', self.location.href);
const PREFIX = 'diario-shell-' + ROOT.pathname + '-';
const CACHE = PREFIX + VERSION;
const ASSETS = ["assets/index-BTJxBg8R.js","assets/index-X4xgAadS.css","icon-192.png","icon-512.png","icon-maskable.png","icon.svg","index.html","manifest.webmanifest"].map(path => new URL(path, ROOT).href);
self.addEventListener('install', event => {
  // Fail the install if any asset is missing. The previous working app survives.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('message', event => {
  if (event.data === 'activate-update' && event.source?.url === new URL('aggiorna.html', ROOT).href) {
    event.waitUntil(self.skipWaiting());
  }
});
self.addEventListener('activate', event => {
  // Existing windows keep running unless the user navigates or reloads.
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if (event.request.mode === 'navigate' && (url.pathname === ROOT.pathname || url.pathname === ROOT.pathname + 'index.html')) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(new URL('index.html', ROOT).href)).then(cached => cached || fetch(event.request)));
  } else if (ASSETS.includes(url.href)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request)).then(cached => cached || fetch(event.request)));
  }
  // API responses, auth pages and private training data are never cached here.
});
