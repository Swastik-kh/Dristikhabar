
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

    const limit = target === 'logo' ? 500000 : 1000000;
    if (file.size > limit) {
      alert("फाइल धेरै ठूलो भयो। कृपया १ MB भन्दा सानो फाइल प्रयोग गर्नुहोस्।");
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

  const handleClearAd = (target: 'top' | 'bottom') => {
    const emptyAd: AdConfig = {
      mediaType: 'text',
      titleText: '',
      mediaUrl: '',
      adLink: '/advertisement-rates'
    };
    if (target === 'top') setTopAd(emptyAd);
    else setBottomAd(emptyAd);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    const settingsData = {
      siteLogo: logo,
      adRates: adRates,
      topAd,
      bottomAd,
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
      <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">{title}</h3>
        <div className="flex gap-2">
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
            onClick={() => handleClearAd(target)}
            className="ml-4 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-white hover:bg-red-700 transition-colors"
          >
            विज्ञापन खाली गर्नुहोस्
          </button>
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">विज्ञापनको शीर्षक (खाली राखेमा केही देखिँदैन)</label>
            <input 
              type="text" 
              value={config.titleText}
              onChange={(e) => setConfig({ ...config, titleText: e.target.value })}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold"
              placeholder="शीर्षक लेख्नुहोस् वा खाली छोड्नुहोस्"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">विज्ञापन लिङ्क (Ad URL)</label>
            <input 
              type="text" 
              value={config.adLink}
              onChange={(e) => setConfig({ ...config, adLink: e.target.value })}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 font-bold"
              placeholder="/advertisement-rates"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">मीडिया लिङ्क (Photo/Video URL)</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={config.mediaUrl.startsWith('data:') ? '' : config.mediaUrl}
              onChange={(e) => setConfig({ ...config, mediaUrl: e.target.value })}
              className="flex-1 border-2 border-slate-100 p-4 rounded-2xl focus:border-red-700 outline-none bg-slate-50 text-sm font-mono"
              placeholder="https://example.com/banner.jpg"
            />
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-300 uppercase">अथवा</span>
              <input type="file" ref={fileRef} className="hidden" accept={config.mediaType === 'video' ? 'video/*' : 'image/*'} onChange={(e) => handleFileUpload(e, target)} />
              <button 
                onClick={() => fileRef.current?.click()}
                className="bg-slate-800 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                अपलोड गर्नुहोस्
              </button>
            </div>
          </div>
          
          {config.mediaUrl && (
            <div className="mt-4 p-4 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1">
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                   मीडिया सेट गरिएको छ
                 </span>
                 <button onClick={() => setConfig({...config, mediaUrl: ''})} className="text-[10px] font-black text-red-500 hover:underline">हटाउनुहोस्</button>
               </div>
               {config.mediaType === 'image' && <img src={config.mediaUrl} className="max-h-32 rounded-lg" alt="Preview" />}
               {config.mediaType === 'video' && <video src={config.mediaUrl} className="max-h-32 rounded-lg" muted />}
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
          <p className="text-slate-500 text-sm font-bold">लोगो, विज्ञापन र अन्य विवरणहरू यहाँबाट अपडेट गर्नुहोस्।</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-red-700 text-white px-10 py-4 rounded-[2rem] font-black hover:bg-red-800 transition-all shadow-2xl shadow-red-200 flex items-center gap-3 disabled:bg-slate-300 transform active:scale-95 w-full md:w-auto justify-center"
        >
          {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
          सबै परिवर्तन सुरक्षित गर्नुहोस्
        </button>
      </div>

      {message && (
        <div className="bg-green-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
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
          <p className="text-slate-400 text-xs font-bold">हेडर र फुटरमा देखिने मुख्य लोगो अपलोड गर्नुहोस्।</p>
          <div className="flex gap-4">
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
            <button onClick={() => logoInputRef.current?.click()} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200">फोटो रोज्नुहोस्</button>
            <button onClick={() => setLogo('')} className="text-red-500 text-[10px] font-black uppercase hover:underline">हटाउनुहोस्</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">विज्ञापन दरहरू (Advertisement Rates)</h3>
        </div>
        <div className="p-8">
          <p className="text-slate-400 text-sm font-bold mb-4">यहाँ लेखिएको विवरण 'विज्ञापन दर' पेजमा देखिनेछ।</p>
          <textarea
            rows={10} 
            value={adRates}
            onChange={(e) => setAdRates(e.target.value)}
            className="w-full border-2 border-slate-100 p-6 rounded-3xl font-medium text-lg focus:border-red-700 outline-none bg-slate-50/50 min-h-[300px]"
            placeholder="उदाहरण: माथिल्लो ब्यानर: रु ५०००/महिना..."
          ></textarea>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {renderAdSection('माथिल्लो विज्ञापन (Top Banner Ad)', topAd, setTopAd, topAdFileRef, 'top')}
        {renderAdSection('तल्लो विज्ञापन (Bottom Banner Ad)', bottomAd, setBottomAd, bottomAdFileRef, 'bottom')}
      </div>
    </div>
  );
};

export default SettingsPage;
