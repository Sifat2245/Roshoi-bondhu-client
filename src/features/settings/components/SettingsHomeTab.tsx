import React from 'react';
import Avatar from '../../../components/ui/Avatar';
import logo from '../../../assets/logo.png';
import {
  ChevronRight,
  ShieldAlert,
  BadgeCheck,
  Users2,
  Glasses,
} from 'lucide-react';

export interface SettingsHomeTabProps {
  user: any;
  onNavigateTab: (tab: string) => void;
}

export const SettingsHomeTab: React.FC<SettingsHomeTabProps> = ({ user, onNavigateTab }) => {
  return (
    <div className="space-y-7 animate-in fade-in duration-150 select-none">
      {/* 1. Header matching Screenshot 1 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Home
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          Manage your settings across your profiles and Heshel devices all in one place.
        </p>
      </div>

      {/* 2. Top Account & Security Cards matching Screenshot 1 */}
      <div className="space-y-3">
        {/* User Account / Profiles Pill Card */}
        <button
          type="button"
          onClick={() => onNavigateTab('MANAGE')}
          className="w-full bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-4.5 border border-gray-200/90 dark:border-gray-800 shadow-2xs flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#343536] flex items-center justify-center shrink-0">
              <img src={logo} alt="Heshel" className="h-6 w-auto object-contain" />
            </div>
            <div className="truncate">
              <p className="font-bold text-base text-gray-900 dark:text-white truncate">
                {user?.email || 'chef@heshel.com'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                1 profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Avatar src={user?.image} alt={user?.name} size="sm" />
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </button>

        {/* Security Checkup Card */}
        <button
          type="button"
          onClick={() => onNavigateTab('SECURITY')}
          className="w-full bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-4.5 border border-gray-200/90 dark:border-gray-800 shadow-2xs flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-[#2c2d2e] transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="font-bold text-base text-gray-900 dark:text-white">
                Heshel Security Checkup
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                1 recommended action
              </p>
            </div>
          </div>

          <ChevronRight size={18} className="text-gray-400 shrink-0" />
        </button>
      </div>

      {/* 3. More from Heshel matching Screenshot 1 */}
      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-base text-gray-900 dark:text-white">
          More from Heshel
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Heshel Verified */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200/90 dark:border-gray-800 shadow-2xs space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BadgeCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                Heshel Verified
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Verified home chef badge
              </p>
            </div>
          </div>

          {/* Card 2: Foodie Communities */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200/90 dark:border-gray-800 shadow-2xs space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                Foodie Clubs
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Family & secret recipe groups
              </p>
            </div>
          </div>

          {/* Card 3: AI Kitchen / Smart Specs */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200/90 dark:border-gray-800 shadow-2xs space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Glasses size={24} />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                Chef Studio
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Smart kitchen recipes & AI tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsHomeTab;

