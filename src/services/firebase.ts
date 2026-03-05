import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from Environment Variables (Vite standard)
// This is compatible with Netlify, Vercel, and local .env files
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log("Firebase Config:", firebaseConfig);

// Initialize Firebase SDK
let app: FirebaseApp | undefined;
let db: Firestore;
let auth: Auth;

try {
  // Check if config is valid before initializing
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY_HERE') {
    console.warn("Firebase API Key is missing or invalid. Check your .env file or Netlify environment variables.");
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Use the specific database ID if provided in env vars
  const dbId = import.meta.env.VITE_FIRESTORE_DATABASE_ID;
  const validDbId = dbId && dbId !== '(default)' ? dbId : undefined;
    
  db = getFirestore(app, validDbId);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.error("Make sure you have set up your environment variables in Netlify or have a valid .env file locally.");
  // Create dummy objects to prevent immediate crashes
  db = {} as Firestore;
  auth = {} as Auth;
}

export { app, db, auth };
