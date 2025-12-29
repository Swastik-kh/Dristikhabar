
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
import { settingsService } from './services/settingsService';

const App: React.FC = () => {
  const [siteLogo, setSiteLogo] = useState<string>(() => localStorage.getItem('drishti_site_logo') || 'logo.png');

  useEffect(() => {
    const syncSettings = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings && settings.siteLogo) {
          setSiteLogo(settings.siteLogo);
          localStorage.setItem('drishti_site_logo', settings.siteLogo);
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
        
        <footer className="bg-slate-900 text-white pt-20 pb-10 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <Link to="/">
                  <img src={siteLogo} alt="दृष्टि खबर" className="h-16 w-auto object-contain brightness-0 invert" onError={(e) => { if (siteLogo !== 'logo.png') setSiteLogo('logo.png'); }} />
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed">
                  हामी पाठकहरूलाई देश-विदेशका ताजा र आधिकारिक अपडेटहरू प्रदान गर्न प्रतिबद्ध छौं। सत्य र तथ्यपूर्ण पत्रकारिता नै हाम्रो मूल मन्त्र हो।
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-red-500">महत्वपूर्ण लिङ्कहरू</h4>
                <ul className="space-y-3 text-slate-400 text-sm font-bold">
                  <li><Link to="/category/all" className="hover:text-white transition-colors">सबै समाचार</Link></li>
                  <li><Link to="/advertisement-rates" className="hover:text-white transition-colors">विज्ञापन दर</Link></li>
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
                    info@drishtikhabar.com
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs font-bold tracking-widest uppercase">
              &copy; २०८२ दृष्टि खबर मिडिया प्रा.लि. | सर्वाधिकार सुरक्षित
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
