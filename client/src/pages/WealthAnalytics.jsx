import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiDollarSign, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler);

export default function WealthAnalytics() {
  const [data, setData] = useState({ expenses: [], incomes: [], investments: [], goals: [], habits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes, invRes, goalRes, habRes] = await Promise.all([
        axios.get('/api/expenses'),
        axios.get('/api/income'),
        axios.get('/api/investments'),
        axios.get('/api/savings'),
        axios.get('/api/habits'),
      ]);
      setData({ expenses: expRes.data, incomes: incRes.data, investments: invRes.data, goals: goalRes.data, habits: habRes.data });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  const { expenses, incomes, investments, goals, habits } = data;

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInvested = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const netWorth = totalIncome + totalInvested + totalSaved - totalExpenses;

  const expenseByCat = {};
  expenses.forEach((e) => { expenseByCat[e.category] = (expenseByCat[e.category] || 0) + e.amount; });
  const incomeByCat = {};
  incomes.forEach((i) => { incomeByCat[i.category] = (incomeByCat[i.category] || 0) + i.amount; });

  const investmentByType = {};
  investments.forEach((inv) => { investmentByType[inv.type] = (investmentByType[inv.type] || 0) + inv.currentValue; });

  const monthlyData = {};
  const allTransactions = [
    ...expenses.map((e) => ({ ...e, type: 'expense' })),
    ...incomes.map((i) => ({ ...i, type: 'income' })),
  ];
  allTransactions.forEach((t) => {
    const month = new Date(t.date).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0, savings: 0 };
    if (t.type === 'income') monthlyData[month].income += t.amount;
    else monthlyData[month].expense += t.amount;
  });
  Object.keys(monthlyData).forEach((m) => {
    monthlyData[m].savings = monthlyData[m].income - monthlyData[m].expense;
  });
  const months = Object.keys(monthlyData);
  const monthlyIncomeData = months.map((m) => monthlyData[m].income);
  const monthlyExpenseData = months.map((m) => monthlyData[m].expense);
  const monthlySavingsData = months.map((m) => monthlyData[m].savings);

  const expenseChartData = {
    labels: Object.keys(expenseByCat),
    datasets: [{ data: Object.values(expenseByCat), backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#a855f7', '#14b8a6', '#f97316', '#64748b'], borderWidth: 0 }],
  };

  const investmentChartData = {
    labels: Object.keys(investmentByType),
    datasets: [{ data: Object.values(investmentByType), backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#06b6d4', '#a855f7', '#14b8a6', '#ef4444'], borderWidth: 0 }],
  };

  const monthlyChartData = {
    labels: months,
    datasets: [
      { label: 'Income', data: monthlyIncomeData, backgroundColor: '#22c55e', borderRadius: 4 },
      { label: 'Expenses', data: monthlyExpenseData, backgroundColor: '#ef4444', borderRadius: 4 },
      { label: 'Net Savings', data: monthlySavingsData, backgroundColor: '#6366f1', borderRadius: 4 },
    ],
  };

  const wealthTrendData = {
    labels: months,
    datasets: [{
      label: 'Net Worth',
      data: monthlySavingsData.map((_, i) => monthlySavingsData.slice(0, i + 1).reduce((a, b) => a + b, 0) + totalInvested),
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wealth Analytics</h1>
        <p className="text-gray-500">Comprehensive view of your financial growth</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, icon: FiTrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, icon: FiDollarSign, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Investments', value: `$${totalInvested.toLocaleString()}`, icon: FiBarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Net Worth', value: `$${netWorth.toLocaleString()}`, icon: FiTrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Monthly Income vs Expenses</h3>
          {months.length > 0 ? (
            <Bar data={monthlyChartData} options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#f1f5f9' }, ticks: { callback: (v) => `$${v}` } },
              },
            }} />
          ) : (
            <p className="text-gray-400 text-center py-12">No monthly data available</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Net Worth Trend</h3>
          {months.length > 0 ? (
            <Line data={wealthTrendData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#f1f5f9' }, ticks: { callback: (v) => `$${v}` } },
              },
            }} />
          ) : (
            <p className="text-gray-400 text-center py-12">Add income and expenses to see your trend</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🥧 Expense Breakdown</h3>
          {Object.keys(expenseByCat).length > 0 ? (
            <div className="flex justify-center">
              <div className="w-56 h-56">
                <Doughnut data={expenseChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">No expenses recorded</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🥧 Investment Portfolio</h3>
          {Object.keys(investmentByType).length > 0 ? (
            <div className="flex justify-center">
              <div className="w-56 h-56">
                <Doughnut data={investmentChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">No investments tracked yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-2">Savings Rate</p>
          <p className="text-2xl font-bold text-primary-600">
            {totalIncome > 0 ? `${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}%` : '0%'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Of total income saved</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-2">Investment Ratio</p>
          <p className="text-2xl font-bold text-blue-600">
            {totalIncome > 0 ? `${Math.round((totalInvested / totalIncome) * 100)}%` : '0%'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Of income invested</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-2">Habit Score</p>
          <p className="text-2xl font-bold text-orange-600">
            {habits.length > 0 ? `${Math.round(habits.reduce((s, h) => s + h.totalCompletions, 0) / habits.length * 10) / 10}` : '0'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Avg completions per habit</p>
        </div>
      </div>
    </div>
  );
}
