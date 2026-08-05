import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wf_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchUser();
    window.addEventListener('wf_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('wf_unauthorized', handleUnauthorized);
  }, []);

  const handleUnauthorized = () => {
    localStorage.removeItem('wf_token');
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me', { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    if (res.data.token) localStorage.setItem('wf_token', res.data.token);
    const u = res.data.user;
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password }, { withCredentials: true });
    if (res.data.token) localStorage.setItem('wf_token', res.data.token);
    const u = res.data.user;
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
    }
    localStorage.removeItem('wf_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
