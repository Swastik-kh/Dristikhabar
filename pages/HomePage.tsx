
import React, { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import { NewsItem } from '../types';
import { Link, useParams } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { newsService } from '../services/newsService';
import { settingsService } from '../services/settingsService';

const HomePage: React.FC = () => {
  const { id } = useParams();
  const [publishedNews, setPublishedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [topAd, setTopAd] = useState<any>(null);
  const [bottomAd, setBottomAd] = useState<any>(null);
  const [adsenseCode, setAdsenseCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null); // New state for error

  useEffect(() => {
    const fetchNewsAndSettings = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const [newsData, settings] = await Promise.all([
          newsService.getPublishedNews(),
          settingsService.getSettings()
        ]);
        
        setPublishedNews(newsData);
        
        if (settings) {
          if (settings.topAd) setTopAd(settings.topAd);
          if (settings.bottomAd) setBottomAd(settings.bottomAd);
          if (settings.adsenseCode) setAdsenseCode(settings.adsenseCode);
        } else {
          const savedTop = localStorage.getItem('drishti_top_ad');
          const savedBottom = localStorage.getItem('drishti_bottom_ad');
          const savedAdsense = localStorage.getItem('drishti_adsense_code');
          if (savedTop) setTopAd(JSON.parse(savedTop));
          if (savedBottom) setBottomAd(JSON.parse(savedBottom));
          if (savedAdsense) setAdsenseCode(savedAdsense);
        }
      } catch (err: any) {
        console.error("Failed to fetch news or settings for HomePage:", err);
        setError(`समाचार वा सेटिङ्गहरू लोड गर्दा त्रुटि भयो: ${err.message || "अज्ञात त्रुटि"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsAndSettings();
  }, []);

  // Execute AdSense script if code is present and component mounts/updates
  useEffect(() => {
    if (adsenseCode) {
      try {
        // This ensures the ad slot is refreshed.
        // The main adsbygoogle.js script must be loaded in index.html for this to work.
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.warn("Failed to push to adsbygoogle from HomePage:", e);
      }
    }
  }, [adsenseCode, topAd, bottomAd]); // Rerun if adsenseCode or ad settings change

  const breakingNews = publishedNews.filter(news => news.isBreaking).slice(0, 3);
  const isCategoryPage = id !== undefined;

  let displayNews = publishedNews;
  let categoryLabel = 'ताजा खबर';

  if (isCategoryPage) {
    if (id === 'all') {
      displayNews = publishedNews;
      categoryLabel = 'सबै समाचार';
    } else {
      const category = CATEGORIES.find(c => c.id === id);
      if (category) {
        displayNews = publishedNews.filter(n => n.category === category.label);
        categoryLabel = category.label;
      }
    }
  }
  
  const mukhyaSamachar = displayNews.length > 0 ? displayNews[0] : null;
  const latestUpdates = displayNews.filter(n => n.id !== (mukhyaSamachar?.id)).slice(0, 15);

  const renderAdBanner = (adSettings: any, label: string) => {
    if (!adSettings) return null;
    
    const isCustomAdConfigured = adSettings.mediaUrl || (adSettings.titleText && adSettings.titleText.trim() !== '');

    if (isCustomAdConfigured) {
      return (
        <div className="mb-10 group">
          <Link to={adSettings.adLink || '/advertisement-rates'} className="block overflow-hidden rounded-2xl shadow-lg border border-slate-100 bg-slate-50 relative">
            <div className="absolute top-2 right-2 bg-black/20 text-white text-[8px] px-1.5 py-0.5 rounded font-black z-10 backdrop-blur-sm tracking-widest">{label}</div>
            {adSettings.mediaType === 'image' && adSettings.mediaUrl ? (
              <img src={adSettings.mediaUrl} alt="Advertisement" className="w-full h-auto max-h-[120px] md:max-h-[250px] object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            ) : adSettings.mediaType === 'video' && adSettings.mediaUrl ? (
              <div className="aspect-[21/9] md:aspect-[32/9] w-full overflow-hidden bg-black">
                <video src={adSettings.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              </div>
            ) : adSettings.titleText ? (
              <div className="py-8 md:py-16 px-6 text-center bg-gradient-to-br from-red-50 via-white to-blue-50">
                <h4 className="text-xl md:text-4xl font-black text-slate-800 group-hover:text-red-700 transition-colors transform group-hover:scale-105 duration-500">{adSettings.titleText}</h4>
                <p className="text-slate-400 text-[10px] mt-3 font-black uppercase tracking-[0.3em]">DRISHTI KHABAR AD NETWORK</p>
              </div>
            ) : null}
          </Link>
        </div>
      );
    } else if (adsenseCode) {
      // Render AdSense if no custom ad is configured and AdSense code is available
      return (
        <div className="mb-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden text-center min-h-[100px] flex items-center justify-center">
           <div dangerouslySetInnerHTML={{ __html: adsenseCode }} />
        </div>
      );
    } else {
      // Fallback to default "ADVERTISEMENT" message if neither custom nor AdSense is available
      return (
        <Link to="/advertisement-rates" className="hidden lg:flex flex-1 max-w-2xl mx-auto h-24 items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">ADVERTISEMENT</p>
            <p className="text-slate-400 font-bold text-xs group-hover:text-red-700">हाम्रो पोर्टलमा विज्ञापनको लागि यहाँ क्लिक गर्नुहोस्</p>
          </div>
        </Link>
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">लोड हुँदैछ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative animate-shake mx-auto max-w-lg" role="alert">
          <strong className="font-bold">त्रुटि:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      {(!id || id === 'all') && (
        <>
          <div className="bg-white border-2 border-slate-100 mb-8 flex items-center overflow-hidden h-14 shadow-sm rounded-3xl">
            <div className="bg-red-700 text-white px-6 py-4 text-xs font-black shrink-0 z-10 shadow-xl uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              ताजा अपडेट
            </div>
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
              <div className="animate-marquee text-slate-800 font-black text-xl">
                {breakingNews.length > 0 ? (
                  <>{breakingNews.map((n) => (<Link key={n.id} to={`/news/${n.slug || n.id}`} className="mx-10 inline-block hover:text-red-700 transition-colors">{n.title}</Link>))}</>
                ) : (
                  <span className="mx-10 inline-block">दृष्टि खबरमा स्वागत छ! सत्य र तथ्यपूर्ण समाचारका लागि सधैं हामीलाई सम्झनुहोस्।</span>
                )}
              </div>
            </div>
          </div>
          {renderAdBanner(topAd, 'SPONSORED TOP')}
        </>
      )}

      {isCategoryPage ? (
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-4xl font-black text-slate-900">{categoryLabel}</h2>
            <div className="h-1 flex-1 bg-slate-100 rounded-full"><div className="h-full w-24 bg-red-700 rounded-full"></div></div>
          </div>
          <div className="max-w-5xl">
            {displayNews.length > 0 ? (
              <div className="flex flex-col">
                {displayNews.map(news => <NewsCard key={news.id} news={news} />)}
              </div>
            ) : (
              <div className="bg-white p-32 text-center rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 font-black uppercase tracking-widest">समाचार फेला परेन।</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black text-slate-900 shrink-0">मुख्य समाचार</h2>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-32 bg-red-700"></div></div>
            </div>
            
            {mukhyaSamachar ? (
              <Link to={`/news/${mukhyaSamachar.slug || mukhyaSamachar.id}`} className="relative block rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group">
                <div className="aspect-video bg-slate-200">
                  <img src={mukhyaSamachar.featuredImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 md:p-12 flex flex-col justify-end">
                   <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-widest">{mukhyaSamachar.category}</span>
                   <h1 className="text-white text-3xl md:text-5xl font-black leading-tight group-hover:text-red-400 transition-colors drop-shadow-2xl">{mukhyaSamachar.title}</h1>
                   <div className="mt-6 flex items-center gap-6 text-white/70 text-sm font-black uppercase tracking-widest">
                     <span className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{mukhyaSamachar.authorName?.charAt(0)}</div>{mukhyaSamachar.authorName}</span>
                     <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span><span>ताजा अपडेट</span>
                   </div>
                </div>
              </Link>
            ) : null}

            {/* List Layout for Latest Updates as per reference image */}
            <div className="flex flex-col">
              {latestUpdates.map(news => <NewsCard key={news.id} news={news} />)}
            </div>
          </div>

          <div className="lg:col-span-4">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50 sticky top-28">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">लोकप्रिय</h3>
                  <div className="h-px flex-1 bg-slate-100 mx-4"></div>
                </div>
                <div className="space-y-8">
                  {publishedNews.slice(0, 8).map(news => (
                    <Link key={news.id} to={`/news/${news.slug || news.id}`} className="flex gap-4 group items-start">
                      <div className="relative shrink-0 w-24 h-16 overflow-hidden rounded-lg bg-slate-100">
                        <img src={news.featuredImage || 'logo.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold leading-tight group-hover:text-red-700 line-clamp-2 transition-colors font-mukta">{news.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">{news.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}
      {renderAdBanner(bottomAd, 'SPONSORED BOTTOM')}
    </main>
  );
};

export default HomePage;