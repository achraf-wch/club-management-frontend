import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Componenets/Navbar';
import Footer from '../Componenets/Footer';
import WhyChooseUs from '../Componenets/WhyChooseUs';
import ClubCard from '../Componenets/ClubCard';
import AboutPlatform from '../Componenets/AboutPlatform';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/clubs`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clubs');
      }
      
      const data = await response.json();
      console.log('✅ Clubs data loaded:', data);
      setClubs(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching clubs:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  const filteredClubs = clubs.filter(club => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      club.name.toLowerCase().includes(query) ||
      (club.description && club.description.toLowerCase().includes(query)) ||
      (club.category && club.category.toLowerCase().includes(query))
    );
  });

  const clearSearch = () => {
    navigate('/');
  };

  
return (
<div className="min-h-screen bg-gradient-to-b from-[#1a2c5b] via-[#1a2c5b] to-[#0f1e3d] dark:from-black dark:via-black dark:to-black">
      <Navbar />
      
      {/* ✅ id="accueil" — Hero Section */}
      <section id="accueil" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2c5b] via-[#1e3368] to-[#0f1e3d] dark:from-black dark:via-gray-900 dark:to-black"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#c0392b]/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-[#c0392b]/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-[#a93226]/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-[#c0392b]/15 rounded-full blur-2xl animate-float-delayed" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-[#c0392b]/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Connection Network */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c0392b" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#a93226" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <line x1="10%" y1="20%" x2="90%" y2="35%" stroke="url(#line-gradient)" strokeWidth="1"/>
          <line x1="25%" y1="80%" x2="75%" y2="25%" stroke="url(#line-gradient)" strokeWidth="1"/>
          <line x1="80%" y1="60%" x2="20%" y2="40%" stroke="url(#line-gradient)" strokeWidth="1"/>
          <line x1="15%" y1="50%" x2="85%" y2="70%" stroke="url(#line-gradient)" strokeWidth="1"/>
          
          <circle cx="10%" cy="20%" r="4" fill="#c0392b" opacity="0.6"/>
          <circle cx="90%" cy="35%" r="4" fill="#a93226" opacity="0.6"/>
          <circle cx="25%" cy="80%" r="4" fill="#922b21" opacity="0.6"/>
          <circle cx="75%" cy="25%" r="4" fill="#c0392b" opacity="0.6"/>
          <circle cx="80%" cy="60%" r="4" fill="#a93226" opacity="0.6"/>
          <circle cx="20%" cy="40%" r="4" fill="#922b21" opacity="0.6"/>
        </svg>

        {/* Floating Club Icons */}
        <div className="absolute top-24 left-1/4 animate-float">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center transform rotate-12 hover:scale-110 transition-transform duration-500">
            <svg className="w-8 h-8 text-[#c0392b]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-32 right-1/4 animate-float-delayed" style={{ animationDelay: '0.5s' }}>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center transform -rotate-12 hover:scale-110 transition-transform duration-500">
            <svg className="w-7 h-7 text-[#c0392b]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
            </svg>
          </div>
        </div>

        <div className="absolute top-1/3 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center transform rotate-6 hover:scale-110 transition-transform duration-500">
            <svg className="w-6 h-6 text-[#c0392b]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-8 pt-16">
          <h1 className="text-white text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-tight">
            <span className="inline-block animate-fade-in">DÉCOUVREZ</span>
            <br />
            <span className="inline-block animate-fade-in bg-gradient-to-r from-[#c0392b] to-[#e74c3c] bg-clip-text text-transparent" style={{ animationDelay: '0.2s' }}>
              NOS CLUBS
            </span>
          </h1>
          
          <div className="max-w-3xl mx-auto space-y-4 mb-12">
            <p className="text-white text-xl font-light animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Université Sidi Mohamed Ben Abdellah - EST Fès
            </p>
            
            <p className="text-white/70 text-lg max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.6s' }}>
              Rejoignez une communauté passionnée, participez à des événements enrichissants<br/>
              et développez vos compétences avec nos clubs étudiants
            </p>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            {[
              { name: 'Technologie', color: 'red', icon: '💻' },
              { name: 'Culture', color: 'red', icon: '🎭' },
              { name: 'Sport', color: 'red', icon: '⚽' },
              { name: 'Art', color: 'red', icon: '🎨' },
              { name: 'Sciences', color: 'red', icon: '🔬' }
            ].map((category, idx) => (
              <div 
                key={idx}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-[#c0392b]/30 hover:border-[#c0392b]/60 transition-all duration-300 cursor-pointer group"
              >
                <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                  {category.icon} {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ id="clubs-section" — Clubs Section */}
      <section id="clubs-section" className="py-20 px-8 bg-gradient-to-b from-white to-[#f5f5f5] dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-[#c0392b] mx-auto mb-4"></div>
            </div>
            <h2 className="text-[#1a2c5b] dark:text-white text-5xl font-bold mb-4"></h2>
            <p className="text-[#1a2c5b]/70 dark:text-white/70 text-lg">
              {searchQuery ? `Résultats pour "${searchQuery}"` : 'Découvrez tous les clubs de l\'EST Fès'}
            </p>
            {searchQuery && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <p className="text-[#1a2c5b]/50 text-sm">
                  {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} trouvé{filteredClubs.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={clearSearch}
                  className="text-[#c0392b] hover:text-[#a93226] text-sm underline transition"
                >
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c0392b] mb-4"></div>
              <p className="text-[#1a2c5b] dark:text-white text-xl">Chargement des clubs...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="bg-[#c0392b]/10 border border-[#c0392b] rounded-lg p-6 max-w-md mx-auto">
                <p className="text-[#c0392b] text-lg mb-4">{error}</p>
                <button 
                  onClick={fetchClubs}
                  className="px-6 py-2 bg-[#c0392b] text-white rounded-lg hover:bg-[#a93226] transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center">
              <div className="bg-[#1a2c5b]/5 border border-[#1a2c5b]/20 rounded-lg p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#1a2c5b]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-[#1a2c5b]/70 text-lg mb-2">
                  {searchQuery ? `Aucun club trouvé pour "${searchQuery}"` : 'Aucun club disponible pour le moment.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-6 py-2 bg-[#c0392b] text-white rounded-lg hover:bg-[#a93226] transition-colors"
                  >
                    Voir tous les clubs
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  id={club.id}
                  name={club.name}
                  image={getImageUrl(club.cover_image)}
                  logo={getImageUrl(club.logo)}
                  category={club.category}
                  description={club.description}
                  memberCount={club.active_members || club.total_members || 0}
                  foundingYear={club.founding_year}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ id="notre-plateforme" — AboutPlatform */}
      <section id="notre-plateforme">
        <AboutPlatform />
      </section>

      {/* ✅ id="why-choose-us" — WhyChooseUs */}
      <section id="why-choose-us">
        <WhyChooseUs />
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
          }
        }

        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-15px) translateX(-10px); 
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;