import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddPresident = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const dm = darkMode;

  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const [presidentData, setPresidentData] = useState({
    first_name: '', last_name: '', email: '', password: '',
    password_confirmation: '', cne: '', phone: '', avatar: null,
    club_id: '', position: 'Président'
  });

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [existingPresident, setExistingPresident] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await fetch(`${API_BASE_URL}/api/clubs`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrors({ general: `Erreur clubs: ${error.message}` });
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPresidentData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setPresidentData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const checkExistingPresident = async (clubId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/president`);
      if (!response.ok) return null;
      const data = await response.json();
      return data || null;
    } catch { return null; }
  };

  const rollbackPerson = async (personId) => {
    try {
      await fetch(`${API_BASE_URL}/api/persons/${personId}`, { method: 'DELETE', credentials: 'include' });
    } catch (e) { console.error('Rollback failed', personId, e); }
  };

  const doSubmit = async (replacePresident = false) => {
    setLoading(true);
    setErrors({});
    let createdPersonId = null;
    try {
      const formData = new FormData();
      Object.keys(presidentData).forEach(key => {
        if (presidentData[key] !== null && presidentData[key] !== '') formData.append(key, presidentData[key]);
      });
      const personResponse = await fetch(`${API_BASE_URL}/api/persons`, { method: 'POST', credentials: 'include', body: formData });
      const personData = await personResponse.json();
      if (!personResponse.ok) { setErrors({ general: personData.message || "Erreur lors de la création du compte" }); setLoading(false); return; }
      createdPersonId = personData.person.id;
      const memberResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ person_id: createdPersonId, club_id: presidentData.club_id, role: 'president', position: presidentData.position, status: 'active', replace_existing: replacePresident }),
      });
      const memberData = await memberResponse.json();
      if (!memberResponse.ok) {
        await rollbackPerson(createdPersonId);
        setErrors({ general: (memberData.message || "Erreur lors de la nomination") + " — Le compte créé a été supprimé automatiquement." });
        setLoading(false); return;
      }
      setSuccessMessage(`✅ ${presidentData.first_name} ${presidentData.last_name} nommé(e) Président avec succès !`);
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (error) {
      if (createdPersonId) await rollbackPerson(createdPersonId);
      setErrors({ general: 'Erreur serveur. Le compte a été annulé automatiquement. Veuillez réessayer.' });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!presidentData.first_name.trim()) newErrors.first_name = 'Prénom requis';
    if (!presidentData.email.trim())      newErrors.email      = 'Email requis';
    if (!presidentData.password)          newErrors.password   = 'Mot de passe requis';
    if (!presidentData.club_id)           newErrors.club_id    = 'Sélectionnez un club';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const existing = await checkExistingPresident(presidentData.club_id);
    if (existing) { setExistingPresident(existing); setShowConfirm(true); return; }
    doSubmit(false);
  };

  const handleConfirmReplace = () => { setShowConfirm(false); doSubmit(true); };
  const handleCancelReplace  = () => { setShowConfirm(false); setExistingPresident(null); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .ap * { box-sizing: border-box; }
        .ap {
          --red: #c0392b;
          --navy: #1a2c5b;
          --ink: #111111;
          --mute: #888888;
          --line: #e5e5e5;
          --bg: #f9f9f7;
          --card: #ffffff;
        }
        .ap.dm {
          --ink: #efefed;
          --mute: #555555;
          --line: #1f1f1f;
          --bg: #0c0c0c;
          --card: #111111;
        }
        .ap, .ap * { font-family: 'Geist', sans-serif; }
        .ap .serif  { font-family: 'Instrument Serif', serif; }

        .ap-scroll::-webkit-scrollbar { width: 3px; }
        .ap-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 99px; }

        /* ── Field ── */
        .ap-label {
          display: block;
          font-size: 10px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--mute);
          margin-bottom: 6px;
        }
        .ap-input {
          width: 100%; padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: transparent;
          font-size: 13px; color: var(--ink);
          outline: none;
          transition: border-color 0.18s;
        }
        .ap-input::placeholder { color: var(--mute); }
        .ap-input:focus { border-color: var(--red); }
        .ap-input.err { border-color: var(--red); background: rgba(192,57,43,0.04); }

        .ap-select {
          width: 100%; padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--card);
          font-size: 13px; color: var(--ink);
          outline: none;
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          transition: border-color 0.18s;
        }
        .ap-select:focus { border-color: var(--red); }
        .ap-select.err   { border-color: var(--red); }

        .field-error {
          font-size: 11px; color: var(--red);
          margin-top: 4px; margin-left: 2px;
        }

        /* ── Avatar zone ── */
        .avatar-zone {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: transparent;
          margin-bottom: 24px;
        }
        .avatar-ring {
          position: relative;
          width: 72px; height: 72px;
          flex-shrink: 0;
        }
        .avatar-ring img {
          width: 72px; height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--red);
          display: block;
        }
        .avatar-upload-btn {
          position: absolute;
          bottom: 0; right: 0;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: var(--red);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          border: 2px solid var(--card);
          transition: transform 0.15s;
        }
        .avatar-upload-btn:hover { transform: scale(1.1); }
        .avatar-info { flex: 1; min-width: 0; }
        .avatar-info p { margin: 0; }
        .avatar-name {
          font-size: 13px; font-weight: 600;
          color: var(--ink);
        }
        .avatar-hint {
          font-size: 11px; color: var(--mute); margin-top: 2px;
        }
        .avatar-change-label {
          font-size: 11px; color: var(--red);
          font-weight: 500; cursor: pointer;
          margin-top: 4px; display: inline-block;
          transition: opacity 0.15s;
        }
        .avatar-change-label:hover { opacity: 0.7; }

        /* ── Form card ── */
        .form-card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 32px;
          max-width: 660px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Divider ── */
        .form-divider {
          height: 1px;
          background: var(--line);
          margin: 20px 0;
        }

        /* ── Section label ── */
        .section-label {
          font-size: 10px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--mute);
          margin-bottom: 14px;
        }

        /* ── Submit btn ── */
        .btn-submit {
          width: 100%; padding: 12px;
          border-radius: 10px;
          background: var(--navy);
          color: #fff;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.03em;
          border: none; cursor: pointer;
          transition: opacity 0.15s, background 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-submit:hover:not(:disabled) { background: #0f1b3a; }
        .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Alerts ── */
        .alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          margin-bottom: 18px;
        }
        .alert-success { background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.25); color: #16a34a; }
        .alert-error   { background: rgba(192,57,43,0.07); border: 1px solid rgba(192,57,43,0.2);  color: var(--red); }

        /* ── Grid 2 cols ── */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 560px) { .grid-2 { grid-template-columns: 1fr; } }

        /* ── Spin ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        /* ── Modal ── */
        .mc-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.35); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .mc-modal {
          background: var(--card); border: 1px solid var(--line);
          border-radius: 16px; padding: 32px;
          max-width: 360px; width: 100%;
          animation: up 0.2s ease both;
        }
        @keyframes up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .modal-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }

        .btn-modal-cancel {
          flex: 1; padding: 10px; border-radius: 9px;
          border: 1px solid var(--line); background: transparent;
          font-size: 13px; color: var(--mute); cursor: pointer; transition: all 0.15s;
        }
        .btn-modal-cancel:hover { border-color: var(--ink); color: var(--ink); }
        .btn-modal-confirm {
          flex: 1; padding: 10px; border-radius: 9px;
          border: 1px solid var(--red); background: var(--red);
          font-size: 13px; color: #fff; cursor: pointer; transition: opacity 0.15s;
        }
        .btn-modal-confirm:hover { opacity: 0.85; }

        /* ── info row in modal ── */
        .info-row {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 12px; color: var(--mute); line-height: 1.55;
        }
        .info-dot {
          width: 6px; height: 6px; border-radius: 50%;
          flex-shrink: 0; margin-top: 4px;
        }
      `}</style>

      <div
        className={`ap ${dm ? 'dm' : ''} min-h-screen`}
        style={{ background: 'var(--bg)', transition: 'background 0.3s' }}
      >
        <div className="ap-scroll overflow-y-auto" style={{ paddingBottom: '60px' }}>
          <div style={{ maxWidth: '660px', margin: '0 auto', padding: '0 24px' }}>

            {/* ── Page title ── */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ width: '64px', height: '4px', background: 'var(--red)', borderRadius: '2px', marginBottom: '16px' }} />
              <h1 style={{ fontSize: '48px', fontWeight: 900, color: dm ? '#fff' : '#1a2c5b', margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                Nomination Président
              </h1>
              <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--mute)', marginTop: '8px' }}>
                Assignez un nouveau leader à un club existant
              </p>
            </div>

            {/* ── Alerts ── */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errors.general  && <div className="alert alert-error">⚠ {errors.general}</div>}

            {/* ── Single form card ── */}
            <div className="form-card">

              {/* Avatar inline row */}
              <div className="avatar-zone">
                <div className="avatar-ring">
                  <img
                    src={avatarPreview || "https://ui-avatars.com/api/?background=c0392b&color=fff&name=P&size=144"}
                    alt="Avatar"
                  />
                  <label className="avatar-upload-btn" title="Changer la photo">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" name="avatar" className="hidden" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                  </label>
                </div>
                <div className="avatar-info">
                  <p className="avatar-name">
                    {presidentData.first_name || presidentData.last_name
                      ? `${presidentData.first_name} ${presidentData.last_name}`.trim()
                      : 'Nouveau Président'}
                  </p>
                  <p className="avatar-hint">JPG, PNG — max 2 MB</p>
                  <label className="avatar-change-label">
                    Changer la photo
                    <input type="file" name="avatar" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
              </div>

              {/* Section: Identité */}
              <p className="section-label">Identité</p>
              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label className="ap-label">Prénom *</label>
                  <input type="text" name="first_name" value={presidentData.first_name}
                    onChange={handleChange} placeholder="Ahmed"
                    className={`ap-input${errors.first_name ? ' err' : ''}`} />
                  {errors.first_name && <p className="field-error">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="ap-label">Nom</label>
                  <input type="text" name="last_name" value={presidentData.last_name}
                    onChange={handleChange} placeholder="Bennani" className="ap-input" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="ap-label">Email professionnel *</label>
                <input type="email" name="email" value={presidentData.email}
                  onChange={handleChange} placeholder="president@estfes.ma"
                  className={`ap-input${errors.email ? ' err' : ''}`} />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label className="ap-label">CNE</label>
                  <input type="text" name="cne" value={presidentData.cne}
                    onChange={handleChange} placeholder="R123456789" className="ap-input" />
                </div>
                <div>
                  <label className="ap-label">Téléphone</label>
                  <input type="text" name="phone" value={presidentData.phone}
                    onChange={handleChange} placeholder="+212 6xx xxx xxx" className="ap-input" />
                </div>
              </div>

              <div className="form-divider"></div>

              {/* Section: Organisation */}
              <p className="section-label">Organisation</p>
              <div style={{ marginBottom: '24px' }}>
                <label className="ap-label">Club de destination *</label>
                <select name="club_id" value={presidentData.club_id} onChange={handleChange}
                  className={`ap-select${errors.club_id ? ' err' : ''}`}
                  style={dm ? { backgroundColor: '#1a1a1a', color: '#ffffff' } : {}}
                  disabled={loadingClubs}>
                  <option value="" style={dm ? { backgroundColor: '#1a1a1a' } : {}}>
                    {loadingClubs ? 'Chargement...' : "Sélectionner l'organisation..."}
                  </option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id} style={dm ? { backgroundColor: '#1a1a1a' } : {}}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.club_id && <p className="field-error">{errors.club_id}</p>}
              </div>

              <div className="form-divider"></div>

              {/* Section: Sécurité */}
              <p className="section-label">Sécurité</p>
              <div className="grid-2" style={{ marginBottom: '24px' }}>
                <div>
                  <label className="ap-label">Mot de passe *</label>
                  <input type="password" name="password" onChange={handleChange}
                    placeholder="••••••••"
                    className={`ap-input${errors.password ? ' err' : ''}`} />
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <div>
                  <label className="ap-label">Confirmer</label>
                  <input type="password" name="password_confirmation" onChange={handleChange}
                    placeholder="••••••••" className="ap-input" />
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || loadingClubs}
                className="btn-submit"
              >
                {loading ? (
                  <>
                    <svg className="spin" width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                    Création en cours…
                  </>
                ) : (
                  <>
                    Nommer le Président
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirm && existingPresident && (
        <div className="mc-overlay">
          <div className={`mc-modal ap ${dm ? 'dm' : ''}`}>
            <div className="modal-icon">
              <svg width="22" height="22" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: '8px' }}>
              Attention
            </p>
            <h2 className="serif" style={{ fontSize: '20px', fontWeight: 400, color: 'var(--ink)', textAlign: 'center', margin: '0 0 16px' }}>
              Ce club a déjà un président
            </h2>

            <div style={{
              padding: '14px 16px', borderRadius: '10px',
              border: '1px solid var(--line)', marginBottom: '20px',
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <div className="info-row">
                <div className="info-dot" style={{ background: '#ef4444' }}></div>
                <span>
                  <strong style={{ color: '#ef4444' }}>{existingPresident.first_name} {existingPresident.last_name}</strong>
                  {' '}passera en statut inactif — son compte est conservé.
                </span>
              </div>
              <div className="info-row">
                <div className="info-dot" style={{ background: '#22c55e' }}></div>
                <span>
                  <strong style={{ color: '#22c55e' }}>{presidentData.first_name || 'Le nouveau membre'}</strong>
                  {' '}deviendra le président actif de ce club.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-modal-cancel" onClick={handleCancelReplace}>Annuler</button>
              <button className="btn-modal-confirm" onClick={handleConfirmReplace} disabled={loading}>
                {loading
                  ? <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20"/></svg>
                  : 'Oui, remplacer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPresident;
