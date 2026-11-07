import React from 'react';
import { Link } from 'react-router';
import Avatar from '../../../components/ui/Avatar';
import {
  ChevronRight,
  User,
  Lock,
  ChefHat,
} from 'lucide-react';

const SettingsHomeTab = ({ user, onNavigateTab }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Clean Meta-style Header without noisy banners */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Account Center
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          Manage your connected experiences and account settings across Heshel.
        </p>
      </div>

      {/* Profiles Card */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Profiles
        </h4>
        <button
          type="button"
          onClick={() => onNavigateTab('PERSONAL')}
          className="w-full bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-700 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <Avatar src={user?.image} alt={user?.name} size="md" />
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Heshel • {user?.role || 'User'}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Security Checkup Card (Subtle & Monochrome) */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Account Settings
        </h4>
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs divide-y divide-gray-100 dark:divide-gray-800">
          {/* Password & Security Row */}
          <button
            type="button"
            onClick={() => onNavigateTab('SECURITY')}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition cursor-pointer text-left rounded-t-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  Password and security
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Change password, two-factor authentication, and where you're logged in
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>

          {/* Personal Details Row */}
          <button
            type="button"
            onClick={() => onNavigateTab('PERSONAL')}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition cursor-pointer text-left rounded-b-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  Personal details
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Contact info, username, birthday, and culinary bio
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Quick Shortcuts (Clean Monochrome) */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          More For You
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to={user ? `/profile/${user.id}` : '/login'}
            className="p-4 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition shadow-xs flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
              <User size={18} />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 dark:text-white">Public Profile</p>
              <p className="text-[11px] text-gray-400">View how others see your profile</p>
            </div>
          </Link>

          <Link
            to="/groups"
            className="p-4 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition shadow-xs flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
              <ChefHat size={18} />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 dark:text-white">Food Groups</p>
              <p className="text-[11px] text-gray-400">Manage your culinary communities</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SettingsHomeTab;

