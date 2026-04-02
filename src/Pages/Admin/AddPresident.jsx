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

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [existingPresident, setExistingPresident] = useState(null);

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
      setErrors({ general: `Erreur clubs: ${error.message}` });
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
    }
  };

  // Uses the dedicated /api/clubs/{id}/president endpoint
  const checkExistingPresident = async (clubId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/president`);
      if (!response.ok) return null;
      const data = await response.json();
      return data || null;
    } catch {
      return null;
    }
  };

  // Rollback: delete person if member creation fails
  const rollbackPerson = async (personId) => {
    try {
      await fetch(`${API_BASE_URL}/api/persons/${personId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      console.log('Rollback: person deleted', personId);
    } catch (e) {
      console.error('Rollback failed for person', personId, e);
    }
  };

  const doSubmit = async (replacePresident = false) => {
    setLoading(true);
    setErrors({});
    let createdPersonId = null;

    try {
      // ── Step 1: Create the person account ─────────────────────────────────
      const formData = new FormData();
      Object.keys(presidentData).forEach(key => {
        if (presidentData[key] !== null && presidentData[key] !== '') {
          formData.append(key, presidentData[key]);
        }
      });

      const personResponse = await fetch(`${API_BASE_URL}/api/persons`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const personData = await personResponse.json();

      if (!personResponse.ok) {
        setErrors({ general: personData.message || "Erreur lors de la création du compte" });
        setLoading(false);
        return;
      }

      // Track the created person for potential rollback
      createdPersonId = personData.person.id;

      // ── Step 2: Create the membership ──────────────────────────────────────
      const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          person_id: createdPersonId,
          club_id: presidentData.club_id,
          role: 'president',
          position: presidentData.position,
          status: 'active',
          replace_existing: replacePresident,
        }),
      });

      const memberData = await memberResponse.json();

      if (!memberResponse.ok) {
        // ── ROLLBACK: person was created but membership failed ─────────────
        await rollbackPerson(createdPersonId);
        setErrors({
          general: (memberData.message || "Erreur lors de la nomination") + " — Le compte créé a été supprimé automatiquement."
        });
        setLoading(false);
        return;
      }

      // ── All good ───────────────────────────────────────────────────────────
      setSuccessMessage(`✅ ${presidentData.first_name} ${presidentData.last_name} nommé(e) Président avec succès !`);
      setTimeout(() => navigate('/admin/dashboard'), 2000);

    } catch (error) {
      // Network or unexpected error — rollback if person was created
      if (createdPersonId) {
        await rollbackPerson(createdPersonId);
      }
      setErrors({ general: 'Erreur serveur. Le compte a été annulé automatiquement. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!presidentData.first_name.trim()) newErrors.first_name = 'Prénom requis';
    if (!presidentData.email.trim())      newErrors.email      = 'Email requis';
    if (!presidentData.password)          newErrors.password   = 'Mot de passe requis';
    if (!presidentData.club_id)           newErrors.club_id    = 'Sélectionnez un club';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    // Check if club already has an active president
    const existing = await checkExistingPresident(presidentData.club_id);
    if (existing) {
      setExistingPresident(existing);
      setShowConfirm(true);
      return;
    }

    doSubmit(false);
  };

  const handleConfirmReplace = () => {
    setShowConfirm(false);
    // true → backend demotes old president to inactive, new one becomes active president
    doSubmit(true);
  };

  const handleCancelReplace = () => {
    setShowConfirm(false);
    setExistingPresident(null);
  };

  // ── Style helpers ──────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-5 py-4 rounded-2xl border transition-all duration-300 outline-none
    ${err
      ? 'border-red-500 bg-red-500/5'
      : dm
        ? 'border-white/10 bg-white/5 focus:border-[#c0392b] focus:bg-white/10'
        : 'border-gray-200 bg-gray-50 focus:border-[#1a2c5b] focus:bg-white'}
    ${dm ? 'text-white placeholder-white/20' : 'text-[#1a2c5b] placeholder-gray-400'}`;

  const selectCls = (err) =>
    `w-full px-5 py-4 rounded-2xl border transition-all duration-300 outline-none
    ${err
      ? 'border-red-500 bg-red-500/5'
      : dm
        ? 'border-white/10 bg-[#1a1a1a] focus:border-[#c0392b]'
        : 'border-gray-200 bg-gray-50 focus:border-[#1a2c5b] focus:bg-white'}
    ${dm ? 'text-white' : 'text-[#1a2c5b]'}`;

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0a0a0a]' : 'bg-[#f8fafc]'}`}>
      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a2c5b]/10 rounded-full blur-[120px] -z-10" />

        <div className="flex-1 pt-24 px-8 pb-12 max-w-5xl mx-auto w-full">

          {/* Header */}
          <div className="mb-10">
            <div className="w-16 h-1 bg-[#c0392b] mb-4" />
            <h1 className={`text-5xl font-black ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>
              Nomination Président
            </h1>
            <p className={`text-lg font-medium ${dm ? 'text-white/40' : 'text-gray-500'}`}>
              Assignez un nouveau leader à un club existant
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-semibold">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-6 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Avatar card */}
            <div className={`lg:col-span-1 p-8 rounded-[2.5rem] border text-center transition-all
              ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
              <div className="relative group mx-auto w-40 h-40 mb-6">
                <div className={`absolute inset-0 rounded-full border-4 border-dashed
                  ${dm ? 'border-white/10' : 'border-gray-200'}`} />
                <img
                  src={avatarPreview || "https://ui-avatars.com/api/?background=c0392b&color=fff&name=P"}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full p-2 border-2 border-[#c0392b]"
                />
                <label className="absolute bottom-1 right-1 w-10 h-10 bg-[#c0392b] text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" name="avatar" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              <h3 className={`font-black uppercase tracking-widest text-sm mb-2 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>
                Photo de Profil
              </h3>
              <p className="text-[10px] text-gray-500 uppercase font-black">Formats: JPG, PNG (Max 2MB)</p>
            </div>

            {/* Main fields card */}
            <div className={`lg:col-span-2 p-10 rounded-[2.5rem] border transition-all
              ${dm ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'}`}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Prénom *</label>
                  <input type="text" name="first_name" value={presidentData.first_name} onChange={handleChange} className={inputCls(errors.first_name)} placeholder="Ahmed" />
                  {errors.first_name && <p className="text-red-400 text-xs ml-1">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Nom</label>
                  <input type="text" name="last_name" value={presidentData.last_name} onChange={handleChange} className={inputCls(false)} placeholder="Bennani" />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Club de destination *</label>
                <select
                  name="club_id" value={presidentData.club_id} onChange={handleChange}
                  className={selectCls(errors.club_id)}
                  style={dm ? { backgroundColor: '#1a1a1a', color: '#ffffff' } : {}}
                  disabled={loadingClubs}
                >
                  <option value="" style={dm ? { backgroundColor: '#1a1a1a', color: '#ffffff' } : {}}>
                    {loadingClubs ? 'Chargement...' : "Sélectionner l'organisation..."}
                  </option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id} style={dm ? { backgroundColor: '#1a1a1a', color: '#ffffff' } : {}}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.club_id && <p className="text-red-400 text-xs ml-1">{errors.club_id}</p>}
              </div>

              <div className="space-y-2 mb-6">
                <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Email Professionnel *</label>
                <input type="email" name="email" value={presidentData.email} onChange={handleChange} className={inputCls(errors.email)} placeholder="president@estfes.ma" />
                {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>CNE</label>
                  <input type="text" name="cne" value={presidentData.cne} onChange={handleChange} className={inputCls(false)} placeholder="R123456789" />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Téléphone</label>
                  <input type="text" name="phone" value={presidentData.phone} onChange={handleChange} className={inputCls(false)} placeholder="+212 6xx xxx xxx" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Mot de passe *</label>
                  <input type="password" name="password" onChange={handleChange} className={inputCls(errors.password)} placeholder="••••••••" />
                  {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Confirmer</label>
                  <input type="password" name="password_confirmation" onChange={handleChange} className={inputCls(false)} placeholder="••••••••" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || loadingClubs}
                className="w-full bg-[#1a2c5b] hover:bg-[#0f1b3a] disabled:opacity-60 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-4"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Création en cours...
                  </>
                ) : (
                  <>
                    Nommer le Président
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirm && existingPresident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md mx-4 p-8 rounded-[2rem] border shadow-2xl
            ${dm ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-gray-100 text-[#1a2c5b]'}`}>

            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h2 className="text-xl font-black text-center mb-3">Ce club a déjà un président</h2>

            {/* What will happen */}
            <div className={`rounded-xl p-4 mb-6 text-xs space-y-3 ${dm ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className={dm ? 'text-white/60' : 'text-gray-500'}>
                  <strong className="text-red-400">{existingPresident.first_name} {existingPresident.last_name}</strong> passera en statut{' '}
                  <strong>inactif</strong> — son compte est conservé, il perd juste le rôle de président.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className={dm ? 'text-white/60' : 'text-gray-500'}>
                  <strong className="text-green-400">{presidentData.first_name || 'Le nouveau membre'}</strong> deviendra le{' '}
                  <strong>président actif</strong> de ce club.
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCancelReplace}
                className={`flex-1 py-3 rounded-2xl font-black uppercase text-sm border transition-all
                  ${dm ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReplace}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl font-black uppercase text-sm bg-[#c0392b] hover:bg-[#a93226] text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  : 'Oui, remplacer'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPresident;