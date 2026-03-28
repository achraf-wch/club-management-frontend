import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  
  // Real counts
  const [membersCount, setMembersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [profile, setProfile] = useState(null);

  const dm = darkMode;
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [typedText, setTypedText] = useState('');
  const fullText = `Commandant ${user?.first_name}, votre club vous attend.`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleThemeChange = () => setDarkMode(document.documentElement.classList.contains("dark"));
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Profile
      const profileRes = await fetch(`${API_BASE_URL}/api/user`, { credentials: 'include' });
      if (profileRes.ok) setProfile(await profileRes.json());

      // Fetch Club Info
      const clubRes = await fetch(`${API_BASE_URL}/api/my-club-info`, { credentials: 'include' });
      let clubData = clubRes.ok ? await clubRes.json() : null;
      if (!clubData) {
        const fb = await fetch(`${API_BASE_URL}/api/my-club`, { credentials: 'include' });
        if (fb.ok) clubData = await fb.json();
      }
      setClub(clubData);

      // Fetch Members Count
      if (clubData?.id) {
        const memRes = await fetch(`${API_BASE_URL}/api/clubs/${clubData.id}/members`, { credentials: 'include' });
        if (memRes.ok) {
          const mData = await memRes.json();
          setMembersCount(Array.isArray(mData) ? mData.length : (mData.data?.length ?? 0));
        } else {
          setMembersCount(clubData.total_members ?? 0);
        }
      }

      // Fetch Events
      const evRes = await fetch(`${API_BASE_URL}/api/events`, { credentials: 'include' });
      if (evRes.ok) {
        const evData = await evRes.json();
        const all = Array.isArray(evData) ? evData : (evData.data ?? []);
        setEventsCount(clubData?.id ? all.filter(e => e.club_id === clubData.id).length : all.length);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/storage/${path.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-[#0a0a0f]' : 'bg-[#f8fafc]'}`}>
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-red-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${dm ? 'bg-[#0a0a0f] text-white' : 'bg-[#f8fafc] text-[#1a2c5b]'}`}>
      
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c0392b]/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#1a2c5b]/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="w-20 h-1.5 bg-[#c0392b] mb-4 rounded-full"></div>
            <h1 className="text-6xl font-black tracking-tighter mb-2">
              DASHBOARD <span className="text-[#c0392b]">PRESIDENT</span>
            </h1>
            <p className={`text-xl font-medium ${dm ? 'text-white/40' : 'text-gray-500'}`}>
              {typedText}<span className="animate-ping text-[#c0392b]">_</span>
            </p>
          </div>

          {club && (
            <div className={`flex items-center gap-4 p-4 rounded-[2rem] border backdrop-blur-md shadow-2xl ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#c0392b]/30">
                <img src={getImageUrl(club.logo) || `https://ui-avatars.com/api/?name=${club.name}&background=c0392b&color=fff`} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#c0392b]">Organisation</p>
                <p className="text-lg font-black leading-tight">{club.name}</p>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Welcome Card */}
            <div className={`relative rounded-[3rem] p-10 overflow-hidden border transition-all ${dm ? 'bg-white/5 border-white/10' : 'bg-[#1a2c5b] text-white shadow-2xl'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45z"/></svg>
              </div>
              <h2 className="text-4xl font-black mb-4">Bienvenue, {user?.first_name}</h2>
              <p className={`text-lg mb-8 max-w-md ${dm ? 'text-white/50' : 'text-white/70'}`}>
                Votre centre de commandement pour piloter les membres, les événements et l'impact de votre club au sein de l'EST Fès.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className={`px-6 py-3 rounded-2xl border text-sm font-bold flex items-center gap-3 ${dm ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {profile?.email || user?.email}
                </div>
                <div className={`px-6 py-3 rounded-2xl border text-sm font-bold ${dm ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                  Role: PRESIDENT
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Effectif', value: membersCount, sub: 'Membres Actifs', icon: '👥', color: '#c0392b' },
                { label: 'Agenda', value: eventsCount, sub: 'Événements', icon: '📅', color: '#1a2c5b' },
                { label: 'Demandes', value: '12', sub: 'En Attente', icon: '📩', color: '#f39c12' }
              ].map((stat, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border group hover:scale-[1.02] transition-all duration-300 ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{stat.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-white/30' : 'text-gray-400'}`}>{stat.label}</span>
                  </div>
                  <h3 className="text-5xl font-black mb-1">{stat.value}</h3>
                  <p className="text-xs font-bold uppercase tracking-tighter text-[#c0392b]">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions Panel */}
            <div className={`p-8 rounded-[3rem] border h-full ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#c0392b] rounded-full"></span>
                ACTIONS RAPIDES
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Assigner Billets', icon: '🎟️', path: '/President/AssignTickets', color: 'bg-green-500' },
                  { label: 'Gérer les Membres', icon: '⚙️', path: '/President/Members', color: 'bg-blue-500' },
                  { label: 'Nouvel Événement', icon: '✨', path: '/President/AddEvent', color: 'bg-[#c0392b]' },
                  { label: 'Mon Profil', icon: '👤', path: '/Login/AccountSetup', color: 'bg-gray-500' }
                ].map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => navigate(action.path)}
                    className={`w-full p-5 rounded-2xl border flex items-center gap-4 transition-all hover:translate-x-2 ${
                      dm ? 'bg-white/5 border-white/5 hover:border-[#c0392b]/50' : 'bg-gray-50 border-transparent hover:bg-white hover:border-[#1a2c5b]/20 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-opacity-10 ${action.color.replace('bg-', 'text-')}`}>
                      {action.icon}
                    </div>
                    <span className="font-black uppercase text-xs tracking-widest">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Security Card */}
              <div className={`mt-8 p-6 rounded-3xl border-2 border-dashed ${dm ? 'border-white/10 text-white/40' : 'border-gray-200 text-gray-400'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-center">Sécurité & Compte</p>
                <button 
                  onClick={() => navigate('/Login/AccountSetup')}
                  className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  🔒 Changer le mot de passe
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PresidentDashboard;