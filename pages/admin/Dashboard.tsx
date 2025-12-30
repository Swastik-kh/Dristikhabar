
import React, { useState, useEffect } from 'react';
import { NEPALI_DAYS, toNepaliNumeral } from '../../constants';
import { NewsItem } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getRelativeTime } from '../../utils/nepaliDate';
import { newsService } from '../../services/newsService';
import { viewService } from '../../services/viewService'; // New import

// Removed static DATA, will be dynamic from viewService

const Dashboard: React.FC = () => {
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // New state for error handling

  // New states for dynamic view data
  const [totalSiteViews, setTotalSiteViews] = useState<number>(0);
  const [todayViews, setTodayViews] = useState<number>(0);
  const [weeklyTrafficData, setWeeklyTrafficData] = useState<{ name: string; views: number }[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('drishti_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const [
          news,
          siteTotalViews,
          todayViewsCount,
          weeklyViews
        ] = await Promise.all([
          newsService.getRecentNews(10), // For recent news table
          viewService.getAllTimeTotalViews(),
          viewService.getTodayViews(),
          viewService.getWeeklyViews()
        ]);
        
        setRecentNews(news);
        setTotalSiteViews(siteTotalViews);
        setTodayViews(todayViewsCount);

        // Map weekly views data for Recharts, converting day IDs to Nepali day names
        const chartData = weeklyViews.map(dayData => {
          const adDate = new Date(dayData.id); // Parse YYYY-MM-DD
          const dayIndex = adDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
          return {
            name: NEPALI_DAYS[dayIndex],
            views: dayData.totalViews
          };
        });
        setWeeklyTrafficData(chartData);

      } catch (err: any) {
        console.error("Dashboard data fetch failed:", err);
        setError(`ड्यासबोर्ड डेटा लोड गर्दा त्रुटि भयो: ${err.message || "अज्ञात त्रुटि"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("के तपाईं यो समाचार हटाउन चाहनुहुन्छ?")) {
      try {
        await newsService.deleteNews(id);
        setRecentNews(prev => prev.filter(n => n.id !== id));
        alert("समाचार सफलतापूर्वक हटाइयो।");
      } catch (err: any) { // Catch the error message from service
        console.error(err);
        alert(err.message || "त्रुटि भयो।");
      }
    }
  };

  // Roles that have full control over all news
  const canManageAll = user?.role === 'pradhan-sampadak' || user?.role === 'sampadak';

  return (
    <div className="space-y-8 font-mukta">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tight">ड्यासबोर्ड</h2>
           <p className="text-slate-400 font-bold text-sm">प्रणालीको ताजा अवस्था र एनालिटिक्स</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center font-black text-xs uppercase">{user?.name?.charAt(0)}</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">लगइन युजर</p>
              <p className="text-sm font-black text-slate-800 leading-tight">{user?.name || 'User'}</p>
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative animate-shake" role="alert">
          <strong className="font-bold">त्रुटि:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'कुल समाचार', value: toNepaliNumeral(recentNews.length), color: 'text-blue-600', bg: 'bg-blue-50', icon: '📰' },
          { label: 'कुल भ्युज', value: toNepaliNumeral(totalSiteViews), color: 'text-green-600', bg: 'bg-green-50', icon: '👁️' },
          { label: 'प्रतिक्षामा', value: toNepaliNumeral(recentNews.filter(n => n.status === 'pending').length), color: 'text-orange-600', bg: 'bg-orange-50', icon: '⏳' },
          { label: 'आजको भ्युज', value: toNepaliNumeral(todayViews), color: 'text-red-600', bg: 'bg-red-50', icon: '📈' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:border-red-500 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <span className={`w-12 h-12 ${stat.bg} flex items-center justify-center rounded-2xl text-2xl`}>{stat.icon}</span>
              <span className={`${stat.color} bg-white text-[10px] font-black px-2 py-1 rounded-full border border-slate-100 shadow-sm`}>+१२%</span> {/* This remains static */}
            </div>
            <h3 className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{stat.label}</h3>
            <p className="text-3xl font-black mt-1 text-slate-800">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">साप्ताहिक भ्युज</h3>
             <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full">पछिल्लो ७ दिन</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrafficData}> {/* Dynamic data */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="views" fill="#dc2626" radius={[10, 10, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">दैनिक भ्युज प्रवृत्ति</h3>
             <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping"></span>
                गत ७ दिन
             </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrafficData}> {/* Dynamic data */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider text-sm">हालैका समाचारहरू</h3>
          <button onClick={() => navigate('/admin/news')} className="text-red-700 font-black hover:underline text-xs uppercase tracking-widest flex items-center gap-2">
            सबै समाचार
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center">
               <div className="w-10 h-10 border-4 border-slate-200 border-t-red-700 rounded-full animate-spin mx-auto"></div>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-5">समाचार</th>
                  <th className="px-8 py-5">लेखक</th>
                  <th className="px-8 py-5 text-center">अवस्था</th>
                  <th className="px-8 py-5 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentNews.length > 0 ? (
                  recentNews.map(news => (
                    <tr key={news.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-black text-slate-800 line-clamp-1 group-hover:text-red-700 transition-colors">{news.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{news.category}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs font-black text-slate-600">{news.authorName}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {news.status === 'published' ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black border border-green-200 uppercase tracking-tighter">प्रकाशित</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[9px] font-black border border-orange-200 uppercase tracking-tighter animate-pulse">प्रतिक्षामा</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {(canManageAll || news.authorId === user?.id) && (
                            <button 
                              onClick={() => navigate(`/admin/news/edit/${news.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          )}
                          {canManageAll && (
                            <button 
                              onClick={() => handleDelete(news.id)}
                              className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic">समाचार फेला परेन।</td>
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

export default Dashboard;