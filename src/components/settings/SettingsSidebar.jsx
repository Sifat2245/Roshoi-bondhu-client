import React from 'react';
import { Link } from 'react-router';
import logo from '../../assets/logo.png';
import {
  Home,
  User,
  Shield,
  Bell,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const SettingsSidebar = ({ activeTab, onSelectTab }) => {
  const navItems = [
    {
      id: 'HOME',
      label: 'Home',
      icon: Home,
      description: 'Account overview & status',
    },
    {
      id: 'PERSONAL',
      label: 'Personal details',
      icon: User,
      description: 'Name, username, phone & bio',
    },
    {
      id: 'SECURITY',
      label: 'Login and security',
      icon: Shield,
      description: 'Password, 2FA & sessions',
    },
  ];

  return (
    <aside className="w-full space-y-6 select-none">
      {/* Top Brand & Back to Feed */}
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e02f21] transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hesheli" className="h-7 w-auto object-contain" />
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-[#e02f21]">
              Account Center
            </span>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1.5">
            Hesheli Account
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            Manage your profiles, personal details, password, and security preferences.
          </p>
        </div>
      </div>

      {/* Navigation List (Matching Image 3) */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isSelected = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer text-left ${
                isSelected
                  ? 'bg-white dark:bg-[#242526] text-[#e02f21] shadow-xs ring-1 ring-gray-200 dark:ring-gray-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={isSelected ? 'text-[#e02f21]' : 'text-gray-400'}
                />
                <div>
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] text-gray-400 font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-400 shrink-0" />
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
        <p>Hesheli Accounts Center v2.0</p>
        <p className="mt-0.5">Privacy • Terms • Bengali Culinary Network</p>
      </div>
    </aside>
  );
};

export default SettingsSidebar;

