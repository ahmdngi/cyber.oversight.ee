const CACHE = 'oversight-v1';
const ASSETS = [
  '/',
  '/tokens.css',
  '/favicon.svg',
  '/manifest.json',
  '/capabilities/',
  '/architecture/',
  '/blog/',
  '/shipcrawler/',
  '/contact/',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  // HTML: network-first, fallback to cache
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }
  // Static assets: cache-first
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(cache => cache.put(request, clone));
      return res;
    }))
  );
});
