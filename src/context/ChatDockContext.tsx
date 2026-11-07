import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatConversation, ChatMessage } from '../features/messenger/model/messenger.types';
import { INITIAL_CONVERSATIONS } from '../features/messenger/model/messenger.mock';

interface ChatDockContextType {
  activeChatId: string | null;
  isMinimized: boolean;
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  openChat: (conversationId: string) => void;
  closeChat: () => void;
  minimizeChat: () => void;
  restoreChat: () => void;
  toggleMinimize: () => void;
  sendMessage: (conversationId: string, text: string) => void;
}

const ChatDockContext = createContext<ChatDockContextType | undefined>(undefined);

export const ChatDockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const openChat = useCallback((conversationId: string) => {
    setActiveChatId(conversationId);
    setIsMinimized(false);
    // Mark messages as read
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const closeChat = useCallback(() => {
    setActiveChatId(null);
    setIsMinimized(false);
  }, []);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const restoreChat = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    if (!text.trim()) return;
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      status: 'sent',
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: `You: ${text.trim()} • Just now`,
            lastMessageTime: 'Just now',
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      })
    );
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeChatId) || null;

  return (
    <ChatDockContext.Provider
      value={{
        activeChatId,
        isMinimized,
        conversations,
        activeConversation,
        openChat,
        closeChat,
        minimizeChat,
        restoreChat,
        toggleMinimize,
        sendMessage,
      }}
    >
      {children}
    </ChatDockContext.Provider>
  );
};

export const useChatDock = () => {
  const context = useContext(ChatDockContext);
  if (!context) {
    throw new Error('useChatDock must be used within a ChatDockProvider');
  }
  return context;
};

export default ChatDockContext;

