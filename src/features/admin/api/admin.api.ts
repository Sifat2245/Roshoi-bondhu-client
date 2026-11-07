import apiClient from '../../../lib/api-client';
import { AdminStats, AdminReport, UserRole, UserStatus } from '../types/admin.types';
import { User } from '../../auth/types/auth.types';

export const adminApi = {
  getStats: async (token: string | null = null): Promise<AdminStats> => {
    const res = await apiClient.get<{ success: boolean; data: { stats: AdminStats } }>(
      '/api/admin/stats',
      { token }
    );
    return res.data?.stats;
  },

  getUsers: async (search: string = '', token: string | null = null): Promise<User[]> => {
    const res = await apiClient.get<{ success: boolean; data: User[] }>(
      `/api/admin/users?search=${encodeURIComponent(search)}`,
      { token }
    );
    return res.data || [];
  },

  getReports: async (token: string | null = null): Promise<AdminReport[]> => {
    const res = await apiClient.get<{ success: boolean; data: AdminReport[] }>(
      '/api/admin/reports',
      { token }
    );
    return res.data || [];
  },

  updateUserRole: async (userId: string, role: UserRole, token: string | null = null) => {
    return apiClient.patch(`/api/admin/users/${userId}/role`, { role }, { token });
  },

  updateUserStatus: async (userId: string, status: UserStatus, token: string | null = null) => {
    return apiClient.patch(`/api/admin/users/${userId}/status`, { status }, { token });
  },

  resolveReport: async (reportId: string, token: string | null = null) => {
    return apiClient.patch(`/api/admin/reports/${reportId}/status`, { status: 'RESOLVED' }, { token });
  },

  dismissReport: async (reportId: string, token: string | null = null) => {
    return apiClient.patch(`/api/admin/reports/${reportId}/status`, { status: 'DISMISSED' }, { token });
  },
};

export default adminApi;

