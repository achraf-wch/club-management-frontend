import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

const IconUsers = ({ className = 'w-8 h-8' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
);

const IconCalendar = ({ className = 'w-8 h-8' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const IconInbox = ({ className = 'w-8 h-8' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
  </svg>
);

const IconTicket = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
  </svg>
);

const IconSettings = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const IconPlus = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconUser = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const IconLock = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const IconShield = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);

const ClubDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [membersCount, setMembersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [typedText, setTypedText] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const effectiveRole = user?.role === 'user' ? user?.club_role : user?.role;
  const isPresident = effectiveRole === 'president';
  const dm = darkMode;
  const roleLabel = isPresident ? 'Président' : 'Bureau';
  const roleHeading = isPresident ? 'PRESIDENT' : 'BOARD';
  const fullText = isPresident
    ? `Commandant ${user?.first_name}, votre club vous attend.`
    : `${user?.first_name}, votre bureau est prêt à agir.`;

  useEffect(() => {
    const handleThemeChange = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    let index = 0;
    setTypedText('');
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index += 1;
      if (index === fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/user`, { credentials: 'include' });
        if (profileRes.ok) {
          setProfile(await profileRes.json());
        }

        const clubRes = await fetch(`${API_BASE_URL}/api/my-club-info`, { credentials: 'include' });
        let clubData = clubRes.ok ? await clubRes.json() : null;
        if (!clubData) {
          const fallbackRes = await fetch(`${API_BASE_URL}/api/my-club`, { credentials: 'include' });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            clubData = fallbackData.club || fallbackData;
          }
        }
        setClub(clubData);

        if (clubData?.id) {
          try {
            const membersRes = await fetch(`${API_BASE_URL}/api/clubs/${clubData.id}/members`, {
              credentials: 'include',
              headers: { Accept: 'application/json' },
            });
            if (membersRes.ok) {
              const membersData = await membersRes.json();
              const list = Array.isArray(membersData) ? membersData : (membersData.data ?? []);
              setMembersCount(list.length);
            } else {
              setMembersCount(clubData.total_members ?? clubData.members_count ?? 0);
            }
          } catch {
            setMembersCount(clubData.total_members ?? clubData.members_count ?? 0);
          }
        }

        try {
          const eventsRes = await fetch(`${API_BASE_URL}/api/events`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
          });
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            const allEvents = Array.isArray(eventsData) ? eventsData : (eventsData.data ?? []);
            setEventsCount(clubData?.id ? allEvents.filter((event) => event.club_id === clubData.id).length : allEvents.length);
          } else {
            setEventsCount(clubData?.events_count ?? 0);
          }
        } catch {
          setEventsCount(clubData?.events_count ?? 0);
        }

        if (isPresident && clubData?.id) {
          try {
            const requestsRes = await fetch(`${API_BASE_URL}/api/clubs/${clubData.id}/requests/stats`, {
              credentials: 'include',
            });
            if (requestsRes.ok) {
              const requestsData = await requestsRes.json();
              setPendingCount(requestsData.pending_requests ?? 0);
            }
          } catch {
            setPendingCount(0);
          }
        } else {
          setPendingCount(0);
        }
      } catch (error) {
        console.error('Error loading club dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_BASE_URL, isPresident]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/storage/${path.replace(/^\//, '')}`;
  };

  const stats = [
    {
      label: 'Effectif',
      value: membersCount,
      sub: 'Membres Actifs',
      Icon: IconUsers,
      color: '#c0392b',
      bg: dm ? 'rgba(192,57,43,0.12)' : 'rgba(192,57,43,0.08)',
      delay: '0ms',
    },
    {
      label: 'Agenda',
      value: eventsCount,
      sub: 'Événements',
      Icon: IconCalendar,
      color: '#1a2c5b',
      bg: dm ? 'rgba(26,44,91,0.18)' : 'rgba(26,44,91,0.07)',
      delay: '80ms',
    },
    {
      label: isPresident ? 'Demandes' : 'Accès',
      value: isPresident ? pendingCount : roleLabel,
      sub: isPresident ? 'En Attente' : 'Gestion Club',
      Icon: isPresident ? IconInbox : IconShield,
      color: '#f39c12',
      bg: dm ? 'rgba(243,156,18,0.12)' : 'rgba(243,156,18,0.08)',
      delay: '160ms',
    },
  ];

  const actions = [
    { label: 'Assigner Billets', Icon: IconTicket, path: '/club/tickets/assign', accent: '#22c55e' },
    { label: 'Gérer les Membres', Icon: IconSettings, path: '/club/members', accent: '#3b82f6' },
    { label: 'Nouvel Événement', Icon: IconPlus, path: '/club/events/create', accent: '#c0392b' },
    { label: 'Mon Profil', Icon: IconUser, path: '/Login/AccountSetup', accent: '#6b7280' },
  ];

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
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c0392b]/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#1a2c5b]/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="w-20 h-1.5 bg-[#c0392b] mb-4 rounded-full"></div>
            <h1 className="text-6xl font-black tracking-tighter mb-2">
              DASHBOARD <span className="text-[#c0392b]">{roleHeading}</span>
            </h1>
            <p className={`text-xl font-medium ${dm ? 'text-white/40' : 'text-gray-500'}`}>
              {typedText}<span className="animate-ping text-[#c0392b]">_</span>
            </p>
          </div>

          {club && (
            <div className={`flex items-center gap-4 p-4 rounded-[2rem] border backdrop-blur-md shadow-2xl ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#c0392b]/30">
                <img
                  src={getImageUrl(club.logo || club.logo_url) || `https://ui-avatars.com/api/?name=${club.name}&background=c0392b&color=fff`}
                  alt={club.name || 'Club'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#c0392b]">Organisation</p>
                <p className="text-lg font-black leading-tight">{club.name}</p>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className={`relative rounded-[3rem] p-10 overflow-hidden border transition-all ${dm ? 'bg-white/5 border-white/10' : 'bg-[#1a2c5b] text-white shadow-2xl'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45z" />
                </svg>
              </div>

              <h2 className="text-4xl font-black mb-4">Bienvenue, {user?.first_name}</h2>
              <p className={`text-lg mb-8 max-w-md ${dm ? 'text-white/50' : 'text-white/70'}`}>
                {isPresident
                  ? "Votre centre de commandement pour piloter les membres, les événements et l'impact de votre club au sein de l'EST Fès."
                  : "Votre espace bureau pour suivre l'activité du club, coordonner les membres et accélérer l'exécution sur le terrain."}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className={`px-6 py-3 rounded-2xl border text-sm font-bold flex items-center gap-3 ${dm ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {profile?.email || user?.email}
                </div>
                <div className={`px-6 py-3 rounded-2xl border text-sm font-bold ${dm ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                  Role: {roleHeading}
                </div>
              </div>

              <div className={`relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border ${dm ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20">
                    <IconShield className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Sécurité &amp; Compte</p>
                    <p className="text-sm font-semibold text-white/80">Gérez vos identifiants d'accès</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/Login/AccountSetup')}
                  className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/50 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:text-white"
                >
                  <span className="absolute inset-0 bg-red-500 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out rounded-xl"></span>
                  <IconLock className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="relative z-10">Changer le mot de passe</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`stat-card p-8 rounded-[2.5rem] border group hover:scale-[1.03] transition-all duration-300 ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}
                  style={{ animationDelay: stat.delay }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center icon-bounce" style={{ background: stat.bg }}>
                      <span
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping-slow"
                        style={{ boxShadow: `0 0 0 6px ${stat.color}30` }}
                      ></span>
                      <stat.Icon className="w-7 h-7" style={{ color: stat.color }} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-white/30' : 'text-gray-400'}`}>
                      {stat.label}
                    </span>
                  </div>

                  <h3
                    className="text-5xl font-black mb-1 tabular-nums transition-all duration-300 group-hover:scale-110 group-hover:origin-left"
                    style={{ color: dm ? 'white' : stat.color === '#f39c12' ? '#f39c12' : undefined }}
                  >
                    {stat.value}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-tighter" style={{ color: '#c0392b' }}>
                    {stat.sub}
                  </p>

                  <div
                    className="mt-6 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                    style={{ background: `linear-gradient(to right, ${stat.color}, transparent)` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className={`relative rounded-[3rem] p-8 border overflow-hidden h-full flex flex-col ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: '#c0392b' }}></div>

              <div className="relative z-10 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c0392b] mb-1">Navigation</p>
                <h3 className="text-3xl font-black leading-tight">
                  ACTIONS
                  <br />
                  <span className={dm ? 'text-white/40' : 'text-gray-300'}>RAPIDES</span>
                </h3>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3 flex-1">
                {actions.map((action, index) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={`action-card group relative flex flex-col items-start gap-3 p-5 rounded-[1.5rem] border overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 text-left ${
                      dm
                        ? 'bg-white/5 border-white/8 hover:border-white/20'
                        : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl hover:border-gray-200'
                    }`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.5rem]"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${action.accent}15, transparent 70%)` }}
                    ></span>

                    <div
                      className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                      style={{ background: `${action.accent}18`, color: action.accent }}
                    >
                      <action.Icon className="w-5 h-5" />
                    </div>

                    <span className={`relative z-10 text-[10px] font-black uppercase tracking-wider leading-tight ${dm ? 'text-white/70' : 'text-[#1a2c5b]'}`}>
                      {action.label}
                    </span>

                    <span
                      className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100"
                      style={{ background: action.accent }}
                    ></span>
                  </button>
                ))}
              </div>

              <div className="relative z-10 mt-6 flex gap-1">
                {actions.map((action) => (
                  <div key={action.label} className="h-0.5 flex-1 rounded-full" style={{ background: `${action.accent}60` }}></div>
                ))}
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

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 1.6s ease-out infinite; }

        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .icon-bounce { animation: icon-bounce 3s ease-in-out infinite; }

        .stat-card { animation: fadeUp 0.5s ease both; }
        .action-card { animation: fadeUp 0.4s ease both; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ClubDashboard;
