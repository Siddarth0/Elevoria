import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/utils/uploadToCloudinary";
import { emitWorkspaceEvent } from "@/services/realtime.service";
import { assertWorkspaceMember } from "@/services/membership.service";
import { notifyUser } from "@/services/notification.service";
import { logActivity } from "@/services/activity.service";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { title, description, priority, dueDate, boardId, assigneeId } =
    req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  await assertWorkspaceMember(userId, { boardId });

  // An assignee, if given, must also belong to the workspace.
  if (assigneeId) {
    await assertWorkspaceMember(assigneeId, { boardId });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      boardId,
      assigneeId,
      creatorId: userId!,
    },
    include: { board: { select: { workspaceId: true } } },
  });

  emitWorkspaceEvent(task.board.workspaceId, "task-created", { task });

  if (assigneeId && assigneeId !== userId) {
    await notifyUser(assigneeId, `You were assigned the task "${task.title}".`);
  }

  res.status(201).json(new ApiResponse("Task created successfully", task));
});

export const getTasksByBoard = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { boardId } = req.params;
    const { status, assigneeId, priority, q } = req.query as {
      status?: string;
      assigneeId?: string;
      priority?: string;
      q?: string;
    };

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { boardId: String(boardId) });

    const tasks = await prisma.task.findMany({
      where: {
        boardId: String(boardId),
        ...(status && { status: status as never }),
        ...(priority && { priority: priority as never }),
        ...(assigneeId && { assigneeId }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        assignee: true,
        creator: true,
        comments: {
          include: {
            user: true,
          },
        },
        attachments: true,
      },
    });

    res.json(new ApiResponse("Tasks fetched", tasks));
  },
);

export const updateTaskStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { taskId, status } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { taskId });

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: { board: { include: { workspace: true } } },
    });

    emitWorkspaceEvent(updated.board.workspace.id, "task-status-updated", {
      taskId: updated.id,
      status: updated.status,
    });

    res.json(new ApiResponse("Task status updated", updated));
  },
);

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { taskId, assigneeId } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  // Caller must be a member; the assignee must belong to the same workspace.
  await assertWorkspaceMember(userId, { taskId });
  if (assigneeId) {
    await assertWorkspaceMember(assigneeId, { taskId });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId },
    include: { board: { select: { workspaceId: true } } },
  });

  emitWorkspaceEvent(updated.board.workspaceId, "task-assigned", {
    taskId: updated.id,
    assigneeId: updated.assigneeId,
  });

  if (assigneeId && assigneeId !== userId) {
    await notifyUser(
      assigneeId,
      `You were assigned the task "${updated.title}".`,
    );
  }

  res.json(new ApiResponse("Task assigned successfully", updated));
});

export const addCommentToTask = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { taskId, content } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { taskId });

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: {
        user: true,
        task: {
          include: {
            board: {
              include: { workspace: true },
            },
          },
        },
      },
    });

    emitWorkspaceEvent(comment.task.board.workspace.id, "task-comment-added", {
      taskId: comment.taskId,
      comment,
    });

    // Notify the task's creator and assignee, except whoever commented.
    const recipients = new Set(
      [comment.task.creatorId, comment.task.assigneeId].filter(
        (id): id is string => !!id && id !== userId,
      ),
    );
    await Promise.all(
      [...recipients].map((id) =>
        notifyUser(
          id,
          `${comment.user.fullName} commented on "${comment.task.title}".`,
        ),
      ),
    );

    res.status(201).json(new ApiResponse("Comment added", comment));
  },
);

