import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { FiDollarSign, FiTrendingUp, FiTarget, FiCheckCircle } from 'react-icons/fi';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

function useDashboard() {
  const [state, setState] = useState({
    summary: { monthlyExpense: 0, monthlyIncome: 0, totalSavings: 0, totalInvested: 0 },
    expenseCategories: {},
    dailyBalances: [],
    last30Days: [],
    netWorth: 0,
    savingsRate: 0,
    activeHabits: 0,
    totalGoals: 0,
    completedGoals: 0,
    overallGoalPct: 0,
    healthScore: 0,
    recentHabits: [],
    stability: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [dashRes, stabRes] = await Promise.all([
          axios.get('/api/dashboard'),
          axios.get('/api/analytics/stability'),
        ]);
        if (cancelled) return;
        const d = dashRes.data;
        setState({
          summary: d.summary,
          expenseCategories: d.expenseCategories,
          dailyBalances: d.dailyBalances,
          last30Days: d.last30Days,
          netWorth: d.netWorth,
          savingsRate: d.savingsRate,
          activeHabits: d.activeHabits,
          totalGoals: d.totalGoals,
          completedGoals: d.completedGoals,
          overallGoalPct: d.overallGoalPct,
          healthScore: d.healthScore,
          recentHabits: d.recentHabits,
          stability: stabRes.data,
          loading: false,
        });
      } catch (err) {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return state;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { summary, expenseCategories, dailyBalances, last30Days, netWorth, savingsRate, activeHabits, totalGoals, completedGoals, overallGoalPct, healthScore, recentHabits, stability, loading } = useDashboard();

  const doughnutData = {
    labels: Object.keys(expenseCategories),
    datasets: [{ data: Object.values(expenseCategories), backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#a855f7', '#14b8a6', '#f97316'], borderWidth: 0 }],
  };

  const cumulativeBalances = dailyBalances.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);

  const lineData = {
    labels: last30Days,
    datasets: [{ label: 'Running Balance', data: cumulativeBalances, fill: true, borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4, pointRadius: 0, pointHoverRadius: 4 }],
  };

  const today = new Date().toDateString();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}!</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <Link to="/wealth" className="btn-primary text-sm">
          <FiTrendingUp className="mr-2" size={16} /> View Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Income', value: formatCurrency(summary.monthlyIncome), icon: FiTrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Monthly Expenses', value: formatCurrency(summary.monthlyExpense), icon: FiDollarSign, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Total Savings', value: formatCurrency(summary.totalSavings), icon: FiTarget, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Net Worth', value: formatCurrency(netWorth), icon: FiTrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((card, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-navy-400 font-medium">{card.label}</span>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">30-Day Balance Trend</h3>
          <div className="h-48 sm:h-56">
            <Line data={lineData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 7, font: { size: 10 } } },
                y: { grid: { color: 'rgba(148, 163, 184, 0.2)' }, ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}k`, color: '#94a3b8', font: { size: 10 } } },
              },
            }} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
            {Object.keys(expenseCategories).length > 0 ? (
              <div className="flex justify-center">
                <div className="w-48 h-48">
                  <Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 dark:text-navy-500 text-sm text-center py-8">No expenses recorded yet</p>
            )}
            <div className="mt-4 space-y-2">
              {Object.entries(expenseCategories).slice(0, 5).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">{cat}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>

          {stability && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Financial Stability</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Emergency Fund</span>
                  <span className={`font-semibold ${stability.emergencyFundAdequate === 'excellent' ? 'text-green-600 dark:text-green-400' : stability.emergencyFundAdequate === 'adequate' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stability.emergencyFundMonths}mo ({stability.emergencyFundAdequate})
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, stability.emergencyFundProgress)}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Total Debt</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(stability.totalDebt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Debt-to-Income</span>
                  <span className={`font-semibold ${stability.debtBurden === 'low' ? 'text-green-600 dark:text-green-400' : stability.debtBurden === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stability.debtToIncome}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Income Sources</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stability.incomeDiversity} ({stability.incomeDiversityScore})</span>
                </div>
                <Link to="/insights" className="mt-2 inline-flex items-center text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  View detailed insights →
                </Link>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Financial Health</h3>
            <div className="flex flex-col items-center py-2">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-200 dark:text-navy-700" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray={`${(healthScore / 100) * 326.73} 326.73`} strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${healthScore >= 70 ? 'text-green-500' : healthScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${healthScore >= 70 ? 'text-green-600 dark:text-green-400' : healthScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {healthScore}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-navy-400 mt-1">out of 100</span>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-navy-400 flex items-center"><FiCheckCircle className="mr-1.5 text-green-500" size={14} /> Active Habits</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{activeHabits}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (activeHabits / 5) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-navy-400 flex items-center"><FiTarget className="mr-1.5 text-blue-500" size={14} /> Goals Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{completedGoals}/{totalGoals}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${overallGoalPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-navy-400 flex items-center"><FiTrendingUp className="mr-1.5 text-purple-500" size={14} /> Savings Rate</span>
                  <span className={`font-semibold ${savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{savingsRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, savingsRate * 2)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recentHabits.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Habits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentHabits.map((habit) => {
              const doneToday = habit.history?.some((h) => new Date(h.date).toDateString() === today && h.completed);
              return (
                <div key={habit._id} className={`p-4 rounded-lg border ${doneToday ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-navy-800 border-gray-200 dark:border-navy-700'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{habit.name}</p>
                      <p className="text-xs text-gray-500 dark:text-navy-400 capitalize">{habit.frequency} &middot; {habit.type}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${doneToday ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-navy-600 text-gray-500 dark:text-navy-400'}`}>
                      <FiCheckCircle size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-navy-400">&#x1F525; {habit.streak} day streak</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
