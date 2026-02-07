import React, { useState } from 'react';
import Navbar from '../../Componenets/Navbar';

const AddClub = () => {
  const [clubData, setClubData] = useState({
    name: '',
    code: '',
    description: '',
    mission: '',
    logo: null,
    cover_image: null,
    category: '',
    founding_year: '',
    is_public: true,
    total_members: 0,
    active_members: 0
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClubData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setClubData(prev => ({ ...prev, [name]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'logo') {
          setLogoPreview(reader.result);
        } else if (name === 'cover_image') {
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const removeFile = (fieldName) => {
    setClubData(prev => ({ ...prev, [fieldName]: null }));
    if (fieldName === 'logo') {
      setLogoPreview(null);
    } else if (fieldName === 'cover_image') {
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validation
    const newErrors = {};
    if (!clubData.name) newErrors.name = 'Le nom du club est requis';
    if (!clubData.code) newErrors.code = 'Le code du club est requis';
    if (!clubData.description) newErrors.description = 'La description est requise';
    if (!clubData.category) newErrors.category = 'La catégorie est requise';
    if (!clubData.founding_year) newErrors.founding_year = 'L\'année de fondation est requise';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', clubData.name);
      formData.append('code', clubData.code);
      formData.append('description', clubData.description);
      formData.append('category', clubData.category);
      formData.append('founding_year', clubData.founding_year);
      formData.append('is_public', clubData.is_public ? 1 : 0);
      formData.append('total_members', clubData.total_members || 0);
      formData.append('active_members', clubData.active_members || 0);

      if (clubData.mission && clubData.mission.trim()) {
        formData.append('mission', clubData.mission.trim());
      }

      if (clubData.logo) {
        formData.append('logo', clubData.logo);
      }
      if (clubData.cover_image) {
        formData.append('cover_image', clubData.cover_image);
      }

      console.log('📤 Sending form data with files');

      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        setSuccessMessage('Club ajouté avec succès!');
        setClubData({
          name: '',
          code: '',
          description: '',
          mission: '',
          logo: null,
          cover_image: null,
          category: '',
          founding_year: '',
          is_public: true,
          total_members: 0,
          active_members: 0
        });
        setLogoPreview(null);
        setCoverPreview(null);

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        console.error('❌ Error response:', data);
        if (data.errors) {
          console.error('📋 Validation errors:', JSON.stringify(data.errors, null, 2));
        }
        setErrors({ general: data.message || 'Erreur lors de l\'ajout du club' });
      }
    } catch (error) {
      console.error('💥 Fetch error:', error);
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8 pt-24">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {successMessage && (
            <div className="mb-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-center animate-fadeIn">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg text-center animate-fadeIn">
              {errors.general}
            </div>
          )}

          <h1 className="text-3xl font-bold mb-6 text-gray-800">Ajouter un Club</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nom du Club *</label>
                <input
                  type="text"
                  name="name"
                  value={clubData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.name ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Cultisio Club"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Code du Club *</label>
                <input
                  type="text"
                  name="code"
                  value={clubData.code}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.code ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: CULT-2024"
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Description *</label>
              <textarea
                name="description"
                value={clubData.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  errors.description ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                }`}
                rows="4"
                placeholder="Description du club..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Mission</label>
              <textarea
                name="mission"
                value={clubData.mission}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows="3"
                placeholder="Mission du club..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Catégorie *</label>
                <select
                  name="category"
                  value={clubData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.category ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner...</option>
                  <option value="culture">Culture</option>
                  <option value="sport">Sport</option>
                  <option value="tech">Technologie</option>
                  <option value="art">Art</option>
                  <option value="science">Science</option>
                  <option value="social">Social</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Année de Fondation *</label>
                <input
                  type="number"
                  name="founding_year"
                  value={clubData.founding_year}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.founding_year ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 2024"
                  min="1900"
                  max="2100"
                />
                {errors.founding_year && <p className="text-red-500 text-sm mt-1">{errors.founding_year}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Membres Totaux</label>
                <input
                  type="number"
                  name="total_members"
                  value={clubData.total_members}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Membres Actifs</label>
                <input
                  type="number"
                  name="active_members"
                  value={clubData.active_members}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Logo Upload - File Explorer Style */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Logo du Club</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                {!logoPreview ? (
                  <label className="cursor-pointer flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600 mb-2">Cliquez pour sélectionner le logo</span>
                    <span className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 2MB</span>
                    <input
                      type="file"
                      name="logo"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <div className="flex items-center bg-gray-50 rounded-lg p-3">
                      <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-cover rounded border border-gray-200" />
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{clubData.logo?.name}</p>
                        <p className="text-xs text-gray-500">{(clubData.logo?.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('logo')}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image Upload - File Explorer Style */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Image de Couverture</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                {!coverPreview ? (
                  <label className="cursor-pointer flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600 mb-2">Cliquez pour sélectionner l'image de couverture</span>
                    <span className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 2MB (Recommandé: 1200x400px)</span>
                    <input
                      type="file"
                      name="cover_image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <div className="flex items-center bg-gray-50 rounded-lg p-3">
                      <img src={coverPreview} alt="Cover preview" className="h-20 w-32 object-cover rounded border border-gray-200" />
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{clubData.cover_image?.name}</p>
                        <p className="text-xs text-gray-500">{(clubData.cover_image?.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('cover_image')}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_public"
                checked={clubData.is_public}
                onChange={handleChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Club Public (visible par tous)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le Club'}
            </button>
          </form>
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

export default AddClub;