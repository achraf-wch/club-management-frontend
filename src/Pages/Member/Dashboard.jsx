import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [memberInfo, setMemberInfo] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);

      const clubResponse = await fetch(`${API_BASE_URL}/api/my-club-membership`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (clubResponse.ok) {
        const clubData = await clubResponse.json();
        setClubInfo(clubData.club);
        setMemberInfo(clubData.membership);
      }

      const ticketsResponse = await fetch(
        `${API_BASE_URL}/api/tickets?person_id=${user.id}&status=scanned`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setAttendedEvents(ticketsData);
      } else {
        setAttendedEvents([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getMemberLevel = (eventCount) => {
    if (eventCount >= 10) return { 
      name: 'Platine', 
      icon: '💎', 
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      progress: 100 
    };
    if (eventCount >= 5) return { 
      name: 'Or', 
      icon: '🏆', 
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      progress: (eventCount / 10) * 100 
    };
    return { 
      name: 'Argent', 
      icon: '⭐', 
      gradient: 'from-gray-300 via-gray-400 to-gray-500',
      progress: (eventCount / 5) * 100 
    };
  };

  const level = getMemberLevel(attendedEvents.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mb-4"></div>
          <p className="text-white text-xl font-semibold">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              {clubInfo?.logo_url ? (
                <img
                  src={clubInfo.logo_url}
                  alt={clubInfo.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">Espace Membre</h1>
                <p className="text-white/60 text-sm">{clubInfo?.name || 'Mon Club'}</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/Login/AccountSetup')}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user?.first_name} {user?.last_name}
              </button>
              <button
                onClick={logout}
                className="px-5 py-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30 text-red-300 font-semibold rounded-xl transition-all duration-300"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-5xl font-bold text-white mb-3">
            Bonjour, <span className="text-cyan-400">{user?.first_name}</span>! 👋
          </h2>
          <p className="text-white/70 text-lg">
            Bienvenue dans votre espace personnel
          </p>
        </div>

        {/* Member Card & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Digital Member Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Card Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full transform -translate-x-24 translate-y-24"></div>
            </div>

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-white/80 text-sm uppercase tracking-wider mb-1">Carte Membre</p>
                    <p className="text-white text-2xl font-bold">
                      {user?.first_name} {user?.last_name}
                    </p>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${level.gradient} text-white font-bold text-sm shadow-lg`}>
                  {level.icon} {level.name}
                </div>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Email</p>
                  <p className="text-white text-sm font-medium truncate">{user?.email}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Rôle</p>
                  <p className="text-white text-sm font-medium">
                    {memberInfo?.role === 'president' && '👑 Président'}
                    {memberInfo?.role === 'board' && '👔 Bureau'}
                    {memberInfo?.role === 'member' && '👤 Membre'}
                    {!memberInfo?.role && '👤 Membre'}
                  </p>
                </div>
                {memberInfo?.position && (
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Position</p>
                    <p className="text-white text-sm font-medium">{memberInfo.position}</p>
                  </div>
                )}
                {memberInfo?.joined_at && (
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Membre depuis</p>
                    <p className="text-white text-sm font-medium">
                      {new Date(memberInfo.joined_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Events Counter */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Événements Assistés</p>
                    <p className="text-white text-3xl font-bold">{attendedEvents.length}</p>
                  </div>
                </div>
                <div className="text-5xl">{level.icon}</div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-white/80 text-xs mb-2">
                  <span>Progression vers {attendedEvents.length < 5 ? 'Or' : 'Platine'}</span>
                  <span>{Math.round(level.progress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r from-white to-white/80 h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${level.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{attendedEvents.length}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm font-medium">Total Événements</p>
              <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">100%</p>
                </div>
              </div>
              <p className="text-white/60 text-sm font-medium">Taux de Participation</p>
              <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex gap-2 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              📊 Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              🎫 Mes Événements ({attendedEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('club')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'club'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              🏢 Mon Club
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Activité Récente
              </h3>

              {attendedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <p className="text-white text-xl font-semibold mb-2">Aucune participation encore</p>
                  <p className="text-white/60">Participez à des événements pour débloquer des récompenses!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendedEvents.slice(0, 3).map((event, index) => (
                    <div
                      key={event.id || index}
                      className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/30 transition-all flex items-center gap-4"
                    >
                      <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{event.event_title}</h4>
                        <p className="text-white/60 text-sm">
                          {new Date(event.event_date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-semibold border border-green-500/30">
                        Assisté
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                Succès Débloqués
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  attendedEvents.length >= 1 
                    ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/50' 
                    : 'bg-white/5 border-white/10 opacity-50'
                }`}>
                  <div className="text-4xl mb-3">🎯</div>
                  <h4 className="text-white font-bold mb-1">Premier Pas</h4>
                  <p className="text-white/60 text-sm">Assister à votre premier événement</p>
                </div>

                <div className={`p-6 rounded-xl border-2 transition-all ${
                  attendedEvents.length >= 5 
                    ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/50' 
                    : 'bg-white/5 border-white/10 opacity-50'
                }`}>
                  <div className="text-4xl mb-3">🏆</div>
                  <h4 className="text-white font-bold mb-1">Membre Actif</h4>
                  <p className="text-white/60 text-sm">Participer à 5 événements</p>
                </div>

                <div className={`p-6 rounded-xl border-2 transition-all ${
                  attendedEvents.length >= 10 
                    ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/50' 
                    : 'bg-white/5 border-white/10 opacity-50'
                }`}>
                  <div className="text-4xl mb-3">💎</div>
                  <h4 className="text-white font-bold mb-1">Super Star</h4>
                  <p className="text-white/60 text-sm">Atteindre 10 événements</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              Historique Complet
            </h3>

            {attendedEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <p className="text-white text-xl font-semibold mb-2">Aucun événement pour le moment</p>
                <p className="text-white/60">Vos participations apparaîtront ici après validation</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendedEvents.map((event, index) => (
                  <div
                    key={event.id || index}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold border border-green-500/30">
                        ✓ Validé
                      </div>
                    </div>

                    <h4 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {event.event_title}
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-white/60">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.event_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>

                      {event.event_location && (
                        <div className="flex items-center text-white/60">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{event.event_location}</span>
                        </div>
                      )}

                      {event.club_name && (
                        <div className="flex items-center text-white/60">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="truncate">{event.club_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'club' && clubInfo && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              Informations du Club
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Club Logo & Name */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl p-8 border border-cyan-500/30 text-center">
                  {clubInfo.logo_url ? (
                    <img
                      src={clubInfo.logo_url}
                      alt={clubInfo.name}
                      className="w-32 h-32 mx-auto rounded-2xl object-cover border-4 border-white/20 shadow-xl mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white/20 shadow-xl mb-4">
                      {clubInfo.name.charAt(0)}
                    </div>
                  )}
                  <h4 className="text-2xl font-bold text-white mb-2">{clubInfo.name}</h4>
                  {clubInfo.category && (
                    <p className="text-white/60 text-sm uppercase tracking-wide">{clubInfo.category}</p>
                  )}
                </div>
              </div>

              {/* Club Details */}
              <div className="lg:col-span-2 space-y-6">
                {clubInfo.description && (
                  <div>
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Description
                    </h5>
                    <p className="text-white/70 leading-relaxed">{clubInfo.description}</p>
                  </div>
                )}

                {clubInfo.mission && (
                  <div>
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                      Mission
                    </h5>
                    <p className="text-white/70 leading-relaxed">{clubInfo.mission}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/60 text-sm mb-1">Membres Totaux</p>
                    <p className="text-2xl font-bold text-white">{clubInfo.total_members || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/60 text-sm mb-1">Membres Actifs</p>
                    <p className="text-2xl font-bold text-white">{clubInfo.active_members || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
          }
        }

        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-15px) translateX(-10px); 
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MemberDashboard;