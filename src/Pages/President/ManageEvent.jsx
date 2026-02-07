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
  const [recapData, setRecapData] = useState({
    recap_description: '',
    recap_images: []
  });
  const [newImages, setNewImages] = useState([]);
  const [loadingRecap, setLoadingRecap] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://localhost:8000';

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
    if (filter === 'upcoming') {
      return events.filter(e => new Date(e.event_date) >= now);
    } else if (filter === 'completed') {
      return events.filter(e => e.status === 'completed' || new Date(e.event_date) < now);
    }
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
      } catch (e) {
        console.error('Error parsing recap_images:', e);
      }
    }
    setRecapData({
      recap_description: event.recap_description || '',
      recap_images: Array.isArray(parsedImages) ? parsedImages : []
    });
    setNewImages([]);
    setShowRecapModal(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setNewImages(prev => [...prev, ...files]);
  };

  const removeExistingImage = (index) => {
    setRecapData(prev => ({
      ...prev,
      recap_images: prev.recap_images.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveRecap = async () => {
    if (!selectedEvent) return;
    
    setLoadingRecap(true);
    
    try {
      const formData = new FormData();
      formData.append('recap_description', recapData.recap_description);
      
      // Append existing images as JSON
      formData.append('existing_images', JSON.stringify(recapData.recap_images));
      
      // Append new images
      newImages.forEach((file, index) => {
        formData.append(`new_images[${index}]`, file);
      });

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
        alert(`❌ Erreur: ${errorData.message || 'Impossible d\'enregistrer'}`);
      }
    } catch (error) {
      console.error('💥 Network error:', error);
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        alert('✅ Événement marqué comme terminé!');
        fetchEvents();
      } else {
        alert('❌ Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      alert(`❌ Erreur de connexion: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/President/Dashboard')}
            className="flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Gestion des Événements</h1>
          {club && (
            <div className="flex items-center gap-3 mt-2">
              {club.logo_url && (
                <img src={club.logo_url} alt={club.name} className="w-8 h-8 rounded-full object-cover" />
              )}
              <p className="text-gray-300">Club: <span className="font-semibold">{club.name}</span></p>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Tous ({events.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'upcoming'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Terminés
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getFilteredEvents().map(event => {
            const isPast = new Date(event.event_date) < new Date();
            const isCompleted = event.status === 'completed';

            return (
              <div
                key={event.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="relative h-48">
                  <img
                    src={event.banner_image 
                      ? (event.banner_image.startsWith('http') 
                         ? event.banner_image 
                         : `${API_BASE_URL}/storage/${event.banner_image}`)
                      : 'https://via.placeholder.com/800x400'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {isPast || isCompleted ? (
                      <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full font-semibold">
                        Terminé
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full font-semibold">
                        À venir
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {event.description || 'Aucune description'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.event_date).toLocaleDateString('fr-FR')}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.location}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 flex-col">
                    {(isPast || isCompleted) && (
                      <>
                        <button
                          onClick={() => openRecapModal(event)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                          {event.recap_description ? 'Modifier Récap' : 'Ajouter Récap'}
                        </button>
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
                          Explorer
                        </button>
                      </>
                    )}
                    {!isPast && !isCompleted && (
                      <>
                        <button
                          onClick={() => markAsCompleted(event.id)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all"
                        >
                          Marquer comme terminé
                        </button>
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
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

        {getFilteredEvents().length === 0 && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-lg">Aucun événement trouvé</p>
          </div>
        )}
      </div>

      {showRecapModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRecapModal(false)}>
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Récapitulatif</h2>
                <button
                  onClick={() => setShowRecapModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{selectedEvent.title}</h3>
                <p className="text-gray-400">
                  {new Date(selectedEvent.event_date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">Description</label>
                <textarea
                  value={recapData.recap_description}
                  onChange={(e) => setRecapData(prev => ({...prev, recap_description: e.target.value}))}
                  rows={6}
                  placeholder="Décrivez l'événement..."
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                />
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">Photos</label>
                
                {/* Existing Images */}
                {recapData.recap_images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-300 mb-2">Images existantes:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {recapData.recap_images.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                          <img
                            src={img.startsWith('http') ? img : `${API_BASE_URL}/storage/${img}`}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-white/20"
                          />
                          <button
                            onClick={() => removeExistingImage(idx)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {newImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-300 mb-2">Nouvelles images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newImages.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Nouvelle photo ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-green-500/50"
                          />
                          <button
                            onClick={() => removeNewImage(idx)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 hover:bg-white/20 transition-colors text-center">
                      <svg className="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-gray-300">Ajouter des images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
                <p className="text-gray-400 text-sm mt-2">Format: JPG, PNG, GIF. Taille max: 2MB par image</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveRecap}
                  disabled={loadingRecap}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                >
                  {loadingRecap ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setShowRecapModal(false)}
                  className="px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PresidentManageEvents;