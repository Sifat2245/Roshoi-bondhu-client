import { User } from "../../auth/types/auth.types";

export type GroupPrivacy = "PUBLIC" | "PRIVATE";

export type GroupMemberRole = "ADMIN" | "MODERATOR" | "MEMBER";

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  user?: User;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string | null;
  avatar?: string | null;
  privacy: GroupPrivacy;
  discoverability?: "VISIBLE" | "HIDDEN";
  status?: "ACTIVE" | "PAUSED" | "ARCHIVED" | "DELETED";
  requiresPostApproval?: boolean;
  challengeCreatorPolicy?: "STAFF" | "MEMBERS";
  version?: number;
  archivedAt?: string | null;
  membersCount: number;
  postsCount?: number;
  ownerId?: string | null;
  owner?: { id: string; name: string; image?: string | null } | null;
  creatorId?: string;
  createdById?: string;
  createdBy?: { id: string; name: string; image?: string | null };
  isMember?: boolean;
  currentUserRole?: GroupMemberRole | string | null;
  canModerate?: boolean;
  pendingRequestsCount?: number;
  pendingPostsCount?: number;
  members?: GroupMember[];
  lastActive?: string;
  createdAt: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  privacy?: GroupPrivacy | string;
  coverImage?: string | null;
  avatar?: string | null;
  requiresPostApproval?: boolean;
  invitedUserIds?: string[];
}
