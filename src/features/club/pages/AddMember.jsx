// src/features/club/pages/AddMember.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';

const AddMember = () => {
  const { user } = useAuth();
  const effectiveRole = user?.role === 'user' ? user?.club_role : user?.role;
  const isPresident = effectiveRole === 'president';

  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const [memberData, setMemberData] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', cne: '', password: '',
    password_confirmation: '', position: 'Membre', role: 'member'
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMyClub();
    const handleTheme = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handleTheme);
    return () => window.removeEventListener('themeChanged', handleTheme);
  }, []);

  const fetchMyClub = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/my-club-info`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setClub(data.club || data);
        return;
      }

      const fallbackRes = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        setClub(fallbackData.club || fallbackData);
        return;
      }

      setStatus({ type: 'error', message: 'Impossible de charger votre club.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur de connexion.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 10; i++)
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    setMemberData(prev => ({ ...prev, password, password_confirmation: password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (!club?.id) {
      setStatus({ type: 'error', message: 'Aucun club trouvé.' });
      setLoading(false);
      return;
    }

    try {
      if (isPresident) {
        // ── PRESIDENT: direct action ──
        const pRes = await fetch(`${API_BASE_URL}/api/persons/new-member`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...memberData, club_id: club.id })
        });

        const pData = await pRes.json();

        if (!pRes.ok) {
          setStatus({
            type: 'error',
            message: pData.errors
              ? Object.values(pData.errors).flat().join(', ')
              : pData.message
          });
          return;
        }

        // link member to club
        const personId = pData.person?.id || pData.id;
        await fetch(`${API_BASE_URL}/api/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            person_id: personId,
            club_id: club.id,
            role: memberData.role,
            position: memberData.position,
            status: 'active'
          })
        });

        setStatus({
          type: 'success',
          message: `✓ ${memberData.role === 'board' ? 'Membre du Bureau' : 'Membre'} ajouté avec succès!`
        });

      } else {
        // ── BUREAUX: goes to approval queue ──
        const res = await fetch(`${API_BASE_URL}/api/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            club_id: club.id,
            requested_by: user.id,
            type: 'other',
            title: `Ajout: ${memberData.first_name} ${memberData.last_name}`,
            description: `Nouveau ${memberData.role === 'board' ? 'Bureau' : 'Membre'}`,
            metadata: { ...memberData, club_id: club.id }
          })
        });

        if (!res.ok) {
          const err = await res.json();
          setStatus({ type: 'error', message: err.message || "Erreur lors de l'envoi." });
          return;
        }

        setStatus({
          type: 'success',
          message: `✓ Demande envoyée ! Mot de passe temporaire : ${memberData.password}`
        });
      }

      // reset form
      setMemberData({
        first_name: '', last_name: '', email: '',
        phone: '', cne: '', password: '',
        password_confirmation: '', position: 'Membre', role: 'member'
      });

    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const dm = darkMode;
  const inputCls = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 
    placeholder-gray-400 focus:outline-none
    ${dm
      ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60'
      : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400'}`;

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Ajouter un <span className={dm ? 'text-cyan-400' : 'text-red-600'}>Membre</span>
          </h1>

          {/* club name */}
          {club && (
            <p className={`mt-2 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
              Club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-600'}`}>{club.name}</span>
            </p>
          )}

          {/* bureaux warning badge */}
          {!isPresident && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <span className="text-yellow-400 text-sm font-semibold">
                ⚠ Cette action nécessite l'approbation du président
              </span>
            </div>
          )}
        </div>

        {/* Status messages */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-xl border font-bold ${
            status.type === 'success'
              ? 'bg-green-500/20 border-green-500 text-green-400'
              : 'bg-red-500/20 border-red-500 text-red-400'
          }`}>
            {status.message}
          </div>
        )}

        <div className={`rounded-2xl p-8 border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>

          {/* Role selector */}
          <div className="mb-8">
            <p className="text-red-500 font-bold uppercase text-sm tracking-wider mb-4">
              1. Type d'adhésion
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMemberData(p => ({ ...p, role: 'member', position: 'Membre' }))}
                className={`py-3 rounded-xl font-bold transition-all ${
                  memberData.role === 'member'
                    ? 'bg-red-600 text-white'
                    : dm ? 'bg-white/5 text-gray-400' : 'bg-gray-200 text-gray-500'
                }`}
              >
                Membre Simple
              </button>
              <button
                type="button"
                onClick={() => setMemberData(p => ({ ...p, role: 'board', position: '' }))}
                className={`py-3 rounded-xl font-bold transition-all ${
                  memberData.role === 'board'
                    ? 'bg-red-600 text-white'
                    : dm ? 'bg-white/5 text-gray-400' : 'bg-gray-200 text-gray-500'
                }`}
              >
                Membre du Bureau
              </button>
            </div>
          </div>

          {/* Identity fields */}
          <p className="text-red-500 font-bold uppercase text-sm tracking-wider mb-4">
            2. Identité
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-semibold mb-2">Prénom *</label>
              <input type="text" name="first_name" value={memberData.first_name}
                onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Nom *</label>
              <input type="text" name="last_name" value={memberData.last_name}
                onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Email *</label>
              <input type="email" name="email" value={memberData.email}
                onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Téléphone</label>
              <input type="text" name="phone" value={memberData.phone}
                onChange={handleChange} placeholder="+212..." className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Position *</label>
              <input type="text" name="position" value={memberData.position}
                onChange={handleChange}
                placeholder={memberData.role === 'board' ? 'Ex: Trésorier' : 'Membre'}
                className={inputCls} />
            </div>
          </div>

          {/* Password */}
          <p className="text-red-500 font-bold uppercase text-sm tracking-wider mb-4">
            3. Sécurité
          </p>
          <div className="flex gap-3 mb-10">
            <input type="text" name="password" value={memberData.password}
              onChange={handleChange}
              placeholder="Mot de passe temporaire"
              className={`${inputCls} flex-1 font-mono`} />
            <button
              type="button"
              onClick={generatePassword}
              className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-red-500 to-red-600 text-white"
            >
              ⚡ Générer
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-lg text-white transition-all
              bg-gradient-to-r from-[#0f1d4a] to-[#0a1235] border-2 border-red-500/30
              ${loading ? 'opacity-50' : 'hover:scale-[1.01] active:scale-95'}`}
          >
            {loading
              ? 'TRAITEMENT...'
              : isPresident
                ? 'AJOUTER LE MEMBRE'
                : 'ENVOYER LA DEMANDE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
