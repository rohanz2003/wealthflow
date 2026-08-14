import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';
import { FiTrendingUp, FiAlertTriangle, FiStar, FiPieChart, FiBarChart2, FiTarget } from 'react-icons/fi';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { chartPalette, chartAnimation } from '../utils/categoryMeta';

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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  const topCatChart = insights?.topCategories?.length > 0 ? {
    labels: insights.topCategories.map((c) => c.category),
    datasets: [{ data: insights.topCategories.map((c) => c.amount), backgroundColor: chartPalette, borderWidth: 0 }],
  } : null;

  const recIcons = { warning: FiAlertTriangle, alert: FiAlertTriangle, suggestion: FiStar };
  const recColors = { warning: 'text-sun-600 dark:text-sun-400 bg-sun-50 dark:bg-sun-900/20 border-sun-200 dark:border-sun-800', alert: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', suggestion: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' };
  const fundColor = { excellent: 'text-mint-600 dark:text-mint-400', adequate: 'text-sun-600 dark:text-sun-400', minimal: 'text-red-600 dark:text-red-400', none: 'text-red-600 dark:text-red-400' }[stability?.emergencyFundAdequate || 'none'] || 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="page-title">Financial Insights</h1>
        <p className="page-subtitle">Understand your spending patterns and financial health</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card reveal">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">This Month's Spending</p>
          <p className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white truncate">{formatCurrency(insights?.totalSpentThisMonth)}</p>
        </div>
        <div className="stat-card reveal reveal-delay-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Spending Trend</p>
          <p className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {insights?.spendingTrend > 0 ? '+' : ''}{insights?.spendingTrend || 0}%
          </p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5">vs 3-month average</p>
        </div>
        <div className="stat-card reveal reveal-delay-2">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Expense-to-Income</p>
          <p className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {insights?.expenseRatio || 0}%
          </p>
        </div>
        <div className="stat-card reveal reveal-delay-3">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Net Worth</p>
          <p className="text-lg sm:text-2xl font-extrabold truncate text-gray-900 dark:text-white">
            {formatCurrency(stability?.netWorth)}
          </p>
        </div>
      </div>

      {insights?.anomalies?.length > 0 && (
        <div className="card p-6 border-red-200 dark:border-red-900 reveal">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
            <FiAlertTriangle className="mr-2" size={20} /> Spending Anomalies Detected
          </h3>
          <div className="space-y-3">
            {insights.anomalies.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900 transition-transform duration-300 hover:translate-x-1">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{a.category}</p>
                  <p className="text-sm text-gray-500 dark:text-navy-400">
                    {formatCurrency(a.currentAmount)} this month vs {formatCurrency(a.averageAmount)} average
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${a.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-sun-100 dark:bg-sun-900/30 text-sun-700 dark:text-sun-400'}`}>
                  +{a.percentIncrease}% {a.severity === 'high' ? 'High' : 'Moderate'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 reveal">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiPieChart className="mr-2 text-primary-500" size={18} /> Top Spending Categories
          </h3>
          {topCatChart ? (
            <div className="flex justify-center"><div className="w-48 h-48"><Doughnut data={topCatChart} options={{ cutout: '65%', responsive: true, animation: chartAnimation, plugins: { legend: { position: 'bottom', labels: { color: '#8a86a3' } } } }} /></div></div>
          ) : (
            <p className="text-gray-400 dark:text-navy-500 text-center py-8">No spending data for this month</p>
          )}
        </div>

        <div className="card p-6 reveal reveal-delay-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiTarget className="mr-2 text-mint-500" size={18} /> Financial Stability
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-navy-400">Emergency Fund</span>
                <span className={`font-semibold ${fundColor}`}>
                  {stability?.emergencyFundMonths || 0} months ({stability?.emergencyFundAdequate})
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-mint-500 to-mint-600 h-2 rounded-full transition-all duration-1000 progress-shimmer" style={{ width: `${Math.min(100, stability?.emergencyFundProgress || 0)}%` }} />
              </div>
              <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">{formatCurrency(stability?.emergencyFundTarget)} target (6 months of expenses)</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Debt-to-Income</span>
              <span className={`font-semibold ${stability?.debtBurden === 'low' ? 'text-mint-600 dark:text-mint-400' : stability?.debtBurden === 'moderate' ? 'text-sun-600 dark:text-sun-400' : 'text-red-600 dark:text-red-400'}`}>
                {stability?.debtToIncome || 0}% ({stability?.debtBurden})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Total Debt</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(stability?.totalDebt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Total Assets</span>
              <span className="font-semibold text-mint-600 dark:text-mint-400">{formatCurrency(stability?.totalAssets)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Income Diversity</span>
              <span className={`font-semibold ${stability?.incomeDiversityScore === 'high' ? 'text-mint-600 dark:text-mint-400' : stability?.incomeDiversityScore === 'medium' ? 'text-sun-600 dark:text-sun-400' : 'text-red-600 dark:text-red-400'}`}>
                {stability?.incomeDiversity || 0} sources ({stability?.incomeDiversityScore})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-navy-400">Financial Habits</span>
              <span className={`font-semibold ${stability?.habitScore === 'strong' ? 'text-mint-600 dark:text-mint-400' : stability?.habitScore === 'developing' ? 'text-sun-600 dark:text-sun-400' : 'text-red-600 dark:text-red-400'}`}>
                {stability?.activeHabits || 0} active ({stability?.habitScore})
              </span>
            </div>
          </div>
        </div>
      </div>

      {insights?.recommendations?.length > 0 && (
        <div className="card p-6 reveal">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiStar className="mr-2 text-sun-500" size={20} /> Recommendations
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
