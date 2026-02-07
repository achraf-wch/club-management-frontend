import React, { useState } from 'react';

export default function AnimatedAuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Sliding Panel */}
        <div
          className={`absolute top-0 h-full w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 transition-all duration-700 ease-in-out z-10 flex items-center justify-center ${
            isSignUp ? 'left-0 rounded-r-[100px]' : 'left-1/2 rounded-l-[100px]'
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(30, 58, 138, 0.5)'
          }}
        >
          <div className="text-white text-center px-12 animate-fadeIn">
            {!isSignUp ? (
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight">Bonjour</h1>
                <p className="text-lg opacity-90">Inscrivez-vous maintenant et profitez de notre site</p>
                <button
                  onClick={toggleForm}
                  className="mt-8 px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105"
                >
                  S'INSCRIRE
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight">Bienvenue sur</h1>
                <h2 className="text-4xl font-bold">CLUVERSITY</h2>
                <p className="text-lg opacity-90">Connectez-vous avec Email & Mot de passe</p>
                <button
                  onClick={toggleForm}
                  className="mt-8 px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105"
                >
                  SE CONNECTER
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sign In Form */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 ${
            isSignUp ? 'opacity-0 pointer-events-none translate-x-[-50px]' : 'opacity-100 translate-x-0'
          }`}
        >
          <div className="w-full max-w-sm px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Connexion</h2>
            
            <div className="flex gap-3 mb-6">
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Connectez-vous avec Email & Mot de passe</p>

            <div className="space-y-4">
              <div className="relative group">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email"
                  placeholder="Entrez votre E-mail"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type="password"
                  placeholder="Entrez votre Mot de passe"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-gray-600 hover:text-blue-900 transition-colors">
                  Mot de passe oublié?
                </a>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white font-semibold rounded-lg hover:from-blue-950 hover:via-blue-900 hover:to-indigo-950 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                SE CONNECTER
              </button>
            </div>
          </div>
        </div>

        {/* Sign Up Form */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 ${
            !isSignUp ? 'opacity-0 pointer-events-none translate-x-[50px]' : 'opacity-100 translate-x-0'
          }`}
        >
          <div className="w-full max-w-sm px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Créer un Compte</h2>
            
            <div className="flex gap-3 mb-6">
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-900 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">S'inscrire avec E-mail</p>

            <div className="space-y-4">
              <div className="relative group">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Nom"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email"
                  placeholder="Entrez votre E-mail"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type="password"
                  placeholder="Entrez votre Mot de passe"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all duration-300"
                />
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white font-semibold rounded-lg hover:from-blue-950 hover:via-blue-900 hover:to-indigo-950 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                S'INSCRIRE
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}