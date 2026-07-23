import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch } from 'react-icons/fi';

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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([axios.get('/api/expenses'), axios.get('/api/income')]);
      setExpenses(expRes.data);
      setIncomes(incRes.data);
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
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      if (activeTab === 'expenses') await axios.delete(`/api/expenses/${id}`);
      else await axios.delete(`/api/income/${id}`);
      fetchData();
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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Income & Expenses</h1>
          <p className="page-subtitle">Track your money flow</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
          <FiPlus className="mr-2" size={18} /> Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Total Income</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalIncomes.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Net Balance</p>
          <p className={`text-2xl font-bold ${totalIncomes - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${(totalIncomes - totalExpenses).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 dark:border-navy-700">
          <div className="flex">
            {['expenses', 'income'].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); resetForm(); }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-navy-400 hover:text-gray-700 dark:hover:text-navy-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="p-6 border-b border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800/50">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex space-x-2">
                <button type="submit" className="btn-primary text-sm">{editing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="p-4 border-b border-gray-200 dark:border-navy-700 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" size={18} />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 text-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400 dark:text-navy-500" size={18} />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="select-field text-sm">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-navy-700">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-navy-500">No records found. Start adding your {activeTab}!</div>
          ) : (
            filtered.map((item) => (
              <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${activeTab === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {activeTab === 'income' ? 'I' : 'E'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.title || item.source}</p>
                    <p className="text-xs text-gray-500 dark:text-navy-400">{item.category} &middot; {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${activeTab === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {activeTab === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                  </span>
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 dark:text-navy-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><FiEdit2 size={16} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><FiTrash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
