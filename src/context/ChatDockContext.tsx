import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  ChatConversation,
  ChatMessage,
} from "../features/messenger/model/messenger.types";
import { INITIAL_CONVERSATIONS } from "../features/messenger/model/messenger.mock";
import { useToast } from "./ToastContext";

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
  markChatRead: (conversationId: string) => void;
  startConversation: (person: {
    id: string;
    name: string;
    image?: string;
  }) => void;
  sendImage: (conversationId: string, file: File) => Promise<void>;
  toggleMuteConversation: (conversationId: string) => void;
}

const ChatDockContext = createContext<ChatDockContextType | undefined>(
  undefined,
);

export const ChatDockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { notify } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("heshel:chat-previews:v1") || "null",
      );
      if (
        Array.isArray(saved) &&
        saved.every((chat) => chat.id && Array.isArray(chat.messages))
      )
        return saved;
    } catch {
      /* Start with the sample conversations. */
    }
    return INITIAL_CONVERSATIONS;
  });
  useEffect(() => {
    try {
      localStorage.setItem(
        "heshel:chat-previews:v1",
        JSON.stringify(conversations),
      );
    } catch {
      notify.info(
        "This chat is available until you close the page. Device storage is full.",
      );
    }
  }, [conversations, notify]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const openChat = useCallback((conversationId: string) => {
    setActiveChatId(conversationId);
    setIsMinimized(false);
    // Mark messages as read
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  const markChatRead = useCallback((conversationId: string) => {
    setConversations((previous) =>
      previous.map((chat) =>
        chat.id === conversationId ? { ...chat, unreadCount: 0 } : chat,
      ),
    );
  }, []);
  const startConversation = useCallback(
    (person: { id: string; name: string; image?: string }) => {
      const conversationId = `direct-${person.id}`;
      setConversations((previous) =>
        previous.some((chat) => chat.id === conversationId)
          ? previous
          : [
              {
                id: conversationId,
                name: person.name,
                avatar: person.image || "",
                isOnline: false,
                lastActive: "A fellow home cook",
                lastMessage: "Start a conversation",
                lastMessageTime: "",
                unreadCount: 0,
                type: "DIRECT",
                messages: [],
              },
              ...previous,
            ],
      );
      setActiveChatId(conversationId);
      setIsMinimized(false);
    },
    [],
  );
  const toggleMuteConversation = useCallback((conversationId: string) => {
    setConversations((previous) =>
      previous.map((chat) =>
        chat.id === conversationId ? { ...chat, isMuted: !chat.isMuted } : chat,
      ),
    );
  }, []);
  const sendImage = async (conversationId: string, file: File) => {
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      notify.error("Choose a chat photo smaller than 2 MB.");
      return;
    }
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: "me",
        senderName: "You",
        text: "",
        image,
        isMine: true,
        status: "sent",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setConversations((previous) =>
        previous.map((chat) =>
          chat.id === conversationId
            ? {
                ...chat,
                lastMessage: "You sent a photo",
                lastMessageTime: "Just now",
                messages: [...chat.messages, message],
              }
            : chat,
        ),
      );
    } catch {
      notify.error("This image could not be opened. Please try another photo.");
    }
  };

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
      senderId: "me",
      senderName: "You",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMine: true,
      status: "sent",
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: `You: ${text.trim()} • Just now`,
            lastMessageTime: "Just now",
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      }),
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
        markChatRead,
        startConversation,
        sendImage,
        toggleMuteConversation,
      }}
    >
      {children}
    </ChatDockContext.Provider>
  );
};

export const useChatDock = () => {
  const context = useContext(ChatDockContext);
  if (!context) {
    throw new Error("useChatDock must be used within a ChatDockProvider");
  }
  return context;
};

export default ChatDockContext;
