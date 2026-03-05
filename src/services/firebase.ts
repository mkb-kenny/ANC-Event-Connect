import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Define a type for the config
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

// Helper to load config
const loadFirebaseConfig = (): FirebaseConfig => {
  // 1. Try environment variables (Netlify/Vite)
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID,
  };

  if (envConfig.apiKey) {
    return envConfig as FirebaseConfig;
  }

  // 2. Try firebase-applet-config.json (AI Studio)
  // Use import.meta.glob to avoid build errors if file is missing
  try {
    const configFiles = import.meta.glob('../../firebase-applet-config.json', { eager: true });
    const key = '../../firebase-applet-config.json';
    if (configFiles[key]) {
      return (configFiles[key] as any).default || configFiles[key];
    }
  } catch (e) {
    console.warn("Failed to load firebase-applet-config.json", e);
  }

  console.error("No Firebase configuration found!");
  return {} as FirebaseConfig;
};

const firebaseConfig = loadFirebaseConfig();
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

  // Use the specific database ID if provided in config
  const dbId = firebaseConfig.firestoreDatabaseId;
  const validDbId = dbId && dbId !== '(default)' ? dbId : undefined;
    
  db = getFirestore(app, validDbId);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Create dummy objects to prevent immediate crashes
  db = {} as Firestore;
  auth = {} as Auth;
}

export { app, db, auth };
