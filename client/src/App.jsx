import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import HabitTracker from './pages/HabitTracker';
import SavingsGoals from './pages/SavingsGoals';
import WealthAnalytics from './pages/WealthAnalytics';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import Budgets from './pages/Budgets';
import Insights from './pages/Insights';
import Debts from './pages/Debts';

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
  );
}
