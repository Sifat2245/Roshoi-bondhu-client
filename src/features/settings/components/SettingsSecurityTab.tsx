import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { profileApi } from '../../profile/api/profile.api';
import { useSession } from '../../../lib/auth-client';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../context/ToastContext';
import { ChevronRight } from 'lucide-react';
import {
  useTwoFactorStatusQuery,
  useUserProfileQuery,
  useInvalidateProfileQueries,
} from '../../profile/hooks/useProfileQueries';

export interface SettingsSecurityTabProps {
  user: any;
}

export const SettingsSecurityTab: React.FC<SettingsSecurityTabProps> = ({ user }) => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: session } = useSession();
  const token = session?.session?.token;

  const { data: twoFactorStatus, isLoading: loading2FA } = useTwoFactorStatusQuery(token);
  const { data: profileData, isLoading: loadingProfile } = useUserProfileQuery('me', token);
  const { invalidateProfile } = useInvalidateProfileQueries();

  const twoFactorEnabled = Boolean(twoFactorStatus?.twoFactorEnabled);
  const emailOtpEnabled = Boolean(twoFactorStatus?.emailOtpEnabled);
  const totpEnabled = Boolean(twoFactorStatus?.totpEnabled);
  const loading = (loading2FA || loadingProfile) && !twoFactorStatus && !profileData;

  // Contact info modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [phone, setPhone] = useState(profileData?.phone || user?.phone || '');
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    if (profileData?.phone) {
      setPhone(profileData.phone);
    }
  }, [profileData?.phone]);

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      await profileApi.updateProfile({ phone: phone.trim() }, token);
      invalidateProfile();
      notify.success('Contact info updated successfully.');
      setIsContactModalOpen(false);
    } catch (error: any) {
      notify.error(error.message || 'Could not save contact information.');
    } finally {
      setSavingContact(false);
    }
  };

  const twoFactorLabel = () => {
    if (!twoFactorEnabled) return 'Not active';
    if (emailOtpEnabled && totpEnabled) return 'Active (Email & Authenticator App)';
    if (totpEnabled) return 'Active (Authenticator App)';
    if (emailOtpEnabled) return 'Active (Email OTP)';
    return 'Active';
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

      {/* 2. Login & Recovery Section */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Login & recovery
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 leading-relaxed">
          Manage your passwords, login preferences, and recovery methods.
        </p>

        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden mt-3">
          {loading ? (
            <div className="p-4 space-y-4">
              <div className="h-10 w-full bg-gray-200 dark:bg-[#3a3b3c] rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-[#3a3b3c] rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-[#3a3b3c] rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
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

              {/* Row 2: Change password */}
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

              {/* Row 3: Passkeys */}
              <button
                type="button"
                onClick={() => navigate('/settings/passkeys')}
                className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
              >
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    Passkeys
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Fast and biometric sign in with fingerprint, Face ID, or security key
                  </p>
                </div>
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              </button>

              {/* Row 4: Two-factor authentication */}
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
                    {twoFactorLabel()}
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
            </>
          )}
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

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="md"
              disabled={savingContact}
              onClick={() => setIsContactModalOpen(false)}
              className="flex-1 sm:flex-none justify-center cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={savingContact}
              disabled={savingContact}
              onClick={handleSaveContact}
              className="flex-1 sm:flex-none justify-center cursor-pointer"
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
