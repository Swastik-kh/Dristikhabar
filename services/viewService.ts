
import { getDb, collection, getDocs, doc, query, where, Timestamp, orderBy, getDoc } from "./firebase";
import { getNepalLocalDateString } from '../utils/nepaliDate';
import { NewsItem } from '../types'; // For getAllTimeTotalViews

const DAILY_VIEWS_COLLECTION = "daily_views";
const NEWS_COLLECTION = "news_portal_data";

export interface DailyViewData {
  id: string; // YYYY-MM-DD
  date: any; // Firebase Timestamp
  totalViews: number;
}

export const viewService = {
  async getTodayViews(): Promise<number> {
    const db = getDb();
    if (!db) throw new Error("Database not connected.");
    try {
      const todayDateString = getNepalLocalDateString();
      const docRef = doc(db, DAILY_VIEWS_COLLECTION, todayDateString);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return (snap.data() as DailyViewData).totalViews || 0;
      }
      return 0;
    } catch (e: any) {
      console.error("Error fetching today's views:", e.message);
      throw new Error(`आजको भ्युज प्राप्त गर्दा त्रुटि भयो: ${e.message}`);
    }
  },

  async getWeeklyViews(): Promise<DailyViewData[]> {
    const db = getDb();
    if (!db) throw new Error("Database not connected.");
    try {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nepalTime = new Date(utc + (345 * 60000)); // Current time in Nepal

      const sevenDaysAgo = new Date(nepalTime);
      sevenDaysAgo.setDate(nepalTime.getDate() - 6); // Go back 6 days to include today (7 days total)
      sevenDaysAgo.setHours(0, 0, 0, 0); // Start of the day

      const startTimestamp = Timestamp.fromDate(sevenDaysAgo);
      
      const q = query(
        collection(db, DAILY_VIEWS_COLLECTION),
        where("date", ">=", startTimestamp),
        orderBy("date", "asc")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DailyViewData));
      
      // Create a map for quick lookup
      const dailyDataMap = new Map<string, number>();
      results.forEach(item => dailyDataMap.set(item.id, item.totalViews));

      // Fill in data for the last 7 days, including missing days with 0 views
      const finalData: DailyViewData[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(sevenDaysAgo);
        currentDate.setDate(sevenDaysAgo.getDate() + i);
        const id = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        finalData.push({
          id,
          date: Timestamp.fromDate(currentDate), // Placeholder timestamp for chart
          totalViews: dailyDataMap.get(id) || 0,
        });
      }

      return finalData;

    } catch (e: any) {
      console.error("Error fetching weekly views:", e.message);
      throw new Error(`साप्ताहिक भ्युज प्राप्त गर्दा त्रुटि भयो: ${e.message}`);
    }
  },

  async getAllTimeTotalViews(): Promise<number> {
    const db = getDb();
    if (!db) throw new Error("Database not connected.");
    try {
      const q = query(collection(db, NEWS_COLLECTION), where("status", "==", "published"));
      const snapshot = await getDocs(q);
      let totalViews = 0;
      snapshot.docs.forEach(doc => {
        const news = doc.data() as NewsItem;
        totalViews += news.views || 0;
      });
      return totalViews;
    } catch (e: any) {
      console.error("Error fetching all-time total views:", e.message);
      throw new Error(`कुल भ्युज प्राप्त गर्दा त्रुटि भयो: ${e.message}`);
    }
  }
};