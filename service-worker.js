self.addEventListener('install', function(event) {
  // The service worker is installing.
});

self.addEventListener('fetch', function(event) {
  //content being fetched
});

self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
 
  if (event.data && event.data.type === 'CHAT_MESSAGE_POSTED') {      
    console.log('CHAT_MESSAGE_POSTED fired!');
  
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {      
      let isPWAInForeground = false;
      for (const client of clients) {
        console.log('Client visibilityState:', client.visibilityState);
        if (client.visibilityState === 'visible') {
          isPWAInForeground = true;
          break;
        }
      }  
      if (!isPWAInForeground) {
        showNotification();
      }
    }).catch(error => {
      console.error('Error matching clients:', error);
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

//remove cache
self.addEventListener('activate', event => {
  console.log('clearing cache...');
  const cacheWhitelist = [];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// Function to show notification
function showNotification() {
  console.log('Sending Notification...');
  self.registration.showNotification('Hello!', {
    body: 'Agent sent you a new message.',
    icon: 'assets/images/logo192.png',
    badge: 'assets/images/logo192.png'
  }).then(() => {
    console.log('Notification displayed successfully.');
  }).catch(error => {
    console.error('Error displaying notification:', error);
  });
}

// Function to send notifications at intervals
function sendNotifications() {
  let count = 0;
  const interval = setInterval(() => {
    if (count < 5) {
      showNotification();
      count++;
    } else {
      clearInterval(interval);
    }
  }, 15000); // 15 seconds interval
}