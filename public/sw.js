/* Service Worker for Web Push (VAPID) + basic fetch passthrough.
   Handles push notifications for iOS (Safari 16.4+), Android & desktop browsers.
*/

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'METAFIT Nutri';
    const options = {
      body: data.body || data.message || '',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'metafit-' + Date.now(),
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
        timestamp: Date.now(),
      },
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'dismiss', title: 'Fechar' },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('METAFIT Nutri', {
        body: 'Tens uma nova notificação.',
        icon: '/logo.png',
        badge: '/logo.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = (event.notification && event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
