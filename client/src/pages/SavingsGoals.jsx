import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const GOAL_CATEGORIES = ['Emergency Fund', 'Vacation', 'Education', 'Home', 'Vehicle', 'Retirement', 'Investment', 'Debt Payment', 'Other'];

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', targetAmount: '', category: 'Other', targetDate: '' });
  const [projections, setProjections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addFundsFor, setAddFundsFor] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [goalRes, projRes] = await Promise.all([
        axios.get('/api/savings'),
        axios.get('/api/analytics/goal-projections'),
      ]);
      setGoals(goalRes.data.data || goalRes.data || []);
      setProjections(projRes.data);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  const fetchGoals = fetchData;

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
    try { await axios.delete(`/api/savings/${id}`); fetchGoals(); setDeleteConfirm(null); } catch (err) { console.error('Error:', err); }
  };

  const handleAddFunds = async (goal) => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) return;
    try { await axios.put(`/api/savings/${goal._id}`, { currentAmount: goal.currentAmount + amount }); fetchGoals(); setAddFundsFor(null); setAddAmount(''); } catch (err) { console.error('Error:', err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-600 dark:border-primary-400 border-t-transparent" /></div>;
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Set and track your financial goals</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm w-full sm:w-auto justify-center">
          <FiPlus className="mr-2" size={18} /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Total Goals</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Total Saved</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">${totalSaved.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Overall Progress</p>
          <p className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400">{overallProgress}%</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2">
            <div className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Monthly Surplus</p>
          <p className={`text-lg sm:text-2xl font-bold ${(projections?.monthlySurplus || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${(projections?.monthlySurplus || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5">Available for savings</p>
        </div>
      </div>

      {showForm && (
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input type="text" required placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            <input type="number" required min="1" placeholder="Target amount $" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="input-field" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
              {GOAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
            <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="input-field" />
            <div className="flex space-x-2 sm:self-end">
              <button type="submit" className="btn-primary text-sm">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {goals.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-400 dark:text-navy-500">No savings goals yet. Start by creating one!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const proj = projections?.projections?.find((p) => p._id === goal._id);
            return (
              <div key={goal._id} className={`card p-4 sm:p-6 card-hover ${goal.isCompleted ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 ${goal.isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      {goal.category === 'Emergency Fund' ? '🛡️' : goal.category === 'Vacation' ? '✈️' : goal.category === 'Education' ? '🎓' : goal.category === 'Home' ? '🏠' : goal.category === 'Vehicle' ? '🚗' : goal.category === 'Retirement' ? '🏖️' : '💰'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{goal.title}</h3>
                        {goal.isCompleted && <span className="badge-green">Completed 🎉</span>}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 truncate">{goal.category}{goal.description ? ` · ${goal.description}` : ''}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${goal.currentAmount.toLocaleString()} <span className="text-gray-400 dark:text-navy-500 font-normal">of</span> ${goal.targetAmount.toLocaleString()}
                        </span>
                        {goal.targetDate && (
                          <span className="text-xs text-gray-400 dark:text-navy-500 flex items-center"><FiCalendar className="mr-1" size={14} /> {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        )}
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 sm:h-2.5 max-w-md">
                        <div className={`h-2 sm:h-2.5 rounded-full transition-all ${goal.isCompleted ? 'bg-green-500' : 'bg-primary-600 dark:bg-primary-400'}`} style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <p className="text-xs text-gray-400 dark:text-navy-500">{progress}% complete · ${remaining.toLocaleString()} remaining</p>
                        {proj && !goal.isCompleted && (
                          <>
                            {proj.monthsToGoal ? (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ~{proj.monthsToGoal} months at current rate
                                {proj.projectedDate ? ` (est. ${new Date(proj.projectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}
                              </p>
                            ) : (
                              <p className="text-xs text-yellow-600 dark:text-yellow-400">Increase savings to reach this goal</p>
                            )}
                            {proj.targetMonthsAway && proj.neededMonthly && (
                              <p className={`text-xs ${proj.onTrack ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {proj.onTrack ? 'On track' : `Need $${proj.neededMonthly}/mo`} to hit target date
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                    {!goal.isCompleted && (
                      <button onClick={() => { setAddFundsFor(goal); setAddAmount(''); }} className="btn-primary text-xs sm:text-sm px-3 py-1.5">
                        + Add Funds
                      </button>
                    )}
                    <button onClick={() => handleEdit(goal)} aria-label="Edit" className="btn-ghost p-1.5"><FiEdit2 size={15} /></button>
                    <button onClick={() => setDeleteConfirm(goal._id)} aria-label="Delete" className="btn-ghost p-1.5 hover:text-red-600 dark:hover:text-red-400"><FiTrash2 size={15} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {addFundsFor && (
        <div className="modal-overlay" onClick={() => setAddFundsFor(null)}>
          <div className="modal-content p-5 sm:p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Add Funds</h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">{addFundsFor.title}</p>
            <input type="number" min="0.01" step="0.01" required placeholder="Amount to add $" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="input-field mb-4" autoFocus />
            <div className="flex space-x-3">
              <button onClick={() => handleAddFunds(addFundsFor)} disabled={!addAmount || Number(addAmount) <= 0} className="btn-primary text-sm flex-1 justify-center">Add</button>
              <button onClick={() => { setAddFundsFor(null); setAddAmount(''); }} className="btn-secondary text-sm flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content p-5 sm:p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Delete this goal?</h3>
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
