import { prisma } from "@/lib/prisma";

type LogArgs = {
  workspaceId: string;
  userId: string;
  action: string; // e.g. "task.deleted", "board.renamed"
  entityType: string; // e.g. "task", "board", "workspace"
  entityId?: string;
  meta?: Record<string, unknown>;
};

/**
 * Record an audit entry. Best-effort — never throws into the request flow.
 */
export async function logActivity({
  workspaceId,
  userId,
  action,
  entityType,
  entityId,
  meta,
}: LogArgs) {
  try {
    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        action,
        entityType,
        entityId: entityId ?? null,
        meta: meta ? JSON.stringify(meta).slice(0, 2000) : null,
      },
    });
  } catch {
    // audit logging must not break the underlying action
  }
}
