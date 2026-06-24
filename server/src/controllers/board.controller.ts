import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { assertWorkspaceMember } from "@/services/membership.service";
import { logActivity } from "@/services/activity.service";
import { emitWorkspaceEvent } from "@/services/realtime.service";

export const createBoard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name, workspaceId } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  await assertWorkspaceMember(userId, { workspaceId }, ["OWNER", "MANAGER"]);

  const board = await prisma.board.create({
    data: {
      name,
      workspaceId,
    },
  });

  res.status(201).json(new ApiResponse("Board created successfully", board));
});

export const getWorkspaceBoards = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { workspaceId: String(workspaceId) });

    const boards = await prisma.board.findMany({
      where: { workspaceId: String(workspaceId) },
      include: {
        tasks: true,
      },
    });

    res.json(new ApiResponse("Workspace boards fetched", boards));
  },
);

export const updateBoard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { name } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const { workspaceId } = await assertWorkspaceMember(
    userId,
    { boardId: String(id) },
    ["OWNER", "MANAGER"],
  );

  const board = await prisma.board.update({
    where: { id: String(id) },
    data: { name },
  });

  emitWorkspaceEvent(workspaceId, "board-updated", { boardId: board.id });
  await logActivity({
    workspaceId,
    userId,
    action: "board.renamed",
    entityType: "board",
    entityId: board.id,
    meta: { name: board.name },
  });

  res.json(new ApiResponse("Board updated", board));
});

export const deleteBoard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const { workspaceId } = await assertWorkspaceMember(
    userId,
    { boardId: String(id) },
    ["OWNER", "MANAGER"],
  );

  await prisma.board.delete({ where: { id: String(id) } });

  emitWorkspaceEvent(workspaceId, "board-deleted", { boardId: String(id) });
  await logActivity({
    workspaceId,
    userId,
    action: "board.deleted",
    entityType: "board",
    entityId: String(id),
  });

  res.json(new ApiResponse("Board deleted"));
});


