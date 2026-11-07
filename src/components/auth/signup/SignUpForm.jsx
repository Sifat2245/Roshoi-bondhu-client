import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { signUp } from '../../../lib/auth-client';
import Button from '../../ui/Button';
import logo from '../../../assets/logo.png';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const SignUpForm = () => {
  const navigate = useNavigate();

  // Form states matching Facebook signup layout
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthDay, setBirthDay] = useState('15');
  const [birthMonth, setBirthMonth] = useState('January');
  const [birthYear, setBirthYear] = useState('1998');
  const [gender, setGender] = useState('female');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Days, Months, Years arrays
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !surname.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Name Required', text: 'Please enter both first name and surname.' });
    }
    if (!gender) {
      return Swal.fire({ icon: 'warning', title: 'Gender Required', text: 'Please select your gender.' });
    }
    if (password.length < 6) {
      return Swal.fire({ icon: 'warning', title: 'Password Too Short', text: 'Password must be at least 6 characters.' });
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${surname.trim()}`;
      const emailValue = identifier.includes('@')
        ? identifier.trim()
        : `${identifier.replace(/[^0-9]/g, '')}@hesheli.com`;

      const res = await signUp.email({
        name: fullName,
        email: emailValue,
        password,
      });

      if (res.error) {
        throw new Error(res.error.message || 'Failed to create account.');
      }

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: `Welcome to Hesheli, ${firstName}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Sign Up Error',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[540px] mx-auto space-y-6">
      {/* Top Header with Back Arrow & Logo */}
      <div className="space-y-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e02f21] transition"
        >
          <ArrowLeft size={16} />
          <span>Back to log in</span>
        </Link>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Hesheli" className="h-9 w-auto object-contain" />
          <span className="text-sm font-bold text-[#e02f21]">হেশেলী</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Create a new Hesheli account
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            It's quick and easy — share culinary recipes, food stories, and connect with fellow chefs.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name: First Name & Surname */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Name
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full px-3.5 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
            />
            <input
              type="text"
              required
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Surname"
              className="w-full px-3.5 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
            />
          </div>
        </div>

        {/* Date of Birth: 3 Select Dropdowns */}
        <div>
          <label className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            <span>Date of birth</span>
            <HelpCircle size={14} className="text-gray-400" />
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="w-full px-3 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none focus:border-[#e02f21]"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="w-full px-3 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none focus:border-[#e02f21]"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full px-3 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none focus:border-[#e02f21]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender Select: 3 Pill Cards */}
        <div>
          <label className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            <span>Gender</span>
            <HelpCircle size={14} className="text-gray-400" />
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {['Female', 'Male', 'Custom'].map((g) => {
              const val = g.toLowerCase();
              return (
                <label
                  key={val}
                  className={`flex items-center justify-between px-3.5 py-3 border rounded-xl cursor-pointer text-xs font-semibold transition ${
                    gender === val
                      ? 'border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{g}</span>
                  <input
                    type="radio"
                    name="gender"
                    value={val}
                    checked={gender === val}
                    onChange={(e) => setGender(e.target.value)}
                    className="accent-[#e02f21]"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Mobile Number or Email Address */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Mobile number or email address
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. chef@hesheli.com or 01700000000"
            className="w-full px-4 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            New password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full px-4 py-3 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
          />
        </div>

        {/* Disclaimer / Terms Policy */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
          By clicking Sign Up, you agree to our{' '}
          <span className="text-[#e02f21] hover:underline cursor-pointer">Terms</span>,{' '}
          <span className="text-[#e02f21] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
          <span className="text-[#e02f21] hover:underline cursor-pointer">Cookies Policy</span>.
        </p>

        {/* Action Button with Loading Spinner */}
        <Button
          type="submit"
          loading={loading}
          className="w-full py-3.5 text-sm font-bold bg-[#00a400] hover:bg-[#008f00] text-white rounded-xl shadow-sm transition"
        >
          Sign Up
        </Button>

        {/* Already have an account */}
        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs sm:text-sm font-semibold text-[#e02f21] hover:underline"
          >
            Already have an account? Log In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
