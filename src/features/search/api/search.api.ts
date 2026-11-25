import { apolloClient } from "../../../lib/graphql/client";
import {
  RECENT_SEARCHES_QUERY,
  SEARCH_SUGGESTIONS_QUERY,
  SEARCH_ALL_QUERY,
} from "../../../lib/graphql/queries";
import {
  SAVE_RECENT_SEARCH_MUTATION,
  REMOVE_RECENT_SEARCH_MUTATION,
  CLEAR_RECENT_SEARCHES_MUTATION,
} from "../../../lib/mutations/search.mutations";

export interface RecentSearchItem {
  id: string;
  query: string;
  targetType: "KEYWORD" | "USER" | "GROUP";
  targetId?: string | null;
  user?: {
    id: string;
    name: string;
    image?: string | null;
    role?: string | null;
    username?: string | null;
    city?: string | null;
    work?: string | null;
  } | null;
  group?: {
    id: string;
    name: string;
    slug: string;
    avatar?: string | null;
    privacy: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  role?: string | null;
  city?: string | null;
  work?: string | null;
  education?: string | null;
  mutualFriendsCount?: number;
  friendshipStatus?: string;
  isMe?: boolean;
}

export interface GroupSearchResult {
  id: string;
  name: string;
  slug: string;
  avatar?: string | null;
  coverImage?: string | null;
  description?: string | null;
  privacy: string;
  membersCount: number;
  isMember: boolean;
  membershipStatus?: string;
}

export interface PostSearchFilters {
  recentPosts?: boolean;
  datePosted?: string;
  postsFrom?: string;
  taggedLocation?: string;
}

export const searchApi = {
  getRecentSearches: async (limit = 8): Promise<RecentSearchItem[]> => {
    try {
      const { data } = await apolloClient.query({
        query: RECENT_SEARCHES_QUERY,
        variables: { limit },
        fetchPolicy: "network-only",
      });
      return data?.recentSearches || [];
    } catch (err) {
      console.warn("Failed to fetch recent searches:", err);
      return [];
    }
  },

  saveRecentSearch: async (
    query: string,
    targetType: "KEYWORD" | "USER" | "GROUP" = "KEYWORD",
    targetId?: string
  ) => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SAVE_RECENT_SEARCH_MUTATION,
        variables: { query, targetType, targetId: targetId || null },
      });
      return data?.saveRecentSearch;
    } catch (err) {
      console.warn("Failed to save recent search:", err);
      return null;
    }
  },

  removeRecentSearch: async (id: string): Promise<boolean> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REMOVE_RECENT_SEARCH_MUTATION,
        variables: { id },
      });
      return Boolean(data?.removeRecentSearch);
    } catch (err) {
      console.warn("Failed to remove recent search:", err);
      return false;
    }
  },

  clearRecentSearches: async (): Promise<boolean> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CLEAR_RECENT_SEARCHES_MUTATION,
      });
      return Boolean(data?.clearRecentSearches);
    } catch (err) {
      console.warn("Failed to clear recent searches:", err);
      return false;
    }
  },

  getSearchSuggestions: async (query: string) => {
    if (!query.trim()) {
      return { users: [], groups: [] };
    }
    try {
      const { data } = await apolloClient.query({
        query: SEARCH_SUGGESTIONS_QUERY,
        variables: { query },
        fetchPolicy: "network-only",
      });
      return {
        users: data?.searchSuggestions?.users || [],
        groups: data?.searchSuggestions?.groups || [],
      };
    } catch (err) {
      console.warn("Failed to get search suggestions:", err);
      return { users: [], groups: [] };
    }
  },

  searchAll: async (query: string, postFilters: PostSearchFilters = {}) => {
    if (!query.trim()) {
      return {
        users: [],
        groups: [],
        posts: [],
        totalUsers: 0,
        totalGroups: 0,
        totalPosts: 0,
      };
    }
    try {
      const { data } = await apolloClient.query({
        query: SEARCH_ALL_QUERY,
        variables: {
          query,
          postFilters: {
            recentPosts: Boolean(postFilters.recentPosts),
            datePosted: postFilters.datePosted || "ANY_TIME",
            postsFrom: postFilters.postsFrom || "ANYONE",
            taggedLocation: postFilters.taggedLocation || "",
          },
        },
        fetchPolicy: "network-only",
      });
      return {
        users: data?.searchAll?.users || [],
        groups: data?.searchAll?.groups || [],
        posts: data?.searchAll?.posts || [],
        totalUsers: data?.searchAll?.totalUsers || 0,
        totalGroups: data?.searchAll?.totalGroups || 0,
        totalPosts: data?.searchAll?.totalPosts || 0,
      };
    } catch (err) {
      console.warn("Failed to search all:", err);
      return {
        users: [],
        groups: [],
        posts: [],
        totalUsers: 0,
        totalGroups: 0,
        totalPosts: 0,
      };
    }
  },
};

export default searchApi;
