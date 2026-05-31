import type { Server as SocketServer } from "socket.io";

const globalForRealtime = globalThis as unknown as {
  imposterIo?: SocketServer;
};

export function setSocketServer(io: SocketServer) {
  globalForRealtime.imposterIo = io;
}

export function emitRoomUpdate(roomCode: string, message?: string) {
  globalForRealtime.imposterIo?.to(roomCode).emit("room:updated", message);
}

export function emitRoomDeleted(roomCode: string) {
  const io = globalForRealtime.imposterIo;
  io?.to(roomCode).emit("room:deleted", "room_closed");
  io?.in(roomCode).socketsLeave(roomCode);
}
