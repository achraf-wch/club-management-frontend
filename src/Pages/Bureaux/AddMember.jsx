import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';

const BureauxAddMember = () => {
  const { user } = useAuth();
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

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://localhost:8000';

  useEffect(() => {
    if (user) {
      console.log('🔍 User loaded:', user);
      fetchUserClubs();
    }
  }, [user]);

  const fetchUserClubs = async () => {
    try {
      console.log('🔍 Fetching clubs for user:', user.id);
      console.log('📡 API URL:', `${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`);
      
      const response = await fetch(`${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`, {
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Clubs data loaded:', data);
        setUserClubs(data);
        if (data.length > 0) {
          setMemberData(prev => ({ ...prev, club_id: data[0].club_id }));
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        setErrorMessage('Impossible de charger vos clubs');
      }
    } catch (error) {
      console.error('❌ Error fetching clubs:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      setErrorMessage('Erreur de connexion au serveur');
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

    // Validation
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

    if (!memberData.club_id) {
      setErrorMessage('Aucun club sélectionné');
      setLoading(false);
      return;
    }

    if (!user || !user.id) {
      setErrorMessage('Utilisateur non connecté');
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

      console.log('📤 Sending request payload:', requestPayload);
      console.log('📡 Request URL:', `${API_BASE_URL}/api/requests`);
      console.log('🔐 User ID:', user.id);

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // CRITICAL for session-based auth
        body: JSON.stringify(requestPayload)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', [...response.headers.entries()]);

      // Read response
      const responseText = await response.text();
      console.log('📥 Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📥 Parsed data:', data);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        console.error('❌ Raw response:', responseText);
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
        console.error('❌ Request failed:', data);
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
      console.error('❌ Catch block error:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error name:', error.name);
      setErrorMessage('Erreur de connexion au serveur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            Demande d'Ajout de Membre
          </h1>
          <p className="text-gray-600 text-lg">
            Cette demande sera soumise au président pour validation
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-500 text-green-700 px-6 py-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-lg">{successMessage}</p>
                <p className="text-sm mt-2 text-green-600">Notez bien le mot de passe pour le transmettre au membre.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500 text-red-700 px-6 py-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <pre className="font-semibold whitespace-pre-wrap text-sm">{errorMessage}</pre>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-orange-200">
          
          {/* Club Info Card */}
          {userClubs.length > 0 ? (
            <div className="mb-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white/80 text-sm">Ajouter au club</p>
                  <h3 className="text-2xl font-bold">{userClubs[0]?.club_name}</h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-xl">
              <p className="font-semibold">Aucun club trouvé. Vous devez être membre du bureau d'un club pour ajouter des membres.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* First Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={memberData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                placeholder="Entrez le prénom"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={memberData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                placeholder="Entrez le nom"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={memberData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={memberData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                placeholder="+212 6XX XXX XXX"
              />
            </div>

            {/* CNE */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                CNE
              </label>
              <input
                type="text"
                name="cne"
                value={memberData.cne}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                placeholder="Code National Étudiant"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={memberData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              >
                <option value="member">Membre</option>
                <option value="board">Membre du Bureau</option>
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Position {memberData.role === 'board' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="position"
                value={memberData.position}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                placeholder={memberData.role === 'board' ? "Ex: Trésorier, Secrétaire..." : "Ex: Membre actif, Bénévole..."}
              />
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Mot de passe temporaire <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="password"
                  value={memberData.password}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-yellow-600 transition-all font-mono"
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/50 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Générer
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Le membre devra changer ce mot de passe lors de sa première connexion
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading || userClubs.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
      </div>
    </div>
  );
};

export default BureauxAddMember;