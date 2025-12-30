
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../../constants';
import { NewsItem, NewsStatus } from '../../types';
import { newsService } from '../../services/newsService';

const NewsEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<Partial<NewsItem>>({
    title: '', 
    slug: '',
    content: '', 
    summary: '', 
    category: CATEGORIES[0].label,
    isBreaking: false, 
    status: 'draft', 
    featuredImage: '', 
    videoUrl: '',
    tags: [], 
    showAuthorName: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // New state for error
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('drishti_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    if (id) {
      const fetchItem = async () => {
        setError(null); // Clear previous errors
        try {
          const item = await newsService.getNewsById(id);
          if (item) setNews(item);
        } catch (e: any) {
          console.error("Error fetching news for edit:", e);
          setError(e.message || "समाचार लोड गर्दा त्रुटि भयो।");
        }
      };
      fetchItem();
    }
  }, [id]);

  const generateSlug = (text: string) => {
    return text
      .trim()
      .replace(/[^\u0900-\u097F\w\s-]/g, '') // Keep Nepali and alphanumeric
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const update: any = { title: val };
    // Only auto-update slug for new news or if slug is empty
    if (!id && (!news.slug || news.slug === generateSlug(news.title || ''))) {
      update.slug = generateSlug(val);
    }
    setNews({ ...news, ...update });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const limit = type === 'image' ? 800000 : 1500000;
    if (file.size > limit) {
      alert(`${type === 'image' ? 'फोटो' : 'भिडियो'} धेरै ठूलो भयो। कृपया सानो फाइल प्रयोग गर्नुहोस्।`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'image') setNews({ ...news, featuredImage: base64String });
      else setNews({ ...news, videoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (finalStatus: NewsStatus) => {
    if (!news.title || !news.content) return alert("शीर्षक र समाचार अनिवार्य छ!");
    setIsSaving(true);
    setError(null); // Clear previous errors
    
    const isReporter = user?.role === 'reporter';
    let actualStatus = finalStatus;
    if (isReporter && finalStatus === 'published') actualStatus = 'pending';

    try {
      const payload = {
        ...news,
        slug: news.slug || generateSlug(news.title || ''),
        status: actualStatus,
        authorId: user?.id || 'admin',
        authorName: user?.name || 'Admin',
        publishedAt: actualStatus === 'published' ? (news.publishedAt || new Date().toISOString()) : (news.publishedAt || null),
      } as any;

      if (id) await newsService.updateNews(id, payload);
      else await newsService.createNews(payload);

      alert(isReporter && finalStatus === 'published' ? "अनुमोदनका लागि पठाइयो।" : "सफलतापूर्वक सुरक्षित गरियो!");
      navigate('/admin/news');
    } catch (e: any) {
      console.error("Save failed:", e);
      setError("सुरक्षित गर्दा त्रुटि भयो: " + (e.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-3xl shadow-lg border font-mukta">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-black text-slate-800">{id ? 'समाचार सम्पादन' : 'नयाँ समाचार'}</h2>
        <button onClick={() => navigate('/admin/news')} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">रद्द</button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6 animate-shake" role="alert">
          <strong className="font-bold">त्रुटि:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">समाचारको शीर्षक</label>
            <input 
              type="text" 
              value={news.title}
              onChange={handleTitleChange}
              className="w-full text-xl font-black border-2 border-slate-50 p-4 rounded-2xl focus:border-red-700 outline-none transition-all"
              placeholder="शीर्षक यहाँ लेख्नुहोस्..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">URL Slug (Unique Link)</label>
            <input 
              type="text" 
              value={news.slug}
              onChange={e => setNews({...news, slug: e.target.value.replace(/\s+/g, '-').toLowerCase()})}
              className="w-full text-sm font-mono border-2 border-slate-50 p-4 rounded-2xl focus:border-slate-800 outline-none transition-all text-slate-500"
              placeholder="url-friendly-slug"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">विधा</label>
            <select value={news.category} onChange={e => setNews({...news, category: e.target.value})} className="w-full p-3 border-2 border-white rounded-xl font-bold">
              {CATEGORIES.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={news.isBreaking} onChange={e => setNews({...news, isBreaking: e.target.checked})} className="w-5 h-5 accent-red-700" /><span className="font-bold text-slate-700">Breaking News</span></label>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={news.showAuthorName} onChange={e => setNews({...news, showAuthorName: e.target.checked})} className="w-5 h-5 accent-red-700" /><span className="font-bold text-slate-700">लेखक देखाउने</span></label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">मुख्य फोटो</label>
            <div className="flex flex-col gap-3">
              <input type="text" value={news.featuredImage?.startsWith('data:') ? '' : news.featuredImage} onChange={e => setNews({...news, featuredImage: e.target.value})} className="w-full p-3 border-2 border-slate-50 rounded-xl text-xs" placeholder="URL यहाँ राख्नुहोस्..." />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="text-xs font-black bg-slate-100 p-3 rounded-xl">फोटो अपलोड</button>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
              {news.featuredImage && <img src={news.featuredImage} className="w-40 rounded-xl border" />}
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">भिडियो (ऐच्छिक)</label>
            <div className="flex flex-col gap-3">
              <input type="text" value={news.videoUrl?.startsWith('data:') ? '' : news.videoUrl} onChange={e => setNews({...news, videoUrl: e.target.value})} className="w-full p-3 border-2 border-slate-50 rounded-xl text-xs" placeholder="YouTube/URL..." />
              <button type="button" onClick={() => videoInputRef.current?.click()} className="text-xs font-black bg-slate-100 p-3 rounded-xl">भिडियो अपलोड</button>
              <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
              {news.videoUrl && <div className="text-[10px] text-green-600 font-bold">भिडियो सेट भयो</div>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400">पूर्ण विवरण</label>
          <textarea rows={12} value={news.content} onChange={e => setNews({...news, content: e.target.value})} className="w-full border-2 border-slate-50 p-6 rounded-3xl text-lg font-medium bg-slate-50/50" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-8">
          <button onClick={() => handleSave('published')} disabled={isSaving} className="flex-1 bg-red-700 text-white p-4 rounded-2xl font-black text-lg">
            {isSaving ? 'बचत हुँदै...' : (id ? 'अपडेट गर्नुहोस्' : 'प्रकाशन गर्नुहोस्')}
          </button>
          <button onClick={() => handleSave('draft')} disabled={isSaving} className="px-8 p-4 border-2 rounded-2xl font-black">ड्राफ्ट</button>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;