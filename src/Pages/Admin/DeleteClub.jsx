import React, { useState } from 'react';

const DeleteClub = () => {
  const [clubs] = useState([
    { id: 1, name: 'Cultisio Club', members: 45 },
    { id: 2, name: 'Rotaract EST Fès', members: 38 },
    { id: 3, name: 'NEXUS Club', members: 52 }
  ]);

  const handleDelete = (clubId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) {
      console.log('Club supprimé:', clubId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gérer les Clubs</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nom du Club</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Membres</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{club.name}</td>
                  <td className="px-6 py-4">{club.members}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(club.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeleteClub;