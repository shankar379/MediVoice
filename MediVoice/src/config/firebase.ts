// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase, ref, set, get, child } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4SUQpXi3BafrqgYAUzHnUNdLaE8CsnEk",
  authDomain: "d-model-page.firebaseapp.com",
  databaseURL: "https://d-model-page-default-rtdb.firebaseio.com",
  projectId: "d-model-page",
  storageBucket: "d-model-page.appspot.com",
  messagingSenderId: "764210448312",
  appId: "1:764210448312:web:51d30c56551ea04417314d",
  measurementId: "G-QBBD415G5Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const firestore = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

// Initialize Analytics only if available (web only)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    const { getAnalytics } = require("firebase/analytics");
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.log('Analytics not available:', error);
}

export { app, analytics, firestore as db, storage, rtdb }; 