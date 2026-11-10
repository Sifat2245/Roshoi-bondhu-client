import apiClient from "../../../lib/api-client";
import { Post, CreatePostPayload, PostFilterParams } from "../types/post.types";
import {
  localPost,
  publishLocalPost,
  readSocial,
  shareLocalPost,
  socialId,
  socialScope,
  updateSocial,
} from "../../community/model/social-store";
import {
  type Person,
  validatePoll,
} from "../../community/model/community-domain";

import { isDemoMode, readDemo } from "../../../lib/demo/demo-store";
import friendsApi from "../../friends/api/friends.api";
import {
  postForViewer,
  canSharePost,
  matchesPost,
  postAudience,
  readFeedPage,
  uniqueRecent,
  type FeedCursor,
} from "../model/post-policy";

async function visiblePosts(
  posts: any[],
  actorId?: string,
  token?: string | null,
) {
  let friendIds: string[] = [];
  if (isDemoMode()) friendIds = readDemo().friends;
  else if (
    actorId &&
    posts.some(
      (post) => postAudience(post) === "FRIENDS" && post.authorId !== actorId,
    )
  ) {
    // A follow is not a friendship. If the friendship lookup fails, fail closed.
    try {
      friendIds = (await friendsApi.getAllFriends(token)).map(
        (person) => person.id,
      );
    } catch {
      /* Restricted posts remain hidden. */
    }
  }
  const viewer = { id: actorId, friendIds };
  return posts.map((post) => postForViewer(post, viewer)).filter(Boolean);
}
function localPosts(params: PostFilterParams, actorId?: string) {
  const demo = isDemoMode() ? readDemo() : null;
  return readSocial(socialScope(actorId))
    .posts.map((post) => localPost(post.id, actorId))
    .filter(
      (post) =>
        matchesPost(post, params) &&
        (params.filter !== "FOLLOWING" ||
          post.authorId === actorId ||
          demo?.following.includes(post.authorId)),
    );
}
async function remotePosts(
  params: PostFilterParams & { page?: number },
  token?: string | null,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams();
  for (const [field, value] of Object.entries(params))
    if (value) query.set(field, String(value));
  return apiClient.get<{
    data: any[];
    meta?: { page: number; totalPages: number };
  }>(`/api/post?${query}`, { token, signal });
}

