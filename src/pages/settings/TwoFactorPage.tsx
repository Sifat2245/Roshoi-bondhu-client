import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useSession, twoFactor, authApi } from '../../lib/auth-client';
import { useAuth } from '../../context/AuthContext';
import {
  useTwoFactorStatusQuery,
  useInvalidateProfileQueries,
} from '../../features/profile/hooks/useProfileQueries';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Mail,
  Lock,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const TwoFactorPage: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: session, refetch: refetchSession } = useSession();
  const { refetchUser } = useAuth();
  const token = session?.session?.token;

  const { data: statusData, isLoading: queryLoading } = useTwoFactorStatusQuery(token);
  const { invalidateTwoFactor } = useInvalidateProfileQueries();

  const twoFactorEnabled = Boolean(statusData?.twoFactorEnabled);
  const emailOtpEnabled = Boolean(statusData?.emailOtpEnabled);
  const totpEnabled = Boolean(statusData?.totpEnabled);
  const loading = queryLoading && !statusData;

  // Modals
  const [modalType, setModalType] = useState<
    'ENABLE_OTP' | 'DISABLE_OTP' | 'TOTP_SETUP' | 'DISABLE_TOTP' | 'DISABLE_ALL' | null
  >(null);
  const [password, setPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // TOTP setup state
  const [totpStep, setTotpStep] = useState<'PASSWORD' | 'SCAN_AND_VERIFY'>('PASSWORD');
  const [totpURI, setTotpURI] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCloseModal = () => {
    if (actionLoading) return;
    setModalType(null);
    setPassword('');
    setTotpCode('');
    setTotpURI('');
    setTotpSecret('');
    setTotpStep('PASSWORD');
  };

  // 1. Enable Email OTP
  const handleEnableOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      return notify.error('Please enter your account password.');
    }

    setActionLoading(true);
    try {
      await authApi.enableEmailOtp(password, token);
      invalidateTwoFactor();
      if (refetchSession) refetchSession();
      if (refetchUser) refetchUser();

      notify.success('Two-factor authentication with Email OTP is now active!', '2FA Enabled');
      handleCloseModal();
    } catch (err: any) {
      notify.error(err.message || 'Failed to enable Email OTP.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Disable Email OTP
  const handleDisableOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      return notify.error('Please enter your account password.');
    }

    setActionLoading(true);
    try {
      await authApi.disableEmailOtp(password, token);
      invalidateTwoFactor();
      if (refetchSession) refetchSession();
      if (refetchUser) refetchUser();

      notify.success('Email OTP verification has been disabled.', '2FA Updated');
      handleCloseModal();
    } catch (err: any) {
      notify.error(err.message || 'Failed to disable Email OTP.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Start TOTP Setup (verify password)
  const handleStartTotpSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      return notify.error('Please enter your account password.');
    }

    setActionLoading(true);
    try {
      const res = await twoFactor.enable({
        password,
        method: 'totp',
        issuer: 'Heshel',
      });
      if (res?.error) {
        throw new Error(res.error.message || 'Invalid password.');
      }

      const uri = res.data?.totpURI || '';
      setTotpURI(uri);

      try {
        const url = new URL(uri);
        const secretParam = url.searchParams.get('secret') || '';
        setTotpSecret(secretParam || uri);
      } catch {
        setTotpSecret(uri);
      }

      setTotpStep('SCAN_AND_VERIFY');
    } catch (err: any) {
      notify.error(err.message || 'Could not verify password.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Confirm TOTP with 6-digit code
  const handleConfirmTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = totpCode.trim().replace(/[^0-9]/g, '');
    if (cleanCode.length < 6) {
      return notify.error('Please enter the 6-digit code from your authenticator app.');
    }

    setActionLoading(true);
    try {
      const res = await twoFactor.verifyTotp({
        code: cleanCode,
      });
      if (res?.error) {
        throw new Error(res.error.message || 'Invalid authenticator code. Check your device clock.');
      }

      await authApi.confirmTotp(token).catch(() => {});
      invalidateTwoFactor();
      if (refetchSession) refetchSession();
      if (refetchUser) refetchUser();

      notify.success('Authenticator app 2FA successfully configured and active!', '2FA Verified');
      handleCloseModal();
    } catch (err: any) {
      notify.error(err.message || 'Failed to verify code.');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Disable TOTP
  const handleDisableTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      return notify.error('Please enter your password.');
    }

    setActionLoading(true);
    try {
      await authApi.disableTotp(password, token);
      invalidateTwoFactor();
      if (refetchSession) refetchSession();
      if (refetchUser) refetchUser();

      notify.success('Authenticator App 2FA has been removed.', '2FA Updated');
      handleCloseModal();
    } catch (err: any) {
      notify.error(err.message || 'Failed to remove Authenticator App.');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Disable All 2FA
  const handleDisableAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      return notify.error('Please enter your password.');
    }

    setActionLoading(true);
    try {
      await authApi.disableAllTwoFactor(password, token);
      invalidateTwoFactor();
      if (refetchSession) refetchSession();
      if (refetchUser) refetchUser();

      notify.success('Two-factor authentication has been completely turned off.', '2FA Disabled');
      handleCloseModal();
    } catch (err: any) {
      notify.error(err.message || 'Could not turn off two-factor authentication.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!totpSecret) return;
    navigator.clipboard.writeText(totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <SettingsLayout
      sidebar={
        <SettingsSidebar
          activeTab="SECURITY"
          onSelectTab={(tab) => navigate(tab === 'HOME' ? '/settings' : `/settings?tab=${tab}`)}
        />
      }
    >
      <div className="max-w-2xl mx-auto py-2 space-y-6 animate-in fade-in duration-200">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings?tab=SECURITY')}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
            aria-label="Back to Security Settings"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Two-Factor Authentication (2FA)
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Add a second layer of security to prevent unauthorized access to your account.
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Current Status Banner */}
            <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      twoFactorEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {twoFactorEnabled ? <ShieldCheck size={26} /> : <ShieldOff size={26} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                        {twoFactorEnabled
                          ? 'Two-Factor Authentication is Active'
                          : 'Two-Factor Authentication is Off'}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          twoFactorEnabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {twoFactorEnabled ? 'PROTECTED' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {twoFactorEnabled
                        ? 'When signing in on an unrecognized device, Heshel will require a 6-digit confirmation code in addition to your password.'
                        : 'Protect your recipes, drafts, groups, and foodie profile from password compromises by requiring a second verification factor.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Turn Off Button if already active */}
              {twoFactorEnabled && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => {
                      setPassword('');
                      setModalType('DISABLE_ALL');
                    }}
                    className="cursor-pointer font-bold text-xs sm:text-sm"
                  >
                    Turn Off Two-Factor
                  </Button>
                </div>
              )}
            </div>

            {/* 2FA Methods Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Available 2FA Methods
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Method 1: Email OTP */}
                <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          emailOtpEnabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {emailOtpEnabled ? 'ENABLED' : 'Not enabled'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Email Verification Code
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Receive a 6-digit one-time code to your registered email address every time you log in.
                      </p>
                    </div>
                  </div>

                  {emailOtpEnabled ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setPassword('');
                        setModalType('DISABLE_OTP');
                      }}
                      className="w-full font-bold text-xs cursor-pointer border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Disable Email OTP
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setPassword('');
                        setModalType('ENABLE_OTP');
                      }}
                      className="w-full font-bold text-xs cursor-pointer"
                    >
                      Enable Email OTP
                    </Button>
                  )}
                </div>

                {/* Method 2: Authenticator App (TOTP) */}
                <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Smartphone size={20} />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          totpEnabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {totpEnabled ? 'ENABLED' : 'Not enabled'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Authenticator App (TOTP)
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Use Google Authenticator, Microsoft Authenticator, or Authy to generate offline instant codes.
                      </p>
                    </div>
                  </div>

                  {totpEnabled ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setPassword('');
                        setModalType('DISABLE_TOTP');
                      }}
                      className="w-full font-bold text-xs cursor-pointer border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Remove Authenticator App
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setPassword('');
                        setTotpStep('PASSWORD');
                        setModalType('TOTP_SETUP');
                      }}
                      className="w-full font-bold text-xs cursor-pointer"
                    >
                      Set Up Authenticator App
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Security Advisory */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Important:</strong> After activating Two-Factor Authentication, you will need your active method to sign in on unrecognized devices.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal 1: Enable Email OTP */}
      <Modal
        isOpen={modalType === 'ENABLE_OTP'}
        onClose={handleCloseModal}
        title="Enable Email 2FA"
      >
        <form onSubmit={handleEnableOtp} className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Please enter your account password to confirm enabling <strong>Email OTP Two-Factor Authentication</strong>.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Account Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCloseModal}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={actionLoading}
              disabled={actionLoading || !password}
              className="cursor-pointer"
            >
              Enable Email OTP
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Disable Email OTP */}
      <Modal
        isOpen={modalType === 'DISABLE_OTP'}
        onClose={handleCloseModal}
        title="Disable Email OTP"
      >
        <form onSubmit={handleDisableOtp} className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Please enter your password to disable Email OTP verification.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Account Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCloseModal}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              loading={actionLoading}
              disabled={actionLoading || !password}
              className="cursor-pointer"
            >
              Disable Email OTP
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Set Up Authenticator App (TOTP) */}
      <Modal
        isOpen={modalType === 'TOTP_SETUP'}
        onClose={handleCloseModal}
        title="Set Up Authenticator App"
      >
        {totpStep === 'PASSWORD' ? (
          <form onSubmit={handleStartTotpSetup} className="p-5 sm:p-6 space-y-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              To pair with Google Authenticator or another app, please verify your account password first:
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Account Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCloseModal}
                disabled={actionLoading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={actionLoading}
                disabled={actionLoading || !password}
                className="cursor-pointer"
              >
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmTotp} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Scan QR Code with Authenticator App
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Open Google Authenticator, Authy, or Microsoft Authenticator and scan this code:
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#2c2d2e] border border-gray-100 dark:border-gray-700">
                {totpURI && (
                  <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 border border-gray-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        totpURI
                      )}`}
                      alt="TOTP QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Cannot scan the QR code? Enter this secret key manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-white dark:bg-[#1f2021] p-2 rounded-lg border border-gray-200 dark:border-gray-700 select-all break-all flex-1 text-gray-900 dark:text-white">
                      {totpSecret || 'Secret Generated'}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Enter the 6-digit code from your Authenticator app
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-xl font-mono py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCloseModal}
                disabled={actionLoading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={actionLoading}
                disabled={actionLoading || totpCode.trim().length < 6}
                className="cursor-pointer"
              >
                Verify & Activate TOTP
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 4: Disable TOTP */}
      <Modal
        isOpen={modalType === 'DISABLE_TOTP'}
        onClose={handleCloseModal}
        title="Remove Authenticator App"
      >
        <form onSubmit={handleDisableTotp} className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Please enter your password to remove Authenticator App 2FA.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Account Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCloseModal}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              loading={actionLoading}
              disabled={actionLoading || !password}
              className="cursor-pointer"
            >
              Remove Authenticator App
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: Turn Off All 2FA */}
      <Modal
        isOpen={modalType === 'DISABLE_ALL'}
        onClose={handleCloseModal}
        title="Turn Off Two-Factor Authentication"
      >
        <form onSubmit={handleDisableAll} className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to turn off two-factor authentication? Your account will only be protected by your password.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Account Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to confirm"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCloseModal}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              loading={actionLoading}
              disabled={actionLoading || !password}
              className="cursor-pointer"
            >
              Turn Off 2FA
            </Button>
          </div>
        </form>
      </Modal>
    </SettingsLayout>
  );
};

export default TwoFactorPage;
