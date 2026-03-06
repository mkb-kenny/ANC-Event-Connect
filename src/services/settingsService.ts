import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface EventSettings {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  terms: string;
}

export const DEFAULT_SETTINGS: EventSettings = {
  title: "UWL Alumni",
  subtitle: "Networking Evening Registration",
  date: "28th March 2026",
  location: "ANC Kandy Branch",
  terms: "I agree to inform Ms. Nimesha (077 036 3802) or Ms. Kavya (077 551 0791) in advance if I am unable to participate."
};

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'eventConfig'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as EventSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error in settings snapshot listener:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateSettings = async (newSettings: EventSettings) => {
    await setDoc(doc(db, 'settings', 'eventConfig'), newSettings);
  };

  return { settings, loading, updateSettings };
}
