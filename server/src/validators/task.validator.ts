import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  boardId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]),
});

export const assignTaskSchema = z.object({
  taskId: z.string().uuid(),
  assigneeId: z.string().uuid().nullable().optional(),
});

export const addCommentSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().min(1),
});

export const attachFileSchema = z.object({
  taskId: z.string().uuid(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });