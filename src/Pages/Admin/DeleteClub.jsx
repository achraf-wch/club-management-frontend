import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar';

const ManageClubs = () => {
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

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`, { credentials: 'include' });
      if (response.ok) { const data = await response.json(); setClubs(Array.isArray(data) ? data : []); }
      else setError('Erreur de chargement');
    } catch (err) { setError('Erreur serveur'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (clubId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        setClubs(clubs.filter(club => club.id !== clubId));
        setDeleteConfirm(null);
        setSuccess('Club révoqué.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) { setError('Erreur'); }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(clubs.map(c => c.category).filter(Boolean))];
  const getIcon = (cat) => ({ culture: '🎭', sport: '⚽', tech: '💻', art: '🎨' }[cat] || '📚');

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0a0a0a]' : 'bg-[#f8fafc]'}`}>
      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 relative overflow-hidden flex flex-col h-screen">
        
        {/* Header - Fixed height */}
        <div className="pt-24 px-8 pb-6 max-w-7xl mx-auto w-full">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="w-16 h-1 bg-[#c0392b] mb-4"></div>
                <h1 className={`text-6xl font-black ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Archives <span className="text-[#c0392b]">Clubs</span></h1>
                <p className={`text-lg font-medium mt-2 ${dm ? 'text-white/30' : 'text-gray-400'}`}>Gestion et modération de l'écosystème ({filteredClubs.length} unités)</p>
              </div>

              <div className="flex items-center gap-3">
                 <div className={`relative ${dm ? 'bg-white/5' : 'bg-white shadow-sm'} rounded-2xl border ${dm ? 'border-white/10' : 'border-gray-200'} overflow-hidden`}>
                    <input 
                      type="text" 
                      placeholder="Filtrer par nom..." 
                      className="bg-transparent px-6 py-4 outline-none text-sm font-bold w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <select 
                   className={`px-6 py-4 rounded-2xl border font-bold text-sm outline-none ${dm ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                 >
                    <option value="">Tous</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
           </div>
        </div>

        {/* Content - Responsive Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
           <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div key={club.id} className={`group rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 ${
                  dm ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl'
                }`}>
                   <div className="h-32 relative rounded-t-[2.5rem] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                      <img src={club.cover_image_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
                         <div className="w-12 h-12 rounded-xl border-2 border-white/50 overflow-hidden bg-white/20 backdrop-blur-md">
                            <img src={club.logo_url || `https://ui-avatars.com/api/?name=${club.name}`} className="w-full h-full object-cover" alt="" />
                         </div>
                         <h3 className="text-white font-black text-lg truncate w-40 tracking-tighter">{club.name}</h3>
                      </div>
                   </div>

                   <div className="p-8">
                      <p className={`text-sm mb-6 line-clamp-2 font-medium ${dm ? 'text-white/40' : 'text-gray-500'}`}>{club.description || 'Pas de description.'}</p>
                      
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-2">
                            <span className="text-xl">{getIcon(club.category)}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-[#c0392b]' : 'text-[#1a2c5b]'}`}>{club.category}</span>
                         </div>
                         <div className="flex -space-x-2">
                            {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-gray-800"></div>)}
                            <div className="w-6 h-6 rounded-full bg-[#c0392b] text-[8px] flex items-center justify-center font-bold text-white">+{club.total_members}</div>
                         </div>
                      </div>

                      <div className="flex gap-2">
                         <button onClick={() => navigate(`/clubs/${club.id}`)} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${dm ? 'bg-white/5 text-white hover:bg-[#c0392b]' : 'bg-gray-100 text-[#1a2c5b] hover:bg-[#1a2c5b] hover:text-white'}`}>
                            Observer
                         </button>
                         <button onClick={() => setDeleteConfirm(club.id)} className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Confirm Modal */}
        {deleteConfirm && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
              <div className={`p-10 rounded-[3rem] max-w-md w-full border text-center animate-in zoom-in-95 duration-300 ${dm ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-100 shadow-2xl'}`}>
                 <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <h2 className={`text-2xl font-black mb-2 ${dm ? 'text-white' : 'text-[#1a2c5b]'}`}>Révoquer le Club ?</h2>
                 <p className={`text-sm font-medium mb-8 ${dm ? 'text-white/40' : 'text-gray-500'}`}>Cette action est permanente et supprimera toutes les archives liées à cette organisation.</p>
                 <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className={`flex-1 py-4 rounded-2xl font-bold ${dm ? 'bg-white/5 text-white' : 'bg-gray-100'}`}>Annuler</button>
                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold shadow-xl shadow-red-900/30">Confirmer</button>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default ManageClubs;