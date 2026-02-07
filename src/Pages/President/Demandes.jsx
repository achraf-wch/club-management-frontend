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

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/requests?status=${filter}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
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
      // First, approve the request
      const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          validated_by: user.id,
          status: 'approved',
          validation_comment: 'Approuvé par le président'
        })
      });

      if (response.ok) {
        // Now check the request type and create the actual resource
        const request = requests.find(r => r.id === requestId);
        
        if (request.type === 'event' && request.metadata) {
          // Create the actual event
          const metadata = typeof request.metadata === 'string' 
            ? JSON.parse(request.metadata) 
            : request.metadata;
          
          await fetch(`${API_BASE_URL}/api/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              ...metadata,
              created_by: request.requested_by,
              validated_by: user.id,
              status: 'approved'
            })
          });
        } else if (request.type === 'other' && request.metadata) {
          // This is a member addition request
          const metadata = typeof request.metadata === 'string' 
            ? JSON.parse(request.metadata) 
            : request.metadata;
          
          console.log('Creating member with metadata:', metadata);
          
          // Create person first
          const personResponse = await fetch(`${API_BASE_URL}/api/persons`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              first_name: metadata.first_name,
              last_name: metadata.last_name,
              email: metadata.email,
              phone: metadata.phone || null,
              cne: metadata.cne || null,
              password: metadata.password,
              password_confirmation: metadata.password_confirmation
            })
          });

          const personData = await personResponse.json();
          console.log('Person response:', personData);
          
          if (personResponse.ok && personData.person) {
            const personId = personData.person.id;
            console.log('Created person with ID:', personId);

            // Then create the member using authenticated route
            const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                person_id: personId,
                club_id: parseInt(metadata.club_id),
                role: metadata.role || 'member',
                position: metadata.position || 'Membre',
                status: 'active'
              })
            });
            
            const memberData = await memberResponse.json();
            console.log('Member response:', memberData);
            
            if (!memberResponse.ok) {
              throw new Error(`Failed to create member: ${memberData.message}`);
            }
          } else {
            throw new Error(`Failed to create person: ${personData.message || 'Unknown error'}`);
          }
        }
        
        alert('Demande approuvée avec succès!');
        setShowModal(false);
        fetchRequests();
      } else {
        alert('Erreur lors de l\'approbation de la demande');
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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
        alert('Erreur lors du refus de la demande');
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
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      event: '📅',
      budget: '💰',
      equipment: '🔧',
      other: '📋'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/President/Dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Demandes</h1>
          <p className="text-gray-600 mt-2">Approuvez ou refusez les demandes du bureau</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approuvées
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Refusées
            </button>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Chargement des demandes...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">
              Aucune demande {filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvée' : 'refusée'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => openModal(request)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getTypeIcon(request.type)}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                      {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvée' : 'Refusée'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {request.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {request.description}
                  </p>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="font-semibold mr-2">Club:</span>
                      {request.club_name}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-semibold mr-2">Demandé par:</span>
                      {request.requester_first_name} {request.requester_last_name}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-semibold mr-2">Date:</span>
                      {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Détails de la demande</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-gray-700">Titre:</span>
                    <p className="text-gray-900">{selectedRequest.title}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Description:</span>
                    <p className="text-gray-900">{selectedRequest.description}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Club:</span>
                    <p className="text-gray-900">{selectedRequest.club_name}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Demandé par:</span>
                    <p className="text-gray-900">
                      {selectedRequest.requester_first_name} {selectedRequest.requester_last_name}
                      <span className="text-gray-500 ml-2">({selectedRequest.requester_email})</span>
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Type:</span>
                    <p className="text-gray-900">
                      {selectedRequest.type === 'event' ? '📅 Événement' : selectedRequest.type === 'other' ? '📋 Autre' : selectedRequest.type}
                    </p>
                  </div>

                  {selectedRequest.metadata && (
                    <div>
                      <span className="font-semibold text-gray-700">Détails supplémentaires:</span>
                      <pre className="bg-gray-50 p-4 rounded-lg mt-2 text-sm overflow-x-auto max-h-64 overflow-y-auto">
                        {JSON.stringify(
                          typeof selectedRequest.metadata === 'string' 
                            ? JSON.parse(selectedRequest.metadata) 
                            : selectedRequest.metadata, 
                          null, 
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Traitement...' : '✓ Approuver'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Traitement...' : '✗ Refuser'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresidentDemandes;