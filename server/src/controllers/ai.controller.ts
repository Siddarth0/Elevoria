import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import {
  generateSummaryService,
  generateSubtasksService,
  generateDeadlineService,
} from "@/services/ai.service";

export const summarizeDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { content, workspaceId } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const result = await generateSummaryService(content, userId, workspaceId);

  res.json(new ApiResponse("AI summary generated", { result }));
});

export const generateSubtasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { description, workspaceId } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const result = await generateSubtasksService(description, userId, workspaceId);

  res.json(new ApiResponse("AI subtasks generated", { result }));
});

export const suggestDeadline = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { description, workspaceId } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const result = await generateDeadlineService(description, userId, workspaceId);

  res.json(new ApiResponse("AI deadline suggestion generated", { result }));
});