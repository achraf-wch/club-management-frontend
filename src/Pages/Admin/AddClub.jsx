import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from '../Admin/AdminSidebar';

/* ── Global keyframe animations injected once ── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.93); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0);     }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0);   }
    20%      { transform: translateX(-6px);}
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px);}
    80%      { transform: translateX(4px); }
  }
  @keyframes successPop {
    0%   { opacity:0; transform: scale(0.85) translateY(-8px); }
    60%  { transform: scale(1.04) translateY(0); }
    100% { opacity:1; transform: scale(1) translateY(0); }
  }
  @keyframes barReveal {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
  .anim-fade-slide { animation: fadeSlideUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-fade       { animation: fadeIn      0.35s ease both; }
  .anim-scale      { animation: scaleIn     0.4s  cubic-bezier(.22,.68,0,1.2) both; }
  .anim-left       { animation: slideInLeft 0.4s  ease both; }
  .anim-shake      { animation: shake       0.4s  ease; }
  .anim-success    { animation: successPop  0.45s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-bar        { animation: barReveal   0.5s  ease both; }

  /* stagger delays */
  .d-0  { animation-delay: 0ms;   }
  .d-1  { animation-delay: 60ms;  }
  .d-2  { animation-delay: 120ms; }
  .d-3  { animation-delay: 180ms; }
  .d-4  { animation-delay: 240ms; }
  .d-5  { animation-delay: 300ms; }
  .d-6  { animation-delay: 360ms; }
  .d-7  { animation-delay: 420ms; }

  /* input focus ring */
  .club-input { transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
  .club-input:focus { transform: translateY(-1px); }

  /* category button */
  .cat-btn { transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s; }
  .cat-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(192,57,43,0.18); }
  .cat-btn:active { transform: scale(0.95); }

  /* submit button */
  .submit-btn { transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
  .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(192,57,43,0.4); }
  .submit-btn:active:not(:disabled) { transform: scale(0.97); }

  /* cancel button */
  .cancel-btn { transition: border-color 0.2s, color 0.2s, transform 0.15s; }
  .cancel-btn:hover { transform: translateY(-1px); }

  /* logo upload zone */
  .logo-zone { transition: border-color 0.2s, background 0.2s, transform 0.2s; }
  .logo-zone:hover { transform: scale(1.015); }

  /* section header bar */
  .section-bar { transition: letter-spacing 0.3s; }
