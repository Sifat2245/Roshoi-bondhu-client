import React from "react";
import {
  UserPlus,
  FileClock,
  Flag,
  Ban,
  ScrollText,
  Shield,
} from "lucide-react";
import Button from "../../../../../components/ui/Button";
import type { GroupManageCounts, GroupManageSection } from "../types";

interface GroupManageOverviewProps {
  group: any;
  isAdmin: boolean;
  counts: GroupManageCounts;
  onSelectSection: (section: GroupManageSection) => void;
}

export const GroupManageOverview: React.FC<GroupManageOverviewProps> = ({
  group,
  isAdmin,
  counts,
  onSelectSection,
}) => {
  const isPaused = group.status === "PAUSED";
  const privacy = group.privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC";
  const discoverability =
    group.discoverability === "HIDDEN" ? "HIDDEN" : "VISIBLE";

  const reviewCards: {
    id: GroupManageSection;
    label: string;
    count: number;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "MEMBER_REQUESTS",
      label: "Member requests",
      count: counts.memberRequests,
      desc: "Approve or decline people waiting to join.",
      icon: <UserPlus size={20} />,
    },
    {
      id: "PENDING_POSTS",
      label: "Pending posts",
      count: counts.pendingPosts,
      desc: "Review submissions awaiting staff approval.",
      icon: <FileClock size={20} />,
    },
    {
      id: "REPORTED_CONTENT",
      label: "Member-reported content",
      count: counts.reportedContent,
      desc: "Check flagged posts, comments, or members.",
      icon: <Flag size={20} />,
    },
    {
      id: "BANNED_MEMBERS",
      label: "Banned members",
      count: counts.bannedMembers,
      desc: "View restricted accounts or revoke bans.",
      icon: <Ban size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Group Status Banner */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isPaused
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {isPaused ? "Paused" : "Active"}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {privacy === "PRIVATE" ? "Private group" : "Public group"} •{" "}
              {discoverability === "VISIBLE" ? "Visible" : "Hidden"}
            </span>
          </div>
          <h2 className="font-bold text-base text-gray-900 dark:text-white">
            {group.requiresPostApproval
              ? "Post approval is turned on"
              : "Members can post directly"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {group.requiresPostApproval
              ? "New member posts wait in Pending posts until an admin or moderator approves them."
              : "Published posts from approved members appear immediately in the group."}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectSection("SETTINGS")}
            className="shrink-0 cursor-pointer"
          >
            Edit settings
          </Button>
        )}
      </div>

      {/* To Review Cards Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          To review
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviewCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectSection(card.id)}
              className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs hover:border-[#e02f21]/40 hover:shadow-md transition text-left flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                  {card.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-base text-gray-900 dark:text-white">
                    {card.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white shrink-0">
                {card.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelectSection("GROUP_RULES")}
          className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition flex items-center gap-3 text-left cursor-pointer"
        >
          <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0">
            <ScrollText size={19} />
          </span>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">
              Group rules
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Define community expectations
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection("COMMUNITY_ROLES")}
          className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition flex items-center gap-3 text-left cursor-pointer"
        >
          <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0">
            <Shield size={19} />
          </span>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">
              Community roles
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Promote moderators or manage members
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default GroupManageOverview;

