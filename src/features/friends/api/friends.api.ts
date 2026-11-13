import apiClient from "../../../lib/api-client";
import {
  Friend,
  FriendSuggestion,
  FriendRequest,
  RelationshipStatusResponse,
  BlockedUser,
} from "../types/friends.types";

export const friendsApi = {
  getAllFriends: async (
    token: string | null = null,
    search?: string,
    userId?: string
  ): Promise<Friend[]> => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append("search", search.trim());
    if (userId && userId !== "me" && userId !== "undefined" && userId !== "null") {
      params.append("userId", userId);
    }
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient.get<{ success: boolean; data: Friend[] }>(
      `/api/friends/all${qs}`,
      { token }
    );
    return res.data || [];
  },

  getFriendRequests: async (
    token: string | null = null
  ): Promise<FriendRequest[]> => {
    const res = await apiClient.get<{
      success: boolean;
      data: FriendRequest[];
    }>("/api/friends/requests", { token });
    return res.data || [];
  },

  getSuggestions: async (
    token: string | null = null,
    limit: number = 25
  ): Promise<FriendSuggestion[]> => {
    const res = await apiClient.get<{
      success: boolean;
      data: FriendSuggestion[];
    }>(`/api/friends/suggestions?limit=${limit}`, { token });
    return res.data || [];
  },

  getRelationshipStatus: async (
    targetUserId: string,
    token: string | null = null
  ): Promise<RelationshipStatusResponse> => {
    const res = await apiClient.get<{
      success: boolean;
      data: RelationshipStatusResponse;
    }>(`/api/friends/status/${targetUserId}`, { token });
    return res.data;
  },

  sendFriendRequest: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    return apiClient.post(`/api/friends/request/${targetUserId}`, {}, { token });
  },

  acceptFriendRequest: async (
    requestIdOrUserId: string,
    token: string | null = null
  ) => {
    return apiClient.post(
      `/api/friends/accept/${requestIdOrUserId}`,
      {},
      { token }
    );
  },

  declineFriendRequest: async (
    requestIdOrUserId: string,
    token: string | null = null
  ) => {
    return apiClient.post(
      `/api/friends/decline/${requestIdOrUserId}`,
      {},
      { token }
    );
  },

  cancelFriendRequest: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    return apiClient.post(
      `/api/friends/cancel/${targetUserId}`,
      {},
      { token }
    );
  },

  unfriend: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    return apiClient.post(`/api/friends/unfriend/${targetUserId}`, {}, { token });
  },

  blockUser: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    return apiClient.post(`/api/friends/block/${targetUserId}`, {}, { token });
  },

  unblockUser: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    return apiClient.post(`/api/friends/unblock/${targetUserId}`, {}, { token });
  },

  getBlockedUsers: async (
    token: string | null = null
  ): Promise<BlockedUser[]> => {
    const res = await apiClient.get<{
      success: boolean;
      data: BlockedUser[];
    }>("/api/friends/blocked", { token });
    return res.data || [];
  },
};

export default friendsApi;
