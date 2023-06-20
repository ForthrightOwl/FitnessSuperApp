import { initializeApp } from 'firebase/app';
import { getFirestore } from'firebase/firestore';
import Constants, { ExecutionEnvironment } from 'expo-constants'

// `true` when running in Expo Go.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

let analytics
if (!isExpoGo) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  analytics = require('@react-native-firebase/analytics').default
}

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhBPpFS6HWLmI7ihXxAj5bHFwGzs_fGUE",
  authDomain: "bodygenius-9e693.firebaseapp.com",
  projectId: "bodygenius-9e693",
  storageBucket: "bodygenius-9e693.appspot.com",
  messagingSenderId: "368293760442",
  appId: "1:368293760442:web:0a9fba2b91ce94eb316183",
  measurementId: "G-NSWVFRK6N3"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

export async function logEvent(event) {
  if (isExpoGo) {
    console.log(
     'Event logged: ' + event
    )
  } else {
    await analytics().logEvent(event)
  }
}