import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import {
  getMessaging,
  getToken,
  onMessage,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js';

const appSettings = {
  apiKey: 'AIzaSyAxbwtRndErSP-JcqbaVAVD7uRXeZtZBrw',
  authDomain: 'test30052024.firebaseapp.com',
  projectId: 'test30052024',
  storageBucket: 'test30052024.appspot.com',
  messagingSenderId: '151682205637',
  appId: '1:151682205637:web:909a93237c8558b447edac',
  databaseURL: "https://test30052024-default-rtdb.europe-west1.firebasedatabase.app",
};

console.log('Initializing Firebase app...');
const app = initializeApp(appSettings);

const messaging = getMessaging(app);

const inputFieldEl = document.getElementById('input-field');
const addButtonEl = document.getElementById('add-button');
const notifications = [];


addButtonEl.disabled = true;  // Initially disable the button

inputFieldEl.addEventListener('input', function() {
  const inputValue = inputFieldEl.value;
  const isNotEmpty = inputValue.trim().length > 0;

  addButtonEl.disabled = !isNotEmpty;  
});


addButtonEl.addEventListener('click', async function () {
  console.log('clicked add button');
  console.log('value of input:' + inputFieldEl.value);
  const token = await requestPermissionAndGetToken();

  if (token) {
    const deviceName = inputFieldEl.value.trim();
    await sendTokenToServer(token, deviceName);
  }
  await clearInputFieldEl();
});

async function requestPermissionAndGetToken() {
  console.log('requestPermissionAndGetToken started');
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey:
          'BGPKEbj2JCADxrrqLF1Nw_B_5iJtKO0qSmr8AyiGIcx7d1e_ZUJSmW0nQjKCTIu0S-FMOX_sGM8C38gudZfHE5k',
      });
      if (currentToken) {
        console.log('Firebase token:', currentToken);
        return currentToken;
      } else {
        console.log(
          'No registration token available. Request permission to generate one.'
        );
      }
    } else if (permission === 'denied') {
      console.log('Permission for notifications was denied');
    } else {
      console.log('Permission for notifications was dismissed');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
}

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;
  const notificationText = payload.notification.text || '';

  // Store the notification in the global array
  notifications.push({ title: notificationTitle, body: notificationBody, text: notificationText });

  // Display the notification
  displayNotification(notificationTitle, notificationBody, notificationText);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(function (registration) {
      console.log('Registration successful, scope is:', registration.scope);
    })
    .catch(function (err) {
      console.log('Service worker registration failed, error:', err);
    });
}

self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/android-chrome-512x512.png',
  };
  event.waitUntil(
    self.registration.showNotification('Test notification', options)
  );
});

async function sendTokenToServer(token, deviceName) {
  const url = 'https://alpha.cdialogues.com/firebase/api/v1/device/add';
  const data = {
    firebaseToken: token,
    deviceName: deviceName
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    console.log('Token sent to server:', responseData);
  } catch (error) {
    console.error('Error sending token to server:', error);
  }
}

function clearInputFieldEl() {
  inputFieldEl.value = '';
  addButtonEl.disabled = true;  // Disable the button again after submitting
}

navigator.serviceWorker.addEventListener('message', event => {
  console.log('Message received from service worker:', event.data);

  const notificationTitle = event.data.title;
  const notificationBody = event.data.body;
  const notificationText = event.data.text || '';

  // Store the notification in the global array
  notifications.push({ title: notificationTitle, body: notificationBody, text: notificationText });

  // Display the notification
  displayNotification(notificationTitle, notificationBody, notificationText);
});

function displayNotification(title, body, notificationText) {
  const notificationContainer = document.getElementById('notification-container');
  const notificationElement = document.createElement('div');
  notificationElement.classList.add('notification');
  notificationElement.innerHTML = `
    <h3>${title}</h3>
    <p>${body}</p>
    <label>Notification Text: ${notificationText}</label>
  `;
  notificationContainer.appendChild(notificationElement);
}
