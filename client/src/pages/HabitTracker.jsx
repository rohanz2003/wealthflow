import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi';

const HABIT_TYPES = ['saving', 'budgeting', 'investing', 'tracking', 'learning'];
const HABIT_FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', type: 'saving' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const [habRes, statRes] = await Promise.all([axios.get('/api/habits'), axios.get('/api/habits/stats')]);
      setHabits(habRes.data);
      setStats(statRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/habits', form);
      setForm({ name: '', description: '', frequency: 'daily', type: 'saving' });
      setShowForm(false);
      fetchHabits();
    } catch (err) {
      console.error('Error creating habit:', err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.post(`/api/habits/${id}/complete`);
      fetchHabits();
    } catch (err) {
      console.error('Error completing habit:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return;
    try {
      await axios.delete(`/api/habits/${id}`);
      fetchHabits();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const toggleActive = async (habit) => {
    try {
      await axios.put(`/api/habits/${habit._id}`, { isActive: !habit.isActive });
      fetchHabits();
    } catch (err) {
      console.error('Error toggling:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  const today = new Date().toDateString();
  const completedToday = habits.filter((h) => h.history?.some((x) => new Date(x.date).toDateString() === today && x.completed)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Habits</h1>
          <p className="text-gray-500">Build consistent financial behaviors</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <FiPlus className="mr-2" size={18} /> New Habit
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Habits', value: stats.active, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed Today', value: completedToday, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Streak', value: stats.totalStreak, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Avg Completions', value: stats.completionRate, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input type="text" required placeholder="Habit name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              {HABIT_FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              {HABIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex space-x-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Habits</h2>
        {habits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-400">No habits yet. Create your first financial habit!</p>
          </div>
        ) : (
          habits.map((habit) => {
            const doneToday = habit.history?.some((h) => new Date(h.date).toDateString() === today && h.completed);
            return (
              <div key={habit._id} className={`bg-white rounded-xl border p-5 card-hover ${!habit.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${doneToday ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {habit.type === 'saving' ? '💰' : habit.type === 'budgeting' ? '📊' : habit.type === 'investing' ? '📈' : habit.type === 'tracking' ? '📝' : '📚'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${habit.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {habit.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      {habit.description && <p className="text-sm text-gray-500">{habit.description}</p>}
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-400 capitalize">{habit.frequency}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400 capitalize">{habit.type}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs font-medium text-orange-600">🔥 {habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                        {habit.longestStreak > 0 && (
                          <>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">Best: {habit.longestStreak}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {habit.isActive && !doneToday && (
                      <button onClick={() => handleComplete(habit._id)} className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                        <FiCheckCircle className="mr-1.5" size={16} /> Complete
                      </button>
                    )}
                    {doneToday && (
                      <span className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                        <FiCheckCircle className="mr-1.5" size={16} /> Done
                      </span>
                    )}
                    <button onClick={() => toggleActive(habit)} className={`p-2 rounded-lg text-sm ${habit.isActive ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                      <FiClock size={16} />
                    </button>
                    <button onClick={() => handleDelete(habit._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                  </div>
                </div>
                {habit.history && habit.history.length > 0 && (
                  <div className="mt-3 flex items-center space-x-1">
                    {habit.history.slice(-14).map((h, i) => (
                      <div key={i} className={`w-6 h-6 rounded text-xs flex items-center justify-center ${h.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`} title={new Date(h.date).toLocaleDateString()}>
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
    </div>
  );
}
