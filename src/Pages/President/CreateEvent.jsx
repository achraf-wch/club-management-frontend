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
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

  const [eventData, setEventData] = useState({
    title: '', description: '', category: '', event_date: '',
    registration_deadline: '', location: '', capacity: '',
    requires_ticket: false, tickets_for_all: false, price: 0, banner_image: null
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchMyClub(); }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, { credentials: 'include' });
      if (response.ok) { const data = await response.json(); setClub(data); }
      else setErrorMessage('Impossible de charger votre club');
    } catch (error) { setErrorMessage('Erreur de connexion'); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventData(prev => ({ ...prev, banner_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(''); setErrorMessage('');
    if (!club) { setErrorMessage('Aucun club trouvé'); setLoading(false); return; }
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
      if (eventData.banner_image) formData.append('banner_image', eventData.banner_image);

      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST', headers: { 'Accept': 'application/json' }, credentials: 'include', body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Événement créé avec succès!');
        setTimeout(() => navigate('/President/Dashboard'), 2000);
      } else {
        setErrorMessage(data.message || "Erreur lors de la création de l'événement");
      }
    } catch (error) { setErrorMessage('Erreur de connexion au serveur'); }
    finally { setLoading(false); }
  };

  const inputCls = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 placeholder-gray-400 focus:outline-none
    ${dm ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-700/60 [color-scheme:dark]' : 'bg-white border-blue-300 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 [color-scheme:light]'}`;

  const checkboxCls = `w-5 h-5 rounded border-2 focus:ring-2 cursor-pointer
    ${dm ? 'bg-[#0d0d18] border-red-800/50 text-red-600 focus:ring-red-900/40' : 'text-red-600 border-gray-400 focus:ring-red-500'}`;

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>

      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Créer un <span className={dm ? 'text-cyan-400' : 'text-red-500'}>Événement</span>
          </h1>
          {club && (
            <p className={`mt-2 ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
              Organisez un nouvel événement pour votre club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-500'}`}>{club.name}</span>
            </p>
          )}
        </div>

        {/* Success */}
        {successMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl flex items-center gap-3 animate-slideInLeft
            ${dm ? 'bg-green-950/40 border-green-700/40 text-green-300' : 'bg-gradient-to-r from-green-100 to-green-50 border-green-400 text-green-800'}`}>
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className={`mb-6 border-2 px-6 py-4 rounded-xl flex items-center gap-3 animate-slideInLeft
            ${dm ? 'bg-red-950/40 border-red-800/40 text-red-300' : 'bg-gradient-to-r from-red-100 to-red-50 border-red-400 text-red-800'}`}>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {!club ? (
          <div className={`rounded-2xl shadow-md p-12 text-center border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-6xl mb-4">🏢</div>
            <p className={`text-lg mb-4 ${dm ? 'text-gray-400' : 'text-gray-600'}`}>Chargement de votre club...</p>
            <div className={`w-16 h-16 mx-auto border-4 rounded-full animate-spin ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-200 border-t-red-500'}`}></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`rounded-2xl shadow-lg p-8 border animate-slideInUp
            ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Club Info */}
              <div className={`md:col-span-2 mb-4 p-5 rounded-xl border
                ${dm ? 'bg-black/60 border-red-900/40' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {club.logo_url && <img src={club.logo_url} alt={club.name} className="w-12 h-12 rounded-full object-cover border-2 border-red-500/50 shadow-lg" />}
                    <div>
                      <h3 className={`font-bold text-lg ${dm ? 'text-red-300' : 'text-gray-900'}`}>{club.name}</h3>
                      <p className={`text-sm ${dm ? 'text-cyan-700' : 'text-gray-500'}`}>{club.category}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold
                    ${dm ? 'bg-red-900/40 text-red-300 border border-red-800/50' : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200'}`}>
                    Président
                  </span>
                </div>
              </div>

              {/* Titre */}
              <div className="md:col-span-2">
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Titre de l'événement <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={eventData.title} onChange={handleChange} required className={inputCls} placeholder="Ex: Workshop React.js" />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Description</label>
                <textarea name="description" value={eventData.description} onChange={handleChange} rows="4" className={inputCls} placeholder="Décrivez l'événement..." />
              </div>

              {/* Catégorie */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Catégorie</label>
                <input type="text" name="category" value={eventData.category} onChange={handleChange} className={inputCls} placeholder="Ex: Technology, Sport" />
              </div>

              {/* Date événement */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Date de l'événement <span className="text-red-500">*</span></label>
                <input type="datetime-local" name="event_date" value={eventData.event_date} onChange={handleChange} required className={inputCls} />
              </div>

              {/* Date limite */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Date limite d'inscription</label>
                <input type="datetime-local" name="registration_deadline" value={eventData.registration_deadline} onChange={handleChange} className={inputCls} />
              </div>

              {/* Lieu */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Lieu</label>
                <input type="text" name="location" value={eventData.location} onChange={handleChange} className={inputCls} placeholder="Ex: Amphi 1" />
              </div>

              {/* Capacité */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Capacité</label>
                <input type="number" name="capacity" value={eventData.capacity} onChange={handleChange} min="1" className={inputCls} placeholder="Ex: 100" />
              </div>

              {/* Prix */}
              <div>
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Prix (DH)</label>
                <input type="number" name="price" value={eventData.price} onChange={handleChange} min="0" step="0.01" className={inputCls} placeholder="0" />
              </div>

              {/* Banner */}
              <div className="md:col-span-2">
                <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-800'}`}>Image de bannière</label>
                <div className="space-y-4">
                  {bannerPreview && (
                    <div className="mb-4 group">
                      <p className={`text-sm mb-2 ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Aperçu:</p>
                      <div className="relative overflow-hidden rounded-lg">
                        <img src={bannerPreview} alt="Preview" className="max-h-64 w-full object-cover rounded-lg border-2 border-red-500/50 shadow-lg transition-all duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                          <span className="text-white font-semibold text-sm bg-red-600/80 px-4 py-2 rounded-full">Aperçu de l'image</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 group
                      ${dm ? 'border-red-800/50 bg-black/30 hover:bg-red-950/20 hover:border-red-600/60' : 'border-red-400 bg-gray-50 hover:bg-red-50 hover:border-red-500'}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-red-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className={`mb-2 text-sm ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-500'}`}>Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF (Max. 2MB)</p>
                      </div>
                      <input type="file" name="banner_image" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                  {eventData.banner_image && (
                    <p className={`text-sm flex items-center gap-2 ${dm ? 'text-cyan-600' : 'text-green-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Fichier sélectionné: <span className={dm ? 'text-gray-400' : 'text-gray-600'}>{eventData.banner_image.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
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

            {/* Submit */}
            <div className="mt-8 flex gap-4">
              <button type="submit" disabled={loading}
                className={`group flex-1 relative py-4 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg hover:scale-[1.02] border-2 overflow-hidden
                  ${dm
                    ? 'bg-black border-red-800/50 hover:border-red-600/60 text-red-300 hover:text-white hover:bg-red-950/30'
                    : 'bg-gradient-to-r from-[#0a3d62] via-[#0c5087] to-[#0a3d62] text-white border-blue-400/30 hover:border-blue-400/50 shadow-blue-300/50 hover:shadow-blue-400/70'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">{loading ? 'Création en cours...' : "Créer l'Événement"}</span>
              </button>
              <button type="button" onClick={() => navigate('/President/Dashboard')}
                className={`px-6 py-4 border-2 rounded-xl transition-all duration-300
                  ${dm ? 'border-red-900/40 text-gray-400 hover:bg-red-950/20 hover:text-gray-300' : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'}`}>
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInDown  { animation: fadeInDown 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.7s ease-out; }
        .animate-slideInUp   { animation: slideInUp 0.7s ease-out; }
      `}</style>
    </div>
  );
};

export default PresidentCreateEvent;