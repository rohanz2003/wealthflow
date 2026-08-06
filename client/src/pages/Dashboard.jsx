import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { FiDollarSign, FiTrendingUp, FiTarget, FiCheckCircle, FiAward } from 'react-icons/fi';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import CountUp from '../components/CountUp';
import { chartPalette, chartAnimation } from '../utils/categoryMeta';

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

const statCards = [
  { key: 'income', label: 'Monthly Income', icon: FiTrendingUp, color: 'text-mint-600 dark:text-mint-400', bg: 'bg-mint-100 dark:bg-mint-900/30' },
  { key: 'expense', label: 'Monthly Expenses', icon: FiDollarSign, color: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
  { key: 'savings', label: 'Total Savings', icon: FiTarget, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  { key: 'worth', label: 'Net Worth', icon: FiTrendingUp, color: 'text-sun-600 dark:text-sun-400', bg: 'bg-sun-100 dark:bg-sun-900/30' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { summary, expenseCategories, dailyBalances, last30Days, netWorth, savingsRate, activeHabits, totalGoals, completedGoals, overallGoalPct, healthScore, recentHabits, stability, loading } = useDashboard();

  const doughnutData = {
    labels: Object.keys(expenseCategories),
    datasets: [{ data: Object.values(expenseCategories), backgroundColor: chartPalette, borderWidth: 0 }],
  };

  const cumulativeBalances = dailyBalances.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);

  const lineData = {
    labels: last30Days,
    datasets: [{ label: 'Running Balance', data: cumulativeBalances, fill: true, borderColor: '#6554ff', backgroundColor: 'rgba(101, 84, 255, 0.12)', tension: 0.4, pointRadius: 0, pointHoverRadius: 4 }],
  };

  const today = new Date().toDateString();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" />
      </div>
    );
  }

  const values = {
    income: summary.monthlyIncome,
    expense: summary.monthlyExpense,
    savings: summary.totalSavings,
    worth: netWorth,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="animate-fade-up">
          <h1 className="page-title">
            Welcome back, <span className="text-gradient">{user?.name}!</span>
          </h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <Link to="/wealth" className="btn-primary text-sm animate-fade-up">
          <FiTrendingUp className="mr-2" size={16} /> View Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.key} className={`stat-card reveal`} style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-navy-400 font-medium">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color} transition-transform duration-300 hover:scale-110 hover:rotate-6`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
              <CountUp value={values[card.key]} format={formatCurrency} />
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-4 sm:p-5 reveal reveal-delay-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">30-Day Balance Trend</h3>
              <span className="text-xs text-gray-400 dark:text-navy-500 font-medium">Last 30 days</span>
            </div>
            <div className="h-32 sm:h-40">
              <Line data={lineData} options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: chartAnimation,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#8a86a3', maxTicksLimit: 6, font: { size: 10 } } },
                  y: { grid: { color: 'rgba(138, 134, 163, 0.18)' }, ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}k`, color: '#8a86a3', font: { size: 10 }, maxTicksLimit: 5 } },
                },
              }} />
            </div>
          </div>

          <div className="card p-4 sm:p-6 reveal reveal-delay-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
            {Object.keys(expenseCategories).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="flex justify-center">
                  <div className="w-52 h-52 sm:w-64 sm:h-64">
                    <Doughnut data={doughnutData} options={{ cutout: '72%', animation: chartAnimation, plugins: { legend: { display: false } } }} />
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(expenseCategories).slice(0, 8).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-navy-400">{cat}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(amt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 dark:text-navy-500 text-sm text-center py-8">No expenses recorded yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {stability && (
            <div className="card p-6 reveal reveal-delay-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Financial Stability</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Emergency Fund</span>
                  <span className={`font-semibold ${stability.emergencyFundAdequate === 'excellent' ? 'text-mint-600 dark:text-mint-400' : stability.emergencyFundAdequate === 'adequate' ? 'text-sun-600 dark:text-sun-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stability.emergencyFundMonths}mo ({stability.emergencyFundAdequate})
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-mint-500 to-mint-600 h-1.5 rounded-full transition-all duration-1000 progress-shimmer" style={{ width: `${Math.min(100, stability.emergencyFundProgress)}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Total Debt</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(stability.totalDebt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Debt-to-Income</span>
                  <span className={`font-semibold ${stability.debtBurden === 'low' ? 'text-mint-600 dark:text-mint-400' : stability.debtBurden === 'moderate' ? 'text-sun-600 dark:text-sun-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stability.debtToIncome}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-navy-400">Income Sources</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stability.incomeDiversity} ({stability.incomeDiversityScore})</span>
                </div>
                <Link to="/insights" className="mt-2 inline-flex items-center text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  View detailed insights →
                </Link>
              </div>
            </div>
          )}

          <div className="card p-6 reveal reveal-delay-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Financial Health</h3>
            <div className="flex flex-col items-center py-2">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-200 dark:text-navy-700" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray={`${(healthScore / 100) * 326.73} 326.73`} strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${healthScore >= 70 ? 'text-mint-500' : healthScore >= 40 ? 'text-sun-500' : 'text-red-500'}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-extrabold ${healthScore >= 70 ? 'text-mint-600 dark:text-mint-400' : healthScore >= 40 ? 'text-sun-600 dark:text-sun-400' : 'text-red-600 dark:text-red-400'}`}>
                    <CountUp value={healthScore} />
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-navy-400 mt-1">out of 100</span>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-navy-400 flex items-center"><FiCheckCircle className="mr-1.5 text-mint-500" size={14} /> Active Habits</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{activeHabits}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-mint-500 to-mint-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (activeHabits / 5) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-navy-400 flex items-center"><FiTarget className="mr-1.5 text-primary-500" size={14} /> Goals Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{completedGoals}/{totalGoals}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-magenta-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${overallGoalPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-navy-400 flex items-center"><FiTrendingUp className="mr-1.5 text-magenta-500" size={14} /> Savings Rate</span>
                  <span className={`font-semibold ${savingsRate >= 0 ? 'text-mint-600 dark:text-mint-400' : 'text-red-600 dark:text-red-400'}`}>{savingsRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-1000 ${savingsRate >= 20 ? 'bg-gradient-to-r from-mint-500 to-mint-600' : savingsRate >= 10 ? 'bg-gradient-to-r from-sun-400 to-sun-500' : 'bg-gradient-to-r from-red-500 to-red-600'}`} style={{ width: `${Math.min(100, savingsRate * 2)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recentHabits.length > 0 && (
        <div className="card p-6 reveal">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Habits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentHabits.map((habit) => {
              const doneToday = habit.history?.some((h) => new Date(h.date).toDateString() === today && h.completed);
              return (
                <div key={habit._id} className={`p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${doneToday ? 'bg-mint-50 dark:bg-mint-900/20 border-mint-200 dark:border-mint-800' : 'bg-gray-50 dark:bg-navy-800 border-gray-200 dark:border-navy-700'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{habit.name}</p>
                      <p className="text-xs text-gray-500 dark:text-navy-400 capitalize">{habit.frequency} &middot; {habit.type}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${doneToday ? 'bg-mint-500 text-white scale-110' : 'bg-gray-200 dark:bg-navy-600 text-gray-500 dark:text-navy-400'}`}>
                      <FiCheckCircle size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-navy-400 flex items-center">
                    <FiAward className={`mr-1 ${habit.streak > 0 ? 'text-sun-500' : 'text-gray-400'}`} size={14} /> {habit.streak} day streak
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
