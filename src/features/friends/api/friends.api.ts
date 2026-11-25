import { gql } from "@apollo/client";
import { apolloClient } from "../../../lib/graphql/client";
import {
  FRIENDS_QUERY,
  FRIEND_REQUESTS_QUERY,
  BLOCKED_USERS_QUERY,
  RELATIONSHIP_STATUS_QUERY,
} from "../../../lib/graphql/queries";
import {
  SEND_FRIEND_REQUEST_MUTATION,
  ACCEPT_FRIEND_REQUEST_MUTATION,
  DECLINE_FRIEND_REQUEST_MUTATION,
  CANCEL_FRIEND_REQUEST_MUTATION,
  UNFRIEND_MUTATION,
} from "../../../lib/mutations/friend.mutations";
import {
  BLOCK_USER_MUTATION,
  UNBLOCK_USER_MUTATION,
} from "../../../lib/mutations/user.mutations";
import {
  Friend,
  FriendSuggestion,
  FriendRequest,
  RelationshipStatusResponse,
  BlockedUser,
} from "../types/friends.types";

const SUGGESTIONS_QUERY = gql`
  query GetSuggestions($limit: Int) {
    friendSuggestions(limit: $limit) {
      id
      name
      username
      email
      image
      bio
      mutualCount
    }
  }
`;

const authContext = (token?: string | null) =>
  token ? { headers: { authorization: `Bearer ${token}` } } : undefined;

export const friendsApi = {
  getAllFriends: async (
    token: string | null = null,
    search?: string,
    userId?: string
  ): Promise<Friend[]> => {
    const targetId = userId && userId !== "me" && userId !== "undefined" && userId !== "null" ? userId : undefined;
    const { data } = await apolloClient.query({
      query: FRIENDS_QUERY,
      variables: { userId: targetId, search: search?.trim() || undefined },
      fetchPolicy: "network-only",
      context: authContext(token),
    });
    return (data?.friends || []).map((f: any) => ({
      ...f,
      mutualFriends: f.mutualCount ?? f.mutualFriends ?? 0,
    }));
  },

  getFriendRequests: async (
    token: string | null = null
  ): Promise<FriendRequest[]> => {
    const { data } = await apolloClient.query({
      query: FRIEND_REQUESTS_QUERY,
      fetchPolicy: "network-only",
      context: authContext(token),
    });
    return (data?.friendRequests || []).map((r: any) => ({
      id: r.id,
      userId: r.sender?.id || r.senderId || r.userId || r.id,
      senderId: r.senderId || r.sender?.id || r.userId,
      receiverId: r.receiverId,
      status: r.status,
      name: r.sender?.name || r.name || "Chef",
      username: r.sender?.username || r.username || "",
      image: r.sender?.image ?? r.image ?? null,
      city: r.sender?.city ?? r.city ?? null,
      bio: r.sender?.bio ?? r.bio ?? null,
      mutualFriends: r.mutualFriendsCount ?? r.mutualFriends ?? 0,
      createdAt: r.createdAt,
      sender: r.sender || null,
    }));
  },

  getSuggestions: async (
    token: string | null = null,
    limit: number = 25
  ): Promise<FriendSuggestion[]> => {
    const { data } = await apolloClient.query({
      query: SUGGESTIONS_QUERY,
      variables: { limit },
      fetchPolicy: "network-only",
      context: authContext(token),
    });
    return (data?.friendSuggestions || []).map((s: any) => ({
      ...s,
      mutualFriends: s.mutualCount ?? s.mutualFriends ?? 0,
    }));
  },

  getRelationshipStatus: async (
    targetUserId: string,
    token: string | null = null
  ): Promise<RelationshipStatusResponse> => {
    try {
      const { data } = await apolloClient.query({
        query: RELATIONSHIP_STATUS_QUERY,
        variables: { targetUserId },
        fetchPolicy: "network-only",
        context: authContext(token),
      });
      return data?.relationshipStatus || { status: "NONE" };
    } catch {
      return { status: "NONE" };
    }
  },

  sendFriendRequest: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: SEND_FRIEND_REQUEST_MUTATION,
      variables: { receiverId: targetUserId },
      context: authContext(token),
    });
    return data?.sendFriendRequest;
  },

  acceptFriendRequest: async (
    requestIdOrUserId: string,
    token: string | null = null
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: ACCEPT_FRIEND_REQUEST_MUTATION,
      variables: { requestId: requestIdOrUserId },
      context: authContext(token),
    });
    return { success: data?.acceptFriendRequest };
  },

  declineFriendRequest: async (
    requestIdOrUserId: string,
    token: string | null = null
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: DECLINE_FRIEND_REQUEST_MUTATION,
      variables: { requestId: requestIdOrUserId },
      context: authContext(token),
    });
    return { success: data?.declineFriendRequest };
  },

  cancelFriendRequest: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: CANCEL_FRIEND_REQUEST_MUTATION,
      variables: { receiverId: targetUserId },
      context: authContext(token),
    });
    return { success: data?.cancelFriendRequest };
  },

  unfriend: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: UNFRIEND_MUTATION,
      variables: { friendId: targetUserId },
      context: authContext(token),
    });
    return { success: data?.unfriend };
  },

  blockUser: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: BLOCK_USER_MUTATION,
      variables: { userId: targetUserId },
      context: authContext(token),
    });
    return { success: data?.blockUser };
  },

  unblockUser: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: UNBLOCK_USER_MUTATION,
      variables: { userId: targetUserId },
      context: authContext(token),
    });
    return { success: data?.unblockUser };
  },

  getBlockedUsers: async (
    token: string | null = null
  ): Promise<BlockedUser[]> => {
    const { data } = await apolloClient.query({
      query: BLOCKED_USERS_QUERY,
      fetchPolicy: "network-only",
      context: authContext(token),
    });
    return data?.blockedUsers || [];
  },
};

export default friendsApi;
