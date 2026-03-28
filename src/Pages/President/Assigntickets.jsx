import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar'; // Ajustez le chemin selon votre structure

const AssignTickets = () => {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [existingTickets, setExistingTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const dm = darkMode;

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Theme Synchronization
  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  useEffect(() => { fetchMyClub(); }, []);

  useEffect(() => {
    if (club) { 
      fetchEvents(); 
      fetchMembers(); 
    }
  }, [club]);

  useEffect(() => {
    if (selectedEvent) fetchExistingTickets(selectedEvent.id);
  }, [selectedEvent]);

  const fetchMyClub = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/my-club`, { credentials: 'include' });
      if (res.ok) setClub(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/club/${club.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Filtrer pour ne garder que les événements approuvés qui nécessitent une assignation manuelle
        setEvents(data.filter(e => e.status === 'approved' && !e.tickets_for_all));
      }
    } catch (err) { console.error(err); }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/clubs/${club.id}/members`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.filter(m => m.status === 'active'));
      }
    } catch (err) { console.error(err); }
    setLoadingMembers(false);
  };

  const fetchExistingTickets = async (eventId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets?event_id=${eventId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setExistingTickets(data.map(t => String(t.person_id)));
      }
    } catch (err) { console.error(err); }
  };

  const toggleMember = (memberId) => {
    const id = String(memberId);
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const eligibleIds = filteredMembers
      .filter(m => !existingTickets.includes(String(m.person_id)))
      .map(m => String(m.person_id));
    
    const allSelected = eligibleIds.every(id => selectedMembers.includes(id));
    
    if (allSelected) {
      setSelectedMembers(prev => prev.filter(id => !eligibleIds.includes(id)));
    } else {
      setSelectedMembers(prev => [...new Set([...prev, ...eligibleIds])]);
    }
  };

  const handleAssign = async () => {
    if (!selectedEvent || selectedMembers.length === 0) return;
    
    setLoading(true);
    setSuccessMessage(''); 
    setErrorMessage('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEvent.id}/assign-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ person_ids: selectedMembers }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`✓ ${data.assigned_count || selectedMembers.length} billet(s) envoyé(s) !`);
        setSelectedMembers([]);
        fetchExistingTickets(selectedEvent.id);
      } else {
        setErrorMessage(data.message || "Erreur lors de l'envoi");
      }
    } catch {
      setErrorMessage('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const name = `${m.first_name} ${m.last_name}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Styles réutilisables
  const cardStyle = `rounded-3xl border transition-all duration-300 ${
    dm ? 'bg-[#111111] border-white/5 shadow-2xl shadow-black' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
  }`;

  return (
    <div className={`min-h-screen flex ${dm ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <AdminSidebar />

      <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Gestion des <span className="text-red-600">Billets</span>
              </h1>
              <p className={`mt-2 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                Attribuez des accès aux membres pour l'événement <span className="font-bold text-blue-500">{selectedEvent?.title || "..."}</span>
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {(successMessage || errorMessage) && (
            <div className={`p-4 rounded-2xl border-2 animate-bounceSlow flex items-center gap-3 ${
              successMessage 
                ? dm ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                : dm ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${successMessage ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="font-medium">{successMessage || errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Event Selection & Stats */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`${cardStyle} p-6`}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="p-2 bg-red-500/10 rounded-lg text-red-500 text-sm">01</span>
                  Événements
                </h2>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {events.length === 0 ? (
                    <div className="text-center py-10 opacity-40">Aucun événement</div>
                  ) : (
                    events.map(event => (
                      <button
                        key={event.id}
                        onClick={() => { setSelectedEvent(event); setSelectedMembers([]); }}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                          selectedEvent?.id === event.id
                            ? 'border-red-600 bg-red-600/5'
                            : dm ? 'border-white/5 hover:border-white/10' : 'border-gray-100 hover:border-red-200'
                        }`}
                      >
                        <p className="font-bold text-sm truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-2 opacity-50 text-[10px] uppercase tracking-widest">
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="truncate">{event.location}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {selectedEvent && (
                <div className={`${cardStyle} p-6 bg-gradient-to-br from-red-600 to-red-800 text-white border-none`}>
                  <h3 className="font-bold mb-4">Statistiques d'assignation</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-white/70 text-sm">Sélectionnés</span>
                      <span className="text-3xl font-black">{selectedMembers.length}</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-white h-full transition-all duration-500" 
                        style={{ width: `${(selectedMembers.length / (members.length || 1)) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={handleAssign}
                      disabled={loading || selectedMembers.length === 0}
                      className="w-full py-4 bg-white text-red-600 rounded-xl font-black text-sm hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      {loading ? "ENVOI EN COURS..." : "CONFIRMER L'ENVOI"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Member Selection */}
            <div className="lg:col-span-8">
              {selectedEvent ? (
                <div className={`${cardStyle} p-6 h-full flex flex-col`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500 text-sm">02</span>
                      Sélection des Membres
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className={`pl-10 pr-4 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                            dm ? 'bg-black border-white/10' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <button 
                        onClick={selectAll}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          dm ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Tout cocher
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {loadingMembers ? (
                      <div className="col-span-full py-20 text-center animate-pulse">Chargement des membres...</div>
                    ) : filteredMembers.map(member => {
                      const mId = String(member.person_id);
                      const hasTicket = existingTickets.includes(mId);
                      const isSelected = selectedMembers.includes(mId);
                      
                      return (
                        <button
                          key={mId}
                          disabled={hasTicket}
                          onClick={() => toggleMember(mId)}
                          className={`relative group p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                            hasTicket 
                              ? dm ? 'bg-green-500/5 border-green-500/10 opacity-50' : 'bg-green-50 border-green-100 opacity-60'
                              : isSelected
                                ? 'border-red-600 bg-red-600/5 ring-1 ring-red-600'
                                : dm ? 'border-white/5 hover:border-white/10 bg-white/5' : 'border-gray-100 hover:border-red-200 bg-white'
                          }`}
                        >
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-red-600 text-white' : dm ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {member.first_name[0]}{member.last_name[0]}
                          </div>

                          <div className="text-left flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate ${isSelected ? 'text-red-500' : ''}`}>
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-[10px] opacity-40 truncate">{member.email}</p>
                          </div>

                          {/* Checkbox Icon */}
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected || hasTicket 
                              ? 'bg-red-600 border-red-600' 
                              : dm ? 'border-white/10' : 'border-gray-200'
                          }`}>
                            {(isSelected || hasTicket) && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {hasTicket && (
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">
                              DÉJÀ ENVOYÉ
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className={`${cardStyle} h-full flex flex-col items-center justify-center p-20 text-center space-y-4`}>
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-4xl animate-bounce">
                    🎫
                  </div>
                  <h3 className="text-xl font-black italic">EN ATTENTE DE SÉLECTION</h3>
                  <p className="max-w-xs opacity-50 text-sm">
                    Veuillez choisir un événement dans la liste de gauche pour commencer à assigner des billets.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-bounceSlow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(-2%); } 50% { transform: translateY(0); } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${dm ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; 
          border-radius: 10px; 
        }
      `}</style>
    </div>
  );
};

export default AssignTickets;