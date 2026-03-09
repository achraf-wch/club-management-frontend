import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';

const ClubManagement = () => {
  const { user } = useAuth();
  const [clubId, setClubId] = useState(null);
  const [clubData, setClubData] = useState({
    oldName: '', newName: '', description: '',
    mission: '', logo: null, category: '', founding_year: '',
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [isDetectingClub, setIsDetectingClub] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // ── Dark mode : synchronisé avec la Navbar ──────────────────────────────
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const onThemeChange = () =>
      setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', onThemeChange);
    return () => window.removeEventListener('themeChanged', onThemeChange);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchClubData(); }, []);

  const fetchClubData = async () => {
    try {
      setIsDetectingClub(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/my-club-info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClubId(data.id);
        setClubData({
          oldName:       data.name || '',
          newName:       '',
          description:   data.description || '',
          mission:       data.mission || '',
          logo:          null,
          category:      data.category || '',
          founding_year: data.founding_year || '',
        });
        if (data.logo_url) setLogoPreview(`${data.logo_url}?t=${Date.now()}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Erreur ${response.status}: impossible de récupérer les données du club.`);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError("Erreur de connexion au serveur. Vérifiez que le backend est en cours d'exécution.");
    } finally {
      setIsDetectingClub(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClubData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Veuillez sélectionner une image valide'); return; }
    if (file.size > 5 * 1024 * 1024) { setError("L'image ne doit pas dépasser 5MB"); return; }
    setClubData(prev => ({ ...prev, logo: file }));
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clubId) { setError('Club introuvable. Veuillez rafraîchir la page.'); return; }
    setIsLoading(true); setError(''); setSuccess('');
    try {
      const formData = new FormData();
      formData.append('name',          clubData.newName.trim() || clubData.oldName);
      formData.append('description',   clubData.description);
      formData.append('mission',       clubData.mission);
      formData.append('category',      clubData.category);
      formData.append('founding_year', clubData.founding_year);
      formData.append('_method',       'PUT');
      if (clubData.logo instanceof File) formData.append('logo', clubData.logo);

      const response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Informations du club mises à jour avec succès !');

        // ── Reset : nom actuel mis à jour, tous les autres champs vidés ──
        setClubData({
          oldName:       data.club.name || clubData.newName.trim() || clubData.oldName,
          newName:       '',
          description:   '',
          mission:       '',
          logo:          null,
          category:      '',
          founding_year: '',
        });
        if (data.club.logo_url) setLogoPreview(`${data.club.logo_url}?t=${Date.now()}`);
        // Reset file input visually
        const fileInput = document.getElementById('logo-upload');
        if (fileInput) fileInput.value = '';

        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch { setError('Erreur de connexion au serveur'); }
    finally { setIsLoading(false); }
  };

  // ── Styles dynamiques selon dark mode ────────────────────────────────────
  const pageBg   = darkMode
    ? 'min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-4'
    : 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4';

  const cardBg   = darkMode
    ? 'bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl shadow-black/50 p-8'
    : 'bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-blue-950/30 p-8';

  const inputCls = darkMode
    ? 'w-full px-4 py-3.5 bg-gray-800/70 border-2 border-gray-600/60 text-gray-100 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-gray-800 transition-all duration-300 placeholder-gray-500'
    : 'w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:bg-slate-800/70 transition-all duration-300 placeholder-slate-500';

  const labelCls = darkMode
    ? 'block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2'
    : 'block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2';
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={pageBg}>
      {/* Blobs décoratifs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-blue-800/15' : 'bg-blue-600/20'} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-800/10' : 'bg-purple-600/15'} rounded-full blur-3xl`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${darkMode ? 'bg-blue-700/8' : 'bg-blue-500/10'} rounded-full blur-3xl`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent mb-2">
            Gestion du Club
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>
            Modifiez les informations et l'apparence de votre club
          </p>
        </div>

        <div className={cardBg}>

          {/* Succès */}
          {success && (
            <div className="mb-6 bg-emerald-900/30 border border-emerald-700/50 text-emerald-200 px-5 py-4 rounded-lg flex items-center gap-3 animate-slideDown">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-sm">{success}</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mb-6 bg-rose-900/30 border border-rose-700/50 text-rose-200 px-5 py-4 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-sm">{error}</span>
            </div>
          )}

          {isDetectingClub ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              <p className={`text-sm animate-pulse ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                Chargement des données du club...
              </p>
            </div>
          ) : !error ? (
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Logo */}
              <div className="text-center">
                <label htmlFor="logo-upload" className="inline-block cursor-pointer group">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/40 shadow-xl ring-4 ${darkMode ? 'ring-gray-800' : 'ring-slate-800'} group-hover:border-blue-400/80 transition-all duration-300`}>
                      {logoPreview ? (
                        <img key={logoPreview} src={logoPreview} alt="Club Logo" className="w-full h-full object-cover" onError={() => setLogoPreview('')} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600/60 to-slate-800 flex items-center justify-center">
                          <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    {clubData.logo && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full border-2 border-black flex items-center justify-center">
                        <span className="text-black text-xs font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm group-hover:text-blue-400 transition-colors ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                    Nouveau Logo
                  </p>
                  <input id="logo-upload" type="file" name="logo" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>

              {/* Noms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Nom du Club Actuel</label>
                  <input type="text" value={clubData.oldName} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </div>
                <div>
                  <label className={labelCls}>Nouveau Nom du Club</label>
                  <input type="text" name="newName" value={clubData.newName} onChange={handleInputChange} className={inputCls} placeholder="Laisser vide pour ne pas changer" />
                </div>
              </div>

              {/* Catégorie + Année */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Catégorie</label>
                  <select name="category" value={clubData.category} onChange={handleInputChange} className={inputCls}>
                    <option value="">Sélectionnez une catégorie</option>
                    <option value="scientifique">Scientifique</option>
                    <option value="culturel">Culturel</option>
                    <option value="sportif">Sportif</option>
                    <option value="social">Social</option>
                    <option value="artistique">Artistique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Année de Fondation</label>
                  <input type="number" name="founding_year" value={clubData.founding_year} onChange={handleInputChange} className={inputCls} placeholder="Ex: 2020" min="1900" max={new Date().getFullYear()} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <textarea name="description" value={clubData.description} onChange={handleInputChange} className={`${inputCls} resize-none`} rows={4} placeholder="Décrivez votre club..." required />
              </div>

              {/* Mission */}
              <div>
                <label className={labelCls}>Mission</label>
                <textarea name="mission" value={clubData.mission} onChange={handleInputChange} className={`${inputCls} resize-none`} rows={3} placeholder="La mission principale de votre club..." />
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <span>Mettre à jour le club</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="bg-rose-900/20 rounded-full p-4">
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-rose-200 mb-2">Erreur de chargement</h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>{error}</p>
                <button
                  onClick={fetchClubData}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-500/30"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ClubManagement;