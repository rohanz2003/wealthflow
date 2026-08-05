import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2, FiCheckCircle, FiClock, FiTarget } from 'react-icons/fi';
import { habitTypeMeta } from '../utils/categoryMeta';

const HABIT_TYPES = ['saving', 'budgeting', 'investing', 'tracking', 'learning'];
const HABIT_FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', type: 'saving' });
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const [habRes, statRes] = await Promise.all([axios.get('/api/habits'), axios.get('/api/habits/stats')]);
      setHabits(habRes.data.data || habRes.data || []);
      setStats(statRes.data);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/habits', form);
      setForm({ name: '', description: '', frequency: 'daily', type: 'saving' });
      setShowForm(false);
      fetchHabits();
    } catch (err) { console.error('Error:', err); }
  };

  const handleComplete = async (id) => {
    try { await axios.post(`/api/habits/${id}/complete`); fetchHabits(); } catch (err) { console.error('Error:', err); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/api/habits/${id}`); fetchHabits(); setDeleteConfirm(null); } catch (err) { console.error('Error:', err); }
  };

  const toggleActive = async (habit) => {
    try { await axios.put(`/api/habits/${habit._id}`, { isActive: !habit.isActive }); fetchHabits(); } catch (err) { console.error('Error:', err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  const today = new Date().toDateString();
  const completedToday = habits.filter((h) => h.history?.some((x) => new Date(x.date).toDateString() === today && x.completed)).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="page-title">Financial Habits</h1>
          <p className="page-subtitle">Build consistent financial behaviors</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm w-full sm:w-auto justify-center">
          <FiPlus className="mr-2" size={18} /> New Habit
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Active Habits', value: stats.active, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
            { label: 'Completed Today', value: completedToday, color: 'text-mint-600 dark:text-mint-400', bg: 'bg-mint-100 dark:bg-mint-900/30' },
            { label: 'Total Streak', value: stats.totalStreak, color: 'text-sun-600 dark:text-sun-400', bg: 'bg-sun-100 dark:bg-sun-900/30' },
            { label: 'Avg Completions', value: stats.completionRate, color: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
          ].map((s, i) => (
            <div key={i} className="stat-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400">{s.label}</p>
                <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}><FiTarget size={14} /></div>
              </div>
              <p className={`text-lg sm:text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <input type="text" required placeholder="Habit name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="select-field">
              {HABIT_FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field">
              {HABIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex space-x-2 sm:self-end">
              <button type="submit" className="btn-primary text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Your Habits</h2>
        {habits.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 animate-float">
              <FiTarget size={26} />
            </div>
            <p className="text-gray-400 dark:text-navy-500">No habits yet. Create your first financial habit!</p>
          </div>
        ) : (
          habits.map((habit, i) => {
            const doneToday = habit.history?.some((h) => new Date(h.date).toDateString() === today && h.completed);
            const meta = habitTypeMeta[habit.type] || habitTypeMeta.tracking;
            const HabitIcon = meta.icon;
            return (
              <div key={habit._id} className={`card p-4 sm:p-5 card-hover reveal ${!habit.isActive ? 'opacity-60' : ''}`} style={{ transitionDelay: `${Math.min(i, 5) * 0.06}s` }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6 ${doneToday ? 'bg-mint-100 dark:bg-mint-900/30 text-mint-600 dark:text-mint-400' : meta.bg + ' ' + meta.text}`}>
                      <HabitIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{habit.name}</h3>
                        <span className={`badge ${habit.isActive ? 'badge-green' : 'bg-gray-100 dark:bg-navy-600 text-gray-500 dark:text-navy-400'}`}>
                          {habit.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      {habit.description && <p className="text-xs sm:text-sm text-gray-500 dark:text-navy-400 truncate">{habit.description}</p>}
                      <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                        <span className="text-xs text-gray-400 dark:text-navy-500 capitalize">{habit.frequency}</span>
                        <span className="text-xs text-gray-400 dark:text-navy-500">&middot;</span>
                        <span className="text-xs text-gray-400 dark:text-navy-500 capitalize">{habit.type}</span>
                        <span className="text-xs text-gray-400 dark:text-navy-500">&middot;</span>
                        <span className="text-xs font-medium text-sun-600 dark:text-sun-400">{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                        {habit.longestStreak > 0 && (
                          <><span className="text-xs text-gray-400 dark:text-navy-500">&middot;</span><span className="text-xs text-gray-500 dark:text-navy-400">Best: {habit.longestStreak}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {habit.isActive && !doneToday && (
                      <button onClick={() => handleComplete(habit._id)} className="btn-primary text-xs sm:text-sm px-3 py-1.5">
                        <FiCheckCircle className="mr-1.5" size={14} /> Complete
                      </button>
                    )}
                    {doneToday && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-mint-100 dark:bg-mint-900/20 text-mint-700 dark:text-mint-400 rounded-xl text-xs sm:text-sm font-medium">
                        <FiCheckCircle className="mr-1.5" size={14} /> Done
                      </span>
                    )}
                    <button onClick={() => toggleActive(habit)} aria-label={habit.isActive ? 'Pause' : 'Resume'} className="btn-ghost p-1.5">
                      <FiClock size={15} />
                    </button>
                    <button onClick={() => setDeleteConfirm(habit._id)} aria-label="Delete" className="btn-ghost p-1.5 hover:text-red-600 dark:hover:text-red-400"><FiTrash2 size={15} /></button>
                  </div>
                </div>
                {habit.history?.length > 0 && (
                  <div className="mt-3 flex items-center space-x-1 flex-wrap gap-1">
                    {habit.history.slice(-14).map((h, i) => (
                      <div key={i} className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[10px] sm:text-xs flex items-center justify-center font-medium transition-transform duration-300 hover:scale-110 ${h.completed ? 'bg-gradient-to-br from-mint-500 to-mint-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-navy-700 text-gray-400 dark:text-navy-500'}`} title={new Date(h.date).toLocaleDateString()}>
                        {new Date(h.date).getDate()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content p-5 sm:p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Delete this habit?</h3>
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
