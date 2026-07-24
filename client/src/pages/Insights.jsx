import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiAlertTriangle, FiStar, FiPieChart, FiBarChart2, FiTarget } from 'react-icons/fi';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [stability, setStability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [insRes, stabRes] = await Promise.all([
          axios.get('/api/analytics/spending-insights'),
          axios.get('/api/analytics/stability'),
        ]);
        if (cancelled) return;
        setInsights(insRes.data);
        setStability(stabRes.data);
      } catch (err) { console.error('Error:', err); } finally { if (!cancelled) setLoading(false); }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400" /></div>;
  }

  const topCatChart = insights?.topCategories?.length > 0 ? {
    labels: insights.topCategories.map((c) => c.category),
    datasets: [{ data: insights.topCategories.map((c) => c.amount), backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'], borderWidth: 0 }],
  } : null;

  const recIcons = { warning: FiAlertTriangle, alert: FiAlertTriangle, suggestion: FiStar };
  const recColors = { warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', alert: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', suggestion: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Financial Insights</h1>
        <p className="page-subtitle">Understand your spending patterns and financial health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">This Month's Spending</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">${(insights?.totalSpentThisMonth || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Spending Trend</p>
          <p className={`text-2xl font-bold ${(insights?.spendingTrend || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {insights?.spendingTrend > 0 ? '+' : ''}{insights?.spendingTrend || 0}%
          </p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">vs 3-month average</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Expense-to-Income</p>
          <p className={`text-2xl font-bold ${(insights?.expenseRatio || 0) > 80 ? 'text-red-600 dark:text-red-400' : (insights?.expenseRatio || 0) > 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
            {insights?.expenseRatio || 0}%
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Net Worth</p>
          <p className={`text-2xl font-bold ${(stability?.netWorth || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${(stability?.netWorth || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {insights?.anomalies?.length > 0 && (
        <div className="card p-6 border-red-200 dark:border-red-900">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
            <FiAlertTriangle className="mr-2" size={20} /> Spending Anomalies Detected
          </h3>
          <div className="space-y-3">
            {insights.anomalies.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{a.category}</p>
                  <p className="text-sm text-gray-500 dark:text-navy-400">
                    ${a.currentAmount.toLocaleString()} this month vs ${a.averageAmount.toLocaleString()} average
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${a.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                  +{a.percentIncrease}% {a.severity === 'high' ? 'High' : 'Moderate'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiPieChart className="mr-2 text-primary-500" size={18} /> Top Spending Categories
          </h3>
          {topCatChart ? (
            <div className="flex justify-center"><div className="w-48 h-48"><Doughnut data={topCatChart} options={{ cutout: '65%', responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} /></div></div>
          ) : (
            <p className="text-gray-400 dark:text-navy-500 text-center py-8">No spending data for this month</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiTarget className="mr-2 text-green-500" size={18} /> Financial Stability
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-navy-400">Emergency Fund</span>
                <span className={`font-semibold ${stability?.emergencyFundAdequate === 'excellent' ? 'text-green-600' : stability?.emergencyFundAdequate === 'adequate' ? 'text-yellow-600' : 'text-red-600'} dark:text-${{ excellent: 'green-400', adequate: 'yellow-400', minimal: 'red-400', none: 'red-400' }[stability?.emergencyFundAdequate || 'none']}`}>
                  {stability?.emergencyFundMonths || 0} months ({stability?.emergencyFundAdequate})
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, stability?.emergencyFundProgress || 0)}%` }} />
              </div>
              <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">${(stability?.emergencyFundTarget || 0).toLocaleString()} target (6 months of expenses)</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Debt-to-Income</span>
              <span className={`font-semibold ${stability?.debtBurden === 'low' ? 'text-green-600 dark:text-green-400' : stability?.debtBurden === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {stability?.debtToIncome || 0}% ({stability?.debtBurden})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Total Debt</span>
              <span className="font-semibold text-red-600 dark:text-red-400">${(stability?.totalDebt || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Total Assets</span>
              <span className="font-semibold text-green-600 dark:text-green-400">${(stability?.totalAssets || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Income Diversity</span>
              <span className={`font-semibold ${stability?.incomeDiversityScore === 'high' ? 'text-green-600 dark:text-green-400' : stability?.incomeDiversityScore === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {stability?.incomeDiversity || 0} sources ({stability?.incomeDiversityScore})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Financial Habits</span>
              <span className={`font-semibold ${stability?.habitScore === 'strong' ? 'text-green-600 dark:text-green-400' : stability?.habitScore === 'developing' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {stability?.activeHabits || 0} active ({stability?.habitScore})
              </span>
            </div>
          </div>
        </div>
      </div>

      {insights?.recommendations?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-500" size={20} /> Recommendations
          </h3>
          <div className="space-y-3">
            {insights.recommendations.map((r, i) => {
              const Icon = recIcons[r.type] || FiStar;
              return (
                <div key={i} className={`flex items-start space-x-3 p-4 rounded-lg border ${recColors[r.type] || 'bg-gray-50 dark:bg-navy-800 border-gray-200 dark:border-navy-700'}`}>
                  <Icon className="shrink-0 mt-0.5" size={18} />
                  <p className="text-sm">{r.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
