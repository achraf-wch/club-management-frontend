import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../Context/AuthContext';

const ScanTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;

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
      if (scanner) scanner.clear().catch(err => console.error('Clear error:', err));
    };
  }, [scanning, scanMode]);

  const onScanSuccess = async (decodedText) => {
    if (scanner) { await scanner.clear(); setScanner(null); }
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
      await validateTicket(decodedText);
    } catch (err) {
      setError("Impossible de scanner ce fichier. Assurez-vous que l'image contient un QR code valide.");
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async (qrData) => {
    setLoading(true);
    setError('');
    setTicketInfo(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/scan-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ qr_data: qrData, scanned_by: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setTicketInfo(data.ticket);
      } else {
        if (response.status === 409) setError(data.message || 'Ce ticket a déjà été scanné');
        else if (response.status === 400) setError(data.message || 'Ticket invalide ou expiré');
        else if (response.status === 404) setError('Ticket non trouvé');
        else setError(data.message || 'Erreur lors de la validation');
      }
    } catch (err) {
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
    if (scanner) { await scanner.clear(); setScanner(null); }
    setScanning(false);
    setScanMode(null);
    setError('');
    setTicketInfo(null);
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center animate-fadeInDown">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
              <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
              <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
              <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21h2v-1"/>
            </svg>
            <h1 className={`text-4xl font-bold ${dm ? 'text-red-400' : 'text-gray-900'}`}>
              Scanner de <span className={dm ? 'text-white' : ''}>Tickets</span>
            </h1>
          </div>
          <p className={`font-medium text-lg ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
            Scannez les QR codes pour valider les entrées
          </p>
        </div>

        {/* Main Card */}
        <div className={`rounded-3xl shadow-sm border p-8 mb-6 animate-slideInUp
          ${dm ? 'bg-[#0d0d18] border-red-900/20' : 'bg-white border-gray-200'}`}>

          {/* Initial State */}
          {!scanning && !ticketInfo && !loading && !error && (
            <div className="text-center">
              <svg className={`w-20 h-20 mx-auto mb-4 animate-bounce-slow ${dm ? 'text-gray-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <h2 className={`text-xl font-bold mb-2 ${dm ? 'text-gray-100' : 'text-gray-900'}`}>Prêt à scanner</h2>
              <p className={`mb-6 text-sm ${dm ? 'text-gray-500' : 'text-gray-500'}`}>Choisissez votre méthode</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <button
                  onClick={startCameraScanning}
                  className={`group p-6 rounded-xl font-semibold text-base transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105
                    ${dm ? 'bg-black border border-red-800/50 text-red-400 hover:bg-red-950/30 hover:border-red-600/60' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Scanner avec caméra
                </button>

                <label className={`group p-6 rounded-xl font-semibold text-base transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer
                  ${dm ? 'bg-black border border-blue-800/50 text-blue-400 hover:bg-blue-950/30 hover:border-blue-600/60' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}>
                  <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Scanner un fichier
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Camera Scanning Active */}
          {scanning && scanMode === 'camera' && (
            <div className="animate-scaleIn">
              <div className="mb-6">
                <button onClick={resetScanner} className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-all duration-200 font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
              </div>

              <div className="mb-6 text-center">
                <h3 className={`text-2xl font-bold mb-1 ${dm ? 'text-gray-100' : 'text-gray-900'}`}>Scanner actif</h3>
                <p className="text-red-500 text-lg">Placez le QR code devant la caméra</p>
              </div>

              <div id="qr-reader" className={`rounded-2xl overflow-hidden shadow-sm border mb-6 ${dm ? 'border-red-900/30' : 'border-gray-200'}`}></div>

              <div className="text-center">
                <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:scale-105 cursor-pointer
                  ${dm ? 'bg-black border border-blue-800/50 text-blue-400 hover:bg-blue-950/30' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Scanner un fichier image
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            </div>
          )}

          <div id="qr-reader-file" className="hidden"></div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16 animate-fadeIn">
              <div className={`inline-block animate-spin rounded-full h-20 w-20 border-4 mb-6 ${dm ? 'border-red-900/30 border-t-red-500' : 'border-gray-200 border-t-red-500'}`}></div>
              <p className={`text-xl font-semibold ${dm ? 'text-gray-300' : 'text-gray-700'}`}>Validation en cours...</p>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className={`rounded-2xl shadow-sm overflow-hidden mb-6 border-2 animate-scaleIn
            ${dm ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50 border-red-200'}`}>
            <div className="p-8">
              <div className="flex items-start mb-6">
                <svg className="w-14 h-14 text-red-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className={`font-bold text-3xl mb-2 ${dm ? 'text-gray-100' : 'text-gray-900'}`}>Ticket Invalide</h3>
                  <p className={`text-lg ${dm ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                </div>
              </div>
              <button
                onClick={resetScanner}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-200 shadow-sm hover:scale-105 inline-flex items-center gap-2
                  ${dm ? 'bg-black border border-red-800/50 text-red-400 hover:bg-red-950/30 hover:border-red-600' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Scanner un autre ticket
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {ticketInfo && (
          <div className={`rounded-3xl shadow-sm overflow-hidden border-2 animate-scaleIn
            ${dm ? 'bg-[#0d0d18] border-green-900/40' : 'bg-white border-green-200'}`}>

            {/* Success Header */}
            <div className={`p-8 text-center ${dm ? 'bg-green-900/30' : 'bg-green-600'}`}>
              <svg className={`w-20 h-20 mx-auto mb-4 animate-bounce-slow ${dm ? 'text-green-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className={`text-4xl font-bold mb-2 ${dm ? 'text-green-300' : 'text-white'}`}>Ticket Validé !</h2>
              <p className={`text-xl ${dm ? 'text-green-500' : 'text-green-100'}`}>Entrée autorisée</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* Event Card */}
                <div className={`p-6 rounded-2xl border ${dm ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                    </svg>
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Événement</h3>
                  </div>
                  <p className={`text-2xl font-bold mb-4 ${dm ? 'text-gray-100' : 'text-gray-900'}`}>{ticketInfo.event_title}</p>
                  <div className={`flex items-center ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{new Date(ticketInfo.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Participant Card */}
                <div className={`p-6 rounded-2xl border ${dm ? 'bg-blue-950/20 border-blue-900/30' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className={`w-5 h-5 ${dm ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${dm ? 'text-blue-400' : 'text-blue-600'}`}>Participant</h3>
                  </div>
                  <p className={`text-2xl font-bold mb-4 ${dm ? 'text-gray-100' : 'text-gray-900'}`}>{ticketInfo.first_name} {ticketInfo.last_name}</p>
                  <div className="space-y-3">
                    <div className={`flex items-center ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className={`w-5 h-5 mr-3 ${dm ? 'text-blue-500' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{ticketInfo.email}</span>
                    </div>
                    <div className={`flex items-center ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className={`w-5 h-5 mr-3 ${dm ? 'text-blue-500' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span className={`text-xs font-mono px-3 py-1 rounded-lg border ${dm ? 'bg-black/40 border-red-900/30 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{ticketInfo.qr_code}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scan Time */}
              <div className={`border-l-4 border-green-500 p-6 rounded-xl mb-8 ${dm ? 'bg-green-900/10' : 'bg-green-50'}`}>
                <div className="flex items-center">
                  <svg className={`w-10 h-10 mr-4 ${dm ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className={`font-bold text-lg ${dm ? 'text-green-400' : 'text-green-700'}`}>Scanné avec succès</p>
                    <p className={`text-sm ${dm ? 'text-green-600' : 'text-green-600'}`}>{new Date(ticketInfo.scanned_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="text-center">
                <button
                  onClick={resetScanner}
                  className={`px-10 py-4 rounded-2xl font-bold text-xl shadow-sm hover:scale-105 transition-all duration-200 inline-flex items-center gap-3
                    ${dm ? 'bg-black border border-red-800/50 text-red-400 hover:bg-red-950/30 hover:border-red-600' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Scanner le prochain ticket
                </button>
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
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.7s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-bounce-slow { animation: bounceSlow 2s ease-in-out infinite; }
        #qr-reader__scan_region { border-color: #ef4444 !important; }
      `}</style>
    </div>
  );
};

export default ScanTicket;