import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';

const ClubMemberList = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const effectiveRole = user?.role === 'user' ? user?.club_role : user?.role;
  const isPresident = effectiveRole === 'president';
  const dm = darkMode;

  useEffect(() => {
    const handleThemeChange = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubRes = await fetch(`${API_BASE_URL}/api/my-club-info`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        let clubData = null;
        if (clubRes.ok) {
          const data = await clubRes.json();
          clubData = data.club || data;
        } else {
          const fallback = await fetch(`${API_BASE_URL}/api/my-club`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
          });
          if (fallback.ok) {
            const data = await fallback.json();
            clubData = data.club || data;
          }
        }

        setClub(clubData);

        if (clubData?.id) {
          const membersRes = await fetch(`${API_BASE_URL}/api/members?club_id=${clubData.id}`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
          });
          if (membersRes.ok) {
            const data = await membersRes.json();
            setMembers(Array.isArray(data) ? data : []);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  const refetchMembers = async () => {
    if (!club?.id) return;
    const membersRes = await fetch(`${API_BASE_URL}/api/members?club_id=${club.id}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (membersRes.ok) {
      const data = await membersRes.json();
      setMembers(Array.isArray(data) ? data : []);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setShowModal(false);
        await refetchMembers();
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMemberRole = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: selectedMember.role,
          position: selectedMember.position || null,
        }),
      });
      if (response.ok) {
        setShowModal(false);
        await refetchMembers();
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      member.first_name?.toLowerCase().includes(q) ||
      member.last_name?.toLowerCase().includes(q) ||
      member.email?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || member.status === filter;
    return matchSearch && matchFilter;
  });

  const getRoleStyle = (role) => {
    if (role === 'president') return 'bg-red-600 text-white';
    if (role === 'board') return dm ? 'bg-orange-900/40 text-orange-300 border border-orange-700/40' : 'bg-orange-50 text-orange-600 border border-orange-200';
    return dm ? 'bg-white/10 text-gray-300 border border-white/10' : 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  const pageBg = dm ? 'bg-[#0a0a0f]' : 'bg-gray-50';
  const cardBg = dm ? 'bg-[#0f0f1a] border-white/5' : 'bg-white border-gray-200 shadow-sm';
  const rowHover = dm ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/80';
  const rowDiv = dm ? 'divide-white/5' : 'divide-gray-100';
  const inputCls = dm
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-red-500'
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-red-400';
  const textMain = dm ? 'text-white' : 'text-gray-900';
  const textSub = dm ? 'text-gray-500' : 'text-gray-500';
  const avatarBg = dm ? 'bg-[#1a2c5b]' : 'bg-red-50';
  const avatarTx = dm ? 'text-red-400' : 'text-red-600';

  return (
    <div className={`min-h-screen py-10 px-4 transition-colors duration-300 ${pageBg}`}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className={`text-3xl font-black tracking-tight mb-1 ${textMain}`}>
            Gestion des <span className="text-red-500">Membres</span>
          </h1>
          {club && <p className={`text-sm font-medium ${textSub}`}>Club <span className="text-red-500 font-bold">{club.name}</span></p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Membres', value: members.length, icon: '👥', gradient: 'from-blue-500 to-indigo-600' },
            { label: 'Membres Actifs', value: members.filter((m) => m.status === 'active').length, icon: '✅', gradient: 'from-emerald-500 to-green-600' },
            { label: 'Équipe Bureau', value: members.filter((m) => m.role !== 'member').length, icon: '🏛️', gradient: 'from-red-500 to-rose-600' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-5 flex items-center gap-4 ${cardBg}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${textSub}`}>{stat.label}</p>
                <p className={`text-3xl font-black leading-none ${textMain}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl border p-5 mb-5 ${cardBg}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Rechercher un membre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${inputCls}`} />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${inputCls}`}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              <p className={`text-sm ${textSub}`}>Chargement...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">🔍</p>
              <p className={`text-sm ${textSub}`}>Aucun membre trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0f1d4a]">
                  {['Membre', 'Contact', 'Statut', 'Position', 'Rôle', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/80 whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${rowDiv}`}>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className={`transition-colors ${rowHover}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${avatarBg} ${avatarTx}`}>
                          {(member.first_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-bold text-sm leading-tight ${textMain}`}>{member.first_name} {member.last_name}</p>
                          <p className="text-xs text-red-400 font-semibold mt-0.5">{member.cne || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${textSub}`}>{member.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        <span className={`text-xs font-semibold ${member.status === 'active' ? 'text-emerald-500' : textSub}`}>
                          {member.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${dm ? 'bg-blue-900/30 text-blue-300 border border-blue-800/40' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {member.position || 'Membre'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${getRoleStyle(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => { setSelectedMember(member); setShowModal(true); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all whitespace-nowrap">
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedMember && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pb-8 sm:items-center bg-black/70 backdrop-blur-sm pt-[140px]" onClick={() => setShowModal(false)}>
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${dm ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-6 py-5 border-b ${dm ? 'border-white/5' : 'border-gray-100'}`}>
              <div>
                <h2 className={`text-base font-black ${textMain}`}>Édition Membre</h2>
                <p className="text-red-500 text-xs font-bold">{selectedMember.first_name} {selectedMember.last_name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg transition-all ${dm ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {isPresident ? (
                <>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${textSub}`}>Rôle au sein du club</label>
                    <select value={selectedMember.role} onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })} className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-red-500 ${inputCls}`}>
                      <option value="member">Membre</option>
                      <option value="board">Bureau</option>
                      <option value="president">Président</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${textSub}`}>Position spécifique</label>
                    <input type="text" value={selectedMember.position || ''} onChange={(e) => setSelectedMember({ ...selectedMember, position: e.target.value })} className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-red-500 ${inputCls}`} />
                  </div>
                </>
              ) : (
                <div className={`rounded-xl border p-4 ${dm ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                  Le bureau peut consulter et retirer les membres, mais seul le président peut modifier les rôles.
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${dm ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
              {isPresident && (
                <button onClick={handleUpdateMemberRole} disabled={actionLoading} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                  {actionLoading ? 'En cours...' : 'Mettre à jour'}
                </button>
              )}
              {selectedMember.role !== 'president' && (
                <button onClick={() => handleRemoveMember(selectedMember.id)} disabled={actionLoading} className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all disabled:opacity-50 ${dm ? 'border-red-900/40 text-red-400 hover:bg-red-600 hover:border-red-600 hover:text-white' : 'border-red-200 text-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white'}`}>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubMemberList;
