import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const TwoFactorSetup = ({ user, API_BASE_URL }) => {
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [is2FAEnabled, set2FA] = useState(user?.two_factor_enabled || false);

  const inputCls = 'w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 placeholder-slate-500 text-center text-2xl font-mono tracking-widest';

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/2fa/setup`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setStatus('setup');
      } else {
        setError(data.message || 'Erreur');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (code.length !== 6) {
      setError('Entrez un code à 6 chiffres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/2fa/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('2FA activé avec succès! 🎉');
        set2FA(true);
        setStatus('enabled');
        setCode('');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'Code incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) {
      setError('Entrez le code pour confirmer');
      return;
    }
    if (!window.confirm('Désactiver le 2FA réduit la sécurité. Continuer?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('2FA désactivé');
        set2FA(false);
        setStatus(null);
        setCode('');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'Code incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-1">Double Authentification</h3>
        <p className="text-slate-500 text-sm">Protégez votre compte avec Google Authenticator</p>
      </div>

      {success && (
        <div className="bg-emerald-900/30 border border-emerald-700/50 text-emerald-200 px-5 py-4 rounded-lg flex items-center gap-3 backdrop-blur-sm">
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-sm">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-900/30 border border-rose-700/50 text-rose-200 px-5 py-4 rounded-lg flex items-center gap-3 backdrop-blur-sm">
          <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-sm">{error}</span>
        </div>
      )}

      <div className={`px-5 py-4 rounded-lg border flex items-center gap-3 ${is2FAEnabled ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-rose-900/20 border-rose-700/40'}`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${is2FAEnabled ? 'bg-emerald-400' : 'bg-rose-500'}`} />
        <div>
          <p className={`text-sm font-semibold ${is2FAEnabled ? 'text-emerald-300' : 'text-rose-300'}`}>
            {is2FAEnabled ? '2FA Activé ✓' : '2FA Désactivé'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {is2FAEnabled ? 'Votre compte est protégé par double authentification' : 'Activez le 2FA pour sécuriser votre compte'}
          </p>
        </div>
      </div>

      {!is2FAEnabled && status !== 'setup' && (
        <button onClick={handleSetup} disabled={isLoading}
          className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 overflow-hidden flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {isLoading ? 'Chargement...' : 'Activer le 2FA'}
        </button>
      )}

      {status === 'setup' && (
        <div className="space-y-5">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
            <p className="text-white font-semibold mb-1">Étape 1 — Scanner le QR Code</p>
            <p className="text-slate-400 text-sm mb-4">
              Ouvrez <span className="text-red-400 font-medium">Google Authenticator</span> ou <span className="text-red-400 font-medium">Authy</span> et scannez ce QR code
            </p>
            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-xl mb-3">
                <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
              </div>
            )}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Ou entrez ce code manuellement :</p>
              <p className="text-blue-400 font-mono text-sm tracking-widest break-all">{secret}</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
            <p className="text-white font-semibold mb-1">Étape 2 — Confirmer</p>
            <p className="text-slate-400 text-sm mb-4">Entrez le code à 6 chiffres affiché dans l'application</p>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyPress={(e) => e.key === 'Enter' && handleEnable()}
              className={inputCls}
              placeholder="000000"
              disabled={isLoading}
            />
          </div>

          <button onClick={handleEnable} disabled={isLoading || code.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-500/30">
            {isLoading ? 'Vérification...' : 'Confirmer et activer'}
          </button>

          <button onClick={() => { setStatus(null); setCode(''); setError(''); }}
            className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Annuler
          </button>
        </div>
      )}

      {is2FAEnabled && (
        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
            <p className="text-white font-semibold mb-1">Désactiver le 2FA</p>
            <p className="text-slate-400 text-sm mb-4">Entrez votre code actuel pour désactiver</p>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              className={inputCls}
              placeholder="000000"
              disabled={isLoading}
            />
          </div>
          <button onClick={handleDisable} disabled={isLoading || code.length !== 6}
            className="w-full py-3.5 border-2 border-rose-700/50 text-rose-400 font-bold rounded-lg hover:bg-rose-950/20 transition-all duration-300 disabled:opacity-50 text-sm">
            {isLoading ? 'Désactivation...' : 'Désactiver le 2FA'}
          </button>
        </div>
      )}
    </div>
  );
};

