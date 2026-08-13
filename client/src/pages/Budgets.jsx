import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatCurrency, getBaseCurrency } from '../utils/formatCurrency';
import { currencyOptions } from '../utils/currency';
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { expenseCategoryMeta } from '../utils/categoryMeta';
import Select from '../components/Select';

const EXPENSE_CATEGORIES = ['Food', 'Groceries', 'Dining', 'Food Delivery', 'Transport', 'Fuel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Travel', 'Subscriptions', 'Fitness', 'Pets', 'Gifts', 'Personal Care', 'Other'];

export default function Budgets() {
  const [data, setData] = useState({ budgets: [], totalBudgeted: 0, totalSpent: 0, totalRemaining: 0, categoriesWithoutBudget: [] });
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ category: '', monthlyLimit: '', currency: getBaseCurrency() });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/budgets?month=${month}&year=${year}`);
      setData(res.data);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const resetForm = () => { setForm({ category: '', monthlyLimit: '', currency: getBaseCurrency() }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monthlyLimit = Number(form.monthlyLimit);
    if (!Number.isFinite(monthlyLimit) || monthlyLimit < 1) return;
    try {
      if (editing) {
        await axios.put(`/api/budgets/${editing}`, { monthlyLimit, currency: form.currency });
      } else {
        await axios.post('/api/budgets', { category: form.category, monthlyLimit, month, year, currency: form.currency });
      }
      resetForm();
      fetchBudgets();
    } catch (err) { console.error('Error:', err); }
  };

  const handleEdit = (b) => {
    setForm({ category: b.category, monthlyLimit: b.monthlyLimit.toString(), currency: b.currency || getBaseCurrency() });
    setEditing(b._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/api/budgets/${id}`); fetchBudgets(); setDeleteConfirm(null); } catch (err) { console.error('Error:', err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-up">
        <div>
          <h1 className="page-title">Budget Management</h1>
          <p className="page-subtitle">Set monthly spending limits for each category</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={String(month)}
            onChange={(v) => setMonth(Number(v))}
            options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2024, i).toLocaleString('en-US', { month: 'long' }) }))}
            className="w-32"
          />
          <Select
            value={String(year)}
            onChange={(v) => setYear(Number(v))}
            options={Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i))}
            className="w-24"
          />
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap shrink-0">
            <FiPlus className="mr-1.5" size={14} /> Add Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card reveal">
          <p className="text-sm text-gray-500 dark:text-navy-400">Total Budgeted</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(data.totalBudgeted)}</p>
        </div>
        <div className="stat-card reveal reveal-delay-1">
          <p className="text-sm text-gray-500 dark:text-navy-400">Total Spent</p>
          <p className="text-2xl font-extrabold text-magenta-600 dark:text-magenta-400">{formatCurrency(data.totalSpent)}</p>
        </div>
        <div className="stat-card reveal reveal-delay-2">
          <p className="text-sm text-gray-500 dark:text-navy-400">Remaining</p>
          <p className={`text-2xl font-extrabold ${data.totalRemaining >= 0 ? 'text-mint-600 dark:text-mint-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(data.totalRemaining)}
          </p>
        </div>
        <div className="stat-card reveal reveal-delay-3">
          <p className="text-sm text-gray-500 dark:text-navy-400">Usage</p>
          <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
            {data.totalBudgeted > 0 ? Math.round((data.totalSpent / data.totalBudgeted) * 100) : 0}%
          </p>
        </div>
      </div>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {editing ? (
              <div className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-navy-700 rounded-lg text-gray-700 dark:text-navy-200 text-sm font-medium">
                {editing ? form.category : ''}
              </div>
            ) : (
              <Select
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={EXPENSE_CATEGORIES}
                iconMap={expenseCategoryMeta}
                disabledOptions={data.budgets.map((b) => b.category)}
                placeholder="Select category"
                allowCustom
              />
            )}
            <input type="number" required min="1" placeholder="Monthly limit" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })} className="input-field" />
            <Select
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
              options={currencyOptions()}
              placeholder="Currency"
            />
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary text-sm">{editing ? 'Update' : 'Set Budget'}</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Category Budgets {data.budgets.length > 0 ? `(${data.budgets.length})` : ''}
        </h2>
        {data.budgets.length === 0 && data.categoriesWithoutBudget.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-gray-400 dark:text-navy-500">No budgets set. Start by creating budgets for your spending categories!</p>
          </div>
        )}
        {data.budgets.length > 0 && data.budgets.map((b, i) => {
          return (
          <div key={b._id} className={`card p-5 card-hover reveal ${b.isOverBudget ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : ''}`} style={{ transitionDelay: `${Math.min(i, 5) * 0.06}s` }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{b.category}</h3>
                    {b.isOverBudget && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-semibold">Over Budget!</span>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(b.spent, b.currency)}</span>
                      <span className="text-sm text-gray-400 dark:text-navy-500">of</span>
                      <span className="text-sm text-gray-500 dark:text-navy-400">{formatCurrency(b.monthlyLimit, b.currency)}</span>
                      <span className={`text-sm font-medium ${b.remaining >= 0 ? 'text-mint-600 dark:text-mint-400' : 'text-red-600 dark:text-red-400'}`}>
                        ({b.remaining >= 0 ? `${formatCurrency(b.remaining, b.currency)} left` : `${formatCurrency(Math.abs(b.remaining), b.currency)} over`})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 ml-3 shrink-0">
                      <button onClick={() => handleEdit(b)} aria-label="Edit budget" id={`edit-${b._id}`} className="btn-ghost p-1.5"><FiEdit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(b._id)} aria-label="Delete budget" id={`delete-${b._id}`} className="btn-ghost p-1.5 hover:text-red-600 dark:hover:text-red-400"><FiTrash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2.5 max-w-md overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-1000 ${b.percentUsed >= 100 ? 'bg-red-500' : b.percentUsed >= 80 ? 'bg-gradient-to-r from-sun-400 to-sun-500' : 'bg-gradient-to-r from-primary-500 to-magenta-500'}`}
                      style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                    />
                  </div>
                </div>
            </div>
          </div>
          );
        })}
      </div>

      {data.categoriesWithoutBudget.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Categories Without Budget</h3>
          <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">These categories have spending this month but no budget set:</p>
          <div className="flex flex-wrap gap-2">
            {data.categoriesWithoutBudget.map((c) => (
              <div key={c.category} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3 py-2 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
                <span className="text-sm font-medium text-gray-700 dark:text-navy-200">{c.category}</span>
                <span className="text-sm text-gray-500 dark:text-navy-400">{formatCurrency(c.spent)}</span>
                <button onClick={() => { setForm({ category: c.category, monthlyLimit: '', currency: getBaseCurrency() }); setEditing(null); setShowForm(true); }} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-xs font-medium whitespace-nowrap shrink-0">
                  + Set Budget
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-navy-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete this budget?</h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">This action cannot be undone.</p>
            <div className="flex space-x-2">
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex-1 justify-center">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
