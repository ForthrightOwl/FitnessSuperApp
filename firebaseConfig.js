import { initializeApp } from 'firebase/app';
import { getFirestore } from'firebase/firestore';

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