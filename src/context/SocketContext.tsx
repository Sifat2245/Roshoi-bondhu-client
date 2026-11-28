import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import { useSession } from "../lib/auth-client";
import { isDemoMode } from "../lib/demo/demo-store";
import {
  SOCKET_ENABLED,
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../lib/socket-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: string[];
  isUserOnline: (userId: string) => boolean;
  joinGroupRoom: (groupId: string) => void;
  leaveGroupRoom: (groupId: string) => void;
  joinConversationRoom: (conversationId: string) => void;
  leaveConversationRoom: (conversationId: string) => void;
  emitTyping: (payload: {
    conversationId?: string;
    recipientId?: string;
    isTyping: boolean;
  }) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const token = session?.session?.token || null;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!SOCKET_ENABLED || !userId || isDemoMode()) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      setOnlineUserIds([]);
      return;
    }

    const activeSocket = connectSocket(token);
    if (!activeSocket) return;
    setSocket(activeSocket);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onPresenceList = (data: { onlineUserIds?: string[] }) => {
      if (Array.isArray(data?.onlineUserIds)) {
        setOnlineUserIds(data.onlineUserIds);
      }
    };
    const onPresenceOnline = (data: { userId?: string }) => {
      if (!data?.userId) return;
      setOnlineUserIds((prev) =>
        prev.includes(data.userId!) ? prev : [...prev, data.userId!]
      );
    };
    const onPresenceOffline = (data: { userId?: string }) => {
      if (!data?.userId) return;
      setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId));
    };

    activeSocket.on("connect", onConnect);
    activeSocket.on("disconnect", onDisconnect);
    activeSocket.on("presence:list", onPresenceList);
    activeSocket.on("presence:online", onPresenceOnline);
    activeSocket.on("presence:offline", onPresenceOffline);

    if (activeSocket.connected) {
      setIsConnected(true);
    }

    return () => {
      activeSocket.off("connect", onConnect);
      activeSocket.off("disconnect", onDisconnect);
      activeSocket.off("presence:list", onPresenceList);
      activeSocket.off("presence:online", onPresenceOnline);
      activeSocket.off("presence:offline", onPresenceOffline);
    };
  }, [userId, token]);

  const isUserOnline = useCallback(
    (id: string) => onlineUserIds.includes(id),
    [onlineUserIds]
  );

  const joinGroupRoom = useCallback((groupId: string) => {
    if (!SOCKET_ENABLED || !groupId) return;
    getSocket().emit("group:join", groupId);
  }, []);

  const leaveGroupRoom = useCallback((groupId: string) => {
    if (!SOCKET_ENABLED || !groupId) return;
    getSocket().emit("group:leave", groupId);
  }, []);

  const joinConversationRoom = useCallback((conversationId: string) => {
    if (!SOCKET_ENABLED || !conversationId) return;
    getSocket().emit("conversation:join", conversationId);
  }, []);

  const leaveConversationRoom = useCallback((conversationId: string) => {
    if (!SOCKET_ENABLED || !conversationId) return;
    getSocket().emit("conversation:leave", conversationId);
  }, []);

  const emitTyping = useCallback(
    (payload: {
      conversationId?: string;
      recipientId?: string;
      isTyping: boolean;
    }) => {
      if (!SOCKET_ENABLED) return;
      getSocket().emit("chat:typing", payload);
    },
    []
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUserIds,
        isUserOnline,
        joinGroupRoom,
        leaveGroupRoom,
        joinConversationRoom,
        leaveConversationRoom,
        emitTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
};

export default SocketContext;

