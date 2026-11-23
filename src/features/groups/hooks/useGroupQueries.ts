import { useQuery, useQueryClient } from "@tanstack/react-query";
import groupsApi from "../api/groups.api";
import postsApi from "../../posts/api/posts.api";
import type { Group } from "../types/group.types";

export const GROUPS_LIST_QUERY_KEY = "groupsList";
export const GROUP_FEED_POSTS_QUERY_KEY = "groupFeedPosts";
export const GROUP_DETAIL_QUERY_KEY = "groupDetail";
export const GROUP_POSTS_QUERY_KEY = "groupPosts";

export const MOCK_FALLBACK_GROUPS = [
  {
    id: "g-grandma",
    name: "Secret Grandma Recipes (দাদীর গোপন রেসিপি)",
    slug: "secret-grandma-recipes",
    avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    description: "Preserving heirloom recipes from Bengali grandmothers across generations.",
    membersCount: 1420,
    privacy: "PUBLIC",
    isMember: true,
    lastActive: "5 hours ago",
  },
  {
    id: "g-baking",
    name: "Baking & Sweet Tooth Club",
    slug: "baking-sweet-tooth-club",
    avatar: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200",
    coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    description: "From shondesh to cheesecakes - the ultimate haven for dessert creators.",
    membersCount: 890,
    privacy: "PUBLIC",
    isMember: true,
    lastActive: "1 day ago",
  },
  {
    id: "g-curries",
    name: "Desi Spices & Curries (দেশি মশলা ও তরকারি)",
    slug: "desi-spices-curries",
    avatar: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200",
    coverImage: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800",
    description: "Master the art of mustard oil, panch phoron, and robust slow-cooked curries.",
    membersCount: 2310,
    privacy: "PUBLIC",
    isMember: false,
    lastActive: "18 mins ago",
  },
  {
    id: "g-biryani",
    name: "Old Dhaka Biryani & Mughlai Guild",
    slug: "old-dhaka-biryani-guild",
    avatar: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200",
    coverImage: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800",
    description: "Kacchi biryani enthusiasts exploring authentic spices and clay pot cooking.",
    membersCount: 3120,
    privacy: "PUBLIC",
    isMember: false,
    lastActive: "2 days ago",
  },
];

export interface GroupsListParams {
  search?: string;
  myGroups?: boolean;
  limit?: number;
}

