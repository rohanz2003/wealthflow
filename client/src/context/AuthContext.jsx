import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setAuthHeader = useCallback((t) => {
    if (t) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  useEffect(() => {
    if (token) {
      setAuthHeader(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me', { withCredentials: true });
      setUser(res.data);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setAuthHeader(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    setToken(t);
    setAuthHeader(t);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password }, { withCredentials: true });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    setToken(t);
    setAuthHeader(t);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
