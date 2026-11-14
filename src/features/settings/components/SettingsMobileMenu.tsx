import React, { useState } from 'react';
import { Link } from 'react-router';
import Avatar from '../../../components/ui/Avatar';
import {
  ArrowLeft,
  Search,
  Home,
  UserCog,
  Shield,
  SlidersHorizontal,
  Film,
  UserX,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface SettingsMobileMenuProps {
  user?: any;
  onSelectTab: (tabId: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg?: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  subtitle?: string;
  items: MenuItem[];
}

export const SettingsMobileMenu: React.FC<SettingsMobileMenuProps> = ({ user, onSelectTab }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sections: MenuSection[] = [
    {
      title: 'Profile and security',
      subtitle: 'Manage your personal details, credentials, and account settings.',
      items: [
        {
          id: 'HOME',
          label: 'Home',
          desc: 'Account overview, theme, and notification preferences',
          icon: Home,
        },
        {
          id: 'PERSONAL',
          label: 'Personal details',
          desc: 'Name, phone number, bio, birthday, and contact info',
          icon: UserCog,
        },
        {
          id: 'SECURITY',
          label: 'Login and security',
          desc: 'Password, two-factor authentication, active sessions, and passkeys',
          icon: Shield,
        },
        {
          id: 'MANAGE',
          label: 'Manage account',
          desc: 'Account deactivation, temporary pause, or permanent deletion',
          icon: SlidersHorizontal,
        },
      ],
    },
    {
      title: 'Media',
      subtitle: 'Control photo & video quality, autoplay, and data usage.',
      items: [
        {
          id: 'MEDIA',
          label: 'Media',
          desc: 'Autoplay options, high-resolution upload, data saver, and cache',
          icon: Film,
        },
      ],
    },
    {
      title: 'Privacy & Activity',
      subtitle: 'Control who you interact with and manage deleted content.',
      items: [
        {
          id: 'BLOCKING',
          label: 'Blocking',
          desc: 'Review and unblock people you previously blocked',
          icon: UserX,
        },
        {
          id: 'TRASH',
          label: 'Trash',
          desc: 'Restore or permanently remove posts (auto-purged after 30 days)',
          icon: Trash2,
          badge: '30 days',
        },
      ],
    },
  ];

  const q = searchQuery.toLowerCase().trim();
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q)
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="w-full space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="space-y-3 px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e02f21] transition cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Feed</span>
        </Link>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Heshel Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Control how your account works across Heshel apps and devices.
          </p>
        </div>

        {/* Search Settings Input (Meta Style) */}
        <div className="relative pt-1">
          <Search size={16} className="absolute left-3.5 top-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#242526] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 border border-transparent focus:border-[#e02f21] focus:bg-white dark:focus:bg-[#18191a] outline-none transition"
          />
        </div>
      </div>

      {/* Categorized List Rows (Meta Style) */}
      <div className="space-y-6">
        {/* Your Account Card (Meta Style) */}
        {!q && user && (
          <div className="space-y-2">
            <div className="px-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Your account
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('PERSONAL')}
              className="w-full bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#2b2c2d] active:bg-gray-100 dark:active:bg-[#343638] transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <Avatar src={user.image} alt={user.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {user.name || 'Heshel Account'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    Password, security, personal details, media
                  </p>
                </div>
              </div>

              <ChevronRight
                size={18}
                className="text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        )}

        {filteredSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-2">
            {/* Section Header */}
            <div className="px-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {section.subtitle}
                </p>
              )}
            </div>

            {/* Section Cards List */}
            <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs divide-y divide-gray-100 dark:divide-gray-800/80 overflow-hidden">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className="w-full flex items-center justify-between gap-3.5 p-4 text-left transition hover:bg-gray-50 dark:hover:bg-[#2b2c2d] active:bg-gray-100 dark:active:bg-[#343638] cursor-pointer group"
                  >
                    {/* Left: Icon & Text */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#343638] text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-[#e02f21] transition">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {item.label}
                          </p>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Chevron */}
                    <ChevronRight
                      size={18}
                      className="text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <Sparkles size={28} className="mx-auto text-gray-400" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              No matching settings found
            </p>
            <p className="text-xs text-gray-500">
              Try searching with another keyword like &ldquo;security&rdquo; or &ldquo;media&rdquo;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsMobileMenu;