export function useGroupsListQuery(
  params?: GroupsListParams,
  token?: string | null,
) {
  const search = params?.search || "";
  const myGroups = Boolean(params?.myGroups);

  return useQuery({
    queryKey: [GROUPS_LIST_QUERY_KEY, search, myGroups],
    queryFn: async () => {
      try {
        const data = await groupsApi.getGroups(params, token);
        if (data && data.length > 0) {
          return data;
        }
        return MOCK_FALLBACK_GROUPS as any[];
      } catch (err) {
        console.warn("Failed to fetch groups, using fallback:", err);
        return MOCK_FALLBACK_GROUPS as any[];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 15 * 60 * 1000,    // 15 minutes in memory
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useGroupFeedPostsQuery(
  token?: string | null,
  userId?: string,
) {
  return useQuery({
    queryKey: [GROUP_FEED_POSTS_QUERY_KEY, userId || "anonymous"],
    queryFn: async () => {
      const data = await postsApi.getPosts({ limit: 50 }, token, userId);
      if (!data) return [];
      const groupTagged = data.filter((p: any) => p.group || p.groupId);
      if (groupTagged.length > 0) {
        return groupTagged;
      }
      return data.map((p: any, idx: number) => ({
        ...p,
        group: p.group || MOCK_FALLBACK_GROUPS[idx % MOCK_FALLBACK_GROUPS.length],
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useGroupDetailQuery(
  slug?: string,
  token?: string | null,
) {
  return useQuery({
    queryKey: [GROUP_DETAIL_QUERY_KEY, slug],
    queryFn: async () => {
      if (!slug) return null;
      return await groupsApi.getGroupBySlug(slug, token);
    },
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useGroupPostsQuery(
  groupId?: string,
  token?: string | null,
  userId?: string,
) {
  return useQuery({
    queryKey: [GROUP_POSTS_QUERY_KEY, groupId, userId || "anonymous"],
    queryFn: async () => {
      if (!groupId) return [];
      return await postsApi.getPosts({ groupId }, token, userId);
    },
    enabled: Boolean(groupId),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useInvalidateGroupQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAllGroups: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_LIST_QUERY_KEY] });
    },
    invalidateGroupFeed: () => {
      queryClient.invalidateQueries({ queryKey: [GROUP_FEED_POSTS_QUERY_KEY] });
    },
    invalidateGroupDetail: (slug?: string) => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: [GROUP_DETAIL_QUERY_KEY, slug] });
      } else {
        queryClient.invalidateQueries({ queryKey: [GROUP_DETAIL_QUERY_KEY] });
      }
    },
    invalidateGroupPosts: (groupId?: string) => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: [GROUP_POSTS_QUERY_KEY, groupId] });
      } else {
        queryClient.invalidateQueries({ queryKey: [GROUP_POSTS_QUERY_KEY] });
      }
    },
    updateGroupMembershipInCache: (groupId: string, isMember: boolean) => {
      // Update in groupsList queries
      queryClient.setQueriesData({ queryKey: [GROUPS_LIST_QUERY_KEY] }, (oldGroups: any) => {
        if (!Array.isArray(oldGroups)) return oldGroups;
        return oldGroups.map((g: any) => {
          if (g.id === groupId || g.slug === groupId) {
            const currentCount = g.membersCount ?? 0;
            return {
              ...g,
              isMember,
              membersCount: isMember ? currentCount + 1 : Math.max(0, currentCount - 1),
            };
          }
          return g;
        });
      });

      // Update in groupDetail queries
      queryClient.setQueriesData({ queryKey: [GROUP_DETAIL_QUERY_KEY] }, (oldGroup: any) => {
        if (!oldGroup || (oldGroup.id !== groupId && oldGroup.slug !== groupId)) {
          return oldGroup;
        }
        const currentCount = oldGroup.membersCount ?? 0;
        return {
          ...oldGroup,
          isMember,
          membersCount: isMember ? currentCount + 1 : Math.max(0, currentCount - 1),
        };
      });
    },
    updateMemberRoleInGroup: (groupId: string, memberId: string, role: string) => {
      queryClient.setQueriesData({ queryKey: [GROUP_DETAIL_QUERY_KEY] }, (oldGroup: any) => {
        if (!oldGroup || (oldGroup.id !== groupId && oldGroup.slug !== groupId)) {
          return oldGroup;
        }
        const updatedMembers = (oldGroup.members || []).map((m: any) =>
          m.id === memberId || m.userId === memberId ? { ...m, role } : m
        );
        return {
          ...oldGroup,
          members: updatedMembers,
        };
      });
    },
    removeMemberFromGroup: (groupId: string, memberId: string) => {
      queryClient.setQueriesData({ queryKey: [GROUP_DETAIL_QUERY_KEY] }, (oldGroup: any) => {
        if (!oldGroup || (oldGroup.id !== groupId && oldGroup.slug !== groupId)) {
          return oldGroup;
        }
        const updatedMembers = (oldGroup.members || []).filter(
          (m: any) => m.id !== memberId && m.userId !== memberId
        );
        return {
          ...oldGroup,
          members: updatedMembers,
          membersCount: Math.max(0, (oldGroup.membersCount ?? (oldGroup.members?.length || 1)) - 1),
        };
      });
    },
    addMemberToGroup: (groupId: string, newMember: any) => {
      queryClient.setQueriesData({ queryKey: [GROUP_DETAIL_QUERY_KEY] }, (oldGroup: any) => {
        if (!oldGroup || (oldGroup.id !== groupId && oldGroup.slug !== groupId)) {
          return oldGroup;
        }
        const existingMembers = oldGroup.members || [];
        const exists = existingMembers.some(
          (m: any) => m.id === newMember.id || m.userId === newMember.userId
        );
        if (exists) return oldGroup;
        return {
          ...oldGroup,
          members: [...existingMembers, newMember],
          membersCount: (oldGroup.membersCount ?? existingMembers.length) + 1,
        };
      });
    },
    updateGroupCoverInCache: (groupId: string, coverImage: string) => {
      queryClient.setQueriesData({ queryKey: [GROUP_DETAIL_QUERY_KEY] }, (oldGroup: any) => {
        if (!oldGroup || (oldGroup.id !== groupId && oldGroup.slug !== groupId)) {
          return oldGroup;
        }
        return { ...oldGroup, coverImage };
      });
      queryClient.setQueriesData({ queryKey: [GROUPS_LIST_QUERY_KEY] }, (oldGroups: any) => {
        if (!Array.isArray(oldGroups)) return oldGroups;
        return oldGroups.map((g: any) =>
          g.id === groupId || g.slug === groupId ? { ...g, coverImage } : g
        );
      });
    },
    prependPostToGroup: (groupId: string, newPost: any) => {
      // Add to group posts query
      queryClient.setQueriesData(
        { queryKey: [GROUP_POSTS_QUERY_KEY, groupId] },
        (oldPosts: any) => {
          if (!Array.isArray(oldPosts)) return [newPost];
          return [newPost, ...oldPosts.filter((p: any) => p.id !== newPost.id)];
        }
      );
      // Add to group feed query
      queryClient.setQueriesData(
        { queryKey: [GROUP_FEED_POSTS_QUERY_KEY] },
        (oldPosts: any) => {
          if (!Array.isArray(oldPosts)) return [newPost];
          return [newPost, ...oldPosts.filter((p: any) => p.id !== newPost.id)];
        }
      );
    },
    updatePostInGroup: (groupId: string, updatedPost: any) => {
      queryClient.setQueriesData(
        { queryKey: [GROUP_POSTS_QUERY_KEY, groupId] },
        (oldPosts: any) => {
          if (!Array.isArray(oldPosts)) return oldPosts;
          return oldPosts.map((p: any) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
        }
      );
      queryClient.setQueriesData(
        { queryKey: [GROUP_FEED_POSTS_QUERY_KEY] },
        (oldPosts: any) => {
          if (!Array.isArray(oldPosts)) return oldPosts;
          return oldPosts.map((p: any) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
        }
      );
    },
    deletePostFromGroup: (groupId: string, postId: string) => {
      queryClient.setQueriesData(
        { queryKey: [GROUP_POSTS_QUERY_KEY, groupId] },
        (oldPosts: any) => {
          if (!Array.isArray(oldPosts)) return oldPosts;
          return oldPosts.filter((p: any) => p.id !== postId);
        }
      );
      queryClient.setQueriesData(
        { queryKey: [GROUP_FEED_POSTS_QUERY_KEY] },
        (oldPosts: any) => {
          if (!Array.isArray(oldPosts)) return oldPosts;
          return oldPosts.filter((p: any) => p.id !== postId);
        }
      );
    },
  };
}
