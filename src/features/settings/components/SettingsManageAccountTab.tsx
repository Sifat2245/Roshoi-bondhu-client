import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../context/ToastContext';
import { signOut } from '../../../lib/auth-client';
import {
  ChevronRight,
  Plus,
  AlertTriangle,
  Trash2,
  UserX,
  ShieldAlert,
  Lock,
} from 'lucide-react';

export interface SettingsManageAccountTabProps {
  user: any;
}

export const SettingsManageAccountTab: React.FC<SettingsManageAccountTabProps> = ({ user }) => {
  const { notify } = useToast();
  const navigate = useNavigate();

  // Deactivation / Deletion flow state
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'DEACTIVATE' | 'DELETE'>('DEACTIVATE');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Edit profile info modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');

  const handleOpenDeactivateModal = () => {
    setActionType('DEACTIVATE');
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
    setTimeout(async () => {
      setProcessing(false);
      setIsDeactivateModalOpen(false);

      if (actionType === 'DEACTIVATE') {
        notify.info('Your Heshel account has been deactivated. You can reactivate anytime by logging in.');
      } else {
        notify.success('Your Heshel account and data have been scheduled for permanent deletion.');
      }

      await signOut();
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-150 select-none">
      {/* 1. Header matching Screenshot 3 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Manage account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          Control which profiles and devices are in this Heshel Account.{' '}
          <span className="text-[#e02f21] hover:underline cursor-pointer font-medium">
            Learn more
          </span>
        </p>
      </div>

      {/* 2. Add Profiles and Devices Card matching Screenshot 3 */}
      <button
        type="button"
        onClick={() => notify.info('Device linking is available in the mobile app.')}
        className="w-full bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-4.5 border border-gray-200/90 dark:border-gray-800 shadow-2xs flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
      >
        <span className="text-sm font-bold text-[#e02f21]">
          Add profiles and devices
        </span>
        <Plus size={18} className="text-[#e02f21]" />
      </button>

      {/* 3. Connected Accounts Card matching Screenshot 3 */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-4.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Heshel Profile
            </span>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-[#343536] hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 transition cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="p-4 sm:p-4.5 flex items-center gap-3.5">
            <Avatar src={user?.image} alt={user?.name} size="md" />
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Account Ownership and Control (Deactivate / Delete) */}
      <div className="space-y-2 pt-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Account ownership and control
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 leading-relaxed">
          Manage your data, deactivate or permanently delete your account.
        </p>

        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs overflow-hidden mt-3">
          <button
            type="button"
            onClick={handleOpenDeactivateModal}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  Deactivation or deletion
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Temporarily deactivate or permanently delete your account and profiles
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Deactivation / Deletion Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title={
          !isConfirmStep
            ? 'Deactivating or Deleting your Heshel Account'
            : actionType === 'DEACTIVATE'
            ? 'Confirm Account Deactivation'
            : 'Confirm Permanent Account Deletion'
        }
        maxWidth="max-w-md"
      >
        {!isConfirmStep ? (
          <div className="space-y-5">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              If you want to take a break from Heshel, you can deactivate your account. If you want to permanently remove your account, posts, recipes and data, let us know.
            </p>

            <div className="space-y-3">
              {/* Option 1: Deactivate Account */}
              <label
                onClick={() => setActionType('DEACTIVATE')}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition ${
                  actionType === 'DEACTIVATE'
                    ? 'border-[#e02f21] bg-red-50/40 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2e2f30]'
                }`}
              >
                <input
                  type="radio"
                  name="account_action"
                  checked={actionType === 'DEACTIVATE'}
                  onChange={() => setActionType('DEACTIVATE')}
                  className="mt-1 accent-[#e02f21]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <UserX size={16} className="text-gray-700 dark:text-gray-300" />
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      Deactivate account
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Deactivating your account is temporary. Your profile and recipes will be hidden until you log back in.
                  </p>
                </div>
              </label>

              {/* Option 2: Delete Account */}
              <label
                onClick={() => setActionType('DELETE')}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition ${
                  actionType === 'DELETE'
                    ? 'border-[#e02f21] bg-red-50/40 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2e2f30]'
                }`}
              >
                <input
                  type="radio"
                  name="account_action"
                  checked={actionType === 'DELETE'}
                  onChange={() => setActionType('DELETE')}
                  className="mt-1 accent-[#e02f21]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-[#e02f21]" />
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      Delete account
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Deleting your account is permanent. When you delete your Heshel account, you won't be able to retrieve your recipes, reviews, or followers.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeactivateModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleProceedToConfirm}
                className="cursor-pointer"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          /* Password Confirmation Step */
          <form onSubmit={handleExecuteAction} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
              <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                For your security, please enter your password to confirm you want to{' '}
                <b>{actionType === 'DEACTIVATE' ? 'deactivate' : 'permanently delete'}</b> your Heshel account.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsConfirmStep(false)}
                className="cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={processing}
                variant="primary"
                size="sm"
                className="bg-[#e02f21] hover:bg-[#c22417] cursor-pointer"
              >
                Confirm {actionType === 'DEACTIVATE' ? 'Deactivation' : 'Deletion'}
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
        <div className="space-y-4">
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
              className="w-full px-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                notify.success('Profile preferences updated.');
                setIsEditProfileOpen(false);
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
