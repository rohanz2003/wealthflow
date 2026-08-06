import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiMail, FiLock, FiMoon, FiSun, FiEye, FiEyeOff, FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';
import Logo from '../components/Logo';

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-sun-500', 'bg-mint-600', 'bg-mint-500'];

const requirements = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'Uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Number', test: (pw) => /[0-9]/.test(pw) },
];

export default function Register() {
  const { register } = useAuth();
  const { dark, toggle } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const passwordsMatch = form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const failed = requirements.find((r) => !r.test(form.password));
    if (failed) {
      setError(`Password must contain ${failed.label.toLowerCase()}`);
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setError(data.errors.map((e) => e.msg).join(', '));
      } else {
        setError(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-navy-950">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="decor-blob w-80 h-80 bg-mint-500/30 top-10 left-10 animate-float-slow" />
        <div className="decor-blob w-96 h-96 bg-primary-500/40 bottom-10 right-10 animate-float" />
        <div className="decor-blob w-64 h-64 bg-magenta-500/25 top-1/2 left-1/3 animate-float-slow" style={{ animationDelay: '1.2s' }} />
        <div className="text-white max-w-md relative z-10">
          <Logo size={44} textClassName="text-white" className="animate-fade-down" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 mt-6 animate-fade-up">Start Your Financial Journey</h1>
          <p className="text-lg text-primary-200/80 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Join thousands of users who are building better financial habits and growing their wealth every day.
          </p>
          <div className="mt-8 space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {[
              'Free to start — no credit card required',
              'Beautiful analytics from day one',
              'Set budgets, goals and habit streaks',
            ].map((t, i) => (
              <div key={i} className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <FiCheck size={16} className="text-mint-300" />
                </div>
                <span className="text-primary-100/90">{t}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center space-x-2 text-sm text-primary-200/70 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <FiTrendingUp className="text-mint-400" size={16} />
            <span>Your wealth, on track.</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="flex justify-end mb-4">
            <button onClick={toggle} className="p-2 rounded-xl text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-all duration-300 hover:rotate-12">
              {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
          <div className="text-center mb-8">
            <Logo size={48} withText={false} className="mx-auto mb-4 animate-float" />
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-500 dark:text-navy-400 mt-2">Start building your financial future</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1.5">Full Name</label>
              <div className="relative group">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input type="text" required id="register-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-11" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1.5">Email</label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input type="email" required id="register-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-11" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1.5">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input type={showPw ? 'text' : 'password'} required id="register-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-12" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 hover:text-gray-600 dark:hover:text-navy-300">
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-2 animate-fade-up">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden flex">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 transition-all duration-500 ${i <= strength ? strengthColors[strength - 1] || '' : ''} ${i > 0 ? 'ml-0.5' : ''}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${strength >= 3 ? 'text-mint-600 dark:text-mint-400' : strength >= 2 ? 'text-sun-600 dark:text-sun-400' : 'text-red-600 dark:text-red-400'}`}>
                      {strengthLabels[strength - 1] || 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {requirements.map((r, i) => {
                      const met = r.test(form.password);
                      return (
                        <div key={i} className={`flex items-center text-xs transition-colors duration-300 ${met ? 'text-mint-600 dark:text-mint-400' : 'text-gray-400 dark:text-navy-500'}`}>
                          {met ? <FiCheck className="mr-1 shrink-0" size={12} /> : <FiX className="mr-1 shrink-0" size={12} />}
                          {r.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1.5">Confirm Password</label>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input type="password" required id="register-confirm-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field pl-11" placeholder="Confirm your password" />
              </div>
              {form.confirmPassword && (
                <p className={`mt-1 text-xs transition-colors duration-300 ${passwordsMatch ? 'text-mint-600 dark:text-mint-400' : 'text-red-600 dark:text-red-400'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 dark:text-navy-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-300 font-semibold hover:text-primary-700 dark:hover:text-primary-200 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
