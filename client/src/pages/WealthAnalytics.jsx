import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';
import { FiTrendingUp, FiDollarSign, FiBarChart2, FiPieChart, FiActivity } from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { chartPalette, chartAnimation } from '../utils/categoryMeta';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

export default function WealthAnalytics() {
  const [kpis, setKpis] = useState(null);
  const [months, setMonths] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [kpiRes, monthRes, invRes, expRes, incRes, goalRes] = await Promise.all([
          axios.get('/api/analytics/kpis'),
          axios.get('/api/analytics/monthly-activity'),
          axios.get('/api/investments'),
          axios.get('/api/expenses'),
          axios.get('/api/income'),
          axios.get('/api/savings'),
        ]);
        if (cancelled) return;
        setKpis(kpiRes.data);
        setMonths(monthRes.data.months || []);
        setInvestments(invRes.data.data || invRes.data || []);
        setExpenses(expRes.data.data || expRes.data || []);
        setIncomes(incRes.data.data || incRes.data || []);
        const goals = goalRes.data.data || goalRes.data || [];
        setTotalSavings(goals.reduce((s, g) => s + g.currentAmount, 0));
      } catch (err) { console.error('Error:', err); } finally { if (!cancelled) setLoading(false); }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  const totalInvested = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

  const expenseByCat = {};
  expenses.forEach((e) => { expenseByCat[e.category] = (expenseByCat[e.category] || 0) + e.amount; });
  const incomeByCat = {};
  incomes.forEach((i) => { incomeByCat[i.category] = (incomeByCat[i.category] || 0) + i.amount; });
  const investmentByType = {};
  investments.forEach((inv) => { investmentByType[inv.type] = (investmentByType[inv.type] || 0) + inv.currentValue; });

  const monthlyIncomeData = months.map((m) => m.income);
  const monthlyExpenseData = months.map((m) => m.expense);
  const monthlySavingsData = months.map((m) => m.savings);
  const monthLabels = months.map((m) => m.month);

  const cumulativeSavings = monthlySavingsData.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);

  const expenseChartData = {
    labels: Object.keys(expenseByCat),
    datasets: [{ data: Object.values(expenseByCat), backgroundColor: chartPalette, borderWidth: 0 }],
  };
  const investmentChartData = {
    labels: Object.keys(investmentByType),
    datasets: [{ data: Object.values(investmentByType), backgroundColor: chartPalette, borderWidth: 0 }],
  };
  const monthlyChartData = {
    labels: monthLabels,
    datasets: [
      { label: 'Income', data: monthlyIncomeData, borderColor: '#00d9a6', backgroundColor: 'rgba(0, 217, 166, 0.1)', fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5 },
      { label: 'Expenses', data: monthlyExpenseData, borderColor: '#d9167a', backgroundColor: 'rgba(217, 22, 122, 0.1)', fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5 },
      { label: 'Net Savings', data: monthlySavingsData, borderColor: '#6554ff', backgroundColor: 'rgba(101, 84, 255, 0.1)', fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5 },
    ],
  };

  const monthlyChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: chartAnimation,
    plugins: {
      legend: { position: isMobile ? 'bottom' : 'top', labels: { color: '#94a3b8', boxWidth: isMobile ? 10 : 20, padding: isMobile ? 8 : 12, font: { size: isMobile ? 10 : 12 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', maxRotation: isMobile ? 45 : 0, font: { size: isMobile ? 9 : 12 } } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.2)' }, ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}k`, color: '#94a3b8', font: { size: isMobile ? 9 : 12 } } },
    },
  };

  const chartContainerClass = isMobile ? 'h-56 overflow-x-auto' : 'h-64';
  const wealthTrendData = {
    labels: monthLabels,
    datasets: [{
      label: 'Net Worth',
      data: cumulativeSavings.map((s) => s + totalSavings + totalInvested),
      fill: true,
      borderColor: '#6554ff',
      backgroundColor: 'rgba(101, 84, 255, 0.1)',
      tension: 0.4,
    }],
  };

  const lineChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: chartAnimation,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', maxRotation: isMobile ? 45 : 0, font: { size: isMobile ? 9 : 12 } } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.2)' }, ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}k`, color: '#94a3b8', font: { size: isMobile ? 9 : 12 } } },
    },
  };

  const doughnutOpts = (legend) => ({
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: false,
    animation: chartAnimation,
    plugins: {
      legend: { position: legend, labels: { color: '#94a3b8', boxWidth: isMobile ? 10 : 20, padding: isMobile ? 6 : 12, font: { size: isMobile ? 9 : 12 } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="page-title">Wealth Analytics</h1>
        <p className="page-subtitle">Comprehensive view of your financial growth</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(kpis?.monthlyIncomeTotal), sub: 'This month', icon: FiTrendingUp, color: 'text-mint-600 dark:text-mint-400', bg: 'bg-mint-100 dark:bg-mint-900/30' },
          { label: 'Total Expenses', value: formatCurrency(kpis?.monthlyExpenseTotal), sub: 'This month', icon: FiDollarSign, color: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
          { label: 'Habit Completion', value: `${kpis?.habitCompletionRate || 0}%`, sub: `${kpis?.habitsCompletedToday || 0} done today`, icon: FiBarChart2, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
          { label: 'Net Cash Flow', value: formatCurrency(kpis?.monthlyNetCashflow), sub: `${kpis?.totalMonthlyTransactions || 0} transactions`, icon: FiActivity, color: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
        ].map((c, i) => (
          <div key={i} className="stat-card p-3 sm:p-4 reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">{c.label}</p>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.color} transition-transform duration-300 hover:scale-110 hover:rotate-6`}><c.icon size={isMobile ? 14 : 20} /></div>
            </div>
            <p className={`text-lg sm:text-2xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5 sm:mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6 reveal">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center"><FiBarChart2 className="mr-2 text-primary-500" size={18} /> Monthly Income vs Expenses</h3>
          {monthLabels.length > 0 ? (
            <div className={chartContainerClass}>
              <div className={isMobile ? 'min-w-[400px] h-full' : 'h-full'}>
                <Line data={monthlyChartData} options={monthlyChartOpts} />
              </div>
            </div>
          ) : <p className="text-gray-400 dark:text-navy-500 text-center py-12">No monthly data available</p>}
        </div>
        <div className="card p-4 sm:p-6 reveal reveal-delay-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center"><FiTrendingUp className="mr-2 text-mint-500" size={18} /> Net Worth Trend</h3>
          {monthLabels.length > 0 ? (
            <div className={isMobile ? 'h-56 overflow-x-auto' : 'h-64'}>
              <div className={isMobile ? 'min-w-[400px] h-full' : 'h-full'}>
                <Line data={wealthTrendData} options={lineChartOpts} />
              </div>
            </div>
          ) : <p className="text-gray-400 dark:text-navy-500 text-center py-12">Add income and expenses to see your trend</p>}
        </div>
        <div className="card p-4 sm:p-6 reveal reveal-delay-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center"><FiPieChart className="mr-2 text-magenta-500" size={18} /> Expense Breakdown</h3>
          {Object.keys(expenseByCat).length > 0 ? (
            <div className="flex justify-center"><div className="w-40 h-40 sm:w-56 sm:h-56"><Doughnut data={expenseChartData} options={doughnutOpts(isMobile ? 'bottom' : 'bottom')} /></div></div>
          ) : <p className="text-gray-400 dark:text-navy-500 text-center py-12">No expenses recorded</p>}
        </div>
        <div className="card p-4 sm:p-6 reveal reveal-delay-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center"><FiPieChart className="mr-2 text-sun-500" size={18} /> Investment Portfolio</h3>
          {Object.keys(investmentByType).length > 0 ? (
            <div className="flex justify-center"><div className="w-40 h-40 sm:w-56 sm:h-56"><Doughnut data={investmentChartData} options={doughnutOpts(isMobile ? 'bottom' : 'bottom')} /></div></div>
          ) : <p className="text-gray-400 dark:text-navy-500 text-center py-12">No investments tracked yet</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card p-3 sm:p-4 reveal">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 mb-0.5 sm:mb-1">Goal Completion</p>
          <p className="text-lg sm:text-2xl font-extrabold text-primary-600 dark:text-primary-400">{kpis?.goalCompletionRate || 0}%</p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5 sm:mt-1">{kpis?.completedGoals || 0} of {kpis?.totalGoals || 0} done</p>
        </div>
        <div className="stat-card p-3 sm:p-4 reveal reveal-delay-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 mb-0.5 sm:mb-1">Avg Savings Progress</p>
          <p className="text-lg sm:text-2xl font-extrabold text-mint-600 dark:text-mint-400">{kpis?.avgGoalCompletionRate || 0}%</p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5 sm:mt-1">Across all goals</p>
        </div>
        <div className="stat-card p-3 sm:p-4 reveal reveal-delay-2">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 mb-0.5 sm:mb-1">Weekly Activity</p>
          <p className="text-lg sm:text-2xl font-extrabold text-primary-600 dark:text-primary-400">{kpis?.weeklyTransactions || 0}</p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5 sm:mt-1">Transactions this week</p>
        </div>
        <div className="stat-card p-3 sm:p-4 reveal reveal-delay-3">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 mb-0.5 sm:mb-1">Monthly Net Cashflow</p>
          <p className={`text-lg sm:text-2xl font-extrabold ${(kpis?.monthlyNetCashflow || 0) >= 0 ? 'text-mint-600 dark:text-mint-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(kpis?.monthlyNetCashflow)}
          </p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5 sm:mt-1">Income minus expenses</p>
        </div>
      </div>
    </div>
  );
}
