import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../Context/AuthContext';

const ScanTicket = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [scanner, setScanner] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (scanning && scanMode === 'camera' && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { qrbox: { width: 300, height: 300 }, fps: 10 },
        false
      );
      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error('Clear error:', err));
      }
    };
  }, [scanning, scanMode]);

  const onScanSuccess = async (decodedText) => {
    console.log('✅ Scanned:', decodedText);
    if (scanner) {
      await scanner.clear();
      setScanner(null);
    }
    setScanning(false);
    setScanMode(null);
    await validateTicket(decodedText);
  };

  const onScanError = () => {};

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-file");
      const decodedText = await html5QrCode.scanFile(file, true);
      console.log('✅ File scanned:', decodedText);
      await validateTicket(decodedText);
    } catch (err) {
      setError('Impossible de scanner ce fichier. Assurez-vous que l\'image contient un QR code valide.');
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async (qrData) => {
    setLoading(true);
    setError('');
    setTicketInfo(null);

    try {
      // ✅ CORRECTED ENDPOINT - matches your Laravel route
      const response = await fetch(`${API_BASE_URL}/api/tickets/scan-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          qr_data: qrData,
          scanned_by: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTicketInfo(data.ticket);
      } else {
        // Handle different error scenarios
        if (response.status === 409) {
          setError(data.message || 'Ce ticket a déjà été scanné');
        } else if (response.status === 400) {
          setError(data.message || 'Ticket invalide ou expiré');
        } else if (response.status === 404) {
          setError('Ticket non trouvé');
        } else {
          setError(data.message || 'Erreur lors de la validation');
        }
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const startCameraScanning = () => {
    setScanning(true);
    setScanMode('camera');
    setError('');
    setTicketInfo(null);
  };

  const resetScanner = async () => {
    if (scanner) {
      await scanner.clear();
      setScanner(null);
    }
    setScanning(false);
    setScanMode(null);
    setError('');
    setTicketInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎫 Scanner de Tickets</h1>
          <p className="text-gray-600">Scannez les QR codes pour valider les entrées</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {!scanning && !ticketInfo && !loading && !error && (
            <div className="text-center">
              <div className="text-8xl mb-6">📷</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Prêt à scanner</h2>
              <p className="text-gray-600 mb-8 text-lg">Choisissez votre méthode</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button
                  onClick={startCameraScanning}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl font-semibold text-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105"
                >
                  <div className="text-5xl mb-4">📷</div>
                  <div>Scanner avec caméra</div>
                </button>

                <label className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-xl font-semibold text-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg transform hover:scale-105 cursor-pointer">
                  <div className="text-5xl mb-4">📁</div>
                  <div>Scanner un fichier</div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          )}

          {scanning && scanMode === 'camera' && (
            <div>
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">📸 Scanner actif</h3>
                <p className="text-gray-600 text-lg">Placez le QR code devant la caméra</p>
              </div>
              <div id="qr-reader" className="rounded-xl overflow-hidden shadow-inner"></div>
              <div className="mt-6 text-center">
                <button onClick={resetScanner} className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
                  ❌ Annuler
                </button>
              </div>
            </div>
          )}

          <div id="qr-reader-file" className="hidden"></div>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-6"></div>
              <p className="text-gray-600 text-xl font-semibold">Validation en cours...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-5xl mr-4">❌</div>
                <div>
                  <h3 className="font-bold text-2xl text-red-800 mb-1">Ticket Invalide</h3>
                  <p className="text-red-700 text-lg">{error}</p>
                </div>
              </div>
              <button onClick={resetScanner} className="mt-4 bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-semibold text-lg">
                Scanner un autre ticket
              </button>
            </div>
          </div>
        )}

        {ticketInfo && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
              <div className="text-8xl mb-4">✅</div>
              <h2 className="text-4xl font-bold mb-3">Ticket Validé!</h2>
              <p className="text-xl">Entrée autorisée</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-blue-700 mb-4 uppercase">🎉 Événement</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{ticketInfo.event_title}</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">📅</span>
                      <span className="text-sm font-medium">
                        {new Date(ticketInfo.event_date).toLocaleDateString('fr-FR', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-purple-700 mb-4 uppercase">👤 Participant</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{ticketInfo.first_name} {ticketInfo.last_name}</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">✉️</span>
                      <span className="text-sm font-medium">{ticketInfo.email}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">🎫</span>
                      <span className="text-sm font-mono bg-white px-2 py-1 rounded">{ticketInfo.qr_code}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-8">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">⏰</span>
                  <div>
                    <p className="font-bold text-green-800 text-lg">Scanné avec succès</p>
                    <p className="text-sm text-green-700">{new Date(ticketInfo.scanned_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button onClick={resetScanner} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105">
                  🎫 Scanner le prochain ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanTicket;