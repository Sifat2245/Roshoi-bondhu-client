import { User } from '../../auth/types/auth.types';

export type GroupPrivacy = 'PUBLIC' | 'PRIVATE';

export type GroupMemberRole = 'ADMIN' | 'MEMBER';

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
  privacy: GroupPrivacy;
  membersCount: number;
  creatorId: string;
  members?: GroupMember[];
  createdAt: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  privacy?: GroupPrivacy | string;
  coverImage?: string | null;
  requiresPostApproval?: boolean;
}
