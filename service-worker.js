const CACHE_NAME = 'klifox-pwa-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './global.js',
    './app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching offline assets');
            // We use simple fallback instead of strict caching locally
            return cache.addAll(ASSETS_TO_CACHE).catch(e => console.warn('Cache error (ignored for dev)', e));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then(response => {
                if (response) return response;
                // Offline fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

// Mock Push Notification Reception
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'KliFox Uyarı', body: 'Yeni bildirim.' };
    
    const options = {
        body: data.body,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❄️</text></svg>",
        badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📲</text></svg>",
        vibrate: [200, 100, 200, 100, 400],
        data: { url: data.url || '/' },
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
