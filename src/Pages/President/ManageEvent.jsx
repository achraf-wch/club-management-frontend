import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentManageEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [recapData, setRecapData] = useState({ recap_description: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loadingRecap, setLoadingRecap] = useState(false);
  
  // Theme management consistent with other pages
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const dm = darkMode;

  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  useEffect(() => {
    fetchMyClub();
    fetchEvents();
  }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setClub(data);
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    if (filter === 'upcoming') return events.filter(e => new Date(e.event_date) >= now);
    if (filter === 'completed') return events.filter(e => e.status === 'completed' || new Date(e.event_date) < now);
    return events;
  };

  const openRecapModal = (event) => {
    setSelectedEvent(event);
    let parsedImages = [];
    if (event.recap_images) {
      try {
        parsedImages = typeof event.recap_images === 'string'
          ? JSON.parse(event.recap_images)
          : event.recap_images;
      } catch (e) { console.error('Error parsing recap_images:', e); }
    }
    setExistingImages(Array.isArray(parsedImages) ? parsedImages : []);
    setRecapData({ recap_description: event.recap_description || '' });
    setNewImages([]);
    setShowRecapModal(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewImages(prev => [...prev, ...files]);
  };

  const removeExistingImage = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index) => setNewImages(prev => prev.filter((_, i) => i !== index));

  const saveRecap = async () => {
    if (!selectedEvent) return;
    setLoadingRecap(true);
    try {
      const formData = new FormData();
      formData.append('recap_description', recapData.recap_description);
      // Logic to handle existing vs new images would be implemented in your backend
      newImages.forEach((file) => formData.append('recap_images[]', file));
      
      const response = await fetch(`${API_BASE_URL}/api/events/${selectedEvent.id}/recap`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (response.ok) {
        setShowRecapModal(false);
        fetchEvents();
      } else {
        const errorData = await response.json();
        alert(`❌ Erreur: ${errorData.message || "Impossible d'enregistrer"}`);
      }
    } catch (error) {
      alert(`❌ Erreur de connexion: ${error.message}`);
    } finally {
      setLoadingRecap(false);
    }
  };

  const markAsCompleted = async (eventId) => {
    if (!window.confirm('Marquer cet événement comme terminé?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (response.ok) { fetchEvents(); }
      else alert('❌ Erreur lors de la mise à jour');
    } catch (error) {
      alert(`❌ Erreur de connexion: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
        <div className={`w-16 h-16 border-4 rounded-full animate-spin ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-200 border-t-red-500'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8 animate-fadeInDown text-center md:text-left">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Gestion des <span className={dm ? 'text-cyan-400' : 'text-red-500'}>Événements</span>
          </h1>
          {club && (
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <p className={`text-lg ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
                Club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-500'}`}>{club.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 animate-slideInLeft">
          {[
            { id: 'all', label: `Tous (${events.length})`, color: 'red' },
            { id: 'upcoming', label: 'À venir', color: 'green' },
            { id: 'completed', label: 'Terminés', color: 'blue' }
          ].map((btn) => (
            <button key={btn.id} onClick={() => setFilter(btn.id)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${
                filter === btn.id
                  ? dm ? `bg-red-950/30 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]` : `bg-red-600 border-red-600 text-white shadow-lg`
                  : dm ? `bg-black/40 border-red-900/20 text-gray-500 hover:border-red-700/50` : `bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200`
              }`}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredEvents().map((event, index) => {
            const isPast = new Date(event.event_date) < new Date();
            const isCompleted = event.status === 'completed';

            return (
              <div key={event.id}
                className={`group rounded-2xl overflow-hidden border transition-all duration-500 hover:scale-[1.02] animate-slideInUp
                  ${dm ? 'bg-[#0d0d18] border-red-900/20 hover:border-red-600/40 shadow-xl shadow-black/50' : 'bg-white border-gray-100 shadow-md hover:shadow-xl'}`}
                style={{ animationDelay: `${index * 0.1}s` }}>
                
                <div className="relative h-40 overflow-hidden">
                  <img src={event.banner_url || getImageUrl(event.banner_image) || 'https://via.placeholder.com/800x400'} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${isPast || isCompleted ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                      {isPast || isCompleted ? 'Terminé' : 'À venir'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${dm ? 'text-gray-100 group-hover:text-red-400' : 'text-gray-900'} transition-colors`}>{event.title}</h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${dm ? 'text-gray-400' : 'text-gray-600'}`}>{event.description || 'Aucune description'}</p>

                  <div className="flex flex-col gap-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className={dm ? 'text-gray-300' : 'text-gray-700'}>{new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        <span className={dm ? 'text-gray-300' : 'text-gray-700'}>{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {(isPast || isCompleted) ? (
                      <button onClick={() => openRecapModal(event)}
                        className={`group/btn flex-1 relative py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 overflow-hidden border-2
                          ${dm ? 'bg-black border-red-800/50 text-red-400 hover:text-white hover:bg-red-900/40' : 'bg-red-600 border-red-600 text-white hover:bg-red-700'}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10">{event.recap_description ? 'Modifier Récap' : 'Ajouter Récap'}</span>
                      </button>
                    ) : (
                      <button onClick={() => markAsCompleted(event.id)}
                        className={`group/btn flex-1 relative py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 overflow-hidden border-2
                          ${dm ? 'bg-black border-green-800/50 text-green-400 hover:text-white hover:bg-green-900/40' : 'bg-green-600 border-green-600 text-white hover:bg-green-700'}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10">Marquer Terminé</span>
                      </button>
                    )}
                    <button onClick={() => navigate(`/events/${event.id}`)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition-all duration-300
                        ${dm ? 'border-red-900/40 text-gray-400 hover:bg-red-950/20 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      Explorer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {getFilteredEvents().length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <div className={`inline-block p-10 rounded-3xl border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-6xl mb-4">📅</div>
              <p className={`text-xl ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Aucun événement à afficher</p>
            </div>
          </div>
        )}
      </div>

      {/* Recap Modal - Matching AddMember/AddClub theme */}
      {showRecapModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowRecapModal(false)}>
          <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 shadow-2xl animate-scaleIn
            ${dm ? 'bg-[#0d0d18] border-red-900/40' : 'bg-white border-red-500/20'}`} onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>Récapitulatif de l'événement</h2>
                <button onClick={() => setShowRecapModal(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block font-bold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Description du Récapitulatif</label>
                  <textarea value={recapData.recap_description} onChange={(e) => setRecapData(prev => ({ ...prev, recap_description: e.target.value }))} rows={6}
                    placeholder="Quels ont été les moments forts ?"
                    className={`w-full p-4 rounded-xl border-2 transition-all focus:outline-none
                      ${dm ? 'bg-black/40 border-red-900/40 text-white focus:ring-2 focus:ring-red-500/30' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500'}`} />
                </div>

                <div>
                  <label className={`block font-bold mb-3 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Galerie Photos</label>
                  
                  {/* Image Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {existingImages.map((img, idx) => (
                      <div key={`ex-${idx}`} className="relative aspect-video rounded-lg overflow-hidden border-2 border-red-500/30">
                        <img src={getImageUrl(img)} alt="Recap" className="w-full h-full object-cover" />
                        <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-lg">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    {newImages.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-video rounded-lg overflow-hidden border-2 border-green-500/30">
                        <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                        <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-lg">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    
                    <label className={`flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed cursor-pointer transition-all
                      ${dm ? 'bg-black/40 border-red-900/40 hover:bg-red-900/10' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}>
                      <svg className="w-8 h-8 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Ajouter</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={saveRecap} disabled={loadingRecap}
                    className={`group relative flex-1 py-4 rounded-xl font-bold transition-all duration-300 overflow-hidden shadow-lg hover:scale-[1.02]
                      ${dm ? 'bg-black border-2 border-red-800/50 text-red-400 hover:text-white hover:bg-red-900/40' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative z-10">{loadingRecap ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                  </button>
                  <button onClick={() => setShowRecapModal(false)}
                    className={`px-8 py-4 rounded-xl font-bold border-2 transition-all
                      ${dm ? 'border-red-900/40 text-gray-400 hover:bg-red-950/20' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.7s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default PresidentManageEvents;