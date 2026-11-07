import { User } from '../../auth/types/auth.types';

export interface UserProfile extends User {
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  bio?: string;
  city?: string;
  work?: string;
  education?: string;
  phone?: string;
  gender?: string;
  image?: string;
  coverImage?: string;
}

export interface UpdateBioPayload {
  name?: string;
  username?: string;
  phone?: string;
  city?: string;
  work?: string;
  education?: string;
  bio?: string;
}

