import React, { useState, useEffect } from 'react';
import Navbar from '../../Componenets/Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import logo from '../../imgs/CluVer.png'

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
          navigate('/Member/Dashboard', { replace: true });
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
          'account_not_found': 'Aucun compte trouvé avec cet email Google. Veuillez d\'abord lier votre compte Google depuis votre profil.',
          'account_not_linked': 'Aucun compte trouvé avec cet email Google. Veuillez d\'abord lier votre compte Google depuis votre profil.',
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
      setErrors({ general: `Erreur lors de la connexion: ${error.message}` });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-red-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-700"></div>
        <div className="absolute w-96 h-96 bg-red-700/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8 p-8">
            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600/20 rounded-3xl blur-2xl group-hover:bg-red-600/30 transition-all duration-500"></div>
              <img 
                src={logo} 
                alt="Cluversity Logo" 
                className="relative w-full max-w-md h-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Welcome Text */}
            <div className="text-center space-y-4 max-w-lg">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent">
                Bienvenue
              </h1>
              <p className="text-2xl text-gray-300">
                sur <span className="text-red-500 font-semibold">Cluversity</span>
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Gérez vos clubs universitaires de manière simple et efficace
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="flex gap-3 mt-8">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-150"></div>
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-800/50 relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-red-600/5 pointer-events-none"></div>
              
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-6">
                <img 
                  src={logo} 
                  alt="Cluversity Logo" 
                  className="w-48 h-auto drop-shadow-xl"
                />
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg flex items-center gap-3 animate-fadeIn">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-green-300 text-sm">{successMessage}</span>
                </div>
              )}

              {errors.general && (
                <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg flex items-center gap-3 animate-fadeIn">
                  <span className="text-red-400 text-xl">✗</span>
                  <span className="text-red-300 text-sm">{errors.general}</span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
                  Connexion
                </h2>
                <p className="text-gray-400 text-sm">
                  Accédez à votre espace personnel
                </p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full mb-6 py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900 text-gray-400">Ou avec votre email</span>
                </div>
              </div>

              {/* Email Input */}
              <div className="mb-5">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300`}
                  placeholder="votre.email@exemple.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium"
                >
                  Mot de passe oublié?
                </a>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    SE CONNECTER
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-400 mt-6">
                Pas encore de compte?{' '}
                <span className="text-red-500 font-medium">
                  Contactez l'administrateur
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;