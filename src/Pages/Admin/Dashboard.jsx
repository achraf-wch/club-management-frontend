import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalMembers: 0,
    totalEvents: 0,
    activeUsers: 0
  });
  
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        credentials: 'include'
      });

      if (response.ok) {
        const clubsData = await response.json();
        const clubsList = Array.isArray(clubsData) ? clubsData : [];
        setClubs(clubsList);

        const totalClubs = clubsList.length;
        const totalMembers = clubsList.reduce((sum, club) => sum + (club.total_members || 0), 0);
        const activeUsers = clubsList.reduce((sum, club) => sum + (club.active_members || 0), 0);

        setStats({
          totalClubs,
          totalMembers,
          totalEvents: clubsList.reduce((sum, club) => sum + (club.events_count || 0), 0),
          activeUsers
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: 'Créer Club',
      description: 'Ajouter un nouveau club à la plateforme',
      icon: '🏛️',
      path: '/admin/addClub',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Ajouter Président',
      description: 'Assigner un président à un club',
      icon: '👔',
      path: '/admin/addPresident',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Gérer Clubs',
      description: 'Modifier ou archiver des clubs',
      icon: '⚙️',
      path: '/admin/deleteClub',
      color: 'from-orange-500 to-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-spin mb-4">
            <div className="w-12 h-12 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg font-semibold">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm mt-1">Gestion complète de la plateforme</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-gray-500">Administrateur</p>
            </div>
            <button
              onClick={() => navigate('/Login/AccountSetup')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Compléter mon profil
            </button>
            <button
              onClick={logout}
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Clubs', value: stats.totalClubs, icon: '🏛️', color: 'bg-blue-50 border-blue-200' },
            { label: 'Membres', value: stats.totalMembers, icon: '👥', color: 'bg-green-50 border-green-200' },
            { label: 'Utilisateurs Actifs', value: stats.activeUsers, icon: '⚡', color: 'bg-purple-50 border-purple-200' },
            { label: 'Événements', value: stats.totalEvents, icon: '📅', color: 'bg-orange-50 border-orange-200' }
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.color} border rounded-2xl p-6 transition-all hover:shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <span className="text-4xl opacity-50">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className={`group bg-gradient-to-br ${action.color} rounded-2xl p-8 text-white transition-all hover:shadow-2xl hover:scale-105 cursor-pointer`}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{action.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-left">{action.title}</h3>
                <p className="text-white/90 text-sm text-left mb-4">{action.description}</p>
                <div className="flex items-center text-white font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  Accéder
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Clubs Table */}
        {clubs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">📚</span>
              Clubs Récents
            </h2>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nom du Club</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Catégorie</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Membres</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actifs</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clubs.slice(0, 8).map((club) => (
                      <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{club.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{club.category || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{club.total_members || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{club.active_members || 0}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            club.is_public 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {club.is_public ? '🌍 Public' : '🔒 Privé'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {clubs.length > 8 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Et {clubs.length - 8} autres clubs...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {clubs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-semibold">Aucun club créé</p>
            <p className="text-gray-500 mt-2">Commencez par créer votre premier club</p>
            <button
              onClick={() => navigate('/admin/addClub')}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Créer un Club
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;