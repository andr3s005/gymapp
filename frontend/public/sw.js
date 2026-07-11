const CACHE_NAME = 'gymapp-v1'

// Archivos que se cachean para uso offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
]

// Instalación — cachea los archivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activación — limpia cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch — estrategia: red primero, caché como fallback
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') return

  // No cachear las peticiones a la API
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, guardarla en caché
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Sin internet — servir desde caché
        return caches.match(event.request)
      })
  )
})