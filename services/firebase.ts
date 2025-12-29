
import { initializeApp } from "firebase/app";
import { 
  getAuth as getFirebaseAuth, 
  signInWithEmailAndPassword as firebaseSignIn, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuth 
} from "firebase/auth";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection as firestoreCollection, 
  doc as firestoreDoc, 
  query as firestoreQuery, 
  where as firestoreWhere, 
  orderBy as firestoreOrderBy, 
  limit as firestoreLimit, 
  increment as firestoreIncrement,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  setDoc as firestoreSetDoc,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  Timestamp as firestoreTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFrJOmRsuP7WwSb1oD1fYSYvBcDJVSNfQ",
  authDomain: "dristi-khabar.firebaseapp.com",
  projectId: "dristi-khabar",
  storageBucket: "dristi-khabar.firebasestorage.app",
  messagingSenderId: "905774533816",
  appId: "1:905774533816:web:bfaf49a1b3bf744f88384d"
};

const app = initializeApp(firebaseConfig);
const auth = getFirebaseAuth(app);

// Use new local cache settings instead of deprecated enableIndexedDbPersistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const getAuth = () => auth;
export const getDb = () => db;

// Auth Methods
export const signInWithEmailAndPassword = firebaseSignIn;
export const signOut = firebaseSignOut;
export const onAuthStateChanged = firebaseOnAuth;

// Firestore Methods
export const collection = firestoreCollection;
export const doc = firestoreDoc;
export const query = firestoreQuery;
export const where = firestoreWhere;
export const orderBy = firestoreOrderBy;
export const limit = firestoreLimit;
export const increment = firestoreIncrement;
export const getDoc = firestoreGetDoc;
export const getDocs = firestoreGetDocs;
export const setDoc = firestoreSetDoc;
export const addDoc = firestoreAddDoc;
export const updateDoc = firestoreUpdateDoc;
export const deleteDoc = firestoreDeleteDoc;
export const Timestamp = firestoreTimestamp;
