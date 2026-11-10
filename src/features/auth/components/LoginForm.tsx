import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button";
import DemoAccountsBar from "./DemoAccountsBar";
import { useToast } from "../../../context/ToastContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const { loginUser, user } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname;
      const target = from && from !== "/login" && from !== "/register" ? from : "/";
      navigate(target, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      return notify.error(
        "Please fill in both email and password.",
        "Required Fields",
      );
    }

    setLoading(true);
    try {
      const cleanEmail = identifier.trim().toLowerCase();
      const res = await loginUser(cleanEmail, password);

      if (res?.data?.requiresVerification || res?.requiresVerification) {
        notify.warning(
          res.message || "Please verify your email to continue.",
          "Verification Required",
        );
        return navigate(
          `/verify-email?email=${encodeURIComponent(cleanEmail)}`,
        );
      }

      notify.success("Logged in successfully!", "Welcome Back");
      const from = (location.state as any)?.from?.pathname;
      const target = from && from !== "/login" && from !== "/register" ? from : "/";
      navigate(target, { replace: true });
    } catch (err: any) {
      notify.error(err.message || "Invalid email or password.", "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="w-full max-w-[440px] space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Log in to Heshel
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Enter your login credentials to continue to your food feed.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3.5">
        {/* Email Address Input */}
        <div>
          <div className="relative">
            <input
              type="email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              className="w-full px-4 py-3.5 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
              className="w-full px-4 py-3.5 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
            />
          </div>
        </div>

        {/* Action Button with Loading Spinner */}
        <Button
          type="submit"
          loading={loading}
          className="w-full py-3.5 text-sm font-bold bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl shadow-sm transition"
        >
          Log in
        </Button>

        {/* Forgotten Password Link */}
        <div className="text-center pt-1">
          <Link
            to="/forgot-password"
            className="text-xs sm:text-sm font-medium text-[#e02f21] hover:underline"
          >
            Forgotten password?
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>

        {/* Create New Account Button */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-block w-full py-3 px-4 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm rounded-xl transition"
          >
            Create new account
          </Link>
        </div>
      </form>

      {/* 1-Click Fill Demo Credentials for instant testing */}
      <DemoAccountsBar onSelectAccount={handleFillDemo} />

      <div className="text-center text-xs text-gray-400 pt-2 font-bold tracking-wider">
        হেঁশেল • Heshel
      </div>
    </div>
  );
};

export default LoginForm;
