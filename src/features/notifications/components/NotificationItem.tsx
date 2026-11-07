import React from 'react';
import { Heart, MessageSquare, UserPlus, Users, Sparkles, Check, X } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';

const NotificationItem = ({
  notification,
  onMarkRead,
  onAction,
  compact = false,
}) => {
  const getBadge = () => {
    switch (notification.iconType) {
      case 'HEART':
        return (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]">
            <Heart size={11} fill="currentColor" />
          </div>
        );
      case 'COMMENT':
        return (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]">
            <MessageSquare size={11} fill="currentColor" />
          </div>
        );
      case 'INVITE':
        return (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#e02f21] text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]">
            <Users size={11} />
          </div>
        );
      default:
        return (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#e02f21] text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]">
            <Sparkles size={11} />
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onMarkRead && onMarkRead(notification.id)}
      className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition ${
        notification.isUnread
          ? 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/60 dark:hover:bg-red-950/40'
          : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
      }`}
    >
      {/* Avatar with reaction badge */}
      <div className="relative shrink-0">
        <Avatar
          src={notification.actor?.image}
          alt={notification.actor?.name || 'User'}
          size={compact ? 'md' : 'lg'}
        />
        {getBadge()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
          <span className="font-bold text-gray-900 dark:text-white mr-1.5">
            {notification.actor?.name || 'Heshel Friend'}
          </span>
          {notification.message}
        </p>

        <p className="text-xs sm:text-sm font-semibold text-[#e02f21] mt-1">
          {notification.timeAgo || 'Just now'}
        </p>

        {/* Actionable buttons (Accept / Decline) */}
        {notification.actionable && onAction && (
          <div className="flex items-center gap-2.5 mt-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction(notification.id, 'ACCEPT');
              }}
              className="px-4 py-2 bg-[#e02f21] hover:bg-[#c92518] text-white rounded-xl text-sm font-bold transition shadow-xs cursor-pointer"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction(notification.id, 'DECLINE');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] text-gray-800 dark:text-gray-200 rounded-xl text-sm font-bold transition cursor-pointer"
            >
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

