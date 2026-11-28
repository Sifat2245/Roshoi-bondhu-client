import apiClient from "../../../lib/api-client";
import { Notification } from "../types/notification.types";
import {
  isDemoMode,
  readDemo,
  writeDemo,
  demoRequest,
} from "../../../lib/demo/demo-store";
import {
  getNotificationPreferences,
  isNotificationTypeEnabled,
} from "../../../lib/notification-preferences";

export const notificationsApi = {
  getNotifications: async (
    token: string | null = null,
  ): Promise<Notification[]> => {
    const res = await apiClient.get<{ success: boolean; data: Notification[] }>(
      "/api/user/notifications",
      { token },
    );
    const preferences = getNotificationPreferences();
    return (res.data || []).filter((item) =>
      isNotificationTypeEnabled(item.type, preferences),
    );
  },

  markRead: async (
    ids: string[],
    token: string | null = null,
    all = false,
  ): Promise<void> => {
    if (isDemoMode()) {
      const state = readDemo();
      state.notifications = state.notifications.map((item) =>
        all || ids.includes(item.id) ? { ...item, isUnread: false } : item,
      );
      writeDemo(state);
      return;
    }

    if (!all && ids.length === 0) return;
    await apiClient.post(
      "/api/user/notifications/read",
      all ? { all: true } : { ids },
      { token },
    );
  },

  respond: async (
    id: string,
    action: "ACCEPT" | "DECLINE" | string,
    token: string | null = null,
  ): Promise<void> => {
    if (isDemoMode()) {
      if (action === "ACCEPT") {
        const notification = readDemo().notifications.find(
          (item) => item.id === id,
        );
        if (
          notification?.type === "GROUP_INVITE" &&
          notification.link?.startsWith("/group/")
        ) {
          await demoRequest(
            `/api/group/${notification.link.split("/").pop()}/join`,
            "POST",
            {},
          );
        }
      }
      return;
    }

    await apiClient.post(
      `/api/user/notifications/${id}/respond`,
      { action },
      { token },
    );
  },

  dismiss: async (
    id: string,
    token: string | null = null,
  ): Promise<void> => {
    if (isDemoMode()) return;
    await apiClient.delete(`/api/user/notifications/${id}`, { token });
  },
};

export default notificationsApi;
