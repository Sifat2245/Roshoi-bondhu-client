import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useSession, authApi } from '../../lib/auth-client';
import { ArrowLeft, Lock, ShieldCheck, KeyRound } from 'lucide-react';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: session } = useSession();
  const token = session?.session?.token;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      notify.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      notify.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify.error('New passwords do not match. Please verify and try again.');
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(
        {
          currentPassword,
          newPassword,
        },
        token
      );

      notify.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/settings?tab=SECURITY');
      }, 1000);
    } catch (err: any) {
      notify.error(err.message || 'Could not change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      isMobileSubpage={true}
      sidebar={
        <SettingsSidebar
          activeTab="SECURITY"
          onSelectTab={(tab) => navigate(tab === 'HOME' ? '/settings' : `/settings?tab=${tab}`)}
        />
      }
    >
      <div className="max-w-xl mx-auto py-2 space-y-6 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings?tab=SECURITY')}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Change Password
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose a strong, unique password to protect your Heshel account.
            </p>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-medium">
            <ShieldCheck size={20} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              Your password should be at least 6 characters and include a combination of numbers, letters, and special characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Current Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white border border-transparent focus:border-red-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white border border-transparent focus:border-red-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white border border-transparent focus:border-red-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#e02f21] hover:underline text-center sm:text-left py-1"
              >
                Forgot your password?
              </Link>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={saving}
                  onClick={() => navigate('/settings?tab=SECURITY')}
                  className="flex-1 sm:flex-none justify-center whitespace-nowrap"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={saving}
                  disabled={saving}
                  className="flex-1 sm:flex-none justify-center whitespace-nowrap"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ChangePasswordPage;

