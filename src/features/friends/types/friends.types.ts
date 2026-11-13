export interface Friend {
  id: string;
  name: string;
  username?: string;
  image?: string | null;
  city?: string | null;
  work?: string | null;
  bio?: string | null;
  mutualFriends?: number;
  friendshipId?: string;
  since?: string;
}

export interface FriendSuggestion {
  id: string;
  name: string;
  username?: string;
  image?: string | null;
  city?: string | null;
  work?: string | null;
  bio?: string | null;
  mutualFriends?: number;
  reason?: string;
}

export interface FriendRequest {
  id: string;
  userId: string;
  name: string;
  username?: string;
  image?: string | null;
  city?: string | null;
  work?: string | null;
  bio?: string | null;
  mutualFriends?: number;
  createdAt?: string;
}

export type RelationshipStatus =
  | 'NONE'
  | 'FRIENDS'
  | 'REQUEST_SENT'
  | 'REQUEST_RECEIVED'
  | 'BLOCKING'
  | 'BLOCKED'
  | 'SELF';

export interface RelationshipStatusResponse {
  status: RelationshipStatus;
  requestId?: string;
  friendsCount?: number;
  mutualCount?: number;
  mutualSample?: Array<{ id: string; name: string; image?: string | null }>;
}

export interface BlockedUser {
  id: string;
  name: string;
  username?: string;
  image?: string | null;
  blockedAt?: string;
}
