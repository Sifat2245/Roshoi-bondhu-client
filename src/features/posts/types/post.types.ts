import { User } from "../../auth/types/auth.types";
import type { Poll } from "../../community/model/community-domain";

import type { PostAudience } from "../model/post-policy";

export type PostType = "CASUAL" | "RECIPE" | "POLL" | "REPOST";

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  createdAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
}

export interface Post {
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
