// filepath: src/features/login/AccountSetup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Button, Input, Alert } from '../../Componenets';

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

const AccountSetup = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!authLoading && user) {
      setFormData({
        name: user.name || '',
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
    if (!formData.apogee) newErrors.apogee = "Le numéro apogée est requis";
    if (!formData.filiere) newErrors.filiere = 'La filière est requise';
    if (!formData.niveau) newErrors.niveau = 'Le niveau est requis';

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
        setTimeout(() => navigate('/'), 1500);
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

  const isProfileComplete = user.name && user.phone && user.cne && user.apogee;

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Configuration du compte</h1>
        <p className="text-slate-400 mb-8">Complétez votre profil pour accéder à toutes les fonctionnalités</p>

        {successMsg && (
          <Alert type="success" className="mb-6">{successMsg}</Alert>
        )}

        {errors.general && (
          <Alert type="error" className="mb-6">{errors.general}</Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              required
            />
            <Input
              label="Filière"
              name="filiere"
              value={formData.filiere}
              onChange={handleChange}
              error={errors.filiere}
              required
            />
            <Input
              label="Niveau"
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
              error={errors.niveau}
              required
            />
          </div>

          <TwoFactorSetup user={user} API_BASE_URL={API_BASE_URL} />

          <Button type="submit" variant="primary" loading={saving} size="lg" fullWidth>
            Enregistrer
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AccountSetup;