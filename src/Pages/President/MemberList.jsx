import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentMembersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMyClub();
    fetchMembers(); // Fetch members immediately, the backend filters by president's club
  }, []);

  useEffect(() => {
    if (filter !== 'all') {
      fetchMembers();
    }
  }, [filter]);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Club loaded:', data);
        setClub(data);
      } else {
        console.error('Failed to fetch club');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Use the /api/members endpoint which is already filtered by president's club in the backend
      const response = await fetch(`${API_BASE_URL}/api/members`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Members loaded:', data);
        setMembers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch members', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('Membre supprimé avec succès');
        setShowModal(false);
        fetchMembers();
      } else {
        alert('Erreur lors de la suppression du membre');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Erreur de connexion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole, newPosition) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          role: newRole,
          position: newPosition || null
        })
      });

      if (response.ok) {
        alert('Rôle mis à jour avec succès');
        setShowModal(false);
        fetchMembers();
      } else {
        alert('Erreur lors de la mise à jour du rôle');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Erreur de connexion');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || member.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      inactive: 'bg-red-500/20 text-red-300 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };
    return styles[status] || 'bg-white/10 text-white/70 border-white/20';
  };

  const getRoleBadge = (role) => {
    const styles = {
      president: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      board: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      member: 'bg-white/10 text-white/70 border-white/20'
    };
    return styles[role] || 'bg-white/10 text-white/70 border-white/20';
  };

  const getRoleLabel = (role) => {
    const labels = {
      president: 'Président',
      board: 'Bureau',
      member: 'Membre'
    };
    return labels[role] || role;
  };

  const openModal = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-40 h-40 bg-red-500/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-32 left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/President/Dashboard')}
            className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Gestion des Membres</h1>
          {club && (
            <div className="flex items-center gap-3 mt-4">
              {club.logo_url && (
                <img src={club.logo_url} alt={club.name} className="w-8 h-8 rounded-full object-cover" />
              )}
              <p className="text-white/70">
                Membres de votre club: <span className="font-semibold text-white">{club.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-white font-semibold mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom, prénom, email ou position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-white font-semibold mb-2">Statut</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all" className="bg-slate-800">Tous</option>
                <option value="active" className="bg-slate-800">Actifs</option>
                <option value="inactive" className="bg-slate-800">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {club && members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-lg rounded-xl border border-blue-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-semibold">Total Membres</p>
                  <p className="text-3xl font-bold text-white mt-1">{members.length}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl border border-green-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-semibold">Actifs</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {members.filter(m => m.status === 'active').length}
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-semibold">Bureau</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {members.filter(m => m.role === 'board' || m.role === 'president').length}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-white/70 mt-4">Chargement...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-white/70 text-lg mb-4">Aucun membre trouvé</p>
            <button
              onClick={() => navigate('/President/AddMember')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
            >
              Ajouter un membre
            </button>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Position</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Rôle</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div className="font-semibold text-white">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {member.position || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(member.status)}`}>
                          {member.status === 'active' ? 'Actif' : member.status === 'inactive' ? 'Inactif' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => openModal(member)}
                          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Member Details Modal */}
        {showModal && selectedMember && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Détails du Membre</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="block text-sm font-semibold text-white/70 mb-1">Prénom</span>
                      <p className="text-white">{selectedMember.first_name}</p>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-white/70 mb-1">Nom</span>
                      <p className="text-white">{selectedMember.last_name}</p>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-white/70 mb-1">Email</span>
                    <p className="text-white">{selectedMember.email}</p>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-white/70 mb-1">Téléphone</span>
                    <p className="text-white">{selectedMember.phone || 'Non fourni'}</p>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-white/70 mb-1">CNE</span>
                    <p className="text-white">{selectedMember.cne || 'Non fourni'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="block text-sm font-semibold text-white/70 mb-1">Statut</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedMember.status)}`}>
                        {selectedMember.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-white/70 mb-1">Membre depuis</span>
                      <p className="text-white">
                        {new Date(selectedMember.joined_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-white/70 mb-2">Rôle</span>
                    <select
                      value={selectedMember.role}
                      onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="member" className="bg-slate-800">Membre</option>
                      <option value="board" className="bg-slate-800">Bureau</option>
                      {user?.clubRole === 'president' && (
                        <option value="president" className="bg-slate-800">Président</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-white/70 mb-2">Position</span>
                    <input
                      type="text"
                      value={selectedMember.position || ''}
                      onChange={(e) => setSelectedMember({ ...selectedMember, position: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Trésorier, Secrétaire, Membre actif..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => handleUpdateMemberRole(selectedMember.id, selectedMember.role, selectedMember.position)}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                  >
                    {actionLoading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                  {selectedMember.role !== 'president' && (
                    <button
                      onClick={() => handleRemoveMember(selectedMember.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                    >
                      {actionLoading ? 'Suppression...' : 'Supprimer'}
                    </button>
                  )}
                </div>
              </div>
            </div>
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

export default PresidentMembersList;