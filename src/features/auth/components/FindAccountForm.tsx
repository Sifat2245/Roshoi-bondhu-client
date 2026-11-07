import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Button from '../../../components/ui/Button';
import logo from '../../../assets/logo.png';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const FindAccountForm = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      notify.info(`If an account matches "${identifier}", a security recovery code has been sent.`, 'Account Recovery');
      navigate('/login');
    }, 600);
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
          <span className="text-xs font-bold text-[#e02f21]">হেঁশেল</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Find your account
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Enter your mobile number or email address to search for your foodie account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Mobile number or email address"
            className="w-full px-4 py-3.5 bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21] focus:ring-1 focus:ring-[#e02f21] transition"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full py-3.5 text-sm font-bold bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl shadow-sm transition"
        >
          Continue
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default FindAccountForm;
