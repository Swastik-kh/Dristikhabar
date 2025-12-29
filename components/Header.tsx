
import React, { useState, useEffect } from 'react';
import { getCurrentNepaliDate } from '../utils/nepaliDate';
import { CATEGORIES, APP_NAME } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import { settingsService } from '../services/settingsService';

interface HeaderProps {
  logo?: string;
}

const Header: React.FC<HeaderProps> = ({ logo }) => {
  const [bsDate, setBsDate] = useState(getCurrentNepaliDate());
  const [siteLogo, setSiteLogo] = useState<string>(logo || localStorage.getItem('drishti_site_logo') || 'logo.png');
  const [topAd, setTopAd] = useState<any>(null);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (logo) setSiteLogo(logo);
    
    const fetchSettings = async () => {
      const settings = await settingsService.getSettings();
      if (settings && settings.topAd) {
        setTopAd(settings.topAd);
      } else {
        const savedTop = localStorage.getItem('drishti_top_ad');
        if (savedTop) setTopAd(JSON.parse(savedTop));
      }
    };
    fetchSettings();
  }, [logo]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setInterval(() => setBsDate(getCurrentNepaliDate()), 60000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const renderHeaderAd = () => {
    if (!topAd || (!topAd.mediaUrl && !topAd.titleText)) {
      return (
        <Link to="/advertisement-rates" className="hidden lg:flex flex-1 max-w-2xl mx-auto h-24 items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">ADVERTISEMENT</p>
            <p className="text-slate-400 font-bold text-xs group-hover:text-red-700">हाम्रो पोर्टलमा विज्ञापनको लागि यहाँ क्लिक गर्नुहोस्</p>
          </div>
        </Link>
      );
    }

    return (
      <Link to={topAd.adLink || '/advertisement-rates'} className="hidden md:block flex-1 max-w-2xl mx-auto h-24 overflow-hidden rounded-xl border border-slate-100 relative group">
        <div className="absolute top-1 right-2 text-[8px] font-black text-white/50 z-10 uppercase tracking-widest">Sponsored</div>
        {topAd.mediaType === 'image' && topAd.mediaUrl ? (
          <img src={topAd.mediaUrl} alt="Ad" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : topAd.mediaType === 'video' && topAd.mediaUrl ? (
          <video src={topAd.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center p-4">
            <p className="text-white font-black text-lg text-center line-clamp-1">{topAd.titleText}</p>
          </div>
        )}
      </Link>
    );
  };

  return (
    <header className="bg-white">
      {/* Top Bar */}
      <div className="bg-slate-950 text-white py-1.5 px-4 text-[10px] md:text-xs grid grid-cols-3 items-center relative z-30">
        <div className="flex items-center gap-4">
          <span className="font-black tracking-[0.1em] uppercase text-red-500 animate-pulse">LIVE</span>
          <span className="font-bold tracking-wide text-slate-400 hidden sm:inline-block">{bsDate.formatted}</span>
        </div>
        <div className="text-center">
          <span className="font-black tracking-widest text-white uppercase text-[9px] md:text-[11px]">सत्य, तथ्य र निष्पक्ष समाचार</span>
        </div>
        <div className="flex justify-end items-center gap-4">
          <Link to="/admin/login" className="text-white hover:text-red-400 transition-colors font-black uppercase text-[9px] tracking-widest">Login</Link>
        </div>
      </div>

      {/* Main Header Layout: Logo Left, Ad Center */}
      <div className={`container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 ${isSticky ? 'opacity-0 h-0 overflow-hidden py-0' : 'opacity-100'}`}>
        <div className="shrink-0">
          <Link to="/" className="block">
            <img 
              src={siteLogo} 
              alt={APP_NAME} 
              className="h-20 md:h-24 object-contain transition-transform hover:scale-105" 
              onError={(e) => { (e.target as HTMLImageElement).src = 'logo.png'; }}
            />
          </Link>
        </div>
        
        {renderHeaderAd()}
        
        {/* Right side spacer for desktop to keep ad centered */}
        <div className="hidden lg:block w-48"></div>
      </div>

      {/* Navigation & Sticky Logo */}
      <div className={`bg-white border-b border-slate-100 shadow-xl transition-all duration-300 z-[100] ${isSticky ? 'fixed top-0 left-0 w-full animate-slideInDown' : 'relative'}`}>
        <div className="container mx-auto px-4 flex items-center h-14 md:h-18">
          
          {/* Logo in Sticky Mode - Now visible! */}
          <div className={`transition-all duration-500 flex items-center ${isSticky ? 'w-auto mr-6 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            <Link to="/">
              <img src={siteLogo} alt="Logo" className="h-10 md:h-12 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'logo.png'; }} />
            </Link>
          </div>

          <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full">
            <ul className="flex items-center min-w-max h-full">
              <li>
                <Link to="/category/all" className={`px-4 h-full flex items-center text-sm md:text-lg font-black transition-colors ${isActive('/category/all') ? 'text-red-700' : 'text-slate-600 hover:text-red-700'}`}>सबै</Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.id}`} className={`px-4 h-full flex items-center text-sm md:text-lg font-black whitespace-nowrap transition-colors ${isActive(`/category/${cat.id}`) ? 'text-red-700' : 'text-slate-600 hover:text-red-700'}`}>{cat.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="hidden lg:flex items-center ml-4">
             <button className="p-2 text-slate-400 hover:text-red-700 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </button>
          </div>
        </div>
      </div>

      {/* Spacer for sticky */}
      {isSticky && <div className="h-14 md:h-18"></div>}

      <style>{`
        @keyframes slideInDown {
          from { transform: translate3d(0, -100%, 0); visibility: visible; }
          to { transform: translate3d(0, 0, 0); }
        }
        .animate-slideInDown { animation: slideInDown 0.4s cubic-bezier(0, 0, 0.2, 1); }
      `}</style>
    </header>
  );
};

export default Header;
