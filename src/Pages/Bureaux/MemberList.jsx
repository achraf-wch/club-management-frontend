  import React, { useState, useEffect } from 'react';

const BureauxMembersList = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  // Mock user - replace with actual auth
  const user = { id: 1, first_name: 'Ahmed', last_name: 'Benali' };

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://127.0.0.1:8000';

  useEffect(() => {
    fetchUserClub();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, searchQuery, roleFilter, statusFilter]);

  const fetchUserClub = async () => {
    try {
      // Get clubs where user is board member
      const response = await fetch(`${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`);
      if (response.ok) {
        const data = await response.json();
        setUserClubs(data);
        if (data.length > 0) {
          fetchMembers(data[0].club_id);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching club:', error);
      setErrorMessage('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  const fetchMembers = async (clubId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/members?club_id=${clubId}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setErrorMessage('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }

    // Search query
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leave_reason: 'Retiré par le bureau'
        })
      });

      if (response.ok) {
        setSuccessMessage(`✓ ${memberToDelete.first_name} ${memberToDelete.last_name} a été retiré avec succès`);
        
        // Refresh members list
        if (userClubs.length > 0) {
          fetchMembers(userClubs[0].club_id);
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      setErrorMessage('Erreur de connexion au serveur');
    } finally {
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'president': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'board': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'member': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'president': return 'Président';
      case 'board': return 'Bureau';
      case 'member': return 'Membre';
      default: return role;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 text-lg">Chargement des membres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            Liste des Membres
          </h1>
          {userClubs.length > 0 && (
            <p className="text-gray-600 text-lg">
              Club: <span className="font-semibold text-orange-600">{userClubs[0].club_name}</span>
            </p>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-500 text-green-700 px-6 py-4 rounded-xl backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-bold">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500 text-red-700 px-6 py-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold">{errorMessage}</p>
            </div>
          </div>
        )}

        {userClubs.length === 0 ? (
          <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-xl">
            <p className="font-semibold">Vous devez être membre du bureau d'un club pour voir cette page.</p>
          </div>
        ) : (
          <>
            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Rechercher
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nom, email, position..."
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Rôle
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="all">Tous</option>
                    <option value="president">Président</option>
                    <option value="board">Bureau</option>
                    <option value="member">Membre</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  <span className="font-bold text-orange-600">{filteredMembers.length}</span> membre{filteredMembers.length !== 1 ? 's' : ''} trouvé{filteredMembers.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Members List */}
            {filteredMembers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-orange-200">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 text-lg">Aucun membre trouvé</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">Membre</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Rôle</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Position</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Statut</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Adhésion</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-orange-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                                {member.first_name[0]}{member.last_name[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{member.first_name} {member.last_name}</p>
                                {member.member_code && (
                                  <p className="text-xs text-gray-500">{member.member_code}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-700">{member.email}</p>
                            {member.phone && (
                              <p className="text-xs text-gray-500">{member.phone}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(member.role)}`}>
                              {getRoleLabel(member.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-700">{member.position || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(member.status)}`}>
                              {getStatusLabel(member.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-700 text-sm">
                              {new Date(member.joined_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewMember(member)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Voir les détails"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {member.status === 'active' && member.role !== 'president' && (
                                <button
                                  onClick={() => handleDeleteClick(member)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Retirer le membre"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Member Details Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white">
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

            <div className="p-6 space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h3>
                  <p className="text-gray-600">{selectedMember.email}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm mb-1">Rôle</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor(selectedMember.role)}`}>
                    {getRoleLabel(selectedMember.role)}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeColor(selectedMember.status)}`}>
                    {getStatusLabel(selectedMember.status)}
                  </span>
                </div>

                {selectedMember.position && (
                  <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                    <p className="text-gray-500 text-sm mb-1">Position</p>
                    <p className="font-semibold text-gray-900">{selectedMember.position}</p>
                  </div>
                )}

                {selectedMember.phone && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-500 text-sm mb-1">Téléphone</p>
                    <p className="font-semibold text-gray-900">{selectedMember.phone}</p>
                  </div>
                )}

                {selectedMember.member_code && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-500 text-sm mb-1">Code Membre</p>
                    <p className="font-semibold text-gray-900">{selectedMember.member_code}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm mb-1">Date d'adhésion</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedMember.joined_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {selectedMember.left_at && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-500 text-sm mb-1">Date de départ</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedMember.left_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
                {selectedMember.status === 'active' && selectedMember.role !== 'president' && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleDeleteClick(selectedMember);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Retirer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && memberToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-red-500 p-6 text-white rounded-t-2xl">
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
              <p className="text-gray-700 text-lg mb-4">
                Êtes-vous sûr de vouloir retirer <span className="font-bold text-gray-900">{memberToDelete.first_name} {memberToDelete.last_name}</span> du club ?
              </p>
              <p className="text-gray-600 text-sm mb-6">
                Cette action changera le statut du membre en "inactif". Le membre ne sera pas supprimé de la base de données.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMemberToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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