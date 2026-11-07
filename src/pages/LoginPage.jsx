import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { signIn } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import logo from '../assets/logo.png';
import { Mail, Lock, Sparkles, Shield, UserCheck, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        throw new Error(res.error.message || 'Invalid email or password.');
      }

      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        timer: 1200,
        showConfirmButton: false,
      });

      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={logo} alt="Hesheli" className="h-12 w-auto object-contain mx-auto" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            Welcome to {t('appName')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('appTagline')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cook@hesheli.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3.5 text-sm font-black"
            >
              Sign In to Hesheli
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Quick Demo Access (1-Click Fill):</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@hesheli.com', 'AdminPassword123!')}
                className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Shield size={12} /> Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('moderator@hesheli.com', 'ModPassword123!')}
                className="p-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                Mod
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('chef.rahima@hesheli.com', 'UserPassword123!')}
                className="p-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <UserCheck size={12} /> Foodie
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#e02f21] hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

