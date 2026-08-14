import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiDollarSign, FiTarget, FiCheckCircle, FiTrash2, FiShield, FiTrendingUp, FiCreditCard, FiActivity, FiCalendar, FiMessageSquare, FiCheck, FiX, FiPieChart, FiLogOut, FiSettings, FiKey, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { chartPalette, chartAnimation } from '../utils/categoryMeta';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const tabs = [
  { key: 'monitor', label: 'Monitor', icon: FiActivity },
  { key: 'charts', label: 'Charts', icon: FiPieChart },
  { key: 'users', label: 'Users', icon: FiUsers },
  { key: 'activity', label: 'Activity', icon: FiCalendar },
  { key: 'feedback', label: 'Feedback', icon: FiMessageSquare },
  { key: 'settings', label: 'Settings', icon: FiSettings },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState('monitor');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    try {
      const [userRes, analyticsRes, feedbackRes] = await Promise.all([axios.get('/api/admin/users'), axios.get('/api/admin/analytics'), axios.get('/api/feedback')]);
      setUsers(userRes.data);
      setAnalytics(analyticsRes.data);
      setFeedback(feedbackRes.data);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    try { await axios.delete(`/api/admin/users/${id}`); fetchAdminData(); setDeleteConfirm(null); } catch (err) { console.error('Error:', err); }
  };

  const handleResolveFeedback = async (id) => {
    if (!resolveNote.trim()) return;
    try {
      await axios.patch(`/api/feedback/${id}`, { resolutionNote: resolveNote });
      setResolvingId(null);
      setResolveNote('');
      fetchAdminData();
    } catch (err) { console.error('Error:', err); }
  };

  const handleDeleteFeedback = async (id) => {
    try { await axios.delete(`/api/feedback/${id}`); fetchAdminData(); } catch (err) { console.error('Error:', err); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      const res = await axios.put('/api/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg(res.data.message);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  const a = analytics || {};
  const goalPct = a.totalGoalTarget > 0 ? Math.round((a.totalGoalCurrent / a.totalGoalTarget) * 100) : 0;
  const debtPct = a.totalDebtOriginal > 0 ? Math.round(((a.totalDebtOriginal - a.totalDebtRemaining) / a.totalDebtOriginal) * 100) : 0;
  const openCount = feedback.filter((f) => f.status === 'open').length;

  const expenseChartData = a.expensesByCategory?.length ? {
    labels: a.expensesByCategory.map((e) => e._id),
    datasets: [{ data: a.expensesByCategory.map((e) => e.total), backgroundColor: chartPalette, borderWidth: 0 }],
  } : null;

  const incomeChartData = a.incomeByCategory?.length ? {
    labels: a.incomeByCategory.map((i) => i._id),
    datasets: [{ data: a.incomeByCategory.map((i) => i.total), backgroundColor: chartPalette, borderWidth: 0 }],
  } : null;

  const doughnutOpts = {
    cutout: '65%',
    responsive: true,
    animation: chartAnimation,
    plugins: { legend: { position: 'bottom', labels: { color: '#8a86a3' } } },
  };

  const monitorStats = [
    { label: 'Total Users', value: a.totalUsers, sub: `${a.activeUsers || 0} active (30d)`, icon: FiUsers, tint: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
    { label: 'Total Expenses', value: formatCurrency(a.totalExpenseAmount), sub: `${a.totalExpenses || 0} records`, icon: FiDollarSign, tint: 'bg-magenta-100 dark:bg-magenta-900/30 text-magenta-600 dark:text-magenta-400' },
    { label: 'Total Income', value: formatCurrency(a.totalIncomeAmount), sub: `${a.totalIncome || 0} records`, icon: FiTrendingUp, tint: 'bg-mint-100 dark:bg-mint-900/30 text-mint-600 dark:text-mint-400' },
    { label: 'Net Cash Flow', value: formatCurrency((a.totalIncomeAmount || 0) - (a.totalExpenseAmount || 0)), sub: 'Income minus expenses', icon: FiActivity, tint: 'bg-sun-100 dark:bg-sun-900/30 text-sun-600 dark:text-sun-400' },
    { label: 'Total Debt', value: formatCurrency(a.totalDebtRemaining), sub: `${debtPct}% paid off`, icon: FiCreditCard, tint: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    { label: 'Habit Completions', value: (a.totalHabitCompletions || 0).toLocaleString(), sub: `${a.totalHabits || 0} habits · ${(a.totalHabitStreak || 0).toLocaleString()} streak days`, icon: FiCheckCircle, tint: 'bg-mint-100 dark:bg-mint-900/30 text-mint-600 dark:text-mint-400' },
    { label: 'Savings Goals', value: a.totalGoals, sub: `${a.totalGoalsCompleted || 0}/${a.totalGoals || 0} completed · ${goalPct}% avg`, icon: FiTarget, tint: 'bg-sun-100 dark:bg-sun-900/30 text-sun-600 dark:text-sun-400' },
    { label: 'Goal Amount', value: formatCurrency(a.totalGoalTarget), sub: `${formatCurrency(a.totalGoalCurrent)} saved`, icon: FiDollarSign, tint: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
    { label: 'Investments', value: a.totalInvestments, sub: `${formatCurrency(a.totalInvestmentValue)} total value`, icon: FiTrendingUp, tint: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Budgets', value: a.totalBudgets, sub: 'Monthly budgets set', icon: FiTarget, tint: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
    { label: 'Total Transactions', value: ((a.totalExpenses || 0) + (a.totalIncome || 0)).toLocaleString(), sub: 'Expenses + income records', icon: FiActivity, tint: 'bg-magenta-100 dark:bg-magenta-900/30 text-magenta-600 dark:text-magenta-400' },
    { label: 'Feedback', value: feedback.length, sub: `${openCount} open · ${feedback.length - openCount} resolved`, icon: FiMessageSquare, tint: 'bg-sun-100 dark:bg-sun-900/30 text-sun-600 dark:text-sun-400' },
  ];

  return (
    <div className="space-y-6 pb-28 md:pb-32">
      <div className="flex items-center justify-between gap-3 animate-fade-up">
        <div className="min-w-0">
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Monitor the platform, manage users and resolve queries</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 sm:px-4 py-2 rounded-xl shrink-0">
          <FiShield size={18} />
          <span className="text-sm font-medium hidden sm:inline">Admin Access</span>
          <span className="text-sm font-medium sm:hidden">Admin</span>
        </div>
      </div>

      {tab === 'monitor' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 animate-fade-up">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FiActivity className="mr-2 text-primary-500" size={20} /> Platform Monitor
              </h2>
              <p className="text-sm text-gray-500 dark:text-navy-400 mt-0.5">Live totals across the entire platform</p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-400 font-medium whitespace-nowrap">
              {a.activeUsers || 0} active users this month
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {monitorStats.map((s, i) => (
              <div key={s.label} className="stat-card reveal" style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 font-medium">{s.label}</p>
                  <div className={`w-8 h-8 rounded-xl ${s.tint} flex items-center justify-center`}><s.icon size={15} /></div>
                </div>
                <p className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white truncate">{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-navy-500 mt-1 truncate">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'charts' && a && (
        <div className="card overflow-hidden reveal reveal-delay-1">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expenses by Category</h3>
                {expenseChartData ? (
                  <div className="flex justify-center"><div className="w-56 h-56"><Doughnut data={expenseChartData} options={doughnutOpts} /></div></div>
                ) : <p className="text-gray-400 dark:text-navy-500 text-center py-8">No expense data</p>}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income by Category</h3>
                {incomeChartData ? (
                  <div className="flex justify-center"><div className="w-56 h-56"><Doughnut data={incomeChartData} options={doughnutOpts} /></div></div>
                ) : <p className="text-gray-400 dark:text-navy-500 text-center py-8">No income data</p>}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
                <p className="text-xs text-gray-500 dark:text-navy-400">Budgets</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{a.totalBudgets || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
                <p className="text-xs text-gray-500 dark:text-navy-400">Debts</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{a.totalDebts || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
                <p className="text-xs text-gray-500 dark:text-navy-400">Investments</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(a.totalInvestmentValue)}</p>
              </div>
              <div className="p-4 bg-sun-50 dark:bg-sun-900/20 rounded-xl border border-sun-200 dark:border-sun-900/50">
                <p className="text-xs text-gray-500 dark:text-navy-400">Open Feedback</p>
                <p className="text-xl font-extrabold text-sun-600 dark:text-sun-400">{a.openFeedback || 0}</p>
              </div>
              <div className="p-4 bg-mint-50 dark:bg-mint-900/20 rounded-xl border border-mint-200 dark:border-mint-900/50">
                <p className="text-xs text-gray-500 dark:text-navy-400">Resolved Feedback</p>
                <p className="text-xl font-extrabold text-mint-600 dark:text-mint-400">{a.resolvedFeedback || 0}</p>
              </div>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-900/50">
                <p className="text-xs text-gray-500 dark:text-navy-400">Avg Goal Completion</p>
                <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{goalPct}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden reveal reveal-delay-1">
          <div className="p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FiUsers className="mr-2 text-primary-500" size={18} /> Manage Users
              </h3>
              <span className="text-xs px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium">{users.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-navy-700">
                    {['Name', 'Email', 'Role', 'Occupation', 'Joined', 'Expenses', 'Income', 'Active Days', 'Actions'].map((h) => (
                      <th key={h} className={`text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-navy-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-8 text-gray-400 dark:text-navy-500">No users found</td></tr>
                  ) : (
                    users.map((u) => {
                      const s = u.stats || {};
                      return (
                        <tr key={u._id} className="border-b border-gray-100 dark:border-navy-800 hover:bg-gray-50 dark:hover:bg-navy-800/50">
                          <td className="py-3 px-3 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                          <td className="py-3 px-3 text-sm text-gray-500 dark:text-navy-400">{u.email}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-navy-300'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-sm text-gray-500 dark:text-navy-400">{u.profile?.occupation || '-'}</td>
                          <td className="py-3 px-3 text-sm text-gray-500 dark:text-navy-400">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td className="py-3 px-3 text-sm text-red-600 dark:text-red-400 font-medium">{formatCurrency(s.totalExpenseAmount)}</td>
                          <td className="py-3 px-3 text-sm text-green-600 dark:text-green-400 font-medium">{formatCurrency(s.totalIncomeAmount)}</td>
                          <td className="py-3 px-3 text-sm text-gray-500 dark:text-navy-400">{s.activeDays || 0}d</td>
                          <td className="py-3 px-3 text-right">
                            {u.role !== 'admin' && (
                              <button onClick={() => setDeleteConfirm(u)} className="p-1.5 text-gray-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete user">
                                <FiTrash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="card overflow-hidden reveal reveal-delay-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiActivity className="mr-2 text-primary-500" size={18} /> Recent User Activity
            </h3>
            {a.recentUsers?.length > 0 ? (
              <div className="space-y-3">
                {a.recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-navy-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400 dark:text-navy-500">
                      <span className="flex items-center"><FiCalendar className="mr-1" size={12} /> Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center"><FiActivity className="mr-1" size={12} /> Last active {u.lastActive ? new Date(u.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-navy-500 text-center py-8">No user activity data</p>
            )}
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="card overflow-hidden reveal reveal-delay-1">
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FiMessageSquare className="mr-2 text-primary-500" size={18} /> User Feedback & Issues
              </h3>
              <div className="flex gap-1.5">
                {[
                  { key: 'all', label: `All (${feedback.length})` },
                  { key: 'open', label: `Open (${openCount})` },
                  { key: 'resolved', label: `Resolved (${feedback.length - openCount})` },
                ].map((f) => (
                  <button key={f.key} onClick={() => setFeedbackFilter(f.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${feedbackFilter === f.key ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-navy-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {feedback.length === 0 ? (
              <p className="text-gray-400 dark:text-navy-500 text-center py-10">No feedback submitted yet</p>
            ) : (
              <div className="space-y-3">
                {feedback.filter((f) => feedbackFilter === 'all' || f.status === feedbackFilter).map((f) => (
                  <div key={f._id} className={`p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border ${f.status === 'open' ? 'border-sun-200 dark:border-sun-900/50' : 'border-mint-200 dark:border-mint-900/50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0">
                          {(f.user?.name || '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{f.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 dark:text-navy-400 truncate">{f.user?.email || '—'}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${f.status === 'open' ? 'bg-sun-100 dark:bg-sun-900/30 text-sun-700 dark:text-sun-400' : 'bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-400'}`}>
                        {f.status === 'open' ? 'Open' : 'Resolved'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-navy-100 mt-3">{f.subject}</p>
                    <p className="text-sm text-gray-500 dark:text-navy-400 mt-1 leading-relaxed">{f.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400 dark:text-navy-500">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <div className="flex items-center gap-2">
                        {f.status === 'open' ? (
                          <>
                            {resolvingId === f._id ? (
                              <>
                                <button onClick={() => handleResolveFeedback(f._id)} disabled={!resolveNote.trim()} className="px-2.5 py-1 text-xs font-medium bg-mint-600 hover:bg-mint-700 disabled:bg-mint-400 text-white rounded-lg transition-colors flex items-center"><FiCheck className="mr-1" size={12} /> Resolve</button>
                                <button onClick={() => { setResolvingId(null); setResolveNote(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-navy-300 rounded" title="Cancel"><FiX size={14} /></button>
                              </>
                            ) : (
                              <button onClick={() => { setResolvingId(f._id); setResolveNote(''); }} className="px-2.5 py-1 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">Mark Resolved</button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-mint-600 dark:text-mint-400 font-medium">Resolved {f.resolvedAt ? new Date(f.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                        )}
                        <button onClick={() => handleDeleteFeedback(f._id)} className="p-1.5 text-gray-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete feedback">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {resolvingId === f._id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-navy-700">
                        <textarea rows={2} value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} className="input-field text-sm" placeholder="Write a response to the user..." />
                      </div>
                    )}
                    {f.status === 'resolved' && f.resolutionNote && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-navy-700">
                        <p className="text-xs font-medium text-mint-600 dark:text-mint-400 mb-0.5">Response sent to user:</p>
                        <p className="text-sm text-gray-600 dark:text-navy-300">{f.resolutionNote}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 reveal reveal-delay-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
              <FiShield className="mr-2 text-primary-500" size={18} /> Admin Profile
            </h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">Your administrator account details</p>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-extrabold shadow-glow shrink-0">
                {(user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-navy-400 truncate">{user?.email}</p>
                <span className="inline-flex mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium capitalize">{user?.role}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
                <p className="text-xs text-gray-500 dark:text-navy-400">Currency</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{user?.currency || 'INR'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
                <p className="text-xs text-gray-500 dark:text-navy-400">Platform</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">WealthFlow</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={toggle} className="btn-outline text-sm">
                {dark ? <FiSun className="mr-2" size={16} /> : <FiMoon className="mr-2" size={16} />}
                {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center">
                <FiLogOut className="mr-2" size={16} /> Sign Out
              </button>
            </div>
          </div>

          <div className="card p-6 reveal reveal-delay-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
              <FiKey className="mr-2 text-primary-500" size={18} /> Change Password
            </h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">Update your admin account password</p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="admin-current-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Current Password</label>
                <input type="password" required id="admin-current-password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input-field" placeholder="Enter current password" />
              </div>
              <div>
                <label htmlFor="admin-new-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">New Password</label>
                <input type="password" required minLength={8} id="admin-new-password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input-field" placeholder="Min 8 characters, uppercase, lowercase, number" />
              </div>
              <div>
                <label htmlFor="admin-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Confirm New Password</label>
                <input type="password" required id="admin-confirm-password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="input-field" placeholder="Confirm new password" />
              </div>
              {pwError && <p className="text-sm text-red-600 dark:text-red-400 flex items-center"><FiX className="mr-1" size={14} />{pwError}</p>}
              {pwMsg && <p className="text-sm text-mint-600 dark:text-mint-400 flex items-center"><FiCheck className="mr-1" size={14} />{pwMsg}</p>}
              <button type="submit" disabled={pwLoading} className="btn-primary text-sm">
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4 md:pb-6 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border border-gray-200 dark:border-navy-700 rounded-2xl shadow-elevated p-1.5 sm:p-2 overflow-x-auto max-w-full">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} title={t.label} aria-label={t.label}
                className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 ${active ? 'bg-gradient-to-r from-primary-600 to-magenta-600 text-white shadow-glow scale-105' : 'text-gray-500 dark:text-navy-300 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-gray-100 dark:hover:bg-navy-800'}`}>
                <Icon size={18} />
                {t.key === 'feedback' && openCount > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white text-primary-600' : 'bg-sun-100 dark:bg-sun-900/30 text-sun-700 dark:text-sun-400'}`}>{openCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-navy-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete user?</h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-1">This will permanently delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email}) and all associated data.</p>
            <p className="text-xs text-red-500 mb-4">This action cannot be undone.</p>
            <div className="flex space-x-2">
              <button onClick={() => handleDeleteUser(deleteConfirm._id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex-1 justify-center">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}