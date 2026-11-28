import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../lib/auth-client";
import { useSocket } from "./SocketContext";
import { useToast } from "./ToastContext";
import notificationsApi from "../features/notifications/api/notifications.api";
import { type Notification } from "../features/notifications/types/notification.types";
import {
  getNotificationPreferences,
  isNotificationTypeEnabled,
} from "../lib/notification-preferences";
import {
  playNotificationSound,
  unlockNotificationAudio,
} from "../lib/notification-sound";
import { FRIEND_REQUESTS_QUERY_KEY } from "../features/friends/hooks/useFriendsQueries";

interface NotificationContextValue {
  notifications: Notification[];
  popupQueue: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  respond: (id: string, action: "ACCEPT" | "DECLINE" | string) => Promise<void>;
  dismissPopup: (id: string) => void;
  pausePopupTimer: (id: string) => void;
  resumePopupTimer: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const POPUP_TTL_MS = 7000;
const MAX_POPUPS = 3;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const userId = session?.user?.id;
  const token = session?.session?.token || null;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popupQueue, setPopupQueue] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const timersRef = useRef<Map<string, number>>(new Map());

  const clearPopupTimer = useCallback((id: string) => {
    const existing = timersRef.current.get(id);
    if (existing !== undefined) {
      window.clearTimeout(existing);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissPopup = useCallback(
    (id: string) => {
      clearPopupTimer(id);
      setPopupQueue((prev) => prev.filter((item) => item.id !== id));
    },
    [clearPopupTimer],
  );

  const startPopupTimer = useCallback(
    (id: string) => {
      clearPopupTimer(id);
      const timer = window.setTimeout(() => {
        dismissPopup(id);
      }, POPUP_TTL_MS);
      timersRef.current.set(id, timer);
    },
    [clearPopupTimer, dismissPopup],
  );

  const pausePopupTimer = useCallback(
    (id: string) => {
      clearPopupTimer(id);
    },
    [clearPopupTimer],
  );

  const resumePopupTimer = useCallback(
    (id: string) => {
      startPopupTimer(id);
    },
    [startPopupTimer],
  );

  const refreshNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const list = await notificationsApi.getNotifications(token);
      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setPopupQueue([]);
      return;
    }

    refreshNotifications();

    const onPrefsOrSync = () => {
      refreshNotifications();
    };
    window.addEventListener("heshel:notification-preferences", onPrefsOrSync);
    window.addEventListener("heshel:notifications-updated", onPrefsOrSync);

    const onUnlock = () => unlockNotificationAudio();
    window.addEventListener("pointerdown", onUnlock, { once: true });
    window.addEventListener("keydown", onUnlock, { once: true });

    return () => {
      window.removeEventListener("heshel:notification-preferences", onPrefsOrSync);
      window.removeEventListener("heshel:notifications-updated", onPrefsOrSync);
      window.removeEventListener("pointerdown", onUnlock);
      window.removeEventListener("keydown", onUnlock);
    };
  }, [userId, refreshNotifications]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleNew = (incoming: Notification) => {
      if (!incoming?.id) return;
      const prefs = getNotificationPreferences();
      if (!isNotificationTypeEnabled(incoming.type, prefs)) return;

      setNotifications((prev) => {
        const filtered = prev.filter((item) => item.id !== incoming.id);
        return [incoming, ...filtered];
      });

      setPopupQueue((prev) => {
        const filtered = prev.filter((item) => item.id !== incoming.id);
        return [...filtered.slice(-(MAX_POPUPS - 1)), incoming];
      });
      startPopupTimer(incoming.id);
      playNotificationSound();

      if (
        incoming.type === "FRIEND_REQUEST" ||
        incoming.type === "FRIEND_ACCEPT"
      ) {
        queryClient.invalidateQueries({ queryKey: [FRIEND_REQUESTS_QUERY_KEY] });
      }
      if (incoming.type === "GROUP_INVITE") {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
      }
    };

    const handleUpdated = (patch: Partial<Notification> & { id: string }) => {
      if (!patch?.id) return;
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === patch.id ? { ...item, ...patch } : item,
        ),
      );
      setPopupQueue((prev) =>
        prev.map((item) =>
          item.id === patch.id ? { ...item, ...patch } : item,
        ),
      );
    };

    const handleDismissed = (payload: { id?: string }) => {
      if (!payload?.id) return;
      setNotifications((prev) => prev.filter((item) => item.id !== payload.id));
      dismissPopup(payload.id);
    };

    const handleRead = (payload: { ids?: string[] }) => {
      const idSet = new Set(payload?.ids || []);
      if (idSet.size === 0) return;
      setNotifications((prev) =>
        prev.map((item) =>
          idSet.has(item.id) ? { ...item, isUnread: false } : item,
        ),
      );
    };

    const handleReadAll = () => {
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isUnread: false })),
      );
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:updated", handleUpdated);
    socket.on("notification:dismissed", handleDismissed);
    socket.on("notification:read", handleRead);
    socket.on("notification:read-all", handleReadAll);

    return () => {
      socket.off("notification:new", handleNew);
      socket.off("notification:updated", handleUpdated);
      socket.off("notification:dismissed", handleDismissed);
      socket.off("notification:read", handleRead);
      socket.off("notification:read-all", handleReadAll);
    };
  }, [socket, userId, startPopupTimer, dismissPopup, queryClient]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const markRead = useCallback(
    async (ids: string[]) => {
      if (!ids || ids.length === 0) return;
      const idSet = new Set(ids);
      setNotifications((prev) =>
        prev.map((n) => (idSet.has(n.id) ? { ...n, isUnread: false } : n)),
      );
      try {
        await notificationsApi.markRead(ids, token);
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    },
    [token],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    try {
      await notificationsApi.markRead([], token, true);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  }, [token]);

  const respond = useCallback(
    async (id: string, action: "ACCEPT" | "DECLINE" | string) => {
      const target = notifications.find((n) => n.id === id);
      try {
        await notificationsApi.respond(id, action, token);
        dismissPopup(id);

        if (action === "DECLINE") {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          notify.info(
            target?.type === "FRIEND_REQUEST"
              ? "Friend request declined"
              : "Invitation declined",
          );
        } else {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === id
                ? {
                    ...n,
                    actionable: false,
                    actionStatus: "ACCEPTED",
                    isUnread: false,
                  }
                : n,
            ),
          );
          notify.success(
            target?.type === "FRIEND_REQUEST"
              ? "Friend request accepted"
              : "Group invitation accepted",
            "Accepted",
            true,
          );
        }

        if (target?.type === "FRIEND_REQUEST") {
          queryClient.invalidateQueries({ queryKey: [FRIEND_REQUESTS_QUERY_KEY] });
          queryClient.invalidateQueries({ queryKey: ["friends"] });
        }
        if (target?.type === "GROUP_INVITE") {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          queryClient.invalidateQueries({ queryKey: ["groupDetail"] });
        }
      } catch (err: any) {
        notify.error(err?.message || "Could not process your response.");
        throw err;
      }
    },
    [notifications, token, dismissPopup, notify, queryClient],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isUnread).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        popupQueue,
        unreadCount,
        loading,
        refreshNotifications,
        markRead,
        markAllRead,
        respond,
        dismissPopup,
        pausePopupTimer,
        resumePopupTimer,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return ctx;
};

export default NotificationContext;

