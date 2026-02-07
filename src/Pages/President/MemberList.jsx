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

  const API_BASE_URL = 'http://localhost:8000';

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
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    const styles = {
      president: 'bg-purple-100 text-purple-800',
      board: 'bg-indigo-100 text-indigo-800',
      secretary: 'bg-blue-100 text-blue-800',
      treasurer: 'bg-pink-100 text-pink-800',
      member: 'bg-gray-100 text-gray-800'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/President/Dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Membres</h1>
          <p className="text-gray-600 mt-2">Consultez et gérez les membres de tous les clubs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom, prénom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Club Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Club</label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les clubs</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Statut</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 text-lg">Aucun membre trouvé</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Club</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rôle</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div className="font-semibold text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.club_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(member.status)}`}>
                          {member.status === 'active' ? 'Actif' : member.status === 'inactive' ? 'Inactif' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => openModal(member)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Détails du Membre</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="block text-sm font-semibold text-gray-600 mb-1">Prénom</span>
                      <p className="text-gray-900">{selectedMember.first_name}</p>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-600 mb-1">Nom</span>
                      <p className="text-gray-900">{selectedMember.last_name}</p>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-gray-600 mb-1">Email</span>
                    <p className="text-gray-900">{selectedMember.email}</p>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-gray-600 mb-1">Téléphone</span>
                    <p className="text-gray-900">{selectedMember.phone || 'Non fourni'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="block text-sm font-semibold text-gray-600 mb-1">Club</span>
                      <p className="text-gray-900">{selectedMember.club_name}</p>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-600 mb-1">Statut</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedMember.status)}`}>
                        {selectedMember.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-gray-600 mb-2">Rôle</span>
                    <select
                      value={selectedMember.role}
                      onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="member">Membre</option>
                      <option value="board">Bureau</option>
                      <option value="secretary">Secrétaire</option>
                      <option value="treasurer">Trésorier</option>
                      <option value="president">Président</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-gray-600 mb-1">Membre depuis</span>
                    <p className="text-gray-900">
                      {new Date(selectedMember.joined_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => handleUpdateMemberRole(selectedMember.id, selectedMember.role)}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Mise à jour...' : 'Mettre à jour le rôle'}
                  </button>
                  <button
                    onClick={() => handleRemoveMember(selectedMember.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Suppression...' : 'Supprimer le membre'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresidentMembersList;