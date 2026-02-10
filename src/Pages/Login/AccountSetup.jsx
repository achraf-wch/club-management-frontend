import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const AccountSetup = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleStatus, setGoogleStatus] = useState({
    is_linked: false,
    google_email: null,
    has_password: true
  });

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    avatar: null
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (successParam === 'google_linked') {
      setSuccess('Compte Google lié avec succès!');
      setActiveTab('google');
      checkGoogleStatus();
      setTimeout(() => setSuccess(''), 5000);
    }

    if (errorParam) {
      const errorMessages = {
        'google_error': 'Erreur lors de la connexion à Google',
        'session_expired': 'Session expirée, veuillez réessayer',
        'user_not_found': 'Utilisateur non trouvé',
        'google_already_linked': 'Ce compte Google est déjà lié à un autre utilisateur'
      };
      setError(errorMessages[errorParam] || 'Une erreur est survenue');
      setActiveTab('google');
      setTimeout(() => setError(''), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'google') {
      checkGoogleStatus();
    }
  }, [activeTab]);

  if (!user) {
    return <Navigate to="/Login/login" replace />;
  }

  const checkGoogleStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/google/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleStatus(data);
      }
    } catch (err) {
      console.error('Error checking Google status:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('phone', profileData.phone || '');
      
      if (profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profil mis à jour avec succès!');
        if (updateUser && data.user) {
          updateUser(data.user);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Mot de passe changé avec succès!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkGoogleAccount = () => {
    setError('');
    window.location.href = `${API_BASE_URL}/api/auth/google/link`;
  };

  const handleUnlinkGoogleAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir délier votre compte Google?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/google/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Compte Google délié avec succès!');
        checkGoogleStatus();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Erreur lors de la déconnexion du compte Google');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid md:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            
            {/* Left Side - User Info & Navigation */}
            <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-blue-900 p-12 flex flex-col justify-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                {/* User Avatar */}
                <div className="mb-8 relative">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white animate-float">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <div className="text-red-600 text-4xl font-bold">
                          {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                </div>

                <h1 className="text-4xl font-bold text-white mb-2 text-center drop-shadow-lg">
                  {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-white/80 text-center mb-2">{user?.email}</p>
                <p className="text-white/60 text-center text-sm mb-8">Code: {user?.member_code}</p>

                {/* Tab Navigation - Vertical */}
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'profile'
                        ? 'bg-white text-red-600 shadow-xl'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Mon Profil</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'password'
                        ? 'bg-white text-red-600 shadow-xl'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Sécurité</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('google')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'google'
                        ? 'bg-white text-red-600 shadow-xl'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google</span>
                  </button>
                </div>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour au tableau de bord
                </button>
              </div>
            </div>

            {/* Right Side - Form Content */}
            <div className="p-12 bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
              {/* Messages */}
              {success && (
                <div className="mb-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg text-center animate-slideDown font-semibold flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg text-center animate-slideDown font-semibold flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Profile Form */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Mettre à jour le profil</h3>
                    <p className="text-gray-600">Personnalisez vos informations personnelles</p>
                  </div>

                  {/* Avatar Upload */}
                  <div className="text-center">
                    <label htmlFor="avatar-upload" className="inline-block cursor-pointer group">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 group-hover:border-red-500 transition-all duration-300 shadow-lg">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-red-500 to-blue-900 flex items-center justify-center">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-gray-600 group-hover:text-red-600 transition-colors">
                        Cliquez pour changer la photo
                      </p>
                      <input
                        id="avatar-upload"
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-300"
                      />
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        name="last_name"
                        required
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-300"
                      placeholder="+212 6 12 34 56 78"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-blue-900 text-white font-bold rounded-xl hover:from-red-700 hover:to-blue-950 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        Mettre à jour
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Password Form */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Changer le mot de passe</h3>
                    <p className="text-gray-600">Utilisez un mot de passe fort et unique</p>
                  </div>

                  {!googleStatus.has_password && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        Vous n'avez pas encore défini de mot de passe. Définissez-en un pour pouvoir vous connecter sans Google.
                      </p>
                    </div>
                  )}

                  {googleStatus.has_password && (
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe actuel</label>
                      <input
                        type="password"
                        name="current_password"
                        required
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-300"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      name="new_password"
                      required
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-300"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      name="new_password_confirmation"
                      required
                      value={passwordData.new_password_confirmation}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-300"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-blue-900 text-white font-bold rounded-xl hover:from-red-700 hover:to-blue-950 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Changement...
                      </>
                    ) : (
                      <>
                        Changer le mot de passe
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Google Tab */}
              {activeTab === 'google' && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {googleStatus.is_linked ? 'Compte Google lié' : 'Lier avec Google'}
                    </h3>
                    <p className="text-gray-600">
                      {googleStatus.is_linked 
                        ? `Connecté avec ${googleStatus.google_email}` 
                        : 'Connectez-vous facilement avec Google'}
                    </p>
                  </div>

                  {googleStatus.is_linked ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-800">Compte Google lié</p>
                            <p className="text-xs text-green-700 mt-1">{googleStatus.google_email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Avantages:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Connexion rapide sans mot de passe
                          </li>
                          <li className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Sécurité renforcée
                          </li>
                          <li className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Authentification simplifiée
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={handleUnlinkGoogleAccount}
                        disabled={isLoading || !googleStatus.has_password}
                        className="w-full py-4 border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Déconnexion...' : 'Délier le compte Google'}
                      </button>

                      {!googleStatus.has_password && (
                        <p className="text-xs text-yellow-600 text-center">
                          ⚠️ Définissez d'abord un mot de passe avant de délier votre compte Google
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Avantages de la connexion Google:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Connexion rapide sans saisir de mot de passe
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Sécurité renforcée avec l'authentification Google
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Gardez votre mot de passe actuel comme option de secours
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={handleLinkGoogleAccount}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all duration-300 group"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-gray-700 font-semibold text-lg">Lier mon compte Google</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AccountSetup;