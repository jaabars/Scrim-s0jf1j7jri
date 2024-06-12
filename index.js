import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';
import {
  getMessaging,
  getToken,
  onMessage,
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

console.log('Initializing Firebase app...');
const app = initializeApp(appSettings);
const database = getDatabase(app);
const shoppingListInDB = ref(database, 'shoppingList');

const messaging = getMessaging(app);
const registrationTokens =  await requestPermissionAndGetToken()


const inputFieldEl = document.getElementById('input-field');
const addButtonEl = document.getElementById('add-button');
const shoppingListEl = document.getElementById('shopping-list');



addButtonEl.addEventListener('click', async function () {
  console.log('clicked add button');
  await onMessage();
  //let inputValue = inputFieldEl.value;

  //push(shoppingListInDB, inputValue);

  clearInputFieldEl();
});

onValue(shoppingListInDB, function (snapshot) {
  if (snapshot.exists()) {
    let itemsArray = Object.entries(snapshot.val());

    clearShoppingListEl();

    for (let i = 0; i < itemsArray.length; i++) {
      let currentItem = itemsArray[i];
      let currentItemID = currentItem[0];
      let currentItemValue = currentItem[1];

      appendItemToShoppingListEl(currentItem);
    }
  } else {
    shoppingListEl.innerHTML = 'No items here... yet';
  }
});

function clearShoppingListEl() {
  shoppingListEl.innerHTML = '';
}

function clearInputFieldEl() {
  inputFieldEl.value = '';
}

function appendItemToShoppingListEl(item) {
  let itemID = item[0];
  let itemValue = item[1];

  let newEl = document.createElement('li');

  newEl.textContent = itemValue;

  newEl.addEventListener('click', function () {
    let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);

    remove(exactLocationOfItemInDB);
  });

  shoppingListEl.append(newEl);
}


async function requestPermissionAndGetToken(){
  console.log('requestPermissionAndGetToken started');
  try {
    await Notification.requestPermission();
    const currentToken = await getToken(messaging,{
        vapidKey:
          'BGPKEbj2JCADxrrqLF1Nw_B_5iJtKO0qSmr8AyiGIcx7d1e_ZUJSmW0nQjKCTIu0S-FMOX_sGM8C38gudZfHE5k',
      });
    if (currentToken) {
      console.log('Firebase token:', currentToken);
      return [currentToken]
    } else {
      console.log(
        'No registration token available. Request permission to generate one.'
      );
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
};


onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  new Notification(notificationTitle, notificationOptions);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Registration successful, scope is:', registration.scope);
    }).catch(function(err) {
      console.log('Service worker registration failed, error:', err);
    });
  }

/*self.addEventListener('push', event => {
    const options = {
      body: event.data.text(),
      icon: '/Users/aziret/Downloads/Scrim-s0jf1j7jri/android-chrome-192x192.png',
    };
    event.waitUntil(
      self.registration.showNotification('Test notification', options)
    );
  });*/
