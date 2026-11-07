import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import Avatar from '../../components/ui/Avatar';
import groupsApi from '../../features/groups/api/groups.api';
import {
  Home,
  Users,
  UserCheck,
  Shield,
  Settings as SettingsIcon,
} from 'lucide-react';

const LeftSidebar = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const user = session?.user;

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Fetch groups for "Your shortcuts"
  useEffect(() => {
    const fetchShortcuts = async () => {
      setLoadingGroups(true);
      try {
        const data = await groupsApi.getGroups({ limit: 8 }, session?.session?.token);
        setGroups(data);
      } catch (err) {
        console.error('Failed to load shortcuts', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchShortcuts();
  }, [session]);

  const navRowClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
      isActive
        ? 'bg-gray-200/80 dark:bg-[#3a3b3c] text-[#e02f21] font-bold'
        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]'
    }`;

  return (
    <aside className="w-full space-y-1 select-none">
      {/* 1. User Profile Row */}
      {user ? (
        <Link
          to={`/profile/${user.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] transition text-sm font-semibold text-gray-900 dark:text-white"
        >
          <Avatar src={user.image} alt={user.name} size="sm" />
          <span className="truncate">{user.name}</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] transition text-sm font-semibold text-gray-900 dark:text-white"
        >
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-[#e02f21] flex items-center justify-center font-bold text-xs">
            H
          </div>
          <span className="truncate">Sign In to Heshel</span>
        </Link>
      )}

      {/* 2. Feed / Home */}
      <NavLink to="/" end className={navRowClass}>
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e02f21] flex items-center justify-center shrink-0">
          <Home size={18} />
        </div>
        <span>{t('feed')}</span>
      </NavLink>

      {/* 3. Friends */}
      <NavLink to="/friends" className={navRowClass}>
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
          <UserCheck size={18} />
        </div>
        <span>Friends</span>
      </NavLink>

      {/* 4. Groups */}
      <NavLink to="/groups" className={navRowClass}>
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
          <Users size={18} />
        </div>
        <span>{t('groups')}</span>
      </NavLink>

      {/* Settings & Account */}
      {user && (
        <NavLink to="/settings" className={navRowClass}>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
            <SettingsIcon size={18} />
          </div>
          <span>Settings</span>
        </NavLink>
      )}

      {/* 5. Admin & Moderator Control Panel (Staff only) */}
      {user && ['ADMIN', 'MODERATOR'].includes(user.role) && (
        <NavLink
          to="/admin-portal"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              isActive
                ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`
          }
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Shield size={18} />
          </div>
          <span>{t('adminPortal')}</span>
        </NavLink>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-1"></div>

      {/* "Your shortcuts" / Groups List Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Your shortcuts
          </span>
          <Link
            to="/groups"
            className="text-[11px] font-semibold text-[#e02f21] hover:underline"
          >
            See all
          </Link>
        </div>

        {loadingGroups ? (
          <div className="px-3 py-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          groups.map((g) => (
            <Link
              key={g.id}
              to={`/group/${g.slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] transition text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 group"
            >
              <img
                src={
                  g.coverImage ||
                  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
                }
                alt={g.name}
                className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-gray-700"
              />
              <span className="truncate group-hover:text-[#e02f21] transition">
                {g.name}
              </span>
            </Link>
          ))
        ) : (
          <div className="px-3 py-2 text-xs text-gray-400">
            No groups yet.{' '}
            <Link to="/groups" className="text-[#e02f21] underline">
              Create one!
            </Link>
          </div>
        )}
      </div>

      {/* Mini Footer */}
      <div className="px-3 pt-4 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
        <p>Heshel © 2026 • Bengali Culinary Network</p>
        <p className="mt-0.5">Privacy • Terms • Multilingual EN & বাং</p>
      </div>
    </aside>
  );
};

export default LeftSidebar;

