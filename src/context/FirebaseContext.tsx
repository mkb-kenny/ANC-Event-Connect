import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  db: Firestore;
  auth: Auth;
  loading: boolean;
  error: string | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth is properly initialized
    if (!auth || !auth.onAuthStateChanged) {
      setError("Firebase configuration is missing or invalid. Please check your environment variables or configuration.");
      setLoading(false);
      return;
    }

    try {
      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up auth listener:", err);
      setError("Failed to connect to Firebase Authentication.");
      setLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-600 text-xl font-bold mb-4">Configuration Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please ensure you have set up your <strong>Environment Variables</strong> (for Netlify/Production) or created a <code>.env</code> file (for local dev).
          </p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ user, db, auth, loading, error }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
