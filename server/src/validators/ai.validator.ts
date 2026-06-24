import { z } from "zod";

/**
 * Shared shape for AI tool calls. workspaceId scopes the request; an optional
 * boardId/taskId narrows the subject. `content`/`description` carry free text
 * used as refinement (the controller picks the right key per route).
 */
export const aiSummarizeSchema = z.object({
  workspaceId: z.string().uuid(),
  boardId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  content: z.string().optional(),
});

export const aiGenerateSchema = z.object({
  workspaceId: z.string().uuid(),
  boardId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  description: z.string().optional(),
});
