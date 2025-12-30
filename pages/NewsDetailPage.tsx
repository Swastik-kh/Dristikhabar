
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NewsItem } from '../types';
import { getRelativeTime } from '../utils/nepaliDate';
import { newsService } from '../services/newsService';
// Fix: Corrected import statement for settingsService and added missing APP_NAME import
import { settingsService } from '../services/settingsService';
import { APP_NAME } from '../constants';

// Fix: Added interface for props to correctly type `previewData`
interface NewsDetailPageProps {
  previewData?: Partial<NewsItem> | null;
}

// Fix: Corrected component definition to properly accept `previewData` as a prop
const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ previewData }) => {
  const { id } = useParams();
  const [news, setNews] = useState<Partial<NewsItem> | null>(null);
  const [loading, setLoading] = useState(!previewData);
  const [adsenseCode, setAdsenseCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null); // New state for error

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings?.adsenseCode) setAdsenseCode(settings.adsenseCode);
      } catch (err: any) {
        console.error("Failed to fetch settings for NewsDetailPage:", err);
        // Optionally set a non-blocking error for settings if critical
      }
    };
    fetchSettings();

    if (previewData) {
      setNews(previewData);
      setLoading(false);
      if (previewData.title) document.title = `${previewData.title} - ${APP_NAME}`;
    } else if (id) {
      const fetchNews = async () => {
        try {
          const item = await newsService.getNewsByIdOrSlug(id);
          if (item) {
            setNews(item);
            document.title = `${item.title} - ${APP_NAME}`;
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || "समाचार लोड गर्न सकेन।"); // Set error message
        } finally {
          setLoading(false);
        }
      };
      fetchNews();
    }
  }, [id, previewData]);

  // Execute AdSense script if code is present and component mounts/updates
  useEffect(() => {
    if (adsenseCode) {
      try {
        // Ensure that adsbygoogle.js is loaded from index.html
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.warn("Failed to push to adsbygoogle from NewsDetailPage:", e);
      }
    }
  }, [news, adsenseCode]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">समाचार खुल्दैछ...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center text-red-700 bg-red-50 rounded-xl m-4 border border-red-200">
      <p className="font-black text-lg mb-2">त्रुटि भयो!</p>
      <p className="text-base font-medium">{error}</p>
    </div>
  );

  if (!news || Object.keys(news).length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center text-slate-500">समाचार फेला परेन।</div>
  );

  const renderMedia = () => {
    const videoUrl = news.videoUrl || '';
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = videoUrl.match(youtubeRegex);

    if (ytMatch) {
      return (
        <div className="mb-10 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytMatch[1]}`} frameBorder="0" allowFullScreen></iframe>
        </div>
      );
    }

    if (news.featuredImage) {
      return (
        <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
          <img src={news.featuredImage} className="w-full aspect-video object-cover" alt={news.title} />
        </div>
      );
    }
    return null;
  };

  /**
   * Content Injection Logic:
   * Splits the content by paragraphs and inserts AdSense code after the 2nd paragraph.
   */
  const renderInjectedContent = () => {
    if (!news.content) return null;
    
    // Split by paragraph tags or double newlines
    const paragraphs = news.content.split('</p>');
    
    if (paragraphs.length <= 2 || !adsenseCode) {
      return <div className="prose prose-xl max-w-none text-slate-800 leading-[1.8] font-medium text-xl md:text-2xl whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: news.content }} />;
    }

    return (
      <div className="prose prose-xl max-w-none text-slate-800 leading-[1.8] font-medium text-xl md:text-2xl">
        {paragraphs.map((p, index) => (
          <React.Fragment key={index}>
            <div dangerouslySetInnerHTML={{ __html: p + (index < paragraphs.length - 1 ? '</p>' : '') }} />
            {index === 1 && ( // Show ad after the second paragraph
              <div className="my-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden text-center min-h-[100px] flex items-center justify-center">
                 <div dangerouslySetInnerHTML={{ __html: adsenseCode }} />
              </div>
            )}
            {index === 4 && paragraphs.length > 6 && ( // Show another ad after the fifth paragraph if content is long
              <div className="my-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden text-center min-h-[100px] flex items-center justify-center">
                 <div dangerouslySetInnerHTML={{ __html: adsenseCode }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const authorName = news.showAuthorName && news.authorName ? news.authorName : "";
  const shareUrl = `${window.location.origin}/news/${news.slug || news.id}`; // Clean URL for external sharing

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-mukta">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-red-700 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">{news.category}</span>
          <div className="h-0.5 flex-1 bg-slate-100"></div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.15] mb-8 tracking-tight">{news.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm border-y border-slate-100 py-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732" /></svg>
            </div>
            <div><p className="text-slate-900 font-black text-lg">{authorName || "दृष्टि संवाददाता"}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-bold">{news.publishedAt ? getRelativeTime(news.publishedAt) : 'भर्खरै'}</span>
          </div>
        </div>
      </div>
      
      {renderMedia()}

      {renderInjectedContent()}
      
      <div className="mt-16 pt-10 border-t border-slate-100">
         <div className="bg-slate-50 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-black text-xl text-slate-800">यो समाचार सेयर गर्नुहोस्</h4>
              <p className="text-slate-500 font-bold text-sm">सत्य र तथ्य समाचार सबै माझ पुर्‍याउनुहोस्।</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                 onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')} 
                 className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all"
                 aria-label="फेसबुकमा सेयर गर्नुहोस्"
               >
                 <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12.073-12-12.073s-12 5.446-12 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
               </button>
               <button 
                 onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(news.title || '')}`, '_blank')} 
                 className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all"
                 aria-label="ट्वीटर (X) मा सेयर गर्नुहोस्"
               >
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
               </button>
               <button 
                 onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${news.title || ''}\n${shareUrl}`)}`, '_blank')} 
                 className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all"
                 aria-label="ह्वाट्सएपमा सेयर गर्नुहोस्"
               >
                 <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
               </button>
               <button 
                 onClick={() => { navigator.clipboard.writeText(shareUrl); alert("लिङ्क कपी गरियो!"); }} 
                 className="w-16 h-16 bg-slate-800 text-white rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700"
                 aria-label="लिङ्क कपी गर्नुहोस्"
               >
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
