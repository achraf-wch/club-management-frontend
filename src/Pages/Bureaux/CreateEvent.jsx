import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const BureauxCreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [eventData, setEventData] = useState({
    club_id: '',
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
    banner_image: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const tabs = [
    { id: 0, name: 'Informations', icon: '📝', color: 'red' },
    { id: 1, name: 'Détails', icon: '🎯', color: 'red' },
    { id: 2, name: 'Billets', icon: '🎫', color: 'red' }
  ];

  useEffect(() => {
    if (user) {
      fetchUserClubs();
    }
  }, [user]);

  const fetchUserClubs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserClubs(data);
        if (data.length > 0) {
          setEventData(prev => ({ ...prev, club_id: data[0].club_id }));
        }
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!eventData.club_id || !eventData.title || !eventData.event_date) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      const metadataObject = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category || null,
        event_date: eventData.event_date,
        registration_deadline: eventData.registration_deadline || null,
        location: eventData.location || null,
        capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
        requires_ticket: eventData.requires_ticket,
        tickets_for_all: eventData.tickets_for_all,
        price: parseFloat(eventData.price) || 0,
        banner_image: eventData.banner_image || null
      };

      const requestPayload = {
        club_id: parseInt(eventData.club_id),
        requested_by: user.id,
        type: 'event',
        title: `Demande de création d'événement: ${eventData.title}`,
        description: `Événement proposé par ${user.first_name} ${user.last_name}`,
        metadata: metadataObject
      };

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('✓ Demande envoyée avec succès! En attente de validation du président.');
        setTimeout(() => {
          setEventData({
            club_id: userClubs[0]?.club_id || '',
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
            banner_image: ''
          });
          setSuccessMessage('');
          setActiveTab(0);
        }, 3000);
      } else {
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          setErrorMessage(errorMessages);
        } else {
          setErrorMessage(data.message || 'Erreur lors de l\'envoi de la demande');
        }
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion au serveur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-8">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Return Button */}
        <button
          onClick={() => navigate('/Bureaux/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl text-white transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📅</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Créer un Événement</h1>
              <p className="text-white/70">Soumettre une demande au président</p>
            </div>
          </div>

          {userClubs.length > 0 && (
            <div className="mt-6 p-4 bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-sm text-white/60">Club</p>
                  <p className="font-bold text-white">{userClubs[0]?.club_name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-500/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-green-300 text-lg">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <pre className="font-semibold text-red-300 whitespace-pre-wrap text-sm">{errorMessage}</pre>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="text-2xl block mb-1">{tab.icon}</span>
                <span className="text-sm">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Tab 0: Basic Info */}
            {activeTab === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Titre de l'événement <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    placeholder="Ex: Workshop React.js"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all resize-none"
                    placeholder="Décrivez votre événement..."
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={eventData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    placeholder="Ex: Technology, Culture, Sport"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Image de bannière (URL)
                  </label>
                  <input
                    type="url"
                    name="banner_image"
                    value={eventData.banner_image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            )}

            {/* Tab 1: Details */}
            {activeTab === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Date de l'événement <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="event_date"
                      value={eventData.event_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Date limite d'inscription
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_deadline"
                      value={eventData.registration_deadline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Lieu
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={eventData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="Ex: Amphi 1, EST Fès"
                    />
                  </div>

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
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="Ex: 100 personnes"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Tickets */}
            {activeTab === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎫</span>
                    Configuration des billets
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                      <input
                        type="checkbox"
                        name="requires_ticket"
                        checked={eventData.requires_ticket}
                        onChange={handleChange}
                        className="w-5 h-5 text-red-600 bg-white/10 border-white/20 rounded focus:ring-red-500 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold text-white block">Nécessite un billet</span>
                        <span className="text-sm text-white/60">Les participants devront obtenir un billet pour participer</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                      <input
                        type="checkbox"
                        name="tickets_for_all"
                        checked={eventData.tickets_for_all}
                        onChange={handleChange}
                        className="w-5 h-5 text-red-600 bg-white/10 border-white/20 rounded focus:ring-red-500 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold text-white block">Billets pour tous</span>
                        <span className="text-sm text-white/60">Tous les membres du club recevront automatiquement un billet</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    Prix du billet (DH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={eventData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 font-semibold">DH</span>
                  </div>
                  <p className="text-sm text-white/50 mt-2">Laissez à 0 pour un événement gratuit</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 0
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ← Précédent
            </button>

            {activeTab < tabs.length - 1 ? (
              <button
                onClick={() => setActiveTab(Math.min(tabs.length - 1, activeTab + 1))}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || userClubs.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Envoyer la Demande
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeTab ? 'w-8 bg-red-600' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BureauxCreateEvent;