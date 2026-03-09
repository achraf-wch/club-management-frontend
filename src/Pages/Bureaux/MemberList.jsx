import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BureauxMembersList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [userClub, setUserClub] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    if (user) {
      fetchUserClubAndMembers();
    }
    
    // Synchroniser le dark mode avec la Navbar
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    };
    
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, [user]);

  useEffect(() => {
    // Initialiser le dark mode depuis le localStorage
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, searchQuery, roleFilter, statusFilter]);

  const fetchUserClubAndMembers = async () => {
    if (!user) {
      setErrorMessage('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const membershipResponse = await fetch(
        `${API_BASE_URL}/api/members?person_id=${user.id}&status=active`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!membershipResponse.ok) {
        throw new Error('Erreur lors de la récupération de votre adhésion');
      }

      const membershipData = await membershipResponse.json();
      console.log('✅ User membership data:', membershipData);

      const boardMembership = membershipData.find(m =>
        (m.role === 'board' || m.role === 'president') && m.status === 'active'
      );

      if (!boardMembership) {
        setErrorMessage('Vous devez être membre du bureau d\'un club pour voir cette page.');
        setLoading(false);
        return;
      }

      console.log('✅ Board membership found:', boardMembership);
      setUserClub(boardMembership);

      const membersResponse = await fetch(
        `${API_BASE_URL}/api/members?club_id=${boardMembership.club_id}`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!membersResponse.ok) {
        throw new Error('Erreur lors de la récupération des membres');
      }

      const membersData = await membersResponse.json();
      console.log('✅ Club members loaded:', membersData);
      setMembers(membersData);

    } catch (error) {
      console.error('❌ Error:', error);
      setErrorMessage(error.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.first_name.toLowerCase().includes(query) ||
        m.last_name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.position && m.position.toLowerCase().includes(query))
      );
    }

    setFilteredMembers(filtered);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${memberToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ leave_reason: 'Retiré par le bureau' })
      });

      if (response.ok) {
        setSuccessMessage(`✓ ${memberToDelete.first_name} ${memberToDelete.last_name} a été retiré avec succès`);

        if (userClub) {
          const membersResponse = await fetch(
            `${API_BASE_URL}/api/members?club_id=${userClub.club_id}`,
            {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            setMembers(membersData);
          }
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion au serveur');
    } finally {
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      president: {
        color: dm ? 'bg-red-900/40 text-red-300 border border-red-800/40' : 'bg-red-100 text-red-800',
        icon: '👑', label: 'Président'
      },
      board: {
        color: dm ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-indigo-100 text-indigo-800',
        icon: '💼', label: 'Bureau'
      },
      member: {
        color: dm ? 'bg-black/40 text-gray-400 border border-red-900/20' : 'bg-gray-100 text-gray-800',
        icon: '👤', label: 'Membre'
      }
    };
    return badges[role] || badges.member;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        color: dm ? 'bg-green-950/40 text-green-400 border border-green-900/40' : 'bg-green-100 text-green-800',
        icon: '✓', label: 'Actif'
      },
      inactive: {
        color: dm ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-red-100 text-red-800',
        icon: '✗', label: 'Inactif'
      },
      pending: {
        color: dm ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40' : 'bg-yellow-100 text-yellow-800',
        icon: '⏱', label: 'En attente'
      }
    };
    return badges[status] || badges.active;
  };

  const inputClass = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 placeholder-gray-400 focus:outline-none
    ${dm
      ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60'
      : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500'}`;

  const selectClass = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none
    ${dm
      ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60 [color-scheme:dark]'
      : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500'}`;

  if (loading || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-black' : ''}`}>
        <div className="text-center animate-pulse">
          <div className={`inline-block animate-spin rounded-full h-16 w-16 border-4 ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-500/30 border-t-red-500'}`}></div>
          <p className={`mt-4 text-lg ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{!user ? 'Chargement de l\'utilisateur...' : 'Chargement des membres...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Liste des <span className="text-red-500">Membres</span>
          </h1>
          {userClub && (
            <div className="flex items-center gap-3 mt-3">
              <p className={dm ? 'text-gray-400' : 'text-gray-500'}>
                Club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-500'}`}>{userClub.club_name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`rounded-2xl border p-6 animate-fadeIn ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-blue-500/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Membres</p>
                  <p className={`text-3xl font-bold mt-1 ${dm ? 'text-red-300' : 'text-white'}`}>{members.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 animate-bounce-slow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-6 animate-fadeIn ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-blue-500/20'}`} style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Actifs</p>
                  <p className={`text-3xl font-bold mt-1 ${dm ? 'text-red-300' : 'text-white'}`}>{members.filter(m => m.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-6 animate-fadeIn ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-blue-500/20'}`} style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Bureau</p>
                  <p className={`text-3xl font-bold mt-1 ${dm ? 'text-red-300' : 'text-white'}`}>{members.filter(m => m.role === 'board' || m.role === 'president').length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl shadow-lg animate-slideInLeft
            ${dm
              ? 'bg-green-950/40 border-green-700/40 text-green-300 shadow-green-900/20'
              : 'bg-gradient-to-r from-green-100 to-green-50 border-green-400 text-green-800 shadow-green-200'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl shadow-lg animate-slideInLeft
            ${dm
              ? 'bg-red-950/40 border-red-800/40 text-red-300 shadow-red-900/20'
              : 'bg-gradient-to-r from-red-100 to-red-50 border-red-400 text-red-800 shadow-red-200'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{errorMessage}</span>
            </div>
          </div>
        )}

        {!userClub ? (
          <div className={`rounded-2xl shadow-sm p-12 text-center border animate-fadeIn ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-6xl mb-4">🏢</div>
            <p className={`text-lg ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Vous devez être membre du bureau d'un club pour voir cette page.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className={`rounded-2xl shadow-sm p-6 mb-6 border animate-slideInLeft ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Rechercher</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nom, email, position..."
                    className={inputClass}
                  />
                </div>

                {/* Role Filter */}
                <div>
                  <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Rôle</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="president">Président</option>
                    <option value="board">Bureau</option>
                    <option value="member">Membre</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Statut</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t flex items-center justify-between ${dm ? 'border-red-900/20' : 'border-gray-200'}`}>
                <p className={dm ? 'text-gray-400' : 'text-gray-500'}>
                  <span className="font-bold text-red-500 text-lg">{filteredMembers.length}</span> membre{filteredMembers.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-4">
                  {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
                    <button
                      onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); }}
                      className={`text-sm font-semibold ${dm ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                  {/* View Mode Toggle */}
                  <div className={`flex items-center gap-1 p-1 rounded-lg ${dm ? 'bg-black/40' : 'bg-gray-200'}`}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded transition-all ${
                        viewMode === 'grid'
                          ? dm ? 'bg-red-900/40 text-red-300' : 'bg-white shadow text-gray-900'
                          : dm ? 'text-gray-600 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded transition-all ${
                        viewMode === 'table'
                          ? dm ? 'bg-red-900/40 text-red-300' : 'bg-white shadow text-gray-900'
                          : dm ? 'text-gray-600 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Display */}
            {filteredMembers.length === 0 ? (
              <div className={`rounded-2xl shadow-sm p-12 text-center border animate-fadeIn ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-6xl mb-4">👥</div>
                <p className={`text-lg mb-2 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Aucun membre trouvé</p>
                <p className={`text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Essayez de modifier vos filtres</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideInRight">
                {filteredMembers.map((member) => {
                  const roleBadge = getRoleBadge(member.role);
                  const statusBadge = getStatusBadge(member.status);

                  return (
                    <div
                      key={member.id}
                      className={`rounded-2xl shadow-md border overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer
                        ${dm
                          ? 'bg-[#0d0d18] border-red-900/20 hover:border-red-700/40 hover:shadow-red-900/30 hover:shadow-lg'
                          : 'bg-white border-gray-100 hover:shadow-lg hover:border-red-200'}`}
                      onClick={() => handleViewMember(member)}
                    >
                      <div className={`p-6 text-center ${dm ? 'bg-gradient-to-r from-red-950/60 to-black' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg mb-3 ${dm ? 'bg-black border-2 border-red-800/50' : 'bg-white'}`}>
                          <span className={`text-3xl font-bold ${dm ? 'text-red-400' : 'text-red-600'}`}>
                            {member.first_name[0]}{member.last_name[0]}
                          </span>
                        </div>
                        <h3 className={`text-xl font-bold ${dm ? 'text-red-300' : 'text-white'}`}>{member.first_name} {member.last_name}</h3>
                        <p className={`text-sm ${dm ? 'text-red-900' : 'text-red-100'}`}>{member.email}</p>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge.color} flex items-center gap-1`}>
                            <span>{roleBadge.icon}</span>
                            {roleBadge.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color} flex items-center gap-1`}>
                            <span>{statusBadge.icon}</span>
                            {statusBadge.label}
                          </span>
                        </div>

                        {member.position && (
                          <div className={`text-center p-2 rounded-lg ${dm ? 'bg-black/40 border border-red-900/20' : 'bg-gray-50'}`}>
                            <p className={`text-xs ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Position</p>
                            <p className={`font-semibold ${dm ? 'text-gray-300' : 'text-gray-800'}`}>{member.position}</p>
                          </div>
                        )}

                        <div className={`text-center text-xs pt-2 border-t ${dm ? 'text-gray-600 border-red-900/20' : 'text-gray-400 border-gray-100'}`}>
                          Membre depuis {new Date(member.joined_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </div>

                        {member.status === 'active' && member.role !== 'president' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(member); }}
                            className={`w-full py-2 rounded-lg transition-colors font-semibold text-sm border
                              ${dm
                                ? 'bg-red-950/30 text-red-400 border-red-900/40 hover:bg-red-950/50'
                                : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'}`}
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className={`rounded-2xl shadow-md overflow-hidden border animate-slideInRight ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={dm ? 'bg-gradient-to-r from-red-950/60 to-black border-b border-red-900/30' : 'bg-gradient-to-r from-red-600 to-red-700 border-b border-red-500/30'}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-sm font-bold ${dm ? 'text-red-300' : 'text-white'}`}>Membre</th>
                        <th className={`px-6 py-4 text-left text-sm font-bold ${dm ? 'text-red-300' : 'text-white'}`}>Contact</th>
                        <th className={`px-6 py-4 text-left text-sm font-bold ${dm ? 'text-red-300' : 'text-white'}`}>Rôle</th>
                        <th className={`px-6 py-4 text-left text-sm font-bold ${dm ? 'text-red-300' : 'text-white'}`}>Position</th>
                        <th className={`px-6 py-4 text-left text-sm font-bold ${dm ? 'text-red-300' : 'text-white'}`}>Statut</th>
                        <th className={`px-6 py-4 text-center text-sm font-bold ${dm ? 'text-red-300' : 'text-white'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member, index) => {
                        const roleBadge = getRoleBadge(member.role);
                        const statusBadge = getStatusBadge(member.status);

                        return (
                          <tr key={member.id}
                            className={`border-b transition-all duration-300 animate-fadeInUp
                              ${dm ? 'border-red-900/20 hover:bg-red-950/20' : 'border-gray-100 hover:bg-red-50'}`}
                            style={{ animationDelay: `${index * 0.05}s` }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow
                                  ${dm ? 'bg-gradient-to-br from-red-900 to-black border border-red-800/50' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                                  <span className={dm ? 'text-red-400' : 'text-white'}>{member.first_name[0]}{member.last_name[0]}</span>
                                </div>
                                <div>
                                  <p className={`font-semibold ${dm ? 'text-gray-200' : 'text-gray-900'}`}>{member.first_name} {member.last_name}</p>
                                  {member.member_code && <p className={`text-xs ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{member.member_code}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-600'}`}>{member.email}</p>
                              {member.phone && <p className={`text-xs ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{member.phone}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge.color} inline-flex items-center gap-1`}>
                                <span>{roleBadge.icon}</span>
                                {roleBadge.label}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-sm ${dm ? 'text-gray-400' : 'text-gray-600'}`}>{member.position || '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color} inline-flex items-center gap-1`}>
                                <span>{statusBadge.icon}</span>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewMember(member)}
                                  className={`font-semibold transition-all duration-300 hover:scale-110 text-sm ${dm ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                >
                                  Voir
                                </button>
                                {member.status === 'active' && member.role !== 'president' && (
                                  <button
                                    onClick={() => handleDeleteClick(member)}
                                    className={`font-semibold transition-all duration-300 hover:scale-110 text-sm ${dm ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                  >
                                    Retirer
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Member Details Modal */}
        {showModal && selectedMember && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
            <div className={`rounded-xl shadow-2xl max-w-lg w-full border-2 animate-scaleIn overflow-y-auto max-h-[90vh]
              ${dm ? 'bg-black border-red-900/40' : 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-red-500/30'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-white">
                    Détails du <span className="text-red-400">Membre</span>
                  </h2>
                  <button onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-red-400 transition-all duration-300 hover:rotate-90">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Prénom</span>
                      <p className="text-white font-medium">{selectedMember.first_name}</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Nom</span>
                      <p className="text-white font-medium">{selectedMember.last_name}</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Email</span>
                    <p className="text-white font-medium truncate">{selectedMember.email}</p>
                  </div>

                  {selectedMember.phone && (
                    <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Téléphone</span>
                      <p className="text-white font-medium">{selectedMember.phone}</p>
                    </div>
                  )}

                  {selectedMember.position && (
                    <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Position</span>
                      <p className="text-white font-medium">{selectedMember.position}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Rôle</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadge(selectedMember.role).color}`}>
                        {getRoleBadge(selectedMember.role).icon} {getRoleBadge(selectedMember.role).label}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Statut</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedMember.status).color}`}>
                        {getStatusBadge(selectedMember.status).label}
                      </span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Membre depuis</span>
                    <p className="text-white font-medium text-sm">
                      {new Date(selectedMember.joined_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="group flex-1 relative bg-gradient-to-r from-[#0f1d4a] via-[#162035] to-[#0f1d4a] text-white py-3 px-4 rounded-xl font-bold
                    hover:from-[#162035] hover:via-[#1e2a47] hover:to-[#162035] transition-all duration-300
                    shadow-lg shadow-blue-900/30 hover:scale-[1.02] border-2 border-blue-500/30 overflow-hidden text-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative z-10">Fermer</span>
                  </button>

                  {selectedMember.status === 'active' && selectedMember.role !== 'president' && (
                    <button
                      onClick={() => { setShowModal(false); handleDeleteClick(selectedMember); }}
                      className="group flex-1 relative bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-bold
                      hover:from-red-500 hover:to-red-600 transition-all duration-300
                      shadow-lg shadow-red-900/30 hover:scale-[1.02] border-2 border-red-500/30 overflow-hidden text-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <span className="relative z-10">Retirer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && memberToDelete && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
            <div className={`rounded-xl shadow-2xl max-w-md w-full border-2 animate-scaleIn
              ${dm ? 'bg-black border-red-900/40' : 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-red-500/30'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-white">
                    <span className="text-red-400">Confirmation</span>
                  </h2>
                  <button onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null); }}
                    className="text-gray-400 hover:text-red-400 transition-all duration-300 hover:rotate-90">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className={`p-4 rounded-xl border mb-4 ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-white/5 border-white/10'}`}>
                  <p className="text-white text-base mb-2">
                    Êtes-vous sûr de vouloir retirer <span className="font-bold text-red-400">{memberToDelete.first_name} {memberToDelete.last_name}</span> du club ?
                  </p>
                  <p className="text-gray-400 text-sm">
                    Cette action changera le statut du membre en "inactif".
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null); }}
                    className="group flex-1 relative bg-gradient-to-r from-[#0f1d4a] via-[#162035] to-[#0f1d4a] text-white py-3 px-4 rounded-xl font-bold
                    hover:from-[#162035] hover:via-[#1e2a47] hover:to-[#162035] transition-all duration-300
                    shadow-lg shadow-blue-900/30 hover:scale-[1.02] border-2 border-blue-500/30 overflow-hidden text-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative z-10">Annuler</span>
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="group flex-1 relative bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-bold
                    hover:from-red-500 hover:to-red-600 transition-all duration-300
                    shadow-lg shadow-red-900/30 hover:scale-[1.02] border-2 border-red-500/30 overflow-hidden text-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative z-10">Confirmer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
          .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
          .animate-slideInLeft { animation: slideInLeft 0.7s ease-out; }
          .animate-slideInRight { animation: slideInRight 0.7s ease-out; }
          .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
          .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
        `}</style>
      </div>
    </div>
  );
};

export default BureauxMembersList;