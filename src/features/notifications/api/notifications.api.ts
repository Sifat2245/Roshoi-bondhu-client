import apiClient from "../../../lib/api-client";
import { Notification } from "../types/notification.types";
import {
  isDemoMode,
  readDemo,
  writeDemo,
  demoRequest,
} from "../../../lib/demo/demo-store";
import { getNotificationPreferences } from "../../../lib/notification-preferences";

const readIds = () => {
  try {
    return JSON.parse(
      localStorage.getItem("heshel:read-notifications") || "[]",
    ) as string[];
  } catch {
    return [];
  }
};
const dismissedIds = () => {
  try {
    return JSON.parse(
      localStorage.getItem("heshel:dismissed-notifications") || "[]",
    ) as string[];
  } catch {
    return [];
  }
};
const changed = () =>
  window.dispatchEvent(new Event("heshel:notifications-updated"));

export const notificationsApi = {
  getNotifications: async (
    token: string | null = null,
  ): Promise<Notification[]> => {
    const res = await apiClient.get<{ success: boolean; data: Notification[] }>(
      "/api/user/notifications",
      { token },
    );
    const read = readIds();
    const dismissed = dismissedIds();
    const preferences = getNotificationPreferences();
    return (res.data || [])
      .filter(
        (item) =>
          !dismissed.includes(item.id) && preferences[item.type] !== false,
      )
      .map((item) => ({
        ...item,
        isUnread: item.isUnread && !read.includes(item.id),
      }));
  },
  markRead: (ids: string[]) => {
    localStorage.setItem(
      "heshel:read-notifications",
      JSON.stringify([...new Set([...readIds(), ...ids])]),
    );
    if (isDemoMode()) {
      const state = readDemo();
      state.notifications = state.notifications.map((item) =>
        ids.includes(item.id) ? { ...item, isUnread: false } : item,
      );
      writeDemo(state);
    }
    changed();
  },
  respond: async (id: string, action: string) => {
    if (isDemoMode() && action === "ACCEPT") {
      const notification = readDemo().notifications.find(
        (item) => item.id === id,
      );
      if (
        notification?.type === "GROUP_INVITE" &&
        notification.link?.startsWith("/group/")
      )
        await demoRequest(
          `/api/group/${notification.link.split("/").pop()}/join`,
          "POST",
          {},
        );
    }
    localStorage.setItem(
      "heshel:dismissed-notifications",
      JSON.stringify([...new Set([...dismissedIds(), id])]),
    );
    changed();
  },
};

export default notificationsApi;
