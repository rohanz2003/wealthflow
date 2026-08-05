import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiPieChart } from 'react-icons/fi';
import { categoryIcon, expenseCategoryMeta } from '../utils/categoryMeta';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Groceries', 'Dining', 'Other'];

export default function Budgets() {
  const [data, setData] = useState({ budgets: [], totalBudgeted: 0, totalSpent: 0, totalRemaining: 0, categoriesWithoutBudget: [] });
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ category: '', monthlyLimit: '' });
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

  const resetForm = () => { setForm({ category: '', monthlyLimit: '' }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/budgets/${editing}`, { monthlyLimit: form.monthlyLimit });
      } else {
        await axios.post('/api/budgets', { category: form.category, monthlyLimit: form.monthlyLimit, month, year });
      }
      resetForm();
      fetchBudgets();
    } catch (err) { console.error('Error:', err); }
  };

  const handleEdit = (b) => {
    setForm({ category: b.category, monthlyLimit: b.monthlyLimit.toString() });
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
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="select-field text-sm w-28">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('en-US', { month: 'long' })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="select-field text-sm w-24">
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - 2 + i}>{new Date().getFullYear() - 2 + i}</option>
            ))}
          </select>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
            <FiPlus className="mr-2" size={18} /> Add Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c} disabled={data.budgets.some((b) => b.category === c)}>{c}</option>
                ))}
              </select>
            )}
            <input type="number" required min="1" placeholder="Monthly limit $" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })} className="input-field" />
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
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 animate-float">
              <FiPieChart size={26} />
            </div>
            <p className="text-gray-400 dark:text-navy-500">No budgets set. Start by creating budgets for your spending categories!</p>
          </div>
        )}
        {data.budgets.length > 0 && data.budgets.map((b, i) => {
          const cat = categoryIcon(b.category, expenseCategoryMeta);
          const CatIcon = cat.icon;
          return (
          <div key={b._id} className={`card p-5 card-hover reveal ${b.isOverBudget ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : ''}`} style={{ transitionDelay: `${Math.min(i, 5) * 0.06}s` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${b.isOverBudget ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : cat.bg + ' ' + cat.text} transition-transform duration-300 hover:scale-110 hover:rotate-6`}>
                  <CatIcon size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{b.category}</h3>
                    {b.isOverBudget && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-semibold">Over Budget!</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(b.spent)}</span>
                    <span className="text-sm text-gray-400 dark:text-navy-500">of</span>
                    <span className="text-sm text-gray-500 dark:text-navy-400">{formatCurrency(b.monthlyLimit)}</span>
                    <span className={`text-sm font-medium ${b.remaining >= 0 ? 'text-mint-600 dark:text-mint-400' : 'text-red-600 dark:text-red-400'}`}>
                      ({b.remaining >= 0 ? `${formatCurrency(b.remaining)} left` : `${formatCurrency(Math.abs(b.remaining))} over`})
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2.5 max-w-md overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-1000 ${b.percentUsed >= 100 ? 'bg-red-500' : b.percentUsed >= 80 ? 'bg-gradient-to-r from-sun-400 to-sun-500' : 'bg-gradient-to-r from-primary-500 to-magenta-500'}`}
                      style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button onClick={() => handleEdit(b)} aria-label="Edit budget" id={`edit-${b._id}`} className="p-2 text-gray-400 dark:text-navy-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><FiEdit2 size={16} /></button>
                <button onClick={() => setDeleteConfirm(b._id)} aria-label="Delete budget" id={`delete-${b._id}`} className="p-2 text-gray-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FiTrash2 size={16} /></button>
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
              <div key={c.category} className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
                <span className="text-sm font-medium text-gray-700 dark:text-navy-200">{c.category}</span>
                <span className="text-sm text-gray-500 dark:text-navy-400">{formatCurrency(c.spent)}</span>
                <button onClick={() => { setForm({ category: c.category, monthlyLimit: '' }); setEditing(null); setShowForm(true); }} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-xs font-medium">
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
