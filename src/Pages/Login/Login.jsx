import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import Navbar from '../../Componenets/Navbar';


// --- SUB-COMPONENT: 2FA SCREEN (Matches AllEvents Style) ---
const TwoFactorScreen = ({ pendingPersonId, onSuccess, onBack, API_BASE_URL, darkMode }) => {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md relative z-10">
        <div className={`rounded-3xl p-8 border backdrop-blur-xl transition-all duration-500 ${
          darkMode 
            ? 'bg-black/60 border-white/10 shadow-2xl shadow-black' 
            : 'bg-white/10 border-white/20 shadow-2xl'
        }`}>
          <div className="text-center mb-8">
            <div className="w-16 h-1 bg-[#c0392b] mx-auto mb-6"></div>
            <h2 className="text-white text-3xl font-bold mb-2">Vérification 2FA</h2>
            <p className="text-white/60 text-sm">
              {useRecovery ? 'Entrez un de vos codes de récupération' : 'Entrez le code à 6 chiffres de Google Authenticator'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
              {error}
            </div>
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
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-mono text-white focus:outline-none focus:border-[#c0392b] transition-all mb-6"
            placeholder={useRecovery ? 'XXXX-XXXX' : '······'}
            autoFocus
            disabled={loading}
          />

          <button
            onClick={handleVerify}
            disabled={loading || (!useRecovery && code.length !== 6) || (useRecovery && code.trim().length < 10)}
            className="w-full py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#c0392b]/20 mb-4 disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>

          <button
            onClick={() => { setUseRecovery(!useRecovery); setCode(''); setError(''); }}
            className="w-full text-white/40 hover:text-white text-sm transition-colors mb-4"
          >
            {useRecovery ? '← Utiliser Google Authenticator' : 'Utiliser un code de récupération'}
          </button>
          
          <button 
            onClick={onBack} 
            className="w-full text-white/20 hover:text-white/60 text-xs uppercase tracking-widest transition-colors"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT: LOGIN ---
const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccess] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingPersonId, setPending] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleRedirect = (role, clubRole) => {
    if (role === 'admin') navigate('/Admin/Dashboard', { replace: true });
    else if (role === 'user' && clubRole) {
      switch (clubRole) {
        case 'president': navigate('/President/Dashboard', { replace: true }); break;
        case 'board': navigate('/Bureaux/Dashboard', { replace: true }); break;
        case 'member': navigate('/Member/Dashboard', { replace: true }); break;
        default: setErrors({ general: 'Rôle club non reconnu' });
      }
    } else {
      setErrors({ general: "Vous n'êtes membre d'aucun club" });
    }
  };

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
        window.history.replaceState({}, document.title, '/Login/login');
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
            window.history.replaceState({}, document.title, '/Login/login');
            setTimeout(() => handleRedirect(data.role, data.club_role), 1500);
          } else {
            setErrors({ general: 'Session invalide. Veuillez vous reconnecter.' });
            window.history.replaceState({}, document.title, '/Login/login');
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
        window.history.replaceState({}, document.title, '/Login/login');
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
        setTimeout(() => handleRedirect(data.role, data.club_role), 1000);
      } else {
        setErrors({ general: data.message || 'Email ou mot de passe incorrect' });
      }
    } catch (err) {
      setErrors({ general: `Erreur lors de la connexion: ${err.message}` });
    } finally { 
      setLoading(false); 
    }
  };

  if (requires2FA) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#06163A'}}>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#c0392b]/10 rounded-full blur-3xl animate-pulse"></div>
        <TwoFactorScreen
          pendingPersonId={pendingPersonId}
          API_BASE_URL={API_BASE_URL}
          darkMode={darkMode}
          onSuccess={(data) => {
            if (authLogin) authLogin({ ...data.user, role: data.role, club_role: data.club_role });
            setSuccess('Connexion réussie!');
            handleRedirect(data.role, data.club_role);
          }}
          onBack={() => { setRequires2FA(false); setPending(null); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-hidden relative" style={{backgroundColor: '#06163A'}}>
      <Navbar />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#c0392b]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#c0392b]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-center min-h-screen px-4 pt-20 gap-0 md:gap-8">
        {/* Left column */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <img src="/imgs/logo2.png" alt="CluVersity" className="h-28 md:h-36 mx-auto mb-6 drop-shadow-2xl login-logo-animate" />
              <div className="w-12 h-1 bg-[#c0392b] mx-auto mb-4"></div>
              <h1 className="text-white text-4xl font-bold">Bienvenue</h1>
              <p className="text-white/50 mt-2">Connectez-vous à votre espace personnel</p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
          <div className={`w-full max-w-md rounded-3xl p-8 border backdrop-blur-md transition-all duration-500 login-card-animate ${
            darkMode 
              ? 'bg-black/40 border-white/10 shadow-2xl shadow-black' 
              : 'bg-white/5 border-white/20 shadow-xl shadow-black/20'
          }`}>
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 text-sm text-center">
                {successMessage}
              </div>
            )}
            {errors.general && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
                {errors.general}
              </div>
            )}

            {/* Google Login */}
            <button
              onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google/`}
              disabled={loading}
              className="w-full mb-8 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-semibold">Continuer avec Google</span>
            </button>

            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative px-4 text-white/20 text-xs uppercase tracking-widest bg-transparent">ou avec email</span>
            </div>

            <div className="space-y-5">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Adresse email"
                  value={loginData.email}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className={`w-full px-5 py-4 bg-white/5 border rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#c0392b] transition-all login-input-animate ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 ml-2">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={loginData.password}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className={`w-full px-5 py-4 bg-white/5 border rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#c0392b] transition-all login-input-animate ${errors.password ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500 ml-2">{errors.password}</p>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#c0392b]/20 active:scale-95 flex items-center justify-center gap-2 login-btn-animate"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </>
                ) : 'Se connecter'}
              </button>
            </div>

            {/* Note replacing "forgot password" and "create account" */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/30 text-xs leading-relaxed">
                Vous n'avez pas encore de compte ? Rejoignez un club de votre établissement et votre accès sera créé par votre responsable de club.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;