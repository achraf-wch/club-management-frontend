// filepath: src/features/login/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Button, Input, Alert } from '../../Componenets';

// 2FA Sub-component
const TwoFactorAuth = ({ pendingPersonId, API_BASE_URL, onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    if (!useRecovery && trimmed.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/2fa/verify-login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code: trimmed, person_id: pendingPersonId }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
      } else if (res.status === 429) {
        setError('Trop de tentatives. Attendez une minute.');
      } else if (res.status === 401) {
        setError('Session expirée. Reconnectez-vous.');
        setTimeout(() => onBack(), 2000);
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-white text-2xl font-bold mb-2">Vérification 2FA</h2>
        <p className="text-white/60 text-sm">
          {useRecovery 
            ? 'Entrez un de vos codes de récupération' 
            : 'Entrez le code à 6 chiffres de Google Authenticator'}
        </p>
      </div>

      {error && (
        <Alert type="error">{error}</Alert>
      )}

      <input
        type="text"
        maxLength={useRecovery ? 14 : 6}
        value={code}
        onChange={(e) => {
          const val = useRecovery ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '');
          setCode(val);
          setError('');
        }}
        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-mono text-white focus:outline-none focus:border-[#c0392b] transition-all"
        placeholder={useRecovery ? 'XXXX-XXXX' : '······'}
        autoFocus
        disabled={loading}
      />

      <Button
        variant="primary"
        fullWidth
        onClick={handleVerify}
        disabled={loading || (!useRecovery && code.length !== 6) || (useRecovery && code.trim().length < 10)}
        size="lg"
      >
        {loading ? 'Vérification...' : 'Vérifier'}
      </Button>

      <button
        type="button"
        onClick={() => { setUseRecovery(!useRecovery); setCode(''); setError(''); }}
        className="w-full text-white/40 hover:text-white text-sm transition-colors"
      >
        {useRecovery ? '← Utiliser Google Authenticator' : 'Utiliser un code de récupération'}
      </button>
      
      <button 
        type="button"
        onClick={onBack} 
        className="w-full text-white/20 hover:text-white/60 text-xs uppercase tracking-widest transition-colors"
      >
        ← Retour à la connexion
      </button>
    </div>
  );
};

const LoginForm = ({
  onSuccess,
  title = 'Connexion',
  subtitle = 'Connectez-vous à votre espace personnel',
  showForgotPassword = false,
  showRegisterInfo = true,
}) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccess] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingPersonId, setPending] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleRedirect = (role, clubRole) => {
    if (role === 'admin') navigate('/Admin/Dashboard', { replace: true });
    else if (role === 'user' && clubRole) {
      switch (clubRole) {
        case 'president': navigate('/club/dashboard', { replace: true }); break;
        case 'board': navigate('/club/dashboard', { replace: true }); break;
        case 'member': navigate('/Member/Dashboard', { replace: true }); break;
        default: setErrors({ general: 'Rôle club non reconnu' });
      }
    } else {
      setErrors({ general: "Vous n'êtes membre d'aucun club" });
    }
  };

  // Handle Google callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const googleLogin = searchParams.get('google_login');
      const error = searchParams.get('error');
      if (error) {
        const msgs = {
          account_not_found: "Aucun compte trouvé avec cet email Google. Veuillez d'abord lier votre compte Google depuis votre profil.",
          account_not_linked: "Aucun compte trouvé avec cet email Google. Veuillez d'abord lier votre compte Google depuis votre profil.",
          account_disabled: "Votre compte a été désactivé.",
          google_error: 'Erreur lors de la connexion avec Google. Veuillez réessayer.',
        };
        setErrors({ general: msgs[error] || 'Une erreur est survenue' });
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      if (googleLogin === 'success') {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/verify-session`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            if (authLogin) authLogin({ ...data.user, role: data.role, club_role: data.club_role });
            setSuccess('Connexion Google réussie!');
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => handleRedirect(data.role, data.club_role), 1500);
          } else {
            setErrors({ general: 'Session invalide. Veuillez vous reconnecter.' });
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch {
          setErrors({ general: 'Erreur de connexion au serveur' });
        } finally {
          setLoading(false);
        }
      }
      const requires2fa = searchParams.get('requires_2fa');
      const personId = searchParams.get('person_id');
      if (requires2fa === 'true' && personId) {
        setPending(parseInt(personId));
        setRequires2FA(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    handleGoogleCallback();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    setSuccess('');
    
    const newErrors = {};
    if (!loginData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = 'Email invalide';
    if (!loginData.password) newErrors.password = 'Le mot de passe est requis';
    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      setLoading(false); 
      return; 
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST', 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.requires_2fa) {
          setRequires2FA(true);
          setPending(data.person_id);
          setLoading(false);
          return;
        }
        setSuccess('Connexion réussie!');
        if (authLogin) authLogin({ ...data.user, role: data.role, club_role: data.club_role });
        if (onSuccess) {
          onSuccess(data);
        } else {
          setTimeout(() => handleRedirect(data.role, data.club_role), 1000);
        }
      } else {
        setErrors({ general: data.message || 'Email ou mot de passe incorrect' });
      }
    } catch (err) {
      setErrors({ general: `Erreur lors de la connexion: ${err.message}` });
    } finally { 
      setLoading(false); 
    }
  };

  // 2FA Screen
  if (requires2FA) {
    return (
      <TwoFactorAuth
        pendingPersonId={pendingPersonId}
        API_BASE_URL={API_BASE_URL}
        onSuccess={(data) => {
          if (authLogin) authLogin({ ...data.user, role: data.role, club_role: data.club_role });
          setSuccess('Connexion réussie!');
          if (onSuccess) {
            onSuccess(data);
          } else {
            handleRedirect(data.role, data.club_role);
          }
        }}
        onBack={() => { setRequires2FA(false); setPending(null); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {successMessage && (
        <Alert type="success" dismissible onDismiss={() => setSuccess('')}>
          {successMessage}
        </Alert>
      )}

      {errors.general && (
        <Alert type="error" dismissible onDismiss={() => setErrors({})}>
          {errors.general}
        </Alert>
      )}

      {/* Google Login */}
      <Button
        variant="outline"
        fullWidth
        onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google/`}
        disabled={loading}
        className="mb-6"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuer avec Google
      </Button>

      <div className="relative mb-8 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
        <span className="relative px-4 text-white/20 text-xs uppercase tracking-widest bg-transparent">ou avec email</span>
      </div>

      <Input
        type="email"
        name="email"
        placeholder="Adresse email"
        value={loginData.email}
        onChange={handleChange}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        error={errors.email}
        disabled={loading}
      />

      <Input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={loginData.password}
        onChange={handleChange}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        error={errors.password}
        disabled={loading}
      />

      {showForgotPassword && (
        <div className="text-right">
          <button type="button" className="text-sm text-white/60 hover:text-white transition-colors">
            Mot de passe oublié ?
          </button>
        </div>
      )}

      <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading} size="lg">
        Se connecter
      </Button>

      {showRegisterInfo && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-white/30 text-xs leading-relaxed">
            Vous n'avez pas encore de compte ? Rejoignez un club de votre établissement et votre accès sera créé par votre responsable de club.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;