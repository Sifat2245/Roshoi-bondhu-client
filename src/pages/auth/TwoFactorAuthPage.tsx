import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import Button from '../../components/ui/Button';
import { twoFactor } from '../../lib/auth-client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Mail, Smartphone, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export const TwoFactorAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const { refetchUser } = useAuth();

  const state = (location.state as any) || {};
  const email = state.email || '';
  const initialMethods: string[] = state.twoFactorMethods || ['otp'];

  const hasTotp = initialMethods.includes('totp');
  const hasOtp = initialMethods.includes('otp');
  const hasBoth = hasTotp && hasOtp;

  // If user has TOTP only, default to totp; otherwise default to otp
  const [activeMethod, setActiveMethod] = useState<'otp' | 'totp'>(
    hasTotp && !hasOtp ? 'totp' : 'otp'
  );

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasSentOtpRef = useRef(false);

  // Focus first input on mount or method switch
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [activeMethod]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Send OTP email ONCE on mount if activeMethod is OTP (strictly guarded against double-mount)
  useEffect(() => {
    if (activeMethod !== 'otp') return;
    if (hasSentOtpRef.current) return;

    const now = Date.now();
    const lastSent = Number(sessionStorage.getItem('heshel_2fa_otp_sent') || '0');
    if (now - lastSent < 25000) {
      hasSentOtpRef.current = true;
      return;
    }

    hasSentOtpRef.current = true;
    sessionStorage.setItem('heshel_2fa_otp_sent', String(now));

    // Silently send OTP without popping a toast on arrival
    twoFactor.sendOtp().catch(() => {});
  }, [activeMethod]);

  const switchMethod = (method: 'otp' | 'totp') => {
    setActiveMethod(method);
    setDigits(['', '', '', '', '', '']);
    if (method === 'otp') {
      const now = Date.now();
      const lastSent = Number(sessionStorage.getItem('heshel_2fa_otp_sent') || '0');
      if (now - lastSent >= 25000) {
        sessionStorage.setItem('heshel_2fa_otp_sent', String(now));
        twoFactor.sendOtp().catch(() => {});
      }
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const newDigits = [...digits];

    if (cleaned.length === 0) {
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    newDigits[index] = cleaned[cleaned.length - 1];
    setDigits(newDigits);

    if (index < 5 && cleaned.length > 0) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    pasted.split('').forEach((char, idx) => {
      if (idx < 6) newDigits[idx] = char;
    });
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await twoFactor.sendOtp();
      sessionStorage.setItem('heshel_2fa_otp_sent', String(Date.now()));
      setCooldown(60);
    } catch (err: any) {
      notify.error(err.message || 'Failed to resend code. Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');

    if (code.length < 6) {
      return notify.error('Please enter the complete 6-digit verification code.');
    }

    setLoading(true);
    try {
      if (activeMethod === 'otp') {
        const res = await twoFactor.verifyOtp({
          code,
          trustDevice,
        });
        if (res?.error) {
          throw new Error(res.error.message || 'Invalid or expired OTP code.');
        }
      } else {
        const res = await twoFactor.verifyTotp({
          code,
          trustDevice,
        });
        if (res?.error) {
          throw new Error(res.error.message || 'Invalid authenticator code. Check your device clock.');
        }
      }

      // Verification successful: show inline animated state without toast
      setIsSuccess(true);
      if (refetchUser) await refetchUser();

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 700);
    } catch (err: any) {
      notify.error(err.message || 'Verification failed. Please check the code and try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="max-w-[440px]" py="py-8 sm:py-14">
      <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 p-6 sm:p-8 space-y-6">
        {isSuccess ? (
          /* Inline Animated Verification Success */
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Verification Successful
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Redirecting to your feed...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center">
                {activeMethod === 'otp' ? <Mail size={24} /> : <Smartphone size={24} />}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Two-Factor Authentication
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                {activeMethod === 'otp'
                  ? email
                    ? `Enter the 6-digit confirmation code sent to ${email}`
                    : 'Enter the 6-digit confirmation code sent to your registered email'
                  : 'Open your Authenticator app and enter the 6-digit security code.'}
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-5">
              {/* 6-Digit Code Inputs */}
              <div className="flex justify-between items-center gap-2 py-1">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border transition-all duration-150 focus:outline-none focus:scale-[1.04] ${
                      digit
                        ? 'border-gray-400 dark:border-gray-500 bg-white dark:bg-[#2c2d2e] text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-[#1f2021] text-gray-900 dark:text-white'
                    } focus:border-[#e02f21] focus:ring-2 focus:ring-[#e02f21]/20`}
                  />
                ))}
              </div>

              {/* Email OTP Resend */}
              {activeMethod === 'otp' && (
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Didn&apos;t receive the code?</span>
                  {cooldown > 0 ? (
                    <span className="font-semibold text-gray-400">
                      Resend code in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="font-bold text-[#e02f21] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                      Resend Code
                    </button>
                  )}
                </div>
              )}

              {/* Trust Device Checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e02f21] focus:ring-[#e02f21] border-gray-300 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                />
                <span>Don&apos;t ask again on this device for 30 days</span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading || digits.join('').length < 6}
                className="w-full font-bold text-sm cursor-pointer"
              >
                Verify & Continue
              </Button>

              {/* "Try another way" option if both methods are enabled */}
              {hasBoth && (
                <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800">
                  {activeMethod === 'otp' ? (
                    <button
                      type="button"
                      onClick={() => switchMethod('totp')}
                      className="text-xs font-semibold text-[#e02f21] hover:underline cursor-pointer"
                    >
                      Try another way: Use Authenticator App
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchMethod('otp')}
                      className="text-xs font-semibold text-[#e02f21] hover:underline cursor-pointer"
                    >
                      Try another way: Use Email Verification Code
                    </button>
                  )}
                </div>
              )}

              {/* Back to Sign In */}
              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                  <ArrowLeft size={13} />
                  Back to Sign In
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default TwoFactorAuthPage;
