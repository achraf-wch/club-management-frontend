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

  // Gestion du Thème sombre
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const handleThemeChange = () => setDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Initialisation du scanner caméra
  useEffect(() => {
    if (scanning && scanMode === 'camera' && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          qrbox: { width: 280, height: 280 }, 
          fps: 15,
          aspectRatio: 1.0
        },
        false
      );
      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error('Erreur arrêt scanner:', err));
      }
    };
  }, [scanning, scanMode]);

  const onScanSuccess = async (decodedText) => {
    if (scanner) { 
      await scanner.clear(); 
      setScanner(null); 
    }
    setScanning(false);
    setScanMode(null);
    await validateTicket(decodedText);
  };

  const onScanError = (err) => {
    // On ignore les erreurs de scan continu pour ne pas polluer la console
  };

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
      setError("Impossible de lire ce QR code. Assurez-vous que l'image est nette.");
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async (rawQrText) => {
    setLoading(true);
    setError('');
    setTicketInfo(null);

    try {
      let parsedQr;
      try {
        parsedQr = JSON.parse(rawQrText);
      } catch (e) {
        parsedQr = { ticket_code: rawQrText.trim() };
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/scan-qr`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({
          qr_data: JSON.stringify(parsedQr),
          scanned_by: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTicketInfo(data.ticket);
      } else {
        if (response.status === 409) setError(data.message || 'Ce ticket a déjà été validé');
        else if (response.status === 400) setError(data.message || 'Ticket invalide ou expiré');
        else if (response.status === 404) setError('Ticket introuvable dans la base de données');
        else setError(data.message || 'Erreur lors de la validation');
      }
    } catch (err) {
      setError('Erreur de connexion avec le serveur');
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
    <div className={`min-h-screen py-10 px-4 transition-colors duration-300 ${dm ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête avec bouton retour */}
        <div className="flex items-center justify-between mb-8 animate-fadeInDown">
          <button 
            onClick={() => navigate('/President/Dashboard')}
            className={`p-3 rounded-xl transition-all ${dm ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="text-right">
            <h1 className={`text-3xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>VALIDATION</h1>
            <p className="text-red-500 font-bold tracking-widest text-xs uppercase">Contrôle d'accès</p>
          </div>
        </div>

        <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-500 animate-slideInUp
          ${dm ? 'bg-[#11111d] border-white/5' : 'bg-white border-gray-100'}`}>
          
          {/* État initial : Choix du mode */}
          {!scanning && !ticketInfo && !loading && !error && (
            <div className="p-12 text-center">
              <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center animate-bounce-slow
                ${dm ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold mb-4 ${dm ? 'text-white' : 'text-gray-900'}`}>Scanner un ticket</h2>
              <p className={`mb-10 max-w-xs mx-auto ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                Scannez le QR code du participant pour valider son entrée à l'événement.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={startCameraScanning}
                  className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/20"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span className="font-bold">Utiliser la caméra</span>
                </button>

                <label className={`flex flex-col items-center gap-4 p-8 rounded-3xl transition-all hover:scale-[1.02] cursor-pointer active:scale-95 border-2 border-dashed
                  ${dm ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="font-bold">Importer une image</span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Scanner Caméra Actif */}
          {scanning && (
            <div className="p-6 animate-scaleIn">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>Scan en cours...</h3>
                <button onClick={resetScanner} className="text-red-500 font-bold hover:underline">Annuler</button>
              </div>
              <div id="qr-reader" className={`rounded-3xl overflow-hidden border-4 ${dm ? 'border-white/10' : 'border-gray-100'}`}></div>
              <p className="mt-6 text-center text-sm text-gray-500">Cadrez le QR code à l'intérieur du carré</p>
            </div>
          )}

          {/* Chargement */}
          {loading && (
            <div className="p-20 text-center animate-fadeIn">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-red-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-red-600 animate-spin"></div>
              </div>
              <h3 className={`text-xl font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>Vérification...</h3>
            </div>
          )}

          {/* Résultat : SUCCÈS */}
          {ticketInfo && (
            <div className="animate-scaleIn">
              <div className={`p-10 text-center ${dm ? 'bg-green-500/10' : 'bg-green-600'}`}>
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${dm ? 'bg-green-500/20 text-green-400' : 'bg-white text-green-600 shadow-lg'}`}>
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className={`text-3xl font-black mb-1 ${dm ? 'text-green-400' : 'text-white'}`}>TICKET VALIDE</h2>
                <p className={`${dm ? 'text-green-500/70' : 'text-green-100'}`}>Entrée autorisée</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className={`p-6 rounded-3xl ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Participant</p>
                    <p className={`text-xl font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>{ticketInfo.first_name} {ticketInfo.last_name}</p>
                    <p className="text-sm text-gray-500 truncate">{ticketInfo.email}</p>
                  </div>
                  <div className={`p-6 rounded-3xl ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Événement</p>
                    <p className={`text-xl font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>{ticketInfo.event_title}</p>
                    <p className="text-sm text-gray-500">{new Date(ticketInfo.event_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <button 
                  onClick={resetScanner}
                  className="w-full py-5 rounded-2xl bg-gray-900 text-white font-bold text-lg hover:bg-black transition-all"
                >
                  Scanner le suivant
                </button>
              </div>
            </div>
          )}

          {/* Résultat : ERREUR */}
          {error && (
            <div className="p-12 text-center animate-scaleIn">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className={`text-2xl font-black mb-2 ${dm ? 'text-white' : 'text-gray-900'}`}>TICKET INVALIDE</h2>
              <p className="text-red-500 font-medium mb-10">{error}</p>
              <button 
                onClick={resetScanner}
                className="px-10 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>

      <div id="qr-reader-file" className="hidden"></div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-slideInUp { animation: slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        #qr-reader__dashboard { display: none !important; }
        #qr-reader { border: none !important; }
        #qr-canvas { border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default ScanTicket;