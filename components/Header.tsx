
import React, { useState, useEffect } from 'https://esm.sh/react@19.2.3';
import { getCurrentNepaliDate } from '../utils/nepaliDate';
import { CATEGORIES, APP_NAME } from '../constants';
import { Link, useLocation } from 'https://esm.sh/react-router-dom@7.11.0';
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
    if (logo) {
      setSiteLogo(logo);
    }
  }, [logo]);

  useEffect(() => {
    // Load Top Ad Settings from DB primarily
    const fetchAd = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings && settings.topAd) {
          setTopAd(settings.topAd);
        } else {
          const savedAd = localStorage.getItem('drishti_top_ad');
          if (savedAd) setTopAd(JSON.parse(savedAd));
        }
      } catch (err) {
        console.error("Ad fetch error:", err);
      }
    };
    fetchAd();

    const handleScroll = () => {
      if (window.scrollY > 120) setIsSticky(true);
      else setIsSticky(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setInterval(() => setBsDate(getCurrentNepaliDate()), 60000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Check if ad should be rendered
  const hasAdContent = topAd && (topAd.mediaUrl || (topAd.mediaType === 'text' && topAd.titleText && topAd.titleText.trim().length > 0));

  return (
    <header className="bg-white">
      {/* Top Black Bar (Ribbon) */}
      <div className="bg-slate-900 text-white py-2 px-4 text-[10px] md:text-xs grid grid-cols-3 items-center border-b border-white/5 relative z-20">
        {/* Left: Date */}
        <div className="flex items-center gap-4">
          <span className="font-black tracking-[0.1em] uppercase text-red-500 animate-pulse">LIVE</span>
          <span className="font-bold tracking-wide uppercase text-slate-400 hidden sm:inline-block">{bsDate.formatted}</span>
        </div>

        {/* Center: Slogan */}
        <div className="text-center">
          <span className="font-black tracking-wider text-white bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent sm:text-white sm:bg-none">
            सत्य, तथ्य र निष्पक्ष समाचारको संवाहक
          </span>
        </div>

        {/* Right: Admin Link */}
        <div className="flex justify-end items-center uppercase font-black tracking-widest text-[9px]">
          <Link to="/admin" className="text-white hover:text-red-400 transition-colors bg-red-700/20 px-4 py-1 rounded-full border border-red-700/30">प्रशासन लगइन</Link>
        </div>
      </div>

      {/* Main Brand Section */}
      <div className={`container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 transition-all duration-500 ${isSticky ? 'opacity-0 pointer-events-none h-0 py-0 overflow-hidden translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="shrink-0">
          <Link to="/" className="transition-transform hover:scale-105 duration-300 block">
            <img 
              src={siteLogo} 
              alt={APP_NAME} 
              className="h-16 md:h-20 lg:h-24 object-contain" 
              onError={(e) => { (e.target as HTMLImageElement).src = 'logo.png'; }}
            />
          </Link>
        </div>

        {hasAdContent && (
          <div className="hidden md:flex flex-1 max-w-2xl lg:max-w-4xl ml-10">
            <Link 
              to={topAd?.adLink || '/advertisement-rates'} 
              className="w-full h-20 lg:h-28 bg-slate-50 border-2 border-slate-50 rounded-[2rem] overflow-hidden flex items-center justify-center relative group shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <span className="absolute top-2 right-4 text-[8px] font-black text-slate-300 uppercase z-10 tracking-[0.2em]">ADVERTISEMENT</span>
              {topAd?.mediaType === 'image' && topAd?.mediaUrl ? (
                <img src={topAd.mediaUrl} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-1000" alt="Header Ad" />
              ) : topAd?.mediaType === 'video' && topAd?.mediaUrl ? (
                <video src={topAd.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-10">
                  <p className="text-slate-800 font-black text-sm lg:text-xl group-hover:text-red-700 transition-colors duration-300">
                    {topAd?.titleText}
                  </p>
                  <div className="h-0.5 w-12 bg-red-700 mx-auto mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              )}
            </Link>
          </div>
        )}
      </div>

      {/* Sticky Ribbon */}
      <div className={`bg-white border-b border-slate-100 shadow-2xl transition-all duration-500 z-50 ${isSticky ? 'fixed top-0 left-0 w-full animate-slideDown' : 'relative'}`}>
        <div className="container mx-auto px-4 flex items-center h-14 md:h-20">
          
          <div className={`flex items-center transition-all duration-700 ease-in-out overflow-hidden h-full ${isSticky ? 'max-w-[200px] opacity-100 mr-8' : 'max-w-0 opacity-0'}`}>
            <Link to="/" className="shrink-0">
              <img 
                src={siteLogo} 
                alt={APP_NAME} 
                className="h-10 md:h-12 object-contain" 
                onError={(e) => { (e.target as HTMLImageElement).src = 'logo.png'; }}
              />
            </Link>
          </div>

          <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full">
            <ul className="flex items-center min-w-max h-full">
              <li className="h-full">
                <Link 
                  to="/category/all" 
                  className={`flex items-center px-6 h-full text-sm md:text-lg font-black transition-all relative group uppercase tracking-tighter ${
                    isActive('/category/all') 
                    ? 'text-red-700' 
                    : 'text-slate-500 hover:text-red-700'
                  }`}
                >
                  सबै
                  <span className={`absolute bottom-0 left-0 w-full h-1 bg-red-700 transition-transform duration-500 ${isActive('/category/all') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>
              </li>

              {CATEGORIES.map((cat) => (
                <li key={cat.id} className="h-full">
                  <Link 
                    to={`/category/${cat.id}`} 
                    className={`flex items-center px-6 h-full text-sm md:text-lg font-black transition-all relative group whitespace-nowrap uppercase tracking-tighter ${
                      isActive(`/category/${cat.id}`) 
                      ? 'text-red-700' 
                      : 'text-slate-500 hover:text-red-700'
                    }`}
                  >
                    {cat.label}
                    <span className={`absolute bottom-0 left-0 w-full h-1 bg-red-700 transition-transform duration-500 ${isActive(`/category/${cat.id}`) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:flex items-center gap-4 ml-6">
             <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-700 hover:bg-red-50 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </button>
          </div>
        </div>
      </div>
      
      {isSticky && <div className="h-14 md:h-20"></div>}
    </header>
  );
};

export default Header;
