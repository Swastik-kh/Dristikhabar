
import { getDb, doc, getDoc, setDoc } from "./firebase";

const SETTINGS_COLLECTION = "site_settings";
const CONFIG_DOC = "main";

export const settingsService = {
  async getSettings() {
    try {
      const db = getDb();
      if (!db) return null;
      
      const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC);
      const snap = await getDoc(docRef);
      if (snap && snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e: any) {
      console.error("Settings fetch error:", e.message);
      return null;
    }
  },

  async updateSettings(data: any) {
    try {
      const db = getDb();
      if (!db) throw new Error("डेटाबेस जडान हुन सकेन। कृपया एकछिन पर्खेर पुन: प्रयास गर्नुहोस्।");
      
      // Ensure the reference is created synchronously
      const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC);
      
      // Firestore has a 1MB per document limit
      const stringData = JSON.stringify(data);
      if (stringData.length > 900000) { 
        throw new Error("लोगोको फाइल साइज धेरै ठूलो भयो। कृपया सानो साइजको फोटो प्रयोग गर्नुहोस् वा लिङ्क मात्र राख्नुहोस्।");
      }

      console.log("Saving settings to path: site_settings/main", data);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (e: any) {
      console.error("Settings Update Failed:", e);
      throw e;
    }
  }
};
