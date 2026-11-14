import { User } from "../../auth/types/auth.types";
import type { Poll } from "../../community/model/community-domain";

import type { PostAudience } from "../model/post-policy";
export type { PostAudience };

export type PostType = "CASUAL" | "RECIPE" | "POLL" | "REPOST";

export interface CommentReply {
  id: string;
  postId: string;
  userId?: string;
  authorId?: string;
  user?: User;
  author?: User;
  content: string;
  likeCount?: number;
  hasLiked?: boolean;
  isPosting?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId?: string;
  authorId?: string;
  user?: User;
  author?: User;
  content: string;
  parentId?: string | null;
  replies?: CommentReply[];
  likeCount?: number;
  hasLiked?: boolean;
  isPosting?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
}

export interface Post {
  description: string;
  originalPost: Post;
  id: string;
  authorId: string;
  author?: User;
  audience?: PostAudience;
  groupId?: string | null;
  postType: PostType;
  poll?: Poll;
  title?: string;
  content: string;
  image?: string | null;
  images?: string[];
  cuisine?: string | null;
  cookingTime?: number | null;
  servings?: number | null;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  likes?: Like[];
  comments?: Comment[];
  isLiked?: boolean;
  isCommentDisabled?: boolean;
  caption?: string | null;
  deletedAt?: string | null;
  daysRemaining?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePostPayload {
  poll?: {
    question: string;
    options: string[];
    multiple: boolean;
    expiresAt?: string;
  };
  title?: string;
  content?: string;
  caption?: string;
  postType: PostType | string;
  image?: string | null;
  images?: string[];
  cuisine?: string | null;
  cookingTime?: number | null;
  preparationTime?: number | null;
  servings?: number | null;
  ingredients?: any;
  instructions?: any;
  tags?: string[];
  audience?: PostAudience;
  groupId?: string | null;
}

export interface PostFilterParams {
  type?: string;
  filter?: string;
  cuisine?: string;
  tag?: string;
  maxTime?: string | number;
  search?: string;
  authorId?: string;
  groupId?: string;
  limit?: string | number;
}
