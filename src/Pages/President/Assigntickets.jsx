import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';

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
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const handle = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handle);
    return () => window.removeEventListener('themeChanged', handle);
  }, []);

  useEffect(() => { fetchMyClub(); }, []);

  useEffect(() => {
    if (club) { fetchEvents(); fetchMembers(); }
  }, [club]);

  useEffect(() => {
    if (selectedEvent) fetchExistingTickets(selectedEvent.id);
  }, [selectedEvent]);

  const fetchMyClub = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/my-club`, { credentials: 'include' });
      if (res.ok) setClub(await res.json());
    } catch {}
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/club/${club.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.filter(e => e.status === 'approved' && !e.tickets_for_all));
      }
    } catch {}
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/clubs/${club.id}/members`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Normalize person_id to integer right at the source
        setMembers(data.filter(m => m.status === 'active').map(m => ({ ...m, person_id: parseInt(m.person_id) })));
      }
    } catch {}
    setLoadingMembers(false);
  };

  const fetchExistingTickets = async (eventId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets?event_id=${eventId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Normalize to integers for reliable === comparison
        setExistingTickets(data.map(t => parseInt(t.person_id)));
      }
    } catch {}
  };

  const toggleMember = (memberId) => {
    const id = parseInt(memberId);
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const eligible = filteredMembers.filter(m => !existingTickets.includes(parseInt(m.person_id)));
    const eligibleIds = eligible.map(m => parseInt(m.person_id));
    const allSelected = eligibleIds.every(id => selectedMembers.includes(id));
    if (allSelected) {
      setSelectedMembers(prev => prev.filter(id => !eligibleIds.includes(id)));
    } else {
      setSelectedMembers(prev => [...new Set([...prev, ...eligibleIds])]);
    }
  };

  const handleAssign = async () => {
    if (!selectedEvent || selectedMembers.length === 0) {
      setErrorMessage('Sélectionnez un événement et au moins un membre.');
      return;
    }
    setLoading(true);
    setSuccessMessage(''); setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEvent.id}/assign-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        // Double-cast to integers to be 100% safe
        body: JSON.stringify({ person_ids: selectedMembers.map(id => parseInt(id)) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`✓ ${data.assigned_count} billet(s) envoyé(s) avec succès!`);
        setSelectedMembers([]);
        fetchExistingTickets(selectedEvent.id);
      } else {
        setErrorMessage(data.message || "Erreur lors de l'envoi");
      }
    } catch {
      setErrorMessage('Erreur de connexion');
    }
    setLoading(false);
  };

  const filteredMembers = members.filter(m => {
    const name = `${m.first_name} ${m.last_name}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const card = `rounded-2xl border shadow-lg ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`;
  const inputCls = `w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${dm ? 'bg-black border-red-900/40 text-gray-100 focus:border-red-600/60 focus:ring-2 focus:ring-red-900/30' : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400'}`;

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto px-4 space-y-6">

        <div>
          <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
            Assigner des <span className={dm ? 'text-cyan-400' : 'text-red-500'}>Billets</span>
          </h1>
          <p className={`mt-1 text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>
            Sélectionnez un événement, choisissez les membres, et envoyez leurs billets.
          </p>
        </div>

        {successMessage && (
          <div className={`px-5 py-4 rounded-xl border-2 flex items-center gap-3 ${dm ? 'bg-green-950/40 border-green-700/40 text-green-300' : 'bg-green-50 border-green-400 text-green-800'}`}>
            <svg className="w-5 h-5 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className={`px-5 py-4 rounded-xl border-2 flex items-center gap-3 ${dm ? 'bg-red-950/40 border-red-800/40 text-red-300' : 'bg-red-50 border-red-400 text-red-800'}`}>
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Event selection */}
          <div className={`${card} p-6`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>
              <span className="text-2xl">📅</span> Choisir l'événement
            </h2>
            {events.length === 0 ? (
              <div className={`text-center py-8 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="text-4xl mb-2">🎭</div>
                <p className="text-sm">Aucun événement approuvé disponible</p>
                <p className="text-xs mt-1 opacity-60">(Seuls les événements sans "Tickets pour tous" apparaissent)</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => { setSelectedEvent(event); setSelectedMembers([]); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedEvent?.id === event.id
                        ? dm ? 'border-red-600/60 bg-red-950/30 text-red-300' : 'border-red-500 bg-red-50 text-red-800'
                        : dm ? 'border-red-900/20 hover:border-red-800/40 text-gray-300' : 'border-gray-200 hover:border-red-300 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">{event.title}</div>
                    <div className={`text-xs mt-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                      📍 {event.location || 'Lieu TBD'} &nbsp;·&nbsp;
                      🗓 {new Date(event.event_date).toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className={`${card} p-6`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>
              <span className="text-2xl">🎟️</span> Récapitulatif
            </h2>
            {!selectedEvent ? (
              <div className={`text-center py-8 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="text-4xl mb-2">👈</div>
                <p className="text-sm">Sélectionnez un événement</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${dm ? 'bg-black/40 border border-red-900/30' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`font-bold ${dm ? 'text-red-300' : 'text-gray-900'}`}>{selectedEvent.title}</div>
                  <div className={`text-sm mt-1 ${dm ? 'text-gray-500' : 'text-gray-500'}`}>
                    {new Date(selectedEvent.event_date).toLocaleString('fr-FR')}
                  </div>
                  <div className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>{selectedEvent.location}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl text-center ${dm ? 'bg-red-950/20 border border-red-900/30' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className={`text-2xl font-bold ${dm ? 'text-red-400' : 'text-blue-600'}`}>{selectedMembers.length}</div>
                    <div className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Sélectionnés</div>
                  </div>
                  <div className={`p-3 rounded-xl text-center ${dm ? 'bg-green-950/20 border border-green-900/30' : 'bg-green-50 border border-green-200'}`}>
                    <div className={`text-2xl font-bold ${dm ? 'text-green-400' : 'text-green-600'}`}>{existingTickets.length}</div>
                    <div className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Déjà billetés</div>
                  </div>
                </div>

                <button
                  onClick={handleAssign}
                  disabled={loading || selectedMembers.length === 0}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]
                    ${dm
                      ? 'bg-red-900/40 border border-red-700/50 text-red-300 hover:bg-red-900/60 hover:text-white'
                      : 'bg-gradient-to-r from-[#0a3d62] to-[#0c5087] text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60'}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Envoi en cours...
                    </span>
                  ) : `🎟️ Envoyer ${selectedMembers.length > 0 ? selectedMembers.length + ' billet(s)' : 'les billets'}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Member selection */}
        {selectedEvent && (
          <div className={`${card} p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>
                <span className="text-2xl">👥</span> Membres du club
                <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${dm ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  {members.length}
                </span>
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`${inputCls} max-w-xs text-sm py-2`}
                />
                <button
                  onClick={selectAll}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all whitespace-nowrap ${dm ? 'border-red-900/40 text-gray-400 hover:border-red-700/50 hover:text-gray-300' : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600'}`}
                >
                  Tout sélectionner
                </button>
              </div>
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-12">
                <div className={`w-10 h-10 border-4 rounded-full animate-spin ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-200 border-t-red-500'}`}></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMembers.map(member => {
                  const pid = parseInt(member.person_id);
                  const hasTicket = existingTickets.includes(pid);
                  const isSelected = selectedMembers.includes(pid);
                  return (
                    <button
                      key={pid}
                      onClick={() => !hasTicket && toggleMember(pid)}
                      disabled={hasTicket}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        hasTicket
                          ? dm ? 'border-green-900/30 bg-green-950/10 opacity-60 cursor-not-allowed' : 'border-green-200 bg-green-50 opacity-70 cursor-not-allowed'
                          : isSelected
                            ? dm ? 'border-red-600/60 bg-red-950/30' : 'border-red-500 bg-red-50'
                            : dm ? 'border-red-900/20 hover:border-red-800/40' : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          hasTicket ? dm ? 'bg-green-900/40 text-green-400' : 'bg-green-200 text-green-700'
                            : isSelected ? dm ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                            : dm ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-semibold text-sm truncate ${dm ? isSelected ? 'text-red-300' : 'text-gray-300' : isSelected ? 'text-red-700' : 'text-gray-800'}`}>
                            {member.first_name} {member.last_name}
                          </div>
                          <div className={`text-xs truncate ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{member.email}</div>
                          <div className={`text-xs mt-0.5 font-medium ${member.role === 'president' ? 'text-yellow-500' : member.role === 'board' ? dm ? 'text-cyan-600' : 'text-blue-500' : dm ? 'text-gray-600' : 'text-gray-400'}`}>
                            {member.role}
                          </div>
                        </div>
                      </div>
                      {hasTicket && (
                        <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${dm ? 'bg-green-900/40 text-green-400' : 'bg-green-200 text-green-700'}`}>
                          ✓ Billet envoyé
                        </div>
                      )}
                      {isSelected && !hasTicket && (
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${dm ? 'bg-red-600' : 'bg-red-500'}`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTickets;