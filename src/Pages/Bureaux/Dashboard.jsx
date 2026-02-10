import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BoardDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMyClub();
  }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
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

  const menuItems = [
    {
      title: 'Ajouter Membre',
      description: 'Envoyer une demande pour ajouter un nouveau membre',
      icon: '👤',
      emoji: '➕',
      path: '/Bureaux/addMember',
      color: 'from-blue-600 to-cyan-500',
      bgPattern: 'bg-blue-50'
    },
    {
      title: 'Liste Membres',
      description: 'Consulter et gérer les membres du club',
      icon: '👥',
      emoji: '📋',
      path: '/Bureaux/MemberList',
      color: 'from-indigo-600 to-purple-500',
      bgPattern: 'bg-indigo-50'
    },
    {
      title: 'Créer Événement',
      description: 'Proposer un nouvel événement au président',
      icon: '📅',
      emoji: '✨',
      path: '/Bureaux/createEvent',
      color: 'from-purple-600 to-pink-500',
      bgPattern: 'bg-purple-50'
    },
    {
      title: 'Rapports',
      description: 'Générer et consulter les rapports d\'activité',
      icon: '📊',
      emoji: '📈',
      path: '/Bureaux/reports',
      color: 'from-pink-600 to-rose-500',
      bgPattern: 'bg-pink-50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-200/10 to-blue-200/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Bureau Dashboard
                </h1>
                <p className="text-sm text-gray-600">Espace Membre Bureau</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/Bureaux')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => navigate('/Login/AccountSetup')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Banner */}
        <div className="mb-12 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">👋</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  Bonjour, {user?.first_name}!
                </h2>
                <p className="text-gray-600">
                  Membre du Bureau {club ? `• ${club.name}` : ''}
                </p>
              </div>
            </div>
            {club && club.logo_url && (
              <img src={club.logo_url} alt={club.name} className="w-16 h-16 rounded-full object-cover shadow-md" />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{club?.total_members || '--'}</p>
                <p className="text-sm text-gray-500">Membres</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">--</p>
                <p className="text-sm text-gray-500">Événements</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">--</p>
                <p className="text-sm text-gray-500">Tâches</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${item.bgPattern} rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-800 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">{item.emoji}</span>
                  </div>
                  
                  <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Accéder
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              Activité Récente
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">📝</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">Nouvelle inscription</p>
                  <p className="text-xs text-gray-600">Il y a 2h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">Événement créé</p>
                  <p className="text-xs text-gray-600">Hier</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Conseils Rapides
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                <span className="text-xl">✨</span>
                <p className="text-sm text-gray-700">Vérifiez régulièrement les demandes en attente</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <span className="text-xl">🎯</span>
                <p className="text-sm text-gray-700">Organisez des événements pour dynamiser le club</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardDashboard;