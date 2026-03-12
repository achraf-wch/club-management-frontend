import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ── Real counts ───────────────────────────────────────────────────────────
  const [membersCount, setMembersCount] = useState(0);
  const [eventsCount,  setEventsCount]  = useState(0);

  // ── Real user profile (role + email from API) ─────────────────────────────
  const [profile, setProfile] = useState(null);
  // ─────────────────────────────────────────────────────────────────────────

  const dm = darkMode;
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [typedText, setTypedText] = useState('');
  const fullText = `Bienvenue, ${user?.first_name} Président !`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    const handleThemeChange = () =>
      setDarkMode(document.documentElement.classList.contains("dark"));
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      // ── 0. Real user profile (role + email) ───────────────────────────────
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/user`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch {
        // fallback to AuthContext user
      }

      // ── 1. Club info via my-club-info ─────────────────────────────────────
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

      // ── 2. Members count ──────────────────────────────────────────────────
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
            setMembersCount(
              clubData?.members_count ?? clubData?.total_members ?? clubData?.memberships_count ?? 0
            );
          }
        } catch {
          setMembersCount(
            clubData?.members_count ?? clubData?.total_members ?? clubData?.memberships_count ?? 0
          );
        }
      }

      // ── 3. Events count ───────────────────────────────────────────────────
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

  // Helpers: prefer API profile over AuthContext user
  const displayRole  = profile?.role  ?? profile?.roles?.[0] ?? user?.role  ?? '—';
  const displayEmail = profile?.email ?? user?.email ?? '—';

  // Make role label more readable
  const roleLabel = (r) => {
    const map = {
      president: 'Président',
      bureau: 'Bureau',
      admin: 'Admin',
      user: 'Membre',
      member: 'Membre',
    };
    return map[r?.toLowerCase()] ?? r;
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen p-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">

          {/* Page Title */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
              Tableau de Bord Président
            </h1>
            <p className="text-red-500 mt-2 font-medium">
              {typedText}<span className="animate-pulse">|</span>
            </p>
            {club && (
              <div className="mt-3 flex items-center gap-3">
                {(club.logo || club.logo_url) && (
                  <img src={getImageUrl(club.logo) || club.logo_url} alt={club.name} className="w-10 h-10 rounded-full object-cover shadow" />
                )}
                <span className={`font-semibold px-4 py-2 rounded-full shadow-sm border animate-floatSide
                  ${dm ? 'text-cyan-300 bg-black/40 border-cyan-900/40' : 'text-gray-700 bg-white border-gray-200'}`}>
                  Club : {club.name}
                </span>
              </div>
            )}
          </div>

          {/* Welcome Card + Quick Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

            {/* Welcome Card */}
            <div className={`lg:col-span-2 rounded-2xl shadow-sm border p-8 relative overflow-hidden transition-colors duration-300
              ${dm ? 'bg-[#0d0d18] border-red-900/30' : 'bg-white border-gray-200'}`}>
              <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full opacity-50 ${dm ? 'bg-red-700/20' : 'bg-blue-100'}`}></div>
              <div className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full opacity-50 ${dm ? 'bg-cyan-900/20' : 'bg-red-100'}`}></div>

              <div className="relative">
                <h2 className={`text-3xl font-bold mb-4 ${dm ? 'text-red-100' : 'text-gray-900'}`}>
                  👋 Bonjour, {user?.first_name} !
                </h2>
                <p className={`mb-6 ${dm ? 'text-gray-500' : 'text-gray-500'}`}>
                  Vous avez accès à toutes les fonctionnalités de gestion du club.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Rôle — real value ── */}
                  <div className={`border p-4 rounded-xl ${dm ? 'bg-red-950/40 border-red-800/30' : 'bg-blue-50 border-blue-100'}`}>
                    <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Rôle</p>
                    <p className={`text-lg font-semibold ${dm ? 'text-white' : 'text-gray-800'}`}>
                      {roleLabel(displayRole)}
                    </p>
                  </div>
                  {/* Email — real value ── */}
                  <div className={`border p-4 rounded-xl ${dm ? 'bg-black/40 border-cyan-900/30' : 'bg-red-50 border-red-100'}`}>
                    <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Email</p>
                    <p className={`text-lg font-semibold truncate ${dm ? 'text-white' : 'text-gray-800'}`}>
                      {displayEmail}
                    </p>
                  </div>
                  {club && (
                    <>
                      <div className={`border p-4 rounded-xl ${dm ? 'bg-red-950/30 border-red-900/30' : 'bg-green-50 border-green-100'}`}>
                        <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Club</p>
                        <p className={`text-lg font-semibold ${dm ? 'text-white' : 'text-gray-800'}`}>{club.name}</p>
                      </div>
                      <div className={`border p-4 rounded-xl ${dm ? 'bg-black/50 border-cyan-900/20' : 'bg-yellow-50 border-yellow-100'}`}>
                        <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Catégorie</p>
                        <p className={`text-lg font-semibold ${dm ? 'text-white' : 'text-gray-800'}`}>{club.category}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Settings Card */}
            <div className="relative bg-[#0d0010] rounded-2xl shadow-xl p-6 border border-red-900/40 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600 opacity-25 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500 opacity-10 blur-3xl"></div>
              <h3 className="text-xl font-bold mb-6 text-white tracking-wide relative z-10">⚙️ Paramètres Rapides</h3>
              <div className="space-y-4 relative z-10">
                <button onClick={() => navigate('/Login/AccountSetup')}
                  className="group w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:bg-white/10">
                  <div className="p-2 rounded-lg bg-blue-600/20 group-hover:bg-blue-600/30 transition">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className="font-medium text-gray-200 group-hover:text-white transition">Modifier mon profil</span>
                </button>
                <button onClick={() => navigate('/Login/AccountSetup')}
                  className="group w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-red-400 hover:bg-white/10">
                  <div className="p-2 rounded-lg bg-red-600/20 group-hover:bg-red-600/30 transition">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <span className="font-medium text-gray-200 group-hover:text-white transition">Changer mot de passe</span>
                </button>
                <button onClick={() => navigate('/Login/AccountSetup')}
                  className="group w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-yellow-400 hover:bg-white/10">
                  <div className="p-2 rounded-lg bg-yellow-400/20 group-hover:bg-yellow-400/30 transition">
                    <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-200 group-hover:text-white transition">Lier compte Google</span>
                </button>
                {/* ── NEW: Assigner Billets ── */}
                <button onClick={() => navigate('/President/AssignTickets')}
                  className="group w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-green-400 hover:bg-white/10">
                  <div className="p-2 rounded-lg bg-green-600/20 group-hover:bg-green-600/30 transition">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  </div>
                  <span className="font-medium text-gray-200 group-hover:text-white transition">Assigner des billets</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: 'Membres Totaux', value: membersCount,
                sub: 'Votre club', subColor: 'text-green-500',
                color: dm ? 'bg-red-700' : 'bg-blue-700',
                icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
              },
              {
                label: 'Événements Actifs', value: eventsCount,
                sub: 'Gérez vos événements', subColor: 'text-cyan-500',
                color: dm ? 'bg-[#0e4a4a]' : 'bg-red-600',
                icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
              },
              {
                label: 'Demandes en Attente', value: '--',
                sub: 'Action requise', subColor: 'text-red-500',
                color: dm ? 'bg-red-900' : 'bg-blue-700',
                icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
              },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl shadow-sm border p-6 animate-float-card transition-colors duration-300
                ${dm ? 'bg-[#0d0d18] border-red-900/30' : 'bg-white border-gray-200'}`}
                style={{ animationDelay: i === 1 ? '0.5s' : i === 2 ? '1s' : '0s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${dm ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</p>
                    <p className={`text-4xl font-bold mt-2 ${dm ? 'text-red-100' : 'text-gray-900'}`}>{stat.value}</p>
                    <p className={`text-sm mt-1 font-semibold ${stat.subColor}`}>{stat.sub}</p>
                  </div>
                  <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center shadow-lg animate-bounce-slow`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes floatSide { 0% { transform: translateX(0px); } 50% { transform: translateX(15px); } 100% { transform: translateX(0px); } }
        @keyframes floatCard { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-floatSide { animation: floatSide 3s ease-in-out infinite; }
        .animate-float-card { animation: floatCard 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
        .animation-delay-2s { animation-delay: 0.7s; }
        .animation-delay-4s { animation-delay: 1.4s; }
      `}</style>
    </>
  );
};

export default PresidentDashboard;