import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BoardDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ── Real counts ──
  const [membersCount, setMembersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);

    const handleThemeChange = () =>
      setDarkMode(document.documentElement.classList.contains("dark"));
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Club info
      const clubRes = await fetch(`${API_BASE_URL}/api/my-club-info`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      let clubData = null;
      if (clubRes.ok) {
        clubData = await clubRes.json();
        setClub(clubData);
      } else {
        const fallbackRes = await fetch(`${API_BASE_URL}/api/my-club`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (fallbackRes.ok) {
          clubData = await fallbackRes.json();
          setClub(clubData);
        }
      }

      // 2. Members Count
      if (clubData?.id) {
        try {
          const membersRes = await fetch(`${API_BASE_URL}/api/clubs/${clubData.id}/members`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          });
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            const list = Array.isArray(membersData) ? membersData : (membersData.data ?? []);
            setMembersCount(list.length);
          } else {
            setMembersCount(clubData?.members_count ?? 0);
          }
        } catch {
          setMembersCount(clubData?.members_count ?? 0);
        }
      }

      // 3. Events Count
      try {
        const eventsRes = await fetch(`${API_BASE_URL}/api/events`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const allEvents = Array.isArray(eventsData) ? eventsData : (eventsData.data ?? []);
          if (clubData?.id) {
            const clubEvents = allEvents.filter(e => e.club_id === clubData.id);
            setEventsCount(clubEvents.length > 0 ? clubEvents.length : allEvents.length);
          } else {
            setEventsCount(allEvents.length);
          }
        } else {
          setEventsCount(clubData?.events_count ?? 0);
        }
      } catch {
        setEventsCount(clubData?.events_count ?? 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  const dm = darkMode;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${dm ? 'bg-[#020617]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mb-4"></div>
          <p className={`text-xl font-semibold ${dm ? 'text-white' : 'text-gray-700'}`}>Chargement du bureau...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-300 overflow-hidden ${dm ? 'bg-[#020617]' : 'bg-gray-50'}`}>
      
      {/* ── Background Orbs ── */}
      <div className={`fixed -top-20 -left-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-50 transition-colors duration-500 ${dm ? 'bg-blue-900/20' : 'bg-red-200/30'}`}></div>
      <div className={`fixed -bottom-20 -right-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-50 transition-colors duration-500 ${dm ? 'bg-purple-900/20' : 'bg-blue-200/30'}`}></div>

      <div className="px-8 py-8 pb-12 max-w-7xl mx-auto relative z-10">

        {/* ── Header / Welcome Banner ── */}
        <div className="mb-10 rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/10"
          style={{ background: 'linear-gradient(135deg, #0b1d3a 0%, #0f2a55 50%, #1a1035 100%)' }}>
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
          
          <div className="relative px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              {/* Club Logo with dynamic shadow */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                {club && (club.logo || club.logo_url) ? (
                  <img
                    src={getImageUrl(club.logo) || club.logo_url}
                    alt={club.name}
                    className="relative w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-2xl"
                  />
                ) : (
                  <div className="relative w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">
                    Administration
                  </span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight">
                  Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-300">{user?.first_name}</span>
                </h2>
                <p className="text-blue-200/70 font-medium mt-1">
                  Gestionnaire du club : <span className="text-white">{club?.name || 'Chargement...'}</span>
                </p>
              </div>
            </div>

            <div className="hidden lg:block text-right">
                <div className="text-4xl font-light text-white/20 select-none tracking-tighter uppercase italic">Board Member</div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              value: membersCount,
              label: 'Membres Actifs',
              color: 'red',
              icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            },
            {
              value: eventsCount,
              label: 'Événements Créés',
              color: 'blue',
              icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            },
            {
              value: '3',
              label: 'Alertes Bureau',
              color: 'purple',
              icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            },
          ].map((stat, i) => (
            <div key={i} className={`group rounded-[1.5rem] p-8 border transition-all duration-300 hover:-translate-y-2
              ${dm 
                ? `bg-[#050F1E]/80 backdrop-blur-xl border-white/5 hover:border-${stat.color}-500/50` 
                : `bg-white border-gray-100 shadow-xl shadow-gray-200/50 hover:border-${stat.color}-200`}`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                  ${dm ? `bg-${stat.color}-500/10 text-${stat.color}-400` : `bg-${stat.color}-50 text-${stat.color}-500`}`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">{stat.icon}</svg>
                </div>
                <div className={`h-1 w-12 rounded-full ${dm ? 'bg-white/5' : 'bg-gray-100'}`}></div>
              </div>
              <h3 className={`text-4xl font-black mb-1 tracking-tight ${dm ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
              <p className={`text-sm font-bold uppercase tracking-wider ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Activity Section */}
          <div className={`rounded-[2rem] p-8 border backdrop-blur-md transition-all
            ${dm ? 'bg-[#050F1E]/60 border-white/5' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-8">
                <h3 className={`text-xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>Derniers Mouvements</h3>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="space-y-4">
              {[
                { label: "Demande Adhésion", user: "Ahmed Benali", time: "2h", color: "red" },
                { label: "Nouveau Event", user: "Workshop React", time: "5h", color: "blue" },
                { label: "Validation", user: "Sara Alami", time: "1j", color: "green" },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.01]
                  ${dm ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-gray-50 hover:bg-gray-100/80'}`}>
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]`}></div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${dm ? 'text-white' : 'text-gray-800'}`}>{item.label}</p>
                    <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{item.user}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${dm ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-400 border border-gray-100'}`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Shortcuts Section */}
          <div className={`rounded-[2rem] p-8 border backdrop-blur-md transition-all
            ${dm ? 'bg-[#050F1E]/60 border-white/5' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
            <h3 className={`text-xl font-black mb-8 ${dm ? 'text-white' : 'text-gray-900'}`}>Outils de Gestion</h3>
            
            <div className="grid gap-4">
              {/* Primary Action */}
              <button
                onClick={() => navigate('/Bureaux/AssignTickets')}
                className={`group relative w-full p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 overflow-hidden
                  ${dm 
                    ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40' 
                    : 'bg-green-50/50 border-green-100 hover:bg-green-50 hover:border-green-200'}`}
              >
                <div className="relative z-10 flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110
                    ${dm ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className={`font-black text-base ${dm ? 'text-white' : 'text-gray-800'}`}>Assigner des Billets</h4>
                    <p className={`text-xs mt-1 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Validation manuelle et envoi de QR Codes aux membres.</p>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-24 h-24 translate-x-4 translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                </div>
              </button>

              {/* Secondary Tips */}
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { t: "Events", d: "Organiser", c: "blue" },
                   { t: "Membres", d: "Modérer", c: "purple" }
                 ].map((box, i) => (
                    <div key={i} className={`p-4 rounded-2xl border transition-colors
                        ${dm ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest text-${box.c}-500 mb-1`}>{box.t}</p>
                        <p className={`text-sm font-bold ${dm ? 'text-gray-300' : 'text-gray-700'}`}>{box.d}</p>
                    </div>
                 ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse-soft { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.3; } }
        .animate-pulse-soft { animation: pulse-soft 4s infinite; }
      `}</style>
    </div>
  );
};

export default BoardDashboard;