import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const PresidentDemandes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [myClub, setMyClub] = useState(null);

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
  }, []);

  useEffect(() => {
    if (myClub) {
      fetchRequests();
    }
  }, [filter, myClub]);

  const fetchMyClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-club`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setMyClub(data.club || data);
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    }
  };

  const fetchRequests = async () => {
    if (!myClub?.id) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/requests?status=${filter}&club_id=${myClub.id}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      // 1. Validate the request
      const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          validated_by: user.id,
          status: 'approved',
          validation_comment: 'Approuvé par le président'
        })
      });

      if (response.ok) {
        const request = requests.find(r => r.id === requestId);

        // 2. Handle EVENT type requests
        if (request.type === 'event' && request.metadata) {
          const metadata = typeof request.metadata === 'string'
            ? JSON.parse(request.metadata)
            : request.metadata;
          await fetch(`${API_BASE_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              ...metadata,
              created_by: request.requested_by,
              validated_by: user.id,
              status: 'approved'
            })
          });
        } 
        // 3. Handle MEMBER/OTHER type requests
        else if (request.type === 'other' && request.metadata) {
          const metadata = typeof request.metadata === 'string'
            ? JSON.parse(request.metadata)
            : request.metadata;
          
          console.log("📦 Creating member with:", {
            club_id: metadata.club_id,
            first_name: metadata.first_name,
            last_name: metadata.last_name,
            email: metadata.email,
            role: metadata.role || 'member'
          });

          // Use the president-specific endpoint
          const personResponse = await fetch(`${API_BASE_URL}/api/persons/new-member`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              first_name: metadata.first_name,
              last_name: metadata.last_name,
              email: metadata.email,
              phone: metadata.phone || null,
              cne: metadata.cne || null,
              password: metadata.password,
              password_confirmation: metadata.password_confirmation,
              club_id: parseInt(metadata.club_id),
              role: metadata.role || 'member',
              position: metadata.position || 'Membre'
            })
          });

          const personData = await personResponse.json();
          
          if (!personResponse.ok) {
            throw new Error(`Failed to create member: ${personData.message || 'Unknown error'}`);
          }

          console.log("✅ Member created successfully:", personData);
        }

        alert('Demande approuvée avec succès!');
        setShowModal(false);
        fetchRequests();
      } else {
        const errorData = await response.json();
        alert(`Erreur ${response.status}: ${errorData.message || 'Erreur lors de l\'approbation'}`);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Erreur lors de l\'approbation: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          validated_by: user.id,
          status: 'rejected',
          validation_comment: 'Refusé par le président'
        })
      });
      if (response.ok) {
        alert('Demande refusée');
        setShowModal(false);
        fetchRequests();
      } else {
        const errorData = await response.json();
        alert(`Erreur ${response.status}: ${errorData.message || 'Erreur lors du refus'}`);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Erreur lors du refus: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    if (dm) {
      const styles = {
        pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
        approved: 'bg-green-900/30 text-green-400 border-green-700/40',
        rejected: 'bg-red-900/30 text-red-400 border-red-700/40'
      };
      return styles[status] || 'bg-gray-900/30 text-gray-400 border-gray-700/40';
    }
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-600 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-600 border-red-500/30'
    };
    return styles[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getTypeIcon = (type) => {
    const icons = { event: '📅', budget: '💰', equipment: '🔧', other: '📋' };
    return icons[type] || '📄';
  };

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f] text-white' : 'bg-white text-[#1a2c5b]'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-40 h-40 rounded-full blur-2xl animate-float ${dm ? 'bg-red-900/20' : 'bg-red-500/10'}`}></div>
        <div className={`absolute bottom-32 right-20 w-48 h-48 rounded-full blur-2xl animate-float-delayed ${dm ? 'bg-red-900/15' : 'bg-red-500/10'}`}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="mb-8 animate-fadeInDown">
          <div className="flex items-center gap-3 mb-2">
            <svg className={`w-10 h-10 animate-float ${dm ? 'text-red-500' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'bg-gradient-to-r from-red-400 via-rose-400 to-red-500 bg-clip-text text-transparent'}`}>
              Gestion des <span className={dm ? 'text-white' : ''}>Demandes</span>
            </h1>
          </div>
          <p className={`font-medium mt-1 ml-1 ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
            Approuvez ou refusez les demandes du bureau
          </p>
          {myClub && (
            <p className={`text-sm mt-2 ml-1 ${dm ? 'text-gray-500' : 'text-gray-500'}`}>
              Club: <span className="font-semibold text-red-500">{myClub.name}</span>
            </p>
          )}
        </div>

        <div className={`rounded-2xl shadow-md p-4 mb-6 border animate-slideInUp ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`}>
          <div className="flex gap-4">
            <button onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                filter === 'pending'
                  ? dm ? 'bg-gradient-to-r from-yellow-900/60 to-orange-900/60 text-yellow-300 border border-yellow-700/40 shadow-lg'
                       : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-200'
                  : dm ? 'bg-black/40 text-gray-500 hover:bg-red-950/20 border border-red-900/20'
                       : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
              }`}>En attente</button>
            <button onClick={() => setFilter('approved')}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                filter === 'approved'
                  ? dm ? 'bg-gradient-to-r from-green-900/60 to-emerald-900/60 text-green-300 border border-green-700/40 shadow-lg'
                       : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
                  : dm ? 'bg-black/40 text-gray-500 hover:bg-red-950/20 border border-red-900/20'
                       : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
              }`}>Approuvées</button>
            <button onClick={() => setFilter('rejected')}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                filter === 'rejected'
                  ? dm ? 'bg-gradient-to-r from-red-900/60 to-rose-900/60 text-red-300 border border-red-700/40 shadow-lg'
                       : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200'
                  : dm ? 'bg-black/40 text-gray-500 hover:bg-red-950/20 border border-red-900/20'
                       : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
              }`}>Refusées</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 animate-fadeIn">
            <div className={`inline-block animate-spin rounded-full h-16 w-16 border-4 mb-4 ${dm ? 'border-red-900/30 border-t-red-500' : 'border-red-400/30 border-t-red-400'}`}></div>
            <p className={`text-lg ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Chargement des demandes...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className={`rounded-2xl shadow-md p-16 text-center border animate-scaleIn ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`}>
            <div className="text-6xl mb-4">📭</div>
            <p className={`text-lg ${dm ? 'text-gray-500' : 'text-gray-500'}`}>
              Aucune demande {filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvée' : 'refusée'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request, index) => (
              <div key={request.id}
                className={`rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border hover:scale-[1.02] animate-fadeIn
                  ${dm ? 'bg-[#0d0d18] border-red-900/20 hover:border-red-700/50' : 'bg-white border-gray-200 hover:border-red-300'}`}
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => openModal(request)}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getTypeIcon(request.type)}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.status)}`}>
                      {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvée' : 'Refusée'}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${dm ? 'text-gray-100' : 'text-gray-800'}`}>{request.title}</h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${dm ? 'text-gray-500' : 'text-gray-500'}`}>{request.description}</p>
                  <div className={`border-t pt-4 space-y-2 text-sm ${dm ? 'border-red-900/20' : 'border-gray-100'}`}>
                    <div className={`flex items-center ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-semibold text-red-400 mr-2">Club:</span>{request.club_name}
                    </div>
                    <div className={`flex items-center ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-semibold text-red-400 mr-2">Demandé par:</span>{request.requester_first_name} {request.requester_last_name}
                    </div>
                    <div className={`flex items-center ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-semibold text-red-400 mr-2">Date:</span>{new Date(request.requested_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className={`rounded-3xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn
              ${dm ? 'bg-[#0d0d18] border-red-900/30' : 'bg-white border-gray-200'}`}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${dm ? 'text-red-400' : 'bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent'}`}>
                    Détails de la demande
                  </h2>
                  <button onClick={() => setShowModal(false)}
                    className={`transition-all duration-300 hover:rotate-90 transform ${dm ? 'text-gray-600 hover:text-red-400' : 'text-gray-400 hover:text-red-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className={`rounded-xl p-4 border ${dm ? 'bg-black/50 border-red-900/30' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="font-semibold text-red-400 text-sm uppercase tracking-wider">Titre</span>
                    <p className={`mt-1 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>{selectedRequest.title}</p>
                  </div>
                  <div className={`rounded-xl p-4 border ${dm ? 'bg-black/50 border-red-900/30' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="font-semibold text-red-400 text-sm uppercase tracking-wider">Description</span>
                    <p className={`mt-1 ${dm ? 'text-gray-400' : 'text-gray-600'}`}>{selectedRequest.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-xl p-4 border ${dm ? 'bg-black/50 border-red-900/30' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="font-semibold text-red-400 text-sm uppercase tracking-wider">Club</span>
                      <p className={`mt-1 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>{selectedRequest.club_name}</p>
                    </div>
                    <div className={`rounded-xl p-4 border ${dm ? 'bg-black/50 border-red-900/30' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="font-semibold text-red-400 text-sm uppercase tracking-wider">Type</span>
                      <p className={`mt-1 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>
                        {selectedRequest.type === 'event' ? '📅 Événement' : selectedRequest.type === 'other' ? '📋 Autre' : selectedRequest.type}
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-xl p-4 border ${dm ? 'bg-black/50 border-red-900/30' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="font-semibold text-red-400 text-sm uppercase tracking-wider">Demandé par</span>
                    <p className={`mt-1 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>
                      {selectedRequest.requester_first_name} {selectedRequest.requester_last_name}
                      <span className={`ml-2 text-sm ${dm ? 'text-gray-600' : 'text-gray-400'}`}>({selectedRequest.requester_email})</span>
                    </p>
                  </div>
                  {selectedRequest.metadata && (
                    <div className={`rounded-xl p-4 border ${dm ? 'bg-black/50 border-red-900/30' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="font-semibold text-red-400 text-sm uppercase tracking-wider">Détails supplémentaires</span>
                      <pre className={`p-4 rounded-lg mt-2 text-sm overflow-x-auto max-h-64 overflow-y-auto border
                        ${dm ? 'bg-black/60 text-gray-400 border-red-900/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {JSON.stringify(
                          typeof selectedRequest.metadata === 'string' ? JSON.parse(selectedRequest.metadata) : selectedRequest.metadata,
                          null, 2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
                {selectedRequest.status === 'pending' && (
                  <div className="mt-8 flex gap-4">
                    <button onClick={() => handleApprove(selectedRequest.id)} disabled={actionLoading}
                      className={`group relative flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 overflow-hidden
                        ${dm ? 'bg-black border border-green-800/50 text-green-400 hover:bg-green-950/30 hover:border-green-600/60 hover:text-green-300'
                             : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-200'}`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <span className="relative z-10">{actionLoading ? 'Traitement...' : '✓ Approuver'}</span>
                    </button>
                    <button onClick={() => handleReject(selectedRequest.id)} disabled={actionLoading}
                      className={`group relative flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 overflow-hidden
                        ${dm ? 'bg-black border border-red-800/50 text-red-400 hover:bg-red-950/30 hover:border-red-600/60 hover:text-red-300'
                             : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-200'}`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <span className="relative z-10">{actionLoading ? 'Traitement...' : '✗ Refuser'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-20px) translateX(10px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-15px) translateX(-10px); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.7s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default PresidentDemandes;