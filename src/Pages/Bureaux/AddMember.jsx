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
      const response = await fetch(`${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserClubs(data);
        if (data.length > 0) {
          setMemberData(prev => ({ ...prev, club_id: data[0].club_id }));
        }
      } else {
        setErrorMessage('Impossible de charger vos clubs');
      }
    } catch (error) {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Return Button */}
        <button
          onClick={() => navigate('/Bureaux/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white shadow-md hover:shadow-lg rounded-xl text-gray-700 hover:text-blue-600 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Demande d'Ajout de Membre</h1>
              <p className="text-gray-600">Cette demande sera soumise au président pour validation</p>
            </div>
          </div>

          {userClubs.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-sm text-gray-600">Club sélectionné</p>
                  <p className="font-bold text-gray-800">{userClubs[0]?.club_name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-800 text-lg">{successMessage}</p>
                <p className="text-green-700 text-sm mt-1">Notez bien le mot de passe pour le transmettre au membre.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <pre className="font-semibold text-red-800 whitespace-pre-wrap text-sm">{errorMessage}</pre>
            </div>
          </div>
        )}

        {userClubs.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
            <span className="text-7xl mb-4 block">🏢</span>
            <p className="text-gray-600 text-lg">Vous devez être membre du bureau d'un club pour ajouter des membres.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {/* Form Sections */}
            <div className="space-y-8">
              {/* Section 1: Personal Info */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">1️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Informations Personnelles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={memberData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={memberData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="Entrez le nom"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">2️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Coordonnées</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={memberData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={memberData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      CNE
                    </label>
                    <input
                      type="text"
                      name="cne"
                      value={memberData.cne}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="Code National Étudiant"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Role */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">3️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Rôle et Position</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={memberData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="member">Membre</option>
                      <option value="board">Membre du Bureau</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Position {memberData.role === 'board' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={memberData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder={memberData.role === 'board' ? "Ex: Trésorier, Secrétaire..." : "Ex: Membre actif"}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Security */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">4️⃣</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Sécurité</h3>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Mot de passe temporaire <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="password"
                      value={memberData.password}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                      placeholder="Minimum 6 caractères"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
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
            </div>

            {/* Submit Button */}
            <div className="mt-10">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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