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
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const searchQuery = new URLSearchParams(location.search).get('search') || '';

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* --- NEW HERO SECTION WITH YOUR IMAGE --- */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden bg-slate-900 pt-28 pb-12 md:pt-36 md:pb-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/imgs/pic1.png" 
            alt="EST Fès" 
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/40 to-transparent"></div>
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
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-16 z-40 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-2">
            {['Tous', 'Technologie', 'Culture', 'Sport', 'Art'].map((cat) => (
              <button 
                key={cat}
                onClick={() => cat === 'Tous' ? navigate('/') : navigate(`/?search=${cat}`)}
                className={`category-btn px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  (cat === 'Tous' && !searchQuery) || searchQuery === cat 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-[#F9E6EA] hover:text-[#C8102E]'
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      {/* --- CLUBS GRID --- */}
      <section id="clubs-section" className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              {...club}
              image={getImageUrl(club.cover_image)}
              logo={getImageUrl(club.logo)}
              memberCount={club.active_members || 0}
            />
          ))}
        </div>
      </section>

      {/* --- NEW PHOTO GALLERY SECTION (For you and your partner) --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">Vie de Campus & <span style={{color:'#C8102E'}}>Engagement</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[500px]">
             {/* Large Main Photo */}
             <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden bg-gray-200 group relative">
                <img src="/images/your-photo-1.jpg" alt="Team" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="font-bold">L'équipe fondatrice devant l'EST</p>
                </div>
             </div>
             {/* Smaller Photos */}
             <div className="rounded-3xl overflow-hidden bg-gray-200"><img src="/images/event-1.jpg" className="w-full h-full object-cover" alt="event"/></div>
             <div className="rounded-3xl overflow-hidden bg-gray-200"><img src="/images/event-2.jpg" className="w-full h-full object-cover" alt="event"/></div>
             <div className="col-span-2 rounded-3xl overflow-hidden bg-gray-200"><img src="/images/event-3.jpg" className="w-full h-full object-cover" alt="event"/></div>
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