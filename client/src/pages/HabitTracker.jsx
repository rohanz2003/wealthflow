import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiTrash2, FiCheckCircle, FiClock, FiTarget, FiAlertCircle, FiArrowRight, FiZap, FiX } from 'react-icons/fi';
import { habitTypeMeta } from '../utils/categoryMeta';
import Select from '../components/Select';

const HABIT_TYPES = ['saving', 'budgeting', 'investing', 'tracking', 'learning'];
const HABIT_FREQUENCIES = ['daily', 'weekly', 'monthly'];

const FREQUENCY_LABELS = { daily: 'Every day', weekly: 'Every week', monthly: 'Every month' };
const TYPE_LABELS = {
  saving: 'Saving money',
  budgeting: 'Budgeting',
  investing: 'Investing',
  tracking: 'Tracking spend',
  learning: 'Financial learning',
};

const EXAMPLES = [
  { name: 'Save a little every day', description: 'Put aside a small amount of money daily', type: 'saving', frequency: 'daily' },
  { name: 'Log every expense', description: 'Record each purchase so you know where money goes', type: 'tracking', frequency: 'daily' },
  { name: 'No impulse purchases', description: 'Wait 24 hours before any non-essential buy', type: 'budgeting', frequency: 'daily' },
  { name: 'Review my budget weekly', description: 'Check the budget each week and adjust', type: 'budgeting', frequency: 'weekly' },
  { name: 'Learn about investing', description: 'Read one article about money each week', type: 'learning', frequency: 'weekly' },
];

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function HabitTracker() {
  const location = useLocation();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', type: 'saving' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [revealedIds, setRevealedIds] = useState([]);
  const toastTimer = useRef(null);

  useEffect(() => { fetchHabits(); }, []);

  useEffect(() => {
    const id = location.state?.highlight;
    if (!id) return;
    setHighlightId(id);
    setRevealedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    window.history.replaceState({}, '');
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`habit-${highlightId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightId, habits, loading]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const fetchHabits = async () => {
    try {
      const [habRes, statRes] = await Promise.all([axios.get('/api/habits'), axios.get('/api/habits/stats')]);
      setHabits(habRes.data.data || habRes.data || []);
      setStats(statRes.data);
    } catch (err) {
      console.error('Error:', err);
      showToast('Could not load habits. Check your connection.', 'error');
    } finally { setLoading(false); }
  };

  const createHabit = async (payload, silent = false) => {
    setCreating(true);
    try {
      await axios.post('/api/habits', payload);
      setForm({ name: '', description: '', frequency: 'daily', type: 'saving' });
      setShowForm(false);
      await fetchHabits();
      if (!silent) showToast('Habit created! Complete it next time it is due.');
    } catch (err) {
      console.error('Error:', err);
      showToast(err.response?.data?.message || 'Could not create the habit.', 'error');
    } finally { setCreating(false); }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    createHabit(form);
  };

  const handleComplete = async (id) => {
    setCompletingId(id);
    try {
      await axios.post(`/api/habits/${id}/complete`);
      await fetchHabits();
      showToast('Nice! Habit completed for today.');
    } catch (err) {
      console.error('Error:', err);
      showToast(err.response?.data?.message || 'Could not complete the habit.', 'error');
    } finally { setCompletingId(null); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/habits/${id}`);
      setDeleteConfirm(null);
      await fetchHabits();
      showToast('Habit deleted.');
    } catch (err) { console.error('Error:', err); }
  };

  const toggleActive = async (habit) => {
    try {
      await axios.put(`/api/habits/${habit._id}`, { isActive: !habit.isActive });
      await fetchHabits();
    } catch (err) { console.error('Error:', err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-200 dark:border-navy-600 border-t-primary-600 dark:border-t-primary-400" /></div>;
  }

  const todayStr = new Date().toDateString();
  const completedToday = habits.filter((h) => h.history?.some((x) => new Date(x.date).toDateString() === todayStr && x.completed)).length;
  const weekDays = lastNDays(7);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="page-title">Financial Habits</h1>
          <p className="page-subtitle">Small money actions that you repeat to build a healthy routine</p>
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
            { label: 'Longest Streak', value: Math.max(0, ...habits.map((h) => h.longestStreak || 0)), color: 'text-sun-600 dark:text-sun-400', bg: 'bg-sun-100 dark:bg-sun-900/30' },
            { label: 'All-time Completions', value: habits.reduce((s, h) => s + (h.totalCompletions || 0), 0), color: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
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
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create a new habit</h3>
            <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-xl text-gray-400 dark:text-navy-400 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-400 mb-1.5">What will you do?</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Save $5 every day"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-400 mb-1.5">Why it matters <span className="normal-case text-gray-400 dark:text-navy-500">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Build an emergency fund"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-400 mb-1.5">How often?</label>
              <Select
                value={form.frequency}
                onChange={(v) => setForm({ ...form, frequency: v })}
                options={HABIT_FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABELS[f] }))}
                placeholder="Frequency"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-navy-400 mb-1.5">What kind of habit?</label>
              <Select
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                options={HABIT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
                iconMap={habitTypeMeta}
                placeholder="Habit type"
                allowCustom
                customLabel="Other (type your own)"
              />
            </div>

            <div className="flex space-x-2 md:col-span-2 lg:col-span-4">
              <button type="submit" disabled={creating} className="btn-primary text-sm disabled:opacity-60">
                {creating ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                ) : <FiCheckCircle className="mr-1.5" size={16} />}
                {creating ? 'Creating…' : 'Create Habit'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} disabled={creating} className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-navy-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Your Habits</h2>
        {habits.length === 0 ? (
          <div className="card p-6 sm:p-10 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow animate-float">
              <FiTarget size={28} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Build better money habits</h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 max-w-md mx-auto mb-1">
              A financial habit is a small action you repeat on a schedule &mdash; like saving a little every day, logging your spending, or reviewing your budget each week.
            </p>
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-navy-400 my-5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">1. Create a habit</span>
              <FiArrowRight size={14} className="text-gray-400 dark:text-navy-500" />
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-400 font-medium">2. Complete it when due</span>
              <FiArrowRight size={14} className="text-gray-400 dark:text-navy-500" />
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sun-100 dark:bg-sun-900/30 text-sun-700 dark:text-sun-500 font-medium">3. Build a streak</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-navy-500 mb-3">Or start with one of these</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => {
                const m = habitTypeMeta[ex.type];
                const Icon = m.icon;
                return (
                  <button
                    key={ex.name}
                    onClick={() => createHabit(ex, true)}
                    disabled={creating}
                    className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-600 dark:text-navy-300 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-700 dark:hover:text-primary-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
                  >
                    <Icon className={`mr-1.5 ${m.text}`} size={15} />
                    {ex.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          habits.map((habit, i) => {
            const doneToday = habit.history?.some((h) => new Date(h.date).toDateString() === todayStr && h.completed);
            const meta = habitTypeMeta[habit.type] || habitTypeMeta.tracking;
            const HabitIcon = meta.icon;
            const days = weekDays.map((d) => ({
              date: d,
              done: habit.history?.some((h) => new Date(h.date).toDateString() === d.toDateString() && h.completed),
              isToday: d.toDateString() === todayStr,
            }));
            const doneIn7 = days.filter((d) => d.done).length;
            return (
              <div key={habit._id} id={`habit-${habit._id}`} className={`card p-4 sm:p-5 card-hover reveal scroll-mt-24 ${!habit.isActive ? 'opacity-60' : ''} ${highlightId === habit._id || revealedIds.includes(habit._id) ? 'reveal-visible' : ''} ${highlightId === habit._id ? 'animate-highlight border-primary-400 dark:border-primary-500 ring-2 ring-primary-400/40' : ''}`} style={{ transitionDelay: `${Math.min(i, 5) * 0.06}s` }}>
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
                        <span className="text-xs text-gray-400 dark:text-navy-500">{FREQUENCY_LABELS[habit.frequency] || habit.frequency}</span>
                        <span className="text-xs text-gray-400 dark:text-navy-500">&middot;</span>
                        <span className="text-xs text-gray-400 dark:text-navy-500">{TYPE_LABELS[habit.type] || habit.type}</span>
                        <span className="text-xs text-gray-400 dark:text-navy-500">&middot;</span>
                        <span className="text-xs font-medium text-sun-600 dark:text-sun-400">{habit.streak} day{habit.streak !== 1 ? 's' : ''} streak</span>
                        {habit.longestStreak > 0 && (
                          <><span className="text-xs text-gray-400 dark:text-navy-500">&middot;</span><span className="text-xs text-gray-500 dark:text-navy-400">Best: {habit.longestStreak}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {habit.isActive && !doneToday && (
                      <button
                        onClick={() => handleComplete(habit._id)}
                        disabled={completingId === habit._id}
                        className="btn-primary text-xs sm:text-sm px-3 py-1.5 disabled:opacity-60"
                      >
                        {completingId === habit._id ? (
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent align-middle mr-1.5" />
                        ) : (
                          <FiCheckCircle className="mr-1.5" size={14} />
                        )}
                        {completingId === habit._id ? 'Saving…' : 'Complete today'}
                      </button>
                    )}
                    {doneToday && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-mint-100 dark:bg-mint-900/20 text-mint-700 dark:text-mint-400 rounded-xl text-xs sm:text-sm font-medium">
                        <FiCheckCircle className="mr-1.5" size={14} /> Done today
                      </span>
                    )}
                    <button onClick={() => toggleActive(habit)} aria-label={habit.isActive ? 'Pause' : 'Resume'} className="btn-ghost icon-btn-touch" title={habit.isActive ? 'Pause this habit' : 'Resume this habit'}>
                      <FiClock size={15} />
                    </button>
                    <button onClick={() => setDeleteConfirm(habit._id)} aria-label="Delete" className="btn-ghost icon-btn-touch hover:text-red-600 dark:hover:text-red-400" title="Delete"><FiTrash2 size={15} /></button>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] sm:text-xs text-gray-400 dark:text-navy-500">{doneIn7} of the last 7 days</span>
                    <span className="text-[11px] sm:text-xs text-primary-500 dark:text-primary-400 font-medium flex items-center"><FiZap size={11} className="mr-1" /> Completed {habit.streak} in a row</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-wrap gap-1">
                    {days.map((d) => (
                      <div
                        key={d.date.toDateString()}
                        title={`${d.date.toLocaleDateString()} — ${d.done ? 'Completed' : d.isToday ? 'Not completed yet today' : 'Not completed'}`}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-transform duration-300 hover:scale-110 ${
                          d.done
                            ? 'bg-gradient-to-br from-mint-500 to-mint-600 text-white shadow-sm'
                            : d.isToday
                              ? 'bg-primary-100 dark:bg-navy-700 text-primary-600 dark:text-primary-300 ring-2 ring-primary-300 dark:ring-primary-600'
                              : 'bg-gray-100 dark:bg-navy-700 text-gray-400 dark:text-navy-500'
                        }`}
                      >
                        {WEEKDAY_INITIALS[d.date.getDay()]}
                        <span className="text-[8px] opacity-80">{d.date.getDate()}</span>
                      </div>
                    ))}
                  </div>
                </div>
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

      {toast && (
        <div className={`fixed z-[100] inset-x-4 sm:inset-x-auto bottom-20 sm:bottom-6 sm:right-6 sm:max-w-sm px-4 py-3 rounded-xl shadow-elevated text-sm font-medium animate-pop-in flex items-center space-x-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-mint-600 text-white'}`}>
          {toast.type === 'error' ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}