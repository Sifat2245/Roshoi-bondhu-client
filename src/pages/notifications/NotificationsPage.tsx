import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import NotificationItem from '../../features/notifications/components/NotificationItem';
import { Bell, CheckCheck, Settings, Filter, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { notificationsApi } from '../../features/notifications/api/notifications.api';

const NotificationsPage = () => {
  const { data: session } = useSession();
  const { notify } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'INVITES'

  const token = session?.session?.token;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getNotifications(token);
      if (data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const sync = () => { notificationsApi.getNotifications(token).then(setNotifications).catch(() => {}); };
    window.addEventListener('heshel:notifications-updated', sync); window.addEventListener('heshel:notification-preferences', sync);
    return () => { window.removeEventListener('heshel:notifications-updated', sync); window.removeEventListener('heshel:notification-preferences', sync); };
  }, [fetchNotifications, token]);

  const handleMarkRead = (id) => {
    notificationsApi.markRead([id]);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const handleMarkAllRead = () => {
    notificationsApi.markRead(notifications.map((item) => item.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    notify.success('All notifications marked as read');
  };

  const handleAction = async (id, actionType) => {
    try { await notificationsApi.respond(id, actionType); } catch (error: any) { notify.error(error.message || 'Could not respond to the invitation.'); return; }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (actionType === 'ACCEPT') {
      notify.success('Invitation accepted');
    } else {
      notify.info('Invitation declined');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return n.isUnread;
    if (filter === 'INVITES') return n.type === 'GROUP_INVITE';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <main className="pt-[100px] md:pt-14 w-full">
        <div className="max-w-[800px] mx-auto px-4 py-8 space-y-5">
          {/* Header Card */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                <Bell size={24} className="text-[#e02f21]" />
                <span>Notification Center</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Stay updated with reactions, comments, group invites, and foodie friends.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-xs font-bold rounded-xl transition self-start sm:self-auto cursor-pointer"
            >
              <CheckCheck size={15} className="text-[#1877f2]" />
              <span>Mark all as read</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UNREAD', label: 'Unread' },
              { id: 'INVITES', label: 'Group Invites' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#1877f2] text-white shadow-xs'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications Stream Card */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-3 space-y-1">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onAction={handleAction}
                />
              ))
            ) : (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">All Caught Up!</h3>
                <p className="text-xs text-gray-500">You don't have any new notifications to review.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;

