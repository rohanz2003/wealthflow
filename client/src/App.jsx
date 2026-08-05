import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import RevealObserver from './components/RevealObserver';
import Logo from './components/Logo';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

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

function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main key={location.pathname} className="page-container animate-page-in">
        {children}
      </main>
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
