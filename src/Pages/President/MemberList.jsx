import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentMembersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const dm = darkMode;

  useEffect(() => {
    const handleThemeChange = () => setDarkMode(document.documentElement.classList.contains("dark"));
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMyClub();
    fetchMembers();
  }, []);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setClub(data);
      }
    } catch (error) { console.error('Error fetching club:', error); }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/members`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setShowModal(false);
        fetchMembers();
      }
    } catch (error) { alert('Erreur de connexion'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateMemberRole = async (memberId, newRole, newPosition) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole, position: newPosition || null })
      });
      if (response.ok) {
        setShowModal(false);
        fetchMembers();
      }
    } catch (error) { alert('Erreur de connexion'); }
    finally { setActionLoading(false); }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || member.status === filter;
    return matchesSearch && matchesFilter;
  });

  const openModal = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  return (
    <div className={`min-h-screen py-12 px-4 transition-colors duration-300 relative overflow-hidden ${dm ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      
      {/* Background Blobs */}
      <div className={`fixed top-20 left-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${dm ? 'bg-red-900' : 'bg-red-200'}`}></div>
      <div className={`fixed bottom-20 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${dm ? 'bg-blue-900' : 'bg-blue-200'}`}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-10 animate-fadeInDown">
          <h1 className={`text-4xl font-black mb-2 tracking-tight ${dm ? 'text-white' : 'text-gray-900'}`}>
            Gestion des <span className="text-red-600">Membres</span>
          </h1>
          {club && (
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-red-600 rounded-full"></div>
               <p className={`text-lg font-medium ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
                Club <span className="text-red-500">{club.name}</span>
               </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Membres', value: members.length, color: 'from-blue-500 to-indigo-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7' },
            { label: 'Membres Actifs', value: members.filter(m => m.status === 'active').length, color: 'from-green-500 to-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0' },
            { label: 'Équipe Bureau', value: members.filter(m => m.role !== 'member').length, color: 'from-red-500 to-red-600', icon: 'M5 3v4M3 5h4M6 17v4' }
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-3xl border-2 transition-all duration-300 animate-fadeInUp ${dm ? 'bg-gradient-to-br from-[#0f1d4a] to-[#0a1235] border-red-500/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-4xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg transform rotate-3`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-3xl border-2 mb-10 animate-slideInLeft ${dm ? 'bg-black/40 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input type="text" placeholder="Rechercher un membre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none focus:border-red-500 transition-all ${dm ? 'bg-[#0a1235] border-white/5 text-white' : 'bg-gray-50 border-gray-100'}`} />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className={`w-full px-6 py-4 rounded-2xl border-2 focus:outline-none focus:border-red-500 transition-all ${dm ? 'bg-[#0a1235] border-white/5 text-white' : 'bg-gray-50 border-gray-100'}`}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className={`rounded-3xl border-2 overflow-hidden animate-fadeInUp ${dm ? 'bg-[#0f1d4a]/30 border-red-500/20' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b-2 ${dm ? 'bg-gradient-to-r from-red-600 to-red-800 border-red-500/20' : 'bg-[#0f1d4a] border-gray-100'}`}>
                  {['Membre', 'Contact', 'Position', 'Rôle', 'Actions'].map((h) => (
                    <th key={h} className="px-8 py-5 text-xs font-black uppercase tracking-widest text-white">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className={`transition-colors ${dm ? 'hover:bg-red-500/5' : 'hover:bg-gray-50'}`}>
                    <td className="px-8 py-6">
                      <div className="font-bold text-lg text-white">{member.first_name} {member.last_name}</div>
                      <div className="text-xs text-red-500 font-black uppercase tracking-tighter">ID: {member.cne || '---'}</div>
                    </td>
                    <td className="px-8 py-6 text-gray-400 font-medium">{member.email}</td>
                    <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${dm ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>{member.position || 'Membre'}</span></td>
                    <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${member.role === 'president' ? 'bg-red-600 text-white' : dm ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}>
                            {member.role}
                        </span>
                    </td>
                    <td className="px-8 py-6">
                      <button onClick={() => openModal(member)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Gérer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - Matching AddMember Form Style */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className={`w-full max-w-lg rounded-3xl border-2 shadow-2xl overflow-hidden animate-scaleIn ${dm ? 'bg-[#0a1235] border-red-500/30' : 'bg-white border-red-500/20'}`} onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className={`text-2xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>Édition Membre</h2>
                    <p className="text-red-500 text-sm font-bold uppercase tracking-widest">{selectedMember.first_name} {selectedMember.last_name}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Rôle au sein du club</label>
                  <select value={selectedMember.role} onChange={e => setSelectedMember({...selectedMember, role: e.target.value})}
                    className={`w-full p-4 rounded-2xl border-2 transition-all focus:outline-none focus:border-red-500 ${dm ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-100'}`}>
                    <option value="member">Membre</option>
                    <option value="board">Bureau</option>
                    <option value="president">Président</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Position spécifique</label>
                  <input type="text" value={selectedMember.position || ''} onChange={e => setSelectedMember({...selectedMember, position: e.target.value})}
                    className={`w-full p-4 rounded-2xl border-2 transition-all focus:outline-none focus:border-red-500 ${dm ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-100'}`} placeholder="Ex: Secrétaire Général" />
                </div>

                <div className="flex gap-4 pt-6">
                   <button onClick={() => handleUpdateMemberRole(selectedMember.id, selectedMember.role, selectedMember.position)} disabled={actionLoading}
                    className="flex-[2] bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/40">
                    Mettre à jour
                   </button>
                   {selectedMember.role !== 'president' && (
                     <button onClick={() => handleRemoveMember(selectedMember.id)}
                        className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest border-2 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all`}>
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.7s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default PresidentMembersList;