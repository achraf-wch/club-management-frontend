import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../Componenets/Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import logo from '../../imgs/CluVer.png';

const YetiCharacter = ({ focusedField, mousePos, typing }) => {
  const circleRef = useRef(null);
  const isCovering = focusedField === 'password';
  const isWatching = focusedField === 'email';
  const isTyping   = typing && isWatching;

  const getOffset = () => {
    if (!circleRef.current) return { dx: 0, dy: 0 };
    const rect = circleRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    return { dx: (mousePos?.x || 0) - cx, dy: (mousePos?.y || 0) - cy };
  };
  const { dx, dy } = getOffset();
  const MAX = 4;
  const ex = Math.max(-MAX, Math.min(MAX, dx / 30));
  const ey = Math.max(-MAX, Math.min(MAX, dy / 30));
  const headRotateX = Math.max(-8, Math.min(8, dy / 25));
  const headRotateY = Math.max(-10, Math.min(10, dx / 20));
  const headTransform = `rotate(${headRotateY * 0.5}, 70, 90) skewX(${headRotateY * 0.3}) skewY(${headRotateX * 0.2})`;

  return (
    <div style={{ userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={circleRef} style={{
        width: 160, height: 160, borderRadius: '50%',
        background: 'linear-gradient(145deg, #1a3050 0%, #0a1929 100%)',
        border: '3px solid rgba(84,172,191,0.45)',
        boxShadow: '0 8px 40px rgba(84,172,191,0.28), inset 0 2px 8px rgba(84,172,191,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        animation: 'floatYeti 3.2s ease-in-out infinite', flexShrink: 0,
      }}>
        <svg width="140" height="155" viewBox="0 0 140 155" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="70" cy="148" rx="56" ry="30" fill="#b8d4e8" />
          <ellipse cx="70" cy="142" rx="50" ry="25" fill="#c8dff0" />
          <ellipse cx="24" cy="132" rx="20" ry="15" fill="#b8d4e8" />
          <ellipse cx="116" cy="132" rx="20" ry="15" fill="#b8d4e8" />
          <ellipse cx="18" cy="126" rx="14" ry="11" fill="#cce4f4" />
          <ellipse cx="122" cy="126" rx="14" ry="11" fill="#cce4f4" />
          {[20,29,38].map((x,i)=>(<ellipse key={i} cx={x} cy={118-i*2} rx="6" ry="10" fill="#d4eaf8" transform={`rotate(${-20+i*5} ${x} ${118-i*2})`}/>))}
          {[120,111,102].map((x,i)=>(<ellipse key={i} cx={x} cy={118-i*2} rx="6" ry="10" fill="#d4eaf8" transform={`rotate(${20-i*5} ${x} ${118-i*2})`}/>))}
          <ellipse cx="70" cy="126" rx="24" ry="15" fill="#c8dff0" />
          <g transform={headTransform} style={{ transition: 'transform 0.12s ease-out' }}>
            <ellipse cx="70" cy="90" rx="46" ry="44" fill="#d4eaf8" />
            {[40,50,58,66,74,82,90,100].map((x,i)=>(<ellipse key={i} cx={x} cy={50+(i===0||i===7?6:i===1||i===6?3:0)} rx="7" ry="12" fill="#e2f0fa" transform={`rotate(${-30+i*8} ${x} 50)`}/>))}
            <ellipse cx="70" cy="93" rx="38" ry="36" fill="#ddeef8" />
            <ellipse cx="54" cy="90" rx="12" ry="12" fill="white" />
            <ellipse cx="86" cy="90" rx="12" ry="12" fill="white" />
            {!isCovering && (<>
              <circle cx={54+ex} cy={90+ey} r="7.5" fill="#1a3a5f" style={{transition:'cx 0.08s linear,cy 0.08s linear'}}/>
              <circle cx={86+ex} cy={90+ey} r="7.5" fill="#1a3a5f" style={{transition:'cx 0.08s linear,cy 0.08s linear'}}/>
              <circle cx={54+ex} cy={90+ey} r="4" fill="#060c18" style={{transition:'cx 0.08s linear,cy 0.08s linear'}}/>
              <circle cx={86+ex} cy={90+ey} r="4" fill="#060c18" style={{transition:'cx 0.08s linear,cy 0.08s linear'}}/>
              <circle cx={51+ex} cy={87+ey} r="2.5" fill="white" opacity="0.85" style={{transition:'cx 0.08s linear,cy 0.08s linear'}}/>
              <circle cx={83+ex} cy={87+ey} r="2.5" fill="white" opacity="0.85" style={{transition:'cx 0.08s linear,cy 0.08s linear'}}/>
            </>)}
            {isCovering && (<>
              <path d="M 46 90 Q 54 84 62 90" stroke="#a8c8e0" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M 78 90 Q 86 84 94 90" stroke="#a8c8e0" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <g style={{animation:'riseLeft 0.45s cubic-bezier(0.22,1,0.36,1) forwards'}}>
                <rect x="0" y="118" width="62" height="26" rx="13" fill="#c0d8ee"/>
                <rect x="0" y="120" width="60" height="22" rx="11" fill="#cce4f4"/>
                <ellipse cx="62" cy="110" rx="22" ry="18" fill="#cce4f4"/>
                <ellipse cx="62" cy="110" rx="18" ry="15" fill="#d8eef8"/>
                <ellipse cx="48" cy="94" rx="7" ry="14" fill="#cce4f4" transform="rotate(-12 48 94)"/>
                <ellipse cx="58" cy="90" rx="7" ry="15" fill="#cce4f4" transform="rotate(-4 58 90)"/>
                <ellipse cx="68" cy="90" rx="7" ry="15" fill="#cce4f4" transform="rotate(4 68 90)"/>
                <ellipse cx="77" cy="94" rx="6" ry="13" fill="#cce4f4" transform="rotate(12 77 94)"/>
                <ellipse cx="42" cy="108" rx="6" ry="11" fill="#cce4f4" transform="rotate(-28 42 108)"/>
              </g>
              <g style={{animation:'riseRight 0.45s cubic-bezier(0.22,1,0.36,1) forwards'}}>
                <rect x="78" y="118" width="62" height="26" rx="13" fill="#c0d8ee"/>
                <rect x="80" y="120" width="60" height="22" rx="11" fill="#cce4f4"/>
                <ellipse cx="78" cy="110" rx="22" ry="18" fill="#cce4f4"/>
                <ellipse cx="78" cy="110" rx="18" ry="15" fill="#d8eef8"/>
                <ellipse cx="92" cy="94" rx="7" ry="14" fill="#cce4f4" transform="rotate(12 92 94)"/>
                <ellipse cx="82" cy="90" rx="7" ry="15" fill="#cce4f4" transform="rotate(4 82 90)"/>
                <ellipse cx="72" cy="90" rx="7" ry="15" fill="#cce4f4" transform="rotate(-4 72 90)"/>
                <ellipse cx="63" cy="94" rx="6" ry="13" fill="#cce4f4" transform="rotate(-12 63 94)"/>
                <ellipse cx="98" cy="108" rx="6" ry="11" fill="#cce4f4" transform="rotate(28 98 108)"/>
              </g>
            </>)}
            {!isCovering && (<>
              <path d={isWatching?"M 44 78 Q 54 74 64 78":"M 44 76 Q 54 72 64 76"} stroke="#5a9ab5" strokeWidth="3" fill="none" strokeLinecap="round" style={{transition:'d 0.3s ease'}}/>
              <path d={isWatching?"M 76 78 Q 86 74 96 78":"M 76 76 Q 86 72 96 76"} stroke="#5a9ab5" strokeWidth="3" fill="none" strokeLinecap="round" style={{transition:'d 0.3s ease'}}/>
            </>)}
            <ellipse cx="70" cy="106" rx="9" ry="6" fill="#5a9ab5"/>
            <ellipse cx="70" cy="105" rx="7" ry="4" fill="#6ab0cc"/>
            {!isCovering && <path d="M 58 114 Q 70 124 82 114" stroke="#5a9ab5" strokeWidth="3" fill="none" strokeLinecap="round"/>}
            {isCovering  && <path d="M 60 118 Q 70 114 80 118" stroke="#5a9ab5" strokeWidth="3" fill="none" strokeLinecap="round"/>}
            <ellipse cx="38" cy="108" rx="14" ry="9" fill="rgba(255,150,150,0.2)"/>
            <ellipse cx="102" cy="108" rx="14" ry="9" fill="rgba(255,150,150,0.2)"/>
          </g>
          <style>{`
            @keyframes riseLeft  { from{transform:translateY(50px) translateX(-20px);opacity:0} to{transform:translateY(0) translateX(0);opacity:1} }
            @keyframes riseRight { from{transform:translateY(50px) translateX(20px);opacity:0}  to{transform:translateY(0) translateX(0);opacity:1} }
          `}</style>
        </svg>
      </div>
      <div className="mt-3 px-4 py-1.5 rounded-2xl text-xs font-semibold text-center relative transition-all duration-400"
        style={{ background:'linear-gradient(135deg,#011C40,#023859)', border:'1px solid rgba(84,172,191,0.35)', color:'#A7EBF2', minWidth:'165px', boxShadow:'0 4px 20px rgba(84,172,191,0.12)' }}>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
          style={{ background:'#011C40', borderLeft:'1px solid rgba(84,172,191,0.35)', borderTop:'1px solid rgba(84,172,191,0.35)' }}/>
        {isCovering ? '🙈 Je ne regarde pas !' : isTyping ? '🤔 Hmm...' : isWatching ? '👀 Je surveille...' : '👋 Bienvenue !'}
      </div>
      <style>{`@keyframes floatYeti { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)} }`}</style>
    </div>
  );
};

// ── 2FA SCREEN — updated with recovery code support ──────────
const TwoFactorScreen = ({ pendingPersonId, onSuccess, onBack, API_BASE_URL }) => {
  const [code, setCode]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [useRecovery, setUseRecovery] = useState(false);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    if (!useRecovery && trimmed.length !== 6) return;

    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/2fa/verify-login`, {
        method: 'POST', credentials: 'include',
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
    } catch { setError('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0a0a 55%,#050505 100%)' }}>
      <div className="w-full max-w-md">
        <div className="p-8 rounded-3xl"
          style={{ background:'linear-gradient(160deg,rgba(1,28,64,0.92) 0%,rgba(10,25,41,0.97) 100%)', border:'1px solid rgba(84,172,191,0.18)', boxShadow:'0 30px 70px rgba(0,0,0,0.55)' }}>

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background:'rgba(239,68,68,0.1)', border:'2px solid rgba(239,68,68,0.3)' }}>
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Vérification 2FA</h2>
            <p className="text-gray-500 text-sm">
              {useRecovery
                ? 'Entrez un de vos codes de récupération (XXXX-XXXX-XXXX)'
                : 'Ouvrez Google Authenticator et entrez le code à 6 chiffres'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl flex items-center gap-3"
              style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.25)' }}>
              <span className="text-red-400">✗</span>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-semibold mb-3 tracking-widest uppercase text-center"
              style={{ color:'#54ACBF' }}>
              {useRecovery ? 'Code de récupération' : "Code d'authentification"}
            </label>
            <input
              type="text"
              maxLength={useRecovery ? 14 : 6}
              value={code}
              onChange={(e) => {
                const val = useRecovery
                  ? e.target.value.toUpperCase()
                  : e.target.value.replace(/\D/g, '');
                setCode(val);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full px-4 py-4 rounded-xl text-center text-3xl font-mono"
              style={{
                background: 'rgba(1,28,64,0.7)',
                border: '1px solid rgba(84,172,191,0.4)',
                color: '#e2e8f0',
                outline: 'none',
                letterSpacing: useRecovery ? '0.2em' : '0.5em',
              }}
              placeholder={useRecovery ? 'XXXX-XXXX-XXXX' : '······'}
              autoFocus
              disabled={loading}
            />
            {!useRecovery && (
              <p className="mt-2 text-xs text-center" style={{ color:'rgba(167,235,242,0.4)' }}>
                Le code change toutes les 30 secondes
              </p>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || (!useRecovery && code.length !== 6) || (useRecovery && code.trim().length < 10)}
            className="w-full py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            style={{ background:'linear-gradient(135deg,#b91c1c 0%,#dc2626 60%,#ef4444 100%)', color:'white', letterSpacing:'0.1em' }}>
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>

          <button
            onClick={() => { setUseRecovery(!useRecovery); setCode(''); setError(''); }}
            className="w-full py-2 text-sm transition-colors mb-1"
            style={{ color:'rgba(84,172,191,0.6)' }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(84,172,191,1)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(84,172,191,0.6)'}>
            {useRecovery
              ? '← Utiliser Google Authenticator'
              : "J'ai perdu mon téléphone — code de récupération"}
          </button>

          <button onClick={onBack}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN LOGIN ───────────────────────────────────────────
const Login = () => {
  const [loginData, setLoginData]         = useState({ email: '', password: '' });
  const navigate                           = useNavigate();
  const { login: authLogin }               = useAuth();
  const [searchParams]                     = useSearchParams();
  const [loading, setLoading]             = useState(false);
  const [errors, setErrors]               = useState({});
  const [successMessage, setSuccess]      = useState('');
  const [focusedField, setFocused]        = useState(null);
  const [mousePos, setMousePos]           = useState({ x: 0, y: 0 });
  const [requires2FA, setRequires2FA]     = useState(false);
  const [pendingPersonId, setPending]     = useState(null);
  const formRef                            = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const onThemeChange = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', onThemeChange);
    return () => window.removeEventListener('themeChanged', onThemeChange);
  }, []);

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const handleRedirect = (role, clubRole) => {
    if (role === 'admin') navigate('/Admin/Dashboard', { replace: true });
    else if (role === 'user' && clubRole) {
      switch (clubRole) {
        case 'president': navigate('/President/Dashboard', { replace: true }); break;
        case 'board':     navigate('/Bureaux/Dashboard',   { replace: true }); break;
        case 'member':    navigate('/Member/Dashboard',    { replace: true }); break;
        default: setErrors({ general: 'Rôle club non reconnu' });
      }
    } else {
      setErrors({ general: "Vous n'êtes membre d'aucun club" });
    }
  };

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const googleLogin = searchParams.get('google_login');
      const error       = searchParams.get('error');
      if (error) {
        const msgs = {
          account_not_found:  "Aucun compte trouvé avec cet email Google. Veuillez d'abord lier votre compte Google depuis votre profil.",
          account_not_linked: "Aucun compte trouvé avec cet email Google. Veuillez d'abord lier votre compte Google depuis votre profil.",
          account_disabled:   "Votre compte a été désactivé.",
          google_error:       'Erreur lors de la connexion avec Google. Veuillez réessayer.',
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
      // ✅ Handle Google login with 2FA required
      const requires2fa = searchParams.get('requires_2fa');
      const personId    = searchParams.get('person_id');
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
    setLoading(true); setErrors({}); setSuccess('');
    const newErrors = {};
    if (!loginData.email)                            newErrors.email    = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email    = 'Email invalide';
    if (!loginData.password)                         newErrors.password = 'Le mot de passe est requis';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setLoading(false); return; }

    try {
      const res  = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST', credentials: 'include',
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
    } finally { setLoading(false); }
  };

  const handleKeyPress   = (e) => { if (e.key === 'Enter') handleSubmit(); };
  const handleGoogleAuth = ()  => { window.location.href = `${API_BASE_URL}/api/auth/google/`; };

  // ✅ Show 2FA screen
  if (requires2FA) {
    return (
      <TwoFactorScreen
        pendingPersonId={pendingPersonId}
        API_BASE_URL={API_BASE_URL}
        onSuccess={(data) => {
          if (authLogin) authLogin({ ...data.user, role: data.role, club_role: data.club_role });
          setSuccess('Connexion réussie!');
          handleRedirect(data.role, data.club_role);
        }}
        onBack={() => { setRequires2FA(false); setPending(null); }}
      />
    );
  }

  const inputStyle = (field) => ({
    background: 'rgba(1,28,64,0.7)',
    border: errors[field] ? '1px solid rgba(220,38,38,0.7)' : focusedField === field ? '1px solid rgba(84,172,191,0.9)' : '1px solid rgba(84,172,191,0.2)',
    color: '#e2e8f0',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(84,172,191,0.1)' : 'none',
    transition: 'all 0.3s ease', outline: 'none',
  });

  const yetiProps = { focusedField, mousePos, typing: loginData.email.length > 0 };
  const pageBg = darkMode
    ? 'linear-gradient(135deg,#000000 0%,#0a0a0a 55%,#050505 100%)'
    : 'linear-gradient(135deg,#e8f4fd 0%,#dbeef9 55%,#cce4f6 100%)';

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: pageBg, transition: 'background 0.4s ease' }}>
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-3xl -top-60 -left-60"
          style={{ background:'radial-gradient(circle,rgba(84,172,191,0.07) 0%,transparent 65%)' }}/>
        <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl top-1/2 -right-60 animate-pulse"
          style={{ background:'radial-gradient(circle,rgba(38,101,140,0.09) 0%,transparent 65%)', animationDuration:'4s' }}/>
        <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl -bottom-40 left-1/3"
          style={{ background:'radial-gradient(circle,rgba(220,38,38,0.05) 0%,transparent 65%)' }}/>
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage:'linear-gradient(rgba(84,172,191,1) 1px,transparent 1px),linear-gradient(90deg,rgba(84,172,191,1) 1px,transparent 1px)',
          backgroundSize:'60px 60px',
        }}/>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8 pt-20">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-6 p-8">
            <YetiCharacter {...yetiProps} />
            <div className="text-center space-y-2 mt-2">
              <h1 className="text-4xl font-bold" style={{ color:'#ef4444', letterSpacing:'0.05em',
                textShadow: darkMode ? '0 0 20px rgba(239,68,68,0.8),0 0 40px rgba(239,68,68,0.4)' : '0 0 16px rgba(185,28,28,0.35)' }}>
                Bienvenue
              </h1>
              <p className="text-base" style={{ color:'rgba(239,68,68,0.75)' }}>
                sur <span style={{ color:'#dc2626', fontWeight:600 }}>CluVersity</span>
              </p>
              <p className="text-sm" style={{ color:'rgba(220,38,38,0.55)' }}>EST Fès — Clubs & Événements</p>
            </div>
            <div className="flex gap-2">
              {['#b91c1c','#dc2626','#ef4444'].map((c,i) => (
                <div key={i} className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor:c, animationDelay:`${i*0.3}s` }}/>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex justify-center mb-4">
              <YetiCharacter {...yetiProps} />
            </div>

            <div ref={formRef}>
              <div className="relative p-8 rounded-3xl overflow-hidden"
                style={{ background:'linear-gradient(160deg,rgba(1,28,64,0.92) 0%,rgba(10,25,41,0.97) 100%)', border:'1px solid rgba(84,172,191,0.18)', boxShadow:'0 30px 70px rgba(0,0,0,0.55)' }}>
                <div className="absolute top-0 left-8 right-8 h-[1px]"
                  style={{ background:'linear-gradient(90deg,transparent,#54ACBF,transparent)' }}/>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background:'radial-gradient(ellipse at 50% 0%,rgba(84,172,191,0.06) 0%,transparent 55%)' }}/>

                <div className="lg:hidden flex justify-center mb-6">
                  <img src={logo} alt="Cluversity Logo" className="w-36 h-auto drop-shadow-xl"/>
                </div>

                {successMessage && (
                  <div className="mb-5 p-3 rounded-xl flex items-center gap-3"
                    style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)' }}>
                    <span className="text-green-400">✓</span>
                    <span className="text-green-300 text-sm">{successMessage}</span>
                  </div>
                )}
                {errors.general && (
                  <div className="mb-5 p-3 rounded-xl flex items-center gap-3"
                    style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.25)' }}>
                    <span className="text-red-400">✗</span>
                    <span className="text-red-300 text-sm">{errors.general}</span>
                  </div>
                )}

                <div className="text-center mb-7">
                  <h2 className="text-3xl font-bold mb-1.5 tracking-wide" style={{ color:'#ef4444',
                    textShadow: darkMode ? '0 0 20px rgba(239,68,68,0.8),0 0 40px rgba(239,68,68,0.3)' : '0 0 12px rgba(185,28,28,0.3)' }}>
                    Connexion
                  </h2>
                  <p className="text-xs tracking-widest uppercase" style={{ color:'rgba(167,235,242,0.4)' }}>
                    Accédez à votre espace personnel
                  </p>
                </div>

                <button onClick={handleGoogleAuth} disabled={loading}
                  className="w-full mb-5 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(84,172,191,0.25)', color:'#A7EBF2', fontSize:'0.9rem' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(84,172,191,0.08)'; e.currentTarget.style.borderColor='rgba(84,172,191,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(84,172,191,0.25)'; }}>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full" style={{ borderTop:'1px solid rgba(84,172,191,0.12)' }}/>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs tracking-widest uppercase"
                      style={{ background:'rgba(10,25,41,0.97)', color:'rgba(167,235,242,0.35)' }}>
                      ou avec votre email
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color:'#54ACBF' }}>
                    Adresse email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: focusedField==='email' ? '#54ACBF' : 'rgba(84,172,191,0.35)', transition:'color 0.3s' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </span>
                    <input type="email" name="email" value={loginData.email}
                      onChange={handleChange} onKeyPress={handleKeyPress}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                      style={inputStyle('email')} placeholder="votre.email@exemple.com" disabled={loading}/>
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
                </div>

                <div className="mb-7">
                  <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color:'#54ACBF' }}>
                    Mot de passe
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: focusedField==='password' ? '#54ACBF' : 'rgba(84,172,191,0.35)', transition:'color 0.3s' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </span>
                    <input type="password" name="password" value={loginData.password}
                      onChange={handleChange} onKeyPress={handleKeyPress}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                      style={inputStyle('password')} placeholder="••••••••" disabled={loading}/>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span>⚠</span>{errors.password}</p>}
                </div>

                <style>{`
                  @keyframes btnShimmer { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(250%) skewX(-15deg)} }
                  @keyframes btnGlowPulse { 0%,100%{box-shadow:0 8px 30px rgba(220,38,38,0.35)} 50%{box-shadow:0 8px 40px rgba(220,38,38,0.6),0 0 20px 4px rgba(220,38,38,0.25)} }
                `}</style>
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] relative overflow-hidden group"
                  style={{ background:'linear-gradient(135deg,#b91c1c 0%,#dc2626 60%,#ef4444 100%)', color:'white', border:'1px solid rgba(220,38,38,0.4)', letterSpacing:'0.12em', fontSize:'0.85rem', animation:'btnGlowPulse 2.5s ease-in-out infinite' }}
                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                  {!loading && <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%)', animation:'btnShimmer 2.2s ease-in-out infinite', width:'40%' }}/>}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background:'linear-gradient(135deg,#ef4444 0%,#dc2626 50%,#b91c1c 100%)' }}/>
                  <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                    {loading ? (
                      <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Connexion en cours...</>
                    ) : (
                      <>Se connecter<svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                    )}
                  </span>
                </button>

                <div className="absolute bottom-0 left-8 right-8 h-[1px]"
                  style={{ background:'linear-gradient(90deg,transparent,rgba(84,172,191,0.2),transparent)' }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;