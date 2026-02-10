import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddPresident = () => {
  const navigate = useNavigate();
  const [presidentData, setPresidentData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    cne: '',
    phone: '',
    avatar: null,
    club_id: '',
    position: 'Président'
  });

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // FIXED: Correct API base URL format
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      // FIXED: Use correct endpoint with /api/ prefix
      const response = await fetch(`${API_BASE_URL}/api/clubs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Clubs loaded:', data); // Debug log
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setErrors({ general: `Erreur lors du chargement des clubs: ${error.message}` });
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPresidentData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setPresidentData(prev => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
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
    if (!presidentData.email) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(presidentData.email)) newErrors.email = 'Email invalide';
    if (!presidentData.password) newErrors.password = 'Le mot de passe est requis';
    else if (presidentData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    if (presidentData.password !== presidentData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    if (!presidentData.club_id) newErrors.club_id = 'Le club est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('first_name', presidentData.first_name);
      formData.append('last_name', presidentData.last_name);
      formData.append('email', presidentData.email);
      formData.append('password', presidentData.password);
      formData.append('password_confirmation', presidentData.password_confirmation);
      formData.append('cne', presidentData.cne || '');
      formData.append('phone', presidentData.phone || '');
      
      if (presidentData.avatar) {
        formData.append('avatar', presidentData.avatar);
      }

      const personResponse = await fetch(`${API_BASE_URL}/api/persons`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const personData = await personResponse.json();

      if (!personResponse.ok) {
        setErrors({ general: personData.message || 'Erreur lors de la création de l\'utilisateur' });
        setLoading(false);
        return;
      }

      const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          person_id: personData.person.id,
          club_id: presidentData.club_id,
          role: 'president',
          position: presidentData.position,
          status: 'active'
        })
      });

      const memberData = await memberResponse.json();

      if (memberResponse.ok) {
        setSuccessMessage(`Président ${presidentData.first_name} ${presidentData.last_name} ajouté avec succès!`);
        
        setPresidentData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          password_confirmation: '',
          cne: '',
          phone: '',
          avatar: null,
          club_id: '',
          position: 'Président'
        });
        setAvatarPreview(null);

        setTimeout(() => {
          setSuccessMessage('');
          navigate('/admin');
        }, 2000);
      } else {
        setErrors({ general: memberData.message || 'Erreur lors de l\'assignation au club' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-red-500/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Navigation */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour au Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-8 py-12">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl text-center animate-fadeIn flex items-center justify-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-xl text-center animate-fadeIn flex items-center justify-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{errors.general}</span>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Ajouter un Président</h1>
                <p className="text-white/80">Créer un nouveau compte président pour un club</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Informations Personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Prénom *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={presidentData.first_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.first_name ? 'border-red-500 ring-2 ring-red-500' : 'border-white/20'
                    }`}
                    placeholder="Ex: Ahmed"
                  />
                  {errors.first_name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Nom *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={presidentData.last_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.last_name ? 'border-red-500 ring-2 ring-red-500' : 'border-white/20'
                    }`}
                    placeholder="Ex: El Mansouri"
                  />
                  {errors.last_name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">CNE</label>
                  <input
                    type="text"
                    name="cne"
                    value={presidentData.cne}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="Ex: R134567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={presidentData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="Ex: 0612345678"
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Avatar (optionnel)</label>
                {!avatarPreview ? (
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-blue-500 hover:bg-white/5 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-white text-sm font-medium block mb-1">Cliquez pour sélectionner une photo</span>
                          <span className="text-white/40 text-xs">PNG, JPG, GIF jusqu'à 2MB</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      name="avatar"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                      <img src={avatarPreview} alt="Avatar preview" className="h-20 w-20 object-cover rounded-full border-2 border-blue-500" />
                      <div className="flex-1">
                        <p className="text-white font-medium">Photo sélectionnée</p>
                        <p className="text-white/40 text-sm">{presidentData.avatar?.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPresidentData(prev => ({ ...prev, avatar: null }));
                          setAvatarPreview(null);
                        }}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Informations de Connexion
              </h2>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={presidentData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.email ? 'border-red-500 ring-2 ring-red-500' : 'border-white/20'
                  }`}
                  placeholder="Ex: ahmed@estfes.ma"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    value={presidentData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.password ? 'border-red-500 ring-2 ring-red-500' : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Confirmer mot de passe *</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={presidentData.password_confirmation}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.password_confirmation ? 'border-red-500 ring-2 ring-red-500' : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password_confirmation && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Club Assignment */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Assignation au Club
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Club *</label>
                  {loadingClubs ? (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="text-white/60 text-sm">Chargement des clubs...</span>
                    </div>
                  ) : clubs.length === 0 ? (
                    <div className="w-full px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-yellow-300 text-sm">Aucun club disponible. Veuillez d'abord créer un club.</p>
                    </div>
                  ) : (
                    <select
                      name="club_id"
                      value={presidentData.club_id}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                        errors.club_id ? 'border-red-500 ring-2 ring-red-500' : 'border-white/20'
                      }`}
                    >
                      <option value="" className="bg-slate-900">Sélectionner un club...</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id} className="bg-slate-900">
                          {club.name} ({club.category})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.club_id && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.club_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={presidentData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="Ex: Président"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-blue-300">
                  <p className="font-semibold mb-1">Note importante</p>
                  <p className="text-blue-200/80">Le président pourra se connecter avec l'email et le mot de passe définis. Il aura accès à toutes les fonctionnalités de gestion de son club.</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || loadingClubs || clubs.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Ajouter le Président
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AddPresident;