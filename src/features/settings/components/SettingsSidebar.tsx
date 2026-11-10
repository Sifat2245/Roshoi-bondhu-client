import React from 'react';
import { Link } from 'react-router';
import {
  Home,
  Shield,
  UserCog,
  ArrowLeft,
} from 'lucide-react';

export interface SettingsSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'PERSONAL', label: 'Personal details', icon: UserCog },
    {
      id: 'HOME',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'SECURITY',
      label: 'Login and security',
      icon: Shield,
    },
    {
      id: 'MANAGE',
      label: 'Manage account',
      icon: UserCog,
    },
  ];

  return (
    <aside className="w-full space-y-6 select-none">
      {/* Top Brand Header matching Meta Account Center */}
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e02f21] transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              Heshel Account
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Control how your account works across Heshel apps and devices.{' '}
          </p>
        </div>
      </div>

      {/* Navigation List - Modern Meta Pill Style matching Screenshot 1 */}
      <nav aria-label="Account settings" className="flex lg:block gap-2 lg:space-y-1.5 overflow-x-auto pt-1 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`shrink-0 lg:w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl transition text-left cursor-pointer font-semibold text-sm whitespace-nowrap ${
                isActive
                  ? 'bg-[#343638] text-white dark:bg-white dark:text-gray-900 shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2b2c2d]'
              }`}
            >
              <Icon size={19} className="shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;

