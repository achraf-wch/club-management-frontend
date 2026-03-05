import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Componenets/Navbar';
import Footer from '../Componenets/Footer';

const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'ar', label: 'AR', flag: '🇲🇦', name: 'العربية' },
];

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIdx, setSelectedIdx]   = useState(0);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [currentLang, setCurrentLang]   = useState('ar');
  const [scrollY, setScrollY]           = useState(0);
  const [visible, setVisible]           = useState({});
  const refs = useRef({});

  /* ── dark mode synced with Navbar ── */
  // ✅ CHANGEMENT ICI SEULEMENT : lire localStorage au montage + écouter 'themeChanged'
  const [isDark, setIsDark] = useState(() => {
    const s = localStorage.getItem('darkMode');
    return s !== null ? s === 'true' : document.documentElement.classList.contains('dark');
  });
  useEffect(() => {
    const h = e => setIsDark(e.detail.dark);
    window.addEventListener('themeChanged', h);
    return () => window.removeEventListener('themeChanged', h);
  }, []);
  // ✅ FIN DU CHANGEMENT

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.dataset.sec]: true }));
      }), { threshold: 0.08 }
    );
    Object.values(refs.current).forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [event]);

  const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => { const s = localStorage.getItem('selectedLang'); if (s) setCurrentLang(s); }, []);
  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/api/events/${id}`);
      if (!r.ok) throw new Error('Événement non trouvé');
      setEvent(await r.json()); setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const getImg = path => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    let p = path.startsWith('/') ? path.slice(1) : path;
    return `${API}/storage/${p.replace(/^public\//, '')}`;
  };

  const translateTo = lang => {
    document.cookie = `googtrans=/ar/${lang}`;
    document.cookie = `googtrans=/ar/${lang};domain=.${window.location.hostname}`;
    localStorage.setItem('selectedLang', lang);
    window.location.reload();
  };

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[2];
  const openLB = (img, i) => { setSelectedImage(img); setSelectedIdx(i); };

  /* ══════════════════════════════════════════════════
     DESIGN TOKENS
     DARK  → bleu nuit #060d1f–#0f1e3d  + rouge + cyan
     LIGHT → blanc pur + bleu roi + rouge
  ══════════════════════════════════════════════════ */
  const C = isDark ? {
    /* backgrounds */
    pageBg:   'linear-gradient(160deg, #060d1f 0%, #0a1628 40%, #0f1e3d 70%, #060d1f 100%)',
    secBg:    '#07101f',
    /* neumorphism dark */
    neuBg:    '#0b1730',
    neuShadowD: '#040c1a',
    neuShadowL: '#122040',
    /* text */
    tp: '#e8f0ff', ts: '#7090c0', tm: '#3a5888', tl: '#1e3a60',
    /* palette */
    red:  '#e63946',
    blue: '#1e90ff',
    cyan: '#00cfff',
    /* borders */
    bdr: 'rgba(30,144,255,0.15)',
    bdrHv: 'rgba(230,57,70,0.5)',
    /* divider */
    div: 'rgba(30,144,255,0.10)',
  } : {
    pageBg:   '#ffffff',
    secBg:    '#f4f7ff',
    neuBg:    '#f0f4ff',
    neuShadowD: '#c8d4ee',
    neuShadowL: '#ffffff',
    tp: '#0a1428', ts: '#2a3f70', tm: '#607098', tl: '#90a8c8',
    red:  '#c0392b',
    blue: '#1a3cb4',
    cyan: '#1565e0',
    bdr: 'rgba(26,60,180,0.12)',
    bdrHv: 'rgba(192,57,43,0.4)',
    div: 'rgba(26,60,180,0.09)',
  };

  /* Neumorphism box-shadow helper */
  const neu = (raised = true, accent = false) => {
    if (accent) return `6px 6px 18px ${C.neuShadowD}, -4px -4px 12px ${C.neuShadowL}, inset 0 0 0 1px ${C.bdr}`;
    return raised
      ? `6px 6px 16px ${C.neuShadowD}, -4px -4px 12px ${C.neuShadowL}`
      : `inset 3px 3px 8px ${C.neuShadowD}, inset -2px -2px 6px ${C.neuShadowL}`;
  };

  const statusMap = {
    completed: { label:'✓ Terminé',    bg:`rgba(139,92,246,.15)`, c:'#a78bfa', bd:'rgba(139,92,246,.3)' },
    approved:  { label:'✓ Approuvé',   bg:`rgba(16,185,129,.15)`, c:'#34d399', bd:'rgba(16,185,129,.3)' },
    pending:   { label:'⏳ En attente', bg:`rgba(245,158,11,.15)`, c:'#fbbf24', bd:'rgba(245,158,11,.3)' },
    default:   { label:'📝 Brouillon',  bg:`rgba(100,116,139,.15)`,c:'#94a3b8', bd:'rgba(100,116,139,.3)' },
  };

  const rv = (key, delay = 0) => ({
    opacity: visible[key] ? 1 : 0,
    transform: visible[key] ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity .65s ${delay}s ease, transform .65s ${delay}s cubic-bezier(.22,1,.36,1)`,
  });

  /* ── LOADING ── */
  if (loading) return (
    <div style={{ minHeight:'100vh', background: isDark?'#060d1f':'#fff', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ position:'relative', width:64, height:64, margin:'0 auto 18px' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid transparent', borderTopColor:C.red, borderRightColor:C.blue, animation:'ldSpin .85s linear infinite' }}/>
            <div style={{ position:'absolute', inset:10, borderRadius:'50%', background:C.neuBg, boxShadow:neu(), display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.red, animation:'ldPulse 1s ease-in-out infinite' }}/>
            </div>
          </div>
          <p style={{ color:C.tm, fontSize:10, letterSpacing:'.35em', textTransform:'uppercase' }}>Chargement…</p>
        </div>
      </div>
      <style>{`@keyframes ldSpin{to{transform:rotate(360deg)}}@keyframes ldPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}`}</style>
    </div>
  );

  /* ── ERROR ── */
  if (error || !event) return (
    <div style={{ minHeight:'100vh', background: isDark?'#060d1f':'#fff' }}>
      <Navbar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ width:68, height:68, margin:'0 auto 16px', borderRadius:20, background:C.neuBg, boxShadow:neu(), display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="28" height="28" fill="none" stroke={C.red} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h2 style={{ color:C.tp, fontSize:20, fontWeight:800, marginBottom:8 }}>{error||'Événement non trouvé'}</h2>
          <p style={{ color:C.tm, fontSize:14, marginBottom:24 }}>Désolé, nous ne pouvons pas trouver cet événement.</p>
          <button onClick={()=>navigate(-1)} style={{ padding:'11px 30px', background:C.red, color:'#fff', border:'none', borderRadius:50, fontWeight:800, fontSize:12, cursor:'pointer', letterSpacing:'.1em', boxShadow:`0 6px 24px ${C.red}50` }}>← Retour</button>
        </div>
      </div>
    </div>
  );

  const recapImgs   = Array.isArray(event.recap_images) ? event.recap_images : [];
  const evDate      = new Date(event.event_date);
  const isCompleted = event.status === 'completed';
  const bannerUrl   = event.banner_url || getImg(event.banner_image);
  const sc          = statusMap[event.status] || statusMap.default;

  return (
    <div style={{ minHeight:'100vh', fontFamily:'system-ui,-apple-system,sans-serif', background:C.pageBg }}>
      <Navbar />

      {/* ── Translate FAB ── */}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
        {translateOpen && LANGUAGES.map(lang => {
          const active = currentLang === lang.code;
          return (
            <button key={lang.code} onClick={()=>translateTo(lang.code)} style={{
              display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:50,
              fontSize:13, fontWeight:700, cursor:'pointer',
              background: active ? C.red : C.neuBg,
              color: active ? '#fff' : C.tp,
              border: 'none',
              boxShadow: active ? `0 4px 20px ${C.red}50` : neu(),
              transition:'all .2s',
            }}>
              <span translate="no">{lang.flag}</span>
              <span translate="no" className="notranslate">{lang.name}</span>
              <span translate="no" className="notranslate" style={{ fontSize:10, opacity:.55 }}>{lang.label}</span>
            </button>
          );
        })}
        <button onClick={()=>setTranslateOpen(!translateOpen)} style={{
          display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:50,
          fontSize:13, fontWeight:700, cursor:'pointer', border:'none',
          background: translateOpen ? C.blue : C.neuBg,
          color: translateOpen ? '#fff' : C.tp,
          boxShadow: translateOpen ? `0 0 28px ${C.blue}55` : neu(),
          transition:'all .3s cubic-bezier(.34,1.56,.64,1)',
        }}>
          <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
          <span translate="no" className="notranslate">{activeLang.label}</span>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform:translateOpen?'rotate(180deg)':'none', transition:'transform .3s' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          H E R O  — Netflix style, image plein écran
      ══════════════════════════════════════════════ */}
      <div style={{ position:'relative', height:'100vh', overflow:'hidden', display:'flex', alignItems:'flex-end' }}>

        {/* Image plein écran */}
        {bannerUrl ? (
          <img src={bannerUrl} alt={event.title} style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover',
            transform:`scale(1.05) translateY(${scrollY * 0.18}px)`,
            transition:'transform .1s linear',
          }}/>
        ) : (
          /* Fallback si pas d'image */
          <div style={{
            position:'absolute', inset:0,
            background: isDark
              ? 'linear-gradient(135deg, #060d1f 0%, #0f1e3d 50%, #1a2a5a 100%)'
              : 'linear-gradient(135deg, #1a3cb4 0%, #0f2080 100%)',
          }}/>
        )}

        {/* Overlay Netflix : dégradé sombre en bas + côtés */}
        <div style={{
          position:'absolute', inset:0,
          background: isDark
            ? 'linear-gradient(to top, #060d1f 0%, rgba(6,13,31,.85) 30%, rgba(6,13,31,.4) 60%, rgba(6,13,31,.15) 100%)'
            : 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,.82) 30%, rgba(255,255,255,.3) 65%, rgba(255,255,255,.05) 100%)',
        }}/>
        <div style={{ position:'absolute', inset:0, background: isDark ? 'linear-gradient(to right, rgba(6,13,31,.7) 0%, transparent 50%, rgba(6,13,31,.3) 100%)' : 'linear-gradient(to right, rgba(255,255,255,.5) 0%, transparent 60%)' }}/>

        {/* Bouton Retour — en haut à gauche */}
        <button onClick={()=>navigate(-1)}
          style={{
            position:'absolute', top:90, left:36,
            display:'inline-flex', alignItems:'center', gap:9,
            padding:'10px 22px 10px 14px', borderRadius:50, border:'none',
            background: isDark ? 'rgba(11,23,48,0.75)' : 'rgba(255,255,255,0.82)',
            color: C.blue, fontSize:11, fontWeight:800, letterSpacing:'.14em',
            textTransform:'uppercase', cursor:'pointer',
            boxShadow: isDark ? `4px 4px 14px rgba(0,0,0,.6), -2px -2px 8px rgba(20,50,100,.3)` : `4px 4px 12px #c8d4ee, -2px -2px 8px #ffffff`,
            backdropFilter:'blur(16px)',
            animation:'nvLeft .55s cubic-bezier(.34,1.56,.64,1) both',
            transition:'all .3s',
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='scale(1.05) translateX(-2px)'; e.currentTarget.style.boxShadow=`0 6px 26px ${C.blue}50`; }}
          onMouseLeave={e=>{ e.currentTarget.style.background=isDark?'rgba(11,23,48,0.75)':'rgba(255,255,255,0.82)'; e.currentTarget.style.color=C.blue; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=isDark?`4px 4px 14px rgba(0,0,0,.6), -2px -2px 8px rgba(20,50,100,.3)`:`4px 4px 12px #c8d4ee, -2px -2px 8px #ffffff`; }}
        >
          <div style={{ width:26, height:26, borderRadius:'50%', background: isDark?'rgba(30,144,255,0.15)':'rgba(26,60,180,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
          </div>
          Retour
        </button>

        {/* Contenu hero — en bas à gauche comme Netflix */}
        <div style={{ position:'relative', zIndex:10, padding:'0 48px 60px', maxWidth:760, animation:'nvUp .8s .1s both' }}>

          {/* Tags */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
            {event.category && (
              <span style={{ padding:'6px 18px', background:C.red, color:'#fff', borderRadius:6, fontSize:11, fontWeight:900, letterSpacing:'.2em', textTransform:'uppercase', boxShadow:`0 4px 20px ${C.red}60` }}>
                {event.category}
              </span>
            )}
            <span style={{ padding:'6px 16px', background:sc.bg, color:sc.c, border:`1px solid ${sc.bd}`, borderRadius:6, fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' }}>
              {sc.label}
            </span>
          </div>

          {/* Titre — grand */}
          <h1 style={{
            fontSize:'clamp(38px, 6.5vw, 80px)', fontWeight:900,
            lineHeight:1.02, letterSpacing:'-.04em',
            color: isDark ? '#ffffff' : '#07102a',
            marginBottom:22,
            textShadow: isDark ? '0 2px 30px rgba(0,0,0,.8), 0 0 60px rgba(30,144,255,.2)' : '0 2px 20px rgba(0,0,0,.15)',
          }}>
            {event.title}
          </h1>

          {/* Separator luxe */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            <div style={{ width:52, height:3, borderRadius:2, background:`linear-gradient(90deg, ${C.red}, ${C.blue})` }}/>
            <div style={{ width:8, height:8, borderRadius:'50%', background:C.red, boxShadow:`0 0 10px ${C.red}` }}/>
            <div style={{ width:28, height:2, borderRadius:2, background:`linear-gradient(90deg, ${C.blue}, transparent)`, opacity:.6 }}/>
          </div>

          {/* Date + Lieu inline */}
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:34, height:34, borderRadius:10, background: isDark?'rgba(11,23,48,0.75)':'rgba(255,255,255,0.82)', boxShadow:neu(), display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
                <svg width="14" height="14" fill="none" stroke={C.red} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <p style={{ color: isDark?'rgba(255,255,255,.5)':C.tm, fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', marginBottom:2 }}>Date</p>
                <p style={{ color: isDark?'#fff':C.tp, fontSize:13, fontWeight:700, lineHeight:1.3 }}>
                  {evDate.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}
                </p>
              </div>
            </div>

            <div style={{ width:1, height:36, background: isDark?'rgba(255,255,255,.15)':C.div }}/>

            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:34, height:34, borderRadius:10, background: isDark?'rgba(11,23,48,0.75)':'rgba(255,255,255,0.82)', boxShadow:neu(), display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
                <svg width="14" height="14" fill="none" stroke={C.blue} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <p style={{ color: isDark?'rgba(255,255,255,.5)':C.tm, fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', marginBottom:2 }}>Heure</p>
                <p style={{ color:C.red, fontSize:20, fontWeight:900, letterSpacing:'-.02em' }}>
                  {evDate.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                </p>
              </div>
            </div>

            {event.location && <>
              <div style={{ width:1, height:36, background: isDark?'rgba(255,255,255,.15)':C.div }}/>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:34, height:34, borderRadius:10, background: isDark?'rgba(11,23,48,0.75)':'rgba(255,255,255,0.82)', boxShadow:neu(), display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
                  <svg width="14" height="14" fill="none" stroke={C.cyan} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <p style={{ color: isDark?'rgba(255,255,255,.5)':C.tm, fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', marginBottom:2 }}>Lieu</p>
                  <p style={{ color: isDark?'#fff':C.tp, fontSize:13, fontWeight:700 }}>{event.location}</p>
                </div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          M A I N  C O N T E N T  — Neumorphism
      ══════════════════════════════════════════════ */}
      <div style={{ background:C.secBg, padding:'56px 32px 80px', position:'relative' }}>
        {/* Top accent */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${C.blue}, ${C.red}, ${C.blue}, transparent)`, opacity:.6 }}/>

        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <div className="ev-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}>

            {/* ── LEFT ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:20, minWidth:0, overflow:'hidden' }}>

              {/* Description */}
              <div ref={el=>refs.current.desc=el} data-sec="desc"
                style={{ ...rv('desc',0), background:C.neuBg, borderRadius:22, padding:'30px 32px', boxShadow:neu(), position:'relative', overflow:'hidden', border:'none', transition:'box-shadow .3s' }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow=`8px 8px 22px ${C.neuShadowD}, -5px -5px 16px ${C.neuShadowL}, inset 0 0 0 1.5px ${C.blue}30`}
                onMouseLeave={e=>e.currentTarget.style.boxShadow=neu()}
              >
                <div style={{ position:'absolute', top:0, left:0, width:5, height:'100%', background:`linear-gradient(180deg, ${C.red}, ${C.blue})`, borderRadius:'22px 0 0 22px' }}/>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                  <div style={{ width:42, height:42, borderRadius:13, background:C.neuBg, boxShadow:neu(false), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="19" height="19" fill="none" stroke={C.red} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h2 style={{ color:C.tp, fontSize:19, fontWeight:900, letterSpacing:'-.02em' }}>À propos de l'événement</h2>
                </div>
                <p style={{ color:C.ts, fontSize:15, lineHeight:1.85, paddingLeft:4, wordBreak:'break-word', overflowWrap:'break-word', whiteSpace:'pre-wrap' }}>
                  {event.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Recap */}
              {isCompleted && event.recap_description && (
                <div ref={el=>refs.current.recap=el} data-sec="recap"
                  style={{ ...rv('recap',.06), background:C.neuBg, borderRadius:22, padding:'30px 32px', boxShadow:neu(), position:'relative', overflow:'hidden', border:'none', transition:'box-shadow .3s' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow=`8px 8px 22px ${C.neuShadowD}, -5px -5px 16px ${C.neuShadowL}, inset 0 0 0 1.5px ${C.blue}30`}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow=neu()}
                >
                  <div style={{ position:'absolute', top:0, left:0, width:5, height:'100%', background:`linear-gradient(180deg, ${C.blue}, ${C.cyan})`, borderRadius:'22px 0 0 22px' }}/>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                    <div style={{ width:42, height:42, borderRadius:13, background:C.neuBg, boxShadow:neu(false), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="19" height="19" fill="none" stroke={C.blue} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h2 style={{ color:C.tp, fontSize:19, fontWeight:900, letterSpacing:'-.02em' }}>Récapitulatif</h2>
                  </div>
                  <p style={{ color:C.ts, fontSize:15, lineHeight:1.85, whiteSpace:'pre-wrap', paddingLeft:4, wordBreak:'break-word', overflowWrap:'break-word' }}>{event.recap_description}</p>
                </div>
              )}

              {/* Gallery */}
              {recapImgs.length > 0 && (
                <div ref={el=>refs.current.gal=el} data-sec="gal"
                  style={{ ...rv('gal',.1), background:C.neuBg, borderRadius:22, padding:'30px 32px', boxShadow:neu(), position:'relative', overflow:'hidden', border:'none', transition:'box-shadow .3s' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow=`8px 8px 22px ${C.neuShadowD}, -5px -5px 16px ${C.neuShadowL}, inset 0 0 0 1.5px ${C.blue}30`}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow=neu()}
                >
                  <div style={{ position:'absolute', top:0, left:0, width:5, height:'100%', background:`linear-gradient(180deg, ${C.red}, ${C.blue}, ${C.cyan})`, borderRadius:'22px 0 0 22px' }}/>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
                    <div style={{ width:42, height:42, borderRadius:13, background:C.neuBg, boxShadow:neu(false), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="19" height="19" fill="none" stroke={C.cyan} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <h2 style={{ color:C.tp, fontSize:19, fontWeight:900, letterSpacing:'-.02em' }}>Galerie</h2>
                    <span style={{ marginLeft:'auto', padding:'5px 14px', background:C.neuBg, boxShadow:neu(false), color:C.red, borderRadius:50, fontSize:11, fontWeight:700 }}>
                      {recapImgs.length} photo{recapImgs.length>1?'s':''}
                    </span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12 }}>
                    {recapImgs.map((img, i) => (
                      <div key={i} onClick={()=>openLB(img,i)}
                        style={{ position:'relative', borderRadius:14, overflow:'hidden', cursor:'pointer', aspectRatio:'4/3', boxShadow:neu(), transition:'all .4s cubic-bezier(.34,1.56,.64,1)', animation:`gfIn .5s ${.04*i}s both` }}
                        onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.05) translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${C.blue}40`; e.currentTarget.querySelector('.gov').style.opacity='1'; e.currentTarget.querySelector('img').style.transform='scale(1.1)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=neu(); e.currentTarget.querySelector('.gov').style.opacity='0'; e.currentTarget.querySelector('img').style.transform='scale(1)'; }}
                      >
                        <img src={getImg(img)} alt={`${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s' }}/>
                        <div className="gov" style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, ${C.blue}cc, ${C.red}aa)`, opacity:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity .3s' }}>
                          <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,.18)', backdropFilter:'blur(8px)', border:'1.5px solid rgba(255,255,255,.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
                          </div>
                        </div>
                        <div style={{ position:'absolute', bottom:7, right:7, padding:'3px 9px', borderRadius:50, background:'rgba(0,0,0,.65)', backdropFilter:'blur(8px)', color:C.cyan, fontSize:10, fontWeight:800 }}>
                          {i+1}/{recapImgs.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div style={{ position:'sticky', top:90 }}>
              <div ref={el=>refs.current.side=el} data-sec="side"
                style={{ ...rv('side',.15), background:C.neuBg, borderRadius:22, overflow:'hidden', boxShadow:neu() }}
              >
                {/* Header sidebar */}
                <div style={{ padding:'18px 22px 14px', background: isDark?`linear-gradient(135deg, rgba(30,144,255,.12), rgba(230,57,70,.08))`:`linear-gradient(135deg, rgba(26,60,180,.07), rgba(192,57,43,.05))`, borderBottom:`1px solid ${C.div}`, display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:C.red, boxShadow:`0 0 8px ${C.red}`, animation:'sdPulse 2s infinite' }}/>
                  <span style={{ fontSize:10, fontWeight:900, letterSpacing:'.28em', textTransform:'uppercase', color:C.tl }}>Informations</span>
                </div>

                <div style={{ padding:'14px 18px', display:'flex', flexDirection:'column', gap:10 }}>

                  {/* Status */}
                  <div style={{ background:C.neuBg, borderRadius:13, padding:'13px 15px', boxShadow:neu(false) }}>
                    <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:C.tl, marginBottom:8 }}>Statut</p>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px', borderRadius:8, background:sc.bg, color:sc.c, border:`1px solid ${sc.bd}`, fontSize:11, fontWeight:700 }}>{sc.label}</span>
                  </div>

                  {event.created_at && (
                    <div style={{ background:C.neuBg, borderRadius:13, padding:'13px 15px', boxShadow:neu(false) }}>
                      <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:C.tl, marginBottom:6 }}>Créé le</p>
                      <p style={{ color:C.tp, fontSize:13, fontWeight:700 }}>{new Date(event.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</p>
                    </div>
                  )}

                  {event.completed_at && (
                    <div style={{ background:C.neuBg, borderRadius:13, padding:'13px 15px', boxShadow:neu(false) }}>
                      <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:C.tl, marginBottom:6 }}>Terminé le</p>
                      <p style={{ color:C.tp, fontSize:13, fontWeight:700 }}>{new Date(event.completed_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</p>
                    </div>
                  )}

                  {event.category && (
                    <div style={{ background:C.neuBg, borderRadius:13, padding:'13px 15px', boxShadow:neu(false) }}>
                      <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:C.tl, marginBottom:6 }}>Catégorie</p>
                      <span style={{ display:'inline-block', padding:'5px 14px', background:C.neuBg, boxShadow:neu(false), color:C.red, borderRadius:8, fontSize:12, fontWeight:800 }}>{event.category}</span>
                    </div>
                  )}
                </div>

                {/* Mini gallery */}
                {recapImgs.length > 0 && (
                  <div style={{ padding:'0 18px 18px', borderTop:`1px solid ${C.div}`, paddingTop:14 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:11 }}>
                      <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:C.tl }}>Photos</span>
                      <span style={{ fontSize:11, fontWeight:700, color:C.blue }}>{recapImgs.length} total</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
                      {recapImgs.slice(0,8).map((img, i) => (
                        <div key={i} onClick={()=>openLB(img,i)}
                          style={{ aspectRatio:'1', borderRadius:9, overflow:'hidden', cursor:'pointer', boxShadow:neu(), transition:'all .25s', position:'relative' }}
                          onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow=`0 6px 18px ${C.red}45`; }}
                          onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=neu(); }}
                        >
                          <img src={getImg(img)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          {i===7 && recapImgs.length>8 && (
                            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:800 }}>+{recapImgs.length-8}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {selectedImage && (()=>{
        const prev=()=>{ const i=(selectedIdx-1+recapImgs.length)%recapImgs.length; openLB(recapImgs[i],i); };
        const next=()=>{ const i=(selectedIdx+1)%recapImgs.length; openLB(recapImgs[i],i); };
        return (
          <div onClick={()=>setSelectedImage(null)} style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,.97)', backdropFilter:'blur(28px)', display:'flex', alignItems:'center', justifyContent:'center', padding:28, animation:'lbFade .2s both' }}>
            <button onClick={()=>setSelectedImage(null)} style={{ position:'absolute', top:22, right:22, width:42, height:42, borderRadius:'50%', background:C.neuBg, boxShadow:neu(), border:'none', color:C.tp, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', zIndex:1 }}
              onMouseEnter={e=>{ e.currentTarget.style.background=C.red; e.currentTarget.style.color='#fff'; e.currentTarget.style.boxShadow=`0 4px 18px ${C.red}50`; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=C.neuBg; e.currentTarget.style.color=C.tp; e.currentTarget.style.boxShadow=neu(); }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            {recapImgs.length>1 && (
              <button onClick={e=>{e.stopPropagation();prev();}} style={{ position:'absolute', left:22, top:'50%', transform:'translateY(-50%)', width:46, height:46, borderRadius:'50%', background:C.neuBg, boxShadow:neu(), border:'none', color:C.tp, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.neuBg; e.currentTarget.style.color=C.tp; }}>
                <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
              </button>
            )}
            <div onClick={e=>e.stopPropagation()} style={{ maxWidth:'86vw', maxHeight:'86vh', position:'relative' }}>
              <img src={getImg(selectedImage)} alt="Full" style={{ maxWidth:'100%', maxHeight:'86vh', borderRadius:16, boxShadow:`0 0 80px rgba(0,0,0,.9), 0 0 0 1px ${C.blue}20`, animation:'lbScale .3s cubic-bezier(.34,1.56,.64,1) both' }}/>
              <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', padding:'5px 16px', borderRadius:50, background:C.neuBg, boxShadow:neu(), color:C.cyan, fontSize:11, fontWeight:800 }}>
                {selectedIdx+1} / {recapImgs.length}
              </div>
            </div>
            {recapImgs.length>1 && (
              <button onClick={e=>{e.stopPropagation();next();}} style={{ position:'absolute', right:22, top:'50%', transform:'translateY(-50%)', width:46, height:46, borderRadius:'50%', background:C.neuBg, boxShadow:neu(), border:'none', color:C.tp, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.neuBg; e.currentTarget.style.color=C.tp; }}>
                <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </button>
            )}
          </div>
        );
      })()}

      <Footer/>

      <style>{`
        .notranslate { unicode-bidi: plaintext; }
        @keyframes nvUp   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nvLeft { from{opacity:0;transform:translateX(-26px)} to{opacity:1;transform:translateX(0)} }
        @keyframes gfIn   { from{opacity:0;transform:scale(.86)} to{opacity:1;transform:scale(1)} }
        @keyframes lbFade { from{opacity:0} to{opacity:1} }
        @keyframes lbScale{ from{opacity:0;transform:scale(.82)} to{opacity:1;transform:scale(1)} }
        @keyframes ldSpin { to{transform:rotate(360deg)} }
        @keyframes ldPulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.6)} }
        @keyframes sdPulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @media(max-width:920px){ .ev-grid{ grid-template-columns:1fr !important } }
      `}</style>
    </div>
  );
};

export default EventDetail;