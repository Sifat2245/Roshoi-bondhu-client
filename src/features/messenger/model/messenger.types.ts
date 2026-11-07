export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status?: 'sent' | 'delivered' | 'seen';
}

export type ChatCategory = 'ALL' | 'UNREAD' | 'GROUPS' | 'COMMUNITIES';

export interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastActive?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isMuted?: boolean;
  type: 'DIRECT' | 'GROUP' | 'COMMUNITY';
  messages: ChatMessage[];
}

