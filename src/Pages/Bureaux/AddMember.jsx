import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BureauxAddMember = () => {
  const { user } = useAuth(); // ✅ Using authenticated user
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
  }, [user]);

  const fetchUserClubs = async () => {
    try {
      console.log('🔍 Fetching clubs for user:', user);
      console.log('🔍 API URL:', `${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`);
      
      const response = await fetch(`${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        setUserClubs(data);
        console.log('✅ Clubs loaded:', data);
        if (data.length > 0) {
          setMemberData(prev => ({ ...prev, club_id: data[0].club_id }));
        } else {
          setErrorMessage('Vous n\'êtes membre du bureau d\'aucun club. Contactez votre président.');
        }
      } else {
        console.error('❌ Response not OK:', data);
        setErrorMessage(data.message || 'Impossible de charger vos clubs');
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setErrorMessage('Erreur de connexion au serveur: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setMemberData(prev => ({
      ...prev,
      password: password,
      password_confirmation: password
    }));
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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
          setSuccessMessage('');
        }, 5000);
      } else {
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('\n');
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-8">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Return Button */}
        <button
          onClick={() => navigate('/Bureaux/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl text-white transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Demande d'Ajout de Membre</h1>
              <p className="text-white/70">Cette demande sera soumise au président pour validation</p>
            </div>
          </div>

          {userClubs.length > 0 && (
            <div className="mt-6 p-4 bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-sm text-white/60">Club sélectionné</p>
                  <p className="font-bold text-white">{userClubs[0]?.club_name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-500/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-300 text-lg">{successMessage}</p>
                <p className="text-green-200 text-sm mt-1">Notez bien le mot de passe pour le transmettre au membre.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <pre className="font-semibold text-red-300 whitespace-pre-wrap text-sm">{errorMessage}</pre>
                {user && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg text-xs">
                    <p className="text-red-200 mb-2">🔍 Informations de débogage:</p>
                    <p className="text-red-300">User ID: {user.id}</p>
                    <p className="text-red-300">Email: {user.email}</p>
                    <p className="text-red-300">Role: {user.role}</p>
                    <p className="text-red-300 mt-2">Vérifiez que cet utilisateur est bien membre du bureau d'un club actif dans la base de données.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {userClubs.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-12 text-center">
            <span className="text-7xl mb-4 block">🏢</span>
            <p className="text-white/70 text-lg">Vous devez être membre du bureau d'un club pour ajouter des membres.</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-8">
            {/* Form Sections */}
            <div className="space-y-8">
              {/* Section 1: Personal Info */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">1️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Informations Personnelles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Prénom <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={memberData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Nom <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={memberData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="Entrez le nom"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">2️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Coordonnées</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={memberData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={memberData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      CNE
                    </label>
                    <input
                      type="text"
                      name="cne"
                      value={memberData.cne}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="Code National Étudiant"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Role */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">3️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Rôle et Position</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Rôle <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="role"
                      value={memberData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all cursor-pointer"
                    >
                      <option value="member" className="bg-gray-900">Membre</option>
                      <option value="board" className="bg-gray-900">Membre du Bureau</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Position {memberData.role === 'board' && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={memberData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder={memberData.role === 'board' ? "Ex: Trésorier, Secrétaire..." : "Ex: Membre actif"}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Security */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">4️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Sécurité</h3>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Mot de passe temporaire <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="password"
                      value={memberData.password}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all font-mono"
                      placeholder="Minimum 6 caractères"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Générer
                    </button>
                  </div>
                  <p className="text-white/50 text-sm mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Le membre devra changer ce mot de passe lors de sa première connexion
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Envoyer la Demande
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