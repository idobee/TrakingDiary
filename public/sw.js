self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A fetch event handler is required by Chrome to trigger the install prompt.
  // We just let the browser handle the request naturally.
  return;
});
