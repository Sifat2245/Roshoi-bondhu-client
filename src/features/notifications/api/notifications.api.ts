import apiClient from '../../../lib/api-client';
import { Notification } from '../types/notification.types';

export const notificationsApi = {
  getNotifications: async (token: string | null = null): Promise<Notification[]> => {
    const res = await apiClient.get<{ success: boolean; data: Notification[] }>('/api/user/notifications', { token });
    return res.data || [];
  },
};

export default notificationsApi;

