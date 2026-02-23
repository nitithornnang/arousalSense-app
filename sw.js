const CACHE_NAME = 'arousalsense-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './chart.js',
  './chartjs-plugin-annotation.min.js',
  './A logo-2.png',
  './manifest.json'
];

// ติดตั้ง Service Worker และดึงไฟล์เก็บลงเครื่อง
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// เมื่อเปิดแอป ให้โหลดจากเครื่องก่อนเสมอ (Offline First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // เจอในเครื่อง ดึงมาใช้เลย
        }
        return fetch(event.request); // ไม่เจอ ค่อยโหลดจากเน็ต
      })
  );
});