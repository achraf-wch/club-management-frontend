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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    if (user) {
      fetchUserClubAndMembers();
    }
  }, [user]);

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
      
      // ✅ FIX: Fetch user's club membership (president OR board)
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

      // Find board or president membership
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

      // ✅ Now fetch all members of that club
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
        
        // Refresh members list
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
      president: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '👑', label: 'Président' },
      board: { color: 'bg-white/20 text-white/80 border-white/30', icon: '💼', label: 'Bureau' },
      member: { color: 'bg-white/10 text-white/70 border-white/20', icon: '👤', label: 'Membre' }
    };
    return badges[role] || badges.member;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '✓', label: 'Actif' },
      inactive: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '✗', label: 'Inactif' },
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: '⏱', label: 'En attente' }
    };
    return badges[status] || badges.active;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-lg font-medium">{!user ? 'Chargement de l\'utilisateur...' : 'Chargement des membres...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Return Button */}
        <button
          onClick={() => navigate('/Bureaux/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl text-white transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Liste des Membres</h1>
                {userClub && (
                  <p className="text-white/70">Club: <span className="font-semibold text-red-400">{userClub.club_name}</span></p>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-red-600 shadow-md text-white' : 'text-white/60 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-red-600 shadow-md text-white' : 'text-white/60 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-500/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="font-semibold text-red-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {!userClub ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-12 text-center">
            <span className="text-7xl mb-4 block">🏢</span>
            <p className="text-white/70 text-lg">Vous devez être membre du bureau d'un club pour voir cette page.</p>
          </div>
        ) : (
          <>
            {/* Filter Panel */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, email, position..."
                      className="w-full px-4 py-3 pl-12 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                    <svg className="w-5 h-5 text-white/40 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-all cursor-pointer"
                  >
                    <option value="all" className="bg-gray-900">Tous les rôles</option>
                    <option value="president" className="bg-gray-900">Président</option>
                    <option value="board" className="bg-gray-900">Bureau</option>
                    <option value="member" className="bg-gray-900">Membre</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-all cursor-pointer"
                  >
                    <option value="all" className="bg-gray-900">Tous les statuts</option>
                    <option value="active" className="bg-gray-900">Actif</option>
                    <option value="inactive" className="bg-gray-900">Inactif</option>
                    <option value="pending" className="bg-gray-900">En attente</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-white/70">
                  <span className="font-bold text-red-400 text-lg">{filteredMembers.length}</span> membre{filteredMembers.length !== 1 ? 's' : ''}
                </p>
                {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}
                    className="text-sm text-red-400 hover:text-red-300 font-semibold"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>

            {/* Members Display */}
            {filteredMembers.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-12 text-center">
                <svg className="w-20 h-20 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-white/70 text-lg font-medium">Aucun membre trouvé</p>
                <p className="text-white/50 text-sm mt-2">Essayez de modifier vos filtres</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => {
                  const roleBadge = getRoleBadge(member.role);
                  const statusBadge = getStatusBadge(member.status);
                  
                  return (
                    <div
                      key={member.id}
                      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl hover:border-white/30 overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      onClick={() => handleViewMember(member)}
                    >
                      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center">
                        <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-3">
                          <span className="text-3xl font-bold text-red-600">
                            {member.first_name[0]}{member.last_name[0]}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{member.first_name} {member.last_name}</h3>
                        <p className="text-red-100 text-sm">{member.email}</p>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color} flex items-center gap-1`}>
                            <span>{roleBadge.icon}</span>
                            {roleBadge.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color} flex items-center gap-1`}>
                            <span>{statusBadge.icon}</span>
                            {statusBadge.label}
                          </span>
                        </div>

                        {member.position && (
                          <div className="text-center p-2 bg-white/5 rounded-lg">
                            <p className="text-xs text-white/50">Position</p>
                            <p className="font-semibold text-white">{member.position}</p>
                          </div>
                        )}

                        <div className="text-center text-xs text-white/50 pt-2 border-t border-white/10">
                          Membre depuis {new Date(member.joined_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </div>

                        {member.status === 'active' && member.role !== 'president' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(member);
                            }}
                            className="w-full py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-semibold text-sm"
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
              /* Table View - Keep the same as before */
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">Membre</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Rôle</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Position</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Statut</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredMembers.map((member) => {
                        const roleBadge = getRoleBadge(member.role);
                        const statusBadge = getStatusBadge(member.status);
                        
                        return (
                          <tr key={member.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-md">
                                  {member.first_name[0]}{member.last_name[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{member.first_name} {member.last_name}</p>
                                  {member.member_code && <p className="text-xs text-white/50">{member.member_code}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-white/70 text-sm">{member.email}</p>
                              {member.phone && <p className="text-xs text-white/50">{member.phone}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color} inline-flex items-center gap-1`}>
                                <span>{roleBadge.icon}</span>
                                {roleBadge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-white/70 text-sm">{member.position || '-'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color} inline-flex items-center gap-1`}>
                                <span>{statusBadge.icon}</span>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewMember(member)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Voir détails"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                {member.status === 'active' && member.role !== 'president' && (
                                  <button
                                    onClick={() => handleDeleteClick(member)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Retirer"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
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
      </div>

      {/* Member Details Modal - Keep same as before */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Détails du Membre</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedMember.first_name} {selectedMember.last_name}</h3>
                  <p className="text-white/60">{selectedMember.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const roleBadge = getRoleBadge(selectedMember.role);
                  const statusBadge = getStatusBadge(selectedMember.status);
                  
                  return (
                    <>
                      <div className="bg-white/5 p-4 rounded-xl">
                        <p className="text-white/50 text-sm mb-2">Rôle</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${roleBadge.color} inline-flex items-center gap-1`}>
                          <span>{roleBadge.icon}</span>
                          {roleBadge.label}
                        </span>
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl">
                        <p className="text-white/50 text-sm mb-2">Statut</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusBadge.color} inline-flex items-center gap-1`}>
                          <span>{statusBadge.icon}</span>
                          {statusBadge.label}
                        </span>
                      </div>
                    </>
                  );
                })()}

                {selectedMember.position && (
                  <div className="bg-white/5 p-4 rounded-xl col-span-2">
                    <p className="text-white/50 text-sm mb-1">Position</p>
                    <p className="font-semibold text-white">{selectedMember.position}</p>
                  </div>
                )}

                {selectedMember.phone && (
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-white/50 text-sm mb-1">Téléphone</p>
                    <p className="font-semibold text-white">{selectedMember.phone}</p>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-white/50 text-sm mb-1">Date d'adhésion</p>
                  <p className="font-semibold text-white">
                    {new Date(selectedMember.joined_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Fermer
                </button>
                {selectedMember.status === 'active' && selectedMember.role !== 'president' && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleDeleteClick(selectedMember);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Retirer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Keep same as before */}
      {showDeleteConfirm && memberToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-3xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 p-6 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Confirmation</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-white text-lg mb-4">
                Êtes-vous sûr de vouloir retirer <span className="font-bold">{memberToDelete.first_name} {memberToDelete.last_name}</span> du club ?
              </p>
              <p className="text-white/60 text-sm mb-6">
                Cette action changera le statut du membre en "inactif".
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMemberToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BureauxMembersList;