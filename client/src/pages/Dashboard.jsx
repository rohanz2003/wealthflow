import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiTrendingUp, FiTarget, FiCheckCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ expenses: [], incomes: [], habits: [], goals: [], investments: [] });
  const [summary, setSummary] = useState({ monthlyExpense: 0, monthlyIncome: 0, totalSavings: 0, totalInvested: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes, habRes, goalRes, invRes] = await Promise.all([
        axios.get('/api/expenses'),
        axios.get('/api/income'),
        axios.get('/api/habits'),
        axios.get('/api/savings'),
        axios.get('/api/investments'),
      ]);
      setData({ expenses: expRes.data, incomes: incRes.data, habits: habRes.data, goals: goalRes.data, investments: invRes.data });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyExpenses = expRes.data.filter((e) => new Date(e.date) >= startOfMonth);
      const monthlyIncomes = incRes.data.filter((i) => new Date(i.date) >= startOfMonth);
      const monthlyExp = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
      const monthlyInc = monthlyIncomes.reduce((s, i) => s + i.amount, 0);
      const totalSavings = goalRes.data.reduce((s, g) => s + g.currentAmount, 0);
      const totalInvested = invRes.data.reduce((s, i) => s + i.currentValue, 0);
      setSummary({ monthlyExpense: monthlyExp, monthlyIncome: monthlyInc, totalSavings, totalInvested });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const netWorth = summary.monthlyIncome + summary.totalSavings + summary.totalInvested - summary.monthlyExpense;
  const savingsRate = summary.monthlyIncome > 0 ? ((summary.monthlyIncome - summary.monthlyExpense) / summary.monthlyIncome * 100) : 0;

  const expenseCategories = data.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      data: Object.values(expenseCategories),
      backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#a855f7', '#14b8a6', '#f97316'],
      borderWidth: 0,
    }],
  };

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const dailyBalances = last30Days.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dayExp = data.expenses.filter((e) => new Date(e.date).toDateString() === d.toDateString()).reduce((s, e) => s + e.amount, 0);
    const dayInc = data.incomes.filter((inc) => new Date(inc.date).toDateString() === d.toDateString()).reduce((s, inc) => s + inc.amount, 0);
    return dayInc - dayExp;
  });

  const lineData = {
    labels: last30Days,
    datasets: [{
      label: 'Daily Balance',
      data: dailyBalances,
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  const activeHabits = data.habits.filter((h) => h.isActive);
  const totalGoals = data.goals.length;
  const completedGoals = data.goals.filter((g) => g.isCompleted).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500">Here's your financial overview</p>
        </div>
        <Link to="/wealth" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          View Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Income', value: `$${summary.monthlyIncome.toLocaleString()}`, icon: FiTrendingUp, color: 'bg-green-50 text-green-600', border: 'border-green-200' },
          { label: 'Monthly Expenses', value: `$${summary.monthlyExpense.toLocaleString()}`, icon: FiDollarSign, color: 'bg-red-50 text-red-600', border: 'border-red-200' },
          { label: 'Total Savings', value: `$${summary.totalSavings.toLocaleString()}`, icon: FiTarget, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
          { label: 'Net Worth', value: `$${netWorth.toLocaleString()}`, icon: FiTrendingUp, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200' },
        ].map((card, i) => (
          <div key={i} className={`bg-white rounded-xl border ${card.border} p-5 card-hover`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{card.label}</span>
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Balance Trend</h3>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } },
                y: { grid: { color: '#f1f5f9' }, ticks: { callback: (v) => `$${v}` } },
              },
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            {Object.keys(expenseCategories).length > 0 ? (
              <div className="flex justify-center">
                <div className="w-48 h-48">
                  <Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">No expenses recorded yet</p>
            )}
            <div className="mt-4 space-y-2">
              {Object.entries(expenseCategories).slice(0, 5).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-medium">${amt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center"><FiCheckCircle className="mr-2 text-green-500" size={16} /> Active Habits</span>
                <span className="font-semibold">{activeHabits.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center"><FiTarget className="mr-2 text-blue-500" size={16} /> Goals Progress</span>
                <span className="font-semibold">{completedGoals}/{totalGoals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center">
                  <FiArrowUp className="mr-2 text-green-500" size={16} /> Savings Rate
                </span>
                <span className={`font-semibold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center"><FiDollarSign className="mr-2 text-purple-500" size={16} /> Investments</span>
                <span className="font-semibold">${summary.totalInvested.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {data.habits.filter((h) => h.isActive).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Habits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.habits.filter((h) => h.isActive).slice(0, 6).map((habit) => {
              const today = new Date().toDateString();
              const doneToday = habit.history?.some((h) => new Date(h.date).toDateString() === today && h.completed);
              return (
                <div key={habit._id} className={`p-4 rounded-lg border ${doneToday ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{habit.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{habit.frequency} · {habit.type}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${doneToday ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <FiCheckCircle size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">🔥 {habit.streak} day streak</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
