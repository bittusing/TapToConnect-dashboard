/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyCozUySs4wmujXlY_NZl8MKkIu8rZkpgic",
  authDomain: "connectcrm-b29a2.firebaseapp.com",
  projectId: "connectcrm-b29a2",
  storageBucket: "connectcrm-b29a2.firebasestorage.app",
  messagingSenderId: "690967737660",
  appId: "1:690967737660:web:d542a11843a7241c9d5a39",
  measurementId: "G-G3NC1QYNWK"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  navigator.serviceWorker.registration.showNotification(notificationTitle, notificationOptions);
});
