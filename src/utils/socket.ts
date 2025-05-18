import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

export type ServerToClientEvents = {
  newMessage: (msg: any) => void;
};

export type ClientToServerEvents = {
  sendMessage: (
    payload: { propertyId: string; content: string },
    callback: (msg: any) => void
  ) => void;
  joinRoom: (propertyId: string) => void;
  leaveRoom: (propertyId: string) => void;
};

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export function connectSocket(token: string) {
  socket.auth = { token };
  socket.connect();
}

export default socket;

