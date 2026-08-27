import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
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
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Erreur ajout événement Firestore :", err);
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
