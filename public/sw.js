/* Service Worker for Web Push (VAPID) + basic fetch passthrough.
   Handles push notifications for iOS (Safari 16.4+), Android & desktop browsers.
*/

import { precacheAndRoute } from 'workbox-precaching';

// @ts-ignore: self.__WB_MANIFEST is injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST || []);

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
    
    // Configurações para parecer uma notificação nativa (estilo WhatsApp)
    const options = {
      body: data.body || data.message || 'Tens uma nova notificação.',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'metafit-notification', 
      renotify: true,
      requireInteraction: true, // Mantém a notificação visível até o usuário interagir
      vibrate: [200, 100, 200, 100, 200], // Padrão de vibração
      silent: false,
      dir: 'auto',
      lang: 'pt-AO',
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
  } catch (error) {
    console.error('Error in push event:', error);
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
      
      // Tenta focar em uma aba já aberta
      for (const client of allClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Se não houver aba aberta, abre uma nova
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // Padrão: fetch normal.
  event.respondWith(fetch(event.request));
});
