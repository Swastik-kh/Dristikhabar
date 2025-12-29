
import { 
  getDb,
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  increment,
  limit as firestoreLimit
} from "./firebase";
import { NewsItem } from "../types";

const COLLECTION_NAME = "news_portal_data";

// Helper to normalize dates for sorting
const getTime = (date: any) => {
  if (!date) return 0;
  if (date.seconds) return date.seconds * 1000;
  return new Date(date).getTime();
};

export const newsService = {
  async createNews(newsData: Omit<NewsItem, 'id' | 'views'>) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");
    
    // Ensure slug is unique-ish by adding a small timestamp if needed
    const finalSlug = newsData.slug || newsData.title.trim().replace(/\s+/g, '-').toLowerCase();

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...newsData,
      slug: finalSlug,
      views: 0,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getPublishedNews() {
    const db = getDb();
    if (!db) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("status", "==", "published")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
      return results.sort((a, b) => getTime(b.publishedAt) - getTime(a.publishedAt));
    } catch (err) {
      console.error("Firestore error in getPublishedNews:", err);
      return [];
    }
  },

  async getNewsByIdOrSlug(identifier: string) {
    const db = getDb();
    if (!db) return null;

    // 1. First try by Document ID
    try {
      const docRef = doc(db, COLLECTION_NAME, identifier);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        updateDoc(docRef, { views: increment(1) }).catch(e => console.warn("View update failed", e));
        return { id: snap.id, ...snap.data() } as NewsItem;
      }
    } catch (e) {
      // Not a valid ID format, proceed to slug search
    }

    // 2. Try by Slug
    const q = query(
      collection(db, COLLECTION_NAME),
      where("slug", "==", identifier),
      firestoreLimit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const foundDoc = querySnapshot.docs[0];
      const docRef = doc(db, COLLECTION_NAME, foundDoc.id);
      updateDoc(docRef, { views: increment(1) }).catch(e => console.warn("View update failed", e));
      return { id: foundDoc.id, ...foundDoc.data() } as NewsItem;
    }

    return null;
  },

  async getNewsById(id: string) {
    return this.getNewsByIdOrSlug(id);
  },

  async updateNews(id: string, updates: Partial<NewsItem>) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  },

  async deleteNews(id: string) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  async getRecentNews(count: number = 5) {
    const db = getDb();
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
      return results
        .sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt))
        .slice(0, count);
    } catch (err) {
      console.error("Firestore error in getRecentNews:", err);
      return [];
    }
  }
};
