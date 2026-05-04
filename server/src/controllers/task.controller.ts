import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { title, description, priority, dueDate, boardId, assigneeId } =
    req.body;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { workspace: { include: { members: true } } },
  });

  const isMember = board?.workspace.members.some((m) => m.userId === userId);

  if (!isMember) throw new ApiError(403, "Forbidden");

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
  });

  res.status(201).json(new ApiResponse("Task created successfully", task));
});

export const getTasksByBoard = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId } = req.params;

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
    const { taskId, status } = req.body;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    res.json(new ApiResponse("Task status updated", updated));
  },
);

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId, assigneeId } = req.body;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId },
  });

  res.json(new ApiResponse("Task assigned succesfully", updated));
});

export const addCommentToTask = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { taskId, content } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
    });

    res.status(201).json(new ApiResponse("Comment added", comment));
  },
);

export const attachFileToTask = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { taskId } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");
    if (!req.file) throw new ApiError(400, "No file uploaded");

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: {
          include: {
            workspace: {
              include: { members: true },
            },
          },
        },
      },
    });

    const isMember = task?.board.workspace.members.some(
      (m) => m.userId === userId,
    );

    if (!task || !isMember) throw new ApiError(403, "Forbidden");

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
