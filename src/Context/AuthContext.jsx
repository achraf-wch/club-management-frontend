import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Au démarrage, récupère l'user depuis localStorage
    const storedUser = localStorage.getItem('person');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('person');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData = { id, first_name, last_name, email, avatar_url, ... }
    setUser(userData);
    localStorage.setItem('person', JSON.stringify(userData));
  };

  const updateUser = (newUserData) => {
    // Merge les nouvelles données avec l'existant
    setUser(prev => {
      const merged = { ...prev, ...newUserData };
      localStorage.setItem('person', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('person');
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};