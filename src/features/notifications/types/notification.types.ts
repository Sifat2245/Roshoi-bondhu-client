import { User } from "../../auth/types/auth.types";

export type NotificationType =
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPT"
  | "GROUP_INVITE"
  | "POST_LIKE"
  | "COMMENT_LIKE"
  | "POST_COMMENT"
  | "COMMENT_REPLY"
  | "MENTION"
  | "LIKE"
  | "COMMENT"
  | "FOLLOW"
  | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  senderId?: string;
  sender?: User;
  actor?: Partial<User> & { id: string; name: string; image?: string };
  type: NotificationType;
  title?: string;
  message: string;
  link?: string;
  iconType?: string;
  actionable?: boolean;
  actionStatus?: string;
  postId?: string;
  commentId?: string;
  groupId?: string;
  invitationId?: string;
  friendshipRequestId?: string;
  actorCount?: number;
  timeAgo?: string;
  isUnread?: boolean;
  createdAt: string;
}

export function formatNotificationTime(dateString?: string): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}
