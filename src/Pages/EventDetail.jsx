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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-white text-2xl font-bold mb-2">
                {error || 'Événement non trouvé'}
              </div>
              <p className="text-gray-400">Désolé, nous ne pouvons pas trouver cet événement.</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
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
  const bannerUrl = event.banner_url || getImageUrl(event.banner_image);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <Navbar />

      {/* Hero Section with Animated Background */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-red-500/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-red-600/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-red-700/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-red-500/15 rounded-full blur-3xl animate-float-delayed" style={{ animationDelay: '1.5s' }}></div>

        {/* Banner Image Overlay */}
        {bannerUrl && (
          <div className="absolute inset-0">
            <img 
              src={bannerUrl}
              alt={event.title}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/90 to-black"></div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-red-400 hover:text-red-300 transition-all duration-300 group animate-fade-in"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Retour</span>
          </button>

          {/* Event Title and Info */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 flex-wrap">
              {event.category && (
                <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded-full text-sm">
                  {event.category}
                </span>
              )}
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                event.status === 'completed' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' :
                event.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                'bg-gray-500/20 text-gray-300 border border-gray-500/50'
              }`}>
                {event.status === 'completed' ? '✓ Terminé' :
                 event.status === 'approved' ? '✓ Approuvé' :
                 event.status === 'pending' ? '⏳ En attente' : '📝 Brouillon'}
              </span>
            </div>

            <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight">
              {event.title}
            </h1>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-red-500/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-sm font-semibold uppercase">Date</span>
                </div>
                <p className="text-white text-lg font-bold">
                  {eventDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-red-400 font-bold text-xl mt-1">
                  {eventDate.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {event.location && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-red-500/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-400 text-sm font-semibold uppercase">Lieu</span>
                  </div>
                  <p className="text-white text-lg font-bold">{event.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="py-20 px-8 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Description */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                  <h2 className="text-3xl font-bold text-white">À propos de l'événement</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {event.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Recap Section */}
              {isCompleted && event.recap_description && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                    <h2 className="text-3xl font-bold text-white">Récapitulatif</h2>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {event.recap_description}
                  </p>
                </div>
              )}

              {/* Gallery Section */}
              {recapImages.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-3xl font-bold text-white">Galerie</h2>
                    <span className="text-sm font-normal text-gray-400">({recapImages.length} photo{recapImages.length > 1 ? 's' : ''})</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recapImages.map((image, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImage(image)}
                        className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-white/10 hover:border-red-500/50 transition-all duration-300"
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Event ${idx + 1}`}
                          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-red-500 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                          {idx + 1}/{recapImages.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24 space-y-6">
                {/* Event Info Card */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Informations</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Statut</p>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 ${
                        event.status === 'completed' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' :
                        event.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                        event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                        'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                      }`}>
                        {event.status === 'completed' ? '✓ Terminé' :
                         event.status === 'approved' ? '✓ Approuvé' :
                         event.status === 'pending' ? '⏳ En attente' : '📝 Brouillon'}
                      </span>
                    </div>

                    {/* Created Date */}
                    {event.created_at && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Créé le</p>
                        <p className="font-semibold text-white">
                          {new Date(event.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    {/* Completed Date */}
                    {event.completed_at && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Terminé le</p>
                        <p className="font-semibold text-white">
                          {new Date(event.completed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    {/* Category */}
                    {event.category && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Catégorie</p>
                        <p className="font-semibold text-red-400">{event.category}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Preview */}
                {recapImages.length > 0 && (
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                        {recapImages.length} Photo{recapImages.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {recapImages.slice(0, 4).map((img, idx) => (
                        <div 
                          key={idx} 
                          className="aspect-square rounded-lg overflow-hidden border-2 border-white/10 hover:border-red-500/50 transition-all cursor-pointer group"
                          onClick={() => setSelectedImage(img)}
                        >
                          <img 
                            src={getImageUrl(img)} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                        </div>
                      ))}
                    </div>
                    {recapImages.length > 4 && (
                      <button className="w-full mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors">
                        Voir toutes les photos (+{recapImages.length - 4})
                      </button>
                    )}
                  </div>
                )}

                {/* Action Button */}
                {event.status === 'approved' && !isCompleted && (
                  <div className="border-t border-white/10 pt-6">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      S'inscrire à l'événement
                    </button>
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
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-16 right-0 text-white hover:text-red-400 transition-colors bg-red-500/20 hover:bg-red-500/30 rounded-full p-3 backdrop-blur-sm border border-white/10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={getImageUrl(selectedImage)}
              alt="Full size"
              className="w-full h-auto rounded-2xl shadow-2xl border-2 border-red-500/50"
            />
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
          }
        }

        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-15px) translateX(-10px); 
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EventDetail;