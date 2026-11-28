import React from "react";
import {
  Heart,
  MessageSquare,
  UserPlus,
  UserCheck,
  Users,
  AtSign,
  Bell,
} from "lucide-react";

interface NotificationBadgeIconProps {
  iconType?: string;
  type?: string;
  size?: "sm" | "md";
}

export const NotificationBadgeIcon: React.FC<NotificationBadgeIconProps> = ({
  iconType,
  type,
  size = "md",
}) => {
  const key = iconType || type || "SYSTEM";
  const boxClass = size === "sm" ? "w-4.5 h-4.5" : "w-5 h-5";
  const iconSize = size === "sm" ? 10 : 11;

  switch (key) {
    case "HEART":
    case "POST_LIKE":
    case "COMMENT_LIKE":
    case "LIKE":
      return (
        <div
          className={`absolute -bottom-1 -right-1 ${boxClass} rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]`}
        >
          <Heart size={iconSize} fill="currentColor" />
        </div>
      );
    case "COMMENT":
    case "POST_COMMENT":
    case "COMMENT_REPLY":
      return (
        <div
          className={`absolute -bottom-1 -right-1 ${boxClass} rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]`}
        >
          <MessageSquare size={iconSize} fill="currentColor" />
        </div>
      );
    case "MENTION":
      return (
        <div
          className={`absolute -bottom-1 -right-1 ${boxClass} rounded-full bg-amber-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]`}
        >
          <AtSign size={iconSize} strokeWidth={2.5} />
        </div>
      );
    case "FRIEND_REQUEST":
      return (
        <div
          className={`absolute -bottom-1 -right-1 ${boxClass} rounded-full bg-[#1877f2] text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]`}
        >
          <UserPlus size={iconSize} />
        </div>
      );
    case "FRIEND_ACCEPT":
      return (
        <div
          className={`absolute -bottom-1 -right-1 ${boxClass} rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]`}
        >
          <UserCheck size={iconSize} />
        </div>
      );
    case "INVITE":
    case "GROUP_INVITE":
      return (
        <div
          className={`absolute -bottom-1 -right-1 ${boxClass} rounded-full bg-[#e02f21] text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]`}
        >
          <Users size={iconSize} />
        </div>
      );
    default:
      return (
        <div
          className={`absolute -bottom-1 -right-1 ${boxClass} rounded-full bg-gray-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]`}
        >
          <Bell size={iconSize} />
        </div>
      );
  }
};

export default NotificationBadgeIcon;

