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
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

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
    
    // Synchroniser le dark mode avec la Navbar
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    };
    
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, [user]);

  useEffect(() => {
    // Initialiser le dark mode depuis le localStorage
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

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

  const inputClass = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 placeholder-gray-400 focus:outline-none
    ${dm
      ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60'
      : 'bg-white border-blue-300 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500'}`;

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-black' : ''}`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin mb-4 mx-auto ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-200 border-t-red-500'}`}></div>
          <p className={`text-lg ${dm ? 'text-gray-400' : 'text-gray-700'}`}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Créer un <span className="text-red-500">Événement</span>
          </h1>
          {userClubs.length > 0 && (
            <p className={`mt-2 ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
              Soumettre une demande pour le club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-500'}`}>{userClubs[0]?.club_name}</span>
            </p>
          )}
        </div>

        {/* Success */}
        {successMessage && (
          <div className={`mb-6 backdrop-blur-lg border-2 px-6 py-4 rounded-xl shadow-lg animate-slideInLeft
            ${dm
              ? 'bg-green-950/40 border-green-700/40 text-green-300 shadow-green-900/20'
              : 'bg-gradient-to-r from-green-100 to-green-50 border-green-400 text-green-800 shadow-green-200'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className={`mb-6 backdrop-blur-lg border-2 px-6 py-4 rounded-xl shadow-lg animate-slideInLeft
            ${dm
              ? 'bg-red-950/40 border-red-800/40 text-red-300 shadow-red-900/20'
              : 'bg-gradient-to-r from-red-100 to-red-50 border-red-400 text-red-800 shadow-red-200'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <pre className="font-semibold whitespace-pre-wrap text-sm">{errorMessage}</pre>
            </div>
          </div>
        )}

        {userClubs.length === 0 ? (
          <div className={`rounded-2xl shadow-md p-12 text-center border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-6xl mb-4">🏢</div>
            <p className={`text-lg ${dm ? 'text-gray-400' : 'text-gray-600'}`}>Vous devez être membre du bureau d'un club pour créer des événements.</p>
          </div>
        ) : (
          <div className={`rounded-2xl shadow-lg border animate-slideInUp overflow-hidden
            ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`}>

            {/* Club Info */}
            <div className="p-8 pb-0">
              <div className={`mb-6 p-5 rounded-xl border
                ${dm ? 'bg-black/60 border-red-900/40' : 'bg-gradient-to-r from-[#0f1d4a] to-[#0a1235] border-blue-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${dm ? 'text-red-300' : 'text-white'}`}>{userClubs[0]?.club_name}</h3>
                      <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-300'}`}>Club sélectionné</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold
                    ${dm
                      ? 'bg-red-900/40 text-red-300 border border-red-800/50'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200'}`}>
                    Bureau
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className={`flex gap-1 mb-6 p-1 rounded-xl ${dm ? 'bg-black/40' : 'bg-gray-100'}`}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? dm
                          ? 'bg-red-900/40 text-red-300 border border-red-800/50'
                          : 'bg-white text-gray-900 shadow-sm'
                        : dm
                          ? 'text-gray-500 hover:text-gray-400'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-8 pb-8">

              {/* Tab 0: Informations */}
              {activeTab === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInDown">

                  {/* Titre */}
                  <div className="md:col-span-2">
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>
                      Titre de l'événement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={eventData.title}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ex: Workshop React.js"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Description</label>
                    <textarea
                      name="description"
                      value={eventData.description}
                      onChange={handleChange}
                      rows="4"
                      className={inputClass}
                      placeholder="Décrivez votre événement..."
                    />
                  </div>

                  {/* Catégorie */}
                  <div className="md:col-span-2">
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Catégorie</label>
                    <input
                      type="text"
                      name="category"
                      value={eventData.category}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ex: Technology, Culture, Sport"
                    />
                  </div>

                  {/* Banner image URL */}
                  <div className="md:col-span-2">
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Image de bannière (URL)</label>
                    <input
                      type="url"
                      name="banner_image"
                      value={eventData.banner_image}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              )}

              {/* Tab 1: Détails */}
              {activeTab === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInDown">

                  {/* Date événement */}
                  <div>
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>
                      Date de l'événement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="event_date"
                      value={eventData.event_date}
                      onChange={handleChange}
                      className={inputClass + (dm ? ' [color-scheme:dark]' : ' [color-scheme:light]')}
                    />
                  </div>

                  {/* Date limite */}
                  <div>
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Date limite d'inscription</label>
                    <input
                      type="datetime-local"
                      name="registration_deadline"
                      value={eventData.registration_deadline}
                      onChange={handleChange}
                      className={inputClass + (dm ? ' [color-scheme:dark]' : ' [color-scheme:light]')}
                    />
                  </div>

                  {/* Lieu */}
                  <div>
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Lieu</label>
                    <input
                      type="text"
                      name="location"
                      value={eventData.location}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ex: Amphi 1, EST Fès"
                    />
                  </div>

                  {/* Capacité */}
                  <div>
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Capacité</label>
                    <input
                      type="number"
                      name="capacity"
                      value={eventData.capacity}
                      onChange={handleChange}
                      min="1"
                      className={inputClass}
                      placeholder="Ex: 100 personnes"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Billets */}
              {activeTab === 2 && (
                <div className="space-y-6 animate-fadeInDown">

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requires_ticket"
                        checked={eventData.requires_ticket}
                        onChange={handleChange}
                        className={`w-5 h-5 rounded border-2 focus:ring-2 cursor-pointer
                          ${dm ? 'bg-[#0d0d18] border-red-800/50 text-red-600 focus:ring-red-900/40' : 'text-red-600 border-gray-400 focus:ring-red-500'}`}
                      />
                      <div>
                        <span className={`font-medium block ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Nécessite un billet</span>
                        <span className={`text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Les participants devront obtenir un billet pour participer</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="tickets_for_all"
                        checked={eventData.tickets_for_all}
                        onChange={handleChange}
                        className={`w-5 h-5 rounded border-2 focus:ring-2 cursor-pointer
                          ${dm ? 'bg-[#0d0d18] border-red-800/50 text-red-600 focus:ring-red-900/40' : 'text-red-600 border-gray-400 focus:ring-red-500'}`}
                      />
                      <div>
                        <span className={`font-medium block ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Billets pour tous</span>
                        <span className={`text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Tous les membres du club recevront automatiquement un billet</span>
                      </div>
                    </label>
                  </div>

                  {/* Prix */}
                  <div>
                    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Prix du billet (DH)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={eventData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={inputClass}
                        placeholder="0.00"
                      />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>DH</span>
                    </div>
                    <p className={`text-sm mt-2 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Laissez à 0 pour un événement gratuit</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                  disabled={activeTab === 0}
                  className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                    activeTab === 0
                      ? dm
                        ? 'border-red-900/20 text-gray-700 cursor-not-allowed'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : dm
                        ? 'border-red-900/40 text-gray-400 hover:bg-red-950/20 hover:text-gray-300'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                >
                  ← Précédent
                </button>

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                  {tabs.map((tab, index) => (
                    <div
                      key={tab.id}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeTab
                          ? 'w-8 bg-red-500'
                          : dm ? 'w-2 bg-red-900/40' : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {activeTab < tabs.length - 1 ? (
                  <button
                    onClick={() => setActiveTab(Math.min(tabs.length - 1, activeTab + 1))}
                    className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] border-2 overflow-hidden
                      ${dm
                        ? 'bg-black border-red-800/50 hover:border-red-600/60 text-red-300 hover:text-white hover:bg-red-950/30 shadow-lg'
                        : 'bg-gradient-to-r from-[#0a3d62] via-[#0c5087] to-[#0a3d62] text-white hover:from-[#0c5087] hover:via-[#0e63a8] hover:to-[#0c5087] shadow-lg shadow-blue-300/50 hover:shadow-blue-400/70 border-blue-400/30'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative z-10">Suivant →</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || userClubs.length === 0}
                    className={`group relative px-8 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] border-2 overflow-hidden flex items-center gap-2
                      ${dm
                        ? 'bg-black border-red-800/50 hover:border-red-600/60 text-red-300 hover:text-white hover:bg-red-950/30 shadow-lg'
                        : 'bg-gradient-to-r from-[#0a3d62] via-[#0c5087] to-[#0a3d62] text-white hover:from-[#0c5087] hover:via-[#0e63a8] hover:to-[#0c5087] shadow-lg shadow-blue-300/50 hover:shadow-blue-400/70 border-blue-400/30'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="relative z-10">Envoi...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="relative z-10">Envoyer la Demande</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown  { animation: fadeInDown 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.7s ease-out; }
        .animate-slideInUp   { animation: slideInUp 0.7s ease-out; }
      `}</style>
    </div>
  );
};

export default BureauxCreateEvent;