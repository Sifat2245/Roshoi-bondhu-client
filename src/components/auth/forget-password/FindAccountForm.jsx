import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Button from '../../ui/Button';
import logo from '../../../assets/logo.png';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const FindAccountForm = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Swal.fire({
        icon: 'info',
        title: 'Account Verification Sent',
        text: `If an account matches "${identifier}", a security recovery code has been sent.`,
        confirmButtonColor: '#e02f21',
      }).then(() => {
        navigate('/login');
      });
    }, 800);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-6">
      {/* Back Arrow & Header (Matching Facebook Find Account Image) */}
      <div className="space-y-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e02f21] transition"
        >
          <ArrowLeft size={16} />
          <span>Back to login</span>
        </Link>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Hesheli" className="h-8 w-auto object-contain" />
          <span className="text-xs font-bold text-[#e02f21]">হেশেলী</span>
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
        {/* Mobile Number or Email Address Input */}
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

        {/* Action Button with Loading Spinner */}
        <Button
          type="submit"
          loading={loading}
          className="w-full py-3.5 text-sm font-bold bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl shadow-sm transition"
        >
          Continue
        </Button>

        {/* Cancel Button */}
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
