import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../imgs/CluVer.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('accueil');
  const [language, setLanguage] = useState('FR');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'FR' ? 'EN' : 'FR');
  };

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
    } else if (path.startsWith('/admin')) {
      setActiveLink('admin');
    }
  }, [location]);

  const handleAccueil = () => {
    navigate('/');
  };

  const handleAdminNavigation = (path) => {
    navigate(path);
    setShowAdminMenu(false);
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

        {/* Search Bar */}
        <div className="flex-1 max-w-xs mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-gray-300 px-4 py-1.5 pl-9 rounded-full border border-white/20 focus:outline-none focus:border-red-500/50 transition text-sm"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <div className="flex gap-6 text-white text-xs items-center">
            <button 
              onClick={() => { setActiveLink('accueil'); handleAccueil(); }}
              className="relative hover:text-gray-300 transition pb-1 bg-transparent border-0 cursor-pointer"
            >
              ACCUEIL
              {activeLink === 'accueil' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>
              )}
            </button>
            
            {/* Admin Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setActiveLink('admin'); setShowAdminMenu(!showAdminMenu); }}
                onMouseEnter={() => setShowAdminMenu(true)}
                className="relative hover:text-gray-300 transition pb-1 bg-transparent border-0 cursor-pointer flex items-center gap-1"
              >
                ADMIN
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {activeLink === 'admin' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showAdminMenu && (
                <div 
                  className="absolute top-full right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700/50 py-2"
                  onMouseLeave={() => setShowAdminMenu(false)}
                >
                  <button
                    onClick={() => handleAdminNavigation('/Login/login')}
                    className="w-full text-left px-4 py-2.5 text-white hover:bg-red-500 hover:text-white transition flex items-center gap-3 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Connexion
                  </button>

                  <div className="border-t border-gray-700/50 my-2"></div>

                  <button
                    onClick={() => handleAdminNavigation('/admin/settings')}
                    className="w-full text-left px-4 py-2.5 text-white hover:bg-red-500 hover:text-white transition flex items-center gap-3 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Paramètres
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Language Button */}
          <button 
            onClick={toggleLanguage}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-md transition text-xs"
          >
            {language}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;