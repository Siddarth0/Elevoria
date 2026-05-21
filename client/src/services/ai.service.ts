import { api } from "@/lib/api";

export type AiScope = "task" | "board" | "workspace" | "text";

export type SummarizeResult = {
  scope: AiScope;
  title: string;
  summary: string;
  highlights: string[];
  unavailable?: boolean;
};

export type SubtasksResult = {
  scope: AiScope;
  items: { taskTitle: string; subtasks: string[] }[];
  unavailable?: boolean;
};

export type DeadlineResult = {
  scope: AiScope;
  items: { taskTitle: string; suggestedDate: string; reason: string }[];
  unavailable?: boolean;
};

type ScopeInput = {
  workspaceId: string;
  boardId?: string;
  taskId?: string;
};

export const summarizeDocument = async (
  input: ScopeInput & { content?: string },
) => {
  const res = await api.post("/ai/summarize", input);
  return res.data.data.result as SummarizeResult;
};

export const generateSubtasks = async (
  input: ScopeInput & { description?: string },
) => {
  const res = await api.post("/ai/subtasks", input);
  return res.data.data.result as SubtasksResult;
};

export const suggestDeadline = async (
  input: ScopeInput & { description?: string },
) => {
  const res = await api.post("/ai/deadline", input);
  return res.data.data.result as DeadlineResult;
};
