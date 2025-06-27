// sw.js - Service Worker para la app de lista de la compra
const CACHE_VERSION = 'shopping-list-v1.01.30';
const CACHE_NAME = `shopping-list-${CACHE_VERSION}`;

self.addEventListener('message', event => {
  if (event.data === 'GET_VERSION') {
    const VERSION_NUMBER = CACHE_VERSION.split('-v')[1];
    event.source.postMessage(VERSION_NUMBER);
  }
});

// Archivos a cachear (ajusta según tus archivos)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/about.html',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icono.png',
  '/privacy-policy.html',
  '/suggestions.html',
  


  // Añade aquí todos tus archivos CSS, JS, imágenes, etc.
  // '/icons/icon-192x192.png',
  // '/icons/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Forzar activación inmediata
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar cachés antiguos
          if (cacheName.startsWith('shopping-list-') && cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control inmediatamente
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear peticiones a Firebase
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('firebaseio')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }

        // Si no está en caché, hacer fetch
        return fetch(event.request).then(response => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          // Añadir al caché
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Si falla todo, mostrar página offline (opcional)
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Escuchar mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
    // Responder cuando la página pida la versión
  if (event.data === 'GET_VERSION') {
    const VERSION_NUMBER = CACHE_VERSION.split('-v')[1];
    event.source.postMessage(VERSION_NUMBER);
  }
});
