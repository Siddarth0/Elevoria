import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { assertWorkspaceMember } from "@/services/membership.service";

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


