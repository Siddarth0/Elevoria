import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { emitWorkspaceEvent } from "@/services/realtime.service";
import { assertWorkspaceMember } from "@/services/membership.service";
import { notifyUser } from "@/services/notification.service";

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

    if (!userId) throw new ApiError(401, "Unauthorized");

    await assertWorkspaceMember(userId, { boardId: String(boardId) });

    const tasks = await prisma.task.findMany({
      where: { boardId: String(boardId) },
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
    if (!req.file) throw new ApiError(400, "No file uploaded");

    await assertWorkspaceMember(userId, { taskId });

    const uploaded = await uploadToCloudinary(req.file.buffer);

    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        fileName: uploaded.original_filename,
        fileUrl: uploaded.secure_url,
      },
    });

    res
      .status(201)
      .json(new ApiResponse("Attachment uploaded successfully", attachment));
  },
);
