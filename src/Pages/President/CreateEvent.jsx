import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentCreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: '',
    event_date: '',
    registration_deadline: '',
    location: '',
    capacity: '',
    requires_ticket: false,
    tickets_for_all: false,
    price: 0,
    banner_image: null
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMyClub();
  }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setClub(data);
      } else {
        setErrorMessage('Impossible de charger votre club');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
      setErrorMessage('Erreur de connexion');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventData(prev => ({
        ...prev,
        banner_image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!club) {
      setErrorMessage('Aucun club trouvé');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      
      formData.append('club_id', club.id);
      formData.append('title', eventData.title);
      formData.append('description', eventData.description || '');
      formData.append('category', eventData.category || '');
      formData.append('event_date', eventData.event_date);
      formData.append('registration_deadline', eventData.registration_deadline || '');
      formData.append('location', eventData.location || '');
      formData.append('capacity', eventData.capacity || '');
      formData.append('requires_ticket', eventData.requires_ticket ? '1' : '0');
      formData.append('tickets_for_all', eventData.tickets_for_all ? '1' : '0');
      formData.append('price', eventData.price || '0');
      formData.append('created_by', user.id);
      formData.append('status', 'approved');
      
      if (eventData.banner_image) {
        formData.append('banner_image', eventData.banner_image);
      }

      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Événement créé avec succès!');
        setTimeout(() => {
          navigate('/President/Dashboard');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Erreur lors de la création de l\'événement');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-red-500/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-32 left-20 w-48 h-48 bg-red-500/15 rounded-full blur-2xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/President/Dashboard')}
            className="flex items-center text-red-400 hover:text-red-300 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Créer un Événement</h1>
          {club && (
            <p className="text-white/70">Organisez un nouvel événement pour votre club: <span className="font-semibold text-white">{club.name}</span></p>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-500/20 border border-green-500/40 backdrop-blur-sm text-green-300 px-4 py-3 rounded-xl">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border border-red-500/40 backdrop-blur-sm text-red-300 px-4 py-3 rounded-xl">
            {errorMessage}
          </div>
        )}

        {!club ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-white/70">Chargement de votre club...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Club Info Display */}
              <div className="md:col-span-2 mb-4 p-4 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {club.logo_url && (
                      <img src={club.logo_url} alt={club.name} className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                      <h3 className="font-bold text-white">{club.name}</h3>
                      <p className="text-sm text-white/60">{club.category}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold">
                    Club Président
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Titre de l'événement <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Workshop React.js"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Décrivez l'événement..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  name="category"
                  value={eventData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Technology, Sport"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Date de l'événement <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={eventData.event_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Registration Deadline */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Date limite d'inscription
                </label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={eventData.registration_deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Amphi 1"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Capacité
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={eventData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: 100"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Prix (DH)
                </label>
                <input
                  type="number"
                  name="price"
                  value={eventData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Banner Image */}
              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Image de bannière
                </label>
                <div className="space-y-4">
                  {bannerPreview && (
                    <div className="mb-4">
                      <p className="text-sm text-white/60 mb-2">Aperçu:</p>
                      <img 
                        src={bannerPreview} 
                        alt="Preview" 
                        className="max-h-64 rounded-xl border-2 border-white/20"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-white/60">
                          <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-white/40">PNG, JPG, GIF (Max. 2MB)</p>
                      </div>
                      <input 
                        type="file" 
                        name="banner_image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  
                  {eventData.banner_image && (
                    <p className="text-sm text-green-400">
                      ✓ Fichier sélectionné: {eventData.banner_image.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requires_ticket"
                    checked={eventData.requires_ticket}
                    onChange={handleChange}
                    className="w-5 h-5 text-red-600 bg-white/5 border-white/20 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-white">Nécessite un ticket</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="tickets_for_all"
                    checked={eventData.tickets_for_all}
                    onChange={handleChange}
                    className="w-5 h-5 text-red-600 bg-white/5 border-white/20 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-white">Tickets pour tous les membres</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Création en cours...' : 'Créer l\'Événement'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/President/Dashboard')}
                className="px-6 py-4 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
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

export default PresidentCreateEvent;