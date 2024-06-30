import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA64zmLfauVh7WnKo69mmd_WWOL2FtrN-I",
  authDomain: "taskly-e8505.firebaseapp.com",
  projectId: "taskly-e8505",
  storageBucket: "taskly-e8505.appspot.com",
  messagingSenderId: "942401189643",
  appId: "1:942401189643:web:b8d2b6a52fda3c11ed940e",
  measurementId: "G-78S1PDM61W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app, firestore };

