import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  boardId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
});