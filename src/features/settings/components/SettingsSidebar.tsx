import React from 'react';
import { Link } from 'react-router';
import logo from '../../../assets/logo.png';
import {
  Home,
  User,
  Shield,
  ArrowLeft,
  ChevronRight,
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
            <img src={logo} alt="Heshel" className="h-7 w-auto object-contain" />
            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
              Heshel
            </span>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
            Account Management & Privacy
          </p>
        </div>
      </div>

      {/* Navigation List - Meta/Facebook Style */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-2 border border-gray-200 dark:border-gray-800 shadow-xs space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Settings Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left cursor-pointer ${
                isActive
                  ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-white font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-[#e02f21] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs leading-none">{item.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={14}
                className={isActive ? 'text-[#e02f21]' : 'text-gray-400'}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SettingsSidebar;

