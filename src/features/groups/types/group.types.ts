import { User } from "../../auth/types/auth.types";

export type GroupPrivacy = "PUBLIC" | "PRIVATE";

export type GroupJoinMode = "DIRECT" | "ADMIN_APPROVAL";

export type GroupMemberRole = "ADMIN" | "MODERATOR" | "MEMBER";

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  user?: User;
}

export interface GroupPendingInviteSummary {
  id: string;
  role: string;
  createdAt?: string;
  inviter?: { id: string; name: string; image?: string | null } | null;
}

export interface GroupInviteLink {
  id: string;
  groupId: string;
  token: string;
  isStaffLink: boolean;
  useCount: number;
  createdAt: string;
  expiresAt?: string | null;
}

export interface GroupInvitePreview {
  valid: boolean;
  reason?: string | null;
  isStaffInvite?: boolean;
  requiresAdminApproval?: boolean;
  membershipStatus?: "APPROVED" | "PENDING" | "NONE";
  joinMode?: GroupJoinMode;
  inviter?: { id: string; name: string; image?: string | null } | null;
  group?: {
    id: string;
    name: string;
    slug: string;
    privacy: GroupPrivacy;
    avatar?: string | null;
    coverImage?: string | null;
    membersCount?: number;
  } | null;
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
  user?: { id: string; name: string; image?: string | null; bio?: string | null } | null;
}

export interface GroupPendingInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  role: string;
  status: string;
  createdAt: string;
  inviter?: { id: string; name: string; image?: string | null } | null;
  invitee?: { id: string; name: string; image?: string | null } | null;
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
  joinMode?: GroupJoinMode;
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
  myMembershipStatus?: "APPROVED" | "PENDING" | "NONE";
  myPendingInvite?: GroupPendingInviteSummary | null;
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
  joinMode?: GroupJoinMode | string;
  coverImage?: string | null;
  avatar?: string | null;
  requiresPostApproval?: boolean;
  invitedUserIds?: string[];
}
