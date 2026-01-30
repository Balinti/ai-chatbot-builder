import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firebaseConfig, COLLECTIONS, APP_SLUG } from './config';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getApp(): FirebaseApp {
  if (app) return app;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (db) return db;
  db = getFirestore(getApp());
  return db;
}

// Get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) return null;
    const parsed = JSON.parse(userInfo);
    // Check if token is expired
    if (parsed.expires_at && parsed.expires_at < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('user_info');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Track login in shared /logins collection
export async function trackLogin(userId: string, email: string) {
  const db = getDb();
  const loginDocId = `${APP_SLUG}_${userId}`;
  const loginRef = doc(db, COLLECTIONS.logins, loginDocId);

  try {
    const loginDoc = await getDoc(loginRef);

    if (loginDoc.exists()) {
      await updateDoc(loginRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: (loginDoc.data().loginCount || 0) + 1,
      });
    } else {
      await setDoc(loginRef, {
        userId,
        email,
        app: APP_SLUG,
        loginCount: 1,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking login:', error);
  }
}

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
};
