self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'FixAm', {
      body: data.body || 'You have an update',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.url || '/',
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
