
import React, { useState, useEffect, useRef } from 'react';
import { settingsService } from '../../services/settingsService';

interface AdConfig {
  mediaType: 'text' | 'image' | 'video';
  titleText: string;
  mediaUrl: string;
  adLink: string;
}

const SettingsPage: React.FC = () => {
  const [logo, setLogo] = useState<string>('');
  const [adRates, setAdRates] = useState<string>('');
  const [appStoreUrl, setAppStoreUrl] = useState<string>('');
  const [playStoreUrl, setPlayStoreUrl] = useState<string>('');
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    youtube: ''
  });
  
  const [topAd, setTopAd] = useState<AdConfig>({
    mediaType: 'text',
    titleText: '',
    mediaUrl: '',
    adLink: '/advertisement-rates'
  });

  const [bottomAd, setBottomAd] = useState<AdConfig>({
    mediaType: 'text',
    titleText: '',
    mediaUrl: '',
    adLink: '/advertisement-rates'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const topAdFileRef = useRef<HTMLInputElement>(null);
  const bottomAdFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dbSettings = await settingsService.getSettings();
        if (dbSettings) {
          if (dbSettings.siteLogo) setLogo(dbSettings.siteLogo);
          if (dbSettings.adRates) setAdRates(dbSettings.adRates);
          if (dbSettings.topAd) setTopAd(dbSettings.topAd);
          if (dbSettings.bottomAd) setBottomAd(dbSettings.bottomAd);
          if (dbSettings.appStoreUrl) setAppStoreUrl(dbSettings.appStoreUrl);
          if (dbSettings.playStoreUrl) setPlayStoreUrl(dbSettings.playStoreUrl);
          if (dbSettings.socialLinks) setSocialLinks(dbSettings.socialLinks);
        }
      } catch (err) {
        console.error("Initial settings load failed", err);
      }
    };
    loadSettings();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'top' | 'bottom') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const limit = target === 'logo' ? 500000 : 2000000; // Increased limit for videos
    if (file.size > limit) {
      alert("फाइल धेरै ठूलो भयो। कृपया सानो साइजको फाइल प्रयोग गर्नुहोस्।");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === 'logo') setLogo(base64String);
      else if (target === 'top') setTopAd({ ...topAd, mediaUrl: base64String, mediaType: file.type.startsWith('video') ? 'video' : 'image' });
      else if (target === 'bottom') setBottomAd({ ...bottomAd, mediaUrl: base64String, mediaType: file.type.startsWith('video') ? 'video' : 'image' });
    };
    reader.readAsDataURL(file);
  };

  const handleClearFullAd = (target: 'top' | 'bottom') => {
    if (!window.confirm("के तपाईं यो विज्ञापनका सबै विवरणहरू (फोटो, भिडियो, शीर्षक र लिङ्क) हटाउन चाहनुहुन्छ?")) return;
    const emptyAd: AdConfig = {
      mediaType: 'text',
      titleText: '',
      mediaUrl: '',
      adLink: '/advertisement-rates'
    };
    if (target === 'top') setTopAd(emptyAd);
    else setBottomAd(emptyAd);
  };

  const handleRemoveMedia = (target: 'top' | 'bottom') => {
    if (target === 'top') setTopAd({ ...topAd, mediaUrl: '', mediaType: 'text' });
    else setBottomAd({ ...bottomAd, mediaUrl: '', mediaType: 'text' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    const settingsData = {
      siteLogo: logo,
      adRates: adRates,
      topAd,
      bottomAd,
      appStoreUrl,
      playStoreUrl,
      socialLinks,
      updatedAt: new Date().toISOString()
    };

    try {
      const success = await settingsService.updateSettings(settingsData);
      if (success) {
        localStorage.setItem('drishti_site_logo', logo);
        localStorage.setItem('drishti_top_ad', JSON.stringify(topAd));
        localStorage.setItem('drishti_bottom_ad', JSON.stringify(bottomAd));
        localStorage.setItem('drishti_ad_rates', adRates);
        
        setMessage('सेटिङ्गहरू सफलतापूर्वक सुरक्षित गरियो!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e: any) {
      alert("सुरक्षित गर्न सकिएन: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderAdSection = (title: string, config: AdConfig, setConfig: (c: AdConfig) => void, fileRef: React.RefObject<HTMLInputElement>, target: 'top' | 'bottom') => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b bg-slate-50 flex flex-wrap justify-between items-center gap-4">
        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          {['text', 'image', 'video'].map((type) => (
            <button
              key={type}
              onClick={() => setConfig({ ...config, mediaType: type as any })}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${config.mediaType === type ? 'bg-red-700 text-white shadow-lg' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
            >
              {type === 'text' ? 'Text' : type === 'image' ? 'Image' : 'Video'}
            </button>
          ))}
          <button 
            onClick={() => handleClearFullAd(target)}
            className="ml-4 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-700/10 text-red-700 hover:bg-red-700 hover:text-white transition-all border border-red-200"
            title="सम्पूर्ण विज्ञापन हटाउनुहोस्"
          >
            सबै हटाउनुहोस्
          </button>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">विज्ञापनको शीर्षक (Title)</label>
            <div className="relative">
              <input 
                type="text" 
                value={config.titleText}
                onChange={(e) => setConfig({ ...config, titleText: e.target.value })}
                className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold"
                placeholder="शीर्षक यहाँ लेख्नुहोस्..."
              />
              {config.titleText && (
                <button onClick={() => setConfig({...config, titleText: ''})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">विज्ञापन लिङ्क (URL)</label>
            <div className="relative">
              <input 
                type="text" 
                value={config.adLink}
                onChange={(e) => setConfig({ ...config, adLink: e.target.value })}
                className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold"
                placeholder="/advertisement-rates"
              />
              {config.adLink && config.adLink !== '/advertisement-rates' && (
                <button onClick={() => setConfig({...config, adLink: '/advertisement-rates'})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">विज्ञापन मिडिया (Photo/Video)</label>
            {config.mediaUrl && (
              <button onClick={() => handleRemoveMedia(target)} className="text-[10px] font-black text-red-600 hover:underline uppercase tracking-tighter flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                मिडिया हटाउनुहोस्
              </button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={config.mediaUrl.startsWith('data:') ? 'Uploaded File' : config.mediaUrl}
              onChange={(e) => setConfig({ ...config, mediaUrl: e.target.value })}
              className="flex-1 border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 text-sm font-mono"
              placeholder="मिडियाको लिङ्क यहाँ राख्नुहोस् वा अपलोड गर्नुहोस्..."
            />
            <div className="shrink-0 flex items-center gap-2">
              <input type="file" ref={fileRef} className="hidden" accept={config.mediaType === 'video' ? 'video/*' : 'image/*'} onChange={(e) => handleFileUpload(e, target)} />
              <button 
                onClick={() => fileRef.current?.click()}
                className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                अपलोड गर्नुहोस्
              </button>
            </div>
          </div>

          {config.mediaUrl && (
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-md">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">PREVIEW:</p>
              {config.mediaType === 'video' || config.mediaUrl.includes('video') || config.mediaUrl.startsWith('data:video') ? (
                <video src={config.mediaUrl} className="w-full h-auto rounded-lg shadow-sm" controls muted />
              ) : (
                <img src={config.mediaUrl} className="w-full h-auto rounded-lg shadow-sm" alt="Ad Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 font-mukta">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">वेबसाइट सेटिङ्गहरू</h2>
          <p className="text-slate-500 text-sm font-bold">लोगो, विज्ञापन, सामाजिक सञ्जाल र मोबाइल एपको विवरण व्यवस्थापन।</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-red-700 text-white px-10 py-4 rounded-[2rem] font-black hover:bg-red-800 transition-all shadow-2xl shadow-red-200 flex items-center gap-3 disabled:bg-slate-300 transform active:scale-95 w-full md:w-auto justify-center"
        >
          {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>परिवर्तन सुरक्षित गर्नुहोस्</span>}
        </button>
      </div>

      {message && (
        <div className="bg-green-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl animate-bounce">
          {message}
        </div>
      )}

      {/* Logo Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-32 h-32 shrink-0 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4 relative overflow-hidden group">
          {logo ? <img src={logo} className="max-w-full max-h-full object-contain" alt="Logo" /> : <span className="text-slate-300 text-[10px] font-black">NO LOGO</span>}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button onClick={() => logoInputRef.current?.click()} className="text-white font-black text-[10px] uppercase">परिवर्तन</button>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-xl font-black text-slate-800">वेबसाइट लोगो</h3>
          <div className="flex gap-4">
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
            <button onClick={() => logoInputRef.current?.click()} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-colors">फोटो रोज्नुहोस्</button>
            <button onClick={() => { if(window.confirm('के तपाईं लोगो हटाउन चाहनुहुन्छ?')) setLogo(''); }} className="text-red-500 text-[10px] font-black uppercase hover:underline">हटाउनुहोस्</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {renderAdSection('माथिल्लो विज्ञापन (Top Banner)', topAd, setTopAd, topAdFileRef, 'top')}
        {renderAdSection('तल्लो विज्ञापन (Bottom Banner)', bottomAd, setBottomAd, bottomAdFileRef, 'bottom')}
      </div>

      {/* Social Links Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">सामाजिक सञ्जाल लिङ्कहरू</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Facebook URL</label>
            <input 
              type="text" 
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold text-sm"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">X (Twitter) URL</label>
            <input 
              type="text" 
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold text-sm"
              placeholder="https://x.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">YouTube URL</label>
            <input 
              type="text" 
              value={socialLinks.youtube}
              onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold text-sm"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>

      {/* App Links Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">
            📱
          </div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">मोबाइल एप लिङ्कहरू</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Google Play Store URL</label>
            <input 
              type="text" 
              value={playStoreUrl}
              onChange={(e) => setPlayStoreUrl(e.target.value)}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold text-sm"
              placeholder="https://play.google.com/store/apps/details?id=..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Apple App Store URL</label>
            <input 
              type="text" 
              value={appStoreUrl}
              onChange={(e) => setAppStoreUrl(e.target.value)}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold text-sm"
              placeholder="https://apps.apple.com/app/id..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">विज्ञापन दरहरू</h3>
        </div>
        <div className="p-8">
          <textarea
            rows={8} 
            value={adRates}
            onChange={(e) => setAdRates(e.target.value)}
            className="w-full border-2 border-slate-100 p-6 rounded-3xl font-medium text-lg focus:border-red-700 outline-none bg-slate-50/50"
            placeholder="दरहरू यहाँ लेख्नुहोस्..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
