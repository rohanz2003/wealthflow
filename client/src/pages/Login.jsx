import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiMoon, FiSun } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setError(data.errors.map((e) => e.msg).join(', '));
      } else {
        setError(data?.message || 'Login failed. Make sure the server and MongoDB are running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-navy-950">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-primary-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
        </div>
        <div className="text-white max-w-md relative z-10">
          <div className="text-6xl mb-6">💰</div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back to WealthFlow</h1>
          <p className="text-lg text-primary-200 leading-relaxed">
            Build strong financial habits, track your wealth growth, and achieve your financial goals — all in one place.
          </p>
          <div className="mt-8 space-y-4">
            {['Track expenses intelligently', 'Build saving & investing habits', 'Monitor your net worth growth'].map((t, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">{i + 1}</span>
                </div>
                <span className="text-primary-200">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
              {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">💰</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in</h2>
            <p className="text-gray-500 dark:text-navy-400 mt-2">Continue your financial journey</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={18} />
                <input
                  type="email" required
                  id="login-email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={18} />
                <input
                  type={showPw ? 'text' : 'password'} required
                  id="login-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 hover:text-gray-600 dark:hover:text-navy-300">
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 dark:text-navy-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
              Create one
            </Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
            <p className="text-xs text-gray-500 dark:text-navy-400 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-400 dark:text-navy-500">Admin: admin@wealthflow.com / admin123</p>
            <p className="text-xs text-gray-400 dark:text-navy-500">User: user@wealthflow.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
