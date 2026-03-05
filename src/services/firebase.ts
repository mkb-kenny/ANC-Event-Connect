import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

console.log("Firebase Config:", firebaseConfig);

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
