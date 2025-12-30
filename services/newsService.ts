
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
  limit as firestoreLimit,
  setDoc // Added setDoc for daily views
} from "./firebase";
import { NewsItem } from "../types";
import { getNepalLocalDateString } from '../utils/nepaliDate'; // New import for daily views

const COLLECTION_NEWS = "news_portal_data";
const COLLECTION_DAILY_VIEWS = "daily_views"; // New collection name

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

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NEWS), {
        ...newsData,
        slug: finalSlug,
        views: 0,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (e: any) {
      console.error("Error creating news:", e);
      throw new Error(`समाचार सिर्जना गर्दा त्रुटि भयो: ${e.message}`);
    }
  },

  async getPublishedNews() {
    const db = getDb();
    if (!db) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NEWS), 
        where("status", "==", "published")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
      return results.sort((a, b) => getTime(b.publishedAt) - getTime(a.publishedAt));
    } catch (err: any) {
      console.error("Firestore error in getPublishedNews:", err);
      throw new Error(`प्रकाशित समाचारहरू प्राप्त गर्दा त्रुटि भयो: ${err.message}`);
    }
  },

  async getNewsByIdOrSlug(identifier: string) {
    const db = getDb();
    if (!db) return null;

    let newsItem: NewsItem | null = null;
    let docRef = null;

    // 1. First try by Document ID
    try {
      docRef = doc(db, COLLECTION_NEWS, identifier);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        newsItem = { id: snap.id, ...snap.data() } as NewsItem;
      }
    } catch (e) {
      // Not a valid ID format or other error, proceed to slug search
      console.warn("Attempt to get news by ID failed:", e);
    }

    // 2. If not found by ID, try by Slug
    if (!newsItem) {
      const q = query(
        collection(db, COLLECTION_NEWS),
        where("slug", "==", identifier),
        firestoreLimit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        docRef = doc(db, COLLECTION_NEWS, querySnapshot.docs[0].id);
        newsItem = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as NewsItem;
      }
    }

    if (newsItem && docRef) {
      // Increment views on the news item
      await updateDoc(docRef, { views: increment(1) }).catch(e => console.warn("News view increment failed:", e));

      // Increment daily total views
      const todayDateString = getNepalLocalDateString();
      const dailyViewsRef = doc(db, COLLECTION_DAILY_VIEWS, todayDateString);
      try {
        await setDoc(dailyViewsRef, {
          date: Timestamp.now(), // Store a timestamp for querying, ID is also date
          totalViews: increment(1)
        }, { merge: true }); // Use merge to create if not exists, update if exists
      } catch (e) {
        console.error("Daily views increment failed:", e);
        // Do not re-throw here, as it's a secondary operation and shouldn't block news retrieval
      }
      return newsItem;
    }
    
    // If newsItem is still null at this point
    if (!newsItem) {
      throw new Error("समाचार फेला परेन।");
    }

    return null; // Should not reach here
  },

  async getNewsById(id: string) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");
    try {
      const docRef = doc(db, COLLECTION_NEWS, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as NewsItem;
      }
      throw new Error("समाचार फेला परेन।");
    } catch (e: any) {
      console.error("Error fetching news by ID:", e);
      throw new Error(`समाचार प्राप्त गर्दा त्रुटि भयो: ${e.message}`);
    }
  },

  async updateNews(id: string, updates: Partial<NewsItem>) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");
    try {
      const docRef = doc(db, COLLECTION_NEWS, id);
      await updateDoc(docRef, updates);
    } catch (e: any) {
      console.error("Error updating news:", e);
      throw new Error(`समाचार अपडेट गर्दा त्रुटि भयो: ${e.message}`);
    }
  },

  async deleteNews(id: string) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");
    try {
      await deleteDoc(doc(db, COLLECTION_NEWS, id));
    } catch (e: any) {
      console.error("Error deleting news:", e);
      throw new Error(`समाचार हटाउँदा त्रुटि भयो: ${e.message}`);
    }
  },

  async getRecentNews(count: number = 5) {
    const db = getDb();
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NEWS));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
      return results
        .sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt))
        .slice(0, count);
    } catch (err: any) {
      console.error("Firestore error in getRecentNews:", err);
      throw new Error(`हालैका समाचारहरू प्राप्त गर्दा त्रुटि भयो: ${err.message}`);
    }
  }
};