import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar';

const AddPresident = () => {
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

  const [presidentData, setPresidentData] = useState({
    first_name: '', last_name: '', email: '', password: '',
    password_confirmation: '', cne: '', phone: '', avatar: null,
    club_id: '', position: 'Président'
  });

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrors({ general: `Erreur lors du chargement des clubs: ${error.message}` });
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPresidentData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setPresidentData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};
    if (!presidentData.first_name) newErrors.first_name = 'Le prénom est requis';
    if (!presidentData.last_name) newErrors.last_name = 'Le nom est requis';
    if (!presidentData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(presidentData.email)) newErrors.email = 'Email invalide';
    if (!presidentData.password) newErrors.password = 'Le mot de passe est requis';
    else if (presidentData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    if (presidentData.password !== presidentData.password_confirmation)
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    if (!presidentData.club_id) newErrors.club_id = 'Le club est requis';

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setLoading(false); return; }

    try {
      const formData = new FormData();
      formData.append('first_name', presidentData.first_name);
      formData.append('last_name', presidentData.last_name);
      formData.append('email', presidentData.email);
      formData.append('password', presidentData.password);
      formData.append('password_confirmation', presidentData.password_confirmation);
      formData.append('cne', presidentData.cne || '');
      formData.append('phone', presidentData.phone || '');
      if (presidentData.avatar) formData.append('avatar', presidentData.avatar);

      const personResponse = await fetch(`${API_BASE_URL}/api/persons`, { method: 'POST', credentials: 'include', body: formData });
      const personData = await personResponse.json();
      if (!personResponse.ok) { setErrors({ general: personData.message || "Erreur lors de la création de l'utilisateur" }); setLoading(false); return; }

      const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ person_id: personData.person.id, club_id: presidentData.club_id, role: 'president', position: presidentData.position, status: 'active' })
      });
      const memberData = await memberResponse.json();

      if (memberResponse.ok) {
        setSuccessMessage(`Président ${presidentData.first_name} ${presidentData.last_name} ajouté avec succès!`);
        setPresidentData({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '', cne: '', phone: '', avatar: null, club_id: '', position: 'Président' });
        setAvatarPreview(null);
        setTimeout(() => { setSuccessMessage(''); navigate('/admin/dashboard'); }, 2000);
      } else {
        setErrors({ general: memberData.message || "Erreur lors de l'assignation au club" });
      }
    } catch (error) {
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err) => `w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none transition
    ${err ? 'border-red-500' : dm ? 'border-white/20' : 'border-gray-300'}
    ${dm ? 'bg-[#0a1628] text-white' : 'bg-white text-gray-900'}`;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${dm ? 'bg-[#020617]' : 'bg-gray-50'}`}>
      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 relative pt-32">


        <div className="pt-8 px-8 pb-12 max-w-4xl mx-auto">

          {successMessage && (
            <div className={`mb-6 px-6 py-4 rounded-2xl flex items-center gap-3 ${dm ? 'bg-blue-900/40 border border-blue-500/30 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {successMessage}
            </div>
          )}
          {errors.general && (
            <div className={`mb-6 px-6 py-4 rounded-2xl flex items-center gap-3 ${dm ? 'bg-red-900/40 border border-red-500/30 text-red-300' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errors.general}
            </div>
          )}

          <div className={`border rounded-3xl overflow-hidden shadow-sm ${dm ? 'bg-[#050F1E] border-white/10' : 'bg-white border-gray-200'}`}>

            <div className="bg-blue-700 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Ajouter un Président</h1>
              <p className="text-white/80">Créer un nouveau compte président pour un club</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">

              {/* Informations Personnelles */}
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold pb-3 border-b ${dm ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'}`}>Informations Personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Prénom *</label>
                    <input type="text" name="first_name" value={presidentData.first_name} onChange={handleChange} className={inputCls(errors.first_name)} placeholder="Ex: Ahmed" />
                    {errors.first_name && <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Nom *</label>
                    <input type="text" name="last_name" value={presidentData.last_name} onChange={handleChange} className={inputCls(errors.last_name)} placeholder="Ex: El Mansouri" />
                    {errors.last_name && <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>CNE</label>
                    <input type="text" name="cne" value={presidentData.cne} onChange={handleChange} className={inputCls(false)} placeholder="Ex: R134567890" />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Téléphone</label>
                    <input type="tel" name="phone" value={presidentData.phone} onChange={handleChange} className={inputCls(false)} placeholder="Ex: 0612345678" />
                  </div>
                </div>

                {/* Avatar */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Avatar (optionnel)</label>
                  {!avatarPreview ? (
                    <label className="cursor-pointer block">
                      <div className={`border-2 border-dashed rounded-2xl p-6 hover:border-blue-600 transition-all ${dm ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-700/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          <div>
                            <span className={`text-sm font-medium block mb-1 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Cliquez pour sélectionner une photo</span>
                            <span className="text-gray-400 text-xs">PNG, JPG, GIF jusqu'à 2MB</span>
                          </div>
                        </div>
                      </div>
                      <input type="file" name="avatar" onChange={handleFileChange} accept="image/*" className="hidden" />
                    </label>
                  ) : (
                    <div className={`rounded-2xl p-4 border ${dm ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <img src={avatarPreview} alt="Avatar preview" className="h-20 w-20 object-cover rounded-full border-2 border-blue-600" />
                        <div className="flex-1">
                          <p className={`font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>Photo sélectionnée</p>
                          <p className="text-gray-500 text-sm">{presidentData.avatar?.name}</p>
                        </div>
                        <button type="button" onClick={() => { setPresidentData(prev => ({ ...prev, avatar: null })); setAvatarPreview(null); }} className="p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de Connexion */}
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold pb-3 border-b ${dm ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'}`}>Informations de Connexion</h2>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                  <input type="email" name="email" value={presidentData.email} onChange={handleChange} className={inputCls(errors.email)} placeholder="Ex: ahmed@estfes.ma" />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Mot de passe *</label>
                    <input type="password" name="password" value={presidentData.password} onChange={handleChange} className={inputCls(errors.password)} placeholder="••••••••" />
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Confirmer mot de passe *</label>
                    <input type="password" name="password_confirmation" value={presidentData.password_confirmation} onChange={handleChange} className={inputCls(errors.password_confirmation)} placeholder="••••••••" />
                    {errors.password_confirmation && <p className="text-red-400 text-sm mt-1">{errors.password_confirmation}</p>}
                  </div>
                </div>
              </div>

              {/* Assignation au Club */}
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold pb-3 border-b ${dm ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'}`}>Assignation au Club</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Club *</label>
                    {loadingClubs ? (
                      <div className={`w-full px-4 py-3 border rounded-xl flex items-center gap-2 ${dm ? 'bg-[#0a1628] border-white/20' : 'bg-white border-gray-300'}`}>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-gray-500 text-sm">Chargement des clubs...</span>
                      </div>
                    ) : clubs.length === 0 ? (
                      <div className="w-full px-4 py-3 bg-red-100 border border-red-300 rounded-xl">
                        <p className="text-red-500 text-sm">Aucun club disponible. Veuillez d'abord créer un club.</p>
                      </div>
                    ) : (
                      <select name="club_id" value={presidentData.club_id} onChange={handleChange}
                        className={inputCls(errors.club_id)}>
                        <option value="">Sélectionner un club...</option>
                        {clubs.map(club => <option key={club.id} value={club.id}>{club.name} ({club.category})</option>)}
                      </select>
                    )}
                    {errors.club_id && <p className="text-red-400 text-sm mt-1">{errors.club_id}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Position</label>
                    <input type="text" name="position" value={presidentData.position} onChange={handleChange} className={inputCls(false)} placeholder="Ex: Président" />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className={`rounded-2xl p-6 border ${dm ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dm ? 'bg-blue-700/30' : 'bg-blue-100'}`}>
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className={`text-sm ${dm ? 'text-blue-300' : 'text-blue-700'}`}>
                    <p className="font-semibold mb-1">Note importante</p>
                    <p className={dm ? 'text-blue-400' : 'text-blue-600'}>Le président pourra se connecter avec l'email et le mot de passe définis. Il aura accès à toutes les fonctionnalités de gestion de son club.</p>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading || loadingClubs || clubs.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                {loading ? (<><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>Création en cours...</>) : (<><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>Ajouter le Président</>)}
              </button>
            </form>
          </div>
        </div>

        <div className={`fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${dm ? 'bg-blue-700/10' : 'bg-blue-100'}`}></div>
        <div className={`fixed bottom-20 right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none ${dm ? 'bg-red-600/10' : 'bg-red-100'}`}></div>
      </div>
    </div>
  );
};

export default AddPresident;