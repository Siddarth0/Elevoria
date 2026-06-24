import { getIO } from "@/lib/socket";

export const userRoom = (userId: string) => `user:${userId}`;

export const emitWorkspaceEvent = (
  workspaceId: string,
  event: string,
  payload: unknown,
) => {
  const io = getIO();

  io.to(workspaceId).emit(event, payload);
};

export const emitUserEvent = (
  userId: string,
  event: string,
  payload: unknown,
) => {
  const io = getIO();

  io.to(userRoom(userId)).emit(event, payload);
};
