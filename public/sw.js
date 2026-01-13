/**
 * Service Worker for Morning Brief PWA
 * 
 * Features:
 * - Offline support for core pages
 * - Audio file caching for offline listening
 * - Background sync for newsletter signup
 * - Push notifications (future)
 */

const CACHE_NAME = 'morning-brief-v1';
const AUDIO_CACHE_NAME = 'morning-brief-audio-v1';

// Core assets to cache immediately
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== AUDIO_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle audio files differently - cache-first for offline playback
  if (url.pathname.startsWith('/audio/') || event.request.url.includes('.mp3')) {
    event.respondWith(handleAudioRequest(event.request));
    return;
  }
  
  // For navigation requests, try network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline - serve from cache
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }
  
  // For other requests, stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
      
      return cached || fetchPromise;
    })
  );
});

// Handle audio requests - cache-first strategy for offline listening
async function handleAudioRequest(request) {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Serving audio from cache:', request.url);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log('[SW] Caching audio:', request.url);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Audio fetch failed:', error);
    // Return a placeholder or error response
    return new Response('Audio not available offline', { status: 503 });
  }
}

// Message handler for manual cache operations
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_AUDIO') {
    const audioUrls = event.data.urls;
    console.log('[SW] Pre-caching audio files:', audioUrls);
    
    caches.open(AUDIO_CACHE_NAME).then((cache) => {
      audioUrls.forEach((url) => {
        fetch(url).then((response) => {
          if (response.ok) {
            cache.put(url, response);
          }
        });
      });
    });
  }
  
  if (event.data.type === 'CLEAR_AUDIO_CACHE') {
    console.log('[SW] Clearing audio cache');
    caches.delete(AUDIO_CACHE_NAME);
  }
});

// Background sync for newsletter signup (when online again)
self.addEventListener('sync', (event) => {
  if (event.tag === 'newsletter-signup') {
    event.waitUntil(syncNewsletterSignup());
  }
});

async function syncNewsletterSignup() {
  // Get pending signups from IndexedDB and submit them
  console.log('[SW] Syncing newsletter signups...');
  // Implementation would read from IndexedDB and POST to API
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Your daily briefing is ready',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: { url: data.url || '/' },
    actions: [
      { action: 'listen', title: 'Listen Now' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Morning Brief', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'listen' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});
