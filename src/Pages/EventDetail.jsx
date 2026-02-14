// ============================================
// FILE: src/Pages/EventDetail.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Componenets/Navbar';
import Footer from '../Componenets/Footer';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://localhost:8000';

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
      
      if (!response.ok) {
        throw new Error('Événement non trouvé');
      }
      
      const data = await response.json();
      setEvent(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get full image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-white text-2xl mb-4">
              {error || 'Événement non trouvé'}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recapImages = Array.isArray(event.recap_images) ? event.recap_images : [];
  const eventDate = new Date(event.event_date);
  const isCompleted = event.status === 'completed';

  // Use banner_url if provided, otherwise construct from banner_image
  const bannerUrl = event.banner_url || getImageUrl(event.banner_image);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      <Navbar />

      {/* Back Button */}
      <div className="sticky top-16 z-40 bg-black/50 backdrop-blur-md border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-950">
        {bannerUrl && (
          <>
            <img 
              src={bannerUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
          </>
        )}
        
        <div className="relative z-10 h-full flex items-end p-8">
          <div className="max-w-7xl w-full">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-white text-5xl font-bold mb-4">{event.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  {event.category && (
                    <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded-full text-sm">
                      {event.category}
                    </span>
                  )}
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    event.status === 'completed' ? 'bg-purple-600 text-white' :
                    event.status === 'approved' ? 'bg-green-600 text-white' :
                    event.status === 'pending' ? 'bg-yellow-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {event.status === 'completed' ? 'Terminé' :
                     event.status === 'approved' ? 'Approuvé' :
                     event.status === 'pending' ? 'En attente' : 'Brouillon'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Description */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">À propos de l'événement</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {event.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Event Details */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Détails</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Date & Heure
                    </h3>
                    <p className="text-gray-700">
                      {eventDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-700 font-semibold">
                      {eventDate.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {event.location && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Lieu
                      </h3>
                      <p className="text-gray-700">{event.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recap Section */}
              {isCompleted && event.recap_description && (
                <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Récapitulatif</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.recap_description}
                  </p>
                </div>
              )}

              {/* Gallery Section */}
              {recapImages.length > 0 && (
                <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galerie ({recapImages.length})
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recapImages.map((image, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImage(image)}
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                      >
                        <img
                          src={getImageUrl(image)} // ✅ use full URL
                          alt={`Event ${idx + 1}`}
                          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl p-6 sticky top-32 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Statut</h3>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold inline-block ${
                    event.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                    event.status === 'approved' ? 'bg-green-100 text-green-700' :
                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {event.status === 'completed' ? 'Terminé' :
                     event.status === 'approved' ? 'Approuvé' :
                     event.status === 'pending' ? 'En attente' : 'Brouillon'}
                  </span>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Informations</h3>
                  <div className="space-y-4 text-sm text-gray-700">
                    {event.created_at && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Créé le</p>
                        <p className="font-medium">
                          {new Date(event.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                    {event.completed_at && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Terminé le</p>
                        <p className="font-medium">
                          {new Date(event.completed_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                    {event.category && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Catégorie</p>
                        <p className="font-medium">{event.category}</p>
                      </div>
                    )}
                  </div>
                </div>

                {recapImages.length > 0 && (
                  <div className="border-t pt-6">
                    <p className="text-gray-500 text-xs font-semibold mb-3">
                      {recapImages.length} PHOTO{recapImages.length > 1 ? 'S' : ''}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {recapImages.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="w-12 h-12 bg-gray-300 rounded-lg overflow-hidden">
                          <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {recapImages.length > 4 && (
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          +{recapImages.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={getImageUrl(selectedImage)} // ✅ full URL
              alt="Full size"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;