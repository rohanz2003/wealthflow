import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingDown } from 'react-icons/fi';

const DEBT_TYPES = ['Credit Card', 'Student Loan', 'Personal Loan', 'Mortgage', 'Auto Loan', 'Medical', 'Other'];

export default function Debts() {
  const [data, setData] = useState({ debts: [], totalDebt: 0, totalOriginal: 0, paidOff: 0, active: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Other', totalAmount: '', remainingAmount: '', interestRate: '', minimumPayment: '', dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchDebts(); }, []);

  const fetchDebts = async () => {
    try { const res = await axios.get('/api/debts'); setData(res.data); } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', type: 'Other', totalAmount: '', remainingAmount: '', interestRate: '', minimumPayment: '', dueDate: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        totalAmount: Number(form.totalAmount),
        remainingAmount: Number(form.remainingAmount),
        interestRate: Number(form.interestRate) || 0,
        minimumPayment: Number(form.minimumPayment) || 0,
      };
      if (editing) {
        await axios.put(`/api/debts/${editing}`, payload);
      } else {
        await axios.post('/api/debts', payload);
      }
      resetForm();
      fetchDebts();
    } catch (err) { console.error('Error:', err); }
  };

  const handleEdit = (d) => {
    setForm({
      name: d.name, type: d.type, totalAmount: d.totalAmount.toString(),
      remainingAmount: d.remainingAmount.toString(), interestRate: d.interestRate?.toString() || '',
      minimumPayment: d.minimumPayment?.toString() || '', dueDate: d.dueDate ? d.dueDate.split('T')[0] : '',
    });
    setEditing(d._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/api/debts/${id}`); fetchDebts(); setDeleteConfirm(null); } catch (err) { console.error('Error:', err); }
  };

  const handleTogglePaid = async (debt) => {
    try { await axios.put(`/api/debts/${debt._id}`, { isPaid: !debt.isPaid }); fetchDebts(); } catch (err) { console.error('Error:', err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400" /></div>;
  }

  const paidOffPct = data.totalOriginal > 0 ? Math.round(((data.totalOriginal - data.totalDebt) / data.totalOriginal) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Debt Tracking</h1>
          <p className="page-subtitle">Track and manage your liabilities</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
          <FiPlus className="mr-2" size={18} /> Add Debt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Total Debt</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">${data.totalDebt.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Paid Off</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{paidOffPct}%</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Active Debts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.active}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Settled</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.paidOff}</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-3 overflow-hidden">
        <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${paidOffPct}%` }} />
      </div>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" required placeholder="Debt name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field">
              {DEBT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" required min="1" placeholder="Total amount $" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} className="input-field" />
            <input type="number" required min="0" placeholder="Remaining $" value={form.remainingAmount} onChange={(e) => setForm({ ...form, remainingAmount: e.target.value })} className="input-field" />
            <input type="number" min="0" step="0.01" placeholder="Interest rate %" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} className="input-field" />
            <input type="number" min="0" placeholder="Min payment $" value={form.minimumPayment} onChange={(e) => setForm({ ...form, minimumPayment: e.target.value })} className="input-field" />
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary text-sm">{editing ? 'Update' : 'Add'}</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {(data.data || []).length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-400 dark:text-navy-500">No debts tracked. Add your first debt to start tracking!</p>
          </div>
        ) : (
          (data.data || []).map((debt) => {
            const paidPct = debt.totalAmount > 0 ? Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100) : 0;
            return (
              <div key={debt._id} className={`card p-5 card-hover ${debt.isPaid ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10 opacity-70' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${debt.isPaid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {debt.type === 'Mortgage' ? '🏠' : debt.type === 'Auto Loan' ? '🚗' : debt.type === 'Student Loan' ? '🎓' : debt.type === 'Credit Card' ? '💳' : '📋'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{debt.name}</h3>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-navy-300 rounded-full">{debt.type}</span>
                        {debt.isPaid && <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Paid Off ✓</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${debt.remainingAmount.toLocaleString()} <span className="text-gray-400 dark:text-navy-500 font-normal">of</span> ${debt.totalAmount.toLocaleString()}
                        </span>
                        {debt.interestRate > 0 && (
                          <span className="text-xs text-gray-400 dark:text-navy-500">{debt.interestRate}% APR</span>
                        )}
                        {debt.minimumPayment > 0 && (
                          <span className="text-xs text-gray-400 dark:text-navy-500">Min: ${debt.minimumPayment}/mo</span>
                        )}
                        {debt.dueDate && (
                          <span className="text-xs text-gray-400 dark:text-navy-500">Due: {new Date(debt.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        )}
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 max-w-md">
                        <div className={`h-2 rounded-full transition-all ${debt.isPaid ? 'bg-green-500' : 'bg-primary-600 dark:bg-primary-400'}`} style={{ width: `${paidPct}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">{paidPct}% paid off</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => handleTogglePaid(debt)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${debt.isPaid ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                      {debt.isPaid ? 'Reopen' : 'Mark Paid'}
                    </button>
                    <button onClick={() => handleEdit(debt)} aria-label="Edit debt" id={`edit-${debt._id}`} className="p-2 text-gray-400 dark:text-navy-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><FiEdit2 size={16} /></button>
                    <button onClick={() => setDeleteConfirm(debt._id)} aria-label="Delete debt" id={`delete-${debt._id}`} className="p-2 text-gray-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-navy-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete this debt?</h3>
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
