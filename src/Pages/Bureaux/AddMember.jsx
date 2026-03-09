import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BureauxAddMember = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

  const [memberData, setMemberData] = useState({
    club_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cne: '',
    password: '',
    password_confirmation: '',
    position: 'Membre',
    role: 'member'
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user) {
      fetchUserClubs();
    }
    
    // Synchroniser le dark mode avec la Navbar
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    };
    
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, [user]);

  useEffect(() => {
    // Initialiser le dark mode depuis le localStorage
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const fetchUserClubs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUserClubs(data);
        if (data.length > 0) {
          setMemberData(prev => ({ ...prev, club_id: data[0].club_id }));
        } else {
          setErrorMessage('Vous n\'êtes membre du bureau d\'aucun club. Contactez votre président.');
        }
      } else {
        setErrorMessage(data.message || 'Impossible de charger vos clubs');
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion au serveur: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setMemberData(prev => ({ ...prev, password: password, password_confirmation: password }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!memberData.first_name || !memberData.last_name || !memberData.email || !memberData.password) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    if (memberData.password !== memberData.password_confirmation) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (memberData.role === 'board' && !memberData.position.trim()) {
      setErrorMessage('La position est obligatoire pour les membres du bureau');
      setLoading(false);
      return;
    }

    try {
      const metadataObject = {
        first_name: memberData.first_name.trim(),
        last_name: memberData.last_name.trim(),
        email: memberData.email.trim().toLowerCase(),
        phone: memberData.phone.trim() || null,
        cne: memberData.cne.trim() || null,
        password: memberData.password,
        password_confirmation: memberData.password_confirmation,
        position: memberData.position.trim() || 'Membre',
        role: memberData.role,
        club_id: parseInt(memberData.club_id)
      };

      const requestPayload = {
        club_id: parseInt(memberData.club_id),
        requested_by: user.id,
        type: 'other',
        title: `Demande d'ajout de membre: ${memberData.first_name} ${memberData.last_name}`,
        description: `Ajout de ${memberData.role === 'board' ? 'membre du bureau' : 'membre'} proposé par ${user.first_name} ${user.last_name}`,
        metadata: metadataObject
      };

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestPayload)
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setErrorMessage('Erreur: Réponse invalide du serveur');
        setLoading(false);
        return;
      }

      if (response.ok) {
        setSuccessMessage(`✓ Demande d'ajout envoyée avec succès! Mot de passe temporaire: ${memberData.password}`);
        setTimeout(() => {
          setMemberData({
            club_id: userClubs[0]?.club_id || '',
            first_name: '', last_name: '', email: '', phone: '', cne: '',
            password: '', password_confirmation: '', position: 'Membre', role: 'member'
          });
          setSuccessMessage('');
        }, 5000);
      } else {
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            }).join('\n');
          setErrorMessage(errorMessages);
        } else {
          setErrorMessage(data.message || 'Erreur lors de l\'envoi de la demande');
        }
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion au serveur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 placeholder-gray-400 focus:outline-none
    ${dm
      ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60 [color-scheme:dark]'
      : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400 [color-scheme:light]'}`;

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin mb-4 mx-auto ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-400/30 border-t-red-400'}`}></div>
          <p className={`text-lg ${dm ? 'text-gray-400' : 'text-gray-700'}`}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Demande d'Ajout d'un <span className={dm ? 'text-red-500' : 'text-red-600'}>Membre</span>
          </h1>
          {userClubs.length > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <p className={dm ? 'text-gray-400' : 'text-gray-500'}>
                Demande pour le club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-600'}`}>{userClubs[0]?.club_name}</span>
              </p>
            </div>
          )}
          <p className={`text-sm mt-1 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Cette demande sera soumise au président pour validation</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl flex items-start gap-3
            ${dm
              ? 'bg-green-950/40 border-green-700/40 text-green-300'
              : 'bg-gradient-to-r from-green-900/80 to-green-800/80 border-green-500/50 text-white'}`}>
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold">{successMessage}</p>
              <p className={`text-sm mt-2 ${dm ? 'text-green-400' : 'text-green-200'}`}>Notez bien le mot de passe pour le transmettre au membre.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl flex items-start gap-3
            ${dm
              ? 'bg-red-950/40 border-red-800/40 text-red-300'
              : 'bg-gradient-to-r from-red-900/80 to-red-800/80 border-red-500/50 text-white'}`}>
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <pre className={`font-semibold whitespace-pre-wrap text-sm ${dm ? 'text-red-300' : 'text-red-100'}`}>{errorMessage}</pre>
              {user && (
                <div className="mt-4 p-3 bg-red-500/10 rounded-lg text-xs">
                  <p className={`mb-2 ${dm ? 'text-red-400' : 'text-red-200'}`}>🔍 Informations de débogage:</p>
                  <p className={dm ? 'text-red-500' : 'text-red-300'}>User ID: {user.id}</p>
                  <p className={dm ? 'text-red-500' : 'text-red-300'}>Email: {user.email}</p>
                  <p className={dm ? 'text-red-500' : 'text-red-300'}>Role: {user.role}</p>
                  <p className={`mt-2 ${dm ? 'text-red-500' : 'text-red-300'}`}>Vérifiez que cet utilisateur est bien membre du bureau d'un club actif dans la base de données.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {userClubs.length === 0 ? (
          <div className={`rounded-2xl shadow-sm p-8 text-center border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-6xl mb-4">🏢</div>
            <p className={`text-lg ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Vous devez être membre du bureau d'un club pour ajouter des membres.</p>
          </div>
        ) : (
          <div className={`rounded-2xl shadow-sm p-8 border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Club Info Banner */}
              <div className={`md:col-span-2 mb-4 p-5 rounded-xl border
                ${dm
                  ? 'bg-black/60 border-red-900/40'
                  : 'bg-gradient-to-r from-[#0f1d4a] to-[#0a1235] border-blue-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${dm ? 'text-red-300' : 'text-white'}`}>{userClubs[0]?.club_name}</h3>
                      <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-300'}`}>Club sélectionné</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold
                    ${dm
                      ? 'bg-red-900/40 text-red-300 border border-red-800/50'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'}`}>
                    Bureau
                  </span>
                </div>
              </div>

              {/* Section 1: Informations Personnelles */}
              <div className="md:col-span-2">
                <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${dm ? 'border-red-900/30' : 'border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <span className="text-sm">1️⃣</span>
                  </div>
                  <h3 className={`text-base font-bold ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Informations Personnelles</h3>
                </div>
              </div>

              {/* Prénom */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Prénom <span className="text-red-500">*</span></label>
                <input type="text" name="first_name" value={memberData.first_name} onChange={handleChange} className={inputClass} placeholder="Entrez le prénom" />
              </div>

              {/* Nom */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Nom <span className="text-red-500">*</span></label>
                <input type="text" name="last_name" value={memberData.last_name} onChange={handleChange} className={inputClass} placeholder="Entrez le nom" />
              </div>

              {/* Section 2: Coordonnées */}
              <div className="md:col-span-2 mt-2">
                <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${dm ? 'border-red-900/30' : 'border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <span className="text-sm">2️⃣</span>
                  </div>
                  <h3 className={`text-base font-bold ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Coordonnées</h3>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={memberData.email} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
              </div>

              {/* Téléphone */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Téléphone</label>
                <input type="tel" name="phone" value={memberData.phone} onChange={handleChange} className={inputClass} placeholder="+212 6XX XXX XXX" />
              </div>

              {/* CNE */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>CNE</label>
                <input type="text" name="cne" value={memberData.cne} onChange={handleChange} className={inputClass} placeholder="Code National Étudiant" />
              </div>

              {/* Section 3: Rôle et Position */}
              <div className="md:col-span-2 mt-2">
                <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${dm ? 'border-red-900/30' : 'border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <span className="text-sm">3️⃣</span>
                  </div>
                  <h3 className={`text-base font-bold ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Rôle et Position</h3>
                </div>
              </div>

              {/* Rôle */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Rôle <span className="text-red-500">*</span></label>
                <select
                  name="role"
                  value={memberData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300
                    ${dm
                      ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60 [color-scheme:dark]'
                      : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400'}`}
                >
                  <option value="member">Membre</option>
                  <option value="board">Membre du Bureau</option>
                </select>
                <p className={`text-xs mt-2 flex items-center gap-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  {memberData.role === 'board'
                    ? <><span className="text-red-500">👔</span> Membre du bureau avec position spécifique</>
                    : <><span className="text-red-400">👤</span> Membre régulier du club</>}
                </p>
              </div>

              {/* Position */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position {memberData.role === 'board' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="position"
                  value={memberData.position}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={memberData.role === 'board' ? "Ex: Trésorier, Secrétaire..." : "Ex: Membre actif"}
                />
                {memberData.role === 'board' && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Position requise pour les membres du bureau
                  </p>
                )}
              </div>

              {/* Section 4: Sécurité */}
              <div className="md:col-span-2 mt-2">
                <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${dm ? 'border-red-900/30' : 'border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <span className="text-sm">4️⃣</span>
                  </div>
                  <h3 className={`text-base font-bold ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Sécurité</h3>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="md:col-span-2">
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mot de passe temporaire <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="password"
                    value={memberData.password}
                    onChange={handleChange}
                    className={`${inputClass} flex-1 font-mono`}
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:scale-105
                      ${dm
                        ? 'bg-red-900/40 text-red-300 border border-red-800/50 hover:bg-red-900/60 hover:text-red-200'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-red-500 hover:shadow-red-400/40'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Générer
                  </button>
                </div>
                <p className={`text-sm mt-3 flex items-center gap-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Le membre devra changer ce mot de passe lors de sa première connexion
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`group w-full relative py-4 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-3 text-lg
                  shadow-lg hover:scale-[1.02] border-2 overflow-hidden
                  ${dm
                    ? 'bg-black border-red-800/50 hover:border-red-600/60 text-red-300 hover:text-white hover:bg-red-950/30'
                    : 'bg-gradient-to-r from-[#0f1d4a] via-[#162035] to-[#0f1d4a] text-white border-red-500/30 hover:border-red-400/50 shadow-blue-900/30 hover:shadow-blue-800/50'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="relative z-10">Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="relative z-10">Envoyer la Demande</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BureauxAddMember;