`;

const AddClub = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const dm = darkMode;

  useEffect(() => {
    // Inject styles once
    if (!document.getElementById('addclub-styles')) {
      const tag = document.createElement('style');
      tag.id = 'addclub-styles';
      tag.innerHTML = STYLES;
      document.head.appendChild(tag);
    }
    const handleThemeChange = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const [clubData, setClubData] = useState({
    name: '', code: '', description: '', mission: '',
    logo: null, cover_image: null, category: '',
    founding_year: '', is_public: true, total_members: 0, active_members: 0
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview]       = useState(null);
  const [coverPreview, setCoverPreview]     = useState(null);
  const [shakeForm, setShakeForm]           = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClubData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setClubData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'logo') setLogoPreview(reader.result);
        else if (name === 'cover_image') setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const removeFile = (fieldName) => {
    setClubData(prev => ({ ...prev, [fieldName]: null }));
    if (fieldName === 'logo') setLogoPreview(null);
    else if (fieldName === 'cover_image') setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('name', clubData.name);
      formData.append('code', clubData.code);
      formData.append('description', clubData.description);
      formData.append('category', clubData.category);
      formData.append('founding_year', clubData.founding_year);
      formData.append('is_public', clubData.is_public ? 1 : 0);
      formData.append('total_members', clubData.total_members || 0);
      formData.append('active_members', clubData.active_members || 0);
      if (clubData.mission?.trim()) formData.append('mission', clubData.mission.trim());
      if (clubData.logo) formData.append('logo', clubData.logo);
      if (clubData.cover_image) formData.append('cover_image', clubData.cover_image);

      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        method: 'POST', credentials: 'include', body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Club ajouté avec succès!');
        setTimeout(() => { navigate('/admin/manageClubs'); }, 2000);
      } else if (response.status === 422) {
        setErrors(data.errors || { general: data.message });
        // shake the form on validation error
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 500);
      } else {
        setErrors({ general: data.message || "Erreur lors de l'ajout" });
      }
    } catch (error) {
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'culture', label: 'Culture', icon: '🎭' },
    { value: 'sport',   label: 'Sport',   icon: '⚽' },
    { value: 'tech',    label: 'Techno',  icon: '💻' },
    { value: 'art',     label: 'Art',     icon: '🎨' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'social',  label: 'Social',  icon: '🤝' }
  ];

  // ── Palette ──
  const bg      = dm ? '#0a0a0a' : '#f1f5f9';
  const cardBg  = dm ? '#111111' : '#ffffff';
  const border  = dm ? 'rgba(255,255,255,0.09)' : '#d1d5db';
  const txtMain = dm ? '#f0f0f0' : '#1a2c5b';
  const txtSub  = dm ? 'rgba(240,240,240,0.45)' : '#6b7280';

  const SectionHeader = ({ title, delay = 'd-0' }) => (
    <div
      className={`section-bar w-full text-center py-2.5 mb-6 font-bold text-sm uppercase tracking-widest rounded anim-bar ${delay}`}
      style={{ background: '#c0392b', color: '#ffffff' }}
    >
      {title}
    </div>
  );

  const Label = ({ children }) => (
    <label className="block text-sm mb-1.5 font-medium" style={{ color: txtSub }}>
      {children}
    </label>
  );

  const inputCls = (err) =>
    `club-input w-full px-3 py-2.5 text-sm border rounded outline-none ${
      err
        ? 'border-red-500 bg-red-500/5'
        : dm
        ? 'border-white/10 bg-white/[0.05] text-white placeholder-white/20 focus:border-[#c0392b]/60'
        : 'border-gray-300 bg-white text-[#1a2c5b] placeholder-gray-300 focus:border-[#1a2c5b]/50 focus:shadow-sm'
    }`;

  const ErrMsg = ({ msg }) => msg
    ? <p className="anim-fade text-red-400 text-[10px] font-semibold mt-1 uppercase">{msg[0] || msg}</p>
    : null;

  return (
    <div className="min-h-screen flex transition-colors duration-500" style={{ background: bg }}>
      <AdminSidebar onLogout={logout} user={user} />

      <div className="flex-1 overflow-y-auto">
        <div style={{ paddingTop: '140px' }} className="px-4 md:px-10 pb-16 max-w-3xl mx-auto">

          {/* ── Breadcrumb ── */}
          <div className="mb-6 flex items-center gap-2 anim-left d-0">
            <button onClick={() => navigate('/admin/manageClubs')}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              style={{ color: txtSub }}
              onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
              onMouseLeave={e => e.currentTarget.style.color = txtSub}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Clubs
            </button>
            <span style={{ color: border }}>/</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: txtMain }}>Nouveau Club</span>
          </div>

          {/* ── Alerts ── */}
          {errors.general && (
            <div className="mb-5 anim-fade bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm font-semibold">
              {errors.general}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 anim-success flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded text-sm font-semibold">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit}>
            <div
              className={`rounded-lg border p-8 anim-scale d-1 ${shakeForm ? 'anim-shake' : ''}`}
              style={{
                background: cardBg,
                borderColor: border,
                boxShadow: dm ? '0 2px 20px rgba(0,0,0,0.5)' : '0 1px 6px rgba(0,0,0,0.06)',
              }}
            >

              {/* ══ SECTION 1 : Identité ══ */}
              <SectionHeader title="Identité du Club" delay="d-1" />

              <div className="mb-5 anim-fade-slide d-2">
                <Label>Nom complet du club <span className="text-[#c0392b]">*</span></Label>
                <input type="text" name="name" value={clubData.name} onChange={handleChange}
                  className={inputCls(errors.name)} placeholder="Ex: Club Robotique EST" />
                <ErrMsg msg={errors.name} />
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div className="anim-fade-slide d-3">
                  <Label>Code identifiant <span className="text-[#c0392b]">*</span></Label>
                  <input type="text" name="code" value={clubData.code} onChange={handleChange}
                    className={inputCls(errors.code)} placeholder="Ex: CLB-24" />
                  <ErrMsg msg={errors.code} />
                </div>
                <div className="anim-fade-slide d-4">
                  <Label>Année de fondation <span className="text-[#c0392b]">*</span></Label>
                  <input type="number" name="founding_year" value={clubData.founding_year} onChange={handleChange}
                    className={inputCls(errors.founding_year)} placeholder="Ex: 2020" min="1900" max="2099" />
                  <ErrMsg msg={errors.founding_year} />
                </div>
              </div>

              <div className="mb-5 anim-fade-slide d-5">
                <Label>Description <span className="text-[#c0392b]">*</span></Label>
                <textarea name="description" value={clubData.description} onChange={handleChange}
                  className={`${inputCls(errors.description)} resize-none`} rows="3"
                  placeholder="Décrivez les objectifs et activités du club..." />
                <ErrMsg msg={errors.description} />
              </div>

              <div className="anim-fade-slide d-6">
                <Label>Mission <span className="text-xs font-normal" style={{ color: txtSub }}>(optionnel)</span></Label>
                <textarea name="mission" value={clubData.mission} onChange={handleChange}
                  className={`${inputCls(false)} resize-none`} rows="2"
                  placeholder="Mission principale du club..." />
              </div>

              {/* ══ SECTION 2 : Catégorie ══ */}
              <div className="mt-8 anim-fade-slide d-7">
                <SectionHeader title="Catégorie" delay="d-7" />
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {categories.map((cat, i) => (
                  <button key={cat.value} type="button"
                    onClick={() => { setClubData(prev => ({ ...prev, category: cat.value })); setErrors(p => ({ ...p, category: '' })); }}
                    className={`cat-btn flex flex-col items-center justify-center gap-1.5 py-3 rounded border-2 anim-fade-slide d-${i}`}
                    style={{
                      borderColor: clubData.category === cat.value ? '#c0392b' : border,
                      background: clubData.category === cat.value
                        ? 'rgba(192,57,43,0.10)'
                        : dm ? 'rgba(255,255,255,0.02)' : '#fafafa',
                    }}>
                    <span className="text-xl" style={{ transition: 'transform 0.2s', transform: clubData.category === cat.value ? 'scale(1.25)' : 'scale(1)' }}>
                      {cat.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: clubData.category === cat.value ? '#c0392b' : txtSub }}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
              <ErrMsg msg={errors.category} />

              {/* ══ SECTION 3 : Médias & Visibilité ══ */}
              <div className="mt-8 anim-fade-slide d-3">
                <SectionHeader title="Médias & Visibilité" delay="d-3" />
              </div>

              <div className="grid grid-cols-2 gap-6 anim-fade-slide d-4">
                {/* Logo */}
                <div>
                  <Label>Logo du club</Label>
                  {!logoPreview ? (
                    <label className="logo-zone cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded py-8"
                      style={{ borderColor: border }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.background = dm ? 'rgba(192,57,43,0.04)' : 'rgba(192,57,43,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = 'transparent'; }}>
                      <input type="file" name="logo" onChange={handleFileChange} accept="image/*" className="hidden" />
                      <svg className="w-8 h-8 mb-2" style={{ color: txtSub }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-semibold" style={{ color: txtSub }}>Importer le logo</span>
                      <span className="text-[10px] mt-0.5" style={{ color: dm ? 'rgba(255,255,255,0.15)' : '#c4c9d4' }}>PNG, JPG — max 2MB</span>
                    </label>
                  ) : (
                    <div className="anim-scale flex items-center gap-3 border rounded p-3" style={{ borderColor: border }}>
                      <img src={logoPreview} alt="Logo" className="w-14 h-14 object-cover rounded" style={{ transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                      <button type="button" onClick={() => removeFile('logo')}
                        className="text-xs font-bold uppercase tracking-wide text-red-400 transition-colors"
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#f87171'}>
                        Supprimer
                      </button>
                    </div>
                  )}
                  <ErrMsg msg={errors.logo} />
                </div>

                {/* Visibilité */}
                <div>
                  <Label>Visibilité publique</Label>
                  <div className="flex items-center justify-between border rounded px-4 py-4"
                    style={{
                      borderColor: border,
                      background: dm ? 'rgba(255,255,255,0.02)' : '#fafafa',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = dm ? 'rgba(255,255,255,0.18)' : '#9ca3af'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: txtMain, transition: 'color 0.2s' }}>
                        {clubData.is_public ? 'Visible par tous' : 'Accès restreint'}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: txtSub }}>
                        {clubData.is_public ? 'Club public' : 'Club privé'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="is_public" checked={clubData.is_public} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-[#c0392b] relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-5" style={{ transition: 'background 0.25s' }}></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ══ Actions ══ */}
              <div className="mt-8 pt-6 border-t flex gap-3 anim-fade-slide d-5" style={{ borderColor: border }}>
                <button type="submit" disabled={loading}
                  className="submit-btn flex-1 py-3 rounded font-bold text-sm uppercase tracking-widest text-white"
                  style={{ background: loading ? '#aaa' : '#c0392b' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enregistrement...
                    </span>
                  ) : 'Créer le Club'}
                </button>
                <button type="button" onClick={() => navigate('/admin/manageClubs')}
                  className="cancel-btn px-6 py-3 rounded font-bold text-sm uppercase tracking-widest border"
                  style={{ borderColor: border, color: txtSub, background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = txtSub; }}>
                  Annuler
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClub;