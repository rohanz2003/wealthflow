import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiDollarSign, FiTarget, FiCheckCircle, FiTrash2, FiShield, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400" /></div>;
  }

  const expenseChartData = analytics ? {
    labels: analytics.expensesByCategory?.map((e) => e._id) || [],
    datasets: [{ data: analytics.expensesByCategory?.map((e) => e.total) || [], backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#a855f7', '#14b8a6', '#f97316', '#64748b'], borderWidth: 0 }],
  } : null;

  const incomeChartData = analytics ? {
    labels: analytics.incomeByCategory?.map((i) => i._id) || [],
    datasets: [{ data: analytics.incomeByCategory?.map((i) => i.total) || [], backgroundColor: ['#22c55e', '#6366f1', '#f59e0b', '#06b6d4', '#a855f7', '#14b8a6'], borderWidth: 0 }],
  } : null;

  const doughnutOpts = {
    cutout: '65%',
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage platform and monitor usage</p>
        </div>
        <div className="flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-lg">
          <FiShield size={18} />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: analytics?.totalUsers || 0, icon: FiUsers, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Expenses', value: `$${(analytics?.totalExpenseAmount || 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Total Income', value: `$${(analytics?.totalIncomeAmount || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Habit Completions', value: analytics?.totalHabitCompletions || 0, icon: FiCheckCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((c, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-navy-400">{c.label}</p>
              <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center ${c.color}`}><c.icon size={20} /></div>
            </div>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 dark:border-navy-700">
          <div className="flex">
            {['overview', 'users'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-navy-400 hover:text-gray-700 dark:hover:text-navy-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}{t === 'users' ? ` (${users.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && analytics && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💰 Expenses by Category</h3>
                {expenseChartData?.labels?.length > 0 ? (
                  <div className="flex justify-center"><div className="w-56 h-56"><Doughnut data={expenseChartData} options={doughnutOpts} /></div></div>
                ) : <p className="text-gray-400 dark:text-navy-500 text-center py-8">No expense data</p>}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Income by Category</h3>
                {incomeChartData?.labels?.length > 0 ? (
                  <div className="flex justify-center"><div className="w-56 h-56"><Doughnut data={incomeChartData} options={doughnutOpts} /></div></div>
                ) : <p className="text-gray-400 dark:text-navy-500 text-center py-8">No income data</p>}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
                <p className="text-sm text-gray-500 dark:text-navy-400">Total Goals</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{analytics.totalGoals}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
                <p className="text-sm text-gray-500 dark:text-navy-400">Goal Target</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${(analytics.totalGoalTarget || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
                <p className="text-sm text-gray-500 dark:text-navy-400">Goal Progress</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{analytics.totalGoalTarget > 0 ? `${Math.round((analytics.totalGoalCurrent / analytics.totalGoalTarget) * 100)}%` : '0%'}</p>
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
                    {['Name', 'Email', 'Role', 'Occupation', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className={`text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-navy-400 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-400 dark:text-navy-500">No users found</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-100 dark:border-navy-800 hover:bg-gray-50 dark:hover:bg-navy-800/50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-navy-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-navy-300'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-navy-400">{u.profile?.occupation || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-navy-400">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== 'admin' && (
                            <button onClick={() => setDeleteConfirm(u._id)} className="p-1.5 text-gray-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete user">
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-navy-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete this user?</h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">This action cannot be undone.</p>
            <div className="flex space-x-2">
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex-1 justify-center">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
