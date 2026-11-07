import { User } from '../../auth/types/auth.types';

export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'GROUP_INVITE'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  senderId?: string;
  sender?: User;
  type: NotificationType;
  title?: string;
  message: string;
  link?: string;
  isUnread?: boolean;
  createdAt: string;
}

