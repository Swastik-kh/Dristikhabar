
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

  const getThumbnail = () => {
    if (news.featuredImage) return news.featuredImage;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = news.videoUrl?.match(youtubeRegex);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    return 'logo.png';
  };

  const thumbnail = getThumbnail();

  // Primary list style as requested (Image on right, text on left)
  return (
    <div className="group py-8 border-b border-slate-100 last:border-0">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Left Content */}
        <div className="flex-1 order-2 md:order-1">
          <Link to={newsLink} className="block group">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-red-700 transition-colors font-mukta">
              {news.title}
            </h2>
          </Link>

          {shouldShowAuthorName && news.authorName && (
            <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-1">
              {news.authorName}
            </p>
          )}

          <Link to={newsLink} className="block">
            <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed line-clamp-3 mb-6">
              {news.summary}
            </p>
          </Link>

          {/* Action Icons like in the reference image */}
          <div className="flex items-center gap-6 text-slate-500">
            <button className="flex items-center gap-2 hover:text-red-700 transition-colors group/action">
              <svg className="w-5 h-5 group-hover/action:fill-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest">संग्रह</span>
            </button>
            <button className="flex items-center gap-2 hover:text-red-700 transition-colors group/action">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest">सेयर</span>
            </button>
          </div>
        </div>

        {/* Right Image */}
        <Link to={newsLink} className="w-full md:w-[280px] shrink-0 order-1 md:order-2">
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
    </div>
  );
};

export default NewsCard;
