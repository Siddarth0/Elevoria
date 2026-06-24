import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
import { WorkspaceMember, WorkspaceRole } from "@prisma/client";

type AccessTarget = {
  workspaceId?: string;
  boardId?: string;
  taskId?: string;
};

/**
 * Resolve the owning workspace id from any of: workspaceId, boardId, taskId.
 * Returns null when the referenced resource does not exist.
 */
export async function resolveWorkspaceId(
  target: AccessTarget,
): Promise<string | null> {
  if (target.workspaceId) return target.workspaceId;

  if (target.boardId) {
    const board = await prisma.board.findUnique({
      where: { id: target.boardId },
      select: { workspaceId: true },
    });
    return board?.workspaceId ?? null;
  }

  if (target.taskId) {
    const task = await prisma.task.findUnique({
      where: { id: target.taskId },
      select: { board: { select: { workspaceId: true } } },
    });
    return task?.board.workspaceId ?? null;
  }

  return null;
}

/**
 * Assert that `userId` is a member of the workspace owning `target`.
 * Throws 404 if the resource is missing, 403 if the user is not a member,
 * and (when `roles` is given) 403 if the member lacks one of the roles.
 *
 * Returns the membership record so callers can branch on role.
 */
export async function assertWorkspaceMember(
  userId: string,
  target: AccessTarget,
  roles?: WorkspaceRole[],
): Promise<WorkspaceMember> {
  const workspaceId = await resolveWorkspaceId(target);

  if (!workspaceId) throw new ApiError(404, "Resource not found");

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) throw new ApiError(403, "Forbidden");

  if (roles && !roles.includes(membership.role)) {
    throw new ApiError(403, "Forbidden");
  }

  return membership;
}
