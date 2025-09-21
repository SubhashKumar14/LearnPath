/* Lightweight service worker with cache-first for immutable assets and network-first for API.
   Provides graceful image fallback and avoids throwing in fetch handler. */
const VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${VERSION}`;
const IMAGE_CACHE = `images-${VERSION}`;
const API_CACHE = `api-${VERSION}`;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/utils.js',
  '/js/auth.js',
  '/js/app.js',
  '/images/fallback-course.svg'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, IMAGE_CACHE, API_CACHE].includes(k))
          .map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  // Ignore non-GET
  if (evt.request.method !== 'GET') return;

  // API network-first fallback to cache
  if (url.pathname.startsWith('/api/')) {
    evt.respondWith(networkFirst(evt.request));
    return;
  }

  // Images: cache-first with fallback
  if (/\/(images|img)\//.test(url.pathname) || evt.request.destination === 'image') {
    evt.respondWith(cacheFirstImage(evt.request));
    return;
  }

  // Static assets: cache first
  if (CORE_ASSETS.includes(url.pathname)) {
    evt.respondWith(caches.match(evt.request).then(r => r || fetch(evt.request)));
    return;
  }
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(API_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers:{'Content-Type':'application/json'} });
  }
}

async function cacheFirstImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request, { mode: 'no-cors' });
    if (response && response.ok) cache.put(request, response.clone());
    return response.ok ? response : await caches.match('/images/fallback-course.svg');
  } catch {
    return caches.match('/images/fallback-course.svg');
  }
}
