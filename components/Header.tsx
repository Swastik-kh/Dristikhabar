
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
  }, [logo]);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings?.topAd) setTopAd(settings.topAd);
      } catch (err) {
        console.error("Ad fetch error:", err);
      }
    };
    fetchAd();

    const handleScroll = () => {
      setIsSticky(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setInterval(() => setBsDate(getCurrentNepaliDate()), 60000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white">
      <div className="bg-slate-900 text-white py-2 px-4 text-[10px] md:text-xs grid grid-cols-3 items-center border-b border-white/5 relative z-20">
        <div className="flex items-center gap-4">
          <span className="font-black tracking-[0.1em] uppercase text-red-500 animate-pulse">LIVE</span>
          <span className="font-bold tracking-wide uppercase text-slate-400 hidden sm:inline-block">{bsDate.formatted}</span>
        </div>
        <div className="text-center">
          <span className="font-black tracking-wider text-white">सत्य, तथ्य र निष्पक्ष समाचार</span>
        </div>
        <div className="flex justify-end items-center uppercase font-black tracking-widest text-[9px]">
          <Link to="/admin" className="text-white hover:text-red-400 transition-colors bg-red-700/20 px-4 py-1 rounded-full border border-red-700/30">प्रशासन लगइन</Link>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 transition-all duration-500 ${isSticky ? 'hidden' : 'flex'}`}>
        <Link to="/" className="transition-transform hover:scale-105 duration-300 block">
          <img 
            src={siteLogo} 
            alt={APP_NAME} 
            className="h-16 md:h-20 object-contain" 
            onError={(e) => { (e.target as HTMLImageElement).src = 'logo.png'; }}
          />
        </Link>
      </div>

      <div className={`bg-white border-b border-slate-100 shadow-lg transition-all duration-500 z-50 ${isSticky ? 'fixed top-0 left-0 w-full' : 'relative'}`}>
        <div className="container mx-auto px-4 flex items-center h-14 md:h-16">
          <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full">
            <ul className="flex items-center min-w-max h-full">
              <li>
                <Link to="/category/all" className={`px-4 h-full flex items-center text-sm md:text-base font-black ${isActive('/category/all') ? 'text-red-700' : 'text-slate-500 hover:text-red-700'}`}>सबै</Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.id}`} className={`px-4 h-full flex items-center text-sm md:text-base font-black whitespace-nowrap ${isActive(`/category/${cat.id}`) ? 'text-red-700' : 'text-slate-500 hover:text-red-700'}`}>{cat.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {isSticky && <div className="h-14 md:h-16"></div>}
    </header>
  );
};

export default Header;
