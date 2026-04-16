/// <reference lib="webworker" />

/* Service Worker for Web Push (VAPID) + basic fetch passthrough.
   Handles push notifications for iOS (Safari 16.4+), Android & desktop browsers.
*/

import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<any>;
};

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'METAFIT Nutri';
    
    // Configurações para parecer uma notificação nativa (estilo WhatsApp)
    const options: NotificationOptions = {
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
        if (client.url === url && 'focus' in (client as WindowClient)) {
          return (client as WindowClient).focus();
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
  // Padrão: fetch normal com melhor tratamento de erros.
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.error('Fetch failed:', event.request.url, error);
      // Retorna uma resposta de erro genérica em vez de falhar silenciosamente
      return new Response('Network request failed', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    })
  );
});
