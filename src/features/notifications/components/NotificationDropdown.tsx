import React, { useState } from 'react';
import { Link } from 'react-router';
import { MoreHorizontal, CheckCheck } from 'lucide-react';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({
  notifications = [],
  onClose,
  onMarkAllRead,
  onMarkRead,
  onAction,
}) => {
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  const filtered =
    filter === 'UNREAD'
      ? notifications.filter((n) => n.isUnread)
      : notifications;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[85vh]"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2">
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          Notifications
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
            title="Mark all as read"
          >
            <CheckCheck size={16} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs (All / Unread) */}
      <div className="flex items-center gap-2 px-2 pb-2">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition cursor-pointer ${
            filter === 'ALL'
              ? 'bg-red-50 text-[#e02f21] dark:bg-red-950/60'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition cursor-pointer ${
            filter === 'UNREAD'
              ? 'bg-red-50 text-[#e02f21] dark:bg-red-950/60'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-50 dark:divide-gray-800/50 space-y-0.5">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkRead={onMarkRead}
              onAction={onAction}
              compact
            />
          ))
        ) : (
          <div className="py-10 text-center text-sm text-gray-400">
            No {filter === 'UNREAD' ? 'unread ' : ''}notifications
          </div>
        )}
      </div>

      {/* Bottom Footer Link */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-sm font-bold text-[#e02f21] hover:underline block py-1.5"
        >
          See previous notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;

