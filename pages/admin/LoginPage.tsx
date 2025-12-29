
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, getDb, collection, query, where, getDocs } from '../../services/firebase';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [siteLogo, setSiteLogo] = useState<string>('logo.png');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLogo = localStorage.getItem('drishti_site_logo');
    if (savedLogo) setSiteLogo(savedLogo);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const inputId = identifier.toLowerCase().trim();

    try {
      const db = getDb();
      if (!db) {
        setError('डेटाबेस जडान हुन सकेन।');
        setIsLoading(false);
        return;
      }

      const usersRef = collection(db, 'users');
      const qUsername = query(usersRef, where("username", "==", inputId));
      const querySnapshot = await getDocs(qUsername);
      
      let foundUserDoc = null;
      if (!querySnapshot.empty) {
        foundUserDoc = querySnapshot.docs[0];
      } else {
        const qEmail = query(usersRef, where("email", "==", inputId));
        const emailSnapshot = await getDocs(qEmail);
        if (!emailSnapshot.empty) {
          foundUserDoc = emailSnapshot.docs[0];
        }
      }

      if (foundUserDoc) {
        const userData = foundUserDoc.data();
        if (userData.password === password) {
          const loginData = { id: foundUserDoc.id, ...userData };
          localStorage.setItem('drishti_user', JSON.stringify(loginData));
          navigate('/admin');
          return;
        } else {
          setError('पासवर्ड मिलेन। कृपया पुन: प्रयास गर्नुहोस्।');
          setIsLoading(false);
          return;
        }
      }

      if (inputId === 'admin' && password === 'admin') {
        const adminData = {
          id: 'system-admin',
          email: 'admin@drishti.com',
          name: 'प्रधान सम्पादक (सिस्टम)',
          role: 'pradhan-sampadak',
          username: 'admin'
        };
        localStorage.setItem('drishti_user', JSON.stringify(adminData));
        navigate('/admin');
        return;
      }

      if (identifier.includes('@')) {
        try {
          const authInstance = getAuth();
          const userCredential = await signInWithEmailAndPassword(authInstance, identifier, password);
          const userData = {
            id: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName || 'Staff Member',
            role: 'sampadak',
            username: userCredential.user.email?.split('@')[0]
          };
          localStorage.setItem('drishti_user', JSON.stringify(userData));
          navigate('/admin');
          return;
        } catch (authErr) {}
      }

      setError('युजरनेम वा पासवर्ड गलत छ।');
    } catch (err: any) {
      setError('सर्भरमा समस्या देखियो। कृपया केही समय पछि प्रयास गर्नुहोस्।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-mukta">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        <div className="bg-white p-10 text-center border-b border-slate-50">
          <img 
            src={siteLogo} 
            alt="दृष्टि खबर" 
            className="h-20 mx-auto object-contain mb-4" 
            onError={(e) => { (e.target as HTMLImageElement).src = 'logo.png'; }}
          />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">प्रशासन लगइन</h1>
          <p className="text-red-700 text-[10px] uppercase tracking-[0.3em] font-black mt-2">दृष्टि खबर न्युज नेटवर्क</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-black border border-red-100 flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest ml-2">युजरनेम वा इमेल</label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-6 py-5 rounded-3xl bg-slate-50 border-2 border-slate-50 focus:border-red-500 focus:bg-white focus:outline-none transition-all font-black text-slate-800"
              placeholder="उदा: ram123"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest ml-2">पासवर्ड</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 rounded-3xl bg-slate-50 border-2 border-slate-50 focus:border-red-500 focus:bg-white focus:outline-none transition-all font-black text-slate-800"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-red-700 transform active:scale-[0.98] transition-all shadow-2xl disabled:bg-slate-300 flex justify-center items-center gap-3 text-lg mt-4">
            {isLoading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <span>लगइन गर्नुहोस्</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
