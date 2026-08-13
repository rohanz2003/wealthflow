import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiHome, FiDollarSign, FiCheckCircle, FiTarget, FiTrendingUp, FiLogOut, FiShield, FiMoon, FiSun, FiPieChart, FiBarChart2, FiTrendingDown } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/expenses', label: 'Expenses', icon: FiDollarSign },
    { to: '/budgets', label: 'Budgets', icon: FiPieChart },
    { to: '/habits', label: 'Habits', icon: FiCheckCircle },
    { to: '/savings', label: 'Savings', icon: FiTarget },
    { to: '/debts', label: 'Debts', icon: FiTrendingDown },
    { to: '/wealth', label: 'Wealth', icon: FiTrendingUp },
    { to: '/insights', label: 'Insights', icon: FiBarChart2 },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin', icon: FiShield });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
      scrolled ? 'bg-white/95 dark:bg-navy-950/95 shadow-sm' : 'bg-white/85 dark:bg-navy-950/85'
    } border-gray-100 dark:border-navy-800`}>
      <div className="container-responsive">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center min-w-0 gap-2 sm:gap-3">
            <Link to="/dashboard" className="flex items-center group flex-shrink-0" aria-label="WealthFlow Home">
              <Logo size={32} withText={false} aria-hidden="true" />
              <span className="ml-2 text-base sm:text-lg font-extrabold tracking-tight text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors hidden sm:inline">
                Wealth<span className="text-gradient">Flow</span>
              </span>
            </Link>
            <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="btn-icon-only w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-600 dark:text-sun-300 shadow-sm hover:bg-gray-50 dark:hover:bg-navy-700 hover:scale-105 hover:rotate-6 transition-all duration-300 touch-target">
              {dark ? <FiSun size={18} aria-hidden="true" /> : <FiMoon size={18} aria-hidden="true" />}
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`relative flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 touch-target ${
                  isActive(l.to)
                    ? 'bg-primary-50 dark:bg-navy-700 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-navy-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
                aria-current={isActive(l.to) ? 'page' : undefined}
              >
                <l.icon className={`mr-2 transition-transform duration-300 ${isActive(l.to) ? 'scale-110' : ''}`} size={18} aria-hidden="true" />
                <span className="hidden md:inline">{l.label}</span>
              </Link>
            ))}
            <div className="ml-1 pl-3 border-l border-gray-100 dark:border-navy-700 flex items-center space-x-1">
              <Link to="/settings" className="flex items-center space-x-2 hover:opacity-90 transition-opacity group touch-target rounded-xl" aria-label={`Settings for ${user?.name}`}>
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-glow" aria-hidden="true">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-navy-400 capitalize">{user?.role}</p>
                </div>
              </Link>
              <button onClick={handleLogout} aria-label="Sign out" className="btn-icon-only text-gray-400 dark:text-navy-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 touch-target">
                <FiLogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="lg:hidden flex items-center">
            <Link to="/settings" className="p-2 rounded-lg text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors touch-target" aria-label={`Settings for ${user?.name}`}>
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}