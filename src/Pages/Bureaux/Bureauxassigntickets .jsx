import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../Context/AuthContext';

const BureauxAssignTickets = () => {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [existingTickets, setExistingTickets] = useState([]);
  const [loading, setLoading] = useState({ action: false, members: false });
  const [status, setStatus] = useState({ success: '', error: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const dm = darkMode;

  // --- Sync DarkMode ---
  useEffect(() => {
    const handle = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handle);
    return () => window.removeEventListener('themeChanged', handle);
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/my-club-info`, { credentials: 'include' });
        if (res.ok) {
          const clubData = await res.json();
          setClub(clubData);
          fetchEvents(clubData.id);
          fetchMembers(clubData.id);
        }
      } catch (err) { console.error("Erreur d'initialisation", err); }
    };
    init();
  }, []);

  const fetchEvents = async (clubId) => {
    const res = await fetch(`${API_BASE_URL}/api/events/club/${clubId}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      // Filtrer les événements approuvés et qui nécessitent une attribution manuelle
      setEvents(data.filter(e => e.status === 'approved' && !e.tickets_for_all));
    }
  };

  const fetchMembers = async (clubId) => {
    setLoading(prev => ({ ...prev, members: true }));
    const res = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/members`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setMembers(data.filter(m => m.status === 'active').map(m => ({ ...m, person_id: parseInt(m.person_id) })));
    }
    setLoading(prev => ({ ...prev, members: false }));
  };

  useEffect(() => {
    if (selectedEvent) {
      fetch(`${API_BASE_URL}/api/tickets?event_id=${selectedEvent.id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setExistingTickets(data.map(t => parseInt(t.person_id))))
        .catch(() => setExistingTickets([]));
    }
  }, [selectedEvent]);

  // --- Logic ---
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const toggleMember = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllEligible = () => {
    const eligibleIds = filteredMembers
      .filter(m => !existingTickets.includes(m.person_id))
      .map(m => m.person_id);
    
    const isAllSelected = eligibleIds.every(id => selectedMembers.includes(id));
    setSelectedMembers(isAllSelected ? [] : [...new Set([...selectedMembers, ...eligibleIds])]);
  };

  const handleAssign = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    setStatus({ success: '', error: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEvent.id}/assign-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ person_ids: selectedMembers }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ success: `✓ ${data.assigned_count} billet(s) envoyé(s) !`, error: '' });
        setSelectedMembers([]);
        // Rafraîchir la liste des billets existants
        const updatedRes = await fetch(`${API_BASE_URL}/api/tickets?event_id=${selectedEvent.id}`, { credentials: 'include' });
        const updatedData = await updatedRes.json();
        setExistingTickets(updatedData.map(t => parseInt(t.person_id)));
      } else {
        setStatus({ success: '', error: data.message || "Erreur d'attribution" });
      }
    } catch {
      setStatus({ success: '', error: "Erreur de connexion au serveur" });
    }
    setLoading(prev => ({ ...prev, action: false }));
  };

  // --- Styles ---
  const glassPanel = `${dm ? 'bg-[#0d0d18]/80 border-red-900/20' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'} border rounded-3xl p-6`;

  return (
    <div className={`min-h-screen py-10 transition-all ${dm ? 'bg-[#050508] text-gray-200' : 'bg-[#f8fafc] text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-red-500 font-bold tracking-widest text-sm uppercase">Dashboard Bureau</span>
            <h1 className="text-4xl font-black mt-1">ASSIGNATION <span className="text-red-600">TICKETS</span></h1>
            {club && <p className="opacity-60 text-lg">Club : {club.name}</p>}
          </div>

          {(status.success || status.error) && (
            <div className={`px-6 py-3 rounded-2xl font-bold animate-fade-in border-2 ${
              status.success ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
            }`}>
              {status.success || status.error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Section Gauche : Sélection Événement */}
          <div className="lg:col-span-4 space-y-6">
            <div className={glassPanel}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="p-2 bg-red-500/10 rounded-lg text-red-500">01</span> Événements
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {events.map(e => (
                  <button
                    key={e.id}
                    onClick={() => { setSelectedEvent(e); setSelectedMembers([]); }}
                    className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${
                      selectedEvent?.id === e.id 
                      ? 'border-red-600 bg-red-600/5 shadow-lg shadow-red-600/10' 
                      : dm ? 'border-transparent bg-white/5 hover:bg-white/10' : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-bold truncate">{e.title}</p>
                    <p className="text-xs opacity-50 mt-1 uppercase tracking-tighter">
                      {new Date(e.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {e.location}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedEvent && (
              <div className={`${glassPanel} bg-gradient-to-br from-red-600 to-red-800 text-white border-none`}>
                <h4 className="font-bold text-sm uppercase opacity-80">Résumé Sélection</h4>
                <div className="text-3xl font-black mt-2">{selectedMembers.length} Billets</div>
                <p className="text-xs opacity-70 mt-1">À envoyer pour "{selectedEvent.title}"</p>
                <button
                  onClick={handleAssign}
                  disabled={loading.action || selectedMembers.length === 0}
                  className="w-full mt-6 py-4 bg-white text-red-700 rounded-xl font-black uppercase tracking-wider hover:bg-gray-100 disabled:opacity-50 transition-all shadow-xl"
                >
                  {loading.action ? 'Traitement...' : 'Confirmer l\'envoi'}
                </button>
              </div>
            )}
          </div>

          {/* Section Droite : Liste Membres */}
          <div className="lg:col-span-8">
            <div className={glassPanel}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="p-2 bg-red-500/10 rounded-lg text-red-500">02</span> Membres Éligibles
                </h3>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Chercher un nom..."
                    className={`px-4 py-2 rounded-xl border-2 focus:outline-none focus:border-red-500 transition-all ${dm ? 'bg-black/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    onClick={selectAllEligible}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${dm ? 'border-red-900/40 text-red-400' : 'border-red-200 text-red-600 bg-red-50'}`}
                  >
                    Tout cocher
                  </button>
                </div>
              </div>

              {!selectedEvent ? (
                <div className="py-20 text-center opacity-40 italic">
                  Veuillez d'abord sélectionner un événement à gauche
                </div>
              ) : loading.members ? (
                <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMembers.map(m => {
                    const hasTicket = existingTickets.includes(m.person_id);
                    const isSelected = selectedMembers.includes(m.person_id);
                    return (
                      <div
                        key={m.person_id}
                        onClick={() => !hasTicket && toggleMember(m.person_id)}
                        className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          hasTicket ? 'opacity-40 grayscale pointer-events-none' : 
                          isSelected ? 'border-red-500 bg-red-500/5' : dm ? 'border-white/5 bg-white/5 hover:border-red-900/40' : 'border-gray-100 bg-gray-50 hover:border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {m.first_name[0]}{m.last_name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate">{m.first_name} {m.last_name}</p>
                            <p className="text-xs opacity-50 truncate">{m.email}</p>
                          </div>
                          {hasTicket && <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded-full font-bold uppercase">Déjà envoyé</span>}
                        </div>
                        {isSelected && !hasTicket && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BureauxAssignTickets;