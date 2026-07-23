import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiDollarSign, FiTarget, FiCheckCircle, FiBarChart2, FiTrash2, FiShield, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [userRes, analyticsRes] = await Promise.all([axios.get('/api/admin/users'), axios.get('/api/admin/analytics')]);
      setUsers(userRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user and all their data? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  const expenseChartData = analytics ? {
    labels: analytics.expensesByCategory?.map((e) => e._id) || [],
    datasets: [{ data: analytics.expensesByCategory?.map((e) => e.total) || [], backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#a855f7', '#14b8a6', '#f97316', '#64748b'], borderWidth: 0 }],
  } : null;

  const incomeChartData = analytics ? {
    labels: analytics.incomeByCategory?.map((i) => i._id) || [],
    datasets: [{ data: analytics.incomeByCategory?.map((i) => i.total) || [], backgroundColor: ['#22c55e', '#6366f1', '#f59e0b', '#06b6d4', '#a855f7', '#14b8a6'], borderWidth: 0 }],
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500">Manage platform and monitor usage</p>
        </div>
        <div className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg">
          <FiShield size={18} />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: analytics?.totalUsers || 0, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Expenses', value: `$${(analytics?.totalExpenseAmount || 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Income', value: `$${(analytics?.totalIncomeAmount || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Habit Completions', value: analytics?.totalHabitCompletions || 0, icon: FiCheckCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 card-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{c.label}</p>
              <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center ${c.color}`}><c.icon size={20} /></div>
            </div>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button onClick={() => setTab('overview')} className={`px-6 py-3 text-sm font-medium border-b-2 ${tab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Overview
            </button>
            <button onClick={() => setTab('users')} className={`px-6 py-3 text-sm font-medium border-b-2 ${tab === 'users' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Users ({users.length})
            </button>
          </div>
        </div>

        {tab === 'overview' && analytics && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Expenses by Category</h3>
                {expenseChartData?.labels?.length > 0 ? (
                  <div className="flex justify-center">
                    <div className="w-56 h-56">
                      <Doughnut data={expenseChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                  </div>
                ) : <p className="text-gray-400 text-center py-8">No expense data</p>}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Income by Category</h3>
                {incomeChartData?.labels?.length > 0 ? (
                  <div className="flex justify-center">
                    <div className="w-56 h-56">
                      <Doughnut data={incomeChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                  </div>
                ) : <p className="text-gray-400 text-center py-8">No income data</p>}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Total Goals</p>
                <p className="text-xl font-bold text-gray-900">{analytics.totalGoals}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Goal Target</p>
                <p className="text-xl font-bold text-gray-900">${(analytics.totalGoalTarget || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Goal Progress</p>
                <p className="text-xl font-bold text-gray-900">
                  {analytics.totalGoalTarget > 0 ? `${Math.round((analytics.totalGoalCurrent / analytics.totalGoalTarget) * 100)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Occupation</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-400">No users found</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{u.profile?.occupation || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete user">
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
    </div>
  );
}
