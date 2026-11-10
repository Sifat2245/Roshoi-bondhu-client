import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { authApi } from "../../../lib/auth-client";
import Button from "../../../components/ui/Button";
import logo from "../../../assets/logo.png";
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useToast } from "../../../context/ToastContext";

const FindAccountForm: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resending OTP
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Focus first digit box when moving to verify step
  useEffect(() => {
    if (step === "verify") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // Handle Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return notify.error("Please enter a valid email address.", "Email Required");
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(cleanEmail);
      notify.success(
        res.message || "A 6-digit password reset code has been sent to your email.",
        "Code Sent"
      );
      setStep("verify");
      setCooldown(60);
    } catch (err: any) {
      notify.error(err.message || "Failed to request password reset.", "Request Error");
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-digit OTP input
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    const newDigits = [...digits];

    if (cleaned.length === 0) {
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    newDigits[index] = cleaned[cleaned.length - 1];
    setDigits(newDigits);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Handle Resend OTP
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setResending(true);
    try {
      await authApi.forgotPassword(cleanEmail);
      notify.success("A fresh 6-digit code has been sent to your email.", "Code Resent");
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      notify.error(err.message || "Failed to resend code.", "Resend Failed");
    } finally {
      setResending(false);
    }
  };

  // Handle Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = digits.join("");
    const cleanEmail = email.trim().toLowerCase();

    if (otpCode.length < 6) {
      return notify.error("Please enter the complete 6-digit code.", "Incomplete Code");
    }
    if (!newPassword || newPassword.length < 6) {
      return notify.error("New password must be at least 6 characters.", "Password Too Short");
    }
    if (newPassword !== confirmPassword) {
      return notify.error("Passwords do not match.", "Password Mismatch");
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: cleanEmail,
        otp: otpCode,
        password: newPassword,
      });

      notify.success(
        res.message || "Password reset successfully! Please log in with your new password.",
        "Password Reset"
      );

      navigate("/login", { replace: true });
    } catch (err: any) {
      notify.error(err.message || "Failed to reset password.", "Reset Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-6">
      {/* Back Arrow & Header */}
      <div className="space-y-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e02f21] transition"
        >
          <ArrowLeft size={16} />
          <span>Back to login</span>
        </Link>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Heshel" className="h-8 w-auto object-contain" />
          <span className="text-sm font-bold text-[#e02f21]">হেঁশেল • Heshel</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {step === "request" ? "Reset your password" : "Enter verification code"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {step === "request"
              ? "Enter your registered email address and we'll send you a 6-digit code to securely reset your password."
              : `We sent a 6-digit code to ${email}. Enter the code and set your new password.`}
          </p>
        </div>
      </div>

      {step === "request" ? (
        /* STEP 1: REQUEST OTP */
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                aria-label="Email address"
                className="w-full px-4 py-3.5 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3.5 text-sm font-bold bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl shadow-sm transition"
          >
            Send Reset Code
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white transition"
            >
              Cancel and return to login
            </Link>
          </div>
        </form>
      ) : (
        /* STEP 2: VERIFY OTP & SET NEW PASSWORD */
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Email badge with change option */}
          <div className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              <Mail size={16} className="text-[#e02f21] shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setDigits(["", "", "", "", "", ""]);
              }}
              className="text-xs font-bold text-[#e02f21] hover:underline shrink-0 ml-2"
            >
              Change
            </button>
          </div>

          {/* 6-Digit OTP Boxes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              6-Digit Security Code
            </label>
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
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
                  aria-label={`Digit ${idx + 1}`}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#242526] text-gray-900 dark:text-white focus:outline-none focus:border-[#e02f21] focus:ring-2 focus:ring-[#e02f21]/20 transition shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* New Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3.5 pr-11 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full px-4 py-3.5 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
            />
          </div>

          {/* Submit Reset Button */}
          <Button
            type="submit"
            loading={loading}
            className="w-full py-3.5 text-sm font-bold bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl shadow-sm transition"
          >
            Reset Password & Sign In
          </Button>

          {/* Resend OTP */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              disabled={cooldown > 0 || resending}
              onClick={handleResend}
              className={`font-bold transition ${
                cooldown > 0 || resending
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-[#e02f21] hover:underline cursor-pointer"
              }`}
            >
              {resending ? (
                <span className="inline-flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" /> Sending...
                </span>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                "Resend Code"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FindAccountForm;
