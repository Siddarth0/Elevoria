import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import {
  AiContext,
  generateSummaryService,
  generateSubtasksService,
  generateDeadlineService,
} from "@/services/ai.service";
import { assertWorkspaceMember } from "@/services/membership.service";

function buildContext(req: Request, textKey: "content" | "description"): AiContext {
  const { workspaceId, boardId, taskId } = req.body as {
    workspaceId?: string;
    boardId?: string;
    taskId?: string;
  };
  const refinement = (req.body as Record<string, unknown>)[textKey];

  if (!workspaceId || typeof workspaceId !== "string") {
    throw new ApiError(400, "workspaceId is required");
  }

  return {
    workspaceId,
    boardId: typeof boardId === "string" && boardId.length > 0 ? boardId : undefined,
    taskId: typeof taskId === "string" && taskId.length > 0 ? taskId : undefined,
    refinement: typeof refinement === "string" ? refinement : undefined,
  };
}

export const summarizeDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const ctx = buildContext(req, "content");
  await assertWorkspaceMember(userId, { workspaceId: ctx.workspaceId });
  const result = await generateSummaryService(ctx, userId);

  res.json(new ApiResponse("AI summary generated", { result }));
});

export const generateSubtasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const ctx = buildContext(req, "description");
  await assertWorkspaceMember(userId, { workspaceId: ctx.workspaceId });
  const result = await generateSubtasksService(ctx, userId);

  res.json(new ApiResponse("AI subtasks generated", { result }));
});

export const suggestDeadline = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const ctx = buildContext(req, "description");
  await assertWorkspaceMember(userId, { workspaceId: ctx.workspaceId });
  const result = await generateDeadlineService(ctx, userId);

  res.json(new ApiResponse("AI deadline suggestion generated", { result }));
});
