/* ==========================================
   SERVICE WORKER - PWA OFFLINE SUPPORT
   This makes the app work even without internet
   ========================================== */

const CACHE_NAME = 'research-terminal-v1';

// Files to cache for offline use
const CACHED_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
];

/* ==========================================
   INSTALL EVENT
   Called when the service worker is first installed
   ========================================== */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app files');
        return cache.addAll(CACHED_FILES);
      })
  );
  
  // Force the waiting service worker to become active
  self.skipWaiting();
});

/* ==========================================
   ACTIVATE EVENT
   Clean up old caches when a new version is activated
   ========================================== */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

/* ==========================================
   FETCH EVENT
   Intercept network requests and serve from cache when offline
   ========================================== */

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the fetched response
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Fallback for offline scenarios
        return new Response('Offline - Please connect to internet', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});