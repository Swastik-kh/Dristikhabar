
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NewsItem } from '../types';
import { getRelativeTime } from '../utils/nepaliDate';
import { newsService } from '../services/newsService';
import { settingsService } from '../services/settingsService';
import { APP_NAME } from '../constants';

const NewsDetailPage: React.FC<{ previewData?: Partial<NewsItem> }> = ({ previewData }) => {
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
               <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all text-center">फेसबुक</button>
               <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("लिङ्क कपी गरियो!"); }} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all border border-slate-700 text-center">लिङ्क कपी</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;