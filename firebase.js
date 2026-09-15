import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHr4Kv_m6Zj02H6GBERshvlaohJW-tmeQ",
  authDomain: "saechsischkochn.firebaseapp.com",
  projectId: "saechsischkochn",
  storageBucket: "saechsischkochn.firebasestorage.app",
  messagingSenderId: "783919966537",
  appId: "1:783919966537:web:31dced54e0e12010e01298"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Offline-Zwischenspeicher aktivieren: Die App funktioniert dadurch auch ohne
// Internet und synchronisiert automatisch, sobald wieder Verbindung besteht.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
});

export {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
};
