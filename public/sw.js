// This service worker deliberately does NOT cache anything.
// Old versions cached pages and data on phones, which could leave customers looking at
// stale products. Now every request goes straight to the server, so what you see is
// always live. The empty fetch handler keeps the app installable ("Add to Home screen").
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // wipe every cache left behind by the older versions
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim();
    // phones that had old caches: reload the open page once so it picks up the new files
    if (keys.length) {
      const wins = await self.clients.matchAll({ type: 'window' });
      wins.forEach((w) => { try { w.navigate(w.url); } catch (e) { /* ignore */ } });
    }
  })());
});

self.addEventListener('fetch', () => {});
