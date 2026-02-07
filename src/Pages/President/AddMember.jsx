import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';

const PresidentAddMember = () => {
  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const { user } = useAuth();

  const [memberData, setMemberData] = useState({
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

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchMyClub();
  }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClub(data);
      } else {
        setErrorMessage('Impossible de charger votre club');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
      setErrorMessage('Erreur de connexion');
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
    if (!club) {
      setErrorMessage('Aucun club trouvé');
      setLoading(false);
      return;
    }

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
      // Step 1: Create the person account
      const personResponse = await fetch(`${API_BASE_URL}/api/persons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: memberData.first_name.trim(),
          last_name: memberData.last_name.trim(),
          email: memberData.email.trim().toLowerCase(),
          phone: memberData.phone.trim() || null,
          cne: memberData.cne.trim() || null,
          password: memberData.password,
          password_confirmation: memberData.password_confirmation
        })
      });

      const personData = await personResponse.json();
      
      console.log('Person Response:', personData);

      if (!personResponse.ok) {
        // Handle validation errors
        if (personData.errors) {
          const errorMessages = Object.entries(personData.errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('\n');
          setErrorMessage(errorMessages);
        } else {
          setErrorMessage(personData.message || 'Erreur lors de la création du compte');
        }
        setLoading(false);
        return;
      }

      // Extract person ID from response
      const personId = personData.person?.id || personData.id;
      
      console.log('Extracted Person ID:', personId);
      
      if (!personId) {
        setErrorMessage('Erreur: ID de la personne non trouvé dans la réponse');
        setLoading(false);
        return;
      }

      // Step 2: Add person to club as member
      console.log('Adding member to club with:', {
        person_id: personId,
        club_id: parseInt(club.id),
        role: memberData.role,
        position: memberData.position.trim() || null,
        status: 'active'
      });

      const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          person_id: personId,
          club_id: parseInt(club.id),
          role: memberData.role,
          position: memberData.position.trim() || null,
          status: 'active'
        })
      });

      const memberResponseData = await memberResponse.json();
      
      console.log('Member Response:', memberResponseData);

      if (memberResponse.ok) {
        setGeneratedPassword(memberData.password);
        setSuccessMessage(`✓ Membre ajouté avec succès au club ${club.name}! Mot de passe temporaire: ${memberData.password}`);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setMemberData({
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
          setGeneratedPassword('');
        }, 5000);
      } else {
        if (memberResponseData.errors) {
          const errorMessages = Object.entries(memberResponseData.errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('\n');
          setErrorMessage(errorMessages);
        } else {
          setErrorMessage(memberResponseData.message || 'Erreur lors de l\'ajout au club');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Erreur de connexion au serveur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ajouter un Membre</h1>
          {club && (
            <div className="flex items-center gap-3 mt-2">
              {club.logo_url && (
                <img src={club.logo_url} alt={club.name} className="w-8 h-8 rounded-full object-cover" />
              )}
              <p className="text-gray-600">Ajoutez un nouveau membre à votre club: <span className="font-semibold">{club.name}</span></p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold">{successMessage}</p>
                <p className="text-sm mt-2">Notez bien le mot de passe pour le transmettre au membre.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <pre className="font-semibold whitespace-pre-wrap text-sm">{errorMessage}</pre>
            </div>
          </div>
        )}

        {!club ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-600 text-lg mb-4">Chargement de votre club...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Club Info Display (Read-only) */}
              <div className="md:col-span-2 mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {club.logo_url && (
                      <img src={club.logo_url} alt={club.name} className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800">{club.name}</h3>
                      <p className="text-sm text-gray-600">{club.category}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    Club Président
                  </span>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={memberData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez le prénom"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={memberData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez le nom"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={memberData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={memberData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              {/* CNE */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  CNE
                </label>
                <input
                  type="text"
                  name="cne"
                  value={memberData.cne}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Code National Étudiant"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Rôle dans le club <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={memberData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="member">Membre Simple</option>
                  <option value="board">Membre du Bureau</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">
                  {memberData.role === 'board' ? '👔 Membre du bureau avec position spécifique' : '👤 Membre régulier du club'}
                </p>
              </div>

              {/* Position */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Position {memberData.role === 'board' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="position"
                  value={memberData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={memberData.role === 'board' ? "Ex: Trésorier, Secrétaire..." : "Ex: Membre actif, Bénévole..."}
                />
                {memberData.role === 'board' && (
                  <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Position requise pour les membres du bureau
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Mot de passe temporaire <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="password"
                    value={memberData.password}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
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
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Ajouter le Membre
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

export default PresidentAddMember;