import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface ChatMessage {
  id: string;
  content: string;
  sender: { id: string; name: string };
  createdAt: string;
  sentAt?: string;
  deleted?: boolean;
  editedAt?: string;
}

export interface ServerToClientEvents {
  newMessage: (msg: ChatMessage) => void;
  messageDeleted: (payload: { messageId: string }) => void;
  messageEdited: (msg: ChatMessage) => void;
  typingStatus: (payload: { userId: string; isTyping: boolean }) => void;
  presence: (payload: { userId: string; status: 'online' | 'offline' }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (propertyId: string) => void;
  leaveRoom: (propertyId: string) => void;
  sendMessage: (
    payload: { propertyId: string; content: string },
    ack: (msg: ChatMessage) => void
  ) => void;
  deleteMessage: (
    payload: { propertyId: string; messageId: string },
    ack: (res: { success: boolean; error?: string }) => void
  ) => void;
  editMessage: (
    payload: { propertyId: string; messageId: string; newContent: string },
    ack: (res: { success: boolean; error?: string }) => void
  ) => void;
  typing: (payload: {
    propertyId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export function connectSocket(token: string) {
  socket.auth = { token };
  socket.connect();
}

export default socket;
