import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentMembersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');
  const [clubs, setClubs] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://localhost:8000';

  useEffect(() => {
    fetchClubs();
    fetchMembers();
  }, [filter, selectedClub]);

  const fetchClubs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        credentials: 'include'
      });
      const data = await response.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/members`, {
        credentials: 'include'
      });
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
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

  const handleUpdateMemberRole = async (memberId, newRole) => {
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
          role: newRole
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
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClub = selectedClub === 'all' || member.club_id === parseInt(selectedClub);
    
    return matchesSearch && matchesClub;
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
      secretary: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      treasurer: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      member: 'bg-white/10 text-white/70 border-white/20'
    };
    return styles[role] || 'bg-white/10 text-white/70 border-white/20';
  };

  const getRoleLabel = (role) => {
    const labels = {
      president: 'Président',
      board: 'Bureau',
      secretary: 'Secrétaire',
      treasurer: 'Trésorier',
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
          <p className="text-white/70">Consultez et gérez les membres de tous les clubs</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-white font-semibold mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom, prénom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Club Filter */}
            <div>
              <label className="block text-white font-semibold mb-2">Club</label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all" className="bg-slate-800">Tous les clubs</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id} className="bg-slate-800">{club.name}</option>
                ))}
              </select>
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

        {/* Members List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-white/70 mt-4">Chargement...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-white/70 text-lg">Aucun membre trouvé</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Club</th>
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
                        {member.club_name}
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
                          Voir
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
            <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full">
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

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="block text-sm font-semibold text-white/70 mb-1">Club</span>
                      <p className="text-white">{selectedMember.club_name}</p>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-white/70 mb-1">Statut</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedMember.status)}`}>
                        {selectedMember.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
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
                      <option value="secretary" className="bg-slate-800">Secrétaire</option>
                      <option value="treasurer" className="bg-slate-800">Trésorier</option>
                      <option value="president" className="bg-slate-800">Président</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-white/70 mb-1">Membre depuis</span>
                    <p className="text-white">
                      {new Date(selectedMember.joined_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => handleUpdateMemberRole(selectedMember.id, selectedMember.role)}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                  >
                    {actionLoading ? 'Mise à jour...' : 'Mettre à jour le rôle'}
                  </button>
                  <button
                    onClick={() => handleRemoveMember(selectedMember.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                  >
                    {actionLoading ? 'Suppression...' : 'Supprimer le membre'}
                  </button>
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