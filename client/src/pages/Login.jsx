import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiTrendingUp, FiTarget, FiPieChart } from 'react-icons/fi';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
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
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Check your connection or the server may be down.');
      } else {
        const data = err.response?.data;
        if (data?.errors) {
          setError(data.errors.map((e) => e.msg).join(', '));
        } else {
          setError(data?.message || 'Login failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-navy-950">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="decor-blob w-80 h-80 bg-primary-500/40 top-10 left-10 animate-float-slow" />
        <div className="decor-blob w-96 h-96 bg-magenta-500/30 bottom-10 right-10 animate-float" />
        <div className="decor-blob w-64 h-64 bg-mint-500/20 top-1/2 left-1/3 animate-float-slow" style={{ animationDelay: '1.2s' }} />
        <div className="text-white max-w-md relative z-10">
          <Logo size={44} textClassName="text-white" className="animate-fade-down" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 mt-6 animate-fade-up">Welcome Back to WealthFlow</h1>
          <p className="text-lg text-primary-200/80 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Build strong financial habits, track your wealth growth, and achieve your financial goals — all in one place.
          </p>
          <div className="mt-8 space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {[
              { text: 'Track expenses intelligently', icon: FiTrendingUp, color: 'text-mint-300' },
              { text: 'Build saving & investing habits', icon: FiTarget, color: 'text-sun-300' },
              { text: 'Monitor your net worth growth', icon: FiPieChart, color: 'text-magenta-300' },
            ].map((t, i) => (
              <div key={i} className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <t.icon size={16} className={t.color} />
                </div>
                <span className="text-primary-100/90">{t.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center space-x-2 text-sm text-primary-200/70 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <FiCheck className="text-mint-400" size={16} />
            <span>Your data is encrypted and private.</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="text-center mb-8">
            <Logo size={48} withText={false} className="mx-auto mb-4 animate-float" />
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Sign in</h2>
            <p className="text-gray-500 dark:text-navy-400 mt-2">Continue your financial journey</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1.5">Email</label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="email" required
                  id="login-email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1.5">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type={showPw ? 'text' : 'password'} required
                  id="login-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 hover:text-gray-600 dark:hover:text-navy-300">
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
            <Link to="/register" className="text-primary-600 dark:text-primary-300 font-semibold hover:text-primary-700 dark:hover:text-primary-200 hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700">
            <p className="text-xs text-gray-500 dark:text-navy-400 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-400 dark:text-navy-500">Admin: admin@wealthflow.com / Admin@123</p>
            <p className="text-xs text-gray-400 dark:text-navy-500">User: ravi@wealthflow.com / User@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
