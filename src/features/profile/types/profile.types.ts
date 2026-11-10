import { User } from '../../auth/types/auth.types';

export interface UserProfile extends User {
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  postsCount?: number;
  recipesCount?: number;
  createdGroupsCount?: number;
  hometown?: string;
  languages?: string;
  expertise?: string;
  hobbies?: string;
  interests?: string;
  website?: string;
  socialLinks?: string;
  birthDate?: string | null;
  contactVisibility?: string;
  birthdayVisibility?: string;
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
  hometown?: string;
  languages?: string;
  expertise?: string;
  hobbies?: string;
  interests?: string;
  website?: string;
  socialLinks?: string;
  birthDate?: string | null;
  contactVisibility?: string;
  birthdayVisibility?: string;
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

