import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiHome, FiDollarSign, FiCheckCircle, FiTarget, FiTrendingUp, FiLogOut, FiMenu, FiX, FiShield, FiMoon, FiSun, FiSettings, FiPieChart, FiBarChart2, FiTrendingDown } from 'react-icons/fi';
import { useState } from 'react';

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
  links.push({ to: '/settings', label: 'Settings', icon: FiSettings });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-gray-200 dark:border-navy-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">WealthFlow</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.to)
                    ? 'bg-primary-50 dark:bg-navy-700 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-navy-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
              >
                <l.icon className="mr-1.5" size={18} />
                {l.label}
              </Link>
            ))}
            <button
              onClick={toggle}
              className="ml-2 p-2 rounded-lg text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-navy-700 flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-navy-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 dark:text-navy-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
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
        <div className="md:hidden border-t border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(l.to)
                    ? 'bg-primary-50 dark:bg-navy-700 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-navy-300'
                }`}
              >
                <l.icon className="mr-2" size={18} />
                {l.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FiLogOut className="mr-2" size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
