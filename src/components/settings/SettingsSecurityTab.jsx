import React, { useState } from 'react';
import Button from '../ui/Button';
import {
  Lock,
  Key,
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle,
  AlertTriangle,
  Mail,
  LogOut,
} from 'lucide-react';
import Swal from 'sweetalert2';

const SettingsSecurityTab = ({ user }) => {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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
      device: 'Hesheli Mobile (Android)',
      type: 'MOBILE',
      location: 'Chittagong, Bangladesh',
      activeNow: false,
      lastActive: 'Yesterday at 9:42 PM',
    },
  ]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'New password must be at least 6 characters.',
      });
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'Mismatch',
        text: 'New password and confirm password do not match.',
      });
    }

    setSavingPassword(true);
    // Simulate / execute password change
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Swal.fire({
        icon: 'success',
        title: 'Password Updated!',
        text: 'Your account password has been changed successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
    }, 800);
  };

  const handleToggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    Swal.fire({
      icon: nextState ? 'success' : 'info',
      title: nextState ? '2FA Enabled!' : '2FA Disabled',
      text: nextState
        ? 'Two-Factor Authentication is now active on your account.'
        : 'Two-Factor Authentication has been turned off.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleLogoutAllOther = () => {
    setSessions(sessions.filter((s) => s.activeNow));
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'Logged out of all other active sessions.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Login and Security
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your account passwords, two-factor authentication, and active device logins.
        </p>
      </div>

      {/* 1. Account Contact & Security Overview Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Account Security Contact
        </h3>
        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-[#e02f21]" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{user?.email}</p>
              <p className="text-[10px] text-gray-400">Primary contact for security and login alerts</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            VERIFIED
          </span>
        </div>
      </div>

      {/* 2. Change Password Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Change Password
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300"
            />
          </div>

          <Button
            type="submit"
            loading={savingPassword}
            variant="primary"
            size="sm"
            className="mt-2"
          >
            Update Password
          </Button>
        </form>
      </div>

      {/* 3. Two-Factor Authentication (2FA) */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" />
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                We'll ask for an additional security code if we notice an attempted login from an unrecognized device.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={handleToggle2FA}
            className="toggle toggle-error"
          />
        </div>

        <div className="pt-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              twoFactorEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
            <span>{twoFactorEnabled ? '2FA Protection Active' : '2FA Inactive'}</span>
          </span>
        </div>
      </div>

      {/* 4. Where You're Logged In (Active Sessions & Devices) */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Where You're Logged In
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Review active devices and browsers currently signed in to your account.
            </p>
          </div>

          {sessions.length > 1 && (
            <button
              type="button"
              onClick={handleLogoutAllOther}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Log out of all devices
            </button>
          )}
        </div>

        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {s.type === 'MOBILE' ? <Smartphone size={18} /> : <Laptop size={18} />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{s.device}</span>
                    {s.activeNow && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {s.location} • <span className={s.activeNow ? 'text-emerald-600 font-semibold' : ''}>{s.lastActive}</span>
                  </p>
                </div>
              </div>

              {s.activeNow ? (
                <span className="text-[10px] font-bold text-emerald-600 uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40">
                  This Device
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSessions(sessions.filter((item) => item.id !== s.id))}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Log out
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurityTab;

