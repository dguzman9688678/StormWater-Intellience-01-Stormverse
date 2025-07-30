// StormVerse Service Worker for caching and offline support
const CACHE_NAME = 'stormverse-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/src/main.tsx',
  '/src/styles/cyberpunk.css',
  '/textures/asphalt.png',
  '/textures/grass.png',
  '/textures/sand.jpg',
  '/textures/sky.png',
  '/textures/wood.jpg',
  '/sounds/background.mp3',
  '/sounds/hit.mp3',
  '/sounds/success.mp3',
  '/cesium/Cesium.js',
  '/cesium/Widgets/widgets.css'
];

const CESIUM_URLS = [
  'https://cesium.com/downloads/cesiumjs/releases/1.118/Build/Cesium/Cesium.js',
  'https://cesium.com/downloads/cesiumjs/releases/1.118/Build/Cesium/Widgets/widgets.css'
];

const WEATHER_API_URLS = [
  'https://api.weather.gov/alerts/active',
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('StormVerse Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('StormVerse Service Worker: Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS.concat(CESIUM_URLS));
      })
      .then(() => {
        console.log('StormVerse Service Worker: Installation complete');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('StormVerse Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('StormVerse Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('StormVerse Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('StormVerse Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') {
    return; // Only handle GET requests
  }
  
  // Cache strategy for different resource types
  if (isStaticResource(url)) {
    // Cache first for static resources
    event.respondWith(cacheFirst(request));
  } else if (isWeatherAPI(url)) {
    // Network first for weather data with cache fallback
    event.respondWith(networkFirst(request));
  } else if (isCesiumResource(url)) {
    // Cache first for Cesium resources
    event.respondWith(cacheFirst(request));
  } else {
    // Default strategy - network first
    event.respondWith(networkFirst(request));
  }
});

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('StormVerse SW: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('StormVerse SW: Cached new resource:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('StormVerse SW: Cache first failed:', error);
    return new Response('Resource not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('StormVerse SW: Updated cache from network:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('StormVerse SW: Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('StormVerse SW: Serving stale data from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response(JSON.stringify({
      error: 'Network unavailable and no cached data',
      timestamp: new Date().toISOString(),
      url: request.url
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions to categorize requests
function isStaticResource(url) {
  const staticExtensions = ['.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.mp3', '.ogg', '.wav'];
  const pathname = url.pathname.toLowerCase();
  
  return staticExtensions.some(ext => pathname.endsWith(ext)) || 
         pathname.startsWith('/textures/') ||
         pathname.startsWith('/sounds/') ||
         pathname.startsWith('/fonts/') ||
         pathname.startsWith('/geometries/');
}

function isWeatherAPI(url) {
  return WEATHER_API_URLS.some(apiUrl => url.href.startsWith(apiUrl)) ||
         url.pathname.startsWith('/api/weather/') ||
         url.hostname === 'api.weather.gov' ||
         url.hostname.includes('noaa.gov');
}

function isCesiumResource(url) {
  return url.hostname === 'cesium.com' ||
         url.pathname.startsWith('/cesium/') ||
         CESIUM_URLS.some(cesiumUrl => url.href.startsWith(cesiumUrl));
}

// Handle background sync for offline weather data updates
self.addEventListener('sync', event => {
  if (event.tag === 'weather-data-sync') {
    console.log('StormVerse SW: Background sync - weather data');
    event.waitUntil(syncWeatherData());
  }
});

async function syncWeatherData() {
  try {
    const response = await fetch('/api/feed/live');
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/api/feed/live', response.clone());
      console.log('StormVerse SW: Weather data synced in background');
      
      // Notify clients of update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'WEATHER_DATA_UPDATED',
          timestamp: new Date().toISOString()
        });
      });
    }
  } catch (error) {
    console.error('StormVerse SW: Background weather sync failed:', error);
  }
}

// Handle push notifications for weather alerts
self.addEventListener('push', event => {
  console.log('StormVerse SW: Push notification received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: 'StormVerse Alert', body: event.data.text() };
    }
  }
  
  const options = {
    title: data.title || 'StormVerse Weather Alert',
    body: data.body || 'New weather information available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'weather-alert',
    requireInteraction: data.severity === 'extreme',
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: data
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('StormVerse SW: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/') // Open StormVerse app
    );
  }
});

// Periodic background sync for weather updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'weather-periodic-sync') {
    console.log('StormVerse SW: Periodic sync - weather data');
    event.waitUntil(syncWeatherData());
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('StormVerse SW: Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('StormVerse SW: Unhandled promise rejection:', event.reason);
});

console.log('StormVerse Service Worker: Script loaded');
