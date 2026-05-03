// filepath: src/features/login/AccountSetup.jsx
import React, { useCallback, useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Button, Input, Alert } from '../../Componenets';
import { API_BASE_URL } from '../../config/api';

const TwoFactorSetup = ({ user, API_BASE_URL }) => {
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [is2FAEnabled, set2FA] = useState(user?.two_factor_enabled || false);

  const inputCls = 'w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 placeholder-slate-500 text-center text-2xl font-mono tracking-widest';

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/2fa/setup`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setStatus('setup');
      } else {
        setError(data.message || 'Erreur');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (code.length !== 6) {
      setError('Entrez un code à 6 chiffres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/2fa/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('2FA activé avec succès!');
        set2FA(true);
        setStatus(null);
      } else {
        setError(data.message || 'Code incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/2fa/disable`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('2FA désactivé');
        set2FA(false);
      } else {
        setError(data.message || 'Erreur');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStatus(null);
    setCode('');
    setQrCode('');
    setSecret('');
  };

  if (status === 'setup') {
    return (
      <div className="max-w-md mx-auto p-6 bg-slate-800/50 rounded-xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Configuration 2FA</h3>
        {error && <Alert type="error" className="mb-4">{error}</Alert>}
        {success && <Alert type="success" className="mb-4">{success}</Alert>}
        <div className="text-center mb-4">
          <p className="text-slate-400 text-sm mb-2">Scannez ce QR code avec Google Authenticator</p>
          <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48 bg-white p-2 rounded-lg" />
          <p className="text-slate-400 text-xs mt-2">Secret: {secret}</p>
        </div>
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className={inputCls}
          placeholder="Entrez le code"
        />
        <div className="flex gap-3 mt-4">
          <Button variant="primary" onClick={handleEnable} loading={isLoading} disabled={code.length !== 6} className="flex-1">
            Activer
          </Button>
          <Button variant="ghost" onClick={handleCancel} className="flex-1">
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800/50 rounded-xl border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">Authentification à deux facteurs</h3>
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {success && <Alert type="success" className="mb-4">{success}</Alert>}
      <p className="text-slate-400 text-sm mb-4">
        {is2FAEnabled ? '2FA est activé sur votre compte' : 'Protégez votre compte avec Google Authenticator'}
      </p>
      {is2FAEnabled ? (
        <Button variant="danger" onClick={handleDisable} loading={isLoading} fullWidth>
          Désactiver 2FA
        </Button>
      ) : (
        <Button variant="primary" onClick={handleSetup} loading={isLoading} fullWidth>
          Configurer 2FA
        </Button>
      )}
    </div>
  );
};

const GoogleAccountLink = ({ API_BASE_URL }) => {
  const [status, setStatus] = useState({ is_linked: false, google_email: null, has_password: true });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/google/status`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Impossible de charger le statut Google.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion.' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleLink = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google/link`;
  };

  const handleUnlink = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/google/unlink`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Compte Google délié.' });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.message || 'Impossible de délier ce compte Google.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800/50 rounded-xl border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">Connexion Google</h3>
      {message && <Alert type={message.type} className="mb-4">{message.text}</Alert>}
      <p className="text-slate-400 text-sm mb-4">
        {status.is_linked
          ? `Votre compte est lié à ${status.google_email}. Vous pourrez utiliser Google à la prochaine connexion.`
          : 'Liez votre compte Google ici avant de pouvoir utiliser le bouton Google sur la page de connexion.'}
      </p>

      {status.is_linked ? (
        <Button variant="danger" onClick={handleUnlink} loading={loading} fullWidth>
          Délier Google
        </Button>
      ) : (
        <Button variant="outline" onClick={handleLink} loading={loading} fullWidth>
          Lier mon compte Google
        </Button>
      )}
    </div>
  );
};

const AccountSetup = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cne: '',
    apogee: '',
    filiere: '',
    niveau: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'google_linked') {
      setSuccessMsg('Compte Google lié avec succès. Vous pouvez maintenant vous connecter avec Google.');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (error) {
      const messages = {
        google_error: 'Erreur lors de la liaison avec Google. Veuillez réessayer.',
        google_already_linked: 'Ce compte Google est déjà lié à un autre utilisateur.',
        session_expired: 'Session expirée. Reconnectez-vous puis réessayez.',
        user_not_found: 'Utilisateur introuvable.',
      };
      setErrors({ general: messages[error] || 'Impossible de lier le compte Google.' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      setFormData({
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: user.phone || '',
        cne: user.cne || '',
        apogee: user.apogee || '',
        filiere: user.filiere || '',
        niveau: user.niveau || '',
      });
    }
  }, [user, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.phone) newErrors.phone = 'Le téléphone est requis';
    if (!formData.cne) newErrors.cne = 'Le CNE est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/account/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Compte mis à jour avec succès!');
        if (data.user && updateUser) updateUser(data.user);
        setShowProfileForm(false);
      } else {
        setErrors(data.errors || { general: data.message || 'Erreur' });
      }
    } catch (err) {
      setErrors({ general: 'Erreur de connexion' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Sécurité du compte</h1>
        <p className="text-slate-400 mb-8">Configurez la connexion Google et la double authentification.</p>

        {successMsg && (
          <Alert type="success" className="mb-6">{successMsg}</Alert>
        )}

        {errors.general && (
          <Alert type="error" className="mb-6">{errors.general}</Alert>
        )}

        <div className="space-y-6">
          <GoogleAccountLink API_BASE_URL={API_BASE_URL} />

          <TwoFactorSetup user={user} API_BASE_URL={API_BASE_URL} />

          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => setShowProfileForm((current) => !current)}
              fullWidth
            >
              {showProfileForm ? 'Masquer les informations' : 'Modifier mes informations'}
            </Button>
          </div>

          {showProfileForm && (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-6">
              <h3 className="text-xl font-bold text-white">Informations personnelles</h3>
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="Nom complet"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                <Input
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
                <Input
                  label="CNE"
                  name="cne"
                  value={formData.cne}
                  onChange={handleChange}
                  error={errors.cne}
                  required
                />
                <Input
                  label="Numéro Apogée"
                  name="apogee"
                  value={formData.apogee}
                  onChange={handleChange}
                  error={errors.apogee}
                />
                <Input
                  label="Filière"
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  error={errors.filiere}
                />
                <Input
                  label="Niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  error={errors.niveau}
                />
              </div>

              <Button type="submit" variant="primary" loading={saving} size="lg" fullWidth>
                Enregistrer les modifications
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSetup;
