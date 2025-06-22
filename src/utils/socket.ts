import { io, Socket } from 'socket.io-client';
import { User, Property, Booking, Review } from '@/store/slices/adminSlice';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface ServerToClientEvents {
  'admin:newUser': (user: User) => void;
  'admin:updateUser': (user: User) => void;
  'admin:deleteUser': (userId: string) => void;

  'admin:newProperty': (property: Property) => void;
  'admin:updateProperty': (property: Property) => void;
  'admin:deleteProperty': (propertyId: string) => void;

  'admin:newReview': (review: Review) => void;
  'admin:updateReview': (review: Review) => void;
  'admin:deleteReview': (payload: { propertyId: string; tenantId: string }) => void;

  'listing:pending': (payload: Property) => void;
  'listing:approved': (payload: Property) => void;
  'listing:rejected':(payload:Property) =>void;

  newBooking: (booking: Booking) => void;
  bookingStatusUpdate: (booking: Booking) => void;
  paymentStatusUpdated: (
    payload: { bookingId: string; paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' }
  ) => void;

  newMessage: (msg: unknown) => void;
  messageDeleted: (payload: { messageId: string }) => void;
  messageEdited: (msg: unknown) => void;
  typingStatus: (payload: { userId: string; isTyping: boolean }) => void;
  presence: (payload: { userId: string; status: 'online' | 'offline' }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendMessage: (
    payload: { propertyId: string; content: string },
    ack: (msg: unknown) => void
  ) => void;
  deleteMessage: (
    payload: { propertyId: string; messageId: string },
    ack: (res: unknown) => void
  ) => void;
  editMessage: (
    payload: { propertyId: string; messageId: string; newContent: string },
    ack: (res: unknown) => void
  ) => void;
  typing: (payload: { propertyId: string; userId: string; isTyping: boolean }) => void;
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
