import apiClient from '../../../lib/api-client';
import { Friend, FriendSuggestion } from '../types/friends.types';

export const friendsApi = {
  getAllFriends: async (token: string | null = null): Promise<Friend[]> => {
    const res = await apiClient.get<{ success: boolean; data: Friend[] }>('/api/user/friends/all', { token });
    return res.data || [];
  },

  getSuggestions: async (token: string | null = null): Promise<FriendSuggestion[]> => {
    const res = await apiClient.get<{ success: boolean; data: FriendSuggestion[] }>('/api/user/friends/suggestions', { token });
    return res.data || [];
  },

  sendFriendRequest: async (targetUserId: string, token: string | null = null) => {
    return apiClient.post(`/api/user/${targetUserId}/follow`, {}, { token });
  },
};

export default friendsApi;

