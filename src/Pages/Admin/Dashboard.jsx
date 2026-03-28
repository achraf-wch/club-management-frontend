import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const [stats, setStats] = useState({
    totalClubs: 0,
    totalMembers: 0,
    totalEvents: 0,
    activeUsers: 0
  });

  const [clubs, setClubs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`, { credentials: 'include' });
      if (response.ok) {
        const clubsData = await response.json();
        const clubsList = Array.isArray(clubsData) ? clubsData : [];
        setClubs(clubsList);
        const totalMembers = clubsList.reduce((sum, club) => sum + (club.total_members || 0), 0);
        const activeUsers  = clubsList.reduce((sum, club) => sum + (club.active_members  || 0), 0);

        let totalEvents = 0;
        try {
          const eventsRes = await fetch(`${API_BASE_URL}/api/events`, { credentials: 'include' });
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData.data ?? []);
            totalEvents = eventsList.length;
          } else {
            totalEvents = clubsList.reduce((sum, club) => sum + (club.events_count || 0), 0);
          }
        } catch {
          totalEvents = clubsList.reduce((sum, club) => sum + (club.events_count || 0), 0);
        }

        setStats({ totalClubs: clubsList.length, totalMembers, totalEvents, activeUsers });

        setRecentActivity([
          { action: 'Nouveau club créé', name: clubsList[0]?.name || 'Club Example', time: '2 min' },
          { action: 'Nouveau membre', name: 'Mohamed Ali', time: '15 min' },
          { action: 'Événement publié', name: 'Workshop React', time: '1 h' },
          { action: 'Membre activé', name: 'Sara Bennani', time: '2 h' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dm = darkMode;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-[#0a0a0a]' : 'bg-[#f5f7fa]'}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#c0392b] border-t-transparent mb-4"></div>
          <p className={`text-xl font-semibold ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${
      dm 
        ? 'bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#0a0a0a]' 
        : 'bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]'
    }`}>

      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c0392b]/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1a2c5b]/10 rounded-full blur-[100px] -z-10"></div>

        <div className="pt-24 px-8 pb-12 max-w-7xl mx-auto relative z-10">

          {/* Header Section */}
          <div className="mb-12">
            <div className="w-12 h-1 bg-[#c0392b] mb-4"></div>
            <h2 className="text-5xl font-bold mb-3 tracking-tight">
              <span className={dm ? 'text-white' : 'text-[#1a2c5b]'}>Bienvenue, </span>
              <span className="text-[#c0392b]">@{user?.first_name}</span>
            </h2>
            <p className={`text-lg font-medium ${dm ? 'text-white/40' : 'text-gray-500'}`}>
              Tableau de bord de gestion CluVersity — EST Fès
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Clubs Actifs', value: stats.totalClubs, color: 'from-[#1a2c5b] to-[#2c3e50]', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { label: 'Total Membres', value: stats.totalMembers, color: 'from-[#c0392b] to-[#8e44ad]', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { label: 'Membres en Ligne', value: stats.activeUsers, color: 'from-[#27ae60] to-[#2ecc71]', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { label: 'Événements', value: stats.totalEvents, color: 'from-[#e67e22] to-[#d35400]', onClick: () => navigate('/admin/manageEvents'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            ].map((stat, i) => (
              <div
                key={i}
                onClick={stat.onClick ?? undefined}
                className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ${
                  stat.onClick ? 'cursor-pointer hover:-translate-y-2' : ''
                } ${dm ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-[#c0392b]/30'} border`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-[80px] group-hover:scale-110 transition-transform`}></div>
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${stat.color} shadow-lg shadow-black/20`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                
                <h3 className={`text-4xl font-black mb-1 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>
                  {stat.value}
                </h3>
                <p className={`text-sm font-bold uppercase tracking-wider ${dm ? 'text-white/40' : 'text-gray-400'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed */}
            <div className={`lg:col-span-2 border rounded-[2rem] p-8 transition-all duration-300 ${
              dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'
            }`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className={`text-2xl font-bold ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Activité Récente</h3>
                  <div className="w-8 h-1 bg-[#c0392b] mt-1"></div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-[#c0392b]/10 text-[#c0392b] text-sm font-bold hover:bg-[#c0392b] hover:text-white transition-all">
                  Voir historique
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className={`flex items-center gap-5 p-5 rounded-2xl border transition-all ${
                    dm ? 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-lg'
                  }`}>
                    <div className="w-12 h-12 bg-[#1a2c5b] rounded-xl flex items-center justify-center shadow-inner">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-base ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>{activity.action}</p>
                      <p className={`text-sm ${dm ? 'text-white/40' : 'text-gray-500'}`}>{activity.name}</p>
                    </div>
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${dm ? 'bg-white/5 text-white/30' : 'bg-gray-200 text-gray-500'}`}>
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clubs Leaderboard */}
            <div className={`lg:col-span-1 border rounded-[2rem] p-8 transition-all duration-300 ${
              dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'
            }`}>
              <div className="mb-8">
                <h3 className={`text-2xl font-bold ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Performance Clubs</h3>
                <div className="w-8 h-1 bg-[#c0392b] mt-1"></div>
              </div>

              <div className="space-y-4">
                {clubs.slice(0, 5).map((club, idx) => (
                  <div key={club.id} className={`group flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer ${
                    dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110 ${
                      idx === 0 ? 'bg-[#c0392b] text-white' : (dm ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-600')
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>{club.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-700/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#c0392b] rounded-full" 
                            style={{ width: `${Math.min((club.total_members / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] font-bold ${dm ? 'text-white/30' : 'text-gray-400'}`}>
                          {club.total_members || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/admin/manageClubs')}
                className="w-full mt-8 px-6 py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#c0392b]/20 hover:shadow-[#c0392b]/40 flex items-center justify-center gap-2"
              >
                Gérer tous les clubs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;