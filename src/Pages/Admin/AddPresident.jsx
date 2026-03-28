import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar';

const AddPresident = () => {
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

  const [presidentData, setPresidentData] = useState({
    first_name: '', last_name: '', email: '', password: '',
    password_confirmation: '', cne: '', phone: '', avatar: null,
    club_id: '', position: 'Président'
  });

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrors({ general: `Erreur clubs: ${error.message}` });
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPresidentData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setPresidentData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    const newErrors = {};
    if (!presidentData.first_name) newErrors.first_name = 'Prénom requis';
    if (!presidentData.email) newErrors.email = 'Email requis';
    if (!presidentData.club_id) newErrors.club_id = 'Séléctionnez un club';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setLoading(false); return; }

    try {
      const formData = new FormData();
      Object.keys(presidentData).forEach(key => {
        if(presidentData[key]) formData.append(key, presidentData[key]);
      });

      const personResponse = await fetch(`${API_BASE_URL}/api/persons`, { method: 'POST', credentials: 'include', body: formData });
      const personData = await personResponse.json();
      
      if (!personResponse.ok) { 
        setErrors({ general: personData.message || "Erreur création" }); 
        setLoading(false); 
        return; 
      }

      const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ person_id: personData.person.id, club_id: presidentData.club_id, role: 'president', position: presidentData.position, status: 'active' })
      });

      if (memberResponse.ok) {
        setSuccessMessage(`Accès créé pour ${presidentData.first_name}`);
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      }
    } catch (error) {
      setErrors({ general: 'Erreur serveur' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err) => `w-full px-5 py-4 rounded-2xl border transition-all duration-300 outline-none
    ${err ? 'border-red-500 bg-red-500/5' : dm ? 'border-white/10 bg-white/5 focus:border-[#c0392b] focus:bg-white/10' : 'border-gray-200 bg-gray-50 focus:border-[#1a2c5b] focus:bg-white'}
    ${dm ? 'text-white placeholder-white/20' : 'text-[#1a2c5b] placeholder-gray-400'}`;

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0a0a0a]' : 'bg-[#f8fafc]'}`}>
      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a2c5b]/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="flex-1 pt-24 px-8 pb-12 max-w-5xl mx-auto w-full">
          
          <div className="mb-10">
             <div className="w-16 h-1 bg-[#c0392b] mb-4"></div>
             <h1 className={`text-5xl font-black ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Nomination Président</h1>
             <p className={`text-lg font-medium ${dm ? 'text-white/40' : 'text-gray-500'}`}>Assignez un nouveau leader à un club existant</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Profile Pic Card */}
            <div className={`lg:col-span-1 p-8 rounded-[2.5rem] border text-center transition-all ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
               <div className="relative group mx-auto w-40 h-40 mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 border-dashed animate-spin-slow ${dm ? 'border-white/10' : 'border-gray-200'}`}></div>
                  <img src={avatarPreview || "https://ui-avatars.com/api/?background=c0392b&color=fff&name=P"} alt="Avatar" className="w-full h-full object-cover rounded-full p-2 border-2 border-[#c0392b]" />
                  <label className="absolute bottom-1 right-1 w-10 h-10 bg-[#c0392b] text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
               </div>
               <h3 className={`font-black uppercase tracking-widest text-sm mb-2 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Photo de Profil</h3>
               <p className="text-[10px] text-gray-500 uppercase font-black">Formats: JPG, PNG (Max 2MB)</p>
            </div>

            {/* Main Fields Card */}
            <div className={`lg:col-span-2 p-10 rounded-[2.5rem] border transition-all ${dm ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'}`}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Prénom</label>
                    <input type="text" name="first_name" value={presidentData.first_name} onChange={handleChange} className={inputCls(errors.first_name)} placeholder="Ahmed" />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Nom</label>
                    <input type="text" name="last_name" value={presidentData.last_name} onChange={handleChange} className={inputCls(false)} placeholder="Bennani" />
                  </div>
               </div>

               <div className="space-y-6 mb-8">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Club de destination</label>
                    <select name="club_id" value={presidentData.club_id} onChange={handleChange} className={inputCls(errors.club_id)}>
                        <option value="">Sélectionner l'organisation...</option>
                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Email Professionnel</label>
                    <input type="email" name="email" value={presidentData.email} onChange={handleChange} className={inputCls(errors.email)} placeholder="president@estfes.ma" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Mot de passe</label>
                        <input type="password" name="password" onChange={handleChange} className={inputCls(false)} placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase ml-1 ${dm ? 'text-white/40' : 'text-gray-400'}`}>Confirmer</label>
                        <input type="password" name="password_confirmation" onChange={handleChange} className={inputCls(false)} placeholder="••••••••" />
                    </div>
                  </div>
               </div>

               <button type="submit" disabled={loading} className="w-full bg-[#1a2c5b] hover:bg-[#0f1b3a] text-white py-5 rounded-3xl font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-4">
                  {loading ? "Création du compte..." : "Nommer le Président"}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPresident;