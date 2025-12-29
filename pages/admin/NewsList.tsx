
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toNepaliNumeral, CATEGORIES } from '../../constants';
import { NewsItem } from '../../types';
import { getRelativeTime } from '../../utils/nepaliDate';
import { newsService } from '../../services/newsService';

const NewsList: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Fetching all news items for admin panel
      const data = await newsService.getRecentNews(500);
      setNewsList(data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('drishti_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchNews();
  }, []);

  const handleApprove = async (id: string) => {
    if (window.confirm("के तपाईं यो समाचारलाई सार्वजनिक गर्न चाहनुहुन्छ?")) {
      try {
        await newsService.updateNews(id, { 
          status: 'published', 
          publishedAt: new Date().toISOString() 
        });
        alert("समाचार सफलतापूर्वक प्रकाशित भयो!");
        fetchNews();
      } catch (err) {
        alert("त्रुटि भयो।");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("के तपाईं यो समाचार हटाउन चाहनुहुन्छ? यो प्रक्रिया फिर्ता गर्न सकिँदैन।")) {
      try {
        await newsService.deleteNews(id);
        alert("समाचार सफलतापूर्वक हटाइयो।");
        fetchNews();
      } catch (err) {
        alert("समाचार हटाउन प्राविधिक समस्या भयो।");
      }
    }
  };

  const filteredNews = newsList.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryLabel = CATEGORIES.find(c => c.id === filterCategory)?.label;
    const matchesCategory = filterCategory === 'all' || news.category === categoryLabel;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black border border-green-200 uppercase tracking-tighter">प्रकाशित</span>;
      case 'pending':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black border border-orange-200 uppercase tracking-tighter animate-pulse">अनुमोदन प्रतिक्षामा</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-black border border-gray-200 uppercase tracking-tighter">ड्राफ्ट</span>;
    }
  };

  // Check if current user is Pradhan Sampadak or Sampadak
  const canManageAll = user?.role === 'pradhan-sampadak' || user?.role === 'sampadak';

  return (
    <div className="space-y-6 font-mukta">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">सबै समाचारहरू</h2>
          <p className="text-gray-500 text-sm font-bold">प्रणालीमा उपलब्ध सबै समाचारहरूको सूची र व्यवस्थापन</p>
        </div>
        <Link 
          to="/admin/news/new" 
          className="bg-red-700 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-800 transition-all shadow-xl shadow-red-100 flex items-center gap-3 transform active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          नयाँ समाचार थप्नुहोस्
        </Link>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="समाचारको शीर्षक खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-red-500 focus:bg-white focus:outline-none transition-all font-bold"
          />
        </div>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-red-500 focus:outline-none transition-all bg-white min-w-[200px] font-black text-slate-700 uppercase text-xs tracking-widest"
        >
          <option value="all">सबै विधाहरू</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-32 text-center">
              <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">समाचार लोड हुँदैछ...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">समाचार / विवरण</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">विधा</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">लेखक</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">प्रकाशित मिति</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNews.length > 0 ? (
                  filteredNews.map((news) => (
                    <tr key={news.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                            <img 
                              src={news.featuredImage || 'logo.png'} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.src = 'logo.png')}
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-800 line-clamp-1 group-hover:text-red-700 transition-colors">{news.title}</h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              {getStatusBadge(news.status)}
                              {news.isBreaking && <span className="text-[9px] bg-red-700 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">BREAKING</span>}
                              {news.videoUrl && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">VIDEO</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{news.category}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">{news.authorName?.charAt(0)}</div>
                           <span className="text-xs font-black text-slate-700">{news.authorName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-400 font-bold">
                        {news.status === 'published' ? getRelativeTime(news.publishedAt) : <span className="italic">अप्रकाशित</span>}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {canManageAll && news.status === 'pending' && (
                            <button 
                              onClick={() => handleApprove(news.id)}
                              className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-1"
                              title="Approve & Publish"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          
                          {(canManageAll || news.authorId === user?.id) && (
                            <button 
                              onClick={() => navigate(`/admin/news/edit/${news.id}`)}
                              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                              title="सम्पादन गर्नुहोस्"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {canManageAll && (
                            <button 
                              onClick={() => handleDelete(news.id)}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                              title="हटाउनुहोस्"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                       <div className="text-slate-300 mb-2">
                         <svg className="w-16 h-16 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /></svg>
                       </div>
                       <p className="text-slate-400 font-black uppercase tracking-widest text-xs">कुनै समाचार भेटिएन।</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsList;
