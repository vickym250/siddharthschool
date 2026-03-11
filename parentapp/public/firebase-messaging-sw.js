// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBwgDVb1xPO0LWjbrdXA0KAL7atO-zmz_0",
  authDomain: "siddhart-school.firebaseapp.com",
  projectId: "siddhart-school",
  storageBucket: "siddhart-school.firebasestorage.app",
  messagingSenderId: "284823213244",
  appId: "1:284823213244:web:baf7df7430c5094635ecb9",
  measurementId: "G-6GPCQFEL3S"
};

firebase.initializeApp(firebaseConfig); 
const messaging = firebase.messaging();

// 1. Background message handling
messaging.onBackgroundMessage((payload) => {
    console.log("Payload Aaya:", payload);
    
    const notificationTitle = payload.notification.title;
    
    // Yahan hum payload se URL nikal rahe hain jo aapne Cloud Function se bheja hai
    // Cloud function mein aapne data: { url: '/homework' } bheja tha
    const clickAction = payload.data?.url || '/dashboard';

    const notificationOptions = {
        body: payload.notification.body,
        icon: '/brigh.png',
        data: {
            url: clickAction // Click handler ke liye data save kar rahe hain
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. Click Handler: Jo sahi page par le jayega
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Data se URL nikalna
    const targetUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check karo agar app pehle se khuli hai
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                // Agar app khuli hai toh usse target URL par bhej do aur focus karo
                if ('navigate' in client) {
                    client.focus();
                    return client.navigate(targetUrl);
                }
            }
            // Agar app band hai toh naya tab kholo target URL ke saath
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});