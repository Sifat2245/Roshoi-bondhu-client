import apiClient from "../../../lib/api-client";
import { apolloClient } from "../../../lib/graphql/client";
import {
  FEED_QUERY,
  POST_QUERY,
  TRASH_QUERY,
} from "../../../lib/graphql/queries";
import {
  CREATE_POST_MUTATION,
  UPDATE_POST_MUTATION,
  REPOST_MUTATION,
  TOGGLE_LIKE_MUTATION,
  CREATE_COMMENT_MUTATION,
  DELETE_POST_MUTATION,
  RESTORE_POST_MUTATION,
  PERMANENT_DELETE_POST_MUTATION,
  EMPTY_TRASH_MUTATION,
} from "../../../lib/graphql/mutations";
import { optimizeImageForUpload } from "../../../lib/media-preferences";
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
  uniqueRecent,
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

export const postsApi = {
  getPosts: async (
    params: PostFilterParams = {},
    token: string | null = null,
    actorId?: string,
  ): Promise<Post[]> => {
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 50));
    try {
      const { data } = await apolloClient.query({
        query: FEED_QUERY,
        variables: {
          first: limit,
          type: params.type,
          cuisine: params.cuisine,
          search: params.search,
          authorId: params.authorId,
          groupId: params.groupId,
          filter: params.filter,
        },
        fetchPolicy: "network-only",
      });
      const remote = (data?.feed?.edges || []).map((e: any) => e.node);
      const posts = uniqueRecent([
        ...remote,
        ...localPosts(params, actorId),
      ]).filter((post) => matchesPost(post, params));
      return (await visiblePosts(posts, actorId, token)).slice(0, limit);
    } catch {
      // Fall back to local posts if network fails
      return (await visiblePosts(localPosts(params, actorId), actorId, token)).slice(0, limit);
    }
  },

  getFeedPage: async (
    params: PostFilterParams,
    token: string | null,
    actorId: string,
    cursor?: any,
    signal?: AbortSignal,
  ) => {
    // Relay cursor pagination: cursor is either the endCursor string or null
    const afterCursor = typeof cursor === "string" ? cursor : cursor?.endCursor || null;

    try {
      const { data } = await apolloClient.query({
        query: FEED_QUERY,
        variables: {
          first: 12,
          after: afterCursor,
          type: params.type || undefined,
          cuisine: params.cuisine || undefined,
          search: params.search || undefined,
          authorId: params.authorId || undefined,
          groupId: params.groupId || undefined,
          filter: params.filter || undefined,
        },
        fetchPolicy: "network-only",
        context: signal ? { fetchOptions: { signal } } : undefined,
      });

      const feed = data?.feed;
      const remotePostsList = (feed?.edges || []).map((e: any) => e.node);
      const visibleRemote = await visiblePosts(remotePostsList, actorId, token);

      const devicePosts = afterCursor
        ? []
        : await visiblePosts(localPosts(params, actorId), actorId, token);

      const combined = uniqueRecent([...devicePosts, ...visibleRemote]).filter((p) =>
        matchesPost(p, params)
      );

      const pageInfo = feed?.pageInfo;
      const nextCursor = pageInfo?.hasNextPage ? pageInfo.endCursor : null;

      return {
        posts: combined,
        cursor: nextCursor,
      };
    } catch (err) {
      console.warn("[postsApi.getFeedPage error/offline]:", err);
      // In offline / demo mode fallback to local device posts
      const device = afterCursor
        ? []
        : await visiblePosts(localPosts(params, actorId), actorId, token);
      return {
        posts: device,
        cursor: null,
      };
    }
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

    const { data } = await apolloClient.query({
      query: POST_QUERY,
      variables: { id: postId },
      fetchPolicy: "network-only",
    });

    if (!data?.post) throw new Error("This post is no longer available.");
    const [visible] = await visiblePosts([data.post], actorId, token);
    if (!visible)
      throw new Error("This post is not available to this audience.");
    return visible;
  },

  createPost: async (
    postData: CreatePostPayload,
    _token: string | null = null,
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

    const { data } = await apolloClient.mutate({
      mutation: CREATE_POST_MUTATION,
      variables: {
        input: {
          postType: postData.postType,
          audience: postData.audience || "PUBLIC",
          caption: postData.caption || postData.content || null,
          title: postData.title || null,
          image: postData.image || null,
          images: postData.images || [],
          ingredients: postData.ingredients || [],
          instructions: postData.instructions || [],
          preparationTime: postData.preparationTime || postData.cookingTime || null,
          servings: postData.servings || null,
          cuisine: postData.cuisine || null,
          categories: postData.tags || [],
          groupId: postData.groupId || null,
        },
      },
    });

    return data?.createPost;
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

    const { data } = await apolloClient.mutate({
      mutation: TOGGLE_LIKE_MUTATION,
      variables: { postId },
    });

    return { success: true, data: data?.toggleLike };
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

    const { data } = await apolloClient.mutate({
      mutation: CREATE_COMMENT_MUTATION,
      variables: { postId, content },
    });

    return { success: true, data: data?.createComment };
  },

  sharePost: async (
    postId: string,
    caption = "",
    audience: "PUBLIC" | "FRIENDS" | "ONLY_ME" = "PUBLIC",
    _token: string | null = null,
    actor?: Person,
  ) => {
    const post = await postsApi.getPostById(postId, _token, actor?.id);
    if (!canSharePost(post))
      throw new Error(
        "This post's audience does not allow sharing to a public feed.",
      );
    if (postId.startsWith("local-post-"))
      return shareLocalPost(post, actor, caption, audience);

    const { data } = await apolloClient.mutate({
      mutation: REPOST_MUTATION,
      variables: { originalPostId: postId, caption, audience },
    });

    return { success: true, data: data?.repostPost };
  },

  deletePost: async (
    postId: string,
    _token: string | null = null,
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

    const { data } = await apolloClient.mutate({
      mutation: DELETE_POST_MUTATION,
      variables: { postId },
    });

    return { success: true, data: data?.deletePost };
  },

  updatePost: async (
    postId: string,
    data: { caption?: string; title?: string },
    _token: string | null = null,
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

    const res = await apolloClient.mutate({
      mutation: UPDATE_POST_MUTATION,
      variables: { id: postId, input: data },
    });

    return { success: true, data: res.data?.updatePost };
  },

  // Binary multipart upload remains infrastructure HTTP stream
  uploadImage: async (
    file: File,
    token: string | null = null,
  ): Promise<any> => {
    const fileToUpload = await optimizeImageForUpload(file);
    const formData = new FormData();
    formData.append("image", fileToUpload);
    return apiClient.upload("/api/upload/image", formData, { token });
  },

  getTrash: async (_token: string | null = null): Promise<Post[]> => {
    const { data } = await apolloClient.query({
      query: TRASH_QUERY,
      variables: { first: 50 },
      fetchPolicy: "network-only",
    });
    return (data?.trash?.edges || []).map((e: any) => e.node);
  },

  restorePost: async (postId: string, _token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: RESTORE_POST_MUTATION,
      variables: { postId },
    });
    return { success: true, data: data?.restorePost };
  },

  permanentDeletePost: async (postId: string, _token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: PERMANENT_DELETE_POST_MUTATION,
      variables: { postId },
    });
    return { success: true, data: data?.permanentDeletePost };
  },

  emptyTrash: async (_token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: EMPTY_TRASH_MUTATION,
    });
    return { success: true, data: data?.emptyTrash };
  },
};

export default postsApi;
