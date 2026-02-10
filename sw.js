self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});

self.addEventListener('push', function(event) {
    const options = {
        body: event.data.text(),
        icon: 'icon.png',
        badge: 'icon.png'
    };
    event.waitUntil(
        self.registration.showNotification('My Checklist', options)
    );
});