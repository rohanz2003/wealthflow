import { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { TOKEN_KEY, REFRESH_KEY } from '../main';
import { setBaseCurrency } from '../utils/formatCurrency';

const AuthContext = createContext(null);

const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchUser();
    }
    window.addEventListener('wf_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('wf_unauthorized', handleUnauthorized);
  }, []);

  const handleUnauthorized = () => {
    clearTokens();
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me', { withCredentials: true });
      setBaseCurrency(res.data.currency);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    const u = res.data.user;
    if (res.data.token) localStorage.setItem(TOKEN_KEY, res.data.token);
    if (res.data.refreshToken) localStorage.setItem(REFRESH_KEY, res.data.refreshToken);
    setBaseCurrency(u.currency);
    setUser(u);
    return u;
  };

  const register = async (name, email, password, currency) => {
    const res = await axios.post('/api/auth/register', { name, email, password, currency }, { withCredentials: true });
    const u = res.data.user;
    if (res.data.token) localStorage.setItem(TOKEN_KEY, res.data.token);
    if (res.data.refreshToken) localStorage.setItem(REFRESH_KEY, res.data.refreshToken);
    setBaseCurrency(u.currency);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
    }
    clearTokens();
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
