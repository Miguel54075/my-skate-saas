import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3333', {
  autoConnect: false,
});