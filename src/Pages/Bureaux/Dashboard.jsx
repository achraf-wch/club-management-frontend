import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BoardDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMyClub();
  }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setClub(data);
      }
    } catch (error) {
      console.error('Error fetching club:', error);
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
          <div className={`inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mb-4 ${dm ? 'border-red-500' : 'border-red-500'}`}></div>
          <p className={`text-xl font-semibold ${dm ? 'text-white' : 'text-gray-700'}`}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${dm ? 'bg-[#020617]' : 'bg-gray-50'}`}>

      {/* ── Dark Mode Toggle Button — fixed right middle (same as AdminDashboard) ── */}
      <button
        onClick={() => setDarkMode(!dm)}
        className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-14 h-14 rounded-2xl border shadow-xl transition-all duration-300 hover:scale-110
          ${dm
            ? 'bg-[#0b1d3a] border-white/10 hover:bg-[#0f2a55]'
            : 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500 hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-blue-600/50'
          }`}
        title={dm ? 'Mode Clair' : 'Mode Sombre'}
      >
        {dm ? (
          /* Sun icon — switch to light */
          <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          /* Moon icon — switch to dark */
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* ── Main Content ── */}
      <div className="px-8 py-8 pb-12 max-w-7xl mx-auto">

        {/* ── Welcome Banner ── */}
        <div className="mb-10 rounded-3xl overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #0b1d3a 0%, #0f2a55 50%, #1a1035 100%)' }}>
          <div className="relative px-10 py-8 flex items-center justify-between">

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 right-32 w-32 h-32 bg-red-500/10 rounded-full translate-y-1/2 pointer-events-none"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div>
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
                  Espace Bureau
                </p>
                <h2 className="text-3xl font-bold text-white">
                  Bienvenue, <span className="text-red-400">{user?.first_name}</span>
                </h2>
                {club && (
                  <span className="mt-2 inline-block px-3 py-0.5 bg-white/10 rounded-full text-xs text-white font-medium">
                    {club.name}
                  </span>
                )}
              </div>
            </div>

            {/* Club logo */}
            <div className="relative z-10 flex items-center gap-4">
              {club && (club.logo || club.logo_url) ? (
                <img
                  src={getImageUrl(club.logo) || club.logo_url}
                  alt={club.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              value: club?.total_members || '0',
              label: 'Membres du Club',
              iconColor: dm ? 'text-red-400' : 'text-red-500',
              bgColor: dm ? 'bg-red-500/10' : 'bg-red-50',
              hoverBorder: dm ? 'hover:border-red-500/40' : 'hover:border-red-200',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            },
            {
              value: club?.events_count || '0',
              label: 'Événements',
              iconColor: dm ? 'text-blue-400' : 'text-blue-500',
              bgColor: dm ? 'bg-blue-500/10' : 'bg-blue-50',
              hoverBorder: dm ? 'hover:border-blue-500/40' : 'hover:border-blue-200',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              value: '3',
              label: 'Tâches en Attente',
              iconColor: dm ? 'text-purple-400' : 'text-purple-500',
              bgColor: dm ? 'bg-purple-500/10' : 'bg-purple-50',
              hoverBorder: dm ? 'hover:border-purple-500/40' : 'hover:border-purple-200',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )
            },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl p-6 border transition-all hover:scale-105 hover:shadow-lg
              ${dm
                ? `bg-[#050F1E] border-white/10 ${stat.hoverBorder}`
                : `bg-white border-gray-100 shadow-sm ${stat.hoverBorder}`
              }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <span className={stat.iconColor}>{stat.icon}</span>
                </div>
              </div>
              <h3 className={`text-3xl font-bold mb-1 ${dm ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
              <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Two Columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Activité Récente */}
          <div className={`rounded-2xl p-7 border transition-colors duration-300
            ${dm ? 'bg-[#050F1E] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h3 className={`text-lg font-bold mb-5 ${dm ? 'text-white' : 'text-gray-900'}`}>Activité Récente</h3>
            <div className="space-y-3">
              {[
                {
                  bg: dm ? 'bg-red-500/10' : 'bg-red-100',
                  icon: <svg className={`w-5 h-5 ${dm ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
                  title: "Nouvelle demande d'adhésion",
                  sub: 'Ahmed Benali',
                  time: '2h',
                  hover: dm ? 'hover:bg-red-500/10' : 'hover:bg-red-50/40'
                },
                {
                  bg: dm ? 'bg-blue-500/10' : 'bg-blue-100',
                  icon: <svg className={`w-5 h-5 ${dm ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                  title: 'Événement créé',
                  sub: 'Workshop React.js',
                  time: '5h',
                  hover: dm ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50/40'
                },
                {
                  bg: dm ? 'bg-green-500/10' : 'bg-green-100',
                  icon: <svg className={`w-5 h-5 ${dm ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  title: 'Membre approuvé',
                  sub: 'Sara Alami',
                  time: '1j',
                  hover: dm ? 'hover:bg-green-500/10' : 'hover:bg-green-50/40'
                },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl transition-all
                  ${dm ? `bg-white/5 ${item.hover}` : `bg-gray-50 ${item.hover}`}`}>
                  <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${dm ? 'text-white' : 'text-gray-800'}`}>{item.title}</p>
                    <p className={`text-xs ${dm ? 'text-gray-400' : 'text-gray-400'}`}>{item.sub}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${dm ? 'text-gray-400 bg-white/10' : 'text-gray-400 bg-gray-100'}`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils & Astuces */}
          <div className={`rounded-2xl p-7 border transition-colors duration-300
            ${dm ? 'bg-[#050F1E] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h3 className={`text-lg font-bold mb-5 ${dm ? 'text-white' : 'text-gray-900'}`}>Conseils & Astuces</h3>
            <div className="space-y-3">
              {[
                {
                  bg: dm ? 'bg-red-500/10' : 'bg-red-100',
                  cardBg: dm ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50/50 border-red-100',
                  icon: <svg className={`w-5 h-5 ${dm ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                  title: 'Action Rapide',
                  desc: 'Vérifiez régulièrement les demandes en attente'
                },
                {
                  bg: dm ? 'bg-blue-500/10' : 'bg-blue-100',
                  cardBg: dm ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50/50 border-blue-100',
                  icon: <svg className={`w-5 h-5 ${dm ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  title: 'Organisation',
                  desc: 'Planifiez des événements réguliers'
                },
                {
                  bg: dm ? 'bg-purple-500/10' : 'bg-purple-100',
                  cardBg: dm ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50/50 border-purple-100',
                  icon: <svg className={`w-5 h-5 ${dm ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
                  title: 'Communication',
                  desc: 'Gardez les membres informés'
                },
              ].map((tip, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${tip.cardBg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${tip.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm mb-1 ${dm ? 'text-white' : 'text-gray-800'}`}>{tip.title}</h4>
                      <p className={`text-xs ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{tip.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Floating Orbs ── */}
      <div className={`fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${dm ? 'bg-blue-700/10' : 'bg-red-400/10'}`}></div>
      <div className={`fixed bottom-20 right-24 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${dm ? 'bg-red-600/10' : 'bg-blue-400/10'}`}></div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default BoardDashboard;