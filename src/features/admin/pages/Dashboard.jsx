import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: dm ? '#0a0a0a' : '#f5f7fa' }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#c0392b] border-t-transparent mb-4"></div>
          <p className="text-xl font-semibold" style={{ color: dm ? '#f0f0f0' : '#1a2c5b' }}>
            Chargement de l'administration...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Clubs actifs',
      value: stats.totalClubs,
      accent: '#1a2c5b',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Total membres',
      value: stats.totalMembers,
      accent: '#c0392b',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      label: 'Membres actifs',
      value: stats.activeUsers,
      accent: '#16a34a',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      label: 'Événements',
      value: stats.totalEvents,
      accent: '#d97706',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      onClick: () => navigate('/admin/manageEvents'),
    },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        background: dm ? '#0a0a0a' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <div className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] -z-10"
          style={{ background: dm ? 'rgba(192,57,43,0.06)' : 'rgba(192,57,43,0.05)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[140px] -z-10"
          style={{ background: dm ? 'rgba(255,255,255,0.02)' : 'rgba(26,44,91,0.08)' }}
        />

        <div className="pt-8 md:pt-12 px-8 pb-12 max-w-7xl mx-auto relative z-10">

          {/* Header */}
          <div className="mb-10">
            <div className="w-12 h-1 bg-[#c0392b] mb-4 rounded-full"></div>
            <h2 className="text-5xl font-bold mb-3 tracking-tight">
              <span style={{ color: dm ? '#f0f0f0' : '#1a2c5b' }}>Bienvenue, </span>
              <span className="text-[#c0392b]">@{user?.first_name}</span>
            </h2>
            <p style={{ color: dm ? 'rgba(240,240,240,0.40)' : '#6b7280' }} className="text-lg font-medium">
              Tableau de bord de gestion CluVersity — EST Fès
            </p>
          </div>

          {/* ── Stats Grid — compact & professional ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {statCards.map((stat, i) => (
              <div
                key={i}
                onClick={stat.onClick}
                style={{
                  background: dm ? '#141414' : '#ffffff',
                  border: `1px solid ${dm ? 'rgba(255,255,255,0.07)' : '#ebebeb'}`,
                  borderRadius: '14px',
                  padding: '18px 20px',
                  cursor: stat.onClick ? 'pointer' : 'default',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  boxShadow: dm ? 'none' : '0 2px 10px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = dm
                    ? '0 8px 24px rgba(0,0,0,0.5)'
                    : '0 8px 24px rgba(0,0,0,0.09)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = dm ? 'none' : '0 2px 10px rgba(0,0,0,0.05)';
                }}
              >
                {/* Icon badge */}
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 9,
                  background: `${stat.accent}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" stroke={stat.accent} strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>

                {/* Number + label */}
                <div>
                  <p style={{
                    fontSize: '28px', fontWeight: 800,
                    color: dm ? '#f0f0f0' : '#1a2c5b',
                    lineHeight: 1, margin: '0 0 5px',
                    letterSpacing: '-0.02em',
                  }}>
                    {stat.value}
                  </p>
                  <p style={{
                    fontSize: '10px', fontWeight: 600,
                    color: dm ? 'rgba(240,240,240,0.35)' : '#9ca3af',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {stat.label}
                  </p>
                </div>

                {/* Accent bar */}
                <div style={{ height: '2px', borderRadius: 99, background: dm ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }}>
                  <div style={{ height: '100%', width: '38%', borderRadius: 99, background: stat.accent }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Activity Feed */}
            <div
              className="lg:col-span-2 rounded-[2rem] p-8 border transition-all duration-300"
              style={{
                background: dm ? '#111111' : '#ffffff',
                borderColor: dm ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                boxShadow: dm ? '0 4px 32px rgba(0,0,0,0.5)' : '0 8px 40px rgba(99,116,155,0.10)',
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: dm ? '#f0f0f0' : '#1a2c5b' }}>
                    Activité Récente
                  </h3>
                  <div className="w-8 h-1 bg-[#c0392b] mt-1 rounded-full"></div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-[#c0392b]/10 text-[#c0392b] text-sm font-bold hover:bg-[#c0392b] hover:text-white transition-all">
                  Voir historique
                </button>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-5 p-5 rounded-2xl border transition-all"
                    style={{
                      background: dm ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      borderColor: dm ? 'rgba(255,255,255,0.05)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.07)' : '#ffffff';
                      e.currentTarget.style.borderColor = dm ? 'rgba(255,255,255,0.09)' : '#e2e8f0';
                      if (!dm) e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,116,155,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.03)' : '#f8fafc';
                      e.currentTarget.style.borderColor = dm ? 'rgba(255,255,255,0.05)' : 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ background: dm ? '#0a0a0a' : '#1a2c5b' }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base" style={{ color: dm ? '#f0f0f0' : '#1a2c5b' }}>
                        {activity.action}
                      </p>
                      <p className="text-sm" style={{ color: dm ? 'rgba(240,240,240,0.40)' : '#6b7280' }}>
                        {activity.name}
                      </p>
                    </div>
                    <span
                      className="text-xs font-mono font-bold px-3 py-1 rounded-full"
                      style={{
                        background: dm ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
                        color: dm ? 'rgba(240,240,240,0.32)' : '#6b7280',
                      }}
                    >
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clubs */}
            <div
              className="lg:col-span-1 rounded-[2rem] p-8 border transition-all duration-300"
              style={{
                background: dm ? '#111111' : '#ffffff',
                borderColor: dm ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                boxShadow: dm ? '0 4px 32px rgba(0,0,0,0.5)' : '0 8px 40px rgba(99,116,155,0.10)',
              }}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold" style={{ color: dm ? '#f0f0f0' : '#1a2c5b' }}>
                  Performance Clubs
                </h3>
                <div className="w-8 h-1 bg-[#c0392b] mt-1 rounded-full"></div>
              </div>

              <div className="space-y-4">
                {clubs.slice(0, 5).map((club, idx) => (
                  <div
                    key={club.id}
                    className="group flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer"
                    onMouseEnter={e => { e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.05)' : '#f8fafc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110"
                      style={{
                        background: idx === 0 ? '#c0392b' : (dm ? 'rgba(255,255,255,0.07)' : '#e5e7eb'),
                        color: idx === 0 ? '#fff' : (dm ? 'rgba(240,240,240,0.55)' : '#4b5563'),
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: dm ? '#f0f0f0' : '#1a2c5b' }}>
                        {club.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: dm ? 'rgba(255,255,255,0.07)' : '#e5e7eb' }}
                        >
                          <div
                            className="h-full bg-[#c0392b] rounded-full"
                            style={{ width: `${Math.min((club.total_members / 100) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: dm ? 'rgba(240,240,240,0.28)' : '#9ca3af' }}>
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
