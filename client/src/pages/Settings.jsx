import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiDownload, FiTrash2, FiAlertTriangle, FiCheck, FiX, FiCalendar, FiClock,
  FiBriefcase, FiDollarSign, FiEdit2, FiSave, FiMail, FiShield, FiStar, FiAward,
  FiLogOut, FiMessageSquare, FiSend,
} from 'react-icons/fi';
import { formatCurrency, setBaseCurrency } from '../utils/formatCurrency';
import { CURRENCY_INFO, CURRENCIES } from '../utils/currency';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ occupation: '', monthlyIncome: '', bio: '', currency: 'INR' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', message: '' });
  const [myFeedback, setMyFeedback] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);

  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true }).then((res) => {
      setProfile(res.data);
      setProfileForm({
        occupation: res.data.profile?.occupation || '',
        monthlyIncome: res.data.profile?.monthlyIncome?.toString() || '',
        bio: res.data.profile?.bio || '',
        currency: res.data.currency || 'INR',
      });
    }).catch(() => {}).finally(() => setProfileLoading(false));

    axios.get('/api/feedback/my').then((res) => setMyFeedback(res.data)).catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileSaving(true);
    try {
      const res = await axios.put('/api/auth/profile', {
        occupation: profileForm.occupation,
        monthlyIncome: Number(profileForm.monthlyIncome) || 0,
        bio: profileForm.bio,
        currency: profileForm.currency,
      });
      setBaseCurrency(res.data.currency);
      setProfile(res.data);
      setProfileMsg('Profile updated');
      setTimeout(() => setProfileMsg(''), 3000);
      setEditingProfile(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axios.get('/api/user/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wealthflow-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== 'DELETE') return;
    setDeleting(true);
    try {
      await axios.delete('/api/user/account');
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      const res = await axios.put('/api/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg(res.data.message);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMsg('');
    setFeedbackError('');
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      setFeedbackError('Please fill in both subject and message');
      return;
    }
    setFeedbackSending(true);
    try {
      const res = await axios.post('/api/feedback', {
        subject: feedbackForm.subject,
        message: feedbackForm.message,
      });
      setMyFeedback((prev) => [res.data, ...prev]);
      setFeedbackForm({ subject: '', message: '' });
      setFeedbackMsg('Feedback submitted! Our team will review it shortly.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFeedbackError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSending(false);
    }
  };

  const p = profile || user || {};
  const joinedDate = p.createdAt ? new Date(p.createdAt) : null;
  const lastActive = p.lastActive ? new Date(p.lastActive) : null;
  const memberFor = joinedDate ? Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const occupation = p.profile?.occupation || '';
  const monthlyIncome = p.profile?.monthlyIncome || 0;
  const bio = p.profile?.bio || '';
  const currency = p.currency || 'INR';
  const currencyInfo = CURRENCY_INFO[currency] || CURRENCY_INFO.INR;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 animate-fade-up">
        <div className="min-w-0">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account, profile and data</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleLogout} className="btn-outline text-xs px-3 py-1.5 whitespace-nowrap md:hidden">
            <FiLogOut className="mr-1.5" size={14} /> Sign Out
          </button>
          <button onClick={() => setEditingProfile(!editingProfile)} className="btn-outline text-xs px-3 py-1.5 whitespace-nowrap">
            <FiEdit2 className="mr-1.5" size={14} /> {editingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden reveal">
        <div className="h-24 sm:h-32 gradient-primary relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 120%, rgba(255,255,255,0.5) 0, transparent 50%), radial-gradient(circle at 80% -40%, rgba(255,255,255,0.4) 0, transparent 45%)' }} />
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-white/90 text-xs font-semibold bg-black/20 rounded-full px-3 py-1">
            <FiShield size={12} />
            {p.role === 'admin' ? 'Administrator' : 'Verified User'}
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-6 -mt-10 sm:-mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl gradient-primary ring-4 ring-white dark:ring-navy-900 flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-glow animate-fade-up">
              {(p.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 sm:pb-1 animate-fade-up" style={{ animationDelay: '0.06s' }}>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                {p.name}
                {p.role === 'admin' && <FiStar className="text-sun-500 dark:text-sun-400" size={20} />}
              </h2>
              {occupation ? (
                <p className="text-sm font-medium text-primary-600 dark:text-primary-300 flex items-center mt-0.5">
                  <FiBriefcase className="mr-1.5" size={14} /> {occupation}
                </p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-navy-500">No occupation set yet</p>
              )}
              <p className="text-sm text-gray-500 dark:text-navy-400 flex items-center mt-0.5">
                <FiMail className="mr-1.5" size={13} /> {p.email}
              </p>
            </div>
          </div>

          {!editingProfile && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-navy-800 rounded-xl card-hover transition-transform duration-300 hover:-translate-y-0.5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <p className="text-xs text-gray-500 dark:text-navy-400 flex items-center"><FiCalendar className="mr-1" size={12} /> Joined</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{joinedDate ? joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-navy-800 rounded-xl card-hover transition-transform duration-300 hover:-translate-y-0.5 animate-fade-up" style={{ animationDelay: '0.16s' }}>
                <p className="text-xs text-gray-500 dark:text-navy-400 flex items-center"><FiClock className="mr-1" size={12} /> Member for</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{memberFor > 0 ? `${memberFor} days` : 'Today'}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-navy-800 rounded-xl card-hover transition-transform duration-300 hover:-translate-y-0.5 animate-fade-up" style={{ animationDelay: '0.22s' }}>
                <p className="text-xs text-gray-500 dark:text-navy-400 flex items-center"><FiAward className="mr-1" size={12} /> Last Active</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{lastActive ? lastActive.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-navy-800 rounded-xl card-hover transition-transform duration-300 hover:-translate-y-0.5 animate-fade-up" style={{ animationDelay: '0.28s' }}>
                <p className="text-xs text-gray-500 dark:text-navy-400 flex items-center"><FiDollarSign className="mr-1" size={12} /> Monthly Income</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{monthlyIncome > 0 ? formatCurrency(monthlyIncome) : '-'}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-navy-800 rounded-xl card-hover transition-transform duration-300 hover:-translate-y-0.5 animate-fade-up" style={{ animationDelay: '0.34s' }}>
                <p className="text-xs text-gray-500 dark:text-navy-400 flex items-center"><FiDollarSign className="mr-1" size={12} /> Currency</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{currencyInfo.symbol} {currency} — {currencyInfo.name}</p>
              </div>
            </div>
          )}

          {!editingProfile && bio && (
            <p className="text-sm text-gray-600 dark:text-navy-300 mt-4 px-1 border-l-2 border-primary-400 dark:border-primary-500 pl-3 animate-fade-up" style={{ animationDelay: '0.32s' }}>
              {bio}
            </p>
          )}
        </div>

        {editingProfile && (
          <form onSubmit={handleSaveProfile} className="border-t border-gray-200 dark:border-navy-700 px-4 sm:px-6 py-5 space-y-4 animate-fade-down">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center"><FiEdit2 className="mr-1.5" size={14} /> Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-occupation" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Occupation / Profession</label>
                <input type="text" id="profile-occupation" value={profileForm.occupation} onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })} className="input-field" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label htmlFor="profile-income" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Monthly Income ({currencyInfo.symbol})</label>
                <input type="number" id="profile-income" min="0" value={profileForm.monthlyIncome} onChange={(e) => setProfileForm({ ...profileForm, monthlyIncome: e.target.value })} className="input-field" placeholder="e.g. 50000" />
              </div>
              <div>
                <label htmlFor="profile-currency" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Country / Currency</label>
                <select id="profile-currency" value={profileForm.currency} onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })} className="input-field">
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>{CURRENCY_INFO[code].symbol} {code} — {CURRENCY_INFO[code].name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Bio</label>
              <textarea id="profile-bio" rows={2} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="input-field" placeholder="Tell us about yourself..." />
            </div>
            {profileError && <p className="text-sm text-red-600 dark:text-red-400 flex items-center"><FiX className="mr-1" size={14} />{profileError}</p>}
            {profileMsg && <p className="text-sm text-mint-600 dark:text-mint-400 flex items-center"><FiCheck className="mr-1" size={14} />{profileMsg}</p>}
            <button type="submit" disabled={profileSaving} className="btn-primary text-sm">
              <FiSave className="mr-1.5" size={14} /> {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 reveal reveal-delay-1 animate-fade-up">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Change Password</h3>
          <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">Update your account password</p>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="settings-current-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Current Password</label>
              <input type="password" required id="settings-current-password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input-field" placeholder="Enter current password" />
            </div>
            <div>
              <label htmlFor="settings-new-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">New Password</label>
              <input type="password" required minLength={8} id="settings-new-password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input-field" placeholder="Min 8 characters, uppercase, lowercase, number" />
            </div>
            <div>
              <label htmlFor="settings-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Confirm New Password</label>
              <input type="password" required id="settings-confirm-password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="input-field" placeholder="Confirm new password" />
            </div>
            {pwError && <p className="text-sm text-red-600 dark:text-red-400 flex items-center"><FiX className="mr-1" size={14} />{pwError}</p>}
            {pwMsg && <p className="text-sm text-mint-600 dark:text-mint-400 flex items-center"><FiCheck className="mr-1" size={14} />{pwMsg}</p>}
            <button type="submit" disabled={pwLoading} className="btn-primary text-sm">
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card p-6 reveal reveal-delay-2 animate-fade-up">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Export Your Data</h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">Download all your financial data as JSON</p>
            <button onClick={handleExport} disabled={exporting} className="btn-outline text-sm">
              <FiDownload className="mr-2" size={16} />
              {exporting ? 'Exporting...' : exportDone ? 'Exported!' : 'Export Data'}
            </button>
          </div>

          <div className="card p-6 border-red-200 dark:border-red-900 reveal reveal-delay-3 animate-fade-up">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center">
              <FiAlertTriangle className="mr-2" size={18} /> Delete Account
            </h3>
            <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <div className="space-y-3">
              <p className="text-xs text-gray-400 dark:text-navy-500">Type <strong>DELETE</strong> to confirm:</p>
              <input type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="input-field text-sm" placeholder='Type "DELETE" to confirm' />
              <button onClick={handleDeleteAccount} disabled={confirmDelete !== 'DELETE' || deleting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors flex items-center">
                <FiTrash2 className="mr-2" size={16} />
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6 reveal animate-fade-up">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiMessageSquare className="mr-2 text-primary-500" size={18} /> Feedback & Support
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${myFeedback.some((f) => f.status === 'open') ? 'bg-sun-100 dark:bg-sun-900/30 text-sun-700 dark:text-sun-400' : 'bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-navy-400'}`}>
            {myFeedback.some((f) => f.status === 'open') ? '1+ awaiting reply' : 'No open queries'}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">Found an issue or have a suggestion? Send it to our team — we'll respond right here.</p>

        <form onSubmit={handleFeedbackSubmit} className="space-y-3 mb-6">
          <div>
            <label htmlFor="feedback-subject" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Subject</label>
            <input type="text" id="feedback-subject" value={feedbackForm.subject} maxLength={100} onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })} className="input-field" placeholder="e.g. App crashes when adding expense" />
          </div>
          <div>
            <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Message</label>
            <textarea id="feedback-message" rows={3} maxLength={2000} value={feedbackForm.message} onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })} className="input-field" placeholder="Describe the issue or your suggestion..." />
          </div>
          {feedbackError && <p className="text-sm text-red-600 dark:text-red-400 flex items-center"><FiX className="mr-1" size={14} />{feedbackError}</p>}
          {feedbackMsg && <p className="text-sm text-mint-600 dark:text-mint-400 flex items-center"><FiCheck className="mr-1" size={14} />{feedbackMsg}</p>}
          <button type="submit" disabled={feedbackSending} className="btn-primary text-sm">
            <FiSend className="mr-1.5" size={14} /> {feedbackSending ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>

        {myFeedback.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-navy-200">Your Queries</h4>
            {myFeedback.map((f) => (
              <div key={f._id} className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${f.status === 'open' ? 'bg-sun-100 dark:bg-sun-900/30 text-sun-700 dark:text-sun-400' : 'bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-400'}`}>
                    {f.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-navy-400 mt-1.5">{f.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 dark:text-navy-500">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {f.status === 'open' && <span className="text-xs text-sun-600 dark:text-sun-400 font-medium">Awaiting response</span>}
                </div>
                {f.status === 'resolved' && f.resolutionNote && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-navy-700">
                    <p className="text-xs font-medium text-mint-600 dark:text-mint-400 mb-0.5">Response from team:</p>
                    <p className="text-sm text-gray-600 dark:text-navy-300">{f.resolutionNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
