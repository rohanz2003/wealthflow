import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiTrash2, FiLock, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

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

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and data</p>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Change Password</h3>
        <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">Update your account password</p>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Current Password</label>
            <input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input-field" placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">New Password</label>
            <input type="password" required minLength={8} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input-field" placeholder="Min 8 characters, uppercase, lowercase, number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-navy-300 mb-1">Confirm New Password</label>
            <input type="password" required value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="input-field" placeholder="Confirm new password" />
          </div>
          {pwError && <p className="text-sm text-red-600 dark:text-red-400 flex items-center"><FiX className="mr-1" size={14} />{pwError}</p>}
          {pwMsg && <p className="text-sm text-green-600 dark:text-green-400 flex items-center"><FiCheck className="mr-1" size={14} />{pwMsg}</p>}
          <button type="submit" disabled={pwLoading} className="btn-primary text-sm">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Export Your Data</h3>
        <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">Download all your financial data as JSON</p>
        <button onClick={handleExport} disabled={exporting} className="btn-outline text-sm">
          <FiDownload className="mr-2" size={16} />
          {exporting ? 'Exporting...' : exportDone ? 'Exported!' : 'Export Data'}
        </button>
      </div>

      <div className="card p-6 border-red-200 dark:border-red-900">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center">
          <FiAlertTriangle className="mr-2" size={18} /> Delete Account
        </h3>
        <p className="text-sm text-gray-500 dark:text-navy-400 mb-4">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <div className="space-y-3 max-w-md">
          <p className="text-xs text-gray-400 dark:text-navy-500">Type <strong>DELETE</strong> to confirm:</p>
          <input type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="input-field text-sm" placeholder='Type "DELETE" to confirm' />
          <button onClick={handleDeleteAccount} disabled={confirmDelete !== 'DELETE' || deleting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors flex items-center">
            <FiTrash2 className="mr-2" size={16} />
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
