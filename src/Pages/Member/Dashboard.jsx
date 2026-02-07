import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const [memberInfo, setMemberInfo] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://localhost:8000';

  useEffect(() => {
    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching member data for user:', user.id);

      // Fetch member club info
      const clubResponse = await fetch(`${API_BASE_URL}/api/my-club-membership`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      console.log('📥 Club response status:', clubResponse.status);

      if (clubResponse.ok) {
        const clubData = await clubResponse.json();
        console.log('✅ Club data:', clubData);
        setClubInfo(clubData.club);
        setMemberInfo(clubData.membership);
      } else {
        console.warn('⚠️ No club membership found');
      }

      // Fetch attended events (scanned tickets)
      const ticketsResponse = await fetch(
        `${API_BASE_URL}/api/tickets?person_id=${user.id}&status=scanned`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      console.log('📥 Tickets response status:', ticketsResponse.status);

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        console.log('✅ Attended events:', ticketsData);
        setAttendedEvents(ticketsData);
      } else {
        console.warn('⚠️ No tickets found');
        setAttendedEvents([]);
      }

    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getMemberLevel = (eventCount) => {
    if (eventCount >= 10) return { name: 'Gold', emoji: '🥇', color: 'from-yellow-400 to-yellow-600' };
    if (eventCount >= 5) return { name: 'Silver', emoji: '🥈', color: 'from-gray-300 to-gray-500' };
    return { name: 'Bronze', emoji: '🥉', color: 'from-orange-400 to-orange-600' };
  };

  const level = getMemberLevel(attendedEvents.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de votre carte membre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              👋 Bonjour, {user?.first_name}!
            </h1>
            <p className="text-gray-600 text-lg">Votre Carte Digitale Membre</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>

        {/* Digital Member Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-start justify-between mb-6">
            {/* Club Logo */}
            <div>
              {clubInfo?.logo_url ? (
                <img
                  src={clubInfo.logo_url}
                  alt={clubInfo.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-4xl">
                  🎓
                </div>
              )}
            </div>
            
            {/* Card Type */}
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1 uppercase tracking-wider">Carte Membre</p>
              <p className="text-2xl font-bold">{clubInfo?.name || 'Club Member'}</p>
            </div>
          </div>

          {/* Member Info */}
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm opacity-75 uppercase tracking-wide">Nom Complet</p>
              <p className="text-3xl font-bold">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-75 uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium break-all">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 uppercase tracking-wide">Rôle</p>
                <p className="text-sm font-medium capitalize">
                  {memberInfo?.role === 'president' && '👑 Président'}
                  {memberInfo?.role === 'board' && '👔 Bureau'}
                  {memberInfo?.role === 'member' && '👤 Membre'}
                  {!memberInfo?.role && '👤 Membre'}
                </p>
              </div>
            </div>

            {memberInfo?.position && (
              <div>
                <p className="text-sm opacity-75 uppercase tracking-wide">Position</p>
                <p className="text-sm font-medium">{memberInfo.position}</p>
              </div>
            )}

            {memberInfo?.joined_at && (
              <div>
                <p className="text-sm opacity-75 uppercase tracking-wide">Membre depuis</p>
                <p className="text-sm font-medium">
                  {new Date(memberInfo.joined_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Events Counter */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-4xl mr-4">🎫</span>
              <div>
                <p className="text-sm opacity-90">Événements Assistés</p>
                <p className="text-3xl font-bold">{attendedEvents.length}</p>
              </div>
            </div>
            <div className="text-5xl">{level.emoji}</div>
          </div>
        </div>

        {/* Club Information */}
        {clubInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-3xl mr-3">🏢</span>
              Informations du Club
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase">Nom du Club</p>
                  <p className="text-lg font-bold text-gray-900">{clubInfo.name}</p>
                </div>
                {clubInfo.category && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase">Catégorie</p>
                    <p className="text-lg text-gray-800">{clubInfo.category}</p>
                  </div>
                )}
              </div>
              {clubInfo.description && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{clubInfo.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attended Events History */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">📅</span>
            Historique de Participation
          </h2>

          {attendedEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 text-lg mb-2">Aucun événement assisté pour le moment</p>
              <p className="text-gray-500">Vos événements apparaîtront ici après validation de votre ticket</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendedEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">🎉</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      ✓ Assisté
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {event.event_title}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">📅</span>
                      <span>
                        {new Date(event.event_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {event.event_location && (
                      <div className="flex items-center text-gray-700">
                        <span className="mr-2">📍</span>
                        <span className="truncate">{event.event_location}</span>
                      </div>
                    )}
                    
                    {event.club_name && (
                      <div className="flex items-center text-gray-700">
                        <span className="mr-2">🏢</span>
                        <span className="truncate">{event.club_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600 mt-3 pt-3 border-t border-gray-300">
                      <span className="mr-2">⏰</span>
                      <span className="text-xs">
                        Scanné le {new Date(event.scanned_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {attendedEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-sm opacity-90 mb-1 uppercase tracking-wide">Total Événements</p>
              <p className="text-4xl font-bold">{attendedEvents.length}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-sm opacity-90 mb-1 uppercase tracking-wide">Taux de Participation</p>
              <p className="text-4xl font-bold">100%</p>
            </div>

            <div className={`bg-gradient-to-br ${level.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
              <div className="text-4xl mb-3">{level.emoji}</div>
              <p className="text-sm opacity-90 mb-1 uppercase tracking-wide">Niveau Membre</p>
              <p className="text-3xl font-bold">{level.name}</p>
              <p className="text-xs opacity-75 mt-1">
                {attendedEvents.length < 5 && `${5 - attendedEvents.length} événements pour Silver`}
                {attendedEvents.length >= 5 && attendedEvents.length < 10 && `${10 - attendedEvents.length} événements pour Gold`}
                {attendedEvents.length >= 10 && 'Niveau maximum atteint!'}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;