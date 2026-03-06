import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration for uwl-alumni-event
const firebaseConfig = {
  apiKey: "AIzaSyApuyPE8PbU30ppoR1TcIJcUbH6VcQUP80",
  authDomain: "uwl-alumni-event.firebaseapp.com",
  projectId: "uwl-alumni-event",
  storageBucket: "uwl-alumni-event.firebasestorage.app",
  messagingSenderId: "915984153825",
  appId: "1:915984153825:web:4563a6bd4837f31f88cba0",
  measurementId: "G-B3XW5VBSS2"
};

console.log(`Firebase Config Loaded for Project: ${firebaseConfig.projectId}`);

// Initialize Firebase SDK
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize Firestore (using default database)
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Create dummy objects to prevent immediate crashes
  db = {} as Firestore;
  auth = {} as Auth;
}

export { app, db, auth };
