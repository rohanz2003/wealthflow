import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import RevealObserver from './components/RevealObserver';
import Logo from './components/Logo';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import {
  FiHome, FiDollarSign, FiPieChart, FiCheckCircle, FiTarget, FiTrendingDown, FiTrendingUp, FiBarChart2, FiShield, FiSettings,
} from 'react-icons/fi';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExpenseTracker = lazy(() => import('./pages/ExpenseTracker'));
const HabitTracker = lazy(() => import('./pages/HabitTracker'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals'));
const WealthAnalytics = lazy(() => import('./pages/WealthAnalytics'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Settings = lazy(() => import('./pages/Settings'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Insights = lazy(() => import('./pages/Insights'));
const Debts = lazy(() => import('./pages/Debts'));

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Logo size={44} withText={false} className="animate-pulse-soft" />
      <div className="w-8 h-8 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin" />
    </div>
  );
}

function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { to: '/dashboard', label: 'Home', icon: FiHome },
    { to: '/expenses', label: 'Expenses', icon: FiDollarSign },
    { to: '/budgets', label: 'Budget', icon: FiPieChart },
    { to: '/habits', label: 'Habits', icon: FiCheckCircle },
    { to: '/savings', label: 'Savings', icon: FiTarget },
    { to: '/debts', label: 'Debts', icon: FiTrendingDown },
    { to: '/wealth', label: 'Wealth', icon: FiTrendingUp },
    { to: '/insights', label: 'Insights', icon: FiBarChart2 },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ];
  if (user?.role === 'admin') {
    tabs.splice(8, 0, { to: '/admin', label: 'Admin', icon: FiShield });
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-navy-800">
      <div className="flex overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const active = location.pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-col items-center justify-center min-w-[64px] flex-1 px-2 py-2 transition-colors duration-200 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-navy-400'}`}
              title={t.label}
            >
              <span className={`relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
                <t.icon size={19} />
              </span>
              <span className={`text-[10px] font-medium mt-0.5 whitespace-nowrap ${active ? 'font-semibold' : ''}`}>{t.label}</span>
              {active && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AppFooter() {
  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-gray-100 dark:border-navy-800 py-6 pb-24 md:pb-6">
      <div className="container-responsive">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center">
            <Logo size={28} withText={false} />
            <span className="ml-2 text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
              Wealth<span className="text-gradient">Flow</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-navy-400">
            &copy; {new Date().getFullYear()} WealthFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main key={location.pathname} className="page-container animate-page-in pb-24 md:pb-6 flex-1">
        {children}
      </main>
      <AppFooter />
      <MobileNav />
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <RevealObserver />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><AppLayout><ExpenseTracker /></AppLayout></PrivateRoute>} />
        <Route path="/habits" element={<PrivateRoute><AppLayout><HabitTracker /></AppLayout></PrivateRoute>} />
        <Route path="/savings" element={<PrivateRoute><AppLayout><SavingsGoals /></AppLayout></PrivateRoute>} />
        <Route path="/wealth" element={<PrivateRoute><AppLayout><WealthAnalytics /></AppLayout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AppLayout><AdminPanel /></AppLayout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><AppLayout><Settings /></AppLayout></PrivateRoute>} />
        <Route path="/budgets" element={<PrivateRoute><AppLayout><Budgets /></AppLayout></PrivateRoute>} />
        <Route path="/insights" element={<PrivateRoute><AppLayout><Insights /></AppLayout></PrivateRoute>} />
        <Route path="/debts" element={<PrivateRoute><AppLayout><Debts /></AppLayout></PrivateRoute>} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
      </Routes>
    </Suspense>
  );
}
