import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BoardDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Ajouter Membre',
      description: 'Ajouter un nouveau membre au club',
      icon: '👤➕',
      path: '/Bureaux/addMember',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'List Membre',
      description: 'Gérer et supprimer des membres',
      icon: '👤❌',
      path: '/Bureaux/MemberList',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Créer Événement',
      description: 'Organiser un nouvel événement',
      icon: '📅✨',
      path: '/Bureaux/createEvent',
      color: 'from-purple-500 to-purple-600'
    },
  
    {
      title: 'Rapports',
      description: 'Générer des rapports d\'activité',
      icon: '📊📈',
      path: '/Bureaux/reports',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de Bord Bureau
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenue, {user?.first_name} {user?.last_name}!
              </p>
            </div>
            <div className="flex gap-4">
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
                className="px-6 py-3 bg-white/80 backdrop-blur-lg hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">
            👋 Bonjour, {user?.first_name}!
          </h2>
          <p className="text-yellow-100 text-lg">
            En tant que membre du bureau, vous pouvez gérer les membres et les événements
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm">Rôle: <strong>{user?.role === 'board' ? 'Bureau' : user?.role}</strong></span>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm">Email: <strong>{user?.email}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden group"
            >
              <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
              <div className="p-6">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {item.description}
                </p>
                <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  Accéder
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Membres Actifs</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">--</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Événements ce Mois</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">--</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tâches en Cours</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">--</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Activité Récente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">📝</div>
              <div>
                <p className="font-semibold text-gray-800">Nouvelle inscription</p>
                <p className="text-sm text-gray-600">Un nouveau membre a rejoint le club</p>
              </div>
              <span className="ml-auto text-xs text-gray-500">Il y a 2h</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">📅</div>
              <div>
                <p className="font-semibold text-gray-800">Événement créé</p>
                <p className="text-sm text-gray-600">Nouveau workshop programmé</p>
              </div>
              <span className="ml-auto text-xs text-gray-500">Hier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardDashboard;