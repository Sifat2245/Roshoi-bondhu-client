import apiClient from '../../../lib/api-client';
import { Post, CreatePostPayload, PostFilterParams } from '../types/post.types';

export const postsApi = {
  getPosts: async (params: PostFilterParams = {}, token: string | null = null): Promise<Post[]> => {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.filter) query.set('filter', params.filter);
    if (params.cuisine) query.set('cuisine', params.cuisine);
    if (params.tag) query.set('tag', params.tag);
    if (params.maxTime) query.set('maxTime', String(params.maxTime));
    if (params.search) query.set('search', params.search);
    if (params.authorId) query.set('authorId', params.authorId);
    if (params.groupId) query.set('groupId', params.groupId);
    if (params.limit) query.set('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = queryString ? `/api/post?${queryString}` : '/api/post';
    const res = await apiClient.get<{ success: boolean; data: Post[] }>(endpoint, { token });
    return res.data || [];
  },

  getPostById: async (postId: string, token: string | null = null): Promise<Post> => {
    const res = await apiClient.get<{ success: boolean; data: Post }>(`/api/post/${postId}`, { token });
    return res.data;
  },

  createPost: async (postData: CreatePostPayload, token: string | null = null) => {
    return apiClient.post('/api/post', postData, { token });
  },

  toggleLikePost: async (postId: string, token: string | null = null) => {
    return apiClient.post(`/api/post/${postId}/like`, {}, { token });
  },

  addComment: async (postId: string, content: string, token: string | null = null) => {
    return apiClient.post(`/api/post/${postId}/comment`, { content }, { token });
  },

  sharePost: async (postId: string, caption: string = '', token: string | null = null) => {
    return apiClient.post(`/api/post/${postId}/share`, { caption }, { token });
  },

  deletePost: async (postId: string, token: string | null = null) => {
    return apiClient.delete(`/api/post/${postId}`, { token });
  },

  uploadImage: async (file: File, token: string | null = null): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.upload(
      '/api/upload/image',
      formData,
      { token }
    );
  },
};

export default postsApi;
