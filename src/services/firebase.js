import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, setDoc, getDocs, writeBatch,
  onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { getFirebaseConfig } from '../config/firebaseConfig';

let app = null;
let db = null;

export function initFirebase() {
  const config = getFirebaseConfig();
  if (config && config.projectId) {
    try {
      app = getApps().length === 0 ? initializeApp(config) : getApp();
      db = getFirestore(app);
      return { app, db, isConnected: true };
    } catch (err) {
      console.error("Erreur d'initialisation Firebase :", err);
      return { app: null, db: null, isConnected: false, error: err.message };
    }
  }
  return { app: null, db: null, isConnected: false };
}

// Initialise au chargement
initFirebase();

export function isCloudEnabled() {
  const { isConnected } = initFirebase();
  return isConnected;
}

// ── Synchro Membres ──
export function subscribeMembers(onUpdate) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return null;

  const q = query(collection(db, 'members'));
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
    onUpdate(members);
  }, (err) => {
    console.error("Erreur écoute membres Firestore :", err);
  });
}

export async function saveMemberCloud(memberData) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return false;

  try {
    const docRef = await addDoc(collection(db, 'members'), {
      ...memberData,
      createdAt: memberData.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Erreur ajout membre Firestore :", err);
    throw err;
  }
}

export async function updateMemberCloud(memberId, updates) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return false;

  try {
    const ref = doc(db, 'members', memberId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Erreur mise à jour membre Firestore :", err);
    throw err;
  }
}

export async function deleteMemberCloud(memberId) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return false;

  try {
    await deleteDoc(doc(db, 'members', memberId));
    return true;
  } catch (err) {
    console.error("Erreur suppression membre Firestore :", err);
    throw err;
  }
}

// ── Synchro Événements ──
export function subscribeEvents(onUpdate) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return null;

  const q = query(collection(db, 'events'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
    onUpdate(events);
  }, (err) => {
    console.error("Erreur écoute événements Firestore :", err);
  });
}

export async function saveEventCloud(eventData) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return false;

  try {
    const docId = eventData.id || doc(collection(db, 'events')).id;
    const ref = doc(db, 'events', docId);
    await setDoc(ref, {
      ...eventData,
      id: docId,
      updatedAt: serverTimestamp(),
      createdAt: eventData.createdAt || new Date().toISOString(),
    }, { merge: true });
    return docId;
  } catch (err) {
    console.error("Erreur ajout événement Firestore :", err);
    throw err;
  }
}

export async function seedEventsToCloud(eventsList) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) throw new Error("Database Firebase Firestore non connectée.");

  try {
    const chunkSize = 400;
    for (let i = 0; i < eventsList.length; i += chunkSize) {
      const chunk = eventsList.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const evt of chunk) {
        const docRef = doc(db, 'events', evt.id);
        batch.set(docRef, {
          ...evt,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error("Erreur seed d'événements Firestore BDD :", err);
    throw err;
  }
}

export async function deleteAllEventsCloud() {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return false;

  try {
    const snapshot = await getDocs(collection(db, 'events'));
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
      batch.delete(d.ref);
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error("Erreur suppression globale événements Firestore :", err);
    throw err;
  }
}

export async function deleteEventCloud(eventId) {
  const { db, isConnected } = initFirebase();
  if (!isConnected || !db) return false;

  try {
    await deleteDoc(doc(db, 'events', eventId));
    return true;
  } catch (err) {
    console.error("Erreur suppression événement Firestore :", err);
    throw err;
  }
}

