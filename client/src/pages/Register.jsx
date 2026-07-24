import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiMail, FiLock, FiMoon, FiSun, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

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
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

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
  const allMet = requirements.every((r) => r.test(form.password));
  const passwordsMatch = form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="text-white max-w-md relative z-10">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-4xl font-bold mb-4">Start Your Financial Journey</h1>
          <p className="text-lg text-emerald-200 leading-relaxed">
            Join thousands of users who are building better financial habits and growing their wealth every day.
          </p>
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-500 dark:text-navy-400 mt-2">Start building your financial future</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={18} />
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={18} />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={18} />
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10 pr-12" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500 hover:text-gray-600 dark:hover:text-navy-300">
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden flex">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 transition-colors duration-300 ${i <= strength ? strengthColors[strength - 1] || '' : ''} ${i > 0 ? 'ml-0.5' : ''}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${strength >= 3 ? 'text-green-600 dark:text-green-400' : strength >= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {strengthLabels[strength - 1] || 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {requirements.map((r, i) => {
                      const met = r.test(form.password);
                      return (
                        <div key={i} className={`flex items-center text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-navy-500'}`}>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={18} />
                <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field pl-10" placeholder="Confirm your password" />
              </div>
              {form.confirmPassword && (
                <p className={`mt-1 text-xs ${passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
