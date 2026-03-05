import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';

const PresidentAddMember = () => {
  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

  const { user } = useAuth();

  const [memberData, setMemberData] = useState({
    first_name: '', last_name: '', email: '', phone: '', cne: '',
    password: '', password_confirmation: '', position: 'Membre', role: 'member'
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchMyClub(); }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include', headers: { 'Accept': 'application/json' }
      });
      if (response.ok) { const data = await response.json(); setClub(data); }
      else setErrorMessage('Impossible de charger votre club');
    } catch (error) { setErrorMessage('Erreur de connexion'); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 10; i++) password += charset.charAt(Math.floor(Math.random() * charset.length));
    setMemberData(prev => ({ ...prev, password, password_confirmation: password }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMessage(''); setErrorMessage('');
    if (!club) { setErrorMessage('Aucun club trouvé'); setLoading(false); return; }
    if (!memberData.first_name || !memberData.last_name || !memberData.email || !memberData.password) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires'); setLoading(false); return;
    }
    if (memberData.password !== memberData.password_confirmation) {
      setErrorMessage('Les mots de passe ne correspondent pas'); setLoading(false); return;
    }
    if (memberData.role === 'board' && !memberData.position.trim()) {
      setErrorMessage('La position est obligatoire pour les membres du bureau'); setLoading(false); return;
    }
    try {
      const personResponse = await fetch(`${API_BASE_URL}/api/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: memberData.first_name.trim(), last_name: memberData.last_name.trim(),
          email: memberData.email.trim().toLowerCase(), phone: memberData.phone.trim() || null,
          cne: memberData.cne.trim() || null, password: memberData.password,
          password_confirmation: memberData.password_confirmation
        })
      });
      const personData = await personResponse.json();
      if (!personResponse.ok) {
        setErrorMessage(personData.errors ? Object.entries(personData.errors).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n') : personData.message || 'Erreur');
        setLoading(false); return;
      }
      const personId = personData.person?.id || personData.id;
      if (!personId) { setErrorMessage('Erreur: ID de la personne non trouvé'); setLoading(false); return; }

      const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ person_id: personId, club_id: parseInt(club.id), role: memberData.role, position: memberData.position.trim() || null, status: 'active' })
      });
      const memberResponseData = await memberResponse.json();
      if (memberResponse.ok) {
        setGeneratedPassword(memberData.password);
        setSuccessMessage(`✓ Membre ajouté avec succès au club ${club.name}! Mot de passe temporaire: ${memberData.password}`);
        setTimeout(() => {
          setMemberData({ first_name: '', last_name: '', email: '', phone: '', cne: '', password: '', password_confirmation: '', position: 'Membre', role: 'member' });
          setSuccessMessage(''); setGeneratedPassword('');
        }, 5000);
      } else {
        setErrorMessage(memberResponseData.errors ? Object.entries(memberResponseData.errors).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n') : memberResponseData.message || "Erreur lors de l'ajout au club");
      }
    } catch (error) { setErrorMessage('Erreur de connexion au serveur: ' + error.message); }
    finally { setLoading(false); }
  };

  const inputCls = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 placeholder-gray-400 focus:outline-none
    ${dm ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-700/60' : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400'}`;

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>

      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Ajouter un <span className={dm ? 'text-cyan-400' : 'text-red-600'}>Membre</span>
          </h1>
          {club && (
            <div className="flex items-center gap-3 mt-3">
              {club.logo_url && <img src={club.logo_url} alt={club.name} className="w-10 h-10 rounded-full object-cover border-2 border-red-500/50" />}
              <p className={dm ? 'text-gray-400' : 'text-gray-500'}>
                Ajoutez un nouveau membre à votre club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-600'}`}>{club.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Success */}
        {successMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl flex items-start gap-3
            ${dm ? 'bg-green-950/40 border-green-700/40 text-green-300' : 'bg-gradient-to-r from-green-900/80 to-green-800/80 border-green-500/50 text-white'}`}>
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="font-bold">{successMessage}</p>
              <p className={`text-sm mt-1 ${dm ? 'text-green-500' : 'text-green-200'}`}>Notez bien le mot de passe pour le transmettre au membre.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl flex items-start gap-3
            ${dm ? 'bg-red-950/40 border-red-800/40 text-red-300' : 'bg-gradient-to-r from-red-900/80 to-red-800/80 border-red-500/50 text-white'}`}>
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <pre className="font-semibold whitespace-pre-wrap text-sm">{errorMessage}</pre>
          </div>
        )}

        {!club ? (
          <div className={`rounded-2xl shadow-sm p-8 text-center border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="animate-pulse">
              <div className="text-6xl mb-4">🏢</div>
              <p className={`text-lg mb-4 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Chargement de votre club...</p>
              <div className={`w-16 h-16 mx-auto border-4 rounded-full animate-spin ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-400/30 border-t-red-400'}`}></div>
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl shadow-sm p-8 border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Club Info Banner */}
              <div className={`md:col-span-2 mb-4 p-5 rounded-xl border
                ${dm ? 'bg-black/60 border-red-900/40' : 'bg-gradient-to-r from-[#0f1d4a] to-[#0a1235] border-blue-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {club.logo_url && <img src={club.logo_url} alt={club.name} className="w-12 h-12 rounded-full object-cover border-2 border-red-500/50 shadow-lg" />}
                    <div>
                      <h3 className={`font-bold text-lg ${dm ? 'text-red-300' : 'text-white'}`}>{club.name}</h3>
                      <p className={`text-sm ${dm ? 'text-cyan-700' : 'text-gray-300'}`}>{club.category}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold
                    ${dm ? 'bg-red-900/40 text-red-300 border border-red-800/50' : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'}`}>
                    Club Président
                  </span>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Prénom <span className="text-red-500">*</span></label>
                <input type="text" name="first_name" value={memberData.first_name} onChange={handleChange} className={inputCls} placeholder="Entrez le prénom" />
              </div>
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Nom <span className="text-red-500">*</span></label>
                <input type="text" name="last_name" value={memberData.last_name} onChange={handleChange} className={inputCls} placeholder="Entrez le nom" />
              </div>
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={memberData.email} onChange={handleChange} className={inputCls} placeholder="email@example.com" />
              </div>
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Téléphone</label>
                <input type="tel" name="phone" value={memberData.phone} onChange={handleChange} className={inputCls} placeholder="+212 6XX XXX XXX" />
              </div>
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>CNE</label>
                <input type="text" name="cne" value={memberData.cne} onChange={handleChange} className={inputCls} placeholder="Code National Étudiant" />
              </div>
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Rôle dans le club <span className="text-red-500">*</span></label>
                <select name="role" value={memberData.role} onChange={handleChange} className={inputCls}>
                  <option value="member">Membre Simple</option>
                  <option value="board">Membre du Bureau</option>
                </select>
                <p className={`text-xs mt-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  {memberData.role === 'board' ? '👔 Membre du bureau avec position spécifique' : '👤 Membre régulier du club'}
                </p>
              </div>
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position {memberData.role === 'board' && <span className="text-red-500">*</span>}
                </label>
                <input type="text" name="position" value={memberData.position} onChange={handleChange} className={inputCls}
                  placeholder={memberData.role === 'board' ? "Ex: Trésorier, Secrétaire..." : "Ex: Membre actif, Bénévole..."} />
                {memberData.role === 'board' && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Position requise pour les membres du bureau
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Mot de passe temporaire <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  <input type="text" name="password" value={memberData.password} onChange={handleChange} className={`${inputCls} flex-1 font-mono`} placeholder="Minimum 6 caractères" />
                  <button type="button" onClick={generatePassword}
                    className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:scale-105
                      ${dm ? 'bg-red-800/60 hover:bg-red-700/70 text-red-200 border border-red-700/50' : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-red-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Générer
                  </button>
                </div>
                <p className={`text-sm mt-3 flex items-center gap-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Le membre devra changer ce mot de passe lors de sa première connexion
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8">
              <button onClick={handleSubmit} disabled={loading}
                className={`group w-full relative py-4 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg border-2 hover:scale-[1.02] overflow-hidden
                  ${dm
                    ? 'bg-black border-red-800/50 hover:border-red-600/60 text-red-300 hover:text-white hover:bg-red-950/30'
                    : 'bg-gradient-to-r from-[#0f1d4a] via-[#162035] to-[#0f1d4a] text-white border-red-500/30 hover:border-red-400/50 shadow-lg shadow-blue-900/30'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? (
                  <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div><span className="relative z-10">Ajout en cours...</span></>
                ) : (
                  <><svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg><span className="relative z-10">Ajouter le Membre</span></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresidentAddMember;