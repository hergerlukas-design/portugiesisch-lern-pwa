/**
 * Service Worker for Portugiesisch Lernen PWA
 * Enables offline functionality with cache-first strategy
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `portugiesisch-lernen-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
];

/**
 * Install event - cache assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  // Take over from an older worker right away instead of waiting for all tabs to close
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log('[Service Worker] Cache.addAll error:', err);
        // Don't fail installation if we can't cache everything
        return Promise.resolve();
      });
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Fetch event - implement cache-first strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network first for page loads (so new deploys show up) and API requests;
  // the cache is only the offline fallback
  if (request.mode === 'navigate' || request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: cached copy, or the cached start page for any page load
          return caches.match(request).then(
            (cached) => cached || (request.mode === 'navigate' ? caches.match('./') : undefined)
          );
        })
    );
    return;
  }

  // Cache first for everything else
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Cache successful responses
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        })
        .catch(() => {
          // Return a fallback offline page if needed
          console.log('[Service Worker] Fetch failed:', request.url);
          return new Response('Offline - unable to load resource', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
    })
  );
});

/**
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
