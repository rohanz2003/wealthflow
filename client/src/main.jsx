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

let refreshPromise = null;

axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    const isAuthUrl = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthUrl && !err.config?._retried) {
      const original = err.config;
      original._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios.post('/api/auth/refresh', {}, { withCredentials: true }).finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        delete original.headers.Authorization;
        return axios(original);
      } catch {
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
