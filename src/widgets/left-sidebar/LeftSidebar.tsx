import { useAuth } from "../../context/AuthContext";
import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router";
import { useSession } from "../../lib/auth-client";
import { useLanguage } from "../../context/LanguageContext";
import Avatar from "../../components/ui/Avatar";
import groupsApi from "../../features/groups/api/groups.api";
import {
  Home,
  Users,
  UserCheck,
  MessageCircle,
  Settings as SettingsIcon,
  BookOpen,
  Carrot,
  CalendarDays,
  FilePenLine,
} from "lucide-react";

const LeftSidebar = ({ compact = false }: { compact?: boolean }) => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const user = session?.user || authUser;

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Fetch groups for "Your shortcuts"
  useEffect(() => {
    if (compact) return;
    const fetchShortcuts = async () => {
      setLoadingGroups(true);
      try {
        const data = await groupsApi.getGroups(
          { limit: 8 },
          session?.session?.token,
        );
        setGroups(data);
      } catch (err) {
        console.error("Failed to load shortcuts", err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchShortcuts();
  }, [session, compact]);

  if (compact)
    return (
      <nav aria-label="Sidebar navigation" className="space-y-2">
        {[
          { to: "/", label: "Feed", icon: Home },
          { to: "/friends", label: "Friends", icon: UserCheck },
          { to: "/groups", label: "Groups", icon: Users },
          { to: "/messages", label: "Messenger", icon: MessageCircle },
          { to: "/cookbook", label: "Cookbooks", icon: BookOpen },
          { to: "/pantry", label: "My pantry", icon: Carrot },
          { to: "/meal-planner", label: "Meal planner", icon: CalendarDays },
          { to: "/drafts", label: "Recipe drafts", icon: FilePenLine },
          { to: "/settings", label: "Settings", icon: SettingsIcon },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            end={to === "/"}
            to={to}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              `h-11 w-11 flex items-center justify-center rounded-xl ${isActive ? "bg-gray-200 dark:bg-[#3a3b3c] text-[#e02f21]" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3b3c]"}`
            }
          >
            <Icon size={21} />
          </NavLink>
        ))}
      </nav>
    );

  const navRowClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-bold transition cursor-pointer ${
      isActive
        ? "bg-gray-200/80 dark:bg-[#3a3b3c] text-[#e02f21]"
        : "text-gray-800 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]"
    }`;

  return (
    <aside className="w-full space-y-1.5 select-none">
      {/* 1. User Profile Row */}
      {user ? (
        <Link
          to={`/profile/${user.id}`}
          className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] transition text-base font-bold text-gray-900 dark:text-white"
        >
          <Avatar src={user.image} alt={user.name} size="md" />
          <span className="truncate">{user.name}</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] transition text-base font-bold text-gray-900 dark:text-white"
        >
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 text-[#e02f21] flex items-center justify-center font-bold text-sm">
            H
          </div>
          <span className="truncate">Sign In to Heshel</span>
        </Link>
      )}

      {/* 2. Feed / Home */}
      <NavLink to="/" end className={navRowClass}>
        <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e02f21] flex items-center justify-center shrink-0">
          <Home size={20} />
        </div>
        <span>{t("feed")}</span>
      </NavLink>

      {/* 3. Friends */}
      <NavLink to="/friends" className={navRowClass}>
        <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
          <UserCheck size={20} />
        </div>
        <span>Friends</span>
      </NavLink>

      {/* 4. Groups */}
      <NavLink to="/groups" className={navRowClass}>
        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
          <Users size={20} />
        </div>
        <span>{t("groups")}</span>
      </NavLink>

      {/* 5. Messenger (matching user arrow in Image 3) */}
      <NavLink to="/messages" className={navRowClass}>
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
          <MessageCircle size={20} />
        </div>
        <span>Messenger</span>
      </NavLink>

      <div className="px-3.5 pt-4 pb-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        My kitchen
      </div>
      {[
        {
          to: "/cookbook",
          label: "Cookbooks",
          icon: BookOpen,
          color:
            "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
        },
        {
          to: "/pantry",
          label: "My pantry",
          icon: Carrot,
          color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600",
        },
        {
          to: "/meal-planner",
          label: "Meal planner",
          icon: CalendarDays,
          color:
            "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
        },
        {
          to: "/drafts",
          label: "Recipe drafts",
          icon: FilePenLine,
          color:
            "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
        },
      ].map(({ to, label, icon: Icon, color }) => (
        <NavLink key={to} to={to} className={navRowClass}>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${color}`}
          >
            <Icon size={20} />
          </div>
          <span>{label}</span>
        </NavLink>
      ))}

      {/* Settings & Account */}
      {user && (
        <NavLink to="/settings" className={navRowClass}>
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
            <SettingsIcon size={20} />
          </div>
          <span>Settings</span>
        </NavLink>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-800 my-2.5 pt-1"></div>

      {/* "Your shortcuts" / Groups List Section */}
      <div className="space-y-1.5">
        <div className="px-3.5 py-1.5 flex items-center justify-between">
          <span className="text-sm font-black text-gray-500 uppercase tracking-wider">
            Your shortcuts
          </span>
          <Link
            to="/groups"
            className="text-sm font-bold text-[#e02f21] hover:underline"
          >
            See all
          </Link>
        </div>

        {loadingGroups ? (
          <div className="px-3.5 py-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          groups.map((g) => (
            <Link
              key={g.id}
              to={`/group/${g.slug}`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] transition text-base font-bold text-gray-800 dark:text-gray-200 group"
            >
              <img
                src={
                  g.coverImage ||
                  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100"
                }
                alt={g.name}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-gray-700 shadow-2xs"
              />
              <span className="truncate group-hover:text-[#e02f21] transition">
                {g.name}
              </span>
            </Link>
          ))
        ) : (
          <div className="px-3.5 py-2 text-base text-gray-400">
            No groups yet.{" "}
            <Link
              to="/groups/create"
              className="text-[#e02f21] underline font-bold"
            >
              Create one!
            </Link>
          </div>
        )}
      </div>

      {/* Mini Footer */}
      <div className="px-3.5 pt-4 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
        <p>Heshel © 2026 • Bengali Culinary Network</p>
        <p className="mt-0.5">Privacy • Terms • Multilingual EN & বাং</p>
      </div>
    </aside>
  );
};

export default LeftSidebar;
