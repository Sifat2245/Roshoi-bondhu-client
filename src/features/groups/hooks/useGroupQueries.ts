import { useQuery, useQueryClient } from "@tanstack/react-query";
import groupsApi from "../api/groups.api";
import postsApi from "../../posts/api/posts.api";
import type { Group } from "../types/group.types";

export const GROUPS_LIST_QUERY_KEY = "groupsList";
export const GROUP_FEED_POSTS_QUERY_KEY = "groupFeedPosts";
export const GROUP_DETAIL_QUERY_KEY = "groupDetail";
export const GROUP_POSTS_QUERY_KEY = "groupPosts";

const CACHE_PREFIX = "rb_group_cache_v1:";
const CACHE_TTL_MS = 15 * 60 * 1000;

function readGroupCache<T>(key: string): { data: T; updatedAt: number } | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.updatedAt !== "number") return undefined;
    if (Date.now() - parsed.updatedAt > CACHE_TTL_MS) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return undefined;
    }
    return { data: parsed.data as T, updatedAt: parsed.updatedAt };
  } catch {
    return undefined;
  }
}

function writeGroupCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore storage quota errors */
  }
}

function clearGroupCacheByPrefix(prefix: string): void {
  if (typeof window === "undefined") return;
  try {
    const fullPrefix = `${CACHE_PREFIX}${prefix}`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

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
  userId?: string,
) {
  const search = params?.search || "";
  const myGroups = Boolean(params?.myGroups);
  const scope = userId || "anonymous";
  const cacheKey = `list:${scope}:${search}:${myGroups}`;
  const cached = !search ? readGroupCache<any[]>(cacheKey) : undefined;

  return useQuery({
    queryKey: [GROUPS_LIST_QUERY_KEY, scope, search, myGroups],
    queryFn: async () => {
      const data = await groupsApi.getGroups(params, token);
      const list = Array.isArray(data) ? data : [];
      if (!search) writeGroupCache(cacheKey, list);
      return list;
    },
    initialData: cached?.data,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000, // 10 minutes fresh in-memory after fetch
    gcTime: 15 * 60 * 1000,    // 15 minutes in memory
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useGroupFeedPostsQuery(
  token?: string | null,
  userId?: string,
) {
  const scope = userId || "anonymous";
  const cacheKey = `feed:${scope}`;
  const cached = readGroupCache<any[]>(cacheKey);

  return useQuery({
    queryKey: [GROUP_FEED_POSTS_QUERY_KEY, scope],
    queryFn: async () => {
      const data = await postsApi.getPosts(
        { filter: "GROUPS", limit: 50 },
        token,
        userId,
      );
      const filtered = (data || []).filter((p: any) => p.group || p.groupId);
      writeGroupCache(cacheKey, filtered);
      return filtered;
    },
    initialData: cached?.data,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useGroupDetailQuery(
  slug?: string,
  token?: string | null,
  userId?: string,
) {
  const scope = userId || "anonymous";
  const cacheKey = slug ? `detail:${scope}:${slug}` : "";
  const cached = cacheKey ? readGroupCache<any>(cacheKey) : undefined;

  return useQuery({
    queryKey: [GROUP_DETAIL_QUERY_KEY, scope, slug],
    queryFn: async () => {
      if (!slug) return null;
      const group = await groupsApi.getGroupBySlug(slug, token);
      if (group && cacheKey) writeGroupCache(cacheKey, group);
      return group;
    },
    initialData: cached?.data,
    initialDataUpdatedAt: 0,
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
  const scope = userId || "anonymous";
  const cacheKey = groupId ? `posts:${scope}:${groupId}` : "";
  const cached = cacheKey ? readGroupCache<any[]>(cacheKey) : undefined;

  return useQuery({
    queryKey: [GROUP_POSTS_QUERY_KEY, groupId, scope],
    queryFn: async () => {
      if (!groupId) return [];
      const posts = await postsApi.getPosts({ groupId }, token, userId);
      if (cacheKey) writeGroupCache(cacheKey, posts);
      return posts;
    },
    initialData: cached?.data,
    initialDataUpdatedAt: 0,
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
      clearGroupCacheByPrefix("list:");
      queryClient.invalidateQueries({ queryKey: [GROUPS_LIST_QUERY_KEY] });
    },
    invalidateGroupFeed: () => {
      clearGroupCacheByPrefix("feed:");
      queryClient.invalidateQueries({ queryKey: [GROUP_FEED_POSTS_QUERY_KEY] });
    },
    invalidateGroupDetail: (slug?: string) => {
      clearGroupCacheByPrefix("detail:");
      if (slug) {
        queryClient.invalidateQueries({
          predicate: (q) =>
            q.queryKey[0] === GROUP_DETAIL_QUERY_KEY && q.queryKey[2] === slug,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [GROUP_DETAIL_QUERY_KEY] });
      }
    },
    invalidateGroupPosts: (groupId?: string) => {
      clearGroupCacheByPrefix("posts:");
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
