import { Server as SocketServer } from 'socket.io';

let io: SocketServer;

export const setSocketServer = (server: SocketServer): void => {
  io = server;
};

export const getSocketServer = (): SocketServer => {
  if (!io) throw new Error('Socket server not initialized');
  return io;
};
