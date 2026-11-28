import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  FileClock,
  UserPlus,
  Ban,
  ScrollText,
  Users,
  Layers,
  Shield,
  Settings,
  Home,
} from "lucide-react";
import type { GroupManageCounts, GroupManageSection } from "./types";

interface GroupMobileManageHubProps {
  group: any;
  isAdmin: boolean;
  counts: GroupManageCounts;
  onSelectSection: (section: GroupManageSection) => void;
  onClose: () => void;
}

export const GroupMobileManageHub: React.FC<GroupMobileManageHubProps> = ({
  group,
  isAdmin,
  counts,
  onSelectSection,
  onClose,
}) => {
  const reviewItems: {
    id: GroupManageSection;
    label: string;
    subtext: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: "REPORTED_CONTENT",
      label: "Reported",
      subtext: `${counts.reportedContent} awaiting review`,
      count: counts.reportedContent,
      icon: <Flag size={18} />,
    },
    {
      id: "PENDING_POSTS",
      label: "Pending approvals",
      subtext: `${counts.pendingPosts} posts to review`,
      count: counts.pendingPosts,
      icon: <FileClock size={18} />,
    },
    {
      id: "MEMBER_REQUESTS",
      label: "Member requests",
      subtext: `${counts.memberRequests} waiting approval`,
      count: counts.memberRequests,
      icon: <UserPlus size={18} />,
    },
    {
      id: "BANNED_MEMBERS",
      label: "Banned members",
      subtext: `${counts.bannedMembers} currently banned`,
      count: counts.bannedMembers,
      icon: <Ban size={18} />,
    },
  ];

  const shortcutItems: {
    id: GroupManageSection;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "OVERVIEW",
      label: "Overview",
      icon: <Layers size={18} />,
    },
    {
      id: "COMMUNITY_ROLES",
      label: "People & community roles",
      icon: <Users size={18} />,
    },
    {
      id: "GROUP_RULES",
      label: "Group rules",
      icon: <ScrollText size={18} />,
    },
    {
      id: "HOME",
      label: "Community home",
      icon: <Home size={18} />,
    },
  ];

  return (
    <div className="min-h-full bg-white dark:bg-[#18191a] flex flex-col">
      {/* Top Bar pinned cleanly at top=0 inside the scroll container */}
      <div className="sticky top-0 z-20 bg-[#e02f21] text-white px-3 py-3 flex items-center gap-3 shadow-sm">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to group"
          className="p-1.5 rounded-full hover:bg-white/15 transition cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base truncate">{group.name}</p>
          <p className="text-[11px] text-white/80 font-medium">
            Manage group
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-xs font-bold shrink-0">
          <Shield size={13} />
          <span>{isAdmin ? "Admin" : "Moderator"}</span>
        </span>
      </div>

      {/* Body Sections */}
      <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-800 pb-10">
        {/* To Review */}
        <section className="px-4 py-4 space-y-1">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white pb-2">
            To review
          </h2>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {reviewItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className="w-full flex items-center justify-between gap-3 py-3.5 text-left active:bg-gray-50 dark:active:bg-[#242526] transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#242526] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {item.subtext}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-sm font-bold shrink-0 px-2.5 py-0.5 rounded-full ${
                    item.count > 0
                      ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Tool Shortcuts */}
        <section className="px-4 py-4 space-y-1">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white pb-2">
            Tool shortcuts
          </h2>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {shortcutItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  item.id === "HOME" ? onClose() : onSelectSection(item.id)
                }
                className="w-full flex items-center justify-between gap-3 py-3.5 text-left active:bg-gray-50 dark:active:bg-[#242526] transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#242526] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSelectSection("OVERVIEW")}
            className="mt-3 w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#242526] dark:hover:bg-[#3a3b3c] text-sm font-bold text-gray-800 dark:text-gray-200 transition cursor-pointer"
          >
            See All Tools
          </button>
        </section>

        {/* Settings */}
        {isAdmin && (
          <section className="px-4 py-4 space-y-1">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white pb-2">
              Settings
            </h2>
            <button
              type="button"
              onClick={() => onSelectSection("SETTINGS")}
              className="w-full flex items-center justify-between gap-3 py-3 text-left active:bg-gray-50 dark:active:bg-[#242526] transition cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#242526] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0">
                  <Settings size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    Group settings
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Privacy, post approvals, ownership & status
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default GroupMobileManageHub;

