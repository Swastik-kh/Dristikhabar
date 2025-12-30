
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom'; // Removed useNavigate as it's not directly used in critical path

const AdminLayout: React.FC = () => {
  const location = useLocation();
  // const navigate = useNavigate(); // Removed as window.location directly handles navigation for logout/auth guard
  const [user, setUser] = useState<any>(null);
  const [siteLogo, setSiteLogo] = useState<string>('logo.png');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar visibility

  useEffect(() => {
    const savedUser = localStorage.getItem('drishti_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // If no user in localStorage, immediately set user to null
      // and force a full page replace to the login route for robustness.
      // This acts as a strong authentication guard on initial load.
      setUser(null);
      console.log("AdminLayout: No user found in localStorage on mount. Forcing redirect to admin login.");
      window.location.replace('/#/admin/login'); // Using replace for a cleaner history
    }

    const savedLogo = localStorage.getItem('drishti_site_logo');
    if (savedLogo) {
      setSiteLogo(savedLogo);
    }

    // NEW: Global Event Listener to react to localStorage changes (e.g., from another tab or atomic logout)
    const handleStorageChange = (e: StorageEvent) => {
      // If 'drishti_user' is cleared (e.newValue is null), force a page reload.
      // This is crucial for HashRouter and ensures the app re-evaluates its auth state.
      if (e.key === 'drishti_user' && e.newValue === null) {
        console.log("AdminLayout: localStorage 'drishti_user' cleared via storage event. Forcing page reload.");
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array means this runs once on mount.

  // FIX: This handleLogout function is rewritten as per user's explicit instructions for 100% reliability
  const handleLogout = () => {
    // Optional: Confirm with the user before logging out
    if (!window.confirm("के तपाईं बाहिर निस्कन चाहनुहुन्छ?")) {
      return; // If user cancels, stop the logout process
    }

    // 1. Wipe ALL session data from local storage and session storage
    localStorage.clear();
    sessionStorage.clear(); // Clear session storage as well for thoroughness
    console.log("AdminLayout: All local and session storage cleared for a complete logout.");

    // 2. Immediately update the component's internal state to reflect logout
    // This will cause AdminLayout to stop rendering its protected content.
    setUser(null); 
    console.log("AdminLayout: React user state set to null for immediate UI update.");

    // 3. Force the browser to navigate to the root path using replace.
    // This clears the browser history back to the root, and the App.tsx router
    // (combined with AdminLayout's useEffect auth guard) will then redirect to login.
    // This is more robust for HashRouter and ensures no cached admin page is shown.
    window.location.replace('/'); 
    console.log("AdminLayout: Initiated forceful navigation to root path. Expecting App.tsx to redirect to login.");

    // IMPORTANT: No explicit window.location.reload() here. 
    // The 'storage' event listener or the re-evaluation of App.tsx's router 
    // on the new root path will handle the necessary reload/redirect.
    
    // Prevent any further JavaScript execution after initiating a page replacement.
    return;
  };

  // SAFETY CHECK: If user is null OR localStorage.getItem('drishti_user') is null/empty, 
  // prevent ANY admin UI from rendering. This is the ultimate component shield.
  if (!user || !localStorage.getItem('drishti_user')) {
    console.log("AdminLayout: Safety check triggered - user state or localStorage user is null. Preventing protected content rendering.");
    return null; 
  }

  const isMainEditor = user.role === 'pradhan-sampadak';

  return (
    <div className="min-h-screen bg-gray-100 flex font-mukta">
      {/* Mobile Sidebar Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-full shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-controls="admin-sidebar"
        aria-expanded={isSidebarOpen}
        aria-label={isSidebarOpen ? "साइडबार बन्द गर्नुहोस्" : "साइडबार खोल्नुहोस्"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <aside 
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl z-40 shrink-0 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full hidden md:flex'
        }`}
      >
        <div className="mb-6 text-center">
          <Link to="/">
            <img src={siteLogo} alt="Logo" className="h-12 mx-auto brightness-0 invert object-contain" />
          </Link>
          <div className="mt-4 px-3 py-1 bg-slate-800 rounded-full inline-block">
             <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
               {user.role === 'pradhan-sampadak' ? 'प्रधान सम्पादक' : (user.role === 'sampadak' ? 'सम्पादक' : 'रिपोर्टर')}
             </span>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-400 line-clamp-1">{user.name}</div>
        </div>
        
        {/* Logout Button Moved to Top */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 p-3 bg-red-900/20 border border-red-900/30 rounded-xl hover:bg-red-700 transition-all text-red-400 hover:text-white font-black text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            बाहिर निस्कनुहोस्
          </button>
        </div>
        
        <nav className="flex-1 space-y-1.5 font-bold text-sm">
          <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/admin' ? 'bg-red-700 shadow-lg shadow-red-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            ड्यासबोर्ड
          </Link>
          <Link to="/admin/news/new" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/admin/news/new' ? 'bg-red-700 shadow-lg shadow-red-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            नयाँ समाचार
          </Link>
          <Link to="/admin/news" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/admin/news' ? 'bg-red-700 shadow-lg shadow-red-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2v4a2 2 0 002 2h4" /></svg>
            सबै समाचार
          </Link>
          {isMainEditor && (
            <>
              <div className="pt-4 pb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">प्रणाली व्यवस्थापन</div>
              <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/admin/users' ? 'bg-red-700 shadow-lg shadow-red-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                प्रयोगकर्ता व्यवस्थापन
              </Link>
              <Link to="/admin/settings" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/admin/settings' ? 'bg-red-700 shadow-lg shadow-red-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                सेटिङ्गहरू
              </Link>
            </>
          )}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto md:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;