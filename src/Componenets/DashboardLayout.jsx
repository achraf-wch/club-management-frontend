// filepath: src/Componenets/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import logo from '../imgs/CluVer.png';

const DashboardLayout = ({ children, title, sidebarItems = [], activePage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/Login/login');
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <aside className={`fixed left-0 top-0 h-full bg-[#06163A] text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CluVersity" className="w-10 h-10 object-contain" />
            {sidebarOpen && <span className="font-bold text-lg">CluVersity</span>}
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === item.path || activePage === item.key
                  ? 'bg-[#c0392b] text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute top-1/2 -right-3 w-6 h-6 bg-[#c0392b] rounded-full flex items-center justify-center text-white shadow-lg">
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'Utilisateur'}</p>
                <p className="text-sm text-gray-500">{user?.email || ''}</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">
                Déconnexion
              </button>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;