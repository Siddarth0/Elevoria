import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";

export const createWorkspace = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { name, slug } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const existing = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (existing) throw new ApiError(400, "Workspace slug already taken");

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: true,
      },
    });

    res
      .status(201)
      .json(new ApiResponse("Workspace created succesfully", workspace));
  },
);

export const getMyWorkspaces = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const workspaces = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
    });

    res.json(new ApiResponse("Fetched user workspaces", workspaces));
  },
);

export const addMemberToWorkspace = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, email, role } = req.body;

    const memberUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!memberUser) throw new ApiError(404, "User not found");

    const alreadyMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: memberUser.id,
        workspaceId,
      },
    });

    if (alreadyMember) throw new ApiError(400, "User already is a member");

    const member = await prisma.workspaceMember.create({
      data: {
        userId: memberUser.id,
        workspaceId,
        role,
      },
    });

    res.json(new ApiResponse("Member added succesfully", member));
  },
);
