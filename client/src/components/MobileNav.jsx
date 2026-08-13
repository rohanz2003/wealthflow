import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiDollarSign, FiCheckCircle, FiTarget, FiTrendingUp, FiShield, FiSettings, FiPieChart, FiBarChart2, FiTrendingDown } from 'react-icons/fi';

export default function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();

  const items = [
    { to: '/expenses', label: 'Expenses', icon: FiDollarSign },
    { to: '/budgets', label: 'Budgets', icon: FiPieChart },
    { to: '/habits', label: 'Habits', icon: FiCheckCircle },
    { to: '/savings', label: 'Savings', icon: FiTarget },
    { to: '/dashboard', label: 'Home', icon: FiHome, big: true },
    { to: '/debts', label: 'Debts', icon: FiTrendingDown },
    { to: '/wealth', label: 'Wealth', icon: FiTrendingUp },
    { to: '/insights', label: 'Insights', icon: FiBarChart2 },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ];

  if (user?.role === 'admin') {
    items.push({ to: '/admin', label: 'Admin', icon: FiShield });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-navy-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {items.map((l) =>
          l.big ? (
            <Link
              key={l.to}
              to={l.to}
              className="flex-1 min-w-0 flex flex-col items-center justify-end pb-1.5"
              aria-label={l.label}
            >
              <div
                className={`-mt-6 mb-1 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive(l.to)
                    ? 'bg-primary-600 dark:bg-primary-500 scale-105 shadow-glow'
                    : 'gradient-primary shadow-glow hover:scale-105'
                } text-white border-4 border-white dark:border-navy-950`}
              >
                <l.icon size={22} />
              </div>
              <span className={`text-[9px] font-medium ${isActive(l.to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-navy-400'}`}>{l.label}</span>
            </Link>
          ) : (
            <Link
              key={l.to}
              to={l.to}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                isActive(l.to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-navy-400'
              }`}
              aria-label={l.label}
            >
              <l.icon size={17} className={isActive(l.to) ? 'scale-110' : ''} />
              <span className="text-[9px] font-medium truncate max-w-full">{l.label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}