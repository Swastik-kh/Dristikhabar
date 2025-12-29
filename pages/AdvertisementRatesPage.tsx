
import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const AdvertisementRatesPage: React.FC = () => {
  const [adRatesContent, setAdRatesContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings && settings.adRates) {
          setAdRatesContent(settings.adRates);
        } else {
          // Fallback to local storage if DB fetch fails or is empty
          const savedAdRates = localStorage.getItem('drishti_ad_rates');
          if (savedAdRates) setAdRatesContent(savedAdRates);
        }
      } catch (err) {
        console.error("Failed to fetch ad rates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh] font-mukta">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-4">
          विज्ञापन <span className="text-red-700">दरहरू</span>
        </h1>
        <div className="h-2 w-32 bg-red-700 rounded-full"></div>
        <p className="mt-6 text-slate-500 font-bold text-lg">हाम्रो न्युज पोर्टलमा विज्ञापन गरी आफ्नो व्यवसाय प्रवर्द्धन गर्नुहोस्।</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 min-h-[300px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">विवरण खुल्दैछ...</p>
          </div>
        ) : adRatesContent ? (
          <div 
            className="prose prose-xl max-w-none text-slate-800 leading-[1.8] font-medium whitespace-pre-wrap selection:bg-red-100"
            dangerouslySetInnerHTML={{ __html: adRatesContent }}
          />
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">हाल विज्ञापन दरहरूको जानकारी उपलब्ध छैन।</p>
            <p className="text-slate-300 font-bold text-xs mt-2">कृपया थप जानकारीको लागि हाम्रो कार्यालयमा सम्पर्क गर्नुहोस्।</p>
          </div>
        )}
      </div>

      <div className="mt-12 bg-slate-900 rounded-[2rem] p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">विज्ञापनको लागि सम्पर्क</h3>
            <p className="text-slate-400 font-bold">हाम्रो बजार विभागसँग सिधै कुरा गर्नुहोस्।</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:marketing@drishtikhabar.com" className="bg-red-700 hover:bg-red-800 px-8 py-4 rounded-2xl font-black transition-all text-center">इमेल पठाउनुहोस्</a>
            <a href="tel:9800000000" className="bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-2xl font-black transition-all border border-slate-700 text-center">फोन गर्नुहोस्</a>
         </div>
      </div>
    </div>
  );
};

export default AdvertisementRatesPage;
