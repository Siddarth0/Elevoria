import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(2),
  workspaceId: z.string().uuid(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(2),
});
