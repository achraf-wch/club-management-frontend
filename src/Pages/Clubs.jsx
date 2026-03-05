import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Componenets/Navbar';
import Footer from '../Componenets/Footer';

const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'ar', label: 'AR', flag: '🇲🇦', name: 'العربية' },
];

// Small translate button component for each event card
const EventTranslateBtn = ({ eventId }) => {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('selectedLang') || 'ar');

  const translateTo = (e, lang) => {
    e.stopPropagation(); // don't navigate to event detail
    document.cookie = `googtrans=/ar/${lang}`;
    document.cookie = `googtrans=/ar/${lang};domain=.${window.location.hostname}`;
    localStorage.setItem('selectedLang', lang);
    setCurrentLang(lang);
    setOpen(false);
    window.location.reload();
  };

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[2];

  return (
    <div
      className="absolute top-3 left-3 z-20"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dropdown options */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 items-start">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={(e) => translateTo(e, lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border whitespace-nowrap transition-all ${
                currentLang === lang.code
                  ? 'bg-red-500 text-white border-red-400'
                  : 'bg-gray-900/90 text-white border-white/20 hover:bg-red-500/30'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border-2 shadow-lg transition-all duration-200 ${
          open
            ? 'bg-red-500 text-white border-red-400'
            : 'bg-black/60 backdrop-blur-sm text-white border-white/30 hover:border-red-400 hover:bg-black/80'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <span>{activeLang.label}</span>
      </button>
    </div>
  );
};

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('evenements');
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [president, setPresident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCategory, setSearchCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  useEffect(() => {
    fetchClubData();
  }, [id]);

  useEffect(() => {
    if (searchCategory === '') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event =>
        event.category && event.category.toLowerCase().includes(searchCategory.toLowerCase())
      ));
    }
  }, [searchCategory, events]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      setError(null);

      const clubResponse = await fetch(`${API_BASE_URL}/api/clubs/${id}`);
      if (!clubResponse.ok) throw new Error('Club non trouvé');
      const clubData = await clubResponse.json();
      setClub(clubData);

      try {
        const membersResponse = await fetch(`${API_BASE_URL}/api/members`);
        if (membersResponse.ok) {
          const allMembersData = await membersResponse.json();
          const clubMembers = Array.isArray(allMembersData)
            ? allMembersData.filter(m => m.club_id == id)
            : [];
          setMembers(clubMembers);
          const pres = clubMembers.find(m => m.role === 'president' && m.status === 'active');
          setPresident(pres || null);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      }

      try {
        const eventsResponse = await fetch(`${API_BASE_URL}/api/events`);
        if (eventsResponse.ok) {
          const allEventsData = await eventsResponse.json();
          const clubEvents = Array.isArray(allEventsData)
            ? allEventsData.filter(e => e.club_id == id)
            : [];
          setEvents(clubEvents);
          setFilteredEvents(clubEvents);
          const uniqueCategories = [...new Set(clubEvents.map(e => e.category).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching club data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
            <div className="text-white text-2xl font-semibold">Chargement...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-white text-2xl font-bold mb-2">{error || 'Club non trouvé'}</div>
            <p className="text-gray-400 mb-6">Désolé, nous ne pouvons pas trouver ce club.</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const boardMembers = members.filter(m => m.role === 'board' && m.status === 'active');
  const regularMembers = members.filter(m => m.role === 'member' && m.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2c5b] via-[#1e3368] to-[#0f1e3d] dark:from-black dark:via-black dark:to-black">
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2c5b] via-[#1e3368] to-[#0f1e3d] dark:from-black dark:via-gray-900 dark:to-black"></div>
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#c0392b]/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-[#c0392b]/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-[#a93226]/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>

        {club.cover_image && (
          <div className="absolute inset-0">
            <img src={getImageUrl(club.cover_image)} alt={club.name} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2c5b]/80 via-[#1a2c5b]/90 to-[#0f1e3d]"></div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 text-center">
          {club.logo && (
            <div className="mb-8 animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#c0392b] rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <img src={getImageUrl(club.logo)} alt={club.name} className="relative w-32 h-32 rounded-full object-cover border-4 border-[#c0392b] shadow-2xl mx-auto" />
              </div>
            </div>
          )}

          <h1 className="text-white text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {club.name}
          </h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {club.description || 'Bienvenue dans notre club étudiant'}
          </p>

          <div className="flex flex-wrap justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {club.founding_year && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/20 hover:border-[#c0392b]/50 transition-all">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#c0392b]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                  </svg>
                  <span className="text-white font-semibold">Fondé en {club.founding_year}</span>
                </div>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/20 hover:border-[#c0392b]/50 transition-all">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#c0392b]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <span className="text-white font-semibold">{members.length} membres</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/20 hover:border-[#c0392b]/50 transition-all">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#c0392b]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                </svg>
                <span className="text-white font-semibold">{events.length} événements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 bg-[#1a2c5b]/90 dark:bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8 text-white text-sm py-4 overflow-x-auto">
            {['evenements', 'president', 'bureau', 'membres'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`hover:text-[#c0392b] transition-all duration-300 pb-1 relative whitespace-nowrap capitalize ${activeTab === tab ? 'text-[#c0392b]' : ''}`}
              >
                {tab === 'evenements' ? 'Événements' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#c0392b]"></span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-20 px-8 bg-gradient-to-b from-white to-[#f5f5f5] dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto">

          {/* Événements Tab */}
          {activeTab === 'evenements' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-[#c0392b] rounded-full"></div>
                <h2 className="text-[#1a2c5b] dark:text-white text-4xl font-bold">Événements</h2>
              </div>

              {categories.length > 0 && (
                <div className="bg-[#1a2c5b]/5 dark:bg-white/5 backdrop-blur-sm border border-[#1a2c5b]/20 dark:border-white/10 rounded-2xl p-6">
                  <label className="block text-[#1a2c5b] dark:text-white text-sm font-semibold mb-3">Filtrer par catégorie</label>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setSearchCategory('')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${searchCategory === '' ? 'bg-[#c0392b] text-white' : 'bg-[#1a2c5b]/10 dark:bg-white/10 text-[#1a2c5b] dark:text-white hover:bg-[#1a2c5b]/20 dark:hover:bg-white/20'}`}
                    >
                      Tous
                    </button>
                    {categories.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchCategory(cat)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${searchCategory === cat ? 'bg-[#c0392b] text-white' : 'bg-[#1a2c5b]/10 dark:bg-white/10 text-[#1a2c5b] dark:text-white hover:bg-[#1a2c5b]/20 dark:hover:bg-white/20'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-[#1a2c5b]/60 dark:text-white/60 text-sm">
                    {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="group relative overflow-visible bg-white dark:bg-gray-800 border border-[#1a2c5b]/10 dark:border-white/10 hover:border-[#c0392b]/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#c0392b]/20 cursor-pointer"
                    >
                      <div className="relative h-48 overflow-hidden rounded-t-2xl">
                        <img
                          src={event.banner_url || getImageUrl(event.banner_image) || 'https://via.placeholder.com/400x300'}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e3d] via-[#0f1e3d]/50 to-transparent"></div>

                        {/* ── Translate button — top LEFT of each event card ── */}
                        <EventTranslateBtn eventId={event.id} />

                        {event.category && (
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 bg-[#c0392b] text-white text-xs font-bold rounded-full">
                              {event.category}
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
                          <div className="text-white text-xs font-semibold">
                            {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-[#1a2c5b] dark:text-white text-xl font-bold mb-2 group-hover:text-[#c0392b] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-[#1a2c5b]/60 dark:text-white/60 text-sm line-clamp-2 mb-4">
                          {event.description || 'Aucune description disponible.'}
                        </p>
                        {event.location && (
                          <div className="flex items-center gap-2 text-[#1a2c5b]/50 dark:text-white/50 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-[#1a2c5b]/5 dark:bg-white/5 border border-[#1a2c5b]/10 dark:border-white/10 rounded-2xl p-12 text-center">
                    <svg className="w-16 h-16 text-[#1a2c5b]/30 dark:text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[#1a2c5b]/60 dark:text-white/60">
                      {searchCategory ? `Aucun événement trouvé pour "${searchCategory}"` : 'Aucun événement pour le moment'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Président Tab */}
          {activeTab === 'president' && (
            <div>
              {president ? (
                <div className="bg-white dark:bg-gray-800 border border-[#1a2c5b]/10 dark:border-white/10 rounded-2xl p-10 max-w-4xl mx-auto">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-[#c0392b] rounded-full"></div>
                    <h2 className="text-[#1a2c5b] dark:text-white text-3xl font-bold">Président du Club</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="text-center space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-[#c0392b] rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <img src={president.avatar_url || getImageUrl(president.avatar) || 'https://via.placeholder.com/200'} alt={`${president.first_name} ${president.last_name}`} className="relative w-48 h-48 rounded-full mx-auto object-cover border-4 border-[#c0392b] shadow-2xl" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-[#1a2c5b] dark:text-white text-2xl font-bold">{president.first_name} {president.last_name}</h3>
                        <p className="text-[#c0392b] text-sm font-semibold">Président · {club.name}</p>
                      </div>
                    </div>
                    <div className="text-[#1a2c5b]/70 dark:text-white/70 space-y-6">
                      {president.email && (
                        <div>
                          <p className="font-bold text-lg mb-2 flex items-center gap-2 text-[#1a2c5b] dark:text-white"><span className="w-2 h-2 rounded-full bg-[#c0392b]"></span>Email</p>
                          <p className="pl-4">{president.email}</p>
                        </div>
                      )}
                      {president.phone && (
                        <div>
                          <p className="font-bold text-lg mb-2 flex items-center gap-2 text-[#1a2c5b] dark:text-white"><span className="w-2 h-2 rounded-full bg-[#c0392b]"></span>Téléphone</p>
                          <p className="pl-4">{president.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a2c5b]/5 dark:bg-white/5 border border-[#1a2c5b]/10 dark:border-white/10 rounded-2xl p-12 text-center max-w-2xl mx-auto">
                  <p className="text-[#1a2c5b]/60 dark:text-white/60">Aucun président pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* Bureau Tab */}
          {activeTab === 'bureau' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-[#c0392b] rounded-full"></div>
                <h2 className="text-[#1a2c5b] dark:text-white text-4xl font-bold">Bureau Exécutif</h2>
              </div>
              {boardMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boardMembers.map((member) => (
                    <div key={member.id} className="group bg-white dark:bg-gray-800 border border-[#1a2c5b]/10 dark:border-white/10 hover:border-[#c0392b]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[#c0392b]/20">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#c0392b] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <img src={member.avatar_url || getImageUrl(member.avatar) || 'https://via.placeholder.com/100'} alt={`${member.first_name} ${member.last_name}`} className="relative w-24 h-24 rounded-full object-cover border-3 border-[#c0392b]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-[#1a2c5b] dark:text-white">{member.first_name} {member.last_name}</h4>
                          <p className="text-sm font-semibold text-[#c0392b] mt-1">{member.position || 'Membre du bureau'}</p>
                          {member.email && <p className="text-xs text-[#1a2c5b]/50 dark:text-white/50 mt-2">{member.email}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1a2c5b]/5 dark:bg-white/5 border border-[#1a2c5b]/10 dark:border-white/10 rounded-2xl p-12 text-center">
                  <p className="text-[#1a2c5b]/60 dark:text-white/60">Aucun membre du bureau pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* Membres Tab */}
          {activeTab === 'membres' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-[#c0392b] rounded-full"></div>
                <h2 className="text-[#1a2c5b] dark:text-white text-4xl font-bold">Membres</h2>
                <span className="text-[#1a2c5b]/50 dark:text-white/50 text-xl">({regularMembers.length})</span>
              </div>
              {regularMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {regularMembers.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-gray-800 border border-[#1a2c5b]/10 dark:border-white/10 hover:border-[#c0392b]/50 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#c0392b]/20">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <img src={member.avatar_url || getImageUrl(member.avatar) || 'https://via.placeholder.com/80'} alt={`${member.first_name} ${member.last_name}`} className="w-20 h-20 rounded-full object-cover border-2 border-[#1a2c5b]/20 dark:border-white/20" />
                        <div>
                          <h4 className="font-bold text-[#1a2c5b] dark:text-white">{member.first_name} {member.last_name}</h4>
                          {member.email && <p className="text-xs text-[#1a2c5b]/50 dark:text-white/50 mt-1">{member.email}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1a2c5b]/5 dark:bg-white/5 border border-[#1a2c5b]/10 dark:border-white/10 rounded-2xl p-12 text-center">
                  <p className="text-[#1a2c5b]/60 dark:text-white/60">Aucun membre pour le moment</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ClubDetail;