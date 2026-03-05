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
    fetchMembers();
  }, []);

  useEffect(() => {
    if (filter !== 'all') fetchMembers();
  }, [filter]);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setClub(data);
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/members`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : []);
      } else {
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole, position: newPosition || null })
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
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    const styles = {
      president: 'bg-red-100 text-red-800',
      board: 'bg-indigo-100 text-indigo-800',
      member: 'bg-gray-100 text-gray-800'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const labels = { president: 'Président', board: 'Bureau', member: 'Membre' };
    return labels[role] || role;
  };

  const openModal = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const inputClass = `w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-lg 
    focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-400`;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <h1 className="text-4xl font-bold text-gray-900">
            Gestion des <span className="text-red-500">Membres</span>
          </h1>
          {club && (
            <div className="flex items-center gap-3 mt-3">
              {club.logo_url && (
                <img src={club.logo_url} alt={club.name} className="w-8 h-8 rounded-full object-cover border-2 border-red-500/50" />
              )}
              <p className="text-gray-500">
                Membres de votre club: <span className="font-semibold text-red-500">{club.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] rounded-2xl border border-blue-500/20 p-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Membres</p>
                  <p className="text-3xl font-bold text-white mt-1">{members.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 animate-bounce-slow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] rounded-2xl border border-blue-500/20 p-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Actifs</p>
                  <p className="text-3xl font-bold text-white mt-1">{members.filter(m => m.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] rounded-2xl border border-blue-500/20 p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Bureau</p>
                  <p className="text-3xl font-bold text-white mt-1">{members.filter(m => m.role === 'board' || m.role === 'president').length}</p>
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

        {/* Filters */}
        <div className="bg-gray-50 rounded-2xl shadow-sm p-6 mb-6 border border-gray-200 animate-slideInLeft">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rechercher</label>
              <input type="text" placeholder="Nom, prénom, email ou position..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Statut</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300">
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members Table */}
        {loading ? (
          <div className="text-center py-12 animate-pulse">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-500/30 border-t-red-500"></div>
            <p className="text-gray-500 mt-4 text-lg">Chargement...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl shadow-sm p-12 text-center border border-gray-200 animate-fadeIn">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg mb-4">Aucun membre trouvé</p>
            <button onClick={() => navigate('/President/addMember')}
              className="group relative bg-gradient-to-r from-[#0f1d4a] via-[#162035] to-[#0f1d4a] text-white py-3 px-6 rounded-xl font-bold
              hover:from-[#162035] hover:via-[#1e2a47] hover:to-[#162035] transition-all duration-300
              shadow-lg shadow-blue-900/20 hover:scale-[1.02] border-2 border-red-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="relative z-10">Ajouter un membre</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 animate-slideInRight">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-red-600 to-red-700 border-b border-red-500/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Position</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Rôle</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => (
                    <tr key={member.id}
                      className="border-b border-gray-100 hover:bg-red-50 transition-all duration-300 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.position || '-'}</td>
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
                        <button onClick={() => openModal(member)}
                          className="text-red-500 hover:text-red-700 font-semibold transition-all duration-300 hover:scale-110 inline-block">
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

        {/* Modal */}
        {showModal && selectedMember && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
            <div className="bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] rounded-xl shadow-2xl max-w-lg w-full border-2 border-red-500/30 animate-scaleIn overflow-y-auto max-h-[90vh]">
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
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Prénom</span>
                      <p className="text-white font-medium">{selectedMember.first_name}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Nom</span>
                      <p className="text-white font-medium">{selectedMember.last_name}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Email</span>
                    <p className="text-white font-medium truncate">{selectedMember.email}</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Téléphone</span>
                    <p className="text-white font-medium">{selectedMember.phone || 'Non fourni'}</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="block text-xs font-semibold text-gray-400 mb-1">CNE</span>
                    <p className="text-white font-medium">{selectedMember.cne || 'Non fourni'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Statut</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedMember.status)}`}>
                        {selectedMember.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="block text-xs font-semibold text-gray-400 mb-1">Membre depuis</span>
                      <p className="text-white font-medium text-sm">
                        {new Date(selectedMember.joined_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Rôle</label>
                    <select value={selectedMember.role}
                      onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                      <option value="member">Membre</option>
                      <option value="board">Bureau</option>
                      {user?.clubRole === 'president' && <option value="president">Président</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Position</label>
                    <input type="text"
                      value={selectedMember.position || ''}
                      onChange={(e) => setSelectedMember({ ...selectedMember, position: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-400"
                      placeholder="Ex: Trésorier, Secrétaire..." />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleUpdateMemberRole(selectedMember.id, selectedMember.role, selectedMember.position)}
                    disabled={actionLoading}
                    className="group flex-1 relative bg-gradient-to-r from-[#0f1d4a] via-[#162035] to-[#0f1d4a] text-white py-3 px-4 rounded-xl font-bold
                    hover:from-[#162035] hover:via-[#1e2a47] hover:to-[#162035] transition-all duration-300 disabled:opacity-50
                    shadow-lg shadow-blue-900/30 hover:scale-[1.02] border-2 border-blue-500/30 overflow-hidden text-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative z-10">{actionLoading ? 'Mise à jour...' : 'Mettre à jour'}</span>
                  </button>

                  {selectedMember.role !== 'president' && (
                    <button
                      onClick={() => handleRemoveMember(selectedMember.id)}
                      disabled={actionLoading}
                      className="group flex-1 relative bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-bold
                      hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:opacity-50
                      shadow-lg shadow-red-900/30 hover:scale-[1.02] border-2 border-red-500/30 overflow-hidden text-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <span className="relative z-10">{actionLoading ? 'Suppression...' : 'Supprimer'}</span>
                    </button>
                  )}
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

export default PresidentMembersList;