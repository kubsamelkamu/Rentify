import { io, Socket } from 'socket.io-client';
import { Booking } from '@/store/slices/bookingSlice';

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

  newBooking: (booking: Booking) => void;
  bookingStatusUpdate: (booking: {
    id: string;
    propertyId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
  }) => void;

  paymentStatusUpdated: (payload: {
    bookingId: string;
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
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

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: false,
    transports: ['websocket'],
  }
);

export function connectSocket(token: string) {
  socket.auth = { token };
  socket.connect();
}

export default socket;
