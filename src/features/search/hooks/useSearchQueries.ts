import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchApi,
  type PostSearchFilters,
  type UserSearchResult,
  type GroupSearchResult,
} from "../api/search.api";

export const SEARCH_ALL_QUERY_KEY = "searchAll";

export function normalizeSearchFilters(filters: PostSearchFilters = {}) {
  return {
    recentPosts: Boolean(filters.recentPosts),
    datePosted: filters.datePosted || "ANY_TIME",
    postsFrom: filters.postsFrom || "ANYONE",
    taggedLocation: (filters.taggedLocation || "").trim().toLowerCase(),
  };
}

export function useSearchAllQuery(
  query: string,
  postFilters: PostSearchFilters = {}
) {
  const cleanQuery = query.trim();
  const normalized = normalizeSearchFilters(postFilters);

  return useQuery({
    queryKey: [SEARCH_ALL_QUERY_KEY, cleanQuery, normalized],
    queryFn: () => searchApi.searchAll(cleanQuery, postFilters),
    enabled: Boolean(cleanQuery),
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 15 * 60 * 1000,    // 15 minutes retention
    placeholderData: (previousData) => previousData,
  });
}

export function useInvalidateSearchQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAllSearches: () => {
      queryClient.invalidateQueries({ queryKey: [SEARCH_ALL_QUERY_KEY] });
    },
    updateUserInSearch: (
      userId: string,
      updater: (user: UserSearchResult) => UserSearchResult
    ) => {
      queryClient.setQueriesData({ queryKey: [SEARCH_ALL_QUERY_KEY] }, (oldData: any) => {
        if (!oldData || !oldData.users) return oldData;
        return {
          ...oldData,
          users: oldData.users.map((u: UserSearchResult) =>
            u.id === userId ? updater(u) : u
          ),
        };
      });
    },
    updateGroupInSearch: (
      groupId: string,
      updater: (group: GroupSearchResult) => GroupSearchResult
    ) => {
      queryClient.setQueriesData({ queryKey: [SEARCH_ALL_QUERY_KEY] }, (oldData: any) => {
        if (!oldData || !oldData.groups) return oldData;
        return {
          ...oldData,
          groups: oldData.groups.map((g: GroupSearchResult) =>
            g.id === groupId ? updater(g) : g
          ),
        };
      });
    },
    deletePostInSearch: (postId: string) => {
      queryClient.setQueriesData({ queryKey: [SEARCH_ALL_QUERY_KEY] }, (oldData: any) => {
        if (!oldData || !oldData.posts) return oldData;
        return {
          ...oldData,
          posts: oldData.posts.filter((p: any) => p.id !== postId),
        };
      });
    },
    updatePostInSearch: (updatedPost: any) => {
      queryClient.setQueriesData({ queryKey: [SEARCH_ALL_QUERY_KEY] }, (oldData: any) => {
        if (!oldData || !oldData.posts) return oldData;
        return {
          ...oldData,
          posts: oldData.posts.map((p: any) =>
            p.id === updatedPost.id ? { ...p, ...updatedPost } : p
          ),
        };
      });
    },
  };
}

