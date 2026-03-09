import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Navbar from '../Componenets/Navbar';

const PresidentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openGroup, setOpenGroup] = useState(null);
  const dropdownRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchMyClub(); }, []);

  const fetchMyClub = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) setClub(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenGroup(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const profilePhoto =
    user?.profile_photo_url || user?.avatar_url || user?.avatar || user?.picture || null;

  const navGroups = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      single: true,
      path: '/President/Dashboard',
    },
    {
      key: 'membres',
      label: 'Membres',
      items: [
        { label: 'Ajouter un Membre',  path: '/President/addMember' },
        { label: 'Liste des Membres',  path: '/President/MemberList' },
        { label: 'Voir les Demandes',  path: '/President/Demandes' },
      ]
    },
    {
      key: 'evenements',
      label: 'Événements',
      items: [
        { label: 'Créer un Événement',    path: '/President/CreateEvent' },
        { label: 'Gérer les Événements',  path: '/President/ManageEvent' },
        { label: 'Scanner les Tickets',   path: '/President/ScanTicket' },
      ]
    },
    {
      key: 'club',
      label: 'Gestion du Club',
      single: true,
      path: '/President/ClubManagement',
    },
  ];

  const isGroupActive = (group) => {
    if (group.single) return location.pathname === group.path;
    return group.items?.some(i => location.pathname === i.path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">

      {/* ── BAR 1 : Navbar publique ── */}
      <Navbar />

      {/* ── BAR 2 : Barre président ── */}
      <div
        className="fixed left-0 right-0 z-40 bg-[#0f1e3d] border-b border-white/10 shadow-xl"
        style={{ top: '80px' }}
        ref={dropdownRef}
      >
        <div className="flex items-center h-12 px-4">

          {/* ── GAUCHE : profil + Mon Compte ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Profile chip */}
            <div
              className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition"
              onClick={() => navigate('/Login/AccountSetup')}
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden ring-2 ring-red-500 flex-shrink-0 bg-blue-700 flex items-center justify-center">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={user?.first_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span style="color:white;font-weight:700;font-size:11px">${(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-white font-bold text-[11px]">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <p className="text-white text-xs font-semibold">{user?.first_name} {user?.last_name}</p>
                <p className="text-red-400 text-[10px]">Président</p>
              </div>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Mon Compte — texte seulement */}
            <button
              onClick={() => navigate('/Login/AccountSetup')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              Mon Compte
            </button>
          </div>

          {/* ── CENTRE : navigation ── */}
          <div className="flex-1 flex items-center justify-center gap-1 h-full">
            {navGroups.map((group) => {
              const active = isGroupActive(group);
              const open = openGroup === group.key;

              if (group.single) {
                return (
                  <button
                    key={group.key}
                    onClick={() => navigate(group.path)}
                    className={`relative px-5 h-full text-xs font-semibold transition-all duration-150
                      ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {group.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t-full" />
                    )}
                  </button>
                );
              }

              return (
                <div key={group.key} className="relative h-full flex items-center">
                  <button
                    onClick={() => setOpenGroup(open ? null : group.key)}
                    className={`relative flex items-center gap-1.5 px-5 h-full text-xs font-semibold transition-all duration-150
                      ${active || open ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {group.label}
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${active || open ? 'text-red-400' : 'text-gray-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {(active || open) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t-full" />
                    )}
                  </button>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#0f1e3d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                      {group.items.map((item) => {
                        const itemActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.path}
                            onClick={() => { navigate(item.path); setOpenGroup(null); }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-all
                              ${itemActive
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            {item.label}
                            {itemActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── DROITE : icône déconnexion seulement ── */}
          <div className="flex-shrink-0">
            <button
              onClick={logout}
              title="Déconnexion"
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 pt-32 min-h-screen bg-[#020617] relative">
        <div className="fixed top-40 right-20 w-72 h-72 bg-blue-700/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 right-40 w-56 h-56 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PresidentLayout;