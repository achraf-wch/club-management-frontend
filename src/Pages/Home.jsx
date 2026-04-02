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
  
  // ✅ Add dark mode state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return document.documentElement.classList.contains('dark');
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const searchQuery = new URLSearchParams(location.search).get('search') || '';

  // ✅ Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e && e.detail && typeof e.detail.dark !== 'undefined') {
        setIsDark(e.detail.dark);
      } else {
        const dark = document.documentElement.classList.contains('dark');
        setIsDark(dark);
      }
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs`);
      const data = await response.json();
      setClubs(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) { setLoading(false); }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_BASE_URL}/storage/${path.replace(/^\//, '')}`;
  };

  const filteredClubs = clubs.filter(club => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return club.name.toLowerCase().includes(query) || (club.category && club.category.toLowerCase().includes(query));
  });

  // ✅ Dynamic styles based on dark mode
  const pageBg = isDark ? '#060d1f' : '#ffffff';
  const sectionBg = isDark ? '#0a1628' : '#f9fafb';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-white/60' : 'text-gray-500';
  const textMuted = isDark ? 'text-white/40' : 'text-gray-400';
  const categoryNavBg = isDark ? 'bg-[#0f1e3d]/80 border-white/10' : 'bg-white/80 border-gray-200';
  const categoryBtnActive = isDark ? 'bg-[#c0392b] text-white' : 'bg-blue-900 text-white';
  const categoryBtnInactive = isDark ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-[#F9E6EA] hover:text-[#C8102E]';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: pageBg }}>
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/imgs/pic1.png" 
            alt="EST Fès" 
            className="w-full h-full object-cover opacity-60" 
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-blue-900/90 via-blue-900/40 to-transparent' : 'from-blue-800/85 via-blue-800/30 to-transparent'}`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full text-white flex justify-start">
          <div className="max-w-2xl w-full flex flex-col items-start text-left py-4 md:py-6">
            <div className="inline-flex items-center gap-2 mb-6" style={{backgroundColor:'#C8102E', opacity:0.9, backdropFilter:'blur(4px)', borderRadius:'9999px', padding:'0.25rem 1rem', border:'1.5px solid #C8102E'}}>
              <span className="text-xs font-bold uppercase tracking-widest">EST Fès Plateforme</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              L'Excellence <br/>
              <span style={{color:'#C8102E'}}>Par la Vie Étudiante</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              Bienvenue sur le portail officiel des clubs de l'EST de Fès. 
              Découvrez, engagez-vous et transformez votre parcours académique.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => document.getElementById('clubs-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="explore-btn px-8 py-4 font-bold text-white rounded-xl border border-[#C8102E] shadow-xl"
                style={{
                  background: 'linear-gradient(90deg, #C8102E 0%, #a50d23 100%)',
                  boxShadow: '0 4px 24px #C8102E22',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 1
                }}
              >
                <span className="relative z-10">Explorer les clubs</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY NAV --- */}
      <div className={`sticky top-16 z-40 py-4 backdrop-blur-md border-b transition-colors duration-300 ${categoryNavBg}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-2">
            {['Tous', 'Technologie', 'Culture', 'Sport', 'Art'].map((cat) => (
              <button 
                key={cat}
                onClick={() => cat === 'Tous' ? navigate('/') : navigate(`/?search=${cat}`)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  (cat === 'Tous' && !searchQuery) || searchQuery === cat 
                  ? categoryBtnActive 
                  : categoryBtnInactive
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      {/* --- CLUBS GRID --- */}
      <section id="clubs-section" className="py-20 max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className={`text-center py-20 ${textSecondary}`}>
            <p>Aucun club trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
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
      </section>

      {/* --- PHOTO GALLERY SECTION --- */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: sectionBg }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-3xl font-bold mb-10 text-center ${textPrimary}`}>
            Vie de Campus & <span style={{color:'#C8102E'}}>Engagement</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[500px]">
             {/* Large Main Photo */}
             <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden bg-gray-200 group relative">
                <img src="/imgs/estfNEwEvent.PNG" alt="Team" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="font-bold">L'équipe fondatrice devant l'EST</p>
                </div>
             </div>
             {/* Smaller Photos */}
             <div className="rounded-3xl overflow-hidden bg-gray-200"><img src="/imgs/estfEvent2.png" className="w-full h-full object-cover" alt="event"/></div>
             <div className="rounded-3xl overflow-hidden bg-gray-200"><img src="imgs/empowerteam.png" className="w-full h-full object-cover" alt="event"/></div>
             <div className="col-span-2 rounded-3xl overflow-hidden bg-gray-200"><img src="/imgs/event.png" className="w-full h-full object-cover" alt="event"/></div>
          </div>
        </div>
      </section>

      <AboutPlatform />
      <WhyChooseUs />
      <Footer />
    </div>
  );
};

export default Home;