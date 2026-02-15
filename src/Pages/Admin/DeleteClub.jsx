import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageClubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setClubs(Array.isArray(data) ? data : []);
      } else {
        setError('Erreur lors du chargement des clubs');
      }
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clubId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Club supprimé avec succès!');
        setClubs(clubs.filter(club => club.id !== clubId));
        setDeleteConfirm(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Error deleting club:', err);
      setError('Erreur de connexion au serveur');
    }
  };

  const handleTogglePublic = async (club) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs/${club.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          is_public: !club.is_public
        })
      });

      if (response.ok) {
        const data = await response.json();
        setClubs(clubs.map(c => c.id === club.id ? data.club : c));
        setSuccess(`Club ${!club.is_public ? 'rendu public' : 'rendu privé'}!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Erreur lors de la modification');
      }
    } catch (err) {
      console.error('Error toggling public:', err);
      setError('Erreur de connexion au serveur');
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(clubs.map(c => c.category).filter(Boolean))];

  const getCategoryIcon = (category) => {
    const icons = {
      'culture': '🎭',
      'sport': '⚽',
      'tech': '💻',
      'art': '🎨',
      'science': '🔬',
      'social': '🤝'
    };
    return icons[category?.toLowerCase()] || '📚';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mb-4"></div>
          <p className="text-white text-xl font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au Dashboard
          </button>
        </div>
      </header>

      <div className="pt-24 px-8 pb-12 max-w-7xl mx-auto">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Gérer les Clubs</h1>
          <p className="text-gray-400 text-lg">{filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} trouvé{filteredClubs.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition"
            >
              <option value="" className="bg-gray-900">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-900">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/10">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-white text-xl font-semibold mb-2">Aucun club trouvé</p>
            <p className="text-gray-400 mb-6">Essayez de modifier vos filtres de recherche</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
              }}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
              >
                {/* Club Header with Cover */}
                <div className="h-32 bg-white/10 relative overflow-hidden">
                  {club.cover_image_url ? (
                    <img src={club.cover_image_url} alt={club.name} className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-30">{getCategoryIcon(club.category)}</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleTogglePublic(club)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm transition-all ${
                        club.is_public 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-white/10 text-gray-300 border border-white/20'
                      }`}
                    >
                      {club.is_public ? '🌍 Public' : '🔒 Privé'}
                    </button>
                  </div>
                </div>

                {/* Club Content */}
                <div className="p-6">
                  {/* Logo & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    {club.logo_url ? (
                      <img 
                        src={club.logo_url} 
                        alt={club.name} 
                        className="w-16 h-16 rounded-xl object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                        {getCategoryIcon(club.category)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{club.name}</h3>
                      <p className="text-sm text-gray-400">Code: {club.code}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white">
                      <span>{getCategoryIcon(club.category)}</span>
                      {club.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {club.description || 'Aucune description disponible.'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold text-white">{club.total_members || 0}</span>
                      <span>membres</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-white">{club.active_members || 0}</span>
                      <span>actifs</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/clubs/${club.id}`)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(club.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl font-semibold transition-all flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-3">Confirmer la suppression</h3>
            <p className="text-gray-400 text-center mb-8">
              Êtes-vous sûr de vouloir supprimer le club <span className="font-semibold text-white">{clubs.find(c => c.id === deleteConfirm)?.name}</span> ? 
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-float-delayed pointer-events-none"></div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
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

export default ManageClubs;