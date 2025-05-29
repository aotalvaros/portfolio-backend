import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ModuleStatus } from '../models/moduleStatus.model';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.PORT ?? "http://localhost:4000",
    },
  });

   io.on('connection', async (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    try {
      const modules = await ModuleStatus.find();
      const formattedStatus: Record<string, boolean> = {};

      modules.forEach((mod) => {
        formattedStatus[mod.moduleName] = mod.isActive;
      });

      socket.emit('init-module-status', formattedStatus);
    } catch (error) {
      console.error('❌ Error al emitir estados de módulos:', error);
      socket.emit('init-module-status', {});
    }
  });
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
};