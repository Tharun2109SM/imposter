import { Server as NetServer } from "http";
import { Server as SocketServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import { setSocketServer } from "@/lib/realtime";

type SocketResponse = NextApiResponse & {
  socket: NetSocket & {
    server: NetServer & {
      io?: SocketServer;
    };
  };
};

export default function handler(_req: NextApiRequest, res: SocketResponse) {
  if (!res.socket.server.io) {
    const io = new SocketServer(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false
    });

    io.on("connection", (socket) => {
      socket.on("room:join", (roomCode: string) => {
        socket.join(roomCode);
      });

      socket.on("room:refresh", (roomCode: string, message?: string) => {
        socket.to(roomCode).emit("room:updated", message);
      });

      socket.on("room:leave", (roomCode: string) => {
        socket.leave(roomCode);
      });
    });

    res.socket.server.io = io;
    setSocketServer(io);
  } else {
    setSocketServer(res.socket.server.io);
  }

  res.end();
}
