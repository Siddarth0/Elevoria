import { Request, Response, NextFunction } from "express";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
import { WorkspaceRole } from "@prisma/client";

export const authorizeWorkspaceRoles = (allowedRoles: WorkspaceRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const workspaceId =
      req.body.workspaceId || req.params.workspaceId || req.query.workspaceId;

    if (!userId || !workspaceId) {
      next(new ApiError(401, "Unauthorized"));
      return;
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: String(workspaceId),
      },
    });

    if (!membership || !allowedRoles.includes(membership.role)) {
      next(new ApiError(403, "Forbidden"));
      return;
    }

    next();
  };
};
