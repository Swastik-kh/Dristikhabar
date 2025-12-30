
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import NewsEditor from './pages/admin/NewsEditor';
import NewsList from './pages/admin/NewsList';
import LoginPage from './pages/admin/LoginPage';
import UserManagement from './pages/admin/UserManagement';
import SettingsPage from './pages/admin/SettingsPage';
import AdvertisementRatesPage from './pages/AdvertisementRatesPage';
import AboutUsPage from './pages/AboutUsPage'; // New import
import ContactUsPage from './pages/ContactUsPage'; // New import
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'; // New import
import DisclaimerPage from './pages/DisclaimerPage'; // New import
import { settingsService } from './services/settingsService';

const App: React.FC = () => {
  const [siteLogo, setSiteLogo] = useState<string>(() => localStorage.getItem('drishti_site_logo') || 'logo.png');
  const [appStoreUrl, setAppStoreUrl] = useState<string>('#');
  const [playStoreUrl, setPlayStoreUrl] = useState<string>('#');
  const [socialLinks, setSocialLinks] = useState({
    facebook: '#',
    twitter: '#',
    youtube: '#'
  });

  useEffect(() => {
    const syncSettings = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings) {
          if (settings.siteLogo) {
            setSiteLogo(settings.siteLogo);
            localStorage.setItem('drishti_site_logo', settings.siteLogo);
          }
          if (settings.appStoreUrl) setAppStoreUrl(settings.appStoreUrl);
          if (settings.playStoreUrl) setPlayStoreUrl(settings.playStoreUrl);
          if (settings.socialLinks) setSocialLinks(settings.socialLinks);
        }
      } catch (err) {
        console.warn("Could not sync settings from DB:", err);
      }
    };
    syncSettings();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<><Header logo={siteLogo} /><HomePage /></>} />
          <Route path="/news/:id" element={<><Header logo={siteLogo} /><NewsDetailPage /></>} />
          <Route path="/category/:id" element={<><Header logo={siteLogo} /><HomePage /></>} />
          <Route path="/advertisement-rates" element={<><Header logo={siteLogo} /><AdvertisementRatesPage /></>} />
          <Route path="/about-us" element={<><Header logo={siteLogo} /><AboutUsPage /></>} /> {/* Updated Link */}
          <Route path="/contact-us" element={<><Header logo={siteLogo} /><ContactUsPage /></>} /> {/* Updated Link */}
          <Route path="/privacy-policy" element={<><Header logo={siteLogo} /><PrivacyPolicyPage /></>} /> {/* Updated Link */}
          <Route path="/disclaimer" element={<><Header logo={siteLogo} /><DisclaimerPage /></>} /> {/* New Link */}

          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="news/new" element={<NewsEditor />} />
            <Route path="news/edit/:id" element={<NewsEditor />} />
            <Route path="news" element={<NewsList />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        
        <footer className="bg-slate-950 text-white pt-20 pb-10 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <Link to="/">
                  <img src={siteLogo} alt="दृष्टि खबर" className="h-16 w-auto object-contain brightness-0 invert" onError={(e) => { if (siteLogo !== 'logo.png') setSiteLogo('logo.png'); }} />
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  हामी पाठकहरूलाई देश-विदेशका ताजा र आधिकारिक अपडेटहरू प्रदान गर्न प्रतिबद्ध छौं। सत्य र तथ्यपूर्ण पत्रकारिता नै हाम्रो मूल मन्त्र हो।
                </p>
                
                {/* Social Media Follow Section */}
                <div className="pt-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">हामीलाई पछ्याउनुहोस्</h4>
                  <div className="flex gap-4">
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all group">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12.073-12-12.073s-12 5.446-12 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center hover:bg-black hover:border-white/20 transition-all group">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all group">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-red-500">महत्वपूर्ण लिङ्कहरू</h4>
                <ul className="space-y-3 text-slate-400 text-sm font-bold">
                  <li><Link to="/category/all" className="hover:text-white transition-colors">सबै समाचार</Link></li>
                  <li><Link to="/advertisement-rates" className="hover:text-white transition-colors">विज्ञापन दर</Link></li>
                  <li><Link to="/about-us" className="hover:text-white transition-colors">हाम्रो बारेमा</Link></li> {/* Updated Link */}
                  <li><Link to="/contact-us" className="hover:text-white transition-colors">हामीलाई सम्पर्क गर्नुहोस्</Link></li> {/* Updated Link */}
                  <li><Link to="/privacy-policy" className="hover:text-white transition-colors">गोपनीयता नीति</Link></li> {/* Updated Link */}
                  <li><Link to="/disclaimer" className="hover:text-white transition-colors">अस्वीकरण र सर्तहरू</Link></li> {/* New Link */}
                  <li><Link to="/admin" className="hover:text-red-500 transition-colors">प्रशासन लगइन</Link></li>
                </ul>
              </div>
              
              <div className="lg:col-span-2">
                <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-red-500">सम्पर्क</h4>
                <div className="space-y-4 text-slate-400 text-sm font-bold">
                  <p className="flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    काठमाडौं, नेपाल
                  </p>
                  <p className="flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    info@dristikhabar.com
                  </p>
                  
                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">एप डाउनलोड गर्नुहोस्</h4>
                    <div className="flex flex-wrap gap-2">
                      <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className="bg-black border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-900 transition-all scale-90 origin-left">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.66,16.19C19.45,16.63 20,17.41 20,18.31C20,19.21 19.45,20 18.66,20.44L16.21,21.85L14.39,12.7L16.81,15.12M14.39,11.3L16.21,2.15L18.66,3.56C19.45,4 20,4.79 20,5.69C20,6.59 19.45,7.37 18.66,7.81L16.81,8.88L14.39,11.3M4.5,2.65L14.06,12.21L4.5,21.35C4.5,21.35 4.5,2.65 4.5,2.65Z" /></svg>
                        <div className="text-left"><p className="text-[10px] font-black text-white leading-tight">Play Store</p></div>
                      </a>
                      <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className="bg-black border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-900 transition-all scale-90 origin-left">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" /></svg>
                        <div className="text-left"><p className="text-[10px] font-black text-white leading-tight">App Store</p></div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-900 text-center text-slate-600 text-[10px] font-black tracking-[0.2em] uppercase">
              &copy; २०८२ दृष्टि खबर मिडिया प्रा.लि. | सर्वाधिकार सुरक्षित
              {/* <p className="mt-2 text-slate-500 text-[9px]">Developed by : Swastik Khatiwada</p> */} {/* This line is removed */}
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;