import { useQuery, useQueryClient } from "@tanstack/react-query";
import { friendsApi } from "../api/friends.api";
import {
  Friend,
  FriendSuggestion,
  FriendRequest,
  RelationshipStatusResponse,
  BlockedUser,
} from "../types/friends.types";

export const FRIENDS_QUERY_KEY = "friends";
export const FRIEND_REQUESTS_QUERY_KEY = "friendRequests";
export const FRIEND_SUGGESTIONS_QUERY_KEY = "friendSuggestions";
export const RELATIONSHIP_STATUS_QUERY_KEY = "relationshipStatus";
export const BLOCKED_USERS_QUERY_KEY = "blockedUsers";

/**
 * Hook to fetch friends list with 10-minute cache.
 */
export function useFriendsQuery(
  token?: string | null,
  search?: string,
  userId?: string
) {
  const normalizedUserId = userId && userId !== "me" ? userId : undefined;
  return useQuery<Friend[]>({
    queryKey: [FRIENDS_QUERY_KEY, normalizedUserId || "me", search || ""],
    queryFn: () => friendsApi.getAllFriends(token, search, normalizedUserId),
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 20 * 60 * 1000,    // 20 minutes in cache
  });
}

/**
 * Hook to fetch incoming friend requests with 5-minute cache.
 */
export function useFriendRequestsQuery(token?: string | null) {
  return useQuery<FriendRequest[]>({
    queryKey: [FRIEND_REQUESTS_QUERY_KEY],
    queryFn: () => friendsApi.getFriendRequests(token),
    staleTime: 5 * 60 * 1000,  // 5 minutes fresh
    gcTime: 15 * 60 * 1000,
    enabled: Boolean(token),
  });
}

/**
 * Hook to fetch People You May Know suggestions with 10-minute cache.
 */
export function useFriendSuggestionsQuery(
  token?: string | null,
  limit: number = 25
) {
  return useQuery<FriendSuggestion[]>({
    queryKey: [FRIEND_SUGGESTIONS_QUERY_KEY, limit],
    queryFn: () => friendsApi.getSuggestions(token, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook to fetch relationship status with a target user with 5-minute cache.
 */
export function useRelationshipStatusQuery(
  targetUserId?: string | null,
  token?: string | null
) {
  return useQuery<RelationshipStatusResponse>({
    queryKey: [RELATIONSHIP_STATUS_QUERY_KEY, targetUserId],
    queryFn: () => friendsApi.getRelationshipStatus(targetUserId!, token),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 15 * 60 * 1000,
    enabled: Boolean(targetUserId && token),
  });
}

/**
 * Hook to fetch blocked users list with 5-minute cache.
 */
export function useBlockedUsersQuery(token?: string | null) {
  return useQuery<BlockedUser[]>({
    queryKey: [BLOCKED_USERS_QUERY_KEY],
    queryFn: () => friendsApi.getBlockedUsers(token),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: Boolean(token),
  });
}

/**
 * Query invalidation helper to immediately refresh friend caches on user actions.
 */
export function useInvalidateFriendsQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateFriends: (userId?: string) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [FRIENDS_QUERY_KEY, userId] });
      } else {
        queryClient.invalidateQueries({ queryKey: [FRIENDS_QUERY_KEY] });
      }
    },
    invalidateRequests: () => {
      queryClient.invalidateQueries({ queryKey: [FRIEND_REQUESTS_QUERY_KEY] });
    },
    invalidateSuggestions: () => {
      queryClient.invalidateQueries({ queryKey: [FRIEND_SUGGESTIONS_QUERY_KEY] });
    },
    invalidateBlockedUsers: () => {
      queryClient.invalidateQueries({ queryKey: [BLOCKED_USERS_QUERY_KEY] });
    },
    invalidateRelationship: (targetUserId?: string) => {
      if (targetUserId) {
        queryClient.invalidateQueries({
          queryKey: [RELATIONSHIP_STATUS_QUERY_KEY, targetUserId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [RELATIONSHIP_STATUS_QUERY_KEY],
        });
      }
    },
    invalidateAllFriendsData: (targetUserId?: string) => {
      queryClient.invalidateQueries({ queryKey: [FRIENDS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FRIEND_REQUESTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FRIEND_SUGGESTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BLOCKED_USERS_QUERY_KEY] });
      if (targetUserId) {
        queryClient.invalidateQueries({
          queryKey: [RELATIONSHIP_STATUS_QUERY_KEY, targetUserId],
        });
      }
    },
  };
}

