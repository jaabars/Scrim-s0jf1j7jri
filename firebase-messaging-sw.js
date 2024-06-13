import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import {
  getMessaging,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js';

const appSettings = {
  databaseURL:
    'https://realtime-database-df319-default-rtdb.europe-west1.firebasedatabase.app/',
    apiKey: "AIzaSyAxbwtRndErSP-JcqbaVAVD7uRXeZtZBrw",
    authDomain: "test30052024.firebaseapp.com",
    projectId: "test30052024",
    storageBucket: "test30052024.appspot.com",
    messagingSenderId: "151682205637",
    appId: "1:151682205637:web:909a93237c8558b447edac"
};

const app = initializeApp(appSettings);
const messaging = getMessaging(app);






messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Handling background message', payload);

  // Copy data object to get parameters in the click handler
  payload.data.data = JSON.parse(JSON.stringify(payload.data));

  return self.registration.showNotification(payload.data.title, payload.data);
});
