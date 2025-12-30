
import React, { useState, useRef, useEffect } from 'react';
import { NewsItem } from '../types';
import { Link } from 'react-router-dom';
import { getRelativeTime } from '../utils/nepaliDate';

interface Props {
  news: NewsItem;
  horizontal?: boolean;
}

const NewsCard: React.FC<Props> = ({ news, horizontal = false }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shouldShowAuthorName = news.showAuthorName === undefined ? true : news.showAuthorName;
  const newsLink = `${window.location.origin}/#/news/${news.slug || news.id}`;
  const displayLink = `/news/${news.slug || news.id}`;

  const getThumbnail = () => {
    if (news.featuredImage) return news.featuredImage;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = news.videoUrl?.match(youtubeRegex);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    return 'logo.png';
  };

  const thumbnail = getThumbnail();
  const authorName = shouldShowAuthorName && news.authorName ? news.authorName : "";
  const publishedDate = getRelativeTime(news.publishedAt);

  // Close share menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    const text = `${news.title}\n\nथप पढ्नुहोस्: `;
    const url = newsLink;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert("लिङ्क कपी गरियो!");
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="group py-8 border-b border-slate-100 last:border-0">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Left Content */}
        <div className="flex-1 order-2 md:order-1">
          <Link to={displayLink} className="block group">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-red-700 transition-colors font-mukta">
              {news.title}
            </h2>
          </Link>

          {/* Author and Date Meta Info */}
          <div className="flex items-center gap-3 mb-3 text-slate-400 text-sm font-bold">
            <span className="flex items-center gap-1.5 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {authorName}
            </span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {publishedDate}
            </span>
          </div>

          <Link to={displayLink} className="block">
            <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed line-clamp-3 mb-6">
              {news.summary}
            </p>
          </Link>

          {/* Action Icons */}
          <div className="flex items-center gap-6 text-slate-500 relative">
            <button className="flex items-center gap-2 hover:text-red-700 transition-colors group/action">
              <svg className="w-5 h-5 group-hover/action:fill-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest">संग्रह</span>
            </button>
            
            <div className="relative" ref={shareMenuRef}>
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`flex items-center gap-2 transition-colors group/action ${showShareMenu ? 'text-red-700' : 'hover:text-red-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-widest">सेयर</span>
              </button>

              {/* Share Options Dropdown */}
              {showShareMenu && (
                <div className="absolute left-0 bottom-full mb-4 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-fadeInUp">
                  <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12.073-12-12.073s-12 5.446-12 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    <span className="text-sm font-black text-slate-700">फेसबुक</span>
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </div>
                    <span className="text-sm font-black text-slate-700">ट्वीटर (X)</span>
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </div>
                    <span className="text-sm font-black text-slate-700">ह्वाट्सएप</span>
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </div>
                    <span className="text-sm font-black text-slate-700">लिङ्क कपी</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Image */}
        <Link to={displayLink} className="w-full md:w-[280px] shrink-0 order-1 md:order-2">
          <div className="relative aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 shadow-sm border border-slate-50">
            <img 
              src={thumbnail} 
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => (e.currentTarget.src = 'logo.png')}
            />
            {news.isBreaking && (
              <div className="absolute top-2 left-2 bg-red-700 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">TAJA</div>
            )}
            {news.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default NewsCard;
