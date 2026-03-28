import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';

const PresidentAddMember = () => {
  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const dm = darkMode;

  const { user } = useAuth();

  const [memberData, setMemberData] = useState({
    first_name: '', last_name: '', email: '', phone: '', cne: '',
    password: '', password_confirmation: '', 
    position: 'Membre', 
    role: 'member' // 'member' or 'board'
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { 
    fetchMyClub(); 
    const handleTheme = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handleTheme);
    return () => window.removeEventListener('themeChanged', handleTheme);
  }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include', headers: { 'Accept': 'application/json' }
      });
      if (response.ok) { 
        const data = await response.json(); 
        // Logic: handle both {club: {}} and direct object responses
        setClub(data.club || data); 
      }
      else setErrorMessage('Impossible de charger votre club');
    } catch (error) { setErrorMessage('Erreur de connexion'); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 10; i++) password += charset.charAt(Math.floor(Math.random() * charset.length));
    setMemberData(prev => ({ ...prev, password, password_confirmation: password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccessMessage(''); setErrorMessage('');

    if (!club?.id) { setErrorMessage('Aucun club trouvé'); setLoading(false); return; }
    
    try {
      // 1. Create Person
      const pRes = await fetch(`${API_BASE_URL}/api/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(memberData)
      });
      
      const pData = await pRes.json();
      if (!pRes.ok) {
        setErrorMessage(pData.errors ? Object.values(pData.errors).flat().join(', ') : pData.message);
        setLoading(false); return;
      }

      // 2. Link Member (Your ID logic fix here)
      const personId = pData.person?.id || pData.id;

      const mRes = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          person_id: personId,
          club_id: club.id,
          role: memberData.role,
          position: memberData.position,
          status: 'active'
        })
      });

      if (mRes.ok) {
        setSuccessMessage(`✓ ${memberData.role === 'board' ? 'Membre du Bureau' : 'Membre'} ajouté avec succès!`);
        setMemberData({ first_name: '', last_name: '', email: '', phone: '', cne: '', password: '', password_confirmation: '', position: 'Membre', role: 'member' });
      } else {
        const mData = await mRes.json();
        setErrorMessage(mData.message || "Erreur lors de l'affiliation au club");
      }
    } catch (err) { setErrorMessage(err.message); }
    finally { setLoading(false); }
  };

  const inputCls = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 placeholder-gray-400 focus:outline-none
    ${dm ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-700/60' : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400'}`;

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Ajouter un <span className={dm ? 'text-cyan-400' : 'text-red-600'}>Membre</span>
          </h1>
          {club && (
            <div className="flex items-center gap-3 mt-3">
              <p className={dm ? 'text-gray-400' : 'text-gray-500'}>
                Club: <span className={`font-semibold ${dm ? 'text-red-400' : 'text-red-600'}`}>{club.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {successMessage && <div className="mb-6 bg-green-500/20 border border-green-500 p-4 rounded-xl text-green-400 font-bold">{successMessage}</div>}
        {errorMessage && <div className="mb-6 bg-red-500/20 border border-red-500 p-4 rounded-xl text-red-400 font-bold">{errorMessage}</div>}

        <div className={`rounded-2xl shadow-sm p-8 border ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-gray-50 border-gray-200'}`}>
          
          {/* ROLE SELECTOR (Restored logic with your styling) */}
          <div className="grid grid-cols-2 gap-4 mb-8">
             <button 
                type="button"
                onClick={() => setMemberData(p => ({...p, role: 'member', position: 'Membre'}))}
                className={`py-3 rounded-xl font-bold transition-all ${memberData.role === 'member' ? 'bg-red-600 text-white' : 'bg-gray-800/20 text-gray-500'}`}
             >
                Membre Simple
             </button>
             <button 
                type="button"
                onClick={() => setMemberData(p => ({...p, role: 'board', position: ''}))}
                className={`py-3 rounded-xl font-bold transition-all ${memberData.role === 'board' ? 'bg-red-600 text-white' : 'bg-gray-800/20 text-gray-500'}`}
             >
                Membre du Bureau
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2">Prénom *</label>
              <input type="text" name="first_name" value={memberData.first_name} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Nom *</label>
              <input type="text" name="last_name" value={memberData.last_name} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Email *</label>
              <input type="email" name="email" value={memberData.email} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Position *</label>
              <input 
                type="text" 
                name="position" 
                value={memberData.position} 
                onChange={handleChange} 
                className={inputCls} 
                placeholder={memberData.role === 'board' ? "Ex: Trésorier" : "Membre"}
              />
            </div>

            {/* Password Section (Your original design) */}
            <div className="md:col-span-2">
              <label className="block font-semibold mb-2">Mot de passe temporaire *</label>
              <div className="flex gap-3">
                <input type="text" name="password" value={memberData.password} onChange={handleChange} className={`${inputCls} flex-1 font-mono`} />
                <button type="button" onClick={generatePassword} className={`px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg`}>
                  Générer
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className={`w-full mt-10 py-4 rounded-xl font-bold text-lg text-white transition-all bg-gradient-to-r from-[#0f1d4a] to-[#0a1235] border-2 border-red-500/30 hover:scale-[1.01]`}
          >
            {loading ? "TRAITEMENT..." : "AJOUTER LE MEMBRE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresidentAddMember;