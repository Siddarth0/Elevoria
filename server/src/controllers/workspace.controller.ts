import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { randomToken, daysFromNow } from "@/utils/randomToken";
import { sendInviteEmail } from "@/services/email.service";
import { assertWorkspaceMember } from "@/services/membership.service";
import { logActivity } from "@/services/activity.service";

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

    res.json(new ApiResponse("Member added successfully", member));
  },
);

/**
 * Invite someone by email — works whether or not they already have an account.
 * Creates a tokened invite and emails an accept link. (OWNER/MANAGER only,
 * enforced by route middleware.)
 */
export const inviteMember = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, email, role } = req.body as {
      workspaceId: string;
      email: string;
      role: "OWNER" | "MANAGER" | "MEMBER";
    };

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) throw new ApiError(404, "Workspace not found");

    // If they already have an account and are a member, short-circuit.
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const already = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: { userId: existingUser.id, workspaceId },
        },
      });
      if (already) throw new ApiError(400, "User is already a member");
    }

    const token = randomToken();

    const invite = await prisma.workspaceInvite.create({
      data: {
        email,
        workspaceId,
        role,
        token,
        invitedById: req.user!.userId,
        expiresAt: daysFromNow(7),
      },
    });

    await sendInviteEmail(email, workspace.name, token);

    res
      .status(201)
      .json(
        new ApiResponse("Invite sent", {
          id: invite.id,
          email: invite.email,
          status: invite.status,
        }),
      );
  },
);

/** Public lookup so the invite landing page can show context before accepting. */
export const getInvite = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token: String(token) },
    include: { workspace: { select: { name: true } } },
  });

  if (!invite) throw new ApiError(404, "Invite not found");

  res.json(
    new ApiResponse("Invite fetched", {
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
      workspaceName: invite.workspace.name,
      expired: invite.expiresAt < new Date(),
    }),
  );
});

/** Accept an invite as the logged-in user (their email must match the invite). */
export const acceptInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { token } = req.body;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.status !== "PENDING") {
      throw new ApiError(400, "Invalid or already-used invite");
    }
    if (invite.expiresAt < new Date()) {
      await prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      throw new ApiError(400, "Invite has expired");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new ApiError(403, "This invite was issued to a different email");
    }

    // Create membership if not present, then mark the invite accepted.
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: { userId, workspaceId: invite.workspaceId },
      },
      update: {},
      create: { userId, workspaceId: invite.workspaceId, role: invite.role },
    });

    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    res.json(
      new ApiResponse("Invite accepted", { workspaceId: invite.workspaceId }),
    );
  },
);

export const updateWorkspace = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, logo } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { workspaceId: String(id) }, [
      "OWNER",
      "MANAGER",
    ]);

    const workspace = await prisma.workspace.update({
      where: { id: String(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(logo !== undefined && { logo }),
      },
    });

    await logActivity({
      workspaceId: workspace.id,
      userId,
      action: "workspace.updated",
      entityType: "workspace",
      entityId: workspace.id,
      meta: { name: workspace.name },
    });

    res.json(new ApiResponse("Workspace updated", workspace));
  },
);

export const deleteWorkspace = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) throw new ApiError(401, "Unauthorized");

    // Only the owner can delete an entire workspace.
    await assertWorkspaceMember(userId, { workspaceId: String(id) }, ["OWNER"]);

    await prisma.workspace.delete({ where: { id: String(id) } });

    res.json(new ApiResponse("Workspace deleted"));
  },
);

export const removeMember = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { workspaceId, memberId } = req.params;

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { workspaceId: String(workspaceId) }, [
      "OWNER",
      "MANAGER",
    ]);

    const workspace = await prisma.workspace.findUnique({
      where: { id: String(workspaceId) },
      select: { ownerId: true },
    });
    if (!workspace) throw new ApiError(404, "Workspace not found");

    // The owner cannot be removed from their own workspace.
    if (workspace.ownerId === String(memberId)) {
      throw new ApiError(400, "The workspace owner cannot be removed");
    }

    const result = await prisma.workspaceMember.deleteMany({
      where: { workspaceId: String(workspaceId), userId: String(memberId) },
    });
    if (result.count === 0) throw new ApiError(404, "Member not found");

    await logActivity({
      workspaceId: String(workspaceId),
      userId,
      action: "member.removed",
      entityType: "member",
      entityId: String(memberId),
    });

    res.json(new ApiResponse("Member removed"));
  },
);

export const getWorkspaceActivity = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { workspaceId: String(workspaceId) });

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { workspaceId: String(workspaceId) },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, fullName: true } } },
      }),
      prisma.activityLog.count({
        where: { workspaceId: String(workspaceId) },
      }),
    ]);

    res.json(
      new ApiResponse("Activity fetched", {
        items,
        page,
        limit,
        total,
        hasMore: page * limit < total,
      }),
    );
  },
);
