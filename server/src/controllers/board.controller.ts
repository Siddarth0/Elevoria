import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";

export const createBoard = asyncHandler(async (req: Request, res: Response) => {
  const { name, workspaceId } = req.body;

  const board = await prisma.board.create({
    data: {
      name,
      workspaceId,
    },
  });

  res.status(201).json(new ApiResponse("Board created succesfully", board));
});

export const getWorkspaceBoards = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    const boards = await prisma.board.findMany({
      where: { workspaceId: String(workspaceId) },
      include: {
        tasks: true,
      },
    });

    res.json(new ApiResponse("Workspace boards fetched", boards));
  },
);


