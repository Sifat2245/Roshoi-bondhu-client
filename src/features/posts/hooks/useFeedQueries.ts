import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import postsApi from "../api/posts.api";
import type { Post } from "../types/post.types";

export const FEED_QUERY_KEY = "socialFeed";

export interface FeedQueryParams {
  type?: string;
  filter?: string;
  cuisine?: string;
  tag?: string;
  maxTime?: string;
  search?: string;
  actorId?: string;
  token?: string | null;
}

export function useFeedInfiniteQuery(params: FeedQueryParams) {
  const {
    type = "",
    filter = "",
    cuisine = "",
    tag = "",
    maxTime = "",
    search = "",
    actorId = "",
    token = null,
  } = params;

  return useInfiniteQuery({
    queryKey: [
      FEED_QUERY_KEY,
      {
        type,
        filter,
        cuisine,
        tag,
        maxTime,
        search,
        actorId,
      },
    ],
    queryFn: ({ pageParam }) =>
      postsApi.getFeedPage(
        {
          type,
          filter,
          cuisine,
          tag,
          maxTime,
          search,
        },
        token,
        actorId,
        pageParam,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.cursor ?? null,
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 15 * 60 * 1000,    // 15 minutes cache retention
    refetchOnWindowFocus: false,
    enabled: Boolean(actorId),
  });
}

export function useInvalidateFeedQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateFeed: () => {
      queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY] });
    },
    prependPostToFeed: (newPost: Post) => {
      queryClient.setQueriesData({ queryKey: [FEED_QUERY_KEY] }, (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;
        const firstPage = oldData.pages[0];
        return {
          ...oldData,
          pages: [
            {
              ...firstPage,
              posts: [newPost, ...(firstPage.posts || [])],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
    updatePostInFeed: (updatedPost: Partial<Post> & Record<string, any> & { id: string }) => {
      queryClient.setQueriesData({ queryKey: [FEED_QUERY_KEY] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === updatedPost.id ? { ...p, ...updatedPost } : p
            ),
          })),
        };
      });
    },
    deletePostFromFeed: (postId: string) => {
      queryClient.setQueriesData({ queryKey: [FEED_QUERY_KEY] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((p: any) => p.id !== postId),
          })),
        };
      });
    },
  };
}
