const CACHE_NAME = 'arousalsense-v2.0'; // หากอนาคตมีการแก้โค้ดใหญ่อีก ให้เปลี่ยนเลขตรงนี้เป็น v3.0, v4.0

const urlsToCache = [
  '/',
  '/index.html',
  '/chart.js',
  '/chartjs-plugin-annotation.min.js',
  '/manifest.json'
];

// 1. Install Event: บังคับให้ Service Worker ตัวใหม่ติดตั้งและทำงานทันทีโดยไม่ต้องรอ
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate Event: ไล่ลบไฟล์แคช (ความจำ) เวอร์ชันเก่าๆ ทิ้งให้หมด
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // บังคับให้หน้าเว็บที่เปิดอยู่ รีเฟรชไปใช้ Service Worker ตัวใหม่ทันที
  self.clients.claim(); 
});

// 3. Fetch Event: กลยุทธ์ "Network First" (ดึงจากเน็ตก่อน ถ้าออฟไลน์ค่อยดึงจากแคช)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ถ้าต่อเน็ตได้และได้ไฟล์ใหม่มา ให้เอาไปอัปเดตในแคชด้วย
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ถ้าไม่มีเน็ต (ออฟไลน์) ให้ดึงของเดิมจากแคชมาแสดง
        return caches.match(event.request);
      })
  );
});