import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar';

const AddClub = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const dm = darkMode;

  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const [clubData, setClubData] = useState({
    name: '', code: '', description: '', mission: '',
    logo: null, cover_image: null, category: '',
    founding_year: '', is_public: true, total_members: 0, active_members: 0
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClubData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setClubData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'logo') setLogoPreview(reader.result);
        else if (name === 'cover_image') setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const removeFile = (fieldName) => {
    setClubData(prev => ({ ...prev, [fieldName]: null }));
    if (fieldName === 'logo') setLogoPreview(null);
    else if (fieldName === 'cover_image') setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

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
      if (clubData.mission?.trim()) formData.append('mission', clubData.mission.trim());
      if (clubData.logo) formData.append('logo', clubData.logo);
      if (clubData.cover_image) formData.append('cover_image', clubData.cover_image);

      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        method: 'POST', credentials: 'include', body: formData
      });
      
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Club ajouté avec succès!');
        setTimeout(() => { navigate('/admin/manageClubs'); }, 2000);
      } else if (response.status === 422) {
        // This maps Laravel validation errors back to your inputs
        setErrors(data.errors || { general: data.message });
      } else {
        setErrors({ general: data.message || "Erreur lors de l'ajout" });
      }
    } catch (error) {
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

  const inputCls = (err) => `w-full px-5 py-4 rounded-2xl border transition-all duration-300 outline-none
    ${err ? 'border-red-500 bg-red-500/5' : dm ? 'border-white/10 bg-white/5 focus:border-[#c0392b] focus:bg-white/10' : 'border-gray-200 bg-gray-50 focus:border-[#1a2c5b] focus:bg-white'}
    ${dm ? 'text-white placeholder-white/20' : 'text-[#1a2c5b] placeholder-gray-400'}`;

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0a0a0a]' : 'bg-[#f8fafc]'}`}>
      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#c0392b]/5 rounded-full blur-[120px] -z-10"></div>
        
        <div className="flex-1 pt-24 px-8 pb-12 max-w-5xl mx-auto w-full">
          
          <div className="mb-10 text-center md:text-left">
            <div className="w-16 h-1 bg-[#c0392b] mb-4 mx-auto md:mx-0"></div>
            <h1 className={`text-5xl font-black mb-2 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Nouveau Club</h1>
            <p className={`text-lg font-medium ${dm ? 'text-white/40' : 'text-gray-500'}`}>Enregistrez une nouvelle organisation au sein de l'EST Fès</p>
          </div>

          {/* General error message if validation fails */}
          {errors.general && (
            <div className="mb-8 bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-2xl font-bold">
              {errors.general}
            </div>
          )}

          {successMessage && (
            <div className="mb-8 animate-bounce bg-green-500/10 border border-green-500/50 text-green-500 px-6 py-4 rounded-2xl flex items-center gap-3 font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className={`rounded-[2.5rem] border overflow-hidden p-8 md:p-12 shadow-2xl ${dm ? 'bg-white/5 border-white/10 shadow-black/50' : 'bg-white border-gray-100 shadow-gray-200/50'}`}>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Column */}
                <div className="space-y-8">
                  <section>
                    <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>
                      <span className="w-8 h-8 rounded-lg bg-[#c0392b] flex items-center justify-center text-white text-sm">01</span>
                      Identité du Club
                    </h2>
                    <div className="space-y-5">
                      <div>
                        <input type="text" name="name" value={clubData.name} onChange={handleChange} className={inputCls(errors.name)} placeholder="Nom complet du club..." />
                        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase">{errors.name[0] || errors.name}</p>}
                      </div>
                      <div>
                        <input type="text" name="code" value={clubData.code} onChange={handleChange} className={inputCls(errors.code)} placeholder="Code Identifiant (ex: CLB-24)" />
                        {errors.code && <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase">{errors.code[0] || errors.code}</p>}
                      </div>
                      <div>
                        <textarea name="description" value={clubData.description} onChange={handleChange} className={`${inputCls(errors.description)} resize-none`} rows="4" placeholder="Description détaillée..." />
                        {errors.description && <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase">{errors.description[0] || errors.description}</p>}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>
                      <span className="w-8 h-8 rounded-lg bg-[#1a2c5b] flex items-center justify-center text-white text-sm">02</span>
                      Catégorisation
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button key={cat.value} type="button"
                          onClick={() => { setClubData(prev => ({ ...prev, category: cat.value })); setErrors(p => ({...p, category: ''})); }}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center ${
                            clubData.category === cat.value ? 'bg-[#c0392b] border-[#c0392b] text-white' : dm ? 'bg-white/5 border-white/5 text-white/40' : 'bg-gray-50 border-transparent text-gray-500'
                          }`}>
                          <div className="text-2xl mb-1">{cat.icon}</div>
                          <div className="text-[10px] font-black uppercase">{cat.label}</div>
                        </button>
                      ))}
                    </div>
                    {errors.category && <p className="text-red-500 text-[10px] font-bold mt-2 text-center uppercase">{errors.category[0] || errors.category}</p>}
                  </section>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                   <section>
                    <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>
                      <span className="w-8 h-8 rounded-lg bg-[#c0392b] flex items-center justify-center text-white text-sm">03</span>
                      Médias & Visibilité
                    </h2>
                    
                    <div className="mb-6">
                      {!logoPreview ? (
                        <label className={`group cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 transition-all ${dm ? 'border-white/10' : 'border-gray-200'}`}>
                          <input type="file" name="logo" onChange={handleFileChange} accept="image/*" className="hidden" />
                          <span className={`text-xs font-black uppercase ${dm ? 'text-white/40' : 'text-gray-400'}`}>Importer Logo</span>
                        </label>
                      ) : (
                        <div className={`relative rounded-3xl p-4 border flex items-center gap-4 ${dm ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                          <img src={logoPreview} alt="Logo" className="w-16 h-16 object-cover rounded-xl" />
                          <button type="button" onClick={() => removeFile('logo')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">X</button>
                        </div>
                      )}
                      {errors.logo && <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase">{errors.logo[0] || errors.logo}</p>}
                    </div>

                    <div className={`p-6 rounded-3xl border flex items-center justify-between ${dm ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#1a2c5b] text-white'}`}>
                      <p className="font-black uppercase tracking-tighter text-sm">Visibilité Publique</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_public" checked={clubData.is_public} onChange={handleChange} className="sr-only peer" />
                        <div className="w-12 h-6 bg-gray-700/50 rounded-full peer peer-checked:bg-[#c0392b] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                      </label>
                    </div>
                  </section>

                  <section className="pt-4">
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <label className="text-[10px] font-black uppercase ml-1 opacity-50">Fondation</label>
                           <input type="number" name="founding_year" value={clubData.founding_year} onChange={handleChange} className={inputCls(errors.founding_year)} />
                           {errors.founding_year && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase">{errors.founding_year[0] || errors.founding_year}</p>}
                        </div>
                     </div>
                  </section>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <button type="submit" disabled={loading} className="w-full bg-[#c0392b] text-white py-5 rounded-[2rem] font-black text-xl uppercase tracking-widest transition-all">
                  {loading ? "Chargement..." : "Initialiser le Club"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClub;