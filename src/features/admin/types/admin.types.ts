import { User } from '../../auth/types/auth.types';
import { UserRole, UserStatus } from '../../../types/common.types';

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalRecipes: number;
  totalGroups: number;
  pendingReports: number;
}

export interface AdminReport {
  id: string;
  reporterId: string;
  reporter?: User;
  postId?: string;
  post?: any;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export type { UserRole, UserStatus };
