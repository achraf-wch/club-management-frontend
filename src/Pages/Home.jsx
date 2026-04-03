import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Componenets/Navbar';
import Footer from '../Componenets/Footer';
import WhyChooseUs from '../Componenets/WhyChooseUs';
import ClubCard from '../Componenets/ClubCard';
import AboutPlatform from '../Componenets/AboutPlatform';

/* ─────────────────────────────────────────────
   Inline CSS animations
───────────────────────────────────────────── */
const galleryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes lineSweep {
    from { width: 0; }
    to   { width: 60%; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.8); opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  .gallery-visible .anim-up    { animation: fadeUp    0.8s cubic-bezier(.22,1,.36,1) forwards; }
  .gallery-visible .anim-left  { animation: fadeLeft  0.8s cubic-bezier(.22,1,.36,1) forwards; }
  .gallery-visible .anim-right { animation: fadeRight 0.8s cubic-bezier(.22,1,.36,1) forwards; }

  .gallery-img {
    transition: transform 0.7s cubic-bezier(.22,1,.36,1), filter 0.4s ease;
    filter: brightness(0.85) saturate(0.9);
  }
  .gallery-card:hover .gallery-img {
    transform: scale(1.08);
    filter: brightness(1) saturate(1.1);
  }
  .gallery-overlay {
    background: linear-gradient(to top, rgba(6,22,58,0.93) 0%, rgba(6,22,58,0.25) 55%, transparent 100%);
    opacity: 0;
    transition: opacity 0.45s ease;
  }
  .gallery-card:hover .gallery-overlay { opacity: 1; }
  .gallery-card:hover .gallery-text-title { opacity: 1 !important; transform: translateY(0) !important; }
  .gallery-card:hover .gallery-text-desc  { opacity: 1 !important; transform: translateY(0) !important; }

  .tag-badge {
    background: linear-gradient(135deg, #c0392b, #a93226);
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.08em;
  }
  .stat-card {
    background: linear-gradient(135deg, rgba(192,57,43,0.10), rgba(192,57,43,0.03));
    border: 1px solid rgba(192,57,43,0.22);
    transition: transform 0.35s ease, box-shadow 0.35s ease;
  }
  .stat-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 36px rgba(192,57,43,0.18);
  }
  .shimmer-text {
    background: linear-gradient(90deg, #c0392b 0%, #ff7055 40%, #c0392b 80%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  .section-line {
    height: 3px;
    background: linear-gradient(90deg, #c0392b, transparent);
    animation: lineSweep 1s 0.4s cubic-bezier(.22,1,.36,1) forwards;
    width: 0;
  }
  .pulse-dot {
    position: relative;
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #c0392b;
  }
  .pulse-dot::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #c0392b;
    animation: pulse-ring 1.6s ease-out infinite;
  }
`;

/* ─────────────────────────────────────────────
   Gallery Section
───────────────────────────────────────────── */
const photos = [
  {
    src: '/imgs/estfNEwEvent.PNG',
    tag: 'Événement Phare',
    title: "L'équipe ESTF News en action",
    desc: 'Couverture live des grands événements du campus',
    anim: 'anim-left',
    delay: '0ms',
    grid: { col: '1 / 7', row: '1 / 3' },
  },
  {
    src: '/imgs/estfEvent2.png',
    tag: 'Sport & Teamwork',
    title: 'Tournoi inter-clubs',
    desc: 'Esprit d\'équipe et dépassement de soi',
    anim: 'anim-up',
    delay: '150ms',
    grid: { col: '7 / 10', row: '1 / 2' },
  },
  {
    src: 'imgs/empowerteam.png',
    tag: 'Leadership',
    title: 'Empower Team',
    desc: 'Former les leaders de demain',
    anim: 'anim-right',
    delay: '250ms',
    grid: { col: '10 / 13', row: '1 / 2' },
  },
  {
    src: '/imgs/event.png',
    tag: 'Networking',
    title: 'Rencontre étudiante',
    desc: 'Créer des connexions durables',
    anim: 'anim-up',
    delay: '350ms',
    grid: { col: '7 / 13', row: '2 / 3' },
  },
];

const stats = [
  { value: '12+', label: 'Clubs actifs',        icon: '🏛️' },
  { value: '800+', label: 'Étudiants engagés',  icon: '👥' },
  { value: '50+',  label: 'Événements / an',    icon: '📅' },
];

function GallerySection({ isDark }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const bg          = isDark ? 'linear-gradient(160deg,#060d1f 0%,#0a1628 60%,#060d1f 100%)' : 'linear-gradient(160deg,#f0f4f8 0%,#ffffff 60%,#eef2f7 100%)';
  const headingClr  = isDark ? '#ffffff' : '#06163A';
  const subClr      = isDark ? 'rgba(255,255,255,0.52)' : '#4a5568';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const statValClr  = isDark ? '#ffffff' : '#06163A';
  const statLblClr  = isDark ? 'rgba(255,255,255,0.48)' : '#718096';

  return (
    <section
      ref={ref}
      className={visible ? 'gallery-visible' : ''}
      style={{ background: bg, padding: '96px 0 80px', overflow: 'hidden' }}
    >
      <style>{galleryStyles}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div className="anim-up" style={{ opacity: 0, textAlign: 'center', marginBottom: 56, animationDelay: '0ms' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(192,57,43,0.10)', border: '1px solid rgba(192,57,43,0.28)',
            borderRadius: 999, padding: '6px 18px', marginBottom: 22,
          }}>
            <span className="pulse-dot"></span>
            <span style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '0.13em', color: '#c0392b', textTransform: 'uppercase' }}>
              Vie de Campus
            </span>
          </div>

          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(1.9rem, 3.8vw, 2.9rem)',
            fontWeight: 900,
            color: headingClr,
            lineHeight: 1.15,
            marginBottom: 4,
          }}>
            Moments &amp;{' '}
            <span className="shimmer-text">Engagement</span>
          </h2>

          <div className="section-line" style={{ margin: '10px auto 0', maxWidth: 320 }}></div>

          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 15,
            color: subClr,
            maxWidth: 460,
            margin: '18px auto 0',
            lineHeight: 1.75,
          }}>
            Chaque événement est une opportunité de grandir, créer et s'épanouir au sein de notre communauté estudiantine.
          </p>
        </div>

        {/* Mosaic */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: '260px 260px',
          gap: 14,
          marginBottom: 48,
        }}>
          {photos.map((p, i) => (
            <div
              key={i}
              className={`gallery-card ${p.anim}`}
              style={{
                gridColumn: p.grid.col,
                gridRow: p.grid.row,
                opacity: 0,
                animationDelay: p.delay,
                borderRadius: i === 0 ? 24 : 18,
                overflow: 'hidden',
                position: 'relative',
                border: `1px solid ${cardBorder}`,
                cursor: 'pointer',
                boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={p.src}
                alt={p.title}
                className="gallery-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div className="gallery-overlay" style={{ position: 'absolute', inset: 0 }} />

              {/* Tag */}
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <span className="tag-badge" style={{
                  fontSize: 9, fontWeight: 700, color: '#fff',
                  padding: '4px 11px', borderRadius: 999,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {p.tag}
                </span>
              </div>

              {/* Bottom text */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: i === 0 ? '24px' : '16px' }}>
                <p
                  className="gallery-text-title"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: i === 0 ? 17 : 13,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 3,
                    opacity: 0,
                    transform: 'translateY(8px)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease',
                  }}
                >
                  {p.title}
                </p>
                <p
                  className="gallery-text-desc"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.68)',
                    opacity: 0,
                    transform: 'translateY(8px)',
                    transition: 'opacity 0.35s 0.05s ease, transform 0.35s 0.05s ease',
                  }}
                >
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className="anim-up"
          style={{
            opacity: 0,
            animationDelay: '500ms',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ borderRadius: 20, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(1.7rem, 3vw, 2.4rem)',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 8,
              }}>
                <span className="shimmer-text">{s.value}</span>
              </div>
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 12,
                color: statLblClr,
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Home
───────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return document.documentElement.classList.contains('dark');
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const searchQuery = new URLSearchParams(location.search).get('search') || '';

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e && e.detail && typeof e.detail.dark !== 'undefined') {
        setIsDark(e.detail.dark);
      } else {
        setIsDark(document.documentElement.classList.contains('dark'));
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

  const pageBg           = isDark ? '#060d1f' : '#ffffff';
  const textSecondary    = isDark ? 'text-white/60' : 'text-gray-500';
  const categoryNavBg    = isDark ? 'bg-[#0f1e3d]/80 border-white/10' : 'bg-white/80 border-gray-200';
  const categoryBtnActive   = isDark ? 'bg-[#c0392b] text-white' : 'bg-blue-900 text-white';
  const categoryBtnInactive = isDark
    ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
    : 'bg-gray-100 text-gray-600 hover:bg-[#F9E6EA] hover:text-[#C8102E]';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: pageBg }}>
      <Navbar />

      {/* HERO */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="absolute inset-0">
          <img src="/imgs/pic1.png" alt="EST Fès" className="w-full h-full object-cover opacity-60" />
          <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-blue-900/90 via-blue-900/40 to-transparent' : 'from-blue-800/85 via-blue-800/30 to-transparent'}`}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full text-white flex justify-start">
          <div className="max-w-2xl w-full flex flex-col items-start text-left py-4 md:py-6">
            <div className="inline-flex items-center gap-2 mb-6" style={{backgroundColor:'#C8102E',opacity:0.9,backdropFilter:'blur(4px)',borderRadius:'9999px',padding:'0.25rem 1rem',border:'1.5px solid #C8102E'}}>
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
                className="px-8 py-4 font-bold text-white rounded-xl border border-[#C8102E] shadow-xl"
                style={{background:'linear-gradient(90deg,#C8102E 0%,#a50d23 100%)',boxShadow:'0 4px 24px #C8102E22'}}
              >
                Explorer les clubs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY NAV */}
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

      {/* CLUBS GRID */}
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

      {/* GALLERY — redesigned */}
      <GallerySection isDark={isDark} />

      <AboutPlatform />
      <WhyChooseUs />
      <Footer />
    </div>
  );
};

export default Home;
