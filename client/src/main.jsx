import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true;

export const TOKEN_KEY = 'wf_access_token';
export const REFRESH_KEY = 'wf_refresh_token';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    const isAuthUrl = url.includes('/auth/login') || url.includes('/auth/register');
    const isRefreshUrl = url.includes('/auth/refresh');

    if (status === 401 && !isAuthUrl && !isRefreshUrl && !err.config?._retried) {
      const original = err.config;
      original._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              '/api/auth/refresh',
              { refreshToken: localStorage.getItem(REFRESH_KEY) || undefined },
              { withCredentials: true }
            )
            .finally(() => {
              refreshPromise = null;
            });
        }
        const refreshed = await refreshPromise;
        if (refreshed.data?.token) {
          localStorage.setItem(TOKEN_KEY, refreshed.data.token);
          if (refreshed.data?.refreshToken) localStorage.setItem(REFRESH_KEY, refreshed.data.refreshToken);
          original.headers.Authorization = `Bearer ${refreshed.data.token}`;
        }
        return axios(original);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        window.dispatchEvent(new Event('wf_unauthorized'));
        return Promise.reject(err);
      }
    }

    if (status === 401 && !isAuthUrl) {
      window.dispatchEvent(new Event('wf_unauthorized'));
    }
    return Promise.reject(err);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
