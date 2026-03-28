import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

// Composant Interne pour éviter la répétition du design des inputs
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required, dm, helpText, mono = false }) => (
  <div className="mb-4">
    <label className={`block font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none
        ${mono ? 'font-mono' : ''}
        ${dm 
          ? 'bg-[#0d0d18] border-red-900/40 text-gray-100 focus:ring-2 focus:ring-red-500/40 focus:border-red-700/60' 
          : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400'}`}
    />
    {helpText && <p className={`text-xs mt-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{helpText}</p>}
  </div>
);

const BureauxAddMember = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' }); // 'success' ou 'error'
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));

  const [memberData, setMemberData] = useState({
    club_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cne: '',
    password: '',
    password_confirmation: '',
    position: 'Membre',
    role: 'member'
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // --- Effets ---
  useEffect(() => {
    const handleThemeChange = () => setDarkMode(document.documentElement.classList.contains("dark"));
    window.addEventListener("themeChanged", handleThemeChange);
    if (user) fetchUserClubs();
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, [user]);

  const fetchUserClubs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members?person_id=${user.id}&role=board&status=active`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.length > 0) {
        setUserClubs(data);
        setMemberData(prev => ({ ...prev, club_id: data[0].club_id }));
      } else {
        setStatus({ type: 'error', message: 'Accès restreint aux membres du bureau.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur de connexion.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const pwd = Math.random().toString(36).slice(-10) + "!";
    setMemberData(prev => ({ ...prev, password: pwd, password_confirmation: pwd }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // Validation basique
    if (memberData.password !== memberData.password_confirmation) {
      setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        club_id: parseInt(memberData.club_id),
        requested_by: user.id,
        type: 'other',
        title: `Ajout: ${memberData.first_name} ${memberData.last_name}`,
        description: `Nouveau ${memberData.role === 'board' ? 'Bureau' : 'Membre'}`,
        metadata: { ...memberData, email: memberData.email.toLowerCase().trim() }
      };

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatus({ type: 'success', message: `Demande envoyée ! Mot de passe : ${memberData.password}` });
        // Reset optionnel ici
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.message || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erreur réseau.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-20 text-center">Chargement...</div>;

  return (
    <div className={`min-h-screen py-10 transition-colors ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4">
        
        {/* En-tête Dynamique */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold italic">
            AJOUTER UN <span className="text-red-600">MEMBRE</span>
          </h1>
          <p className="opacity-60 text-sm uppercase tracking-widest mt-2">
            Club: {userClubs[0]?.club_name || "Chargement..."}
          </p>
        </header>

        {/* Alertes */}
        {status.message && (
          <div className={`mb-8 p-4 rounded-lg border-l-4 animate-bounce-in ${
            status.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border ${darkMode ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200 shadow-xl'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            
            <section className="md:col-span-2 mb-6">
               <h3 className="text-red-500 font-bold uppercase text-sm tracking-wider mb-4">1. Identité</h3>
            </section>

            <InputField label="Prénom" name="first_name" required value={memberData.first_name} onChange={handleChange} dm={darkMode} />
            <InputField label="Nom" name="last_name" required value={memberData.last_name} onChange={handleChange} dm={darkMode} />
            <InputField label="Email" name="email" type="email" required value={memberData.email} onChange={handleChange} dm={darkMode} />
            <InputField label="Téléphone" name="phone" placeholder="+212..." value={memberData.phone} onChange={handleChange} dm={darkMode} />

            <section className="md:col-span-2 mt-6 mb-6">
               <h3 className="text-red-500 font-bold uppercase text-sm tracking-wider mb-4">2. Rôle & Sécurité</h3>
            </section>

            <div>
              <label className="block font-semibold mb-2">Type d'adhésion</label>
              <select 
                name="role" 
                value={memberData.role} 
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg mb-4 ${darkMode ? 'bg-[#0d0d18] border-red-900/40' : 'bg-white border-gray-200'}`}
              >
                <option value="member">Membre Simple</option>
                <option value="board">Bureau (Décisionnel)</option>
              </select>
            </div>

            <InputField 
              label="Position exacte" 
              name="position" 
              value={memberData.position} 
              onChange={handleChange} 
              dm={darkMode} 
              placeholder="Ex: Designer, Trésorier..."
            />

            <div className="md:col-span-2">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <InputField 
                            label="Mot de passe temporaire" 
                            name="password" 
                            value={memberData.password} 
                            onChange={handleChange} 
                            dm={darkMode} 
                            mono 
                            helpText="Le membre devra le modifier."
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={generatePassword}
                        className="mb-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                        ⚡ Générer
                    </button>
                </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-10 py-4 rounded-xl font-black text-xl transition-all 
              ${loading ? 'opacity-50' : 'hover:scale-[1.01] active:scale-95'}
              ${darkMode ? 'bg-red-600 text-white' : 'bg-[#0f1d4a] text-white shadow-2xl'}`}
          >
            {loading ? 'ENVOI EN COURS...' : 'VALIDER LA DEMANDE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BureauxAddMember;