import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

const ClubCreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
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
    banner_image: null,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const effectiveRole = user?.role === 'user' ? user?.club_role : user?.role;
  const isPresident = effectiveRole === 'president';
  const dm = darkMode;

  useEffect(() => {
    const handleThemeChange = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    const fetchMyClub = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/my-club-info`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setClub(data.club || data);
          return;
        }
        const fallback = await fetch(`${API_BASE_URL}/api/my-club`, { credentials: 'include' });
        if (fallback.ok) {
          const data = await fallback.json();
          setClub(data.club || data);
        }
      } catch {
        setErrorMessage('Erreur de connexion');
      }
    };
    fetchMyClub();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEventData((prev) => ({ ...prev, banner_image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEventData({
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
      banner_image: null,
    });
    setBannerPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!club?.id || !eventData.title || !eventData.event_date) {
      setErrorMessage('Veuillez remplir les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      if (isPresident) {
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
        formData.append('price', String(eventData.price || 0));
        formData.append('created_by', user.id);
        formData.append('status', 'approved');
        if (eventData.banner_image) formData.append('banner_image', eventData.banner_image);

        const response = await fetch(`${API_BASE_URL}/api/events`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Erreur lors de la création de l'événement");
        setSuccessMessage('Événement créé avec succès !');
      } else {
        const response = await fetch(`${API_BASE_URL}/api/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            club_id: parseInt(club.id, 10),
            requested_by: user.id,
            type: 'event',
            title: `Demande de création d'événement: ${eventData.title}`,
            description: `Événement proposé par ${user.first_name} ${user.last_name}`,
            metadata: {
              title: eventData.title,
              description: eventData.description,
              category: eventData.category || null,
              event_date: eventData.event_date,
              registration_deadline: eventData.registration_deadline || null,
              location: eventData.location || null,
              capacity: eventData.capacity ? parseInt(eventData.capacity, 10) : null,
              requires_ticket: eventData.requires_ticket,
              tickets_for_all: eventData.tickets_for_all,
              price: parseFloat(eventData.price) || 0,
            },
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Erreur lors de l'envoi de la demande");
        setSuccessMessage('✓ Demande envoyée avec succès ! En attente de validation du président.');
      }

      resetForm();
    } catch (error) {
      setErrorMessage(error.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 placeholder-gray-400 focus:outline-none ${
    dm
      ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60'
      : 'bg-white border-blue-300 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500'
  }`;

  const checkboxCls = `w-5 h-5 rounded border-2 focus:ring-2 cursor-pointer ${
    dm ? 'bg-[#0d0d18] border-red-800/50 text-red-600 focus:ring-red-900/40' : 'text-red-600 border-gray-400 focus:ring-red-500'
  }`;

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Créer un <span className="text-red-500">Événement</span>
          </h1>
          {club && (
            <p className={`mt-2 ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
              {isPresident ? 'Créer un événement pour le club:' : 'Soumettre une demande pour le club:'}{' '}
              <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-500'}`}>{club.name}</span>
            </p>
          )}
        </div>

        {successMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl ${dm ? 'bg-green-950/40 border-green-700/40 text-green-300' : 'bg-green-50 border-green-400 text-green-800'}`}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl ${dm ? 'bg-red-950/40 border-red-800/40 text-red-300' : 'bg-red-50 border-red-400 text-red-800'}`}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={`rounded-2xl shadow-lg p-8 border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`}>
          <div className={`mb-6 p-5 rounded-xl border ${dm ? 'bg-black/60 border-red-900/40' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-bold text-lg ${dm ? 'text-red-300' : 'text-gray-900'}`}>{club?.name || 'Club'}</h3>
                <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Zone partagée club</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${dm ? 'bg-red-900/40 text-red-300 border border-red-800/50' : 'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}>
                {isPresident ? 'Président' : 'Bureau'}
              </span>
            </div>
          </div>

          {!isPresident && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm font-semibold">
              Cette création passera par une validation du président.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Titre de l'événement *</label>
              <input type="text" name="title" value={eventData.title} onChange={handleChange} required className={inputCls} />
            </div>

            <div className="md:col-span-2">
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Description</label>
              <textarea name="description" value={eventData.description} onChange={handleChange} rows="4" className={inputCls} />
            </div>

            <div>
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Catégorie</label>
              <input type="text" name="category" value={eventData.category} onChange={handleChange} className={inputCls} />
            </div>

            <div>
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Date de l'événement *</label>
              <input type="datetime-local" name="event_date" value={eventData.event_date} onChange={handleChange} required className={`${inputCls} ${dm ? '[color-scheme:dark]' : '[color-scheme:light]'}`} />
            </div>

            <div>
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Date limite d'inscription</label>
              <input type="datetime-local" name="registration_deadline" value={eventData.registration_deadline} onChange={handleChange} className={`${inputCls} ${dm ? '[color-scheme:dark]' : '[color-scheme:light]'}`} />
            </div>

            <div>
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Lieu</label>
              <input type="text" name="location" value={eventData.location} onChange={handleChange} className={inputCls} />
            </div>

            <div>
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Capacité</label>
              <input type="number" name="capacity" value={eventData.capacity} onChange={handleChange} min="1" className={inputCls} />
            </div>

            <div>
              <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Prix (DH)</label>
              <input type="number" name="price" value={eventData.price} onChange={handleChange} min="0" step="0.01" className={inputCls} />
            </div>

            {isPresident && (
              <div className="md:col-span-2">
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Image de bannière</label>
                {bannerPreview && <img src={bannerPreview} alt="Preview" className="mb-4 max-h-64 w-full object-cover rounded-lg border-2 border-red-500/50" />}
                <input type="file" accept="image/*" onChange={handleFileChange} className={inputCls} />
              </div>
            )}

            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="requires_ticket" checked={eventData.requires_ticket} onChange={handleChange} className={checkboxCls} />
                <span className={dm ? 'text-gray-300' : 'text-gray-800'}>Nécessite un ticket</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="tickets_for_all" checked={eventData.tickets_for_all} onChange={handleChange} className={checkboxCls} />
                <span className={dm ? 'text-gray-300' : 'text-gray-800'}>Tickets pour tous les membres</span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button type="submit" disabled={loading} className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 ${dm ? 'bg-black border-2 border-red-800/50 text-red-300 hover:text-white hover:bg-red-950/30' : 'bg-gradient-to-r from-[#0a3d62] via-[#0c5087] to-[#0a3d62] text-white border-blue-400/30'}`}>
              {loading ? 'Traitement...' : isPresident ? "Créer l'Événement" : 'Envoyer la Demande'}
            </button>
            <button type="button" onClick={() => navigate('/club/dashboard')} className={`px-6 py-4 border-2 rounded-xl transition-all duration-300 ${dm ? 'border-red-900/40 text-gray-400 hover:bg-red-950/20 hover:text-gray-300' : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'}`}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubCreateEvent;
