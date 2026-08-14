import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiDollarSign, FiTarget, FiCheckCircle, FiTrash2, FiShield, FiTrendingUp, FiCreditCard, FiActivity, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { chartPalette, chartAnimation } from '../utils/categoryMeta';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    try {
      const [userRes, analyticsRes] = await Promise.all([axios.get('/api/admin/users'), axios.get('/api/admin/analytics')]);
      setUsers(userRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    try { await axios.delete(`/api/admin/users/${id}`); fetchAdminData(); setDeleteConfirm(null); } catch (err) { console.error('Error:', err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  const a = analytics || {};
  const goalPct = a.totalGoalTarget > 0 ? Math.round((a.totalGoalCurrent / a.totalGoalTarget) * 100) : 0;
  const debtPct = a.totalDebtOriginal > 0 ? Math.round(((a.totalDebtOriginal - a.totalDebtRemaining) / a.totalDebtOriginal) * 100) : 0;

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

  const statCards = [
    { label: 'Total Users', value: a.totalUsers, sub: `${a.activeUsers || 0} active (30d)`, icon: FiUsers, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { label: 'Total Expenses', value: formatCurrency(a.totalExpenseAmount), sub: `${a.totalExpenses || 0} records`, icon: FiDollarSign, color: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
    { label: 'Total Income', value: formatCurrency(a.totalIncomeAmount), sub: `${a.totalIncome || 0} records`, icon: FiTrendingUp, color: 'text-mint-600 dark:text-mint-400', bg: 'bg-mint-100 dark:bg-mint-900/30' },
    { label: 'Total Debt', value: formatCurrency(a.totalDebtRemaining), sub: `${debtPct}% paid off`, icon: FiCreditCard, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Goal Progress', value: goalPct + '%', sub: `${a.totalGoalsCompleted || 0}/${a.totalGoals || 0} completed`, icon: FiTarget, color: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
    { label: 'Habit Completions', value: (a.totalHabitCompletions || 0).toLocaleString(), sub: `${a.totalHabits || 0} habits tracked`, icon: FiCheckCircle, color: 'text-sun-600 dark:text-sun-400', bg: 'bg-sun-100 dark:bg-sun-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage platform and monitor usage</p>
        </div>
        <div className="flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-xl">
          <FiShield size={18} />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((c, i) => (
          <div key={i} className="stat-card reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 dark:text-navy-400">{c.label}</p>
              <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center ${c.color} transition-transform duration-300 hover:scale-110 hover:rotate-6`}><c.icon size={16} /></div>
            </div>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden reveal reveal-delay-1">
        <div className="border-b border-gray-200 dark:border-navy-700">
          <div className="flex">
            {[
              { key: 'overview', label: 'Charts' },
              { key: 'users', label: `Users (${users.length})` },
              { key: 'activity', label: 'Activity' },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-300 ${
                  tab === t.key
                    ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-navy-400 hover:text-gray-700 dark:hover:text-navy-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && a && (
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
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 transition-transform duration-300 hover:-translate-y-0.5">
                <p className="text-xs text-gray-500 dark:text-navy-400">Budgets</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{a.totalBudgets || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 transition-transform duration-300 hover:-translate-y-0.5">
                <p className="text-xs text-gray-500 dark:text-navy-400">Debts</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{a.totalDebts || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 transition-transform duration-300 hover:-translate-y-0.5">
                <p className="text-xs text-gray-500 dark:text-navy-400">Investments</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(a.totalInvestmentValue)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 transition-transform duration-300 hover:-translate-y-0.5">
                <p className="text-xs text-gray-500 dark:text-navy-400">Avg Goal Completion</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{goalPct}%</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="p-6">
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
        )}

        {tab === 'activity' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent User Activity</h3>
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
        )}
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