export const attachFileToTask = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { taskId } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");

    // Accept both single ("file") and multiple ("files") field names.
    const files = [
      ...((req.files as Express.Multer.File[] | undefined) ?? []),
      ...(req.file ? [req.file] : []),
    ];
    if (files.length === 0) throw new ApiError(400, "No file uploaded");

    await assertWorkspaceMember(userId, { taskId });

    const attachments = await Promise.all(
      files.map(async (file) => {
        const uploaded = await uploadToCloudinary(file.buffer);
        return prisma.attachment.create({
          data: {
            taskId,
            fileName: file.originalname || uploaded.original_filename,
            fileUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
            fileSize: uploaded.bytes,
            mimeType: file.mimetype,
            uploadedById: userId,
          },
        });
      }),
    );

    res
      .status(201)
      .json(
        new ApiResponse("Attachment(s) uploaded successfully", attachments),
      );
  },
);

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { title, description, priority, dueDate } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  await assertWorkspaceMember(userId, { taskId: String(id) });

  const updated = await prisma.task.update({
    where: { id: String(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
    },
    include: { board: { select: { workspaceId: true } } },
  });

  emitWorkspaceEvent(updated.board.workspaceId, "task-updated", {
    taskId: updated.id,
  });
  await logActivity({
    workspaceId: updated.board.workspaceId,
    userId,
    action: "task.updated",
    entityType: "task",
    entityId: updated.id,
    meta: { title: updated.title },
  });

  res.json(new ApiResponse("Task updated", updated));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const membership = await assertWorkspaceMember(userId, {
    taskId: String(id),
  });

  const task = await prisma.task.findUnique({
    where: { id: String(id) },
    include: {
      board: { select: { workspaceId: true } },
      attachments: { select: { publicId: true, mimeType: true } },
    },
  });
  if (!task) throw new ApiError(404, "Task not found");

  // Only the creator or a manager/owner may delete a task.
  const isPrivileged =
    membership.role === "OWNER" || membership.role === "MANAGER";
  if (!isPrivileged && task.creatorId !== userId) {
    throw new ApiError(403, "Only the creator or a manager can delete this task");
  }

  // Clean up any attachment assets before removing the task.
  await Promise.all(
    task.attachments
      .filter((a) => a.publicId)
      .map((a) =>
        deleteFromCloudinary(
          a.publicId as string,
          a.mimeType?.startsWith("image/") ? "image" : "raw",
        ),
      ),
  );

  await prisma.task.delete({ where: { id: String(id) } });

  emitWorkspaceEvent(task.board.workspaceId, "task-deleted", { taskId: task.id });
  await logActivity({
    workspaceId: task.board.workspaceId,
    userId,
    action: "task.deleted",
    entityType: "task",
    entityId: task.id,
    meta: { title: task.title },
  });

  res.json(new ApiResponse("Task deleted"));
});

export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const comment = await prisma.comment.findUnique({
      where: { id: String(id) },
      include: { task: { include: { board: { select: { workspaceId: true } } } } },
    });
    if (!comment) throw new ApiError(404, "Comment not found");

    const membership = await assertWorkspaceMember(userId, {
      workspaceId: comment.task.board.workspaceId,
    });

    const isPrivileged =
      membership.role === "OWNER" || membership.role === "MANAGER";
    if (!isPrivileged && comment.userId !== userId) {
      throw new ApiError(403, "You can only delete your own comments");
    }

    await prisma.comment.delete({ where: { id: String(id) } });

    emitWorkspaceEvent(comment.task.board.workspaceId, "task-comment-deleted", {
      taskId: comment.taskId,
      commentId: comment.id,
    });

    res.json(new ApiResponse("Comment deleted"));
  },
);

export const deleteAttachment = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const attachment = await prisma.attachment.findUnique({
      where: { id: String(id) },
      include: { task: { include: { board: { select: { workspaceId: true } } } } },
    });
    if (!attachment) throw new ApiError(404, "Attachment not found");

    const membership = await assertWorkspaceMember(userId, {
      workspaceId: attachment.task.board.workspaceId,
    });

    const isPrivileged =
      membership.role === "OWNER" || membership.role === "MANAGER";
    if (!isPrivileged && attachment.uploadedById !== userId) {
      throw new ApiError(403, "You can only delete attachments you uploaded");
    }

    if (attachment.publicId) {
      await deleteFromCloudinary(
        attachment.publicId,
        attachment.mimeType?.startsWith("image/") ? "image" : "raw",
      );
    }

    await prisma.attachment.delete({ where: { id: String(id) } });

    res.json(new ApiResponse("Attachment deleted"));
  },
);
