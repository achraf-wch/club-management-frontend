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
        const activeUsers = clubsList.reduce((sum, club) => sum + (club.active_members || 0), 0);
        setStats({
          totalClubs: clubsList.length,
          totalMembers,
          totalEvents: clubsList.reduce((sum, club) => sum + (club.events_count || 0), 0),
          activeUsers
        });
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
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-[#0f1117]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className={`text-xl font-semibold ${dm ? 'text-[#e8eaf0]' : 'text-gray-800'}`}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${dm ? 'bg-[#0f1117]' : 'bg-gray-50'}`}>

      <AdminSidebar onLogout={logout} user={user} />

      {/* main area now sits directly beside sidebar, no extra left margin */}
      <div className="flex-1 relative pt-32">

        {/* Main Content */}
        <div className="pt-8 px-8 pb-12 max-w-7xl mx-auto">

          {/* Welcome */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold mb-3">
              <span className={dm ? 'text-[#e8eaf0]' : 'text-gray-900'}>Bienvenue, </span>
              <span className="text-red-500">{user?.first_name} {user?.last_name}</span>
            </h2>
            <p className={`text-lg ${dm ? 'text-[#7c8499]' : 'text-gray-500'}`}>Gérez votre plateforme CluVersity</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Clubs', value: stats.totalClubs, icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ), color: 'bg-blue-700' },
              { label: 'Membres', value: stats.totalMembers, icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ), color: 'bg-red-600' },
              { label: 'Actifs', value: stats.activeUsers, icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ), color: 'bg-blue-700' },
              { label: 'Événements', value: stats.totalEvents, icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ), color: 'bg-red-600' },
            ].map((stat, i) => (
              <div key={i} className={`border rounded-3xl p-6 hover:scale-105 transition-all
                ${dm
                  ? 'bg-[#161b26] border-[#272f42] hover:border-[#3d4f73] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                  : 'bg-white border-gray-200 hover:border-blue-700/50 shadow-sm hover:shadow-2xl'
                }`}>
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <h3 className={`text-4xl font-bold mb-1 ${dm ? 'text-[#eaecf3]' : 'text-gray-900'}`}>{stat.value}</h3>
                <p className={`text-sm ${dm ? 'text-[#6b7691]' : 'text-gray-500'}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Activity */}
            <div className={`lg:col-span-2 border rounded-3xl p-8
              ${dm
                ? 'bg-[#161b26] border-[#272f42]'
                : 'bg-white border-gray-200 shadow-sm'
              }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${dm ? 'text-[#eaecf3]' : 'text-gray-900'}`}>Activité Récente</h3>
                <button className="text-sm text-red-400 hover:text-red-300 transition">Voir tout</button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl transition-all
                    ${dm
                      ? 'bg-[#1c2233] hover:bg-[#202840] border border-[#272f42] hover:border-[#3d4f73]'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                    <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${dm ? 'text-[#eaecf3]' : 'text-gray-800'}`}>{activity.action}</p>
                      <p className={`text-xs ${dm ? 'text-[#6b7691]' : 'text-gray-500'}`}>{activity.name}</p>
                    </div>
                    <span className={`text-xs ${dm ? 'text-[#445070]' : 'text-gray-400'}`}>{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clubs */}
            <div className={`lg:col-span-1 border rounded-3xl p-8
              ${dm
                ? 'bg-[#161b26] border-[#272f42]'
                : 'bg-white border-gray-200 shadow-sm'
              }`}>
              <h3 className={`text-xl font-bold mb-6 ${dm ? 'text-[#eaecf3]' : 'text-gray-900'}`}>Top Clubs</h3>
              <div className="space-y-3">
                {clubs.slice(0, 5).map((club, idx) => (
                  <div key={club.id} className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer
                    ${dm
                      ? 'bg-[#1c2233] hover:bg-[#202840] border border-[#272f42] hover:border-[#3d4f73]'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${dm ? 'text-[#eaecf3]' : 'text-gray-800'}`}>{club.name}</p>
                      <p className={`text-xs ${dm ? 'text-[#6b7691]' : 'text-gray-500'}`}>{club.total_members || 0} membres</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/admin/manageClubs')}
                className="w-full mt-6 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-2xl transition-all"
              >
                Voir tout
              </button>
            </div>

          </div>
        </div>

        {/* Floating Orbs — subtle, professional */}
        <div className={`fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${dm ? 'bg-blue-950/40' : 'bg-blue-100'}`}></div>
        <div className={`fixed bottom-20 right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${dm ? 'bg-red-950/30' : 'bg-red-100'}`}></div>

      </div>
    </div>
  );
};

export default AdminDashboard;