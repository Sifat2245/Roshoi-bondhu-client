import React, { useState } from 'react';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../context/ToastContext';
import { useSession, signOut, authApi } from '../../../lib/auth-client';
import { useAuth } from '../../../context/AuthContext';
import { profileApi } from '../../profile/api/profile.api';
import {
  ChevronRight,
  AlertTriangle,
  Trash2,
  UserX,
  ShieldAlert,
  Lock,
  Clock,
} from 'lucide-react';

export interface SettingsManageAccountTabProps {
  user: any;
}

export const SettingsManageAccountTab: React.FC<SettingsManageAccountTabProps> = ({ user }) => {
  const { notify } = useToast();
  const { logoutUser, updateUser } = useAuth();
  const { data: session } = useSession();
  const token = session?.session?.token;

  // Deactivation / Deletion flow state
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'DEACTIVATE' | 'DELETE'>('DEACTIVATE');
  const [durationDays, setDurationDays] = useState<number>(0); // 0 = manual (reactivate on login)
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Edit profile info modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [savingDisplayName, setSavingDisplayName] = useState(false);

  const handleOpenDeactivateModal = () => {
    setActionType('DEACTIVATE');
    setDurationDays(0);
    setIsConfirmStep(false);
    setConfirmPassword('');
    setIsDeactivateModalOpen(true);
  };

  const handleProceedToConfirm = () => {
    setIsConfirmStep(true);
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPassword) {
      notify.error('Please enter your password to proceed.');
      return;
    }

    setProcessing(true);
    try {
      if (actionType === 'DEACTIVATE') {
        const res = await authApi.deactivateAccount(
          {
            password: confirmPassword,
            durationDays: durationDays > 0 ? durationDays : null,
          },
          token
        );
        notify.success(res.message || 'Account deactivated. You can log in anytime to reactivate.');
      } else {
        const res = await authApi.deleteAccount(
          { password: confirmPassword },
          token
        );
        notify.success(res.message || 'Account deleted successfully.');
      }

      setIsDeactivateModalOpen(false);

      if (logoutUser) {
        await logoutUser();
      } else {
        await signOut();
      }
      window.location.assign('/login');
    } catch (err: any) {
      notify.error(err.message || 'Action failed. Please verify your password and try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-150 select-none">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Manage account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          Control your Heshel Account profiles and settings.
        </p>
      </div>

      {/* 2. Connected Accounts Card */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-4.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Heshel Profile
            </span>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-[#343536] hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 transition cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="p-4 sm:p-4.5 flex items-center gap-3.5">
            <Avatar src={user?.image} alt={user?.name} size="md" />
            <div>
              <p className="font-bold text-base text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Account Ownership and Control (Deactivate / Delete) */}
      <div className="space-y-2 pt-2">
        <h3 className="font-bold text-base text-gray-900 dark:text-white">
          Account ownership and control
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1 leading-relaxed">
          Manage your data, deactivate or permanently delete your account.
        </p>

        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs overflow-hidden mt-3">
          <button
            type="button"
            onClick={handleOpenDeactivateModal}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <p className="font-bold text-base text-gray-900 dark:text-white">
                  Deactivation or deletion
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Temporarily deactivate or permanently delete your account
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Deactivation / Deletion Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title={
          !isConfirmStep
            ? 'Deactivate or delete account'
            : actionType === 'DEACTIVATE'
            ? 'Confirm Account Deactivation'
            : 'Confirm Permanent Account Deletion'
        }
        subtitle={
          actionType === 'DEACTIVATE'
            ? 'Take a temporary break from Heshel'
            : 'Permanently close your Heshel account'
        }
        maxWidth="max-w-md"
      >
        {!isConfirmStep ? (
          <div className="space-y-5 p-5 sm:p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Choose whether you want to take a temporary break or permanently delete your account access.
            </p>

            <fieldset className="space-y-3">
              <legend className="sr-only">Choose an account action</legend>
              {/* Option 1: Deactivate Account */}
              <label
                className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  actionType === 'DEACTIVATE'
                    ? 'border-[#e02f21] bg-red-50/40 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2e2f30]'
                }`}
              >
                <input
                  type="radio"
                  name="account_action"
                  value="DEACTIVATE"
                  checked={actionType === 'DEACTIVATE'}
                  onChange={() => setActionType('DEACTIVATE')}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#e02f21]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <UserX size={18} className="text-gray-700 dark:text-gray-300 shrink-0" />
                    <p className="font-bold text-base text-gray-900 dark:text-white">
                      Deactivate account
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Temporarily hide your profile and recipes. Logging back in will automatically reactivate your account.
                  </p>
                </div>
              </label>

              {/* Duration Selector when Deactivate is chosen */}
              {actionType === 'DEACTIVATE' && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#2c2d2e] border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <Clock size={15} className="text-[#e02f21]" />
                    <span>Deactivation Duration</span>
                  </div>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
                  >
                    <option value={0}>Manual — Reactivate when I log back in</option>
                    <option value={1}>1 Day timer (or reactivate on login)</option>
                    <option value={3}>3 Days timer (or reactivate on login)</option>
                    <option value={7}>7 Days timer (or reactivate on login)</option>
                    <option value={14}>14 Days timer (or reactivate on login)</option>
                    <option value={30}>30 Days timer (or reactivate on login)</option>
                  </select>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    <b>Reactivation rule:</b> When you try to log in yourself with your email and password, your account will immediately reactivate.
                  </p>
                </div>
              )}

              {/* Option 2: Delete Account */}
              <label
                className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  actionType === 'DELETE'
                    ? 'border-[#e02f21] bg-red-50/40 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2e2f30]'
                }`}
              >
                <input
                  type="radio"
                  name="account_action"
                  value="DELETE"
                  checked={actionType === 'DELETE'}
                  onChange={() => setActionType('DELETE')}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#e02f21]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Trash2 size={18} className="text-[#e02f21] shrink-0" />
                    <p className="font-bold text-base text-gray-900 dark:text-white">
                      Delete account
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Permanently delete your account access instantly. You will immediately lose access and will not be able to log in again.
                  </p>
                </div>
              </label>

              {/* Information when Delete is chosen */}
              {actionType === 'DELETE' && (
                <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 space-y-1.5">
                  <p className="text-xs font-bold text-[#e02f21] flex items-center gap-1.5">
                    <AlertTriangle size={15} /> Immediate and Permanent
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your access will be revoked immediately. The account records remain safely archived in the database, but access is permanently disabled.
                  </p>
                </div>
              )}
            </fieldset>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsDeactivateModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleProceedToConfirm}
                className="cursor-pointer"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          /* Password Confirmation Step */
          <form onSubmit={handleExecuteAction} className="space-y-5 p-5 sm:p-6">
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              actionType === 'DELETE'
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
            }`}>
              <ShieldAlert size={22} className={`shrink-0 mt-0.5 ${actionType === 'DELETE' ? 'text-[#e02f21]' : 'text-amber-600 dark:text-amber-400'}`} />
              <p className={`text-sm leading-relaxed ${actionType === 'DELETE' ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>
                {actionType === 'DELETE' ? (
                  <>
                    Please enter your password to confirm that you want to <b>permanently delete your account access instantly</b>.
                  </>
                ) : (
                  <>
                    Please enter your password to confirm <b>deactivating your account</b>. {durationDays > 0 ? `Set for ${durationDays} days.` : 'Manual reactivation on login.'}
                  </>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="account-action-password" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  id="account-action-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full pl-9 pr-3.5 py-3 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm sm:text-base dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={processing}
                onClick={() => setIsConfirmStep(false)}
                className="cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={processing}
                disabled={processing}
                variant={actionType === 'DELETE' ? 'danger' : 'primary'}
                size="md"
                className="cursor-pointer"
              >
                {actionType === 'DEACTIVATE' ? 'Deactivate Account' : 'Delete Account Instantly'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Profile Manage Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Manage Heshel Profile"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50 dark:bg-[#343536]">
            <Avatar src={user?.image} alt={user?.name} size="md" />
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-xs sm:text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={savingDisplayName}
              onClick={() => setIsEditProfileOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={savingDisplayName}
              disabled={savingDisplayName}
              onClick={async () => {
                if (!displayName.trim()) {
                  notify.error('Enter your display name.');
                  return;
                }
                setSavingDisplayName(true);
                try {
                  await profileApi.updateProfile({ name: displayName.trim() }, token);
                  if (updateUser) updateUser({ name: displayName.trim() });
                  notify.success('Display name updated successfully.');
                  setIsEditProfileOpen(false);
                } catch (err: any) {
                  notify.error(err.message || 'Could not update display name.');
                } finally {
                  setSavingDisplayName(false);
                }
              }}
              className="cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsManageAccountTab;
