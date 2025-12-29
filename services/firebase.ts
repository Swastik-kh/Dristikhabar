
/**
 * ROBUST FIREBASE BRIDGE SERVICE
 * Directly accesses Firebase instances and methods from the global window object.
 */

const getGlobal = (key: string) => {
  return (window as any)[key] || null;
};

export const getAuth = () => {
  const auth = getGlobal('fbAuth');
  if (!auth) console.warn("Firebase Auth is not initialized yet.");
  return auth;
};

export const getDb = () => {
  const db = getGlobal('fbDb');
  if (!db) console.warn("Firebase Firestore (fbDb) is not initialized yet.");
  return db;
};

// Standard Method Bridge
const getMethod = (serviceName: string, methodName: string) => {
  return (...args: any[]) => {
    const methods = getGlobal(serviceName);
    if (!methods || !methods[methodName]) {
      console.error(`Firebase method ${serviceName}.${methodName} is not available.`);
      return null;
    }
    return methods[methodName](...args);
  };
};

// Auth Methods
export const signInWithEmailAndPassword = (...args: any[]) => getMethod('fbAuthMethods', 'signInWithEmailAndPassword')(...args);
export const signOut = (...args: any[]) => getMethod('fbAuthMethods', 'signOut')(...args);
export const onAuthStateChanged = (...args: any[]) => getMethod('fbAuthMethods', 'onAuthStateChanged')(...args);

// Firestore Methods (Sync & Async handled by calling directly)
export const collection = (...args: any[]) => getMethod('fbFirestoreMethods', 'collection')(...args);
export const doc = (...args: any[]) => getMethod('fbFirestoreMethods', 'doc')(...args);
export const query = (...args: any[]) => getMethod('fbFirestoreMethods', 'query')(...args);
export const where = (...args: any[]) => getMethod('fbFirestoreMethods', 'where')(...args);
export const orderBy = (...args: any[]) => getMethod('fbFirestoreMethods', 'orderBy')(...args);
export const limit = (...args: any[]) => getMethod('fbFirestoreMethods', 'limit')(...args);
export const increment = (...args: any[]) => getMethod('fbFirestoreMethods', 'increment')(...args);

// Async Firestore Operations
export const getDoc = (...args: any[]) => getMethod('fbFirestoreMethods', 'getDoc')(...args);
export const getDocs = (...args: any[]) => getMethod('fbFirestoreMethods', 'getDocs')(...args);
export const setDoc = (...args: any[]) => getMethod('fbFirestoreMethods', 'setDoc')(...args);
export const addDoc = (...args: any[]) => getMethod('fbFirestoreMethods', 'addDoc')(...args);
export const updateDoc = (...args: any[]) => getMethod('fbFirestoreMethods', 'updateDoc')(...args);
export const deleteDoc = (...args: any[]) => getMethod('fbFirestoreMethods', 'deleteDoc')(...args);

export const Timestamp = {
  now: () => getGlobal('fbFirestoreMethods')?.Timestamp?.now() || new Date(),
  fromDate: (date: Date) => getGlobal('fbFirestoreMethods')?.Timestamp?.fromDate(date) || date,
};
