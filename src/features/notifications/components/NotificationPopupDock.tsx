import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { useNotifications } from "../../../context/NotificationContext";
import { router } from "../../../app/router";
import NotificationBadgeIcon from "./NotificationBadgeIcon";
import {
  formatNotificationTime,
  type Notification,
} from "../types/notification.types";

const NotificationPopupCard: React.FC<{ notification: Notification }> = ({
  notification,
}) => {
  const {
    markRead,
    respond,
    dismissPopup,
    pausePopupTimer,
    resumePopupTimer,
  } = useNotifications();
  const [busyAction, setBusyAction] = useState<"ACCEPT" | "DECLINE" | null>(
    null,
  );

  const actor = notification.actor || notification.sender;

  const handleNavigate = () => {
    markRead([notification.id]);
    dismissPopup(notification.id);
    if (notification.link) {
      router.navigate(notification.link);
    }
  };

  const handleRespond = async (
    e: React.MouseEvent,
    action: "ACCEPT" | "DECLINE",
  ) => {
    e.stopPropagation();
    if (busyAction) return;
    setBusyAction(action);
    try {
      await respond(notification.id, action);
    } catch {
      setBusyAction(null);
    }
  };

  return (
    <div
      onMouseEnter={() => pausePopupTimer(notification.id)}
      onMouseLeave={() => resumePopupTimer(notification.id)}
      onClick={handleNavigate}
      role="status"
      className="pointer-events-auto bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200/90 dark:border-gray-700/90 p-3.5 cursor-pointer hover:bg-gray-50/90 dark:hover:bg-[#2c2d2e] transition-all animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      {/* Top Bar ("New notification" + Dismiss button) */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          New notification
        </span>
        <button
          type="button"
          aria-label="Close notification popup"
          onClick={(e) => {
            e.stopPropagation();
            dismissPopup(notification.id);
          }}
          className="w-6 h-6 rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar
            src={actor?.image}
            alt={actor?.name || "User"}
            size="md"
          />
          <NotificationBadgeIcon
            iconType={notification.iconType}
            type={notification.type}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-gray-800 dark:text-gray-200 leading-snug line-clamp-3">
            <span className="font-bold text-gray-900 dark:text-white mr-1">
              {actor?.name || "Heshel Friend"}
            </span>
            {notification.message}
          </p>
          <p className="text-xs font-bold text-[#e02f21] mt-1">
            {formatNotificationTime(notification.createdAt)}
          </p>

          {notification.actionable && (
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={(e) => handleRespond(e, "ACCEPT")}
                className="flex-1 py-1.5 px-3 bg-[#e02f21] hover:bg-[#c92518] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {busyAction === "ACCEPT" && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Accept
              </button>
              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={(e) => handleRespond(e, "DECLINE")}
                className="flex-1 py-1.5 px-3 bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {busyAction === "DECLINE" && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Decline
              </button>
            </div>
          )}
        </div>

        {notification.isUnread && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#e02f21] shrink-0 mt-1.5" />
        )}
      </div>
    </div>
  );
};

export const NotificationPopupDock: React.FC = () => {
  const { popupQueue } = useNotifications();

  if (popupQueue.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-[9998] flex flex-col gap-2.5 sm:w-[340px] pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {popupQueue.map((item) => (
        <NotificationPopupCard key={item.id} notification={item} />
      ))}
    </div>
  );
};

export default NotificationPopupDock;

