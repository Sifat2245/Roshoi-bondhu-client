import React from 'react';
import { Link } from 'react-router';
import {
  Home,
  Shield,
  UserCog,
  ArrowLeft,
  UserX,
  Film,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';

export interface SettingsSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavSection {
  title?: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[];
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, onSelectTab }) => {
  const sections: NavSection[] = [
    {
      title: 'Profile and security',
      items: [
        { id: 'HOME', label: 'Home', icon: Home },
        { id: 'PERSONAL', label: 'Personal details', icon: UserCog },
        { id: 'SECURITY', label: 'Login and security', icon: Shield },
        { id: 'MANAGE', label: 'Manage account', icon: SlidersHorizontal },
      ],
    },
    {
      title: 'Media',
      items: [
        { id: 'MEDIA', label: 'Media', icon: Film },
      ],
    },
    {
      title: 'Privacy & Activity',
      items: [
        { id: 'BLOCKING', label: 'Blocking', icon: UserX },
        { id: 'TRASH', label: 'Trash', icon: Trash2 },
      ],
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

      {/* Navigation List - Desktop Categorized Sidebar */}
      <nav aria-label="Account settings" className="space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Category Header */}
            {section.title && (
              <div className="px-3 pt-2 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.title}
                </span>
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl transition text-left cursor-pointer font-semibold text-sm whitespace-nowrap ${
                    isActive
                      ? 'bg-[#343638] text-white dark:bg-white dark:text-gray-900 shadow-xs'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2b2c2d]'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
