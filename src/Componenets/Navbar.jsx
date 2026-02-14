import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../imgs/CluVer.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('accueil');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mettre à jour activeLink en fonction de l'URL actuelle
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveLink('accueil');
    }
  }, [location]);

  const handleAccueil = () => {
    navigate('/');
    setActiveLink('accueil');
  };

  const handleLogin = () => {
    navigate('/Login/login');
  };

  return (
    <nav className={`fixed w-full z-50 px-8 py-2 top-0 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 -my-4">
          <img 
            src={logo} 
            alt="Logo CluVersity" 
            className="h-20 w-auto object-contain cursor-pointer"
            onClick={handleAccueil}
          />
        </div>

        {/* Spacer pour centrer les éléments de droite */}
        <div className="flex-1"></div>

        {/* Navigation Links et Actions */}
        <div className="flex items-center gap-6">
          {/* Lien Accueil */}
          <div className="flex gap-6 text-white text-xs items-center">
            <button 
              onClick={handleAccueil}
              className="relative hover:text-gray-300 transition pb-1 bg-transparent border-0 cursor-pointer"
            >
              ACCUEIL
              {activeLink === 'accueil' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>
              )}
            </button>
          </div>

          {/* Bouton Connexion SEULEMENT */}
          <button 
            onClick={handleLogin}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1.5 rounded-md transition text-xs flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Connexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;