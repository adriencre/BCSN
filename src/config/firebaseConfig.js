// Configuration Firebase Officielle BCSN (100% Gratuit — Firestore)

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyCEvqYJOjdBW-8aMGp5KzE8nEo2c64PJfM",
  authDomain: "bcsn-5b88c.firebaseapp.com",
  projectId: "bcsn-5b88c",
  storageBucket: "bcsn-5b88c.firebasestorage.app",
  messagingSenderId: "80432031564",
  appId: "1:80432031564:web:e1e569ea109e222aa5d1e9",
  measurementId: "G-SDE02XXQHH"
};

// Charge la configuration soit depuis localStorage (configuré via le dashboard), soit depuis ce fichier
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('bcsn_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId) return parsed;
    }
  } catch (e) {
    console.warn("Erreur lecture config firebase localStorage", e);
  }
  return defaultFirebaseConfig;
}
