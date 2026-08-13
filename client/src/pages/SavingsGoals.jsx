import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency, getBaseCurrency } from '../utils/formatCurrency';
import { currencyOptions, convert } from '../utils/currency';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiTarget } from 'react-icons/fi';
import { categoryIcon, goalCategoryMeta } from '../utils/categoryMeta';
import Select from '../components/Select';

const GOAL_CATEGORIES = ['Emergency Fund', 'Vacation', 'Travel', 'Education', 'Home', 'Renovation', 'Vehicle', 'Wedding', 'Business', 'Retirement', 'Investment', 'Gadgets', 'Debt Payment', 'Other'];

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', targetAmount: '', category: 'Other', targetDate: '', currency: getBaseCurrency() });
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

  const resetForm = () => { setForm({ title: '', description: '', targetAmount: '', category: 'Other', targetDate: '', currency: getBaseCurrency() }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetAmount = Number(form.targetAmount);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) return;
    const payload = { title: form.title, description: form.description, targetAmount, category: form.category, currency: form.currency };
    if (form.targetDate) payload.targetDate = form.targetDate;
    try {
      if (editing) await axios.put(`/api/savings/${editing}`, payload);
      else await axios.post('/api/savings', payload);
      resetForm();
      fetchGoals();
    } catch (err) { console.error('Error:', err); }
  };

  const handleEdit = (goal) => {
    setForm({ title: goal.title, description: goal.description, targetAmount: goal.targetAmount.toString(), category: goal.category, targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '', currency: goal.currency || getBaseCurrency() });
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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  const base = getBaseCurrency();
  const totalTarget = goals.reduce((s, g) => s + convert(g.targetAmount, g.currency, base), 0);
  const totalSaved = goals.reduce((s, g) => s + convert(g.currentAmount, g.currency, base), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Set and track your financial goals</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm w-full sm:w-auto justify-center">
          <FiPlus className="mr-2" size={18} /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card reveal">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Total Goals</p>
          <p className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white">{goals.length}</p>
        </div>
        <div className="stat-card reveal reveal-delay-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Total Saved</p>
          <p className="text-lg sm:text-2xl font-extrabold text-mint-600 dark:text-mint-400 truncate">{formatCurrency(totalSaved)}</p>
        </div>
        <div className="stat-card reveal reveal-delay-2">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Overall Progress</p>
          <p className="text-lg sm:text-2xl font-extrabold text-primary-600 dark:text-primary-400">{overallProgress}%</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-magenta-500 h-2 rounded-full transition-all duration-1000 progress-shimmer" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
        <div className="stat-card reveal reveal-delay-3">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">Monthly Surplus</p>
          <p className={`text-lg sm:text-2xl font-extrabold truncate ${(projections?.monthlySurplus || 0) > 0 ? 'text-mint-600 dark:text-mint-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(projections?.monthlySurplus)}
          </p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5">Available for savings</p>
        </div>
      </div>

      {showForm && (
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input type="text" required placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            <input type="number" required min="1" placeholder="Target amount" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="input-field" />
            <Select
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
              options={currencyOptions()}
              placeholder="Currency"
            />
            <Select
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={GOAL_CATEGORIES}
              iconMap={goalCategoryMeta}
              placeholder="Category"
              allowCustom
            />
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
            <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="input-field" />
            <div className="flex space-x-2 sm:self-end">
              <button type="submit" className="btn-primary text-sm flex-1 justify-center">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary text-sm flex-1 justify-center">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {goals.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 animate-float">
              <FiTarget size={26} />
            </div>
            <p className="text-gray-400 dark:text-navy-500">No savings goals yet. Start by creating one!</p>
          </div>
        ) : (
          goals.map((goal, gi) => {
            const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const proj = projections?.projections?.find((p) => p._id === goal._id);
            const cat = categoryIcon(goal.category, goalCategoryMeta);
            const GoalIcon = cat.icon;
            return (
              <div key={goal._id} className={`card p-4 sm:p-6 card-hover reveal ${goal.isCompleted ? 'border-mint-300 dark:border-mint-700 bg-mint-50/30 dark:bg-mint-900/10' : ''}`} style={{ transitionDelay: `${Math.min(gi, 5) * 0.06}s` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6 ${goal.isCompleted ? 'bg-mint-100 dark:bg-mint-900/30 text-mint-600 dark:text-mint-400' : cat.bg + ' ' + cat.text}`}>
                      <GoalIcon size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{goal.title}</h3>
                        {goal.isCompleted && <span className="badge-green">Completed</span>}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 truncate mt-0.5">{goal.category}{goal.description ? ` · ${goal.description}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button onClick={() => handleEdit(goal)} aria-label="Edit" className="btn-ghost p-1.5" title="Edit"><FiEdit2 size={15} /></button>
                    <button onClick={() => setDeleteConfirm(goal._id)} aria-label="Delete" className="btn-ghost p-1.5 hover:text-red-600 dark:hover:text-red-400" title="Delete"><FiTrash2 size={15} /></button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(goal.currentAmount, goal.currency)} <span className="text-gray-400 dark:text-navy-500 font-normal">of</span> {formatCurrency(goal.targetAmount, goal.currency)}
                  </span>
                  {goal.targetDate && (
                    <span className="text-xs text-gray-400 dark:text-navy-500 flex items-center"><FiCalendar className="mr-1" size={14} /> {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  )}
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 sm:h-2.5 max-w-md overflow-hidden">
                  <div className={`h-2 sm:h-2.5 rounded-full transition-all duration-1000 ${goal.isCompleted ? 'bg-gradient-to-r from-mint-500 to-mint-600' : 'bg-gradient-to-r from-primary-500 to-magenta-500'} progress-shimmer`} style={{ width: `${progress}%` }} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <p className="text-xs text-gray-400 dark:text-navy-500">{progress}% complete · {formatCurrency(remaining, goal.currency)} remaining</p>
                  {proj && !goal.isCompleted && (
                    <>
                      {proj.monthsToGoal ? (
                        <p className="text-xs text-mint-600 dark:text-mint-400">
                          ~{proj.monthsToGoal} months at current rate
                          {proj.projectedDate ? ` (est. ${new Date(proj.projectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}
                        </p>
                      ) : (
                        <p className="text-xs text-sun-600 dark:text-sun-400">Increase savings to reach this goal</p>
                      )}
                      {proj.targetMonthsAway && proj.neededMonthly && (
                        <p className={`text-xs ${proj.onTrack ? 'text-mint-600 dark:text-mint-400' : 'text-sun-600 dark:text-sun-400'}`}>
                          {proj.onTrack ? 'On track' : `Need ${formatCurrency(proj.neededMonthly)}/mo`} to hit target date
                        </p>
                      )}
                    </>
                  )}
                </div>

                {!goal.isCompleted && (
                  <div className="mt-4 flex sm:justify-end">
                    <button onClick={() => { setAddFundsFor(goal); setAddAmount(''); }} className="btn-primary text-xs sm:text-sm px-4 py-2 w-full sm:w-auto justify-center">
                      + Add Funds
                    </button>
                  </div>
                )}
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
            <input type="number" min="0.01" step="0.01" required placeholder={`Amount to add (${addFundsFor.currency || 'INR'})`} value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="input-field mb-4" autoFocus />
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
