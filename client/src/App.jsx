import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
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

function AppLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="page-container">{children}</main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400" /></div>}>
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
