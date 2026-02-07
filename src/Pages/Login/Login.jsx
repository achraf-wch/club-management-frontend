import React, { useState, useEffect } from 'react';
import Navbar from '../../Componenets/Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://localhost:8000';

  // Centralized redirect logic
  const handleRedirect = (role, clubRole) => {
    if (role === 'admin') {
      navigate('/Admin/Dashboard', { replace: true });
    } else if (role === 'user' && clubRole) {
      switch(clubRole) {
        case 'president':
          navigate('/President/Dashboard', { replace: true });
          break;
        case 'board':
          navigate('/Bureaux/Dashboard', { replace: true });
          break;
        case 'member':
          navigate('/Member/Dashboard', { replace: true }); // FIXED: Changed from President to Member
          break;
        default:
          setErrors({ general: 'Rôle club non reconnu' });
      }
    } else {
      setErrors({ general: 'Vous n\'êtes membre d\'aucun club' });
    }
  };

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const googleLogin = searchParams.get('google_login');
      const error = searchParams.get('error');

      // Handle errors first
      if (error) {
        const errorMessages = {
          'account_not_found': 'Aucun compte trouvé avec cet email Google. Contactez l\'administrateur pour créer un compte.',
          'account_disabled': 'Votre compte a été désactivé. Contactez l\'administrateur.',
          'google_error': 'Erreur lors de la connexion avec Google. Veuillez réessayer.'
        };
        setErrors({ general: errorMessages[error] || 'Une erreur est survenue' });
        window.history.replaceState({}, document.title, '/Login/login');
        return;
      }

      // Handle successful Google login
      if (googleLogin === 'success') {
        setLoading(true);
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/verify-session`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();

            const userData = {
              ...data.user,
              role: data.role,
              club_role: data.club_role
            };

            if (authLogin) {
              authLogin(userData);
            }

            setSuccessMessage('Connexion Google réussie!');
            window.history.replaceState({}, document.title, '/Login/login');

            setTimeout(() => {
              handleRedirect(data.role, data.club_role);
            }, 1500);

          } else {
            const errorData = await response.json();
            setErrors({ general: 'Session invalide. Veuillez vous reconnecter.' });
            window.history.replaceState({}, document.title, '/Login/login');
          }
        } catch (error) {
          setErrors({ general: 'Erreur de connexion au serveur' });
          window.history.replaceState({}, document.title, '/Login/login');
        } finally {
          setLoading(false);
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, authLogin, API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};
    if (!loginData.email) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = 'Email invalide';
    if (!loginData.password) newErrors.password = 'Le mot de passe est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Connexion réussie!');
        
        const userData = {
          ...data.user,
          role: data.role,
          club_role: data.club_role
        };
        
        if (authLogin) {
          authLogin(userData);
        }
        
        setTimeout(() => {
          handleRedirect(data.role, data.club_role);
        }, 1000);

      } else {
        setErrors({ general: data.message || 'Email ou mot de passe incorrect' });
      }
    } catch (error) {
      setErrors({ 
        general: `Erreur lors de la connexion: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Navbar/>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            
            {/* Left Side - Branding */}
            <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-blue-900 p-12 flex flex-col justify-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="mb-8 relative">
                  <div className="w-32 h-32 mx-auto bg-white rounded-full p-4 shadow-2xl animate-float">
                    <div className="w-full h-full bg-red-600 rounded-full flex items-center justify-center border-4 border-white">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                </div>

                <h1 className="text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
                  Bienvenue
                </h1>
                <h2 className="text-3xl font-bold text-white/90 mb-6 text-center">
                  sur Cluversity
                </h2>
                <p className="text-white/80 text-center text-lg leading-relaxed">
                  Gérez vos clubs universitaires de manière simple et efficace
                </p>

                <div className="mt-12 flex justify-center gap-2">
                  <div className="w-16 h-1 bg-white/40 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/60 rounded-full"></div>
                  <div className="w-4 h-1 bg-white/40 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-12 bg-white/95 backdrop-blur-sm">
              {successMessage && (
                <div className="mb-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg text-center animate-slideDown font-semibold">
                  ✓ {successMessage}
                </div>
              )}

              {errors.general && (
                <div className="mb-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg text-center animate-slideDown font-semibold">
                  ✗ {errors.general}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h3>
                <p className="text-gray-600">Accédez à votre espace personnel</p>
              </div>

              {/* Google Login Button */}
              <button 
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 group mb-6 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-semibold text-lg">Continuer avec Google</span>
              </button>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Ou avec votre email</span>
                </div>
              </div>

              <div className="space-y-5">
                {/* Email Input */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="exemple@email.com"
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-red-500'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 ${
                        errors.password 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-red-500'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                    <span className="text-gray-600">Se souvenir de moi</span>
                  </label>
                  <a href="#" className="text-red-600 hover:text-red-700 font-semibold transition-colors">
                    Mot de passe oublié?
                  </a>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-blue-900 text-white font-bold rounded-xl hover:from-red-700 hover:to-blue-950 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      SE CONNECTER
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-gray-600">
                Pas encore de compte? 
                <span className="text-red-600 font-semibold ml-1">Contactez l'administrateur</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
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

export default Login;
