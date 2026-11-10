import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { profileApi } from '../../profile/api/profile.api';
import { useSession } from '../../../lib/auth-client';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../context/ToastContext';
import {
  ChevronRight,
  ShieldAlert,
  Lock,
  Smartphone,
  KeyRound,
} from 'lucide-react';

export interface SettingsSecurityTabProps {
  user: any;
}

export const SettingsSecurityTab: React.FC<SettingsSecurityTabProps> = ({ user }) => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: session } = useSession();
  const token = session?.session?.token;

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Contact info modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    let isMounted = true;
    profileApi
      .getUserProfile('me', token)
      .then((data: any) => {
        if (isMounted) {
          if (data?.preferences?.twoFactorEnabled !== undefined) {
            setTwoFactorEnabled(Boolean(data.preferences.twoFactorEnabled));
          }
          if (data?.phone) {
            setPhone(data.phone);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      await profileApi.updateProfile({ phone: phone.trim() }, token);
      notify.success('Contact info updated successfully.');
      setIsContactModalOpen(false);
    } catch (error: any) {
      notify.error(error.message || 'Could not save contact information.');
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-150 select-none">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Login and security
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your credentials, two-factor authentication, and active sessions.
        </p>
      </div>

      {/* 2. Top Security Checkup Alert Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-4.5 border border-gray-200/90 dark:border-gray-800 shadow-2xs flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">
              Heshel Security Checkup
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              Account credentials secured
            </p>
          </div>
        </div>

        <ChevronRight size={18} className="text-gray-400 shrink-0" />
      </div>

      {/* 3. Login & Recovery Section */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Login & recovery
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 leading-relaxed">
          Manage your passwords, login preferences, and recovery methods.
        </p>

        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden mt-3">
          {/* Row 1: Contact info */}
          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Contact info
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {user?.email} {phone ? `• ${phone}` : ''}
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>

          {/* Row 2: Change password (Navigates to dedicated /settings/password route) */}
          <button
            type="button"
            onClick={() => navigate('/settings/password')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Change password
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Update your login password regularly for safety
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>

          {/* Row 3: Two-factor authentication (Navigates to dedicated /settings/two-factor route) */}
          <button
            type="button"
            onClick={() => navigate('/settings/two-factor')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Two-factor authentication
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {twoFactorEnabled ? 'Active (Email & SMS)' : 'Not active'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  twoFactorEnabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {twoFactorEnabled ? 'ON' : 'OFF'}
              </span>
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* 4. Security Checks Section */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Security checks
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 leading-relaxed">
          Review active devices and session authorizations.
        </p>

        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden mt-3">
          {/* Where you're logged in (Navigates to dedicated /settings/sessions route) */}
          <button
            type="button"
            onClick={() => navigate('/settings/sessions')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Where you're logged in
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Review browser and device sessions
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Contact Info Edit Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Contact Info"
      >
        <div className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm sm:text-base text-gray-500 cursor-not-allowed border border-transparent"
            />
            <p className="text-[11px] text-gray-400">Account login email cannot be changed directly.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700 000000"
              className="w-full px-4 py-3 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm sm:text-base dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="md"
              disabled={savingContact}
              onClick={() => setIsContactModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={savingContact}
              disabled={savingContact}
              onClick={handleSaveContact}
              className="cursor-pointer"
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsSecurityTab;
