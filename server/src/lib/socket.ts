import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";

let io: Server;

type SocketUser = { userId: string };

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    },
  });

  // Authenticate every connection from the handshake token.
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SocketUser;
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    console.log("Socket connected:", socket.id, "user:", userId);

    // Personal room for user-targeted events (e.g. notifications).
    socket.join(`user:${userId}`);

    socket.on("join-workspace", async (workspaceId: string) => {
      // Only let a socket join rooms for workspaces it belongs to.
      const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
      });

      if (!membership) {
        socket.emit("join-denied", { workspaceId });
        return;
      }

      socket.join(workspaceId);
      console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
