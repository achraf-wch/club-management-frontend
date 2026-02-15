import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddClub = () => {
  const navigate = useNavigate();
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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

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
          navigate('/admin');
        }, 2000);
      } else {
        setErrors({ general: data.message || 'Erreur lors de l\'ajout du club' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'culture', label: 'Culture', icon: '🎭' },
    { value: 'sport', label: 'Sport', icon: '⚽' },
    { value: 'tech', label: 'Technologie', icon: '💻' },
    { value: 'art', label: 'Art', icon: '🎨' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'social', label: 'Social', icon: '🤝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au Dashboard
          </button>
        </div>
      </header>

      <div className="pt-24 px-8 pb-12 max-w-4xl mx-auto">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="mb-6 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.general}
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-red-500 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Créer un Nouveau Club</h1>
            <p className="text-white/80">Ajoutez un club à la plateforme EST Fès</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pb-3 border-b border-white/10">Informations de Base</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Nom du Club *</label>
                  <input
                    type="text"
                    name="name"
                    value={clubData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition ${
                      errors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Ex: Club Cultisio"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Code du Club *</label>
                  <input
                    type="text"
                    name="code"
                    value={clubData.code}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition ${
                      errors.code ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Ex: CULT-2024"
                  />
                  {errors.code && <p className="text-red-400 text-sm mt-1">{errors.code}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Description *</label>
                <textarea
                  name="description"
                  value={clubData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition ${
                    errors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                  rows="4"
                  placeholder="Décrivez l'objectif et les activités du club..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Mission (optionnel)</label>
                <textarea
                  name="mission"
                  value={clubData.mission}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
                  rows="3"
                  placeholder="La mission principale du club..."
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pb-3 border-b border-white/10">Catégorie</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setClubData(prev => ({ ...prev, category: cat.value }));
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: '' }));
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      clubData.category === cat.value
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-semibold">{cat.label}</div>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-400 text-sm">{errors.category}</p>}
            </div>

            {/* Additional Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pb-3 border-b border-white/10">Détails Supplémentaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Année de Fondation *</label>
                  <input
                    type="number"
                    name="founding_year"
                    value={clubData.founding_year}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition ${
                      errors.founding_year ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="2024"
                    min="1900"
                    max="2100"
                  />
                  {errors.founding_year && <p className="text-red-400 text-sm mt-1">{errors.founding_year}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Membres Totaux</label>
                  <input
                    type="number"
                    name="total_members"
                    value={clubData.total_members}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Membres Actifs</label>
                  <input
                    type="number"
                    name="active_members"
                    value={clubData.active_members}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pb-3 border-b border-white/10">Images</h2>

              {/* Logo */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Logo du Club</label>
                {!logoPreview ? (
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-red-500 hover:bg-white/5 transition-all">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-white text-sm font-medium mb-1">Cliquez pour sélectionner le logo</span>
                        <span className="text-gray-400 text-xs">PNG, JPG, GIF jusqu'à 2MB</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      name="logo"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                      <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-cover rounded-xl" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{clubData.logo?.name}</p>
                        <p className="text-gray-400 text-sm">{(clubData.logo?.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('logo')}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Image de Couverture</label>
                {!coverPreview ? (
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-red-500 hover:bg-white/5 transition-all">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <span className="text-white text-sm font-medium mb-1">Cliquez pour sélectionner l'image de couverture</span>
                        <span className="text-gray-400 text-xs">PNG, JPG, GIF jusqu'à 2MB (1200x400px)</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      name="cover_image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                      <img src={coverPreview} alt="Cover preview" className="h-24 w-40 object-cover rounded-xl" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{clubData.cover_image?.name}</p>
                        <p className="text-gray-400 text-sm">{(clubData.cover_image?.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('cover_image')}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors"
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

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="text-white font-semibold">Club Public</p>
                <p className="text-gray-400 text-sm">Le club sera visible par tous les utilisateurs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={clubData.is_public}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-white/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer le Club
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-float-delayed pointer-events-none"></div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
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

export default AddClub;