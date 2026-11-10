import { User } from "../../auth/types/auth.types";

export interface Friend extends User {
  mutualCount?: number;
}

export interface FriendSuggestion extends User {
  mutualFriends?: number;
}

export interface FriendRequest extends User {
  mutualFriends?: number;
  requestedAt?: string;
}
