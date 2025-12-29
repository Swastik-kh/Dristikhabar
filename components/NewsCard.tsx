
import React from 'react';
import { NewsItem } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  news: NewsItem;
  horizontal?: boolean;
}

const NewsCard: React.FC<Props> = ({ news, horizontal = false }) => {
  const shouldShowAuthorName = news.showAuthorName === undefined ? true : news.showAuthorName;
  const newsLink = `/news/${news.slug || news.id}`;

  // Smart Thumbnail Detection
  const getThumbnail = () => {
    if (news.featuredImage) return news.featuredImage;
    
    // Check for YouTube Thumbnail
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = news.videoUrl?.match(youtubeRegex);
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    }

    return 'logo.png';
  };

  const thumbnail = getThumbnail();

  if (horizontal) {
    return (
      <Link to={newsLink} className="flex gap-4 group items-start">
        <div className="relative shrink-0 w-32 h-20 overflow-hidden rounded-xl shadow-sm border border-slate-100 bg-slate-100">
          <img 
            src={thumbnail} 
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => (e.currentTarget.src = 'logo.png')}
          />
          {news.isBreaking && (
            <span className="absolute top-1 left-1 bg-red-600 w-2.5 h-2.5 rounded-full border-2 border-white animate-ping"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-red-600 text-[9px] font-black uppercase tracking-widest">{news.category}</span>
          <h3 className="text-sm font-bold leading-tight group-hover:text-red-700 line-clamp-2 transition-colors mt-1 font-mukta">
            {news.title}
          </h3>
          <p className="text-gray-400 text-[10px] mt-1 font-bold flex items-center gap-1">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             ताजा अपडेट
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={newsLink} className="block group">
      <div className="overflow-hidden rounded-2xl mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-500 border border-slate-100 aspect-video bg-slate-100">
        <img 
          src={thumbnail} 
          alt={news.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          onError={(e) => (e.currentTarget.src = 'logo.png')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {news.isBreaking && (
           <div className="absolute top-3 left-3 bg-red-700 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg border border-red-500">TAJA</div>
        )}
        {news.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest group-hover:bg-red-50 group-hover:text-red-700 transition-colors">{news.category}</span>
      </div>
      <h2 className="text-xl font-black leading-snug group-hover:text-red-700 transition-colors line-clamp-2 font-mukta h-[3.5rem]">
        {news.title}
      </h2>
      <p className="text-gray-500 text-sm mt-2 line-clamp-2 font-medium opacity-80">
        {news.summary}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-400">
         {shouldShowAuthorName && news.authorName && (
           <span className="flex items-center gap-1">
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             {news.authorName}
           </span>
         )}
         <span className="flex items-center gap-1 group-hover:text-red-700 transition-colors">
           पुरा पढ्नुहोस्
           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
         </span>
      </div>
    </Link>
  );
};

export default NewsCard;
