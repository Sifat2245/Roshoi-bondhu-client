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
  BLOCK_USER_MUTATION,
  UNBLOCK_USER_MUTATION,
} from "../../../lib/graphql/mutations";
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
      email
      image
      bio
      mutualCount
    }
  }
`;

export const friendsApi = {
  getAllFriends: async (
    token: string | null = null,
    search?: string,
    userId?: string
  ): Promise<Friend[]> => {
    void token;
    const targetId = userId && userId !== "me" && userId !== "undefined" && userId !== "null" ? userId : undefined;
    const { data } = await apolloClient.query({
      query: FRIENDS_QUERY,
      variables: { userId: targetId, search: search?.trim() || undefined },
      fetchPolicy: "network-only",
    });
    return data?.friends || [];
  },

  getFriendRequests: async (
    token: string | null = null
  ): Promise<FriendRequest[]> => {
    void token;
    const { data } = await apolloClient.query({
      query: FRIEND_REQUESTS_QUERY,
      fetchPolicy: "network-only",
    });
    return data?.friendRequests || [];
  },

  getSuggestions: async (
    token: string | null = null,
    limit: number = 25
  ): Promise<FriendSuggestion[]> => {
    void token;
    const { data } = await apolloClient.query({
      query: SUGGESTIONS_QUERY,
      variables: { limit },
      fetchPolicy: "network-only",
    });
    return data?.friendSuggestions || [];
  },

  getRelationshipStatus: async (
    targetUserId: string,
    _token: string | null = null
  ): Promise<RelationshipStatusResponse> => {
    try {
      const { data } = await apolloClient.query({
        query: RELATIONSHIP_STATUS_QUERY,
        variables: { targetUserId },
        fetchPolicy: "network-only",
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
    void token;
    const { data } = await apolloClient.mutate({
      mutation: SEND_FRIEND_REQUEST_MUTATION,
      variables: { receiverId: targetUserId },
    });
    return data?.sendFriendRequest;
  },

  acceptFriendRequest: async (
    requestIdOrUserId: string,
    token: string | null = null
  ) => {
    void token;
    const { data } = await apolloClient.mutate({
      mutation: ACCEPT_FRIEND_REQUEST_MUTATION,
      variables: { requestId: requestIdOrUserId },
    });
    return { success: data?.acceptFriendRequest };
  },

  declineFriendRequest: async (
    requestIdOrUserId: string,
    token: string | null = null
  ) => {
    void token;
    const { data } = await apolloClient.mutate({
      mutation: DECLINE_FRIEND_REQUEST_MUTATION,
      variables: { requestId: requestIdOrUserId },
    });
    return { success: data?.declineFriendRequest };
  },

  cancelFriendRequest: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    void token;
    const { data } = await apolloClient.mutate({
      mutation: CANCEL_FRIEND_REQUEST_MUTATION,
      variables: { receiverId: targetUserId },
    });
    return { success: data?.cancelFriendRequest };
  },

  unfriend: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    void token;
    const { data } = await apolloClient.mutate({
      mutation: UNFRIEND_MUTATION,
      variables: { friendId: targetUserId },
    });
    return { success: data?.unfriend };
  },

  blockUser: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    void token;
    const { data } = await apolloClient.mutate({
      mutation: BLOCK_USER_MUTATION,
      variables: { userId: targetUserId },
    });
    return { success: data?.blockUser };
  },

  unblockUser: async (
    targetUserId: string,
    token: string | null = null
  ) => {
    void token;
    const { data } = await apolloClient.mutate({
      mutation: UNBLOCK_USER_MUTATION,
      variables: { userId: targetUserId },
    });
    return { success: data?.unblockUser };
  },

  getBlockedUsers: async (
    token: string | null = null
  ): Promise<BlockedUser[]> => {
    void token;
    const { data } = await apolloClient.query({
      query: BLOCKED_USERS_QUERY,
      fetchPolicy: "network-only",
    });
    return data?.blockedUsers || [];
  },
};

export default friendsApi;
