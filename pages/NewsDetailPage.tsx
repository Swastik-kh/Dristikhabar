
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NewsItem } from '../types';
import { getRelativeTime } from '../utils/nepaliDate';
import { newsService } from '../services/newsService';
import { APP_NAME } from '../constants';

const NewsDetailPage: React.FC<{ previewData?: Partial<NewsItem> }> = ({ previewData }) => {
  const { id } = useParams();
  const [news, setNews] = useState<Partial<NewsItem> | null>(null);
  const [loading, setLoading] = useState(!previewData);

  useEffect(() => {
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
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchNews();
    }

    return () => {
      document.title = `${APP_NAME} - सत्य, तथ्य र निष्पक्ष समाचार`;
    };
  }, [id, previewData]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">समाचार खुल्दैछ...</p>
    </div>
  );
  
  if (!news || Object.keys(news).length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
      <h2 className="text-3xl font-black text-slate-300 mb-4">माफ गर्नुहोला!</h2>
      <p className="text-slate-500 font-bold mb-8">यो समाचार फेला परेन वा हटाइएको हुन सक्छ।</p>
      <button onClick={() => window.location.href = '#/'} className="bg-red-700 text-white px-8 py-3 rounded-2xl font-black">मुख्य पृष्ठमा जानुहोस्</button>
    </div>
  );

  const renderMedia = () => {
    const videoUrl = news.videoUrl || '';
    
    // YouTube Regex
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = videoUrl.match(youtubeRegex);

    // Facebook Regex
    const fbRegex = /(?:facebook\.com\/(?:video\.php\?v=|watch\/\?v=|[^\/]+\/videos\/|reel\/)|fb\.watch\/)([a-zA-Z0-9_-]+)/;
    const fbMatch = videoUrl.match(fbRegex);

    if (ytMatch) {
      const videoId = ytMatch[1];
      return (
        <div className="mb-10 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white">
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}?autoplay=0`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
      );
    }

    if (fbMatch) {
      return (
        <div className="mb-10 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white">
          <iframe 
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560`} 
            width="100%" height="100%" 
            style={{ border: 'none', overflow: 'hidden' }} 
            scrolling="no" frameBorder="0" allowFullScreen={true} 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        </div>
      );
    }

    // Default: Check if videoUrl is a direct file link
    if (videoUrl && (videoUrl.includes('.mp4') || videoUrl.includes('data:video'))) {
      return (
        <div className="mb-10 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white">
          <video src={videoUrl} controls className="w-full h-full object-contain" />
        </div>
      );
    }

    // If no video but has featuredImage
    if (news.featuredImage) {
      return (
        <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
          <img src={news.featuredImage} className="w-full aspect-video object-cover" alt={news.title} />
        </div>
      );
    }

    return null;
  };

  const authorName = news.showAuthorName && news.authorName ? news.authorName : "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-mukta">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-red-700 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
            {news.category}
          </span>
          <div className="h-0.5 flex-1 bg-slate-100"></div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.15] mb-8 tracking-tight">
          {news.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm border-y border-slate-100 py-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732" />
              </svg>
            </div>
            <div>
              <p className="text-slate-900 font-black text-lg">{authorName || "दृष्टि संवाददाता"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-bold">{news.publishedAt ? getRelativeTime(news.publishedAt) : 'भर्खरै'}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            <span className="font-black text-slate-900">{news.views || 0}</span>
          </div>
        </div>
      </div>
      
      {renderMedia()}

      <div 
        className="prose prose-xl max-w-none text-slate-800 leading-[1.8] font-medium text-xl md:text-2xl whitespace-pre-wrap selection:bg-red-100 selection:text-red-900"
        dangerouslySetInnerHTML={{ __html: news.content || '' }}
      />
      
      <div className="mt-16 pt-10 border-t border-slate-100">
         <div className="bg-slate-50 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-black text-xl text-slate-800">यो समाचार सेयर गर्नुहोस्</h4>
              <p className="text-slate-500 font-bold text-sm">सत्य र तथ्य समाचार सबै माझ पुर्‍याउनुहोस्।</p>
            </div>
            <div className="flex gap-4">
               <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12.073-12-12.073s-12 5.446-12 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
               </button>
               <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("लिङ्क कपी गरियो!"); }} className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
