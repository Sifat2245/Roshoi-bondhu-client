import React, { useState } from 'react';
import { isDemoMode, readDemo, writeDemo } from '../../../lib/demo/demo-store';
import { profileApi } from '../../profile/api/profile.api';
import { useSession } from '../../../lib/auth-client';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../context/ToastContext';
import {
  ChevronRight,
  ShieldAlert,
  Laptop,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

export interface SettingsSecurityTabProps {
  user: any;
}

export const SettingsSecurityTab: React.FC<SettingsSecurityTabProps> = ({ user }) => {
  const { notify } = useToast();

  // Expandable sections state
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const { data: session } = useSession();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => isDemoMode() ? Boolean(readDemo().settings.twoFactorEnabled) : false);

  // Contact info modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');

  // Active sessions mock list
  const [sessions, setSessions] = useState([
    {
      id: 'session-1',
      device: 'Chrome on Linux (This PC)',
      type: 'DESKTOP',
      location: 'Dhaka, Bangladesh',
      activeNow: true,
      lastActive: 'Active now',
    },
    {
      id: 'session-2',
      device: 'Heshel Mobile (Android)',
      type: 'MOBILE',
      location: 'Chittagong, Bangladesh',
      activeNow: false,
      lastActive: 'Yesterday at 9:42 PM',
    },
  ]);

  const toggleSection = (sectionName: string) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify.error('New password and confirm password do not match.');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOpenSection(null);
      notify.info('Password form validated. Your actual password has not changed.');
    }, 800);
  };

  const handleToggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    if (isDemoMode()) { const state = readDemo(); state.settings.twoFactorEnabled = nextState; writeDemo(state); }
    if (nextState) {
      notify.info('Two-factor authentication preview enabled.');
    } else {
      notify.info('Two-factor authentication preview disabled.');
    }
  };

  const handleLogoutOtherSessions = () => {
    setSessions(sessions.filter((s) => s.activeNow));
    notify.success('Logged out of all other active sessions.');
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-150 select-none">
      <p className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-800 dark:text-amber-200">Security controls are an interactive preview. Password, sign-in, and two-factor changes are not applied to your account.</p>
      {/* 1. Header matching Screenshot 2 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Login and security
        </h1>
      </div>

      {/* 2. Top Security Checkup Alert Card matching Screenshot 2 */}
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
              1 recommended action
            </p>
          </div>
        </div>

        <ChevronRight size={18} className="text-gray-400 shrink-0" />
      </div>

      {/* 3. Login & Recovery Section matching Screenshot 2 */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Login & recovery
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 leading-relaxed">
          Manage your passwords, login preferences and recovery methods.
        </p>

        {/* Stacked List Card matching Screenshot 2 */}
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
                {user?.email}
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>

          {/* Row 2: Change password */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('PASSWORD')}
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
              {openSection === 'PASSWORD' ? (
                <ChevronDown size={18} className="text-gray-500 shrink-0" />
              ) : (
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              )}
            </button>

            {/* In-place Password Form */}
            {openSection === 'PASSWORD' && (
              <form onSubmit={handleChangePassword} className="p-4 sm:p-5 bg-gray-50/50 dark:bg-[#1f2021] border-t border-gray-100 dark:border-gray-800 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#343536] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#343536] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#343536] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    loading={savingPassword}
                    variant="primary"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Save Password
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenSection(null)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Row 3: Two-factor authentication */}
          <button
            type="button"
            onClick={handleToggle2FA}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Two-factor authentication
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {twoFactorEnabled ? 'Active (SMS & Authenticator)' : 'Not active'}
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

          {/* Row 4: Saved login */}
          <button
            type="button"
            onClick={() => notify.info('Your login credentials are saved on this trusted device.')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Saved login
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Saved on this browser
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>

          {/* Row 5: Passkey */}
          <button
            type="button"
            onClick={() => notify.info('Biometric passkeys will be configured using your device hardware.')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Passkey
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Biometric fingerprint & facial recognition
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* 4. Security Checks Section matching Screenshot 2 */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Security checks
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 leading-relaxed">
          Review security issues by running checks across apps, devices and emails sent.
        </p>

        {/* Stacked List Card matching Screenshot 2 */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden mt-3">
          {/* Row 1: Where you're logged in */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('SESSIONS')}
              className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
            >
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  Where you're logged in
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {sessions.length} active device {sessions.length === 1 ? 'session' : 'sessions'}
                </p>
              </div>
              {openSection === 'SESSIONS' ? (
                <ChevronDown size={18} className="text-gray-500 shrink-0" />
              ) : (
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              )}
            </button>

            {/* In-place Sessions List */}
            {openSection === 'SESSIONS' && (
              <div className="p-4 sm:p-5 bg-gray-50/50 dark:bg-[#1f2021] border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="space-y-2.5">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-white dark:bg-[#2b2c2d] rounded-xl border border-gray-200/80 dark:border-gray-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {s.type === 'DESKTOP' ? (
                          <Laptop size={18} className="text-gray-500" />
                        ) : (
                          <Smartphone size={18} className="text-gray-500" />
                        )}
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{s.device}</p>
                          <p className="text-[11px] text-gray-500">{s.location} • {s.lastActive}</p>
                        </div>
                      </div>
                      {s.activeNow && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Active Now
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {sessions.length > 1 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogoutOtherSessions}
                    className="w-full mt-2 cursor-pointer"
                  >
                    Log out of all other sessions
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Row 2: Emails from Heshel */}
          <button
            type="button"
            onClick={() => notify.info('No security alert emails sent in the last 14 days.')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
          >
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Emails from Heshel
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Review recent security & login alert emails
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Contact Info Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Contact Information"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 p-4 sm:p-5">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#343536] space-y-1.5">
            <p className="text-sm font-bold text-gray-500">Email Address</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">{user?.email}</p>
            <p className="text-xs sm:text-sm text-emerald-600 font-bold">Primary & Verified</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Mobile Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm sm:text-base dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsContactModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={async () => {
                try { await profileApi.updateProfile({ phone: phone.trim() }, session?.session?.token); notify.success('Contact info updated successfully.'); setIsContactModalOpen(false); } catch (error: any) { notify.error(error.message || 'Could not save contact information.'); }
              }}
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
