import React, { useState, useEffect } from 'react';
import Navbar from '../../Componenets/Navbar';

const AddPresident = () => {
  const [presidentData, setPresidentData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    cne: '',
    phone: '',
    avatar: null,
    club_id: '',
    position: 'Président'
  });

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL ||'http://localhost:8000/api';

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await fetch(`${API_BASE_URL}/clubs`);
      const data = await response.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setErrors({ general: 'Erreur lors du chargement des clubs' });
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPresidentData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setPresidentData(prev => ({ ...prev, [name]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validation
    const newErrors = {};
    if (!presidentData.first_name) newErrors.first_name = 'Le prénom est requis';
    if (!presidentData.last_name) newErrors.last_name = 'Le nom est requis';
    if (!presidentData.email) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(presidentData.email)) newErrors.email = 'Email invalide';
    if (!presidentData.password) newErrors.password = 'Le mot de passe est requis';
    else if (presidentData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    if (presidentData.password !== presidentData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    if (!presidentData.club_id) newErrors.club_id = 'Le club est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // ✅ Use FormData for file upload
      const formData = new FormData();
      formData.append('first_name', presidentData.first_name);
      formData.append('last_name', presidentData.last_name);
      formData.append('email', presidentData.email);
      formData.append('password', presidentData.password);
      formData.append('password_confirmation', presidentData.password_confirmation);
      formData.append('cne', presidentData.cne || '');
      formData.append('phone', presidentData.phone || '');
      
      // Only add avatar if file exists
      if (presidentData.avatar) {
        formData.append('avatar', presidentData.avatar);
      }

      // Step 1: Create the person
      const personResponse = await fetch(`${API_BASE_URL}/persons`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const personData = await personResponse.json();

      if (!personResponse.ok) {
        setErrors({ general: personData.message || 'Erreur lors de la création de l\'utilisateur' });
        setLoading(false);
        return;
      }

      // Step 2: Assign as president to the club
      const memberResponse = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          person_id: personData.person.id,
          club_id: presidentData.club_id,
          role: 'president',
          position: presidentData.position,
          status: 'active'
        })
      });

      const memberData = await memberResponse.json();

      if (memberResponse.ok) {
        setSuccessMessage(`Président ${presidentData.first_name} ${presidentData.last_name} ajouté avec succès!`);
        
        // Reset form
        setPresidentData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          password_confirmation: '',
          cne: '',
          phone: '',
          avatar: null,
          club_id: '',
          position: 'Président'
        });
        setAvatarPreview(null);

        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setErrors({ general: memberData.message || 'Erreur lors de l\'assignation au club' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'Erreur de connexion au serveur. Vérifiez que votre backend Laravel est en cours d\'exécution.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-24">
        <div className="max-w-3xl mx-auto">
          {successMessage && (
            <div className="mb-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg text-center animate-fadeIn flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg text-center animate-fadeIn flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.general}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Ajouter un Président</h1>
                  <p className="text-blue-100 mt-1">Créer un nouveau compte président pour un club</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informations Personnelles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Prénom *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={presidentData.first_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                        errors.first_name ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Ahmed"
                    />
                    {errors.first_name && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.first_name}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Nom *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={presidentData.last_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                        errors.last_name ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: El Mansouri"
                    />
                    {errors.last_name && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.last_name}
                    </p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">CNE</label>
                    <input
                      type="text"
                      name="cne"
                      value={presidentData.cne}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="Ex: R134567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={presidentData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="Ex: 0612345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Avatar (optionnel)</label>
                  <input
                    type="file"
                    name="avatar"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                  {avatarPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={avatarPreview} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover border-2 border-blue-500" />
                      <span className="text-sm text-gray-600">Aperçu de l'avatar</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Informations de Connexion
                </h2>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={presidentData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.email ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: ahmed@estfes.ma"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                    </svg>
                    {errors.email}
                  </p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Mot de passe *</label>
                    <input
                      type="password"
                      name="password"
                      value={presidentData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                        errors.password ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.password}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Confirmer mot de passe *</label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={presidentData.password_confirmation}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                        errors.password_confirmation ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.password_confirmation && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.password_confirmation}
                    </p>}
                  </div>
                </div>
              </div>

              {/* Club Assignment Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Assignation au Club
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Club *</label>
                    {loadingClubs ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600 text-sm">Chargement des clubs...</span>
                      </div>
                    ) : (
                      <select
                        name="club_id"
                        value={presidentData.club_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                          errors.club_id ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Sélectionner un club...</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>
                            {club.name} ({club.category})
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.club_id && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {errors.club_id}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={presidentData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="Ex: Président"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || loadingClubs}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Ajouter le Président
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Note importante :</p>
                <p>Un email sera automatiquement créé pour le président. Il pourra se connecter avec son email et le mot de passe que vous avez défini.</p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddPresident;