import { getIO } from "@/lib/socket";

export const emitWorkspaceEvent = (
  workspaceId: string,
  event: string,
  payload: unknown,
) => {
  const io = getIO();

  io.to(workspaceId).emit(event, payload);
};
