import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Componenets/Navbar';
import Footer from '../Componenets/Footer';

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

  // Use same format as Home.jsx
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchClubData();
  }, [id]);

  useEffect(() => {
    // Filter events when search category changes
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

      // Fetch club details
      const clubUrl = `${API_BASE_URL}/api/clubs/${id}`;
      console.log('Fetching club from:', clubUrl);
      const clubResponse = await fetch(clubUrl);
      if (!clubResponse.ok) throw new Error('Club non trouvé');
      const clubData = await clubResponse.json();
      setClub(clubData);

      // Fetch members for this club
      try {
        const membersUrl = `${API_BASE_URL}/api/members`;
        console.log('Fetching members from:', membersUrl);
        const membersResponse = await fetch(membersUrl);
        if (membersResponse.ok) {
          const allMembersData = await membersResponse.json();
          console.log('All members received:', allMembersData);
          
          // Filter members for THIS CLUB
          const clubMembers = Array.isArray(allMembersData)
            ? allMembersData.filter(m => {
                console.log(`Checking member ${m.id}: club_id=${m.club_id}, looking for club=${id}`);
                return m.club_id == id;
              })
            : [];
          
          console.log('Filtered members for club:', clubMembers);
          setMembers(clubMembers);
          
          // Find president from members
          const pres = clubMembers.find(m => m.role === 'president' && m.status === 'active');
          setPresident(pres || null);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      }

      // Fetch all events and filter client-side
      try {
        const eventsUrl = `${API_BASE_URL}/api/events`;
        console.log('Fetching ALL events from:', eventsUrl);
        const eventsResponse = await fetch(eventsUrl);
        
        if (eventsResponse.ok) {
          const allEventsData = await eventsResponse.json();
          console.log('All events received:', allEventsData);
          
          // Filter events for THIS CLUB
          const clubEvents = Array.isArray(allEventsData)
            ? allEventsData.filter(e => {
                console.log(`Checking event ${e.id}: club_id=${e.club_id}, looking for club=${id}`);
                return e.club_id == id;
              })
            : [];
          
          console.log('Filtered events for club:', clubEvents);
          setEvents(clubEvents);
          setFilteredEvents(clubEvents);
          
          // Extract unique categories from events
          const uniqueCategories = [...new Set(clubEvents.map(e => e.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          console.error('Events API returned status:', eventsResponse.status);
          const errorText = await eventsResponse.text();
          console.error('Error response:', errorText);
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
        setFilteredEvents([]);
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-2xl">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-white text-2xl mb-4">
              {error || 'Club non trouvé'}
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter board members and regular members
  const boardMembers = members.filter(m => m.role === 'board' && m.status === 'active');
  const regularMembers = members.filter(m => m.role === 'member' && m.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      <Navbar />
      
      {/* Secondary Navbar */}
      <div className="bg-black py-3 sticky top-16 z-40 border-b border-red-500/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8 text-white text-sm">
            <button 
              onClick={() => setActiveTab('evenements')}
              className={`hover:text-red-400 transition-all duration-300 pb-1 relative ${
                activeTab === 'evenements' ? 'text-red-400' : ''
              }`}
            >
              Événements
              {activeTab === 'evenements' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 animate-pulse"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('president')}
              className={`hover:text-red-400 transition-all duration-300 pb-1 relative ${
                activeTab === 'president' ? 'text-red-400' : ''
              }`}
            >
              Président
              {activeTab === 'president' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 animate-pulse"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('bureau')}
              className={`hover:text-red-400 transition-all duration-300 pb-1 relative ${
                activeTab === 'bureau' ? 'text-red-400' : ''
              }`}
            >
              Bureau
              {activeTab === 'bureau' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 animate-pulse"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('membres')}
              className={`hover:text-red-400 transition-all duration-300 pb-1 relative ${
                activeTab === 'membres' ? 'text-red-400' : ''
              }`}
            >
              Membres
              {activeTab === 'membres' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 animate-pulse"></span>
              )}
            </button>
            
            <button 
              onClick={() => navigate('/Login/login')}
              className="ml-auto flex items-center gap-2 text-red-400 hover:text-red-500 font-semibold transition-all duration-300 hover:scale-105 text-sm bg-red-400/10 px-4 py-1 rounded-lg hover:bg-red-400/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Se connecter
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`grid gap-8 ${activeTab === 'bureau' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Left Section - Club Info */}
            {activeTab !== 'bureau' && (
              <div className="lg:col-span-1">
                <div className="relative bg-gradient-to-br from-[#0A1124] via-[#0E1B3A] to-[#08132D] border border-white/10 rounded-3xl px-8 pt-16 pb-6 sticky top-36 transition-all duration-500 hover:shadow-[0_25px_70px_rgba(0,0,0,0.6)]">

                  {/* Icon Top Center */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-red-600 border border-white/10 flex items-center justify-center shadow-xl">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13L4.21 11.2 3 11.85 12 17l9-5.15-1.21-.65L12 16z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-white text-2xl font-bold text-center mb-1">
                    {club.name}
                  </h2>

                  <p className="text-gray-400 text-sm text-center mb-6">
                    {club.description || 'Aucune description disponible.'}
                  </p>

                  {/* Divider */}
                  <div className="h-px w-full bg-white/10 mb-5" />

                  {club.mission && (
                    <div className="mb-6">
                      <h3 className="text-white text-lg font-semibold mb-2">
                        Mission
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {club.mission}
                      </p>
                    </div>
                  )}

                  {/* Info Section */}
                  <div className="space-y-4 text-sm">

                    {club.founding_year && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                        </svg>
                        <span>Fondé en {club.founding_year}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 0 015-5z"/>
                      </svg>
                      <span>{club.active_members || members.length} membres</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                      </svg>
                      <span>{events.length} événements</span>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Right Section */}
            <div className={activeTab === 'bureau' ? '' : 'lg:col-span-2'}>
              {/* Événements */}
              {activeTab === 'evenements' && (
                <div className="transition-all duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-white text-3xl font-bold">Événements</h3>
                  </div>
                  
                  {/* Search Bar by Category */}
                  <div className="mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    <label className="block text-white text-sm font-semibold mb-3">
                      Rechercher par catégorie
                    </label>
                    <div className="flex gap-4 flex-wrap">
                      <input
                        type="text"
                        placeholder="Entrez une catégorie..."
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="flex-1 min-w-[200px] bg-white/20 text-white placeholder-white/60 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:border-red-500 transition"
                      />
                      <button
                        onClick={() => setSearchCategory('')}
                        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Réinitialiser
                      </button>
                    </div>
                    
                    {/* Quick Category Filters */}
                    {categories.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-white/70 text-sm mr-2">Filtres rapides:</span>
                        {categories.map((cat, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchCategory(cat)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                              searchCategory === cat
                                ? 'bg-red-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3 text-white/60 text-sm">
                      {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {filteredEvents && filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <div 
                          key={event.id}
                          className="group relative overflow-hidden bg-white/95 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/30 rounded-lg"
                        >
                          <div className="relative h-80 overflow-hidden">
                            <img 
                              src={event.banner_image || `https://via.placeholder.com/800x500?text=${encodeURIComponent(event.title)}`}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                            
                            <div className="absolute top-6 left-6">
                              <div className="bg-blue-900 text-white px-4 py-2 font-bold rounded-lg shadow-xl">
                                <div className="text-2xl leading-none">
                                  {new Date(event.event_date).getDate()}
                                </div>
                                <div className="text-xs uppercase tracking-wider mt-1">
                                  {new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-8">
                            <h4 className="text-3xl font-bold mb-4 text-gray-900 group-hover:text-blue-900 transition-colors">
                              {event.title}
                            </h4>
                            
                            {event.category && (
                              <span className="inline-block px-3 py-1 text-xs bg-red-500/20 text-red-600 rounded-full mb-3 font-semibold">
                                {event.category}
                              </span>
                            )}
                            
                            <p className="text-gray-600 text-base leading-relaxed mb-6">
                              {event.description || 'Aucune description disponible.'}
                            </p>

                            <div className="flex flex-wrap gap-6 text-sm mb-6">
                              <div className="flex items-center gap-2 text-gray-700">
                                <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">
                                  {new Date(event.event_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="font-medium">{event.location}</span>
                                </div>
                              )}

                              {event.status && (
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    event.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    event.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {event.status}
                                  </span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => navigate(`/events/${event.id}`)}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Explorer l'événement
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-8 text-center">
                        <p className="text-gray-300">
                          {searchCategory 
                            ? `Aucun événement trouvé pour la catégorie "${searchCategory}".`
                            : 'Aucun événement pour le moment.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Président */}
              {activeTab === 'president' && (
                <div>
                  {president ? (
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-10 transition-all duration-500">
                      <h3 className="text-black text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-12 h-1 bg-red-500"></span>
                        Président du Club
                        <span className="w-12 h-1 bg-red-500"></span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="text-center space-y-6">
                          <div className="relative inline-block group">
                            <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                            <img 
                              src={president.avatar || 'https://via.placeholder.com/200'}
                              alt={`${president.first_name} ${president.last_name}`}
                              className="relative w-56 h-56 rounded-full mx-auto object-cover border-4 border-red-500 shadow-2xl"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-black text-2xl font-bold">
                              {president.first_name} {president.last_name}
                            </h4>
                            <p className="text-red-600 text-sm font-semibold">
                              Président · {club.name}
                            </p>
                          </div>

                          <div className="flex justify-center gap-4 pt-4">
                            {president.email && (
                              <a href={`mailto:${president.email}`} 
                                 className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-gray-700 space-y-6">
                          {president.email && (
                            <div className="group">
                              <p className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Contact
                              </p>
                              <p className="pl-4">{president.email}</p>
                            </div>
                          )}
                          
                          {president.phone && (
                            <div className="group">
                              <p className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Téléphone
                              </p>
                              <p className="pl-4">{president.phone}</p>
                            </div>
                          )}

                          {president.position && (
                            <div className="group">
                              <p className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Position
                              </p>
                              <p className="pl-4">{president.position}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-8 text-center">
                      <p className="text-gray-300">Aucun président pour le moment.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bureau */}
              {activeTab === 'bureau' && (
                <div className="transition-all duration-500">
                  {boardMembers.length > 0 || president ? (
                    <div className="space-y-8">
                      {president && (
                        <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-10">
                          <h3 className="text-black text-3xl font-bold mb-8 flex items-center gap-3">
                            <span className="w-12 h-1 bg-red-500"></span>
                            Président
                            <span className="w-12 h-1 bg-red-500"></span>
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="text-center space-y-6">
                              <div className="relative inline-block group">
                                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                                <img 
                                  src={president.avatar || 'https://via.placeholder.com/200'}
                                  alt={`${president.first_name} ${president.last_name}`}
                                  className="relative w-56 h-56 rounded-full mx-auto object-cover border-4 border-red-500 shadow-2xl"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-black text-2xl font-bold">
                                  {president.first_name} {president.last_name}
                                </h4>
                                <p className="text-red-600 text-sm font-semibold">
                                  Président · {club.name}
                                </p>
                              </div>

                              <div className="flex justify-center gap-4 pt-4">
                                {president.email && (
                                  <a href={`mailto:${president.email}`} 
                                     className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-lg">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-gray-700 space-y-6">
                              {president.email && (
                                <div className="group">
                                  <p className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Contact
                                  </p>
                                  <p className="pl-4">{president.email}</p>
                                </div>
                              )}
                              
                              {president.phone && (
                                <div className="group">
                                  <p className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Téléphone
                                  </p>
                                  <p className="pl-4">{president.phone}</p>
                                </div>
                              )}

                              {president.position && (
                                <div className="group">
                                  <p className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Position
                                  </p>
                                  <p className="pl-4">{president.position}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {boardMembers.length > 0 && (
                        <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-8">
                          <h3 className="text-black text-2xl font-bold mb-6 flex items-center gap-3">
                            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Membres du Bureau ({boardMembers.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {boardMembers.map((member) => (
                              <div key={member.id} className="group bg-gradient-to-br from-red-50 to-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-red-200 hover:border-red-400">
                                <div className="flex flex-col items-center text-center space-y-4">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <img 
                                      src={member.avatar || 'https://via.placeholder.com/100'}
                                      alt={`${member.first_name} ${member.last_name}`}
                                      className="relative w-24 h-24 rounded-full object-cover border-3 border-red-500 shadow-lg"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-lg text-gray-900">
                                      {member.first_name} {member.last_name}
                                    </h4>
                                    <p className="text-sm font-semibold text-red-600 mt-1">
                                      {member.position || 'Membre du bureau'}
                                    </p>
                                    {member.email && (
                                      <p className="text-xs text-gray-500 mt-2">{member.email}</p>
                                    )}
                                  </div>
                                  {member.phone && (
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      <span>{member.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-8 text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-300 text-lg">Aucun membre du bureau pour le moment.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Membres */}
              {activeTab === 'membres' && (
                <div className="space-y-8">
                  {boardMembers.length > 0 && (
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-8">
                      <h3 className="text-black text-2xl font-bold mb-6">Membres du Bureau</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boardMembers.map((member) => (
                          <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow border border-red-200">
                            <div className="flex items-center gap-4">
                              <img 
                                src={member.avatar || 'https://via.placeholder.com/80'}
                                alt={`${member.first_name} ${member.last_name}`}
                                className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {member.first_name} {member.last_name}
                                </h4>
                                <p className="text-sm text-red-600">{member.position || 'Membre du bureau'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-8">
                    <h3 className="text-black text-2xl font-bold mb-6">
                      Membres ({regularMembers.length})
                    </h3>
                    {regularMembers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularMembers.map((member) => (
                          <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4">
                              <img 
                                src={member.avatar || 'https://via.placeholder.com/80'}
                                alt={`${member.first_name} ${member.last_name}`}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {member.first_name} {member.last_name}
                                </h4>
                                {member.email && (
                                  <p className="text-sm text-gray-600">{member.email}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center">Aucun membre pour le moment.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClubDetail;