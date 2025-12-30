
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../../types';
import { getDb, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, where } from '../../services/firebase';

interface ExtendedUser extends User {
  username: string;
  password?: string;
  createdAt?: any;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<Partial<ExtendedUser>>({
    name: '',
    username: '',
    role: 'reporter',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null); // New state for error
  const [modalError, setModalError] = useState<string | null>(null); // New state for modal-specific error

  const fetchUsers = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const db = getDb();
      if (!db) throw new Error("Database not connected.");
      const q = query(collection(db, 'users'), orderBy('name'));
      const snap = await getDocs(q);
      const userList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExtendedUser));
      setUsers(userList);
    } catch (e: any) {
      console.error("Error fetching users:", e);
      setError(`प्रयोगकर्ताहरू लोड गर्दा त्रुटि भयो: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('drishti_user');
    if (saved) setLoggedInUser(JSON.parse(saved));
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null); // Clear previous modal errors

    if (!currentUser.name || !currentUser.username) {
      setModalError("नाम र युजरनेम अनिवार्य छ!");
      return;
    }
    if (!currentUser.id && !currentUser.password) {
      setModalError("नयाँ प्रयोगकर्ताको लागि पासवर्ड अनिवार्य छ!");
      return;
    }

    try {
      const db = getDb();
      if (!db) throw new Error("Database not connected.");

      const userData: any = {
        name: currentUser.name,
        username: currentUser.username.toLowerCase().trim(),
        role: currentUser.role,
        email: currentUser.email || `${currentUser.username}@drishti.com`,
      };

      // Only update password if it's a new user or password field is filled
      if (currentUser.password) {
        userData.password = currentUser.password;
      }

      if (currentUser.id) {
        await updateDoc(doc(db, 'users', currentUser.id), userData);
        alert("प्रयोगकर्ता विवरण अपडेट भयो।");
      } else {
        // Check if username already exists
        const qUsernameExists = query(collection(db, 'users'), where("username", "==", userData.username));
        const usernameSnapshot = await getDocs(qUsernameExists);
        if (!usernameSnapshot.empty) {
          setModalError("यो युजरनेम पहिल्यै प्रयोगमा छ। कृपया अर्को रोज्नुहोस्।");
          return;
        }

        await addDoc(collection(db, 'users'), { 
          ...userData, 
          createdAt: new Date().toISOString() 
        });
        alert("नयाँ प्रयोगकर्ता सफलतापूर्वक थपियो। अब यो युजरले लगइन गर्न सक्छ।");
      }
      
      setShowModal(false);
      fetchUsers();
      setCurrentUser({ name: '', username: '', role: 'reporter', email: '', password: '' });
    } catch (e: any) {
      console.error(e);
      setModalError(e.message || "विवरण सुरक्षित गर्दा त्रुटि भयो।");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("के तपाईं यो प्रयोगकर्तालाई हटाउन चाहनुहुन्छ? यो प्रक्रिया फिर्ता गर्न सकिँदैन।")) {
      try {
        const db = getDb();
        if (!db) throw new Error("Database not connected.");
        await deleteDoc(doc(db, 'users', id));
        fetchUsers();
        alert("प्रयोगकर्ता सफलतापूर्वक हटाइयो।");
      } catch (e: any) {
        console.error(e);
        alert(e.message || "हटाउन त्रुटि भयो।");
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pradhan-sampadak': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-red-200">प्रधान सम्पादक</span>;
      case 'sampadak': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-blue-200">सम्पादक</span>;
      case 'reporter': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-200">रिपोर्टर</span>;
      default: return null;
    }
  };

  const isPradhanSampadak = loggedInUser?.role === 'pradhan-sampadak';

  return (
    <div className="space-y-6 font-mukta">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">प्रयोगकर्ता व्यवस्थापन</h2>
          <p className="text-gray-500 text-sm font-medium">कर्मचारीहरूको विवरण र लगइन अनुमतिहरू यहाँबाट नियन्त्रण गर्नुहोस्</p>
        </div>
        {isPradhanSampadak && (
          <button 
            onClick={() => {
              setCurrentUser({ name: '', username: '', role: 'reporter', email: '', password: '' });
              setModalError(null); // Clear modal errors on open
              setShowModal(true);
            }}
            className="bg-red-700 text-white px-6 py-3 rounded-2xl font-black hover:bg-red-800 transition-all shadow-xl shadow-red-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            नयाँ प्रयोगकर्ता थप्नुहोस्
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative animate-shake" role="alert">
          <strong className="font-bold">त्रुटि:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center font-bold text-slate-400 animate-pulse">डेटा लोड हुँदैछ...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">प्रयोगकर्ता</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">युजरनेम</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">भूमिका</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-black text-white uppercase text-sm border-2 border-white shadow-md">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-800">{user.name}</div>
                          <div className="text-[10px] font-bold text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg">@{user.username}</span>
                    </td>
                    <td className="px-8 py-5">{getRoleBadge(user.role)}</td>
                    <td className="px-8 py-5 text-right">
                      {isPradhanSampadak && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setCurrentUser({ ...user, password: '' }); setModalError(null); setShowModal(true); }}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="सम्पादन गर्नुहोस्"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          {user.username !== 'admin' && user.id !== loggedInUser?.id && (
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="हटाउनुहोस्"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">अहिलेसम्म कुनै पनि प्रयोगकर्ता थपिएको छैन।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 transform transition-all scale-100">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{currentUser.id ? 'विवरण सम्पादन' : 'नयाँ प्रयोगकर्ता'}</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">नयाँ कर्मचारी थप्नुहोस्</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {modalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative animate-shake" role="alert">
                  <strong className="font-bold">त्रुटि:</strong>
                  <span className="block sm:inline ml-2">{modalError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">पूरा नाम</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold bg-slate-50 focus:bg-white"
                  value={currentUser.name}
                  onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                  placeholder="उदा: राम बहादुर क्षेत्री"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">युजरनेम</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold bg-slate-50 focus:bg-white"
                    value={currentUser.username}
                    onChange={e => setCurrentUser({...currentUser, username: e.target.value.toLowerCase().trim()})}
                    placeholder="ram123"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">भूमिका</label>
                  <select 
                    className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold bg-slate-50 focus:bg-white"
                    value={currentUser.role}
                    onChange={e => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                  >
                    <option value="reporter">रिपोर्टर</option>
                    <option value="sampadak">सम्पादक</option>
                    <option value="pradhan-sampadak">प्रधान सम्पादक</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">इमेल (ऐच्छिक)</label>
                <input 
                  type="email" 
                  className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold bg-slate-50 focus:bg-white"
                  value={currentUser.email}
                  onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                  placeholder="ram@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">पासवर्ड</label>
                <input 
                  type="password" 
                  className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold bg-slate-50 focus:bg-white"
                  value={currentUser.password}
                  onChange={e => setCurrentUser({...currentUser, password: e.target.value})}
                  placeholder={currentUser.id ? "नयाँ पासवर्ड (परिवर्तन गर्न मात्र)" : "••••••••"}
                  required={!currentUser.id}
                />
                {currentUser.id && <p className="text-[10px] text-slate-400 mt-1 font-bold">*पासवर्ड परिवर्तन नगर्ने भए खाली छोड्नुहोस्।</p>}
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                >
                  रद्द गर्नुहोस्
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-700 text-white px-4 py-4 rounded-2xl font-black hover:bg-red-800 transition-all shadow-xl shadow-red-200 uppercase tracking-widest text-xs"
                >
                  {currentUser.id ? 'अपडेट गर्नुहोस्' : 'सिर्जना गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;