import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../imgs/CluVer.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('accueil');
  const [scrolled, setScrolled] = useState(false);
 
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const [darkMode, setDarkMode] = useState(
  document.documentElement.classList.contains("dark")
);

const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.contains("dark");
  if (isDark) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    setDarkMode(false);
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    setDarkMode(true);
  }
  // ✅ Dispatch pour synchroniser MemberDashboard
  window.dispatchEvent(new CustomEvent("themeChanged"));
};

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events`);
        if (!response.ok) return;
        const data = await response.json();
        const events = Array.isArray(data) ? data : [];

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentEvents = events
          .filter(e => new Date(e.created_at) >= oneWeekAgo && e.status === 'approved')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setNotifications(recentEvents);

        const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const unread = recentEvents.filter(e => !readIds.includes(e.id)).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchRecentEvents();
  }, []);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      const ids = notifications.map(n => n.id);
      localStorage.setItem('readNotifications', JSON.stringify(ids));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (eventId) => {
    setShowNotifications(false);
    navigate(`/events/${eventId}`);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveLink('accueil');
    } else if (location.pathname === '/events' || location.pathname.startsWith('/events/')) {
      setActiveLink('events');
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#notification-btn')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAccueil = () => {
    navigate('/');
    setActiveLink('accueil');
  };

  const handleEvents = () => {
    navigate('/events');
    setActiveLink('events');
  };

  const handleLogin = () => {
    navigate('/Login/login');
  };

  return (
    <>
      <style>{`
        @keyframes border-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .notification-border {
          padding: 2px;
          background: linear-gradient(270deg, #C8102E, #1a2c5b, #C8102E, #C8102E);
          background-size: 300% 300%;
          animation: border-rotate 3s ease infinite;
          border-radius: 0.75rem;
        }
        .notification-inner {
          border-radius: 0.65rem;
          overflow: hidden;
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .btn-voir-events {
          background: linear-gradient(135deg, #1a2c5b 0%, #C8102E 50%, #1a2c5b 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          transition: all 0.3s ease;
        }
        .btn-voir-events:hover {
          background-size: 200% auto;
          box-shadow: 0 0 12px rgba(192, 57, 43, 0.5);
          transform: translateY(-1px);
        }
      `}</style>

    <nav className={`fixed w-full z-50 px-8 py-4 top-0 transition-all duration-300 shadow-lg`} style={{backgroundColor: '#06163A'}}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 -my-4">
            <img
              src={logo}
              alt="Logo CluVersity"
              className="h-20 w-auto object-contain cursor-pointer"
              onClick={handleAccueil}
            />
          </div>

          <div className="flex-1"></div>

          {/* Navigation Links et Actions */}
          <div className="flex items-center gap-6">

            {/* Bouton Dark Mode */}
            <button onClick={toggleDarkMode} className="text-white hover:text-[#C8102E] transition flex items-center">
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Liens de navigation */}
            <div className="flex gap-6 text-white text-xs items-center">
              <button
                onClick={handleAccueil}
                className="relative hover:text-gray-300 transition pb-1 bg-transparent border-0 cursor-pointer"
              >
                Accueil
                {activeLink === 'accueil' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{background:'#C8102E'}}></span>
                )}
              </button>
              
              {/* Bouton Events */}
              <button
                onClick={handleEvents}
                className="relative hover:text-gray-300 transition pb-1 bg-transparent border-0 cursor-pointer"
              >
                Events
                {activeLink === 'events' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{background:'#C8102E'}}></span>
                )}
              </button>
            </div>

            {/* Bouton Connexion */}
            <button
              onClick={handleLogin}
              className="text-white font-semibold px-4 py-1.5 rounded-md transition text-xs flex items-center gap-2"
              style={{background:'#C8102E', border:'1.5px solid #C8102E'}}
              onMouseOver={e => e.currentTarget.style.background='#a50d23'}
              onMouseOut={e => e.currentTarget.style.background='#C8102E'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Connexion
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;