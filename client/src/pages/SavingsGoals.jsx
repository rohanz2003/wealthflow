import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const GOAL_CATEGORIES = ['Emergency Fund', 'Vacation', 'Education', 'Home', 'Vehicle', 'Retirement', 'Investment', 'Debt Payment', 'Other'];

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', targetAmount: '', category: 'Other', targetDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try { const res = await axios.get('/api/savings'); setGoals(res.data); } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  const resetForm = () => { setForm({ title: '', description: '', targetAmount: '', category: 'Other', targetDate: '' }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await axios.put(`/api/savings/${editing}`, form);
      else await axios.post('/api/savings', form);
      resetForm();
      fetchGoals();
    } catch (err) { console.error('Error:', err); }
  };

  const handleEdit = (goal) => {
    setForm({ title: goal.title, description: goal.description, targetAmount: goal.targetAmount.toString(), category: goal.category, targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '' });
    setEditing(goal._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try { await axios.delete(`/api/savings/${id}`); fetchGoals(); } catch (err) { console.error('Error:', err); }
  };

  const handleAddFunds = async (goal) => {
    const amount = prompt('Enter amount to add:');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    try { await axios.put(`/api/savings/${goal._id}`, { currentAmount: goal.currentAmount + Number(amount) }); fetchGoals(); } catch (err) { console.error('Error:', err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400" /></div>;
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Set and track your financial goals</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
          <FiPlus className="mr-2" size={18} /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Total Goals</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Total Saved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalSaved.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 dark:text-navy-400">Overall Progress</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{overallProgress}%</p>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2">
            <div className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" required placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            <input type="number" required min="1" placeholder="Target amount $" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="input-field" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
              {GOAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
            <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="input-field" />
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary text-sm">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-400 dark:text-navy-500">No savings goals yet. Start by creating one!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            return (
              <div key={goal._id} className={`card p-6 card-hover ${goal.isCompleted ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${goal.isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      {goal.category === 'Emergency Fund' ? '🛡️' : goal.category === 'Vacation' ? '✈️' : goal.category === 'Education' ? '🎓' : goal.category === 'Home' ? '🏠' : goal.category === 'Vehicle' ? '🚗' : goal.category === 'Retirement' ? '🏖️' : '💰'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                        {goal.isCompleted && <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Completed 🎉</span>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-navy-400">{goal.category}{goal.description ? ` · ${goal.description}` : ''}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${goal.currentAmount.toLocaleString()} <span className="text-gray-400 dark:text-navy-500 font-normal">of</span> ${goal.targetAmount.toLocaleString()}
                        </span>
                        {goal.targetDate && (
                          <span className="text-xs text-gray-400 dark:text-navy-500 flex items-center"><FiCalendar className="mr-1" size={14} /> {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        )}
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2.5 max-w-md">
                        <div className={`h-2.5 rounded-full transition-all ${goal.isCompleted ? 'bg-green-500' : 'bg-primary-600 dark:bg-primary-400'}`} style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">{progress}% complete &middot; ${remaining.toLocaleString()} remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!goal.isCompleted && (
                      <button onClick={() => handleAddFunds(goal)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                        + Add Funds
                      </button>
                    )}
                    <button onClick={() => handleEdit(goal)} className="p-2 text-gray-400 dark:text-navy-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><FiEdit2 size={16} /></button>
                    <button onClick={() => handleDelete(goal._id)} className="p-2 text-gray-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
