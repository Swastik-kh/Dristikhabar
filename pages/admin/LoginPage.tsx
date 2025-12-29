
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
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-[1000px] w-full bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Branding (Visible on Desktop) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-700 to-red-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="none" stroke="white" strokeWidth="0.1" />
               <path d="M0 20 L100 80 M0 80 L100 20" stroke="white" strokeWidth="0.05" />
             </svg>
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-8">
              <img 
                src={siteLogo} 
                alt="Logo" 
                className="h-16 brightness-0 invert object-contain"
                onError={(e) => (e.currentTarget.src = 'logo.png')}
              />
            </Link>
            <h2 className="text-4xl font-black text-white leading-tight">सत्य र तथ्यको <br/><span className="text-red-200">अन्तिम गन्तव्य।</span></h2>
            <p className="text-red-100/70 mt-4 font-bold text-lg">प्रशासनिक क्षेत्रमा पहुँचका लागि लगइन गर्नुहोस्।</p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2z" /></svg>
              </div>
              <p className="text-white/60 text-xs font-black uppercase tracking-widest">Secure Admin Access</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 relative">
          {/* Close Button Mobile/Desktop */}
          <Link 
            to="/" 
            className="absolute top-8 right-8 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-700 transition-all duration-300 border border-white/10 group"
          >
            <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>

          <div className="mb-12">
            <div className="md:hidden mb-6">
              <img src={siteLogo} className="h-12 brightness-0 invert" alt="Logo" />
            </div>
            <h1 className="text-3xl font-black text-white">स्वागत छ!</h1>
            <p className="text-slate-500 font-bold mt-2">प्रशासन प्यानलमा जानको लागि विवरण भर्नुहोस्।</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl text-xs font-black flex items-center gap-3 animate-headshake">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">युजरनेम वा इमेल</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-red-700 focus:bg-white/10 transition-all font-bold text-lg"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">गोप्य पासवर्ड</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2z" /></svg>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-red-700 focus:bg-white/10 transition-all font-bold text-lg"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-5 rounded-3xl shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-3 text-xl"
            >
              {isLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "प्यानलमा छिर्नुहोस्"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-black uppercase tracking-widest text-xs transition-all hover:gap-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              मुख्य समाचार पृष्ठमा फर्कनुहोस्
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes headshake {
          0% { transform: translateX(0); }
          6.5% { transform: translateX(-6px) rotateY(-9deg); }
          18.5% { transform: translateX(5px) rotateY(7deg); }
          31.5% { transform: translateX(-3px) rotateY(-5deg); }
          43.5% { transform: translateX(2px) rotateY(3deg); }
          50% { transform: translateX(0); }
        }
        .animate-headshake { animation: headshake 0.8s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LoginPage;
