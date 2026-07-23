import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiTrendingUp, FiTarget, FiDollarSign, FiPieChart, FiCheckCircle, FiMenu, FiX, FiMoon, FiSun, FiArrowRight, FiShield, FiBarChart2, FiStar } from 'react-icons/fi';
import { useState } from 'react';

const features = [
  { icon: FiDollarSign, title: 'Track Income & Expenses', desc: 'Log every transaction with category tagging. See exactly where your money goes with visual breakdowns.' },
  { icon: FiCheckCircle, title: 'Build Financial Habits', desc: 'Set daily/weekly saving, budgeting, and investing habits. Build streaks and earn consistency rewards.' },
  { icon: FiTarget, title: 'Savings Goals', desc: 'Set targets for emergencies, vacations, retirement. Track progress with beautiful progress bars.' },
  { icon: FiBarChart2, title: 'Investment Portfolio', desc: 'Monitor stocks, mutual funds, crypto, and more. See your portfolio allocation at a glance.' },
  { icon: FiPieChart, title: 'Wealth Analytics', desc: 'Comprehensive charts showing net worth trends, monthly comparisons, and savings rates.' },
  { icon: FiShield, title: 'Secure & Private', desc: 'Your financial data is encrypted and private. JWT-secured API with role-based access control.' },
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Transactions Tracked' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Access Your Data' },
];

export default function Landing() {
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-gray-100 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">WealthFlow</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm text-gray-600 dark:text-navy-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
              <a href="#stats" className="text-sm text-gray-600 dark:text-navy-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Stats</a>
              <a href="#cta" className="text-sm text-gray-600 dark:text-navy-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Get Started</a>
              <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-navy-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
            </div>

            <div className="flex items-center space-x-2 md:hidden">
              <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800">
                {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600 dark:text-navy-300">
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-navy-800 bg-white dark:bg-navy-900">
            <div className="px-4 py-3 space-y-2">
              <a href="#features" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800">Features</a>
              <a href="#stats" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800">Stats</a>
              <a href="#cta" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800">Get Started</a>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-navy-200">Sign in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 text-center">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5 dark:opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-50 dark:bg-navy-800 text-primary-700 dark:text-primary-300 mb-6 border border-primary-200 dark:border-navy-600">
              <FiStar className="mr-1.5" size={14} /> Your Personal Finance Command Center
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Take Control of Your
              <span className="text-primary-600 dark:text-primary-400"> Financial Future</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-navy-300 max-w-2xl mx-auto leading-relaxed">
              Track expenses, build saving habits, set goals, and monitor your investments — all in one beautiful dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-500/25">
                Start Free <FiArrowRight className="ml-2" size={18} />
              </Link>
              <a href="#features" className="btn-outline text-base px-8 py-3">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-navy-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Everything you need to manage your money
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-navy-300 max-w-2xl mx-auto">
              From tracking daily expenses to growing long-term wealth — WealthFlow has you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card p-8 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-navy-800 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-5">
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-navy-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 bg-gray-50 dark:bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card p-12 card-hover">
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to transform your finances?
            </h2>
            <p className="text-lg text-gray-600 dark:text-navy-300 mb-8 max-w-xl mx-auto">
              Join thousands of users who have taken control of their financial future. Start your journey today.
            </p>
            <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-500/25">
              Create Free Account <FiArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-navy-950 border-t border-gray-100 dark:border-navy-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl">💰</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">WealthFlow</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-navy-400">
              &copy; {new Date().getFullYear()} WealthFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
