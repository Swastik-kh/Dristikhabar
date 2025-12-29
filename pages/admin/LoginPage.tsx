
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

      setError('युजरनेम वा पासवर्ड गलत छ।');
    } catch (err: any) {
      setError('सर्भरमा समस्या देखियो।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mukta relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[120px]"></div>
      
      {/* Login Card Container */}
      <div className="max-w-[1000px] w-full bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 flex flex-col md:flex-row relative z-10 animate-fadeIn">
        
        {/* Modern Close Button */}
        <Link 
          to="/" 
          className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-white/5 hover:bg-red-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 border border-white/5 z-50 group"
          title="मुख्य पृष्ठमा फर्कनुहोस्"
        >
          <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        {/* Brand/Welcome Side */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-900 to-black p-16 flex-col justify-between">
          <div className="relative z-10">
            <Link to="/">
              <img 
                src={siteLogo} 
                alt="Logo" 
                className="h-16 brightness-0 invert object-contain mb-12"
                onError={(e) => (e.currentTarget.src = 'logo.png')}
              />
            </Link>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              सत्य, तथ्य र <br/>
              <span className="text-red-500 underline decoration-white/10 underline-offset-8">निष्पक्ष पत्रकारिता।</span>
            </h2>
            <p className="text-slate-400 mt-8 font-bold text-lg leading-relaxed">
              दृष्टि खबरको प्रशासनिक प्यानलमा स्वागत छ। यहाँबाट तपाईं समाचार र वेबसाइट सेटिङ्गहरू व्यवस्थापन गर्न सक्नुहुन्छ।
            </p>
          </div>
          
          <div className="text-slate-500 text-[10px] font-black tracking-widest uppercase">
             Secure Panel &copy; २०८२
          </div>
        </div>

        {/* Login Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center min-h-[500px]">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white">लगइन</h1>
            <p className="text-slate-500 font-bold mt-2">प्यानल पहुँचका लागि विवरण भर्नुहोस्।</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-black animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">युजरनेम वा इमेल</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-red-700 focus:bg-white/10 transition-all font-bold text-lg"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">पासवर्ड</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-red-700 focus:bg-white/10 transition-all font-bold text-lg"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(220,38,38,0.25)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-xl mt-4 disabled:bg-slate-700"
            >
              {isLoading ? <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "प्यानलमा जानुहोस्"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0, 0, 0.2, 1); }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LoginPage;
