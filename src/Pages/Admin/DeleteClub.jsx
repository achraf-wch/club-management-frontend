import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar';

const ManageClubs = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const dm = darkMode;

  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`, { credentials: 'include' });
      if (response.ok) { const data = await response.json(); setClubs(Array.isArray(data) ? data : []); }
      else setError('Erreur lors du chargement des clubs');
    } catch (err) { setError('Erreur de connexion au serveur'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (clubId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        setSuccess('Club supprimé avec succès!');
        setClubs(clubs.filter(club => club.id !== clubId));
        setDeleteConfirm(null);
        setTimeout(() => setSuccess(''), 3000);
      } else { const data = await response.json(); setError(data.message || 'Erreur lors de la suppression'); }
    } catch (err) { setError('Erreur de connexion au serveur'); }
  };

  const handleTogglePublic = async (club) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs/${club.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ is_public: !club.is_public })
      });
      if (response.ok) {
        const data = await response.json();
        setClubs(clubs.map(c => c.id === club.id ? data.club : c));
        setSuccess(`Club ${!club.is_public ? 'rendu public' : 'rendu privé'}!`);
        setTimeout(() => setSuccess(''), 3000);
      } else setError('Erreur lors de la modification');
    } catch (err) { setError('Erreur de connexion au serveur'); }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(clubs.map(c => c.category).filter(Boolean))];
  const getCategoryIcon = (category) => ({ culture: '🎭', sport: '⚽', tech: '💻', art: '🎨', science: '🔬', social: '🤝' })[category?.toLowerCase()] || '📚';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-[#020617]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className={`text-xl font-semibold ${dm ? 'text-white' : 'text-gray-800'}`}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${dm ? 'bg-[#020617]' : 'bg-gray-50'}`}>
      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 relative pt-32">


        <div className="pt-8 px-8 pb-12 max-w-7xl mx-auto">

          {success && (
            <div className={`mb-6 px-6 py-4 rounded-2xl flex items-center gap-3 ${dm ? 'bg-blue-900/40 border border-blue-500/30 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {success}
            </div>
          )}
          {error && (
            <div className={`mb-6 px-6 py-4 rounded-2xl flex items-center gap-3 ${dm ? 'bg-red-900/40 border border-red-500/30 text-red-300' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-3">
              <span className={dm ? 'text-white' : 'text-gray-900'}>Gérer les </span>
              <span className="text-red-500">Clubs</span>
            </h1>
            <p className={`text-lg ${dm ? 'text-gray-400' : 'text-gray-400'}`}>{filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} trouvé{filteredClubs.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Search */}
          <div className={`mb-8 rounded-2xl p-6 border shadow-sm ${dm ? 'bg-[#050F1E] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" placeholder="Rechercher un club..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none transition ${dm ? 'bg-[#0a1628] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition ${dm ? 'bg-[#0a1628] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                <option value="">Toutes les catégories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Clubs Grid */}
          {filteredClubs.length === 0 ? (
            <div className={`rounded-2xl p-12 text-center border shadow-sm ${dm ? 'bg-[#050F1E] border-white/10' : 'bg-white border-gray-200'}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className={`text-xl font-semibold mb-2 ${dm ? 'text-white' : 'text-gray-800'}`}>Aucun club trouvé</p>
              <p className="text-gray-400 mb-6">Essayez de modifier vos filtres de recherche</p>
              <button onClick={() => { setSearchTerm(''); setCategoryFilter(''); }} className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-all">Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div key={club.id} className={`rounded-2xl overflow-hidden border hover:border-blue-700/50 transition-all shadow-sm ${dm ? 'bg-[#050F1E] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className={`h-32 relative overflow-hidden ${dm ? 'bg-white/5' : 'bg-gray-100'}`}>
                    {club.cover_image_url ? (
                      <img src={club.cover_image_url} alt={club.name} className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-30">{getCategoryIcon(club.category)}</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <button onClick={() => handleTogglePublic(club)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm transition-all border ${club.is_public ? 'bg-blue-700/40 text-white border-blue-600/50' : 'bg-white/10 text-gray-300 border-white/20'}`}>
                        {club.is_public ? '🌍 Public' : '🔒 Privé'}
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {club.logo_url ? (
                        <img src={club.logo_url} alt={club.name} className="w-16 h-16 rounded-xl object-cover border-2 border-white/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-blue-700/20 flex items-center justify-center text-2xl">{getCategoryIcon(club.category)}</div>
                      )}
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-1 line-clamp-1 ${dm ? 'text-white' : 'text-gray-900'}`}>{club.name}</h3>
                        <p className="text-sm text-gray-400">Code: {club.code}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-700/20 rounded-full text-xs font-semibold text-blue-300">
                        <span>{getCategoryIcon(club.category)}</span>{club.category}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{club.description || 'Aucune description disponible.'}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className={`font-semibold ${dm ? 'text-white' : 'text-gray-800'}`}>{club.total_members || 0}</span>
                        <span>membres</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className={`font-semibold ${dm ? 'text-white' : 'text-gray-800'}`}>{club.active_members || 0}</span>
                        <span>actifs</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/clubs/${club.id}`)}
                        className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${dm ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Voir
                      </button>
                      <button onClick={() => setDeleteConfirm(club.id)}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-xl font-semibold transition-all flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-3xl p-8 max-w-md w-full border shadow-2xl ${dm ? 'bg-[#050F1E] border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className={`text-2xl font-bold text-center mb-3 ${dm ? 'text-white' : 'text-gray-900'}`}>Confirmer la suppression</h3>
              <p className={`text-center mb-8 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                Êtes-vous sûr de vouloir supprimer le club{' '}
                <span className={`font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>{clubs.find(c => c.id === deleteConfirm)?.name}</span> ?
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all border ${dm ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`}>
                  Annuler
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${dm ? 'bg-blue-700/10' : 'bg-blue-100'}`}></div>
        <div className={`fixed bottom-20 right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none ${dm ? 'bg-red-600/10' : 'bg-red-100'}`}></div>
      </div>
    </div>
  );
};

export default ManageClubs;