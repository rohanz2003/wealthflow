import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiDollarSign, FiCheckCircle, FiTarget, FiTrendingUp, FiSettings, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/expenses', label: 'Expenses', icon: FiDollarSign },
    { to: '/habits', label: 'Habits', icon: FiCheckCircle },
    { to: '/savings', label: 'Savings', icon: FiTarget },
    { to: '/wealth', label: 'Wealth', icon: FiTrendingUp },
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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-gray-900">WealthFlow</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <l.icon className="mr-1.5" size={18} />
                {l.label}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(l.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                }`}
              >
                <l.icon className="mr-2" size={18} />
                {l.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
