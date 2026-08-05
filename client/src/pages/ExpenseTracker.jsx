import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch, FiX, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
import { categoryIcon, expenseCategoryMeta } from '../utils/categoryMeta';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Groceries', 'Dining', 'Other'];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0], description: '', source: '' });
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([axios.get('/api/expenses'), axios.get('/api/income')]);
      setExpenses(expRes.data.data || expRes.data || []);
      setIncomes(incRes.data.data || incRes.data || []);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ title: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0], description: '', source: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'expenses') {
        if (editing) await axios.put(`/api/expenses/${editing}`, form);
        else await axios.post('/api/expenses', form);
      } else {
        if (editing) await axios.put(`/api/income/${editing}`, { source: form.source, amount: form.amount, category: form.category, date: form.date, description: form.description });
        else await axios.post('/api/income', { source: form.source, amount: form.amount, category: form.category, date: form.date, description: form.description });
      }
      resetForm();
      fetchData();
    } catch (err) { console.error('Error:', err); }
  };

  const handleEdit = (item) => {
    setForm(activeTab === 'expenses'
      ? { title: item.title, amount: item.amount.toString(), category: item.category, date: item.date.split('T')[0], description: item.description, source: '' }
      : { title: '', amount: item.amount.toString(), category: item.category, date: item.date.split('T')[0], description: item.description, source: item.source });
    setEditing(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === 'expenses') await axios.delete(`/api/expenses/${id}`);
      else await axios.delete(`/api/income/${id}`);
      fetchData();
      setDeleteConfirm(null);
    } catch (err) { console.error('Error:', err); }
  };

  const items = activeTab === 'expenses' ? expenses : incomes;
  const filtered = items.filter((item) => {
    const matchSearch = (item.title || item.source || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || item.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="page-title">Income & Expenses</h1>
          <p className="page-subtitle">Track your money flow</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm w-full sm:w-auto justify-center">
          <FiPlus className="mr-2" size={18} /> Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="stat-card reveal">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Total Income</p>
            <div className="w-9 h-9 rounded-xl bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center text-mint-600 dark:text-mint-400"><FiArrowUpCircle size={18} /></div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-mint-600 dark:text-mint-400">{formatCurrency(totalIncomes)}</p>
        </div>
        <div className="stat-card reveal reveal-delay-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Total Expenses</p>
            <div className="w-9 h-9 rounded-xl bg-magenta-100 dark:bg-magenta-900/30 flex items-center justify-center text-magenta-600 dark:text-magenta-400"><FiArrowDownCircle size={18} /></div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-magenta-600 dark:text-magenta-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="stat-card reveal reveal-delay-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Net Balance</p>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${totalIncomes - totalExpenses >= 0 ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              <FiArrowUpCircle size={18} className={totalIncomes - totalExpenses < 0 ? 'rotate-180' : ''} />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-extrabold ${totalIncomes - totalExpenses >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totalIncomes - totalExpenses)}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 dark:border-navy-700">
          <div className="flex">
            {['expenses', 'income'].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); resetForm(); }}
                className={activeTab === tab ? 'tab-active' : 'tab'}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-800/30">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {activeTab === 'expenses'
                ? <input type="text" required placeholder="Expense title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
                : <input type="text" required placeholder="Income source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input-field" />
              }
              <input type="number" required min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
              <input type="text" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
              <div className="flex space-x-2 sm:self-end">
                <button type="submit" className="btn-primary text-sm">{editing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={16} />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400 dark:text-navy-500 shrink-0" size={16} />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="select-field text-sm py-2">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-navy-700/50">
          {filtered.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-400 dark:text-navy-500">
              <p className="text-lg mb-1">No records found</p>
              <p className="text-sm">Start adding your {activeTab}!</p>
            </div>
          ) : (
            filtered.map((item, i) => {
              const cat = categoryIcon(item.category, expenseCategoryMeta);
              const CatIcon = cat.icon;
              return (
                <div key={item._id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-navy-800/30 transition-all duration-300 hover:translate-x-1 reveal" style={{ transitionDelay: `${Math.min(i, 6) * 0.05}s` }}>
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 ${
                      activeTab === 'income'
                        ? 'bg-mint-100 dark:bg-mint-900/30 text-mint-600 dark:text-mint-400'
                        : cat.bg + ' ' + cat.text
                    }`}>
                      <CatIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{item.title || item.source}</p>
                      <p className="text-xs text-gray-500 dark:text-navy-400 truncate">{item.category} &middot; {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-2">
                    <span className={`text-sm sm:text-base font-semibold ${activeTab === 'income' ? 'text-mint-600 dark:text-mint-400' : 'text-magenta-600 dark:text-magenta-400'}`}>
                      {activeTab === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </span>
                    <button onClick={() => handleEdit(item)} aria-label="Edit" className="btn-ghost p-1.5"><FiEdit2 size={15} /></button>
                    <button onClick={() => setDeleteConfirm(item._id)} aria-label="Delete" className="btn-ghost p-1.5 hover:text-red-600 dark:hover:text-red-400"><FiTrash2 size={15} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content p-5 sm:p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Delete this record?</h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-5">This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger text-sm flex-1 justify-center">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-sm flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
