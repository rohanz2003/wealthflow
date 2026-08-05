import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiHome, FiDollarSign, FiCheckCircle, FiTarget, FiTrendingUp, FiLogOut, FiMenu, FiX, FiShield, FiMoon, FiSun, FiSettings, FiPieChart, FiBarChart2, FiTrendingDown } from 'react-icons/fi';
import { useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-navy-950/85 backdrop-blur-xl border-b border-gray-100 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center group">
              <Logo size={32} withText={false} />
              <span className="ml-2 text-base sm:text-lg font-extrabold tracking-tight text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                Wealth<span className="text-gradient">Flow</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-0.5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`relative flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(l.to)
                    ? 'bg-primary-50 dark:bg-navy-700 text-primary-700 dark:text-primary-300 shadow-sm scale-[1.02]'
                    : 'text-gray-600 dark:text-navy-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-navy-800 hover:scale-[1.03]'
                }`}
              >
                <l.icon className={`mr-1.5 transition-transform duration-300 ${isActive(l.to) ? 'scale-110' : ''}`} size={18} />
                {l.label}
              </Link>
            ))}
            <button
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="ml-1 p-2 rounded-xl text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-all duration-300 hover:rotate-12"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="ml-2 pl-3 border-l border-gray-100 dark:border-navy-700 flex items-center space-x-2">
              <Link to="/settings" className="flex items-center space-x-2 hover:opacity-90 transition-opacity group">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-glow">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-navy-400 capitalize">{user?.role}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="p-2 text-gray-400 dark:text-navy-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110"
                title="Logout"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-1">
            <Link to="/settings" className="p-2 rounded-lg text-gray-500 dark:text-navy-300">
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
            <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="p-2 rounded-lg text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} className="p-2 text-gray-600 dark:text-navy-300">
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-navy-800 bg-white dark:bg-navy-950 shadow-elevated animate-fade-down origin-top">
          <div className="px-3 py-2 space-y-0.5">
            {links.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-up ${
                  isActive(l.to)
                    ? 'bg-primary-50 dark:bg-navy-700 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <l.icon className="mr-3" size={18} />
                {l.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 dark:border-navy-700 my-1 pt-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <FiLogOut className="mr-3" size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
