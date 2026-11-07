import React from 'react';
import { Link } from 'react-router';
import Avatar from '../ui/Avatar';
import {
  ShieldCheck,
  ChevronRight,
  User,
  Sparkles,
  Lock,
  Smartphone,
  ChefHat,
  X,
} from 'lucide-react';

const SettingsHomeTab = ({ user, onNavigateTab }) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner (Matching Image 3) */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-[#242526] dark:to-gray-800 p-4 sm:p-5 rounded-2xl border border-red-100 dark:border-gray-800 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#e02f21] text-white shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
              About your Hesheli Account
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Manage your personal details, profile presentation, and security settings in one place.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Home
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your settings across your profiles and devices all in one place.
        </p>
      </div>

      {/* Profile Card Tile (Matching Image 3) */}
      <button
        type="button"
        onClick={() => onNavigateTab('PERSONAL')}
        className="w-full bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between hover:border-red-200 dark:hover:border-gray-700 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-3.5">
          <Avatar src={user?.image} alt={user?.name} size="md" />
          <div>
            <p className="font-black text-xs sm:text-sm text-gray-900 dark:text-white">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-[#e02f21]">
              Hesheli Foodie Profile
            </span>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400 shrink-0" />
      </button>

      {/* Security Status Tile (Matching Image 3) */}
      <button
        type="button"
        onClick={() => onNavigateTab('SECURITY')}
        className="w-full bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between hover:border-emerald-200 dark:hover:border-gray-700 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
              Hesheli Security Status
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Account protected • Password & 2FA controls active
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400 shrink-0" />
      </button>

      {/* Quick Action Tiles (Matching Image 3: More from Meta / Hesheli) */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Quick Shortcuts
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to={user ? `/profile/${user.id}` : '/login'}
            className="p-4 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 transition shadow-xs space-y-2 block"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <User size={18} />
            </div>
            <p className="font-bold text-xs text-gray-900 dark:text-white">View Profile</p>
            <p className="text-[11px] text-gray-400">See public page</p>
          </Link>

          <button
            type="button"
            onClick={() => onNavigateTab('SECURITY')}
            className="p-4 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 transition shadow-xs space-y-2 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <p className="font-bold text-xs text-gray-900 dark:text-white">Password</p>
            <p className="text-[11px] text-gray-400">Update security</p>
          </button>

          <Link
            to="/groups"
            className="p-4 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 transition shadow-xs space-y-2 block"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <ChefHat size={18} />
            </div>
            <p className="font-bold text-xs text-gray-900 dark:text-white">Food Groups</p>
            <p className="text-[11px] text-gray-400">Community clubs</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SettingsHomeTab;

