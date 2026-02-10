self.addEventListener('install', (e) => {
    self.skipWaiting(); // ให้เริ่มทำงานทันทีไม่ต้องรอ
});

self.addEventListener('activate', (e) => {
    return self.clients.claim(); // ควบคุมหน้าเว็บทั้งหมดทันที
});

// ส่วนสำคัญที่ใช้โชว์ Notification
self.addEventListener('showNotification', (event) => {
    const title = event.data.title;
    const options = {
        body: event.data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/179/179386.png',
        vibrate: [200, 100, 200],
        badge: 'https://cdn-icons-png.flaticon.com/512/179/179386.png'
    };
    self.registration.showNotification(title, options);
});