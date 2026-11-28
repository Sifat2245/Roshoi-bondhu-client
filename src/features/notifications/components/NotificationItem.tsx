import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { useNavigate } from "react-router";
import NotificationBadgeIcon from "./NotificationBadgeIcon";
import {
  formatNotificationTime,
  type Notification,
} from "../types/notification.types";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onAction?: (id: string, action: "ACCEPT" | "DECLINE" | string) => Promise<void> | void;
  compact?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onAction,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const actor = notification.actor || notification.sender;

  const activate = () => {
    onMarkRead?.(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleActionClick = async (
    e: React.MouseEvent,
    action: "ACCEPT" | "DECLINE",
  ) => {
    e.stopPropagation();
    if (!onAction || busyAction) return;
    setBusyAction(action);
    try {
      await onAction(notification.id, action);
    } finally {
      setBusyAction(null);
    }
  };

  const timeLabel =
    notification.timeAgo || formatNotificationTime(notification.createdAt);

  return (
    <div
      onClick={activate}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.currentTarget === event.target && event.key === "Enter") {
          activate();
        }
      }}
      className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition ${
        notification.isUnread
          ? "bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/60 dark:hover:bg-red-950/40"
          : "hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
      }`}
    >
      {/* Avatar with reaction badge */}
      <div className="relative shrink-0">
        <Avatar
          src={actor?.image}
          alt={actor?.name || "User"}
          size={compact ? "md" : "lg"}
        />
        <NotificationBadgeIcon
          iconType={notification.iconType}
          type={notification.type}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
          <span className="font-bold text-gray-900 dark:text-white mr-1.5">
            {actor?.name || "Heshel Friend"}
          </span>
          {notification.message}
        </p>

        <p className="text-xs sm:text-sm font-semibold text-[#e02f21] mt-1">
          {timeLabel}
        </p>

        {/* Actionable buttons (Accept / Decline) */}
        {notification.actionable && onAction && (
          <div className="flex items-center gap-2.5 mt-2.5">
            <button
              type="button"
              disabled={Boolean(busyAction)}
              onClick={(e) => handleActionClick(e, "ACCEPT")}
              className="px-4 py-2 bg-[#e02f21] hover:bg-[#c92518] text-white rounded-xl text-sm font-bold transition shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {busyAction === "ACCEPT" && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Accept
            </button>
            <button
              type="button"
              disabled={Boolean(busyAction)}
              onClick={(e) => handleActionClick(e, "DECLINE")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] text-gray-800 dark:text-gray-200 rounded-xl text-sm font-bold transition cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {busyAction === "DECLINE" && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Decline
            </button>
          </div>
        )}
      </div>

      {/* Unread Indicator Dot */}
      {notification.isUnread && (
        <div className="w-2.5 h-2.5 rounded-full bg-[#e02f21] shrink-0 mt-2"></div>
      )}
    </div>
  );
};

export default NotificationItem;
