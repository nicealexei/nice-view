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
        showNotification(event.data);
      }
    }).catch(error => {
      console.error('Error matching clients:', error);
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].url === event.notification.data.url && 'focus' in clientList[i]) {
            client = clientList[i];
            break;
          }
        }
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
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
function showNotification(data) {
  console.log('Sending Notification...');
  let heading = 'Your chat with us';
  let notificationData = {
    id: 'id-' + Date.now(),
    url: "%REACT_APP_PUBLIC_DOMAIN%%REACT_APP_PUBLIC_URL%"
  };
  if(data && data.companyName){
    heading = `Your chat with ${data.companyName}`;
  }
  self.registration.showNotification(heading, {
    body: 'Agent sent you a new message.',
    icon: 'assets/images/notification-icon96.png',
    badge: 'assets/images/logo192.png',
    image: 'assets/images/notification-image192.png',
    tag: 'chat-notification',
    data: notificationData
  }).then(() => {
    console.log('Notification displayed successfully.');
  }).catch(error => {
    console.error('Error displaying notification:', error);
  });
}