import { api } from "@/lib/api";

type WorkspaceAiInput = {
  workspaceId: string;
};

export const summarizeDocument = async ({
  content,
  workspaceId,
}: WorkspaceAiInput & { content: string }) => {
  const res = await api.post("/ai/summarize", { content, workspaceId });
  return res.data.data.result as string;
};

export const generateSubtasks = async ({
  description,
  workspaceId,
}: WorkspaceAiInput & { description: string }) => {
  const res = await api.post("/ai/subtasks", { description, workspaceId });
  return res.data.data.result as string;
};

export const suggestDeadline = async ({
  description,
  workspaceId,
}: WorkspaceAiInput & { description: string }) => {
  const res = await api.post("/ai/deadline", { description, workspaceId });
  return res.data.data.result as string;
};
