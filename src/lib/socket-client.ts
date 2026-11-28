import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || "/socket.io";
export const SOCKET_ENABLED = import.meta.env.VITE_SOCKET_ENABLED !== "false";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      path: SOCKET_PATH,
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
  }
  return socketInstance;
}

export function connectSocket(token?: string | null): Socket | null {
  if (!SOCKET_ENABLED) return null;
  const socket = getSocket();
  socket.auth = token ? { token } : {};
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
  }
}

export default {
  SOCKET_ENABLED,
  getSocket,
  connectSocket,
  disconnectSocket,
};