export const postsApi = {
  getPosts: async (
    params: PostFilterParams = {},
    token: string | null = null,
    actorId?: string,
  ): Promise<Post[]> => {
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 50));
    const res = await remotePosts({ ...params, limit }, token);
    const posts = uniqueRecent([
      ...(res.data || []),
      ...localPosts(params, actorId),
    ]).filter((post) => matchesPost(post, params));
    return (await visiblePosts(posts, actorId, token)).slice(0, limit);
  },
  getFeedPage: async (
    params: PostFilterParams,
    token: string | null,
    actorId: string,
    cursor?: FeedCursor,
    signal?: AbortSignal,
  ) => {
    const device = cursor
      ? []
      : await visiblePosts(localPosts(params, actorId), actorId, token);
    return readFeedPage(
      async (page, limit) => {
        const response = await remotePosts(
          { ...params, page, limit },
          token,
          signal,
        );
        return {
          data: await visiblePosts(
            (response.data || []).filter((post) => matchesPost(post, params)),
            actorId,
            token,
          ),
          hasMore: response.meta
            ? response.meta.page < response.meta.totalPages
            : response.data?.length >= limit,
        };
      },
      device,
      12,
      cursor,
    );
  },
  getPostById: async (
    postId: string,
    token: string | null = null,
    actorId?: string,
  ): Promise<Post> => {
    const local = localPost(postId, actorId);
    if (local) {
      const [visible] = await visiblePosts([local], actorId, token);
      if (!visible)
        throw new Error("This post is not available to this audience.");
      return visible;
    }
    if (postId.startsWith("local-post-"))
      throw new Error("This post is no longer available.");
    const res = await apiClient.get<{ success: boolean; data: Post }>(
      `/api/post/${postId}`,
      { token },
    );
    const [visible] = await visiblePosts([res.data], actorId, token);
    if (!visible)
      throw new Error("This post is not available to this audience.");
    return visible;
  },
  createPost: async (
    postData: CreatePostPayload,
    token: string | null = null,
    context?: { user: Person; group?: any },
  ) => {
    if (postData.postType === "POLL") {
      const error = validatePoll(
        postData.poll?.question || "",
        postData.poll?.options || [],
      );
      if (error) throw new Error(error);
      return publishLocalPost(postData, context?.user, context?.group);
    }
    if (!postData.groupId && postAudience(postData) !== "PUBLIC") {
      return publishLocalPost(postData, context?.user, context?.group);
    }
    // The live server has no audience column. Do not send an unsupported field.
    const { audience: _audience, ...payload } = postData;
    void _audience;
    return apiClient.post("/api/post", payload, { token });
  },
  toggleLikePost: async (
    postId: string,
    token: string | null = null,
    actorId?: string,
  ) => {
    if (postId.startsWith("local-post-")) {
      await postsApi.getPostById(postId, token, actorId);
      let result;
      updateSocial(socialScope(actorId), (state) => {
        const post = state.posts.find((p) => p.id === postId);
        if (!post) throw new Error("Post no longer available.");
        post.hasLiked = !post.hasLiked;
        post.likeCount = Math.max(0, post.likeCount + (post.hasLiked ? 1 : -1));
        result = { liked: post.hasLiked, likeCount: post.likeCount };
      });
      return { success: true, data: result };
    }
    return apiClient.post(`/api/post/${postId}/like`, {}, { token });
  },
  addComment: async (
    postId: string,
    content: string,
    token: string | null = null,
    actor?: Person,
  ) => {
    if (postId.startsWith("local-post-")) {
      if (!actor?.id) throw new Error("Sign in to comment.");
      await postsApi.getPostById(postId, token, actor.id);
      const comment = {
        id: socialId(),
        postId,
        content,
        authorId: actor.id,
        author: actor,
        createdAt: new Date().toISOString(),
      };
      updateSocial(socialScope(actor.id), (state) => {
        const post = state.posts.find((p) => p.id === postId);
        if (!post) throw new Error("Post no longer available.");
        post.comments.push(comment);
        post.commentCount = post.comments.length;
      });
      return { success: true, data: comment };
    }
    return apiClient.post(
      `/api/post/${postId}/comment`,
      { content },
      { token },
    );
  },
  sharePost: async (
    postId: string,
    caption = "",
    token: string | null = null,
    actor?: Person,
  ) => {
    const post = await postsApi.getPostById(postId, token, actor?.id);
    if (!canSharePost(post))
      throw new Error(
        "This post's audience does not allow sharing to a public feed.",
      );
    if (postId.startsWith("local-post-"))
      return shareLocalPost(post, actor, caption);
    return apiClient.post(`/api/post/${postId}/share`, { caption }, { token });
  },
  deletePost: async (
    postId: string,
    token: string | null = null,
    actorId?: string,
  ) => {
    if (postId.startsWith("local-post-")) {
      updateSocial(socialScope(actorId), (state) => {
        const post = state.posts.find((p) => p.id === postId);
        if (!post || post.authorId !== actorId)
          throw new Error("Only the author can delete this post.");
        state.posts = state.posts.filter((p) => p.id !== postId);
      });
      return { success: true, data: { id: postId } };
    }
    return apiClient.delete(`/api/post/${postId}`, { token });
  },
  updatePost: async (
    postId: string,
    data: { caption?: string; title?: string },
    token: string | null = null,
    actorId?: string,
  ) => {
    if (postId.startsWith("local-post-")) {
      updateSocial(socialScope(actorId), (state) => {
        const post = state.posts.find((p) => p.id === postId);
        if (!post || post.authorId !== actorId)
          throw new Error("Only the author can edit this post.");
        Object.assign(post, data);
      });
      return { success: true, data: localPost(postId, actorId) };
    }
    return apiClient.put(`/api/post/${postId}`, data, { token });
  },
  uploadImage: async (
    file: File,
    token: string | null = null,
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.upload("/api/upload/image", formData, { token });
  },
};
export default postsApi;
