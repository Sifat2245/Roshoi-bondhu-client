import { apolloClient } from "../../../lib/graphql/client";
import { GROUPS_QUERY, GROUP_QUERY } from "../../../lib/graphql/queries";
import {
  CREATE_GROUP_MUTATION,
  JOIN_GROUP_MUTATION,
  LEAVE_GROUP_MUTATION,
  UPDATE_GROUP_MEMBER_ROLE_MUTATION,
  REMOVE_GROUP_MEMBER_MUTATION,
  ADD_GROUP_MEMBER_MUTATION,
  UPDATE_GROUP_COVER_MUTATION,
} from "../../../lib/mutations/group.mutations";
import { Group, CreateGroupPayload } from "../types/group.types";

export const groupsApi = {
  getGroups: async (
    params?: string | { search?: string; limit?: number; myGroups?: boolean },
    token: string | null = null,
  ): Promise<Group[]> => {
    let search: string | undefined = undefined;
    let myGroups: boolean | undefined = undefined;

    if (typeof params === "string") {
      search = params || undefined;
    } else if (params && typeof params === "object") {
      search = params.search || undefined;
      myGroups = params.myGroups || undefined;
    }

    const { data } = await apolloClient.query({
      query: GROUPS_QUERY,
      variables: { search, myGroups },
      fetchPolicy: "network-only",
      context: token
        ? {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    });

    return data?.groups || [];
  },

  getGroupBySlug: async (
    slug: string,
    token: string | null = null,
  ): Promise<Group> => {
    const { data } = await apolloClient.query({
      query: GROUP_QUERY,
      variables: { slug },
      fetchPolicy: "network-only",
      context: token
        ? {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    });
    return data?.group;
  },

  createGroup: async (
    groupData: CreateGroupPayload,
    token: string | null = null,
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_GROUP_MUTATION,
      variables: {
        name: groupData.name,
        description: groupData.description,
        privacy: groupData.privacy,
        coverImage: groupData.coverImage,
        avatar: groupData.avatar,
        invitedUserIds: groupData.invitedUserIds,
      },
      context: token
        ? {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        : undefined,
      refetchQueries: [{ query: GROUPS_QUERY }],
    });
    // Evict groups query from cache so the new group is immediately listed
    apolloClient.cache.evict({ fieldName: "groups" });
    apolloClient.cache.gc();
    return data?.createGroup;
  },

  joinGroup: async (groupId: string, token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: JOIN_GROUP_MUTATION,
      variables: { groupId },
      context: token
        ? {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        : undefined,
      refetchQueries: [{ query: GROUPS_QUERY }],
    });
    apolloClient.cache.evict({ fieldName: "groups" });
    apolloClient.cache.gc();
    return { success: data?.joinGroup };
  },

  leaveGroup: async (groupId: string, token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: LEAVE_GROUP_MUTATION,
      variables: { groupId },
      context: token
        ? {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        : undefined,
      refetchQueries: [{ query: GROUPS_QUERY }],
    });
    apolloClient.cache.evict({ fieldName: "groups" });
    apolloClient.cache.gc();
    return { success: data?.leaveGroup };
  },

  updateMemberRole: async (
    groupId: string,
    memberId: string,
    role: string,
    _token: string | null = null,
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_GROUP_MEMBER_ROLE_MUTATION,
      variables: { groupId, memberId, role },
    });
    return data?.updateGroupMemberRole;
  },

  removeMember: async (
    groupId: string,
    memberId: string,
    _token: string | null = null,
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: REMOVE_GROUP_MEMBER_MUTATION,
      variables: { groupId, memberId },
    });
    return { success: data?.removeGroupMember };
  },

  addMember: async (
    groupId: string,
    userId: string,
    role: string = "MEMBER",
    _token: string | null = null,
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: ADD_GROUP_MEMBER_MUTATION,
      variables: { groupId, userId, role },
    });
    return data?.addGroupMember;
  },

  updateGroupCover: async (
    groupId: string,
    coverImage: string,
    _token: string | null = null,
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_GROUP_COVER_MUTATION,
      variables: { groupId, coverImage },
    });
    return data?.updateGroupCover;
  },

  updateGroupSettings: async (
    slug: string,
    settings: any,
    _token: string | null = null,
  ) => {
    void slug;
    void settings;
    return { success: true };
  },
};

export default groupsApi;
