import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { authApi, getSession } from "../../../lib/auth-client";
import Button from "../../../components/ui/Button";
import logo from "../../../assets/logo.png";
import { ArrowLeft, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "../../../context/ToastContext";

export const VerifyEmailForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, "");
    const newDigits = [...digits];

    if (cleaned.length === 0) {
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    // Single digit entry
    newDigits[index] = cleaned[cleaned.length - 1];
    setDigits(newDigits);

    // Auto advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    pasteData.split("").forEach((char, idx) => {
      if (idx < 6) newDigits[idx] = char;
    });
    setDigits(newDigits);

    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const otpCode = digits.join("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      return notify.error(
        "Email address is missing. Please sign up or re-enter your email.",
        "Email Missing",
      );
    }
    if (otpCode.length < 6) {
      return notify.error(
        "Please enter the complete 6-digit verification code.",
        "Incomplete Code",
      );
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOTP({
        email: email.trim().toLowerCase(),
        otp: otpCode,
      });
      setVerifiedSuccess(true);
      notify.success(
        res.message || "Email verified successfully!",
        "Account Verified",
      );
      await getSession();

      // Seamless redirect after short delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 600);
    } catch (err: any) {
      notify.error(
        err.message || "Invalid or expired verification code.",
        "Verification Failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    if (!email) {
      return notify.error("Email is missing.", "Error");
    }

    setResending(true);
    try {
      await authApi.resendOTP(email.trim().toLowerCase());
      notify.success(
        "A new 6-digit code has been sent to your email.",
        "Code Sent",
      );
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      notify.error(err.message || "Failed to resend code.", "Resend Failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="space-y-3">
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e02f21] transition"
        >
          <ArrowLeft size={16} />
          <span>Back to sign up</span>
        </Link>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Heshel" className="h-9 w-auto object-contain" />
          <span className="text-sm font-bold text-[#e02f21]">হেঁশেল</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Verify your email address
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            We sent a 6-digit verification code to:
          </p>
          <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-bold text-[#e02f21]">
            <Mail size={14} />
            <span>{email || "your email address"}</span>
          </div>
        </div>
      </div>

      {verifiedSuccess ? (
        <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl text-center space-y-2">
          <CheckCircle2
            size={40}
            className="text-green-600 dark:text-green-400 mx-auto"
          />
          <h3 className="text-base font-bold text-green-900 dark:text-green-200">
            Account Verified!
          </h3>
          <p className="text-xs text-green-700 dark:text-green-400">
            Redirecting you to Heshel home feed...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* If email was not passed in url, allow typing */}
          {!emailParam && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@heshel.com"
                className="w-full px-4 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21]"
              />
            </div>
          )}

          {/* 6 Digit OTP Inputs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Enter 6-digit code
            </label>
            <div
              className="grid grid-cols-6 gap-2 sm:gap-2.5"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full aspect-square text-center font-black text-lg sm:text-xl text-gray-900 dark:text-white bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#e02f21] focus:ring-2 focus:ring-[#e02f21]/30 transition shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            loading={loading}
            disabled={otpCode.length < 6}
            className="w-full py-3.5 text-sm font-bold bg-[#e02f21] hover:bg-[#c22417] disabled:opacity-50 text-white rounded-xl shadow-sm transition"
          >
            Confirm & Log In
          </Button>

          {/* Resend Code Section */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Didn't receive the code?
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="inline-flex items-center gap-1 font-bold text-[#e02f21] hover:underline disabled:text-gray-400 disabled:no-underline transition cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={12}
                className={resending ? "animate-spin" : ""}
              />
              <span>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
              </span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Already verified? Log In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default VerifyEmailForm;
