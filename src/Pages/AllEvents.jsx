import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Componenets/Navbar';
import Footer from '../Componenets/Footer';

const AllEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  
  // ✅ Add dark mode state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return document.documentElement.classList.contains('dark');
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      const evs = Array.isArray(data) ? data : [];
      setEvents(evs.filter(e => e.status === 'approved' || e.status === 'completed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/storage/${path.startsWith('/') ? path.substring(1) : path}`;
  };

  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.club?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const prev = () => setActiveIndex(i => (i - 1 + filtered.length) % filtered.length);
  const next = () => setActiveIndex(i => (i + 1) % filtered.length);

  useEffect(() => { setActiveIndex(0); }, [search, selectedCategory]);

  const handleMouseDown = (e) => { dragStart.current = e.clientX; setIsDragging(false); };
  const handleMouseMove = () => { if (dragStart.current !== null) setIsDragging(true); };
  const handleMouseUp = (e) => {
    if (dragStart.current !== null) {
      const diff = dragStart.current - e.clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    }
    dragStart.current = null;
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered.length]);

  const getCardStyle = (idx) => {
    const total = filtered.length;
    let offset = idx - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    if (absOffset > 3) return { display: 'none' };

    return {
      transform: `translateX(${offset * 220}px) translateZ(${-absOffset * 120}px) rotateY(${offset * 12}deg) scale(${1 - absOffset * 0.12})`,
      opacity: 1 - absOffset * 0.25,
      zIndex: 10 - absOffset,
      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      position: 'absolute',
      left: '50%',
      marginLeft: '-140px',
      cursor: offset === 0 ? 'pointer' : 'default',
      filter: absOffset > 0 ? `brightness(${0.75 - absOffset * 0.1})` : 'brightness(1)',
    };
  };

  const getCardBackground = (idx) => {
    if (isDark) return 'linear-gradient(145deg, #1a1a2e, #16213e)';
    return idx === activeIndex
      ? 'linear-gradient(145deg, #ffffff, #f5f7fa)'
      : 'linear-gradient(145deg, #ffffff, #eef1f5)';
  };

  const getCardBorder = (idx) => {
    if (idx === activeIndex) return '2px solid #c0392b';
    return isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)';
  };

  const getCardShadow = (idx) => {
    if (idx === activeIndex) {
      return isDark
        ? '0 0 40px rgba(192, 57, 43, 0.4), 0 20px 60px rgba(0,0,0,0.8)'
        : '0 0 40px rgba(192, 57, 43, 0.3), 0 20px 60px rgba(0,0,0,0.2)';
    }
    return isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.15)';
  };

  // ✅ Dynamic background based on dark mode
  const pageBg = isDark ? '#060d1f' : '#f0f4ff';

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, transition: 'background-color 0.3s ease' }}>
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-8 px-8 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#c0392b]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#c0392b]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10">
          <div className="w-16 h-1 bg-[#c0392b] mx-auto mb-6"></div>
          <h1 className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1a2c5b]'}`}>
            Tous les Événements
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            Découvrez les événements de tous les clubs de l'EST Fès
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 pb-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un événement ou club..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#c0392b] transition ${
                isDark 
                  ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' 
                  : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400 shadow-sm'
              }`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#c0392b] text-white shadow-lg shadow-[#c0392b]/30'
                    : isDark
                      ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {cat === 'all' ? 'Tous' : cat}
              </button>
            ))}
          </div>
        </div>

        <p className={`text-sm mt-3 text-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          {filtered.length} événement{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Carousel */}
      <div className="relative pb-20">
        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c0392b] mb-4"></div>
            <p className={isDark ? 'text-white' : 'text-gray-600'}>Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className={`text-lg ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Aucun événement trouvé</p>
          </div>
        ) : (
          <>
            {/* 3D Carousel */}
            <div
              className="relative mx-auto select-none"
              style={{ height: '520px', perspective: '1200px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {filtered.map((event, idx) => (
                <div
                  key={idx}
                  style={getCardStyle(idx)}
                  onClick={() => {
                    if (!isDragging) {
                      const total = filtered.length;
                      let offset = idx - activeIndex;
                      if (offset > total / 2) offset -= total;
                      if (offset < -total / 2) offset += total;
                      if (offset === 0) navigate(`/events/${event.id}`);
                      else if (offset > 0) next();
                      else prev();
                    }
                  }}
                >
                  <div
                    className="w-72 rounded-2xl overflow-hidden"
                    style={{
                      background: getCardBackground(idx),
                      border: getCardBorder(idx),
                      boxShadow: getCardShadow(idx),
                    }}
                  >
                    {/* Banner */}
                    <div className="relative h-48 overflow-hidden">
                      {event.banner_url || event.banner_image ? (
                        <img
                          src={event.banner_url || getImageUrl(event.banner_image)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a2c5b] to-[#0f1e3d]">
                          <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                      {/* Status */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          event.status === 'completed' ? 'bg-purple-500/90' : 'bg-green-500/90'
                        } text-white`}>
                          {event.status === 'completed' ? '✓ Terminé' : '✓ À venir'}
                        </span>
                      </div>

                      {/* Category */}
                      {event.category && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-[#c0392b]/90 text-white text-xs font-bold rounded-full">
                            {event.category}
                          </span>
                        </div>
                      )}

                      {/* Club logo */}
                      {event.club?.logo && (
                        <div className="absolute bottom-3 left-3">
                          <img src={getImageUrl(event.club.logo)} alt="" className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className={`font-bold text-base mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {event.title}
                      </h3>
                      {event.club && (
                        <p className={`text-xs mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>📍 {event.club.name}</p>
                      )}
                      {event.description && (
                        <p className={`text-xs line-clamp-2 mb-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{event.description}</p>
                      )}
                      <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        <svg className="w-3 h-3 text-[#c0392b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.event_date)}
                      </div>

                      {/* CTA on active only */}
                      {idx === activeIndex && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
                          className="mt-3 w-full py-2 bg-[#c0392b] hover:bg-[#a93226] text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Voir les détails →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-8 mt-4">
              <button
                onClick={prev}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md ${
                  isDark 
                    ? 'bg-white/10 hover:bg-[#c0392b] border border-white/20 text-white' 
                    : 'bg-gray-200 hover:bg-[#c0392b] border border-gray-300 text-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex gap-2 items-center">
                {filtered.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? 'w-6 h-2 bg-[#c0392b]'
                        : isDark ? 'w-2 h-2 bg-white/20 hover:bg-white/40' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md ${
                  isDark 
                    ? 'bg-white/10 hover:bg-[#c0392b] border border-white/20 text-white' 
                    : 'bg-gray-200 hover:bg-[#c0392b] border border-gray-300 text-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Counter */}
            <div className={`text-center mt-4 text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              {activeIndex + 1} / {filtered.length}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AllEvents;