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
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

  const API_BASE_URL = 'http://localhost:8000';

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
      newImages.forEach((file) => formData.append('recap_images[]', file));
      const response = await fetch(`${API_BASE_URL}/api/events/${selectedEvent.id}/recap`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (response.ok) {
        alert('✅ Récapitulatif enregistré avec succès!');
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
      if (response.ok) { alert('✅ Événement marqué comme terminé!'); fetchEvents(); }
      else alert('❌ Erreur lors de la mise à jour');
    } catch (error) {
      alert(`❌ Erreur de connexion: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
        <div className={`text-2xl ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>

      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6 animate-fadeInDown">
          <h1 className={`text-3xl font-bold ${dm ? 'text-red-400' : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent'}`}>
            Gestion des <span className={dm ? 'text-white' : ''}>Événements</span>
          </h1>
          {club && (
            <div className="flex items-center gap-2 mt-2">
              {club.logo_url && (
                <img src={club.logo_url} alt={club.name} className="w-8 h-8 rounded-full object-cover border-2 border-red-400/50 shadow" />
              )}
              <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                Club: <span className="font-semibold text-red-500">{club.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6 animate-slideInLeft">
          <button onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
              filter === 'all'
                ? dm ? 'bg-gradient-to-r from-red-900/60 to-rose-900/60 text-red-300 border border-red-700/40 shadow-lg'
                     : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-300 scale-105'
                : dm ? 'bg-black/40 text-gray-500 border border-red-900/20 hover:bg-red-950/20'
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
            }`}>
            Tous ({events.length})
          </button>
          <button onClick={() => setFilter('upcoming')}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
              filter === 'upcoming'
                ? dm ? 'bg-gradient-to-r from-green-900/60 to-emerald-900/60 text-green-300 border border-green-700/40 shadow-lg'
                     : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-300 scale-105'
                : dm ? 'bg-black/40 text-gray-500 border border-red-900/20 hover:bg-red-950/20'
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
            }`}>
            À venir
          </button>
          <button onClick={() => setFilter('completed')}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
              filter === 'completed'
                ? dm ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 text-blue-300 border border-blue-700/40 shadow-lg'
                     : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-300 scale-105'
                : dm ? 'bg-black/40 text-gray-500 border border-red-900/20 hover:bg-red-950/20'
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
            }`}>
            Terminés
          </button>
        </div>

        {/* Events Grid - 3 colonnes, cards plus petites */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredEvents().map((event, index) => {
            const isPast = new Date(event.event_date) < new Date();
            const isCompleted = event.status === 'completed';

            return (
              <div
                key={event.id}
                className={`group rounded-xl overflow-hidden border transition-all duration-500 hover:scale-[1.02] hover:shadow-xl animate-fadeInUp
                  ${dm
                    ? 'bg-gradient-to-br from-[#0f1020] to-[#0a0a18] border-red-900/30 hover:border-red-600/50 hover:shadow-red-900/20'
                    : 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-red-500/30 hover:border-red-400/60 hover:shadow-red-500/20'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Banner - plus petite */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={event.banner_url || getImageUrl(event.banner_image) || 'https://via.placeholder.com/800x400'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1235] via-transparent to-transparent opacity-70"></div>
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {isPast || isCompleted ? (
                      <span className="px-2 py-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs rounded-full font-bold shadow">
                        Terminé
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded-full font-bold shadow">
                        À venir
                      </span>
                    )}
                  </div>
                </div>

                {/* Content - compact */}
                <div className="p-4">
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition-colors duration-300 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-1">
                    {event.description || 'Aucune description'}
                  </p>

                  {/* Event Info - compact */}
                  <div className="flex items-center gap-3 text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-300">{new Date(event.event_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-gray-300 truncate max-w-[80px]">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - compacts */}
                  <div className="flex gap-2">
                    {(isPast || isCompleted) && (
                      <>
                        <button
                          onClick={() => openRecapModal(event)}
                          className="group/btn flex-1 relative bg-gradient-to-r from-red-600 to-rose-600 text-white py-1.5 px-3 rounded-lg text-xs font-bold hover:from-red-500 hover:to-rose-500 transition-all duration-300 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                          <span className="relative z-10">{event.recap_description ? 'Modifier Récap' : 'Ajouter Récap'}</span>
                        </button>
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="flex-1 bg-white/10 border border-red-500/50 text-white py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all duration-300">
                          Explorer
                        </button>
                      </>
                    )}
                    {!isPast && !isCompleted && (
                      <>
                        <button
                          onClick={() => markAsCompleted(event.id)}
                          className="group/btn flex-1 relative bg-gradient-to-r from-green-600 to-emerald-600 text-white py-1.5 px-3 rounded-lg text-xs font-bold hover:from-green-500 hover:to-emerald-500 transition-all duration-300 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                          <span className="relative z-10">Terminer</span>
                        </button>
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="flex-1 bg-white/10 border border-red-500/50 text-white py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all duration-300">
                          Explorer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {getFilteredEvents().length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <div className={`inline-block p-8 rounded-2xl border shadow-sm ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-red-200'}`}>
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className={`text-base ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Aucun événement trouvé</p>
            </div>
          </div>
        )}
      </div>

      {/* Recap Modal */}
      {showRecapModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowRecapModal(false)}>
          <div
            className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 shadow-2xl animate-scaleIn
              ${dm ? 'bg-[#0d0d18] border-red-900/40 shadow-red-900/20' : 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-red-400/40 shadow-red-500/20'}`}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6">

              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                  Récapitulatif
                </h2>
                <button onClick={() => setShowRecapModal(false)}
                  className="text-gray-400 hover:text-red-400 transition-all duration-300 hover:rotate-90">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Event Title */}
              <div className={`mb-5 p-3 rounded-xl border ${dm ? 'bg-red-900/10 border-red-900/30' : 'bg-red-900/20 border-red-500/30'}`}>
                <h3 className="text-lg font-semibold text-white mb-0.5">{selectedEvent.title}</h3>
                <p className="text-red-400 text-sm">{new Date(selectedEvent.event_date).toLocaleDateString('fr-FR')}</p>
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-white font-semibold mb-2 text-sm">Description</label>
                <textarea
                  value={recapData.recap_description}
                  onChange={(e) => setRecapData(prev => ({ ...prev, recap_description: e.target.value }))}
                  rows={5}
                  placeholder="Décrivez l'événement..."
                  className={`w-full border-2 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 placeholder-gray-500 transition-all duration-300
                    ${dm ? 'bg-black/60 text-white border-red-900/40' : 'bg-[#060d2a] text-white border-red-500/30'}`}
                />
              </div>

              {/* Photos Section */}
              <div className="mb-5">
                <label className="block text-white font-semibold mb-2 text-sm">Photos</label>

                {existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-red-400 mb-2 text-xs font-semibold">Images existantes:</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                          <img src={getImageUrl(img)} alt={`Photo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-red-400/50 group-hover:border-yellow-400 transition-all duration-300 group-hover:scale-105" />
                          <button onClick={() => removeExistingImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-green-400 mb-2 text-xs font-semibold">Nouvelles images:</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {newImages.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                          <img src={URL.createObjectURL(file)} alt={`Nouvelle photo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-green-500/50 group-hover:border-yellow-400 transition-all duration-300 group-hover:scale-105" />
                          <button onClick={() => removeNewImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="cursor-pointer block">
                  <div className={`border-2 border-dashed rounded-xl px-4 py-6 transition-all duration-300 text-center group
                    ${dm ? 'bg-black/40 border-red-900/50 hover:bg-red-950/20 hover:border-red-700' : 'bg-[#060d2a] border-red-500/50 hover:bg-[#0a1235] hover:border-red-400'}`}>
                    <svg className="w-8 h-8 text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-white font-semibold text-sm">Ajouter des images</span>
                    <p className="text-gray-400 text-xs mt-1">JPG, PNG, GIF • Max 2MB</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={saveRecap} disabled={loadingRecap}
                  className="group/btn flex-1 relative bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-5 rounded-xl font-bold text-sm hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">{loadingRecap ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
                <button onClick={() => setShowRecapModal(false)}
                  className={`px-5 py-2.5 border-2 rounded-xl text-sm transition-all duration-300
                    ${dm ? 'border-red-900/40 text-gray-400 hover:bg-red-950/20 hover:text-gray-300' : 'border-gray-500/50 text-gray-300 hover:bg-gray-700/30 hover:border-gray-400'}`}>
                  Annuler
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.7s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PresidentManageEvents;