const AccountSetup = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleStatus, setGoogleStatus] = useState({ is_linked: false, google_email: null, has_password: true });

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
    if (user?.avatar_url) setAvatarPreview(`${user.avatar_url}?t=${Date.now()}`);
  }, [user?.avatar_url]);

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
        google_error: 'Erreur lors de la connexion à Google',
        session_expired: 'Session expirée, veuillez réessayer',
        user_not_found: 'Utilisateur non trouvé',
        google_already_linked: 'Ce compte Google est déjà lié à un autre utilisateur'
      };
      setError(errorMessages[errorParam] || 'Une erreur est survenue');
      setActiveTab('google');
      setTimeout(() => setError(''), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'google') checkGoogleStatus();
  }, [activeTab]);

  if (!user) return <Navigate to="/Login/login" replace />;

  const checkGoogleStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/google/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }
    setProfileData(prev => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
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
      if (profileData.avatar instanceof File) formData.append('avatar', profileData.avatar);
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Profil mis à jour avec succès!');
        setProfileData(prev => ({ ...prev, avatar: null }));
        if (updateUser && data.user) updateUser(data.user);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch {
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
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Mot de passe changé avec succès!');
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch {
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
    if (!window.confirm('Êtes-vous sûr de vouloir délier votre compte Google?')) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/google/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:bg-slate-800/70 transition-all duration-300 placeholder-slate-500';

  const tabs = [
    { id: 'profile', label: 'Mon Profil', icon: 'profile' },
    { id: 'password', label: 'Sécurité', icon: 'security' },
    { id: 'google', label: 'Google', icon: 'google' },
    { id: 'twofa', label: '2FA', icon: 'twofa' }
  ];

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'profile':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'security':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'twofa':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-10 flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-blue-600/20 border border-slate-600/50 hover:border-blue-500/50 rounded-lg transition-all duration-300 backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">Paramètres du Compte</h1>
            <p className="text-slate-400 text-sm mt-2">Gérez vos informations personnelles et sécurité</p>
          </div>
          <div className="w-24"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[320px_1fr] gap-0 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">

          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 p-8 flex flex-col">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500/40 shadow-xl ring-4 ring-slate-800">
                  {avatarPreview ? (
                    <img key={avatarPreview} src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" onError={() => setAvatarPreview('')} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-slate-800 flex items-center justify-center">
                      <span className="text-red-400 text-3xl font-bold">{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-0.5 rounded-full shadow-lg">
                  <span className="text-white text-xs font-bold tracking-widest">PRO</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mt-4 mb-1">{user?.first_name} {user?.last_name}</h2>
              <p className="text-slate-400 text-sm mb-1">{user?.email}</p>
              <p className="text-blue-300/70 text-xs font-mono bg-blue-900/20 border border-blue-700/40 px-3 py-1 rounded-full inline-block">{user?.member_code}</p>
            </div>

            <div className="h-px bg-slate-700/50 mb-6"></div>

            <nav className="space-y-2 flex-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 text-left ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border border-blue-500/40 text-blue-300 shadow-lg' : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200 border border-transparent'}`}>
                  <span className={activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'}>{renderIcon(tab.icon)}</span>
                  {tab.label}
                  {activeTab === tab.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </button>
              ))}
            </nav>

            <div className="h-px bg-slate-700/50 my-6"></div>
          </div>

          <div className="bg-slate-900/50 px-10 py-8 pb-4 overflow-hidden">

            {success && (
              <div className="mb-6 bg-emerald-900/30 border border-emerald-700/50 text-emerald-200 px-5 py-4 rounded-lg flex items-center gap-3 animate-slideDown backdrop-blur-sm">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-sm">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-rose-900/30 border border-rose-700/50 text-rose-200 px-5 py-4 rounded-lg flex items-center gap-3 animate-slideDown backdrop-blur-sm">
                <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-sm">{error}</span>
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6 animate-fadeIn">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-1">Mettre à jour le profil</h3>
                  <p className="text-slate-400 text-sm">Personnalisez vos informations personnelles</p>
                </div>
                <div className="text-center mb-8">
                  <label htmlFor="avatar-upload" className="inline-block cursor-pointer group">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/40 group-hover:border-blue-400/80 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/30">
                        {avatarPreview ? (
                          <img key={avatarPreview} src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" onError={() => setAvatarPreview('')} />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600/60 to-slate-800 flex items-center justify-center">
                            <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      {profileData.avatar && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-black flex items-center justify-center">
                          <span className="text-black text-xs font-bold">!</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
                      {profileData.avatar ? 'Cliquez "Mettre à jour" pour sauvegarder' : 'Cliquez pour changer la photo'}
                    </p>
                    <input id="avatar-upload" type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prénom</label>
                    <input type="text" name="first_name" required value={profileData.first_name} onChange={handleProfileChange} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nom</label>
                    <input type="text" name="last_name" required value={profileData.last_name} onChange={handleProfileChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Téléphone</label>
                  <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className={inputCls} placeholder="+212 6 12 34 56 78" />
                </div>
                <button type="submit" disabled={isLoading}
                  className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 overflow-hidden flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30">
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
                      <span>Mettre à jour</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6 animate-fadeIn">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-1">Changer le mot de passe</h3>
                  <p className="text-slate-400 text-sm">Utilisez un mot de passe fort et unique</p>
                </div>
                {!googleStatus.has_password && (
                  <div className="bg-amber-900/25 border-l-4 border-amber-600/60 px-4 py-3 rounded-lg">
                    <p className="text-sm text-amber-200">Vous n'avez pas encore défini de mot de passe.</p>
                  </div>
                )}
                {googleStatus.has_password && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mot de passe actuel</label>
                    <input type="password" name="current_password" required value={passwordData.current_password} onChange={handlePasswordChange} className={inputCls} placeholder="••••••••" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nouveau mot de passe</label>
                  <input type="password" name="new_password" required value={passwordData.new_password} onChange={handlePasswordChange} className={inputCls} placeholder="••••••••" />
                  <p className="mt-1.5 text-xs text-slate-500">Minimum 6 caractères</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                  <input type="password" name="new_password_confirmation" required value={passwordData.new_password_confirmation} onChange={handlePasswordChange} className={inputCls} placeholder="••••••••" />
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-500/30">
                  {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </form>
            )}

            {activeTab === 'google' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-1">{googleStatus.is_linked ? 'Compte Google lié' : 'Lier avec Google'}</h3>
                  <p className="text-slate-400 text-sm">{googleStatus.is_linked ? `Connecté avec ${googleStatus.google_email}` : 'Connectez-vous facilement avec Google'}</p>
                </div>
                {googleStatus.is_linked ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-900/20 border border-emerald-700/40 px-5 py-4 rounded-lg flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">Compte Google lié</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{googleStatus.google_email}</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleUnlinkGoogleAccount} disabled={isLoading || !googleStatus.has_password}
                      className="w-full py-3.5 border-2 border-rose-700/50 text-rose-400 font-bold rounded-lg hover:bg-rose-950/20 transition-all duration-300 disabled:opacity-50 text-sm">
                      {isLoading ? 'Déconnexion...' : 'Délier le compte Google'}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={handleLinkGoogleAccount}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-500/30">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-white font-semibold">Lier mon compte Google</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'twofa' && (
              <TwoFactorSetup user={user} API_BASE_URL={API_BASE_URL} />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default AccountSetup;