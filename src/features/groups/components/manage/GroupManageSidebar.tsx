import React, { useState } from "react";
import {
  Home,
  Layers,
  UserPlus,
  FileClock,
  Flag,
  Ban,
  ScrollText,
  Shield,
  Settings,
  ChevronDown,
  Lock,
  Globe,
} from "lucide-react";
import defaultGroupCover from "../../../../assets/group/group-default.png";
import type { GroupManageCounts, GroupManageSection } from "./types";

interface GroupManageSidebarProps {
  group: any;
  activeSection: GroupManageSection;
  onSelectSection: (section: GroupManageSection) => void;
  isAdmin: boolean;
  counts: GroupManageCounts;
}

export const GroupManageSidebar: React.FC<GroupManageSidebarProps> = ({
  group,
  activeSection,
  onSelectSection,
  isAdmin,
  counts,
}) => {
  const [adminToolsOpen, setAdminToolsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const memberCount =
    group.membersCount ?? group.members?.length ?? 1;

  const adminToolItems: {
    id: GroupManageSection;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: "MEMBER_REQUESTS",
      label: "Member requests",
      subtitle: `${counts.memberRequests} pending`,
      icon: <UserPlus size={18} />,
      badge: counts.memberRequests,
    },
    {
      id: "PENDING_POSTS",
      label: "Pending posts",
      subtitle: `${counts.pendingPosts} waiting approval`,
      icon: <FileClock size={18} />,
      badge: counts.pendingPosts,
    },
    {
      id: "REPORTED_CONTENT",
      label: "Member-reported content",
      subtitle: `${counts.reportedContent} to review`,
      icon: <Flag size={18} />,
      badge: counts.reportedContent,
    },
    {
      id: "BANNED_MEMBERS",
      label: "Banned members",
      subtitle: `${counts.bannedMembers} restricted`,
      icon: <Ban size={18} />,
      badge: counts.bannedMembers,
    },
    {
      id: "GROUP_RULES",
      label: "Group rules",
      subtitle: "Community guidelines",
      icon: <ScrollText size={18} />,
    },
    {
      id: "COMMUNITY_ROLES",
      label: "Community roles",
      subtitle: "Admins, moderators & members",
      icon: <Shield size={18} />,
    },
  ];

  const isNavActive = (id: GroupManageSection) => activeSection === id;

  return (
    <aside
      aria-label="Group management sidebar"
      className="hidden lg:flex lg:w-[310px] xl:w-[340px] shrink-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800 flex-col h-full shadow-xs select-none"
    >
      {/* Group Identity Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => onSelectSection("HOME")}
          className="w-full flex items-center gap-3 text-left rounded-xl p-1.5 -m-1.5 hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/60 transition cursor-pointer"
        >
          <img
            src={group.avatar || group.coverImage || defaultGroupCover}
            alt={group.name}
            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-gray-700"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
              {group.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              {group.privacy === "PRIVATE" ? (
                <Lock size={12} className="shrink-0" />
              ) : (
                <Globe size={12} className="shrink-0" />
              )}
              <span>
                {group.privacy === "PRIVATE" ? "Private group" : "Public group"}
              </span>
              <span>•</span>
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </p>
          </div>
        </button>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-4">
        {/* Top Manage Section */}
        <div className="space-y-1">
          <p className="px-2.5 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Manage
          </p>

          <button
            type="button"
            onClick={() => onSelectSection("HOME")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              isNavActive("HOME")
                ? "bg-red-50 dark:bg-red-950/35 text-[#e02f21] font-bold"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
            }`}
          >
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isNavActive("HOME")
                  ? "bg-[#e02f21] text-white"
                  : "bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300"
              }`}
            >
              <Home size={17} />
            </span>
            <span className="truncate">Community home</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection("OVERVIEW")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              isNavActive("OVERVIEW")
                ? "bg-red-50 dark:bg-red-950/35 text-[#e02f21] font-bold"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
            }`}
          >
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isNavActive("OVERVIEW")
                  ? "bg-[#e02f21] text-white"
                  : "bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300"
              }`}
            >
              <Layers size={17} />
            </span>
            <span className="truncate">Overview</span>
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Collapsible Admin Tools */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setAdminToolsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition cursor-pointer"
          >
            <span>Admin tools</span>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform duration-200 ${
                adminToolsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {adminToolsOpen && (
            <div className="space-y-1 pt-1">
              {adminToolItems.map((item) => {
                const active = isNavActive(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${
                      active
                        ? "bg-red-50 dark:bg-red-950/35 text-[#e02f21]"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active
                          ? "bg-[#e02f21] text-white"
                          : "bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm truncate ${
                            active ? "font-bold" : "font-semibold"
                          }`}
                        >
                          {item.label}
                        </span>
                        {typeof item.badge === "number" && item.badge > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e02f21] text-white shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Collapsible Settings Section */}
        {isAdmin && (
          <>
            <div className="border-t border-gray-100 dark:border-gray-800" />
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSettingsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition cursor-pointer"
              >
                <span>Settings</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-200 ${
                    settingsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {settingsOpen && (
                <div className="space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectSection("SETTINGS")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${
                      isNavActive("SETTINGS")
                        ? "bg-red-50 dark:bg-red-950/35 text-[#e02f21]"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isNavActive("SETTINGS")
                          ? "bg-[#e02f21] text-white"
                          : "bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <Settings size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-sm block truncate ${
                          isNavActive("SETTINGS") ? "font-bold" : "font-semibold"
                        }`}
                      >
                        Group settings
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        Privacy, approvals & ownership
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default GroupManageSidebar;

